# R3 — Taskard Hafıza Formatları Araştırması

> **Kapsam:** Çoklu-harness agent orchestration paketi Taskard için dört hafıza katmanının (proje bilgisi, task durumu, agent workload, kişisel hafıza) `.taskard/` altında DOSYA TABANLI tasarımına beslenecek desen analizi.
> **Yöntem:** Yerel birincil kaynaklar (MattPocock video notu; Superpowers, MattPocock-Skills, AvenoxAI, Chaos→Choreography, Claude-Architect raporları) + web taraması (2026: Claude Code auto memory, agent-work-mem, agent-vault, pi-ensemble, agentdocket, agentbus, worklease, taskops, Beads, handoff desenleri).
> **Kısıt:** Harici servis bağımlılığı yasak (Mem0, Dolt server vb. kapsam dışı). Her şey plain markdown/JSONL/git ile yaşamalı. Kişisel hafıza katmanı açık kaynak olacak → genel yapıda, kullanıcı verisi taşımamalı.

---

## Yönetici Özeti

1. **Alan ortak bir sonuca varmış: paylaşılan dosya sistemi = agent'ların ortak beyni.** Worklog+index (AvenoxAI), vault blackboard (agent-vault), append-only docket (agentdocket/taskops), Beads — hepsi aynı desenin adları; fark sadece şema sıkılığı ve çakışma stratejisinde.
2. **Context ekonomisinin ölçülü formülü: ~50x damıtma + bounded index + lazy load.** Subagent 75–132K token harcayıp 1.4–1.5K özet döndürür; index dosyası hard-cap'li (Claude: 200 satır/25KB), detay topic dosyalarında talep üzerine yüklenir. Tek şişkin dosya = sessiz kesilme = en yaygın hafıza arızası.
3. **Append-only + content-hash ID + özel yazma namespace'i = çakışmasız paralellik.** Satır bazlı JSONL/markdown append'ler git'te union-merge olur; her agent kendi dosyasına yazar, paylaşılan log'a tek satır bırakır; ownership claim'i TTL'li lease olarak modellenir (worklease/taskops).
4. **Session köprüsü tek dosya olamaz; versiyonlu, data-contract'lı, "reddedilenler"i taşıyan bir state belgesi olmalı.** Paralel oturumlarda tek HANDOFF.md üstüne yazılır → kayıp; çözüm timestamp'li dizin + oku-tüket protokolü. En değerli alan: reddedilen yaklaşımlar (yeniden teklif edilmelerini önler).
5. **Taskard için öneri: hibrit şema** — proje bilgisi = CONTEXT.md+ADR (Matt Pocock doktrini), task durumu = dosya-başına-task + append-only events.jsonl (Beads'in graph'ını graph'sız taklit et), workload = agent başına namespace + TTL'li claim, kişisel hafıza = one-fact-per-file + bounded index. Üç ayrıntılı alternatif taslak raporun sonunda.

---

## Katman ↔ Desen Eşleme Haritası

| # | Desen | (i) Proje bilgisi | (ii) Task durumu | (iii) Agent workload | (iv) Kişisel hafıza |
|---|---|---|---|---|---|
| 1 | Worklog + index.md | ◐ | ● | ● | ○ |
| 2 | CONTEXT.md + ADR | ● | ○ | ○ | ◐ |
| 3 | Append-only ledger + range | ◐ | ● | ● | ○ |
| 4 | Session köprüleri | ◐ | ● | ◐ | ● |
| 5 | Immutable snapshot + data contract | ○ | ● | ● | ○ |
| 6 | Context ekonomisi (tümü için çerçeve) | ● | ● | ● | ● |

● doğrudan uygulanır · ◐ kısmen/ilkelerinden yararlanılır · ○ zayıf uyum

---
# Bölüm I — Desen Analizleri

## Desen 1 — Worklog + index.md (paralel agent'ların diske yazarak konuşması)

**Kaynaklar:** AvenoxAI Oyun Fabrikası B2/B3; agent-work-mem; agent-vault; pi-ensemble.

### Mekanizma
Paralel agent'lar birbirini doğrudan konuşamaz; ortak diske yazarak konuşurlar. AvenoxAI'nin olgunlaşmış versiyonu:
1. Her agent kendi `worklog` dosyasına not tutar.
2. Ayrı bir agent, tüm worklog'ları tek raporda birleştirir.
3. `index.md` her worklog'a işaret eder ve **neden önemli olduğunu** yazar — her agent başlamadan okur.
4. Okuma zorunluluğu rules.md'de kodlanır ("backend agent raporsuz başlamaz").

agent-vault'un taşıdığı üç taşıyıcı kural:
1. **Her agent özel yazma namespace'ine sahip** (`agents/<id>/` + sahibi olduğu task'lar) — ayrık namespace'lere eşzamanlı yazma asla çakışmaz.
2. **Paylaşılan log append-only** (`events.md` satır-bazlı; çatışma = satırların birleşimi).
3. **Task ownership'i her an tektir** — devir handoff notuyla olur; iki agent'ın status'u da güncellenir.

pi-ensemble aynı şeyi "blackboard + mailbox + claims + audit" dörtlüsü olarak kurar: `blackboard.md` kalıcı ortak gerçekler, `agents/<name>/inbox.md` el değiştirme, `audit.jsonl` izlenebilirlik.

### Artıları
- Dosya sistemi zaten var; kilit sunucusu, daemon, veritabanı yok.
- Özel namespace sayesinde paralel yazma güvenli; tek paylaşılan dosyanın üstüne yazma felaketi yaşanmaz.
- index.md doğal bir "sabah brief'i"dir: yeni oturum/model 30 saniyede sahneye oturur.
- İnsan debug'ı kolaydır: her şey cat edilebilir metin.

### Eksileri / arıza modları
- **Worktree disiplini şart:** AvenoxAI worktree kullanmamayı açıkça "yanlış karar" diye niteler — paralel yazan agent'lar branch drift üretir. Dosya koordinasyonu git izolasyonunu ikame etmez.
- index.md elle bakım gerektirir; güncellenmezse yalan söyler. agent-work-mem'in cevabı: INDEX.md'in ilk satırına HOT_RETENTION gibi ayar + topic search index koymak, arşiv dosyalarının tarih-aralığı/anahtar kelime kaydını otomatik tutmak.
- Worklog'lar kontrolsüz büyür → tiering şart (bkz. Desen 6).

### Taskard'a uyumu
Katman (iii) için çekirdek desen. Her harness/agent `.taskard/agents/<id>/` altında kendi status+worklog'unu yazar; kök index tek bakışta filo durumunu verir.

---

## Desen 2 — CONTEXT.md + ADR doktrini (ubiquitous language, üç kapı)

**Kaynak:** MattPocock-Skills repo raporu (domain-modeling, grill-with-docs); case/project-memory.

### Mekanizma
- **CONTEXT.md = ubiquitous language sözlüğü.** Her terim 1–2 cümlelik IS-tanımı + `_Avoid_:` yasaklı eş-anlamlılar. Opinionated olmak zorunda: en iyi kelime seçilir, diğerleri yasaklanır. Genel programlama kavramları girmez.
- **ADR = sadece üç kapıdan HEPSİ birden geçen kararlar:** (1) geri döndürülmesi zor + (2) bağlam olmadan şaşırtıcı + (3) gerçek trade-off içeren. Format: NNNN-slug, **1–3 cümle**. Reddedilen ama non-obvious alternatifler değerlidir ("6 ay sonra GraphQL tekrar teklif edilmesin").
- **Kağıt izi tablosu** (grill-with-docs): terim → CONTEXT.md ANINDA; üç-kapı kararı → ADR; **geri kalan HER ŞEY → sadece konuşma**. Çoğu session sıfır ADR üretir — bu tasarımdır, eksiklik değil.
- **Facts vs decisions ayrımı:** fact bulmak agent'ın işidir (subagent dispatch eder, insanı blocklamaz); kararlar insanındır. Agent kendi kararını verirse süreç bozulmuştur.

case/project-memory'nin katkı — **dayanıklılık split'i:** `product.md` (kod rewrite'ta hayatta kalan "ne ve neden") ile `architecture.md` (rewrite'ta değişecek "şu anki implementasyon") farklı ömürlü dosyalardır; bu ayrım load-bearing'dir. Core dosyalar ~50 satırı geçerse bölünür.

### Artıları
- En yüksek token-getirisi oranı: birkaç yüz satırla tutarlı isimlendirme + karar hafızası sağlar; agent'ın "verbose/tutarsız" arızasının doğrudan panzehiri.
- ADR'nin sıkılık disiplini doc-rot'u önler; spec'ten farkı spec snapshot'tır sync edilmez, kalıcı artifact'ler CONTEXT.md+ADR'dir.
- Üç kapı eşiği "her şeyi belgeleme" tuzağını keser.

### Eksileri / arıza modları
- **En çok raporlanan problem: CONTEXT.md'in spec'e dönüşmesi** (500–3000 satır şişme). Panzehir: periyodik "make my CONTEXT.md more concise" pası; kararlar ADR'ye taşınır.
- Kısmi loading riski (grill-with-docs bug'ı): grilling yüklenip domain-modeling atlanınca iyi interview olur ama kağıt izi yok olur → yazma adımı protokole hook'la değil kurala bağlanmalı.
- ADR numarası merkezî sayaç ister; paralel session'larda NNNN çakışabilir (çözüm: tarih-slug veya hash-ID).

### Taskard'a uyumu
Katman (i)'nin çekirdeği. Taskard kendi domain terimlerini (lane, frontier, claim, bridge…) CONTEXT.md'de tutmalı; paket kullanıcılarının projeleri için de boş şablon sunmalı.

---

## Desen 3 — Append-only ledger + range-bazlı ilerleme

**Kaynaklar:** AvenoxAI (reviews.md), From-Chaos-To-Choreography (immutable state), taskops, worklease, agentdocket, agentbus.

### Mekanizma
AvenoxAI'nin background review loop'u 6.400+ satırlık kendi `reviews.md`'sini **range-bazlı ilerletir**: reviewer hangi commit/diff aralığına baktığını ledger'a işler; sonraki tur oradan sürer — hiçbir şey iki kez review edilmez, hiçbir şey atlanmaz. Loop üç yasasıyla birlikte çalışır: ölç, turlar arası minimum doğru bilgiyi taşı ("bunları denedik, şu nedenlerle olmadı" biçiminde 3–4 satır not), durma koşulu tanımla.

Dağıtık-sistem cephesinden (Choreography raporu) aynı desenin sert formu:
- State **versiyonlu immutable snapshot**'lardır (v1 mühürlenir, kimse değiştiremez).
- Store **append-only log**'dur: insert vardır, update ASLA yoktur.
- Handoff üç işlem yapar: şema doğrulama (data contract) → vN+1 oluştur → sonraki agent yeni snapshot'la çalışır. Agent girdisini DEĞİŞTİREMEZ, yalnız yeni state üretebilir. Bu tek kural bütün bir bug sınıfını (lost update, stale read) eler.
- Lineage net: v7 bozuksa v6'ya bak, state tarihinde binary search.

2026 açık kaynak somutlamalarının ortak hileleri:
- **Content-hash ID** (worklease, taskops): her satırın id'si içeriğinin hash'i → duplicate append idempotent, iki agent'ın aynı anda eklediği satırlar union-merge; "events are facts about the past — union of two logs IS the correct log".
- **TTL'li claim/lease** (worklease, taskops): "src/auth/**'e 20 dakika dokunacağım" claim'i append edilir; süre dolunca read-time'da inactive sayılır; ölü agent'ın kilidi kendiliğinden düşer.
- **Total order** (agentdocket): monotonic integer id; timestamp kaydedilir ama sıralama için ASLA kullanılmaz.
- **Mandatory provenance write-time'da** (agentbus): her bulgu `computed|fetched|recalled|testimony` etiketi taşır — model hafızasından gelen iddia doğrulanmış gibi geçemez.
- **"Event log truth; derived DB cache"** (taskops): SQLite silinip log'dan rebuild edilebilir; her view bir projeksiyondur, migration değil rendering kararıdır.

### Artıları
- Çakışmasız paralellik: append-only satırlar git merge'de en sorunsuz birim.
- Denetlenebilirlik bedava: audit trail, replay, binary-search debugging.
- Crash-safe: yarım yazılan satır atlanır, kalan log geçerli (taskops bozuk satırı notla atlar).

### Eksileri / arıza modları
- Log büyür → okuma tarafı ekonomisi gerekmezse firehose olur. agentdocket'in kampanya dersi: **append tarafı sağlam kaldı; orientation tarafı acıttı** — küçük limitli okuyan seat geride kaldığının farkında olmadı, supersede edilmiş state'e cevap verdi. Çözüm: cursor + unread remainder bildirimi + catch-up.
- Markdown'da total order zor; sıra id yerine timestamp+dosya sırasından çıkar (çoğu kullanım için yeterli).
- Saf JSONL insana sevilmez okunur → yanına üretilmiş insan-okur view (board.md) koymak şart.

### Taskard'a uyumu
Katman (ii)+(iii)'ün omurgası. Lane durum geçişleri, claim/release, frontier değişimleri append-only event olarak akmalı; board/frontier görünümleri türetilir.

---

## Desen 4 — Session köprüleri (oturum arası devir, compaction sonrası hayatta kalma)

**Kaynaklar:** MattPocock handoff skill; REMvisual/claude-handoff; Multigrid session-handoff; shawnos parallel-safe handoffs; Fazm HANDOFF.md pattern; claude-code-context-handoff plugin.

### Mekanizma
Üç sınır aynı artifact'ı ister: session→session, agent→agent, model→model. Ortak ilkeler:

- **Devir belgesi runtime artifact içermez** (transcript, tool call, model adı load-bearing konumda yok) — işin *nerede olduğunu* tarif eder, onu üreten süreci değil. Bu, portability'nin ta kendisidir.
- **Alan seti** (Multigrid JSON şeması + REMvisual iskeleti): objective · status · constraints · decisions (**why ile**) · **rejected (neden reddedildiğiyle)** · done · next (numaralı kuyruk) · open (bilinen bilinmeyenler) · artifacts (referans) · provenance (version, turns, produced_by, at).
- **`rejected` en yüksek değer/token oranlı alandır** — halefin zaten elenmiş yolu yeniden teklif etmesini önler. `open` ise kendinden emin halefin bilinmeyeni icat etmesini durdurur.
- **Resume sözleşmesi açıkça yazılmalı:** "`done` kesindir, `next` kuyruktur" cümlesi yoksa yeni session biten işi severek yapar.
- **Veri olarak render et, anlatı olarak değil** — paragraf halinde "ne oldu" anlatısı conversation muamelesi görüp 3 tur sonra compact edilir; yapılandırılmış state bloğu reference muamelesi görür.
- **Artifact'lerin özetine güvenme, yeniden oku** — dünya oturumlar arasında drift eder; dosya ground-truth, devir belgesi iddiadır.

**Paralellik problemi ve çözümü (shawnos):** tek HANDOFF.md üstüne yazılır → sessiz kayıp. Dizin-tabanlı sistem: her session `YYYY-MM-DD_HHMMSS_slug.md` yazar (timestamp uniqueness garantiler), start'ta tüketilmemişlerin TAMAMINI okur, okuduktan sonra `_done` suffix'iyle işaretler, periyodik temizlik. "Directory handles the merge."

**Zincirleme (REMvisual):** aynı iş akışındaki handoff'lar seq no + tag ile zincirlenir; 3. oturum ilk ikisini bilir. A/B testi: yapılandırılmış handoff'la çalışan session sıfır kullanıcı müdahalesiyle tam failure-zinciri takip etti; serbest özet yüzeysel fix önerdi.

**Test edilebilirlik (Multigrid):** cold-start testi (belgeyi görmemiş insana ver, ne yapacağını söyleyebiliyor mu?), swap testi (farklı model ailesiyle resume — kırılan şey bilmediğin coupling'dir), round-trip testi (üret→resume→tekrar üret→diff; sessizce kaybolan alan = renderer'ın yüzeylemediği alandır).

### Artıları
- Compaction/clear/model-değişimi/makine-değişiminin hepsine tek panzehir; diskte yaşadığı için reset'ten etkilenmez.
- "Session state'in version control'ü": seri biriktikçe multi-günlük işin evrim haritası çıkar.

### Eksileri / arıza modları
- Overwrite-tipli tek dosya (EmirOS'un Last-Session.md'si dahil) tek-session dünyasında çalışır, paralelde kaybeder.
- Round-trip decay: `rejected`/`open` alanları compactor tarafından yazılıp resume'a render edilmezse iki devirde yok olur — kasıtlı test şart.
- Bayat köprü: max-age guard'sız fallback restore eski state'i canlandırır (context-handoff plugin'in 900 sn varsayılanı).

### Taskard'a uyumu
Dört katmanın da devir aracı; ama özellikle katman (ii): köprü "hangi lane ne durumda, frontier nerede" bilgisini compaction'ı hayatta eden tek formda taşır.

---

## Desen 5 — Immutable state snapshot + data contract (versiyonlu handoff)

**Kaynaklar:** From-Chaos-To-Choreography; Beads (yapılandırılmış bellek karşılaştırma noktası); Multigrid versioning.

### Mekanizma
Desen 3'ün state odaklı yüzü, ama burada vurgu **sınır sözleşmesinde**:
- Producer belirli alanları VAAT eder (örn. findings, confidence score, sources, timestamp).
- Consumer belirtilen tipte girdi TALEP eder ve DOĞRULAR — confidence < 0.7 ise handoff REDDEDİLİR. Kalitesiz veri sınırda yakalanır, üç agent aşağıda değil.
- Snapshot formatı günbirinden version'lanır (`version` ilk alan); tanımadığı alanı sessizce yutan okuyucu constraint düşürür — version, okuyamadığı belgeyi REFUSE edebilmek içindir.
- Kod neyden eminse onu yazar (artifact path'leri, timestamp, turn sayısı, done işaretleri); model yalnız konuşmayı okumayı gerektiren alanları (karar gerekçesi) yazar. Model'in kodun bildiğini yeniden yazmasına izin vermek = plausible ama yanlış path üretmenin yolu.

**Beads kıyası (dosya tabanlılığın sınırını gösteren örnek):** Beads graph-issue tracker'ını Dolt üzerinde kuruyor; hash-ID (bd-a1b2), dependency-aware ready queue (`bd ready --json`), `discovered-from` kenarı, semantic compaction ("memory decay"), ~1–2K token'lık `bd prime` context injection. Taskard'ın dersleri Beads'ten alınabilir ama Dolt bağımlılığı alınamaz — graph sorgusunun karşılığı dosya dünyasında: task dosyalarının frontmatter'ında `blocked-by` listesi + board görünümünde hesaplanan frontier. Beads'in "messy markdown plans'ı graph ile değiştir" tezi Taskard'da "graph'ı markdown frontmatter'ında taşı"ya iner.

### Artıları
- Race condition sınıfını mimari seviyede eler (kredi skoru vakası: %20 yanlış rating'in kökü cache invalidation'sız paylaşılan mutable state'ti).
- Replay/audit/time-travel debugging bedava gelir.
- Contract red'i erken hata sinyaline çevirir.

### Eksileri / arıza modları
- Dosya tabanlı dünyada snapshot başına dosya = şişme; pratik çözüm snapshot'ı devir anında tek dosyada sabitlemek, arşivi git'e bırakmak.
- Sözleşme şemasını önceden tanımlama emri ister; aşırı sıkı şema esnekliği öldürür (Choreography raporu: "%100 kötü olan bir şey yok").

### Taskard'a uyumu
Katman (ii)+(iii) arası handoff'lar (task claim, lane devri, orchestrator→worker brief) küçük immutable belgeler olarak modellenmeli.

---

## Desen 6 — Context ekonomisi teknikleri

**Kaynaklar:** AvenoxAI ölçümleri; MattPocock smart/dumb zone; Claude Code auto memory; agents-playbook memory pattern; shawnos MEMORY.md dersi; agent-work-mem tiering.

### Ölçüler (kanıt zinciri)
- Bağımsız üç ölçüm aynı orana işaret ediyor: kullanıcı prompt'unun pencere payı ~%15 (4.3K/27.5K); subagent dönüşü **~50x damıtma** (75K→1.4K, 132K→1.5K); 5 paralel araştırma agent'ının toplam çıktısı ana pencerede %18 doluluk.
- Smart zone ~100K token; attention ilişkileri kuadratik büyür. 1M pencere retrieval için iyi, coding için kötü — "daha çok dumb zone shipping".

### Teknikler
1. **Bounded index + lazy load.** Claude auto memory modeli: `MEMORY.md` index'i hard-cap'li (ilk 200 satır / 25KB), detay topic dosyalarında talep üzerine. Limit aşılırsa **alt kısım sessizce düşer ve bayatlık uyarısı bile üretilmez** — en çok tartışılan zaaf. shawnos'un vakası: 30 satırlık MEMORY.md haftalarca append'le 400'e çıktı, 200 sonrası görünmez oldu.
2. **Pointer pattern.** CLAUDE.md/AGENTS.md tam metin değil **dosya adresi** taşır; index küçük kalır, içerik gerektiğinde yüklenir. AGENTS.md kanonik + CLAUDE.md tek satır `@AGENTS.md` import'u = çoklu-harness portability'nin standart formülü (Anthropic resmi önerisi).
3. **Tiered storage.** agent-work-mem: HOT (work.log, son ~50 olay) → WARM (tarih bazlı arşiv) → COLD (aylık digest, yalnız talep üzerine). Rotasyon eşiği proje tipine göre (multi-agent: 30, solo: 100).
4. **Progressive disclosure.** Skills index hep prompt'ta (~2 token/skill), tam içerik ilk kullanımda. Aynı ilke hafızaya uygulanır: index hep, body nadiren.
5. **Freshness sinyali.** >1 günlük memory dosyasına "X gün eski; point-in-time gözlem" uyarısı iliştirilir — modele açık "buna daha az güven" sinyali.
6. **One-fact-per-file.** agents-playbook: her fact kendi dosyasında, tipli frontmatter (user/feedback/project/reference), `[[wikilink]]` çapraz bağ; ~%80 örtüşen fact yeni dosya açmaz mevcudu keskinleştirir.
7. **Damıtma sözleşmesi.** Subagent/worker dönüşü ≤15 satır status contract (Superpowers SDD); ham çıktı report file'da kalır, orchestrator penceresine girmez.
8. **No-op testi** (writing-for-agents): satırı sil — davranış değişmiyorsa o satır her okumada no-op context öder.

### Taskard'a uyumu
Çerçeve desen: diğer beş deseni saran bütçe disiplini. `.taskard/` içindeki HER dosyanın bir yükleme zamanı olmalı: her-tur / session-start / talep-over / asla-insan-only.

---
# Bölüm II — `.taskard/` Şeması İçin Üç Alternatif Taslak

Ortak sabitler (üç taslakta da geçerli):
- Giriş noktası **harness-nötr**: `AGENTS.md` kanonik; `CLAUDE.md` tek satır `@AGENTS.md` import'u; `GEMINI.md`/diğerleri pointer. Tek kaynak, çoklu loader.
- Kişisel hafıza katmanı (`user/`) genel yapıda: şema açık kaynak, içerik kullanıcıya ait ve repodan dışlanabilir (`user/.gitignore` veya vault-path config).
- Her dosya YAML frontmatter taşır: en azından `id`, `type`, `status`, `owner?`, `created`, `modified`.
- Tüm olay kaydı satır-bazlı append; content-hash id; update yok, düzeltme = yeni event.

---

## Alternatif A — "Namespace Blackboard"

Felsefe: **herkes kendi dosyasına yazar, ortak gerçek az ve elle kıymetlidir.** agent-vault + pi-ensemble + Matt Pocock doktrini. En okunabilir, en insancıl seçenek.

### Dizin ağacı
```
.taskard/
├── AGENTS.md                      # protokol özeti + okuma sırası (≤60 satır)
├── PROTOCOL.md                    # tam kural kitabı: claim, handoff, append grameri
├── project/
│   ├── CONTEXT.md                 # ubiquitous language sözlüğü (IS-tanım + _Avoid_)
│   ├── decisions/
│   │   ├── ADR-0001-lane-semantics.md     # 1–3 cümlelik kararlar
│   │   └── ...
│   └── specs/                     # destination dokümanları (PRD/spec snapshot)
├── tasks/
│   ├── board.md                   # İNSAN-ÖNCelikli görünüm: lane × status matrisi + frontier
│   ├── T-7f3a2c-auth-retry.md     # dosya başına task; id = 6-hex content-hash prefix
│   └── T-9c1d84-merge-worker.md
├── agents/
│   ├── registry.md                # kim yaşıyor, hangi harness, son görülme (elle değil script-tazelemeli)
│   └── claude-w1/                 # agent başına özel yazma namespace'i
│       ├── status.md              # current_task, blockers, last_seen_event (tek ekran)
│       ├── inbox.md               # diğer agent'lardan mesajlar (append)
│       └── worklog.md             # kendi çalışma günlüğü (append)
├── sessions/
│   ├── BRIDGE.md                  # SON köprü (overwrite — tek aktif devir varsayımı)
│   └── archive/
│       └── 2026-08-23_1930_auth-lane.md   # timestamp'li eski köprüler
├── events.jsonl                   # append-only omurga: claim/release/status/handoff olayları
└── user/                          # kişisel hafıza (açık şema, kullanıcı içeriği)
    ├── MEMORY.md                  # bounded index: terim başına tek satır (≤200 satır sert limit)
    ├── user_profile.md            # one-fact-per-file, tipli frontmatter
    ├── feedback_testing.md
    └── project_context.md
```

### Örnek dosya iskeletleri

**tasks/T-7f3a2c-auth-retry.md**
```markdown
---
id: T-7f3a2c
title: Auth retry backoff'u exponential yap
lane: backend
status: in_progress        # ready | in_progress | blocked | review | done
owner: claude-w1
blocked-by: [T-9c1d84]
created: 2026-08-23T19:40:00Z
modified: 2026-08-23T20:05:00Z
---
## Contract (deliverable)
Retry'lar exponential backoff + jitter kullanır; max 5 deneme; test edilebilir seam: RetryPolicy.

## Notes
- Denenen: sabit 1s interval → rate-limit'e takıldı (bkz. events.jsonl:evt-41). TEKRAR TEKLİF ETME.

## Done criteria
- [ ] Unit: jitter'sız deterministik test
- [ ] Integration: 429 sonrası geri çekilme gözlenir
```

**agents/claude-w1/status.md**
```markdown
---
agent_id: claude-w1
harness: claude-code
updated: 2026-08-23T20:05:00Z
---
current_task: T-7f3a2c
blockers: yok
last_seen_event: evt-43
next_action: jitter seed'inin inject edilebilir seam'ini aç
```

**events.jsonl (satır örnekleri)**
```jsonl
{"id":"evt-43","ts":"2026-08-23T20:05:00Z","type":"status","actor":"claude-w1","ref":"T-7f3a2c","from":"ready","to":"in_progress","hash":"a1b2c3"}
{"id":"evt-44","ts":"2026-08-23T20:06:12Z","type":"claim","actor":"gemini-r2","ref":"src/api/**","ttl_min":30,"hash":"b2c3d4"}
{"id":"evt-45","ts":"2026-08-23T20:07:00Z","type":"handoff","actor":"claude-w1","to":"codex-rv","ref":"T-7f3a2c","note_path":"sessions/archive/2026-08-23_2007_review-note.md","hash":"c3d4e5"}
```

### Okuma/yazma protokolü
- **Session start (her agent):** AGENTS.md → project/CONTEXT.md → agents/registry.md + kendi status.md → tasks/board.md (frontier) → kendi inbox.md tail → events.jsonl son N satır. Toplam bütçe ≤ ~2K token; detaya iniş talep üzerine.
- **Yazma:** agent YALNIZ kendi namespace'ine yazar; task dosyasını yalnız owner'ı değiştirir; her ownership/durum değişimi events.jsonl'a tek satır append. Board.md owner-değişiminde yeniden yazılır (tek sorumlulu var).
- **Devir:** oturum sonu / ctx ~%20'de sessions/BRIDGE.md overwrite (objective/constraints/decisions/rejected/done/next/open/provenance alanları); paralel koşuda BRIDGE yerine timestamp'li archive dosyasına yaz + events'a `bridge` eventi.
- **Claim:** işe başlamadan events.jsonl'a TTL'li claim satırı; süre dolunca read-time'da inactive.

### Artı / Eksi
- (+) İnsan-okur en yüksek; debug'ı cat ile olur. (+) Namespace izolasyonu paralelliği ücretsiz yapar. (+) Task dosyası zengin: contract, done-criteria, notes aynı yerde.
- (−) board.md/registry.md elle senkron yükü → script/MCP aracı olmadan drift riski. (−) Frontier sorgusu ("hangi task hazır?") board'dan metin okumak = Beads'in `bd ready --json`ının zayıf taklidi; DAG büyüyünce kırılgan.

---

## Alternatif B — "Ledger-First" (append-only tek hakikat + projeksiyonlar)

Felsefe: **event log hakikattir; her şey ondan türetilir.** taskops + agentdocket + agentbus + Beads ruhu. En sağlam, en makine-dostu seçenek.

### Dizin ağacı
```
.taskard/
├── AGENTS.md                      # pointer + "ledger'ı oku, view'lara güven ama doğrula"
├── PROTOCOL.md                    # event grameri: zorunlu alanlar, type enum'u, provenance kuralları
├── ledger.jsonl                   # TEK HAKİKAT: tüm olaylar append-only, content-hash id, total order (monotonik seq)
├── views/                         # TÜMÜ ledger'dan türetilir; silinebilir/rebuild edilebilir
│   ├── board.md                   # lane × status (generate edilmiş)
│   ├── frontier.md                # blocked-by'ı çözülmüş task listesi (= bd ready karşılığı)
│   └── workload.md                # aktif claim'ler + TTL durumları
├── project/
│   ├── CONTEXT.md
│   ├── decisions/*.md             # ADR (insan-yazılı; ledger'a 'decision' event'iyle referanslanır)
│   └── specs/*.md
├── handoffs/                      # immutable devir belgeleri (v-sürümlü, data contract'lı)
│   └── H-0007_lane-devri_claude→codex.md
├── user/
│   ├── MEMORY.md                  # bounded index
│   └── *.md                       # tipli fact dosyaları
└── tools/                         # (paketin sunduğu) generate/lint/ready CLI betikleri — opsiyonel ama tavsiye
```

### Örnek dosya iskeletleri

**PROTOCOL.md — event grameri (özet)**
```yaml
event:
  seq: <int, monotonik>          # sıralama bununla; timestamp asla ordering için kullanılmaz
  id: evt-<8hex>                 # content-hash → duplicate append idempotent
  ts: <ISO8601>
  actor: <agent-id|human>
  provenance: computed|fetched|recalled|testimony   # mandatory (agentbus kuralı)
  type: task_created|claim|release|status|handoff|bridge|decision|note|correction
  ref: <task-id|path>
  payload: {...}                 # type'a göre sözleşmeli; correction eski event id'sine referans verir
kural: |
  Satırlar ASLA düzenlenmez/silinmez. Düzeltme = correction event'i.
  Bozuk satır atlanır + not edilir; kalan log geçerli.
  views/ her zaman rebuild edilebilir; ledger silinmez.
```

**views/frontier.md (üretilmiş çıktı örneği)**
```markdown
# Frontier — 2026-08-23T20:10Z itibarıyla (ledger seq 128'den üretildi)
| Task | Lane | Hazır olma nedeni |
|------|------|-------------------|
| T-7f3a2c | backend | blocked-by boş, claim yok |
| T-2b8e11 | qa | review bekleyen T-9c1d84 merge oldu |
<!-- rebuild: taskard ready (veya jq + awk eşdeğeri) -->
```

**handoffs/H-0007_lane-devri.md**
```markdown
---
version: 1                 # format versiyonu ilk alan; tanınmayan sürüm REFUSE edilir
seq_at_handoff: 126
producer: claude-w1
consumer_contract: {required_fields: [objective, state, next], schema: v1}
---
objective: Auth lane'inin retry katmanını bitirmek.
state: T-7f3a2c %70; jitter seam açıldı; testler 4/6 yeşil.
decisions:
  - what: Jitter deterministik seed ile
    why: Test tekrarlanabilirliği; rastgele seed flaky üretti
rejected:
  - what: Sabit interval
    why: Rate-limit'e yakalandı (evt-41) — bir daha önermeyin
next:
  1. Kalan 2 testi yeşile çek
  2. Integration testini ekle
open:
  - Backoff üst sınırı 30s mi 60s mı — spec'te netleşmedi
```

### Okuma/yazma protokolü
- **Session start:** AGENTS.md → views/frontier.md + workload.md (türetilmiş, ucuz) → gerekirse ilgili task'ın ledger dilimi (`jq 'select(.ref=="T-...")'`) → user/MEMORY.md.
- **Yazma:** HER değişim ledger'a tek satır; views sadece generate aracı eliyle güncellenir (kimse elle view yazmaz — yazanın view'ı yalan sayılır).
- **Çakışma stratejisi:** content-hash id sayesinde union merge; seq iki tarafın lokal sayaçlarından çıkarsa ts+actor tie-break ile normalize eden `taskard reconcile` adımı.
- **Compaction recovery:** yeni session `taskard catch-up <son-bilinen-seq>` der; unread remainder + head bildirilir (agentdocket dersi: orientation'ı açıkça raporla).

### Artı / Eksi
- (+) Çakışmasız paralellikte en güçlü garanti; audit/replay/time-travel bedava; views=cache doktrini şişmeyi yapısal olarak engeller. (+) Frontier sorgusu deterministik (Beads'in ready queue'sunun dosyalı karşılığı).
- (−) İnsan deneyimi JSONL ağırlıklı — view üretici araç olmadan ham hali sevilmiyor. (−) Seq/ordering yönetimi basit betik bile olsa disiplin ister; saf-markdown rakibi A'ya göre giriş eşiği yüksek. (−) Zengin task gövdesi (contract, notes) ledger satırına sığmaz → task dosyalarıyla hibrit şart (satırda ref, dosyada beden).

---

## Alternatif C — "Tiered Memory" (sıcaklık katmanlı ekonomi)

Felsefe: **okuma bütçesi tasarımın merkezidir; her bilgi sıcaklığına göre yaşar.** agent-work-mem + Claude auto memory + AvenoxAI Raporlar/ klasörü. En düşük sürtünmeli, araçsız seçenek.

### Dizin ağacı
```
.taskard/
├── AGENTS.md                      # pointer: okuma sırası INDEX → OVERVIEW → HOT tail
├── PROTOCOL.md                    # rotasyon eşikleri, append grameri, tier geçiş kuralları
├── INDEX.md                       # READ-FIRST: envanter + topic search index + ayar satırı (HOT_RETENTION_EVENTS: 50)
├── PROJECT_OVERVIEW.md            # her yeni LLM'e 30 sn'de sahne kuran primer (≤80 satır, periyodik damıtılır)
├── hot/                           # HER-TUR / HER-SESSION okunanlar; hepsi bounded
│   ├── board.md                   # lane × status + frontier (rewrite-edilen canlı state)
│   ├── claims.md                  # aktif claim'ler (TTL'li satırlar; dolanlar rotasyonda temizlenir)
│   └── bridge.md                  # son session köprüsü (overwrite; paralelde hot/bridges/ dizinine dönüşür)
├── warm/                          # SESSION-ARASI; tarih bazlı append
│   ├── log-2026-08-23.md          # günün olayları (worklog karşılığı)
│   ├── worklogs/<agent-id>.md     # agent başına uzun çalışma günlüğü
│   └── handoffs/H-*.md            # immutable devir belgeleri
├── cold/                          # NADİR; yalnız explicit istekle yazılan damıtılar
│   └── digest-2026-08.md          # aylık özet: kararlar + kalıcı dersler
├── project/
│   ├── CONTEXT.md                 # ubiquitous language (hot sıcaklığında KÜÇÜK tutulur)
│   ├── decisions/adr-*.md         # üç-kapı geçmiş kararlar (cold'a yakın ömür)
│   └── specs/*.md
├── user/
│   ├── MEMORY.md                  # bounded index (≤200 satır), topic dosyalara link
│   └── <type>_<slug>.md           # one-fact-per-file
└── archive/                       # warm'dan döndürülmüş eski loglar (grep hedefi; INDEX'te tarih-aralık+keyword kayıtlı)
    └── log-2026-08-10.md
```

### Örnek dosya iskeletleri

**INDEX.md**
```markdown
# Taskard Index
## Configuration
HOT_RETENTION_EVENTS: 50

## Inventory (ne nerede, ne zaman okunur)
- hot/board.md — lane durumları + frontier. HER SESSION START'ta oku.
- hot/claims.md — kim neyi tutuyor (TTL dahil). İş seçmeden önce oku.
- project/CONTEXT.md — domain terimleri. Kod yazmadan önce oku.
- user/MEMORY.md — kullanıcı tercih indexi. İlk etkileşimde oku.

## Topic Search Index
| Anahtar | Dosya | Tarih aralığı |
|---------|-------|---------------|
| auth, retry | archive/log-2026-08-15.md | 08-15 |
| merge worker | warm/log-2026-08-23.md | 08-23 |

## Active handoffs
- H-0012 (claude-w1 → codex-rv): review bekliyor
```

**hot/claims.md**
```markdown
---
updated: 2026-08-23T20:15:00Z
---
| Agent | Kapsam | Reason | Expires |
|-------|--------|--------|---------|
| claude-w1 | src/retry/** | T-7f3a2c | 20:35 |
| gemini-r2 | docs/** | README revizyonu | 20:50 |
```
Kural: claim satırı append edilir; expire olan read-time'da yok sayılır; rotasyonda fiziksel olarak silinir (append-only burada DEĞILDIR — bu dosya canlı state'tir, hakikat warm/cold'daki loglarda yaşar).

**warm/log-2026-08-23.md**
```markdown
# 2026-08-23
- 19:40 claude-w1: T-7f3a2c başladı (claim: src/retry/**, 30dk)
- 19:55 claude-w1: sabit-interval denendi → 429; REDDEDİLDİ (neden: rate-limit). Exponential+jitter'a geçiliyor.
- 20:02 codex-rv: T-9c1d84 merge tamam; board güncelledi.
```

### Okuma/yazma protokolü
- **Her tur:** INDEX.md (küçük) → görevle ilgili hot dosyası. **Session start:** INDEX → PROJECT_OVERVIEW → hot/board + hot/bridge tail → user/MEMORY.md. Detay: INDEX topic aramasıyla warm/cold'dan tek dosya.
- **Yazma:** olaylar warm log'a satır-append; canlı state (board/claims/bridge) rewrite; HOT_RETENTION aşılınca sıradaki agent eski olayları archive/ dosyasına döndürür ve INDEX'i günceller (agent-work-mem rotasyonu).
- **Damıtma:** haftalık/aylık "digest yaz" komutu cold'a; ardından PROJECT_OVERVIEW tazelenir. CONTEXT.md 150 satırı geçerse "more concise" pası zorunlu (Matt Pocock panzehiri).
- **Paralel mod:** sync'li klasörde (iCloud/git) tek bridge.md yerine hot/bridges/YYYYMMDD_HHMMSS_slug.md; start'ta tüketilmemişler okunur, `_done` ile işaretlenir (shawnos).

### Artı / Eksi
- (+) Context ekonomisi yapısal garantili: hiçbir dosya limitsiz büyümez; okuma bütçesi katman başına bellidir. (+) Araç gerektirmez; rotasyonu agent kendisi yapar. (+) INDEX topic-search'i "did we discuss X?" sorusunu ucuzlatır.
- (−) Canlı-state dosyalarında (board/claims) append-only güvencesi yok → çift yazıcıda yarış riski; paralellik yine de namespace+timestamp disiplinine yaslanmak zorunda. (−) Tier geçiş kuralları protokol metnine bağlı — uyulmazsa warm şişer, INDEX bayatlar.

---

## Karşılaştırma ve Seçim Rehberi

| Kriter | A: Namespace Blackboard | B: Ledger-First | C: Tiered Memory |
|---|---|---|---|
| Paralel yazma güvenliği | ● namespace izolasyonu | ●● union-merge + total order | ◐ timestamp + disiplin |
| Frontier/ready sorgusu | ◐ board'dan metin | ● deterministik view | ◐ board'dan metin |
| İnsan-okurluk | ●● | ◐ (view'larla ●) | ●● |
| Context ekonomisi | ◐ kurala bağlı | ● views/cache doktrini | ●● yapısal (tiering) |
| Araç bağımlılığı | yok | view-generator tavsiye (ops.) | yok |
| Audit/replay | ◐ events.jsonl kısmi | ●● tam | ◐ warm loglar |
| Kurulum/disiplin maliyeti | düşük | orta-yüksek | düşük-orta |

**Sentez önerisi (raporun ana tavsiyesi):** Üçü ayrık değerlerde güçlü; Taskard için **B'nin omurgası + A'nın ergonomisi + C'nin ekonomisi** hibriti doğal duruyor: `events.jsonl` (content-hash, append-only, claim/TTL) hakikat kaynağı; task dosyaları ve agent namespace'leri insancıllığı taşıyan zengin belgeler; `views/board.md` + `frontier.md` üretilmiş cache; INDEX + tiering okuma bütçesini sabitleyen çerçeve. Kişisel hafızada üçünde de aynı model: bounded MEMORY.md index + one-fact-per-file + freshness. Son karar paketin "araçsız çalışabilmeli mi" ilkesine bağlı: araçsız şartsa A veya C; küçük bir CLI/MCP kabulse B'nin garantileri hak ediyor.

---

## Ek: Uygulanan İlkelerin Kaynak Haritası

| İlke | Kaynak |
|---|---|
| `@AGENTS.md` import formülü | Anthropic Claude Code memory docs |
| Bounded index (200 satır/25KB, sessiz kesilme zaafı) | Claude Code auto memory; shawnos vakası |
| One-fact-per-file + tip frontmatter | agents-playbook memory pattern |
| Özel yazma namespace + append-only paylaşılan log + exclusive ownership | agent-vault |
| Blackboard + inbox + claims + audit | pi-ensemble |
| Content-hash id, TTL'li lease, pre-commit check | worklease; taskops |
| Total order (monotonik seq), cursor + unread remainder | agentdocket |
| Mandatory provenance (computed/fetched/recalled/testimony), correction=new message | agentbus |
| Event log=hakikat, SQLite/view=cache, hooks fail-open | taskops |
| Hash-ID, dependency-aware ready, semantic compaction, `bd prime` | Beads (Steve Yegge) |
| Immutable vN snapshot + data-contract red'i + lineage binary search | From-Chaos-To-Choreography (Databricks) |
| Worklog+index.md, range-bazlı reviews.md, loop üç yasası | AvenoxAI Oyun Fabrikası |
| CONTEXT.md/ADR üç kapı, facts-vs-decisions, ~50 satır split | MattPocock skills (domain-modeling, grill-with-docs, case/project-memory) |
| Handoff alan seti, rejected değeri, round-trip/cold-start/swap testleri, version-first | Multigrid; REMvisual claude-handoff |
| Paralel-safe handoff dizini (timestamp + read-all + mark-done) | shawnos.ai |
| ~50x damıtma, %18 doluluk ölçümü, pointer pattern | AvenoxAI context ölçümleri |
| Smart zone ~100K, kuadratik attention | Matt Pocock video notu (Dex Hardy) |
| HOT/WARM/COLD rotasyon + topic index | agent-work-mem |
