import { useState } from 'react'
import { useDeck, rel } from './hooks'
import Lamp from './Lamp'
import TreePanel from './TreePanel'
import Reader from './Reader'
import FeedPanel from './FeedPanel'
import Overview from './Overview'

export default function App() {
  const { snap, live } = useDeck()
  const [selected, setSelected] = useState<string | null>(null)

  if (!snap) {
    return (
      <div className="boot">
        <Lamp tone="amber" label="BAĞLANIYOR" size="lg" />
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
        <span className="chip">{snap.project}</span>
        <Lamp tone={live ? 'amber' : 'off'} label={live ? 'CANLI' : 'BAĞLANIYOR'} size="sm" />
        <span className="updated">güncellendi · {rel(snap.updatedAt)}</span>
      </header>

      <div className="bridge">
        <TreePanel tree={snap.tree} selected={selected} onSelect={setSelected} />

        {selected
          ? <Reader path={selected} mtime={selectedMtime} />
          : <section className="panel reader-panel" aria-label="Genel bakış"><Overview snap={snap} /></section>}

        <FeedPanel feed={snap.feed} lanes={snap.lanes} />
      </div>

      <footer className="annunciator" aria-label="Koşu sayaçları">
        <div className="ann-unit"><Lamp tone={running > 0 ? 'amber' : 'off'} label="" size="sm" /><b>{running}</b><span>koşan</span></div>
        <div className="ann-unit"><Lamp tone={done > 0 ? 'green' : 'off'} label="" size="sm" /><b>{done}</b><span>tamam</span></div>
        <div className="ann-unit"><Lamp tone={blocked > 0 ? 'red' : 'off'} label="" size="sm" /><b>{blocked}</b><span>engelli</span></div>
        <div className="ann-unit"><Lamp tone={snap.tasks.length > 0 ? 'ice' : 'off'} label="" size="sm" /><b>{snap.tasks.length}</b><span>görev</span></div>
        <div className="ann-unit"><Lamp tone={handoffs > 0 ? 'ice' : 'off'} label="" size="sm" /><b>{handoffs}</b><span>handoff</span></div>
        <span className="ann-note">
          salt-okur izleyici · disk gerçeğini gösterir · protokole dokunmaz{snap.demo ? ' · DEMO VERİ' : ''}
        </span>
      </footer>
    </div>
  )
}
