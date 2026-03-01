<template>
  <v-app
    class="app-shell"
    :class="{ 'app-shell--blue': isBlueTheme }"
  >
    <v-main max-width="400">
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
          <div class="cart">
            <v-btn
              class="cart__btn"
              variant="plain"
              icon="mdi-cart-variant"
              @click="onCart"
            />
            <div class="cart__counter">{{ cart.length || "" }}</div>
          </div>
        </div>
      </div>
      <router-view />
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
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
}

:deep(.v-main) {
  padding: 0 10px;
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
