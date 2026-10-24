// Локальный тест воркера: node tools/test_worker.mjs  (ходит в реальные источники)
import worker from '../src/index.js';
const SELF = 'https://w.test';
const get = (path, headers = {}) => worker.fetch(new Request(SELF + path, { headers }));
let fail = 0;
const t = async (name, fn) => { try { const r = await fn(); console.log(r === true ? 'PASS' : 'FAIL', name, r === true ? '' : r); if (r !== true) fail++; } catch (e) { console.log('FAIL', name, e.message); fail++; } };

await t('/version', async () => { const j = await (await get('/version')).json(); return j.version === '3.1.0' && j.mode === 'playlist-only' || JSON.stringify(j); });
await t('/proxy -> 410', async () => (await get('/proxy?url=https://example.com/')).status === 410 || 'not 410');
await t('/debug -> 404', async () => (await get('/debug?url=https://example.com/')).status === 404 || 'not 404');
await t('unknown channel -> 404', async () => (await get('/stream?channel=nope')).status === 404 || 'not 404');
await t('foreign origin -> 403', async () => (await get('/stream?channel=rada', { Origin: 'https://evil.example' })).status === 403 || 'not 403');
await t('/playlist foreign host -> 403', async () => (await get('/playlist?c=rada&url=' + encodeURIComponent('https://example.com/a.m3u8'))).status === 403 || 'not 403');
await t('/playlist segment url -> 403', async () => (await get('/playlist?c=rada&url=' + encodeURIComponent('https://cdn15.live-tv.cloud/x/seg.ts'))).status === 403 || 'not 403');
await t('/seg for non-seg channel -> 403', async () => (await get('/seg?c=rada&u=' + encodeURIComponent('https://cdn4.ipnet.ua/x.ts'))).status === 403 || 'not 403');
await t('/seg foreign host -> 403', async () => (await get('/seg?c=pershyi&u=' + encodeURIComponent('https://example.com/x.ts'))).status === 403 || 'not 403');

await t('/stream-q bad q -> 400', async () => (await get('/stream-q?channel=rada&q=0')).status === 400 || 'not 400');
await t('/stream-q keeps one variant', async () => {
  const full = await (await get('/stream?channel=rada')).text();
  const levels = [...full.matchAll(/BANDWIDTH=(\d+)/g)].map((m) => +m[1]);
  if (levels.length < 2) return 'source has <2 levels: ' + levels;
  const q = Math.round(Math.min(...levels) / 1000);
  const one = await (await get('/stream-q?channel=rada&q=' + q)).text();
  const n = (one.match(/#EXT-X-STREAM-INF/g) || []).length;
  return (n === 1 && one.includes('BANDWIDTH=' + Math.min(...levels))) || 'variants=' + n;
});

async function walk(ch, expectSeg) {
  const o = { Origin: 'https://ukraine-tv.uk' };
  let r = await get('/stream?channel=' + ch, o);
  if (r.status !== 200) return 'stream ' + r.status;
  let body = await r.text(), hops = 0;
  while (body.includes('#EXT-X-STREAM-INF') && hops++ < 3) {
    const next = body.split('\n').find((l) => l.startsWith(SELF + '/playlist'));
    if (!next) return 'no variant link: ' + body.slice(0, 120);
    r = await get(next.slice(SELF.length), o);
    if (r.status !== 200) return 'playlist ' + r.status;
    body = await r.text();
  }
  const seg = body.split('\n').find((l) => l && !l.startsWith('#'));
  if (!seg) return 'no segment';
  const viaWorker = seg.startsWith(SELF + '/seg');
  if (viaWorker !== expectSeg) return `segment routing wrong: viaWorker=${viaWorker}`;
  const sr = viaWorker ? await get(seg.slice(SELF.length), o) : await fetch(seg);
  const buf = new Uint8Array(await sr.arrayBuffer());
  return (sr.status === 200 && buf.length > 5000) || `segment ${sr.status} ${buf.length}b`;
}
await t('rada: direct segments', () => walk('rada', false));
await t('espreso: direct segments', () => walk('espreso', false));
await t('pershyi: segments via /seg', () => walk('pershyi', true));
await t('armytv: segments via /seg', () => walk('armytv', true));
process.exit(fail ? 1 : 0);
