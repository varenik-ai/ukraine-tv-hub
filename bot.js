const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config();
const TOKEN = process.env.BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').filter(Boolean).map(Number);
if (!TOKEN) { console.error('BOT_TOKEN is not set (see .env.example)'); process.exit(1); }
const CHANNEL = '@UkraineTVHub';
const APP_URL = 'https://t.me/UkraineTVHub_bot/ukrainetv';
const WEB_URL = 'https://varenik-ai.github.io/ukraine-tv-hub/?v=2';

const bot = new TelegramBot(TOKEN, { polling: { interval: 2000, autoStart: true, params: { timeout: 10 } } });

const CH = require('./bot-channels.json'); // генерируется tools/gen_app_channels.py

const LANGS = ['uk', 'ru', 'en', 'bg', 'pl', 'de', 'fr', 'es'];
const CATS = { // название категории по языкам
  news:          { uk: 'Новини', ru: 'Новости', en: 'News', bg: 'Новини', pl: 'Wiadomości', de: 'Nachrichten', fr: 'Actualités', es: 'Noticias' },
  entertainment: { uk: 'Розваги та кіно', ru: 'Развлечения и кино', en: 'Entertainment', bg: 'Забавления и кино', pl: 'Rozrywka i kino', de: 'Unterhaltung', fr: 'Divertissement', es: 'Entretenimiento' },
  public:        { uk: 'Суспільне', ru: 'Общественные', en: 'Public', bg: 'Обществени', pl: 'Publiczne', de: 'Öffentlich', fr: 'Public', es: 'Públicos' },
  regional:      { uk: 'Регіональні', ru: 'Региональные', en: 'Regional', bg: 'Регионални', pl: 'Regionalne', de: 'Regional', fr: 'Régionales', es: 'Regionales' },
  music:         { uk: 'Музика', ru: 'Музыка', en: 'Music', bg: 'Музика', pl: 'Muzyka', de: 'Musik', fr: 'Musique', es: 'Música' },
  kids:          { uk: 'Дитячі', ru: 'Детские', en: 'Kids', bg: 'Детски', pl: 'Dla dzieci', de: 'Kinder', fr: 'Enfants', es: 'Infantil' },
  thematic:      { uk: 'Тематичні', ru: 'Тематические', en: 'Themed', bg: 'Тематични', pl: 'Tematyczne', de: 'Thematisch', fr: 'Thématiques', es: 'Temáticos' },
};
const TXT = {
  uk: { hi: 'Привіт', title: 'Україна ТВ — наживо в Telegram', sub: 'Дивись українське телебачення онлайн — безкоштовно, без VPN, без реєстрації, 24/7.', total: n => `Усього каналів: ${n}`, foot: '✅ iOS · Android · Desktop · 8 мов', open: '📺 Відкрити Ukraine TV Live', browser: '🌐 Відкрити у браузері', pick: '👇 Натисніть кнопку та оберіть канал:' },
  ru: { hi: 'Привет', title: 'Украина ТВ — в прямом эфире в Telegram', sub: 'Смотри украинское телевидение онлайн — бесплатно, без VPN, без регистрации, 24/7.', total: n => `Всего каналов: ${n}`, foot: '✅ iOS · Android · Desktop · 8 языков', open: '📺 Открыть Ukraine TV Live', browser: '🌐 Открыть в браузере', pick: '👇 Нажмите кнопку и выберите канал:' },
  en: { hi: 'Hi', title: 'UKRAINE·TV — live on Telegram', sub: 'Watch Ukrainian TV online — free, no VPN, no sign-up, 24/7.', total: n => `Channels: ${n}`, foot: '✅ iOS · Android · Desktop · 8 languages', open: '📺 Open Ukraine TV Live', browser: '🌐 Open in browser', pick: '👇 Tap the button and pick a channel:' },
  bg: { hi: 'Здравей', title: 'UKRAINE·TV — на живо в Telegram', sub: 'Гледай украинска телевизия онлайн — безплатно, без VPN, без регистрация, 24/7.', total: n => `Канали: ${n}`, foot: '✅ iOS · Android · Desktop · 8 езика', open: '📺 Отвори Ukraine TV Live', browser: '🌐 Отвори в браузър', pick: '👇 Натисни бутона и избери канал:' },
  pl: { hi: 'Cześć', title: 'UKRAINE·TV — na żywo w Telegramie', sub: 'Oglądaj ukraińską telewizję online — za darmo, bez VPN, bez rejestracji, 24/7.', total: n => `Kanały: ${n}`, foot: '✅ iOS · Android · Desktop · 8 języków', open: '📺 Otwórz Ukraine TV Live', browser: '🌐 Otwórz w przeglądarce', pick: '👇 Naciśnij przycisk i wybierz kanał:' },
  de: { hi: 'Hallo', title: 'UKRAINE·TV — live auf Telegram', sub: 'Ukrainisches Fernsehen online — kostenlos, ohne VPN, ohne Anmeldung, 24/7.', total: n => `Sender: ${n}`, foot: '✅ iOS · Android · Desktop · 8 Sprachen', open: '📺 Ukraine TV Live öffnen', browser: '🌐 Im Browser öffnen', pick: '👇 Taste drücken und Sender wählen:' },
  fr: { hi: 'Salut', title: 'UKRAINE·TV — en direct sur Telegram', sub: 'Regardez la télévision ukrainienne en ligne — gratuit, sans VPN, sans inscription, 24/7.', total: n => `Chaînes : ${n}`, foot: '✅ iOS · Android · Desktop · 8 langues', open: '📺 Ouvrir Ukraine TV Live', browser: '🌐 Ouvrir dans le navigateur', pick: '👇 Appuyez sur le bouton et choisissez une chaîne :' },
  es: { hi: 'Hola', title: 'UKRAINE·TV — en vivo en Telegram', sub: 'Mira la televisión ucraniana en línea — gratis, sin VPN, sin registro, 24/7.', total: n => `Canales: ${n}`, foot: '✅ iOS · Android · Desktop · 8 idiomas', open: '📺 Abrir Ukraine TV Live', browser: '🌐 Abrir en navegador', pick: '👇 Pulsa el botón y elige un canal:' },
};
const chName = (c, lang) => c[lang] || c.en || c.uk;
const listLines = (lang) => CH.groups.map(g => `${g.emoji} *${CATS[g.cat][lang]}:* ${g.channels.map(c => chName(c, lang)).join(', ')}`).join('\n');
// имя пользователя вставляется в Markdown — экранируем служебные символы
const mdEsc = s => String(s || '').replace(/[_*`\[\]]/g, '\\$&');

const WEB_URL_V = WEB_URL;
function greeting(lang, name) {
  const t = TXT[lang] || TXT.uk, l = TXT[lang] ? lang : 'uk';
  return `🇺🇦 ${t.hi}${name ? ', ' + mdEsc(name) : ''}!\n\n📺 *${t.title}*\n\n${t.sub}\n\n${listLines(l)}\n\n${t.total(CH.n)}\n${t.foot}`;
}

bot.onText(/\/start/, async (msg) => {
  const lang = (msg.from.language_code || 'uk').split('-')[0];
  const t = TXT[lang] || TXT.uk;
  try {
    await bot.sendMessage(msg.chat.id, greeting(lang, msg.from.first_name), {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: t.open, web_app: { url: WEB_URL_V } }], [{ text: t.browser, url: WEB_URL_V }]] },
    });
  } catch (e) {
    console.error('start failed:', e.message);
  }
});

// /post — публікує і закріплює пост у каналі (тільки для ADMIN_IDS).
// Якщо пост уже опубліковано (id у .channel-post.json) — оновлює його на місці, без дублів.
const fs = require('fs');
const POST_FILE = __dirname + '/.channel-post.json';
const SITE_URL = 'https://ukraine-tv.uk/';
function channelPost() {
  const t = TXT.uk;
  return `🇺🇦 *Україна ТВ — ${CH.n} ${CH.n % 10 === 1 && CH.n % 100 !== 11 ? 'канал' : [2, 3, 4].includes(CH.n % 10) && ![12, 13, 14].includes(CH.n % 100) ? 'канали' : 'каналів'} наживо* 🔴\n\nДивіться українські телеканали прямо в Telegram — *безкоштовно, без VPN, без реєстрації, 24/7.*\n\n━━━━━━━━━━━━━━━━━━━━\n${listLines('uk')}\n━━━━━━━━━━━━━━━━━━━━\n\n${t.foot}\n🌐 Те саме на сайті: ukraine-tv.uk\n\n${t.pick}`;
}
const postKeyboard = { inline_keyboard: [[{ text: TXT.uk.open, url: APP_URL }], [{ text: '🌐 ukraine-tv.uk', url: SITE_URL }]] };
bot.onText(/^\/post$/, async (msg) => {
  if (!ADMIN_IDS.includes(msg.from.id)) return;
  const opts = { parse_mode: 'Markdown', reply_markup: postKeyboard, disable_web_page_preview: true };
  let saved = null;
  try { saved = JSON.parse(fs.readFileSync(POST_FILE, 'utf8')); } catch (e) {}
  try {
    if (saved && saved.id) {
      try {
        await bot.editMessageText(channelPost(), { chat_id: CHANNEL, message_id: saved.id, ...opts });
        return bot.sendMessage(msg.chat.id, '✅ Закріплений пост оновлено.');
      } catch (e) {
        if (/message is not modified/i.test(e.message)) return bot.sendMessage(msg.chat.id, 'ℹ️ Пост уже актуальний.');
        // пост видалено — публікуємо заново
      }
    }
    const post = await bot.sendMessage(CHANNEL, channelPost(), opts);
    fs.writeFileSync(POST_FILE, JSON.stringify({ id: post.message_id }));
    await bot.pinChatMessage(CHANNEL, post.message_id);
    bot.sendMessage(msg.chat.id, '✅ Пост опубліковано і закріплено!');
  } catch (e) {
    bot.sendMessage(msg.chat.id, '❌ Помилка: ' + e.message);
  }
});

console.log('✅ Ukraine TV Hub бот запущено!');
