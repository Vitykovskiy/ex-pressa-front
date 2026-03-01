import type { RouteRecordRaw } from "vue-router";
import OrdersView from "@/barista/views/orders/index.vue";
import AuthRequiredView from "@/barista/views/authRequired/index.vue";
import AccessDeniedView from "@/barista/views/accessDenied/index.vue";

export const enum BaristaRouteNames {
  Orders = "BaristaOrders",
  AuthRequired = "BaristaAuthRequired",
  AccessDenied = "BaristaAccessDenied",
}

export const baristaRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: BaristaRouteNames.Orders,
    component: OrdersView,
  },
  {
    path: "/orders",
    redirect: { name: BaristaRouteNames.Orders },
  },
  {
    path: "/auth",
    name: BaristaRouteNames.AuthRequired,
    component: AuthRequiredView,
  },
  {
    path: "/forbidden",
    name: BaristaRouteNames.AccessDenied,
    component: AccessDeniedView,
  },
];
