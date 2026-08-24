---
title: Cross-Harness Saha Testi (Codex)
type: wayfinder-ticket
label: wayfinder:task
status: open
assignee:
blocked_by: ["16-guvenlik-posturu"]
created: 2026-08-24
---

## Question

"Her harness'ta çalışır" vaadinin tek kanıtı Claude Code. İlk gerçek cross-harness saha testi: bir implementer işini bilerek **Codex headless**'a ver (Ek A tarifi).

1. Önce T-16 güvenlik bulgularını oku — postürü ona göre ayarla
2. Codex CLI auth durumu teyit; `codex exec --json` tarifini küçük bir mikro görevde koştur
3. Gözlenecekler: çıktı parse doğru mu, model bayrağı çalışıyor mu, timeout davranışı, report.md sözleşmesine uyum, maliyet
4. Bulgular Ek A tarifi + adapters dokümantasyonuna geri işlenir

Çıkış kriteri: Codex ile uçtan uca bir lane'in kaydı var; tarif saha gerçeğiyle eşleşiyor.
