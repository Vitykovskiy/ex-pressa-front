<template>
  <div class="order-slot-view">
    <div class="order-slot-view__content">
      <h2>Выбор времени</h2>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="compact"
      >
        {{ errorMessage }}
      </v-alert>

      <v-progress-linear
        v-if="isLoadingSlots"
        indeterminate
        color="primary"
      />

      <v-radio-group
        v-else
        v-model="selectedSlotId"
        class="order-slot-view__group"
      >
        <v-radio
          v-for="slot in slots"
          :key="slot.id"
          :value="slot.id"
          :disabled="isSlotFull(slot)"
        >
          <template #label>
            <div class="slot-option">
              <div class="slot-option__title">
                {{ formatSlotDate(slot.date) }} · {{ slot.timeFrom }}-{{
                  slot.timeTo
                }}
              </div>
              <div class="slot-option__meta">
                Свободно: {{ Math.max(slot.capacity - slot.bookedCount, 0) }} из
                {{ slot.capacity }}
              </div>
            </div>
          </template>
        </v-radio>
      </v-radio-group>
    </div>

    <div class="order-slot-view__footer">
      <v-btn
        block
        size="large"
        color="primary"
        :disabled="!selectedSlotId || isSubmitting"
        :loading="isSubmitting"
        @click="onConfirmOrder"
      >
        Подтвердить заказ
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "@/composables/useCart";
import { fetchActiveTimeSlots } from "@/services/timeSlots";
import { addCartItem, clearCart as clearServerCart } from "@/services/cart";
import { createOrderFromCart } from "@/services/orders";
import { RouteNames } from "@/routes";
import type { AddCartItemDto, TimeSlot } from "@/services/menu/types";

defineOptions({
  name: "OrderSlotView",
});

const CURRENT_USER_ID = 1;

const router = useRouter();
const { cart, clearCart } = useCart();

const slots = ref<TimeSlot[]>([]);
const selectedSlotId = ref<number | null>(null);
const isLoadingSlots = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");

const cartItemsCount = computed(() => cart.value.length);

function isSlotFull(slot: TimeSlot): boolean {
  return slot.bookedCount >= slot.capacity;
}

function formatSlotDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    weekday: "short",
  }).format(date);
}

async function loadSlots(): Promise<void> {
  isLoadingSlots.value = true;
  errorMessage.value = "";

  try {
    const data = await fetchActiveTimeSlots();
    slots.value = data;
    selectedSlotId.value = data.find((slot) => !isSlotFull(slot))?.id ?? null;
  } catch {
    errorMessage.value = "Не удалось загрузить временные слоты";
  } finally {
    isLoadingSlots.value = false;
  }
}

function mapToServerCartItem(
  item: (typeof cart.value)[number],
): AddCartItemDto {
  return {
    productId: item.id,
    sizeCode: item.size,
    quantity: item.quantity,
    addons:
      item.selectedOptions?.map((option) => ({
        addonId: option.id,
        quantity: 1,
      })) ?? [],
  };
}

async function onConfirmOrder(): Promise<void> {
  if (!selectedSlotId.value) {
    return;
  }

  if (!cartItemsCount.value) {
    errorMessage.value = "Корзина пуста";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    await clearServerCart(CURRENT_USER_ID);

    for (const item of cart.value) {
      await addCartItem(CURRENT_USER_ID, mapToServerCartItem(item));
    }

    await createOrderFromCart(CURRENT_USER_ID, {
      timeSlotId: selectedSlotId.value,
    });

    clearCart();
    router.replace({ name: RouteNames.OrdersHistory });
  } catch {
    errorMessage.value = "Не удалось оформить заказ. Попробуйте снова.";
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  void loadSlots();
});
</script>

<style lang="scss" scoped>
.order-slot-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.order-slot-view__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-slot-view__group {
  margin-top: 4px;
}

.slot-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.slot-option__title {
  font-weight: 600;
}

.slot-option__meta {
  font-size: 13px;
  opacity: 0.78;
}

.order-slot-view__footer {
  flex: 0 0 auto;
  margin-top: 12px;
  padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
}
</style>
