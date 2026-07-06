#!/bin/bash
set -e
cd ~/ukraine-tv-hub

echo "📦 Git push..."
git add -A
git commit -m "update" 2>/dev/null || true
git push

echo "☁️  CF Worker deploy..."
mkdir -p "$HOME/ukraine-worker/src"
if [ ! -f "$HOME/ukraine-worker/wrangler.toml" ]; then
  cat > "$HOME/ukraine-worker/wrangler.toml" << 'TOML'
name = "ukraine-worker"
main = "src/index.js"
compatibility_date = "2024-01-01"
TOML
fi
cp ~/ukraine-tv-hub/ukraine-worker.js "$HOME/ukraine-worker/src/index.js"
cd ~/ukraine-worker && npx wrangler deploy

cd ~/ukraine-tv-hub

echo "🤖 Bot restart..."
# Знайти і вбити всі node-процеси bot.js
BOT_PIDS=$(ps aux | grep "node.*bot.js" | grep -v grep | awk '{print $2}')
if [ -n "$BOT_PIDS" ]; then
  echo "Зупиняємо PID: $BOT_PIDS"
  echo "$BOT_PIDS" | xargs kill 2>/dev/null || true
  sleep 2
fi

nohup node bot.js > bot.log 2>&1 &
echo "✅ Done! Bot PID: $!"

read -p "Press Enter to close..."
