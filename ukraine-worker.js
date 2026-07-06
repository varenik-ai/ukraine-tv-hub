// ukraine-worker.js — CF Worker для Ukraine TV Hub
// Деплой: cd ~/ukraine-worker && cp ~/ukraine-tv-hub/ukraine-worker.js src/index.js && npx wrangler deploy

const VERSION = '1.0.0';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

// Потоки украинских каналов
// ВАЖНО: после деплоя проверить каждый URL через:
// https://ukraine-worker.dyaltd.workers.dev/debug?url=ENCODED_URL
const STREAMS = {
  // ── Новини та загальні ────────────────────────────────────
  pershyi:    'https://pershyi.tvd.com.ua/hls/pershyi/playlist.m3u8',    // Перший канал (перевірити)
  inter:      'https://live.inter.ua/hls/inter/playlist.m3u8',            // Інтер (перевірити)
  ukraine:    'https://live2.kanal.com.ua/hls/ukraina/index.m3u8',        // Україна (перевірити)
  ukraine24:  'https://live.kanal.com.ua/hls/ukraine24/index.m3u8',       // Україна 24 (перевірити)
  ictv:       'https://ictv-lc.volia.com/ICTV/03.stream/playlist.m3u8',  // ICTV (перевірити)
  stb:        'https://stb-lc.volia.com/STB/03.stream/playlist.m3u8',     // СТБ (перевірити)
  novy:       'https://live.novy.tv/hls/novy/playlist.m3u8',              // Новий канал (перевірити)
  priamyi:    'https://priamyi.tv/hls/priamyi/playlist.m3u8',             // Прямий (перевірити)
  // ── Розваги та кіно ──────────────────────────────────────
  '2plus2':   'https://2plus2.ua/hls/2plus2/playlist.m3u8',              // 2+2 (перевірити)
  tonis:      'https://tonis-lc.volia.com/TONIS/03.stream/playlist.m3u8', // Тоніс (перевірити)
  k1:         'https://k1-lc.volia.com/K1/03.stream/playlist.m3u8',       // К1 (перевірити)
  // ── Новини ───────────────────────────────────────────────
  espreso:    'https://espreso.tv/hls/espreso/playlist.m3u8',             // Еспресо (перевірити)
  channel5:   'https://5channel.com.ua/hls/live/playlist.m3u8',           // 5 Канал (перевірити)
  zik:        'https://zik.ua/hls/zik/playlist.m3u8',                     // ZIK (перевірити)
  // ── Дитячі ───────────────────────────────────────────────
  piglet:     'https://piglet.ua/hls/piglet/playlist.m3u8',               // Піглет (перевірити)
  pljus:      'https://plusplus-lc.volia.com/PLUSPLUS/03.stream/playlist.m3u8', // ПлюсПлюс (перевірити)
  // ── Музика ───────────────────────────────────────────────
  m1:         'https://m1.ua/hls/m1/playlist.m3u8',                       // М1 (перевірити)
  m2:         'https://m2.ua/hls/m2/playlist.m3u8',                       // М2 (перевірити)
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // /stream?channel=NAME — отримати проксі-потік для каналу
  if (path === '/stream') {
    const channel = url.searchParams.get('channel');
    const streamUrl = STREAMS[channel];
    if (!streamUrl) {
      return new Response(JSON.stringify({ error: 'Channel not found', channel }), {
        status: 404,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    return fetchM3u8(streamUrl, url.origin);
  }

  // /proxy?url=ENCODED_URL — проксі для плейлистів та сегментів
  if (path === '/proxy') {
    const target = url.searchParams.get('url');
    if (!target) {
      return new Response('Missing url param', { status: 400, headers: CORS });
    }
    return proxyTarget(target, url.origin);
  }

  // /debug?url=ENCODED_URL — перевірка доступності URL через CF Worker
  if (path === '/debug') {
    const target = url.searchParams.get('url');
    if (!target) {
      return new Response(JSON.stringify({ channels: Object.keys(STREAMS), version: VERSION }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    try {
      const res = await fetch(target, { headers: { 'User-Agent': UA }, cf: { cacheEverything: false, cacheTtl: -1 } });
      const body = await res.text();
      return new Response(JSON.stringify({
        status: res.status,
        contentType: res.headers.get('Content-Type'),
        body: body.slice(0, 500),
      }), { headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  }

  // /version
  if (path === '/version') {
    return new Response(JSON.stringify({ version: VERSION, channels: Object.keys(STREAMS).length }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  return new Response(`Ukraine TV Worker v${VERSION}`, { headers: CORS });
}

// ── User-Agent для запитів до CDN ─────────────────────────────────────────
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Розв'язати відносний URL відносно базового ────────────────────────────
function resolveUrl(base, relative) {
  if (!relative) return base;
  if (relative.startsWith('http://') || relative.startsWith('https://')) return relative;
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

// ── Визначити базовий URL для m3u8-плейлиста (директорія файлу) ───────────
function baseDir(url) {
  return url.substring(0, url.lastIndexOf('/') + 1);
}

// ── Переписати m3u8: всі URL → /proxy?url=... ─────────────────────────────
function rewriteM3u8(content, sourceUrl, workerOrigin) {
  const base = baseDir(sourceUrl);
  const lines = content.split('\n');
  const out = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Пропустити треки субтитрів — викликають помилки hls.js
    if (line.startsWith('#EXT-X-MEDIA') && line.includes('TYPE=SUBTITLES')) continue;

    if (line === '' || line.startsWith('#')) {
      // Переписати URI= всередині тегів (EXT-X-KEY, EXT-X-MEDIA, EXT-X-MAP тощо)
      let fixed = line.replace(/URI="([^"]+)"/g, (_, uri) => {
        const abs = resolveUrl(base, uri);
        return `URI="${workerOrigin}/proxy?url=${encodeURIComponent(abs)}"`;
      });
      // Прибрати атрибут SUBTITLES="..." з EXT-X-STREAM-INF
      if (fixed.startsWith('#EXT-X-STREAM-INF')) {
        fixed = fixed.replace(/,?SUBTITLES="[^"]*"/, '');
      }
      out.push(fixed);
    } else {
      // Рядок-URL (сегмент TS або суб-плейліст)
      const abs = resolveUrl(base, line);
      out.push(`${workerOrigin}/proxy?url=${encodeURIComponent(abs)}`);
    }
  }

  return out.join('\n');
}

// ── Отримати мастер-плейліст і переписати для проксі ─────────────────────
async function fetchM3u8(streamUrl, workerOrigin) {
  let res;
  try {
    res = await fetch(streamUrl, {
      headers: {
        'User-Agent': UA,
        'Referer': new URL(streamUrl).origin + '/',
        'Origin':  new URL(streamUrl).origin,
      },
      cf: { cacheEverything: false, cacheTtl: -1 },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, url: streamUrl }), {
      status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!res.ok) {
    return new Response(`Source returned ${res.status} for ${streamUrl}`, {
      status: res.status, headers: CORS,
    });
  }

  const body = await res.text();
  const rewritten = rewriteM3u8(body, streamUrl, workerOrigin);

  return new Response(rewritten, {
    headers: {
      ...CORS,
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'no-cache, no-store',
    },
  });
}

// ── Проксі для довільного URL (суб-плейліст або сегмент) ──────────────────
async function proxyTarget(targetUrl, workerOrigin) {
  let res;
  try {
    res = await fetch(targetUrl, {
      headers: {
        'User-Agent': UA,
        'Referer':    new URL(targetUrl).origin + '/',
        'Origin':     new URL(targetUrl).origin,
      },
      cf: { cacheEverything: false, cacheTtl: -1 },
    });
  } catch (e) {
    return new Response(`Fetch error: ${e.message}`, { status: 502, headers: CORS });
  }

  if (!res.ok) {
    return new Response(`Upstream ${res.status}`, { status: res.status, headers: CORS });
  }

  const ct = (res.headers.get('Content-Type') || '').toLowerCase();
  // TS-сегмент має пріоритет — інакше "playlist_X.ts" помилково детектується як m3u8
  const isTs = /\.ts([?#]|$)/.test(targetUrl) || ct.includes('video/') || ct.includes('audio/') || ct.includes('octet-stream');
  const isM3u8 = !isTs && (ct.includes('mpegurl') || ct.includes('m3u') ||
                 targetUrl.includes('.m3u8') || targetUrl.includes('playlist') ||
                 targetUrl.includes('chunklist') || targetUrl.includes('variant'));

  if (isM3u8) {
    const body = await res.text();
    const rewritten = rewriteM3u8(body, targetUrl, workerOrigin);
    return new Response(rewritten, {
      headers: {
        ...CORS,
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache, no-store',
      },
    });
  }

  // Бінарний сегмент — стримимо напряму
  return new Response(res.body, {
    status: res.status,
    headers: {
      ...CORS,
      'Content-Type': ct || 'video/MP2T',
    },
  });
}
