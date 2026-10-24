# Ukraine TV Hub — Telegram-мини-апп и воркеры

Репозиторий отвечает за три вещи: **мини-апп** (`index.html`), **воркеры Cloudflare** (`src/`) и **бота** (`bot.js`).
Сайт и реестр каналов живут в `varenik-ai/ukraine-tv.uk` (`data/channels.json`).

```
источники потоков ──► 3 воркера (ukraine-stream-a/b/c) ──► сайт ukraine-tv.uk и мини-апп
```

## Единый список каналов
Источник правды — `ukraine-tv.uk/data/channels.json`. Из него генерируется:
- воркер: `python3 tools/gen_worker_streams.py` → `src/streams.generated.js`
- мини-апп и бот: `python3 tools/gen_app_channels.py` → блок `CHANNEL_GROUPS` в `index.html` и `bot-channels.json`

Идентификатор канала (`id`) один и тот же в реестре, воркере, сайте и мини-аппе.

## Воркер (`src/index.js`)
Режим «только плейлисты»: `/stream`, `/stream-q` (фиксированное качество на iOS), `/playlist`, `/seg` (сегменты только для каналов без CORS), `/version`.
`/proxy` отвечает 410, `/debug` нет. Подробности и причины — в комментариях файла.

```bash
node --no-warnings tools/test_worker.mjs     # тесты на реальных источниках
node --no-warnings tools/dev_server.mjs ../ukraine-tv.uk   # сайт :8765 + воркер :8788
# мини-апп локально: http://localhost:8765/?proxy=http://localhost:8788  (index.html — отдельно: dev_server . )
./deploy-workers.sh                          # генерация + тесты + деплой трёх копий (нужен wrangler login)
```

## Мини-апп (`index.html`)
Собран по эталону russia-tv-hub (`ETALON.md`): fullscreen, фоновое аудио, ротация прокси (список берётся из `https://ukraine-tv.uk/proxy.json`), watchdog, выбор качества, 8 языков.
Хостинг — GitHub Pages: `https://varenik-ai.github.io/ukraine-tv-hub/`. После изменений поднимайте `?v=` в `WEB_URL` бота.

## Бот (`bot.js`)
Секреты в `.env` (см. `.env.example`): `BOT_TOKEN`, `ADMIN_IDS`. `/post` доступна только админам.

## Проверка каналов
`python3 tools/test_streams.py ../ukraine-tv.uk/data/channels.json` — master → variant → segment, CORS, «живость».
