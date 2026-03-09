<template>
  <div class="customer-page cart-view">
    <section class="customer-hero">
      <p class="customer-eyebrow">Checkout</p>
      <h1 class="customer-title">Корзина</h1>
      <p class="customer-subtitle">
        Проверьте состав заказа перед выбором временного слота.
      </p>
      <div class="cart-view__hero-chip">
        <span class="customer-chip">{{ cart.length }} поз.</span>
      </div>
    </section>

    <template v-if="cart.length">
      <div class="customer-section-label">
        <span class="customer-section-label__text">Состав заказа</span>
        <span class="customer-section-label__line" />
      </div>

      <div class="cart-view__list">
        <article
          v-for="(item, index) in cart"
          :key="`${item.id}-${index}`"
          class="cart-item"
          :class="index % 2 === 0 ? 'cart-item--base' : 'cart-item--alt'"
        >
          <div class="cart-item__main">
            <div class="cart-item__head">
              <div>
                <h2 class="cart-item__name">
                  {{ item.name }}
                  <span v-if="item.size">({{ item.size }})</span>
                </h2>
                <p
                  v-if="item.selectedOptions?.length"
                  class="cart-item__addons"
                >
                  + {{ item.selectedOptions.map((option) => option.name).join(", ") }}
                </p>
              </div>

              <div class="cart-item__actions">
                <button
                  class="cart-item__action"
                  type="button"
                  @click="onEditItem(index, item)"
                >
                  <v-icon icon="mdi-pencil-outline" size="16" />
                </button>
                <button
                  class="cart-item__action cart-item__action--danger"
                  type="button"
                  @click="onRemoveItem(index)"
                >
                  <v-icon icon="mdi-trash-can-outline" size="16" />
                </button>
              </div>
            </div>

            <div class="cart-item__meta">
              <span>×{{ item.quantity }}</span>
              <span class="cart-item__price">{{ item.price * item.quantity }} ₽</span>
            </div>
          </div>
        </article>
      </div>

      <div class="cart-view__total">
        <span>Итого</span>
        <strong>{{ totalPrice }} ₽</strong>
      </div>

      <div class="customer-action-bar">
        <v-btn
          block
          class="cart-view__submit"
          @click="onSubmitOrder"
        >
          Оформить заказ · {{ totalPrice }} ₽
        </v-btn>
      </div>
    </template>

    <div
      v-else
      class="customer-empty"
    >
      <div class="customer-empty__icon">🛒</div>
      <p class="customer-empty__text">Пока ничего не добавлено.</p>
      <v-btn
        class="cart-view__back-btn"
        variant="outlined"
        @click="onBackToMenu"
      >
        Перейти в меню
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCart } from "@/composables/useCart";
import { computed } from "vue";
import router from "@/router";
import { RouteNames } from "@/routes";
import type { ICartItem } from "@/composables/types";

defineOptions({
  name: "CartView",
});

const { cart, removeCartItem } = useCart();
const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

function onEditItem(index: number, item: ICartItem): void {
  router.push({
    name: RouteNames.MenuItem,
    params: { group: item.groupId, item: item.id },
    query: {
      cartIndex: index,
      quantity: item.quantity,
      size: item.size,
      options: item.selectedOptions?.map(({ id }) => id),
    },
  });
}

function onSubmitOrder(): void {
  router.push({ name: RouteNames.OrderSlot });
}

function onRemoveItem(index: number): void {
  removeCartItem(index);
}

function onBackToMenu(): void {
  router.push({ name: RouteNames.Menu });
}
</script>

<style lang="scss" scoped>
.cart-view__hero-chip {
  margin-top: 12px;
}

.cart-view__list {
  display: flex;
  flex-direction: column;
}

.cart-item {
  border-bottom: 1px solid var(--customer-border-soft);
}

.cart-item--base {
  background: var(--customer-bg);
}

.cart-item--alt {
  background: var(--customer-bg-soft);
}

.cart-item__main {
  padding: 16px 20px;
}

.cart-item__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cart-item__name {
  color: var(--customer-text);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
}

.cart-item__addons {
  margin-top: 4px;
  color: var(--customer-text-soft);
  font-size: 12px;
  line-height: 1.5;
}

.cart-item__actions {
  display: flex;
  gap: 8px;
}

.cart-item__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: var(--customer-text-muted);
  background: rgba(255, 255, 255, 0.06);
}

.cart-item__action--danger {
  color: var(--customer-danger);
  background: rgba(212, 24, 61, 0.12);
}

.cart-item__meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
  color: var(--customer-text-muted);
  font-size: 12px;
}

.cart-item__price {
  color: var(--customer-accent);
  font-size: 14px;
  font-weight: 600;
}

.cart-view__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--customer-border-soft);
  color: var(--customer-text-muted);
}

.cart-view__total strong {
  color: var(--customer-text);
  font-size: 20px;
}

.cart-view__submit.v-btn {
  height: 48px;
  border-radius: 14px;
  background: var(--customer-accent);
  color: var(--customer-bg);
  font-weight: 600;
}

.cart-view__back-btn.v-btn {
  margin-top: 18px;
  border-color: rgba(201, 169, 110, 0.32);
  color: var(--customer-accent);
}
</style>
