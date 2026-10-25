# Памятка для ассистента (ukraine-tv-hub)

Назначение: воркеры потоков, мини-апп, бот. Реестр каналов — в репозитории `ukraine-tv.uk` (`data/channels.json`); **не правьте `index.html` (блок `CHANNEL_GROUPS`), `src/streams.generated.js`, `bot-channels.json` вручную** — их создают `tools/gen_*.py`.

## Команды
```bash
node --no-warnings tools/test_worker.mjs     # тесты воркера
node tools/test_bot.mjs                      # тесты бота (без сети и токена)
./deploy-workers.sh                          # деплой воркеров потоков (REGISTRY, APP_CHANNELS — пути к реестру сайта)
npx wrangler deploy -c bot-worker/wrangler.toml
./setup-bot.sh                               # первичная настройка бота (читает .env; секреты не печатает)
```

## Правила
- Токены (`BOT_TOKEN`, Cloudflare) не просить в чате и не печатать; они в `.env` / `.cf.env` владельца (в `.gitignore`). Скрипты читают их из файла.
- Мини-апп следует `ETALON.md` (fullscreen, звук, safe area, backoff, `MAX_FAIL_STREAK`). Язык интерфейса берётся из языка Telegram — это поведение, а не ошибка.
- Воркер работает в режиме «только плейлисты»: `/proxy` → 410. `/seg` только для каналов без CORS. Изменения в `src/index.js` сопровождать тестами в `tools/test_worker.mjs`.
- Не запускать `bot.js` вместе с webhook-ботом.
- Пуши в `main`, деплой и удаление воркеров — только после явного подтверждения владельца. Старые воркеры (`birch-stream`, `ukraine-worker` …) не удалять, пока на них есть трафик.
