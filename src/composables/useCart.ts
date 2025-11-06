import { ref } from "vue";
import type { ICartItem } from "./types";

const cart = ref<ICartItem[]>([]);

export function useCart() {
  function addToCart(item: ICartItem): void {
    cart.value.push(item);
  }

  function editCartItem(index: number, item: ICartItem): void {
    if (cart.value[index])
      cart.value[index] = { ...cart.value[index], ...item };
  }

  return { cart, addToCart, editCartItem };
}
