import { useEffect, useRef, useState } from 'react'
import { useDeck, rel } from './hooks'
import TreePanel from './TreePanel'
import Reader from './Reader'
import Overview from './Overview'

/** Radar markası — mockup'taki gibi. */
function BrandMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.1" fill="#64B6F7" />
      <path d="M12 4.5a7.5 7.5 0 0 1 7.5 7.5" stroke="#64B6F7" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 8.4a3.6 3.6 0 0 1 3.6 3.6" stroke="#85C6F9" strokeWidth="1.6" strokeLinecap="round" opacity=".75" />
      <path d="M12 19.5A7.5 7.5 0 0 1 4.5 12" stroke="#3A465C" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function App() {
  const { snap, live } = useDeck()
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // ⌘K / Ctrl+K arama kutusuna odaklanır
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!snap) {
    return (
      <div className="boot" role="status">
        <span className="boot-dot" aria-hidden="true" />
        <p>Deck köprüye çıkıyor — .taskard klasörü dinleniyor…</p>
      </div>
    )
  }

  // Seçili dosyanın diskteki mtime'ı — değişince okuyucu kendini tazeler.
  const selectedMtime = selected ? snap.tree.find(t => t.path === selected)?.mtime ?? null : null

  // Rayda seçili satıra tekrar tıklamak seçimi bırakır — Genel Bakış'a dönüş yolu.
  const toggleSelect = (p: string) => setSelected(prev => (prev === p ? null : p))

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-in">
          <div className="brand">
            <BrandMark />
            <span className="brand-name">Deck <span>· TASKARD</span></span>
          </div>

          <span className="project-chip" title={snap.root}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            <span>{snap.project}</span>
          </span>

          {/* Lamba CANLI pill'e evrildi: bağlantı durumu tek noktada */}
          <span className={`live-pill ${live ? 'is-live' : 'is-connecting'}`} role="status">
            <i className="live-dot" aria-hidden="true" />
            {live ? 'CANLI' : 'BAĞLANIYOR'}
          </span>

          <div className="search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Lane, görev veya dosya ara…"
              aria-label="Ara"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <kbd aria-hidden="true">⌘K</kbd>
          </div>
        </div>
      </header>

      {/* İki bölge: sol dosya rayı + ana sahne (fonksiyon korunur, dil yenilenir) */}
      <div className="shell">
        <TreePanel tree={snap.tree} selected={selected} onSelect={toggleSelect} query={query} />

        <main className="main">
          {selected
            ? <Reader path={selected} mtime={selectedMtime} />
            : <Overview snap={snap} query={query} onSelect={setSelected} />}
        </main>
      </div>

      <footer className="foot">
        TASKARD Deck — salt-okur izleyici · disk gerçeğini gösterir, protokole dokunmaz{snap.demo ? ' · DEMO VERİ' : ''} · son senkron {rel(snap.updatedAt)}
      </footer>
    </div>
  )
}
