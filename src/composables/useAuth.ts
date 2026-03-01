import { computed, ref } from "vue";
import { retrieveRawInitData } from "@tma.js/sdk";
import { HttpError } from "@/services/http";
import { authorizeTelegram, fetchMe } from "@/services/auth";
import { AuthStatus, RoleCode, type User } from "@/services/auth/types";
import { buildFullName } from "@/helpers";
import { AuthMode, getAuthMode } from "@/config/authMode";

export const OPEN_APP_BY_TELEGRAM_MESSAGE =
  "Необходимо запустить приложение через Telegram";
export const AUTHORIZATION_FAILED_MESSAGE =
  "Авторизация не удалась, откройте через Telegram";

export const AUTHORIZATION_LOADING_MESSAGE = "Авторизация...";
export const AUTHORIZATION_REQUIRED_TITLE = "Требуется авторизация";
export const AUTHORIZATION_SUCCESS_MESSAGE = "Авторизация успешна";

const status = ref<AuthStatus>(AuthStatus.Idle);
const message = ref<string>("");
const userFullName = ref<string>("");
const currentUser = ref<User | null>(null);

const isAuthorized = computed(() => status.value === AuthStatus.Authorized);
const roleCodes = computed(
  () => currentUser.value?.roles.map((role) => role.code) ?? [],
);

function createMockAuthorizedUser(): User {
  const now = new Date().toISOString();
  const appTarget = String(import.meta.env.VITE_APP_TARGET ?? "customer")
    .trim()
    .toLowerCase();

  const roles =
    appTarget === "admin"
      ? [{ id: 1, code: RoleCode.Admin, name: "Администратор" }]
      : appTarget === "barista"
        ? [{ id: 2, code: RoleCode.Barista, name: "Бариста" }]
        : [{ id: 3, code: RoleCode.User, name: "Пользователь" }];

  return {
    id: 1,
    name: `mock-${appTarget}`,
    tgId: "100000001",
    tgUsername: `mock_${appTarget}`,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    roles,
    fullName: "Тестовый пользователь",
  };
}

function setAuthorized(user: User): void {
  status.value = AuthStatus.Authorized;
  currentUser.value = user;
  userFullName.value = buildFullName(user);
  message.value = "";
}

function setUnauthorized(nextMessage: string): void {
  status.value = AuthStatus.Unauthorized;
  currentUser.value = null;
  userFullName.value = "";
  message.value = nextMessage;
}

export function useAuth() {
  async function initAppAuth(): Promise<void> {
    const authMode = getAuthMode();

    if (authMode === AuthMode.Authorized) {
      setAuthorized(createMockAuthorizedUser());
      return;
    }

    if (authMode === AuthMode.Unauthorized) {
      setUnauthorized(OPEN_APP_BY_TELEGRAM_MESSAGE);
      return;
    }

    if (import.meta.env.DEV) {
      setAuthorized(createMockAuthorizedUser());
      return;
    }

    if (
      status.value === AuthStatus.Checking ||
      status.value === AuthStatus.Authorized
    ) {
      return;
    }

    status.value = AuthStatus.Checking;
    message.value = AUTHORIZATION_LOADING_MESSAGE;
    userFullName.value = "";
    currentUser.value = null;

    try {
      const me = await fetchMe();
      setAuthorized(me);
      return;
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 401) {
        setUnauthorized(AUTHORIZATION_FAILED_MESSAGE);
        return;
      }
    }

    await initTelegramAuth(true);
  }

  async function initTelegramAuth(force = false): Promise<void> {
    const authMode = getAuthMode();

    if (authMode === AuthMode.Authorized) {
      setAuthorized(createMockAuthorizedUser());
      return;
    }

    if (authMode === AuthMode.Unauthorized) {
      setUnauthorized(OPEN_APP_BY_TELEGRAM_MESSAGE);
      return;
    }

    if (
      (!force && status.value === AuthStatus.Checking) ||
      status.value === AuthStatus.Authorized
    ) {
      return;
    }

    status.value = AuthStatus.Checking;
    message.value = AUTHORIZATION_LOADING_MESSAGE;
    userFullName.value = "";
    currentUser.value = null;

    const initData = retrieveRawInitData() || "";
    if (!initData) {
      setUnauthorized(OPEN_APP_BY_TELEGRAM_MESSAGE);
      return;
    }

    try {
      await authorizeTelegram(initData);
      const me = await fetchMe();
      setAuthorized(me);
    } catch {
      setUnauthorized(AUTHORIZATION_FAILED_MESSAGE);
    }
  }

  function hasAnyRole(roles: RoleCode[]): boolean {
    return roles.some((role) => roleCodes.value.includes(role));
  }

  return {
    status,
    message,
    userFullName,
    currentUser,
    roleCodes,
    isAuthorized,
    hasAnyRole,
    initAppAuth,
    initTelegramAuth,
  };
}
