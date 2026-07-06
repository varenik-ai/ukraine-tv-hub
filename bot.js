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

📺 *УКРАЇ·НА·ТВ — 18 каналів наживо в Telegram*

Дивись українське телебачення онлайн — безкоштовно, без VPN, без реєстрації, 24/7.

📡 *Новини:* Перший, Інтер, Україна, Україна 24, ICTV, СТБ, Новий, Прямий
🎬 *Розваги:* 2+2, Тоніс, К1
📰 *Новини:* Еспресо, 5 канал, ZIK
👶 *Дитячі:* ПлюсПлюс, Піглет
🎵 *Музика:* М1, М2

✅ HD · iOS · Android · Desktop · 8 мов`,

    ru: `🇺🇦 Привет, ${name}!

📺 *УКРАЇ·НА·ТВ — 18 каналов прямого эфира в Telegram*

Смотри украинское телевидение онлайн — бесплатно, без VPN, без регистрации, 24/7.

📡 *Новости:* Первый, Интер, Украина, Украина 24, ICTV, СТБ, Новый, Прямой
🎬 *Развлечения:* 2+2, Тонис, К1
📰 *Новости:* Эспресо, 5 канал, ZIK
👶 *Детские:* ПлюсПлюс, Піглет
🎵 *Музыка:* М1, М2

✅ HD · iOS · Android · Desktop · 8 языков`,

    en: `🇺🇦 Hello, ${name}!

📺 *UKRAINE·TV — 18 channels live on Telegram*

Watch Ukrainian television online — free, no VPN, no registration, 24/7.

📡 *News:* Pershyi, Inter, Ukraine, Ukraine 24, ICTV, STB, Novy, Priamyi
🎬 *Entertainment:* 2+2, Tonis, K1
📰 *News:* Espreso, Channel 5, ZIK
👶 *Kids:* PlusPlus, Piglet
🎵 *Music:* M1, M2

✅ HD · iOS · Android · Desktop · 8 languages`,

    bg: `🇺🇦 Здравейте, ${name}!

📺 *УКРАЇ·НА·ТВ — 18 украински канала на живо в Telegram*

Гледайте украинска телевизия — безплатно, без VPN, без регистрация, 24/7.

📡 *Новини:* Перший, Інтер, Україна 24, ICTV, СТБ
🎬 *Развлечения:* 2+2, Тоніс, К1
📰 *Новини:* Еспресо, 5 канал
🎵 *Музика:* М1, М2

✅ HD · iOS · Android · Desktop`,

    pl: `🇺🇦 Cześć, ${name}!

📺 *UKRAINE·TV — 18 kanałów na żywo w Telegram*

Oglądaj ukraińską telewizję — bezpłatnie, bez VPN, bez rejestracji, 24/7.

📡 *Wiadomości:* Pershyi, Inter, Ukraine 24, ICTV, STB
🎬 *Rozrywka:* 2+2, Tonis, K1
📰 *Wiadomości:* Espreso, Kanał 5
🎵 *Muzyka:* M1, M2

✅ HD · iOS · Android · Desktop · 8 języków`,

    de: `🇺🇦 Hallo, ${name}!

📺 *UKRAINE·TV — 18 Sender live auf Telegram*

Ukrainisches Fernsehen online — kostenlos, kein VPN, keine Anmeldung, 24/7.

📡 *Nachrichten:* Pershyi, Inter, Ukraine 24, ICTV, STB
🎬 *Unterhaltung:* 2+2, Tonis, K1
📰 *Nachrichten:* Espreso, Kanal 5
🎵 *Musik:* M1, M2

✅ HD · iOS · Android · Desktop`,

    fr: `🇺🇦 Bonjour, ${name}!

📺 *UKRAINE·TV — 18 chaînes en direct sur Telegram*

Télévision ukrainienne — gratuit, sans VPN, sans inscription, 24/7.

📡 *Actualités:* Pershyi, Inter, Ukraine 24, ICTV, STB
🎬 *Divertissement:* 2+2, Tonis, K1
📰 *Actualités:* Espreso, Chaîne 5
🎵 *Musique:* M1, M2

✅ HD · iOS · Android · Desktop`,

    es: `🇺🇦 ¡Hola, ${name}!

📺 *UKRAINE·TV — 18 canales en vivo en Telegram*

Televisión ucraniana — gratis, sin VPN, sin registro, 24/7.

📡 *Noticias:* Pershyi, Inter, Ukraine 24, ICTV, STB
🎬 *Entretenimiento:* 2+2, Tonis, K1
📰 *Noticias:* Espreso, Canal 5
🎵 *Música:* M1, M2

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
`🇺🇦 *УКРАЇ·НА·ТВ — 18 КАНАЛІВ НАЖИВО* 🔴

Дивіться *провідні українські телеканали* прямо в Telegram — *безкоштовно, без VPN, без реєстрації, 24/7.*

━━━━━━━━━━━━━━━━━━━━
📡 *НОВИНИ ТА ЗАГАЛЬНІ*
▪️ Перший канал · Інтер · Україна · Україна 24
▪️ ICTV · СТБ · Новий канал · Прямий

🎬 *РОЗВАГИ ТА КІНО*
▪️ 2+2 · Тоніс · К1

📰 *НОВИНИ*
▪️ Еспресо · 5 Канал · ZIK

👶 *ДИТЯЧІ*
▪️ ПлюсПлюс · Піглет

🎵 *МУЗИКА*
▪️ М1 · М2
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
