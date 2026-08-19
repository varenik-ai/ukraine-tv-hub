// ukraine-worker.js Ã¢ÂÂ CF Worker ÃÂ´ÃÂ»ÃÂ Ukraine TV Hub
// ÃÂÃÂµÃÂ¿ÃÂ»ÃÂ¾ÃÂ¹: cd ~/ukraine-worker && cp ~/ukraine-tv-hub/ukraine-worker.js src/index.js && npx wrangler deploy

const VERSION = '2.6.0';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

// ÃÂÃÂ¾ÃÂÃÂ¾ÃÂºÃÂ¸ ÃÂÃÂºÃÂÃÂ°ÃÂ¸ÃÂ½ÃÂÃÂºÃÂ¸ÃÂ ÃÂºÃÂ°ÃÂ½ÃÂ°ÃÂ»ÃÂ¾ÃÂ² (ÃÂ¿ÃÂÃÂ¾ÃÂ²ÃÂµÃÂÃÂµÃÂ½ÃÂ ÃÂÃÂµÃÂÃÂµÃÂ· /debug)
const STREAMS = {
  // Ã¢ÂÂÃ¢ÂÂ ÃÂÃÂ¾ÃÂ²ÃÂ¸ÃÂ½ÃÂ¸ ÃÂÃÂ° ÃÂ·ÃÂ°ÃÂ³ÃÂ°ÃÂ»ÃÂÃÂ½ÃÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  pershyi:    'https://api-tv.ipnet.ua/api/v1/manifest/2118742505.m3u8',  // ÃÂÃÂµÃÂÃÂÃÂ¸ÃÂ¹ ÃÂºÃÂ°ÃÂ½ÃÂ°ÃÂ»
  channel5:   'https://api-tv.ipnet.ua/api/v1/manifest/2118742539.m3u8',  // 5 ÃÂÃÂ°ÃÂ½ÃÂ°ÃÂ»
  espreso:    'https://api-tv.ipnet.ua/api/v1/manifest/2118742594.m3u8',  // ÃÂÃÂÃÂ¿ÃÂÃÂµÃÂÃÂ¾ ÃÂ¢ÃÂ
  ukraine24:  'https://5d23269b3ec0c.streamlock.net/WEB_Ukraine24/ngrp:Ukraine24.stream-adaptive/playlist.m3u8', // ÃÂ£ÃÂºÃÂÃÂ°ÃÂÃÂ½ÃÂ° 24
  kyiv24:     'https://ext.cdn.nashnet.tv/228.0.0.15/index.m3u8',  // ÃÂÃÂ¸ÃÂÃÂ² 24
  news24:     'http://streamvideol1.luxnet.ua/news24/livenews_360p/index.m3u8',              // 24 ÃÂÃÂ°ÃÂ½ÃÂ°ÃÂ» (ÃÂ¿ÃÂÃÂÃÂ¼ÃÂ¸ÃÂ¹ ÃÂÃÂµÃÂ³ÃÂ¼ÃÂµÃÂ½ÃÂ)
  // Ã¢ÂÂÃ¢ÂÂ ÃÂ ÃÂ¾ÃÂ·ÃÂ²ÃÂ°ÃÂ³ÃÂ¸ ÃÂÃÂ° ÃÂºÃÂÃÂ½ÃÂ¾ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  inter:      'https://cdn15.live-tv.cloud/ua_infinitas_tv/inter-abr/playlist.m3u8',   // Інтер
  ntn:        'https://cdn15.live-tv.cloud/ua_infinitas_tv/ntn-abr/playlist.m3u8',     // ÃÂÃÂ¢ÃÂ
  oneplusone: 'https://dash2.antik.sk/live/test_one_plus_one_int_tizen/playlist.m3u8', // 1+1 ÃÂÃÂÃÂ¶ÃÂ½ÃÂ°ÃÂ.
  kvartal:    'https://dash2.antik.sk/live/kvartal_tv/playlist.m3u8',                  // ÃÂÃÂ²ÃÂ°ÃÂÃÂÃÂ°ÃÂ» ÃÂ¢ÃÂ
  interplus:  'https://cdn15.live-tv.cloud/ua_infinitas_tv/inter-abr/playlist.m3u8',   // ÃÂÃÂ½ÃÂÃÂµÃÂ+
  mega:       'https://cdn15.live-tv.cloud/ua_infinitas_tv/mega-abr/playlist.m3u8',    // ÃÂÃÂµÃÂ³ÃÂ°
  k2:         'https://cdn15.live-tv.cloud/ua_infinitas_tv/k2-abr/playlist.m3u8',      // ÃÂ2
  cinema4ever:'https://iptv.prosto.tv/ch42/index.m3u8',                               // 4ever Cinema
  drama4ever: 'https://iptv.prosto.tv/ch49/index.m3u8',                               // 4ever Drama
  rada:       'https://api-tv.ipnet.ua/api/v1/manifest/1312714970.m3u8',                  // ÃÂ ÃÂ°ÃÂ´ÃÂ° ÃÂ¢ÃÂ
  // Ã¢ÂÂÃ¢ÂÂ ÃÂ¡ÃÂÃÂÃÂ¿ÃÂÃÂ»ÃÂÃÂ½ÃÂµ ÃÂÃÂ° ÃÂ³ÃÂÃÂ¾ÃÂ¼ÃÂ°ÃÂ´ÃÂÃÂÃÂºÃÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  suspilne:   'https://live-nstu.cdn-03.cosmonova.net.ua/mobile-app/main/nstu-kyiv/master.m3u8', // ÃÂ¡ÃÂÃÂÃÂ¿ÃÂÃÂ»ÃÂÃÂ½ÃÂµ ÃÂÃÂ¸ÃÂÃÂ²
  irt:        'https://stream.irt.ua/memfs/8fac7cbb-3356-4a03-bb77-4439b727ebd2.m3u8', // IRT
  armytv:     'https://api-tv.ipnet.ua/api/v1/manifest/2118742632.m3u8',               // ÃÂÃÂÃÂ¼ÃÂÃÂ ÃÂ¢ÃÂ
  // Ã¢ÂÂÃ¢ÂÂ ÃÂ ÃÂµÃÂ³ÃÂÃÂ¾ÃÂ½ÃÂ°ÃÂ»ÃÂÃÂ½ÃÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  rai:        'https://stream.rai.ua/rai/stream.m3u8',                                 // RAI
  tva:        'https://hls.cdn.ua/tva.ua_live/livestream/chunklist_.m3u8',             // TVA
  ntk:        'http://stream.ntktv.ua/s/ntk/ntk.m3u8',                                // NTK TV
  dnipro:     'http://vcdn1.produck.company:1935/out/dtv/playlist.m3u8',               // ÃÂÃÂ½ÃÂÃÂ¿ÃÂÃÂ¾ TV
  ch7:        'https://cdn15.live-tv.cloud/ua_infinitas_tv/7tvod-abr/playlist.m3u8',  // 7 ÃÂÃÂ°ÃÂ½ÃÂ°ÃÂ» (ÃÂÃÂ´ÃÂµÃÂÃÂ°)
  rivne1:     'https://cdn1.live-tv.cloud/rivne1/rivne1-abr/playlist.m3u8',            // ÃÂ ÃÂÃÂ²ÃÂ½ÃÂµ 1
  itv:        'http://cdn10.live-tv.od.ua:8081/itvrv/abr/playlist.m3u8',              // ITV
  // Ã¢ÂÂÃ¢ÂÂ ÃÂÃÂÃÂ·ÃÂ¸ÃÂºÃÂ° Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  muzvar:     'https://cdn15.live-tv.cloud/ua_infinitas_tv/muzvar-abr/playlist.m3u8',  // ÃÂÃÂÃÂ·ÃÂ²ÃÂ°ÃÂ
  nashemus:   'https://cdn15.live-tv.cloud/ua_infinitas_tv/nashemus-abr/playlist.m3u8', // NASHE Music
  music4ever: 'https://iptv.prosto.tv/ch132/index.m3u8',                              // 4ever Music
  uamusic:    'https://iptv.prosto.tv/ch133/index.m3u8',                              // UA Music
  m1:         'https://iptv.prosto.tv/ch122/index.m3u8',                              // ÃÂ1
  // Ã¢ÂÂÃ¢ÂÂ ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  nikikids:   'https://iptv.prosto.tv/ch71/index.m3u8',                               // Niki Kids
  nikijunior: 'https://iptv.prosto.tv/ch72/index.m3u8',                               // Niki Junior
  // Ã¢ÂÂÃ¢ÂÂ ÃÂ¢ÃÂµÃÂ¼ÃÂ°ÃÂÃÂ¸ÃÂÃÂ½ÃÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  rybalka:    'https://iptv.prosto.tv/ch88/index.m3u8',                               // Rybalka TV
  uafashion:  'https://iptv.prosto.tv/ch216/index.m3u8',                              // UA Fashion TV
  svarozhychy:'https://iptv.prosto.tv/ch168/index.m3u8',                              // Svarozhychy
  equalympic: 'https://iptv.prosto.tv/ch215/index.m3u8',                              // Equalympic
};

// CDN domains that send CORS on segments — browser fetches them directly
const DIRECT_CORS_DOMAINS = [
  'cdn15.live-tv.cloud',
  'iptv.prosto.tv',
];
function canFetchDirect(url) {
  return DIRECT_CORS_DOMAINS.some(function(d) { return url.indexOf(d) !== -1; });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // /stream?channel=NAME Ã¢ÂÂ ÃÂ¾ÃÂÃÂÃÂ¸ÃÂ¼ÃÂ°ÃÂÃÂ¸ ÃÂ¿ÃÂÃÂ¾ÃÂºÃÂÃÂ-ÃÂ¿ÃÂ¾ÃÂÃÂÃÂº ÃÂ´ÃÂ»ÃÂ ÃÂºÃÂ°ÃÂ½ÃÂ°ÃÂ»ÃÂ
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

  // /proxy?url=ENCODED_URL Ã¢ÂÂ ÃÂ¿ÃÂÃÂ¾ÃÂºÃÂÃÂ ÃÂ´ÃÂ»ÃÂ ÃÂ¿ÃÂ»ÃÂµÃÂ¹ÃÂ»ÃÂ¸ÃÂÃÂÃÂÃÂ² ÃÂÃÂ° ÃÂÃÂµÃÂ³ÃÂ¼ÃÂµÃÂ½ÃÂÃÂÃÂ²
  if (path === '/proxy') {
    const target = url.searchParams.get('url');
    if (!target) {
      return new Response('Missing url param', { status: 400, headers: CORS });
    }
    return proxyTarget(target, url.origin);
  }

  // /debug?url=ENCODED_URL Ã¢ÂÂ ÃÂ¿ÃÂµÃÂÃÂµÃÂ²ÃÂÃÂÃÂºÃÂ° ÃÂ´ÃÂ¾ÃÂÃÂÃÂÃÂ¿ÃÂ½ÃÂ¾ÃÂÃÂÃÂ URL ÃÂÃÂµÃÂÃÂµÃÂ· CF Worker
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

// Ã¢ÂÂÃ¢ÂÂ User-Agent ÃÂ´ÃÂ»ÃÂ ÃÂ·ÃÂ°ÃÂ¿ÃÂ¸ÃÂÃÂÃÂ² ÃÂ´ÃÂ¾ CDN Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Ã¢ÂÂÃ¢ÂÂ ÃÂ ÃÂ¾ÃÂ·ÃÂ²'ÃÂÃÂ·ÃÂ°ÃÂÃÂ¸ ÃÂ²ÃÂÃÂ´ÃÂ½ÃÂ¾ÃÂÃÂ½ÃÂ¸ÃÂ¹ URL ÃÂ²ÃÂÃÂ´ÃÂ½ÃÂ¾ÃÂÃÂ½ÃÂ¾ ÃÂ±ÃÂ°ÃÂ·ÃÂ¾ÃÂ²ÃÂ¾ÃÂ³ÃÂ¾ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function resolveUrl(base, relative) {
  if (!relative) return base;
  if (relative.startsWith('http://') || relative.startsWith('https://')) return relative;
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

// Ã¢ÂÂÃ¢ÂÂ ÃÂÃÂ¸ÃÂ·ÃÂ½ÃÂ°ÃÂÃÂ¸ÃÂÃÂ¸ ÃÂ±ÃÂ°ÃÂ·ÃÂ¾ÃÂ²ÃÂ¸ÃÂ¹ URL ÃÂ´ÃÂ»ÃÂ m3u8-ÃÂ¿ÃÂ»ÃÂµÃÂ¹ÃÂ»ÃÂ¸ÃÂÃÂÃÂ° (ÃÂ´ÃÂ¸ÃÂÃÂµÃÂºÃÂÃÂ¾ÃÂÃÂÃÂ ÃÂÃÂ°ÃÂ¹ÃÂ»ÃÂ) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function baseDir(url) {
  return url.substring(0, url.lastIndexOf('/') + 1);
}

// Ã¢ÂÂÃ¢ÂÂ ÃÂÃÂµÃÂÃÂµÃÂ¿ÃÂ¸ÃÂÃÂ°ÃÂÃÂ¸ m3u8: ÃÂ²ÃÂÃÂ URL Ã¢ÂÂ /proxy?url=... Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
function rewriteM3u8(content, sourceUrl, workerOrigin) {
  const base = baseDir(sourceUrl);
  const lines = content.split('\n');
  const out = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // ÃÂÃÂÃÂ¾ÃÂ¿ÃÂÃÂÃÂÃÂ¸ÃÂÃÂ¸ ÃÂÃÂÃÂµÃÂºÃÂ¸ ÃÂÃÂÃÂ±ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ² Ã¢ÂÂ ÃÂ²ÃÂ¸ÃÂºÃÂ»ÃÂ¸ÃÂºÃÂ°ÃÂÃÂÃÂ ÃÂ¿ÃÂ¾ÃÂ¼ÃÂ¸ÃÂ»ÃÂºÃÂ¸ hls.js
    if (line.startsWith('#EXT-X-MEDIA') && line.includes('TYPE=SUBTITLES')) continue;

    if (line === '' || line.startsWith('#')) {
      // ÃÂÃÂµÃÂÃÂµÃÂ¿ÃÂ¸ÃÂÃÂ°ÃÂÃÂ¸ URI= ÃÂ²ÃÂÃÂµÃÂÃÂµÃÂ´ÃÂ¸ÃÂ½ÃÂ ÃÂÃÂµÃÂ³ÃÂÃÂ² (EXT-X-KEY, EXT-X-MEDIA, EXT-X-MAP ÃÂÃÂ¾ÃÂÃÂ¾)
      let fixed = line.replace(/URI="([^"]+)"/g, (_, uri) => {
        const abs = resolveUrl(base, uri);
        return `URI="${workerOrigin}/proxy?url=${encodeURIComponent(abs)}"`;
      });
      // ÃÂÃÂÃÂ¸ÃÂ±ÃÂÃÂ°ÃÂÃÂ¸ ÃÂ°ÃÂÃÂÃÂ¸ÃÂ±ÃÂÃÂ SUBTITLES="..." ÃÂ· EXT-X-STREAM-INF
      if (fixed.startsWith('#EXT-X-STREAM-INF')) {
        fixed = fixed.replace(/,?SUBTITLES="[^"]*"/, '');
      }
      out.push(fixed);
    } else {
      // ÃÂ ÃÂÃÂ´ÃÂ¾ÃÂº-URL (ÃÂÃÂµÃÂ³ÃÂ¼ÃÂµÃÂ½ÃÂ TS ÃÂ°ÃÂ±ÃÂ¾ ÃÂÃÂÃÂ±-ÃÂ¿ÃÂ»ÃÂµÃÂ¹ÃÂ»ÃÂÃÂÃÂ)
      const abs = resolveUrl(base, line);
      out.push(`${workerOrigin}/proxy?url=${encodeURIComponent(abs)}`);
    }
  }

  return out.join('\n');
}

// Ã¢ÂÂÃ¢ÂÂ ÃÂÃÂÃÂÃÂ¸ÃÂ¼ÃÂ°ÃÂÃÂ¸ ÃÂ¼ÃÂ°ÃÂÃÂÃÂµÃÂ-ÃÂ¿ÃÂ»ÃÂµÃÂ¹ÃÂ»ÃÂÃÂÃÂ ÃÂ ÃÂ¿ÃÂµÃÂÃÂµÃÂ¿ÃÂ¸ÃÂÃÂ°ÃÂÃÂ¸ ÃÂ´ÃÂ»ÃÂ ÃÂ¿ÃÂÃÂ¾ÃÂºÃÂÃÂ Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
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
      'Cache-Control': 'public, s-maxage=5, max-age=0',
    },
  });
}

// Ã¢ÂÂÃ¢ÂÂ ÃÂÃÂÃÂ¾ÃÂºÃÂÃÂ ÃÂ´ÃÂ»ÃÂ ÃÂ´ÃÂ¾ÃÂ²ÃÂÃÂ»ÃÂÃÂ½ÃÂ¾ÃÂ³ÃÂ¾ URL (ÃÂÃÂÃÂ±-ÃÂ¿ÃÂ»ÃÂµÃÂ¹ÃÂ»ÃÂÃÂÃÂ ÃÂ°ÃÂ±ÃÂ¾ ÃÂÃÂµÃÂ³ÃÂ¼ÃÂµÃÂ½ÃÂ) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
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
  // TS-ÃÂÃÂµÃÂ³ÃÂ¼ÃÂµÃÂ½ÃÂ ÃÂ¼ÃÂ°ÃÂ ÃÂ¿ÃÂÃÂÃÂ¾ÃÂÃÂ¸ÃÂÃÂµÃÂ Ã¢ÂÂ ÃÂÃÂ½ÃÂ°ÃÂºÃÂÃÂµ "playlist_X.ts" ÃÂ¿ÃÂ¾ÃÂ¼ÃÂ¸ÃÂ»ÃÂºÃÂ¾ÃÂ²ÃÂ¾ ÃÂ´ÃÂµÃÂÃÂµÃÂºÃÂÃÂÃÂÃÂÃÂÃÂÃÂ ÃÂÃÂº m3u8
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
      'Cache-Control': 'public, s-maxage=5, max-age=0',
      },
    });
  }

  // ÃÂÃÂÃÂ½ÃÂ°ÃÂÃÂ½ÃÂ¸ÃÂ¹ ÃÂÃÂµÃÂ³ÃÂ¼ÃÂµÃÂ½ÃÂ Ã¢ÂÂ ÃÂÃÂÃÂÃÂ¸ÃÂ¼ÃÂ¸ÃÂ¼ÃÂ¾ ÃÂ½ÃÂ°ÃÂ¿ÃÂÃÂÃÂ¼ÃÂ
  return new Response(res.body, {
    status: res.status,
    headers: {
      ...CORS,
      'Content-Type': ct || 'video/MP2T',
    },
  });
}
