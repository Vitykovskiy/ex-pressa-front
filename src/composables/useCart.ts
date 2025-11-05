import { ref } from "vue";
import type { ICartItem } from "./types";

const cart = ref<ICartItem[]>([
  {
    id: 202,
    name: "Мокка",
    price: 250,
    quantity: 2,
    size: "M",
    selectedOptions: [
      {
        id: 602,
        name: "Доп. шот эспрессо",
        price: 50,
        position: 2,
        isAvailable: true,
      },
      {
        id: 601,
        name: "Молоко безлактозное",
        price: 30,
        position: 1,
        isAvailable: true,
      },
      { id: 603, name: "Сироп", price: 20, position: 3, isAvailable: true },
      { id: 604, name: "Сахар", position: 4, isAvailable: true },
      { id: 605, name: "Корица", position: 5, isAvailable: true },
    ],
  },
]);

export function useCart() {
  function addToCart(item: ICartItem): void {
    cart.value.push(item);
  }

  return { cart, addToCart };
}
