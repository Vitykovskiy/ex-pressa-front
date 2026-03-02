import { ref } from "vue";
import type { ICartItem } from "./types";

const cart = ref<ICartItem[]>([]);

export function useCart() {
  function addToCart(item: ICartItem): void {
    cart.value.push(item);
  }

  function editCartItem(index: number, item: ICartItem): void {
    if (cart.value[index]) {
      cart.value[index] = { ...cart.value[index], ...item };
    }
  }

  function removeCartItem(index: number): void {
    if (index >= 0 && index < cart.value.length) {
      cart.value.splice(index, 1);
    }
  }

  function clearCart(): void {
    cart.value = [];
  }

  return { cart, addToCart, editCartItem, removeCartItem, clearCart };
}
