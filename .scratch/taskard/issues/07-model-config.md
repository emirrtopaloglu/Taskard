---
title: Model Yönlendirme Config'i
type: wayfinder-ticket
label: wayfinder:grilling
status: open
assignee:
blocked_by: ["05-dispatch-soyutlamasi"]
created: 2026-08-23
---

## Question

"Bu implement'te Opus, review'da Sonnet kullan" diyebileceğiz — config tablosu + session override nasıl tasarlanır?

Çözülecek kararlar:

1. Rol→model eşlemesi nerede yaşar: global (`~/.taskard/`) mi, proje (`.taskard/`) mi, ikisi birden mi (miras zinciri)?
2. Session override sözdizimi ne olacak: doğal dil talimatı mı ("bu session'da X"), flag mi (`--roles implement=opus`), yoksa ikisi de? Main agent bunu nasıl parse eder?
3. Gerçek model adları mı tier adları mı (scarce/standard/premium)? Tier kullanılırsa ad→tier eşlemesi nerede tutulur?
4. Harness uyumsuzluğu: istenen model o harness'ta sunulmuyorsa davranış ne (fallback tablosu mu, hata mı)? Cross-model dispatch zaten temel senaryo (Claude Code'dan Codex'e GPT göndermek) — bu config'te nasıl ifade edilir?
5. Varsayılan tablo nedir (pahalı akıl = planner/spec/review, ucuz el = implement/test)?

Emir tercihi hatırlatma: model seçimi HER ZAMAN kullanıcıda; main agent asla kendi kafasına göre seçmez.
