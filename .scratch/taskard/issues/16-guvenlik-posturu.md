---
title: Güvenlik Postürü — bypassPermissions Gözden Geçirmesi
type: wayfinder-ticket
label: wayfinder:research
status: open
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
