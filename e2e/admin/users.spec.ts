import { test, expect } from '@playwright/test';
import { setupAdminMocks } from '../support/api-mocks';
import { waitForApp } from '../support/helpers';

test.beforeEach(async ({ page }) => {
  await setupAdminMocks(page);
  await waitForApp(page, '/users');
});

// ───── Отображение списка ─────

test('отображает заголовок «Пользователи»', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Пользователи' })).toBeVisible();
});

test('отображает всех пользователей из списка', async ({ page }) => {
  await expect(page.getByText('Владелец кофейни')).toBeVisible();
  await expect(page.getByText('Анна Бариста')).toBeVisible();
  await expect(page.getByText('Иван Тестовый')).toBeVisible();
});

test('отображает Telegram-юзернеймы пользователей', async ({ page }) => {
  await expect(page.getByText('@owner')).toBeVisible();
  await expect(page.getByText('@barista_1')).toBeVisible();
  await expect(page.getByText('@test_user')).toBeVisible();
});

test('отображает роли пользователей', async ({ page }) => {
  await expect(page.getByText('Admin')).toBeVisible();
  await expect(page.getByText('Barista')).toBeVisible();
  await expect(page.getByText('User')).toBeVisible();
});

test('отображает статус активности: «Активен» и «Отключен»', async ({ page }) => {
  await expect(page.getByText('Активен').first()).toBeVisible();
  await expect(page.getByText('Отключен')).toBeVisible();
});

// ───── Поиск ─────

test('поиск по имени фильтрует список', async ({ page }) => {
  await page.getByPlaceholder('Поиск по имени').fill('Анна');
  await expect(page.getByText('Анна Бариста')).toBeVisible();
  await expect(page.getByText('Владелец кофейни')).not.toBeVisible();
  await expect(page.getByText('Иван Тестовый')).not.toBeVisible();
});

test('поиск по юзернейму фильтрует список', async ({ page }) => {
  await page.getByPlaceholder('Поиск по имени').fill('owner');
  await expect(page.getByText('Владелец кофейни')).toBeVisible();
  await expect(page.getByText('Анна Бариста')).not.toBeVisible();
});

test('очистка поиска возвращает всех пользователей', async ({ page }) => {
  const searchField = page.getByPlaceholder('Поиск по имени');
  await searchField.fill('Анна');
  await expect(page.getByText('Иван Тестовый')).not.toBeVisible();
  await searchField.clear();
  await expect(page.getByText('Иван Тестовый')).toBeVisible();
  await expect(page.getByText('Анна Бариста')).toBeVisible();
});

test('поиск без совпадений — список пуст', async ({ page }) => {
  await page.getByPlaceholder('Поиск по имени').fill('НесуществующийПользователь');
  await expect(page.getByText('Владелец кофейни')).not.toBeVisible();
  await expect(page.getByText('Анна Бариста')).not.toBeVisible();
  await expect(page.getByText('Иван Тестовый')).not.toBeVisible();
});

// ───── Фильтр по роли ─────

test('есть поле фильтра по типу пользователей', async ({ page }) => {
  await expect(page.getByLabel('Типы пользователей')).toBeVisible();
});
