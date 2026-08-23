---
title: v0 Kapsam Manifestosu
type: wayfinder-ticket
label: wayfinder:grilling
status: closed
assignee: emir+jarvis (2026-08-23 oturumu)
blocked_by: []
created: 2026-08-23
---

## Question

v0 tam olarak hangi yetenek setiyle biter? Kabul testi: Virral'da bir fikrin Taskard ile uçtan uca akması.

Çözülecek kararlar:

1. Beş pillar'ın v0'daki durumu: orchestrator sözleşmesi · cross-harness dispatch · dört katmanlı hafıza · task/issue yönetimi · onay katmanı — hangileri v0'da ŞART, hangileri v0.5 sonrası?
2. Minimum vertical slice: pilot senaryosu tek harness + tek lane ile mi başlar, çoklu-harness dispatch v0'ın içinde mi mutlaka olmalı?
3. Skill portability v0'da hangi harness'lara garanti edilir (Claude Code + Codex yeterli mi, hepsi mi)?
4. v0'ın açıkça DIŞINDA kalanlar listesi (negatif kararlar da yazılır).
5. "Bitti" cümlesinin ölçülebilir hali: pilot koşusu hangi somut adımları içerir?

Bu ticket diğer tüm ticket'ların önceliğini şekillendirir — frontier'daki ilk karar.

## Resolution (2026-08-23)

Emir kararları:

1. **v0'ın teslimatı sistemin kendisidir:** agent'lar, skill'ler, hook'lar, cross-harness dispatch, hafıza şeması, onay kapıları, install.sh. Pilot feature önceden sabitLENMEZ — Emir sistemi kendi seçeceği gerçek işte kullanır.
2. **Cross-harness dispatch v0'da ÜÇ harness:** Claude Code + Codex + OpenCode.
3. **Hafıza: dört katman TAM şema** — stub yok.
4. **Portability garantisi:** Claude Code + Codex + OpenCode (Cursor/Antigravity v0.5).
5. **Üç onay kapısı v0'da;** riskli işlem onayı statik listeyle sorulur (migration/deploy/silme).
6. **Kurulum: install.sh** yeterli (npx paketi v0.5'e). Skill dosyaları standart formatta yaşar (SKILL.md, `.agents/skills/`) — geçiş maliyeti düşük kalsın.
7. **Kabul testi Emir'indir:** kullanım talimatları verilir, akışı kendi yöntemleriyle uçtan uca test eder, "olmuş bu bitti" der.
