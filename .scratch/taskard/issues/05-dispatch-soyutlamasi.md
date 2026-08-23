---
title: Dispatch Soyutlaması Tasarımı
type: wayfinder-ticket
label: wayfinder:grilling
status: closed
assignee: emir+jarvis (2026-08-23 oturumu)
blocked_by: ["02-r1-headless-dispatch-envanteri"]
created: 2026-08-23
---

## Question

Main agent farklı bir harness'a iş nasıl gönderir? R1 envanteri geldiğinde tasarlanacak çekirdek arayüz.

Çözülecek kararlar:

1. Tek `dispatch(task, target_harness, model)` arayüzü mü, harness-başına adapter katmanı mı? Adapter'ın sorumluluk sınırı ne?
2. Headless worker'ın çıktısı/durumu nereye yazılır (`.taskard/` içinde mi), nasıl izlenir (polling? log tail?)
3. Model parametresi worker'a nasıl geçilir; istenen model o harness'ta yoksa ne olur (fallback mı reddi mi)?
4. Failure politikası: timeout, çökme, yarım kalan iş — circuit breaker/retry nerede durur?
5. Çıktı damıtma: worker ~50-75K token yaşadıktan sonra main agent'a dönen özet kim yazar, format ne (≤15 satır status contract: DONE/DONE_WITH_CONCERNS/BLOCKED/NEEDS_CONTEXT)?
6. Worktree disiplini dispatch'in içinde mi (lane garantisi) yoksa çağıranın işi mi?

Referans doktrin: AvenoxAI orkestratör sözleşmesi + Claude Architect sahiplik hiyerarşisi (karar upstream'de, downstream aptal uygulayıcı).

## SUPERSEDED (2026-08-23 akşam — Emir kararı)

İlk gerçek koşu (test projesi) kararın gerekçesini üretti: main agent gate review'ı zaten native subagent'la yaptı; headless dispatch izin duvarına çarptı ve runtime config mutasyonuna yol açtı; verbose JSON context yaktı. **Pivot: Node runtime tamamen silindi.** Delegasyon = harness'ların kendi adlandırılmış subagent'ları; cross-harness = skill içinde bash tarifleri; config.toml = agent-okur veri (kod parse etmez). Bkz. harita Decisions.

## Resolution (2026-08-23) — geçerliliğini yitirdi

Emir kararları:

1. **Dil: düz JavaScript (ESM), sıfır bağımlılık** — `node bin/taskard.js` ile koşar, build yok.
2. **Arayüz onaylandı:** `dispatch <lane-dir> --harness X --model Y --brief p` → spawn + env temizliği + watchdog + JSON parse + events.jsonl + report.md. Adapter'lar harness-başına modül (claude/codex/opencode).
3. **Model yoksa fail-fast:** hata + mevcut model listesi; sessiz fallback yasak.
4. **Watchdog:** varsayılan 20 dk dispatch başına; **timeout ve max retry config.toml'dan düzenlenebilir** (Emir eki). Max 2 deneme sonra insan raporu.
5. **Damıtma sözleşmesi:** delegate brief sonunda zorunlu — report.md'e ≤15 satır (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT).
