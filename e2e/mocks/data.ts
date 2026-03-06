/** Общие фиктивные данные для API-ответов в E2E-тестах */

export const mockProductGroups = [
  {
    id: 1,
    name: 'Напитки',
    sortOrder: 1,
    isActive: true,
    isAddonsGroup: false,
    products: [
      {
        id: 1,
        name: 'Капучино',
        description: 'Вкусный капучино',
        type: 'DRINK',
        isActive: true,
        isAvailable: true,
        sortOrder: 1,
        group: { id: 1, name: 'Напитки' },
        prices: [
          { id: 1, sizeCode: 'S', priceRub: 150, isActive: true },
          { id: 2, sizeCode: 'M', priceRub: 200, isActive: true },
          { id: 3, sizeCode: 'L', priceRub: 250, isActive: true },
        ],
      },
      {
        id: 2,
        name: 'Латте',
        description: 'Нежный латте',
        type: 'DRINK',
        isActive: true,
        isAvailable: true,
        sortOrder: 2,
        group: { id: 1, name: 'Напитки' },
        prices: [
          { id: 4, sizeCode: 'S', priceRub: 160, isActive: true },
          { id: 5, sizeCode: 'M', priceRub: 210, isActive: true },
          { id: 6, sizeCode: 'L', priceRub: 260, isActive: true },
        ],
      },
    ],
    addonLinks: [
      {
        addonGroup: {
          id: 1,
          name: 'Сиропы',
          sortOrder: 1,
          isActive: true,
          addons: [
            { id: 1, name: 'Ваниль', priceRub: 50, isActive: true },
            { id: 2, name: 'Карамель', priceRub: 50, isActive: true },
          ],
        },
      },
    ],
  },
  {
    id: 2,
    name: 'Еда',
    sortOrder: 2,
    isActive: true,
    isAddonsGroup: false,
    products: [
      {
        id: 3,
        name: 'Круассан',
        description: null,
        type: 'FOOD',
        isActive: true,
        isAvailable: true,
        sortOrder: 1,
        group: { id: 2, name: 'Еда' },
        prices: [{ id: 7, sizeCode: null, priceRub: 120, isActive: true }],
      },
    ],
    addonLinks: [],
  },
];

export const mockAddonGroups = [
  {
    id: 1,
    name: 'Сиропы',
    sortOrder: 1,
    isActive: true,
    addons: [
      { id: 1, name: 'Ваниль', priceRub: 50, isActive: true },
      { id: 2, name: 'Карамель', priceRub: 50, isActive: true },
    ],
  },
];

export const mockProductById = {
  id: 1,
  name: 'Капучино',
  description: 'Вкусный капучино',
  type: 'DRINK',
  isActive: true,
  isAvailable: true,
  sortOrder: 1,
  group: { id: 1, name: 'Напитки' },
  prices: [
    { id: 1, sizeCode: 'S', priceRub: 150, isActive: true },
    { id: 2, sizeCode: 'M', priceRub: 200, isActive: true },
    { id: 3, sizeCode: 'L', priceRub: 250, isActive: true },
  ],
};

export const mockCart = {
  id: 1,
  user: { id: 1 },
  items: [],
};

export const mockTimeSlots = [
  {
    id: 1,
    date: '2026-03-06',
    timeFrom: '09:00:00',
    timeTo: '09:10:00',
    capacity: 5,
    bookedCount: 0,
    isActive: true,
  },
  {
    id: 2,
    date: '2026-03-06',
    timeFrom: '09:10:00',
    timeTo: '09:20:00',
    capacity: 5,
    bookedCount: 5, // полный слот
    isActive: true,
  },
  {
    id: 3,
    date: '2026-03-06',
    timeFrom: '09:20:00',
    timeTo: '09:30:00',
    capacity: 5,
    bookedCount: 2,
    isActive: true,
  },
];

export const mockOrder = {
  id: 1,
  status: 'CREATED',
  totalRub: 200,
  slotTimeFrom: '09:00:00',
  slotTimeTo: '09:10:00',
  createdAt: '2026-03-06T09:00:00.000Z',
  confirmedAt: null,
  readyAt: null,
  closedAt: null,
  rejectReason: null,
  user: { id: 1, name: 'Тестовый пользователь' },
  timeSlot: {
    id: 1,
    date: '2026-03-06',
    timeFrom: '09:00:00',
    timeTo: '09:10:00',
    capacity: 5,
    bookedCount: 1,
    isActive: true,
  },
  items: [
    {
      id: 1,
      productName: 'Капучино',
      quantity: 1,
      sizeCode: 'M',
      unitPriceRub: 200,
      lineTotalRub: 200,
      addons: [],
    },
  ],
};

export const mockOrderConfirmed = {
  ...mockOrder,
  id: 2,
  status: 'CONFIRMED',
  timeSlot: { ...mockOrder.timeSlot, id: 2, timeFrom: '09:10:00', timeTo: '09:20:00' },
  slotTimeFrom: '09:10:00',
  slotTimeTo: '09:20:00',
};

export const mockOrderReady = {
  ...mockOrder,
  id: 3,
  status: 'READY',
  timeSlot: { ...mockOrder.timeSlot, id: 3, timeFrom: '09:20:00', timeTo: '09:30:00' },
  slotTimeFrom: '09:20:00',
  slotTimeTo: '09:30:00',
};

export const mockOrderRejected = {
  ...mockOrder,
  id: 4,
  status: 'REJECTED',
  rejectReason: 'Нет ингредиентов',
};

export const mockOrders = [mockOrder, mockOrderConfirmed, mockOrderReady];
export const mockOrderHistory = [mockOrder, mockOrderRejected];
