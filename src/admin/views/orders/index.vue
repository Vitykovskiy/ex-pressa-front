<template>
  <div class="admin-orders">
    <div class="admin-orders__toolbar">
      <h2>Заказы</h2>
      <div class="admin-orders__toolbar-actions">
        <v-select class="admin-orders__status-filter"
                  v-model="statusFilters"
                  :items="statusFilterItems"
                  chips
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="Статусы"
                  persistent-placeholder
                  single-line
                  multiple
                  clearable />


        <v-text-field class="admin-orders__date-filter"
                      v-model="selectedDate"
                      type="date"
                      variant="outlined"
                      density="compact"
                      hide-details
                      placeholder="Дата"
                      persistent-placeholder
                      single-line
                      clearable />

        <v-tooltip text="Очтисть фильтры"
                   location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props"
                   class="admin-orders__clear-btn"
                   variant="text"
                   icon="mdi-trash-can-outline"
                   :disabled="isLoading"
                   @click="clearFilters" />
          </template>
        </v-tooltip>

        <v-btn class="admin-orders__refresh-btn"
               variant="flat"
               color="primary"
               prepend-icon="mdi-magnify"
               :loading="isLoading"
               @click="loadOrders">
          Поиск
        </v-btn>
      </div>
    </div>

    <v-alert v-if="errorMessage"
             type="error"
             variant="tonal"
             density="compact">
      {{ errorMessage }}
    </v-alert>

    <div v-else-if="!isLoading && !orders.length"
         class="admin-orders__empty">
      Нет заказов для отображения
    </div>

    <div class="admin-orders__list">
      <v-card v-for="order in sortedOrders"
              :key="order.id"
              class="order-card"
              variant="outlined">
        <div class="order-card__head">
          <div>
            <div class="order-card__title">Заказ #{{ order.id }}</div>
            <div class="order-card__author">
              <span class="order-card__author-label">Автор:</span>
              <span class="order-card__author-value">{{ order.user.name }}</span>
            </div>
            <div class="order-card__meta">
              <span class="order-card__meta-label">Создан:</span>
              <span class="order-card__meta-value">{{ formatDate(order.createdAt) }}</span>
              <span class="order-card__meta-separator">·</span>
              <span class="order-card__meta-count">{{ order.items.length }} позиции</span>
            </div>
          </div>
          <v-chip class="order-card__status-chip"
                  size="small"
                  :color="statusMap[order.status].color"
                  variant="tonal">
            {{ statusMap[order.status].label }}
          </v-chip>
        </div>

        <div class="order-card__slot-row">
          <div class="order-card__slot">
            <span class="order-card__slot-label">Слот:</span>
            <span class="order-card__slot-value">
              {{ formatOnlyDate(order.timeSlot.date) }} {{ order.slotTimeFrom }}-{{ order.slotTimeTo }}
            </span>
          </div>
          <div class="order-card__total">
            <span class="order-card__total-label">Итого:</span>
            <strong class="order-card__total-value">{{ order.totalRub }} ₽</strong>
          </div>
        </div>

        <div class="order-card__items">
          <div v-for="item in order.items"
               :key="item.id"
               class="order-card__item-wrap">
            <div class="order-card__item">
              <div>
                <span class="order-card__item-main">
                  {{ item.productName }}
                  <template v-if="item.sizeCode">({{ item.sizeCode }})</template>
                  x{{ item.quantity }}
                </span>
                <div v-for="addon in item.addons"
                     :key="addon.id"
                     class="order-card__addon">
                  + {{ addon.addonName }} x{{ addon.quantity }}
                </div>
              </div>
              <strong class="order-card__item-price">{{ item.lineTotalRub }} ₽</strong>
            </div>
            <v-divider class="mt-2" />
          </div>
        </div>

        <div v-if="order.rejectReason"
             class="order-card__reject">
          Причина отклонения: {{ order.rejectReason }}
        </div>

        <div class="order-card__actions">
          <v-btn v-for="action in getActions(order.status)"
                 :key="action"
                 size="small"
                 variant="flat"
                 color="primary"
                 :loading="pendingOrderId === order.id"
                 :disabled="pendingOrderId !== null"
                 @click="onStatusAction(order.id, action)">
            {{ actionLabelMap[action] }}
          </v-btn>

          <v-btn v-if="canReject(order.status)"
                 size="small"
                 variant="outlined"
                 color="error"
                 :disabled="pendingOrderId !== null"
                 @click="openRejectDialog(order.id)">
            Отклонить
          </v-btn>
        </div>
      </v-card>
    </div>

    <v-dialog v-model="rejectDialog"
              max-width="460">
      <v-card>
        <v-card-title>Отклонить заказ</v-card-title>
        <v-card-text>
          <v-textarea v-model="rejectReason"
                      label="Причина отклонения"
                      variant="outlined"
                      rows="4"
                      auto-grow
                      :error-messages="rejectReasonError" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text"
                 @click="closeRejectDialog">
            Отмена
          </v-btn>
          <v-btn variant="flat"
                 color="error"
                 :loading="isRejectSubmitting"
                 @click="submitReject">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="statusConfirmDialog"
              max-width="420">
      <v-card>
        <v-card-title>Подтверждение</v-card-title>
        <v-card-text>
          {{ statusConfirmText }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text"
                 :disabled="isStatusConfirmSubmitting"
                 @click="closeStatusConfirmDialog">
            Отмена
          </v-btn>
          <v-btn variant="flat"
                 color="primary"
                 :loading="isStatusConfirmSubmitting"
                 @click="submitStatusConfirm">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import {
  rejectOrder,
  searchOrders,
  updateOrderStatus,
} from "@/services/orders";
import { OrderStatus, type Order } from "@/services/menu/types";

defineOptions({
  name: "AdminOrdersView",
});

const orders = ref<Order[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const pendingOrderId = ref<number | null>(null);

const rejectDialog = ref(false);
const rejectOrderId = ref<number | null>(null);
const rejectReason = ref("");
const rejectReasonError = ref("");
const isRejectSubmitting = ref(false);
const statusConfirmDialog = ref(false);
const statusConfirmOrderId = ref<number | null>(null);
const statusConfirmNextStatus = ref<
  Exclude<OrderStatus, OrderStatus.REJECTED> | null
>(null);
const isStatusConfirmSubmitting = ref(false);

const statusFilters = ref<OrderStatus[]>([]);
const statusFilterItems = [
  { title: "Создан", value: OrderStatus.CREATED },
  { title: "Подтвержден", value: OrderStatus.CONFIRMED },
  { title: "Готов", value: OrderStatus.READY },
  { title: "Закрыт", value: OrderStatus.CLOSED },
  { title: "Отклонен", value: OrderStatus.REJECTED },
] as const;

function getTodayDateString(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const selectedDate = ref<string>(getTodayDateString());

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  [OrderStatus.CREATED]: { label: "Создан", color: "info" },
  [OrderStatus.CONFIRMED]: { label: "Подтвержден", color: "secondary" },
  [OrderStatus.READY]: { label: "Готов", color: "success" },
  [OrderStatus.CLOSED]: { label: "Закрыт", color: "primary" },
  [OrderStatus.REJECTED]: { label: "Отклонен", color: "error" },
};

const actionLabelMap: Record<
  Exclude<OrderStatus, OrderStatus.REJECTED>,
  string
> = {
  [OrderStatus.CREATED]: "Создан",
  [OrderStatus.CONFIRMED]: "Подтвердить",
  [OrderStatus.READY]: "Готов",
  [OrderStatus.CLOSED]: "Закрыть",
};

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

const sortedOrders = computed(() => {
  const rank = (status: OrderStatus): number => {
    if (status === OrderStatus.CREATED) {
      return 0;
    }
    if (status === OrderStatus.CONFIRMED || status === OrderStatus.READY) {
      return 1;
    }
    return 2;
  };

  const slotTs = (order: Order): number => {
    return Date.parse(`${order.timeSlot.date}T${order.slotTimeFrom}:00`);
  };

  const createdTs = (order: Order): number => {
    return Date.parse(order.createdAt);
  };

  return [...orders.value].sort((a, b) => {
    const rankDiff = rank(a.status) - rank(b.status);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    if (rank(a.status) === 1) {
      const slotDateA = slotTs(a);
      const slotDateB = slotTs(b);
      if (
        !Number.isNaN(slotDateA) &&
        !Number.isNaN(slotDateB) &&
        slotDateA !== slotDateB
      ) {
        return slotDateA - slotDateB;
      }
    }

    const createdA = createdTs(a);
    const createdB = createdTs(b);
    if (!Number.isNaN(createdA) && !Number.isNaN(createdB) && createdA !== createdB) {
      return createdA - createdB;
    }

    return a.id - b.id;
  });
});

function getActions(
  status: OrderStatus,
): Array<Exclude<OrderStatus, OrderStatus.REJECTED>> {
  return nextStatusMap[status];
}

function canReject(status: OrderStatus): boolean {
  return status === OrderStatus.CREATED || status === OrderStatus.CONFIRMED;
}

function requiresStatusConfirmation(
  status: Exclude<OrderStatus, OrderStatus.REJECTED>,
): boolean {
  return status === OrderStatus.READY || status === OrderStatus.CLOSED;
}

const statusConfirmText = computed(() => {
  if (statusConfirmNextStatus.value === OrderStatus.READY) {
    return "Перевести заказ в статус «Готов»?";
  }
  if (statusConfirmNextStatus.value === OrderStatus.CLOSED) {
    return "Перевести заказ в статус «Закрыт»?";
  }
  return "Подтвердить изменение статуса заказа?";
});

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

function clearFilters(): void {
  statusFilters.value = [];
  selectedDate.value = "";
}

const searchPayload = computed(() => {
  const payload: {
    status?: OrderStatus[];
    dateFrom?: string;
    dateTo?: string;
  } = {};

  if (statusFilters.value.length) {
    payload.status = statusFilters.value;
  }

  if (selectedDate.value) {
    payload.dateFrom = `${selectedDate.value}T00:00:00.000Z`;
    payload.dateTo = `${selectedDate.value}T23:59:59.999Z`;
  }

  return payload;
});

async function loadOrders(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    orders.value = await searchOrders(searchPayload.value);
  } catch {
    errorMessage.value = "Не удалось загрузить список заказов";
  } finally {
    isLoading.value = false;
  }
}

async function onStatusAction(
  orderId: number,
  nextStatus: Exclude<OrderStatus, OrderStatus.REJECTED>,
): Promise<void> {
  if (requiresStatusConfirmation(nextStatus)) {
    statusConfirmOrderId.value = orderId;
    statusConfirmNextStatus.value = nextStatus;
    statusConfirmDialog.value = true;
    return;
  }

  await applyStatusAction(orderId, nextStatus);
}

async function applyStatusAction(
  orderId: number,
  nextStatus: Exclude<OrderStatus, OrderStatus.REJECTED>,
): Promise<void> {
  pendingOrderId.value = orderId;
  errorMessage.value = "";

  try {
    await updateOrderStatus(orderId, { status: nextStatus });
    await loadOrders();
  } catch {
    errorMessage.value = "Не удалось обновить статус заказа";
  } finally {
    pendingOrderId.value = null;
  }
}

function closeStatusConfirmDialog(): void {
  if (isStatusConfirmSubmitting.value) {
    return;
  }

  statusConfirmDialog.value = false;
  statusConfirmOrderId.value = null;
  statusConfirmNextStatus.value = null;
}

async function submitStatusConfirm(): Promise<void> {
  if (!statusConfirmOrderId.value || !statusConfirmNextStatus.value) {
    return;
  }

  isStatusConfirmSubmitting.value = true;
  try {
    await applyStatusAction(statusConfirmOrderId.value, statusConfirmNextStatus.value);
  } finally {
    isStatusConfirmSubmitting.value = false;
  }

  closeStatusConfirmDialog();
}

function openRejectDialog(orderId: number): void {
  rejectOrderId.value = orderId;
  rejectReason.value = "";
  rejectReasonError.value = "";
  rejectDialog.value = true;
}

function closeRejectDialog(): void {
  rejectDialog.value = false;
  rejectOrderId.value = null;
  rejectReason.value = "";
  rejectReasonError.value = "";
}

async function submitReject(): Promise<void> {
  if (!rejectOrderId.value) {
    return;
  }

  if (!rejectReason.value.trim()) {
    rejectReasonError.value = "Укажи причину отклонения";
    return;
  }

  isRejectSubmitting.value = true;
  errorMessage.value = "";

  try {
    await rejectOrder(rejectOrderId.value, {
      reason: rejectReason.value.trim(),
    });
    closeRejectDialog();
    await loadOrders();
  } catch {
    errorMessage.value = "Не удалось отклонить заказ";
  } finally {
    isRejectSubmitting.value = false;
  }
}

onMounted(() => {
  void loadOrders();
});

watch(
  () => [statusFilters.value.slice().join(","), selectedDate.value],
  () => {
    void loadOrders();
  },
);
</script>

<style lang="scss" scoped>
.admin-orders {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-orders__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.admin-orders__toolbar h2 {
  margin: 4px 0 0;
}

.admin-orders__toolbar-actions {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.admin-orders__status-filter {
  flex: 1 1 auto;
  min-width: 0;
}

.admin-orders__date-filter {
  flex: 0 0 170px;
}

.admin-orders__refresh-btn {
  flex: 0 0 auto;
}

.admin-orders__clear-btn {
  flex: 0 0 auto;
}

.admin-orders__selection-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-orders__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 8px;
}

.admin-orders__empty {
  color: rgba(0, 0, 0, 0.6);
}

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

@media (max-width: 740px) {
  .admin-orders__toolbar {
    flex-direction: column;
  }

  .admin-orders__toolbar-actions {
    grid-template-columns: 1fr;
    width: 100%;
  }

  .admin-orders__date-filter {
    flex: 1 1 auto;
  }
}
</style>
