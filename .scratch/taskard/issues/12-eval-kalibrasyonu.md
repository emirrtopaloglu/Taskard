---
title: Eval Kalibrasyonu — İlk Koşu
type: wayfinder-ticket
label: wayfinder:task
status: open
assignee:
blocked_by: []
created: 2026-08-24
---

## Question

`evals/` altındaki 4 senaryo hiç koşulmadı — kriterler kendileri valide edilmemiş.

1. `evals/01-mikro-commit.md` senaryosunu geçici bir test projesinde koştur (Taskard akışıyla gerçek mikro iş)
2. Checklist maddelerini tek tek puanla: hangisi ölçülebilir değildi, hangisi eksik, hangisi gereksizdi?
3. Maliyet satırını da topla (maliyet anatomisi fog'unun hammaddesi)
4. Senaryo dosyalarını bulgularla revize et; kalan 3 senaryo için de aynı kalibrasyon planını çıkar

Çıkış kriteri: eval seti "koşulabilir ve sonuç üretir" hale geldi; ilk koşunun kaydı results/ altında duruyor.
