---
title: Dispatch Soyutlaması Tasarımı
type: wayfinder-ticket
label: wayfinder:grilling
status: open
assignee:
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
