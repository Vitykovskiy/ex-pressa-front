import type { RouteRecordRaw } from "vue-router";
import OrdersView from "@/admin/views/orders/index.vue";

export const enum AdminRouteNames {
  Orders = "AdminOrders",
}

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: AdminRouteNames.Orders,
    component: OrdersView,
  },
  {
    path: "/orders",
    redirect: { name: AdminRouteNames.Orders },
  },
];
