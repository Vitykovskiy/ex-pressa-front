<template>
  <div class="barista-orders">
    <OrdersToolbar
      :status-filters="statusFilters"
      :selected-date="selectedDate"
      :status-filter-items="statusFilterItems"
      :is-loading="isLoading"
      @update:status-filters="statusFilters = $event"
      @update:selected-date="selectedDate = $event"
      @search="loadOrders"
      @clear="clearFilters"
    />

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
    >
      {{ errorMessage }}
    </v-alert>

    <div
      v-else-if="!isLoading && !orders.length"
      class="barista-orders__empty"
    >
      Нет заказов для отображения
    </div>

    <div class="barista-orders__list">
      <OrderCard
        v-for="order in sortedOrders"
        :key="order.id"
        :order="order"
        :pending-order-id="pendingOrderId"
        :status-map="statusMap"
        :action-label-map="actionLabelMap"
        @status-action="onStatusAction"
        @reject="openRejectDialog"
      />
    </div>

    <RejectOrderDialog
      :model-value="rejectDialog"
      :reason="rejectReason"
      :reason-error="rejectReasonError"
      :is-submitting="isRejectSubmitting"
      @update:model-value="onRejectDialogModelUpdate"
      @update:reason="rejectReason = $event"
      @cancel="closeRejectDialog"
      @confirm="submitReject"
    />

    <StatusConfirmDialog
      :model-value="statusConfirmDialog"
      :text="statusConfirmText"
      :is-submitting="isStatusConfirmSubmitting"
      @update:model-value="onStatusConfirmDialogModelUpdate"
      @cancel="closeStatusConfirmDialog"
      @confirm="submitStatusConfirm"
    />
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
import OrdersToolbar from "./components/OrdersToolbar.vue";
import OrderCard from "./components/OrderCard.vue";
import RejectOrderDialog from "./components/RejectOrderDialog.vue";
import StatusConfirmDialog from "./components/StatusConfirmDialog.vue";

defineOptions({
  name: "BaristaOrdersView",
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

function onStatusConfirmDialogModelUpdate(value: boolean): void {
  if (!value) {
    closeStatusConfirmDialog();
    return;
  }

  statusConfirmDialog.value = true;
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

function onRejectDialogModelUpdate(value: boolean): void {
  if (!value) {
    closeRejectDialog();
    return;
  }

  rejectDialog.value = true;
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
.barista-orders {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.barista-orders__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 8px;
}

.barista-orders__empty {
  color: rgba(0, 0, 0, 0.6);
}
</style>
