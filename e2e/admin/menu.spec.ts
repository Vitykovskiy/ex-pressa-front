import { test, expect } from '@playwright/test';
import { setupAdminMocks } from '../support/api-mocks';
import { waitForApp, waitForDialogClose } from '../support/helpers';

test.beforeEach(async ({ page }) => {
  await setupAdminMocks(page);
  await waitForApp(page, '/menu');
});

// ───── Отображение списка ─────

test('отображает группы товаров', async ({ page }) => {
  await expect(page.getByText('Напитки')).toBeVisible();
  await expect(page.getByText('Еда')).toBeVisible();
});

test('отображает группу допов', async ({ page }) => {
  await expect(page.getByText('Сиропы')).toBeVisible();
});

test('отображает товары внутри группы', async ({ page }) => {
  await expect(page.getByText('Капучино')).toBeVisible();
  await expect(page.getByText('Латте')).toBeVisible();
  await expect(page.getByText('Круассан')).toBeVisible();
});

test('отображает допы внутри группы допов', async ({ page }) => {
  await expect(page.getByText('Ваниль')).toBeVisible();
  await expect(page.getByText('Карамель')).toBeVisible();
});

test('отображает цены на товары', async ({ page }) => {
  // Капучино (напиток): S 150 | M 200 | L 250
  await expect(page.getByText(/S 150/)).toBeVisible();
  // Круассан (еда): 120 руб.
  await expect(page.getByText(/120/)).toBeVisible();
});

test('есть кнопки «Добавить группу» и «Добавить товар»', async ({ page }) => {
  await expect(page.getByRole('button', { name: /добавить группу/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /добавить товар/i })).toBeVisible();
});

// ───── Диалог добавления группы ─────

test('открывается диалог добавления группы', async ({ page }) => {
  await page.getByRole('button', { name: /добавить группу/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Добавить группу')).toBeVisible();
});

test('диалог добавления группы содержит поле «Название группы»', async ({ page }) => {
  await page.getByRole('button', { name: /добавить группу/i }).click();
  await expect(page.getByLabel('Название группы')).toBeVisible();
});

test('валидация: нельзя создать группу без названия', async ({ page }) => {
  await page.getByRole('button', { name: /добавить группу/i }).click();
  // Сразу нажимаем «Добавить» без заполнения
  await page.getByRole('button', { name: /^добавить$/i }).click();
  await expect(page.getByText(/укажи название/i)).toBeVisible();
});

test('закрытие диалога добавления группы по «Отмена»', async ({ page }) => {
  await page.getByRole('button', { name: /добавить группу/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /отмена/i }).click();
  await waitForDialogClose(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('успешное создание группы — диалог закрывается', async ({ page }) => {
  await page.getByRole('button', { name: /добавить группу/i }).click();
  await page.getByLabel('Название группы').fill('Новая группа');
  await page.getByRole('button', { name: /^добавить$/i }).click();
  await waitForDialogClose(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

// ───── Диалог добавления товара ─────

test('открывается диалог добавления товара', async ({ page }) => {
  await page.getByRole('button', { name: /добавить товар/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('закрытие диалога добавления товара по «Отмена»', async ({ page }) => {
  await page.getByRole('button', { name: /добавить товар/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /отмена/i }).click();
  await waitForDialogClose(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

// ───── Диалог редактирования группы ─────

test('открывается диалог редактирования группы', async ({ page }) => {
  // Первая кнопка карандаша — редактировать первую группу
  await page.locator('button:has(.mdi-pencil)').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('закрытие диалога редактирования группы по «Отмена»', async ({ page }) => {
  await page.locator('button:has(.mdi-pencil)').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /отмена/i }).click();
  await waitForDialogClose(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

// ───── Диалог удаления ─────

test('открывается диалог подтверждения удаления группы', async ({ page }) => {
  // Кнопка корзины у первой группы
  await page.locator('button:has(.mdi-trash-can-outline)').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Подтверждение удаления')).toBeVisible();
});

test('диалог удаления содержит название удаляемой сущности', async ({ page }) => {
  await page.locator('button:has(.mdi-trash-can-outline)').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  // Должен содержать название первой группы «Напитки»
  await expect(page.getByText(/Напитки/)).toBeVisible();
});

test('отмена удаления закрывает диалог', async ({ page }) => {
  await page.locator('button:has(.mdi-trash-can-outline)').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /отмена/i }).click();
  await waitForDialogClose(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('подтверждение удаления — диалог закрывается', async ({ page }) => {
  await page.locator('button:has(.mdi-trash-can-outline)').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /удалить/i }).click();
  await waitForDialogClose(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
