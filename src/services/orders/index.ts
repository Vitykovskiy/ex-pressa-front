import { http } from "@/services/http";
import type {
  CreateOrderDto,
  Order,
  OrdersFilterDto,
  RejectOrderDto,
  UpdateOrderStatusDto,
} from "@/services/menu/types";

export async function createOrderFromCart(
  payload: CreateOrderDto,
): Promise<Order> {
  return http.post<Order, CreateOrderDto>(`/orders/from-cart`, payload);
}

export async function fetchOrderHistory(): Promise<Order[]> {
  return http.get<Order[]>("/orders/history");
}

export async function searchOrders(payload: OrdersFilterDto): Promise<Order[]> {
  return http.post<Order[], OrdersFilterDto>("/orders/search", payload);
}

export async function updateOrderStatus(
  orderId: number,
  payload: UpdateOrderStatusDto,
): Promise<Order> {
  return http.patch<Order, UpdateOrderStatusDto>(
    `/orders/${orderId}/status`,
    payload,
  );
}

export async function rejectOrder(
  orderId: number,
  payload: RejectOrderDto,
): Promise<Order> {
  return http.post<Order, RejectOrderDto>(`/orders/${orderId}/reject`, payload);
}
