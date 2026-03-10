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
            <span class="header__brand-text">Ex-pressa ☕</span>
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
              v-if="showNavigationButtons"
              class="header__icon-btn"
              icon="mdi-history"
              variant="text"
              :ripple="false"
              @click="onOrders"
            />

            <div v-if="showNavigationButtons" class="cart">
              <v-btn
                class="header__icon-btn"
                data-testid="cart-btn"
                variant="text"
                icon="mdi-cart-variant"
                :ripple="false"
                @click="onCart"
              />
              <div v-if="cartCount" class="cart__counter">
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

const showNavigationButtons = computed(
  () => route.name !== RouteNames.AuthRequired,
);

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
  --customer-blue: #1847e8;
  --customer-blue-dark: #0f2880;
  --customer-blue-deep: #102f99;
  --customer-orange: #ff5500;
  --customer-orange-soft: rgba(255, 85, 0, 0.16);
  --customer-white-soft: rgba(255, 255, 255, 0.18);
  --customer-white-faint: rgba(255, 255, 255, 0.1);
  --customer-text: #ffffff;
  --customer-text-muted: rgba(255, 255, 255, 0.72);
  --customer-text-soft: rgba(255, 255, 255, 0.54);
  --customer-ink: #0f2880;
  --customer-card: #ffffff;
  --customer-card-muted: rgba(255, 255, 255, 0.18);
  --customer-card-border: rgba(255, 255, 255, 0.18);
  --customer-font: "Inter", "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 28%),
    linear-gradient(180deg, #2957ef 0%, #1847e8 42%, #153fd1 100%);
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
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.14), transparent 26%),
    linear-gradient(180deg, #2957ef 0%, #1847e8 34%, #153fd1 100%);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 68px;
  padding: max(env(safe-area-inset-top), 10px) 18px 12px;
  flex: 0 0 auto;
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(24, 71, 232, 0.92);
  backdrop-filter: blur(18px);
}

.header__left,
.header__brand,
.header__right {
  display: flex;
  align-items: center;
}

.header__left {
  width: 48px;
}

.header__brand {
  flex: 1 1 auto;
  justify-content: center;
  text-align: center;
}

.header__right {
  width: 144px;
  justify-content: flex-end;
  gap: 8px;
}

.header__brand-text {
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.header__icon-btn.v-btn {
  width: 40px;
  min-width: 40px;
  height: 40px;
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

.header__icon-btn.v-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}

.app-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.customer-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.customer-hero {
  padding: 26px 20px 18px;
}

.customer-eyebrow {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.74);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.customer-title {
  margin: 0;
  color: #fff;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.03em;
}

.customer-title--xl {
  font-size: 42px;
}

.customer-subtitle {
  margin: 12px 0 0;
  color: var(--customer-text-muted);
  font-size: 15px;
  line-height: 1.55;
}

.customer-section-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 20px 14px;
}

.customer-section-label__text {
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.customer-section-label__line {
  flex: 1 1 auto;
  height: 1px;
  background: rgba(255, 255, 255, 0.16);
}

.customer-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.customer-action-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(24, 71, 232, 0.94);
  backdrop-filter: blur(18px);
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
  width: 88px;
  height: 88px;
  margin-bottom: 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 34px;
}

.customer-empty__text {
  max-width: 280px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 15px;
  line-height: 1.55;
}

.customer-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 20px 14px;
  border-radius: 20px;
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.45;
}

.customer-status--error {
  color: #fff;
  background: rgba(203, 38, 69, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.customer-status--loading {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.cart {
  position: relative;
}

.cart__counter {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--customer-orange);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  pointer-events: none;
}

.version-dialog {
  border-radius: 24px;
  background: linear-gradient(180deg, #1f4cee 0%, #1439ba 100%);
  color: #fff;
}

.version-dialog__title {
  font-size: 24px;
  font-weight: 900;
  color: #fff;
}

.version-dialog__content {
  display: grid;
  gap: 16px;
}

.version-dialog__section {
  display: grid;
  gap: 4px;
}

.version-dialog__section strong,
.version-dialog__section span,
.version-dialog__actions .v-btn {
  color: #fff;
}

.version-dialog__actions {
  padding: 0 16px 16px;
}

@media (max-width: 420px) {
  .customer-title {
    font-size: 30px;
  }

  .customer-title--xl {
    font-size: 36px;
  }

  .header__right {
    width: 128px;
    gap: 6px;
  }

  .customer-action-bar {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}
</style>
