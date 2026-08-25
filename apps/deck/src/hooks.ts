import { useEffect, useRef, useState } from 'react'
import { FileFetchError } from './types'
import type { FileContent, Snapshot } from './types'

export function useDeck(): { snap: Snapshot | null; live: boolean } {
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [live, setLive] = useState(false)
  const pollRef = useRef<number | null>(null)

  useEffect(() => {
    let es: EventSource | null = null

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }

    const startPolling = () => {
      if (pollRef.current) return
      pollRef.current = window.setInterval(async () => {
        try {
          const r = await fetch('/api/state')
          setSnap(await r.json())
        } catch {}
      }, 4000)
    }

    const connect = () => {
      const source = new EventSource('/api/stream')
      es = source
      source.onopen = () => {
        setLive(true)
        stopPolling() // akış geri geldi — ikisi asla paralel koşmasın
      }
      source.onmessage = e => {
        try {
          setSnap(JSON.parse(e.data))
          setLive(true)
        } catch {} // bozuk frame sessizce atlanır
      }
      // EventSource bağlantıyı kendisi yeniler; polling yalnızca
      // akış tamamen kapandığında (CLOSED) devreye girer.
      source.onerror = () => {
        setLive(false)
        if (source.readyState === EventSource.CLOSED) startPolling()
      }
    }

    fetch('/api/state').then(r => r.json()).then(setSnap).catch(() => {})
    connect()

    return () => {
      es?.close()
      stopPolling()
    }
  }, [])

  return { snap, live }
}

/**
 * Seçili dosyanın içeriğini çeker. Abort desteklidir — yeni seçim
 * geldiğinde önceki istek sessizce iptal edilir.
 */
export async function fetchFile(path: string, signal?: AbortSignal): Promise<FileContent> {
  let r: Response
  try {
    r = await fetch(`/api/file?path=${encodeURIComponent(path)}`, { signal })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new FileFetchError(0, 'Sunucuya ulaşılamadı.')
  }
  if (!r.ok) {
    const data = (await r.json().catch(() => null)) as { error?: string } | null
    throw new FileFetchError(r.status, data?.error || `Dosya alınamadı (${r.status})`)
  }
  return (await r.json()) as FileContent
}

export const LANE_LABEL: Record<string, string> = {
  running: 'koşuyor',
  done: 'tamamlandı',
  done_concerns: 'bitti (notlu)',
  blocked: 'bloklu',
  needs_context: 'bağlam bekliyor'
}

export const TASK_LABEL: Record<string, string> = {
  done: 'yapıldı',
  in_progress: 'sürüyor',
  todo: 'sırada',
  blocked: 'bloklu',
  unknown: '—'
}

/** Lane durumunu lamba tonuna çevirir. */
export function laneTone(status: string): LampTone {
  if (status === 'running') return 'amber'
  if (status === 'done' || status === 'done_concerns') return 'green'
  if (status === 'blocked') return 'red'
  if (status === 'needs_context') return 'ice'
  return 'off'
}

/** Görev durumunu lamba tonuna çevirir. */
export function taskTone(status: string): LampTone {
  if (status === 'in_progress') return 'amber'
  if (status === 'done') return 'green'
  if (status === 'blocked') return 'red'
  return 'off'
}

export type LampTone = 'amber' | 'green' | 'red' | 'ice' | 'off'

export function rel(ms: number | null): string {
  if (!ms) return ''
  const s = Math.max(0, (Date.now() - ms) / 1000)
  if (s < 90) return 'az önce'
  if (s < 3600) return `${Math.round(s / 60)} dk önce`
  if (s < 86400 * 2) return `${Math.round(s / 3600)} sa önce`
  return new Date(ms).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** Baytı insan-okur boyuta çevirir. */
export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
