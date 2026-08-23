---
name: taskard
description: Çoklu-harness agent orchestration. Kullanıcı bir görevi Taskard akışıyla yürütmek istediğinde (spec → lane → dispatch → gates → PR), model tier'larını yönetmek istediğinde veya işleri paralel sub-agent'lara dağıtmak istediğinde kullan.
---

# Taskard

Argüman olarak verilen görevi Taskard akışıyla yürüt. Akış, görev bitene kadar geçerli bir operasyon modudur.

## Sözlük

- **Ana döngü** — sen. Yalnızca akıl: spec yazarsın, task bölersin, model seçersin, dispatch edersin, gelen rapora yargı verirsin, sentezlersin. Elini işe sokmazsın.
- **Lane** — bir task'ın kendi worktree'si, o worktree'de çalışan tek delegate ve merge öncesi gate'leri. Bir task = bir lane.
- **Delegate** — `taskard dispatch` ile ayağa kalkan headless worker (Claude Code / Codex / OpenCode).
- **Brief** — delegate'e verilen spec; lane'in kalitesi brief'in kalitesiyle sınırlıdır; token'ı brief'e yatır.
- **Report** — delegate'in bitişte report.md'e yazdığı ≤15 satır: durum (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT) + ne yapıldı + nelere dikkat.

## Mod boyunca açık kalan şartlar

- Ana döngü elini işe sokmaz: dosya düzenlemek, test koşmak, build hatası kovalamak delegate işidir. Tek meşru hamle yeni delegate dispatch etmektir. "Bu küçük, ben hallederim" bu kuralın tek ihlal biçimidir.
- Her dispatch'te harness ve model AÇIKÇA yazılır. Model seçimi her zaman kullanıcıdadır: config'ten oku, belirsizse kullanıcıya sor. İstenen model hedef harness'ta yoksa sessizce değiştirme — fail-fast yap, seçenekleri listele, kararı kullanıcıya ver.
- Brief'in sonuna zorunlu talimat ekle: "Bitince report.md'e ≤15 satır yaz: durum (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT) + ne yapıldı + nelere dikkat."
- Riskli işlem listesi (`config.toml` → risky_operations) ile eşleşen her adım öncesinde kullanıcı onayı al.

## 1. Spec

Proje kökünde `.taskard/` yoksa önce bir kez: `node ~/.taskard/bin/taskard.js init --project <proje-kökü>`

Görev küçük ve iyi tanımlıysa doğrudan kompakt spec yaz; büyük veya riskliyse grilling yap (design tree, frontier tur tur, önerilen cevaplı sorular). Spec'i `.taskard/context/specs/` altına yaz.

## 2. Task listesi

Spec'ten task çıkar; her task `.taskard/tasks/T-NNN-slug.md` dosyası olur (frontmatter: status, blocked_by, assignee). Bağımsız task'ları paralel çalıştırabilirsin; bağımlı olanları sıraya koy.

## 3. Lane aç ve dispatch

Her task için:

```bash
node ~/.taskard/bin/taskard.js lane new <slug> --project <proje-kökü>
```

brief.md'i doldur, worktree'i hazırla, sonra:

```bash
node ~/.taskard/bin/taskard.js dispatch <lane-dir> \
  --harness <claude|codex|opencode> \
  --model <model> \
  --project <proje-kökü>
```

Dönen JSON'daki `report` alanını oku. Delegate `--project` ile verilen dizinde çalışır — brief'e cd talimatı eklemene gerek yok. BLOCKED ise aynı lane'de en fazla 1-2 deneme daha yap; üçüncüde teşhisi toplayıp kullanıcıya raporla. Geçerli blocker yoksa bağımsız sonraki lane'e geç, takılanı sonra dön.

## 4. Gate'ler

Lane bittiğinde sırayla iki kapı, ikisi de ayrı taze sub-agent'ta:
1. code-review (standartlar + spec uyumu)
2. merge öncesi son kontrol

Bulgu varsa düzeltme yine yeni delegate ile, aynı lane'de.

## 5. Canlı doğrulama ve kapanış

Gate'leri geçen lane'i boşta bir portta çalıştır, kullanıcıdan onay iste. Onay gelirse PR aç, lane'i kaldır. Gelmezse lane açık kalır, revize yeni delegate ile sürer.

Tüm lane'ler geçince kapanış raporu: hangi lane'ler merge'e hazır, hangileri açık. Merge kararını kullanıcıya bırak.

Her task sonunda tek satır durum: `Yapıldı` · `Sonraki` · `Engel`.
