import { useState } from 'react'
import { useDeck, rel } from './hooks'
import Lamp from './Lamp'
import TreePanel from './TreePanel'
import Reader from './Reader'
import Overview from './Overview'

export default function App() {
  const { snap, live } = useDeck()
  const [selected, setSelected] = useState<string | null>(null)

  if (!snap) {
    return (
      <div className="boot">
        <span className="dot amber pulse" aria-hidden="true" />
        <p>Deck köprüye çıkıyor — .taskard klasörü dinleniyor…</p>
      </div>
    )
  }

  const running = snap.lanes.filter(l => l.status === 'running').length
  const done = snap.lanes.filter(l => l.status === 'done' || l.status === 'done_concerns').length
  const blocked = snap.lanes.filter(l => l.status === 'blocked' || l.status === 'needs_context').length
  const handoffs = snap.handoffs.filter(h => !h.consumed).length
  // Seçili dosyanın diskteki mtime'ı — değişince okuyucu kendini tazeler.
  const selectedMtime = selected ? snap.tree.find(t => t.path === selected)?.mtime ?? null : null

  return (
    <div className="app">
      <header className="topbar">
        <span className="wordmark">TASKARD <b>DECK</b></span>
        <span className="project">{snap.project}</span>
        <Lamp tone={live ? 'amber' : 'off'} label={live ? 'CANLI' : 'BAĞLANIYOR'} size="sm" />
        <span className="updated">güncellendi · {rel(snap.updatedAt)}</span>
      </header>

      {/* İki bölge: sol dar sabit liste + orta tek odak (sözleşme m1) */}
      <div className="bridge">
        <TreePanel tree={snap.tree} selected={selected} onSelect={setSelected} />

        {selected
          ? <Reader path={selected} mtime={selectedMtime} />
          : <section className="center" aria-label="Genel bakış"><Overview snap={snap} /></section>}
      </div>

      {/* Alt duyurucu şeridi — sessiz: nokta+sayı+etiket, çerçevesiz (sözleşme m5) */}
      <footer className="annunciator" aria-label="Koşu sayaçları">
        <span className="ann-unit"><span className={`dot ${running > 0 ? 'amber' : ''}`} aria-hidden="true" /><b>{running}</b><span className="lbl">koşan</span></span>
        <span className="ann-unit"><span className={`dot ${done > 0 ? 'green' : ''}`} aria-hidden="true" /><b>{done}</b><span className="lbl">tamam</span></span>
        <span className="ann-unit"><span className={`dot ${blocked > 0 ? 'red' : ''}`} aria-hidden="true" /><b>{blocked}</b><span className="lbl">engelli</span></span>
        <span className="ann-unit"><span className={`dot ${snap.tasks.length > 0 ? 'ice' : ''}`} aria-hidden="true" /><b>{snap.tasks.length}</b><span className="lbl">görev</span></span>
        <span className="ann-unit"><span className={`dot ${handoffs > 0 ? 'ice' : ''}`} aria-hidden="true" /><b>{handoffs}</b><span className="lbl">handoff</span></span>
        <span className="ann-note">
          salt-okur izleyici · disk gerçeğini gösterir · protokole dokunmaz{snap.demo ? ' · DEMO VERİ' : ''}
        </span>
      </footer>
    </div>
  )
}
