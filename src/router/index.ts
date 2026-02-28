import { routes } from "@/routes";
import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { AuthStatus } from "@/services/auth/types";
import { RouteNames } from "@/routes";
import { isForcedAuthMode } from "@/config/authMode";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const { status, isAuthorized, initAppAuth } = useAuth();

  if (import.meta.env.DEV && !isForcedAuthMode()) {
    return true;
  }

  if (to.name === RouteNames.AuthRequired) {
    if (status.value === AuthStatus.Idle) {
      void initAppAuth();
    }
    return true;
  }

  if (isAuthorized.value) {
    return true;
  }

  if (status.value === AuthStatus.Idle) {
    void initAppAuth();
  }

  return {
    name: RouteNames.AuthRequired,
    query: { redirect: to.fullPath },
  };
});

export default router;
