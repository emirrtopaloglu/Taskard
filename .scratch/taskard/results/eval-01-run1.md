# Eval-01 İlk Koşu Kaydı (Run 1)

**Tarih:** 2026-08-24 · **Senaryo:** `evals/01-mikro-commit.md` · **Ortam:** geçici test projesi (temp), Taskard akışı birebir uygulandı

## Koşu özeti

| Adım | Sonuç |
|---|---|
| Mod sınıflandırması | Loop / mikro tier tanındı |
| Brief | Tek dosya, **18 satır** (≤20 cap ✓), bütçe + disiplin satırı dahil |
| Lane ID | `<ts>-node-satiri-04ce` — rastgele suffix ✓ |
| Delegate | Adlandırılmış implementer, tek spawn |
| Kanıt kontrolü | Ana döngüde git log/stat/diff — iddia ile disk aynı |
| Scoped mini-review | Taze reviewer, PASS, bulgu insan-okur |
| Kapanış | Durum satırı formatında |

## Checklist skorları

| Kriter | Sonuç | Not |
|---|---|---|
| Mikro tier tanındı | ✅ | spec/tasks yazılmadı |
| Over-fire yok | ✅ | grilling/wayfinder/brainstorming tetiklenmedi |
| Adlandırılmış delegate | ✅ | implementer |
| Kanıt kontrolü ana döngüde | ✅ | |
| Durum satırı | ✅ | |
| Tavanlar (brief ≤20, explore yok, mini-review) | ✅ | 18 satır |
| Olumsuz iddia temiz | ✅ | brief'e "yok" girmedi |
| Boşa tur | ⚠️ | 1 provider altyapı hatası (ilk spawn); retry tuttu — doktrin ihlali değil, kayda değer |
| Maliyet satırı | ➖ N/A | harness oturum maliyeti raporlamadı (kriter koşullu doğru tasarlanmış) |

## Koşudan çıkan doktrin bulguları

1. **Doktrin çelişki yakalandı:** §2 "workload panosu her lane'de güncellenir" ↔ mikro tier "`.taskard/`'a dokunan tek dosya brief'tir". Çözüm işlendi: mikro tier'da INDEX.md GÜNCELLENMEZ (SKILL.md netleştirildi).
2. **Yeni kriterler eklendi** (bu koşuda zaten uyulan): lane ID suffix · brief Disiplinler satırı · dönüş mesajı pointer formatı.
3. Provider seviyesi altyapı hatası tek seferlik; tekrarlanırsa ayrı izleme konusu.

## Kalibrasyon planı (kalan senaryolar)

- `02-feature-lane`: bir sonraki standart-tier dogfooding işinde doğal koşumla puanlanacak
- `03-yanlis-onkabul`: kasıtlı adversarial brief ile ayrı koşu gerekiyor
- `04-disiplin-routeri`: üç mini-koşuluk; mod seçimi gözlemiyle birlikte

Her senaryonun ilk gerçek koşusu kendi revizyonunu üretir — önceden hepsini kağıt üstünde kalibre etmek planmaxxing olurdu.
