# Taskard — Agent Kuralları

## Duran kurallar

1. **README her zaman güncel kalsın:** kurulum ve kullanım adımları README.md'de yaşar; skill'i, config formatını veya akışı değiştiren her commit README'yi de güncellemek ZORUNDADIR.
2. **Bu repoda çalışma zamanı kodu YASAKTIR** (Node/Python/bash runtime, parser, dispatcher...). Taskard konvansiyon + doktrin paketidir: SKILL.md, agent tanımları, şablonlar, install.sh (dosya yerleştirme).
3. Config dosyaları agent-okur veridir; hiçbir mekanizma çalışma anında config mutasyonu yapmaz.
4. Wayfinder haritası (`.scratch/taskard/map.md`) kararların tek kaynağıdır — mimari kararı haritaya işlemeden değişiklik yapma.
5. Yeni agent tanımı eklerken frontmatter'da `name` zorunludur; isimsiz rol tanımlanmaz.

## Hızlı doğrulama

```bash
bash -n install.sh
./install.sh
ls -la ~/.claude/skills/taskard ~/.claude/agents
```
