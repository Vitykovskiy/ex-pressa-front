import { RoleCode, type User } from "@/services/auth/types";
import {
  OrderStatus,
  ProductType,
  SizeCode,
  type AddCartItemDto,
  type Addon,
  type AddonGroup,
  type Cart,
  type CartItem,
  type CreateAddonDto,
  type CreateAddonGroupDto,
  type CreateOrderDto,
  type CreateProductDto,
  type CreateProductGroupDto,
  type CreateProductPriceDto,
  type LinkAddonGroupDto,
  type Order,
  type OrderItem,
  type OrderItemAddon,
  type OrdersFilterDto,
  type Product,
  type ProductGroup,
  type ProductGroupAddonGroup,
  type ProductPrice,
  type RejectOrderDto,
  type TimeSlot,
  type UpdateCartItemDto,
  type UpdateOrderStatusDto,
} from "@/services/menu/types";
import { clone, MOCK_NETWORK_DELAY_MS, wait } from "./index";

const nowIso = () => new Date().toISOString();

const mockUser: User = {
  id: 1,
  name: "demo-user",
  tgId: "100000001",
  tgUsername: "demo_user",
  isActive: true,
  createdAt: nowIso(),
  updatedAt: nowIso(),
  roles: [
    {
      id: 1,
      code: RoleCode.Barista,
      name: "Р‘Р°СЂРёСЃС‚Р°",
    },
  ],
  fullName: "Р”РµРјРѕ РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ",
  firstName: "Р”РµРјРѕ",
  lastName: "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ",
  middleName: null,
};

const addonGroupsStore: AddonGroup[] = [
  {
    id: 1,
    name: "РњРѕР»РѕРєРѕ",
    sortOrder: 1,
    isActive: true,
    addons: [
      { id: 1, name: "РћРІСЃСЏРЅРѕРµ", priceRub: 80, isActive: true },
      { id: 2, name: "РљРѕРєРѕСЃРѕРІРѕРµ", priceRub: 90, isActive: true },
    ],
  },
  {
    id: 2,
    name: "РЎРёСЂРѕРї",
    sortOrder: 2,
    isActive: true,
    addons: [
      { id: 3, name: "Р’Р°РЅРёР»СЊ", priceRub: 40, isActive: true },
      { id: 4, name: "РљР°СЂР°РјРµР»СЊ", priceRub: 40, isActive: true },
    ],
  },
];

const coffeeGroupRef = { id: 1, name: "РљРѕС„Рµ" };
const dessertsGroupRef = { id: 2, name: "Р”РµСЃРµСЂС‚С‹" };

const productGroupsStore: ProductGroup[] = [
  {
    id: coffeeGroupRef.id,
    name: coffeeGroupRef.name,
    sortOrder: 1,
    isActive: true,
    products: [
      {
        id: 101,
        group: coffeeGroupRef,
        name: "Р­СЃРїСЂРµСЃСЃРѕ",
        description: "РљСЂРµРїРєРёР№ Рё РЅР°СЃС‹С‰РµРЅРЅС‹Р№",
        type: ProductType.Drink,
        isActive: true,
        isAvailable: true,
        sortOrder: 1,
        prices: [
          { id: 1001, sizeCode: SizeCode.Small, priceRub: 130, isActive: true },
          {
            id: 1002,
            sizeCode: SizeCode.Medium,
            priceRub: 160,
            isActive: true,
          },
          { id: 1003, sizeCode: SizeCode.Large, priceRub: 190, isActive: true },
        ],
      },
      {
        id: 102,
        group: coffeeGroupRef,
        name: "РљР°РїСѓС‡РёРЅРѕ",
        description: "РЎ РІРѕР·РґСѓС€РЅРѕР№ РјРѕР»РѕС‡РЅРѕР№ РїРµРЅРєРѕР№",
        type: ProductType.Drink,
        isActive: true,
        isAvailable: true,
        sortOrder: 2,
        prices: [
          { id: 1004, sizeCode: SizeCode.Small, priceRub: 180, isActive: true },
          {
            id: 1005,
            sizeCode: SizeCode.Medium,
            priceRub: 220,
            isActive: true,
          },
          { id: 1006, sizeCode: SizeCode.Large, priceRub: 260, isActive: true },
        ],
      },
    ],
    addonLinks: [],
  },
  {
    id: dessertsGroupRef.id,
    name: dessertsGroupRef.name,
    sortOrder: 2,
    isActive: true,
    products: [
      {
        id: 201,
        group: dessertsGroupRef,
        name: "РљСЂСѓР°СЃСЃР°РЅ",
        description: "РЎРІРµР¶Р°СЏ РІС‹РїРµС‡РєР° СЃ РјР°СЃР»РѕРј",
        type: ProductType.Food,
        isActive: true,
        isAvailable: true,
        sortOrder: 1,
        prices: [{ id: 2001, priceRub: 210, isActive: true }],
      },
      {
        id: 202,
        group: dessertsGroupRef,
        name: "Р§РёР·РєРµР№Рє",
        description: "РљР»Р°СЃСЃРёС‡РµСЃРєРёР№ РќСЊСЋ-Р™РѕСЂРє",
        type: ProductType.Food,
        isActive: true,
        isAvailable: true,
        sortOrder: 2,
        prices: [{ id: 2002, priceRub: 290, isActive: true }],
      },
    ],
    addonLinks: [],
  },
];

const coffeeLinks: ProductGroupAddonGroup[] = addonGroupsStore.map((group) => ({
  productGroupId: coffeeGroupRef.id,
  addonGroupId: group.id,
  productGroup: coffeeGroupRef,
  addonGroup: group,
}));
const coffeeGroup = productGroupsStore.find(
  (group) => group.id === coffeeGroupRef.id,
);
if (coffeeGroup) {
  coffeeGroup.addonLinks = coffeeLinks;
}

const timeSlotsStore: TimeSlot[] = [
  {
    id: 1,
    date: "2026-03-01",
    timeFrom: "09:00",
    timeTo: "10:00",
    capacity: 20,
    bookedCount: 5,
    isActive: true,
  },
  {
    id: 2,
    date: "2026-03-01",
    timeFrom: "10:00",
    timeTo: "11:00",
    capacity: 20,
    bookedCount: 19,
    isActive: true,
  },
  {
    id: 3,
    date: "2026-03-01",
    timeFrom: "11:00",
    timeTo: "12:00",
    capacity: 20,
    bookedCount: 20,
    isActive: true,
  },
  {
    id: 4,
    date: "2026-03-01",
    timeFrom: "12:00",
    timeTo: "13:00",
    capacity: 20,
    bookedCount: 7,
    isActive: true,
  },
  {
    id: 5,
    date: "2026-03-02",
    timeFrom: "09:00",
    timeTo: "10:00",
    capacity: 20,
    bookedCount: 4,
    isActive: true,
  },
  {
    id: 6,
    date: "2026-03-02",
    timeFrom: "10:00",
    timeTo: "11:00",
    capacity: 20,
    bookedCount: 0,
    isActive: true,
  },
];

const cartsByUser = new Map<number, Cart>();
const ordersByUser = new Map<number, Order[]>();

const ids = {
  productGroup: 10000,
  product: 20000,
  price: 30000,
  addonGroup: 40000,
  addon: 50000,
  cartItem: 60000,
  order: 70000,
  orderItem: 80000,
  orderItemAddon: 90000,
};

const seededOrders: Order[] = [
  {
    id: 71001,
    user: { id: mockUser.id, name: mockUser.name },
    timeSlot: {
      id: 4,
      date: "2026-03-01",
      timeFrom: "12:00",
      timeTo: "13:00",
    },
    status: OrderStatus.CREATED,
    slotTimeFrom: "12:00",
    slotTimeTo: "13:00",
    totalRub: 990,
    rejectReason: null,
    createdAt: "2026-03-01T08:15:00.000Z",
    confirmedAt: null,
    readyAt: null,
    closedAt: null,
    updatedAt: "2026-03-01T08:15:00.000Z",
    items: [
      {
        id: 81001,
        productName: "РљР°РїСѓС‡РёРЅРѕ",
        quantity: 2,
        sizeCode: SizeCode.Medium,
        unitPriceRub: 220,
        lineTotalRub: 610,
        addons: [
          {
            id: 91001,
            addonName: "Р’Р°РЅРёР»СЊ",
            quantity: 2,
            unitPriceRub: 40,
            lineTotalRub: 80,
          },
          {
            id: 91004,
            addonName: "РљРѕРєРѕСЃРѕРІРѕРµ",
            quantity: 1,
            unitPriceRub: 90,
            lineTotalRub: 90,
          },
        ],
      },
      {
        id: 81004,
        productName: "РљСЂСѓР°СЃСЃР°РЅ",
        quantity: 1,
        unitPriceRub: 210,
        lineTotalRub: 210,
        addons: [],
      },
      {
        id: 81005,
        productName: "Р­СЃРїСЂРµСЃСЃРѕ",
        quantity: 1,
        sizeCode: SizeCode.Small,
        unitPriceRub: 130,
        lineTotalRub: 170,
        addons: [
          {
            id: 91005,
            addonName: "РљР°СЂР°РјРµР»СЊ",
            quantity: 1,
            unitPriceRub: 40,
            lineTotalRub: 40,
          },
        ],
      },
    ],
  },
  {
    id: 71002,
    user: { id: mockUser.id, name: mockUser.name },
    timeSlot: {
      id: 2,
      date: "2026-03-01",
      timeFrom: "10:00",
      timeTo: "11:00",
    },
    status: OrderStatus.CLOSED,
    slotTimeFrom: "10:00",
    slotTimeTo: "11:00",
    totalRub: 290,
    rejectReason: null,
    createdAt: "2026-02-27T10:02:00.000Z",
    confirmedAt: "2026-02-27T10:03:00.000Z",
    readyAt: "2026-02-27T10:17:00.000Z",
    closedAt: "2026-02-27T10:35:00.000Z",
    updatedAt: "2026-02-27T10:35:00.000Z",
    items: [
      {
        id: 81002,
        productName: "Р§РёР·РєРµР№Рє",
        quantity: 1,
        unitPriceRub: 290,
        lineTotalRub: 290,
        addons: [],
      },
    ],
  },
  {
    id: 71003,
    user: { id: mockUser.id, name: mockUser.name },
    timeSlot: {
      id: 3,
      date: "2026-03-01",
      timeFrom: "11:00",
      timeTo: "12:00",
    },
    status: OrderStatus.REJECTED,
    slotTimeFrom: "11:00",
    slotTimeTo: "12:00",
    totalRub: 130,
    rejectReason: "РЎР»РѕС‚ СѓР¶Рµ Р·Р°РїРѕР»РЅРµРЅ",
    createdAt: "2026-02-26T09:55:00.000Z",
    confirmedAt: null,
    readyAt: null,
    closedAt: null,
    updatedAt: "2026-02-26T09:56:20.000Z",
    items: [
      {
        id: 81003,
        productName: "Р­СЃРїСЂРµСЃСЃРѕ",
        quantity: 1,
        sizeCode: SizeCode.Small,
        unitPriceRub: 130,
        lineTotalRub: 130,
        addons: [],
      },
    ],
  },
  {
    id: 71004,
    user: { id: mockUser.id, name: mockUser.name },
    timeSlot: {
      id: 1,
      date: "2026-03-01",
      timeFrom: "09:00",
      timeTo: "10:00",
    },
    status: OrderStatus.CONFIRMED,
    slotTimeFrom: "09:00",
    slotTimeTo: "10:00",
    totalRub: 730,
    rejectReason: null,
    createdAt: "2026-03-01T06:48:00.000Z",
    confirmedAt: "2026-03-01T06:50:15.000Z",
    readyAt: null,
    closedAt: null,
    updatedAt: "2026-03-01T06:50:15.000Z",
    items: [
      {
        id: 81006,
        productName: "РљР°РїСѓС‡РёРЅРѕ",
        quantity: 2,
        sizeCode: SizeCode.Small,
        unitPriceRub: 180,
        lineTotalRub: 440,
        addons: [
          {
            id: 91006,
            addonName: "Р’Р°РЅРёР»СЊ",
            quantity: 1,
            unitPriceRub: 40,
            lineTotalRub: 80,
          },
        ],
      },
      {
        id: 81007,
        productName: "Р§РёР·РєРµР№Рє",
        quantity: 1,
        unitPriceRub: 290,
        lineTotalRub: 290,
        addons: [],
      },
    ],
  },
  {
    id: 71005,
    user: { id: mockUser.id, name: mockUser.name },
    timeSlot: {
      id: 4,
      date: "2026-03-01",
      timeFrom: "12:00",
      timeTo: "13:00",
    },
    status: OrderStatus.READY,
    slotTimeFrom: "12:00",
    slotTimeTo: "13:00",
    totalRub: 420,
    rejectReason: null,
    createdAt: "2026-03-01T07:30:00.000Z",
    confirmedAt: "2026-03-01T07:31:10.000Z",
    readyAt: "2026-03-01T08:00:00.000Z",
    closedAt: null,
    updatedAt: "2026-03-01T08:00:00.000Z",
    items: [
      {
        id: 81008,
        productName: "РљСЂСѓР°СЃСЃР°РЅ",
        quantity: 2,
        unitPriceRub: 210,
        lineTotalRub: 420,
        addons: [],
      },
    ],
  },
  {
    id: 71006,
    user: { id: mockUser.id, name: mockUser.name },
    timeSlot: {
      id: 6,
      date: "2026-03-02",
      timeFrom: "10:00",
      timeTo: "11:00",
    },
    status: OrderStatus.CREATED,
    slotTimeFrom: "10:00",
    slotTimeTo: "11:00",
    totalRub: 560,
    rejectReason: null,
    createdAt: "2026-03-02T07:45:00.000Z",
    confirmedAt: null,
    readyAt: null,
    closedAt: null,
    updatedAt: "2026-03-02T07:45:00.000Z",
    items: [
      {
        id: 81009,
        productName: "Р­СЃРїСЂРµСЃСЃРѕ",
        quantity: 1,
        sizeCode: SizeCode.Large,
        unitPriceRub: 190,
        lineTotalRub: 350,
        addons: [
          {
            id: 91007,
            addonName: "РљРѕРєРѕСЃРѕРІРѕРµ",
            quantity: 1,
            unitPriceRub: 90,
            lineTotalRub: 90,
          },
          {
            id: 91008,
            addonName: "РљР°СЂР°РјРµР»СЊ",
            quantity: 1,
            unitPriceRub: 40,
            lineTotalRub: 40,
          },
        ],
      },
      {
        id: 81010,
        productName: "РљСЂСѓР°СЃСЃР°РЅ",
        quantity: 1,
        unitPriceRub: 210,
        lineTotalRub: 210,
        addons: [],
      },
    ],
  },
  {
    id: 71007,
    user: { id: mockUser.id, name: mockUser.name },
    timeSlot: {
      id: 5,
      date: "2026-03-02",
      timeFrom: "09:00",
      timeTo: "10:00",
    },
    status: OrderStatus.CLOSED,
    slotTimeFrom: "09:00",
    slotTimeTo: "10:00",
    totalRub: 180,
    rejectReason: null,
    createdAt: "2026-03-02T06:10:00.000Z",
    confirmedAt: "2026-03-02T06:12:00.000Z",
    readyAt: "2026-03-02T06:18:00.000Z",
    closedAt: "2026-03-02T06:30:00.000Z",
    updatedAt: "2026-03-02T06:30:00.000Z",
    items: [
      {
        id: 81011,
        productName: "РљР°РїСѓС‡РёРЅРѕ",
        quantity: 1,
        sizeCode: SizeCode.Small,
        unitPriceRub: 180,
        lineTotalRub: 180,
        addons: [],
      },
    ],
  },
  {
    id: 71008,
    user: { id: mockUser.id, name: mockUser.name },
    timeSlot: {
      id: 2,
      date: "2026-03-01",
      timeFrom: "10:00",
      timeTo: "11:00",
    },
    status: OrderStatus.REJECTED,
    slotTimeFrom: "10:00",
    slotTimeTo: "11:00",
    totalRub: 460,
    rejectReason: "РќРµС‚ РЅСѓР¶РЅРѕРіРѕ РёРЅРіСЂРµРґРёРµРЅС‚Р°",
    createdAt: "2026-03-01T07:05:00.000Z",
    confirmedAt: null,
    readyAt: null,
    closedAt: null,
    updatedAt: "2026-03-01T07:06:00.000Z",
    items: [
      {
        id: 81012,
        productName: "Р§РёР·РєРµР№Рє",
        quantity: 1,
        unitPriceRub: 290,
        lineTotalRub: 460,
        addons: [
          {
            id: 91009,
            addonName: "Р’Р°РЅРёР»СЊ",
            quantity: 1,
            unitPriceRub: 40,
            lineTotalRub: 40,
          },
          {
            id: 91010,
            addonName: "РљР°СЂР°РјРµР»СЊ",
            quantity: 1,
            unitPriceRub: 40,
            lineTotalRub: 40,
          },
          {
            id: 91011,
            addonName: "РљРѕРєРѕСЃРѕРІРѕРµ",
            quantity: 1,
            unitPriceRub: 90,
            lineTotalRub: 90,
          },
        ],
      },
    ],
  },
];

ordersByUser.set(mockUser.id, seededOrders);

function nextId(key: keyof typeof ids): number {
  ids[key] += 1;
  return ids[key];
}

async function withMockDelay<T>(valueFactory: () => T): Promise<T> {
  await wait(MOCK_NETWORK_DELAY_MS);
  return clone(valueFactory());
}

function findProductById(productId: number): Product | undefined {
  for (const group of productGroupsStore) {
    const product = group.products.find((p) => p.id === productId);
    if (product) {
      return product;
    }
  }
  return undefined;
}

function findAddonById(addonId: number): Addon | undefined {
  for (const group of addonGroupsStore) {
    const addon = group.addons.find((a) => a.id === addonId);
    if (addon) {
      return addon;
    }
  }
  return undefined;
}

function ensureCart(userId: number): Cart {
  let cart = cartsByUser.get(userId);
  if (!cart) {
    const now = nowIso();
    cart = {
      id: userId,
      user: { id: userId, name: mockUser.name },
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    cartsByUser.set(userId, cart);
  }
  return cart;
}

function updateCartTimestamp(cart: Cart): void {
  cart.updatedAt = nowIso();
}

function findCartAndItemByItemId(itemId: number): {
  cart: Cart;
  item: CartItem;
  index: number;
} | null {
  for (const cart of cartsByUser.values()) {
    const index = cart.items.findIndex((item) => item.id === itemId);
    if (index >= 0) {
      return { cart, item: cart.items[index]!, index };
    }
  }
  return null;
}

function resolveUnitPrice(product: Product, sizeCode?: SizeCode): number {
  if (sizeCode) {
    const bySize = product.prices.find((p) => p.sizeCode === sizeCode);
    if (bySize) {
      return bySize.priceRub;
    }
  }
  return product.prices[0]?.priceRub ?? 0;
}

function findOrderById(orderId: number): Order | null {
  for (const orders of ordersByUser.values()) {
    const order = orders.find((item) => item.id === orderId);
    if (order) {
      return order;
    }
  }
  return null;
}

export async function mockAuthorizeTelegram(initData: string): Promise<void> {
  void initData;
  await withMockDelay(() => undefined);
}

export async function mockFetchMe(): Promise<User> {
  return withMockDelay(() => mockUser);
}

export async function mockFetchMenu(): Promise<ProductGroup[]> {
  return withMockDelay(() => productGroupsStore);
}

export async function mockFetchProductById(id: number): Promise<Product> {
  return withMockDelay(() => {
    const product = findProductById(id);
    if (!product) {
      throw new Error(`Product ${id} not found`);
    }
    return product;
  });
}

export async function mockCreateProductGroup(
  payload: CreateProductGroupDto,
): Promise<ProductGroup> {
  return withMockDelay(() => {
    const created: ProductGroup = {
      id: nextId("productGroup"),
      name: payload.name,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
      products: [],
      addonLinks: [],
    };
    productGroupsStore.push(created);
    return created;
  });
}

export async function mockCreateProduct(
  payload: CreateProductDto,
): Promise<Product> {
  return withMockDelay(() => {
    const group = productGroupsStore.find((g) => g.id === payload.groupId);
    if (!group) {
      throw new Error(`Group ${payload.groupId} not found`);
    }

    const created: Product = {
      id: nextId("product"),
      group: { id: group.id, name: group.name },
      name: payload.name,
      description: payload.description ?? null,
      type: payload.type,
      isActive: payload.isActive ?? true,
      isAvailable: payload.isAvailable ?? true,
      sortOrder: payload.sortOrder ?? 0,
      prices: [],
    };

    group.products.push(created);
    return created;
  });
}

export async function mockCreateProductPrice(
  payload: CreateProductPriceDto,
): Promise<ProductPrice> {
  return withMockDelay(() => {
    const product = findProductById(payload.productId);
    if (!product) {
      throw new Error(`Product ${payload.productId} not found`);
    }

    const created: ProductPrice = {
      id: nextId("price"),
      sizeCode: payload.sizeCode,
      priceRub: payload.priceRub ?? 0,
      isActive: payload.isActive ?? true,
    };

    product.prices.push(created);
    return created;
  });
}

export async function mockCreateAddonGroup(
  payload: CreateAddonGroupDto,
): Promise<AddonGroup> {
  return withMockDelay(() => {
    const created: AddonGroup = {
      id: nextId("addonGroup"),
      name: payload.name,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
      addons: [],
    };
    addonGroupsStore.push(created);
    return created;
  });
}

export async function mockCreateAddon(payload: CreateAddonDto): Promise<Addon> {
  return withMockDelay(() => {
    const group = addonGroupsStore.find((g) => g.id === payload.addonGroupId);
    if (!group) {
      throw new Error(`Addon group ${payload.addonGroupId} not found`);
    }

    const created: Addon = {
      id: nextId("addon"),
      name: payload.name,
      priceRub: payload.priceRub ?? 0,
      isActive: payload.isActive ?? true,
      addonGroup: { id: group.id, name: group.name },
    };
    group.addons.push(created);
    return created;
  });
}

export async function mockLinkAddonGroup(
  payload: LinkAddonGroupDto,
): Promise<ProductGroupAddonGroup> {
  return withMockDelay(() => {
    const productGroup = productGroupsStore.find(
      (group) => group.id === payload.productGroupId,
    );
    const addonGroup = addonGroupsStore.find(
      (group) => group.id === payload.addonGroupId,
    );

    if (!productGroup || !addonGroup) {
      throw new Error("Product group or addon group not found");
    }

    const existing = productGroup.addonLinks.find(
      (link) => link.addonGroupId === addonGroup.id,
    );
    if (existing) {
      return existing;
    }

    const created: ProductGroupAddonGroup = {
      productGroupId: productGroup.id,
      addonGroupId: addonGroup.id,
      productGroup: { id: productGroup.id, name: productGroup.name },
      addonGroup,
    };
    productGroup.addonLinks.push(created);
    return created;
  });
}

export async function mockFetchCart(userId: number): Promise<Cart> {
  return withMockDelay(() => ensureCart(userId));
}

export async function mockClearCart(userId: number): Promise<Cart> {
  return withMockDelay(() => {
    const cart = ensureCart(userId);
    cart.items = [];
    updateCartTimestamp(cart);
    return cart;
  });
}

export async function mockAddCartItem(
  userId: number,
  payload: AddCartItemDto,
): Promise<Cart> {
  return withMockDelay(() => {
    const cart = ensureCart(userId);
    const product = findProductById(payload.productId);
    if (!product) {
      throw new Error(`Product ${payload.productId} not found`);
    }

    const cartItem: CartItem = {
      id: nextId("cartItem"),
      productName: product.name,
      sizeCode: payload.sizeCode,
      quantity: payload.quantity,
      addons: (payload.addons ?? []).map((addonEntry) => {
        const addon = findAddonById(addonEntry.addonId);
        return {
          id: addonEntry.addonId,
          addonName: addon?.name ?? `Addon #${addonEntry.addonId}`,
          quantity: addonEntry.quantity,
        };
      }),
    };

    cart.items.push(cartItem);
    updateCartTimestamp(cart);
    return cart;
  });
}

export async function mockUpdateCartItem(
  itemId: number,
  payload: UpdateCartItemDto,
): Promise<Cart> {
  return withMockDelay(() => {
    const found = findCartAndItemByItemId(itemId);
    if (!found) {
      throw new Error(`Cart item ${itemId} not found`);
    }

    found.item.quantity = payload.quantity;
    updateCartTimestamp(found.cart);
    return found.cart;
  });
}

export async function mockRemoveCartItem(itemId: number): Promise<Cart> {
  return withMockDelay(() => {
    const found = findCartAndItemByItemId(itemId);
    if (!found) {
      throw new Error(`Cart item ${itemId} not found`);
    }

    found.cart.items.splice(found.index, 1);
    updateCartTimestamp(found.cart);
    return found.cart;
  });
}

export async function mockCreateOrderFromCart(
  userId: number,
  payload: CreateOrderDto,
): Promise<Order> {
  return withMockDelay(() => {
    const cart = ensureCart(userId);
    if (!cart.items.length) {
      throw new Error("Cart is empty");
    }

    const slot =
      timeSlotsStore.find((timeSlot) => timeSlot.id === payload.timeSlotId) ??
      timeSlotsStore[0];
    if (!slot) {
      throw new Error("No active time slots");
    }

    const orderItems: OrderItem[] = cart.items.map((cartItem) => {
      const product = productGroupsStore
        .flatMap((group) => group.products)
        .find((candidate) => candidate.name === cartItem.productName);
      const unitPriceRub = product
        ? resolveUnitPrice(product, cartItem.sizeCode)
        : 0;

      const addonRows: OrderItemAddon[] = cartItem.addons.map((addon) => {
        const addonMeta = findAddonById(addon.id);
        const unitAddonPrice = addonMeta?.priceRub ?? 0;
        return {
          id: nextId("orderItemAddon"),
          addonName: addon.addonName,
          quantity: addon.quantity,
          unitPriceRub: unitAddonPrice,
          lineTotalRub: unitAddonPrice * addon.quantity * cartItem.quantity,
        };
      });

      const addonsTotal = addonRows.reduce(
        (sum, addon) => sum + addon.lineTotalRub,
        0,
      );
      const productLineTotal = unitPriceRub * cartItem.quantity;

      return {
        id: nextId("orderItem"),
        productName: cartItem.productName,
        quantity: cartItem.quantity,
        sizeCode: cartItem.sizeCode,
        unitPriceRub,
        lineTotalRub: productLineTotal + addonsTotal,
        addons: addonRows,
      };
    });

    const totalRub = orderItems.reduce(
      (sum, item) => sum + item.lineTotalRub,
      0,
    );
    const now = nowIso();

    const order: Order = {
      id: nextId("order"),
      user: { id: userId, name: mockUser.name },
      timeSlot: {
        id: slot.id,
        date: slot.date,
        timeFrom: slot.timeFrom,
        timeTo: slot.timeTo,
      },
      status: OrderStatus.CREATED,
      slotTimeFrom: slot.timeFrom,
      slotTimeTo: slot.timeTo,
      totalRub,
      rejectReason: null,
      createdAt: now,
      confirmedAt: null,
      readyAt: null,
      closedAt: null,
      updatedAt: now,
      items: orderItems,
    };

    const history = ordersByUser.get(userId) ?? [];
    history.unshift(order);
    ordersByUser.set(userId, history);

    cart.items = [];
    updateCartTimestamp(cart);

    return order;
  });
}

export async function mockFetchOrderHistory(
  userId: number | string,
): Promise<Order[]> {
  return withMockDelay(() => ordersByUser.get(Number(userId)) ?? []);
}

export async function mockSearchOrders(
  payload: OrdersFilterDto,
): Promise<Order[]> {
  return withMockDelay(() => {
    const fromTs = payload.dateFrom ? Date.parse(payload.dateFrom) : null;
    const toTs = payload.dateTo ? Date.parse(payload.dateTo) : null;

    const allOrders = Array.from(ordersByUser.values()).flat();

    return allOrders.filter((order) => {
      if (payload.status?.length && !payload.status.includes(order.status)) {
        return false;
      }

      const createdTs = Date.parse(order.createdAt);
      if (fromTs !== null && createdTs < fromTs) {
        return false;
      }
      if (toTs !== null && createdTs > toTs) {
        return false;
      }

      return true;
    });
  });
}

export async function mockFetchActiveTimeSlots(): Promise<TimeSlot[]> {
  return withMockDelay(() => timeSlotsStore.filter((slot) => slot.isActive));
}

export async function mockUpdateOrderStatus(
  orderId: number,
  payload: UpdateOrderStatusDto,
): Promise<Order> {
  return withMockDelay(() => {
    const order = findOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.status = payload.status;
    const now = nowIso();
    order.updatedAt = now;

    if (payload.status === OrderStatus.CONFIRMED) {
      order.confirmedAt = now;
    }
    if (payload.status === OrderStatus.READY) {
      order.readyAt = now;
    }
    if (payload.status === OrderStatus.CLOSED) {
      order.closedAt = now;
    }

    return order;
  });
}

export async function mockRejectOrder(
  orderId: number,
  payload: RejectOrderDto,
): Promise<Order> {
  return withMockDelay(() => {
    const order = findOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.status = OrderStatus.REJECTED;
    order.rejectReason = payload.reason;
    order.updatedAt = nowIso();
    return order;
  });
}

