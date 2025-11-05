import type { OptionsMenuItem } from "../menu/types";

export interface ICartItem {
  id: number;
  name: string;
  size?: string;
  price: number;
  quantity: number;
  selectedOptions?: OptionsMenuItem[];
}
