---
title: Headless Dispatch Envanteri (Harness Karşılaştırması)
type: wayfinder-ticket
label: wayfinder:research
status: closed
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

## Resolution (2026-08-23)

Altı harness'ta da headless mümkün — fikir tümünde uygulanabilir. Bulgular: `.scratch/taskard/research/r1-headless-dispatch-envanteri.md`

Kilit noktalar: Gemini CLI tüketicide EOL (18.06.2026) → halefi Antigravity CLI (`agy -p`, json/stream-json çıktı). Ortak kalıp: `-p`/`exec`/`run` + JSON çıktı + model bayrağı + permission bayrağı. En riskli adapter Cursor (`-p` askıda kalma raporları, dosya yazmak için `--force`). Bilinen tuzaklar: Claude Code stream-json donması (#33949 → `--output-format json` + watchdog), OpenCode env kalıntısı "Session not found" (spawn'da temizlenmeli), Antigravity #76 pipe'ta sessiz exit 0. Timeout ve eş zamanlılık standardı hiçbir harness'ta yok → watchdog Taskard'ın sorumluluğu.
