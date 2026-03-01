import type { RouteRecordRaw } from "vue-router";
import OrdersView from "@/admin/views/orders/index.vue";
import AuthRequiredView from "@/admin/views/authRequired/index.vue";
import AccessDeniedView from "@/admin/views/accessDenied/index.vue";

export const enum AdminRouteNames {
  Orders = "AdminOrders",
  AuthRequired = "AdminAuthRequired",
  AccessDenied = "AdminAccessDenied",
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
  {
    path: "/auth",
    name: AdminRouteNames.AuthRequired,
    component: AuthRequiredView,
  },
  {
    path: "/forbidden",
    name: AdminRouteNames.AccessDenied,
    component: AccessDeniedView,
  },
];
