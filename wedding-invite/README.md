# Свадебное приглашение — Olive Silk

Одностраничный статический сайт для GitHub/RawGitHack-просмотра с персональными ссылками гостей.

## Быстрый просмотр

- Демо для Виктора и Юлии: `https://raw.githack.com/STEP3DLab/Hub/main/wedding-invite/index.html?guest=viktor_yuliya`
- Демо для мамы и папы: `https://raw.githack.com/STEP3DLab/Hub/main/wedding-invite/index.html?guest=mama_i_papa`
- Банкетная версия: `https://raw.githack.com/STEP3DLab/Hub/main/wedding-invite/index.html?guest=banquet_demo`

## Структура

- `index.html` — сайт целиком: HTML, CSS, JS.
- `apps-script.gs` — скрипт для записи анкеты в Google Таблицу.

## Google Таблица

Таблица создана здесь: https://docs.google.com/spreadsheets/d/1xZz6dXbD4s_AU05Lyl8nS4MYZWAXuw5kes4IjWPsz_E/edit

Листы:

1. `Гости` — список гостей, тип приглашения, ссылка, статус анкеты.
2. `Ответы анкеты` — история отправок формы.
3. `Справочник напитков` — список напитков.

## Как включить запись анкеты

1. Откройте Google Таблицу.
2. Extensions → Apps Script.
3. Вставьте код из `apps-script.gs`.
4. Deploy → New deployment → Web app.
5. Execute as: Me. Who has access: Anyone with the link.
6. Скопируйте Web App URL.
7. В `index.html` замените строку:

```js
const APPS_SCRIPT_URL = '';
```

на:

```js
const APPS_SCRIPT_URL = 'ВАШ_WEB_APP_URL';
```

## Дизайн-решение

Сайт построен по классической логике свадебных digital invitation: персональное обращение, дата/календарь, обратный отсчет, программа, локации, дресс-код, пожелания по подаркам, анкета, FAQ и финал. Блоки разделены отдельными секциями, без объединения разных разделов в одну карточку.
