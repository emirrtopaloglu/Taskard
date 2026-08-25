import { LANE_LABEL, TASK_LABEL, laneTone, taskTone } from './hooks'
import type { FeedItem, Lane, Snapshot, Task } from './types'

const KIND_LABEL: Record<FeedItem['kind'], string> = {
  brief: 'brief',
  report: 'rapor',
  task: 'görev',
  handoff: 'handoff'
}

/** Basit renk noktası — lamba süsünün sessiz hâli (sözleşme m4). */
function Dot({ tone, label }: { tone: string; label: string }) {
  return <span className={`dot ${tone}`} role="img" aria-label={label} />
}

function LaneCard({ lane }: { lane: Lane }) {
  const files = [...lane.files].sort((a, b) => b.mtime - a.mtime).slice(0, 4)
  const tone = laneTone(lane.status)
  return (
    <div className="lane">
      <div className="lane-head">
        <Dot tone={tone} label={LANE_LABEL[lane.status] ?? lane.status} />
        <span className="lane-id">{lane.id}</span>
        <span className={`status s-${tone}`}>{LANE_LABEL[lane.status] ?? lane.status}</span>
      </div>
      {lane.verdict && (lane.status === 'blocked' || lane.status === 'needs_context') && (
        <div className="lane-verdict">⚑ raporda engel bildirdi</div>
      )}
      <div className="lane-files">
        {files.map(f => (
          <div className="lane-file" key={f.name}>{f.name}</div>
        ))}
      </div>
    </div>
  )
}

function TaskRow({ task, modelOf }: { task: Task; modelOf: (role: string | null) => string | null }) {
  const model = modelOf(task.assignee)
  const tone = taskTone(task.status)
  return (
    <div className="task">
      <Dot tone={tone} label={TASK_LABEL[task.status] ?? task.status} />
      <span className="task-code">{task.code || '·'}</span>
      <span className="task-title">{task.title}</span>
      <div className="task-meta">
        <span className={`status s-${tone}`}>{TASK_LABEL[task.status] ?? task.status}</span>
        {task.blockedBy.length > 0 && (
          <span className="dep">{task.blockedBy.map(b => `← ${b}`).join(' ')}</span>
        )}
        {task.assignee && (
          <span className="who">{model ? `${task.assignee} · ${model}` : task.assignee}</span>
        )}
      </div>
    </div>
  )
}

export default function Overview({ snap }: { snap: Snapshot }) {
  const modelOf = (role: string | null) => (role && snap.config[role]) || null
  // Akış yeni yeri: genel bakışın altı — ilk 8 kayıt, tek satır (sözleşme m3).
  const recent = snap.feed.slice(0, 8)
  return (
    <div className="overview">
      <h3 className="overview-title">GENEL BAKIŞ</h3>
      <p className="overview-hint">Okumak için soldaki listeden bir dosya seç.</p>

      <h4 className="section-title">LANE'LER</h4>
      {snap.lanes.length === 0
        ? <div className="empty">Bu projede lane yok. Bir koşu başladığında buraya düşecek.</div>
        : <div className="lanes">{snap.lanes.map(l => <LaneCard key={l.id} lane={l} />)}</div>}

      <h4 className="section-title">GÖREVLER</h4>
      {snap.tasks.length === 0
        ? <div className="empty">tasks/ boş — mikro iş modunda görev dosyası yazılmaz.</div>
        : snap.tasks.map(t => <TaskRow key={t.id} task={t} modelOf={modelOf} />)}

      <h4 className="section-title">SON HAREKETLER</h4>
      {recent.length === 0
        ? <div className="empty">Henüz kayıt yok. Dosyalar diske düştükçe buraya düşecek.</div>
        : (
          <ul className="recent">
            {recent.map((f, i) => (
              <li className="recent-item" key={i}>
                <span className="recent-kind">{KIND_LABEL[f.kind]}</span>
                <span className="recent-label">
                  {f.label}
                  <span className="recent-detail"> — {f.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}
