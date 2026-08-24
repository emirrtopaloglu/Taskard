---
title: H2 — Router Çakışması: taskard Disiplin Router'ı × using-superpowers Meta-Skill'i
type: wayfinder-research
ticket: h2-router-cakismasi
status: done
created: 2026-08-24
---

# İki Routing Mekanizması Aynı Turada — Kim Kazanır?

**Yöntem:** Yerel inceleme. Okunan kaynaklar: `~/.agents/skills/using-superpowers/SKILL.md` (62 satır), `skills/taskard/SKILL.md` (158 satır), `~/.claude/CLAUDE.md` taskard direktif bloğu (EmirOS/CLAUDE.md yalnızca AGENTS.md'e pointer; blok global CLAUDE.md'de yaşıyor), `docs/dependencies.md` bağlama tablosu. Kod yazılmadı, git'e dokunulmadı; analiz salt metin karşılaştırmasıdır.

## Özet yargı

İki sistem kâğıt üstünde rakip değil — taskard router'ı using-superpowers'a **bilinçli olarak teslim olmuş** ("Akışın başında `using-superpowers` yüklüyse onunla başla — skill seçimini o yönetir", SKILL.md:31). Gerilim tek bir satırda yoğunlaşıyor: superpowers'un **"%1 ihtimal → MUTLAKA invoke"** emri (SKILL.md:11) ile taskard'ın **"koşul yoksa skill yüklenmez"** tetik kapısı (SKILL.md:31) arasında boyut-bazlı bir çatışma var. Superpowers boyutu tanımaz — red-flag tablosu "skill overkill" düşüncesini açıkça rasyonalizasyon ilan eder (satır 47). Taskard'ın tüm ekonomisi ise boyut üzerinedir (mikro tier, tetik koşulları).

Kritik keşif: **çözüm mekanizması superpowers'un kendi içinde hazır.** Son satırı kullanıcı talimatlarına üstünlük tanır: *"User instructions (CLAUDE.md, AGENTS.md...) take precedence over skills"* (satır 62). Taskard direktif bloğu tam olarak bir CLAUDE.md kullanıcı talimatıdır — yani hiyerarşi zaten hukuken taskard'dan yana; eksik olan, bloğun bu üstünlüğü **tetik/tier seviyesinde açıkça söylememesi**. Aşağıda tek paragraflık taslak bunu kapatıyor.

---

## İki sistemin anatomisi

| Eksen | using-superpowers | taskard router |
|---|---|---|
| Model | Push/meta: her turda enjekte olur, invoke'u dayatır | Pull/tetik: koşul belirlenmişse yükle |
| Boyut duyarlılığı | Yok ("overkill" rasyonalizasyondur) | Temel tasarım ilkesi (mikro/standart/graph tier) |
| Zamanlama | HERHANGİ aksiyondan önce, netleştirici sorudan bile önce | Akışın ilk hamlesi mod seçimi, sonra faz bazlı |
| Subagent tavrı | SUBAGENT-STOP: göreve dispatch edilen subagent yok sayar | Delegate'lere disiplin brief'ten gider |
| Anons | "Using [skill] to [purpose]" zorunlu şablon | Humanish telegraf: token yasak, tek cümle |
| Kendi mazeret kapısı | Kullanıcı talimatı > skill | Config çalışma anında değişmez |

Dikkat: iki sistemin de "benzer" görünen ama farklı işleyen bir kavramı var. Superpowers'un "process skills first" önceliği (satır 28) sıralama kuralıyken, taskard'ın tier'ları **maliyet bütçesidir** — biri neyi önce yapacağınızı, diğeri neyi hiç yapmayacağınızı söyler. Çakışma tam burada doğar: "önce yap" ile "hiç yapma" aynı skill için çarpışabilir.

---

## Çakışma matrisi

| # | Senaryo | Superpowers davranışı | Taskard kuralı | Sonuç |
|---|---|---|---|---|
| 1 | Tek satır CSS/copy düzeltmesi, mikro tier | Red-flag: "The skill is overkill → Use it". Plan moduna girecekse brainstorming ÖNCE zorunlu (satır 22) | Mikro iş: spec YAZILMAZ, brief ≤20 satır; brainstorming tetiği "yaratıcı/işlev ekleme işi" — düzeltme değildir | 🔴 **SERT ÇELİŞKİ.** Superpowers dayatır, taskard yasaklar. 1% okumasıyla her mikro görevde seremoni sızar |
| 2 | Bug fix, ilk deneme henüz yapılmadı | Skill Priority: "Fix this bug → systematic-debugging FIRST" (satır 31) | Tetik: "2. başarısız denemede" — ilk teşhiste yüklenmez | 🟡 **ZAMANLAMA ÇELİŞKİSİ.** İkisi de skill'i istiyor ama superpowers t0'da, taskard t2'de açar. Erken açılış ucuz bug'da gereksiz seremoni, geç açılış inatçı bug'da gecikmiş teşhis riski demek |
| 3 | TDD'siz tek satır DAVRANIŞ değişikliği (config tip fix, edge-case guard) | 1% kuralı TDD'yi aday gösterir | Tetik: "Implementer: her davranış değişikliği" — davranış değişikliği TDD ister; ama implementer FAZINDA, brief üzerinden | 🟡 **KISMEN ÇELİŞKİ.** Kararda çelişki yok, yer ve zamanda var: superpowers akış başında anaday gösterir, taskard lane içine gömer. Saf davranış-dışı değişiklikte (yorum, format) superpowers'un 1% okuması hâlâ zorlarken taskard net muaf |
| 4 | Orta ölçekli, net görev — "belki 2 oturum sürer?" şüphesi | 1% ihtimal wayfinder'ı aday yapar | Tetik: "iş >1 oturum" — belirlenmiş olmalı, speküasyon değil | 🔴 **ÇELİŞKİ.** 1% kuralı speküasyonu da tetik sayar; taskard'ın tetiği gözlemsel koşul ister. Wayfinder ağır bir tracker kurulumudur, yanlış tetiklenmesi pahalı |
| 5 | Implementer delegate'i TDD/receiving-code-review uygulamak istiyor | SUBAGENT-STOP: göreve dispatch edilen subagent meta-skill'i ignore eder | Disiplinler brief'ten taşınır ("token'ı brief'e yatır"); dependencies.md fallback'i de role-definition metni | 🟢 **UYUM + TEK NOKTA RİSKİ.** Detay aşağıda (Bölüm SUBAGENT-STOP). Uyumlu tasarım; ama ana döngü disiplini brief'e yazmayı unutursa skill sessizce düşer — kimse telafi etmez |
| 6 | Ana döngü görevi anlamak için dosya okumak istiyor | Red-flag: "Let me explore the codebase first → Skills tell you HOW to explore. Check first." | Mikro: ana döngü hedefli okuma meşru (grep / 2-3 read); ağır keşif explore-research delegate'inin işi | 🟡 **SIRA ÇELİŞKİSİ.** Superpowers "önce skill", taskard "önce mod seçimi" der. Taskard'ın mod seçiminin kendisi ucuz akıl hamlesi olduğundan pratikte zararsız — ama yazılı kural olarak iki "ilk hamle" iddiası çakışıyor |
| 7 | Her skill invoke'unda "Using [skill] to [purpose]" anonsu | Şablon zorunlu, her invocation'da | Humanish: her önemli adımda BİR cümle; durum token'ı, tablo, jargon sohbete girmez | 🟠 **UYUMLU AMA HARMAN GEREKLİ.** Detay aşağıda (Bölüm Announce) |
| 8 | Checklist'li skill invoke edildi | "If it has a checklist, create a todo per item" (satır 24) | Takip defteri `.taskard/tasks/T-NNN` + INDEX.md panosu | ⚪ **MEKANİK ÇAKIŞMA.** İki defter oluşur. Akış aktifken hangisi kanonik belirsiz |
| 9 | Grilling — küçük görevde hizalanma faydalı olur mu? | 1% okuması grilling'i aday gösterebilir | Tetik: "büyük/riskli görev"; mikro tier soru seremonisi yok | 🟡 **ÇELİŞKİ.** Not: grilling'in kendi description'ı dar ("stress-test istenince"), o yüzden hasar sınırlı — ama 1% kuralı description'ı ezer, çünkü using-superpowers hedef skill'in kendi koşulunu değil KENDİ eşiğini uygular |

Matrisin özeti: **çelişkilerin hepsi tek kökten çıkıyor** — superpowers eşiksizdir, taskard eşiklidir. Kök çözüldüğünde 9 satırın 7'si kendiliğinden kapanır.

---

## SUBAGENT-STOP × adlandırılmış delegate'ler

Superpowers'un `<SUBAGENT-STOP>` bloğu: *"If you were dispatched as subagent to execute a specific task, ignore this skill"* (satır 6-8). Taskard delegate'i tanım gereği tam olarak budur: adlandırılmış rol + specific task (brief).

**Etkileşim yönü: pozitif sinerji, üç gerekçeyle.**

1. **Özyinelemeli routing'i keser.** Implementer brief'i uygularken using-superpowers devrede olsaydı, implementer kendi başına brainstorming/systematic-debugging zinciri başlatırdı — lane disiplini, report protokolü ve bütçe tavanları çökerdi. SUBAGENT-STOP bunu kökten engeller: delegate düşünmez, icra eder. Bu, taskard'ın "delegate rapor yazar, akıl yürütmez" ayrımıyla birebir örtüşür.
2. **Token disiplinini subagent katmanına taşır.** Graph modunda 5-6 delegate × her biri kendi skill-routing seremonisi = pahalı çoğaltma. SUBAGENT-STOP bu maliyeti sıfırlar.
3. **BLOCKED akışını temizler.** Sıkışan delegate skill invoke ederek kurtulmaya çalışmaz; NEEDS_CONTEXT/BLOCKED raporu yazar, kararı ana döngüye bırakır — taskard'ın "3. denemede teşhis topla, kullanıcıya raporla" hattının önkoşulu.

**Ama bir boşluk var:** taskard bazı disiplinleri bilerek delegate fazına yerleştirmiş (test-driven-development → implementer, receiving-code-review → fix delegate'i, requesting-code-review → Gate 1 reviewer'ı, systematic-debugging → blocker teşhisi). SUBAGENT-STOP yüzünden bu skill'leri delegate KENDİ route edemez; tek taşıma kanalı **brief'tir**. Dependencies.md bunun fallback'ini de tutar ("implementer tanımındaki iron law metni") ama şu senaryo korunmasız: ana döngü brief'e TDD disiplinini yazmayı unutursa, delegate hem meta-skill'i yok sayar hem brief'te talimat bulamaz → **disiplin sessizce düşer, kimse fark etmez**. Brief kalitesi tek savunma hattıdır; taskard'ın kendi sözüyle "lane'in kalitesi brief'in kalitesiyle sınırlıdır" — bu boşluk o cümlenin güvenlik versiyonudur.

Ayrıca isimsiz-agent yasağıyla etkileşim notu: SUBAGENT-STOP "specific task için dispatch edildiysen" der; taskard'daki her meşru agent named-role + brief ile açıldığından muafiyet kapsamı birebir örtüşür. Tanımsız/isimsiz bir agent açılırsa (iron law ihlali) superpowers muafiyeti de belirsizleşir — yasa zaten iki sistemce destekleniyor.

---

## Announce pattern × Humanish

Superpowers şablonu: `"Using [skill] to [purpose]"` — kısa, amaçlı, İngilizce, her invoke'ta.
Taskard Humanish: *"Her önemli adımda kullanıcıya BİR CÜMLE yaz: ne yapıldı, neden, ne bekleniyor... Durum token'larını asla çıktıya taşıma... mesajın bir insana okunuyorsa doğru, bir log satırına benziyorsan yanlış."*

**Temelde uyumlular** — ikisi de telegrafik, ikisi de ne+neden taşıyor. Announce şablonunun üç sürtünmesi ve harmanı:

1. **Dil.** Şablon İngilizce; EmirOS/taskard konvansiyonu kullanıcının dili. Harman: yapı korunur, amaç cümlesi yerelleşir — *"Brainstorming'i devreye alıyorum — spec'i kilitlemeden önce gereksinimleri netleştirmek için."* Skill adı proper noun kalır (tanımlayıcıdır, çevrilmez).
2. **Meta-gürültü.** "Using using-superpowers to route skills" kullanıcının zihinsel modeline hizmet etmez, log'a hizmet eder. Humanish filtresinden geçmeyen anons budur: mekanizma skill'leri (router'ın kendisi, verification-before-completion gibi altyapısal adımlar) ya anons edilmez ya akış cümlesine eritilir (*"Kapanışı kanıt kontrolüyle bağlıyorum"*).
3. **Sıklık.** Graph modunda 6+ invoke = 6 anons = gürültü. Taskard'ın birimi faz olduğu için harman kuralı: **faz başına toplu tek cümle**, invoke başına değil — *"Spec turunu grilling'le açıyorum; terimler CONTEXT.md'e, geri dönülemez kararlar ADR'ye düşecek."* Bu hem announce zorunluluğunu yerine getirir hem Humanish gramajında kalır.

Bir fonksiyonel not: announce'un taskard için gizli bir faydası var — **pull-based taahhüdün dışa vurulması**. Skill yüklenme kararını yüksek sesle söylemek, gereksiz yüklemeyi hem kullanıcıya görünür kılar hem modelin kendi rasyonalizasyonunu zorlaştırır (superpowers'un red-flag mantığının davranışsal karşılığı). Bu yüzden anons tamamen kaldırılmamalı; sadece tercüme ve toplulaştırılmalı. Durum token yasağı announce'u etkilemez: anons niyet bildirir, sonuç bildirmez — "PASS" yasağı sonuç cümlelerine ait kalır.

---

## Öncelik kuralı taslağı (tek paragraf)

Direktif bloğuna (`<!-- taskard:start -->` içine) aday metin. Dayandığı üç ayak: superpowers'un kullanıcı-talimatı üstünlüğü (kendi satır 62), taskard router'ının teslim olma cümlesi (SKILL.md:31) ve direktif bloğundaki mevcut bölüşüm ("disiplin using-superpowers'tan çıkar... mod seçimi ilk hamledir").

> Taskard akışı aktifken yönlendirme hiyerarşisi şudur: **mod ve tier seçimi** (loop/graph, mikro/standart) akışın ilk hamlesi olarak taskard'ındır; `using-superpowers` varsa akış başında yüklenir ve hangi disiplin skill'inin **aday** olduğunu önerir, ancak bir skill'in gerçekten **yüklenmesi** taskard'ın tetik koşuluna ve tier tavanına tabidir — "%1 ihtimal" aday üretir, tetik koşulu karar verir; mikro tier'da ağır seremoni skill'leri (brainstorming, grilling, wayfinder, writing-plans) yüklenmez, akış-başı router ve kanıt disiplini hariçtir. İkisi çelişirse bu blok geçerlidir, çünkü using-superpowers da kullanıcı talimatlarına (CLAUDE.md) üstünlük tanır. Subagent/delegate'lerde using-superpowers işlemez (SUBAGENT-STOP); delegate disiplinleri (TDD, receiving-code-review vb.) brief'e yazılarak taşınır — brief'e disiplin satırı eklemek lane açılışının zorunlu adımıdır. Skill yüklemeleri kullanıcıya Humanish tek cümleyle, faz başına toplu olarak anons edilir ("X'i Y için devreye alıyorum"); durum token'ı ve tablo sohbete girmez.

Bu paragraf matristeki 1, 2, 4, 6, 7, 9 numaralı çakışmaları kural seviyesinde kapatır; 3 numaralıyı yer/zaman netleştirmesiyle yumuşatır; 5 ve 8 numaralılar prosedürel tamamlayıcı ister (bkz. sorular).

**Yaygınlaştırma notu (karar değil, tespit):** Aynı paragrafın taskard SKILL.md router bölümüne ve dependencies.md'e minik referanslarla eklenmesi, direktif bloğu olmayan harness'larda (AGENTS.md-only projeler) de aynı hiyerarşiyi taşır — tek doğruluk kaynağı ikiye bölünmesin.

---

## Emir'e karar soruları

1. **Mikro tier muafiyetinin sınırı:** Kanıt disiplini (verification-before-completion) mikroda da yüklensin mi, yoksa mikroda iron law 4'ün metni yeter mi? (Taslak şu an ikincisini ima ediyor.)
2. **systematic-debugging zamanlaması:** taskard'ın "2. başarısız deneme" kuralı mı korunmalı, yoksa "kritik/para-dokunan dosyada ilk denemede" gibi risk bazlı erken tetik istisnası mı eklenmeli?
3. **Brief disiplin satırı zorunluluğu:** Lane protokolünün hangi maddesine bağlanmalı — brief.md şablonuna sabit "Disiplin:" alanı mı, yoksa lane açılış checklist maddesi mi? (SUBAGENT-STOP boşluğunun tek kapatma yolu bu.)
4. **Anons politikası:** Faz başına toplu cümle mi, her invoke'ta ayrı mı? using-superpowers'ın kendisinin yüklenişi kullanıcıya hiç anons edilmeden sessiz mi geçecek?
5. **Todo defteri (matris #8):** Akış aktifken harness todo'su mu `.taskard/tasks/` + INDEX.md mi kanonik? Skill checklist'lerinin tasks dosyasına T-maddesi olarak mı dönüştürülmesi istenir?
6. **Yaşam yeri:** Öncelik paragrafı yalnızca global `~/.claude/CLAUDE.md` bloğuna mı girsin, yoksa SKILL.md router bölümüne de (tek kaynak ilkesiyle) işlensin mi? Not: config/skill dosyaları çalışma anında değişmediğinden bu bir release kararıdır.
7. **Erken-TDD gerilimi (matris #3):** Davranış değişikliği belli oldugu anda TDD'nin implementer'a değil ana döngüye mi anlatılması gerekiyor (brief'e test iskeleti talebi yazmak için), yoksa tamamen lane içi mi kalsın?

*Karar verilmedi — bu rapor yalnızca çakışma haritası ve aday taslaktır.*
