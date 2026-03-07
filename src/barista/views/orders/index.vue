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
import OrdersToolbar from "./components/OrdersToolbar.vue";
import OrderCard from "./components/OrderCard.vue";
import RejectOrderDialog from "./components/RejectOrderDialog.vue";
import StatusConfirmDialog from "./components/StatusConfirmDialog.vue";
import { useBaristaOrders } from "./composables/useBaristaOrders";

defineOptions({
  name: "BaristaOrdersView",
});

const {
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
} = useBaristaOrders();
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
