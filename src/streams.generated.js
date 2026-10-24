// Автогенерация: tools/gen_worker_streams.py — не править вручную (источник: data/channels.json)
export const STREAMS = {
  "pershyi": "https://api-tv.ipnet.ua/api/v1/manifest/2118742505.m3u8",
  "channel5": "https://api-tv.ipnet.ua/api/v1/manifest/2118742539.m3u8",
  "espreso": "https://cdn15.live-tv.cloud/ua_infinitas_tv/espreso-abr/playlist.m3u8",
  "kyiv24": "https://api-tv.ipnet.ua/api/v1/manifest/1293296300.m3u8",
  "news24": "https://cdn15.live-tv.cloud/ua_infinitas_tv/news24-abr/playlist.m3u8",
  "rada": "https://cdn15.live-tv.cloud/ua_infinitas_tv/rada-abr/playlist.m3u8",
  "ntn": "https://cdn15.live-tv.cloud/ua_infinitas_tv/ntn-abr/playlist.m3u8",
  "inter": "https://cdn15.live-tv.cloud/ua_infinitas_tv/inter-abr/playlist.m3u8",
  "oneplusone": "https://dash2.antik.sk/live/test_one_plus_one_int_tizen/playlist.m3u8",
  "marafon": "https://dash2.antik.sk/live/1plus1_marathon/playlist.m3u8",
  "kvartal": "https://dash2.antik.sk/live/kvartal_tv/playlist.m3u8",
  "mega": "https://cdn15.live-tv.cloud/ua_infinitas_tv/mega-abr/playlist.m3u8",
  "k2": "https://cdn15.live-tv.cloud/ua_infinitas_tv/k2-abr/playlist.m3u8",
  "filmualive": "https://dash2.antik.sk/live/test_film_life_atktv/playlist.m3u8",
  "cinema4ever": "https://iptv.prosto.tv/ch42/index.m3u8",
  "drama4ever": "https://iptv.prosto.tv/ch49/index.m3u8",
  "armytv": "https://api-tv.ipnet.ua/api/v1/manifest/2118742632.m3u8",
  "irt": "https://stream.irt.ua/memfs/8fac7cbb-3356-4a03-bb77-4439b727ebd2.m3u8",
  "rai": "https://stream.rai.ua/rai/stream.m3u8",
  "tva": "https://hls.cdn.ua/tva.ua_live/livestream/chunklist_.m3u8",
  "ntk": "https://stream.ntktv.ua/s/ntk/ntk.m3u8",
  "ch7": "https://cdn15.live-tv.cloud/ua_infinitas_tv/7tvod-abr/playlist.m3u8",
  "muzvar": "https://cdn15.live-tv.cloud/ua_infinitas_tv/muzvar-abr/playlist.m3u8",
  "nashemus": "https://cdn15.live-tv.cloud/ua_infinitas_tv/nashemus-abr/playlist.m3u8",
  "m1": "https://iptv.prosto.tv/ch122/index.m3u8",
  "music4ever": "https://iptv.prosto.tv/ch132/index.m3u8",
  "uamusic": "https://iptv.prosto.tv/ch133/index.m3u8",
  "nikikids": "https://iptv.prosto.tv/ch71/index.m3u8",
  "nikijunior": "https://iptv.prosto.tv/ch72/index.m3u8",
  "rybalka": "https://iptv.prosto.tv/ch88/index.m3u8",
  "uafashion": "https://iptv.prosto.tv/ch216/index.m3u8",
  "svarozhychy": "https://iptv.prosto.tv/ch168/index.m3u8",
  "equalympic": "https://iptv.prosto.tv/ch215/index.m3u8"
};
// Каналы, у которых источник не отдаёт CORS на сегментах — сегменты идут через /seg
export const SEG_PROXY_CHANNELS = ["armytv", "channel5", "irt", "kyiv24", "pershyi"];
export const SEG_PROXY_DOMAINS = ["ipnet.ua", "irt.ua"];
