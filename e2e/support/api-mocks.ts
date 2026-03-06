import type { Page } from '@playwright/test';
import {
  mockAddonGroups,
  mockCart,
  mockOrder,
  mockOrderConfirmed,
  mockOrders,
  mockProductById,
  mockProductGroups,
  mockTimeSlots,
} from '../mocks/data';

/** Мок GET /catalog и GET /catalog/products/:id */
export async function mockCatalog(page: Page): Promise<void> {
  // addon-groups должен быть перехвачен раньше /catalog, т.к. URL-ы пересекаются
  await page.route(/\/catalog\/addon-groups(\?.*)?$/, (route) =>
    route.fulfill({ json: mockAddonGroups }),
  );
  await page.route(/\/catalog\/products\/\d+(\?.*)?$/, (route) =>
    route.fulfill({ json: mockProductById }),
  );
  await page.route(/\/catalog(\?.*)?$/, (route) =>
    route.fulfill({ json: mockProductGroups }),
  );
}

/** Моки на запись в каталог (CREATE / UPDATE / DELETE) */
export async function mockCatalogWrites(page: Page): Promise<void> {
  // product-groups CRUD
  await page.route(/\/catalog\/product-groups\/\d+/, (route) => {
    if (route.request().method() === 'DELETE') return route.fulfill({ status: 204, body: '' });
    return route.fulfill({
      json: { ...mockProductGroups[0], name: 'Обновлённая группа' },
    });
  });
  await page.route(/\/catalog\/product-groups$/, (route) =>
    route.fulfill({
      json: {
        id: 99,
        name: 'Новая группа',
        sortOrder: 0,
        isActive: true,
        isAddonsGroup: false,
        products: [],
        addonLinks: [],
      },
    }),
  );

  // products CRUD
  await page.route(/\/catalog\/products\/\d+\/prices/, (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route(/\/catalog\/products\/\d+$/, (route) => {
    if (route.request().method() === 'DELETE') return route.fulfill({ status: 204, body: '' });
    return route.fulfill({ json: { ...mockProductById, name: 'Обновлённый товар' } });
  });
  await page.route(/\/catalog\/products$/, (route) =>
    route.fulfill({ json: { ...mockProductById, id: 99, name: 'Новый товар' } }),
  );
  await page.route(/\/catalog\/product-prices/, (route) =>
    route.fulfill({ json: { id: 99, sizeCode: null, priceRub: 100, isActive: true } }),
  );

  // addon-groups CRUD
  await page.route(/\/catalog\/addon-groups\/link$/, (route) =>
    route.fulfill({ json: { productGroupId: 1, addonGroupId: 1 } }),
  );
  await page.route(/\/catalog\/addon-groups\/\d+$/, (route) => {
    if (route.request().method() === 'DELETE') return route.fulfill({ status: 204, body: '' });
    return route.fulfill({ json: { ...mockAddonGroups[0], name: 'Обновлённая группа допов' } });
  });
  await page.route(/\/catalog\/addon-groups$/, (route) =>
    route.fulfill({
      json: { id: 99, name: 'Новая группа допов', sortOrder: 0, isActive: true, addons: [] },
    }),
  );

  // addons CRUD
  await page.route(/\/catalog\/addons\/\d+$/, (route) => {
    if (route.request().method() === 'DELETE') return route.fulfill({ status: 204, body: '' });
    return route.fulfill({ json: { id: 1, name: 'Обновлённый доп', priceRub: 60, isActive: true } });
  });
  await page.route(/\/catalog\/addons$/, (route) =>
    route.fulfill({ json: { id: 99, name: 'Новый доп', priceRub: 30, isActive: true } }),
  );
}

/** Мок API корзины */
export async function mockCartApi(page: Page): Promise<void> {
  await page.route(/\/cart\/items\/\d+/, (route) =>
    route.fulfill({ json: mockCart }),
  );
  await page.route(/\/cart\/items$/, (route) =>
    route.fulfill({ json: mockCart }),
  );
  await page.route(/\/cart(\?.*)?$/, (route) =>
    route.fulfill({ json: mockCart }),
  );
}

/** Мок API заказов */
export async function mockOrdersApi(
  page: Page,
  orders = mockOrders,
): Promise<void> {
  await page.route(/\/orders\/\d+\/reject$/, (route) =>
    route.fulfill({
      json: { ...mockOrder, status: 'REJECTED', rejectReason: 'Нет ингредиентов' },
    }),
  );
  await page.route(/\/orders\/\d+\/status$/, (route) =>
    route.fulfill({ json: { ...mockOrderConfirmed } }),
  );
  await page.route(/\/orders\/from-cart$/, (route) =>
    route.fulfill({ json: mockOrder }),
  );
  await page.route(/\/orders\/history(\?.*)?$/, (route) =>
    route.fulfill({ json: orders }),
  );
  await page.route(/\/orders\/search$/, (route) =>
    route.fulfill({ json: orders }),
  );
}

/** Мок API тайм-слотов */
export async function mockTimeSlotsApi(page: Page): Promise<void> {
  await page.route(/\/time-slots\/active(\?.*)?$/, (route) =>
    route.fulfill({ json: mockTimeSlots }),
  );
}

/** Полный набор моков для customer-приложения */
export async function setupCustomerMocks(page: Page): Promise<void> {
  await mockCatalog(page);
  await mockCartApi(page);
  await mockOrdersApi(page);
  await mockTimeSlotsApi(page);
}

/** Полный набор моков для admin-приложения */
export async function setupAdminMocks(page: Page): Promise<void> {
  await mockCatalog(page);
  await mockCatalogWrites(page);
}

/** Полный набор моков для barista-приложения */
export async function setupBaristaMocks(
  page: Page,
  orders = mockOrders,
): Promise<void> {
  await mockOrdersApi(page, orders);
}
