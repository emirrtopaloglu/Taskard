---
title: Onay Kanalı Tasarımı (Üç Kapı)
type: wayfinder-ticket
label: wayfinder:grilling
status: closed
assignee:
blocked_by: ["05-dispatch-soyutlamasi"]
created: 2026-08-23
---

## Question

Üç zorunlu insan onayı kapısında onay hangi kanaldan iletilir ve alınır?

1. Plan onayı (grilling/spec sonu) — terminal içinde mi, ayrı bir mekanizma mı?
2. Merge öncesi canlı doğrulama — Superfast'teki akış korunuyor mu (boşta port, çalıştır, onay iste)?
3. Riskli işlem onayı (migration, deploy, silme) — hangi işlemler "riskli" sayılır, liste kimde?

Çözülecek kararlar:

- Kanal: terminal prompt mu, `.taskard/` içine yazılan pending-onay dosyası + bekleme döngüsü mü, dış kanal mı (Telegram benzeri)? Main agent başka harness'ta çalışırken bu nasıl tutarlı kalır?
- Trivial/kritik ayrımı: main agent'ın özerk karar verme sınırının kriter listesi ne olmalı (task bölme trivial; ama ne zaman "kritik"e düşer)?
- Onay beklerken sistem ne yapar: bloke mu, başka lane'lere mi devam eder?
- Reddetme/revize akışı: onay gelmezse lane açık kalır mı (Superfast davranışı)?

## Resolution (2026-08-23, pivot sonrası)

İzin katmanı ile iş akışı katmanı ayrıldı: tool izinleri varsayılan açık (bypassPermissions), insan onayı üç iş akışı kapısında yaşar (plan onayı, merge öncesi canlı doğrulama, risky_operations listesi). Config çalışma anında ASLA değiştirilmez — StudyPal koşusundaki geçici bypassPermissions config hack'i iron law ile yasaklandı.
