<template>
  <div class="orders-view">
    <div class="orders-view__head">
      <h2>История заказов</h2>
      <v-btn
        icon="mdi-refresh"
        variant="text"
        color="primary"
        :loading="isLoading"
        @click="loadOrders"
      />
    </div>

    <v-progress-linear
      v-if="isLoading"
      color="primary"
      indeterminate
    />

    <v-alert
      v-else-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      class="orders-view__error"
    >
      {{ errorMessage }}
    </v-alert>

    <div
      v-else-if="!orders.length"
      class="orders-view__empty"
    >
      Заказов пока нет
    </div>

    <v-expansion-panels
      v-else
      variant="accordion"
    >
      <v-expansion-panel
        v-for="order in orders"
        :key="order.id"
        :data-testid="`order-history-${order.id}`"
      >
        <v-expansion-panel-title>
          <div class="order-title">
            <div class="order-title__main">
              <div class="order-title__id">Заказ #{{ order.id }}</div>
              <div class="order-title__meta">
                {{ formatDate(order.createdAt) }} ·
                {{ order.items.length }} поз.
              </div>
            </div>
            <div class="order-title__right">
              <v-chip
                size="small"
                :data-testid="`order-history-status-${order.id}`"
                :color="statusMap[order.status].color"
                variant="tonal"
              >
                {{ statusMap[order.status].label }}
              </v-chip>
              <strong>{{ order.totalRub }} ₽</strong>
            </div>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div class="order-card">
            <div class="order-card__slot">
              Слот: {{ order.timeSlot.date }} {{ order.slotTimeFrom }}-{{
                order.slotTimeTo
              }}
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
                  x{{ item.quantity }}
                </span>
                <strong>{{ item.lineTotalRub }} ₽</strong>
              </div>
              <div
                v-for="addon in item.addons"
                :key="addon.id"
                class="order-card__addon"
              >
                + {{ addon.addonName }} x{{ addon.quantity }}
              </div>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
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

const statusMap: Record<Order["status"], { label: string; color: string }> = {
  [OrderStatus.CREATED]: { label: "Создан", color: "info" },
  [OrderStatus.CONFIRMED]: { label: "Подтвержден", color: "primary" },
  [OrderStatus.REJECTED]: { label: "Отклонен", color: "error" },
  [OrderStatus.READY]: { label: "Готов", color: "success" },
  [OrderStatus.CLOSED]: { label: "Закрыт", color: "secondary" },
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.orders-view__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.orders-view__empty {
  color: rgba(0, 0, 0, 0.6);
  padding: 8px 0;
}

.order-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.order-title__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-title__meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.order-title__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-card__slot {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.7);
}

.order-card__item {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 8px;
}

.order-card__row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.order-card__addon {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
}
</style>

