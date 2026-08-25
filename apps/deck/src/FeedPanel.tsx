import { LANE_LABEL, laneTone, rel } from './hooks'
import Lamp from './Lamp'
import type { FeedItem, Lane } from './types'

const KIND_ICON: Record<FeedItem['kind'], string> = {
  brief: '✎', report: '⚑', task: '▦', handoff: '⇥'
}

export default function FeedPanel({ feed, lanes }: { feed: FeedItem[]; lanes: Lane[] }) {
  return (
    <aside className="panel feed-panel" aria-label="Canlı akış">
      <div className="panel-head">
        <h2 className="panel-title">AKIŞ</h2>
      </div>

      <h3 className="section-title">LAMBA ÖZETİ</h3>
      {lanes.length === 0 ? (
        <div className="empty small">Henüz lane yok — ilk koşu bekleniyor.</div>
      ) : (
        <div className="lamp-summary">
          {lanes.map(l => (
            <div className="lamp-sum-row" key={l.id} title={LANE_LABEL[l.status] ?? l.status}>
              <Lamp tone={laneTone(l.status)} label="" size="sm" />
              <span className="lamp-sum-id">{l.id}</span>
              <span className="lamp-sum-when">{rel(l.briefMtime ?? l.reportMtime ?? null)}</span>
            </div>
          ))}
        </div>
      )}

      <h3 className="section-title">OLAYLAR</h3>
      <div className="feed">
        {feed.length === 0 && <div className="empty small">Henüz kayıt yok. Dosyalar diske düştükçe buraya düşecek.</div>}
        {feed.map((f, i) => (
          <div className="feed-item" key={i}>
            <span className={`feed-kind k-${f.kind}`} aria-hidden="true">{KIND_ICON[f.kind]}</span>
            <span className="feed-label">
              {f.label}
              <span className="feed-detail"> — {f.detail}</span>
            </span>
            <span className="feed-time">{rel(f.mtime)}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
