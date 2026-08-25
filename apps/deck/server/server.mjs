#!/usr/bin/env node
// Taskard Deck — salt-okur izleyici sunucusu. Sıfır bağımlılık.
// Kullanım: node server.mjs <projeDizini> [--port 7420] | node server.mjs --demo

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const demo = argv.includes('--demo')
const portIdx = argv.indexOf('--port')
const PORT = portIdx > -1 ? Number(argv[portIdx + 1]) || 7420 : Number(process.env.PORT) || 7420

const projectRoot = demo ? buildDemo() : path.resolve(argv.find(a => !a.startsWith('-')) || '.')
const taskardDir = path.join(projectRoot, '.taskard')

if (!fs.existsSync(taskardDir)) {
  console.error(`[deck] .taskard bulunamadı: ${taskardDir}`)
  console.error('[deck] Kullanım: node server.mjs <projeDizini> | --demo')
  process.exit(1)
}

// ---------- yardımcılar ----------

const readMtime = p => { try { return fs.statSync(p).mtimeMs } catch { return null } }
const listDirs = p => { try { return fs.readdirSync(p, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name) } catch { return [] } }
const listFiles = p => { try { return fs.readdirSync(p, { withFileTypes: true }).filter(d => d.isFile()).map(d => d.name) } catch { return [] } }

function buildTree(dir) {
  const out = []
  function walk(current, rel) {
    let entries
    try { entries = fs.readdirSync(current, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      const childRel = rel ? `${rel}/${e.name}` : e.name
      const full = path.join(current, e.name)
      if (e.isDirectory()) {
        walk(full, childRel)
      } else if (e.isFile()) {
        try {
          const st = fs.statSync(full)
          out.push({ path: childRel, size: st.size, mtime: st.mtimeMs })
        } catch {}
      }
    }
  }
  walk(dir, '')
  return out
}
const relTime = ms => {
  const s = Math.max(0, (Date.now() - ms) / 1000)
  if (s < 90) return 'az önce'
  if (s < 3600) return `${Math.round(s / 60)} dk önce`
  if (s < 86400 * 2) return `${Math.round(s / 3600)} sa önce`
  return new Date(ms).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  const out = {}
  if (!m) return out
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(\w[\w-]*):\s*(.*)$/.exec(line.trim())
    if (!kv) continue
    let [, k, v] = kv
    if (v.startsWith('[')) {
      const inner = v.replace(/^\[/, '').replace(/\]$/, '').trim()
      out[k] = inner ? inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')) : []
    } else out[k] = v.trim().replace(/^['"]|['"]$/g, '')
  }
  return out
}

function parseRolesFromToml(text) {
  const roles = {}
  let inRoles = false
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split('#')[0].trim()
    if (line.startsWith('[')) { inRoles = line === '[roles]'; continue }
    if (!inRoles) continue
    const kv = /^(\w[\w-]*)\s*=\s*"([^"]*)"/.exec(line)
    if (kv) roles[kv[1]] = kv[2]
  }
  return roles
}

function loadConfig() {
  const merged = {}
  for (const p of [path.join(os.homedir(), '.taskard', 'config.toml'), path.join(taskardDir, 'config.toml')]) {
    try { Object.assign(merged, parseRolesFromToml(fs.readFileSync(p, 'utf8'))) } catch {}
  }
  return merged
}

const VERDICTS = ['DONE_WITH_CONCERNS', 'DONE', 'BLOCKED', 'NEEDS_CONTEXT']
function laneStatus(files) {
  const reportPath = path.join(files.dir, 'report.md')
  if (!fs.existsSync(reportPath)) return { status: 'running', verdict: null }
  const first = (fs.readFileSync(reportPath, 'utf8').split(/\r?\n/).find(l => l.trim()) || '').toUpperCase()
  const hit = VERDICTS.find(v => first.includes(v))
  if (hit === 'DONE') return { status: 'done', verdict: 'DONE' }
  if (hit === 'DONE_WITH_CONCERNS') return { status: 'done_concerns', verdict: 'DONE_WITH_CONCERNS' }
  if (hit === 'BLOCKED') return { status: 'blocked', verdict: 'BLOCKED' }
  if (hit === 'NEEDS_CONTEXT') return { status: 'needs_context', verdict: 'NEEDS_CONTEXT' }
  return { status: 'running', verdict: null }
}

function buildSnapshot() {
  const config = loadConfig()
  const lanesDir = path.join(taskardDir, 'lanes')
  const tasksDir = path.join(taskardDir, 'tasks')
  const handoffDir = path.join(taskardDir, 'handoff')

  const lanes = listDirs(lanesDir).map(id => {
    const dir = path.join(lanesDir, id)
    const files = listFiles(dir).map(name => ({ name, mtime: readMtime(path.join(dir, name)) })).filter(f => f.mtime)
    const brief = files.find(f => f.name === 'brief.md')
    const report = files.find(f => f.name === 'report.md')
    const st = laneStatus({ dir })
    return { id, ...st, hasBrief: !!brief, briefMtime: brief?.mtime ?? null, reportMtime: report?.mtime ?? null, files }
  }).sort((a, b) => (b.briefMtime || 0) - (a.briefMtime || 0))

  const tasks = listFiles(tasksDir).filter(f => f.endsWith('.md')).map(f => {
    const full = path.join(tasksDir, f)
    const text = fs.readFileSync(full, 'utf8')
    const fm = parseFrontmatter(text)
    const heading = text.split(/\r?\n/).find(l => l.startsWith('# ')) || ''
    return {
      id: f.replace(/\.md$/, ''),
      code: (/^(T-\d+)/.exec(fm.title || heading) || /^(T-\d+)/.exec(f) || [])[1] || '',
      title: ((fm.title || heading).replace(/^#\s*/, '').replace(/^T-\d+:\s*/, '') || f.replace(/\.md$/, '')) ,
      status: fm.status || 'unknown',
      blockedBy: Array.isArray(fm.blocked_by) ? fm.blocked_by : [],
      assignee: fm.assignee || null,
      mtime: readMtime(full)
    }
  })

  const handoffs = listFiles(handoffDir).filter(f => f.endsWith('.md')).map(name => ({
    name, consumed: name.startsWith('consumed-'), mtime: readMtime(path.join(handoffDir, name))
  }))

  const feed = []
  for (const l of lanes) {
    if (l.briefMtime) feed.push({ kind: 'brief', label: l.id, detail: 'brief yazıldı', mtime: l.briefMtime })
    if (l.reportMtime) feed.push({ kind: 'report', label: l.id, detail: l.verdict ? `rapor: ${l.verdict}` : 'rapor yazıldı', mtime: l.reportMtime })
  }
  for (const t of tasks) feed.push({ kind: 'task', label: t.code || t.id, detail: `görev · ${t.status}`, mtime: t.mtime })
  for (const h of handoffs) feed.push({ kind: 'handoff', label: h.name, detail: h.consumed ? 'handoff tüketildi' : 'handoff bırakıldı', mtime: h.mtime })
  feed.sort((a, b) => b.mtime - a.mtime)

  return {
    project: demo ? 'demo (örnek koşu)' : path.basename(projectRoot),
    root: projectRoot,
    demo,
    updatedAt: Date.now(),
    lanes, tasks, handoffs,
    memory: fs.existsSync(path.join(taskardDir, 'memory', 'personal.md')),
    config, feed: feed.slice(0, 40),
    tree: buildTree(taskardDir)
  }
}

// ---------- canlı izleme ----------

let snapshot = buildSnapshot()
const clients = new Set()

function refresh() {
  try { snapshot = buildSnapshot() } catch (e) { console.error('[deck] snapshot hatası:', e.message); return }
  const payload = `data: ${JSON.stringify(snapshot)}\n\n`
  for (const res of clients) res.write(payload)
}

try {
  fs.watch(taskardDir, { recursive: true }, () => { clearTimeout(refresh._t); refresh._t = setTimeout(refresh, 250) })
} catch { console.error('[deck] fs.watch desteklenmedi, yalnızca ilk anlık görüntü sunulacak') }

setInterval(() => { for (const res of clients) res.write(': ping\n\n') }, 25000).unref()

// ---------- demo verisi ----------

function buildDemo() {
  const root = path.join(os.tmpdir(), 'taskard-deck-demo')
  const t = path.join(root, '.taskard')
  fs.rmSync(root, { recursive: true, force: true })
  for (const d of [['tasks'], ['lanes/t1430-auth-refactor-a3f2'], ['lanes/t1445-ui-materials-9c1d'], ['lanes/t1450-rag-index-e5b8'], ['handoff'], ['memory']]) fs.mkdirSync(path.join(t, ...d), { recursive: true })
  const w = (rel, body) => fs.writeFileSync(path.join(t, rel), body)

  w('tasks/T-001-auth-refactor.md', '---\nstatus: done\nblocked_by: []\nassignee: implementer\n---\n\n# T-001: Auth modülü refactor\n\nSpec: `.taskard/context/specs/auth.md`\n')
  w('tasks/T-002-ui-materials.md', '---\nstatus: in_progress\nblocked_by: []\nassignee: frontend-developer\n---\n\n# T-002: Materials sekmesi arayüzü\n')
  w('tasks/T-003-rag-index.md', '---\nstatus: in_progress\nblocked_by: [T-001]\nassignee: implementer\n---\n\n# T-003: RAG index yazıcı\n')
  w('tasks/T-004-release-notes.md', '---\nstatus: todo\nblocked_by: [T-002, T-003]\nassignee: implementer\n---\n\n# T-004: Sürüm notları ve changelog\n')

  w('lanes/t1430-auth-refactor-a3f2/brief.md', '# Brief: auth-refactor\n\nDisiplinler: TDD zorunlu · verification-before-completion kanıt kuralı\nBütçe: max_deneme=2 · 30 dk\n\n1. mevcut auth katmanını _shared/auth.ts altına topla\n2. edge function importlarını düzelt\n3. tsc + test kanıtı\n')
  w('lanes/t1430-auth-refactor-a3f2/report.md', 'DONE\n\nKanıt:\n- `_shared/auth.ts` oluşturuldu, 4 fonksiyon taşındı\n- `npm run typecheck` temiz\n- commit: a1b2c3d feat(auth): shared kata taşıma\n')

  w('lanes/t1445-ui-materials-9c1d/brief.md', '# Brief: ui-materials\n\nDisiplinler: mevcut tasarım sistemi birebir · yeni bileşen icat edilmez\nBütçe: max_deneme=2\n\n1. MaterialsTabContent içine ekleme akışı\n2. document-picker entegrasyonu\n')

  w('lanes/t1450-rag-index-e5b8/brief.md', '# Brief: rag-index\n\nDisiplinler: verification-before-completion kanıt kuralı\nBütçe: max_deneme=2 · 20 dk\n\n1. persistMaterialChunks çağrısını başarı yoluna bağla\n')
  w('lanes/t1450-rag-index-e5b8/report.md', 'BLOCKED\n\nEngel: `rag.ts` içindeki chunk boyutu sabitine spec ile çelişen iki değer var (512 vs 800).\nGerekli: hangisinin kaynak doğrusu olduğu kararı.\nDeneme: 1/2\n')

  w('handoff/consumed-20260824-aksam-devri.md', '# Devir\n\nrejected: events.jsonl konvansiyonu bu fazda reddedildi.\n')
  w('memory/personal.md', '# Personal\n\n- Emir çıktıların Türkçe olmasını tercih eder.\n')

  const base = Date.now()
  const age = min => Math.floor((base - min * 60000) / 1000) * 1000
  const ut = (rel, minAgo) => fs.utimesSync(path.join(t, rel), new Date(age(minAgo)), new Date(age(minAgo)))
  ut('tasks/T-001-auth-refactor.md', 95); ut('tasks/T-002-ui-materials.md', 70); ut('tasks/T-003-rag-index.md', 55); ut('tasks/T-004-release-notes.md', 54)
  ut('lanes/t1430-auth-refactor-a3f2/brief.md', 92); ut('lanes/t1430-auth-refactor-a3f2/report.md', 61)
  ut('lanes/t1445-ui-materials-9c1d/brief.md', 68)
  ut('lanes/t1450-rag-index-e5b8/brief.md', 50); ut('lanes/t1450-rag-index-e5b8/report.md', 12)
  ut('handoff/consumed-20260824-aksam-devri.md', 300); ut('memory/personal.md', 4000)
  return root
}

// ---------- http ----------

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.map': 'application/json', '.ico': 'image/x-icon', '.txt': 'text/plain', '.woff2': 'font/woff2' }

const TEXT_EXTS = new Set(['.md', '.toml', '.txt', '.json', '.yaml', '.yml', '.html', '.css', '.js', '.mjs', '.ts', '.tsx'])

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  if (url.pathname === '/api/state') {
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    return res.end(JSON.stringify(snapshot))
  }
  if (url.pathname === '/api/tree') {
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    return res.end(JSON.stringify({ tree: snapshot.tree }))
  }
  if (url.pathname === '/api/file') {
    const rel = url.searchParams.get('path') || ''
    const resolved = path.resolve(taskardDir, rel)
    if (!resolved.startsWith(taskardDir + path.sep) && resolved !== taskardDir) {
      res.writeHead(403, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Traversal engellendi' }))
    }
    try {
      if (fs.lstatSync(resolved).isSymbolicLink()) {
        res.writeHead(403, { 'content-type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Symlink engellendi' }))
      }
    } catch {}
    const ext = path.extname(resolved).toLowerCase()
    if (!TEXT_EXTS.has(ext)) {
      res.writeHead(415, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Desteklenmeyen dosya türü' }))
    }
    let st
    try { st = fs.statSync(resolved) } catch { st = null }
    if (!st || !st.isFile()) {
      res.writeHead(404, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Dosya bulunamadı' }))
    }
    let content
    try { content = fs.readFileSync(resolved, 'utf8') } catch {
      res.writeHead(500, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Dosya okunamadı' }))
    }
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    return res.end(JSON.stringify({ path: rel, content, size: st.size, mtime: st.mtimeMs }))
  }
  if (url.pathname === '/api/stream') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' })
    res.write(`data: ${JSON.stringify(snapshot)}\n\n`)
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }
  const safe = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  let fp = path.join(DIST, safe)
  if (!fp.startsWith(DIST)) fp = path.join(DIST, 'index.html')
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(DIST, 'index.html')
  const ext = path.extname(fp).toLowerCase()
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=3600' })
  fs.createReadStream(fp).pipe(res)
}).listen(PORT, '127.0.0.1', () => {
  console.log(`[deck] ${snapshot.project} — http://localhost:${PORT}${demo ? '  (demo veri)' : ''}`)
})
