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

Taskard v0: "Taskard'ı yükle" deyince `install.sh` ile kurulan, üç harness'ta (Claude Code, Codex, OpenCode) aynı şekilde çalışan skill/agent paketi — Superfast'in evrimi. Main agent (pahalı akıl) fikri grill'ler, spec yazar, lane'lere böler; sub-agent'lar (ucuz el) kendi worktree'lerinde TDD ile uygular; insan üç kapıda onay verir (plan onayı, merge öncesi canlı doğrulama, riskli işlem statik listesi). Ana döngü hiç kod yazmaz; model seçimi config tablosu + session override ile kullanıcıdadır; dört hafıza katmanı `.taskard/` içinde TAM şemayla taşınır. **Kabul:** Emir sistemi kendi gerçek işinde, kendi yöntemleriyle uçtan uca kullanır ve "bitti" der — pilot feature önceden sabitlenmez.

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
- **Pilot/kabul:** Emir'in seçeceği gerçek işte dogfooding; kabul kararını Emir verir (bkz. Destination).
- **v0 kapsam kararı (2026-08-23):** üç harness dispatch · dört katman tam şema · üç onay kapısı · install.sh — detay: [v0 Kapsam Manifestosu](issues/01-v0-kapsam-manifestosu.md)
- Bu haritada plan-don't-do override'ı YOK: ticket'lar karar çözer; harita bitince `/to-spec` ile collapse edilir.
- Tracker: local markdown (`.scratch/taskard/issues/`). Ticket claim = frontmatter'da `assignee` doldurmak.

## Decisions so far

- [v0 Kapsam Manifestosu](issues/01-v0-kapsam-manifestosu.md) — v0'ın teslimatı sistemin kendisi; üç harness dispatch (CC+Codex+OpenCode); dört katman tam şema; üç onay kapısı; install.sh; kabul testi Emir'in dogfooding'i.
- [Dispatch Soyutlaması Tasarımı](issues/05-dispatch-soyutlamasi.md) — düz JS ESM sıfır bağımlılık; adapter-per-harness; fail-fast model hatası; watchdog 20dk + max 2 deneme (config.toml'dan); ≤15 satır damıtma sözleşmesi.
- [`.taskard/` Klasör Şeması](issues/06-taskard-semasi.md) — şema onaylandı; config **TOML** (mini gömülü parser); T-001-slug ID; tek bounded personal.md; global `~/.taskard/` + miras zinciri.
- [Headless Dispatch Envanteri (Harness Karşılaştırması)](issues/02-r1-headless-dispatch-envanteri.md) — altı harness'ta headless mümkün; ortak `-p/exec/run + JSON + model bayrağı` kalbı kuruldu; Gemini CLI EOL → Antigravity (`agy`); Cursor en kırılgan adapter; timeout/watchdog Taskard'ın sorumluluğu.
- [Cross-Harness Skill Portability Desenleri](issues/03-r2-skill-portability.md) — SKILL.md açık standart 5 harness'ta çalışıyor; `.agents/skills/` ortak dizin + Claude Code symlink; hibrit dağıtım: paralel manifestler (superpowers tarzı) + `npx taskard init`.
- [Dosya-Tabanlı Hafıza Formatları ve Taşıma Protokolü](issues/04-r3-hafiza-formatlari.md) — paylaşılan dosya sistemi = ortak beyin; ~50x damıtma + bounded index; append-only + content-hash ID + TTL'li claim; sentez: ledger.jsonl omurga + task dosyası ergonomisi + INDEX ekonomisi.

## Not yet specified

- **Limit-farkındalıklı yönlendirme:** abonelik/limit durumuna göre işi harness'lar arasında paslama — dispatch çekirdeği netleşmeden keskinleştirilemez.
- **GUI'nin mimari etkileri:** protokolün/iş mantığının arayüzden bağımsızlaşması gereği — v0 sonrası effort.
- **Eval seti:** Taskard'ın kendi kalitesini ölçen ev-eval paneli (aynı görev seti, farklı modeller/harness'lar) — çekirdek tasarım kararlarından sonra keskinleşir.
- **Workload panosu:** agent doluluk/kapasite görünümünün detayı — hafıza şemasıyla olgunlaşır.

## Out of scope

- **GitHub Issues senkronu / GUI zemini** — Emir kararı: şimdilik `.taskard/` local markdown; ileride ayrı effort.
- **Mem0 / harici memory servisi bağımlılığı** — Emir kararı: v0 dosya-tabanlı genel yapı; Mem0 unutuldu.
- **Superfast legacy parity** — Taskard Superfast'in evrimidir; birebir geriye dönük uyumluluk yükü taşımaz. Proje bazlı esneklik (CLAUDE.md/AGENTS.md direktifleriyle ek agent/skill tanımı) kapsam İÇİNDE — kurulum ticket'ında ele alınır.
