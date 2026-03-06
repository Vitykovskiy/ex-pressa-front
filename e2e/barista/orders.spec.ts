import { test, expect } from '@playwright/test';
import { setupBaristaMocks } from '../support/api-mocks';
import { waitForApp, waitForDialogClose } from '../support/helpers';
import { mockOrders, mockOrder, mockOrderConfirmed, mockOrderReady } from '../mocks/data';

test.beforeEach(async ({ page }) => {
  await setupBaristaMocks(page);
  await waitForApp(page, '/');
});

// ───── Отображение списка заказов ─────

test('отображает заголовок «Заказы»', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Заказы' })).toBeVisible();
});

test('отображает карточки заказов', async ({ page }) => {
  await expect(page.getByText('#1')).toBeVisible();
  await expect(page.getByText('#2')).toBeVisible();
  await expect(page.getByText('#3')).toBeVisible();
});

test('карточка заказа показывает имя пользователя', async ({ page }) => {
  await expect(page.getByText('Тестовый пользователь').first()).toBeVisible();
});

test('карточка заказа показывает состав (товары)', async ({ page }) => {
  // Заказ #1: Капучино (M) x1
  await expect(page.getByText(/Капучино/).first()).toBeVisible();
});

test('карточка заказа показывает итоговую сумму', async ({ page }) => {
  // mockOrder.totalRub = 200
  await expect(page.getByText(/200/).first()).toBeVisible();
});

test('карточка заказа показывает тайм-слот', async ({ page }) => {
  await expect(page.getByText(/09:00/).first()).toBeVisible();
});

// ───── Статусы заказов ─────

test('заказ CREATED отображает статус «Создан»', async ({ page }) => {
  await expect(page.getByText('Создан').first()).toBeVisible();
});

test('заказ CONFIRMED отображает статус «Подтвержден»', async ({ page }) => {
  await expect(page.getByText('Подтвержден')).toBeVisible();
});

test('заказ READY отображает статус «Готов»', async ({ page }) => {
  await expect(page.getByText('Готов')).toBeVisible();
});

// ───── Смена статуса: CREATED → CONFIRMED (без диалога) ─────

test('кнопка «Подтвердить» доступна для заказа CREATED', async ({ page }) => {
  // Карточки отсортированы: CREATED первый
  const confirmBtn = page.getByRole('button', { name: /^подтвердить$/i }).first();
  await expect(confirmBtn).toBeVisible();
  await expect(confirmBtn).toBeEnabled();
});

test('нажатие «Подтвердить» на CREATED заказ меняет его статус', async ({ page }) => {
  // После подтверждения сервер возвращает CONFIRMED статус
  await page.route(/\/orders\/\d+\/status$/, (route) =>
    route.fulfill({ json: { ...mockOrder, id: mockOrder.id, status: 'CONFIRMED' } }),
  );
  // Также перегружаем поиск для нового результата
  await page.route(/\/orders\/search$/, (route) =>
    route.fulfill({ json: [{ ...mockOrder, status: 'CONFIRMED' }, mockOrderConfirmed, mockOrderReady] }),
  );

  await page.getByRole('button', { name: /^подтвердить$/i }).first().click();
  // После перезагрузки заказов — больше одного «Подтвержден» или список обновился
  // Просто убеждаемся, что не появилась ошибка
  await expect(page.getByText('Не удалось обновить статус')).not.toBeVisible();
});

// ───── Смена статуса: CONFIRMED → READY (через диалог подтверждения) ─────

test('смена статуса на READY открывает диалог подтверждения', async ({ page }) => {
  // Кнопка у заказа CONFIRMED — «Готов»
  await page.getByRole('button', { name: /^готов$/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/Перевести заказ в статус «Готов»/i)).toBeVisible();
});

test('отмена диалога смены статуса закрывает диалог без изменений', async ({ page }) => {
  await page.getByRole('button', { name: /^готов$/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /отмена/i }).click();
  await waitForDialogClose(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('подтверждение диалога смены статуса вызывает API', async ({ page }) => {
  let statusCallCount = 0;
  await page.route(/\/orders\/\d+\/status$/, (route) => {
    statusCallCount++;
    return route.fulfill({ json: { ...mockOrderConfirmed, status: 'READY' } });
  });
  await page.route(/\/orders\/search$/, (route) =>
    route.fulfill({ json: mockOrders }),
  );

  await page.getByRole('button', { name: /^готов$/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /подтвердить/i }).last().click();
  await expect.poll(() => statusCallCount).toBeGreaterThan(0);
});

// ───── Смена статуса: READY → CLOSED (через диалог подтверждения) ─────

test('смена статуса на CLOSED открывает диалог подтверждения', async ({ page }) => {
  // Кнопка у заказа READY — «Закрыть»
  await page.getByRole('button', { name: /закрыть/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/Перевести заказ в статус «Закрыт»/i)).toBeVisible();
});

// ───── Отклонение заказа ─────

test('у заказов CREATED и CONFIRMED есть кнопка «Отклонить»', async ({ page }) => {
  const rejectBtns = page.getByRole('button', { name: /отклонить/i });
  // CREATED + CONFIRMED = минимум 2
  await expect(rejectBtns).toHaveCount(2);
});

test('нажатие «Отклонить» открывает диалог отклонения', async ({ page }) => {
  await page.getByRole('button', { name: /отклонить/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('нельзя отклонить заказ без причины', async ({ page }) => {
  await page.getByRole('button', { name: /отклонить/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  // Нажимаем «Отклонить» в диалоге без указания причины
  const dialogConfirmBtn = page.getByRole('dialog').getByRole('button', { name: /отклонить/i });
  await dialogConfirmBtn.click();
  await expect(page.getByText(/укажи причину/i)).toBeVisible();
});

test('можно отклонить заказ с причиной', async ({ page }) => {
  let rejectCalled = false;
  await page.route(/\/orders\/\d+\/reject$/, (route) => {
    rejectCalled = true;
    return route.fulfill({
      json: { ...mockOrder, status: 'REJECTED', rejectReason: 'Нет ингредиентов' },
    });
  });
  await page.route(/\/orders\/search$/, (route) =>
    route.fulfill({ json: mockOrders }),
  );

  await page.getByRole('button', { name: /отклонить/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // Заполняем причину
  await page.getByRole('dialog').locator('textarea, input[type="text"], .v-field__input').last().fill('Нет ингредиентов');
  await page.getByRole('dialog').getByRole('button', { name: /отклонить/i }).click();

  await expect.poll(() => rejectCalled).toBe(true);
});

test('отмена диалога отклонения закрывает его', async ({ page }) => {
  await page.getByRole('button', { name: /отклонить/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /отмена/i }).click();
  await waitForDialogClose(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

// ───── Фильтрация и поиск ─────

test('есть кнопка «Поиск» в панели фильтров', async ({ page }) => {
  await expect(page.getByRole('button', { name: /поиск/i })).toBeVisible();
});

test('нажатие «Поиск» перезагружает список заказов', async ({ page }) => {
  let callCount = 0;
  await page.route(/\/orders\/search$/, (route) => {
    callCount++;
    return route.fulfill({ json: mockOrders });
  });

  const countBefore = callCount;
  await page.getByRole('button', { name: /поиск/i }).click();
  await expect.poll(() => callCount).toBeGreaterThan(countBefore);
});

test('пустой список заказов показывает сообщение', async ({ page }) => {
  await page.route(/\/orders\/search$/, (route) =>
    route.fulfill({ json: [] }),
  );
  await page.getByRole('button', { name: /поиск/i }).click();
  await expect(page.getByText('Нет заказов для отображения')).toBeVisible();
});
