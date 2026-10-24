#!/usr/bin/env bash
# Деплой трёх независимых копий воркера. Требуется: npx wrangler login (один раз).
# Каналы берутся из реестра ukraine-tv.uk/data/channels.json (main на GitHub).
set -euo pipefail
cd "$(dirname "$0")"
python3 tools/gen_worker_streams.py ${REGISTRY:+"$REGISTRY"}
node --no-warnings tools/test_worker.mjs
for n in ukraine-stream-a ukraine-stream-b ukraine-stream-c; do
  echo "== deploy $n"
  npx -y wrangler deploy --name "$n"
done
for n in a b c; do
  echo "$n: $(curl -s -m 15 https://ukraine-stream-$n.dyaltd.workers.dev/version)"
done
