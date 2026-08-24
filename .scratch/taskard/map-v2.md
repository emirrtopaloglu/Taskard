---
title: Taskard Hardening — Wayfinder Haritası v2
created: 2026-08-24
modified: 2026-08-24
type: wayfinder-map
status: 🟢 active
tags: [wayfinder, taskard, hardening]
---

# Taskard Hardening (v2 Haritası)

Önceki harita: [`map.md`](map.md) — 10/10 ticket kapandı, destinasyonuna ulaştı (Taskard v0 çalışır durumda, A/B benchmark'lı: $12.62 vs $32.39).

## Destination

**Taskard v0 Kabul:** bilinen tüm kusurlar kapatılmış, saha kanıtları toplanmış durumda — remote yedek var · eval seti en az bir kez koşup kendisi kalibre olmuş · cross-harness (Codex) saha testi yapılmış · paralel lane/worktree gerçek koşuda görülmüş · güvenlik postürü bilinçli seçilmiş (Emir'in kararıyla) · router çakışması çözülmüş · hafıza/handoff doktrini yazılı. Son eşik: Emir dogfooding'de "bitti" der. **OSS hazırlığı bu haritanın DIŞINDADIR** (ayrı effort).

## Notes

- **Domain:** Taskard konvansiyon paketinin olgunlaştırılması — kod değil doktrin/tarihçe/prosedür işi.
- **Karar sahipliği:** keşif ticket'larının bulguları Emir'e sunulur; NİHAİ KARAR HER ZAMAN EMİR'İN (Q56 kararı).
- **İlerleme temposu:** deadline yok; kalite-tetikli — her eşiğin çıkış kriteri yeşile dönmeden sıradakine geçilmez.
- Referanslar: retrospektif (2026-08-24 görüşmesi) · `docs/dependencies.md` · `docs/ROADMAP.md` · önceki harita + research dosyaları (`.scratch/taskard/research/`)
- Tracker: local markdown; ticket claim = frontmatter `assignee`.

## Decisions so far

<!-- ticket kapanınca tek satır gist + link -->

## Not yet specified

- **Maliyet anatomisi:** $12.62'nin hangi bileşene gittiği bilinmiyor; eval kalibrasyonu (T-12) maliyet satırlarını da toplayınca keskinleşir — gerekirse ticket'laşır.
- **Humanish ölçümü:** "insana okunuyorsa doğru" öznel; ölçülebilir kriter fikri eval koşularından sonra olgunlaşabilir.

## Out of scope

- **OSS-ready paketi:** vendoring + sync prosedürü, README EN, lisans, npx installer kararı, güvenliğin OSS-dokümantasyon çerçevesi — ayrı effort (ROADMAP v0.5 fazı).
- **Agent filo genişlemesi/derinleştirme tasarımı** — ROADMAP.md'de todo; bu harita değil.
- **GUI, GitHub Issues sync, memory katmanı büyütme** — ufuk fazı.
