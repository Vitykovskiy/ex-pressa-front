<template>
  <div class="customer-page slot-view">
    <section class="customer-hero">
      <p class="customer-eyebrow">Pickup</p>
      <h1 class="customer-title">Выбор времени</h1>
      <p class="customer-subtitle">
        Выберите ближайший доступный слот для приготовления и выдачи заказа.
      </p>
    </section>

    <div
      v-if="errorMessage"
      class="customer-status customer-status--error"
    >
      <v-icon icon="mdi-alert-circle-outline" size="16" />
      <span>{{ errorMessage }}</span>
    </div>

    <div
      v-if="isLoadingSlots"
      class="customer-status customer-status--loading"
    >
      <v-progress-circular indeterminate size="16" width="2" color="primary" />
      <span>Подбираем доступные слоты.</span>
    </div>

    <template v-else>
      <div class="customer-section-label">
        <span class="customer-section-label__text">Доступные слоты</span>
        <span class="customer-section-label__line" />
      </div>

      <div class="slot-view__list">
        <button
          v-for="slot in slots"
          :key="slot.id"
          :data-testid="`slot-option-${slot.id}`"
          class="slot-view__item"
          :class="{
            'slot-view__item--selected': selectedSlotId === slot.id,
            'slot-view__item--disabled': isSlotFull(slot),
          }"
          type="button"
          :disabled="isSlotFull(slot)"
          @click="selectedSlotId = slot.id"
        >
          <div class="slot-view__item-head">
            <div class="slot-view__item-time">
              <v-icon icon="mdi-clock-outline" size="16" />
              <span>{{ formatSlotDate(slot.date) }} · {{ slot.timeFrom }}-{{ slot.timeTo }}</span>
            </div>

            <div class="slot-view__item-capacity">
              <v-icon icon="mdi-account-group-outline" size="14" />
              <span>
                {{
                  isSlotFull(slot)
                    ? "Занято"
                    : `${Math.max(slot.capacity - slot.bookedCount, 0)} из ${slot.capacity}`
                }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </template>

    <div class="customer-action-bar">
      <v-btn
        block
        class="slot-view__submit"
        data-testid="slot-confirm-btn"
        :disabled="!selectedSlotId || isSubmitting || isLoadingSlots"
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
    errorMessage.value = "Пожалуйста, выберите временной слот.";
    return;
  }

  if (!cartItemsCount.value) {
    errorMessage.value = "Корзина пуста";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    await clearServerCart();

    for (const item of cart.value) {
      await addCartItem(mapToServerCartItem(item));
    }

    await createOrderFromCart({
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
.slot-view {
  gap: 18px;
}

.slot-view__list {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 10px;
  padding: 0 20px 16px;
}

.slot-view__item {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
  background: rgba(255, 255, 255, 0.04);
  color: var(--customer-text);
}

.slot-view__item--selected {
  border-color: var(--customer-accent);
  background: rgba(201, 169, 110, 0.12);
}

.slot-view__item--disabled {
  opacity: 0.45;
}

.slot-view__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.slot-view__item-time,
.slot-view__item-capacity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-view__item-time {
  font-size: 14px;
  font-weight: 500;
}

.slot-view__item-capacity {
  color: var(--customer-text-soft);
  font-size: 12px;
  white-space: nowrap;
}

.slot-view__submit.v-btn {
  height: 48px;
  border-radius: 14px;
  background: var(--customer-accent);
  color: var(--customer-bg);
  font-weight: 600;
}

@media (max-width: 520px) {
  .slot-view__item-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
