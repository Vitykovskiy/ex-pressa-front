import type { RouteRecordRaw } from "vue-router";
import Menu from "@/views/menu/index.vue";
import MenuItem from "@/views/menuItem/index.vue";
import Cart from "@/views/cart/index.vue";
import AuthRequired from "@/views/auth/index.vue";

export const enum RouteNames {
  Menu = "Menu",
  MenuItem = "MenuItem",
  Cart = "Cart",
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
    path: "/auth",
    name: RouteNames.AuthRequired,
    component: AuthRequired,
  },
];
