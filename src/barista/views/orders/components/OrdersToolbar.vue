<template>
  <div class="barista-orders__toolbar">
    <h2>Заказы</h2>
    <div class="barista-orders__toolbar-actions">
      <v-select
        class="barista-orders__status-filter"
        v-model="statusFiltersModel"
        :items="statusFilterItems"
        chips
        variant="outlined"
        density="compact"
        hide-details
        placeholder="Статусы"
        persistent-placeholder
        single-line
        multiple
        clearable
      />

      <v-text-field
        class="barista-orders__date-filter"
        v-model="selectedDateModel"
        type="date"
        variant="outlined"
        density="compact"
        hide-details
        placeholder="Дата"
        persistent-placeholder
        single-line
        clearable
      />

      <v-tooltip
        text="Очтисть фильтры"
        location="top"
      >
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            class="barista-orders__clear-btn"
            variant="text"
            icon="mdi-trash-can-outline"
            :disabled="isLoading"
            @click="$emit('clear')"
          />
        </template>
      </v-tooltip>

      <v-btn
        class="barista-orders__refresh-btn"
        variant="flat"
        color="primary"
        prepend-icon="mdi-magnify"
        :loading="isLoading"
        @click="$emit('search')"
      >
        Поиск
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { OrderStatus } from "@/services/menu/types";

type StatusFilterItem = {
  title: string;
  value: OrderStatus;
};

const props = defineProps<{
  statusFilters: OrderStatus[];
  selectedDate: string;
  statusFilterItems: ReadonlyArray<StatusFilterItem>;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  "update:statusFilters": [value: OrderStatus[]];
  "update:selectedDate": [value: string];
  search: [];
  clear: [];
}>();

const statusFiltersModel = computed<OrderStatus[]>({
  get: () => props.statusFilters,
  set: (value) => emit("update:statusFilters", value),
});

const selectedDateModel = computed<string>({
  get: () => props.selectedDate,
  set: (value) => emit("update:selectedDate", value),
});
</script>

<style lang="scss" scoped>
.barista-orders__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.barista-orders__toolbar h2 {
  margin: 4px 0 0;
}

.barista-orders__toolbar-actions {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.barista-orders__status-filter {
  flex: 1 1 auto;
  min-width: 0;
}

.barista-orders__date-filter {
  flex: 0 0 170px;
}

.barista-orders__refresh-btn {
  flex: 0 0 auto;
}

.barista-orders__clear-btn {
  flex: 0 0 auto;
}

@media (max-width: 740px) {
  .barista-orders__toolbar {
    flex-direction: column;
  }

  .barista-orders__toolbar-actions {
    width: 100%;
  }

  .barista-orders__date-filter {
    flex: 1 1 auto;
  }
}
</style>
