import type { DrinkSize, MenuItem } from "@/views/menu/types";

export interface ICartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size?: DrinkSize;
  selectedOptions?: MenuItem[];
}
