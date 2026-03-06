# Ex-Pressa Front-End — Обзор проекта

> Документ для быстрого ознакомления с проектом. Актуален на март 2026 г.

---

## Краткое описание

**Ex-Pressa** — веб-приложение для кофейни/экспресс-кафе. Единый репозиторий содержит **три отдельных SPA**:
- **Customer** (`ex-pressa.ru`) — меню, корзина, оформление заказа для клиентов
- **Admin** (`admin.ex-pressa.ru`) — управление меню и пользователями
- **Barista** — управление заказами для сотрудников

Аутентификация — через **Telegram WebApp** (@tma.js/sdk).

---

## Технологический стек

| Технология | Версия | Назначение |
|---|---|---|
| Vue 3 | 3.5.21 | Фреймворк |
| Vue Router | 4.5.1 | Маршрутизация |
| Vuetify | 3.10.1 | UI-компоненты |
| Axios | 1.13.1 | HTTP-запросы |
| @tma.js/sdk | 3.1.6 | Telegram Mini App |
| TypeScript | 5.9.2 | Типизация |
| Vite | 7.1.5 | Сборщик |
| SCSS | — | Стили |

**Управление состоянием**: без Pinia/Vuex — используются **composables** (Vue Composition API).

---

## Структура проекта

```
ex-pressa-front/
├── src/
│   ├── main.ts                   # Точка входа — выбирает нужное приложение по VITE_APP_TARGET
│   ├── App.vue                   # Корневой компонент Customer-приложения
│   ├── router/index.ts           # Роутер Customer-приложения
│   ├── routes/index.ts           # Маршруты Customer-приложения
│   │
│   ├── admin/                    # Admin-приложение
│   │   ├── App.vue
│   │   ├── router.ts
│   │   ├── routes.ts
│   │   └── views/
│   │       ├── menu/             # Управление меню
│   │       └── users/            # Управление пользователями
│   │
│   ├── barista/                  # Barista-приложение
│   │   ├── App.vue
│   │   ├── router.ts
│   │   ├── routes.ts
│   │   └── views/
│   │       └── orders/           # Управление заказами
│   │
│   ├── views/                    # Страницы Customer-приложения
│   │   ├── auth/                 # Экран авторизации
│   │   ├── menu/                 # Меню (список групп и продуктов)
│   │   ├── menuItem/             # Карточка продукта (размеры, добавки)
│   │   ├── cart/                 # Корзина
│   │   ├── orderSlot/            # Выбор временного слота
│   │   └── orders/               # История заказов
│   │
│   ├── components/
│   │   └── AccessState.vue       # Общий компонент для состояний доступа/ошибок
│   │
│   ├── services/                 # Слой API (Axios)
│   │   ├── http/                 # HttpService + HttpError
│   │   ├── auth/                 # Авторизация
│   │   ├── menu/                 # Каталог продуктов
│   │   ├── cart/                 # Корзина
│   │   ├── orders/               # Заказы
│   │   └── timeSlots/            # Временные слоты
│   │
│   ├── composables/              # Состояние приложения
│   │   ├── useAuth.ts            # Авторизация и текущий пользователь
│   │   ├── useCart.ts            # Локальная корзина
│   │   ├── useMenu.ts            # Загрузка меню
│   │   └── types.ts              # ICartItem
│   │
│   ├── config/
│   │   └── authMode.ts           # Режим авторизации (auto/authorized/unauthorized)
│   ├── helpers/
│   │   └── index.ts              # buildFullName()
│   ├── plugins/
│   │   ├── index.ts              # Регистрация плагинов
│   │   └── vuetify.ts            # Темы Vuetify (light/dark)
│   └── styles/
│       └── settings.scss         # Настройки Vuetify
│
├── .env                          # Базовые переменные окружения
├── .env.customer                 # VITE_APP_TARGET=customer
├── .env.admin                    # VITE_APP_TARGET=admin
├── .env.barista                  # VITE_APP_TARGET=barista
├── vite.config.mts
├── tsconfig.json
└── package.json
```

---

## Многоцелевая архитектура

`main.ts` читает `VITE_APP_TARGET` и динамически загружает нужный `App.vue` и роутер:

```
VITE_APP_TARGET=customer  →  src/App.vue + src/router/
VITE_APP_TARGET=admin     →  src/admin/App.vue + src/admin/router.ts
VITE_APP_TARGET=barista   →  src/barista/App.vue + src/barista/router.ts
```

Каждое приложение собирается отдельной командой:
```bash
npm run dev:customer   # порт 3000
npm run dev:admin      # порт 3001
npm run dev:barista    # порт 3002

npm run build:customer
npm run build:admin
npm run build:barista
```

---

## Переменные окружения (`env.d.ts`)

| Переменная | Значения | Описание |
|---|---|---|
| `VITE_API_URL` | URL | Базовый URL бэкенда |
| `VITE_APP_TARGET` | `customer` \| `admin` \| `barista` | Целевое приложение |
| `VITE_AUTH_MODE` | `auto` \| `authorized` \| `unauthorized` | Режим авторизации |
| `VITE_APP_THEME` | `classic` \| `blue-minimal` | Тема |
| `VITE_USE_MOCKS` | boolean | Использовать моки (опционально) |

---

## Сервисы (`src/services/`)

### HTTP Service (`services/http/`)
- Axios-клиент с таймаутом 10с, `withCredentials: true`
- Методы: `get<T>`, `post<T, B>`, `put<T, B>`, `patch<T, B>`, `delete<T>`
- **`HttpError`** — кастомный класс ошибки со свойствами `status`, `data`, `isNetworkError`

### Auth Service (`services/auth/`)
| Метод | HTTP | Путь | Описание |
|---|---|---|---|
| `authorizeTelegram(initData)` | POST | `/auth/telegram` | Авторизация через Telegram |
| `fetchMe()` | GET | `/auth/me` | Получение текущего пользователя |

### Menu Service (`services/menu/`)
| Метод | HTTP | Путь |
|---|---|---|
| `fetchMenu()` | GET | `/catalog` |
| `fetchAddonGroups()` | GET | `/catalog/addon-groups` |
| `fetchProductById(id)` | GET | `/catalog/products/{id}` |
| `createProductGroup(dto)` | POST | `/catalog/product-groups` |
| `updateProductGroup(id, dto)` | PATCH | `/catalog/product-groups/{id}` |
| `deleteProductGroup(id)` | DELETE | `/catalog/product-groups/{id}` |
| `createProduct(dto)` | POST | `/catalog/products` |
| `updateProduct(id, dto)` | PATCH | `/catalog/products/{id}` |
| `deleteProduct(id)` | DELETE | `/catalog/products/{id}` |
| `createProductPrice(dto)` | POST | `/catalog/product-prices` |
| `replaceProductPrices(id, dto)` | PUT | `/catalog/products/{id}/prices` |
| `createAddonGroup(dto)` | POST | `/catalog/addon-groups` |
| `updateAddonGroup(id, dto)` | PATCH | `/catalog/addon-groups/{id}` |
| `deleteAddonGroup(id)` | DELETE | `/catalog/addon-groups/{id}` |
| `createAddon(dto)` | POST | `/catalog/addons` |
| `updateAddon(id, dto)` | PATCH | `/catalog/addons/{id}` |
| `deleteAddon(id)` | DELETE | `/catalog/addons/{id}` |
| `linkAddonGroup(dto)` | POST | `/catalog/addon-groups/link` |

### Cart Service (`services/cart/`)

userId берётся из JWT на бэкенде — в URL не передаётся.

| Метод | HTTP | Путь |
|---|---|---|
| `fetchCart()` | GET | `/cart` |
| `clearCart()` | DELETE | `/cart` |
| `addCartItem(dto)` | POST | `/cart/items` |
| `updateCartItem(itemId, dto)` | PATCH | `/cart/items/{itemId}` |
| `removeCartItem(itemId)` | DELETE | `/cart/items/{itemId}` |

### Orders Service (`services/orders/`)
| Метод | HTTP | Путь |
|---|---|---|
| `createOrderFromCart(dto)` | POST | `/orders/from-cart` |
| `fetchOrderHistory()` | GET | `/orders/history` |
| `searchOrders(filter)` | POST | `/orders/search` |
| `updateOrderStatus(orderId, dto)` | PATCH | `/orders/{orderId}/status` |
| `rejectOrder(orderId, dto)` | POST | `/orders/{orderId}/reject` |

### Time Slots Service (`services/timeSlots/`)
| Метод | HTTP | Путь |
|---|---|---|
| `fetchActiveTimeSlots()` | GET | `/time-slots/active` |

---

## Composables (`src/composables/`)

### `useAuth()`
Глобальное состояние аутентификации.

**Реактивные данные:**
- `status: AuthStatus` — `Idle | Checking | Authorized | Unauthorized`
- `currentUser: User | null`
- `userFullName: string`
- `message: string`
- `isAuthorized: boolean` (computed)
- `roleCodes: RoleCode[]` (computed)

**Методы:**
- `initAppAuth()` — запускает процесс авторизации (читает authMode, вызывает Telegram SDK или создаёт мок-пользователя)
- `initTelegramAuth(force?)` — авторизация через Telegram initData
- `hasAnyRole(roles: RoleCode[])` — проверка наличия ролей

**Режимы (`VITE_AUTH_MODE`):**
- `auto` — реальная Telegram-авторизация
- `authorized` — мок авторизованного пользователя (роль определяется из `VITE_APP_TARGET`)
- `unauthorized` — мок неавторизованного пользователя

### `useCart()`
Клиентское состояние корзины (без персистентности).

- `cart: ICartItem[]`
- `addToCart(item)`, `editCartItem(index, item)`, `removeCartItem(index)`, `clearCart()`

### `useMenu()`
Загрузка и хранение данных меню.

- `menu: ProductGroup[]` — автоматически загружается при инициализации
- `getAddonGroupsForGroup(groupId)` — возвращает группы добавок для группы продуктов

---

## Ключевые типы (`src/services/menu/types.ts`, `src/services/auth/types.ts`)

### Домен аутентификации
```typescript
enum AuthStatus { Idle, Checking, Authorized, Unauthorized }
enum RoleCode { User = 'USER', Barista = 'BARISTA', Admin = 'ADMIN' }

interface User {
  id: number; name: string; tgId: string; tgUsername: string;
  isActive: boolean; roles: Role[];
  fullName?: string; fio?: string;
  firstName?: string; lastName?: string; middleName?: string;
}
```

### Домен меню
```typescript
enum ProductType { Drink = 'DRINK', Food = 'FOOD', Merch = 'MERCH' }
enum SizeCode { S = 'S', M = 'M', L = 'L' }
enum OrderStatus { CREATED, CONFIRMED, REJECTED, READY, CLOSED }

interface ProductGroup {
  id: number; name: string; sortOrder: number;
  isActive: boolean; isAddonsGroup: boolean;
  products: Product[];
  addonLinks: { addonGroup: AddonGroup }[];
}

interface Product {
  id: number; name: string; description: string;
  type: ProductType; isActive: boolean; isAvailable: boolean;
  sortOrder: number; prices: ProductPrice[];
}

interface ProductPrice { id: number; sizeCode?: SizeCode; priceRub: number; isActive: boolean; }
interface Addon { id: number; name: string; priceRub: number; isActive: boolean; }
interface AddonGroup { id: number; name: string; isAddonsGroup: boolean; addons: Addon[]; }
```

### Корзина и заказы
```typescript
// Клиентская корзина (composable)
interface ICartItem {
  id: number; groupId: number; name: string; price: number;
  quantity: number; size?: SizeCode; selectedOptions?: Addon[];
}

// Серверная корзина
interface Cart { id: number; user: User; items: CartItem[]; }
interface CartItem { id: number; productName: string; sizeCode?: SizeCode; quantity: number; addons: Addon[]; }

// Заказ
interface Order {
  id: number; user: User; timeSlot: TimeSlot; status: OrderStatus;
  totalRub: number; items: CartItem[];
  rejectReason?: string;
}

interface TimeSlot {
  id: number; date: string; timeFrom: string; timeTo: string;
  capacity: number; bookedCount: number; isActive: boolean;
}
```

---

## Маршрутизация

### Customer (`src/routes/index.ts`)
```
/ (или /:group?)  →  Menu (список меню)
  /item/:item     →  MenuItem (карточка продукта)
/cart             →  Cart (корзина)
/order/slot       →  OrderSlot (выбор слота)
/orders           →  OrdersHistory (история заказов)
/auth             →  AuthRequired (авторизация)
```
**Guard**: неавторизованные → `/auth?redirect=...`

### Admin (`src/admin/routes.ts`)
```
/        →  redirect /menu
/menu    →  AdminMenu
/users   →  AdminUsers
/auth    →  AuthRequired
/forbidden → AccessDenied
```
**Guard**: проверяет `AuthStatus.Authorized` + `RoleCode.Admin`

### Barista (`src/barista/routes.ts`)
```
/        →  Orders
/orders  →  redirect /
/auth    →  AuthRequired
/forbidden → AccessDenied
```
**Guard**: проверяет `AuthStatus.Authorized` + `RoleCode.Barista`

---

## Описание экранов/вьюх

### Customer App

| Компонент | Файл | Описание |
|---|---|---|
| Menu | `views/menu/index.vue` | Отображение групп и продуктов в виде таблицы Vuetify. Разграничивает напитки и еду. |
| MenuItem | `views/menuItem/index.vue` | Карточка продукта: выбор размера (для напитков), добавок, количества, подсчёт цены, добавление в корзину. |
| Cart | `views/cart/index.vue` | Список товаров в корзине, итоговая цена, кнопка оформить заказ. |
| CartRow | `views/cart/cartRow/index.vue` | Строка одного товара в корзине. |
| OrderSlot | `views/orderSlot/index.vue` | Выбор временного слота для получения заказа. |
| OrdersHistory | `views/orders/index.vue` | История заказов с expansion panels, статусные чипы. |
| AuthRequired | `views/auth/index.vue` | Экран авторизации через Telegram с сообщениями о статусе. |

### Admin App

| Компонент | Файл | Описание |
|---|---|---|
| AdminMenu | `admin/views/menu/index.vue` | Управление группами и продуктами. Карточки с кнопками редактирования/удаления. |
| AddGroupDialog | `admin/views/menu/components/AddGroupDialog.vue` | Диалог создания группы продуктов или группы добавок. |
| AddProductDialog | `admin/views/menu/components/AddProductDialog.vue` | Диалог создания продукта с ценами. |
| EditGroupDialog | `admin/views/menu/components/EditGroupDialog.vue` | Диалог редактирования группы. |
| EditProductDialog | `admin/views/menu/components/EditProductDialog.vue` | Диалог редактирования продукта и его цен. |
| EditAddonDialog | `admin/views/menu/components/EditAddonDialog.vue` | Диалог редактирования добавки. |
| DeleteConfirmDialog | `admin/views/menu/components/DeleteConfirmDialog.vue` | Подтверждение удаления. |
| AdminUsers | `admin/views/users/index.vue` | Фильтрация и просмотр пользователей. |

### Barista App

| Компонент | Файл | Описание |
|---|---|---|
| Orders | `barista/views/orders/index.vue` | Список заказов с фильтрами по статусу и дате. |
| OrderCard | `barista/views/orders/components/OrderCard.vue` | Карточка заказа с деталями. |
| OrdersToolbar | `barista/views/orders/components/OrdersToolbar.vue` | Тулбар с фильтрами статуса и даты. |
| RejectOrderDialog | `barista/views/orders/components/RejectOrderDialog.vue` | Диалог отклонения заказа с причиной. |
| StatusConfirmDialog | `barista/views/orders/components/StatusConfirmDialog.vue` | Подтверждение смены статуса заказа. |

### Shared

| Компонент | Файл | Описание |
|---|---|---|
| AccessState | `components/AccessState.vue` | Общий компонент-алерт для состояний ошибки/предупреждения. |

---

## Темы Vuetify (`src/plugins/vuetify.ts`)

- **Light (classic)**: primary — `#46250dff` (коричневый), стандартные цвета Vuetify
- **Dark (blue-minimal)**: background — `#0000ff`, primary — `#00ffff`
- Тема выбирается через `VITE_APP_THEME`

---

## Поток авторизации

```
1. Router guard проверяет AuthStatus
2. Если не авторизован → редирект на /auth?redirect=<path>
3. AuthRequired.vue вызывает useAuth().initAppAuth()
4. initAppAuth() читает VITE_AUTH_MODE:
   - authorized → создаёт мок-пользователя (роль по VITE_APP_TARGET)
   - unauthorized → устанавливает Unauthorized статус
   - auto → initTelegramAuth()
5. initTelegramAuth() → @tma.js/sdk.launch() → получает initData
6. POST /auth/telegram с initData
7. GET /auth/me → устанавливает currentUser
8. Router guard выпускает на целевой маршрут
```

---

## Поток оформления заказа (Customer)

```
1. Menu → выбрать продукт
2. MenuItem → выбрать размер/добавки, кол-во → addToCart()
3. Cart → просмотр, проверка → "Оформить заказ"
4. DELETE /cart + POST /cart/items — синхронизация корзины с сервером
5. OrderSlot → GET /time-slots/active → выбрать слот
6. POST /orders/from-cart с { timeSlotId }
7. Orders → GET /orders/history — история заказов
```

---

## Поток работы баристы

```
1. POST /orders/search с фильтрами (статус, дата)
2. Отображение OrderCard для каждого заказа
3. PATCH /orders/{id}/status — смена статуса (CONFIRMED → READY → CLOSED)
4. POST /orders/{id}/reject — отклонение с причиной
```

---

## E2E-тестирование (Playwright)

**Конфигурация**: `playwright.config.ts` в корне репозитория.

**Три проекта** (соответствуют трём приложениям):
- `customer` — `baseURL: http://localhost:3000`, тесты в `e2e/customer/`
- `admin` — `baseURL: http://localhost:3001`, тесты в `e2e/admin/`
- `barista` — `baseURL: http://localhost:3002`, тесты в `e2e/barista/`

**Структура тестов:**
```
e2e/
├── mocks/
│   └── data.ts              # Фиктивные данные API (продукты, заказы, слоты)
├── support/
│   ├── api-mocks.ts         # Хелперы page.route() для мокирования API
│   └── helpers.ts           # waitForApp(), waitForDialogClose()
├── customer/
│   ├── menu.spec.ts         # Меню: группы, продукты, навигация (9 тестов)
│   ├── cart.spec.ts         # Корзина: добавление, удаление, оформление (8 тестов)
│   └── order.spec.ts        # Слоты заказа + история заказов (10 тестов)
├── admin/
│   ├── menu.spec.ts         # Управление меню: CRUD группы/товары/аддоны (15 тестов)
│   └── users.spec.ts        # Список пользователей, поиск, фильтры (9 тестов)
└── barista/
    └── orders.spec.ts       # Заказы: просмотр, смена статусов, отклонение (15 тестов)
```

**Скрипты:**
```bash
npm run test:e2e            # Все тесты
npm run test:e2e:customer   # Только customer
npm run test:e2e:admin      # Только admin
npm run test:e2e:barista    # Только barista
npm run test:e2e:ui         # Интерактивный режим Playwright UI
```

**Ключевые решения:**
- API полностью мокируется через `page.route()` — сервер не нужен
- В DEV-режиме авторизация создаёт мок-пользователя автоматически
- `waitForApp()` ожидает окончания redirect-а на `/auth` (если есть)
- `workers: 1` — последовательный запуск во избежание конфликтов портов
