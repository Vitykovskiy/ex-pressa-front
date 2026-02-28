import {
  ProductType,
  SizeCode,
  type ProductGroup,
  type Product,
} from "@/services/menu/types";

export interface DrinkSizeVariant {
  size: SizeCode;
  price: number;
}

export type DrinkSizesRecord = Record<SizeCode, { price: number }>;

export type TableRow =
  | GroupTableRowItem
  | DrinkTableRowItem
  | OtherTableRowItem;

export interface GroupTableRowItem {
  id: ProductGroup["id"];
  name: ProductGroup["name"];
}

export interface DrinkTableRowItem {
  id: Product["id"];
  name: Product["name"];
  type: ProductType.Drink;
  sizes: Record<SizeCode, { price: number }>;
}

export interface OtherTableRowItem {
  id: Product["id"];
  name: Product["name"];
  price: number;
  type: Exclude<ProductType, ProductType.Drink>;
}

export function isGroupRow(item: TableRow): item is GroupTableRowItem {
  return !("type" in item);
}
