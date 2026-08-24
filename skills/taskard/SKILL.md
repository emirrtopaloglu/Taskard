---
name: taskard
description: Çoklu-harness agent orchestration konvansiyonu. Kullanıcı bir görevi Taskard akışıyla yürütmek istediğinde (spec → lane → delegate → gates), rol bazlı model seçimi gerektiğinde veya işleri adlandırılmış subagent'lara dağıtmak istediğinde kullan.
---

# Taskard

Argüman olarak verilen görevi Taskard akışıyla yürüt. Akış görev bitene kadar geçerli operasyon modudur.

## Sözlük

- **Ana döngü** — sen. Yalnızca akıl: spec yazarsın, lane bölersin, rol/model seçersin, delegate açarsın, rapora yargı verirsin. Elini işe sokmazsın: dosya düzenlemek, test koşmak, build hatası kovalamak delegate işidir; tek meşru hamle yeni delegate açmaktır.
- **Lane** — bir task'ın çalışma birimi: brief'i, çalışma notları ve raporu (`.taskard/lanes/<ts>-<slug>/`).
- **Delegate** — ADLANDIRILMIŞ subagent (implementer, reviewer, frontend-developer...). **İsimsiz agent yasak** — general-purpose'a görev verilmez; domain uzmanı yoksa en yakın rol adını kullan veya projeye yeni tanım ekle.
- **Brief** — delegate'e verilen spec; lane'in kalitesi brief'in kalitesiyle sınırlıdır; token'ı brief'e yatır.
- **Report** — delegate'in bitişte yazdığı ≤15 satır: DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT + kanıt.

## Mod seçimi: önce Loop, gerektiğinde Graph

Ana agent akışın BAŞINDA görevi sınıflandırır — bu sınıflandırma bedavadır ve hangi disiplinlerin yükleneceğini belirler. Seçilmeyen modun skill'i hiç yüklenmez.

- 🔁 **LOOP MODU (varsayılan):** tek iş, net bitiş çizgisi, retry ucuz.
  - *Mikro iş:* tek adım, ~10 dk (review+commit, tek dosya düzeltme). Spec VE tasks dosyası YAZILMAZ — kullanıcı isteği + kabul kriterleri tek brief.md'e işlenir; `.taskard/`'a dokunan tek dosya brief'tir. **Tavanlar:** brief ≤20 satır · explore agent AÇILMAZ (ana döngü hedefli okuma yapar: grep / 2-3 read) · review = scoped mini-review (sadece diff + kabul kriterleri, bulgu ≤5 satır). >3 dosya veya yabancı alt sistem çıkarsa standart tier'a yüksel.
  - *Standart iş:* sıralı lane'li tam seremoni (grilling → spec → tasks → lane'ler → gate'ler) ama paralellik ve çoklu kapı yokken hâlâ loop'tur.
- 🕸️ **GRAPH MODU** — aşağıdaki koşullardan **≥2**'si varsa: gerçek paralellik (≥2 bağımsız lane aynı anda) · node başına farklı model/harness · çoklu insan onay kapısı · izole failure recovery ihtiyacı · iş >1 oturum (wayfinder). Graph modunda ek olarak: bağımlılık grafiği **mermaid olarak görünür kılınır** (kullanıcıya gösterilir veya specs klasörüne yazılır), worktree fan-out, node başına bütçe cap'i, canlı workload panosu.

Kurallar: **ratchet yukarı** — loop çalışırken kapsam genleşirse (chore → geliştirme gibi) modu yeniden değerlendir, gerekirse graph'a çık; graph gereksiz yere BAŞLANMAZ; şüphede ağır olanı seç. Brief kullanıcının görev metnini birebir KOPYALAMAZ — delegate'in çalışması için gereken kesin talimatı taşır.

## Disiplin router'ı (pull-based)

Akışın başında `using-superpowers` yüklüyse onunla başla — skill seçimini o yönetir. Yüklü değilse bu tablo routing'in tek kaynağıdır. **Her satır bir TETİK KOŞULUDUR: koşul yoksa skill yüklenmez** (tam liste + yoksa-ne-olur: `docs/dependencies.md`). Skill makinende yoksa akış DURMAZ — karşılık gelen davranışı kendi metninden uygula.

| Faz | Skill | Tetik |
|---|---|---|
| Akış başı | using-superpowers | her zaman (varsa) |
| Spec öncesi | brainstorming | yaratıcı/işlev ekleme işi |
| Hizalanma | grilling + domain-modeling | büyük/riskli görev |
| Ürün kararları turu | grill-with-docs (proje-bağlamlı) / grill-me (kavramsal) | standart tier spec kilidi öncesi |
| Sisli kapsam | wayfinder | iş >1 oturum (tracker = `.taskard/tasks/`) |
| Seam/mimari | codebase-design | arayüz şekli tartışmalıysa |
| Plan | writing-plans | standart tier plan dokümanı |
| Yürütme alt. | executing-plans | inline yürütme seçilirse |
| Delegate döngüsü | subagent-driven-development | standart tier varsayılanı |
| Paralel lane'ler | dispatching-parallel-agents + using-git-worktrees | ≥2 bağımsız lane |
| Merge çakışması | resolving-merge-conflicts | worktree merge'inde çakışma |
| Gate 1 | requesting-code-review | yeni kod üreten her lane |
| Fix döngüsü | receiving-code-review | NEEDS_FIX sonrası fix delegate'inde |
| Blocker teşhisi | systematic-debugging | 2. başarısız denemede |
| Kanıt | verification-before-completion | her kapanışta |
| Bitiş menüsü | finishing-a-development-branch | yeşil suite sonrası |
| Bakım | improve-codebase-architecture | ayrı refactor-turu isteğinde |

## Iron Laws

1. Config dosyaları çalışma anında ASLA değiştirilmez/değiştirtilmez.
2. Ana döngü asla kod yazmaz.
3. İsimsiz subagent yasaktır.
4. Başarı beyanı değil kanıt raporlanır ("left per YAGNI" de bir claim'dir).
5. Riskli işlemler (config `risky_operations`) kullanıcı onayısız yapılmaz.

## Okuma yetkileri

- **Ana döngü:** karar verisi olan ucuz, hedefli komutlar (git status/log/diff, grep, config okuma) + ön kabul doğrulaması için minimal dosya kontrolü. Bu yetki devredilemez — brief'i ve kullanıcı raporunu yazan odur.
- **Reviewer:** kodun kalite okuması (diff'i satır satır değerlendirmek, standartlara göre yargılamak). Ana döngü kalite yargısı için kod okumaz.
- **Ağır keşif / geniş arama:** explore-research delegate'i. Bulk içerik ana döngü penceresini yakmaz.

## Kurulum tarifi (proje başına bir kez)

`.taskard/` yoksa kur:

```bash
mkdir -p .taskard/{context/specs,context/decisions,tasks,handoff,memory,tmp}
```

Projenin CLAUDE.md / AGENTS.md'ine Taskard direktif bloğu yoksa ekle:

```markdown
<!-- taskard:start -->
## Taskard
- Rol/model seçimi için ~/.taskard/config.toml (global) ve .taskard/config.toml (proje) okunur; kullanıcının doğal dil override'ı her ikisini geçer.
- Subagent'lar yalnızca adlandırılmış rollerle açılır.
- Worker varsayılan bypassPermissions ile çalışır; insan onayı üç kapıda: plan onayı, merge öncesi doğrulama, risky_operations listesi.
<!-- taskard:end -->
```

## 1. Spec

Proje kökünde `.taskard/` yoksa önce kurulum tarifi (aşağıda) uygulanır.

Görev küçük ve iyi tanımlıysa kompakt spec yaz; büyük/riskliyse grilling yap (design tree, frontier tur tur, önerilen cevaplı sorular). Spec'i `.taskard/context/specs/<slug>.md` altına yaz.

**Ürün kararları turu (standart tier'da spec kilitlemeden önce ZORUNLU):** mevcut implementasyon ile hedef davranış arasındaki TÜM görünür farkları listele — eksik aksiyonlar, izin kontrolleri, legacy'de olup yenide olmayan davranışlar, edge case'ler — ve HER BİRİNİ kullanıcıya tek tek sor. Varsayılan parity varsayımı YASAKTIR: "legacy'de vardı, ben de ekledim" ya da "yok saydım" kararı kullanıcının oyu olmadan alınamaz. Bu turda soru cömerttir — **daha fazla soru = daha az halüsinasyon = daha tutarlı kod.**

Bu turu kendi başına değil, interview skill'iyle yürüt: proje-bağlamlı işte **`grill-with-docs`** (terimler `.taskard/context/CONTEXT.md`'e, geri dönülemez kararlarsa `.taskard/context/decisions/` altına ADR düşer); repo-dışı/kavramsal görevde **`grill-me`**. İkisi de yoksa `grilling` ile devam et — hiçbiri soru cömertliğini kısmaz.

## 2. Task listesi

Spec'ten task çıkar → `.taskard/tasks/T-NNN-slug.md` (frontmatter: status/blocked_by/assignee). Bağımsızlar paralel, bağımlılar sıralı.

**Oryantasyon kuralı:** yeni oturumda yönlenme = `.taskard/tasks/*.md` frontmatter'ları + son lane raporları okunarak yapılır. Canlı durum bildirimi insan çıktısıdır (Humanish telegraf) — ayrıca dosyaya tablo tutulmaz.

## 2b. Paralel lane disiplini

İki veya daha fazla bağımsız lane AYNI ANDA koşacaksa her lane kendi **git worktree**'inde çalışır (`using-git-worktrees` deseni): worktree başına tek delegate, alan bazlı commit. Tek lane ise ana checkout yeterli. Paralel biten lane'ler merge edilmeden önce ana döngü çakışma kontrolü yapar; merge sırası ve kararı kullanıcıdadır.

## 3. Lane + delegate

Her task için:
1. **Ön kabul doğrulaması:** görevin dayandığı iddiaları brief yazmadan DOĞRULA (dosya gerçekten var mı, diff gerçekten var mı, kod gerçekten orada mı). İddia yanlışsa uydurma yoluna girme — kullanıcıya sun, kararı ondan al.
2. `.taskard/lanes/<ts>-<slug>-<suffix>/` altında brief.md doldur — **lane ID sonuna 4 karakterlik rastgele suffix ekle** (örn. `-a3f2`): aynı saniye+slug çakışması overwrite riskini keser (saha provasında kanıtlandı). Brief içeriği: bağlam + sıralı adımlar + kabul kriterleri + kapsam dışı + commit mesajı varsa birebir. Brief header'ına **bütçe** yaz: `max_deneme` (config default'u) + varsa zaman/token tavanı; **Disiplinler satırı ZORUNLU** (örn. "Disiplinler: TDD zorunlu · verification-before-completion kanıt kuralı") — sub-agent'lar using-superpowers'ı görmez, disiplinler ancak brief'ten taşınır. Graph modunda DAG'i mermaid olarak ekle. **Olumsuz iddia kuralı:** brief'e "X yok / Y yapılmadı" yazmadan önce TEK komutla doğrula (`ls`/`grep`); doğrulayamıyorsan koşullu yaz (*"test dosyası görünmüyorsa oluştur"*) — keşif özetindeki olumsuz iddialar ham halde brief'e taşınmaz.
3. Config'ten rol→model oku (`~/.taskard/config.toml`, proje override'u, sonra kullanıcının bu session'daki sözleri).
4. **Native subagent** aç: rolün adlandırılmış tanımıyla, config'teki modelle. Claude Code'da Agent tool + agent adı; başka harness'taysan o harness'ın native mekanizması.
5. Report'u oku — **mesaj = pointer, dosya = payload:** dönüş mesajı yarım/eksik geldiyse önce `report.md`'i oku; doluysa ekstra bekleme turu AÇMA. BLOCKED ise aynı lane'de en fazla 2 deneme; üçüncüsünde teşhis topla, kullanıcıya raporla, bağımsız sonraki lane'e geç.

Fix protokolü: düzeltme HER ZAMAN yeni delegate ile. Sonrasında en az bağımsız kanıt kontrolü zorunlu (tsc/lint/test); Critical/Important bulgularda scoped re-review yapılır (yalnızca finding karşılandı mı bakılır). Push EDİLMEMİŞ lane commit'i amend edilebilir; push edilmiş commit'e asla dokunulmaz.

## 4. Gate'ler

Yeni kod üreten lane'lerde iki kapı, ikisi de TAZE reviewer subagent'ta (implementer'la aynı context'te asla):
1. Code review (standartlar + spec uyumu)
2. Merge öncesi son kontrol

**Mikro lane istisnası:** küçük diff'li mikro işlerde iki gate yerine TEK scoped mini-review — reviewer sadece diff + kabul kriterlerine bakar, bulgusu ≤5 satır. Bağımsızlık korunur, gramaj düşer.

Bulgu varsa düzeltme yeni implementer delegate'iyle, aynı lane'de.

Yeni kod ÜRETMEYEN lane'lerde (doğrulama, commit-only, inceleme) reviewer gate atlanır — yerine ana döngünün bağımsız kanıt kontrolü geçer (git log/diff/status ile delegate iddiasının doğrulanması). Bu istisna raporda belirtilir.

## 5. Final Review (merge öncesi son kapı)

Standart ve graph tier'da, TÜM lane'ler kendi gate'lerinden geçtikten sonra merge öncesi **bir kez** final review yapılır:

- Taze reviewer subagent + config'teki en yetkin model (reviewer rolü)
- Kapsam: merge-base'den TÜM diff — lane lane değil, işin BÜTÜNÜ (lane'ler arası etkileşim, entegrasyon noktaları, kapsam dışı sızıntı)
- Bulgu varsa TEK fix wave'i: bulgular tek implementer delegate'ine verilir; ikinci dalga yok — kalan bulgular kullanıcıya dürüstçe raporlanır
- Mikro tier'da ayrı final review YOK (tek lane'in kendi gate'i yeterli)

## 6. Canlı doğrulama + kapanış

Gate'leri geçen lane'i kullanıcıya sun; merge kararı HER ZAMAN kullanıcının. **Onay isteklerinde hangi proje olduğu her zaman belirtilir** (örn. "[spechy-lite-react] merge onayı bekliyor") — çoklu-proje koşuda karışmayı önler. Kapanışta kapanış raporu + her task sonuna tek satır durum: `Yapıldı · Sonraki · Engel`.

**Canlı doğrulama:** varsayılan olarak SUNULUR, yapılmaz — *"istersen tarayıcıda uçtan uca koşarım"* teklifi kapanışta yer alır. Kullanıcı isterse veya proje direktifi varsa (`canlı doğrulama: otomatik`), ana akış tarayıcı doğrulamasını kendisi çalıştırır ve sonucu rapora ekler. Neden önemli: statik gate'ler runtime görünürlüğünü yakalayamaz (i18n namespace, env farkları yalnızca canlı koşuda çıkar).

**Koşu anlatımı (insan çıktısı) — Claudish değil Humanish:** Tek format — **açıklayıcı telegraf**. Her önemli adımda kullanıcıya BİR CÜMLE yaz: ne yapıldı, neden, ne bekleniyor (örn. "Reviewer gate'i geçti; tek minor bulguyu yeni implementer'a verdim"). Durum token'larını ("PASS", "DONE", "NEEDS_FIX") asla çıktıya taşıma — cümleye çevir. Tablo/jargon sohbete girmez; canlı durum insan çıktısıdır, ayrıca dosyaya tablo tutulmaz. Kapanışta kısa özet + `Yapıldı · Sonraki · Engel` satırı + **maliyet satırı** ("Bu lane toplam ~$X" — harness veriyorsa; vermiyorsa sessizce atla, uydurma). Kısacası: mesajın bir insana okunuyorsa doğru, bir log satırına benziyorsa yanlış.

## Ek A — Cross-harness tarifleri

Native subagent her harness'ta birincil tercihtir. Başka model ailesi gerektiğinde (limit ekonomisi, model gücü) ana döngü Bash ile headless çağırır — uzun prompt dosyadan beslenir:

- **Claude:** `claude -p "$(cat brief.md)" --model sonnet --permission-mode bypassPermissions --output-format json` → `.result`
- **Codex:** `codex exec -s danger-full-access --skip-git-repo-check "$(cat brief.md)"` — ⚠️ saha bulguları (v0.149.0): `--full-auto` YOK, karşılığı `-s workspace-write|danger-full-access`; **git commit gerektiren iş için danger-full-access şart** (workspace-write `.git/index.lock` yazamıyor). `--json` flag'i yok — çıktı düz metin, sonunda "tokens used" basılır (maliyet satırı kaynağı). Exit code her durumda 0 gelebilir → başarıyı ÇIKTIDAN doğrula. Brief'e report.md'in MUTLAK yolunu yaz — yoksa worker proje köküne yazar.
- **OpenCode:** önce `OPENCODE_SERVER_PASSWORD/USERNAME` env'lerini temizle → `opencode run -m <provider/model> "$(cat brief.md)"`
- **Cursor:** `cursor-agent -p "$(cat brief.md)" --force` — askıda kalma vakaları biliniyor, timeout sarmala
- **Antigravity:** `agy -p "<prompt>" --output-format json` — pipe'ta sessiz exit 0 olabilir, çıktıyı doğrula

Headless worker'a git write gibi onay gerektiren işlem VERİLMEZ — o adım ana akışta kullanıcıya sorulur.

**Limit yönlendirmesi:** abonelik/limit durumu kullanıcı tarafından bildirilir; config.toml'da `[harness_preferences]` altında tercih sırası tutulabilir (örn. limit dolunca implementer işlerini önce Codex'e pasla). Ana döngü seçimi buna göre yapar ve hangi kuralı uyguladığını raporda söyler.
