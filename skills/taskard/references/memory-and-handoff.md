# Taskard — Hafıza & Handoff Standartları

## 1. Kişisel Hafıza (`memory/personal.md`)
- **Yazma Kuralı:** Yalnızca kullanıcı açıkça bir tercih veya kalıcı kural beyan ettiğinde yazılır (*"bunu hatırla"*, *"ben hep pnpm kullanırım"*).
- **Okuma Kuralı:** Oturum açılışında varsa taranır.
- **Sınır:** ≤100 satır; maddeler halinde ve odaklı tutulur.

## 2. Oturum Handoff (`handoff/<ts>-<konu>.md`)
- **Yazma Kuralı:** Oturum kapanırken yarım kalan işler veya uzun koşu öncesi kritik karar bağlamı bırakılacağı zaman yazılır.
- **Zorunlu Alanlar:**
  - `STATUS`: Bekleyen durum
  - `COMPLETED`: Tamamlanan adımlar
  - `NEXT_STEPS`: Bir sonraki oturumda yapılacaklar
  - `REJECTED`: Denenip vazgeçilen yaklaşımlar (zorunlu)

## 3. Oryantasyon Zinciri
- **Nano:** Doğrudan hedef dosya.
- **Express:** Son `brief.md` ve `git diff`.
- **Full:** `tasks/*.md` frontmatter → son lane raporları → `personal.md` → en yeni `handoff`.
