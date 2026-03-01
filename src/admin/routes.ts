import type { RouteRecordRaw } from "vue-router";
import MenuView from "@/admin/views/menu/index.vue";
import UsersView from "@/admin/views/users/index.vue";
import AuthRequiredView from "@/admin/views/authRequired/index.vue";
import AccessDeniedView from "@/admin/views/accessDenied/index.vue";

export const enum AdminRouteNames {
  Menu = "AdminMenu",
  Users = "AdminUsers",
  AuthRequired = "AdminAuthRequired",
  AccessDenied = "AdminAccessDenied",
}

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: { name: AdminRouteNames.Menu },
  },
  {
    path: "/menu",
    name: AdminRouteNames.Menu,
    component: MenuView,
  },
  {
    path: "/users",
    name: AdminRouteNames.Users,
    component: UsersView,
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
