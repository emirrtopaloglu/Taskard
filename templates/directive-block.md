<!-- taskard:start -->
## Taskard
- Rol/model seçimi için `~/.taskard/config.toml` (global) ve `.taskard/config.toml` (proje) okunur; kullanıcının doğal dil override'ı her ikisini geçer.
- Subagent'lar yalnızca adlandırılmış rollerle açılır (implementer, reviewer, frontend-developer...) — isimsiz/general-purpose agent yasak.
- Worker varsayılan bypassPermissions ile çalışır; insan onayı üç kapıda: plan onayı, merge öncesi doğrulama, `risky_operations` listesi.
- Config dosyaları çalışma anında asla değiştirilmez.
<!-- taskard:end -->
