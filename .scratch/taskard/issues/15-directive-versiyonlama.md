---
title: Directive Block Versiyonlama
type: wayfinder-ticket
label: wayfinder:task
status: open
assignee:
blocked_by: []
created: 2026-08-24
---

## Question

install.sh directive block'u sadece "marker yoksa ekler" — içerik değişince eski blok evrimleşmiyor, elle değiştirilmek zorunda kalındı (iki kez yaşandı).

1. Block'a sürüm satırı ekle: `<!-- taskard:v1 -->`
2. install.sh: marker VAR ama sürüm farklıysa → eski bloğu yenisiyle DEĞİŞTİR (idempotent, kullanıcı düzenlemesi varsa uyar)
3. Test: eski block'lu CLAUDE.md üzerinde kurulumu koştur

Çıkış kriteri: içerik güncellemesi tek `./install.sh` ile yayılıyor; elle müdahale gerekmiyor.
