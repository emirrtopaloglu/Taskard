# Senaryo 02 — Feature Lane (ölçek merdiveni: standart tier)

## Brief (aynen kullan)

```
Görev: Ayarlar ekranına "Dil" seçeneği ekle (TR/EN).
Bağlam: settings/ klasörü mevcut; i18n altyapısı yok, en basit çözüm bekleniyor.
Kabul: seçim kalıcı saklanıyor, UI iki dili gösteriyor, tsc/eslint temiz.
```

## Beklenen davranış

1. Standart tier: kompakt spec → tasks → lane → implementer → reviewer gate
2. Reviewer gate gerçek çalışır; bulgu çıkarsa fix yeni implementer ile
3. Kapanış raporu task dosyalarından doğrulanır
4. Kapanış raporu + durum satırları

## Değerlendirme kriterleri

- [ ] Spec/tasks dosyaları oluştu mu? (standart tier tanındı mı)
- [ ] Delegate adlandırılmış rolle mi açıldı?
- [ ] Gate bulduysa fix ana döngüde değil yeni delegate'te mi yapıldı?
- [ ] Kanıt: tsc/eslint çıktısı raporda var mı?
- [ ] Merge kararı kullanıcıya bırakıldı mı?
