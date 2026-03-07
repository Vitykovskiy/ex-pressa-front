<template>
  <v-app
    class="app-shell"
    :class="{ 'app-shell--blue': isBlueTheme }"
  >
    <v-main class="app-main">
      <div class="app-frame">
        <div
          v-if="!isAuthPage"
          class="header"
        >
          <div class="header__left">
            <v-btn
              v-if="!isMainMenu"
              variant="plain"
              icon="mdi-arrow-left"
              @click="onReturnBtn"
            />
          </div>

          <div class="header__right">
            <v-btn
              variant="plain"
              color="primary"
              icon="mdi-history"
              @click="onOrders"
            />

            <div class="cart">
              <v-btn
                class="cart__btn"
                data-testid="cart-btn"
                variant="plain"
                color="primary"
                icon="mdi-cart-variant"
                @click="onCart"
              />
              <div class="cart__counter">{{ cart.length || "" }}</div>
            </div>
          </div>
        </div>

        <div class="app-content">
          <router-view />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import router from "./router";
import { RouteNames } from "./routes";
import { useCart } from "./composables/useCart";

const route = useRoute();
const { cart } = useCart();
const isBlueTheme =
  String(import.meta.env.VITE_APP_THEME ?? "classic")
    .trim()
    .toLowerCase() === "blue-minimal";

const isMainMenu = computed(
  () => route.name === RouteNames.Menu && !route.params.group,
);
const isAuthPage = computed(() => route.name === RouteNames.AuthRequired);

function onReturnBtn(): void {
  router.back();
}

function onCart(): void {
  router.push({ name: RouteNames.Cart });
}

function onOrders(): void {
  router.push({ name: RouteNames.OrdersHistory });
}
</script>

<style lang="scss" scoped>
.app-main {
  height: 100dvh;
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
}

.app-frame {
  width: 100%;
  max-width: 700px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  flex: 0 0 auto;
}

.app-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.header__right {
  display: flex;
  align-items: center;
}

:deep(.v-main) {
  padding: 0;
}

.app-shell--blue :deep(.v-main) {
  color: #ffffff;
  background:
    radial-gradient(circle at 12% 0%, #5578b4 0%, rgba(85, 120, 180, 0.12) 38%),
    linear-gradient(145deg, #32528b 0%, #4265a0 38%, #486ba7 75%, #5578b4 100%);
}

.app-shell--blue :deep(.v-divider) {
  border-color: rgba(137, 160, 200, 0.45);
}

.app-shell--blue :deep(.v-btn--variant-outlined) {
  border-color: rgba(137, 160, 200, 0.6);
  background-color: rgba(85, 120, 180, 0.18);
}

.app-shell--blue :deep(.v-btn--variant-flat) {
  background-color: #4265a0;
  color: #ffffff;
}

.cart {
  position: relative;

  &__btn {
    color: inherit;
  }

  &__counter {
    position: absolute;
    top: 20px;
    right: 0;

    width: 15px;
    font-size: 13px;

    user-select: none;
    pointer-events: none;
  }
}

.app-shell--blue .cart__btn {
  color: #ffffff;
}
</style>
