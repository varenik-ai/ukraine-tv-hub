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

// HTTP-шар
const hit = (path, method, headers, body) => mod.default.fetch(new Request('https://x' + path, { method, headers, body }), env, { waitUntil: p => p });
assert.equal((await hit('/health', 'GET')).status, 200);
assert.equal((await hit('/webhook', 'POST', {}, '{}')).status, 403);
assert.equal((await hit('/webhook', 'POST', { 'x-telegram-bot-api-secret-token': 'bad' }, '{}')).status, 403);
assert.equal((await hit('/webhook', 'GET', {})).status, 404);
assert.equal((await hit('/webhook', 'POST', { 'x-telegram-bot-api-secret-token': 's3cret' }, 'not json')).status, 400);
assert.equal((await hit('/webhook', 'POST', { 'x-telegram-bot-api-secret-token': 's3cret' }, '{}')).status, 200);
console.log('bot tests: all passed');
