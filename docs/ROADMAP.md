# Taskard Roadmap

Dogfooding benchmark'ı: Reminder Tab A/B koşusu (2026-08-24) — Taskard $12.62 vs Taskard'sız $32.39, daha kısa sürede aynı kalite.

## Şimdi / sıradaki

- [x] **Agent kadrosu v1 (2026-08-26):** implementer + reviewer v2 (skill sözleşmeli, davranış sözleşmeli) · yeni roller: ui-developer (web→frontend-design, mobil→expo ailesi), qa-tester, explorer, planner, debugger. Karar: stack rolleri (backend-developer/data-engineer) agent YAPILMAZ — disiplin skill router + brief'te yaşar. *(Emir seçimi; gerekçe: .scratch/taskard/research/r4 + r5)*
- [x] **Agent tanımları için eval senaryoları:** 7 rolün mikro-senaryoları `evals/05-agent-roloji.md`'de (skill sözleşmesi + kapı davranışı kontrolleriyle). *(2026-08-26)*
- [ ] Eval koşuları: 05 roloji matrisinin ilk tam turu + tanım değişikliklerinde eval'siz commit atılmaması kuralının fiilen uygulanması
- [ ] Final review + ürün kararları turu + canlı doğrulama politikasının dogfooding ile doğrulanması

## v0.5 (OSS açılışı)

- [ ] Remote push + GitHub public · lisans · README EN
- [ ] Vendoring kararı: dış skill'ler pakete gömülecek mi (manifest + sync prosedürü) — bkz. docs/dependencies.md
- [ ] `npx taskard init` tarzı tek komut kurulum (kod gerektirir — bilinçli karar gerekir)
- [ ] Cursor/Antigravity tarifi genişletme + o harness'larda uçtan uca test
- [ ] Eval panelinin ilk sistematik koşuları (aynı görev × farklı model/harness matrisi)

## Ufuk (v0 sonrası)

- [ ] GUI zemini — izleyici / kontrol modu ileride (ayrı proje)
- [ ] GitHub Issues senkron katmanı
- [ ] Memory katmanının büyütülmesi (facts/, otomatik özetleme)
- [ ] Limit-farkındalıklı yönlendirmenin otomatikleşmesi
