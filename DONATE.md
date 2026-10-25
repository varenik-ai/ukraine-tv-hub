# Кнопка «Подякувати» (Telegram Stars)

Кнопка в мини-аппе и под закреплённым постом канала `@UkraineTVHub`: пользователь выбирает 25 / 50 / 100 / 250 ⭐, оплачивает Stars внутри Telegram, бот присылает благодарность. Сделано по образцу `varenik-ai/bulgaria-tv-hub` (`DONATE_GUIDE.md`).

## Как работает
```
мини-апп ──GET /invoice?amount=N──► воркер ukraine-tv-bot ──createInvoiceLink (XTR)──► Telegram
   │ tg.openInvoice(url) ◄───────────────── {url}
   ▼
оплата Stars ─► pre_checkout_query ─► воркер отвечает ok (≤ 10 с) ─► successful_payment ─► «Дякуємо!» в личку плательщику
```
- **Мини-апп** (`index.html`): кнопка `⭐ Подякувати` на главном экране (только внутри Telegram), окно с суммами `#donate-modal`, тексты на 8 языках в объекте `T` (`thank`, `donateSub`, `donateThanks`). Окно открывается и по deep link `?startapp=donate`.
- **Воркер** (`bot-worker/`): `GET /invoice?amount=N` (разрешены только суммы из `DONATE_AMOUNTS` и только Origin `varenik-ai.github.io`, `ukraine-tv.uk`), обработка `pre_checkout_query` и `successful_payment`, команды `/post` и `/fixpost`.
- **Кнопка под постом**: URL-кнопка `https://t.me/UkraineTVHub_bot/ukrainetv?startapp=donate` во втором ряду клавиатуры (`postKeyboard` в `bot-worker/core.js`).

## Включение (один раз)
1. `git pull` в `~/ukraine-tv-hub`.
2. `./setup-bot.sh` — деплой воркера и повторная установка webhook с `allowed_updates = [message, pre_checkout_query]` (**без этого Telegram не присылает `pre_checkout_query` и платёж не проходит**).
3. Боту: `/fixpost` — кнопка появится под закреплённым постом без нового уведомления подписчикам. Если пост ещё не опубликован или публиковался другим ботом: `/post`.
4. Мини-апп обновляется через GitHub Pages, но **Telegram кэширует мини-апп по адресу**. Чтобы клиенты взяли новую версию, меняйте `?v=N` в адресе: в @BotFather → `/myapps` → бот → мини-апп `ukrainetv` → Edit Web App URL → `https://varenik-ai.github.io/ukraine-tv-hub/?v=4` (тот же адрес — в `WEB_URL` в `bot-worker/core.js` и в `setup-bot.sh`; кнопка меню обновляется повторным запуском `./setup-bot.sh`). Затем полностью закройте и откройте мини-апп.

## Настройка
- Суммы: `DONATE_AMOUNTS` в `bot-worker/core.js` и такой же массив `DONATE_AMOUNTS` в `index.html` (должны совпадать; воркер отклонит лишнее).
- Тексты благодарности и подпись кнопки: `THANKS`, `THANK_BTN` в `bot-worker/core.js`; тексты мини-аппа — `T` в `index.html`.
- Разрешённые Origin для `/invoice`: `DONATE_ORIGINS` в `core.js`.

## Проверка
1. `node tools/test_bot.mjs` — тесты счёта, платежа и `/fixpost`.
2. `curl 'https://ukraine-tv-bot.dyaltd.workers.dev/invoice?amount=25' -H 'Origin: https://varenik-ai.github.io'` → `{"url":"https://t.me/$…"}`; `amount=7` → 400; чужой Origin → 403.
3. В Telegram: мини-апп → «Подякувати» → 25 ⭐ → окно оплаты Stars; ссылка `https://t.me/UkraineTVHub_bot/ukrainetv?startapp=donate` открывает окно сумм сразу.

## Частые ошибки
- **Окна нет, мини-апп открылся как раньше.** Telegram держит старую версию по прежнему адресу: поднимите `?v=N` в BotFather и в `WEB_URL`, перезапустите мини-апп. Код читает `start_param` из `initDataUnsafe`, из `initData`, из `tgWebAppStartParam` (адрес и hash).
- **«Invoice creation failed» / пустое окно.** У воркера нет `BOT_TOKEN` (`wrangler secret`), либо запрос идёт с неразрешённого Origin.
- **Оплата зависает или падает.** Не подключён `pre_checkout_query` в `allowed_updates` — повторить `./setup-bot.sh`; воркер должен ответить в течение 10 секунд.
- **`/fixpost` не меняет кнопки.** Бот может редактировать только сообщения, которые отправил сам; если закреплено несколько сообщений, правится последнее закреплённое. Старый пост от другого бота пересоздайте через `/post`.
- **Вывод Stars.** Stars копятся на балансе бота; вывод — через Telegram/Fragment (комиссия платформы). Кода это не касается.
