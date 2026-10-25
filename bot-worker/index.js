// Telegram-бот Україна ТВ як Cloudflare Worker (webhook): працює автономно, без увімкненого комп'ютера.
// Секрети (wrangler secret): BOT_TOKEN, WEBHOOK_SECRET, ADMIN_IDS (через кому). Налаштування — setup-bot.sh.
import CH from '../bot-channels.json';
import { makeCore } from './core.js';

const CHANNEL = '@UkraineTVHub';
const core = makeCore(CH);

async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!d.ok) throw new Error(d.description || ('telegram ' + r.status));
  return d.result;
}

const isAdmin = (env, id) => String(env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean).includes(String(id));

// /post: оновлює закріплений пост каналу на місці, інакше публікує новий і закріплює
export async function publishPost(env, reply) {
  const body = { parse_mode: 'Markdown', reply_markup: core.postKeyboard, disable_web_page_preview: true };
  try {
    const chat = await tg(env, 'getChat', { chat_id: CHANNEL });
    const pinned = chat.pinned_message;
    if (pinned && pinned.from && pinned.from.is_bot) {
      try {
        await tg(env, 'editMessageText', { chat_id: CHANNEL, message_id: pinned.message_id, text: core.channelPost(), ...body });
        return reply('✅ Закріплений пост оновлено.');
      } catch (e) {
        if (/not modified/i.test(e.message)) return reply('ℹ️ Пост уже актуальний.');
      }
    }
    const post = await tg(env, 'sendMessage', { chat_id: CHANNEL, text: core.channelPost(), ...body });
    await tg(env, 'pinChatMessage', { chat_id: CHANNEL, message_id: post.message_id });
    return reply('✅ Пост опубліковано і закріплено!');
  } catch (e) {
    return reply('❌ Помилка: ' + e.message);
  }
}

// /fixpost: лише додає кнопки під закріпленим постом (текст не змінюється, сповіщень немає)
export async function fixPost(env, reply) {
  try {
    const chat = await tg(env, 'getChat', { chat_id: CHANNEL });
    const pinned = chat.pinned_message;
    if (!pinned) return reply('❌ У каналі немає закріпленого поста.');
    await tg(env, 'editMessageReplyMarkup', { chat_id: CHANNEL, message_id: pinned.message_id, reply_markup: core.postKeyboard });
    return reply('✅ Кнопки під закріпленим постом оновлено.');
  } catch (e) {
    if (/not modified/i.test(e.message)) return reply('ℹ️ Кнопки вже актуальні.');
    return reply('❌ Помилка: ' + e.message + ' (бот може редагувати лише власні повідомлення)');
  }
}

export async function handleUpdate(env, update) {
  // оплата Stars: підтвердження має піти протягом 10 секунд
  const pq = update && update.pre_checkout_query;
  if (pq) {
    const ok = pq.currency === 'XTR' && /^donate_\d+$/.test(pq.invoice_payload || '') && core.DONATE_AMOUNTS.includes(Number(pq.invoice_payload.slice(7))) && pq.total_amount === Number(pq.invoice_payload.slice(7));
    return tg(env, 'answerPreCheckoutQuery', ok ? { pre_checkout_query_id: pq.id, ok: true } : { pre_checkout_query_id: pq.id, ok: false, error_message: 'Invalid payment' });
  }
  const msg = update && update.message;
  if (!msg || !msg.from) return;
  const send = (text, extra) => tg(env, 'sendMessage', { chat_id: msg.chat.id, text, ...extra });
  if (msg.successful_payment) {
    const lang = (msg.from.language_code || 'uk').split('-')[0];
    const sp = msg.successful_payment;
    console.log('donate', sp.total_amount, sp.currency, msg.from.id);
    return send(core.thanksText(lang, sp.total_amount));
  }
  if (!msg.text) return;
  const cmd = msg.text.trim().split(/[\s@]/)[0];
  if (cmd === '/start') {
    const lang = (msg.from.language_code || 'uk').split('-')[0];
    await send(core.greeting(lang, msg.from.first_name), { parse_mode: 'Markdown', reply_markup: core.startKeyboard(lang) });
  } else if (cmd === '/post' && msg.chat.type === 'private' && isAdmin(env, msg.from.id)) {
    await publishPost(env, text => send(text));
  } else if (cmd === '/fixpost' && msg.chat.type === 'private' && isAdmin(env, msg.from.id)) {
    await fixPost(env, text => send(text));
  }
}

// GET /invoice?amount=N — посилання на рахунок у Stars (лише з дозволених Origin)
async function invoiceRoute(request, env) {
  const origin = request.headers.get('origin') || '';
  const allowed = core.DONATE_ORIGINS.includes(origin);
  const headers = { 'content-type': 'application/json', 'cache-control': 'no-store', ...(allowed ? { 'access-control-allow-origin': origin, vary: 'Origin' } : { vary: 'Origin' }) };
  const json = (obj, status) => new Response(JSON.stringify(obj), { status, headers });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'access-control-allow-methods': 'GET, OPTIONS', 'access-control-allow-headers': 'content-type' } });
  if (origin && !allowed) return json({ error: 'forbidden origin' }, 403);
  const amount = Number(new URL(request.url).searchParams.get('amount'));
  if (!core.DONATE_AMOUNTS.includes(amount)) return json({ error: 'bad amount' }, 400);
  try {
    const url = await tg(env, 'createInvoiceLink', core.invoice(amount));
    return json({ url }, 200);
  } catch (e) {
    return json({ error: 'invoice failed' }, 502);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response('ok');
    if (url.pathname === '/invoice') return invoiceRoute(request, env);
    if (url.pathname !== '/webhook' || request.method !== 'POST') return new Response('not found', { status: 404 });
    if (!env.WEBHOOK_SECRET || request.headers.get('x-telegram-bot-api-secret-token') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
    let update;
    try { update = await request.json(); } catch (e) { return new Response('bad request', { status: 400 }); }
    ctx.waitUntil(handleUpdate(env, update).catch(e => console.error('update failed:', e.message)));
    return new Response('ok');
  },
};
