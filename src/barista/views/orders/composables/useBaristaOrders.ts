import { computed, onMounted, ref, watch } from "vue";
import { rejectOrder, searchOrders, updateOrderStatus } from "@/services/orders";
import { OrderStatus, type Order } from "@/services/menu/types";

export function useBaristaOrders() {
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
  const statusConfirmNextStatus = ref<Exclude<OrderStatus, OrderStatus.REJECTED> | null>(null);
  const isStatusConfirmSubmitting = ref(false);

  const statusFilters = ref<OrderStatus[]>([]);
  const statusFilterItems = [
    { title: "Создан", value: OrderStatus.CREATED },
    { title: "Подтвержден", value: OrderStatus.CONFIRMED },
    { title: "Готов", value: OrderStatus.READY },
    { title: "Закрыт", value: OrderStatus.CLOSED },
    { title: "Отклонен", value: OrderStatus.REJECTED },
  ] as const;

  const selectedDate = ref<string>(getTodayDateString());

  const statusMap: Record<OrderStatus, { label: string; color: string }> = {
    [OrderStatus.CREATED]: { label: "Создан", color: "info" },
    [OrderStatus.CONFIRMED]: { label: "Подтвержден", color: "secondary" },
    [OrderStatus.READY]: { label: "Готов", color: "success" },
    [OrderStatus.CLOSED]: { label: "Закрыт", color: "primary" },
    [OrderStatus.REJECTED]: { label: "Отклонен", color: "error" },
  };

  const actionLabelMap: Record<Exclude<OrderStatus, OrderStatus.REJECTED>, string> = {
    [OrderStatus.CREATED]: "Создан",
    [OrderStatus.CONFIRMED]: "Подтвердить",
    [OrderStatus.READY]: "Готов",
    [OrderStatus.CLOSED]: "Закрыть",
  };

  const sortedOrders = computed(() => {
    const rank = (status: OrderStatus): number => {
      if (status === OrderStatus.CREATED) return 0;
      if (status === OrderStatus.CONFIRMED || status === OrderStatus.READY) return 1;
      return 2;
    };

    const slotTs = (order: Order): number =>
      Date.parse(`${order.timeSlot.date}T${order.slotTimeFrom}:00`);
    const createdTs = (order: Order): number => Date.parse(order.createdAt);

    return [...orders.value].sort((a, b) => {
      const rankDiff = rank(a.status) - rank(b.status);
      if (rankDiff !== 0) return rankDiff;

      if (rank(a.status) === 1) {
        const slotDateA = slotTs(a);
        const slotDateB = slotTs(b);
        if (!Number.isNaN(slotDateA) && !Number.isNaN(slotDateB) && slotDateA !== slotDateB) {
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

  const statusConfirmText = computed(() => {
    if (statusConfirmNextStatus.value === OrderStatus.READY) {
      return "Перевести заказ в статус «Готов»?";
    }
    if (statusConfirmNextStatus.value === OrderStatus.CLOSED) {
      return "Перевести заказ в статус «Закрыт»?";
    }
    return "Подтвердить изменение статуса заказа?";
  });

  const searchPayload = computed(() => {
    const payload: {
      status?: OrderStatus[];
      dateFrom?: string;
      dateTo?: string;
    } = {};

    if (statusFilters.value.length) payload.status = statusFilters.value;

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

  function clearFilters(): void {
    statusFilters.value = [];
    selectedDate.value = "";
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
    if (isStatusConfirmSubmitting.value) return;
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
    if (!statusConfirmOrderId.value || !statusConfirmNextStatus.value) return;

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
    if (!rejectOrderId.value) return;
    if (!rejectReason.value.trim()) {
      rejectReasonError.value = "Укажи причину отклонения";
      return;
    }

    isRejectSubmitting.value = true;
    errorMessage.value = "";
    try {
      await rejectOrder(rejectOrderId.value, { reason: rejectReason.value.trim() });
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

  return {
    actionLabelMap,
    clearFilters,
    closeRejectDialog,
    closeStatusConfirmDialog,
    errorMessage,
    isLoading,
    isRejectSubmitting,
    isStatusConfirmSubmitting,
    loadOrders,
    onRejectDialogModelUpdate,
    onStatusAction,
    onStatusConfirmDialogModelUpdate,
    openRejectDialog,
    orders,
    pendingOrderId,
    rejectDialog,
    rejectReason,
    rejectReasonError,
    selectedDate,
    sortedOrders,
    statusConfirmDialog,
    statusConfirmText,
    statusFilterItems,
    statusFilters,
    statusMap,
    submitReject,
    submitStatusConfirm,
  };
}

function requiresStatusConfirmation(
  status: Exclude<OrderStatus, OrderStatus.REJECTED>,
): boolean {
  return status === OrderStatus.READY || status === OrderStatus.CLOSED;
}

function getTodayDateString(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
