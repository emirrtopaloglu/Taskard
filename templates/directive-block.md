<!-- taskard:start -->
<!-- taskard:v2 -->
## Taskard
- Rol/model seçimi için `~/.taskard/config.toml` (global) ve `.taskard/config.toml` (proje) okunur; kullanıcının doğal dil override'ı her ikisini geçer.
- Subagent'lar yalnızca adlandırılmış rollerle açılır (implementer, reviewer, ui-developer, qa-tester...) — isimsiz/general-purpose agent yasak. Her rolün skill sözleşmesi var: ilgili skill kuruluysa kullanmak zorunlu.
- Worker varsayılan bypassPermissions ile çalışır; insan onayı üç kapıda: plan onayı, merge öncesi doğrulama, `risky_operations` listesi.
- Config dosyaları çalışma anında asla değiştirilmez.
- Routing önceliği (taskard akışı aktifken): MOD SEÇİMİ taskard skill'inin, disiplin ADAY GÖSTERME using-superpowers'ın, YÜKLEME kararı tetik koşulun.
- Basit iş loop, karmaşık iş graph modunda koşar — mod seçimi akışın ilk hamlesidir.
- Kullanıcıya çıktı Humanish'tir: durum kodu değil cümle, jargon değil anlam.
<!-- taskard:end -->
