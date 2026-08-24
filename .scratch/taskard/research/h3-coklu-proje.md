---
title: H3 — Çoklu-Proje Eş Zamanlı Koşu Analizi
type: wayfinder-research
ticket: issues/18-coklu-proje-analizi.md
status: done
created: 2026-08-24
---

# İki Projede Taskard Oturumu Aynı Anda — Ne Olur?

**Yöntem:** Yerel inceleme (Taskard repo, `~/.taskard/`, harness config'leri, tek gerçek `.taskard/` örneği: studypal) + akıl yürütme + temp altında iki simüle repo ile yapısal saha prova (`/var/folders/.../opencode/h3-fieldtest/` — gerçek repo'lara dokunulmadı, kod yazılmadı).

## Özet yargı

İki **farklı** projenin eş zamanlı koşusu mimari olarak sağlam: `.taskard/` tamamen per-proje, worktree metadata repo-lokal, global kaynaklar salt-okunur tüketiliyor. Gerçek riskler mekanik değil, **insan dikkat katmanı ve paylaşılan kota katmanında**. En zayıf halka ise komşu senaryo: **aynı projede ikinci oturum** — lane dizisi adlandırma şeması buna karşı korumasız.

---

## Bulgu listesi

### 🟢 GÜVENLİ — doğal izolasyon zaten var

**B1. `.taskard/` dosya uzayı tamamen per-proje.**
`INDEX.md`, `lanes/`, `tasks/`, `context/`, `memory/`, `handoff/`, `tmp/` hepsi proje kökünde yaşar. İki projenin oturumları hiçbir dosyaya ortak yazmaz. Saha provada çapraz sızıntı sıfır.

**B2. Worktree izolasyonu repolar arası sağlam.**
`using-git-worktrees` konvansiyonu worktree'ü proje kökünde `.worktrees/` altına koyar; git worktree metadata'sı (`<repo>/.git/worktrees/<ad>`) repo-lokaldır. Saha prova: **iki farklı repoda aynı branch adı + aynı worktree adı** (`feature/paylasilan-ad` / `T-001`) sorunsuz bir arada yaşadı; `git worktree list` yalnızca kendi repo'sunun path'lerini gösterir. Proje A'nın lane'i proje B'nin reposuna mekanik olarak karışamaz — karışabilmesi için brief'te B'nin absolute path'inin geçip delegate'in oraya yazması gerekir ki bu kapsam disiplini ihlalidir (implementer tanımındaki "brief dışına çıkmak yasak" kanunu bunu zaten yasaklar).

**B3. Global `config.toml` read-only iron law ile korunuyor.**
10 paralel okuma temiz; proje override'u ayrı dosyada (`<proje>/.taskard/config.toml`), session override'u doğal dilde oturum-lokal. İki oturum birbirinin model seçimini etkileyemez. Config'e çalışma anında yazan mekanizma yok (kod yok prensibinin yan faydası).

**B4. Paylaşımlı skill + agent tanımları salt-okunur tüketim.**
`~/.claude/skills/taskard`, `~/.claude/agents/*` symlink'leri iki oturum tarafından sadece okunur; APFS'te eş zamanlı okuma sorun üretmez. Üstelik tutarlılık avantajı: her iki projedeki implementer/reviewer aynı doktrinle çalışır.

**B5. Mem0 MCP riski şu an teorik.**
Claude Code global + proje config'lerinde, OpenCode config'inde ve taranan proje `.mcp.json`larında mem0 tanımlı değil; map'te zaten out-of-scope ("Mem0 unutuldu"). Gelecekte global MCP olarak eklenirse iki oturum aynı memory store'a yazacağı için **cross-project hafıza sızıntısı** (A projesi bağlamının B oturumuna akması) doğar — o gün geldiğinde store-per-proje namespace'i istenmeli.

### 🔴 RİSKLİ

**B6. Lane dizisi adlandırma şeması unique-guard içermiyor — brief overwrite kanıtlı.**
Saha prova: `mkdir -p .taskard/lanes/202608241201-fix-login` iki kez → diziler sessizce birleşti, ikinci `brief.md` ilkini **ezdi**. Gerçek koşuda şema zaten gevşek uygulanmış (studypal'de üç format yan yana: ts'siz `add-plan-material`, `20260823-…`, `202608241301-formatında`). Aynı projede hızlı ardışık lane açılışı veya **aynı projede ikinci oturum** durumunda lane kaydı + brief kaybı gerçekleşir. İki-farklı-proje senaryosunu doğrudan vurmasa da "eş zamanlı koşu" sorusunun en yakın düşmanı bu.

**B7. Maliyet/limit görünürlüğünde agregasyon yok.**
İki oturum aynı aboneliğin limitini birlikte yer ama hiçbir harness iki oturumun toplam harcamasını göstermez; Taskard'da limit bilgisi tamamen "kullanıcı bildirir" bazlı (SKILL.md Ek A). Graph modundaki `budget_minutes` cap'i oturum-lokaldir — iki oturumun toplam tavanı yoktur. Headless dispatch tarifeleri (`claude -p`, `codex exec`) ayrıca aynı API hesabına rate-limit baskısını birlikte bindirir. Sonuç: kullanıcı limit yendiğini ancak hata/hudut mesajıyla öğrenir.

### 🟡 DİKKAT — mekanik değil, disiplin riski

**B8. İnsan onay kapıları iki akışta karışabilir.**
Doktrin üç kapıda insan onayı ister (plan, merge, `risky_operations`: deploy/migration/rm -rf/push --force). bypassPermissions worker + iki paralel akış = kullanıcının hangi projeden gelen isteği onayladığı belirsizleşebilir. Onay isteği metninde proje/repo kökü zorunlu değil.

**B9. Canlı oturumda `install.sh` yeniden koşmak her iki oturumu da değiştirir.**
Symlink'li skill/agent tanımları paylaşımlı olduğundan mid-run install = çalışan oturumların doktrinini anında değiştirir. "Config çalışma anında değiştirilmez" iron law'u install.sh için açıkça yazılı değil.

**B10. Aynı projede ikinci oturum: INDEX.md son-yazan-kazanır.**
Saha prova: iki oturumun pano güncellemesi çakışınca biri kayboldu. Komşu bulgu (soru iki farklı proje diye soruldu) ama tek-proje-tekrar-açma en gerçekçi kazadır.

**B11. `~/.taskard/src/` artığı — eski Node runtime hâlâ globalde duruyor.**
PIVOT repodan runtime'ı kaldırdı ama install.sh global kurulumu temizlemiyor; `src/adapters/{claude,codex,opencode}.js` ölü kod olarak duruyor. Concurrency ile doğrudan ilgisiz; global state hijyen göstergesi + yanlış referans kaynağı.

---

## Kural taslağı (SKILL.md'e eklenecek)

```markdown
## Çoklu oturum disiplini
- Lane dizisi adı daima `YYYYMMDDHHmmss-<slug>` formatındadır; açmadan önce dizinin VAR OLMADIĞI doğrulanır — mevcut lane dizisine asla sessizce yazılmaz.
- Onay isteklerinde (özellikle risky_operations) proje/repo kökü cümlede geçmek ZORUNDADIR; hangi işe onay verildiği belirsizse onay istenmez.
- Aynı abonelikte ikinci paralel oturum açılırken kullanıcıya limit paylaşımı hatırlatılır; budget_minutes oturum-lokaldir, iki oturumun toplam tavanı değildir.
- Canlı Taskard oturumu varken install.sh yeniden çalıştırılmaz.
```

## Emir'e sorulacak karar sorular

1. **Lane ID garantisi:** uniqueness konvansiyonla mı kalsın (agent davranışı) yoksa timestamp+sayaç gibi mekanik şemaya mı geçilsin? (Kod-yok prensibiyle sadece konvansiyon eklenebilir.)
2. **Aynı projede ikinci oturum:** yasak mı, yoksa INDEX.md çakışmasından dolayı "ikinci oturum salt-okunur destek modunda" mı açılmalı?
3. **Maliyet görünürlüğü:** kapanış raporundaki maliyet satırı yetiyor mu, yoksa INDEX.md'e oturum-başı bütçe satırı mi gelsin? İki-paralel-projede toplam görünürlüğü kim taşır?
4. **Onay etiketi:** "onay isteğinde proje adı zorunlu" kuralı SKILL.md'e mi, agent tanımlarına mı yazılmalı?
5. **Temizlik:** `~/.taskard/src/` artığını install.sh kaldırsın mı (tek satır `rm -rf "$DEST/src"`)?

## Saha prova kanıtı

Konum: `/var/folders/cz/8d753gn92_3bcnlk2__th8cm0000gn/T/opencode/h3-fieldtest/` (temp, temizlenebilir)

| Test | Kurulum | Sonuç |
|---|---|---|
| T1 | İki repo, ayrı lane dizileri | İzole, çakışma yok |
| T2 | Aynı repo'da aynı saniye+slug | `brief.md` overwrite edildi |
| T3 | İki repo, aynı branch+worktree adı | Birlikte yaşadı; metadata repo-lokal |
| T4 | Aynı repo, iki oturum INDEX.md yazımı | Son-yazan-kazanır, kayıp |
| T5 | 10 paralel global config okuması | Temiz |
