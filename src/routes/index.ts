import type { RouteRecordRaw } from "vue-router";
import Menu from "@/views/menu/index.vue";
import MenuItem from "@/views/menuItem/index.vue";
import Cart from "@/views/cart/index.vue";
import AuthRequired from "@/views/auth/index.vue";
import OrdersHistory from "@/views/orders/index.vue";

export const enum RouteNames {
  Menu = "Menu",
  MenuItem = "MenuItem",
  Cart = "Cart",
  OrdersHistory = "OrdersHistory",
  AuthRequired = "AuthRequired",
}

export const routes: RouteRecordRaw[] = [
  {
    path: "/:group?",
    children: [
      {
        path: "",
        name: RouteNames.Menu,
        component: Menu,
      },
      {
        path: "item/:item",
        name: RouteNames.MenuItem,
        component: MenuItem,
      },
    ],
  },
  {
    path: "/cart",
    name: RouteNames.Cart,
    component: Cart,
  },
  {
    path: "/orders",
    name: RouteNames.OrdersHistory,
    component: OrdersHistory,
  },
  {
    path: "/auth",
    name: RouteNames.AuthRequired,
    component: AuthRequired,
  },
];
