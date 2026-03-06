import { http } from "@/services/http";
import type {
  AddCartItemDto,
  Cart,
  UpdateCartItemDto,
} from "@/services/menu/types";

export async function fetchCart(): Promise<Cart> {
  return http.get<Cart>(`/cart`);
}

export async function clearCart(): Promise<Cart> {
  return http.delete<Cart>(`/cart`);
}

export async function addCartItem(payload: AddCartItemDto): Promise<Cart> {
  return http.post<Cart, AddCartItemDto>(`/cart/items`, payload);
}

export async function updateCartItem(
  itemId: number,
  payload: UpdateCartItemDto,
): Promise<Cart> {
  return http.patch<Cart, UpdateCartItemDto>(`/cart/items/${itemId}`, payload);
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  return http.delete<Cart>(`/cart/items/${itemId}`);
}
