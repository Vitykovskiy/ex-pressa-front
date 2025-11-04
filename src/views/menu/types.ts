export const enum MenuGroupType {
  Drinks = "drinks",
  Food = "food",
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

export interface DrinkSizeVariant extends Omit<BaseEntity, "position"> {
  size: DrinkSize;
  price: number;
}

export interface DrinkMenuItem extends BaseMenuItem {
  sizes: Partial<Record<DrinkSize, DrinkSizeVariant>>;
}

export type MenuItem = DrinkMenuItem | SimpleMenuItem;

export interface GroupItemsMap {
  [MenuGroupType.Drinks]: DrinkMenuItem;
  [MenuGroupType.Food]: SimpleMenuItem;
  [MenuGroupType.Other]: SimpleMenuItem;
}

export interface BaseMenuGroup extends BaseEntity {
  name: string;
}

export type MenuGroup<T extends MenuGroupType = MenuGroupType> =
  BaseMenuGroup & {
    type: T;
    items: GroupItemsMap[T][];
  };

export type DrinksGroup = MenuGroup<MenuGroupType.Drinks>;
export type FoodGroup = MenuGroup<MenuGroupType.Food>;
export type OtherGroup = MenuGroup<MenuGroupType.Other>;

export type AnyMenuGroup = DrinksGroup | FoodGroup | OtherGroup;

export type TableRow = AnyMenuGroup | MenuItem;

export function isMenuGroup(row: TableRow): row is AnyMenuGroup {
  return "items" in row && "type" in row;
}

export function isMenuItem(row: TableRow): row is MenuItem {
  return "name" in row && !("items" in row);
}
