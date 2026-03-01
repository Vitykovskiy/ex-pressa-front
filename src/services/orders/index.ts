import { http } from "@/services/http";
import { USE_MOCKS } from "@/services/mock";
import {
  mockCreateOrderFromCart,
  mockFetchOrderHistory,
  mockSearchOrders,
} from "@/services/mock/api";
import type {
  CreateOrderDto,
  Order,
  OrdersFilterDto,
} from "@/services/menu/types";

export async function createOrderFromCart(
  userId: number,
  payload: CreateOrderDto,
): Promise<Order> {
  if (USE_MOCKS) {
    return mockCreateOrderFromCart(userId, payload);
  }

  return http.post<Order, CreateOrderDto>(
    `/orders/from-cart/${userId}`,
    payload,
  );
}

export async function fetchOrderHistory(
  userId: number | string,
): Promise<Order[]> {
  if (USE_MOCKS) {
    return mockFetchOrderHistory(userId);
  }

  return http.get<Order[]>("/orders/history", {
    headers: { "x-user-id": String(userId) },
  });
}

export async function searchOrders(payload: OrdersFilterDto): Promise<Order[]> {
  if (USE_MOCKS) {
    return mockSearchOrders(payload);
  }

  return http.post<Order[], OrdersFilterDto>("/orders/search", payload);
}
