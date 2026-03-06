import type { Page } from '@playwright/test';

/**
 * Переходит на URL и ждёт, пока приложение пройдёт авторизацию.
 *
 * В DEV-режиме Vue-приложение автоматически авторизуется (мок-пользователь),
 * но router guard может кратковременно перенаправить на /auth.
 * Функция ждёт, пока мы окажемся не на /auth.
 */
export async function waitForApp(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForFunction(
    () => !window.location.pathname.startsWith('/auth'),
    { timeout: 15_000 },
  );
}

/**
 * Ждёт, пока закроется Vuetify-диалог (исчезнет из DOM).
 */
export async function waitForDialogClose(page: Page): Promise<void> {
  await page.waitForFunction(
    () => !document.querySelector('[role="dialog"]'),
    { timeout: 5_000 },
  );
}
