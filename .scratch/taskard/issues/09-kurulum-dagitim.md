---
title: Kurulum ve Dağıtım Hikâyesi
type: wayfinder-ticket
label: wayfinder:grilling
status: closed
assignee:
blocked_by: ["03-r2-skill-portability"]
created: 2026-08-23
---

## Question

"Taskard'ı yükle" dediğinde ne olur?

Çözülecek kararlar:

1. Kurulum modeli: her harness'a ayrı kurulum (superpowers modeli) mi, tek kaynaklı installer (`npx taskard init` tarzı, tüm harness'lara yazar) mi?
2. Paket içeriği: skill dosyaları + agent tanımları + config şablonu + hook'lar — hangi artefakt türleri hangi dizine gider (R2 matrisine göre)?
3. Proje bazlı esneklik: CLAUDE.md / AGENTS.md'e yazılan direktiflerle projeye özel ek agent/skill tanımı ("bu projede Legacy Parity agent'ını kullan") Taskard tarafından nasıl desteklenir — proje katmanı paket katmanını nasıl override eder?
4. Güncelleme/sürümleme: paket güncellenince mevcut kurulumlar ne olur; proje bazlı özelleştirmeler korunmalı.
5. İlk gün deneyimi: kurulduktan sonra kullanıcı ne yapar — `Taskard'ı başlat` mı, doğal dil mi? Main agent'ın devreye girişi nasıl görünür?

## Resolution (2026-08-23, pivot sonrası)

install.sh: skills+agents symlink (~/.claude, ~/.agents) + global config.toml şablonu + ~/.claude/CLAUDE.md'e marker-wrapped statik direktif bloğu (idempotent). Proje kurulumu skill içindeki tariflerle (mkdir .taskard ağacı + proje CLAUDE.md/AGENTS.md'e aynı blok). Proje bazlı esneklik: direktif satırlarıyla ek agent/rol tanımı.
