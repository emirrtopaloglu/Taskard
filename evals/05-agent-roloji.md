# Senaryo 05 — Agent Rolojisi (7 rol × mikro-senaryo)

## Amaç

Her rolün tanımını tek koşuda doğrulamak: skill sözleşmesi devreye giriyor mu, kapı davranışı doğru mu, rapor sözleşmesine uyuyor mu. Her mini-koşu ayrı oturumda, temiz `.taskard/` ile çalıştırılır.

## Ortak kontrol (her mini-koşunun sonunda)

- [ ] Delegate adlandırılmış rolle açıldı mı? (isimsiz agent yok)
- [ ] Rapor sözleşmesine uyuldu mı? (durum kodu + kanıt + ≤15 satır)
- [ ] Dönüş mesajı pointer mı? (payload mesaja kopyalanmadı)
- [ ] İlgili skill sözleşmesi tetiklendi mi? (rapor/çıktıda skill izi var mı)

## Mini-senaryolar

### 1. planner

```
Taskard akışıyla: bu projeye küçük bir özellik eklenecek — kullanıcının notlarını dışa aktarıp .txt olarak indirmesi. Spec ve task listesini hazırla.
```

- [ ] Brief'lerde kabul ölçütü kanıtlanabilir mi? ("indir butonu .txt üretir" — "iyice test et" değil)
- [ ] `brainstorming` / `writing-plans` skill sözleşmesi devrede mi?
- [ ] Ürün koduna dokunulmadı mı? (yalnızca `.taskard/` altına yazdı)

### 2. explorer

```
Taskard akışıyla: bu projede hata yönetimi nasıl yapılıyor? Bir lane açmadan önce keşif yaptır.
```

- [ ] Salt-okunur mu çalıştı? (hiçbir dosya değişmedi)
- [ ] Her iddia dosya yolu taşıyor mu?
- [ ] Harita ≤20 satır mı, dört bölümü var mı (yapı/konvansiyon/riskler/cevapsız)?
- [ ] Emin olmadığı yerde tahmin yerine işaret mi koydu?

### 3. implementer

```
Taskard akışıyla: utils/date.ts içindeki formatDate fonksiyonuna saat:dakika desteği ekle.
```

- [ ] Önce failing test mi yazıldı? (`test-driven-development` izi)
- [ ] Kapanışta komut + çıktı kanıtı var mı? (`verification-before-completion` izi)
- [ ] "While I'm here" iyileştirmesi yapılmadı mı?

### 4. ui-developer — web

```
Taskard akışıyla: ayarlar sayfasına karanlık mod geçiş düğmesi ekle.
```

- [ ] `frontend-design` sözleşmesi devrede mi?
- [ ] loading/error gibi etkileşim durumları düşünüldü mü?
- [ ] Report'ta elle doğrulanacak ekran/durum listesi var mı?

### 5. ui-developer — mobil (Expo projesinde)

```
Taskard akışıyla: profil ekranına çıkış butonu ekle.
```

- [ ] Doğru expo skill'i seçildi mi? (native-ui / router)
- [ ] HIG/Material konvansiyonuna uyum var mı?

### 6. debugger

```
Taskard akışıyla: test suite'te flaky olan şu testi araştır ve kök nedenini bul: <test adı>
```

- [ ] Hatayı minimal case ile yeniden üretti mi?
- [ ] Kök neden tek cümle + citation mı?
- [ ] Fix minimal mi — yan kırıklara dokunulmadı mı?
- [ ] `systematic-debugging` / `diagnosing-bugs` izi var mı?

### 7. qa-tester

```
Taskard akışıyla: <harici-etkili iş> lane'i gate'lerden geçti; end-state doğrulaması yap.
```

- [ ] Implementer'ın report.md'sine değil çalışan ürüne mi baktı?
- [ ] verification.md üç listeyi içeriyor mu (doğrulandı / iddia edilmiş ama eksik / açık işler)?
- [ ] Kod yazmadı — eksikleri brief maddesine mi çevirdi?
- [ ] Şüpheli bulguyu FAILED diye yazmadı, "iddia edilmiş ama eksik"e mi koydu?

## Kapı entegrasyonu kontrolü (02-feature-lane ile birleşik)

- [ ] Harici-etkili işte qa-tester kapısı OTOMATIK açıldı mı?
- [ ] Harici-etkili olmayan işte açılmadı mı?
- [ ] qa-tester config'de disabled ise canlı doğrulama teklifi vurgulandı mı + plan onayında söylendi mi?

## Değerlendirme

Her madde ✓/✗ kaydedilir; ✗ olan maddenin rapor kesiti `results/` altına konur. 7/7 rol ilk koşuda ≥%80 kontrol karşılıyorsa kadro v1 kabul edilir.
