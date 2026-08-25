# Taskard

[🇬🇧 English](README.md)

Çoklu-harness agent orchestration **konvansiyon paketi** — `apps/` dışında çalışan kod yok.

Felsefe: her harness'ın (Claude Code, Codex, OpenCode...) kendi subagent yeteneği zaten vardır. Taskard o yeteneğin üstüne **doktrin** ekler: adlandırılmış roller, lane disiplini, brief kalitesi, rapor sözleşmesi, insan onay kapıları.

- Main agent (pahalı akıl) asla kod yazmaz: spec yazar, böler, delegate açar, yargı verir
- Her delegate **adlandırılmış** rolle açılır (implementer, reviewer, frontend-developer) — isimsiz agent yasak
- Model seçimi kullanıcıdadır: `config.toml` tablosu + doğal dil override
- Dört hafıza katmanı `.taskard/` markdown konvansiyonunda taşınır
- Cross-harness ihtiyaçlar skill içindeki headless bash tarifleriyle karşılanır

## Kurulum

```bash
git clone <repo-url> && cd taskard   # ya da mevcut klon
./install.sh
```

`install.sh` ne yapar (kod yok, sadece dosya):
1. Skill'i `~/.claude/skills/taskard` ve `~/.agents/skills/taskard` olarak symlink'ler
2. Adlandırılmış agent tanımlarını `~/.claude/agents/` ve `~/.opencode/agent/` altına symlink'ler
3. İlk kuruluşta `~/.taskard/config.toml` oluşturur (varsa ezmez)
4. `~/.claude/CLAUDE.md` ve `~/.claude/AGENTS.md`'e marker-wrapped statik direktif bloğu ekler (idempotent)
5. Dış disiplin skill'leri (superpowers + mattpocock) eksikse `npx skills` ile global kurar

Güncelleme: `./install.sh`'i tekrar çalıştır — config'in korunur.

Dış skill bağımlılıkları pakete GÖMÜLMEZ — kurulu olanlar referans edilir, upstream güncellemesi otomatik akar. Tam liste: [`docs/dependencies.md`](docs/dependencies.md).

## Deck

`.taskard` lane'leri için salt-okur canlı izleyici. `install.sh` tarafından `~/.taskard/deck/` altına kurulur.

```bash
node ~/.taskard/deck/server.mjs          # → http://localhost:7420
node ~/.taskard/deck/server.mjs --demo   # örnek veri
```

Hiçbir dosyaya yazmaz; sadece gözlemler.

## Kullanım

Proje dizininde harness'ını aç ve de:

```
Taskard akışıyla <görev>
```

Main agent seni grill'ler → spec yazar (`.taskard/context/specs/`) → task'lara böler (`T-001-slug.md`) → her task için lane açar → adlandırılmış delegate'lerle çalıştırır → kısa raporlarla sana sunar.

Senin karar noktaların:
- **Model/rol override** — *"bu implement'te opus kullan"* demen yeterli
- **Plan onayı** — spec onaylanmadan implementasyon başlamaz
- **Canlı doğrulama** — merge öncesi uygulamayı sen test edersin; merge kararı senin
- **Riskli işlemler** — config'deki listeyle eşleşen her adım onay ister

**Ölçek merdiveni:** mikro işler (tek adım, ~10 dk) tek brief ile koşar — spec/tasks dosyası yazılmaz, yeni kod üretilmiyorsa reviewer gate yerine bağımsız kanıt kontrolü yapılır. Tam seremoni standart işler içindir.

## Config

`config.toml` kod tarafından DEĞİL, agent tarafından okunan veridir:

```toml
[defaults]
permission_mode = "bypassPermissions"

[roles]
planner = "opus"
implementer = "sonnet"
reviewer = "opus"

[risky_operations]
patterns = ["migration", "deploy", "rm -rf", "drop table", "git push --force"]
```

Global: `~/.taskard/config.toml` · Proje bazlı: `<proje>/.taskard/config.toml` · Session: doğal dilin sözü en güçlüsü.

## Proje kurulumu (proje başına bir kez)

Main agent skill'deki tarifi izler: `.taskard/` ağacını kurar, proje CLAUDE.md/AGENTS.md'ine direktif bloğunu ekler. Elle yapmak istersen skill'in "Kurulum tarifi" bölümüne bak.

## Yeni rol ekleme

Domain uzmanı gerekiyorsa (örn. mobile-developer, data-engineer): `agents/` altına yeni `<rol>.md` tanımı ekle, `./install.sh` çalıştır — ya da sadece projeye `.claude/agents/<rol>.md` olarak koy.

## Mimari ilkeler (kısa)

1. Ana döngü asla kod yazmaz — spec, dispatch, yargı; gerisi delegate
2. İsimsiz subagent yasak — her elin bir rolü ve adı var
3. Damıtma sözleşmesi: delegate ≤15 satırla kanıtlı rapor verir
4. Config çalışma anında asla değiştirilmez
5. İnsan üç kapıda: plan onayı, merge öncesi doğrulama, riskli işlem listesi

Detaylı doktrin ve karar geçmişi: [wayfinder haritası](.scratch/taskard/map.md).
