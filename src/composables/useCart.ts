import { ref } from "vue";
import type { ICartItem } from "./types";
import { SizeCode } from "@/services/menu/types";

const mockProducts = [
  { id: 101, groupId: 1, name: "Эспрессо", basePrice: 130, isDrink: true },
  { id: 102, groupId: 1, name: "Капучино", basePrice: 180, isDrink: true },
  { id: 201, groupId: 2, name: "Круассан", basePrice: 210, isDrink: false },
  { id: 202, groupId: 2, name: "Чизкейк", basePrice: 290, isDrink: false },
] as const;

function createCartStubItems(): ICartItem[] {
  return Array.from({ length: 20 }, (_, index) => {
    const i = index + 1;
    const product = mockProducts[index % mockProducts.length]!;
    const quantity = (i % 3) + 1;

    return {
      id: product.id,
      groupId: product.groupId,
      name: product.name,
      price: product.basePrice,
      quantity,
      size: product.isDrink
        ? i % 3 === 0
          ? SizeCode.Large
          : i % 3 === 1
            ? SizeCode.Small
            : SizeCode.Medium
        : undefined,
      selectedOptions: product.isDrink
        ? [
            {
              id: i % 2 === 0 ? 3 : 2,
              name: i % 2 === 0 ? "Ваниль" : "Кокосовое",
              priceRub: i % 2 === 0 ? 40 : 90,
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
