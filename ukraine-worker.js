// ukraine-worker.js — CF Worker для Ukraine TV Hub
// Деплой: cd ~/ukraine-worker && cp ~/ukraine-tv-hub/ukraine-worker.js src/index.js && npx wrangler deploy

const VERSION = '2.5.0';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

// Потоки украинских каналов (проверены через /debug)
const STREAMS = {
  // ── Новини та загальні ────────────────────────────────────
  pershyi:    'https://api-tv.ipnet.ua/api/v1/manifest/2118742505.m3u8',  // Перший канал
  channel5:   'https://api-tv.ipnet.ua/api/v1/manifest/2118742539.m3u8',  // 5 Канал
  espreso:    'https://api-tv.ipnet.ua/api/v1/manifest/2118742594.m3u8',  // Еспресо ТВ
  ukraine24:  'https://5d23269b3ec0c.streamlock.net/WEB_Ukraine24/ngrp:Ukraine24.stream-adaptive/playlist.m3u8', // Україна 24
  kyiv24:     'https://api-tv.ipnet.ua/api/v1/manifest/1293296300.m3u8',  // Київ 24
  news24:     'http://streamvideol1.luxnet.ua/news24/livenews_360p/index.m3u8',              // 24 Канал (прямий сегмент)
  // ── Розваги та кіно ──────────────────────────────────────
  ntn:        'https://cdn15.live-tv.cloud/ua_infinitas_tv/ntn-abr/playlist.m3u8',     // НТН
  oneplusone: 'https://dash2.antik.sk/live/test_one_plus_one_int_tizen/playlist.m3u8', // 1+1 Міжнар.
  kvartal:    'https://dash2.antik.sk/live/kvartal_tv/playlist.m3u8',                  // Квартал ТВ
  interplus:  'https://cdn15.live-tv.cloud/ua_infinitas_tv/inter-abr/playlist.m3u8',   // Інтер+
  mega:       'https://cdn15.live-tv.cloud/ua_infinitas_tv/mega-abr/playlist.m3u8',    // Мега
  k2:         'https://cdn15.live-tv.cloud/ua_infinitas_tv/k2-abr/playlist.m3u8',      // К2
  cinema4ever:'https://iptv.prosto.tv/ch42/index.m3u8',                               // 4ever Cinema
  drama4ever: 'https://iptv.prosto.tv/ch49/index.m3u8',                               // 4ever Drama
  rada:       'https://api-tv.ipnet.ua/api/v1/manifest/1312714970.m3u8',                  // Рада ТВ
  // ── Суспільне та громадські ──────────────────────────────
  suspilne:   'https://live-nstu.cdn-03.cosmonova.net.ua/mobile-app/main/nstu-kyiv/master.m3u8', // Суспільне Київ
  irt:        'https://stream.irt.ua/memfs/8fac7cbb-3356-4a03-bb77-4439b727ebd2.m3u8', // IRT
  armytv:     'https://api-tv.ipnet.ua/api/v1/manifest/2118742632.m3u8',               // Армія ТВ
  // ── Регіональні ──────────────────────────────────────────
  rai:        'https://stream.rai.ua/rai/stream.m3u8',                                 // RAI
  tva:        'https://hls.cdn.ua/tva.ua_live/livestream/chunklist_.m3u8',             // TVA
  ntk:        'http://stream.ntktv.ua/s/ntk/ntk.m3u8',                                // NTK TV
  dnipro:     'http://vcdn1.produck.company:1935/out/dtv/playlist.m3u8',               // Дніпро TV
  ch7:        'https://cdn15.live-tv.cloud/ua_infinitas_tv/7tvod-abr/playlist.m3u8',  // 7 Канал (Одеса)
  rivne1:     'https://cdn1.live-tv.cloud/rivne1/rivne1-abr/playlist.m3u8',            // Рівне 1
  itv:        'http://cdn10.live-tv.od.ua:8081/itvrv/abr/playlist.m3u8',              // ITV
  // ── Музика ───────────────────────────────────────────────
  muzvar:     'https://cdn15.live-tv.cloud/ua_infinitas_tv/muzvar-abr/playlist.m3u8',  // Мюзвар
  nashemus:   'https://cdn15.live-tv.cloud/ua_infinitas_tv/nashemus-abr/playlist.m3u8', // NASHE Music
  music4ever: 'https://iptv.prosto.tv/ch132/index.m3u8',                              // 4ever Music
  uamusic:    'https://iptv.prosto.tv/ch133/index.m3u8',                              // UA Music
  m1:         'https://iptv.prosto.tv/ch122/index.m3u8',                              // М1
  // ── Дитячі ───────────────────────────────────────────────
  nikikids:   'https://iptv.prosto.tv/ch71/index.m3u8',                               // Niki Kids
  nikijunior: 'https://iptv.prosto.tv/ch72/index.m3u8',                               // Niki Junior
  // ── Тематичні ────────────────────────────────────────────
  rybalka:    'https://iptv.prosto.tv/ch88/index.m3u8',                               // Rybalka TV
  uafashion:  'https://iptv.prosto.tv/ch216/index.m3u8',                              // UA Fashion TV
  svarozhychy:'https://iptv.prosto.tv/ch168/index.m3u8',                              // Svarozhychy
  equalympic: 'https://iptv.prosto.tv/ch215/index.m3u8',                              // Equalympic
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
