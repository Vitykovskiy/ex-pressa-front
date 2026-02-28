<template>
  <v-container class="auth" fluid>
    <v-card class="auth__card" elevation="2">
      <v-card-title class="auth__title">{{ title }}</v-card-title>
      <v-card-text class="auth__text">
        <div class="auth__status" :data-status="status">
          {{ detail }}
        </div>
        <div v-if="status === AuthStatus.Unauthorized" class="auth__hint">
          Часть функционала доступна после авторизации через Telegram.
        </div>
      </v-card-text>
      <v-card-actions class="auth__actions">
        <v-btn
          v-if="status !== AuthStatus.Authorized"
          color="primary"
          variant="flat"
          @click="onRetry"
        >
          Попробовать снова
        </v-btn>
        <v-btn v-else color="primary" variant="flat" @click="onContinue">
          Продолжить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth, AUTHORIZATION_REQUIRED_TITLE, AUTHORIZATION_SUCCESS_MESSAGE } from "@/composables/useAuth";
import { AuthStatus } from "@/services/auth/types";
import { RouteNames } from "@/routes";

const router = useRouter();
const route = useRoute();
const { status, message, userFullName, initAppAuth } = useAuth();

const title = computed(() => {
  if (status.value === AuthStatus.Authorized) {
    return AUTHORIZATION_SUCCESS_MESSAGE;
  }
  if (status.value === AuthStatus.Checking) {
    return "Авторизация в процессе";
  }
  return AUTHORIZATION_REQUIRED_TITLE;
});

const detail = computed(() => {
  if (status.value === AuthStatus.Authorized) {
    return userFullName.value ? `Здравствуйте, ${userFullName.value}` : "Вы вошли в систему.";
  }
  if (message.value) {
    return message.value;
  }
  return "Требуется авторизация через Telegram.";
});

function resolveRedirect(): string | null {
  const target = route.query.redirect;
  if (typeof target === "string" && target.trim().length > 0) {
    return target;
  }
  return null;
}

async function onRetry(): Promise<void> {
  await initAppAuth();
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
.auth {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 40px);
  padding: 24px 12px;
}

.auth__card {
  width: min(420px, 100%);
}

.auth__title {
  font-size: 20px;
  font-weight: 600;
}

.auth__text {
  font-size: 15px;
  line-height: 1.4;
}

.auth__status {
  margin-bottom: 12px;
}

.auth__hint {
  color: #6b6b6b;
}

.auth__actions {
  justify-content: flex-end;
}
</style>
