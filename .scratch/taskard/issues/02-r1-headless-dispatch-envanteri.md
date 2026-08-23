---
title: Headless Dispatch Envanteri (Harness Karşılaştırması)
type: wayfinder-ticket
label: wayfinder:research
status: open
assignee: research-subagent
blocked_by: []
created: 2026-08-23
research_output: .scratch/taskard/research/r1-headless-dispatch-envanteri.md
---

## Question

Taskard'ın kalbi: main agent'tan diğer harness'lara headless iş göndermek. Bugün (Ağustos 2026 itibarıyla) her harness non-interactive nasıl koşar?

Kapsam: Claude Code, Codex CLI, OpenCode, Cursor CLI, Gemini CLI, Antigravity.

Her biri için cevaplanacaklar:
1. Headless/non-interactive çağrı komutu nedir (ör. `claude -p`, `codex exec`, `opencode run`)?
2. Prompt nasıl geçilir (arg/stdin/dosya)? Çıktı nasıl alınır (stdout/JSON/stream-json)?
3. Model seçimi parametresi var mı? Hangi değerler?
4. Auth nasıl işler: abonelik (OAuth/login) mı API key mi, ikisi de mümkün mü?
5. Çalışma dizini / worktree içinde başlatma desteği; permission/approval bayrakları (`--permission-mode`, sandbox vb.)
6. Timeout, session resume, eş zamanlı instance limitleri bilinen davranışlar/tuzaklar

Antigravity özelinde: headless CLI var mı yok mu netleştirilsin.

Çıktı: karşılaştırma matrisi + her harness için minimal çalışan dispatch komutu örneği + boşluklar/riskler listesi.
