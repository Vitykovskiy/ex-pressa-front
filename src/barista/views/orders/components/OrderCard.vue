<template>
  <v-card
    class="order-card"
    variant="outlined"
  >
    <div class="order-card__head">
      <div>
        <div class="order-card__title">Заказ #{{ order.id }}</div>
        <div class="order-card__author">
          <span class="order-card__author-label">Автор:</span>
          <span class="order-card__author-value">{{ order.user.name }}</span>
        </div>
        <div class="order-card__meta">
          <span class="order-card__meta-label">Создан:</span>
          <span class="order-card__meta-value">{{
            formatDate(order.createdAt)
          }}</span>
          <span class="order-card__meta-separator">·</span>
          <span class="order-card__meta-count"
            >{{ order.items.length }} позиции</span
          >
        </div>
      </div>
      <v-chip
        class="order-card__status-chip"
        size="small"
        :color="statusMap[order.status].color"
        variant="tonal"
      >
        {{ statusMap[order.status].label }}
      </v-chip>
    </div>

    <div class="order-card__slot-row">
      <div class="order-card__slot">
        <span class="order-card__slot-label">Слот:</span>
        <span class="order-card__slot-value">
          {{ formatOnlyDate(order.timeSlot.date) }} {{ order.slotTimeFrom }}-{{
            order.slotTimeTo
          }}
        </span>
      </div>
      <div class="order-card__total">
        <span class="order-card__total-label">Итого:</span>
        <strong class="order-card__total-value">{{ order.totalRub }} ₽</strong>
      </div>
    </div>

    <div class="order-card__items">
      <div
        v-for="item in order.items"
        :key="item.id"
        class="order-card__item-wrap"
      >
        <div class="order-card__item">
          <div>
            <span class="order-card__item-main">
              {{ item.productName }}
              <template v-if="item.sizeCode">({{ item.sizeCode }})</template>
              x{{ item.quantity }}
            </span>
            <div
              v-for="addon in item.addons"
              :key="addon.id"
              class="order-card__addon"
            >
              + {{ addon.addonName }} x{{ addon.quantity }}
            </div>
          </div>
          <strong class="order-card__item-price"
            >{{ item.lineTotalRub }} ₽</strong
          >
        </div>
        <v-divider class="mt-2" />
      </div>
    </div>

    <div
      v-if="order.rejectReason"
      class="order-card__reject"
    >
      Причина отклонения: {{ order.rejectReason }}
    </div>

    <div class="order-card__actions">
      <v-btn
        v-for="action in getActions(order.status)"
        :key="action"
        size="small"
        variant="flat"
        color="primary"
        :loading="pendingOrderId === order.id"
        :disabled="pendingOrderId !== null"
        @click="$emit('status-action', order.id, action)"
      >
        {{ actionLabelMap[action] }}
      </v-btn>

      <v-btn
        v-if="canReject(order.status)"
        size="small"
        variant="outlined"
        color="error"
        :disabled="pendingOrderId !== null"
        @click="$emit('reject', order.id)"
      >
        Отклонить
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import { OrderStatus, type Order } from "@/services/menu/types";

const props = defineProps<{
  order: Order;
  pendingOrderId: number | null;
  statusMap: Record<OrderStatus, { label: string; color: string }>;
  actionLabelMap: Record<Exclude<OrderStatus, OrderStatus.REJECTED>, string>;
}>();

defineEmits<{
  "status-action": [
    orderId: number,
    nextStatus: Exclude<OrderStatus, OrderStatus.REJECTED>,
  ];
  reject: [orderId: number];
}>();

const nextStatusMap: Record<
  OrderStatus,
  Array<Exclude<OrderStatus, OrderStatus.REJECTED>>
> = {
  [OrderStatus.CREATED]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.CLOSED],
  [OrderStatus.CLOSED]: [],
  [OrderStatus.REJECTED]: [],
};

function getActions(
  status: OrderStatus,
): Array<Exclude<OrderStatus, OrderStatus.REJECTED>> {
  return nextStatusMap[status];
}

function canReject(status: OrderStatus): boolean {
  return status === OrderStatus.CREATED || status === OrderStatus.CONFIRMED;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatOnlyDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
</script>

<style lang="scss" scoped>
.order-card {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
}

.order-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.order-card__status-chip {
  :deep(.v-chip__content) {
    font-size: 13px;
    font-weight: 600;
  }

  :deep(.v-chip__underlay) {
    opacity: 0.22;
  }
}

.order-card__title {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.order-card__author {
  margin-top: 2px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-card__author-label {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.68);
}

.order-card__author-value {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.86);
}

.order-card__meta {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(var(--v-theme-on-surface), 0.75);
}

.order-card__meta-label {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.68);
}

.order-card__meta-value {
  font-weight: 600;
  color: rgb(var(--v-theme-info));
}

.order-card__meta-count {
  font-weight: 600;
  color: rgb(var(--v-theme-secondary));
}

.order-card__meta-separator {
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.order-card__slot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
}

.order-card__slot-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.order-card__slot-label {
  font-weight: 700;
  color: rgb(var(--v-theme-warning));
}

.order-card__slot-value {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.order-card__total {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.order-card__total-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.order-card__total-value {
  font-size: 20px;
  line-height: 1;
  color: rgb(var(--v-theme-primary));
}

.order-card__items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-card__item-wrap:last-child :deep(.v-divider) {
  display: none;
}

.order-card__item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  line-height: 1.3;
}

.order-card__item-main {
  font-size: 18px;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.95);
}

.order-card__item-price {
  font-size: 18px;
  color: rgb(var(--v-theme-primary));
}

.order-card__addon {
  margin-top: 2px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.order-card__reject {
  font-size: 13px;
  color: #b3261e;
}

.order-card__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
