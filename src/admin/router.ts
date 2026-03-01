import { createRouter, createWebHistory } from "vue-router";
import { adminRoutes, AdminRouteNames } from "@/admin/routes";
import { useAuth } from "@/composables/useAuth";
import { AuthStatus, RoleCode } from "@/services/auth/types";
import { isForcedAuthMode } from "@/config/authMode";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: adminRoutes,
});

router.beforeEach(async (to) => {
  const { status, isAuthorized, hasAnyRole, initAppAuth } = useAuth();

  const publicRoutes = new Set<AdminRouteNames>([
    AdminRouteNames.AuthRequired,
    AdminRouteNames.AccessDenied,
  ]);

  if (import.meta.env.DEV && !isForcedAuthMode()) {
    return true;
  }

  if (status.value === AuthStatus.Idle) {
    await initAppAuth();
  }

  if (!isAuthorized.value) {
    if (to.name === AdminRouteNames.AuthRequired) {
      return true;
    }
    return { name: AdminRouteNames.AuthRequired };
  }

  if (!hasAnyRole([RoleCode.Barista, RoleCode.Admin])) {
    if (to.name === AdminRouteNames.AccessDenied) {
      return true;
    }
    return { name: AdminRouteNames.AccessDenied };
  }

  if (to.name && publicRoutes.has(to.name as AdminRouteNames)) {
    return { name: AdminRouteNames.Orders };
  }

  return true;
});

export default router;
