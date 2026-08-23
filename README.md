# Taskard

Çoklu-harness agent orchestration paketi: pahalı akıl planlar, ucuz el uygular, insan üç kapıda onay verir.

- Claude Code, Codex, OpenCode üzerinde aynı şekilde çalışır
- Main agent (orchestrator) asla kod yazmaz; spec yazar, lane böler, model seçer, dispatch eder
- Delegate'ler headless çalışır, worktree'lerinde yalnız yaşar
- Model seçimi her zaman kullanıcıdadır: config tablosu + session override, fail-fast
- Dört hafıza katmanı `.taskard/` içinde dosya tabanlı taşınır

**Durum:** v0 geliştirme aşamasında (yol haritası: [`.scratch/taskard/map.md`](.scratch/taskard/map.md))

## Kurulum

Gereksinim: Node.js (https://nodejs.org) ve kullanacağın harness CLI'ları (Claude Code / Codex / OpenCode) oturum açmış halde.

```bash
git clone <repo-url> && cd taskard   # ya da mevcut klon
./install.sh
```

`install.sh` ne yapar:
1. Çalışma zamanını (`bin/`, `src/`) `~/.taskard/` altına kopyalar
2. Skill'i `~/.claude/skills/taskard` ve `~/.agents/skills/taskard` olarak symlink'ler
3. İlk kuruluşta `~/.taskard/config.toml` oluşturur (varsa ezmez)

Kodu güncelledikten sonra `./install.sh`'i tekrar çalıştır — config'in korunur.

## Kullanım

### Hızlı başlangıç

Proje dizininde Claude Code'u aç ve de:

```
Taskard akışıyla <görev>
```

Main agent seni grill'ler (netleştirici sorular) → spec yazar (`.taskard/context/specs/`) → task'lara böler (`T-001-slug.md`) → her task için lane açar → delegate'leri dispatch eder → raporları sana aktarır.

Senin karar noktaların:
- **Model/harness seçimi** — her dispatch'te açıkça sorulur veya config'ten okunur. Canlı override: *"bu implement'te sonnet kullan"*
- **Plan onayı** — spec onaylanmadan implementasyon başlamaz
- **Canlı doğrulama** — merge öncesi uygulamayı sen test edersin
- **Riskli işlemler** — config'deki listeyle eşleşen her adım onay ister

### Config

Global: `~/.taskard/config.toml` · Proje bazlı override: `<proje>/.taskard/config.toml`

```toml
[defaults]
timeout_seconds = 1200      # dispatch başına watchdog
max_attempts = 2            # lane başına en fazla deneme

[roles]
planner = "opus"
implementer = "sonnet"
reviewer = "opus"

[risky_operations]
patterns = ["migration", "deploy", "rm -rf", "drop table", "git push --force"]
```

Miras zinciri: global default ← proje override ← session talimatı.

### CLI Referansı

```bash
node ~/.taskard/bin/taskard.js init [--project dir]

node ~/.taskard/bin/taskard.js dispatch <lane-dir> \
  --harness <claude|codex|opencode> \
  [--model m] [--brief p] [--project dir] [--timeout sn]
# ya da: dispatch --lane <dir> ...

node ~/.taskard/bin/taskard.js lane new <slug> [--base branch] [--project dir]
node ~/.taskard/bin/taskard.js status [--project dir]
```

`init`: projede `.taskard/` ağacını kurar (INDEX, context, tasks, handoff, memory).
`dispatch`: brief'i okur → delegate'i **proje kökünde** headless spawn eder (`--project`) → env temizler → watchdog başlatır → JSON çıktıyı parse eder → `events.jsonl`'a yazar → report döndürür. İstenen model hedef harness'ta yoksa **fail-fast**: sessiz fallback yok, mevcut modeller listelenir.

### `.taskard/` klasörü (projenizde otomatik oluşur)

```
.taskard/
├── INDEX.md              # ≤200 satır — oturum açılışında okunan tek dosya
├── config.toml           # proje bazlı override (opsiyonel)
├── context/              # CONTEXT.md, ADR'ler, spec'ler
├── tasks/T-NNN-slug.md   # task durumu (frontmatter)
├── lanes/<ts>-<slug>/    # brief.md · events.jsonl · worklog.md · report.md
├── handoff/              # oturumlar arası devir belgeleri
├── memory/personal.md    # kullanıcı tercihleri
└── tmp/
```

## Geliştirme

```bash
cd ~/www/Taskard
node bin/taskard.js status          # doğrudan repodan koştur
for f in src/**/*.js bin/*.js; do node --check $f; done   # sözdizimi kontrolü
```

Sıfır npm bağımlılığı — Node gömülü modülleri yeterli. TOML parser alt küme (`src/toml.js`); ihtiyaç büyürse standart parser'a geçilir.

## Mimari ilkeler (kısa)

1. Ana döngü asla kod yazmaz — spec, dispatch, yargı; gerisi delegate
2. Bir task = bir lane = bir worktree = tek delegate
3. Damıtma sözleşmesi: delegate ≤15 satırla rapor verir (~50x sıkıştırma)
4. Karar upstream'de verilir; downstream aptal uygulayıcıdır
5. Evidence before claims — rapora değil üretime bakılır

Detaylı doktrin ve açık kararlar: [wayfinder haritası](.scratch/taskard/map.md).
