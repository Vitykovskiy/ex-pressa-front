import { test, expect } from '@playwright/test';
import { mockCatalog } from '../support/api-mocks';
import { waitForApp } from '../support/helpers';

test.beforeEach(async ({ page }) => {
  await mockCatalog(page);
  await waitForApp(page, '/');
});

test('отображает группы товаров', async ({ page }) => {
  await expect(page.getByText('Напитки')).toBeVisible();
  await expect(page.getByText('Еда')).toBeVisible();
});

test('переходит в группу товаров при клике', async ({ page }) => {
  await page.getByText('Напитки').click();
  await expect(page.getByText('Капучино')).toBeVisible();
  await expect(page.getByText('Латте')).toBeVisible();
});

test('переходит на карточку товара при клике на продукт', async ({ page }) => {
  await page.getByText('Напитки').click();
  await page.getByText('Капучино').click();
  await expect(page).toHaveURL(/\/item\//);
  await expect(page.getByText('Капучино')).toBeVisible();
});

test('страница товара показывает варианты размера для напитков', async ({ page }) => {
  await page.getByText('Напитки').click();
  await page.getByText('Капучино').click();
  // Напитки должны предлагать размеры S / M / L
  await expect(page.getByText('S')).toBeVisible();
  await expect(page.getByText('M')).toBeVisible();
  await expect(page.getByText('L')).toBeVisible();
});

test('страница товара показывает доступные допы', async ({ page }) => {
  await page.getByText('Напитки').click();
  await page.getByText('Капучино').click();
  await expect(page.getByText('Ваниль')).toBeVisible();
  await expect(page.getByText('Карамель')).toBeVisible();
});

test('в шапке есть иконка корзины', async ({ page }) => {
  const cartLink = page.locator('[href="/cart"], a:has([class*="cart"]), button:has([class*="cart"])').first();
  await expect(cartLink.or(page.locator('.v-badge, [class*="badge"]').first())).toBeVisible();
});

test('кнопка «Назад» скрыта на главной странице меню', async ({ page }) => {
  // На корне / кнопка «назад» должна быть скрыта
  const backBtn = page.locator('button[aria-label*="назад"], button:has(.mdi-arrow-left)');
  await expect(backBtn).not.toBeVisible();
});

test('кнопка «Назад» видна внутри группы товаров', async ({ page }) => {
  await page.getByText('Напитки').click();
  const backBtn = page.locator('button:has(.mdi-arrow-left), button[aria-label*="Назад"], .v-app-bar button').first();
  await expect(backBtn).toBeVisible();
});

test('можно вернуться на главную из группы', async ({ page }) => {
  await page.getByText('Напитки').click();
  await expect(page.getByText('Капучино')).toBeVisible();
  await page.goBack();
  await expect(page.getByText('Напитки')).toBeVisible();
  await expect(page.getByText('Еда')).toBeVisible();
});
