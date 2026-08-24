---
title: Directive Block Versiyonlama
type: wayfinder-ticket
label: wayfinder:task
status: closed
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


## Resolution (2026-08-24)

Directive block artık sürümlü (`<!-- taskard:v2 -->`). install.sh: hedef dosyada beklenen sürüm yoksa eski bloğu awk ile söker, yenisini ekler — idempotent, elle müdahale gereksiz. İlk canlı test: v1→v2 geçişi CLAUDE.md + AGENTS.md'te sorunsuz. Aynı işlemede Q59-Q67 karar turu uygulandı (routing önceliği paragrafı bloğa girdi; lane suffix + disiplin satırı SKILL.md'e; onayda proje adı; runtime artıkları temizlendi).
