# Taskard — Proje Kurulum Kılavuzu

Bir projede Taskard'ı ilk kez etkinleştirmek için gereken adımlar:

## 1. Dizin Ağacı
Proje kökünde `.taskard/` yapısını oluşturun:

```bash
mkdir -p .taskard/{context/specs,context/decisions,lanes,tasks,handoff,memory,tmp}
```

## 2. Direktif Bloğu
Projenin `CLAUDE.md` ve/veya `AGENTS.md` dosyasına Taskard direktif bloğunu ekleyin.
Tek kaynak: `~/.taskard/templates/directive-block.md`

Marker'larla birlikte aynen eklenmelidir:
`<!-- taskard:start -->` ... `<!-- taskard:end -->`

## 3. Gitignore
Çalışma zamanı verilerinin repoya commitlenmemesi için `.gitignore` dosyasına ekleyin:

```gitignore
.taskard/lanes/
.taskard/tmp/
```
