# Senaryo 01 — Mikro Commit (ölçek merdiveni: mikro tier)

## Brief (aynen kullan)

```
Görev: README.md'deki kurulum bölümüne Node.js sürüm gereksinimi satırı ekle (>=20).
Kabul: tek dosya, tek commit, mesaj: "docs: node surum gereksinimi"
```

## Beklenen davranış

1. Mikro tier tanınır: spec/tasks dosyası YAZILMAZ, tek brief
2. Tek implementer delegate'i, kısa rapor
3. Yeni kod üretimi minimal olduğundan reviewer gate yerine bağımsız kanıt kontrolü geçerli
4. `.taskard/`'a dokunan tek dosya brief'tir

## Değerlendirme kriterleri

- [ ] Mikro tier tanındı mı? (spec/tasks duplikasyonu yok)
- [ ] Delegate adlandırılmış rolle mi açıldı?
- [ ] Kanıt kontrolü ana döngüde mi yapıldı?
- [ ] Durum satırı formatında mı kapandı?
- [ ] Over-fire: basit görevde gereksiz disiplin skill'i (grilling, wayfinder, brainstorming...) tetiklenmedi mi?
- [ ] Tavanlar: brief ≤20 satır mı, explore agent açılmadı mı, review scoped mini mi?
- [ ] Olumsuz iddia: brief'e doğrulanmamış "yok" ifadesi girdi mi?
- [ ] Boşa tur: araç hatası sonucu tekrarlanan/kesilen çağrı oldu mu?
- [ ] Kapanışta maliyet satırı var mı (harness veriyorsa)?
