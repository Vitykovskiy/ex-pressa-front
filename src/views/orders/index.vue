<template>
  <div class="customer-page orders-view">
    <section class="customer-hero">
      <div class="orders-view__hero-head">
        <div>
          <p class="customer-eyebrow">History</p>
          <h1 class="customer-title">История заказов</h1>
          <p class="customer-subtitle">
            Статусы, состав и стоимость последних заказов.
          </p>
        </div>

        <button
          class="orders-view__refresh"
          type="button"
          @click="loadOrders"
        >
          <v-progress-circular
            v-if="isLoading"
            indeterminate
            size="16"
            width="2"
            color="primary"
          />
          <v-icon
            v-else
            icon="mdi-refresh"
            size="16"
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
      <v-progress-circular indeterminate size="16" width="2" color="primary" />
      <span>Загружаем историю заказов.</span>
    </div>

    <div
      v-else-if="!orders.length"
      class="customer-empty"
    >
      <div class="customer-empty__icon">☕</div>
      <p class="customer-empty__text">История заказов пока пуста.</p>
    </div>

    <div
      v-else
      class="orders-view__list"
    >
      <v-expansion-panels variant="accordion" class="orders-view__panels">
        <v-expansion-panel
          v-for="order in orders"
          :key="order.id"
          :data-testid="`order-history-${order.id}`"
          class="orders-view__panel"
        >
          <v-expansion-panel-title class="orders-view__panel-title">
            <div class="order-title">
              <div class="order-title__main">
                <div class="order-title__id">
                  Заказ #{{ order.id }}
                </div>
                <div class="order-title__meta">
                  {{ formatDate(order.createdAt) }} · {{ order.items.length }} поз.
                </div>
              </div>

              <div class="order-title__right">
                <span
                  class="order-title__status"
                  :class="statusMap[order.status].className"
                  :data-testid="`order-history-status-${order.id}`"
                >
                  {{ statusMap[order.status].label }}
                </span>
                <strong>{{ order.totalRub }} ₽</strong>
              </div>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text class="orders-view__panel-text">
            <div class="order-card">
              <div class="order-card__slot">
                Слот: {{ order.timeSlot.date }} {{ order.slotTimeFrom }}-{{ order.slotTimeTo }}
              </div>

              <div
                v-for="item in order.items"
                :key="item.id"
                class="order-card__item"
              >
                <div class="order-card__row">
                  <span>
                    {{ item.productName }}
                    <template v-if="item.sizeCode">({{ item.sizeCode }})</template>
                    ×{{ item.quantity }}
                  </span>
                  <strong>{{ item.lineTotalRub }} ₽</strong>
                </div>

                <div
                  v-for="addon in item.addons"
                  :key="addon.id"
                  class="order-card__addon"
                >
                  + {{ addon.addonName }} ×{{ addon.quantity }}
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
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

async function loadOrders(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    orders.value = await fetchOrderHistory();
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
.orders-view {
  gap: 18px;
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
  width: 36px;
  height: 36px;
  margin-top: 2px;
  border: 1px solid var(--customer-border);
  border-radius: 999px;
  color: var(--customer-text-muted);
  background: rgba(255, 255, 255, 0.06);
}

.orders-view__list {
  padding: 0 16px 16px;
}

.orders-view__panels {
  gap: 8px;
}

.orders-view__panel {
  border: 1px solid var(--customer-border);
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

.orders-view__panel-title {
  padding: 14px 16px;
}

.orders-view__panel-text {
  background: rgba(0, 0, 0, 0.15);
}

.order-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.order-title__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-title__id {
  color: var(--customer-text);
  font-size: 14px;
  font-weight: 500;
}

.order-title__meta {
  color: var(--customer-text-soft);
  font-size: 12px;
}

.order-title__right {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--customer-accent);
  font-size: 15px;
  font-weight: 600;
}

.order-title__status {
  display: inline-flex;
  align-items: center;
  border-width: 1px;
  border-style: solid;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 500;
}

.status-created {
  border-color: rgba(255, 200, 50, 0.25);
  background: rgba(255, 200, 50, 0.1);
  color: #ffc832;
}

.status-confirmed {
  border-color: rgba(50, 150, 255, 0.25);
  background: rgba(50, 150, 255, 0.1);
  color: #3296ff;
}

.status-ready {
  border-color: rgba(50, 220, 100, 0.25);
  background: rgba(50, 220, 100, 0.1);
  color: #32dc64;
}

.status-closed {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.42);
}

.status-rejected {
  border-color: rgba(212, 24, 61, 0.25);
  background: rgba(212, 24, 61, 0.1);
  color: #d4183d;
}

.order-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px 16px;
}

.order-card__slot {
  color: var(--customer-text-soft);
  font-size: 11px;
  letter-spacing: 0.05em;
}

.order-card__item {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.order-card__item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.order-card__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
}

.order-card__row strong {
  color: var(--customer-accent);
}

.order-card__addon {
  margin-top: 4px;
  color: var(--customer-text-soft);
  font-size: 11px;
}
</style>
