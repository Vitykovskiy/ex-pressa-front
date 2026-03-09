<template>
  <div class="auth-view">
    <div class="auth-view__glow" />

    <div class="auth-view__content">
      <div class="auth-view__icon">
        <v-icon
          :icon="statusUi.icon"
          :color="statusUi.iconColor"
          :class="{ 'auth-view__icon--spinning': status === AuthStatus.Checking }"
          size="30"
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
        :variant="status === AuthStatus.Authorized ? 'flat' : 'outlined'"
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
      : "Авторизация прошла успешно. Можете приступить к заказу.";
  }

  if (status.value === AuthStatus.Checking) {
    return AUTHORIZATION_LOADING_MESSAGE;
  }

  if (message.value) {
    return message.value;
  }

  return "Войдите через Telegram для доступа к заказам и истории.";
});

const statusUi = computed(() => {
  switch (status.value) {
    case AuthStatus.Authorized:
      return {
        title: "Добро пожаловать!",
        actionLabel: "Продолжить",
        icon: "mdi-check-circle-outline",
        iconColor: "#32dc64",
      };
    case AuthStatus.Checking:
      return {
        title: "Авторизация...",
        actionLabel: "",
        icon: "mdi-loading",
        iconColor: "#c9a96e",
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
        iconColor:
          message.value === AUTHORIZATION_FAILED_MESSAGE ? "#d4183d" : "#c9a96e",
      };
    default:
      return {
        title: "Требуется вход",
        actionLabel: "Войти через Telegram",
        icon: "mdi-send-outline",
        iconColor: "#c9a96e",
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
  position: relative;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
}

.auth-view__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 38%, rgba(201, 169, 110, 0.08) 0%, transparent 65%);
}

.auth-view__content {
  position: relative;
  display: flex;
  width: min(380px, 100%);
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.auth-view__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border: 1px solid var(--customer-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
}

.auth-view__icon--spinning {
  animation: auth-spin 1s linear infinite;
}

.auth-view__detail {
  color: var(--customer-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.auth-view__hint {
  width: 100%;
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(201, 169, 110, 0.08);
  color: var(--customer-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.auth-view__button.v-btn {
  width: 100%;
  height: 48px;
  border-radius: 14px;
}

.auth-view__button.v-btn--variant-flat {
  background: var(--customer-accent);
  color: var(--customer-bg);
}

.auth-view__button.v-btn--variant-outlined {
  border-color: rgba(201, 169, 110, 0.34);
  color: var(--customer-accent);
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
