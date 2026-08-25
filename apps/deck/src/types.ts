export type LaneStatus = 'running' | 'done' | 'done_concerns' | 'blocked' | 'needs_context'

export interface LaneFile { name: string; mtime: number }

export interface Lane {
  id: string
  status: LaneStatus
  verdict: string | null
  hasBrief: boolean
  briefMtime: number | null
  reportMtime: number | null
  files: LaneFile[]
}

export interface Task {
  id: string
  code: string
  title: string
  status: string
  blockedBy: string[]
  assignee: string | null
  mtime: number
}

export interface FeedItem {
  kind: 'brief' | 'report' | 'task' | 'handoff'
  label: string
  detail: string
  mtime: number
}

/** /api/tree ve snapshot.tree satırı — .taskard altındaki bir dosya. */
export interface TreeFile {
  path: string
  size: number
  mtime: number
}

/** /api/file yanıtı. */
export interface FileContent {
  path: string
  content: string
  size: number
  mtime: number
}

/** /api/file hata yanıtı (403/404/415/500). */
export class FileFetchError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export interface Snapshot {
  project: string
  root: string
  demo: boolean
  updatedAt: number
  lanes: Lane[]
  tasks: Task[]
  handoffs: { name: string; consumed: boolean; mtime: number }[]
  memory: boolean
  config: Record<string, string>
  feed: FeedItem[]
  tree: TreeFile[]
}
