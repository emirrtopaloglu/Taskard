---
name: taskard
description: Çoklu-harness agent orchestration konvansiyonu. Görevi sınıflandırır (Nano/Express/Full), point-to-range brief yazar, adlandırılmış subagent'lara dağıtır ve kalite kapılarını işletir.
---

# Taskard

Görevi Taskard akışıyla yürüt. Ana döngü yalnızca akıl ve koordinatördür; kod yazmaz, test koşmaz, tek meşru hamlesi adlandırılmış delegate açmaktır.

## 1. Mod Seçimi (3 Kademeli Hız Şanzımanı)

Akışın BAŞINDA görevi sınıflandır. Oturumda söylenen (*"bunu nano yap"*, *"full yap"*) anında geçerlidir.

| Mod | Süre | Kapsam & Seremoni Düzeyi |
|---|---|---|
| ⚡ **NANO** | **< 1-2 dk** | **Agresif Tercih / Sıfır Dosya:** Tek dosya, typo, stil/CSS, tek fonksiyonluk fix, config. `.taskard/` altına dosya yazılmaz. Tek `implementer` açılır, diff üretilir, ana döngü diff'i doğrular ve sunar. Ayrı review subagent açılmaz. |
| 🚀 **EXPRESS** *(Varsayılan)* | **5-10 dk** | **Hafif Dokümantasyon:** 2-4 dosyalık özellikler, yeni bileşenler, endpoint'ler, küçük refactor'lar. Grilling ve spec YOKTUR. Tek `brief.md` + tek `implementer` + tek `reviewer` (mini-review) gate. |
| 🏛️ **FULL** *(Graph)* | **15-30 dk** | **Tam Seremoni:** Karmaşık mimari, ≥2 paralel lane (git worktree), veri migration/auth. Grilling/Ürün Kararları (`grill-with-docs`/`grill-me`) → Spec (`context/specs/`) → Tasks (`tasks/`) → Paralel Lane DAG → QA → Final Review. |

> **Ratchet Kuralı:** Nano veya Express çalışırken kapsam genleşirse (>4 dosya, beklenmeyen bağımlılık), akış derhal bir üst moda yükseltilir; asla gereksiz ağır modda başlanmaz.

## 2. Disiplin Router'ı (Pull-Based)

Akış başında `using-superpowers` varsa onunla başla; yoksa bu tablo tek kaynaktır. **Koşul yoksa skill yüklenmez.** Eksik skill akışı durdurmaz; rol sözleşmesindeki çekirdek kural geçerlidir.

| Faz / Koşul | Skill | Görevi |
|---|---|---|
| Akış başı | `using-superpowers` | Skill yönlendiricisi (varsa) |
| Spec öncesi (Full) | `brainstorming` | Niyet ve gereksinim netleştirme |
| Hizalanma / Karar (Full) | `grilling` + `domain-modeling` | Büyük/riskli işte varsayım sorgulama & terimler |
| Ürün kararları turu | `grill-with-docs` / `grill-me` | Spec kilidi öncesi mevcut-hedef farklarını sorma |
| Sisli kapsam (>1 oturum) | `wayfinder` | Çok oturumlu kapsam haritalama |
| Mimari / Arayüz (Seam) | `codebase-design` | Modül sınırları ve arayüz tasarımı |
| Plan dokümanı (Full) | `writing-plans` | Spec'ten brief/task çıkarma |
| Paralel lane'ler (Full) | `dispatching-parallel-agents` + `using-git-worktrees` | ≥2 bağımsız lane izolasyonu |
| Merge çakışması | `resolving-merge-conflicts` | Worktree merge çakışma çözümü |
| Fix döngüsü | `receiving-code-review` | Review bulgularını doğrulayıp uygulama |
| Blocker teşhisi (2. hata) | `systematic-debugging` | Kök neden analizi (Circuit Breaker) |
| Bitiş entegrasyonu | `finishing-a-development-branch` | Yeşil suite sonrası merge menüsü |

*(Not: TDD ve kanıt disiplini doğrudan `implementer` rol sözleşmesine gömülüdür; harici skill yükleme gerektirmez.)*

## 3. Demir Kurallar (Iron Laws)

1. **Config dosyaları çalışma anında ASLA değiştirilmez.**
2. **Ana döngü asla kod yazmaz.**
3. **İsimsiz subagent yasaktır** (her delegate adlandırılmış rolle açılır).
4. **Başarı beyanı değil kanıt raporlanır.**
5. **2-Strike Kuralı (Circuit Breaker):** Lane başına en fazla 1 düzeltme denemesi; 2. hatada akış DURUR ve kullanıcıya 3 seçenek sunulur: (1) Teknik netleştirme, (2) Alternatif yol, (3) Kontrolü devret.
6. **Riskli işlemler kullanıcı onayı olmadan yapılmaz** (config `risky_operations`).

## 4. Self-Priming Brief & Point-to-Range Standardı

Express ve Full modlarında her lane için `.taskard/lanes/<ts>-<slug>-<suffix>/brief.md` doldur (suffix: 4 karakter rastgele, örn. `-a3f2`).

- **Ön Kabul Doğrulaması:** Brief yazmadan önce iddiaları kontrol et (`ls`/`grep`). İddia yanlışsa uydurma, kullanıcıya sor.
- **Point-to-Range Kuralı:**
  1. Brief'e **ASLA** kod veya fonksiyon gövdesi yapıştırılmaz.
  2. Yalnızca dosya yolu ve satır aralığı verilir: `## Context Files: src/auth/session.ts#L40-L65`.
  3. Delege ilk adımda yalnızca bu satır aralıklarını okur (`view_file` StartLine/EndLine).
- **Brief Formatı:**
  - `## Context Files` (Zorunlu): İlgili kod satır aralıkları + önceki lane raporu yolları.
  - `## Kabul Kriterleri`: Somut ve kanıtlanabilir maddeler.
  - `## Kapsam Dışı`: Dokunulmayacak alanlar.
  - `## Disiplinler`: `Bütçe: max 1 retry (2-Strike) · TDD & Kanıt Zorunlu`.

## 5. Katmanlı Model Matrisi (Smart Tiering)

| Rol | Express Mod (Varsayılan) | Full Mod (Derinlik) |
|---|:---:|:---:|
| **`planner`** | *(Atlanır)* | **`opus`** |
| **`reviewer`** | **`sonnet`** *(Hızlı mini-review)* | **`opus`** *(Derin mimari & güvenlik)* |
| **`debugger`** | **`sonnet`** *(Hedefli fix)* | **`opus`** *(Karmaşık kök neden)* |
| **`implementer`** | **`sonnet`** | **`sonnet`** |
| **`ui-developer`** | **`sonnet`** | **`sonnet`** |
| **`explorer`** | **`haiku`** *(Hafif model)* | **`haiku`** |
| **`qa-tester`** | **`haiku`** | **`haiku`** |

*Öncelik:* `agents/*.md` < `~/.taskard/config.toml` < `.taskard/config.toml` < Oturum Sözü.

## 6. Kalite Kapıları & Rapor Sözleşmesi

- **Rapor Kapısı (`report.md` - ≤15 satır):**
  ```
  STATUS: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
  DIFF_SUMMARY: Değişen dosyalar (+X, -Y)
  EVIDENCE: Koşan test/komut ve tam çıktısı
  HASH: commit-hash (oluştuysa)
  ```
  *Dört alan sırayla yoksa rapor reddedilir; tek satırlık format düzeltme turu istenir (2-Strike sayılmaz).*

- **Review Kapısı:**
  - **Nano:** Ayrı subagent yok; ana döngü diff'i doğrular.
  - **Express:** Scoped `reviewer` (`sonnet` ile ≤5 satır bulgu, standartlar + diff).
  - **Full:** `reviewer` (`opus`) + harici-etkili işlerde `qa-tester` + son `final review`.

- **Açıklayıcı Telegraf & Kapanış:**
  - Her aşamada tek cümle Humanish bilgilendirme (durum kodları sohbete basılmaz).
  - Kapanışta kullanıcıya günlük dille **"Senin test etmen gerekenler"** kontrol listesi sunulur.
  - Merge kararı ve canlı onay her zaman kullanıcıdadır.

---

## Ek Referanslar (Disclosed)
- [Proje Kurulum Kılavuzu](references/project-setup.md)
- [Hafıza & Handoff Formatı](references/memory-and-handoff.md)
- [Cross-Harness Headless Başlatma](references/cross-harness.md)
