// ukraine-worker.js â CF Worker Ð´Ð»Ñ Ukraine TV Hub
// ÐÐµÐ¿Ð»Ð¾Ð¹: cd ~/ukraine-worker && cp ~/ukraine-tv-hub/ukraine-worker.js src/index.js && npx wrangler deploy

const VERSION = '2.5.1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

// ÐÐ¾ÑÐ¾ÐºÐ¸ ÑÐºÑÐ°Ð¸Ð½ÑÐºÐ¸Ñ ÐºÐ°Ð½Ð°Ð»Ð¾Ð² (Ð¿ÑÐ¾Ð²ÐµÑÐµÐ½Ñ ÑÐµÑÐµÐ· /debug)
const STREAMS = {
  // ââ ÐÐ¾Ð²Ð¸Ð½Ð¸ ÑÐ° Ð·Ð°Ð³Ð°Ð»ÑÐ½Ñ ââââââââââââââââââââââââââââââââââââ
  pershyi:    'https://api-tv.ipnet.ua/api/v1/manifest/2118742505.m3u8',  // ÐÐµÑÑÐ¸Ð¹ ÐºÐ°Ð½Ð°Ð»
  channel5:   'https://api-tv.ipnet.ua/api/v1/manifest/2118742539.m3u8',  // 5 ÐÐ°Ð½Ð°Ð»
  espreso:    'https://api-tv.ipnet.ua/api/v1/manifest/2118742594.m3u8',  // ÐÑÐ¿ÑÐµÑÐ¾ Ð¢Ð
  ukraine24:  'https://5d23269b3ec0c.streamlock.net/WEB_Ukraine24/ngrp:Ukraine24.stream-adaptive/playlist.m3u8', // Ð£ÐºÑÐ°ÑÐ½Ð° 24
  kyiv24:     'https://ext.cdn.nashnet.tv/228.0.0.15/index.m3u8',  // ÐÐ¸ÑÐ² 24
  news24:     'http://streamvideol1.luxnet.ua/news24/livenews_360p/index.m3u8',              // 24 ÐÐ°Ð½Ð°Ð» (Ð¿ÑÑÐ¼Ð¸Ð¹ ÑÐµÐ³Ð¼ÐµÐ½Ñ)
  // ââ Ð Ð¾Ð·Ð²Ð°Ð³Ð¸ ÑÐ° ÐºÑÐ½Ð¾ ââââââââââââââââââââââââââââââââââââââ
  ntn:        'https://cdn15.live-tv.cloud/ua_infinitas_tv/ntn-abr/playlist.m3u8',     // ÐÐ¢Ð
  oneplusone: 'https://dash2.antik.sk/live/test_one_plus_one_int_tizen/playlist.m3u8', // 1+1 ÐÑÐ¶Ð½Ð°Ñ.
  kvartal:    'https://dash2.antik.sk/live/kvartal_tv/playlist.m3u8',                  // ÐÐ²Ð°ÑÑÐ°Ð» Ð¢Ð
  interplus:  'https://cdn15.live-tv.cloud/ua_infinitas_tv/inter-abr/playlist.m3u8',   // ÐÐ½ÑÐµÑ+
  mega:       'https://cdn15.live-tv.cloud/ua_infinitas_tv/mega-abr/playlist.m3u8',    // ÐÐµÐ³Ð°
  k2:         'https://cdn15.live-tv.cloud/ua_infinitas_tv/k2-abr/playlist.m3u8',      // Ð2
  cinema4ever:'https://iptv.prosto.tv/ch42/index.m3u8',                               // 4ever Cinema
  drama4ever: 'https://iptv.prosto.tv/ch49/index.m3u8',                               // 4ever Drama
  rada:       'https://api-tv.ipnet.ua/api/v1/manifest/1312714970.m3u8',                  // Ð Ð°Ð´Ð° Ð¢Ð
  // ââ Ð¡ÑÑÐ¿ÑÐ»ÑÐ½Ðµ ÑÐ° Ð³ÑÐ¾Ð¼Ð°Ð´ÑÑÐºÑ ââââââââââââââââââââââââââââââ
  suspilne:   'https://live-nstu.cdn-03.cosmonova.net.ua/mobile-app/main/nstu-kyiv/master.m3u8', // Ð¡ÑÑÐ¿ÑÐ»ÑÐ½Ðµ ÐÐ¸ÑÐ²
  irt:        'https://stream.irt.ua/memfs/8fac7cbb-3356-4a03-bb77-4439b727ebd2.m3u8', // IRT
  armytv:     'https://api-tv.ipnet.ua/api/v1/manifest/2118742632.m3u8',               // ÐÑÐ¼ÑÑ Ð¢Ð
  // ââ Ð ÐµÐ³ÑÐ¾Ð½Ð°Ð»ÑÐ½Ñ ââââââââââââââââââââââââââââââââââââââââââ
  rai:        'https://stream.rai.ua/rai/stream.m3u8',                                 // RAI
  tva:        'https://hls.cdn.ua/tva.ua_live/livestream/chunklist_.m3u8',             // TVA
  ntk:        'http://stream.ntktv.ua/s/ntk/ntk.m3u8',                                // NTK TV
  dnipro:     'http://vcdn1.produck.company:1935/out/dtv/playlist.m3u8',               // ÐÐ½ÑÐ¿ÑÐ¾ TV
  ch7:        'https://cdn15.live-tv.cloud/ua_infinitas_tv/7tvod-abr/playlist.m3u8',  // 7 ÐÐ°Ð½Ð°Ð» (ÐÐ´ÐµÑÐ°)
  rivne1:     'https://cdn1.live-tv.cloud/rivne1/rivne1-abr/playlist.m3u8',            // Ð ÑÐ²Ð½Ðµ 1
  itv:        'http://cdn10.live-tv.od.ua:8081/itvrv/abr/playlist.m3u8',              // ITV
  // ââ ÐÑÐ·Ð¸ÐºÐ° âââââââââââââââââââââââââââââââââââââââââââââââ
  muzvar:     'https://cdn15.live-tv.cloud/ua_infinitas_tv/muzvar-abr/playlist.m3u8',  // ÐÑÐ·Ð²Ð°Ñ
  nashemus:   'https://cdn15.live-tv.cloud/ua_infinitas_tv/nashemus-abr/playlist.m3u8', // NASHE Music
  music4ever: 'https://iptv.prosto.tv/ch132/index.m3u8',                              // 4ever Music
  uamusic:    'https://iptv.prosto.tv/ch133/index.m3u8',                              // UA Music
  m1:         'https://iptv.prosto.tv/ch122/index.m3u8',                              // Ð1
  // ââ ÐÐ¸ÑÑÑÑ âââââââââââââââââââââââââââââââââââââââââââââââ
  nikikids:   'https://iptv.prosto.tv/ch71/index.m3u8',                               // Niki Kids
  nikijunior: 'https://iptv.prosto.tv/ch72/index.m3u8',                               // Niki Junior
  // ââ Ð¢ÐµÐ¼Ð°ÑÐ¸ÑÐ½Ñ ââââââââââââââââââââââââââââââââââââââââââââ
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

  // /stream?channel=NAME â Ð¾ÑÑÐ¸Ð¼Ð°ÑÐ¸ Ð¿ÑÐ¾ÐºÑÑ-Ð¿Ð¾ÑÑÐº Ð´Ð»Ñ ÐºÐ°Ð½Ð°Ð»Ñ
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

  // /proxy?url=ENCODED_URL â Ð¿ÑÐ¾ÐºÑÑ Ð´Ð»Ñ Ð¿Ð»ÐµÐ¹Ð»Ð¸ÑÑÑÐ² ÑÐ° ÑÐµÐ³Ð¼ÐµÐ½ÑÑÐ²
  if (path === '/proxy') {
    const target = url.searchParams.get('url');
    if (!target) {
      return new Response('Missing url param', { status: 400, headers: CORS });
    }
    return proxyTarget(target, url.origin);
  }

  // /debug?url=ENCODED_URL â Ð¿ÐµÑÐµÐ²ÑÑÐºÐ° Ð´Ð¾ÑÑÑÐ¿Ð½Ð¾ÑÑÑ URL ÑÐµÑÐµÐ· CF Worker
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

// ââ User-Agent Ð´Ð»Ñ Ð·Ð°Ð¿Ð¸ÑÑÐ² Ð´Ð¾ CDN âââââââââââââââââââââââââââââââââââââââââ
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ââ Ð Ð¾Ð·Ð²'ÑÐ·Ð°ÑÐ¸ Ð²ÑÐ´Ð½Ð¾ÑÐ½Ð¸Ð¹ URL Ð²ÑÐ´Ð½Ð¾ÑÐ½Ð¾ Ð±Ð°Ð·Ð¾Ð²Ð¾Ð³Ð¾ ââââââââââââââââââââââââââââ
function resolveUrl(base, relative) {
  if (!relative) return base;
  if (relative.startsWith('http://') || relative.startsWith('https://')) return relative;
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

// ââ ÐÐ¸Ð·Ð½Ð°ÑÐ¸ÑÐ¸ Ð±Ð°Ð·Ð¾Ð²Ð¸Ð¹ URL Ð´Ð»Ñ m3u8-Ð¿Ð»ÐµÐ¹Ð»Ð¸ÑÑÐ° (Ð´Ð¸ÑÐµÐºÑÐ¾ÑÑÑ ÑÐ°Ð¹Ð»Ñ) âââââââââââ
function baseDir(url) {
  return url.substring(0, url.lastIndexOf('/') + 1);
}

// ââ ÐÐµÑÐµÐ¿Ð¸ÑÐ°ÑÐ¸ m3u8: Ð²ÑÑ URL â /proxy?url=... âââââââââââââââââââââââââââââ
function rewriteM3u8(content, sourceUrl, workerOrigin) {
  const base = baseDir(sourceUrl);
  const lines = content.split('\n');
  const out = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // ÐÑÐ¾Ð¿ÑÑÑÐ¸ÑÐ¸ ÑÑÐµÐºÐ¸ ÑÑÐ±ÑÐ¸ÑÑÑÐ² â Ð²Ð¸ÐºÐ»Ð¸ÐºÐ°ÑÑÑ Ð¿Ð¾Ð¼Ð¸Ð»ÐºÐ¸ hls.js
    if (line.startsWith('#EXT-X-MEDIA') && line.includes('TYPE=SUBTITLES')) continue;

    if (line === '' || line.startsWith('#')) {
      // ÐÐµÑÐµÐ¿Ð¸ÑÐ°ÑÐ¸ URI= Ð²ÑÐµÑÐµÐ´Ð¸Ð½Ñ ÑÐµÐ³ÑÐ² (EXT-X-KEY, EXT-X-MEDIA, EXT-X-MAP ÑÐ¾ÑÐ¾)
      let fixed = line.replace(/URI="([^"]+)"/g, (_, uri) => {
        const abs = resolveUrl(base, uri);
        return `URI="${workerOrigin}/proxy?url=${encodeURIComponent(abs)}"`;
      });
      // ÐÑÐ¸Ð±ÑÐ°ÑÐ¸ Ð°ÑÑÐ¸Ð±ÑÑ SUBTITLES="..." Ð· EXT-X-STREAM-INF
      if (fixed.startsWith('#EXT-X-STREAM-INF')) {
        fixed = fixed.replace(/,?SUBTITLES="[^"]*"/, '');
      }
      out.push(fixed);
    } else {
      // Ð ÑÐ´Ð¾Ðº-URL (ÑÐµÐ³Ð¼ÐµÐ½Ñ TS Ð°Ð±Ð¾ ÑÑÐ±-Ð¿Ð»ÐµÐ¹Ð»ÑÑÑ)
      const abs = resolveUrl(base, line);
      out.push(`${workerOrigin}/proxy?url=${encodeURIComponent(abs)}`);
    }
  }

  return out.join('\n');
}

// ââ ÐÑÑÐ¸Ð¼Ð°ÑÐ¸ Ð¼Ð°ÑÑÐµÑ-Ð¿Ð»ÐµÐ¹Ð»ÑÑÑ Ñ Ð¿ÐµÑÐµÐ¿Ð¸ÑÐ°ÑÐ¸ Ð´Ð»Ñ Ð¿ÑÐ¾ÐºÑÑ âââââââââââââââââââââ
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

// ââ ÐÑÐ¾ÐºÑÑ Ð´Ð»Ñ Ð´Ð¾Ð²ÑÐ»ÑÐ½Ð¾Ð³Ð¾ URL (ÑÑÐ±-Ð¿Ð»ÐµÐ¹Ð»ÑÑÑ Ð°Ð±Ð¾ ÑÐµÐ³Ð¼ÐµÐ½Ñ) ââââââââââââââââââ
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
  // TS-ÑÐµÐ³Ð¼ÐµÐ½Ñ Ð¼Ð°Ñ Ð¿ÑÑÐ¾ÑÐ¸ÑÐµÑ â ÑÐ½Ð°ÐºÑÐµ "playlist_X.ts" Ð¿Ð¾Ð¼Ð¸Ð»ÐºÐ¾Ð²Ð¾ Ð´ÐµÑÐµÐºÑÑÑÑÑÑÑ ÑÐº m3u8
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

  // ÐÑÐ½Ð°ÑÐ½Ð¸Ð¹ ÑÐµÐ³Ð¼ÐµÐ½Ñ â ÑÑÑÐ¸Ð¼Ð¸Ð¼Ð¾ Ð½Ð°Ð¿ÑÑÐ¼Ñ
  return new Response(res.body, {
    status: res.status,
    headers: {
      ...CORS,
      'Content-Type': ct || 'video/MP2T',
    },
  });
}
