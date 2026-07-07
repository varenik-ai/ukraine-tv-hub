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

📺 *Україна ТВ — 36 каналів наживо в Telegram*

Дивись українське телебачення онлайн — безкоштовно, без VPN, без реєстрації, 24/7.

📡 *Новини:* Перший, 5 Канал, Еспресо, Україна 24, Київ 24, 24 Канал, Рада
🎬 *Розваги:* НТН, 1+1 Міжнар., Квартал ТВ, Інтер+, Мега, К2, 4ever Cinema, 4ever Drama
📺 *Суспільне:* Суспільне Київ, IRT, Армія ТВ
🏙️ *Регіональні:* RAI, TVA, NTK, Дніпро, 7 Канал, Рівне 1, ITV
🎵 *Музика:* Мюзвар, NASHE Music, М1, 4ever Music, UA Music
👶 *Дитячі:* Niki Kids, Niki Junior
🎯 *Тематичні:* Rybalka TV, UA Fashion TV, Svarozhychy, Equalympic

✅ HD · iOS · Android · Desktop · 8 мов`,

    ru: `🇺🇦 Привет, ${name}!

📺 *Україна ТВ — 36 каналов прямого эфира в Telegram*

Смотри украинское телевидение онлайн — бесплатно, без VPN, без регистрации, 24/7.

📡 *Новости:* Первый, 5 Канал, Эспресо, Украина 24, Киев 24, 24 Канал, Рада
🎬 *Развлечения:* НТН, 1+1 Межд., Квартал ТВ, Интер+, Мега, К2, 4ever Cinema, 4ever Drama
📺 *Общественное:* Суспільне, IRT, Армия ТВ
🏙️ *Региональные:* RAI, TVA, NTK, Днепр, 7 Канал, Ровно 1, ITV
🎵 *Музыка:* Мюзвар, NASHE Music, М1, 4ever Music, UA Music
👶 *Детские:* Niki Kids, Niki Junior
🎯 *Тематические:* Rybalka TV, UA Fashion TV, Svarozhychy, Equalympic

✅ HD · iOS · Android · Desktop · 8 языков`,

    en: `🇺🇦 Hello, ${name}!

📺 *UKRAINE·TV — 36 channels live on Telegram*

Watch Ukrainian television online — free, no VPN, no registration, 24/7.

📡 *News:* Pershyi, Channel 5, Espreso, Ukraine 24, Kyiv 24, 24 Channel, Rada
🎬 *Entertainment:* NTN, 1+1 Intl., Kvartal TV, Inter+, Mega, K2, 4ever Cinema, 4ever Drama
📺 *Public:* Suspilne Kyiv, IRT, Army TV
🏙️ *Regional:* RAI, TVA, NTK, Dnipro, Ch.7, Rivne 1, ITV
🎵 *Music:* Muzvar, NASHE Music, M1, 4ever Music, UA Music
👶 *Kids:* Niki Kids, Niki Junior
🎯 *Niche:* Rybalka TV, UA Fashion TV, Svarozhychy, Equalympic

✅ HD · iOS · Android · Desktop · 8 languages`,

    bg: `🇺🇦 Здравейте, ${name}!

📺 *Україна ТВ — 36 украински канала на живо в Telegram*

Гледайте украинска телевизия — безплатно, без VPN, без регистрация, 24/7.

📡 *Новини:* Перший, 5 Канал, Еспресо, Україна 24, Київ 24, 24 Канал, Рада
🎬 *Развлечения:* НТН, 1+1, Квартал ТВ, Інтер+, Мега, К2, 4ever Cinema, 4ever Drama
📺 *Обществено:* Суспільне, IRT, Армия ТВ
🏙️ *Регионални:* RAI, TVA, NTK, Дніпро, 7 Канал, Рівне 1, ITV
🎵 *Музика:* Мюзвар, NASHE Music, М1, 4ever Music, UA Music
👶 *Детски:* Niki Kids, Niki Junior
🎯 *Тематични:* Rybalka TV, UA Fashion TV, Svarozhychy, Equalympic

✅ HD · iOS · Android · Desktop · 8 езика`,

    pl: `🇺🇦 Cześć, ${name}!

📺 *UKRAINE·TV — 36 kanałów na żywo w Telegram*

Oglądaj ukraińską telewizję — bezpłatnie, bez VPN, bez rejestracji, 24/7.

📡 *Wiadomości:* Pershyi, Kanał 5, Espreso, Ukraine 24, Kyiv 24, 24 Kanał, Rada
🎬 *Rozrywka:* NTN, 1+1 Intl., Kvartal TV, Inter+, Mega, K2, 4ever Cinema, 4ever Drama
📺 *Publiczne:* Suspilne, IRT, Army TV
🏙️ *Regionalne:* RAI, TVA, NTK, Dniepr, Kanał 7, Równe 1, ITV
🎵 *Muzyka:* Muzvar, NASHE Music, M1, 4ever Music, UA Music
👶 *Dla dzieci:* Niki Kids, Niki Junior
🎯 *Tematyczne:* Rybalka TV, UA Fashion TV, Svarozhychy, Equalympic

✅ HD · iOS · Android · Desktop · 8 języków`,

    de: `🇺🇦 Hallo, ${name}!

📺 *UKRAINE·TV — 36 Sender live auf Telegram*

Ukrainisches Fernsehen online — kostenlos, kein VPN, keine Anmeldung, 24/7.

📡 *Nachrichten:* Pershyi, Kanal 5, Espreso, Ukraine 24, Kyiv 24, 24 Kanal, Rada
🎬 *Unterhaltung:* NTN, 1+1 Intl., Kvartal TV, Inter+, Mega, K2, 4ever Cinema, 4ever Drama
📺 *Öffentlich:* Suspilne, IRT, Army TV
🏙️ *Regional:* RAI, TVA, NTK, Dnipro, Kanal 7, Rivne 1, ITV
🎵 *Musik:* Muzvar, NASHE Music, M1, 4ever Music, UA Music
👶 *Kinder:* Niki Kids, Niki Junior
🎯 *Thematisch:* Rybalka TV, UA Fashion TV, Svarozhychy, Equalympic

✅ HD · iOS · Android · Desktop · 8 Sprachen`,

    fr: `🇺🇦 Bonjour, ${name}!

📺 *UKRAINE·TV — 36 chaînes en direct sur Telegram*

Télévision ukrainienne — gratuit, sans VPN, sans inscription, 24/7.

📡 *Actualités:* Pershyi, Chaîne 5, Espreso, Ukraine 24, Kyiv 24, 24 Kanal, Rada
🎬 *Divertissement:* NTN, 1+1 Intl., Kvartal TV, Inter+, Mega, K2, 4ever Cinema, 4ever Drama
📺 *Public:* Suspilne, IRT, Army TV
🏙️ *Régional:* RAI, TVA, NTK, Dnipro, Chaîne 7, Rivne 1, ITV
🎵 *Musique:* Muzvar, NASHE Music, M1, 4ever Music, UA Music
👶 *Enfants:* Niki Kids, Niki Junior
🎯 *Thématiques:* Rybalka TV, UA Fashion TV, Svarozhychy, Equalympic

✅ HD · iOS · Android · Desktop · 8 langues`,

    es: `🇺🇦 ¡Hola, ${name}!

📺 *UKRAINE·TV — 36 canales en vivo en Telegram*

Televisión ucraniana — gratis, sin VPN, sin registro, 24/7.

📡 *Noticias:* Pershyi, Canal 5, Espreso, Ukraine 24, Kyiv 24, 24 Canal, Rada
🎬 *Entretenimiento:* NTN, 1+1 Intl., Kvartal TV, Inter+, Mega, K2, 4ever Cinema, 4ever Drama
📺 *Público:* Suspilne, IRT, Army TV
🏙️ *Regional:* RAI, TVA, NTK, Dnipro, Canal 7, Rivne 1, ITV
🎵 *Música:* Muzvar, NASHE Music, M1, 4ever Music, UA Music
👶 *Infantil:* Niki Kids, Niki Junior
🎯 *Temáticos:* Rybalka TV, UA Fashion TV, Svarozhychy, Equalympic

✅ HD · iOS · Android · Desktop · 8 idiomas`,
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
`🇺🇦 *Україна ТВ — 36 КАНАЛІВ НАЖИВО* 🔴

Дивіться *українські телеканали* прямо в Telegram — *безкоштовно, без VPN, без реєстрації, 24/7.*

━━━━━━━━━━━━━━━━━━━━
📡 *НОВИНИ ТА ЗАГАЛЬНІ*
▪️ Перший · 5 Канал · Еспресо ТВ · Рада
▪️ Україна 24 · Київ 24 · 24 Канал

🎬 *РОЗВАГИ ТА КІНО*
▪️ НТН · 1+1 Міжнар. · Квартал ТВ · Інтер+
▪️ Мега · К2 · 4ever Cinema · 4ever Drama

📺 *СУСПІЛЬНЕ ТА ГРОМАДСЬКІ*
▪️ Суспільне Київ · IRT · Армія ТВ

🏙️ *РЕГІОНАЛЬНІ*
▪️ RAI · TVA · NTK TV · Дніпро TV
▪️ 7 Канал · Рівне 1 · ITV

🎵 *МУЗИКА*
▪️ Мюзвар · NASHE Music · М1
▪️ 4ever Music · UA Music

👶 *ДИТЯЧІ*
▪️ Niki Kids · Niki Junior

🎯 *ТЕМАТИЧНІ*
▪️ Rybalka TV · UA Fashion TV · Svarozhychy · Equalympic
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
