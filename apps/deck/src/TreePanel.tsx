import { useMemo } from 'react'
import type { TreeFile } from './types'

interface TreeRow { name: string; path: string }

/**
 * Sol ray — dosya gezinme (fonksiyon aynen korunur).
 * Filtre girdisi üst şeritteki aramadan gelir; ray yalnızca sessiz
 * gruplu liste: dizin adları ince bölüm başlığı, satırda dosya adı.
 */
export default function TreePanel({
  tree,
  selected,
  onSelect,
  query
}: {
  tree: TreeFile[]
  selected: string | null
  onSelect: (path: string) => void
  query: string
}) {
  const q = query.trim().toLowerCase()

  // Yola göre sıralı gruplar: { dir, rows[] } — kök dosyaları önce,
  // sonra dizinler alfabetik. Filtrede de aynı gruplama korunur.
  const groups = useMemo(() => {
    const files = q ? tree.filter(f => f.path.toLowerCase().includes(q)) : tree
    const map = new Map<string, TreeRow[]>()
    for (const f of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
      const i = f.path.lastIndexOf('/')
      const dir = i === -1 ? '' : f.path.slice(0, i)
      const row = { name: i === -1 ? f.path : f.path.slice(i + 1), path: f.path }
      const list = map.get(dir)
      if (list) list.push(row)
      else map.set(dir, [row])
    }
    return [...map.entries()]
      .sort(([a], [b]) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)))
      .map(([dir, rows]) => ({ dir, rows }))
  }, [tree, q])

  return (
    <aside className="rail" aria-label=".taskard dosya listesi">
      <h2 className="rail-label">Dosyalar</h2>

      {tree.length === 0 ? (
        <div className="empty">Bu projede .taskard klasörü boş görünüyor. İlk koşu başladığında dosyalar burada belirir.</div>
      ) : groups.length === 0 ? (
        <div className="empty">“{query.trim()}” ile eşleşen dosya yok. Aramayı kısaltmayı deneyebilirsin.</div>
      ) : (
        <nav className="tree-list">
          {groups.map(g => (
            <div key={g.dir || '/'} className="tree-group">
              {g.dir !== '' && <h3 className="tree-dir">{g.dir}/</h3>}
              {g.rows.map(r => (
                <button
                  key={r.path}
                  type="button"
                  className={`tree-row ${selected === r.path ? 'sel' : ''}`}
                  onClick={() => onSelect(r.path)}
                  title={r.path}
                >
                  {r.name}
                </button>
              ))}
            </div>
          ))}
        </nav>
      )}
    </aside>
  )
}
