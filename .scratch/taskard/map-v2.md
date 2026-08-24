---
title: Taskard Hardening — Wayfinder Haritası v2
created: 2026-08-24
modified: 2026-08-24
type: wayfinder-map
status: 🟢 complete — 9/9 ticket kapandı; eşik: Emir'in v0 kabul kararı
tags: [wayfinder, taskard, hardening]
---

# Taskard Hardening (v2 Haritası)

Önceki harita: [`map.md`](map.md) — 10/10 ticket kapandı, destinasyonuna ulaştı (Taskard v0 çalışır durumda, A/B benchmark'lı: $12.62 vs $32.39).

## Destination

**Taskard v0 Kabul:** bilinen tüm kusurlar kapatılmış, saha kanıtları toplanmış durumda — remote yedek var · eval seti en az bir kez koşup kendisi kalibre olmuş · cross-harness (Codex) saha testi yapılmış · paralel lane/worktree gerçek koşuda görülmüş · güvenlik postürü bilinçli seçilmiş (Emir'in kararıyla) · router çakışması çözülmüş · hafıza/handoff doktrini yazılı. Son eşik: Emir dogfooding'de "bitti" der. **OSS hazırlığı bu haritanın DIŞINDADIR** (ayrı effort).

## Notes

- **Domain:** Taskard konvansiyon paketinin olgunlaştırılması — kod değil doktrin/tarihçe/prosedür işi.
- **Karar sahipliği:** keşif ticket'larının bulguları Emir'e sunulur; NİHAİ KARAR HER ZAMAN EMİR'İN (Q56 kararı).
- **İlerleme temposu:** deadline yok; kalite-tetikli — her eşiğin çıkış kriteri yeşile dönmeden sıradakine geçilmez.
- Referanslar: retrospektif (2026-08-24 görüşmesi) · `docs/dependencies.md` · `docs/ROADMAP.md` · önceki harita + research dosyaları (`.scratch/taskard/research/`)
- Tracker: local markdown; ticket claim = frontmatter `assignee`.

## Decisions so far

- [Güvenlik Postürü](issues/16-guvenlik-posturu.md) — enforcement boşluğu ana risk (risky_operations'ın teknik uygulayıcısı yok); credential/exfiltration listede görünmez; deny-çevirimiyle "%99 otonom / %1 sert duvar" mümkün. Azaltım menüsü hazır → karar Emir'de.
- [Router Çakışması](issues/17-router-cakismasi.md) — rakip değil teslim ilişkisi: mod taskard'da, aday gösterme using-superpowers'ta, yükleme kararı tetikte; öncelik paragrafı taslağı hazır.
- [Çoklu-Proje](issues/18-coklu-proje-analizi.md) — izolasyon sağlam; kanıtlı riskler: lane ID overwrite, maliyet agregasyon sıfır, onay metninde proje adı, ~/.taskard/src artığı.
- **Karar turu 2026-08-24 (Q59-Q67):** güvenlik postürü AYNEN KALIR — deny çevirimi YOK, sandbox YOK, locked_files YOK ("agent ne derse o", Emir). Girenler: routing önceliği directive block'a (v2) · brief'e zorunlu Disiplinler satırı · lane ID rastgele suffix · onayda proje adı · runtime artıkları temizlendi. T-15 kapandı.
- [Directive Block Versiyonlama](issues/15-directive-versiyonlama.md) — sürüm marker'lı block + install.sh replace-if-stale; ilk canlı geçiş (v1→v2) başarılı.
- [Hafıza + Handoff Doktrini](issues/19-hafiza-handoff-doktrini.md) — personal/handoff yazma-okuma-tüket kuralları SKILL.md'e girdi; oryantasyon zinciri tanımlı.
- [Paralel Lane Saha Koşusu](issues/14-paralel-lane-saha-kosusu.md) — iki worktree, paralel delegate'ler, sıfır çakışma, temiz diamond merge; §2b doğrulandı.
- [Cross-Harness Saha Testi](issues/13-codex-saha-testi.md) — Codex headless ilk gerçek koşu: sözleşme uyumu mükemmel (dürüst BLOCKED dahil); Ek A tarifi saha gerçekleriyle güncellendi (sandbox flag, tokens used, mutlak rapor yolu kuralı).
- **INDEX.md kaldırıldı (2026-08-24, Emir kararı):** workload panosu doktrinden çıktı — canlı durum Humanish telegraf ile insana aktarılır; oturum oryantasyonu tasks/frontmatter + lane raporlarından yapılır. Veri kaybı yok (durum zaten task frontmatter + report.md'de yaşıyor).
- [Remote Push](issues/11-remote-push.md) — `emirrtopaloglu/Taskard` private repo canlı; tam tarih yedeklendi.
- [Eval Kalibrasyonu](issues/12-eval-kalibrasyonu.md) — senaryo 01 ilk kez koşuldu (9/10); 1 doktrin çelişkisi yakalanıp kapatıldı; evals/01 kalibre edildi. 02-04 doğal dogfooding koşularında takip edilecek.

## Not yet specified

- **Maliyet anatomisi:** $12.62'nin hangi bileşene gittiği bilinmiyor; eval kalibrasyonu (T-12) maliyet satırlarını da toplayınca keskinleşir — gerekirse ticket'laşır.
- **Humanish ölçümü:** "insana okunuyorsa doğru" öznel; ölçülebilir kriter fikri eval koşularından sonra olgunlaşabilir.

## Out of scope

- **OSS-ready paketi:** vendoring + sync prosedürü, README EN, lisans, npx installer kararı, güvenliğin OSS-dokümantasyon çerçevesi — ayrı effort (ROADMAP v0.5 fazı).
- **Agent filo genişlemesi/derinleştirme tasarımı** — ROADMAP.md'de todo; bu harita değil.
- **GUI, GitHub Issues sync, memory katmanı büyütme** — ufuk fazı.
