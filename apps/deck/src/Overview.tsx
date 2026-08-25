import { LANE_LABEL, TASK_LABEL, laneTone, rel, taskTone } from './hooks'
import type { LampTone } from './hooks'
import Lamp from './Lamp'
import type { Lane, Snapshot, Task } from './types'

function LaneCard({ lane }: { lane: Lane }) {
  const files = [...lane.files].sort((a, b) => b.mtime - a.mtime).slice(0, 4)
  const tone = laneTone(lane.status)
  return (
    <div className="lane">
      <div className="lane-head">
        <span className="lane-id">{lane.id}</span>
        <Lamp tone={tone} label={LANE_LABEL[lane.status] ?? lane.status} size="sm" />
      </div>
      {lane.verdict && (lane.status === 'blocked' || lane.status === 'needs_context') && (
        <div className="lane-verdict">⚑ raporda engel bildirdi</div>
      )}
      <div className="lane-files">
        {files.map(f => (
          <div className="lane-file" key={f.name}>
            <span>{f.name}</span>
            <span className="when">{rel(f.mtime)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskRow({ task, modelOf }: { task: Task; modelOf: (role: string | null) => string | null }) {
  const model = modelOf(task.assignee)
  return (
    <div className="task">
      <Lamp tone={taskTone(task.status)} label="" size="sm" />
      <span className="task-code">{task.code || '·'}</span>
      <span className="task-title">{task.title}</span>
      <div className="task-meta">
        {task.blockedBy.length > 0 && task.blockedBy.map(b => (
          <span className="dep" key={b}>← {b}</span>
        ))}
        {task.assignee && (
          <span className="chip">{model ? `${task.assignee} · ${model}` : task.assignee}</span>
        )}
        <span className={`pill t${task.status === 'done' ? 'done' : task.status === 'in_progress' ? 'inprogress' : 'todo'}`}>
          {TASK_LABEL[task.status] ?? task.status}
        </span>
      </div>
    </div>
  )
}

export default function Overview({ snap }: { snap: Snapshot }) {
  const modelOf = (role: string | null) => (role && snap.config[role]) || null
  return (
    <div className="overview">
      <h3 className="overview-title">GENEL BAKIŞ</h3>
      <p className="overview-hint">Okumak için soldaki ağaçtan bir dosya seç.</p>

      <h4 className="section-title">LANE'LER</h4>
      {snap.lanes.length === 0
        ? <div className="empty">Bu projede lane yok. Bir koşu başladığında buraya düşecek.</div>
        : <div className="lanes">{snap.lanes.map(l => <LaneCard key={l.id} lane={l} />)}</div>}

      <h4 className="section-title">GÖREVLER</h4>
      {snap.tasks.length === 0
        ? <div className="empty">tasks/ boş — mikro iş modunda görev dosyası yazılmaz.</div>
        : snap.tasks.map(t => <TaskRow key={t.id} task={t} modelOf={modelOf} />)}
    </div>
  )
}
