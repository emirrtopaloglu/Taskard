---
title: Cross-Harness Saha Testi (Codex)
type: wayfinder-ticket
label: wayfinder:task
status: closed
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


## Resolution (2026-08-24)

İlk gerçek cross-harness koşusu tamamlandı — mikro görev, 2 deneme:

1. **Deneme 1 (`-s workspace-write`):** edit + report mükemmel ama commit BLOCKED — sandbox `.git/index.lock` yazamadı. Worker sözleşmeye birebir uydu: dürüst BLOCKED bildirimi + kanıt.
2. **Deneme 2 (`-s danger-full-access`):** DONE — commit `1dcd15a`, diff temiz.

**Ek A tarifi güncellendi** (v0.149.0 saha gerçekleri): `--full-auto`/`--json` yok; `-s danger-full-access` git-write için şart; "tokens used" stdout'ta görünüyor (maliyet kaynağı: 55K+34K); exit code güvenilmez. **Yeni kural:** cross-harness brief'lerde report.md MUTLAK yolu yazılmalı (worker proje köküne yazdı).

Toplam ~90K token. Kayıt: temp proje `codex-test`.
