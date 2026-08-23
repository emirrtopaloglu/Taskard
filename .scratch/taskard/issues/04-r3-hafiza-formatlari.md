---
title: Dosya-Tabanlı Hafıza Formatları ve Taşıma Protokolü
type: wayfinder-ticket
label: wayfinder:research
status: open
assignee: research-subagent
blocked_by: []
created: 2026-08-23
research_output: .scratch/taskard/research/r3-hafiza-formatlari.md
---

## Question

Dört hafıza katmanının hepsi `.taskard/` içinde dosya tabanlı yaşayacak ve context window'u şişirmeden taşınacak: (i) proje bilgisi (spec/karar/domain terimleri), (ii) task durumu (hangi lane ne durumda), (iii) agent workload (kim ne yapıyor), (iv) kişisel hafıza (kullanıcı tercihleri/bağlam — OSS olduğu için genel yapıda).

Araştırılacak mevcut desenler:

1. **worklog + index.md deseni** — paralel agent'lar diske yazarak konuşur; her agent başlamadan index'i okur
2. **CONTEXT.md + ADR** — ubiquitous language, 1-2 cümle IS-tanımı, ADR üç-kapı kuralı
3. **Append-only ledger + range-bazlı ilerleme** — reviews.md tarzı; denenenler/neden olmadı 3-4 satır not
4. **Session köprüleri** — oturumlar arası devir, compaction sonrası hayatta kalma desenleri
5. **Immutable state snapshot + data contract** — versiyonlu handoff, şema doğrulama, append-only state log
6. **Context ekonomisi** — index + lazy load, damıtılmış özet (~50x sıkıştırma), progressive disclosure

Yerel kaynaklar (okunabilir): EmirOS vault · `/Users/emir/Library/Mobile Documents/iCloud~md~obsidian/Documents/EmirOS/🧠 500-Knowledge/Raporlar/` altındaki HTML raporlar ve `MattPocock-AI-Coding-Workflow-Video-Notu.md`.

Çıktı: `.taskard/` şeması için 2-3 alternatif format tasarımı + her katmanın okuma/yazma protokolü taslağı.
