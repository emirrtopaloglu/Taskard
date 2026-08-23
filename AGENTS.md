# Taskard — Agent Kuralları

## Duran kurallar

1. **README her zaman güncel kalsın:** kurulum ve kullanım adımları README.md'de yaşar; kurulumu, CLI'ı, config formatını veya akışı değiştiren her commit README'yi de güncellemek ZORUNDADIR. Eski bırakılan README bir defektir.
2. Sıfır npm bağımlılığı korunur — Node gömülü modülleri yeterli.
3. Kodda yorum yoksa da öyle kalsın; isimlendirme konuşsun.
4. Wayfinder haritası (`.scratch/taskard/map.md`) kararların tek kaynağıdır — mimari kararı haritaya işlemeden kod yazma.
5. Model/harness sabitlerini kodda gömme; config.toml'dan oku.

## Hızlı doğrulama

```bash
for f in src/**/*.js src/*.js bin/*.js; do node --check "$f"; done
node bin/taskard.js status
```
