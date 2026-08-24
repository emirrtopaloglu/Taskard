---
title: Güvenlik Postürü — bypassPermissions Gözden Geçirmesi
type: wayfinder-ticket
label: wayfinder:research
status: closed
assignee:
blocked_by: []
created: 2026-08-24
research_output: .scratch/taskard/research/h1-guvenlik-posturu.md
---

## Question

Worker'lar varsayılan `bypassPermissions` ile çalışıyor (Emir kararı). Bu postürün gerçek patlama yarıçapı nedir ve azaltım seçenekleri neler? **Nihai karar Emir'in** — bu ticket menüyü hazırlar.

1. Saldırı yüzeyi envanteri: bypassPermissions worker ne yapabilir (dosya silme, git push, credential okuma, network çağrısı, MCP üzerinden dış servis)?
2. risky_operations listesi (migration/deploy/rm -rf/drop table/push --force) bu yüzeye karşı yeterli mi — hangi sınıflar kaçıyor?
3. Azaltım seçenekleri menüsü (trade-off'larıyla): harness sandbox flag'leri (`codex` sandbox, claude permission mode kombinasyonları), onay kuyruğu deseni (%99/%1), otomatik DB/backup hook'u, kritik dosya kilidi, cross-harness headless çağrılarda ek kısıtlar
4. AvenoxAI doktriniyle karşılaştırma: üç katman güvenlik formülü (dar yarıçap + onay + geri alınabilirlik) Taskard'da hangi katmanda zayıf?

Kaynaklar: R1 research (`.scratch/taskard/research/r1-*`), implementer/reviewer tanımları, SKILL.md iron laws, web'de güncel harness sandbox docs.

Çıktı: risk tablosu (olasılık × etki) + azaltım seçenekleri menüsü — KARAR YOK.

## Resolution (2026-08-24)

Enforcement boşluğu ana risk: risky_operations'ın teknik uygulayıcısı tanımsız (tek savunma = model vicdanı); credential/exfiltration sınıfı listede hiç görünmüyor; üç-katman formülünde zayıf halka patlama yarıçapı (sandbox yokken disiplinler söz). Bedavaya yakın çözüm var: Claude Code deny kuralları bypassPermissions altında bile değerlendiriliyor → "%99 otonom / %1 sert duvar" kurulabilir. MCP kör noktası: pattern taraması tool çağrılarına bakmıyor. Rapor: `research/h1-guvenlik-posturu.md` — 5 karar sorusu Emir'de.
