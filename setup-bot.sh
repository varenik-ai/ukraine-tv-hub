#!/usr/bin/env bash
# Одноразове налаштування автономного бота (Cloudflare Worker + webhook). Токен береться з .env і нікуди не друкується.
#   .env:  BOT_TOKEN=...   ADMIN_IDS=2120086742   (WEBHOOK_SECRET створюється автоматично)
# Запуск: ./setup-bot.sh   Після цього комп'ютер можна вимикати: бот відповідає з Cloudflare.
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo ".env не знайдено (див. .env.example)"; exit 1; }
set -a; . ./.env; set +a
: "${BOT_TOKEN:?BOT_TOKEN не заданий у .env}"; : "${ADMIN_IDS:?ADMIN_IDS не заданий у .env}"
if [ -z "${WEBHOOK_SECRET:-}" ]; then
  WEBHOOK_SECRET=$(node -e "process.stdout.write(require('crypto').randomBytes(24).toString('hex'))")
  printf '\nWEBHOOK_SECRET=%s\n' "$WEBHOOK_SECRET" >> .env
fi
node tools/test_bot.mjs
echo "== деплой воркера"
npx wrangler deploy -c bot-worker/wrangler.toml
echo "== секрети"
printf %s "$BOT_TOKEN"      | npx wrangler secret put BOT_TOKEN      -c bot-worker/wrangler.toml
printf %s "$WEBHOOK_SECRET" | npx wrangler secret put WEBHOOK_SECRET -c bot-worker/wrangler.toml
printf %s "$ADMIN_IDS"      | npx wrangler secret put ADMIN_IDS      -c bot-worker/wrangler.toml
URL="https://ukraine-tv-bot.dyaltd.workers.dev"
api() { curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/$1" -H 'content-type: application/json' -d "$2"; echo; }
echo "== webhook"
api setWebhook "{\"url\":\"$URL/webhook\",\"secret_token\":\"$WEBHOOK_SECRET\",\"allowed_updates\":[\"message\",\"pre_checkout_query\"],\"drop_pending_updates\":true}"
echo "== команди і кнопка меню"
api setMyCommands '{"commands":[{"command":"start","description":"Відкрити Україна ТВ"}]}'
api setChatMenuButton '{"menu_button":{"type":"web_app","text":"📺 Україна ТВ","web_app":{"url":"https://varenik-ai.github.io/ukraine-tv-hub/?v=2"}}}'
echo "== перевірка"
api getWebhookInfo '{}' | sed 's/"url":"[^"]*"/"url":"…"/'
curl -s "$URL/health"; echo
echo "Готово. Зупиніть старий бот на комп'ютері: pkill -f 'node bot.js'. Потім надішліть боту /start і /post."
