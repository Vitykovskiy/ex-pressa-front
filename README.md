# ex-pressa-front

## App targets (MVP)

Один репозиторий поддерживает два фронта:

- `customer` -> `ex-pressa.ru`
- `admin` -> `admin.ex-pressa.ru`

Переключение делается через `VITE_APP_TARGET` (`customer` или `admin`).

## Local run

- customer: `npm run dev:customer`
- admin: `npm run dev:admin`

## Build

- customer: `npm run build:customer`
- admin: `npm run build:admin`

По умолчанию `npm run dev` и `npm run build` запускают customer-режим.

## Domain deploy mapping

Для отдельных доменов удобно использовать два отдельных deploy job/сайта:

- `ex-pressa.ru`
  - Build command: `npm run build:customer`
  - Publish dir: `dist`

- `admin.ex-pressa.ru`
  - Build command: `npm run build:admin`
  - Publish dir: `dist`

`VITE_APP_TARGET` задается mode-файлами:

- `.env.customer`
- `.env.admin`
