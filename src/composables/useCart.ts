import { ref } from "vue";
import type { ICartItem } from "./types";

const cart = ref<ICartItem[]>([]);

export function useCart() {
  function addToCart(item: ICartItem): void {
    cart.value.push(item);
  }

  return { cart, addToCart };
}
