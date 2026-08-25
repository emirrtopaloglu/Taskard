import type { ReactNode } from 'react'
import { LANE_LABEL, TASK_LABEL, laneTone, taskTone, rel } from './hooks'
import type { FeedItem, Lane, Snapshot, Task } from './types'

const KIND_LABEL: Record<FeedItem['kind'], string> = {
  brief: 'brief',
  report: 'rapor',
  task: 'görev',
  handoff: 'handoff'
}

/** LampTone → mockup çip sınıfı. */
const CHIP_CLASS: Record<string, string> = {
  amber: 'c-amber',
  green: 'c-green',
  red: 'c-red',
  ice: 'c-ice',
  off: 'c-gray'
}

function Chip({ tone, label }: { tone: string; label: string }) {
  return (
    <span className={`chip ${CHIP_CLASS[tone] ?? 'c-gray'}`}>
      <i aria-hidden="true" />
      {label}
    </span>
  )
}

function FileIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

/** Lane id'sinden insan-okur başlık: "t1735-kontrol-kulesi-uygulama-d2fc" → "kontrol kulesi uygulama" */
function laneTitle(id: string): string {
  const t = id.replace(/^t\d+-/, '').replace(/-[a-z0-9]{4}$/, '').replace(/-/g, ' ').trim()
  return t || id
}

/** Akış düğümünün tonu — tür + gerçek durumdan. */
function feedTone(f: FeedItem): string {
  if (f.kind === 'brief') return 'ice'
  if (f.kind === 'handoff') return 'gray'
  if (f.kind === 'report') {
    if (f.detail.includes('NEEDS_CONTEXT')) return 'ice'
    if (f.detail.includes('BLOCKED')) return 'red'
    if (f.detail.includes('CONCERNS')) return 'amber'
    if (f.detail.includes('DONE')) return 'green'
    return 'gray'
  }
  // task — detail "görev · <status>" taşır
  if (f.detail.includes('in_progress')) return 'amber'
  if (f.detail.includes('blocked')) return 'red'
  if (f.detail.includes('done')) return 'green'
  return 'gray'
}

const FEED_ICON: Record<string, ReactNode> = {
  brief: <FileIcon />,
  report: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  task: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  handoff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="m16 21 4-4-4-4" />
      <path d="M20 17H4" />
    </svg>
  ),
  warn: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  ),
  info: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}

function LaneCard({ lane, onSelect }: { lane: Lane; onSelect: (path: string) => void }) {
  const files = [...lane.files].sort((a, b) => b.mtime - a.mtime).slice(0, 4)
  const tone = laneTone(lane.status)
  const title = laneTitle(lane.id)
  const latest = files[0]
  const latestKind = latest?.name === 'brief.md' ? 'brief' : latest?.name === 'report.md' ? 'rapor' : 'dosya'
  return (
    <article className="card lane-card">
      <div className="lane-top">
        <span className="lane-id mono" title={lane.id}>{lane.id}</span>
        <Chip tone={tone} label={LANE_LABEL[lane.status] ?? lane.status} />
      </div>
      <div className="lane-title" title={title}>{title}</div>
      <div className="lane-assign">
        <span className="avatar" aria-hidden="true">{title.charAt(0).toUpperCase() || '·'}</span>
        {latest
          ? <span className="assign-name"><b>{latestKind}</b> <span>· {rel(latest.mtime)}</span></span>
          : <span className="assign-name"><span>dosya yok</span></span>}
      </div>
      {(lane.status === 'blocked' || lane.status === 'needs_context') && (
        <div className={`lane-verdict v-${lane.status}`}>
          {lane.status === 'blocked' ? FEED_ICON.warn : FEED_ICON.info}
          {lane.status === 'blocked' ? 'raporda engel bildirdi' : 'raporda bağlam istedi'}
        </div>
      )}
      <div className="lane-files">
        {files.map(f => (
          <button
            key={f.name}
            type="button"
            className="q-chip mono"
            onClick={() => onSelect(`lanes/${lane.id}/${f.name}`)}
            title={`lanes/${lane.id}/${f.name}`}
          >
            <FileIcon />
            <span>{f.name}</span>
          </button>
        ))}
      </div>
    </article>
  )
}

function TaskRow({ task, modelOf }: { task: Task; modelOf: (role: string | null) => string | null }) {
  const model = modelOf(task.assignee)
  return (
    <div className="trow">
      <span className="t-code mono">{task.code || '·'}</span>
      <span className="t-title" title={task.title}>{task.title}</span>
      <span className="t-deps">
        {task.blockedBy.map(b => (
          <span key={b} className="q-chip mono">← {b}</span>
        ))}
      </span>
      <span className="t-assign">
        {task.assignee ? (
          <>
            <span className="avatar" aria-hidden="true">{task.assignee.charAt(0).toUpperCase()}</span>
            <span className="assign-name"><b>{task.assignee}</b>{model && <span> · {model}</span>}</span>
          </>
        ) : (
          <span className="assign-name"><span>atanmadı</span></span>
        )}
      </span>
      <span className="t-status">
        <Chip tone={taskTone(task.status)} label={TASK_LABEL[task.status] ?? task.status} />
      </span>
    </div>
  )
}

/** Özet bandı — görev dağılımı + üç mini sayı kartı. */
function Band({ snap }: { snap: Snapshot }) {
  const by = (s: string) => snap.tasks.filter(t => t.status === s).length
  const done = by('done')
  const run = by('in_progress')
  const queue = by('todo')
  const block = by('blocked')
  const total = snap.tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const runningLanes = snap.lanes.filter(l => l.status === 'running')
  const needsContext = snap.lanes.filter(l => l.status === 'needs_context').length
  const blockedLanes = snap.lanes.filter(l => l.status === 'blocked').length

  // Canlı ajanlar: koşan görevlerin rol→model eşlemesi
  const modelCount = new Map<string, number>()
  for (const t of snap.tasks.filter(t => t.status === 'in_progress')) {
    const m = (t.assignee && snap.config[t.assignee]) || t.assignee || 'atanmamış'
    modelCount.set(m, (modelCount.get(m) || 0) + 1)
  }
  const modelSummary = [...modelCount.entries()].map(([m, c]) => (c > 1 ? `${m} ×${c}` : m)).join(' · ')

  const laneSub = snap.lanes.length === 0
    ? { dot: 'dot-gray', text: 'henüz koşu yok' }
    : needsContext > 0
      ? { dot: 'dot-ice', text: `${needsContext} bağlam bekliyor` }
      : blockedLanes > 0
        ? { dot: 'dot-red', text: `${blockedLanes} bloklu` }
        : runningLanes.length > 0
          ? { dot: 'dot-amber', text: `${runningLanes.length} koşuyor` }
          : { dot: 'dot-green', text: 'hepsi tamamlandı' }

  return (
    <section className="band" aria-label="Özet">
      <div className="card band-progress">
        <div className="band-head">
          <span className="micro-label">Görev dağılımı</span>
          <span className="band-pct"><b>%{pct}</b> tamamlandı</span>
        </div>
        <div className="segbar" role="img" aria-label={`${done} yapıldı, ${run} sürüyor, ${queue} sırada, ${block} bloklu`}>
          {done > 0 && <span className="seg-done" style={{ flex: done }} />}
          {run > 0 && <span className="seg-run" style={{ flex: run }} />}
          {queue > 0 && <span className="seg-queue" style={{ flex: queue }} />}
          {block > 0 && <span className="seg-block" style={{ flex: block }} />}
          {total === 0 && <span className="seg-queue" style={{ flex: 1 }} />}
        </div>
        <ul className="legend">
          <li><i style={{ background: 'var(--green)' }} />Yapıldı <b>{done}</b></li>
          <li><i style={{ background: 'var(--amber)' }} />Sürüyor <b>{run}</b></li>
          <li><i style={{ background: '#39445A' }} />Sırada <b>{queue}</b></li>
          <li><i style={{ background: 'var(--red)' }} />Bloklu <b>{block}</b></li>
        </ul>
      </div>

      <div className="card stat">
        <div className="stat-label">Görevler</div>
        <div className="stat-value">{total}</div>
        <div className="stat-sub">
          <i className={run > 0 ? 'dot-amber' : 'dot-gray'} aria-hidden="true" />
          {run > 0 ? `${run} tanesi sürüyor` : total > 0 ? 'koşan yok' : 'tasks/ boş'}
        </div>
      </div>

      <div className="card stat">
        <div className="stat-label">Lane'ler</div>
        <div className="stat-value">{snap.lanes.length}</div>
        <div className="stat-sub">
          <i className={laneSub.dot} aria-hidden="true" />
          {laneSub.text}
        </div>
      </div>

      <div className="card stat">
        <div className="stat-label">Canlı ajan</div>
        <div className="stat-value">{runningLanes.length}</div>
        <div className="stat-sub">
          <i className={modelSummary ? 'dot-green' : runningLanes.length > 0 ? 'dot-amber' : 'dot-gray'} aria-hidden="true" />
          {modelSummary || (runningLanes.length > 0 ? 'koşu sürüyor' : 'boşta')}
        </div>
      </div>
    </section>
  )
}

export default function Overview({ snap, query, onSelect }: { snap: Snapshot; query: string; onSelect: (path: string) => void }) {
  const modelOf = (role: string | null) => (role && snap.config[role]) || null
  const q = query.trim().toLowerCase()
  const hit = (s: string) => s.toLowerCase().includes(q)

  // Arama lane/görev/dosya adına bakar; akış "son hareketler" olarak tam kalır.
  const lanes = q ? snap.lanes.filter(l => hit(l.id)) : snap.lanes
  const tasks = q
    ? snap.tasks.filter(t => hit(t.code) || hit(t.title) || (t.assignee ? hit(t.assignee) : false) || t.blockedBy.some(hit))
    : snap.tasks
  const recent = snap.feed.slice(0, 8)

  return (
    <div className="overview">
      <Band snap={snap} />

      <section className="section" aria-label="Lane'ler">
        <div className="sec-head">
          <span className="sec-title">Lane'ler</span>
          <span className="count-chip">{lanes.length}</span>
          <span className="sec-hint">en yeni brief üstte</span>
        </div>
        {snap.lanes.length === 0 ? (
          <div className="empty">Bu projede lane yok. Bir koşu başladığında buraya düşecek.</div>
        ) : lanes.length === 0 ? (
          <div className="empty">“{query.trim()}” ile eşleşen lane yok.</div>
        ) : (
          <div className="lanes">{lanes.map(l => <LaneCard key={l.id} lane={l} onSelect={onSelect} />)}</div>
        )}
      </section>

      <section className="section" aria-label="Görevler ve akış">
        <div className="sec-head">
          <span className="sec-title">Görevler</span>
          <span className="count-chip">{tasks.length}</span>
          <span className="sec-hint">tasks/ · frontmatter durumları</span>
        </div>

        <div className="duo">
          {snap.tasks.length === 0 ? (
            <div className="empty">tasks/ boş — mikro iş modunda görev dosyası yazılmaz.</div>
          ) : tasks.length === 0 ? (
            <div className="empty">“{query.trim()}” ile eşleşen görev yok.</div>
          ) : (
            <div className="card table-card">
              <div className="thead" aria-hidden="true">
                <span>Kod</span><span>Görev</span><span>Bağımlılık</span><span>Atanan</span><span>Durum</span>
              </div>
              {tasks.map(t => <TaskRow key={t.id} task={t} modelOf={modelOf} />)}
            </div>
          )}

          {recent.length === 0 ? (
            <div className="empty">Henüz kayıt yok. Dosyalar diske düştükçe buraya düşecek.</div>
          ) : (
            <div className="card feed-card">
              <div className="feed-head">
                <span className="sec-title" style={{ color: 'var(--text)' }}>Son hareketler</span>
                <span className="count-chip">{recent.length}</span>
                <span className="feed-live"><i aria-hidden="true" />AKIŞ</span>
              </div>
              <ul className="timeline">
                {recent.map((f, i) => (
                  <li className="tl-item" key={i}>
                    <span className={`tl-node n-${feedTone(f)}`} aria-hidden="true">{FEED_ICON[f.kind]}</span>
                    <div className="tl-row">
                      <span className="tl-kind">{KIND_LABEL[f.kind]}</span>
                      <span className="tl-time">{rel(f.mtime)}</span>
                    </div>
                    <div className="tl-text" title={f.label}>{f.label}</div>
                    <div className="tl-detail">{f.detail}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
