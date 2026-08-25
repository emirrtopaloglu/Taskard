import type { LampTone } from './hooks'

/**
 * Vardiya lambası — Taskard Deck'in imza öğesi.
 * Oyulmuş gövde + cam mercek + kazınmış etiket plakasından oluşan
 * gösterge modülü. Her durum tek bir tonla okunur:
 *   koşan = amber (yavaş nabız) · tamam = yeşil · engelli = kırmızı ·
 *   bağlam = buz mavisi · sönük = soluk çerçeve.
 */
export default function Lamp({
  tone = 'off',
  label,
  count,
  size = 'md',
  title
}: {
  tone?: LampTone
  label: string
  count?: number | string
  size?: 'sm' | 'md' | 'lg'
  title?: string
}) {
  return (
    <span className={`lamp lamp-${size} tone-${tone}`} title={title ?? label}>
      <span className="lamp-housing" aria-hidden="true">
        <span className="lamp-lens" />
        <span className="lamp-vent" />
      </span>
      <span className="lamp-plate">
        {count !== undefined && <b className="lamp-count">{count}</b>}
        <span className="lamp-label">{label}</span>
      </span>
    </span>
  )
}
