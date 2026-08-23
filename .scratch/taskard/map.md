---
title: Taskard — Wayfinder Haritası
created: 2026-08-23
modified: 2026-08-23
type: wayfinder-map
status: 🟢 active
tags: [wayfinder, taskard, orchestration]
---

# Taskard — Çoklu-Harness Agent Orchestration Paketi (v0)

## Destination

Taskard v0: "Taskard'ı yükle" deyince kurulan, her harness'ta (Claude Code, Codex, OpenCode, Cursor vb.) aynı şekilde çalışan skill/agent paketi — Superfast'in evrimi. Başarı tanımı: **Virral projesinde** bir fikir uçtan uca akıyor. Main agent (pahalı akıl) fikri grill'ler, spec yazar, lane'lere böler; sub-agent'lar (ucuz el) kendi worktree'lerinde uygular; TDD + review gate'lerinden geçer; insan üç kapıda onay verir (plan onayı, merge öncesi canlı doğrulama, riskli işlem); merge edilir. Ana döngü hiç kod yazmaz; model seçimi config tablosu + session override ile kullanıcıdadır; dört hafıza katmanı `.taskard/` içinde dosya tabanlı taşınır.

## Notes

- **Domain:** Cross-harness multi-agent orchestration. Önce tek kullanıcı (Emir), sonra OSS, uzakta GUI.
- **Referans doktrinler** (EmirOS vault · `🧠 500-Knowledge/Raporlar/`):
  - `Superpowers-Repo-Raporu.html` — SDD, TDD iron law, worktree disiplini, rationalization tabloları, harness-başına bootstrap
  - `MattPocock-Skills-Repo-Raporu.html` — grilling/to-spec/to-tickets zinciri, tracker doktrini, hard/soft dependency
  - `MattPocock-AI-Coding-Workflow-Raporu.html` + `-Video-Notu.md` — smart zone (~100K), Ralph loop, vertical slices, fresh-context review
  - `AvenoxAI-AI-Coding-Ustalik-Raporu.html` — orkestratör sözleşmesi (kod yazma/okuma yasak), worklog+index.md deseni, loop üç yasası, subagent özet ekonomisi (~50x sıkıştırma)
  - `From-Chaos-To-Choreography-Raporu.html` — immutable state snapshot + data contract, circuit breaker, saga compensation
  - `Claude-Architect-Multi-Agent-Orchestration-Raporu.html` — hub-and-spoke, sahiplik hiyerarşisi (karar upstream'de)
- **Kullanıcı tercihleri:** Türkçe konuşma · model seçimi kullanıcıda (config tablosu + session-level override) · HITL her zaman devrede; main agent trivial kararlarda özerk (örn. task bölme), kritikte hemen sorar · iletişim tamamen merkezi (sub-agent'lar birbirine konuşmaz) · iş implementasyonda büyürse main agent yeni task açıp yönetir.
- **Akış iskeleti (Superpowers'tan):** brainstorming → spec → worktree (lane) → decomposition → SDD → TDD + code review → canlı doğrulama → PR.
- **Pilot:** Virral (`~/development/virral`) — v0 kabul testi burada koşar.
- Bu haritada plan-don't-do override'ı YOK: ticket'lar karar çözer; harita bitince `/to-spec` ile collapse edilir.
- Tracker: local markdown (`.scratch/taskard/issues/`). Ticket claim = frontmatter'da `assignee` doldurmak.

## Decisions so far

<!-- henüz yok — charting oturumu elle karar çözmez; ticket kapanınca buraya tek satır gist + link gelir -->

## Not yet specified

- **Limit-farkındalıklı yönlendirme:** abonelik/limit durumuna göre işi harness'lar arasında paslama — dispatch çekirdeği netleşmeden keskinleştirilemez.
- **GUI'nin mimari etkileri:** protokolün/iş mantığının arayüzden bağımsızlaşması gereği — v0 sonrası effort.
- **Eval seti:** Taskard'ın kendi kalitesini ölçen ev-eval paneli (aynı görev seti, farklı modeller/harness'lar) — çekirdek tasarım kararlarından sonra keskinleşir.
- **Workload panosu:** agent doluluk/kapasite görünümünün detayı — hafıza şemasıyla olgunlaşır.

## Out of scope

- **GitHub Issues senkronu / GUI zemini** — Emir kararı: şimdilik `.taskard/` local markdown; ileride ayrı effort.
- **Mem0 / harici memory servisi bağımlılığı** — Emir kararı: v0 dosya-tabanlı genel yapı; Mem0 unutuldu.
- **Superfast legacy parity** — Taskard Superfast'in evrimidir; birebir geriye dönük uyumluluk yükü taşımaz. Proje bazlı esneklik (CLAUDE.md/AGENTS.md direktifleriyle ek agent/skill tanımı) kapsam İÇİNDE — kurulum ticket'ında ele alınır.
