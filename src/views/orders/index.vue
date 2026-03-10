<template>
  <div class="customer-page orders-view">
    <section class="customer-hero orders-view__hero">
      <div class="orders-view__hero-head">
        <div>
          <p class="customer-eyebrow">{{ orders.length }} заказов</p>
          <h1 class="customer-title">История</h1>
        </div>

        <button
          class="orders-view__refresh"
          type="button"
          :disabled="isLoading"
          @click="loadOrders"
        >
          <v-icon
            icon="mdi-refresh"
            size="16"
            :class="{ 'orders-view__refresh-icon--spinning': isLoading }"
          />
        </button>
      </div>
    </section>

    <div
      v-if="errorMessage"
      class="customer-status customer-status--error"
    >
      <v-icon icon="mdi-alert-circle-outline" size="16" />
      <span>{{ errorMessage }}</span>
    </div>

    <div
      v-else-if="!orders.length && isLoading"
      class="customer-status customer-status--loading"
    >
      <v-progress-circular indeterminate size="16" width="2" color="white" />
      <span>Загружаем историю заказов.</span>
    </div>

    <div
      v-else-if="!orders.length"
      class="customer-empty"
    >
      <p class="orders-view__empty-text">История заказов пуста</p>
    </div>

    <div
      v-else
      class="orders-view__list"
    >
      <article
        v-for="order in orders"
        :key="order.id"
        :data-testid="`order-history-${order.id}`"
        class="order-card"
        :class="{ 'order-card--muted': isMutedCard(order.status) }"
      >
        <button
          class="order-card__header"
          type="button"
          @click="toggleOrder(order.id)"
        >
          <div class="order-card__header-row">
            <div class="order-card__title-wrap">
              <p class="order-card__title">Заказ #{{ order.id }}</p>
              <span
                class="order-card__status"
                :class="statusMap[order.status].className"
                :data-testid="`order-history-status-${order.id}`"
              >
                {{ statusMap[order.status].label }}
              </span>
            </div>

            <div class="order-card__summary">
              <strong class="order-card__total">{{ order.totalRub }} ₽</strong>
              <v-icon
                :icon="isOpen(order.id) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                size="16"
                class="order-card__chevron"
              />
            </div>
          </div>

          <p class="order-card__meta">
            {{ formatDate(order.createdAt) }} · {{ order.items.length }} поз.
          </p>
        </button>

        <div
          v-if="isOpen(order.id)"
          class="order-card__body"
        >
          <p class="order-card__slot">
            Слот: {{ order.timeSlot.date }} {{ order.slotTimeFrom }}-{{ order.slotTimeTo }}
          </p>

          <div class="order-card__items">
            <div
              v-for="(item, index) in order.items"
              :key="item.id"
              class="order-card__item"
              :class="{ 'order-card__item--last': index === order.items.length - 1 }"
            >
              <div class="order-card__item-row">
                <div class="order-card__item-main">
                  <p class="order-card__item-name">
                    {{ item.productName }}
                    <template v-if="item.sizeCode">({{ item.sizeCode }})</template>
                  </p>
                  <p class="order-card__item-qty">×{{ item.quantity }}</p>
                </div>
                <p class="order-card__item-total">{{ item.lineTotalRub }} ₽</p>
              </div>

              <p
                v-for="addon in item.addons"
                :key="addon.id"
                class="order-card__addon"
              >
                + {{ addon.addonName }} ×{{ addon.quantity }}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { fetchOrderHistory } from "@/services/orders";
import { OrderStatus, type Order } from "@/services/menu/types";

defineOptions({
  name: "OrdersHistoryView",
});

const isLoading = ref(false);
const errorMessage = ref("");
const orders = ref<Order[]>([]);
const openOrderIds = ref<number[]>([]);

const statusMap: Record<
  Order["status"],
  { label: string; className: string }
> = {
  [OrderStatus.CREATED]: { label: "Создан", className: "status-created" },
  [OrderStatus.CONFIRMED]: { label: "Подтвержден", className: "status-confirmed" },
  [OrderStatus.REJECTED]: { label: "Отклонен", className: "status-rejected" },
  [OrderStatus.READY]: { label: "Готов", className: "status-ready" },
  [OrderStatus.CLOSED]: { label: "Закрыт", className: "status-closed" },
};

function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isOpen(orderId: number): boolean {
  return openOrderIds.value.includes(orderId);
}

function toggleOrder(orderId: number): void {
  openOrderIds.value = isOpen(orderId)
    ? openOrderIds.value.filter((id) => id !== orderId)
    : [...openOrderIds.value, orderId];
}

function isMutedCard(status: OrderStatus): boolean {
  return status === OrderStatus.CLOSED || status === OrderStatus.REJECTED;
}

async function loadOrders(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const nextOrders = await fetchOrderHistory();
    orders.value = nextOrders;
    openOrderIds.value = openOrderIds.value.filter((id) =>
      nextOrders.some((order) => order.id === id),
    );
  } catch {
    errorMessage.value = "Не удалось загрузить историю заказов";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void loadOrders();
});
</script>

<style lang="scss" scoped>
.orders-view__hero {
  padding-bottom: 20px;
}

.orders-view__hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.orders-view__refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-top: 4px;
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

.orders-view__refresh-icon--spinning {
  animation: orders-view-spin 0.8s linear infinite;
}

.orders-view__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 24px;
}

.orders-view__empty-text {
  color: rgba(255, 255, 255, 0.84);
  font-size: 16px;
  font-weight: 800;
}

.order-card {
  overflow: hidden;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(6, 28, 109, 0.16);
}

.order-card--muted {
  background: rgba(255, 255, 255, 0.14);
  box-shadow: none;
}

.order-card__header {
  width: 100%;
  padding: 18px;
  text-align: left;
}

.order-card__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.order-card__title-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.order-card__title {
  margin: 0;
  color: var(--customer-ink);
  font-size: 16px;
  font-weight: 900;
}

.order-card--muted .order-card__title {
  color: #fff;
}

.order-card__status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 800;
}

.order-card__summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-card__total {
  color: var(--customer-blue);
  font-size: 18px;
  font-weight: 900;
}

.order-card--muted .order-card__total {
  color: #fff;
}

.order-card__chevron {
  color: rgba(15, 40, 128, 0.4);
}

.order-card--muted .order-card__chevron {
  color: rgba(255, 255, 255, 0.7);
}

.order-card__meta {
  margin: 0;
  color: rgba(15, 40, 128, 0.5);
  font-size: 12px;
  font-weight: 600;
}

.order-card--muted .order-card__meta {
  color: rgba(255, 255, 255, 0.62);
}

.order-card__body {
  padding: 0 18px 18px;
}

.order-card__slot {
  margin: 0 0 12px;
  color: rgba(15, 40, 128, 0.58);
  font-size: 12px;
  font-weight: 700;
}

.order-card--muted .order-card__slot {
  color: rgba(255, 255, 255, 0.68);
}

.order-card__items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-card__item {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(15, 40, 128, 0.08);
}

.order-card--muted .order-card__item {
  border-bottom-color: rgba(255, 255, 255, 0.14);
}

.order-card__item--last {
  padding-bottom: 0;
  border-bottom: 0;
}

.order-card__item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.order-card__item-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.order-card__item-name,
.order-card__item-qty,
.order-card__item-total,
.order-card__addon {
  margin: 0;
}

.order-card__item-name {
  color: var(--customer-ink);
  font-size: 14px;
  font-weight: 800;
}

.order-card--muted .order-card__item-name {
  color: #fff;
}

.order-card__item-qty,
.order-card__addon {
  color: rgba(15, 40, 128, 0.52);
  font-size: 12px;
  font-weight: 600;
}

.order-card--muted .order-card__item-qty,
.order-card--muted .order-card__addon {
  color: rgba(255, 255, 255, 0.62);
}

.order-card__item-total {
  color: var(--customer-blue);
  font-size: 14px;
  font-weight: 900;
}

.order-card--muted .order-card__item-total {
  color: #fff;
}

.status-created {
  color: #cc8800;
  background: #fff6da;
}

.status-confirmed {
  color: var(--customer-blue);
  background: #e6eeff;
}

.status-ready {
  color: #0d9b52;
  background: #e3fff0;
}

.status-closed {
  color: rgba(255, 255, 255, 0.74);
  background: rgba(255, 255, 255, 0.12);
}

.status-rejected {
  color: #ff4b59;
  background: #ffe7ea;
}

@keyframes orders-view-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
