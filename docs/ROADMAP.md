# Taskard Roadmap

Dogfooding benchmark'ı: Reminder Tab A/B koşusu (2026-08-24) — Taskard $12.62 vs Taskard'sız $32.39, daha kısa sürede aynı kalite.

## Şimdi / sıradaki

- [ ] **Agent kalitesi ve çeşitliliği:** mevcut tanımlar (implementer/reviewer/frontend-developer) bilinçli olarak yüzeysel; her rol derinleştirilecek ve yeni roller eklenecek (backend-developer, qa-tester, data-engineer...). Her güncelleme eval senaryolarıyla doğrulanır. *(Emir kararı — şimdilik todo)*
- [ ] Final review + ürün kararları turu + canlı doğrulama politikasının dogfooding ile doğrulanması

## v0.5 (OSS açılışı)

- [ ] Remote push + GitHub public · lisans · README EN
- [ ] Vendoring kararı: dış skill'ler pakete gömülecek mi (manifest + sync prosedürü) — bkz. docs/dependencies.md
- [ ] `npx taskard init` tarzı tek komut kurulum (kod gerektirir — bilinçli karar gerekir)
- [ ] Cursor/Antigravity tarifi genişletme + o harness'larda uçtan uca test
- [ ] Eval panelinin ilk sistematik koşuları (aynı görev × farklı model/harness matrisi)

## Ufuk (v0 sonrası)

- [ ] GUI zemini (protokol arayüzden bağımsız kalarak)
- [ ] GitHub Issues senkron katmanı
- [ ] Memory katmanının büyütülmesi (facts/, otomatik özetleme)
- [ ] Limit-farkındalıklı yönlendirmenin otomatikleşmesi
