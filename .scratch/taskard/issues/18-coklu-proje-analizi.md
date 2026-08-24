---
title: Çoklu-Proje Eş Zamanlı Koşu Analizi
type: wayfinder-ticket
label: wayfinder:research
status: open
assignee:
blocked_by: []
created: 2026-08-24
research_output: .scratch/taskard/research/h3-coklu-proje.md
---

## Question

İki farklı projede Taskard oturumu aynı anda açıkken ne olur — hiç test edilmedi.

1. **İzolasyon denetimi:** `.taskard/` per-proje (lanes/tasks/INDEX) — gerçekten çakışmaz mı? Global `~/.taskard/config.toml` read-only okunduğu için sorun yok mu?
2. **Paylaşımlı kaynaklar:** aynı skill dosyaları, aynı agent tanımları, aynı MCP'ler (Mem0!) iki oturumdan eş zamanlı kullanılınca ne olur?
3. **Worktree kesişimi:** proje A'nın lane worktree'i ile proje B'nin repo'su karışabilir mi?
4. **Maliyet/limit paylaşımı:** iki paralel proje aynı abonelik limitini yerken görünürlük var mı?
5. Öneri: kısıt/varsa kural metni taslağı (SKILL.md'e 2-3 satır)

Yöntem: yerel inceleme + akıl yürütme; gerekirse hafif saha prova (iki temp proje).

Çıktı: bulgu listesi + kural taslağı — KARAR YOK.
