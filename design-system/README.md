# DnD DM Tools Design System

Приватная Svelte-библиотека дизайн-системы проекта. Пакет является независимым npm workspace и пока не используется основным приложением.

Для локальной разработки требуется Node.js 20.19 или новее.

## Команды

Команды можно запускать из корня репозитория:

```bash
npm run design-system:storybook
npm run design-system:check
npm run design-system:build
npm run design-system:storybook:build
npm run design-system:validate
```

Storybook открывается локально по адресу `http://localhost:6006`. Статическая сборка записывается в `design-system/storybook-static` и никуда не публикуется.

## Запуск Storybook

Из корня репозитория выполните:

```bash
npm run design-system:storybook
```

После запуска откройте `http://localhost:6006/?path=/story/icons-gallery--all` — там находится галерея доступных иконок.

## Добавление компонентов

Каждый публичный компонент должен находиться в `src/lib`, экспортироваться из `src/lib/index.ts` и иметь colocated-файл `*.stories.ts`. Код библиотеки не должен импортировать основной `src`, Obsidian или Electron. Это ограничение проверяет `npm run design-system:check`.

## Внутренний релиз

1. Обновить `CHANGELOG.md`.
2. Выполнить `npm run design-system:validate`.
3. Из корня репозитория повысить только версию workspace:

```bash
npm version --workspace @dnd-dm-tools/design-system <major|minor|patch> --no-git-tag-version
```

Команда не создаёт тег и не публикует пакет. Версия основного плагина не изменяется.
