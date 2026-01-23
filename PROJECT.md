# PROJECT.md — Состояние проекта

> Этот файл отслеживает прогресс, историю и планы проекта.
> Обновляется командой `/pg.sync`.
>
> **Последнее обновление**: 2026-01-23

## Обзор

**Название**: Last Tab
**Описание**: Chrome-расширение для навигации по табам в порядке последнего использования (MRU), как Ctrl+Tab в IDE
**Стек**: Chrome Extension (Manifest V3), Vanilla JavaScript, HTML, CSS

---

## Текущее состояние

### Готово
- [x] Quick Switch (Ctrl+Q) — мгновенное переключение на предыдущий таб
- [x] Ping-pong навигация — двойное нажатие возвращает обратно
- [x] MRU Popup (Ctrl+Shift+Q) — список последних табов с favicon и title
- [x] Settings Popup — toggles для каждой функции
- [x] Auto-switch on close — переход на предыдущий таб при закрытии активного
- [x] Кросс-окна — переключение между окнами Chrome
- [x] Иконки расширения (16/48/128 px)
- [x] CLAUDE.md — техническая документация
- [x] README.md — документация для GitHub
- [x] Git репозиторий инициализирован и запушен
- [x] Персистентность MRU стека (выживает Service Worker sleep)
- [x] Toggle popup по Ctrl+Shift+Q (открыть/закрыть)
- [x] Поиск/фильтрация в MRU popup по title и URL
- [x] Показ всех открытых вкладок (MRU + остальные)
- [x] Закрытие popup при потере фокуса
- [x] macOS shortcuts (Control вместо Command)
- [x] Hold-режим — удерживать Ctrl + несколько Q для навигации глубже в историю
- [x] Опция показа popup на Ctrl+Q (зависит от Hold-режима)

### В процессе
- [ ] —

---

## История изменений

### 2026-01-23 — Hold-режим и расширенные настройки

**Входные данные**:
- Добавить Hold-режим: удерживать Ctrl + несколько нажатий Q для навигации глубже в MRU
- Добавить опцию "Show popup on Ctrl+Q" — показывать popup при quick switch
- Зависимость: Show popup доступен только когда Hold mode включён

**Что сделано**:
- Добавлены две новые настройки: Hold mode и Show popup on Ctrl+Q
- Hold mode без popup — переключение по MRU с таймаутом сброса 300ms
- Hold mode с popup — открытие MRU popup, Q двигает выделение вниз
- UI: Show popup автоматически отключается когда Hold mode выключен
- Исправлен CSP violation (inline onerror handler → addEventListener)
- Три режима popup: browse, hold, quick

**Файлы затронуты**:
- `background.js` — hold mode logic, holdModeIndex tracking с таймаутом
- `popup.html` — два новых toggle с зависимостью
- `popup.js` — updateShowPopupState() для управления зависимостью
- `popup.css` — стили для disabled состояния
- `mru-popup.js` — три режима, CSP-compliant favicon error handling
- `CLAUDE.md` — обновлена Settings Schema

---

### 2026-01-23 — UX улучшения и macOS поддержка

**Входные данные**:
- Добавить поиск/фильтрацию в MRU popup
- Показать все открытые вкладки (не только MRU)
- Закрывать popup при потере фокуса
- Поддержка macOS (Command+Q зарезервирован системой)

**Что сделано**:
- Добавлено поле поиска с фильтрацией по title и URL
- MRU popup теперь показывает все открытые вкладки с разделителем "All Tabs"
- Popup автоматически закрывается при blur (потеря фокуса)
- macOS shortcuts изменены на Control+Q / Control+Shift+Q
- README обновлён с таблицей shortcuts для обеих платформ

**Файлы затронуты**:
- `manifest.json` — macOS shortcuts (MacCtrl)
- `mru-popup.html` — добавлено поле поиска
- `mru-popup.css` — стили для search и section-divider
- `mru-popup.js` — фильтрация, показ всех вкладок, blur handler
- `background.js` — getMRUTabs возвращает MRU + все остальные вкладки
- `README.md` — таблица shortcuts для Windows/Linux/macOS

---

### 2026-01-23 — Исправление Service Worker sleep

**Входные данные**:
После долгого ожидания на странице Ctrl+Q переставал работать правильно.

**Что сделано**:
- MRU стек теперь сохраняется в chrome.storage.local
- При пробуждении Service Worker восстанавливает стек
- Добавлен toggle для MRU popup (повторное нажатие закрывает)
- Popup скрывает сам себя из списка вкладок

**Файлы затронуты**:
- `background.js` — saveStackDebounced(), mruPopupWindowId tracking
- `mru-popup.js` — фильтрация mru-popup.html из списка

---

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
- [ ] Опубликовать в Chrome Web Store

### Можно сделать
- [ ] Кастомизация глубины истории в настройках
- [ ] Темы оформления popup

### На будущее
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
- Command+Q на macOS недоступен (системный shortcut выхода из приложения)
- Нельзя отслеживать удержание модификатора между нажатиями команд
- Service Worker засыпает после ~30 сек неактивности

**Архитектурные решения:**
- MRU-стек персистируется в chrome.storage.local (debounced 500ms)
- Общий стек для всех окон — удобнее для пользователя
- Всегда обновляем стек в onActivated — обеспечивает ping-pong
- getMRUTabs возвращает MRU + все остальные открытые вкладки
- Popup закрывается при blur для лучшего UX

**GitHub**: https://github.com/kar43lov/ChromeLastTabExt
