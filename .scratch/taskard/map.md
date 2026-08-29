---
title: Taskard — Wayfinder Haritası
created: 2026-08-23
modified: 2026-08-29
type: wayfinder-map
status: 🟢 active
tags: [wayfinder, taskard, orchestration]
---

# Taskard — Çoklu-Harness Agent Orchestration Paketi (v0)

## Destination

Taskard v0: **kod içermeyen konvansiyon paketi.** "Taskard'ı yükle" = dosya yerleştirme (skill + adlandırılmış agent tanımları + CLAUDE.md/AGENTS.md'e statik direktifler). Delegasyon harness'ların KENDİ subagent mekanizmasıyla; her delegate rol adıyla açılır (implementer, reviewer, frontend-developer...), isimsiz agent yasak. Main agent (pahalı akıl) grill'ler, spec yazar, lane'lere böler, yargı verir; eli işe sokulmaz. Dört hafıza katmanı `.taskard/` markdown konvansiyonunda taşınır. `config.toml` kod tarafından değil AGENT tarafından okunan veridir (roller, izin modu, riskli işlem listesi). Cross-harness ihtiyaçları skill içindeki bash tarifleriyle karşılanır. Worker varsayılan bypassPermissions başlar; insan onayı üç iş akışı kapısında (plan onayı, merge öncesi doğrulama, riskli işlem listesi). Kabul: Emir'in dogfooding'i — "bitti" der.

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

- **SKILL.state aşısı & doktrin sertleştirme (2026-08-29):** arXiv:2608.26263 (SKILL.state) karşısında denetim. **Makalenin `state.json` reçetesi REDDEDİLDİ** — doğrulayıcısız JSON, süslü parantezli Markdown'dır; determinizm formattan değil runtime doğrulamadan gelir, o da AGENTS.md kural 2'ye (pakette kod yok) çarpar. Teşhis düzeltildi: `report.md`'deki kayıp *telafi edilebilir* (git diff + hash + test komutu ayakta), makalenin failure mode'u değil; gerçek kayıp **ileri yöndeki brief zincirinde** ve derinleşen özet-özeti sarmalındadır. Cevap: nesir yerine işaretçi. Uygulanan 6 madde: (1) `lanes/` kurulum tarifine eklendi. (2) Tier 3 `flash`→`haiku` — birincil harness'ta adreslenebilir model + "model adı harness'a göre değişir" notu. (3) `mini-reviewer` silindi (tanımsız rol → Demir Kural 3 ihlali); Express review = `reviewer`'ın scoped koşumu, daralan KAPSAM'dır model değil. (4) **Rapor kapısı**: dört alan prefix'iyle ve sırayla yoksa rapor kabul edilmez; format turu 2-Strike sayacına yazılmaz; kapsamı iş üreten roller (implementer/ui-developer/debugger), kapı ve keşif rolleri kendi sözleşmelerine tabi. (5) 7 agent tanımına `model:` frontmatter'ı + dört kademeli öncelik zinciri (frontmatter < global config < proje config < oturum). (6) `## Context Files` genişletildi: kod dosyaları + bağlı olunan önceki lane raporları ve karar dosyaları; Nano istisnası yazıldı. Gerekçe kanıtı: denetim anında 7 lane raporunun 0'ı sözleşmeye uyuyordu — sözleşme vardı, kapısı yoktu. **Supersedes:** 2026-08-27 kaydının (4) Tier 3 "Flash/Haiku (… Mini-Reviewer)" ifadesi. Emir onayı; lane `t1741-skillstate-asisi-b7d1` (commit `e36f897` + fix `12776fe`, reviewer kapısı PASS_WITH_NOTES → 6 bulgu düzeltildi).
- **Not (git hijyeni, 2026-08-29):** `e36f897` yalnızca yukarıdaki 6 maddeyi DEĞİL, oturum öncesinden gelen commit'lenmemiş WIP'i de (install.sh banner/renk paleti, agents/*.md renk-senkron) içerir — brief kapsamı kirli ağaçla örtüştüğü ve worktree izolasyonu kullanılmadığı için. Ders: kirli ağaçta lane açarken ya worktree izolasyonu ya da brief'te açık "yalnızca şu satırları stage et" talimatı gerekir. Fix turu (`12776fe`) temiz koştu.
- **7 Temel İyileştirme & Hız Şanzımanı (2026-08-27):** (1) Self-priming brief standardı (`## Context Files` okuma listesi ile bilgi kaybı ve telefon kulübesi darboğazı kesildi). (2) 3 Kademeli Hız Şanzımanı: Nano (<3 dk, sıfır dosya, tek implementer), Express (5-10 dk, varsayılan, spec'siz tek brief + tek review), Full (15-30 dk, tam seremoni + DAG + QA + Final Review). Oturum override'ı serbest. (3) 2-Strike Circuit Breaker: 1 retry sonrası 2. hatada durup kullanıcıya 3 net seçenekle eskalasyon. (4) Katmanlı Model Tiering: Tier 1 Opus/o1 (Planner, Debugger, Reviewer), Tier 2 Sonnet (Implementer, UI), Tier 3 Flash/Haiku (Explorer, QA, Mini-Reviewer). (5) Yapılandırılabilir QA (`[qa]` tablosu varsayılan kapalı; headless test/browser kontrolü). (6) Prompt caching dostu sıkı raporlama (≤15 satır). (7) JIT rol tanımları ve defansif kural temizliği. Emir onayı.
- **Deck kaldırıldı & Saf Konvansiyon (2026-08-27):** `apps/deck` tamamen silindi; repo %100 kodsuz saf konvansiyon paketine geri döndü (skills/, agents/, templates/). `install.sh` sadeleştirildi, Deck kırıntıları temizlendi. Emir kararı.
- **Bakım turu (2026-08-26, analiz sonrası):** (1) qa-tester §4'e resmî kapı olarak bağlandı — harici-etkili iş tanımıyla (API/migration/auth/ödeme/veri; şüphede var say); mikro istisna güncellendi. (2) install.sh sync_block versiyon tuzağı hash karşılaştırmasıyla bitirildi — aynı sürüm içi içerik değişimi artık yayılır. (3) SKILL.md'deki gömülü proje-kurulum bloğu silinip tek kaynak olarak templates/directive-block.md'e pointer verildi. (4) `explore-research` ölü adı → explorer. (5) `.taskard/` gitignore'a alındı — runtime state repo içeriği değil (OSS v0.5 temizliği de kolaylaşır); dogfooding bilgisi Build-Log'ta yaşıyor. (6) evals/05-agent-roloji.md — 7 rolün mikro-senaryoları yazıldı, ilk koşu bekliyor.
- **PIVOT (2026-08-23 akşam):** Node runtime kaldırıldı — saf konvansiyon paketi. Gerekçe: ilk gerçek koşu native subagent'ın üstünlüğü + runtime'ın ürettiği izin duvarı/config mutasyonu/verbose çıktı gösterdi. Ticket [Dispatch Soyutlaması](issues/05-dispatch-soyutlamasi.md) superseded.
- [Model Yönlendirme Config'i](issues/07-model-config.md) — config.toml agent-okur veridir (kod parse etmez); rol→model tablosu + doğal dil session override; permission_mode default bypassPermissions.
- [Onay Kanalı Tasarımı](issues/08-onay-kanali.md) — üç kapı iş akışı düzeyinde kalır (plan onayı, merge öncesi doğrulama, riskli işlem listesi); tool izni varsayılan açıktır; config çalışma anında asla değiştirilmez (iron law).
- [Kurulum ve Dağıtım](issues/09-kurulum-dagitim.md) — install.sh: skill+agent symlink + global config şablonu + CLAUDE.md'e statik direktif bloğu; proje kurulum tarifleri skill içinde; proje bazlı esneklik CLAUDE.md/AGENTS.md direktifleriyle.
- **Sis çözüldü (2026-08-23):** worktree-per-lane → §2b Paralel lane disiplini · workload panosu → INDEX.md tablo bakımı · limit yönlendirmesi → Ek A + `[harness_preferences]` · eval seti → `evals/` (3 senaryo). Okuma yetkileri doktrine girdi (ana döngü=karar verisi, kalite=reviewer, keşif=delegate).
- [Koşu Sırasında İnsan Deneyimi](issues/10-insan-deneyimi-prototipi.md) — final: **açıklayıcı telegraf** (ana agent sesiyle tek cümlelik olay akışı; melez denendi, Emir geri aldı). SKILL.md §5 Koşu anlatımı. Prototip: `prototypes/insan-deneyimi.html`. **TÜM TICKET'LAR KAPALI.**

- [v0 Kapsam Manifestosu](issues/01-v0-kapsam-manifestosu.md) — v0'ın teslimatı sistemin kendisi; üç harness dispatch (CC+Codex+OpenCode); dört katman tam şema; üç onay kapısı; install.sh; kabul testi Emir'in dogfooding'i.
- [Dispatch Soyutlaması Tasarımı](issues/05-dispatch-soyutlamasi.md) — düz JS ESM sıfır bağımlılık; adapter-per-harness; fail-fast model hatası; watchdog 20dk + max 2 deneme (config.toml'dan); ≤15 satır damıtma sözleşmesi.
- [`.taskard/` Klasör Şeması](issues/06-taskard-semasi.md) — şema onaylandı; config **TOML** (mini gömülü parser); T-001-slug ID; tek bounded personal.md; global `~/.taskard/` + miras zinciri.
- [Headless Dispatch Envanteri (Harness Karşılaştırması)](issues/02-r1-headless-dispatch-envanteri.md) — altı harness'ta headless mümkün; ortak `-p/exec/run + JSON + model bayrağı` kalbı kuruldu; Gemini CLI EOL → Antigravity (`agy`); Cursor en kırılgan adapter; timeout/watchdog Taskard'ın sorumluluğu.
- [Cross-Harness Skill Portability Desenleri](issues/03-r2-skill-portability.md) — SKILL.md açık standart 5 harness'ta çalışıyor; `.agents/skills/` ortak dizin + Claude Code symlink; hibrit dağıtım: paralel manifestler (superpowers tarzı) + `npx taskard init`.
- [Dosya-Tabanlı Hafıza Formatları ve Taşıma Protokolü](issues/04-r3-hafiza-formatlari.md) — paylaşılan dosya sistemi = ortak beyin; ~50x damıtma + bounded index; append-only + content-hash ID + TTL'li claim; sentez: ledger.jsonl omurga + task dosyası ergonomisi + INDEX ekonomisi.

## Not yet specified

<!-- boş — tüm sis öğeleri çözüldü:
- worktree-per-lane → SKILL.md §2b Paralel lane disiplini (2026-08-23)
- workload panosu → SKILL.md §2 INDEX.md tablo bakımı (2026-08-23)
- limit yönlendirmesi → SKILL.md Ek A + config [harness_preferences] (2026-08-23)
- eval seti → evals/ (3 senaryo, 2026-08-23) -->

## Out of scope

- **GitHub Issues senkronu / GUI zemini** — kontrol modu / tam GUI ileride ayrı effort (v0 saf CLI/konvansiyon).
- **Mem0 / harici memory servisi bağımlılığı** — Emir kararı: v0 dosya-tabanlı genel yapı; Mem0 unutuldu.
- **Superfast legacy parity** — Taskard Superfast'in evrimidir; birebir geriye dönük uyumluluk yükü taşımaz. Proje bazlı esneklik (CLAUDE.md/AGENTS.md direktifleriyle ek agent/skill tanımı) kapsam İÇİNDE.
- **Test projeleri ürün kimliğine yazılmaz** — Emir kuralı: dogfooding yapılan projelerin adları README/map/skill'de geçmez (2026-08-23).
