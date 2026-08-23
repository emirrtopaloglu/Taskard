---
title: Cross-Harness Skill Portability Desenleri
type: wayfinder-ticket
label: wayfinder:research
status: open
assignee: research-subagent
blocked_by: []
created: 2026-08-23
research_output: .scratch/taskard/research/r2-skill-portability.md
---

## Question

"Taskard'ı yükle" dediğimizde paketin skill + agent tanımları tüm harness'larda çalışmalı. Bugünkü kurulum/portability mekanizmaları:

1. **Claude Code:** plugin sistemi (plugin.json, marketplace), skills dizinleri (`~/.claude/skills`, proje `.claude/skills`), `disable-model-invocation`, commands/agents layout
2. **Codex:** skill/plugin desteği nasıl (`~/.codex`, AGENTS.md entegrasyonu); superpowers Codex App/CLI'a nasıl kuruluyor?
3. **OpenCode:** plugin alanı (`opencode.json` → `"plugin"`), `.opencode/` içindeki skill/command/agent dizinleri
4. **Cursor:** rules (`​.cursor/rules`), commands, plugin desteği
5. **Gemini CLI:** extensions mekanizması, context dosyaları (GEMINI.md)
6. **Tek kaynaklı dağıtım:** `npx skills add` tarzı installer'lar birden çok hedefe yazabiliyor mu? Superpowers'ın "body agnostic + bootstrap = entire integration" porting doktrini ne kadar genellenebilir?

Çıktı: kurulum matrisi (harness × desteklenen artefakt türleri) + tek kaynaklı dağıtım deseni adayları (2-3 seçenek, artı/eksileriyle).
