---
title: Eval Kalibrasyonu — İlk Koşu
type: wayfinder-ticket
label: wayfinder:task
status: closed
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


## Resolution (2026-08-24)

Senaryo 01 geçici test projesinde koşuldu; kayıt + puanlama: `.scratch/taskard/results/eval-01-run1.md`. Sonuç: 9/10 kriter geçti (maliyet satırı N/A — harness vermiyor); 1 provider altyapı hatası retry'la çözüldü. Koşu 1 doktrin çelişkisi yakaladı ve kapatıldı (§2 workload panosu ↔ mikro tier tek-dosya kuralı → mikro tier'da INDEX güncellenmez, SKILL.md netleştirildi). evals/01'e 4 yeni kriter eklendi (suffix, disiplin satırı, pointer dönüş, INDEX-kuralı). Kalan senaryoların kalibrasyon planı results dosyasında.
