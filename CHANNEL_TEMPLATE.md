# Добавление и сопровождение каналов (мини-апп, воркеры, бот)

Полная инструкция по цепочке «реестр → сайт → воркеры → мини-апп → бот» — в `ukraine-tv.uk/docs/CHANNELS.md`. Здесь — только часть этого репозитория.

## Чеклист
1. Канал добавлен в реестр `ukraine-tv.uk/data/channels.json` (поля `id`, `group`, `name`, `desc`, `icon`, `color`, `iconBg`, `tags`, `source.url`, при необходимости `needs_segment_proxy`) и тексты — в `ukraine-tv.uk/tools/texts.py`; сайт пересобран (`python3 tools/build.py` там) — это обновляет `data/app-channels.json` и логотипы.
2. В этом репозитории:
   ```bash
   REGISTRY=../ukraine-tv.uk/data/channels.json APP_CHANNELS=../ukraine-tv.uk/data/app-channels.json ./deploy-workers.sh
   npx wrangler deploy -c bot-worker/wrangler.toml
   git add -A && git commit && git push      # мини-апп (index.html) публикуется через GitHub Pages
   ```
   `deploy-workers.sh` перегенерирует `src/streams.generated.js`, `index.html` (блок `CHANNEL_GROUPS`) и `bot-channels.json`, прогонит тесты и задеплоит три копии воркера.
3. Обновить пост канала: отправить боту `/post` (пост обновится на месте).
4. Проверить: `curl -s 'https://ukraine-stream-a.dyaltd.workers.dev/stream?channel=<id>' -H 'Origin: https://ukraine-tv.uk'` → плейлист; открыть канал в мини-аппе.

## Каналы без CORS на сегментах
Если источник не разрешает CORS для сегментов, канал добавляется в список `needs_segment_proxy` (воркер проксирует сегменты только для него и только с разрешённых доменов). Сейчас это `pershyi`, `channel5`, `kyiv24`, `armytv`, `irt`. По возможности заменяйте такой источник на тот, где CORS открыт: прокси сегментов расходует лимиты Cloudflare.

## Удаление канала
Перенести запись в `removed` реестра, пересобрать сайт, выполнить шаги 2–3.
