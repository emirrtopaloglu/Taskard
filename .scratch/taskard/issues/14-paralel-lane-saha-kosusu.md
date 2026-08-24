---
title: Paralel Lane + Worktree Saha Koşusu
type: wayfinder-ticket
label: wayfinder:task
status: closed
assignee:
blocked_by: []
created: 2026-08-24
---

## Question

§2b Paralel lane disiplini hiç sahada koşmadı.

1. İki BAĞIMSIZ mikro iş seç; ikisini de aynı anda farklı worktree'lerde implementer delegate'lere ver
2. Gözlenecekler: worktree kurulumu sorunsuz mu, brief'ler karışıyor mu, INDEX.md workload panosu iki lane'i doğru tutuyor mu, merge sırası/çakışma akışı nasıl işliyor, telegraf anlatımı paralel olaylarda okunur kalıyor mu?
3. Bulgular §2b doktrinine geri işlenir

Çıkış kriteri: paralel koşunun kaydı var; doktrin saha gerçeğiyle eşleşiyor.


## Resolution (2026-08-24)

İki bağımsız lane aynı anda iki worktree'de koştu (paralel spawn):

- **İzolasyon ✓:** wt-a'da yalnız Lane A dosyası, wt-b'de yalnız Lane B — hiçbir çapraz dokunuş yok
- **Merge ✓:** sıralı merge, sıfır çakışma, git grafiğinde temiz elmas (diamond) deseni
- **Bulgu:** report dosyaları worktree-lokal `.taskard/` altında kaldı (commit edilmeyen dosyalar merge'e girmedi) — ana döngü mutlak yol ile okudu; sorun değil ama cross-worktree rapor toplama ana döngünün işi olduğu netleşti

§2b disiplini saha gerçeğiyle doğrulandı; doktrin değişikliği gerekmedi.
