// Локальная разработка: node tools/dev_server.mjs [путь-к-сайту]
// Сайт на :8765, воркер (src/index.js) на :8788; /proxy.json подменяется на локальный воркер.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import worker from '../src/index.js';

const SITE = path.resolve(process.argv[2] || '../ukraine-tv.uk');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.txt': 'text/plain', '.xml': 'application/xml' };
const env = { ALLOWED_ORIGINS: 'http://localhost:8765' };

http.createServer(async (req, res) => {
  const r = await worker.fetch(new Request('http://localhost:8788' + req.url, { headers: req.headers }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(8788);

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/proxy.json') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ urls: ['http://localhost:8788'] })); }
  let f = path.join(SITE, p); if (f.endsWith('/')) f = path.join(f, 'index.html');
  if (!f.startsWith(SITE) || !fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(8765, () => console.log('site http://localhost:8765  worker http://localhost:8788'));
