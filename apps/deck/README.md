# Taskard Deck

Taskard koşuları için salt-okur canlı izleyici. `.taskard/` dizinini okur, protokole dokunmaz — hiçbir dosyaya yazmaz.

## Çalıştır

```bash
npm install
npm run build
node server/server.mjs ~/www/studypal        # gerçek proje
node server/server.mjs --demo                # örnek koşu verisi
```

Tek process: `dist/` statik + `/api/state` (anlık görüntü) + `/api/stream` (SSE canlı akış) + `/api/tree` (dosya ağacı) + `/api/file?path=` (dosya içeriği). Port: `--port` veya `PORT`, varsayılan 7420.

Geliştirme modu: `npm run dev` (Vite :5173, API'yi :7420'a proxy'ler).

## API

- `GET /api/state` → `{lanes, tasks, handoffs, feed, tree, ...}` tam anlık görüntü
- `GET /api/tree` → `{tree: [{path, size, mtime}, ...]}` `.taskard/` altındaki tüm dosyalar (göreli yol, bayt, mtime ms)
- `GET /api/file?path=<göreli>` → `{path, content, size, mtime}` metin dosyası; 403 traversal, 415 binary/uzantı dışı, 404 yok

## Okuduğu şeyler

- `tasks/T-NNN-*.md` frontmatter: status / blocked_by / assignee
- `lanes/<id>/brief.md`, `report.md` (ilk satır: DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT)
- `handoff/`, `memory/personal.md` varlığı
- Rol→model: `~/.taskard/config.toml` + proje `.taskard/config.toml` (salt-okunur)

## Yol haritası notu

Nihai hedef Tauri masaüstü. Bu arayüz (React + TS) Tauri webview'ine taşınacak şekilde yazıldı; Node sunucu yerini Rust IPC'ye bırakabilir. Sonraki adaylar: event-log konvansiyonu (gerçek telegraf), DAG görselleştirme, kontrol modu (onay kapıları).
