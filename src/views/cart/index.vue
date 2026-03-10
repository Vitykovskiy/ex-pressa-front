<template>
  <div class="customer-page cart-view">
    <section class="customer-hero">
      <p class="customer-eyebrow">{{ cart.length }} позиций</p>
      <h1 class="customer-title">Корзина</h1>
      <p class="customer-subtitle">
        Проверьте состав заказа перед выбором временного слота.
      </p>
    </section>

    <template v-if="cart.length">
      <div class="cart-view__list">
        <article
          v-for="(item, index) in cart"
          :key="`${item.id}-${index}`"
          class="cart-item"
        >
          <div class="cart-item__head">
            <div class="cart-item__title-block">
              <h2 class="cart-item__name">{{ item.name }}</h2>
              <span v-if="item.size" class="cart-item__size">{{ item.size }}</span>
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

          <p
            v-if="item.selectedOptions?.length"
            class="cart-item__addons"
          >
            + {{ item.selectedOptions.map((option) => option.name).join(", ") }}
          </p>

          <div class="cart-item__meta">
            <span>×{{ item.quantity }}</span>
            <strong>{{ item.price * item.quantity }} ₽</strong>
          </div>
        </article>
      </div>

      <div class="cart-view__total-card">
        <span class="cart-view__total-label">Итого к оплате</span>
        <strong class="cart-view__total-value">{{ totalPrice }} ₽</strong>
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
      class="customer-empty cart-view__empty"
    >
      <div class="cart-view__empty-icon">🛒</div>
      <p class="customer-empty__text">Корзина пока пустая. Выберите напиток или десерт в меню.</p>
      <v-btn
        class="cart-view__back-btn"
        @click="onBackToMenu"
      >
        Перейти в меню
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import router from "@/router";
import { useCart } from "@/composables/useCart";
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
.cart-view__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 16px;
}

.cart-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(6, 28, 109, 0.16);
}

.cart-item__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cart-item__title-block {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.cart-item__name {
  margin: 0;
  color: var(--customer-ink);
  font-size: 18px;
  font-weight: 900;
  line-height: 1.15;
}

.cart-item__size {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 10px;
  background: #e7efff;
  color: var(--customer-blue);
  font-size: 12px;
  font-weight: 700;
}

.cart-item__actions {
  display: flex;
  gap: 8px;
}

.cart-item__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  color: var(--customer-blue);
  background: #edf2ff;
}

.cart-item__action--danger {
  color: #ff5500;
  background: #fff0e8;
}

.cart-item__addons {
  margin: 0;
  color: rgba(15, 40, 128, 0.58);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.cart-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(15, 40, 128, 0.6);
  font-size: 14px;
  font-weight: 700;
}

.cart-item__meta strong {
  color: var(--customer-blue);
  font-size: 18px;
  font-weight: 900;
}

.cart-view__total-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 16px 8px;
  border-radius: 24px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.cart-view__total-label {
  font-size: 14px;
  font-weight: 700;
}

.cart-view__total-value {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.cart-view__submit.v-btn {
  height: 52px;
  border-radius: 18px;
  background: var(--customer-orange);
  color: #fff;
  font-weight: 800;
  letter-spacing: 0;
}

.cart-view__empty {
  gap: 0;
}

.cart-view__empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104px;
  height: 104px;
  margin-bottom: 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 42px;
}

.cart-view__back-btn.v-btn {
  margin-top: 20px;
  height: 48px;
  border-radius: 16px;
  background: #fff;
  color: var(--customer-blue);
  font-weight: 800;
}
</style>
