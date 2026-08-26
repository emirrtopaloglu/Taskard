---
title: "Deep Research — Taskard Agent Tanımlarını İyileştirme"
type: deep-research
ticket: Build-Log sıradaki adım 1 (agent kalitesi ve çeşitliliği)
status: done
created: 2026-08-26
depth: exhaustive
sources: 25+
---

# Deep Research: Taskard Agent Tanımlarını Nasıl Daha İyi Yapılır?

## Executive Summary

Taskard'ın üç agent'ı (`implementer`, `reviewer`, `frontend-developer`) saha testlerinde stabil çalışıyor; sıradaki hedef kalite artırımı ve çeşitlendirme. İnternet taraması iki ana bulgu verdi: **(1)** Taskard'ın mevcut içgüdüleri — tek-yazıcı lane modeli, dosya-tabanlı report sözleşmesi, read-only review kapısı, isimsiz agent yasağı — sektörün en güçlü birincil kaynaklarınca (Anthropic Engineering, Cognition) **doğrulanıyor**; **(2)** büyüme yönü konusunda literatür Taskard'ın build-log planından farklı bir teklif getiriyor: yeni agent'lar **stack uzmanı olarak değil, yaşam-döngüsü kapısı olarak** tanımlanmalı (qa-tester en yüksek değerli ekleme; backend-developer/data-engineer ise büyük olasılıkla skill router'ının işi, yeni agent değil).

En çarpıcı ampirik bulgu Cognition'un Nisan 2026 verisi: temiz bağlamla çalışan bir reviewer, kodu yazan agent'in **göremediği** bug'ları yakalıyor — PR başina ort. 2 bulgu, %58'i ciddi (mantık hatası, eksik edge case, güvenlik açığı). Bu, Taskard'ın "read-only gate review" pozisyonunu bir tasarım tercihi olmaktan çıkarıp ölçülmüş bir üstünlüğe çeviriyor. İkinci kritik veri Anthropic'ten: multi-agent sistemlerde performans farkının %80'i token kullanımıyla açıklanıyor — yani rol başına model/token bütçesi (config.toml'un rol/model seçimi) mimarinin en yüksek kaldıraçlı kararı.

---

## Key Findings

1. **Tek-yazıcı doktrini 10 ay sonra da geçerli — ama derinleşti.** Cognition ("Don't Build Multi-Agents", Haz 2025 → "Multi-Agents: What's Actually Working", Nis 2026): paralel-yazar sürüleri hâlâ üretime girmiyor; çalışan pattern, **yazmanın tek thread'de kaldığı**, diğer agent'ların zekâ katkısı verdiği düzen. Taskard'ın sıralı lane + worktree modeli tam bu kutuda.
   https://cognition.com/blog/multi-agents-working

2. **Temiz-bağlam reviewer ölçülmüş üstünlük.** Devin Review, kodu yazan agent ile hiç bağlam paylaşmadığında en iyi çalışıyor: dikkat matematigi (Context Rot) gereği kısa bağlam = daha akıllı karar. Şart: ana döngünün, reviewer bulgularını genel kullanıcı niyetine karşı filtreleyen bir "iletişim köprüsü" olması (Taskard'da bu `receiving-code-review` disiplini + merge kapısı).
   https://cognition.com/blog/multi-agents-working · https://jxnl.co/writing/2025/09/11/why-cognition-does-not-use-multi-agent-systems/

3. **Description routing katmanıdır, etiket değil.** Ana agent hangi subagent'ı seçeceğini description'a bakarak karar verir. Etkili formül 4 parçalı: [sorumluluk] + ["ne zaman kullanılır" tetik koşulu] + [kapsam sınırı: ne iş değildir] + [dönüş formatı]. Tetik kelimesi kullanıcının gerçekten yazdığı dil olmalı ("testler kırık", "merge öncesi bak").
   https://www.mehdi.cz/blog/claude-code-subagent-descriptions

4. **Tanım anatomisi: Input / Output / Constraints / Done-when + failure sözleşmesi.** Üretilmiş AGENTS.md havuzlarının analizi: en yaygın hata "belirsiz tanım"; en güvenilir tanım giriş-çıktı formatını, kapsam tavanını (max tool call, max satır) ve **başarısızlık davranışını** (status/reason/completed_portion/retry_possible JSON'u gibi) açıkça yazar.
   https://thepromptshelf.dev/blog/claude-code-subagents-best-practices-2026

5. **Rol başına model yönlendirmesi en büyük maliyet/kalite kaldıracı.** Katalog pratiği: derin muhakeme işleri (review, güvenlik, mimari) → güçlü model; günlük kod → orta model; hızlı iş → ucuz model. Anthropic verisi: token kullanımı performans varyansının %80'i; multi-agent ≈ 15x token. Taskard'da bu karar config.toml'da yaşıyor — doğru yerde.
   https://github.com/VoltAgent/awesome-claude-code-subagents · https://www.anthropic.com/engineering/multi-agent-research-system

6. **QA/doğrulama kapısı en değerli yeni agent adayı.** Endüstri deseni maker/checker split: bir agent yazar, bağımsız agent doğrular. Anthropic'in uzun-süreli harness mimarisi (planner/generator/evaluator) ve feature_list.json "goal contract"ı: hiçbir özellik kanıtsız "passing" işaretlenemez. qa-tester agent'ı **end-state doğrulaması** yapmalı (süreç değil sonucun kanıtı).
   https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents · https://www.anthropic.com/engineering/harness-design-long-running-apps

7. **Dosya-artifact + pointer dönüşü "telefon oyununu" bitiriyor.** Anthropic'in resmî önerisi: subagent çıktısını filesystem'e yazsın, koordinatöre hafif referans dönsün. Taskard'ın "mesaj = pointer, dosya = payload" kuralı birebir bu pattern.
   https://www.anthropic.com/engineering/multi-agent-research-system (Appendix)

8. **Reviewer kalibrasyonu: hard verifier > judge opinions.** LLM-judge kalibrasyon literatürü: objektif sinyaller (test, lint, derleyici) asla model görüşüyle ezilmemeli; anchor vakalar (bilinen kazananlı örnekler) kalibrasyonda kullanılmalı; belirsizlikte fail-open/fail-closed politikası **açıkça yazılmalı**.
   https://negiadventures.github.io/blog/llm-judge-calibration-ai-coding-agent-evals.html · https://arxiv.org/html/2605.01885 (QASecClaw)

9. **Agent sayısı routing sinyalini seyreltiyor.** Anti-pattern kayıtları: 10-15+ agent listesi delegasyon kararını yavaşlatır ve yanlış yönlendirir; çakışan sorumluluklar ping-pong ve dublör iş üretir. Genişletme kararı "gerçekten bağımsız yeni bir kapı mı?" sorusuyla verilmalı.
   https://github.com/stevekinney/stevekinney.net/blob/main/courses/ai-development/subagent-anti-patterns.md · https://arxiv.org/abs/2606.05670

10. **Kontrollü karşılaştırmalar çok-agent varsayımını sorguluyor.** 10 benchmark üzerinde tek-düzen protokol: multi-agent konfigürasyonlarının çoğu tek-agent baseline'ını geçemedi; altı workflow'dan yalnızca biri geçti. Paralel dispatch yalnızca alt görevler **gerçekten bağımsızken** değer üretir. 94 SE makalesinin revizyonu da paralelliği + uzmanlaşmayı gerekçe olarak gösteriyor ama kazanım koşullu.
    https://arxiv.org/abs/2606.05670 · https://arxiv.org/abs/2511.08475

11. **Yeni nesil modellerde agresif vurgu over-triggering yapıyor.** Eski modellerde gereken sert vurgu (YASAK, KESİNLİKLE) 4.5+ sınıfı modellerde kuralı amacının ötesine taşıyor. Sert guardrail'ler korunmalı; davranışsal yönlendirmeler pozitif ifadeye çevrilmeli.
    https://github.com/dim-s/prompt-atlas/blob/main/references/antipatterns.md

12. **Rol-hafızası kurumsal bilgi biriktiriyor.** Proje-kapsamlı agent hafızası deseni: agent işe başlamadan hafızasına baksın, bitince öğrendiğini yazsın. Zamanla tekrarlayan bulgu desenleri (örn. reviewer'ın aynı repo'da sık gördüğü hata türleri) kurumsal bilgiye dönüşüyor.
    https://fast.io/resources/claude-code-subagents-guide/

---

## Detailed Analysis

### 1. Mimari düzey: Taskard'ın doğrulanan omurgası

Taskard saf konvansiyon paketi; runtime yok. Tarama, bu omurganın üç ayağını birincil kaynaklarla doğruladı:

- **Tek-yazıcı akış:** Cognition'un nihai pozisyonu — "writes stay single-threaded, additional agents contribute intelligence" — Taskard'ın loop modundaki sıralı lane disipliniyle örtüşüyor. Graph modda paralel lane'ler yalnızca worktree izolasyonlu ve brief sınırı keskin işlere açılıyor; bu, "paralelliğin ancak bağımsız alt işlerde değer üretmesi" bulgusuyla uyumlu. Diamond merge'in saha testinde sorunsuz olması (Map-v2/T-14) bunun pratik kanıtı.
- **Dosya payload'lı handoff:** Anthropic'in appendix önerisi (subagent çıktısı filesystem'e, koordinatöre pointer) Taskard'ın report.md/handoff sözleşmesiyle aynı. Geliştirme alanı: handoff dosyasındaki **durum kodlarının anlamları** henüz tanım başına spesifik değil (aşağıda Aksiyon 3).
- **Read-only kapılar:** Hem Cognition hem Claude Code/OpenCode sistem prompt pratiği, subagent'ları önce read-only rollerde devreye almayı öneriyor. Taskard'ın reviewer'ı zaten read-only; bu pozisyon savunulabilir değil, kanıtlanmış.

### 2. Tanım anatomisi: mevcut üç dosyanın durumu

Mevcut tanımlar kısa ve disiplinli (14–35 satır) — Prompt Shelf'in "40 satırın altında" tavanına uyuyor. Eksik parçalar:

| Boyut | implementer | reviewer | frontend-developer | Literatür standardı |
|---|---|---|---|---|
| Tetik koşulu (ne zaman) | ✗ (description'da dolaylı) | kısmen | ✗ | ✓ 4'lü şablon |
| Dönüş formatı spesifikasyonu | ✓ (report.md şablonu) | kısmen (≤20 satır) | miras | ✓ bölüm bölüm |
| Başarısızlık davranışı | kısmen (BLOCKED) | ✗ (verdict var, süreç hatası yok) | ✗ | ✓ status/reason/retry sözleşmesi |
| Done-when ölçütü | ✓ (kanıt zorunluluğu) | ✓ (verdict satırı) | kısmen | ✓ doğrulanabilir koşul |
| Kapsam dışı beyanı | ✓ ("while I'm here" yasağı) | kısmen | ✗ | ✓ "not for X" |

Description'lar mehdi.cz şablonuna göre zenginleştirilmeli. Örnek — reviewer için mevcut:
> "Read-only gate review. Kod yazmaz, fix yapmaz; bulgu + verdict döndürür."

Şabona göre:
> "Merge öncesi diff'i spec + repo standartlarına karşı okur, citation'lı bulgu ve PASS/PASS_WITH_NOTES/FAIL verdicti döndürür. Merge öncesi son kapıda, review istendiğinde, ikinci göz gerektiğinde kullan. Kod yazmaz, fix yapmaz; büyük analiz istenirse orchestrator ayrıca karar verir. Dönüş: ≤20 satır rapor + verdict."

### 3. Kapı agent'ları: reviewer'ı güçlendirmek, qa-tester'ı eklemek

**Reviewer iyileştirmeleri:**
- **Hard verifier hiyerarşisi:** "Test/lint/derleyici çıktısı senin estetik tercihini ezer; FAIL yalnızca spec ihlali veya kanıtlanmış defo için" kuralı tanıma eklenmeli. Kalibrasyon literatüründe judge'un objektif sinyali ezmesi en pahalı hata sınıfı.
- **Belirsizlik politikası:** Emin olmadığın bulgu Minor'a mı düşer, PASS_WITH_NOTES'a mı not edilir — açık yazılmalı (QASecClaw'un fail-open ilkesi: şüphede orijinal bulgu düşürülmez).
- **Temiz bağlam korunumu:** Reviewer'a implementer'ın akıl yürütmesini/spec yorumlarını aktarma; yalnızca diff + brief + standartlar. Cognition verisi: spec'siz geriye-doğru okuma, kodlayıcının kaçırdığını yakalar.

**qa-tester (yeni, en yüksek değer):**
- Görev: implementer'ın raporunu **değil**, çalışır ürünün end-state'ini doğrular. Anthropic'in evaluator agent'ı ve "skeptical end-to-end check" deseni: "ne doğrulandı, ne iddia edildi ama eksik, hangi iş açık" üçlüsünü üretir.
- Read-mostly + komut koşuma izni (test suite, build); kod yazma izni yok — fix'i implementer'a brief'le döndürür. Böylece maker/checker split bozulmaz.
- Brief'lerdeki kabul ölçütleri machine-checkable olmalı ("npm test geçer, 0 yeni failure" — "iyice test et" değil). Bu, feature_list.json goal-contract fikrinin Taskard ölçeğine indirgenmişi: brief = küçük feature list.

### 4. Rol çeşitliliği sorusu: stack agent'ı mı, kapı agent'ı mı?

Build-log planı backend-developer ve data-engineer öngörüyor. Literatür iki uyarı getiriyor:

1. **Routing seyrelmesi:** Agent listesi büyüdükçe delegasyon sinyali zayıflar; çakışan roller ping-pong üretir. Backend-developer, implementer ile %80 örtüşür — iki rol aynı brief'e iki farklı yoldan saldırır.
2. **Taskard'ın kendi doktrini:** Disiplin bilgisi zaten 19 skill'lik router'a bağlı (docs/dependencies.md). Stack uzmanlığı agent tanımında değil, **brief + skill kombinasyonunda** yaşamalı. Cognition'un çerçevesiyle: agent'lar yaşam-döngüsü aşamalarıdır (planla-yaz-denetle-dogrula), disiplinler değil.

Önerilen büyüme sırası: **qa-tester** (kapı, net değer) → gerekirse **planner/brief-yazarı** (graph modda brief kalitesini standardize eder; Anthropic'in initializer agent'ı karşılığı) → stack-rollü agent'lar yalnızca dogfooding'de skill router'ının karşılayamadığı tekrarlı bir ihtiyaç kanıtlanırsa.

### 5. Model ve maliyet yönlendirme

- VoltAgent katalog kalibrasyonu config.toml için hazır referans: reviewer/security/mimarî → güçlü model; implementer → orta; doc/arama → hafif.
- Anthropic'in effort-scaling kuralları SKILL.md'e mod seçimi rehberi olarak işlenebilir: basit iş 1 lane, orta 2-4, karmaşık graph — sayılar prompt'ta yaşar, kodda değil (Taskard ile zaten uyumlu).
- Maliyet verisi (multi-agent ≈ 15x token) Taskard'ın benchmark bulgusuyla (%61 ucuz) birlikte okunmalı: Taskard'ın avantajı gereksiz agent açmamaktan geliyor; bu disiplin büyürken korunmalı.

### 6. Hafıza, eval, dil hijyeni

- **Rol hafızası:** `.taskard/memory/` altına rol-anahtarlı dosyalar (örn. reviewer için `memory/reviewer-findings.md`: bu repoda sık patlayan desenler). Config değil veri olduğundan immutable-config iron law'ını ihlal etmez. fast.io deseninin şartı: agent baştan okusun, sonda yazsın — aksi halde sediment.
- **Eval disiplini:** Anthropic: 20 vakalık küçük eval erken kurulur, büyük effect size'ı yakalar; değişiklik başına tek değişken. Taskard'ın T-12 mikro-commit eval'ı agent başına genişletilmeli: her tanım değişikliği eval senaryosundan geçmeden commit atmasın (README kuralına benzer süre disiplini).
- **Dil hijyeni:** implementer.md'deki negasyon yoğunluğu (4x "YASAK") yeni model sınıflarında over-triggering riski taşıyor. Sert guardrail'ler (tautological test yasağı gibi) kalsın; "while I'm here yasak" gibi davranışsal maddeler pozitif hedefle eşlenerek yumuşatılabilir: "yalnızca brief'te sayılan dosyaları işaretle" (negatif zaten ima olur).

---

## Contrarian Views And Risks

- **"Çok-agent her zaman daha iyi" yanılgısı:** Kontrollü çalışma (arXiv 2606.05670) multi-agent konfigürasyonlarının çoğunun tek-agent'ı geçemediğini gösteriyor. Taskard'ın loop-default doktrini bu riskin en iyi panzehiri; graph moda geçiş eşiği düşük tutulmamalı.
- **Reviewer'ın temiz bağlamı ile spec-farkındalık gerilimi:** Cognition temiz bağlamı övüyor ama iletişim köprüsünü şart koşuyor. Reviewer tamamen spec'siz kalırsa kullanıcı niyetine aykırı bulgular üretebilir; denge: diff + brief verilsin, implementer'ın akıl yürütmesi verilmesin.
- **qa-tester'ın maliyeti:** Her lane'e qa-tester eklemek token bütçesini şişirebilir. Değer kuralı: yalnızca harici-etkili işlerde (API, migration, auth, ödeme) zorunlu kapı; küçük CSS düzeltmesinde reviewer yeter.
- **Hafıza sediment riski:** Rol hafızası bakılmazsa eski bulgular güncel kod tabanını yanlış tarif eder. consumed- önekli handoff arşivleme doktrinine benzer periyodik tasfiye şart.
- **Katalog çekme cazibesi:** VoltAgent tarzı 100+ rol katalogları görsel olarak cazip; ama Taskard'ın gücü az ve keskin rolde. Katalogdan rol kopyalamak değil, saha ihtiyacından rol türetmek.

## Open Questions

- qa-tester'ın komut koşuma izni bypassPermissions varsayılanıyla nasıl uyumlanır? (Test suite koşturmak güvenli; ama `danger-full-access` gerektiren senaryolarda sınır nedir?)
- Planner/brief-yazarı ayrı bir agent mı olmalı, yoksa orchestrator'ın (ana döngünün) bir bölümü mü? Cognition manager-Devin tecrübesi: fazla prescriptif manager geri teper.
- Rol hafızasının formatı: serbest markdown mı, bounded personal.md gibi yapılandırılmış mı?
- Frontend-developer'ın "varyant üret ve kullanıcıya seçtir" kuralı qa-tester kapısıyla nasıl etkileşir? (Görsel doğrulama elle mi kalacak?)

## Sources

Birincil:
- https://cognition.com/blog/dont-build-multi-agents — bağlam mühendisliği ilkeleri, tek-thread argümanı
- https://cognition.com/blog/multi-agents-working — güncel pozisyon; clean-context reviewer verisi, smart friend, manager Devin
- https://www.anthropic.com/engineering/multi-agent-research-system — orchestrator-worker dersleri, effort scaling, filesystem artifact appendix
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents — initializer/coding split, feature_list.json goal contract
- https://www.anthropic.com/engineering/harness-design-long-running-apps — planner/generator/evaluator üçlüsü
- https://arxiv.org/abs/2606.05670 — kontrollü multi-agent vs single-agent değerlendirmesi
- https://arxiv.org/abs/2511.08475 — 94 multi-agent SE makalesi revizyonu
- https://arxiv.org/html/2605.01885 (QASecClaw) — filter agent, fail-open politikası

Saha pratiği:
- https://thepromptshelf.dev/blog/claude-code-subagents-best-practices-2026 — tanım anatomisi, failure sözleşmesi, metrikler
- https://www.mehdi.cz/blog/claude-code-subagent-descriptions — description routing şablonu
- https://github.com/VoltAgent/awesome-claude-code-subagents — rol kataloğu, model routing felsefesi
- https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/ — pipeline DoD, slug audit
- https://fast.io/resources/claude-code-subagents-guide/ — agent memory, fork vs fresh
- https://computingforgeeks.com/claude-code-subagents-guide/ — model=maliyet kaldıracı, isim çakışmaları
- https://github.com/stevekinney/stevekinney.net/blob/main/courses/ai-development/subagent-anti-patterns.md — anti-pattern listesi
- https://negiadventures.github.io/blog/llm-judge-calibration-ai-coding-agent-evals.html — judge kalibrasyonu, anchor vakalar
- https://www.addwebsolution.com/blog/loop-engineering-ai-agent-loops-production-software — maker/checker, insan kapıları
- https://www.eesel.ai/blog/loop-engineering — loop'un 5 kolu (tools/stopping/context/verification/guardrails)
- https://neoanaloglab.com/en/blog/posts/ai-agent-verification — ACI, regression-first doğrulama
- https://agentpatterns.ai/patterns/multi-agent/orchestrator-worker/ — pattern referansı, başarısızlık modları
- https://agentpatterns.ai/patterns/agent-design/goal-monitoring-progress-tracking — progress file, premature completion
- https://github.com/eddiearc/long-running-harness — worker/evaluator ayrımı, handoff dosyaları
- https://jxnl.co/writing/2025/09/11/why-cognition-does-not-use-multi-agent-systems/ — Walden Yan röportajı, read-only subagent
- https://github.com/dim-s/prompt-atlas/blob/main/references/antipatterns.md — over-triggering uyarısı
- https://smartscope.blog/en/generative-ai/claude/claude-code-best-practices-advanced-2026/ — hooks/skills/subagents ayrımı

## Rerun Inputs

workflow: firecrawl-deep-research
topic: Çoklu-harness agent orkestrasyonunda subagent tanım kalitesi (Taskard bağlamı)
depth: exhaustive
output: markdown

---

## Taskard Aksiyon Önerileri (kanıt → dosya eşlemesi)

| # | Aksiyon | Kanıt | Dosya |
|---|---|---|---|
| A1 | Üç agent'ın description'ını 4'lü routing şablonuna çevir (tetik + kapsam dışı + dönüş formatı) | F3 | agents/*.md frontmatter |
| A2 | qa-tester agent'ı ekle: end-state doğrulaması, read-mostly, brief'e fix döner; harici-etkili işlerde zorunlu kapı | F6, F1 | agents/qa-tester.md (yeni) + SKILL.md gate tanımı |
| A3 | implementer durum kodlarına davranış sözleşmesi yaz (NEEDS_CONTEXT ne zaman, DONE_WITH_CONCERNS ne içerir) | F4 | agents/implementer.md |
| A4 | reviewer'a hard-verifier hiyerarşisi + belirsizlik politikası ekle | F8 | agents/reviewer.md |
| A5 | backend-developer/data-engineer'ı şimdilik agent olarak açma; skill router + brief ile karşıla; ihtiyaç kanıtlanırsa yeniden değerlendir | F9, F10 | Build-Log kararı + docs/dependencies.md |
| A6 | Rol-model kalibrasyon tablosunu config.toml örneklerine işle (reviewer→güçlü, implementer→orta) | F5 | config örnekleri + README |
| A7 | Agent başına mikro-eval senaryosu; tanım değişikliği eval'siz commit atmasın | F12 | .scratch/taskard/results + süre kuralı |
| A8 | Rol hafızası deseni: memory/<rol>-findings.md; başta oku, sonda yaz, periyodik tasfiye | F12 | SKILL.md hafıza bölümü |
| A9 | Negasyon yoğunluğunu gözden geçir: sert guardrail kalsın, davranışsal maddeler pozitif hedefle eşleşsin | F11 | agents/implementer.md |
