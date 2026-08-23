---
title: Koşu Sırasında İnsan Deneyimi (Prototype)
type: wayfinder-ticket
label: wayfinder:prototype
status: closed
assignee: emir+jarvis (2026-08-23 oturumu — prototip sunuldu, varyant seçimi bekleniyor)
blocked_by: []
created: 2026-08-23
---

## Question

Bir koşu sırasında (5+ lane paralel, sub-agent'lar çalışıyor) insan terminal penceresinde NE GÖRMELİ? "Uzman proje yönetimini terminale sığdırmak" hedefinin görünür yüzü bu.

Çözülecek kararlar:

1. Durum bildirimi formatı: tek satır güncellemeler mi (`Yapıldı / Sonraki / Engel`), lane panosu mu, hem mi?
2. Hangi bilgi asıl: ilerleme yüzdesi, token harcaması, model/harness dağılımı, blocker listesi, sonraki karar noktası?
3. Ne sıklıkla güncellenir; insan rahatsız edilmeksizin nasıl akar?
4. Kapanış raporu neye benzer (hangi lane merge'e hazır, hangileri açık)?

Prototype: mock koşu transkripti + 2-3 radikal farklı durum gösterimi varyantı (tek HTML, ?variant= ile geçiş). Emir reaksiyon verir, seçim onundir.

## REVIZYON (2026-08-23, Emir geri bildirimi)

Melez beğenilmedi, geri alındı. Final karar: **SADECE açıklayıcı telegraf** — ana agent'ın kullanıcıya konuştuğu gibi tek satırlık cümleler (ne yapıldı/neden/ne bekleniyor), durum token'ları cümleye çevrilir. Prototip yeniden yazıldı; SKILL.md §5 güncellendi.

## Resolution (2026-08-23) — ilk karar (geçersiz)

Emir seçimi: **Melez** — lane panosu (üst) + telegraf akışı (alt) birlikte. Varyant prototipi: `.scratch/taskard/prototypes/insan-deneyimi.html` (★ Melez default; Telegraf/Pano/Sadece-Kararlar referansta durur).

Doktrine işlendi: SKILL.md §5 "Koşu anlatımı" — paralel koşuda pano özeti + tek satır telegraf; mikro işte tek satır.
