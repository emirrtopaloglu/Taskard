<div align="center">

```text
  ████████╗ █████╗ ███████╗██╗  ██╗ █████╗ ██████╗ ██████╗
  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗
     ██║   ███████║███████╗█████╔╝ ███████║██████╔╝██║  ██║
     ██║   ██╔══██║╚════╝  ██╔═██╗ ██╔══██╗██╔══██╗██║  ██║
     ██║   ██║  ██║███████╗██║  ██╗██║  ██║██║  ██║██████╔╝
     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
```

### Geliştirici CLI'ları İçin Sıfır Bağımlılıklı Ajan İş Akışı Kuralları

[![CI](https://github.com/emirrtopaloglu/Taskard/actions/workflows/ci.yml/badge.svg)](https://github.com/emirrtopaloglu/Taskard/actions)
[![Version](https://img.shields.io/badge/version-v0.1.3-blue.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Node%20Dependencies-Zero-success.svg)](#)
[![Harness Profiles](https://img.shields.io/badge/Profiles-Claude%20%7C%20OpenCode%20%7C%20Codex%20%7C%20Antigravity%20%7C%20Cursor-orange.svg)](#-harness-desteği)

[English](README.md) · [Roadmap](docs/ROADMAP.md) · [Katkı Rehberi](CONTRIBUTING.md) · [Güvenlik](SECURITY.md)

</div>

---

## Taskard Ne Yapar?

Taskard; Markdown rol sözleşmeleri, TOML tercihleri, harness profil verileri ve iş akışı kuralları sağlar. Küçük Node CLI'ı bu dosyaları kurar ve denetler. CLI, çalışma zamanında bir orkestrasyon servisi çalıştırmaz ve ajanların kurallara uyduğunu kanıtlamaz.

İş akışı; görev kapsamını seçmek, adlandırılmış rollere delege etmek, kaynak bağlamını izlemek ve kontrolleri raporlamak için ortak bir yöntem sunar. Ajanları ve araçları ilgili harness çalıştırır.

- **Adlandırılmış roller:** `planner`, `implementer`, `reviewer`, `debugger`, `ui-developer`, `explorer` ve `qa-tester` açık sözleşmelere sahiptir.
- **Önce risk:** Fast, Pro ve Max işi risk ve inceleme gereksinimine göre ölçekler. Dosya sayısı yalnızca yardımcı bir işarettir.
- **Kaynağa bağlı brief:** Satır pointer'ları kaynak commit'i ve isteğe bağlı sembol adını içerir. Delege gerektiğinde çağıranları ve bağımlılıkları inceleyebilir.
- **TDD ve kanıt kuralları:** Beklenen Red sonucu başarısız fix denemesinden ayrı tutulur. Raporlar komutları ve kanıt dosyalarını commit'lere ve hash'lere bağlar.
- **Sınırlı yerel izinler:** Claude Code ve OpenCode, reviewer ve explorer araçlarını kısıtlar. Diğer harness'lara talimat verilir; Taskard bunlarda salt-okunur sınırını teknik olarak uygulamaz.
- **Ajanların okuduğu konfigürasyon:** Konfigürasyon ve profil dosyaları veridir; Taskard çalışma anında bunları değiştirmez.

## Kurulum

Taskard CLI, Node.js 18 veya üzerini gerektirir ve harici Node çalışma zamanı bağımlılığı yoktur.

```bash
npx taskard init
```

Diğer seçenekler:

```bash
npx taskard init -i       # etkileşimli kurulum
npx taskard init --global # global kurulum
```

Proje kurulumu için `npx taskard init` komutunu proje dizininde çalıştırın; home dizinine yazmaz. `--global`, Taskard'ı ve harness dosyalarını kullanıcı düzeyindeki dizinlere kurar. Mevcut normal harness dosyaları korunur. `--force`, Taskard'ın yönettiği link ve profilleri yeniler ve yalnızca seçili kapsamın konfigürasyonunu sıfırlar. Proje kapsamındaki force, global konfigürasyonu doğrular ve korur; profilleri proje sıfırlaması sonrasındaki etkin konfigürasyondan üretir. Sahipsiz, bozuk veya tamamlanmamış Taskard direktif işaretleri manifest değiştirilmeden önce reddedilir.

Shell kurulumunu yerel bir kopyadan çalıştırabilirsiniz:

```bash
git clone https://github.com/emirrtopaloglu/Taskard.git
cd Taskard
./install.sh
```

Shell kurulumunun Taskard'ı uzaktan klonlaması gerekiyorsa Git gerekir. Varsayılan kurulum isteğe bağlı harici skill'leri değiştirmez. Ağ üzerinden global skill kurulumu için checkout içinden `./install.sh --install-skills` veya `npx taskard init --global --install-skills` çalıştırın. Bu açık seçenek etkileşimsiz ağ isteklerini paket başına 30 saniyeyle sınırlar ve oluşan skill yollarını denetler. Çözümleme başarısız olursa Taskard kısmi sonucu bildirip temel kurulumu tamamlar; varsayılan kurulum ve dry-run isteğe bağlı skill'ler için ağa bağlanmaz.

Yararlı komutlar:

```bash
taskard doctor                 # gerekli harness köprüleri ve konfigürasyonu denetle; hata varsa sıfır dışı çıkar
taskard config                 # ajanların okuduğu tercihleri incele
taskard roles                  # yedi adı belirli rolü listele
taskard lanes                  # lane kayıtlarını listele
taskard verify                 # lane raporlarını, commit güncelliğini ve kanıt referanslarını denetle
taskard verify --global        # global lane'leri denetle
taskard clean --dry-run        # temizlik önizlemesi
taskard clean                  # uygun tamamlanmış lane'leri .taskard/archive/lanes/ altına arşivle
taskard clean --all            # onay sonrası tüm etkin lane, tmp ve diff dosyalarını sil
taskard clean --purge          # onay sonrası uygun tamamlanmış arşivleri kalıcı sil
```

`taskard clean` varsayılan olarak uygun tamamlanmış lane'leri arşivler; geçici dosyalara ve diff'lere dokunmaz. `--all` ve `--purge` etkileşimli onay veya `--yes` gerektirir; `--all --purge` arşivlenmiş lane'leri de siler. Temizlik symlink kapsamlarını reddeder ve silme hatalarında sıfır dışı çıkar. Her lane'de en fazla bir etkin review kaydı bulunur ve dosyanın adı `review.md` olur; birden fazla etkin review kaydı verdict'ü belirsiz yapar, bu yüzden normal tamamlanmış lane temizliği ve arşiv purge işlemi lane'i korur.

`taskard doctor`, seçili harness'ın gerekli skill köprüsünü, varsa yerel rol dışa aktarımlarını, etkin konfigürasyonu ve sürümlü direktif bloklarını denetler. Gerekli bir entegrasyon eksik veya geçersizse sıfır dışı çıkar; kurulu harness köprüsü olmayan paket kaynak dizinini kurulu değil olarak bildirir.

Global hedefi `~/.taskard/config.toml` içindeki `primary_harness` ile seçin; init bu değer yoksa algıladığı harness'ı kullanır ve hiçbir harness algılanmazsa Claude Code'u seçer. Global direktifler bu seçimi izler: Claude Code `~/.claude/CLAUDE.md` ve `~/.claude/AGENTS.md` kullanır; Codex `$CODEX_HOME/AGENTS.md` yolunu (varsayılan `~/.codex/AGENTS.md`), OpenCode ise `$OPENCODE_CONFIG_DIR` içindeki `AGENTS.md` dosyasını (varsayılan `${XDG_CONFIG_HOME:-~/.config}/opencode`) kullanır. OpenCode rol dışa aktarımları da aynı konfigürasyon dizinine yazılır. Taskard bu yerel kökleri yalnızca `HOME` içinde kaldıklarında kullanır; dışarıdaki bir kök kurulumdan önce reddedilir ve doctor tarafından desteklenmiyor olarak bildirilir. Antigravity ve Cursor yalnızca proje kapsamındaki recipe profilleridir; global kapsamda yerel sağlık iddiası oluşturulmaz.

`taskard verify` salt-okunurdur. Lane sözleşmelerini, Git güncelliğini, kanıt hash'lerini ve kaynak satır aralıklarını denetler; kaydedilen kaynak commit'inde veya çalışma ağacında symlink üzerinden ilerleyen pointer'ları reddeder. `EVIDENCE_COMMAND` komutunu çalıştırmaz ve ajan iddialarını doğrulamaz. Boş bir lane dizini başarılı boş kontroldür; görevin veya testin çalıştığı anlamına gelmez. Sınırlar için [Rol, Brief ve Kanıt Sözleşmeleri](skills/taskard/references/roles-and-evidence.md) sayfasına bakın.

## İş Akışını Kullanma

Harness'ınızda görevi açıklayın ve Taskard iş akışını kullanmasını isteyin. Gear'ı açıkça da belirtebilirsiniz:

```text
Bunu Fast modda yap: sayfa başlığındaki yazım hatasını düzelt.
Bunu Max modda yap: kimlik doğrulamayı yeni tenant modeline geçir.
```

Kullanıcının istediği gear önceliklidir. Ajan, açıkta kalan riskleri belirtmeli ve gerekli veri güvenliği kontrollerini korumalıdır.

## Gear'ı Önce Riski Değerlendirerek Seçin

Görevin riski, kapsamı ve inceleme gereksinimini karşılayan en düşük gear'ı seçin. Kimlik doğrulama, güvenlik, veri kaybı, yıkıcı temizlik ve migration dosya sayısından daha önceliklidir. Süreler kabaca planlama tahminidir; garanti değildir.

| Gear | Tipik kullanım | İş akışı | Planlama tahmini |
|---|---|---|---|
| ⚡ **Fast** | Açık kontrolü olan, düşük riskli ve yalıtılmış değişiklik | Tek adlandırılmış implementer; diff'i doğrudan kontrol et. Satır içi rapor yeterlidir. | Birkaç dakikanın altında |
| 🚀 **Pro** *(varsayılan)* | Sınırlı kapsamlı özellik veya düzeltme | Kaynağa bağlı brief, implementer ve odaklı reviewer; etkiye göre QA. | Yaklaşık 5–10 dakika |
| 🏛️ **Max** | Yüksek riskli, sınırlar arası veya paralel çalışma | Kararları kaydet, bağımsız adlandırılmış lane'leri ayır, ardından review ve QA yap. | Yaklaşık 15–30 dakika |

Görevde daha yüksek risk veya yeni bağımlılıklar ortaya çıkarsa devam etmeden önce gear'ı yeniden sınıflandırın. Max için diyagram şart değildir; lane bağımlılıklarını açıkça yazın.

## Yedi Rol

| Rol | Varsayılan model takma adı | Sorumluluk |
|---|---|---|
| `planner` | `opus` | İsteği risk odaklı spec ve kaynağa bağlı brief'lere dönüştürür. |
| `implementer` | `sonnet` | TDD ve sınırlı fix denemeleriyle kapsam içindeki değişiklikleri yapar. |
| `reviewer` | `sonnet` | Değişiklikleri salt-okunur inceler ve kaynaklı bulgular yazar. |
| `debugger` | `sonnet` | Hataları yeniden üretir ve ortak kök nedeni düzeltir. |
| `ui-developer` | `sonnet` | Erişilebilir web veya mobil arayüzler geliştirir. |
| `explorer` | `haiku` | Düzenleme yapmadan ilgili yapı, kurallar ve riskleri çıkarır. |
| `qa-tester` | `haiku` | Çalışan sistemde gözlemlenebilir davranışı denetler. |

Bu değerler takma ad ve varsayılandır; sabit model kimlikleri veya kullanılabilirlik garantisi değildir. Oturum talimatları önceliklidir. Ayrıntılı sözleşmeler için [`agents/`](agents/) klasörüne bakın.

## Konfigürasyon ve Model Seçimi

`~/.taskard/config.toml` ve `.taskard/config.toml` içindeki konfigürasyon ajanların okuduğu veridir. Proje değerleri global varsayılanların üzerine yazabilir; oturum talimatları en önceliklidir. Taskard çalışma anında konfigürasyonu değiştirmez.

`templates/harness-profiles.json` her harness için kurulum kapsamını, destek düzeyini, model devralımını ve yerel izin alanlarını kaydeder. Harness'e özel rol ayarları, dışa aktarılan yerel profillerde `[roles]` değerlerinden önceliklidir. Claude Code model takma adlarını, OpenCode ise `provider/model` kimliklerini kabul eder:

```toml
[harness_preferences.models.claude_code]
reviewer = "haiku"

[harness_preferences.models.opencode]
reviewer = "provider/model"
debugger = "provider/model"
```

OpenCode rol modeli belirtilmezse seçili provider'ın modeli kullanılır. Oturum talimatları tüm konfigürasyon varsayılanlarından önceliklidir. Taskard otomatik veya ücretli harness yedeğine geçmez. `permission_mode` ve `risky_operations` ajan tercihidir ve desteklenen harness ayarlarıdır; harness'lar arasında çalışan bir güvenlik sistemi değildir.

CLI'ın belgelenmiş TOML alt kümesi tek satırlı tabloları ve atamaları; string, integer, boolean ve tek satırlı string dizilerini (geçerli sondaki virgül dahil) ve yorumları destekler. Bozuk veya güvensiz anahtarları, desteklenmeyen ayarları, yanlış türleri ve aralık dışı sayıları reddeder.

## Harness Desteği

| Harness | Durum | Mevcut kapsam |
|---|---|---|
| Claude Code | **tested** | Deterministik kurulum/profil kontrolleri rol dosyalarını ve reviewer/explorer izin listesini kapsar. Canlı ajan davranışı test edilmemiştir. |
| OpenCode | **tested** | Deterministik kontroller rol dışa aktarımını, `mode: subagent` ve reviewer/explorer izinlerini kapsar. Canlı ajan davranışı test edilmemiştir. |
| Codex | **partial** | Ortak skill ve proje talimatları kullanılabilir; yerel rol dışa aktarımı ve salt-okunur profil kapsam dışıdır. |
| Antigravity | **recipe** | Proje talimatları ve ortak kuralları elle kullanın. |
| Cursor | **recipe** | Proje talimatları ve ortak kuralları elle kullanın. |

“Tested” yalnızca deterministik kurulum veya profil fixture kontrolleri demektir; canlı ajan çalıştırması veya mevcut model listesinin doğrulanması anlamına gelmez. Ayrıntılar için [Cross-Harness Support](skills/taskard/references/cross-harness.md) sayfasına bakın.

## Deneme ve Kanıt

Önemli mantık değişikliklerinde fix öncesi odaklı bir kontrol kaydedin. Beklenen TDD **Red** sonucu başlangıç kanıtıdır, başarısız fix sayılmaz. `ATTEMPT_BUDGET` toplam fix denemesi sayısıdır: 1 veya 2; ilk başarısız fix denemesinden sonra en fazla bir retry yapılabilir.

Uygulama raporları on sıralı alan kullanır: durum, diff özeti, base/head commit, deneme sayısı, tam komut, çıkış durumu, kanıt yolu ve SHA-256, commit hash'i. Fast işi `report.md` oluşturmak yerine aynı bilgileri satır içinde verebilir. Review ve doğrulama raporları 15 satırla sınırlıdır.

Hash'ler raporu kaydedilmiş dosya baytlarına bağlar; komutun çalıştığını veya ajan iddiasının doğru olduğunu kanıtlamaz. Eksik veya eski metadata doğrulamanın başarısız olmasına yol açar; çalışma doğrulanmış kabul edilemez. Alanların tamamı için [Rol, Brief ve Kanıt Sözleşmeleri](skills/taskard/references/roles-and-evidence.md) sayfasına bakın.

## Orkestrasyon Katmanı

Paralel Max lane'leri tek bir worktree, kapsam ve dalga sözleşmesine uyar: yazma yapan lane brief'inde `WORKTREE`, `BRANCH` ve `SCOPE` alanlarını bildirir, aynı dalgadaki lane'lerin açık kapsamları kesişemez ve varsayılan eşzamanlı yazar tavanı üçtür (`[defaults].max_parallel`). Merge işlemleri seridir — aynı anda tek yazar — ve yalnızca kapıları geçen lane'lerden yapılır; ana dala lane'ler doğrudan yazmaz.

`taskard verify`, bugün deterministik olarak kontrol edebildiklerini denetler: alan biçimleri ve sıralaması, canlı lane'ler arasında paylaşılan worktree veya branch, aynı dalgadaki açık kapsam kesişimi ve lane bir rapora sahip olduğunda eksik bildirilmiş worktree. Henüz var olmayan kapsam açıkça listelenir ve reviewer konvansiyonu olarak kalır. Ayrıntılar: [Orchestration Layer](skills/taskard/references/orchestration.md).

## Benchmark Durumu

Karşılaştırılabilir canlı benchmark çalıştırmaları veya ham eski kayıtlar yayımlanmamıştır. Değerlendirme paketi sabit prompt'lar ve sağlanan run artifact'lerini inceleyen Node standart kütüphanesiyle yazılmış bir skorlayıcı içerir; ücretli model çalıştırmaz. Skorlayıcı self-check'i sentetik fixture kullanır, benchmark ölçümü değildir. [Evaluation Method](evals/README.md) sayfasına bakın.

Kaydedilen `durationMs` ve `costUsd` değerleri sonlu ve negatif olmayan sayılar olmalıdır. Token sayıları ve `manualInterventions` negatif olmayan güvenli tam sayı olmalıdır; mevcut olmayan değerler `null` olabilir.

## Katkı ve Doğrulama

```bash
npm test
bash -n install.sh
node --check bin/taskard.js
node bin/taskard.js init --dry-run
```

`npm test` yapısal doğrulamayı, kurucu regresyonlarını, temizlik/doğrulama güvenlik kontrollerini ve skorlayıcı fixture kontrollerini çalıştırır.

Kurulum testlerinde yalıtılmış bir home ve proje dizini kullanın. Test sırasında isteğe bağlı harici skill'leri kurmayın veya mevcut kullanıcının global konfigürasyonuna yazmayın.

## Lisans

Taskard, [MIT License](LICENSE) altında açık kaynaklıdır.
