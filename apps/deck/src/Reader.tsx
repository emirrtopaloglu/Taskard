import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { FileFetchError } from './types'
import type { FileContent } from './types'
import { fetchFile, fmtSize, rel } from './hooks'

/** Frontmatter bloğunu ayıklar: { meta, body }. Yoksa meta boş döner. */
function splitFrontmatter(text: string): { meta: [string, string][]; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!m) return { meta: [], body: text }
  const meta: [string, string][] = []
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(\w[\w-]*):\s*(.*)$/.exec(line.trim())
    if (!kv) continue
    let [, k, v] = kv
    if (v.startsWith('[')) {
      const inner = v.replace(/^\[/, '').replace(/\]$/, '').trim()
      meta.push([k, inner ? inner.split(',').join(', ') : ''])
    } else {
      meta.push([k, v.trim().replace(/^['"]|['"]$/g, '')])
    }
  }
  return { meta, body: text.slice(m[0].length).replace(/^\r?\n/, '') }
}

/** İnsan cümlesi hata durumları — sunucu kodları UI'ya taşınmaz. */
function errorSentence(status: number): string {
  switch (status) {
    case 403: return 'Bu dosyayı açmaya iznin yok — güvenlik nedeniyle erişim engellendi.'
    case 404: return 'Bu dosya artık diskte yok; muhtemelen bir koşu sırasında taşındı ya da silindi.'
    case 415: return 'Bu dosya türü okuyucuda açılamıyor — yalnızca metin tabanlı dosyalar görüntülenir.'
    case 0: return 'Sunucuya ulaşılamadı. Bağlantını kontrol edip yeniden deneyebilirsin.'
    default: return 'Dosya okunurken bir sorun çıktı. Birkaç saniye sonra tekrar deneyebilirsin.'
  }
}

// Post-sanitize hook: işlenmiş md'deki bağlantılar yeni sekmede açılsın,
// referrer sızmasın. DOMPurify'in resmî tarifi — attribute'lar temizlendikten
// sonra güvenle eklenir. (Modül başına bir kez kaydedilir.)
DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (node.tagName === 'A' && node.getAttribute('href')) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noreferrer')
  }
})

export default function Reader({ path, mtime }: { path: string | null; mtime: number | null }) {
  const [file, setFile] = useState<FileContent | null>(null)
  const [error, setError] = useState<FileFetchError | null>(null)
  const [loading, setLoading] = useState(false)
  const [raw, setRaw] = useState(false)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const fileRef = useRef<FileContent | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    if (!path) {
      setFile(null)
      setError(null)
      return
    }
    const ac = new AbortController()
    abortRef.current = ac
    // Aynı dosya zaten açıkken (mtime tazelendi): eski içeriği göstermeye
    // devam et, flicker etme; görünüm modunu da elleme.
    const refresh = fileRef.current?.path === path
    setLoading(!refresh)
    if (!refresh) setError(null)
    fetchFile(path, ac.signal)
      .then(f => {
        if (ac.signal.aborted) return
        fileRef.current = f
        setFile(f)
        if (!refresh) {
          setRaw(false)
          setCopied(false)
        }
      })
      .catch(e => {
        if ((e as Error).name === 'AbortError') return
        fileRef.current = null
        setError(e instanceof FileFetchError ? e : new FileFetchError(500, 'Bilinmeyen hata'))
        setFile(null)
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })
    return () => ac.abort()
  }, [path, mtime])

  const { meta, html, lines } = useMemo(() => {
    if (!file) return { meta: [] as [string, string][], html: '', lines: [] as string[] }
    const { meta, body } = splitFrontmatter(file.content)
    const dirty = marked.parse(body, { async: false, gfm: true, breaks: false })
    return { meta, html: DOMPurify.sanitize(dirty), lines: file.content.split(/\r?\n/) }
  }, [file])

  const copy = () => {
    if (!file) return
    navigator.clipboard?.writeText(file.content).then(
      () => { setCopied(true); window.setTimeout(() => setCopied(false), 1800) },
      () => {}
    )
  }

  if (!path) return null // App bu durumda Overview gösterir

  return (
    <section className="reader" aria-label="Dosya okuyucu">
      <header className="reader-head">
        <h2 className="reader-path" title={path}>{path}</h2>
        {file && (
          <>
            {/* Görünür etiketli düz düğmeler — tablist yarımı yerine
                aria-pressed ile durum bildirimi */}
            <div className="segment" role="group" aria-label="Görünüm biçimi">
              <button type="button" aria-pressed={!raw} className={`seg ${!raw ? 'on' : ''}`} onClick={() => setRaw(false)}>işlenmiş</button>
              <button type="button" aria-pressed={raw} className={`seg ${raw ? 'on' : ''}`} onClick={() => setRaw(true)}>ham</button>
            </div>
            <button type="button" className="copy-btn" onClick={copy}>
              {copied ? '✓ kopyalandı' : '⧉ kopyala'}
            </button>
          </>
        )}
      </header>

      {loading && <div className="empty">Dosya açılıyor…</div>}

      {!loading && error && (
        <div className="empty">
          {errorSentence(error.status)}
          <span className="empty-hint">sistem notu: HTTP {error.status}{error.message ? ` · ${error.message}` : ''}</span>
        </div>
      )}

      {!loading && !error && file && (
        <article className={`reader-body ${raw ? 'is-raw' : ''}`}>
          {meta.length > 0 && (
            // Ön bilgi katlanabilir, varsayılan kapalı (sözleşme m6)
            <details className="fm-details">
              <summary>ön bilgi · {meta.length}</summary>
              <table className="fm-table">
                <caption className="visually-hidden">Dosya ön bilgisi</caption>
                <tbody>
                  {meta.map(([k, v]) => (
                    <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}

          {raw ? (
            <div className="raw-view">
              {lines.map((ln, i) => (
                <div className="raw-line" key={i}>
                  <span className="raw-no" title={`${file.path}:${i + 1}`}>{i + 1}</span>
                  <span className="raw-text">{ln || ' '}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="reader-meta">{fmtSize(file.size)} · son dokunuş {rel(file.mtime)}</div>
              <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
            </>
          )}
        </article>
      )}
    </section>
  )
}
