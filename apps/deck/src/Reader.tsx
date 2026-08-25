import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
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

/** Kod bloklarını mockup diline sarar: koyu panel + dil etiketi başlığı. */
function decorateCodeBlocks(html: string): string {
  if (!html.includes('<pre')) return html
  const doc = new DOMParser().parseFromString(html, 'text/html')
  for (const pre of [...doc.querySelectorAll('pre')]) {
    const code = pre.querySelector('code')
    const lang = /language-([\w+-]+)/.exec(code?.className || '')?.[1]
    const wrap = doc.createElement('div')
    wrap.className = 'codeblock'
    if (lang) {
      const head = doc.createElement('div')
      head.className = 'codeblock-head'
      const tag = doc.createElement('span')
      tag.className = 'lang'
      tag.textContent = lang.toUpperCase()
      head.appendChild(tag)
      wrap.appendChild(head)
    }
    pre.replaceWith(wrap)
    wrap.appendChild(pre)
  }
  return doc.body.innerHTML
}

/** Tanımlayıcı görünümlü meta değerleri mono gösterir (mockup kuralı). */
const IDENT_RE = /^[\w.@/:+~-]+$/

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

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
    return { meta, html: decorateCodeBlocks(DOMPurify.sanitize(dirty)), lines: file.content.split(/\r?\n/) }
  }, [file])

  const copy = () => {
    if (!file) return
    navigator.clipboard?.writeText(file.content).then(
      () => { setCopied(true); window.setTimeout(() => setCopied(false), 1800) },
      () => {}
    )
  }

  if (!path) return null // App bu durumda Overview gösterir

  const segments = path.split('/')

  return (
    <section className="reader" aria-label="Dosya okuyucu">
      <div className="card">
        <header className="reader-head">
          <nav className="crumb mono" aria-label="Dosya yolu">
            <span>.taskard</span>
            {segments.map((seg, i) => (
              <Fragment key={i}>
                <span className="sep" aria-hidden="true">/</span>
                {i === segments.length - 1 ? (
                  <span className="cur">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                    {seg}
                  </span>
                ) : (
                  <span>{seg}</span>
                )}
              </Fragment>
            ))}
          </nav>

          {file && <span className="reader-meta">{fmtSize(file.size)} · son dokunuş {rel(file.mtime)}</span>}

          {file && (
            <div className="reader-tools">
              {/* Görünür etiketli düz düğmeler — aria-pressed ile durum bildirimi */}
              <div className="segctl" role="group" aria-label="Görünüm biçimi">
                <button type="button" aria-pressed={!raw} className={!raw ? 'on' : ''} onClick={() => setRaw(false)}>İşlenmiş</button>
                <button type="button" aria-pressed={raw} className={raw ? 'on' : ''} onClick={() => setRaw(true)}>Ham</button>
              </div>
              <button type="button" className="btn" onClick={copy}>
                <CopyIcon />
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          )}
        </header>

        {loading && <div className="reader-body"><div className="empty">Dosya açılıyor…</div></div>}

        {!loading && error && (
          <div className="reader-body">
            <div className="empty">
              {errorSentence(error.status)}
              <span className="empty-hint">sistem notu: HTTP {error.status}{error.message ? ` · ${error.message}` : ''}</span>
            </div>
          </div>
        )}

        {!loading && !error && file && (
          <div className={`reader-body ${raw ? 'is-raw' : ''}`}>
            {meta.length > 0 && (
              // Mockup'taki gibi görünür temiz meta kartı — katlanmaz
              <div className="meta-card">
                {meta.map(([k, v]) => (
                  <div className="meta-row" key={k}>
                    <span className="meta-key">{k}</span>
                    <span className={`meta-val${IDENT_RE.test(v) ? ' mono' : ''}`}>{v}</span>
                  </div>
                ))}
              </div>
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
              <div className="doc" dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
