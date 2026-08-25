import { useMemo, useState } from 'react'
import type { TreeFile } from './types'
import { fmtSize, rel } from './hooks'

interface TreeNode {
  name: string
  path: string
  isDir: boolean
  mtime: number
  count: number // dizinse: içindeki dosya sayısı (özyinelemeli)
  size: number
  children: TreeNode[]
}

/** Düz tree listesini hiyerarşiye çevirir. */
function buildHierarchy(files: TreeFile[]): TreeNode[] {
  const root: TreeNode = { name: '', path: '', isDir: true, mtime: 0, count: 0, size: 0, children: [] }
  for (const f of files) {
    const parts = f.path.split('/')
    let cur = root
    for (let i = 0; i < parts.length; i++) {
      const isLast = i === parts.length - 1
      const seg = parts[i]
      let next = cur.children.find(c => c.name === seg && c.isDir === !isLast)
      if (!next) {
        next = { name: seg, path: cur.path ? `${cur.path}/${seg}` : seg, isDir: !isLast, mtime: 0, count: 0, size: 0, children: [] }
        cur.children.push(next)
      }
      if (isLast) {
        next.mtime = f.mtime
        next.size = f.size
      } else if (f.mtime > next.mtime) {
        next.mtime = f.mtime
      }
      next.count++
      next.size += f.size
      cur = next
    }
  }
  const sortRec = (n: TreeNode) => {
    n.children.sort((a, b) => (a.isDir !== b.isDir) ? (a.isDir ? -1 : 1) : a.name.localeCompare(b.name))
    for (const c of n.children) sortRec(c)
  }
  sortRec(root)
  return root.children
}

const EXT_ICON: Record<string, string> = {
  md: '✎', toml: '⚙', json: '{}', txt: '≡',
  yaml: '≡', yml: '≡', html: '◇', css: '◇'
}

function iconOf(name: string): string {
  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase()
  return EXT_ICON[ext] ?? '□' // bilinmeyen türler de görünür — generic ikon
}

function FileRow({ node, selected, onSelect }: { node: TreeNode; selected: boolean; onSelect: (p: string) => void }) {
  return (
    <button
      type="button"
      className={`tree-row file ${selected ? 'sel' : ''}`}
      onClick={() => onSelect(node.path)}
      title={`${node.path} · ${fmtSize(node.size)}`}
    >
      <span className="tree-icon" aria-hidden="true">{iconOf(node.name)}</span>
      <span className="tree-name">{node.name}</span>
      <span className="tree-when">{rel(node.mtime)}</span>
    </button>
  )
}

function DirNode({ node, depth, selected, onSelect }: { node: TreeNode; depth: number; selected: string | null; onSelect: (p: string) => void }) {
  return (
    <>
      <div className="tree-row dir" style={{ paddingLeft: 8 + depth * 14 }}>
        <span className="tree-icon" aria-hidden="true">▾</span>
        <span className="tree-name">{node.name}/</span>
        <span className="tree-badge">{node.count}</span>
        <span className="tree-when">{rel(node.mtime)}</span>
      </div>
      {node.children.map(c =>
        c.isDir
          ? <DirNode key={c.path} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} />
          : <FileRow key={c.path} node={c} selected={selected === c.path} onSelect={onSelect} />
      )}
    </>
  )
}

export default function TreePanel({
  tree,
  selected,
  onSelect
}: {
  tree: TreeFile[]
  selected: string | null
  onSelect: (path: string) => void
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const dirs = useMemo(() => buildHierarchy(tree), [tree])
  const matches = useMemo(
    () => q ? tree.filter(f => f.path.toLowerCase().includes(q)).sort((a, b) => a.path.localeCompare(b.path)) : [],
    [q, tree]
  )

  return (
    <section className="panel tree-panel" aria-label=".taskard dosya ağacı">
      <div className="panel-head">
        <h2 className="panel-title">AĞAÇ</h2>
        <input
          type="search"
          className="tree-filter"
          placeholder="yola göre süz…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Dosya yoluna göre filtrele"
        />
      </div>

      {tree.length === 0 ? (
        <div className="empty">Bu projede .taskard klasörü boş görünüyor. İlk koşu başladığında dosyalar burada belirir.</div>
      ) : q ? (
        matches.length === 0 ? (
          <div className="empty">“{query}” ile eşleşen dosya yok. Aramayı kısaltmayı deneyebilirsin.</div>
        ) : (
          <div className="tree-list">
            {matches.map(f => (
              <FileRow key={f.path} node={{ name: f.path.split('/').pop() || f.path, path: f.path, isDir: false, mtime: f.mtime, count: 0, size: f.size, children: [] }} selected={selected === f.path} onSelect={onSelect} />
            ))}
          </div>
        )
      ) : (
        <div className="tree-list">
          {dirs.map(n =>
            n.isDir
              ? <DirNode key={n.path} node={n} depth={0} selected={selected} onSelect={onSelect} />
              : <FileRow key={n.path} node={n} selected={selected === n.path} onSelect={onSelect} />
          )}
        </div>
      )}
    </section>
  )
}
