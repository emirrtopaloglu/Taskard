# Taskard

[🇬🇧 English](README.md)

Çoklu-harness agent orchestration **konvansiyon paketi** — saf konvansiyon, sıfır çalışma zamanı kodu.

Felsefe: her harness'ın (Claude Code, Codex, OpenCode...) kendi subagent yeteneği zaten vardır. Taskard o yeteneğin üstüne **doktrin** ekler: adlandırılmış roller, lane disiplini, brief kalitesi, rapor sözleşmesi, insan onay kapıları.

- Main agent (pahalı akıl) asla kod yazmaz: spec yazar, böler, delegate açar, yargı verir
- Her delegate **adlandırılmış** rolle açılır (implementer, reviewer, ui-developer, qa-tester, explorer, planner, debugger) — isimsiz agent yasak
- Her rolün **zorunlu skill sözleşmesi** vardır: Superpowers / Matt Pocock / Expo skill'leri kuruluysa ilgili rolde kullanmak mecburidir — skill'ler kalibrasyon katmanıdır
- Kapanış raporu her zaman **elle test listesi** taşır: senin bizzat denemen gerekenler; her satır tek eylem + beklenen sonuç, günlük dilde
- Model seçimi kullanıcıdadır: `config.toml` tablosu + doğal dil override
- Dört hafıza katmanı `.taskard/` markdown konvansiyonunda taşınır
- Cross-harness ihtiyaçlar skill içindeki headless bash tarifleriyle karşılanır

## Kurulum

```bash
git clone <repo-url> && cd taskard   # ya da mevcut klon
./install.sh
```

`install.sh` ne yapar:
1. Skill'i `~/.claude/skills/taskard` ve `~/.agents/skills/taskard` olarak symlink'ler
2. Adlandırılmış agent tanımlarını `~/.claude/agents/` ve `~/.opencode/agent/` altına symlink'ler
3. İlk kuruluşta `~/.taskard/config.toml` oluşturur (varsa ezmez)
4. `~/.claude/CLAUDE.md` ve `~/.claude/AGENTS.md`'e marker-wrapped statik direktif bloğu ekler (idempotent)
5. Dış disiplin skill'leri (superpowers + mattpocock) eksikse `npx skills` ile global kurar

Güncelleme: `./install.sh`'i tekrar çalıştır — config'in korunur.

Dış skill bağımlılıkları pakete GÖMÜLMEZ — kurulu olanlar referans edilir, upstream güncellemesi otomatik akar. Tam liste: [`docs/dependencies.md`](docs/dependencies.md).

## Kullanım

Proje dizininde harness'ını aç ve de:

```
Taskard akışıyla <görev>
```

Taskard görevi uygun hız kademesine sınıflandırır ve yürütür:
- ⚡ **Nano (<2-3 dk):** 1 dosya, typo veya CSS/stil fix'i için hızlı şerit. Sıfır dosya; tek implementer + doğrudan doğrulama.
- 🚀 **Express (Varsayılan, 5-10 dk):** 2-4 dosyalık net özellikler ve bileşen eklemeleri. Self-priming brief (`brief.md`) + implementer + scoped mini-review gate. Ağır grilling/spec dosyası yok.
- 🏛️ **Full (15-30 dk):** Karmaşık mimari, paralel worktree'ler ve kritik veri/auth değişiklikleri. Tam grilling → spec → tasks → DAG → QA → final review.

Senin karar noktaların:
- **Mod & Model override** — *"bu işi full modda ve implementer'da opus ile yap"* demen yeterli
- **2-Strike Kuralı (Circuit Breaker)** — bir lane en fazla 1 kez düzeltme dener; 2. hatada akış durur ve sana 3 net seçenek sunar
- **Plan onayı** — Full modda spec onaylanmadan kodlama başlamaz
- **Canlı doğrulama & merge** — canlı test onayı ve nihai merge kararı her zaman senindir
- **Riskli işlemler** — config'deki listeyle eşleşen her adım onay ister

## Config

`config.toml` kod tarafından DEĞİL, agent tarafından okunan veridir:

```toml
[defaults]
permission_mode = "bypassPermissions"
default_mode = "express"    # "nano" | "express" (varsayılan) | "full"
max_attempts = 2            # 2-Strike circuit breaker

[roles]
# Tier 1: Ağır Beyinler (Derin Strateji, Planlama & Final Yargı)
planner = "opus"
debugger = "opus"
reviewer = "opus"

# Tier 2: Hızlı & Güvenilir İşçiler (Aktif Kodlama & Arayüz)
implementer = "sonnet"
ui-developer = "sonnet"

# Tier 3: Işık Hızında Asistanlar (Geniş Keşif & Doğrulama)
# Not: model adları harness'a göre değişir; Tier 3 = o harness'ta karşılığı olan en ucuz/hızlı model.
explorer = "haiku"
qa-tester = "haiku"

disabled = []   # örn. ["debugger"] — bu roller hiç lane almaz; iş en yakın yetkili ele düşer

[qa]
enabled = false              # varsayılan KAPALI; açıldığında headless browser/test çalıştırır
headless_browser = false
run_integration_tests = false
auto_verify_endpoints = false

[risky_operations]
patterns = ["migration", "deploy", "rm -rf", "drop table", "git push --force"]
```

Global: `~/.taskard/config.toml` · Proje bazlı: `<proje>/.taskard/config.toml` · Session: doğal dilin sözü en güçlüsü.

Bir rol istemiyor musun? `disabled` listesine yaz — proje listesi global listeyi komple değiştirir, oturumdaki sözlerin ikisini de geçer. İş en yakın yetkili ele düşer; kapı rolü (reviewer / qa-tester) devre dışı bırakılırsa bu plan onayında açıkça söylenir, sessizce atlanmaz.

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
