<template>
  <div class="auth-view">
    <div class="auth-view__content">
      <div class="auth-view__icon">
        <v-icon
          :icon="statusUi.icon"
          :class="{ 'auth-view__icon--spinning': status === AuthStatus.Checking }"
          size="34"
        />
      </div>

      <div class="auth-view__text">
        <p class="customer-eyebrow">Telegram access</p>
        <h1 class="customer-title">{{ statusUi.title }}</h1>
        <p class="auth-view__detail">{{ detail }}</p>
      </div>

      <div
        v-if="status === AuthStatus.Unauthorized"
        class="auth-view__hint"
      >
        Функционал заказа доступен только после авторизации через Telegram.
      </div>

      <v-btn
        v-if="status !== AuthStatus.Checking"
        class="auth-view__button"
        :data-testid="
          status === AuthStatus.Authorized
            ? 'auth-continue-btn'
            : 'auth-retry-btn'
        "
        @click="onAction"
      >
        {{ statusUi.actionLabel }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  useAuth,
  AUTHORIZATION_FAILED_MESSAGE,
  AUTHORIZATION_LOADING_MESSAGE,
} from "@/composables/useAuth";
import { AuthStatus } from "@/services/auth/types";
import { RouteNames } from "@/routes";

defineOptions({
  name: "AuthView",
});

const router = useRouter();
const route = useRoute();
const { status, message, userFullName, initAppAuth, initTelegramAuth } = useAuth();

const detail = computed(() => {
  if (status.value === AuthStatus.Authorized) {
    return userFullName.value
      ? `Здравствуйте, ${userFullName.value}`
      : "Авторизация прошла успешно. Можно переходить к заказу.";
  }

  if (status.value === AuthStatus.Checking) {
    return AUTHORIZATION_LOADING_MESSAGE;
  }

  if (message.value) {
    return message.value;
  }

  return "Войдите через Telegram для доступа к меню, заказам и истории.";
});

const statusUi = computed(() => {
  switch (status.value) {
    case AuthStatus.Authorized:
      return {
        title: "Добро пожаловать!",
        actionLabel: "Продолжить",
        icon: "mdi-check-circle-outline",
      };
    case AuthStatus.Checking:
      return {
        title: "Авторизация...",
        actionLabel: "",
        icon: "mdi-loading",
      };
    case AuthStatus.Unauthorized:
      return {
        title:
          message.value === AUTHORIZATION_FAILED_MESSAGE
            ? "Ошибка входа"
            : "Требуется вход",
        actionLabel:
          message.value === AUTHORIZATION_FAILED_MESSAGE
            ? "Попробовать снова"
            : "Войти через Telegram",
        icon:
          message.value === AUTHORIZATION_FAILED_MESSAGE
            ? "mdi-close-circle-outline"
            : "mdi-send-outline",
      };
    default:
      return {
        title: "Требуется вход",
        actionLabel: "Войти через Telegram",
        icon: "mdi-send-outline",
      };
  }
});

function resolveRedirect(): string | null {
  const target = route.query.redirect;
  if (typeof target === "string" && target.trim().length > 0) {
    return target;
  }
  return null;
}

function onAction(): void {
  if (status.value === AuthStatus.Authorized) {
    onContinue();
    return;
  }

  void initTelegramAuth(true);
}

function onContinue(): void {
  const redirect = resolveRedirect();
  if (redirect) {
    router.replace(redirect);
  } else {
    router.replace({ name: RouteNames.Menu });
  }
}

onMounted(() => {
  void initAppAuth();
});

watch(
  () => status.value,
  (next) => {
    if (next === AuthStatus.Authorized) {
      onContinue();
    }
  },
);
</script>

<style lang="scss" scoped>
.auth-view {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
}

.auth-view__content {
  display: flex;
  width: min(420px, 100%);
  flex-direction: column;
  align-items: center;
  gap: 22px;
  text-align: center;
}

.auth-view__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.auth-view__icon--spinning {
  animation: auth-spin 1s linear infinite;
}

.auth-view__detail {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 15px;
  line-height: 1.55;
}

.auth-view__hint {
  width: 100%;
  border-radius: 24px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
}

.auth-view__button.v-btn {
  width: 100%;
  height: 52px;
  border-radius: 18px;
  font-weight: 800;
  letter-spacing: 0;
}

.auth-view__button.v-btn {
  background: #fff;
  color: var(--customer-blue);
}

.auth-view__button[data-testid="auth-continue-btn"].v-btn {
  background: var(--customer-orange);
  color: #fff;
}

@keyframes auth-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
