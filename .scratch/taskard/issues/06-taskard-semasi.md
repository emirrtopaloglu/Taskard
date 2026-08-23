---
title: ".taskard/ Klasör Şeması (Dört Hafıza Katmanı)"
type: wayfinder-ticket
label: wayfinder:grilling
status: open
assignee:
blocked_by: ["04-r3-hafiza-formatlari"]
created: 2026-08-23
---

## Question

`.taskard/` klasör şeması: dört hafıza katmanı hangi dosyalarda, hangi formatta yaşayacak?

Çözülecek kararlar:

1. Dizin ağacı: hangi alt klasörler, hangi dosyalar? (proje bilgisi / task durumu / workload / kişisel hafıza ayrımı fiziksel mi tek dosyada bölüm mü?)
2. Kim ne zaman okur/yazar: main agent, sub-agent, insan — yazma çakışmaları nasıl önlenir (immutable snapshot mı append-only mi)?
3. Context ekonomisi: index + lazy load nasıl çalışır; bir oturum açılışında ne kadar yüklenir (akıllı zone'u korumak için bütçe)?
4. Task bölünme kaydı: iş implementasyonda büyürse main agent'ın açtığı yeni task nasıl temsil edilir (durum makinesi: open/claimed/done/blocked)?
5. Oturumlar arası köprü: Last-Session benzeri devir dosyası var mı; compaction sonrası kim neyi yeniden enjekte eder?
6. Kişisel hafıza katmanının OSS-genel yapısı: kullanıcıya özel bilgiler nerede ayrışır?

R3 araştırması format adaylarını getirecek; bu ticket onları karar'a çevirir.
