import type { DrinkSize, MenuItem } from "@/views/menu/types";

export interface ICartItem {
  id: number;
  groupId: number | null;
  name: string;
  price: number;
  quantity: number;
  size?: DrinkSize;
  selectedOptions?: MenuItem[];
}
