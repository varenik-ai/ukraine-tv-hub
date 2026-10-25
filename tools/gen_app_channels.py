#!/usr/bin/env python3
"""Подставляет список каналов мини-аппа в index.html (между маркерами CHANNELS:BEGIN/END).
Источник: ukraine-tv.uk/data/app-channels.json (генерируется build.py сайта).
Запуск: python3 tools/gen_app_channels.py [путь-или-URL]"""
import json, re, sys, urllib.request
SRC = sys.argv[1] if len(sys.argv) > 1 else 'https://raw.githubusercontent.com/varenik-ai/ukraine-tv.uk/main/data/app-channels.json'
raw = urllib.request.urlopen(SRC, timeout=20).read() if SRC.startswith('http') else open(SRC, 'rb').read()
d = json.loads(raw)
def js(v): return json.dumps(v, ensure_ascii=False)
out = ['const CHANNEL_GROUPS = [']
for g in d['groups']:
    labels = {l: g['emoji'] + ' ' + t for l, t in g['labels'].items()}
    out.append('  {\n    label: %s,\n    labels: %s,\n    channels: [' % (js(labels['uk']), js(labels)))
    for c in g['channels']:
        out.append('      { id:%s, name:%s, nameEn:%s, nameRu:%s, icon:%s, color:%s, iconBg:%s, slug:%s%s },' % (tuple(js(c[k]) for k in ('id', 'name', 'nameEn', 'nameRu', 'icon', 'color', 'iconBg', 'slug')) + ((', logo:' + js(c['logo'])) if c.get('logo') else '',)))
    out.append('    ]\n  },')
out.append('];')
s = open('index.html', encoding='utf-8').read()
a, b = '// <CHANNELS:BEGIN>', '// <CHANNELS:END>'
i, j = s.index(a), s.index(b)
head = s[i:s.index('\n', i) + 1]
s = s[:i] + head + '\n'.join(out) + '\n' + s[j:]
open('index.html', 'w', encoding='utf-8').write(s)
n = sum(len(g['channels']) for g in d['groups'])
# данные для бота (bot.js строит приветствие и пост из них)
bot = {'n': n, 'groups': [{'cat': g['cat'], 'emoji': g['emoji'], 'channels': [{'uk': c['name'], 'en': c['nameEn'], 'ru': c['nameRu']} for c in g['channels']]} for g in d['groups']]}
json.dump(bot, open('bot-channels.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('channels in app:', n)
