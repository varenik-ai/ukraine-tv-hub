// Ukraine TV worker v3.0.0 — режим «только плейлисты» (по образцу russia-worker).
// /stream  — плейлист канала; сегменты отдаются источником напрямую (абсолютные URL)
// /playlist — вложенные плейлисты (только домены источников)
// /seg     — сегменты ТОЛЬКО для каналов без CORS (SEG_PROXY_CHANNELS), только их домены
// /proxy и /debug убраны (открытый relay закрыт).
import { STREAMS, SEG_PROXY_CHANNELS, SEG_PROXY_DOMAINS } from './streams.generated.js';

const VERSION = '3.0.0';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const ALLOWED_ORIGINS = ['https://ukraine-tv.uk', 'https://www.ukraine-tv.uk', 'https://varenik-ai.github.io'];
const SEGMENT_EXT = /\.(ts|m4s|mp4|aac|m4a|cmfv|cmfa|vtt|webvtt|key)(\?|$)/i;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};
const NO_STORE = { 'Cache-Control': 'no-store' };

const SOURCE_HOSTS = new Set(Object.values(STREAMS).map((u) => new URL(u).hostname));
const SEG_CHANNELS = new Set(SEG_PROXY_CHANNELS);

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...CORS, ...NO_STORE, 'Content-Type': 'application/json' } });
const text = (msg, status) => new Response(msg, { status, headers: { ...CORS, ...NO_STORE } });

// Браузер всегда шлёт Origin на cross-origin запрос; нативный iOS-плеер — не шлёт, его пропускаем.
function originOk(request) {
  const o = request.headers.get('Origin');
  return !o || ALLOWED_ORIGINS.includes(o);
}

const underDomain = (host, domains) => domains.some((d) => host === d || host.endsWith('.' + d));
const hostAllowed = (host, channel) =>
  SOURCE_HOSTS.has(host) || (SEG_CHANNELS.has(channel) && underDomain(host, SEG_PROXY_DOMAINS));

function upstreamHeaders(url) {
  return { 'User-Agent': UA, Accept: '*/*', Origin: new URL(url).origin, Referer: new URL(url).origin + '/' };
}

// Переписываем плейлист: все URI -> абсолютные; вложенные плейлисты через /playlist;
// сегменты — напрямую, а для SEG_PROXY-каналов через /seg.
function rewritePlaylist(body, baseUrl, self, channel) {
  const viaSeg = SEG_CHANNELS.has(channel);
  const abs = (u) => new URL(u, baseUrl).href;
  const wrap = (u) => {
    const a = abs(u);
    if (SEGMENT_EXT.test(new URL(a).pathname + new URL(a).search)) {
      return viaSeg ? `${self}/seg?c=${channel}&u=${encodeURIComponent(a)}` : a;
    }
    if (/\.m3u8?(\?|$)/i.test(new URL(a).pathname) || !/\.[a-z0-9]{2,4}$/i.test(new URL(a).pathname)) {
      return `${self}/playlist?c=${channel}&url=${encodeURIComponent(a)}`;
    }
    return viaSeg ? `${self}/seg?c=${channel}&u=${encodeURIComponent(a)}` : a;
  };
  return body
    .split('\n')
    .map((raw) => {
      const line = raw.trim();
      if (!line) return raw;
      if (line.startsWith('#')) {
        // URI="..." в тегах (EXT-X-MEDIA, EXT-X-KEY, EXT-X-MAP) — субтитры выкидываем
        if (/^#EXT-X-MEDIA:.*TYPE=SUBTITLES/i.test(line)) return null;
        if (/^#EXT-X-KEY:.*METHOD=NONE/i.test(line)) return raw;
        return raw.replace(/URI="([^"]+)"/g, (_, u) => `URI="${wrap(u)}"`);
      }
      return wrap(line);
    })
    .filter((l) => l !== null)
    .join('\n');
}

async function playlistResponse(srcUrl, self, channel) {
  const up = await fetch(srcUrl, { headers: upstreamHeaders(srcUrl), cf: { cacheTtl: 0 } });
  if (!up.ok) return text(`upstream ${up.status}`, 502);
  const body = await up.text();
  if (!body.includes('#EXTM3U')) return text('upstream is not a playlist', 502);
  return new Response(rewritePlaylist(body, up.url || srcUrl, self, channel), {
    headers: { ...CORS, ...NO_STORE, 'Content-Type': 'application/vnd.apple.mpegurl' },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const self = url.origin;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method !== 'GET' && request.method !== 'HEAD') return text('method not allowed', 405);

    switch (url.pathname) {
      case '/version':
        return json({ version: VERSION, mode: 'playlist-only', channels: Object.keys(STREAMS).length, segProxy: SEG_PROXY_CHANNELS });
      case '/proxy':
        return text('gone', 410);
      case '/stream': {
        if (!originOk(request)) return text('forbidden origin', 403);
        const channel = url.searchParams.get('channel');
        const src = STREAMS[channel];
        if (!src) return text('unknown channel', 404);
        try {
          return await playlistResponse(src, self, channel);
        } catch (e) {
          return text('fetch error', 502);
        }
      }
      case '/playlist': {
        if (!originOk(request)) return text('forbidden origin', 403);
        const channel = url.searchParams.get('c') || '';
        let target;
        try { target = new URL(url.searchParams.get('url') || ''); } catch { return text('bad url', 400); }
        if (target.protocol !== 'https:' && target.protocol !== 'http:') return text('bad url', 400);
        if (!hostAllowed(target.hostname, channel)) return text('host not allowed', 403);
        if (SEGMENT_EXT.test(target.pathname)) return text('segments are not served here', 403);
        try {
          return await playlistResponse(target.href, self, channel);
        } catch (e) {
          return text('fetch error', 502);
        }
      }
      case '/seg': {
        if (!originOk(request)) return text('forbidden origin', 403);
        const channel = url.searchParams.get('c') || '';
        if (!SEG_CHANNELS.has(channel)) return text('segment proxy disabled for this channel', 403);
        let target;
        try { target = new URL(url.searchParams.get('u') || ''); } catch { return text('bad url', 400); }
        if (target.protocol !== 'https:' || !underDomain(target.hostname, SEG_PROXY_DOMAINS)) return text('host not allowed', 403);
        const up = await fetch(target.href, { headers: upstreamHeaders(target.href), cf: { cacheTtl: 0 } });
        if (!up.ok) return text(`upstream ${up.status}`, 502);
        const ct = up.headers.get('Content-Type') || '';
        if (/mpegurl|text\/html|json/i.test(ct)) return text('not a media segment', 403);
        return new Response(up.body, { status: 200, headers: { ...CORS, ...NO_STORE, 'Content-Type': ct || 'video/mp2t' } });
      }
      default:
        return text('Ukraine TV Worker ' + VERSION, 404);
    }
  },
};
