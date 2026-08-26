# Dış Skill Bağımlılıkları

Taskard bu skill'leri PAKETE GÖMEZ — makinende kurulu olanları referans verir. Upstream güncellenirse sen otomatik günceldesin; senkron derdi sıfır. `install.sh` eksikleri `npx skills` ile kurar.

Kaynaklar: [obra/superpowers](https://github.com/obra/superpowers) · [mattpocock/skills](https://github.com/mattpocock/skills)

## Bağlama tablosu

| Skill | Kaynak | Tetik fazı | Yoksa |
|---|---|---|---|
| using-superpowers | superpowers | Akış başı router | SKILL.md tablosu tek kaynak olur |
| brainstorming | superpowers | Yaratıcı/işlev ekleme iş | Kompakt spec ile devam, riskli işte ekstra dikkat |
| grilling | mattpocock | Büyük/riskli görevde hizalanma | Kendi soru disipliniyle hizalanma |
| grill-with-docs | mattpocock | Ürün kararları turu (proje-bağlamlı; CONTEXT.md/ADR → `.taskard/context/`) | grilling ile devam |
| grill-me | mattpocock | Ürün kararları turu (repo-dışı/kavramsal) | grilling ile devam |
| domain-modeling | mattpocock | Grilling sırasında terim/ADR kağıt izi | Terimler CONTEXT.md'e elle |
| wayfinder | mattpocock | İş >1 oturum, sisli kapsam | İş standart tier'a bölünür |
| writing-plans | superpowers | Standart tier plan dokümanı | Spec doğrudan brief'lere bölünür |
| codebase-design | mattpocock | Seam/mimari karar tartışması | Derinlik prensipleri brief'e elle yazılır |
| subagent-driven-development | superpowers | Standart tier delegate döngüsü | Taskard'ın kendi lane/gate disiplini yeterli |
| executing-plans | superpowers | Inline yürütme alternatifi | Lane sırası elle işletilir |
| dispatching-parallel-agents | superpowers | ≥2 bağımsız lane (graph modu) | Sıralı yürütme (yavaş ama doğru) |
| using-git-worktrees | superpowers | Paralel lane izolasyonu | Tek checkout, paralel yapılmaz |
| resolving-merge-conflicts | superpowers | Worktree merge çakışması | Çakışma kullanıcıya eskalasyon |
| requesting-code-review | superpowers | Gate 1 kalibrasyonu (reviewer agent) | Reviewer tanımındaki kalibrasyon metni |
| receiving-code-review | superpowers | Fix delegate'i bulgu aldığında | Doğrula-sonra-uygula kuralı SKILL.md'de |
| test-driven-development | superpowers | Implementer: her davranış değişikliği | Implementer tanımındaki iron law metni |
| systematic-debugging | superpowers | 2. başarısız denemede teşhis | Kök-neden soruları elle sorulur |
| verification-before-completion | superpowers | Her kapanışta kanıt kontrolü | Kanıt zorunluluğu SKILL.md iron law 4 |
| finishing-a-development-branch | superpowers | Yeşil suite sonrası merge menüsü | Merge kararı doğrudan kullanıcıya |
| improve-codebase-architecture | mattpocock | Periyodik bakım / refactor turu | Ayrı istekle manuel |

## Rol sözleşmelerine bağlı ek skill'ler

Aşağıdakiler agent tanımlarındaki **zorunlu skill sözleşmelerinde** geçer; makinede kurulu olanlar kullanılır, paketlenmez.

| Skill | Bağlı rol | Kaynak |
|---|---|---|
| web-design-guidelines | reviewer (UI diff), ui-developer (self-check) | Vercel skill koleksiyonu |
| security-review | reviewer (güvenlik-duyarlı diff) | Anthropic skill koleksiyonu |
| diagnosing-bugs | debugger | obra/superpowers ailesi |
| find-docs | explorer | lokal kurulu |
| webapp-testing · agent-browser | qa-tester (web end-state testi) | lokal kurulu |
| frontend-design | ui-developer (web) | anthropics/claude-code plugin'i |
| expo-* (project-structure, native-ui, router, data-fetching, ui, tailwind-setup) | ui-developer (mobil) | Expo OSS skill koleksiyonu |

> v0.5 notu: bu tablodaki kaynakların `npx skills` kurulum adresleri install.sh'e bağlanacak.

## Kurulum

```bash
./install.sh   # eksikleri npx skills ile kurar, mevcutları atlar
```

Elle kurulum:

```bash
npx skills add obra/superpowers --global
npx skills add mattpocock/skills --global
```
