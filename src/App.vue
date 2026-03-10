<template>
  <v-app class="app-shell">
    <v-main class="app-main">
      <div class="app-frame">
        <header class="header">
          <div class="header__left">
            <v-btn
              v-if="!isRootRoute"
              class="header__icon-btn"
              icon="mdi-arrow-left"
              variant="text"
              :ripple="false"
              @click="onReturnBtn"
            />
          </div>

          <div class="header__brand">
            <span class="header__brand-text">Ex-pressa</span>
          </div>

          <div class="header__right">
            <v-btn
              v-if="showVersionButton"
              class="header__icon-btn"
              icon="mdi-information-outline"
              variant="text"
              :ripple="false"
              @click="isVersionDialogOpen = true"
            />

            <v-btn
              class="header__icon-btn"
              icon="mdi-history"
              variant="text"
              :ripple="false"
              @click="onOrders"
            />

            <div class="cart">
              <v-btn
                class="header__icon-btn"
                data-testid="cart-btn"
                variant="text"
                icon="mdi-cart-variant"
                :ripple="false"
                @click="onCart"
              />
              <div
                v-if="cartCount"
                class="cart__counter"
              >
                {{ cartCount }}
              </div>
            </div>
          </div>
        </header>

        <div class="app-content">
          <router-view />
        </div>
      </div>
    </v-main>

    <v-dialog
      v-model="isVersionDialogOpen"
      max-width="420"
    >
      <v-card class="version-dialog">
        <v-card-title class="version-dialog__title">Версия приложения</v-card-title>
        <v-card-text class="version-dialog__content">
          <div class="version-dialog__section">
            <strong>Frontend</strong>
            <span>{{ frontendVersion.version }}</span>
            <span>{{ frontendVersion.generatedAt }}</span>
          </div>

          <div class="version-dialog__section">
            <strong>Backend</strong>
            <span v-if="backendVersion">{{ backendVersion.version }}</span>
            <span v-else-if="backendVersionError">{{ backendVersionError }}</span>
            <span v-else>Загрузка...</span>
            <span v-if="backendVersion">{{ backendVersion.generatedAt }}</span>
          </div>
        </v-card-text>
        <v-card-actions class="version-dialog__actions">
          <v-spacer />
          <v-btn variant="text" @click="isVersionDialogOpen = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { SHOW_VERSION_BUTTON } from "@/config/versionInfo";
import { APP_VERSION_INFO } from "@/generated/app-version";
import { fetchHealth, type AppVersionInfo } from "@/services/system";
import router from "./router";
import { RouteNames } from "./routes";
import { useCart } from "./composables/useCart";

const route = useRoute();
const { cart } = useCart();
const showVersionButton = SHOW_VERSION_BUTTON;
const frontendVersion = APP_VERSION_INFO;
const isVersionDialogOpen = ref(false);
const backendVersion = ref<AppVersionInfo | null>(null);
const backendVersionError = ref("");

const cartCount = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity, 0),
);
const isRootRoute = computed(() => {
  if (route.name === RouteNames.AuthRequired) {
    return true;
  }

  return route.name === RouteNames.Menu && !route.params.group;
});

function onReturnBtn(): void {
  router.back();
}

function onCart(): void {
  router.push({ name: RouteNames.Cart });
}

function onOrders(): void {
  router.push({ name: RouteNames.OrdersHistory });
}

async function loadBackendVersion(): Promise<void> {
  backendVersionError.value = "";

  try {
    const response = await fetchHealth();
    backendVersion.value = response.app ?? null;
    if (!response.app) {
      backendVersionError.value = "Версия недоступна";
    }
  } catch {
    backendVersionError.value = "Не удалось получить версию";
  }
}

onMounted(() => {
  if (showVersionButton) {
    void loadBackendVersion();
  }
});
</script>

<style lang="scss">
.app-shell {
  --customer-bg: #0d1b35;
  --customer-bg-strong: #081225;
  --customer-bg-soft: #101f3e;
  --customer-surface: rgba(255, 255, 255, 0.04);
  --customer-surface-strong: rgba(255, 255, 255, 0.08);
  --customer-border: rgba(255, 255, 255, 0.08);
  --customer-border-soft: rgba(255, 255, 255, 0.06);
  --customer-text: #ffffff;
  --customer-text-muted: rgba(255, 255, 255, 0.48);
  --customer-text-soft: rgba(255, 255, 255, 0.34);
  --customer-accent: #c9a96e;
  --customer-accent-soft: rgba(201, 169, 110, 0.14);
  --customer-danger: #d4183d;
  --customer-font: "Inter", "Roboto", "Segoe UI", sans-serif;
  --customer-display-font: "Playfair Display", Georgia, "Times New Roman", serif;
  background:
    radial-gradient(circle at top left, rgba(201, 169, 110, 0.14), transparent 34%),
    linear-gradient(180deg, #122447 0%, #0d1b35 24%, #081225 100%);
  color: var(--customer-text);
  font-family: var(--customer-font);
}

.app-shell .v-application__wrap {
  min-height: 100dvh;
}

.app-shell .v-main {
  padding: 0;
}

.app-main {
  height: 100dvh;
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.app-frame {
  width: 100%;
  max-width: 700px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(13, 27, 53, 0.96), rgba(8, 18, 37, 0.98));
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: max(env(safe-area-inset-top), 8px) 16px 10px;
  flex: 0 0 auto;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(14px);
  background: rgba(13, 27, 53, 0.9);
  border-bottom: 1px solid var(--customer-border-soft);
}

.app-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.header__left,
.header__brand,
.header__right {
  display: flex;
  align-items: center;
}

.header__left {
  width: 44px;
}

.header__right {
  width: 124px;
  justify-content: flex-end;
  gap: 4px;
}

.header__brand {
  flex: 1 1 auto;
  justify-content: center;
  text-align: center;
}

.header__brand-text {
  color: var(--customer-accent);
  font-family: var(--customer-display-font);
  font-size: 16px;
  letter-spacing: 0.08em;
}

.header__icon-btn.v-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 999px;
  color: var(--customer-text);
  background: rgba(255, 255, 255, 0.08);
}

.header__icon-btn.v-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.customer-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.customer-hero {
  padding: 28px 20px;
  border-bottom: 1px solid var(--customer-border-soft);
}

.customer-eyebrow {
  margin-bottom: 6px;
  color: var(--customer-accent);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.customer-title {
  margin: 0 0 8px;
  color: var(--customer-text);
  font-family: var(--customer-display-font);
  font-size: 28px;
  line-height: 1.1;
}

.customer-title--xl {
  font-size: 32px;
  line-height: 1.15;
}

.customer-subtitle {
  margin: 0;
  color: var(--customer-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.customer-section-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 12px;
  border-bottom: 1px solid var(--customer-border-soft);
}

.customer-section-label__text {
  color: var(--customer-accent);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.customer-section-label__line {
  flex: 1 1 auto;
  height: 1px;
  background: var(--customer-border-soft);
}

.customer-chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(201, 169, 110, 0.24);
  border-radius: 999px;
  padding: 3px 12px;
  color: var(--customer-accent);
  background: var(--customer-accent-soft);
  font-size: 12px;
}

.customer-action-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(13, 27, 53, 0.96);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--customer-border);
}

.customer-empty {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  text-align: center;
}

.customer-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 18px;
  border: 1px solid var(--customer-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--customer-accent);
  font-size: 28px;
}

.customer-empty__text {
  color: var(--customer-text-muted);
  font-size: 15px;
  line-height: 1.5;
}

.customer-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 20px;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.5;
}

.customer-status--error {
  color: #ff8f9f;
  background: rgba(212, 24, 61, 0.12);
  border: 1px solid rgba(212, 24, 61, 0.28);
}

.customer-status--loading {
  color: var(--customer-accent);
  background: rgba(201, 169, 110, 0.1);
  border: 1px solid rgba(201, 169, 110, 0.22);
}

.cart {
  position: relative;
}

.cart__counter {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--customer-accent);
  color: var(--customer-bg);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  pointer-events: none;
}

.version-dialog {
  background: linear-gradient(180deg, rgba(16, 31, 62, 0.98), rgba(8, 18, 37, 1));
  color: var(--customer-text);
  border: 1px solid var(--customer-border);
}

.version-dialog__title {
  font-family: var(--customer-display-font);
  letter-spacing: 0.04em;
}

.version-dialog__content {
  display: grid;
  gap: 16px;
}

.version-dialog__section {
  display: grid;
  gap: 4px;
}

.version-dialog__section strong {
  color: var(--customer-accent);
}

.version-dialog__actions {
  padding: 0 16px 16px;
}

@media (max-width: 420px) {
  .customer-title {
    font-size: 24px;
  }

  .customer-action-bar {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}
</style>
