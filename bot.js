const TelegramBot = require('node-telegram-bot-api');

const TOKEN   = '8812314888:AAHQUForF-5ZCYknsvPWus9chVcK4mHJ9Zc';
const CHANNEL = '@UkraineTVHub';
const APP_URL = 'https://t.me/UkraineTVHub_bot/ukrainetv';
const WEB_URL = 'https://varenik-ai.github.io/ukraine-tv-hub/?v=1';

const bot = new TelegramBot(TOKEN, { polling: { interval: 2000, autoStart: true, params: { timeout: 10 } } });

bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || '';
  const lang = (msg.from.language_code || 'uk').split('-')[0];

  const greetings = {
    uk: `🇺🇦 Привіт, ${name}!

📺 *УКРАЇ·НА·ТВ — 19 каналів наживо в Telegram*

Дивись українське телебачення онлайн — безкоштовно, без VPN, без реєстрації, 24/7.

📡 *Новини:* Перший, 5 Канал, Еспресо, Україна 24, Київ 24, 24 Канал
🎬 *Розваги:* НТН, 1+1 Міжнар., Квартал ТВ, Інтер+
📺 *Суспільне:* Суспільне Київ, IRT, RAI, TVA
🎵 *Музика:* Мюзвар

✅ HD · iOS · Android · Desktop · 8 мов`,

    ru: `🇺🇦 Привет, ${name}!

📺 *УКРАЇ·НА·ТВ — 19 каналов прямого эфира в Telegram*

Смотри украинское телевидение онлайн — бесплатно, без VPN, без регистрации, 24/7.

📡 *Новости:* Первый, 5 Канал, Эспресо, Украина 24, Киев 24, 24 Канал
🎬 *Развлечения:* НТН, 1+1 Межд., Квартал ТВ, Интер+
📺 *Общественное:* Суспільне, IRT, RAI, TVA
🎵 *Музыка:* Мюзвар

✅ HD · iOS · Android · Desktop · 8 языков`,

    en: `🇺🇦 Hello, ${name}!

📺 *UKRAINE·TV — 19 channels live on Telegram*

Watch Ukrainian television online — free, no VPN, no registration, 24/7.

📡 *News:* Pershyi, Channel 5, Espreso, Ukraine 24, Kyiv 24, 24 Channel
🎬 *Entertainment:* NTN, 1+1 Intl., Kvartal TV, Inter+
📺 *Public:* Suspilne Kyiv, IRT, RAI, TVA
🎵 *Music:* Muzvar

✅ HD · iOS · Android · Desktop · 8 languages`,

    bg: `🇺🇦 Здравейте, ${name}!

📺 *УКРАЇ·НА·ТВ — 15 украински канала на живо в Telegram*

Гледайте украинска телевизия — безплатно, без VPN, без регистрация, 24/7.

📡 *Новини:* Перший, 5 Канал, Еспресо, Україна 24, Київ 24
🎬 *Развлечения:* НТН, 1+1, Квартал ТВ, Інтер+
🎵 *Музика:* Мюзвар

✅ HD · iOS · Android · Desktop`,

    pl: `🇺🇦 Cześć, ${name}!

📺 *UKRAINE·TV — 15 kanałów na żywo w Telegram*

Oglądaj ukraińską telewizję — bezpłatnie, bez VPN, bez rejestracji, 24/7.

📡 *Wiadomości:* Pershyi, Kanał 5, Espreso, Ukraine 24, Kyiv 24
🎬 *Rozrywka:* NTN, 1+1 Intl., Kvartal TV, Inter+
🎵 *Muzyka:* Muzvar

✅ HD · iOS · Android · Desktop · 8 języków`,

    de: `🇺🇦 Hallo, ${name}!

📺 *UKRAINE·TV — 15 Sender live auf Telegram*

Ukrainisches Fernsehen online — kostenlos, kein VPN, keine Anmeldung, 24/7.

📡 *Nachrichten:* Pershyi, Kanal 5, Espreso, Ukraine 24, Kyiv 24
🎬 *Unterhaltung:* NTN, 1+1 Intl., Kvartal TV, Inter+
🎵 *Musik:* Muzvar

✅ HD · iOS · Android · Desktop`,

    fr: `🇺🇦 Bonjour, ${name}!

📺 *UKRAINE·TV — 15 chaînes en direct sur Telegram*

Télévision ukrainienne — gratuit, sans VPN, sans inscription, 24/7.

📡 *Actualités:* Pershyi, Chaîne 5, Espreso, Ukraine 24, Kyiv 24
🎬 *Divertissement:* NTN, 1+1 Intl., Kvartal TV, Inter+
🎵 *Musique:* Muzvar

✅ HD · iOS · Android · Desktop`,

    es: `🇺🇦 ¡Hola, ${name}!

📺 *UKRAINE·TV — 15 canales en vivo en Telegram*

Televisión ucraniana — gratis, sin VPN, sin registro, 24/7.

📡 *Noticias:* Pershyi, Canal 5, Espreso, Ukraine 24, Kyiv 24
🎬 *Entretenimiento:* NTN, 1+1 Intl., Kvartal TV, Inter+
🎵 *Música:* Muzvar

✅ HD · iOS · Android · Desktop`,
  };

  const btnWatch = {
    uk: '📺 Відкрити Ukraine TV Live',
    ru: '📺 Открыть Ukraine TV Live',
    en: '📺 Open Ukraine TV Live',
    bg: '📺 Отвори Ukraine TV Live',
    pl: '📺 Otwórz Ukraine TV Live',
    de: '📺 Ukraine TV Live öffnen',
    fr: '📺 Ouvrir Ukraine TV Live',
    es: '📺 Abrir Ukraine TV Live',
  };

  const btnBrowser = {
    uk: '🌐 Відкрити у браузері',
    ru: '🌐 Открыть в браузере',
    en: '🌐 Open in browser',
    bg: '🌐 Отвори в браузър',
    pl: '🌐 Otwórz w przeglądarce',
    de: '🌐 Im Browser öffnen',
    fr: '🌐 Ouvrir dans le navigateur',
    es: '🌐 Abrir en navegador',
  };

  bot.sendMessage(msg.chat.id, greetings[lang] || greetings.uk, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: btnWatch[lang]   || btnWatch.uk,   web_app: { url: WEB_URL } }],
        [{ text: btnBrowser[lang] || btnBrowser.uk, url: WEB_URL }],
      ]
    }
  });
});

// /post — публікує і закріплює пост у каналі
bot.onText(/^\/post$/, async (msg) => {
  try {
    const post = await bot.sendMessage(CHANNEL,
`🇺🇦 *УКРАЇ·НА·ТВ — 15 КАНАЛІВ НАЖИВО* 🔴

Дивіться *українські телеканали* прямо в Telegram — *безкоштовно, без VPN, без реєстрації, 24/7.*

━━━━━━━━━━━━━━━━━━━━
📡 *НОВИНИ ТА ЗАГАЛЬНІ*
▪️ Перший · 5 Канал · Еспресо ТВ · Рада
▪️ Україна 24 · Київ 24 · 24 Канал

🎬 *РОЗВАГИ ТА КІНО*
▪️ НТН · 1+1 Міжнар. · Квартал ТВ · Інтер+

📺 *СУСПІЛЬНЕ ТА ГРОМАДСЬКІ*
▪️ Суспільне Київ · IRT · Армія ТВ

🏙️ *РЕГІОНАЛЬНІ*
▪️ RAI · TVA · NTK TV · Дніпро TV

🎵 *МУЗИКА*
▪️ Мюзвар
━━━━━━━━━━━━━━━━━━━━

✅ HD · iOS · Android · Desktop · 8 мов

👇 *Натисніть кнопку та оберіть канал:*`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '📺 Відкрити Ukraine TV Live', url: APP_URL }
          ]]
        }
      }
    );
    await bot.pinChatMessage(CHANNEL, post.message_id);
    bot.sendMessage(msg.chat.id, '✅ Пост опубліковано і закріплено!');
  } catch(e) {
    bot.sendMessage(msg.chat.id, '❌ Помилка: ' + e.message);
  }
});

console.log('✅ Ukraine TV Hub бот запущено!');
