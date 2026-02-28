import { http } from "@/services/http";
import { USE_MOCKS } from "@/services/mock";
import {
  mockAddCartItem,
  mockClearCart,
  mockFetchCart,
  mockRemoveCartItem,
  mockUpdateCartItem,
} from "@/services/mock/api";
import type {
  AddCartItemDto,
  Cart,
  UpdateCartItemDto,
} from "@/services/menu/types";

export async function fetchCart(userId: number): Promise<Cart> {
  if (USE_MOCKS) {
    return mockFetchCart(userId);
  }

  return http.get<Cart>(`/cart/${userId}`);
}

export async function clearCart(userId: number): Promise<Cart> {
  if (USE_MOCKS) {
    return mockClearCart(userId);
  }

  return http.delete<Cart>(`/cart/${userId}`);
}

export async function addCartItem(
  userId: number,
  payload: AddCartItemDto,
): Promise<Cart> {
  if (USE_MOCKS) {
    return mockAddCartItem(userId, payload);
  }

  return http.post<Cart, AddCartItemDto>(`/cart/${userId}/items`, payload);
}

export async function updateCartItem(
  itemId: number,
  payload: UpdateCartItemDto,
): Promise<Cart> {
  if (USE_MOCKS) {
    return mockUpdateCartItem(itemId, payload);
  }

  return http.patch<Cart, UpdateCartItemDto>(`/cart/items/${itemId}`, payload);
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  if (USE_MOCKS) {
    return mockRemoveCartItem(itemId);
  }

  return http.delete<Cart>(`/cart/items/${itemId}`);
}
