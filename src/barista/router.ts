import { createRouter, createWebHistory } from "vue-router";
import { baristaRoutes, BaristaRouteNames } from "@/barista/routes";
import { useAuth } from "@/composables/useAuth";
import { AuthStatus, RoleCode } from "@/services/auth/types";
import { isForcedAuthMode } from "@/config/authMode";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: baristaRoutes,
});

router.beforeEach(async (to) => {
  const { status, isAuthorized, hasAnyRole, initAppAuth } = useAuth();

  const publicRoutes = new Set<BaristaRouteNames>([
    BaristaRouteNames.AuthRequired,
    BaristaRouteNames.AccessDenied,
  ]);

  if (import.meta.env.DEV && !isForcedAuthMode()) {
    return true;
  }

  if (status.value === AuthStatus.Idle) {
    await initAppAuth();
  }

  if (!isAuthorized.value) {
    if (to.name === BaristaRouteNames.AuthRequired) {
      return true;
    }
    return { name: BaristaRouteNames.AuthRequired };
  }

  if (!hasAnyRole([RoleCode.Barista])) {
    if (to.name === BaristaRouteNames.AccessDenied) {
      return true;
    }
    return { name: BaristaRouteNames.AccessDenied };
  }

  if (to.name && publicRoutes.has(to.name as BaristaRouteNames)) {
    return { name: BaristaRouteNames.Orders };
  }

  return true;
});

export default router;
