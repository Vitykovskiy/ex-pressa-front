import { http } from "@/services/http";
import type {
  CreateOrderDto,
  Order,
  OrdersFilterDto,
} from "@/services/menu/types";

export async function createOrderFromCart(
  userId: number,
  payload: CreateOrderDto,
): Promise<Order> {
  return http.post<Order, CreateOrderDto>(`/orders/from-cart/${userId}`, payload);
}

export async function fetchOrderHistory(userId: number | string): Promise<Order[]> {
  return http.get<Order[]>("/orders/history", {
    headers: { "x-user-id": String(userId) },
  });
}

export async function searchOrders(payload: OrdersFilterDto): Promise<Order[]> {
  return http.post<Order[], OrdersFilterDto>("/orders/search", payload);
}
