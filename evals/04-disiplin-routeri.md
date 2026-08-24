# Senaryo 04 — Disiplin Router'ı (mod seçimi + over-fire kontrolü)

## Amaç

Mod seçiminin doğru çalıştığını ve skill'lerin SADECE tetiklendiğinde yüklendiğini gözlemlemek.

## Üç mini-koşu (aynı oturumda değil, ayrı ayrı)

### A. Mikro görev → LOOP modu, sıfır over-fire

```
Taskard akışıyla: README'deki kurulum bölümüne Node >=20 satırı ekle ve commit'le.
```

Kontrol:
- [ ] Mod sınıflandırması yapıldı mı (loop)?
- [ ] brainstorming/grilling/wayfinder TETİKLENMEDİ mi?
- [ ] Tek brief + tek implementer + kanıt kontrolü ile mi kapandı?

### B. Özellik görevi → LOOP modu + doğru disiplinler

```
Taskard akışıyla: Ayarlar ekranına dil seçeneği ekle (TR/EN), kalıcı saklanacak.
```

Kontrol:
- [ ] Standart tier tanındı; spec + tasks oluşturuldu mu?
- [ ] implementer tdd disipliniyle mi koştu (failing test önce)?
- [ ] Reviewer gate requesting-code-review kalibrasyonuyla mı geldi?
- [ ] Raporlar Humanish mi (PASS/DONE token'ı çıplak basılmamış)?

### C. Paralel kapsamlı görev → GRAPH modu

```
Taskard akışıyla: Auth modülü yenileme (backend+frontend bağımsız), migration
içerecek, iki ayrı ekip gibi paralel gidebilir.
```

Kontrol:
- [ ] Graph modu gerekçesiyle mi seçildi (≥2 koşul sayıldı mı)?
- [ ] DAG mermaid olarak üretildi mi?
- [ ] Lane'ler worktree izolasyonunda mı koştu?
- [ ] Brief'lerde bütçe alanı (max_deneme) var mı?
- [ ] Canlı durum Humanish telegraf ile aktarıldı mı?
