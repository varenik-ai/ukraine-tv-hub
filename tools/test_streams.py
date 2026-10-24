#!/usr/bin/env python3
"""Проверка потоков из ukraine-worker.js: master -> variant -> segment.
Критерии (CHANNEL_TEMPLATE): https, CORS на плейлисте и сегменте, живой MEDIA-SEQUENCE,
сегмент качается быстрее своей длительности.
Запуск: python3 tools/test_streams.py [ukraine-worker.js | data/channels.json] [--json out.json]"""
import re, sys, json, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
ORIGIN = 'https://ukraine-tv.uk'

def fetch(url, timeout=15, rng=None):
    h = {'User-Agent': UA, 'Origin': ORIGIN, 'Referer': ORIGIN + '/'}
    if rng: h['Range'] = rng
    req = urllib.request.Request(url, headers=h)
    t = time.time()
    with urllib.request.urlopen(req, timeout=timeout) as r:
        body = r.read()
        return r.status, dict((k.lower(), v) for k, v in r.headers.items()), body, time.time() - t, r.geturl()

def load_streams(path):
    if path.endswith('.json'):  # реестр data/channels.json
        return {c['id']: c['source']['url'] for c in json.load(open(path, encoding='utf-8'))['channels'] if c['source'].get('url')}
    src = open(path, encoding='utf-8', errors='replace').read()
    blk = re.search(r'const STREAMS\s*=\s*\{(.*?)\n\};', src, re.S).group(1)
    return dict(re.findall(r"^\s*([a-z0-9_]+)\s*:\s*'(https?://[^']+)'", blk, re.M))

def parse_pl(text, base):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    variants = []
    for i, l in enumerate(lines):
        if l.startswith('#EXT-X-STREAM-INF') and i + 1 < len(lines):
            bw = re.search(r'BANDWIDTH=(\d+)', l)
            variants.append((int(bw.group(1)) if bw else 0, urllib.parse.urljoin(base, lines[i + 1])))
    segs, dur, cur = [], 0.0, None
    for l in lines:
        if l.startswith('#EXTINF:'):
            cur = float(l[8:].split(',')[0] or 0)
        elif not l.startswith('#') and cur is not None:
            segs.append((urllib.parse.urljoin(base, l), cur)); cur = None
    seq = re.search(r'#EXT-X-MEDIA-SEQUENCE:(\d+)', text)
    return variants, segs, int(seq.group(1)) if seq else None

def check(cid, url):
    r = {'id': cid, 'url': url, 'https': url.startswith('https://'), 'status': 'FAIL', 'notes': []}
    try:
        st, hd, body, dt, final = fetch(url)
        text = body.decode('utf-8', 'replace')
        if '#EXTM3U' not in text:
            r['notes'].append('not m3u8: %s' % text[:60].replace('\n', ' ')); return r
        r['cors_pl'] = hd.get('access-control-allow-origin')
        variants, segs, seq = parse_pl(text, final)
        r['variants'] = len(variants)
        if variants:
            bw, vurl = sorted(variants)[len(variants) // 2 if len(variants) > 2 else 0]
            st, hd, body, dt, final = fetch(vurl)
            text = body.decode('utf-8', 'replace')
            variants, segs, seq = parse_pl(text, final)
        if not segs:
            r['notes'].append('no segments'); return r
        # live: sequence advances
        time.sleep(7)
        st, hd2, body2, _, _ = fetch(final)
        _, segs2, seq2 = parse_pl(body2.decode('utf-8', 'replace'), final)
        r['live'] = (seq2 is not None and seq is not None and seq2 > seq) or (segs2[-1][0] != segs[-1][0])
        s_url, s_dur = segs2[-1] if segs2 else segs[-1]
        st, shd, sbody, sdt, _ = fetch(s_url, timeout=25)
        r['cors_seg'] = shd.get('access-control-allow-origin')
        r['seg_dur'] = round(s_dur, 1); r['seg_time'] = round(sdt, 2); r['seg_kb'] = len(sbody) // 1024
        r['seg_ok'] = len(sbody) > 5000 and sdt < max(s_dur, 2)
        r['status'] = 'OK' if (r['live'] and r['seg_ok']) else 'WARN'
        if not r['live']: r['notes'].append('playlist not advancing')
        if not r['seg_ok']: r['notes'].append('segment slow/small')
    except Exception as e:
        r['notes'].append('%s: %s' % (type(e).__name__, str(e)[:80]))
    return r

if __name__ == '__main__':
    out_arg = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
    path = next((a for a in sys.argv[1:] if a.endswith(('.js', '.json')) and a != out_arg), 'ukraine-worker.js')
    out = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
    streams = load_streams(path)
    with ThreadPoolExecutor(12) as ex:
        res = list(ex.map(lambda kv: check(*kv), streams.items()))
    for r in res:
        flags = ('https' if r['https'] else 'HTTP!') + ' pl-cors=%s seg-cors=%s' % (r.get('cors_pl'), r.get('cors_seg'))
        print('%-5s %-12s %s %s seg=%ss/%ss %s' % (r['status'], r['id'], flags, 'live' if r.get('live') else '-', r.get('seg_time'), r.get('seg_dur'), '; '.join(r['notes'])))
    print('\nOK %d / WARN %d / FAIL %d' % tuple(sum(1 for r in res if r['status'] == s) for s in ('OK', 'WARN', 'FAIL')))
    if out: json.dump(res, open(out, 'w'), ensure_ascii=False, indent=1)
