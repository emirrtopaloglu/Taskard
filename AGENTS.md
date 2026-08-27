# Taskard — Agent Kuralları

## Duran kurallar

1. **README her zaman güncel kalsın:** kurulum ve kullanım adımları README.md'de yaşar; skill'i, config formatını veya akışı değiştiren her commit README'yi de güncellemek ZORUNDADIR.
2. **Çekirdek paket kod içermez:** Taskard saf konvansiyon paketidir (skills/, agents/, templates/); çalışma zamanı kodu barındırmaz.
3. Config dosyaları agent-okur veridir; hiçbir mekanizma çalışma anında config mutasyonu yapmaz.
4. Wayfinder haritası (`.scratch/taskard/map.md`) kararların tek kaynağıdır — mimari kararı haritaya işlemeden değişiklik yapma.
5. Yeni agent tanımı eklerken frontmatter'da `name` zorunludur; isimsiz rol tanımlanmaz.
6. **Test projeleri ürün kimliğine yazılmaz:** dogfooding yapılan projelerin adları README, SKILL.md, map veya örneklerde geçmez; gerekirse "test projesi" denir.
7. **Dış skill'ler vendor edilmez** — `docs/dependencies.md` manifest'i + install.sh'in npx kurulum adımı tek mekanizmadır; upstream güncellemesi otomatik akar. Vendoring OSS fazında ayrı karardır.
8. **Mod seçimi akışın ilk hamlesidir:** basit iş loop, karmaşık iş graph modu — graph gereksiz yere başlanmaz, loop çalışırken kapsam genlerse yükseltilir.

## Hızlı doğrulama

```bash
bash -n install.sh
./install.sh
ls -la ~/.claude/skills/taskard ~/.claude/agents
```
