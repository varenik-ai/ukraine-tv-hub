# ETALON — правила мини-аппа (Ukraine TV Hub)

Мини-апп повторяет эталон `russia-tv-hub/ETALON.md` (v1.2). Не ломать при правках:

- **Fullscreen:** Android — `container.requestFullscreen()`, iOS — `video.webkitEnterFullscreen()`; после выхода из fullscreen на iOS — `stopStream()` + `init()`. Не вызывать одновременно `Telegram.WebApp.requestFullscreen()` и `container.requestFullscreen()`.
- **Фоновое аудио:** Android — тихий зацикленный `audio-bg` (без второго hls.js), iOS — Media Session.
- **Safe area:** `--tg-safe-top` из `safeAreaInsets`; `isIOS()` проверяет и `Telegram.WebApp.platform === "ios"`.
- **Звук:** `video` вне `.overlay`; `userUnmuted=false` в начале `loadStream`; `video.muted=true` перед `play()`; `_soundWanted/_restoreSound()` после реконнекта.
- **hls.js:** `startLevel:0`, `capLevelToPlayerSize:true`, `abrEwmaDefaultEstimate:500000`, версия закреплена (`1.5.15`), не `@latest`.
- **Качество:** `initQuality(hls)` сразу после `attachMedia`; на iOS `initQualityNative(url)` (фикс. уровень — воркер `/stream-q`).
- **Повторы:** только через `_scheduleInit(baseMs)`, пауза растёт до 30 с, после `MAX_FAIL_STREAK = 6` — «Канал тимчасово недоступний» с кнопкой повтора.
- **PiP** — только десктоп. Кнопка «Дивитись на сайті» ведёт на `ukraine-tv.uk` с учётом языка (`SITE_PREFIX`).
- **Строки** — в `T` на всех 8 языках (`ru, en, bg, uk, de, fr, es, tr`); язык по умолчанию — `uk`.

Отличия от эталона: каналы подставляются генератором (маркеры `CHANNELS:BEGIN/END`), нет cinerama-специфики (`PREEMPTIVE_IDS` пуст), нет NTV-ветки, нет iframe-каналов.
