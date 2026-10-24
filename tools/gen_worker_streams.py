#!/usr/bin/env python3
"""Генерирует src/streams.generated.js из реестра каналов (ukraine-tv.uk/data/channels.json).
Запуск: python3 tools/gen_worker_streams.py [путь-или-URL реестра]"""
import json, sys, urllib.request
SRC = sys.argv[1] if len(sys.argv) > 1 else 'https://raw.githubusercontent.com/varenik-ai/ukraine-tv.uk/main/data/channels.json'
raw = urllib.request.urlopen(SRC, timeout=20).read() if SRC.startswith('http') else open(SRC, 'rb').read()
reg = json.loads(raw)
streams, seg_hosts, seg_ch = {}, set(), []
for c in reg['channels']:
    s = c['source']
    if not s.get('url') or s['status'] in ('no_source', 'http_only'):
        continue
    streams[c['id']] = s['url']
    if s.get('needs_segment_proxy'):
        seg_ch.append(c['id'])
        seg_hosts.add('.'.join(s['url'].split('/')[2].split('.')[-2:]))
out = '// Автогенерация: tools/gen_worker_streams.py — не править вручную (источник: data/channels.json)\n'
out += 'export const STREAMS = %s;\n' % json.dumps(streams, indent=2)
out += '// Каналы, у которых источник не отдаёт CORS на сегментах — сегменты идут через /seg\n'
out += 'export const SEG_PROXY_CHANNELS = %s;\n' % json.dumps(sorted(seg_ch))
out += 'export const SEG_PROXY_DOMAINS = %s;\n' % json.dumps(sorted(seg_hosts))
open('src/streams.generated.js', 'w').write(out)
print('channels:', len(streams), 'seg-proxy:', seg_ch, sorted(seg_hosts))
