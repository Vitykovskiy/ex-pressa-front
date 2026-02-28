import { ref } from "vue";
import type { ICartItem } from "./types";
import { SizeCode } from "@/services/menu/types";

function createCartStubItems(): ICartItem[] {
  return Array.from({ length: 20 }, (_, index) => {
    const i = index + 1;
    const isDrink = i % 2 === 0;
    const quantity = (i % 3) + 1;
    const basePrice = isDrink ? 180 : 240;

    return {
      id: 10_000 + i,
      groupId: isDrink ? 1 : 2,
      name: isDrink ? `Drink ${i}` : `Dessыыыыыыert ${i}`,
      price: basePrice + (i % 5) * 10,
      quantity,
      size: isDrink
        ? i % 3 === 0
          ? SizeCode.Large
          : i % 3 === 1
            ? SizeCode.Small
            : SizeCode.Medium
        : undefined,
      selectedOptions: isDrink
        ? [
            {
              id: 20_000 + i,
              name: i % 2 === 0 ? "Vanilla syrup" : "Coconut milk",
              priceRub: 40 + (i % 2) * 20,
              isActive: true,
            },
          ]
        : [],
    };
  });
}

const cart = ref<ICartItem[]>([]);
const useMocks = String(import.meta.env.VITE_USE_MOCKS ?? "")
  .trim()
  .toLowerCase();

if (!cart.value.length && ["true", "1", "yes", "on"].includes(useMocks)) {
  cart.value = createCartStubItems();
}

export function useCart() {
  function addToCart(item: ICartItem): void {
    cart.value.push(item);
  }

  function editCartItem(index: number, item: ICartItem): void {
    if (cart.value[index])
      cart.value[index] = { ...cart.value[index], ...item };
  }

  function removeCartItem(index: number): void {
    if (index >= 0 && index < cart.value.length) {
      cart.value.splice(index, 1);
    }
  }

  return { cart, addToCart, editCartItem, removeCartItem };
}
