---
title: Hafıza + Handoff Doktrini
type: wayfinder-ticket
label: wayfinder:grilling
status: closed
assignee:
blocked_by: []
created: 2026-08-24
---

## Question

`.taskard/memory/` ve `.taskard/handoff/` klasörleri şemada var ama kim ne zaman ne yazıyor — doktrini belirsiz. Pasif klasörler token israfı ya da kayıp bağlam demek.

Kararlar:

1. **memory/personal.md:** kim güncelliyor (main agent mı, kullanıcı mı), ne sıklıkla, hangi tetikle? Oturum açılışında okunması zorunlu mu?
2. **handoff/:** hangi olayda devir belgesi yazılır (oturum kesilmesi, compaction öncesi, lane'ler arası uzun koşu)? "Oku-tüket" protokolü kimin sorumluluğunda?
3. **INDEX.md ile ilişki:** üç katman (INDEX/personal/handoff) birbirine nasıl bağlı; açılışta hangisi kaç satır yüklenir?
4. Kural setini SKILL.md'e ekle (kısa, 5-8 satır)

Çıkış kriteri: pasif klasör kalmadı; her klasörün yazan/okuyan/tetik üçlüsü tanımlı.


## Resolution (2026-08-24)

Doktrin SKILL.md'e işlendi ("Hafıza + Handoff" bölümü): personal.md yalnızca kullanıcı beyanıyla yazar + açılışta okunur (≤100 satır); handoff iki tetikte yazılır, `rejected` alanı zorunlu, oku-tüket = `consumed-` prefix; oryantasyon zinciri pull-based (tasks → lane raporları → personal → handoff). Emir onayıyla kilitlendi.
