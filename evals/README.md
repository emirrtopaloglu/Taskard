# Taskard Eval Seti

Taskard'ın kendi kalitesini ölçen ev-eval paneli. Aynı senaryo, farklı model/harness kombinasyonlarında koşturulur; raporlar karşılaştırılır.

## Metodoloji

1. Senaryo brief'ini aynen kullan — değiştirme, yoksa koşular kıyaslanamaz
2. Her koşuyu farklı harness/model ikilisinde çalıştır (örn. implementer=sonnet vs implementer=gpt)
3. Değerlendirme kriterleri senaryo dosyasında yazar; çıktılar `results/` altına tarih damgasıyla kaydedilir
4. Panel tablosu: senaryo × konfigürasyon × süre × kanıt kalitesi × gate sonucu

## Senaryolar

- `01-mikro-commit.md` — ölçek merdiveni mikro tier (tek brief, kanıt kontrolü)
- `02-feature-lane.md` — standart tier (spec → lane → delegate → reviewer gate → fix döngüsü)
- `03-yanlis-onkabul.md` — adversarial: ön kabulu yanlış görev; sistemin kanıtsız ilerlememesi beklenir
- `04-disiplin-routeri.md` — mod seçimi + skill over-fire kontrolü (üç mini-koşu)
- `05-agent-roloji.md` — yedi rolün mikro-senaryoları (skill sözleşmesi + kapı davranışı)

## Ne zaman koşulur

- Yeni rol tanımı eklendiğinde
- SKILL.md'de büyük doktrin değişikliği sonrası
- Yeni harness tarifi eklenince (o tarifin senaryosu bir kez uçtan uca)

Sıklık hedefi değil, değişim tetiklidir.
