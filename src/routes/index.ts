import type { RouteRecordRaw } from "vue-router";
import Menu from "@/views/menu/index.vue";
import MenuCard from "@/views/menuCard/index.vue";

export const enum RouteNames {
  Menu = "Menu",
  MenuCard = "MenuCard",
}

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    children: [
      {
        path: "/:group?",
        name: RouteNames.Menu,
        component: Menu,
      },
      {
        path: "item/:item",
        name: RouteNames.MenuCard,
        component: MenuCard,
      },
    ],
  },
];
