# Taskard

Çoklu-harness agent orchestration paketi: pahalı akıl planlar, ucuz el uygular, insan üç kapıda onay verir.

- Claude Code, Codex, OpenCode, Cursor vb. her harness'ta aynı şekilde çalışır
- Main agent (orchestrator) asla kod yazmaz; spec yazar, lane böler, model seçer, dispatch eder
- Sub-agent'lar kendi worktree'lerinde (lane) çalışır, gate'lerden geçer
- Dört hafıza katmanı `.taskard/` içinde dosya tabanlı taşınır

**Durum:** v0 planlama aşamasında. Yol haritası: [`.scratch/taskard/map.md`](.scratch/taskard/map.md) (wayfinder haritası)
