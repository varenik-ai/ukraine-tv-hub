# Ukraine TV Hub — воркеры потоков, Telegram-мини-апп, бот

Репозиторий отвечает за три вещи: **воркеры Cloudflare** с видеопотоками (`src/`), **Telegram-мини-апп** (`index.html`) и **бота** (`bot-worker/`). Сайт и реестр каналов живут в [`varenik-ai/ukraine-tv.uk`](https://github.com/varenik-ai/ukraine-tv.uk) (`data/channels.json`). Эталон: `varenik-ai/russia-tv-hub`.

```
источники HLS ──► ukraine-stream-a/b/c (воркеры) ──► сайт ukraine-tv.uk и мини-апп
Telegram ──webhook──► ukraine-tv-bot (воркер) ──► /start, /post
```

Всё работает автономно в Cloudflare и GitHub Pages — включённый компьютер владельца не нужен.

## Единый реестр каналов
Источник правды — `ukraine-tv.uk/data/channels.json`. Из него генерируется:
- воркер: `python3 tools/gen_worker_streams.py` → `src/streams.generated.js`
- мини-апп и бот: `python3 tools/gen_app_channels.py` → блок `CHANNEL_GROUPS` в `index.html` и `bot-channels.json`

`id` канала одинаков в реестре, воркере, сайте, мини-аппе и боте. Как добавить или убрать канал — `CHANNEL_TEMPLATE.md` и `ukraine-tv.uk/docs/CHANNELS.md`.

## Воркеры потоков (`src/index.js`)
Режим «только плейлисты» (CORS-only): плейлист переписывается, сегменты отдаёт источник напрямую. Маршруты: `/stream?channel=<id>`, `/stream-q?channel=<id>&q=<kbps>` (фиксированное качество на iOS), `/playlist`, `/seg` (только для 5 каналов без CORS: `pershyi`, `channel5`, `kyiv24`, `armytv`, `irt`), `/version`. `/proxy` → 410, `/debug` → 404. Разрешённые Origin: сайт, мини-апп, `localhost`-разработка через `ALLOWED_ORIGINS`, приёмник Chromecast (`gstatic.com`).

Три независимые копии: `ukraine-stream-a/b/c.dyaltd.workers.dev`; домен `s.ukraine-tv.uk` → копия `a`. Актуальный список клиенты читают из `https://ukraine-tv.uk/proxy.json`.

```bash
node --no-warnings tools/test_worker.mjs                      # тесты (в том числе на реальных источниках)
node --no-warnings tools/dev_server.mjs ../ukraine-tv.uk       # сайт :8765 + воркер :8788
REGISTRY=../ukraine-tv.uk/data/channels.json APP_CHANNELS=../ukraine-tv.uk/data/app-channels.json ./deploy-workers.sh   # генерация + тесты + деплой трёх копий (нужен wrangler login)
```

## Мини-апп (`index.html`)
Собран по `ETALON.md`: fullscreen, фоновое аудио, safe area, ротация прокси (`proxy.json`), watchdog, выбор качества, AirPlay/PiP, кнопка «Дивитись на сайті», 8 языков. Язык интерфейса берётся из языка Telegram пользователя (`language_code`), затем из браузера, по умолчанию uk. Cast (Chromecast) в мини-аппе нет — он есть на сайте.
Хостинг — GitHub Pages: `https://varenik-ai.github.io/ukraine-tv-hub/`; в Telegram открывается через `https://t.me/UkraineTVHub_bot/ukrainetv`. После изменений поднимайте `?v=` в `WEB_URL` (`bot-worker/core.js`) и в настройках мини-аппа.

## Бот (`bot-worker/`)
Cloudflare Worker `ukraine-tv-bot` (webhook, `https://ukraine-tv-bot.dyaltd.workers.dev`):
- `/start` — приветствие на языке Telegram пользователя (8 языков) со списком каналов и кнопками «Открыть Ukraine TV Live» / «Открыть в браузере»;
- `/post` — только для `ADMIN_IDS` и только в личном чате: обновляет закреплённый пост канала `@UkraineTVHub` на месте или публикует и закрепляет новый;
- `/fixpost` (админ) — добавляет кнопки под закреплённым постом, не меняя текст;
- `GET /invoice?amount=N` — счёт Telegram Stars для кнопки «Подякувати» (см. `DONATE.md`); обрабатываются `pre_checkout_query` и `successful_payment`;
- `/webhook` проверяет заголовок `X-Telegram-Bot-Api-Secret-Token`; `/health` — проверка живости.

Секреты воркера: `BOT_TOKEN`, `WEBHOOK_SECRET`, `ADMIN_IDS`. Настройка один раз: заполнить `.env` (`BOT_TOKEN`, `ADMIN_IDS`; см. `.env.example`) и запустить `./setup-bot.sh` (тесты, деплой, секреты, webhook, команды, кнопка меню). Токен не печатается. Тесты: `node tools/test_bot.mjs`. После смены списка каналов: `python3 tools/gen_app_channels.py …` и `npx wrangler deploy -c bot-worker/wrangler.toml`.
Старый `bot.js` (long polling, нужен включённый компьютер) оставлен как запасной вариант; не запускайте его одновременно с webhook (Telegram отдаёт апдейты одному потребителю).

## Проверка каналов
`python3 tools/test_streams.py ../ukraine-tv.uk/data/channels.json` — master → variant → segment, CORS, «живость». Проверки сегментов входят в `test_worker.mjs`.

## Файлы
| Путь | Назначение |
|---|---|
| `src/index.js`, `src/streams.generated.js` | воркер потоков и его данные |
| `wrangler.toml`, `deploy-workers.sh` | конфигурация и деплой воркеров потоков |
| `bot-worker/` (`index.js`, `core.js`, `wrangler.toml`) | бот (webhook) |
| `setup-bot.sh`, `.env.example` | первичная настройка бота |
| `index.html`, `bot-channels.json` | мини-апп и данные для бота (генерируются) |
| `tools/` | генераторы, тесты, локальный сервер |
| `DONATE.md` | кнопка «Подякувати» (Stars): как устроена, как включить и проверить |
| `ETALON.md`, `CHANNEL_TEMPLATE.md`, `CLAUDE.md` | правила мини-аппа, добавление канала, памятка ассистента |
