// Тексти бота (спільні для webhook-воркера і тестів). Дані каналів передаються ззовні: makeCore(CH).
export function makeCore(CH) {
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


  const APP_URL = 'https://t.me/UkraineTVHub_bot/ukrainetv';
  const WEB_URL = 'https://varenik-ai.github.io/ukraine-tv-hub/?v=3';
  const SITE_URL = 'https://ukraine-tv.uk/';

  function greeting(lang, name) {
    const t = TXT[lang] || TXT.uk, l = TXT[lang] ? lang : 'uk';
    return `🇺🇦 ${t.hi}${name ? ', ' + mdEsc(name) : ''}!\n\n📺 *${t.title}*\n\n${t.sub}\n\n${listLines(l)}\n\n${t.total(CH.n)}\n${t.foot}`;
  }
  function startKeyboard(lang) {
    const t = TXT[lang] || TXT.uk;
    return { inline_keyboard: [[{ text: t.open, web_app: { url: WEB_URL } }], [{ text: t.browser, url: WEB_URL }]] };
  }
  const plural = n => (n % 10 === 1 && n % 100 !== 11) ? 'канал' : ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) ? 'канали' : 'каналів';
  function channelPost() {
    const t = TXT.uk;
    return `🇺🇦 *Україна ТВ — ${CH.n} ${plural(CH.n)} наживо* 🔴\n\nДивіться українські телеканали прямо в Telegram — *безкоштовно, без VPN, без реєстрації, 24/7.*\n\n━━━━━━━━━━━━━━━━━━━━\n${listLines('uk')}\n━━━━━━━━━━━━━━━━━━━━\n\n${t.foot}\n🌐 Те саме на сайті: ukraine-tv.uk\n\n${t.pick}`;
  }
  // ── «Подякувати» (Telegram Stars) ──
  const DONATE_AMOUNTS = [25, 50, 100, 250];
  const DONATE_ORIGINS = ['https://varenik-ai.github.io', 'https://ukraine-tv.uk', 'https://www.ukraine-tv.uk'];
  const DONATE_URL = APP_URL + '?startapp=donate';
  const THANK_BTN = { uk: '⭐ Подякувати', ru: '⭐ Поблагодарить', en: '⭐ Say thanks', bg: '⭐ Благодаря', pl: '⭐ Podziękuj', de: '⭐ Danke sagen', fr: '⭐ Remercier', es: '⭐ Agradecer' };
  const THANKS = {
    uk: n => `💙💛 Дякуємо за підтримку! Ваші ${n} ⭐ допомагають розвивати Україна ТВ.`,
    ru: n => `💙💛 Спасибо за поддержку! Ваши ${n} ⭐ помогают развивать Украина ТВ.`,
    en: n => `💙💛 Thank you for your support! Your ${n} ⭐ help Ukraine TV grow.`,
    bg: n => `💙💛 Благодарим за подкрепата! Вашите ${n} ⭐ помагат на Ukraine TV да се развива.`,
    pl: n => `💙💛 Dziękujemy za wsparcie! Twoje ${n} ⭐ pomagają rozwijać Ukraine TV.`,
    de: n => `💙💛 Danke für Ihre Unterstützung! Ihre ${n} ⭐ helfen Ukraine TV beim Wachsen.`,
    fr: n => `💙💛 Merci pour votre soutien ! Vos ${n} ⭐ aident Ukraine TV à se développer.`,
    es: n => `💙💛 ¡Gracias por tu apoyo! Tus ${n} ⭐ ayudan a que Ukraine TV crezca.`,
  };
  const thanksText = (lang, n) => (THANKS[lang] || THANKS.uk)(n);
  const invoice = amount => ({
    title: 'Україна ТВ — подяка',
    description: `Підтримати проєкт Україна ТВ: ${amount} ⭐`,
    payload: 'donate_' + amount, currency: 'XTR', prices: [{ label: 'Україна ТВ', amount }],
  });
  // ключова клавіатура поста: застосунок, сайт, подяка
  const postKeyboard = { inline_keyboard: [[{ text: TXT.uk.open, url: APP_URL }], [{ text: '🌐 ukraine-tv.uk', url: SITE_URL }], [{ text: THANK_BTN.uk, url: DONATE_URL }]] };
  return { TXT, greeting, startKeyboard, channelPost, postKeyboard, DONATE_AMOUNTS, DONATE_ORIGINS, DONATE_URL, THANK_BTN, thanksText, invoice };
}
