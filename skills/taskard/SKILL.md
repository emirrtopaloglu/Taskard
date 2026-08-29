---
name: taskard
description: Çoklu-harness agent orchestration konvansiyonu. Kullanıcı bir görevi Taskard akışıyla yürütmek istediğinde (spec → lane → delegate → gates), rol bazlı model seçimi gerektiğinde veya işleri adlandırılmış subagent'lara dağıtmak istediğinde kullan.
---

# Taskard

Argüman olarak verilen görevi Taskard akışıyla yürüt. Akış görev bitene kadar geçerli operasyon modudur.

## Sözlük

- **Ana döngü** — sen. Yalnızca akıl: görevi sınıflandırırsın, brief yazarsın, rol/model seçersin, delegate açarsın, rapora yargı verirsin. Elini işe sokmazsın: dosya düzenlemek, test koşmak, build hatası kovalamak delegate işidir; tek meşru hamle yeni delegate açmaktır.
- **Lane** — bir task'ın çalışma birimi: brief'i, çalışma notları ve raporu (`.taskard/lanes/<ts>-<slug>-<id>/`).
- **Delegate** — ADLANDIRILMIŞ subagent (implementer, reviewer, ui-developer, qa-tester, explorer, planner, debugger...). **İsimsiz agent yasak** — general-purpose'a görev verilmez; domain uzmanı yoksa en yakın rol adını kullan veya projeye yeni tanım ekle. Her tanımın **skill sözleşmesi** vardır.
- **Self-Priming Brief** — delegate'e verilen sözleşme; içinde **`## Context Files`** okuma listesi taşır. Token'ı uzun kod kopyalamaya değil, okunacak hedef dosya yollarına yatır.
- **Report** — delegate'in bitişte yazdığı ≤15 satır sıkı format: STATUS, DIFF_SUMMARY, EVIDENCE, HASH.

## Mod seçimi: 3 Kademeli Hız Şanzımanı

Ana agent akışın BAŞINDA görevi sınıflandırır. Varsayılan mod `config.toml` içindeki `default_mode` alanından okunur (varsayılan: **express**).

> **Oturum Override:** Kullanıcı *"bunu full yap"*, *"nano yap"*, *"express yap"* derse anında geçerli olur. Kullanıcı belirtmediyse Taskard görevin karmaşıklığına göre modu belirler:

| Mod | Süre Hedefi | Seremoni Düzeyi | Ne Zaman Seçilir? |
|---|---|---|---|
| ⚡ **NANO** | **< 2-3 dk** | **Sıfır Dosya:** `.taskard/` altına dosya yazılmaz (spec yok, task yok, lane klasörü yok). Tek bir `implementer` açılır, diff üretilir, ana döngü diff'i bağımsız doğrular ve sunar. Ayrı review subagent açılmaz. | Tek dosya, typo, stil/CSS düzeltmesi, tek satırlık hata düzeltmeleri. |
| 🚀 **EXPRESS (Varsayılan)** | **5-10 dk** | **Hafif Dokümantasyon:** Grilling ve Spec dosyası YOKTUR! Tek bir `.taskard/lanes/<ts>-<slug>-<id>/brief.md` açılır. Tek `implementer` + tek `reviewer` (mini-review) gate ile tamamlanır. | 2-4 dosyalık net özellikler, yeni bileşenler, küçük refactor'lar, endpoint ekleme. |
| 🏛️ **FULL (Graph)** | **15-30 dk** | **Tam Seremoni:** Grilling / Ürün Kararları Turu (`grill-with-docs`/`grill-me`) → Spec (`.taskard/context/specs/`) → Task'lar (`.taskard/tasks/`) → Paralel Lane DAG (Mermaid) → QA → Final Review. | Karmaşık mimari, ≥2 paralel bağımsız lane (git worktree), çoklu model/harness, kritik veri migration/auth. |

**Ratchet Kuralı (Yukarı Vites):** Nano veya Express çalışırken kapsam genleşirse (beklenmeyen bağımlılık, >4 dosya), akış derhal bir üst moda yükseltilir; asla gereksiz yere ağır modda başlanmaz.

## Disiplin router'ı (pull-based)

Akışın başında `using-superpowers` yüklüyse onunla başla — skill seçimini o yönetir. Yüklü değilse bu tablo routing'in tek kaynağıdır. **Her satır bir TETİK KOŞULUDUR: koşul yoksa skill yüklenmez** (tam liste + yoksa-ne-olur: `docs/dependencies.md`). Skill makinende yoksa akış DURMAZ — karşılık gelen davranışı kendi metninden uygula.

| Faz | Skill | Tetik |
|---|---|---|
| Akış başı | using-superpowers | her zaman (varsa) |
| Spec öncesi (Full) | brainstorming | yaratıcı/işlev ekleme işi |
| Hizalanma (Full) | grilling + domain-modeling | büyük/riskli görev |
| Ürün kararları turu | grill-with-docs (proje-bağlamlı) / grill-me (kavramsal) | Full mod spec kilidi öncesi |
| Sisli kapsam | wayfinder | iş >1 oturum (tracker = `.taskard/tasks/`) |
| Seam/mimari | codebase-design | arayüz şekli tartışmalıysa |
| Plan | writing-plans | Full tier plan dokümanı |
| Yürütme alt. | executing-plans | inline yürütme seçilirse |
| Delegate döngüsü | subagent-driven-development | Express/Full varsayılanı |
| Paralel lane'ler | dispatching-parallel-agents + using-git-worktrees | ≥2 bağımsız lane |
| Merge çakışması | resolving-merge-conflicts | worktree merge'inde çakışma |
| Gate 1 | requesting-code-review | yeni kod üreten her lane |
| Fix döngüsü | receiving-code-review | NEEDS_FIX sonrası fix delegate'inde |
| Blocker teşhisi | systematic-debugging | 2. başarısız denemede |
| Kanıt | verification-before-completion | her kapanışta |
| Bitiş menüsü | finishing-a-development-branch | yeşil suite sonrası |
| Bakım | improve-codebase-architecture | ayrı refactor-turu isteğinde |

## Demir Kurallar (Iron Laws)

1. **Config dosyaları çalışma anında ASLA değiştirilmez/değiştirtilmez.**
2. **Ana döngü asla kod yazmaz.**
3. **İsimsiz subagent yasaktır.**
4. **Başarı beyanı değil kanıt raporlanır.**
5. **2-Strike Kuralı (Circuit Breaker):** Bir lane'de en fazla 1 düzeltme turu yapılır; 2. başarısızlıkta akış DURUR ve derhal insana sorulur.
6. **Riskli işlemler (config `risky_operations`) kullanıcı onayı olmadan yapılmaz.**

## Okuma yetkileri

- **Ana döngü:** karar verisi olan ucuz, hedefli komutlar (git status/log/diff, grep, config okuma) + ön kabul doğrulaması için minimal dosya kontrolü.
- **Reviewer:** kodun kalite okuması (diff'i satır satır değerlendirmek, standartlara göre yargılamak). Ana döngü kalite yargısı için kod okumaz.
- **Ağır keşif / geniş arama:** explorer delegate'i (`haiku` modeliyle). Bulk içerik ana döngü penceresini yakmaz.

## Kurulum tarifi (proje başına bir kez)

`.taskard/` yoksa kur:

```bash
mkdir -p .taskard/{context/specs,context/decisions,lanes,tasks,handoff,memory,tmp}
```

Projenin CLAUDE.md / AGENTS.md'ine Taskard direktif bloğu yoksa ekle — **tek kaynak `~/.taskard/templates/directive-block.md` dosyasıdır**, içeriği marker'larıyla birlikte (`taskard:start` … `taskard:end`) aynen kopyala.

## Hafıza + Handoff

- **`memory/personal.md`:** main agent YALNIZCA kullanıcı açıkça tercih/bilgi beyan ederse yazar ("bunu hatırla", "ben hep böyle yaparım"). Oturum açılışında varsa okunur (≤100 satır).
- **`handoff/`:** oturum kapanırken bekleyen iş varsa veya uzun koşu öncesi kritik bağlam bırakılacaksa yazılır (`<ts>-<konu>.md`, zorunlu `rejected` alanı).
- **Oryantasyon zinciri:** Express'te doğrudan son brief/diff; Full'de `tasks/*.md` frontmatter → son lane raporları → personal.md → en yeni handoff.

## 1. Spec & Planlama (Yalnızca Full Mod)

Express ve Nano modlarında spec dosyası ve grilling ATLANIR.

Full modda: Görev büyük/riskliyse grilling yap (`grill-with-docs` / `grill-me`). Spec'i `.taskard/context/specs/<slug>.md` altına yaz. Spec'ten task çıkar → `.taskard/tasks/T-NNN-slug.md`.

**Ürün kararları turu (Full modda spec kilitlemeden önce ZORUNLU):** Mevcut implementasyon ile hedef davranış arasındaki tüm farkları tek tek kullanıcıya sor. Varsayılan parity varsayımı yasaktır.

## 2. Paralel Lane Disiplini (Graph / Full Mod)

İki veya daha fazla bağımsız lane AYNI ANDA koşacaksa her lane kendi **git worktree**'inde çalışır (`using-git-worktrees` deseni): worktree başına tek delegate, alan bazlı commit. Sıralı tek lane ise ana checkout yeterlidir.

## 3. Self-Priming Brief & Delegate

Her lane için:
1. **Ön kabul doğrulaması:** görevin dayandığı iddiaları brief yazmadan DOĞRULA (`ls`/`grep`). İddia yanlışsa uydurma, kullanıcıya sor.
2. **Self-Priming Brief hazırla:** `.taskard/lanes/<ts>-<slug>-<id>/brief.md` doldur (lane ID sonuna 4 karakterlik rastgele suffix ekle: örn. `-a3f2`).
   * **`## Context Files` (ZORUNLU):** Delegenin ilk adımda okuyacağı yollar — (a) 2-4 kritik kod dosyası, (b) bu lane'in bağlı olduğu **önceki lane raporlarının** ve ilgili **karar/spec dosyalarının** yolları. Ana döngü önceki lane'i brief'te nesirle ANLATMAZ, yolunu verir: özetin özeti bilgi kaybeder, işaretçi kaybetmez. Brief'e uzun kod veya önceki iş anlatısı kopyalanmaz.
   * **Bütçe & Disiplinler:** `Bütçe: max 1 retry (2-Strike)` · `Disiplinler: TDD zorunlu · verification-before-completion`.
   * **Kabul Kriterleri & Kapsam Dışı:** Net kanıtlanabilir maddeler.
3. **Model Seçimi (Katmanlı Tiering):**
   * **Tier 1 (Ağır Beyinler):** `planner = "opus"`, `debugger = "opus"`, `reviewer = "opus"`
   * **Tier 2 (Hızlı İşçiler):** `implementer = "sonnet"`, `ui-developer = "sonnet"`
   * **Tier 3 (Işık Hızında):** `explorer = "haiku"`, `qa-tester = "haiku"` — *model adları harness'a göre değişir; Tier 3 = o harness'ta karşılığı olan en ucuz/hızlı model.*
   * `config.toml` `[roles]` tablosu okunur; session'da söylenen sözler (`"bu implementer'da opus kullan"`) override eder.
   * **Öncelik sırası:** frontmatter varsayılan < config.toml < oturumda söylenen söz.
4. **Native Subagent Aç:** Rol tanımı ve modelle subagent başlat.
5. **Raporu Oku (Sıkı Format):** `report.md` okunur (≤15 satır):
   ```
   STATUS: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
   DIFF_SUMMARY: Değişen dosyalar (+X, -Y)
   EVIDENCE: Koşan test/komut ve sonucu
   HASH: commit-hash (varsa)
   ```

   > **Rapor kapısı (ana döngü doğrular):** Dört alan (`STATUS`, `DIFF_SUMMARY`, `EVIDENCE`, `HASH`) prefix'iyle ve bu sırayla yoksa rapor KABUL EDİLMEZ. Ana döngü delegate'e tek satırlık *"raporu sözleşme formatında yeniden yaz"* turu döner; bu tur 2-Strike sayacına yazılmaz (iş değil, format hatasıdır). `HASH` yalnızca commit oluşmadıysa boş bırakılabilir. Deterministik doğrulama runtime'da değil ana döngüdedir — bu yüzden kapı atlanamaz.

## 4. 2-Strike Hızlı Müdahale ve Çevik Eskalasyon (Circuit Breaker)

Delege takıldığında veya hata aldığında sonsuz düzeltme turuna GİRİLMEZ:

* **1. Hata (Strike 1):** Tek bir net düzeltme talimatı verilir; taze bir implementer delegate'i açılır.
* **2. Hata (Strike 2):** Akış DERHAL DURUR. Ana döngü *"Tamam, ben bunu yapamadım, artık insana sorayım"* der ve kullanıcıya 3 net seçenek sunar:
  1. **Teknik Netleştirme:** *"Şu dosyadaki X hatasında takıldım. Doğru fonksiyon imzasını/yolunu belirtir misin?"*
  2. **Alternatif Yol:** *"Bu gereksinimi atlayıp alternatif yaklaşımla devam edelim mi?"*
  3. **Kontrolü Devret:** *"Burada dur, kontrolü devral."*

## 5. Kalite Kapıları (Gates) & QA Yapılandırması

* **Nano Mod:** Ayrı review subagent açılmaz; ana döngü diff'i doğrular.
* **Express Mod:** Tek scoped `reviewer` (mini-review, ≤5 satır bulgu, standartlar + diff kontrolü). Bu ayrı bir rol DEĞİLDİR — `reviewer` rolünün scoped (mini-review) koşumudur, Tier 3 modeliyle açılır.
* **Full Mod:**
  1. `reviewer` gate (standartlar + spec uyumu).
  2. `qa-tester` gate (harici-etkili işlerde).
  3. Merge öncesi son bütünsel `final review` (tüm diff).

### QA Rolü ve Headless Entegrasyonu (`[qa]` tablosu)
* `config.toml` içindeki `[qa].enabled = false` (varsayılan KAPALI) iken; QA adımı yalnızca kritik harici-etkili işlerde hafif statik analiz yapar veya atlanır.
* `[qa].enabled = true` yapıldığında veya oturumda kullanıcı *"QA tarayıcıda doğrulasın"* dediğinde; `qa-tester` headless araçları (`agent-browser`, `playwright-cli`, test suite) çalıştırır ve kanıtlı `verification.md` üretir.

## 6. Canlı Doğrulama + Kapanış

* **Açıklayıcı Telegraf (Humanish İletişim):** Her önemli adımda tek cümle: ne yapıldı, neden, ne bekleniyor. Durum token'ları sohbete taşınmaz.
* **"Senin test etmen gerekenler":** Kapanışta günlük dille maddelenmiş manuel test kontrol listesi sunulur.
* **Karar Kullanıcıda:** Merge kararı ve canlı test onayı her zaman kullanıcıya aittir.

## Ek A — Cross-Harness Başlatma

Native subagent her zaman birincildir. Headless gerekirse:
- **Claude:** `claude -p "$(cat brief.md)" --model sonnet --permission-mode bypassPermissions`
- **Codex:** `codex exec -s danger-full-access --skip-git-repo-check "$(cat brief.md)"`
- **OpenCode:** `opencode run -m <provider/model> "$(cat brief.md)"`
- **Antigravity:** `agy -p "<prompt>" --output-format json`

