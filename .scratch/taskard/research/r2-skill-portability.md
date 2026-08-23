# Taskard R2 — Skill/Agent Portability: Harness'lar Arası Kurulum ve Dağıtım (Ağustos 2026)

> Araştırma sorusu: "Taskard'ı yükle" deyince skill + agent tanımları tüm harness'larda (Claude Code, Codex, OpenCode, Cursor, Gemini CLI/Antigravity) nasıl çalışır? Tek kaynaklı dağıtım hangi desenle yapılır?

---

## Yönetici Özeti

1. **Agent Skills (SKILL.md + YAML frontmatter) fiili açık standart oldu** (agentskills.io). Claude Code, Codex, OpenCode, Cursor ve Gemini CLI/Antigravity'nin hepsi `name` + `description` çekirdeğini okuyor; farklar frontmatter uzantılarında ve dizin konvansiyonlarında.
2. **Ortak zemin `.agents/skills/`**: Codex, Cursor, OpenCode ve Antigravity bu yolu native okuyor. Claude Code hâlâ `.claude/skills/` istiyor — skills CLI bunu canonical dizine symlink atarak çözüyor.
3. **Her harness'in paket manifestosu aynı isimlendirme ailesinde**: `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `gemini-extension.json` / Antigravity `plugin.json`. Tek repodan çoklu manifest üretmek ucuz; superpowers bunu kanıtladı.
4. **Superpowers doktrini doğrulandı ama tam otomatik değil**: tek `skills/` dizini + per-harness bootstrap + tool-mapping referansları. Codex ve OpenCode kurulumu hâlâ "INSTALL.md fetch et" prompt'u veya manuel symlink gerektiriyor.
5. **Tek komutla çoklu-harness dağıtımının en olgun aracı `npx skills add`** (vercel-labs/skills): 33+ agent'a symlink/copy ile kurum, lock dosyası var; ama Windows'ta sessiz başarısızlıklar yaşanıyor. Taskard için öneri: portable SKILL.md çekirdeği + ince bir bootstrap installer (Detay: son bölüm).

---

## Kurulum Matrisi (Ağustos 2026)

| Artefakt | Claude Code | Codex | OpenCode | Cursor | Gemini CLI / Antigravity |
|---|---|---|---|---|---|
| **Skill** | `.claude/skills/<ad>/SKILL.md` · `~/.claude/skills/` · plugin içinde `skills/` | `.agents/skills/<ad>/` (repo) · `~/.agents/skills/` (global) · `~/.codex/skills/` | `.opencode/skill/<ad>/` · ayrıca `.claude/skills/`, `.agents/skills/` compat · global `~/.config/opencode/skills/` | `.cursor/skills/` · `.agents/skills/` (+nested) · global `~/.cursor/skills/` · compat: `.claude/skills/`, `.codex/skills/` | Gemini: `.gemini/skills/` · Antigravity: `.agents/skills/` (workspace), `~/.gemini/antigravity-cli/skills/` (global) |
| **Skill çağırma** | `/skill-ad` veya model otomatik | `$skill-ad` veya model otomatik | model otomatik (native skill tool) | `/skill-ad` veya model otomatik; Custom Mode ile session-boyu | Antigravity: derlenip `/skill-ad` slash command olur |
| **Command/slash** | skills'e merge oldu (`.claude/commands/*.md` hâlâ çalışır) | prompt tabanlı | `.opencode/command/<ad>.md` (`$ARGUMENTS`, `` !`cmd` ``, `@file`) veya `opencode.json` inline | skills'e merge oluyor (`/migrate-to-skills`) | Gemini: `commands/*.toml` → `/komut`; Antigravity: skill .md → slash command |
| **Agent/subagent** | `.claude/agents/*.md` (frontmatter) | yok gibi (plugin içinde sınırlı) | `.opencode/agent/<ad>.json` veya `.md` | subagent tanımları plugin/rule üzerinden; CLI'da subagents (Mar 2026) | Gemini: extension `agents/*.md` (preview); Antigravity: background subagents |
| **Rules/context** | `CLAUDE.md` (+`@import`) | `AGENTS.md` (hiyerarşik) | `AGENTS.md` (CLAUDE.md fallback!) + `opencode.json` `"instructions"` glob/URL | `.cursor/rules/*.mdc` (frontmatter: globs/alwaysApply) + AGENTS.md desteği | `GEMINI.md` (her ikisinde çalışıyor; AGENTS.md de destekli) |
| **Hooks** | `hooks.json` (plugin veya settings) | plugin manifestinde `hooks` (kapatmak için tam olarak `{}`) | `.opencode/plugin/` JS event hook'ları (`tool.execute.before` vb.) | `.cursor/hooks.json` (command/prompt tipi) | Gemini: extension `hooks/hooks.json`; Antigravity aynı JSON format |
| **Paket formatı** | plugin: `.claude-plugin/plugin.json` | plugin: `.codex-plugin/plugin.json` | npm paketi + `opencode.json` `"plugin"` alanı; yerel `.opencode/plugins/*.ts` | plugin: `.cursor-plugin/plugin.json` | Gemini: `gemini-extension.json`; Antigravity: `plugin.json` (staged bundle) |
| **Marketplace** | git-repo marketplace (`marketplace.json`), resmî + community | CLI içi plugin marketplace (repo kökünde `.agents/plugins/marketplace.json` bekler) | yok (npm ekosistemi) | Cursor Marketplace (Mar 2026+), `/plugin`, `/add-plugin`; Claude plugin'leri import edilebiliyor | Gemini gallery; Antigravity'de extension→plugin geçişi sürüyor |

---
## 1. Claude Code

**Skill dizinleri ve öncelik:** `~/.claude/skills/` (kişisel) → `.claude/skills/` (proje, git'e girer) → `.claude/skills.local/` (proje-kişisel, gitignore) → plugin içindeki `skills/`. Aynı isimde çakışmada yüksek öncelikli kazanır.

**SKILL.md frontmatter (15 alan):** `name`, `description` (trigger budur), `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork`, `agent`, `paths`, `hooks`, `shell`.
- `disable-model-invocation: true` → skill'i model bağlamından tamamen çıkarır; sadece `/ad` ile kullanıcı çağırır. Yan etkili skill'ler için önerilir.
- `context: fork` → skill kendi subagent bağlamında çalışır (büyük araştırma işleri için).
- Dikkat: Claude Desktop upload'u bu Claude-Code-specific anahtarları reddediyor (`unexpected key in SKILL.md frontmatter`). Portable çekirdek sadece name+description+markdown.

**Commands skills ile birleşti:** `.claude/commands/deploy.md` ile `.claude/skills/deploy/SKILL.md` ikisi de `/deploy` üretir; çakışırsa skill kazanır.

**Plugin sistemi:** `.claude-plugin/plugin.json` manifest (sadece `name` zorunlu). Otomatik keşif: `commands/`, `agents/`, `skills/`, `hooks/hooks.json`, `.mcp.json`. Custom path'ler defaults'a **eklenir**, replacement değil. `${CLAUDE_PLUGIN_ROOT}` portable path değişkeni (manifest'te, component dosyalarında ve çalıştırılan scriptlerde env var olarak).

**Marketplace:** git-repo-as-marketplace modeli — herhangi bir GitHub repo'su `/plugin marketplace add owner/repo` ile eklenir; repo kökünde `marketplace.json` (`.claude-plugin/marketplace.json`) beklenir. Resmî marketplace (`anthropics/claude-plugins-official`) default kurulu. Kurulum: `/plugin install <ad>@<marketplace>`. Windows symlink sorunları için superpowers extension root'u repo köküne koyuyor.

Kaynaklar: code.claude.com/docs/en/skills, /docs/en/plugins-reference, agentskills.io/specification

---

## 2. Codex (OpenAI)

**Skill desteği native:** kişisel skill'ler `~/.agents/skills/<ad>/SKILL.md`, repo skill'leri `.agents/skills/`. Codex cwd'den repo köküne doğru tarar; symlinked skill klasörlerini destekler. Eski konvansiyon `~/.codex/skills/` hâlâ yaygın anlatılıyor ve çalışıyor. Çağırma: `$skill-ad` veya skills selector; request description'a uyarsa model implicit seçer. Yeni skill'ler restart gerektirmeden auto-detect oluyor.

**AGENTS.md entegrasyonu:** durable repo kuralları AGENTS.md'de; nested dosyalar kendi dizin ağacına uygulanır. Superpowers'in eski Codex bootstrap'ı `~/.codex/AGENTS.md`'e startup bloğu yazıyordu; yeni yöntem bunu bıraktı (native skill discovery + symlink yeterli).

**Frontmatter bayrakları:** portable çekirdek (name/description) okunur; Claude-specific alanlar (`disable-model-invocation` vb.) Codex tarafında anlamsız — Codex kendi invocation kontrolünü `$` mention + selector ile yapıyor.

**Plugin sistemi:** minimal skills-only plugin = `.codex-plugin/plugin.json` + `skills/`. OpenAI'nin güncel dağıtım önerisi plugin'ler; eski `openai/skills` kataloğu deprecated → OpenAI Plugins repo'suna yönleniyor. CLI'da plugin marketplace UI var ("Installed 17 of 1751 available plugins").

**Kritik tuzak (superpowers v6.1.1'den):** Codex manifest'te `hooks` alanı yoksa `hooks/hooks.json`'a auto-discovery fallback yapıyor. Hook istemiyorsan manifest tam olarak `"hooks": {}` içermeli — alan yokluğu, `[]` veya boş liste hepsi fallback'e düşüyor. Marketplace tarafında: Codex marketplace source'ları repo kökünde `.agents/plugins/marketplace.json` bekliyor; sadece Claude marketplace dosyası olan repo Codex'ten kurulamıyor.

Kaynaklar: developers.openai.com/codex/cli, itecsonline.com Codex Agent Skills guide (15 Ağu 2026 gözden geçirilmiş), github.com/obra/superpowers RELEASE-NOTES

---

## 3. OpenCode

**Native skill keşfi (birinci sınıf):**
- Proje: `.opencode/skill/<ad>/SKILL.md`
- Compat: `.claude/skills/` ve `.agents/skills/` (proje + global) da taranıyor
- Global: `~/.config/opencode/skills/<ad>/SKILL.md`
- cwd'den git worktree'ye yürüyerek yükler. Native `skill` tool ile agent'lara açılır; içerik on-demand yüklenir.

**Frontmatter katı:** sadece `name`, `description`, `license`, `compatibility`, `metadata` tanınır; bilinmeyen alanlar sessizce yok sayılır. `name` regex: `^[a-z0-9]+(-[a-z0-9]+)*$` ve dizin adıyla eşleşmek zorunda; `description` 1–1024 karakter.

**Commands:** `.opencode/command/<ad>.md` (global: `~/.config/opencode/command/`) — `$ARGUMENTS`, `$1..$n`, `` !`shell` `` interpolasyonu, `@file`. Alternatif: `opencode.json` içinde inline `"command"` tanımı.

**Agents:** `.opencode/agent/<ad>.json` veya `.md` (model, systemPrompt, tools, temperature).

**Plugin mekanizması:** iki yol — (1) yerel JS/TS dosyaları `.opencode/plugins/` veya `~/.config/opencode/plugins/` altında (startup'ta otomatik), (2) npm paketleri `opencode.json` içinde `"plugin": ["paket-adı"]` alanıyla (Bun ile otomatik install, `~/.cache/opencode/node_modules/` cache). Plugin'ler event hook'larına abone olur: `tool.execute.before/after`, `chat.message`, `experimental.chat.messages.transform` (superpowers bootstrap injection'ını OpenCode'da böyle yapıyor), `session.*`, custom tool ekleme (`tool` helper + Zod schema).

**Context dosyaları:** AGENTS.md native; AGENTS.md yoksa CLAUDE.md fallback (Claude Code göçmenleri için bilinçli tasarım). `opencode.json` `"instructions"` alanı glob pattern ve remote URL kabul eder. `OPENCODE_DISABLE_CLAUDE_CODE(_PROMPT/_SKILLS)` env'leri Claude compat katmanını kapatır — Taskard gibi çift-dizin yazan paketlerin çift yükleme riskine karşı önemli detay.

Kaynaklar: opencode.ai/docs/plugins, /docs/skills, open-code.ai/en/docs/skills, thepromptshelf.dev OpenCode AGENTS.md guide

---

## 4. Cursor

**Rules:** modern format `.cursor/rules/*.mdc` (YAML frontmatter: `description`, `globs`, `alwaysApply`). Legacy `.cursorrules` Agent mode'da **sessizce yok sayılıyor**. Team Rules > Project Rules > User Rules önceliği. Remote rules GitHub üzerinden.

**Skills (2.4+):** `.cursor/skills/` ve `.agents/skills/` (proje + global `~/.cursor/skills/`, `~/.agents/skills/`). Recursive tarama: kategori alt dizinleri serbest, kimlik SKILL.md'yi taşıyan klasörden gelir; monorepo'da iç içe `.cursor/skills/` klasörleri otomatik o dizine scope'lanıyor. **Compat keşfi:** `.claude/skills/` ve `.codex/skills/` de yükleniyor (Claude Code plugin'lerinden import edilenlerle yan yana). Frontmatter: `name`, `description`, `paths` (glob scope), `disable-model-invocation`, `icon`, `color` (Custom Mode badge'i), `metadata`.

**Plugins (Mart 2026+):** `.cursor-plugin/plugin.json` manifest (name zorunlu); rules + skills + subagents + commands + MCP + hooks tek bundle'da. Cursor Marketplace güvenlik review'lı; `/plugin` CLI komutuyla marketplace add by git URL; IDE'de `/add-plugin superpowers`. Yerel geliştirme: `agent --plugin-dir ./my-plugin`. Cursor Team Kit resmî plugin'i var (`/deslop` vb.).

**Geçiş aracı:** `/migrate-to-skills` dynamic rule'ları ve slash command'ları skill'lere çeviriyor (command'lar `disable-model-invocation: true` korunarak).

Kaynaklar: cursor.com/docs/skills, cursor.com/docs/rules, toolsbase.dev Cursor cheat sheet (changelog özetleriyle)

---

## 5. Gemini CLI / Antigravity

**Kritik durum değişikliği:** Gemini CLI tüketici katmanlarında (AI Pro/Ultra/free) **18 Haziran 2026'da servis vermemeye başladı**; yerine Go tabanlı **Antigravity CLI (`agy`)** geçti. Enterprise/paid API key kullananlar hâlâ eski CLI'a erişebiliyor. Superpowers önce (v6.1.0) Gemini destekini kaldırdı sonra geri getirdi — "EOL varsayımı erkenmiş".

**Gemini CLI extensions:** `gemini-extension.json` manifest (`name`, `version`, `contextFileName: GEMINI.md`, `mcpServers`). İçindekiler: `commands/*.toml` (→ `/komut`, alt dizin `/ns:komut` namespacing), `hooks/hooks.json`, `skills/<ad>/SKILL.md`, `agents/*.md` sub-agents (preview), `policies/*.toml` (Policy Engine tier 2). Kurulum: `gemini extensions install https://github.com/owner/repo`; yönetim `gemini extensions list/update/uninstall`. Değişiklikler session restart ister.

**Antigravity CLI (agy) — güncel hedef platform:**
- Extensions artık "**plugins**" diye anılıyor; staged bundle yapısı: `~/.gemini/antigravity-cli/` altına kurulur, `import_manifest.json` defteri tutar.
- Minimal `plugin.json`: `{ "name", "version", "description", "skills": [...], "rules": [...] }`; opsiyonel `hooks.json`, `agents/`.
- **Workspace skills `.agents/skills/`'e taşındı** (eski `.gemini/skills/`); global skills `~/.gemini/antigravity-cli/skills/`. Bazı taşımalar manuel (`git mv .gemini/skills .agents/skills`).
- Skill = markdown blueprint (frontmatter: name + description); dizinde derlenip `/format-tests` gibi slash command olur. Global skill dizinindeki her .md otomatik global slash command.
- Context: GEMINI.md çalışmaya devam ediyor + **AGENTS.md de destekleniyor**. MCP config ayrı dosyaya taşındı (`.agents/mcp_config.json`); remote server field'ı `url` değil `serverUrl` olmak zorunda — sessiz fail eden tuzak.

Kaynaklar: google-gemini/gemini-cli docs/extensions, geminicli.com/docs/extensions/reference, antigravity.google/docs/cli-plugins, inventivehq Antigravity migration walkthrough

---
## 6. Tek Kaynaklı Dağıtım: Örnek Projeler ve Desen Adayları

### Sahadaki örnekler (superpowers dışında)
| Proje | Model | Kapsam |
|---|---|---|
| **vercel-labs/skills** (`npx skills`) | installer CLI; canonical `.agents/skills/` + symlink/copy | 33+ agent (Claude Code, Codex, OpenCode, Cursor, Antigravity, Copilot, Cline, Amp, Kiro...) |
| **microsoft/apm** (Agent Package Manager) | `apm.yml` manifest + `apm.lock.yaml` pin | `.cursor/rules/`, `.github/instructions/`, `.claude/` vb. hedeflere deploy |
| **vadimcomanescu/agents-skills** | canonical `~/.agents/skills/` + Claude symlink | Codex/Gemini/OpenCode native okur, Claude Code CLI symlink'ı otomatik açar |
| **contentstack-agent-skills** | aynı içerik 4 formatta dağıtılır: Claude plugin, Cursor plugin/.mdc rules, Codex `codex/AGENTS.md` router dizini, Gemini extension | resmî vendor çoklu-harness örneği |
| **ComposioHQ/awesome-codex-skills** | tek skill = tek klasör; `$skill-installer owner/repo/yol` ile GitHub'dan klonlama | Codex ekosistemi |
| **LobeHub skills marketplace** (`@lobehub/market-cli`) | merkezi katalog, 100k+ skill | çoklu-harness okuyan skill'ler |

### Desen A — Superpowers tarzı: mono-repo + per-harness bootstrap
Repo kökünde TEK `skills/` dizini + her harness için manifest/başlatma artefaktı: `.claude-plugin/`, `.codex/`, `.cursor-plugin/`, `.opencode/`, `gemini-extension.json`. Kurulum harness'in kendi kanalından: Claude/Cursor marketplace'ten; Codex ve OpenCode'a "fetch INSTALL.md ve uygula" prompt'u; Gemini'ye `gemini extensions install`. Harness-nötr dil ("Task tool kullan" yerine "subagent dispatch et") + `skills/using-superpowers/references/` altında per-harness tool-mapping tabloları.

- **+** Kanıtlanmış (82k★); marketplace keşfi ve güncelleme altyapısını bedavaya kullanır; skills içeriği tek yerden.
- **+** Her harness'in native paket mekanizmasına saygı duyar; uninstall/upgrade harness'e ait.
- **−** Kurulum deneyimi heterojen: Claude/Cursor tek komut, Codex/OpenCode "agent'a prompt yazdır" — scriptlenmesi kırılgan.
- **−** N manifest dosyasının senkron bakımı + per-harness kabul testleri (superpowers bunun için test suite'i büyüttü).

### Desen B — `npx skills add` installer (vercel-labs/skills)
`npx skills add owner/repo -g -a claude-code codex opencode cursor -y`. Canonical kopya `.agents/skills/`'e konur, diğer agent dizinlerine symlink (veya `--copy`). Lock file (`.skill-lock.json` v3, folder hash) ile `skills check/update`. Otomatik agent detection.

- **+** Gerçek tek komut; CI-friendly (`-y`); update tracking built-in; en geniş agent coverage.
- **+** Canonical-dizin + symlink modeli disk tekrarını ve drift'i önler.
- **−** Windows'ta bilinen sessiz başarısızlıklar: detection kaçırınca hata vermeden sadece bir agent'a yazar; `update` komutu eski sürümlerde `-a/-s` desteklemiyordu → fleet parity bozuluyor.
- **−** Agent registry elle tutulur (her yeni agent PR ister); symlink Windows'ta zayıf. Sadece SKILL.md taşır — agent tanımları, plugin manifestleri, hook'ları değil. Taskard'ın "agent tanımı" ihtiyacı için yetersiz kalabilir.

### Desen C — Git clone + symlinks (manuel/bootstrap)
`git clone taskard ~/taskard && ln -s ~/taskard/skills ~/.agents/skills/taskard && ln -s ... ~/.claude/skills/taskard` — superpowers'in yeni Codex dokümanının resmî yöntemi bu.

- **+** Sıfır bağımlılık; tam şeffaf; offline çalışır; güncelleme `git pull`.
- **−** Windows symlink izin sorunları (Developer Mode / mklink); her kullanıcının shell'iyle 5 komut; kaldırma manuel.

### Desen D — Paket yöneticisi (apm tarzı) veya kendi ince installer'ımız
`apm.yml` benzeri manifest + lock ile çoklu hedefe deploy eden araç; ya da Taskard'ın kendi `npx taskard init`'i: tespit ettiği harness'lara (1) portable skills'i `.agents/skills/`'e, (2) Claude'a `.claude-plugin/plugin.json`'lu plugin linki, (3) Codex'e `.codex-plugin/plugin.json` + `.agents/plugins/marketplace.json`, (4) OpenCode'a `.opencode/` yapısı + `opencode.json` plugin kaydı, (5) Cursor/Antigravity'ye compat dizinleri yazar.

- **+** Taskard'ın tüm artefakt türlerini (skill + agent + command + hook) tek geçişte kurar; harness tuzaklarını (Codex `hooks:{}`, OpenCode çift-yükleme, Windows copy fallback) bizim kontrolümüzde ele alır.
- **−** Bakım maliyeti bizde; her harness sürümünü takip etmek gerekir (bu araştırmanın gösterdiği gibi 6 ayda üç kez değişti).

### Taskard için sentez önerisi
Hibrit: **Desen A iskeleti + Desen D inceliği**. Tek `skills/` kaynağı (agentskills.io uyumlu name/description çekirdeği), repo kökünde paralel manifest klasörleri (marketplace keşfi için), ve küçük bir `npx taskard init` bootstrap'ı heterojen kurulum adımlarını tek komuta indirir. Skills-only kullanıcılar için `npx skills add emir/taskard` yolunu da açık bırakmak (Desen B ile interoperabilite). Kurulum doğrulaması superpowers'in kabul testiyle aynı olmalı: "temiz session'da tetikleyici cümle doğru skill'i otomatik ateşliyor mu?"

---

## Kaynaklar

- https://code.claude.com/docs/en/skills · https://code.claude.com/docs/en/plugins-reference · https://code.claude.com/docs/en/plugins
- https://agentskills.io/specification
- https://developers.openai.com/codex/cli · https://itecsonline.com/post/codex-cli-agent-skills-guide-install-usage-cross-platform-resources-2026 · https://theguidex.com/resources/best-codex-skills
- https://github.com/obra/superpowers (+ RELEASE-NOTES.md; v6.x harness notları) · https://deepwiki.com/obra/superpowers
- https://opencode.ai/docs/plugins · https://opencode.ai/docs/skills · https://open-code.ai/en/docs/skills · https://thepromptshelf.dev/blog/opencode-agents-md-guide-2026/
- https://cursor.com/docs/skills · https://cursor.com/docs/rules · https://toolsbase.dev/en/reference/cursor-commands
- https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md · https://geminicli.com/docs/extensions/reference/ · https://antigravity.google/docs/cli-plugins · https://inventivehq.com/blog/antigravity-cli-install-migrate-config
- https://github.com/vercel-labs/skills (antfu/skills-cli mirror) · https://www.skills.sh/docs/cli · https://vercel.com/docs/agent-resources/skills
- https://github.com/vadimcomanescu/agents-skills · https://www.contentstack.com/docs/developers/skills/overview.md · https://dev.to/deadbyapril/the-best-cursor-rules-for-every-framework-in-2026-20-examples-29ag

*Araştırma tarihi: 23 Ağustos 2026. Alanlar hızlı hareket ediyor — özellikle Antigravity plugin formatı ve Codex marketplace yapısı çeyreklik yeniden doğrulanmalı.*
