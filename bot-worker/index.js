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

export async function handleUpdate(env, update) {
  const msg = update && update.message;
  if (!msg || !msg.text || !msg.from) return;
  const send = (text, extra) => tg(env, 'sendMessage', { chat_id: msg.chat.id, text, ...extra });
  const cmd = msg.text.trim().split(/[\s@]/)[0];
  if (cmd === '/start') {
    const lang = (msg.from.language_code || 'uk').split('-')[0];
    await send(core.greeting(lang, msg.from.first_name), { parse_mode: 'Markdown', reply_markup: core.startKeyboard(lang) });
  } else if (cmd === '/post' && msg.chat.type === 'private' && isAdmin(env, msg.from.id)) {
    await publishPost(env, text => send(text));
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response('ok');
    if (url.pathname !== '/webhook' || request.method !== 'POST') return new Response('not found', { status: 404 });
    if (!env.WEBHOOK_SECRET || request.headers.get('x-telegram-bot-api-secret-token') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
    let update;
    try { update = await request.json(); } catch (e) { return new Response('bad request', { status: 400 }); }
    ctx.waitUntil(handleUpdate(env, update).catch(e => console.error('update failed:', e.message)));
    return new Response('ok');
  },
};
