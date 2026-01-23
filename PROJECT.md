# PROJECT.md — Состояние проекта

> Этот файл отслеживает прогресс, историю и планы проекта.
> Обновляется командой `/pg.project`.

## Обзор

**Название**: Last Tab
**Описание**: Chrome-расширение для навигации по табам в порядке последнего использования (MRU), как Ctrl+Tab в IDE
**Стек**: Chrome Extension (Manifest V3), Vanilla JavaScript, HTML, CSS

---

## Текущее состояние

### Готово
- [x] Quick Switch (Ctrl+Q) — мгновенное переключение на предыдущий таб
- [x] Ping-pong навигация — двойное нажатие возвращает обратно
- [x] MRU Popup (Ctrl+Shift+Q) — список 10 последних табов с favicon и title
- [x] Settings Popup — toggles для каждой функции
- [x] Auto-switch on close — переход на предыдущий таб при закрытии активного
- [x] Кросс-окна — переключение между окнами Chrome
- [x] Иконки расширения (16/48/128 px)
- [x] CLAUDE.md — техническая документация

### В процессе
- [ ] —

---

## История изменений

### 2026-01-23 — Начальная реализация

**Входные данные**:
Создать Chrome-расширение для MRU-навигации по табам, как в IDE (Rider, VS Code).
Ctrl+Tab недоступен в Chrome API, поэтому используем Ctrl+Q.
Требования:
- Quick Switch на предыдущий таб
- Popup со списком последних табов
- Настраиваемые hotkeys
- Общая история для всех окон
- Auto-switch при закрытии активного таба (опционально)

**Что сделано**:
- Спроектирована архитектура (brainstorm → design)
- Реализован Service Worker с MRU-стеком
- Созданы два popup: Settings и MRU list
- Исправлен баг с ping-pong (убран флаг isInternalSwitch)
- Добавлен toggle для auto-switch on close

**Файлы затронуты**:
- `manifest.json` — Manifest V3 конфигурация, commands, permissions
- `background.js` — MRU логика, event listeners, message handling
- `popup.html/js/css` — Settings popup с тремя toggles
- `mru-popup.html/js/css` — Tab list popup с keyboard навигацией
- `icons/` — PNG иконки 16/48/128
- `CLAUDE.md` — техническая документация

---

## Backlog / Идеи

### Высокий приоритет
- [ ] Инициализировать git репозиторий
- [ ] Опубликовать в Chrome Web Store

### Можно сделать
- [ ] Hold-режим (Ctrl удержан + несколько Q) — сложно из-за ограничений API
- [ ] Поиск по табам в MRU popup
- [ ] Кастомизация глубины истории (сейчас фиксировано 10)
- [ ] Темы оформления popup

### На будущее
- [ ] Сохранение истории между сессиями (persistence)
- [ ] Превью страниц в MRU popup
- [ ] Группировка табов по окнам в popup
- [ ] Синхронизация настроек через chrome.storage.sync

---

## Структура проекта

```
ChromeLastTabExt/
├── manifest.json        # Manifest V3, permissions, commands
├── background.js        # Service Worker: MRU стек, events, messages
├── popup.html/js/css    # Settings popup (клик на иконку)
├── mru-popup.html/js/css # MRU list popup (Ctrl+Shift+Q)
├── icons/               # PNG иконки 16/48/128
├── CLAUDE.md            # Техническая документация
├── PROJECT.md           # Состояние проекта (этот файл)
└── prompts/             # Промпты для Claude Code
```

---

## Заметки

**Ограничения Chrome Extensions API:**
- Ctrl+Tab недоступен (системный shortcut браузера)
- Нельзя отслеживать удержание модификатора между нажатиями команд
- Service Worker может "засыпать" — история в памяти сбрасывается

**Архитектурные решения:**
- MRU-стек в памяти (не персистируется) — проще и быстрее
- Общий стек для всех окон — удобнее для пользователя
- Всегда обновляем стек в onActivated — обеспечивает ping-pong
