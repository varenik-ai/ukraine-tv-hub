// Тести webhook-бота на фейкових апдейтах (без мережі й без токена): node tools/test_bot.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const CH = JSON.parse(readFileSync(new URL('../bot-channels.json', import.meta.url)));
// index.js імпортує JSON і core напряму (це робить wrangler); у Node підставляємо їх через globalThis
globalThis.__CH = CH;
const core = await import(new URL('../bot-worker/core.js', import.meta.url));
const workerCode = readFileSync(new URL('../bot-worker/index.js', import.meta.url), 'utf8')
  .replace("import CH from '../bot-channels.json';", 'const CH = globalThis.__CH;')
  .replace("import { makeCore } from './core.js';", 'const { makeCore } = globalThis.__core;');
globalThis.__core = core;
const mod = await import('data:text/javascript;base64,' + Buffer.from(workerCode).toString('base64'));

const calls = [];
let pinned = null;
globalThis.fetch = async (url, init) => {
  const method = String(url).split('/').pop(), body = JSON.parse(init.body);
  calls.push({ method, body });
  const ok = result => new Response(JSON.stringify({ ok: true, result }));
  if (method === 'getChat') return ok({ pinned_message: pinned });
  if (method === 'sendMessage') return ok({ message_id: 77 });
  if (method === 'createInvoiceLink') return ok('https://t.me/$inv123');
  return ok(true);
};
const env = { BOT_TOKEN: 't', WEBHOOK_SECRET: 's3cret', ADMIN_IDS: '111, 222' };
const upd = (text, from = {}, chatType = 'private') => ({ message: { text, chat: { id: 5, type: chatType }, from: { id: 111, first_name: 'Іван_*', language_code: 'ru', ...from } } });
const run = async u => { calls.length = 0; await mod.handleUpdate(env, u); return calls.map(c => c.method); };

// /start: мова з Telegram, імʼя екранується, кнопки web_app + браузер
assert.deepEqual(await run(upd('/start')), ['sendMessage']);
let b = calls[0].body;
assert.equal(b.chat_id, 5); assert.match(b.text, /Привет, Іван\\_\\\*!/); assert.match(b.text, /Всего каналов: 33/); assert.ok(!/HD/.test(b.text));
assert.ok(b.reply_markup.inline_keyboard[0][0].web_app.url.startsWith('https://'));
await run(upd('/start', { language_code: 'xx' })); assert.match(calls[0].body.text, /Привіт/);   // невідома мова -> uk
await run(upd('/start@UkraineTVHub_bot')); assert.equal(calls.length, 1);
// /post: чужий не може, у групі не працює
assert.deepEqual(await run(upd('/post', { id: 999 })), []);
assert.deepEqual(await run(upd('/post', {}, 'group')), []);
// /post від адміна: немає закріпленого -> send + pin
pinned = null;
assert.deepEqual(await run(upd('/post')), ['getChat', 'sendMessage', 'pinChatMessage', 'sendMessage']);
assert.match(calls[1].body.text, /33 канали наживо/); assert.equal(calls[2].body.message_id, 77);
// є закріплений пост бота -> редагується на місці, без нового
pinned = { message_id: 42, from: { is_bot: true } };
assert.deepEqual(await run(upd('/post')), ['getChat', 'editMessageText', 'sendMessage']);
assert.equal(calls[1].body.message_id, 42);
// закріплений чужий пост -> новий
pinned = { message_id: 43, from: { is_bot: false } };
assert.deepEqual(await run(upd('/post')), ['getChat', 'sendMessage', 'pinChatMessage', 'sendMessage']);


// ── «Подякувати» (Stars) ──
const pc = (amount, payload, cur = 'XTR') => ({ pre_checkout_query: { id: 'pq1', currency: cur, total_amount: amount, invoice_payload: payload, from: { id: 5 } } });
assert.deepEqual(await run(pc(50, 'donate_50')), ['answerPreCheckoutQuery']); assert.equal(calls[0].body.ok, true);
await run(pc(50, 'donate_50', 'USD')); assert.equal(calls[0].body.ok, false);          // не Stars
await run(pc(7, 'donate_7')); assert.equal(calls[0].body.ok, false);                    // сума не з переліку
await run(pc(25, 'donate_100')); assert.equal(calls[0].body.ok, false);                 // сума не збігається з payload
await run(pc(25, 'evil')); assert.equal(calls[0].body.ok, false);
await run({ message: { chat: { id: 9 }, from: { id: 7, language_code: 'en' }, successful_payment: { total_amount: 100, currency: 'XTR' } } });
assert.equal(calls[0].method, 'sendMessage'); assert.match(calls[0].body.text, /Thank you.*100/);
await run({ message: { chat: { id: 9 }, from: { id: 7, language_code: 'xx' }, successful_payment: { total_amount: 25, currency: 'XTR' } } }); assert.match(calls[0].body.text, /Дякуємо/);
// /fixpost: лише адмін, лише розмітка (editMessageReplyMarkup), не editMessageText
pinned = { message_id: 42, from: { is_bot: true } };
assert.deepEqual(await run(upd('/fixpost', { id: 999 })), []);
assert.deepEqual(await run(upd('/fixpost')), ['getChat', 'editMessageReplyMarkup', 'sendMessage']);
assert.equal(calls[1].body.message_id, 42);
assert.ok(calls[1].body.reply_markup.inline_keyboard.flat().some(b => /startapp=donate$/.test(b.url || '')));
pinned = null; assert.deepEqual(await run(upd('/fixpost')), ['getChat', 'sendMessage']); assert.match(calls[1].body.text, /немає закріпленого/);
// клавіатура /post містить кнопку подяки з deep link
pinned = null; await run(upd('/post')); assert.ok(calls.find(c => c.method === 'sendMessage' && c.body.chat_id === '@UkraineTVHub').body.reply_markup.inline_keyboard.flat().some(b => b.text.startsWith('⭐') && b.url.endsWith('?startapp=donate')));
// /invoice
const inv = (q, origin, method = 'GET') => { calls.length = 0; return mod.default.fetch(new Request('https://x/invoice' + q, { method, headers: origin ? { origin } : {} }), env, { waitUntil: p => p }); };
let r = await inv('?amount=25', 'https://varenik-ai.github.io'); assert.equal(r.status, 200); assert.equal((await r.json()).url, 'https://t.me/$inv123');
assert.equal(r.headers.get('access-control-allow-origin'), 'https://varenik-ai.github.io');
assert.equal(calls[0].method, 'createInvoiceLink'); assert.equal(calls[0].body.currency, 'XTR'); assert.equal(calls[0].body.payload, 'donate_25'); assert.equal(calls[0].body.prices[0].amount, 25);
for (const a of ['100', '250', '50']) assert.equal((await inv('?amount=' + a, 'https://ukraine-tv.uk')).status, 200);
assert.equal((await inv('?amount=7', 'https://ukraine-tv.uk')).status, 400);
assert.equal((await inv('', 'https://ukraine-tv.uk')).status, 400);
r = await inv('?amount=25', 'https://evil.example'); assert.equal(r.status, 403); assert.equal(r.headers.get('access-control-allow-origin'), null); assert.equal(calls.length, 0);
r = await inv('?amount=25', 'https://ukraine-tv.uk', 'OPTIONS'); assert.equal(r.status, 204);

// HTTP-шар
const hit = (path, method, headers, body) => mod.default.fetch(new Request('https://x' + path, { method, headers, body }), env, { waitUntil: p => p });
assert.equal((await hit('/health', 'GET')).status, 200);
assert.equal((await hit('/webhook', 'POST', {}, '{}')).status, 403);
assert.equal((await hit('/webhook', 'POST', { 'x-telegram-bot-api-secret-token': 'bad' }, '{}')).status, 403);
assert.equal((await hit('/webhook', 'GET', {})).status, 404);
assert.equal((await hit('/webhook', 'POST', { 'x-telegram-bot-api-secret-token': 's3cret' }, 'not json')).status, 400);
assert.equal((await hit('/webhook', 'POST', { 'x-telegram-bot-api-secret-token': 's3cret' }, '{}')).status, 200);
console.log('bot tests: all passed');
