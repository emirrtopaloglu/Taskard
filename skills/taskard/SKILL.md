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

## Ölçek merdiveni

Akışın ağırlığı işin ağırlığına uyar; şüphede ağır olanı seç (ratchet aşağı inmez). Kapsam yürütme sırasında genişlerse (chore → geliştirme gibi) tier'ı yeniden değerlendir ve gerekirse yükselt.

- **Mikro iş:** tek adım, tek alan, ~10 dk (review+commit, tek dosya düzeltme, küçük düzeltme). Spec VE tasks dosyası YAZILMAZ — kullanıcının isteği + kabul kriterleri doğrudan tek bir brief.md'e işlenir, delegate açılır, kanıt kontrolü, durum satırı. `.taskard/`'a dokunan tek dosya brief'tir.
- **Standart iş:** ≥2 lane veya mimari karar veya belirsiz kapsam → tam seremoni (grilling → spec → tasks → lane'ler → gate'ler).
- Brief kullanıcının görev metnini birebir KOPYALAMAZ — delegate'in çalışması için gereken kesin talimatı taşır; bağlam zaten diskteyse referans verir.

## Iron Laws

1. Config dosyaları çalışma anında ASLA değiştirilmez/değiştirtilmez.
2. Ana döngü asla kod yazmaz.
3. İsimsiz subagent yasaktır.
4. Başarı beyanı değil kanıt raporlanır ("left per YAGNI" de bir claim'dir).
5. Riskli işlemler (config `risky_operations`) kullanıcı onayısız yapılmaz.

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

Görev küçük ve iyi tanımlıysa kompakt spec yaz; büyük/riskliyse grilling yap. Spec → `.taskard/context/specs/<slug>.md`.

## 2. Task listesi

Spec'ten task çıkar → `.taskard/tasks/T-NNN-slug.md` (frontmatter: status/blocked_by/assignee). Bağımsızlar paralel, bağımlılar sıralı.

## 3. Lane + delegate

Her task için:
1. **Ön kabul doğrulaması:** görevin dayandığı iddiaları brief yazmadan DOĞRULA (dosya gerçekten var mı, diff gerçekten var mı, kod gerçekten orada mı). İddia yanlışsa uydurma yoluna girme — kullanıcıya sun, kararı ondan al.
2. `.taskard/lanes/<ts>-<slug>/` altında brief.md doldur (bağlam + sıralı adımlar + kabul kriterleri + kapsam dışı + commit mesajı varsa birebir).
3. Config'ten rol→model oku (`~/.taskard/config.toml`, proje override'u, sonra kullanıcının bu session'daki sözleri).
4. **Native subagent** aç: rolün adlandırılmış tanımıyla, config'teki modelle. Claude Code'da Agent tool + agent adı; başka harness'taysan o harness'ın native mekanizması.
5. Report'u oku. BLOCKED ise aynı lane'de en fazla 2 deneme; üçüncüsünde teşhis topla, kullanıcıya raporla, bağımsız sonraki lane'e geç.

Fix protokolü: düzeltme HER ZAMAN yeni delegate ile. Sonrasında en az bağımsız kanıt kontrolü zorunlu (tsc/lint/test); Critical/Important bulgularda scoped re-review yapılır (yalnızca finding karşılandı mı bakılır). Push EDİLMEMİŞ lane commit'i amend edilebilir; push edilmiş commit'e asla dokunulmaz.

## 4. Gate'ler

Yeni kod üreten lane'lerde iki kapı, ikisi de TAZE reviewer subagent'ta (implementer'la aynı context'te asla):
1. Code review (standartlar + spec uyumu)
2. Merge öncesi son kontrol
Bulgu varsa düzeltme yeni implementer delegate'iyle, aynı lane'de.

Yeni kod ÜRETMEYEN lane'lerde (doğrulama, commit-only, inceleme) reviewer gate atlanır — yerine ana döngünün bağımsız kanıt kontrolü geçer (git log/diff/status ile delegate iddiasının doğrulanması). Bu istisna raporda belirtilir.

## 5. Canlı doğrulama + kapanış

Gate'leri geçen lane'i kullanıcıya sun; merge kararı HER ZAMAN kullanıcının. Kapanışta kapanış raporu + her task sonuna tek satır durum: `Yapıldı · Sonraki · Engel`.

## Ek A — Cross-harness tarifleri

Native subagent her harness'ta birincil tercihtir. Başka model ailesi gerektiğinde (limit ekonomisi, model gücü) ana döngü Bash ile headless çağırır — uzun prompt dosyadan beslenir:

- **Claude:** `claude -p "$(cat brief.md)" --model sonnet --permission-mode bypassPermissions --output-format json` → `.result`
- **Codex:** `codex exec --json --skip-git-repo-check -m <model> "$(cat brief.md)"`
- **OpenCode:** önce `OPENCODE_SERVER_PASSWORD/USERNAME` env'lerini temizle → `opencode run -m <provider/model> "$(cat brief.md)"`
- **Cursor:** `cursor-agent -p "$(cat brief.md)" --force` — askıda kalma vakaları biliniyor, timeout sarmala
- **Antigravity:** `agy -p "<prompt>" --output-format json` — pipe'ta sessiz exit 0 olabilir, çıktıyı doğrula

Headless worker'a git write gibi onay gerektiren işlem VERİLMEZ — o adım ana akışta kullanıcıya sorulur.
