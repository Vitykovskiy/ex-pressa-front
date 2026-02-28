import { computed, ref } from "vue";
import { retrieveRawInitData } from "@tma.js/sdk";
import { HttpError } from "@/services/http";
import { authorizeTelegram, fetchMe } from "@/services/auth";
import { AuthStatus } from "@/services/auth/types";
import { buildFullName } from "@/helpers";

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
const isAuthorized = computed(() => status.value === AuthStatus.Authorized);

export function useAuth() {
  async function initAppAuth(): Promise<void> {
    if (import.meta.env.DEV) {
      status.value = AuthStatus.Authorized;
      message.value = "";
      userFullName.value = "";
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

    try {
      const me = await fetchMe();
      status.value = AuthStatus.Authorized;
      userFullName.value = buildFullName(me);
      message.value = "";
      return;
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 401) {
        status.value = AuthStatus.Unauthorized;
        message.value = AUTHORIZATION_FAILED_MESSAGE;
        userFullName.value = "";
        return;
      }
    }

    await initTelegramAuth(true);
  }

  async function initTelegramAuth(force = false): Promise<void> {
    if (
      (!force && status.value === AuthStatus.Checking) ||
      status.value === AuthStatus.Authorized
    ) {
      return;
    }

    status.value = AuthStatus.Checking;
    message.value = AUTHORIZATION_LOADING_MESSAGE;
    userFullName.value = "";

    const initData = retrieveRawInitData() || "";
    if (!initData) {
      status.value = AuthStatus.Unauthorized;
      message.value = OPEN_APP_BY_TELEGRAM_MESSAGE;
      userFullName.value = "";
      return;
    }

    try {
      await authorizeTelegram(initData);
      const me = await fetchMe();
      status.value = AuthStatus.Authorized;
      userFullName.value = buildFullName(me);
      message.value = "";
    } catch (error) {
      const fallbackMessage = AUTHORIZATION_FAILED_MESSAGE;

      if (error instanceof HttpError && error.status === 401) {
        message.value = fallbackMessage;
      } else {
        message.value = fallbackMessage;
      }

      status.value = AuthStatus.Unauthorized;
      userFullName.value = "";
    }
  }

  return {
    status,
    message,
    userFullName,
    isAuthorized,
    initAppAuth,
    initTelegramAuth,
  };
}
