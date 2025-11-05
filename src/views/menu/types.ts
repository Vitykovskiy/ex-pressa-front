export const enum MenuGroupType {
  Drinks = "drinks",
  Options = "options",
  Other = "other",
}

export const enum DrinkSize {
  Small = "S",
  Medium = "M",
  Large = "L",
}

export interface BaseEntity {
  id: number;
  position: number;
}

export interface BaseMenuItem extends BaseEntity {
  name: string;
  isAvailable: boolean;
}

export interface SimpleMenuItem extends BaseMenuItem {
  price: number;
}

export interface OptionsMenuItem extends BaseMenuItem {
  price?: number;
}

export interface DrinkSizeVariant {
  size: DrinkSize;
  price: number;
}

// тип для "распакованных" размеров в таблице
export type DrinkSizesRecord = Record<DrinkSize, { price: number }>;

export interface DrinkMenuItem extends BaseMenuItem {
  // в данных меню — массив
  sizes: DrinkSizeVariant[];
}

export type MenuItem = DrinkMenuItem | SimpleMenuItem | OptionsMenuItem;

export interface GroupItemsMap {
  [MenuGroupType.Drinks]: DrinkMenuItem;
  [MenuGroupType.Options]: OptionsMenuItem;
  [MenuGroupType.Other]: SimpleMenuItem;
}

export interface BaseMenuGroup extends BaseEntity {
  name: string;
}

type MenuGroup<T extends MenuGroupType = MenuGroupType> = BaseMenuGroup & {
  type: T;
  optionsId?: number;
  items: GroupItemsMap[T][];
};

export type DrinksGroup = MenuGroup<MenuGroupType.Drinks>;
export type OptionsGroup = MenuGroup<MenuGroupType.Options>;
export type OtherGroup = MenuGroup<MenuGroupType.Other>;

export type AnyMenuGroup = DrinksGroup | OptionsGroup | OtherGroup;

// строка, когда показываем список групп
export type GroupTableRow = AnyMenuGroup;
// строка напитка в таблице (после unzip)
export type DrinkTableRow = Omit<DrinkMenuItem, "sizes"> & {
  sizes: DrinkSizesRecord;
};
// строка простого товара (Other/Options)
export type MenuItemTableRow = SimpleMenuItem | DrinkTableRow;

export type TableRow = GroupTableRow | MenuItemTableRow;

// type guards

export function isMenuGroup(row: TableRow): row is AnyMenuGroup {
  return "items" in row && "type" in row;
}

export function isMenuItem(row: TableRow): row is MenuItemTableRow {
  return "name" in row && !("items" in row);
}

export function isDrinkItem(item: unknown): item is DrinkMenuItem {
  return (
    !!item &&
    typeof item === "object" &&
    "sizes" in item &&
    Array.isArray((item as any).sizes)
  );
}

export function isDrinksGroup(item: AnyMenuGroup): item is DrinksGroup {
  return item.type === MenuGroupType.Drinks;
}
