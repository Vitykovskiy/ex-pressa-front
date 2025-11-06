import type { DrinkSizes, MenuItem } from "@/services/menu/types";

export interface ICartItem {
  id: number;
  groupId: number | null;
  name: string;
  price: number;
  quantity: number;
  size?: DrinkSizes;
  selectedOptions?: MenuItem[];
}
