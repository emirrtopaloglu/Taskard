# R1 — Headless Dispatch Envanteri: Taskard Sub-Agent Harness'ları

> **Tarih:** 23 Ağustos 2026 · **Kapsam:** Claude Code, Codex CLI, OpenCode, Cursor CLI, Antigravity (agy), Gemini CLI (legacy) · **Yöntem:** Resmî dokümantasyon + güncel web kaynakları, iddia başına kaynak linki

## Yönetici özeti

1. Altı arayüzün tamamı 2026 itibarıyla resmî, dokümante edilmiş headless moda sahip; Taskard'ın "ucuz modele headless dispatch" fikri tüm harness'larda uygulanabilir durumda ([Claude Code](https://code.claude.com/docs/en/headless), [Codex](https://developers.openai.com/codex/noninteractive), [OpenCode](https://opencode.ai/docs/cli/), [Cursor](https://cursor.com/docs/cli/headless), [Antigravity](https://antigravity.google/docs/cli/headless)).
2. **En kritiği:** Google, Gemini CLI'yı 18 Haziran 2026'da tüketici katmanında emekli edip yerine **Antigravity CLI (`agy`)** geçirdi ([Google resmî duyuru](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)). Taskard için "Gemini CLI" hedeflemek anlamsız; hedef `agy`.
3. Ortak kalıp kuruldu: `-p`/`exec`/`run` + `--output-format json|stream-json` + model bayrağı + permission bayrağı. Claude Code ve Codex en olgun ikili; OpenCode ek olarak kalıcı HTTP sunucu moduyla (`opencode serve`) soğuk başlatma maliyetini ortadan kaldırıyor.
4. En büyük operasyonel riskler: Cursor `-p` askıda kalma raporları (Oca–Tem 2026), Antigravity'nin non-TTY'de sessiz stdout hatası ([#76](https://github.com/google-antigravity/antigravity-cli/issues/76)) ve OpenCode'un miras kalan `OPENCODE_SERVER_*` env değişkenleriyle "Session not found" hatası ([#28407](https://github.com/anomalyco/opencode/issues/28407)).
5. Hiçbir harness CLI seviyesinde genel amaçlı timeout bayrağı sunmuyor (tek istisna: `agy --print-timeout`); Taskard orkestratöründe process-level timeout'u kendimizin yönetmesi gerekiyor.

## Karşılaştırma matrisi (Ağustos 2026)

| Özellik | Claude Code | Codex CLI | OpenCode | Cursor CLI | Antigravity (`agy`) |
|---|---|---|---|---|---|
| **Headless çağrı** | `claude -p "<prompt>"` ([kaynak](https://code.claude.com/docs/en/headless)) | `codex exec "<prompt>"` (kısa: `codex e`) ([kaynak](https://developers.openai.com/codex/noninteractive)) | `opencode run "<prompt>"` ([kaynak](https://opencode.ai/docs/cli/)) | `agent -p "<prompt>"` ([kaynak](https://cursor.com/docs/cli/headless)) | `agy -p "<prompt>"` ([kaynak](https://antigravity.google/docs/cli/headless)) |
| **Prompt geçirme** | Arg veya stdin pipe (10 MB üst sınır) ([kaynak](https://code.claude.com/docs/en/headless)) | Arg; pipe = bağlam; `codex exec -` = stdin tam prompt ([kaynak](https://developers.openai.com/codex/noninteractive)) | Arg veya stdin ([kaynak](https://opencode.ai/docs/cli/)) | Arg ([kaynak](https://cursor.com/docs/cli/using)) | Arg; `--input-format stream-json` ile stdin ([kaynak](https://antigravity.google/docs/cli/headless)) |
| **Çıktı alma** | `--output-format text\|json\|stream-json` | stderr=ilerleme, stdout=son mesaj; `--json`=JSONL olay akışı; `-o <dosya>` | `--format default\|json` (json=ham olay akışı) | `--output-format text\|json\|stream-json` + `--stream-partial-output` | `--output-format text\|json\|stream-json` |
| **Structured output (schema)** | ✅ `--json-schema` → `structured_output` alanı ([kaynak](https://code.claude.com/docs/en/headless)) | ✅ `--output-schema <dosya>` (gpt-5 ailesi şart) ([kaynak](https://developers.openai.com/codex/noninteractive)) | ❌ (json = olay akışı) | ❌ (json = tek sonuç nesnesi) | ✅ `--json-schema` ([kaynak](https://antigravity.google/docs/cli/headless)) |
| **Model seçimi** | `--model` alias (`opus`,`sonnet`,`haiku`,`fable`,`opusplan`,`[1m]`) veya tam ad (`claude-opus-5`); `ANTHROPIC_MODEL` ([kaynak](https://code.claude.com/docs/en/model-config)) | `--model` (örn. `gpt-5.6-luna`, `gpt-5.6-terra`); config.toml/profile ([kaynak](https://developers.openai.com/codex/cli/reference)) | `-m <provider>/<model>` + `--variant` (reasoning effort) ([kaynak](https://opencode.ai/docs/cli/)) | `--model <m>` (örn. `sonnet-4.5`; Auto yönlendirme varsayılan) ([kaynak](https://toolsbase.dev/en/reference/cursor-commands)) | `--model <slug>` (`agy models` ile listelenir, ör. `gemini-3.6-flash-high`) + `--effort low\|medium\|high` ([kaynak](https://continuumcode.ai/guides/antigravity-cli/)) |
| **Auth** | Abonelik OAuth **veya** `ANTHROPIC_API_KEY`; `--bare` yalnız API key okur ([kaynak](https://code.claude.com/docs/en/headless)) | ChatGPT OAuth (`codex login [--device-auth]`) **veya** `CODEX_API_KEY` ([kaynak](https://developers.openai.com/codex/noninteractive)) | Provider bazlı: API key veya OAuth (`/connect`, `~/.local/share/opencode/auth.json`) ([kaynak](https://opencode.ai/docs/providers/)) | `agent login` (tarayıcı) **veya** `CURSOR_API_KEY` / `--api-key` ([kaynak](https://cursor.com/docs/cli/reference/authentication)) | Google sign-in → önbelleğe alınmış credential; CI'de oturum açılmamışsa `authentication required` ile çıkar ([kaynak](https://antigravity.google/docs/cli/headless)) |
| **Çalışma dizini** | cwd + `--add-dir` | `--cd` / `-C` + `--add-dir` ([kaynak](https://developers.openai.com/codex/cli/reference)) | `--dir` ([kaynak](https://opencode.ai/docs/cli/)) | `--workspace <yol>` + `--worktree [ad]` ([kaynak](https://toolsbase.dev/en/reference/cursor-commands)) | cwd + `--add-dir`, `--project`/`--new-project` ([kaynak](https://continuumcode.ai/guides/antigravity-cli/)) |
| **Permission/approval** | `--permission-mode acceptEdits\|auto\|dontAsk\|bypassPermissions`, `--allowedTools`, `--dangerously-skip-permissions` ([kaynak](https://code.claude.com/docs/en/headless)) | `--sandbox read-only`(varsayılan)\|`workspace-write`\|`danger-full-access`; interaktif onay yok ([kaynak](https://developers.openai.com/codex/noninteractive)) | `--auto` (reddedilmeyenleri onayla); agent frontmatter permission'ları ([kaynak](https://opencode.ai/docs/cli/)) | `-p --force` / `--yolo` (dosya yazma); `--sandbox`, `--trust` ([kaynak](https://cursor.com/docs/cli/headless)) | Varsayılan soft-deny; `settings.json permissions.allow`; `--dangerously-skip-permissions`, `--sandbox` ([kaynak](https://antigravity.google/docs/cli/headless)) |
| **Timeout** | Yok (arka plan bekleme tavanı 10 dk, `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`; stream drain 30 sn) ([kaynak](https://code.claude.com/docs/en/headless)) | Dokümante genel timeout yok ([kaynak](https://developers.openai.com/codex/cli/reference)) | Yok ([kaynak](https://opencode.ai/docs/cli/)) | Yok ([kaynak](https://cursor.com/docs/cli/headless)) | ✅ `--print-timeout` (varsayılan **5 dk**) ([kaynak](https://antigravity.google/docs/cli/headless)) |
| **Session resume** | `--resume <session_id>`, `--continue` ([kaynak](https://code.claude.com/docs/en/headless)) | `codex exec resume --last` / `resume <SESSION_ID>` (+`--all`) ([kaynak](https://developers.openai.com/codex/noninteractive)) | `-c`/`--continue`, `--session <id>`, `--fork` ([kaynak](https://opencode.ai/docs/cli/)) | `agent resume [<chatId>]`, `--resume <id>`, `--continue`, `agent ls` ([kaynak](https://toolsbase.dev/en/reference/cursor-commands)) | `--continue`/`-c`, `--conversation <id>` ([kaynak](https://continuumcode.ai/guides/antigravity-cli/)) |
| **Eş zamanlı instance** | Dokümante sert limit yok; üretimde 3–5 paralel oturum bildirilmiş ([örnek](https://github.com/anthropics/claude-code/issues/53584)) | Paralel çalıştırma `--ephemeral` gerektirir (paylaşılan session dosya çakışması) ([kaynak](https://codex.danielvaughan.com/2026/04/18/codex-cli-headless-batch-mode-automation)) | `opencode serve` + HTTP API ile çoklu oturum ([kaynak](https://opencode.ai/docs/cli/)) | Dokümante limit yok; `cli-config.json` yazımı atomik (paralel güvenli) ([kaynak](https://toolsbase.dev/en/reference/cursor-commands)) | Async/arka plan agent özelliği var; çağrı-başı eş zamanlık limiti dokümante değil ([kaynak](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)) |

---
## 1. Claude Code

**Headless komut:** `claude -p "<prompt>"` (`--print`). `-p` ile tüm CLI bayrakları çalışır; `--bg` reddedilir ([Run Claude Code programmatically](https://code.claude.com/docs/en/headless)).

- **Prompt geçirme:** Argüman veya stdin pipe: `cat build-error.txt | claude -p 'explain' > out.txt`. Pipe üst sınırı **10 MB**, aşılırsa hata ile çıkar ([kaynak](https://code.claude.com/docs/en/headless)).
- **Çıktı:** `--output-format text` (varsayılan) | `json` (result, session_id, total_cost_usd, modelUsage içeren tek nesne) | `stream-json` (satır satır olay; `system/init` ilk olay, son satır `result`) ([kaynak](https://code.claude.com/docs/en/headless), [CLI reference](https://code.claude.com/docs/en/cli-reference)). Token akışı için `--verbose --include-partial-messages` şart. Çok turlu giriş: `--input-format stream-json`.
- **Structured output:** `--json-schema '{...}'` → yanıtın `structured_output` alanı ([kaynak](https://code.claude.com/docs/en/headless)).
- **Model seçimi:** `--model <alias|tam-ad>`. Alias'lar: `default`, `best`, `fable`, `sonnet`, `opus`, `haiku`, `sonnet[1m]`, `opus[1m]`, `opusplan`. Anthropic API'de `opus`→Opus 5, `sonnet`→Sonnet 5 çözümlenir (v2.1.219+). Tam ad örneği: `claude-opus-5`. Ortam değişkeni: `ANTHROPIC_MODEL`. Effort: `--effort` ([Model configuration](https://code.claude.com/docs/en/model-config)). Not: `-p` modunda Fable 5 usage-credit onay sorusu **sorulmadan** faturalanır ([kaynak](https://code.claude.com/docs/en/model-config)).
- **Auth:** Normal `-p` kayıtlı OAuth abonelik girişini (Pro/Max/Team) kullanabilir; API key (`ANTHROPIC_API_KEY`) alternatiftir. **`--bare` modu OAuth/keychain'i hiç okumaz — sadece `ANTHROPIC_API_KEY`** ([kaynak](https://code.claude.com/docs/en/headless)).
- **Permission:** `-p` başlangıç modu her planda Manual'dır; açıkça ver: `--permission-mode acceptEdits|auto|dontAsk|bypassPermissions`, araç bazlı `--allowedTools "Bash(git diff *),Read"` ([kaynak](https://code.claude.com/docs/en/headless)). Tam bypass: `--dangerously-skip-permissions` ([kaynak](https://docs.arantic.com/claude-code/flags)).
- **Çalışma dizini:** Çağrılan cwd + `--add-dir ../lib` ile ek dizinler.
- **Timeout / yaşam döngüsü:** Genel timeout bayrağı yok. `-p` içinde başlatılan arka plan Bash görevi sonuçtan ~5 sn sonra öldürülür; arka plan subagent bekleme tavanı 10 dk (`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`, `0`=sınırsız). Yavaş tüketilen stream'de çıkış öncesi drain bekleme 30 sn ile sınırlı. SIGTERM→exit 143, tur yarım kalır; resume devam ettirir ([kaynak](https://code.claude.com/docs/en/headless)).
- **Resume:** JSON çıktısındaki `session_id`'yi yakala → `claude -p --resume "$id" "devam"`. Farklı dizinden de bulunur (v2.1.223+) ([kaynak](https://code.claude.com/docs/en/headless)).
- **Eş zamanlılık:** Dokümante sert limit yok; uzun ömürlü runner'larda 3–5 paralel `-p` oturumu yaygın ([örnek üretim kurulumu](https://github.com/anthropics/claude-code/issues/53584)). Abonelik rate limitleri fiilî sınır.
- **Bilinen tuzaklar:**
  - `--print --output-format stream-json` yolunda istemci tarafı read-timeout yok → akış donması sonsuz askıda kalabilir ([#33949](https://github.com/anthropics/claude-code/issues/33949), [#53584](https://github.com/anthropics/claude-code/issues/53584)). Orkestratör tarafında watchdog şart.
  - `-p` güven diyaloğu göstermez; projedeki `.mcp.json`/hook'lar `--bare` olmadan **yine de yüklenir** → sandbox'sız ortamda supply-chain riski ([kaynak](https://code.claude.com/docs/en/headless)).
  - MCP sunucu bekleme `MCP_TIMEOUT` (30 sn varsayılan); yüklenemeyen sunucular sessizce atlanabilir → CI gate için `mcp_server_errors` alanını kontrol et ([kaynak](https://code.claude.com/docs/en/headless)).

**Minimal dispatch örneği:**

```bash
cd ~/www/Taskard && claude -p "$(cat task.md)" \
  --model sonnet \
  --output-format json \
  --allowedTools "Read,Edit,Bash" \
  --permission-mode acceptEdits \
  > result.json
# text: jq -r '.result'; session: jq -r '.session_id'
```

---

## 2. Codex CLI (OpenAI)

**Headless komut:** `codex exec "<prompt>"` (kısa biçim `codex e`). Resmî sayfa: [Non-interactive mode](https://developers.openai.com/codex/noninteractive).

- **Prompt geçirme:** Argüman; stdin pipelendıysa arg=instruction + stdin=bağlam; `codex exec -` ile stdin tam prompt olur: `cat prompt.txt | codex exec -` ([kaynak](https://developers.openai.com/codex/noninteractive)).
- **Çıktı:** İlerleme → **stderr**, son mesaj → **stdout** (pipe dostu). `--json` → stdout JSONL olay akışı (`thread.started`, `turn.started/completed/failed`, `item.*`, `error`; usage tokenları `turn.completed` içinde) ([kaynak](https://developers.openai.com/codex/noninteractive)). Sadece son mesaj: `-o/--output-last-message <dosya>`.
- **Structured output:** `--output-schema schema.json` → son yanıtı JSON Schema'ya zorlar. Kısıt: **gpt-5 ailesi model gerektirir**, `--oss` yerel modellerle çalışmaz ([kaynak](https://developers.openai.com/codex/noninteractive), [danielvaughan](https://codex.danielvaughan.com/2026/04/18/codex-cli-headless-batch-mode-automation)).
- **Model seçimi:** `--model` / config.toml `model = ...` / `[profiles.<ad>]`. Ağustos 2026 katalog örnekleri: `gpt-5.6-luna`, `gpt-5.6-terra`; reasoning effort `model_reasoning_effort = minimal..xhigh` ([CLI reference](https://developers.openai.com/codex/cli/reference)).
- **Auth:** İki resmî yol: (1) ChatGPT aboneliği — `codex login` tarayıcı OAuth; headless makinede `codex login --device-auth`; (2) API key — `CODEX_API_KEY` env (yalnız `exec`, `review`, SDK ve `exec-server --remote` okur). CI için resmî tavsiye: [openai/codex-action@v1](https://github.com/openai/codex-action) + workload identity federation ([kaynak](https://developers.openai.com/codex/noninteractive)).
- **Permission/sandbox:** Varsayılan exec sandbox'u **read-only**. Yazma: `--sandbox workspace-write`; tam erişim: `--sandbox danger-full-access` (yalnız izole ortam). Eski `--full-auto` deprecated, uyarı basar. Onay mekanizması yoktur — politika baştan verilir. Ek: `--ignore-user-config`, `--ignore-rules`, `--add-dir` ([kaynak](https://developers.openai.com/codex/noninteractive), [CLI reference](https://developers.openai.com/codex/cli/reference)).
- **Çalışma dizini:** Git repo içinde çalışma **zorunluluğu** var; `--skip-git-repo-check` ile aşılır. Dizin: `--cd` / `-C` ([kaynak](https://developers.openai.com/codex/noninteractive)).
- **Timeout:** Dokümante genel timeout yok (üçüncü parti wrapper'lar 120–600 sn kullanıyor; orkestratör seviyesinde çöz).
- **Resume:** `codex exec resume --last "..."` veya `codex exec resume <SESSION_ID>` (+`--all` arama). Çok aşamalı pipeline'ın resmî deseni budur ([kaynak](https://developers.openai.com/codex/noninteractive)).
- **Eş zamanlılık:** Paralel batch işlerde `--ephemeral` (session dosyalarını diske yazmaz) kullan; aksi halde paylaşılan restore dosyaları çakışır ([danielvaughan](https://codex.danielvaughan.com/2026/04/18/codex-cli-headless-batch-mode-automation)).
- **Bilinen tuzaklar:**
  - `required = true` MCP sunucusu init olamazsa `codex exec` **hemen hata ile çıkar** ([kaynak](https://developers.openai.com/codex/noninteractive)).
  - `--ephemeral` + `resume` birlikte anlamsız (kalıcı oturum dosyası yok); `--output-schema` resume alt komutunda henüz yok ([issue #14343](https://github.com/openai/codex/issues/14343)).
  - CI'de `OPENAI_API_KEY`/`CODEX_API_KEY`'i job-level env olarak koymak resmî dokümanda açıkça sakıncalı işaretlenmiş (repo kontrollü kod okuyabilir) ([kaynak](https://developers.openai.com/codex/noninteractive)).

**Minimal dispatch örneği:**

```bash
cd ~/www/Taskard && CODEX_API_KEY=$OPENAI_API_KEY codex exec --json \
  --sandbox workspace-write \
  --ephemeral \
  --model gpt-5.6-luna \
  -o /tmp/final.txt \
  "$(cat task.md)" 2>/tmp/events.jsonl
```

---
## 3. OpenCode

**Headless komut:** `opencode run "<prompt>"` — resmî CLI referansı: [opencode.ai/docs/cli](https://opencode.ai/docs/cli/). Ek yüzeyler: `opencode serve` (HTTP API) ve `opencode acp` (stdin/stdout ND-JSON).

- **Prompt geçirme:** Pozisyonel argüman veya stdin ([kaynak](https://opencode.ai/docs/cli/)). Dosya eki: `-f/--file <yol>`.
- **Çıktı:** `--format default` (formatlı) | `--format json` (**ham JSON olay akışı**; tek sonuç nesnesi değil). Çıktı stdout'a akar, `> dosya` ile yakalanır ([kaynak](https://opencode.ai/docs/cli/)).
- **Structured output/schema:** Yok; json formatı olay akışıdır, son metni olaylardan ayıklamak gerekir.
- **Model seçimi:** `-m/--model <provider>/<model>` (75+ provider, models.dev kataloğu); reasoning effort: `--variant`. Mevcutlar: `opencode models [--refresh]` ([kaynak](https://opencode.ai/docs/cli/), [providers](https://opencode.ai/docs/providers/)).
- **Auth:** Provider bazlı. `/connect` (TUI) veya `opencode auth login`; anahtarlar `~/.local/share/opencode/auth.json`'da. API key çoğu provider'da; ayrıca **ChatGPT Plus/Pro OAuth** ve Anthropic için **Claude Pro/Max OAuth** seçeneği `/connect`'te mevcut; OpenCode Zen (kendi küratörlü modelleri) ve OpenCode Go (ucuz abonelik) opsiyonel ([kaynak](https://opencode.ai/docs/providers/)).
- **Permission:** `--auto` → "açıkça reddedilmemiş izinleri otomatik onayla". Kalıcı kontrol agent frontmatter'ında (`permission: edit: deny` vb.) ([kaynak](https://opencode.ai/docs/cli/), [agents](https://opencode.ai/docs/agents)).
- **Çalışma dizini:** `--dir <dizin>`; attach modunda remote sunucudaki yol olarak da kullanılıyor.
- **Soğuk başlatma çözümü:** Her `run`, MCP sunucularını yeniden başlatır. Kalıcı yol: bir kez `opencode serve --port 4096` çalıştır → `opencode run --attach http://localhost:4096 "..."`. Serve modu HTTP basic auth: `OPENCODE_SERVER_PASSWORD` ([kaynak](https://opencode.ai/docs/cli/)). Serve + SDK ile gerçek çoklu oturum/SSE akışı mümkün ([server docs](https://opencode.ai/docs/server/)).
- **Resume:** `-c/--continue` (son oturum), `-s/--session <id>`, devam ederken `--fork` ile kopya oturum açma ([kaynak](https://opencode.ai/docs/cli/)).
- **Timeout / eş zamanlılık:** Dokümante timeout yok. Tek `run` = tek geçici local server (rastgele port); paralel ihtiyaçta `serve` + HTTP API tercih edilmeli.
- **Bilinen tuzaklar:**
  - **"Session not found", exit 0:** Masaüstü uygulamasının set ettiği `OPENCODE_SERVER_PASSWORD`/`OPENCODE_SERVER_USERNAME` env'leri miras alınınca `run` sessizce başarısız oluyor; PR düzeltmesi merge edilmedi, issue kapatıldı. Workaround: env'leri temizleyip çağır ([#28407](https://github.com/anomalyco/opencode/issues/28407)). Taskard dispatcher'ında bu iki değişkeni sıfırlamak güvenli önlem.
  - `--format json` tek sonuç nesnesi vermez; "Agent completed without producing any output" tarzı hataların ayırt edilmesi olay akışı parse etmeye bağlı.

**Minimal dispatch örneği:**

```bash
cd ~/www/Taskard && env -u OPENCODE_SERVER_PASSWORD -u OPENCODE_SERVER_USERNAME \
  opencode run \
  --model "<provider>/<model>" \
  --format json \
  --auto \
  "$(cat task.md)" > events.jsonl
```

---

## 4. Cursor CLI

**Headless komut:** `agent -p "<prompt>"` — binary artık **`agent`** (`cursor-agent` legacy alias). Resmî: [Using Headless CLI](https://cursor.com/docs/cli/headless), [Using Agent in CLI](https://cursor.com/docs/cli/using).

- **Prompt geçirme:** Argüman ([kaynak](https://cursor.com/docs/cli/headless)).
- **Çıktı:** `--output-format text` (varsayılan, sadece final yanıt) | `json` (tek yapılandırılmış nesne, token toplamları + `request_id`) | `stream-json` (mesaj bazlı ilerleme; `--stream-partial-output` ile delta akışı). Olay tipleri: `system/init`, `assistant`, `tool_call`, `result` ([kaynak](https://cursor.com/docs/cli/headless)).
- **Structured output/schema:** JSON schema desteği dokümante değil.
- **Model seçimi:** `--model <m>` (örn. `sonnet-4.5`, `gpt-5.2`; taze kurulumda varsayılan Auto routing; model varyant slug'ları headless'ta korunur) ([kaynak](https://toolsbase.dev/en/reference/cursor-commands), [skywork referansı](https://skywork.ai/clihub/keywords/cursor-cli.html)).
- **Auth:** İki resmî yöntem: `agent login` tarayıcı akışı (abonelik; `NO_OPEN_BROWSER=1` URL basar) veya Dashboard'dan üretilen API key → `CURSOR_API_KEY` env ya da `--api-key` bayrağı ([Authentication docs](https://cursor.com/docs/cli/reference/authentication)).
- **Permission:** `-p` tek başına analiz/rapor modudur — dosya değişikliklerini uygulamaz; **dosya yazması için `-p --force` (veya `--yolo`)**. Ek: `--sandbox enabled|disabled`, `--trust` (güven diyaloğını atla), `--auto-review` ([headless docs](https://cursor.com/docs/cli/headless), [changelog özeti](https://toolsbase.dev/en/reference/cursor-commands)). Not: resmî using-sayfası "non-interactive modda tam yazma erişimi" der; pratikte onaysız yazma `--force` ile açılır ([using](https://cursor.com/docs/cli/using)).
- **Çalışma dizini:** `--workspace <yol>`; izole çalışma için `--worktree [ad]` / `-w` (git worktree); çoklu kök: `--add-dir` ([kaynak](https://toolsbase.dev/en/reference/cursor-commands)).
- **Timeout:** Dokümante timeout yok; üçüncü parti entegrasyonlarda 5 dk watchdog yaygın ([örnek forum kaydı](https://forum.cursor.com/t/cursor-agent-p-print-headless-mode-hangs-indefinitely-and-never-returns/150246)).
- **Resume:** `agent ls` (sohbet listesi), `agent resume [<chatId>]`, `--resume <id>`, `--continue` ([using](https://cursor.com/docs/cli/using)).
- **Eş zamanlılık:** Dokümante limit yok; config yazımları atomic rename ile paralel güvenli ([kaynak](https://toolsbase.dev/en/reference/cursor-commands)).
- **Bilinen tuzaklar:**
  - **`-p` askıda kalma raporları** (Oca 2026 – Tem 2026 arası tekrarlayan): IPC worker-server kilitlemesi, sıfır çıktı, TCP bağlantısı bile yok; interaktif mod sorunsuz. Ayrıca "--print tamamlıyor ama çıkmıyor" hataları ([forum: hang](https://forum.cursor.com/t/cursor-agent-p-print-headless-mode-hangs-indefinitely-and-never-returns/150246), [doesn't exit](https://forum.cursor.com/t/cursor-agent-print-doesnt-exit-after-completing/150296)). Watchdog + retry zorunlu.
  - APAC/kurumsal VPN arkasında API IP failover 10–15 sn ek gecikme üretebiliyor ([aynı thread](https://forum.cursor.com/t/cursor-agent-p-print-headless-mode-hangs-indefinitely-and-never-returns/150246)).

**Minimal dispatch örneği:**

```bash
export CURSOR_API_KEY=...
cd ~/www/Taskard && agent -p --force \
  --output-format json \
  --model sonnet-4.5 \
  --workspace ~/www/Taskard \
  "$(cat task.md)" > result.json
```

---

## 5. Antigravity CLI (`agy`) — VE Gemini CLI durumu

### 5.1 Headless var mı? NET CEVAP: VAR

Google Antigravity'nin resmî terminal arayüzü **Antigravity CLI** (binary: `agy`, Go ile yazılmış) Mayıs 2026'da duyuruldu ve **resmî headless/print modu dokümante**: `agy -p "<prompt>"` ([Headless mode | Google Antigravity Docs](https://antigravity.google/docs/cli/headless)). Kurulum: `curl -fsSL https://antigravity.google/cli/install.sh | bash` (Windows: `winget install Google.AntigravityCLI`); Homebrew cask'ı masaüstü app'i kurar, CLI'yı değil ([continuumcode rehberi](https://continuumcode.ai/guides/antigravity-cli/)).

### 5.2 Gemini CLI ne oldu?

18 Haziran 2026'da Gemini CLI, Google AI Pro/Ultra ve ücretsiz bireysel katmanda istek servis etmeyi kesti; tüketici auth uçları kapandı ([resmî blog](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/), [gemini-cli discussion #27274](https://github.com/google-gemini/gemini-cli/discussions/27274)). Yalnızca **Gemini Code Assist Standard/Enterprise lisansı ve ücretli API key yolları** eski `gemini` CLI'sını kullanmaya devam ediyor ([kaynak](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)). Taskard dispatch hedefi `gemini -p` değil, `agy -p` olmalı.

### 5.3 Yetenekler (Ağustos 2026)

- **Komut:** `agy -p "<prompt>"` (alias: `--print`, `--prompt`). Yanıt → **stdout**, tanı/diagnostik → **stderr** ([resmî headless docs](https://antigravity.google/docs/cli/headless)).
- **Prompt geçirme:** Argüman; `--input-format text|stream-json` ile stdin'den ([kaynak](https://antigravity.google/docs/cli/headless)).
- **Çıktı:** `--output-format text|json|stream-json`; structured output: `--json-schema <schema|dosya>` ([kaynak](https://antigravity.google/docs/cli/headless)).
- **Model seçimi:** `--model <slug>` (liste: `agy models`; örnekler `gemini-3.5-flash-medium`, `gemini-3.6-flash-high` — effort sonekli slug'lar) + `--effort low|medium|high` + `--agent <ad>`. Bilinmeyen model non-zero exit ile **yüksek sesle patlar** (sessiz fallback yok — pipeline dostu davranış) ([kaynak](https://antigravity.google/docs/cli/headless), [continuumcode](https://continuumcode.ai/guides/antigravity-cli/)).
- **Auth:** Headless, **önbelleğe alınmış credential** kullanır; önce interaktif `agy` oturumunda Google sign-in yapılmalı (keyring; SSH'ta URL+kod akışı). Terminali olmayan CI'da auth yoksa asılı kalmaz, `authentication required` hatasıyla çıkar. Enterprise: Google Cloud projesi bağlama ([kaynak](https://antigravity.google/docs/cli/headless)).
- **Permission:** Varsayılan politika takibi; onay alamayan araç **soft-deny** olur (run devam eder, exit 0, stderr'de bildirim). Workspace içi okuma/yazma auto-allow; shell komutları varsayılan Ask. Kalıcı izin: `~/.gemini/antigravity-cli/settings.json` → `permissions.allow`. Tam bypass: `--dangerously-skip-permissions`; sandbox: `--sandbox`; mod: `--mode accept-edits|plan` ([kaynak](https://antigravity.google/docs/cli/headless)).
- **Timeout:** ✅ Tek dokümante edilmiş örnek: `--print-timeout` (**varsayılan 5 dk**, ör. `--print-timeout 15m`) ([kaynak](https://antigravity.google/docs/cli/headless)).
- **Resume:** `--continue`/`-c` (son konuşma), `--conversation <id>` ([continuumcode](https://continuumcode.ai/guides/antigravity-cli/)).
- **Eş zamanlılık:** Platform async/arka plan agent orkestrasyonunu vurgular; çağrı-başı eş zamanlık limiti dokümante değil.
- **Bilinen tuzaklar:**
  - **Non-TTY'de sessiz stdout ([issue #76](https://github.com/google-antigravity/antigravity-cli/issues/76)):** Pipe'a bağlı stdout'ta model cevabı hiç basılmadan exit 0 (Windows odaklı rapor, Tem 2026; gemini-cli #27466 ile akraba). Community workaround: pseudo-TTY ile çağırma veya yanıtı conversation SQLite store'undan okuma ([gist workaround](https://gist.github.com/allahsan/a9a9e9c8a49aecede67ce974e64ef3cf)). Linux/macOS'ta `--output-format json` ile test edip doğrulamak şart.
  - **MCP başlatma yükü:** Global MCP config'i her headless çağrıda yüklenir; trivial çağrı ~9 sn. `--no-mcp`/`--mcp-config` bayrağı yok ([issue #342](https://github.com/google-antigravity/antigravity-cli/issues/342)).
  - Quota bitince (RESOURCE_EXHAUSTED 429) hata da sessiz kalabiliyor (aynı gist analizi) → çıkış koduna güvenme, çıktıyı doğrula.

**Minimal dispatch örneği:**

```bash
cd ~/www/Taskard && agy -p "$(cat task.md)" \
  --output-format json \
  --model gemini-3.6-flash-medium \
  --print-timeout 15m \
  > result.json
```
## Boşluklar ve riskler

**Taskard dispatch katmanı için doğrudan etkili boşluklar:**

1. **Timeout standart yok.** Yalnız `agy --print-timeout` (5 dk varsayılan) var; Claude Code, Codex, OpenCode, Cursor'da genel amaçlı timeout bayrağı dokümante değil → Taskard her subprocess'ı kendi watchdog'uyla (örn. kill + partial-output kurtarma) sarmalamalı.
2. **Cursor `-p` güvenilirlik riski en yüksek.** Tekrarlayan askıda kalma/çıkmama raporları (Oca–Tem 2026) üretim kullanımını riske atıyor; Taskard'da Cursor adapter'ı "deneysel + zorunlu timeout + retry" ile konumlandırılmalı.
3. **Antigravity #76 sessiz stdout:** Pipe'tan çağrıda cevabın hiç basılmaması mümkün; exit 0 hile yapar. Adapter'da çıktı doğrulaması (boş yanıt = hata say) ve gerektiğinde pseudo-TTY fallback şart.
4. **OpenCode env zehirlenmesi:** `OPENCODE_SERVER_PASSWORD`/`USERNAME` miras kalınca sessiz "Session not found". Dispatcher spawn anında bu iki değişkeni temizlemeli.
5. **Claude Code stream-json donması (#33949 ailesi):** İstemcide read-timeout yok; uzun ömürlü paralel oturumlarda görülüyor. JSON modu (`--output-format json`, tek nesne) daha az yüzey alanı — Taskard için varsayılan aday.
6. **Structured output uyumsuzluğu:** `--json-schema` yalnız Claude Code + Codex (gpt-5 ailesi kısıtı) + Antigravity'de var; OpenCode/Cursor'da orkestratör prompt-taraflı schema dayatmalı ve çıktıyı kendisi parse etmeli.
7. **Auth heterojenliği:** Abonelik OAuth'u dördünde mümkün (Claude Code, Codex ChatGPT, Cursor login, agy Google); fakat CI/headless makinede: Claude Code `--bare`+API key (OAuth okumaz), Codex `--device-auth` veya `CODEX_API_KEY`, Cursor API key, agy önden interaktif login şart (CI'da login yapılamaz). Her harness için ayrı credential provizyon adımı gerekli.
8. **Paralel çalışma semantiği farklı:** Codex'te `--ephemeral` zorunlu pratik; OpenCode'da `serve`+attach mimarisi tercih edilmeli; diğerlerinde limit dokümante değil (fiilî sınır = rate limit). Taskard concurrency policy'sini harness bazında ayırmalı.
9. **Maliyet/metering belirsizliği:** Abonelik (OAuth) yolunda token/cost raporlama Claude Code'da (`total_cost_usd`, tahmini) ve Cursor json'ında (token toplamları) iyi; Codex plan-lane faturalamada opak. Ucuz model yönlendirmesi API-key tarafında daha ölçülebilir.

**Araştırma boşlukları (sonraki tur):**

- `agy --input-format stream-json` çok turlu protokolünün olay şeması (resmî docs'ta örnek yok).
- Cursor CLI resmî tam bayrak referansı (docs'ta `reference` bölümü dağınık; `agent --help` çıktısıyla doğrulama gerek).
- Her harness'in eş zamanlı instance limitlerine dair resmî söz (yok); gerçek sınırlar rate-limit deneyiyle ölçülmeli.
- OpenCode `run --format json` olay şemasının stabil sürüm garantisi (sürüm sürüm değişebiliyor).

---

## Ana kaynaklar

| Harness | Birincil kaynaklar |
|---|---|
| Claude Code | [Headless](https://code.claude.com/docs/en/headless) · [CLI reference](https://code.claude.com/docs/en/cli-reference) · [Model config](https://code.claude.com/docs/en/model-config) · [#33949](https://github.com/anthropics/claude-code/issues/33949) |
| Codex CLI | [Non-interactive mode](https://developers.openai.com/codex/noninteractive) · [CLI reference](https://developers.openai.com/codex/cli/reference) · [codex-action](https://github.com/openai/codex-action) · [danielvaughan headless rehberi](https://codex.danielvaughan.com/2026/04/18/codex-cli-headless-batch-mode-automation) |
| OpenCode | [CLI](https://opencode.ai/docs/cli/) · [Providers/Auth](https://opencode.ai/docs/providers/) · [Server](https://opencode.ai/docs/server/) · [#28407](https://github.com/anomalyco/opencode/issues/28407) |
| Cursor | [Headless](https://cursor.com/docs/cli/headless) · [Using Agent](https://cursor.com/docs/cli/using) · [Authentication](https://cursor.com/docs/cli/reference/authentication) · [forum: -p hang](https://forum.cursor.com/t/cursor-agent-p-print-headless-mode-hangs-indefinitely-and-never-returns/150246) |
| Antigravity | [Headless mode](https://antigravity.google/docs/cli/headless) · [Gemini→Antigravity geçişi](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/) · [#76](https://github.com/google-antigravity/antigravity-cli/issues/76) · [#342](https://github.com/google-antigravity/antigravity-cli/issues/342) · [continuumcode AGY rehberi](https://continuumcode.ai/guides/antigravity-cli/) |
