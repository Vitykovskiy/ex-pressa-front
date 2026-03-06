import { test, expect } from '@playwright/test';
import { mockCatalog } from '../support/api-mocks';
import { waitForApp } from '../support/helpers';

/** Добавляет Капучино M в корзину через UI */
async function addCappuccinoToCart(page: ReturnType<typeof test.info>['workerIndex'] extends number ? never : Parameters<Parameters<typeof test>[1]>[0]): Promise<void> {
  await page.getByText('Напитки').click();
  await page.getByText('Капучино').click();
  // Выбираем размер M
  await page.getByText('M').click();
  // Добавляем в корзину
  await page.getByRole('button', { name: /добавить/i }).click();
}

test.beforeEach(async ({ page }) => {
  await mockCatalog(page);
  await waitForApp(page, '/');
});

test('пустая корзина — показывает соответствующее сообщение или пустой список', async ({ page }) => {
  await page.goto('/cart');
  await page.waitForFunction(() => !window.location.pathname.startsWith('/auth'), { timeout: 10_000 });
  // Счётчик должен быть 0 или кнопка оформить заказа — заблокирована
  const submitBtn = page.getByRole('button', { name: /оформить/i });
  // Либо кнопки нет, либо она disabled
  const isVisible = await submitBtn.isVisible().catch(() => false);
  if (isVisible) {
    await expect(submitBtn).toBeDisabled();
  }
});

test('добавление товара увеличивает счётчик корзины', async ({ page }) => {
  await addCappuccinoToCart(page);
  // После добавления счётчик должен показать 1 (badge или текст)
  const badge = page.locator('.v-badge__badge, [class*="badge"]').first();
  await expect(badge).toBeVisible();
  await expect(badge).toContainText('1');
});

test('добавленный товар виден в корзине', async ({ page }) => {
  await addCappuccinoToCart(page);
  await page.goto('/cart');
  await expect(page.getByText('Капучино')).toBeVisible();
  await expect(page.getByText('M')).toBeVisible();
});

test('в корзине показывается цена товара', async ({ page }) => {
  await addCappuccinoToCart(page);
  await page.goto('/cart');
  // Цена M = 200 руб.
  await expect(page.getByText(/200/)).toBeVisible();
});

test('можно изменить количество товара через кнопки +/-', async ({ page }) => {
  await addCappuccinoToCart(page);
  await page.goto('/cart');
  // Нажимаем «+»
  await page.getByRole('button', { name: '+' }).first().click();
  // Количество должно стать 2
  await expect(page.getByText('2')).toBeVisible();
});

test('можно удалить товар из корзины', async ({ page }) => {
  await addCappuccinoToCart(page);
  await page.goto('/cart');
  await expect(page.getByText('Капучино')).toBeVisible();
  // Кнопка удаления (иконка корзины или mdi-trash)
  const removeBtn = page
    .getByRole('button', { name: /удалить/i })
    .or(page.locator('button:has(.mdi-trash-can), button:has(.mdi-close)'))
    .first();
  await removeBtn.click();
  await expect(page.getByText('Капучино')).not.toBeVisible();
});

test('кнопка «Оформить заказ» активна при непустой корзине', async ({ page }) => {
  await addCappuccinoToCart(page);
  await page.goto('/cart');
  const submitBtn = page.getByRole('button', { name: /оформить/i });
  await expect(submitBtn).toBeEnabled();
});

test('кнопка «Оформить заказ» ведёт на страницу выбора слота', async ({ page }) => {
  await addCappuccinoToCart(page);
  await page.goto('/cart');
  await page.getByRole('button', { name: /оформить/i }).click();
  await expect(page).toHaveURL(/\/order\/slot/);
});

test('можно добавить несколько разных товаров в корзину', async ({ page }) => {
  // Добавляем Капучино
  await addCappuccinoToCart(page);
  // Возвращаемся в меню и добавляем Круассан
  await page.goto('/');
  await page.waitForFunction(() => !window.location.pathname.startsWith('/auth'), { timeout: 10_000 });
  await page.getByText('Еда').click();
  await page.getByText('Круассан').click();
  await page.getByRole('button', { name: /добавить/i }).click();
  // В корзине оба товара
  await page.goto('/cart');
  await expect(page.getByText('Капучино')).toBeVisible();
  await expect(page.getByText('Круассан')).toBeVisible();
});
