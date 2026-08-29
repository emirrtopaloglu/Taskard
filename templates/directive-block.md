<!-- taskard:start -->
<!-- taskard:v2 -->
## Taskard
- Rol/model seçimi: Express modda reviewer/debugger=sonnet, Full modda opus; oturum override'ı her ikisini geçer (~/.taskard/config.toml).
- Subagent'lar yalnızca adlandırılmış rollerle açılır (implementer, reviewer, ui-developer, qa-tester...) — isimsiz agent yasak.
- Implementer yerleşik TDD (Red-Green-Refactor) ve kanıt disipliniyle çalışır; harici TDD skill bağımlılığı taşımaz.
- Self-priming brief'lerde point-to-range esastır: brief'e asla kod yapıştırılmaz, yalnızca hedef dosya ve satır aralığı (file#L10-L40) verilir; delege yalnızca bu aralığı okur.
- Mod seçimi akışın ilk hamlesidir: tek dosya/küçük fix'te agresif Nano (<2 dk, sıfır dosya); 2-4 dosyada Express (tek brief + sonnet mini-review); karmaşık/paralelde Full.
- Worker varsayılan bypassPermissions ile çalışır; insan onayı üç kapıda: plan onayı, merge öncesi doğrulama, risky_operations listesi.
- Config dosyaları çalışma anında asla değiştirilmez; 2-Strike kuralında 2. hatada akış durup kullanıcıya 3 seçenek sunulur.
- Çıktı Humanish'tir: durum kodu değil cümle, jargon değil anlam.
<!-- taskard:end -->
