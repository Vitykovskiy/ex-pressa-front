<template>
  <div
    v-if="item"
    class="customer-page product-view"
  >
    <section class="product-view__hero">
      <div class="product-view__hero-overlay" />
      <div class="product-view__hero-content">
        <p class="customer-eyebrow">Menu item</p>
        <h1 class="customer-title">{{ item.name }}</h1>
      </div>
    </section>

    <div class="product-view__content">
      <section class="product-view__summary">
        <p class="product-view__description">
          {{ item.description || "Выберите размер, добавки и количество." }}
        </p>
        <div class="product-view__total">{{ totalPrice }} ₽</div>
      </section>

      <section
        v-if="sizes?.length"
        class="product-view__section"
      >
        <p class="product-view__section-label">Размер</p>
        <div class="product-view__chips">
          <button
            v-for="(size, index) in sizes"
            :key="size.size"
            :data-testid="`menu-item-size-${size.size}`"
            class="product-view__choice"
            :class="{ 'product-view__choice--active': sizeSelector === index }"
            type="button"
            @click="sizeSelector = index"
          >
            {{ size.size }} · {{ size.price }} ₽
          </button>
        </div>
      </section>

      <section
        v-if="optionsItems?.length"
        class="product-view__section"
      >
        <p class="product-view__section-label">Добавки</p>
        <div class="product-view__chips">
          <button
            v-for="option in optionsItems"
            :key="option.id"
            class="product-view__choice"
            :class="{ 'product-view__choice--active': isOptionSelected(option) }"
            type="button"
            @click="onOptionClick(option)"
          >
            {{ option.name }} · {{ option.priceRub }} ₽
          </button>
        </div>
      </section>
    </div>

    <div class="customer-action-bar product-view__action-bar">
      <div class="product-view__quantity">
        <button
          class="product-view__quantity-btn"
          type="button"
          @click="quantityComputed -= 1"
        >
          <v-icon icon="mdi-minus" size="16" />
        </button>
        <span class="product-view__quantity-value">{{ quantityComputed }}</span>
        <button
          class="product-view__quantity-btn"
          type="button"
          @click="quantityComputed += 1"
        >
          <v-icon icon="mdi-plus" size="16" />
        </button>
      </div>

      <v-btn
        class="product-view__submit"
        color="primary"
        data-testid="menu-item-submit-btn"
        :ripple="false"
        @click="onConfirmCallback"
      >
        {{ isEditForm ? "Изменить" : "Добавить" }} · {{ totalPrice }} ₽
      </v-btn>
    </div>
  </div>

  <div
    v-else
    class="customer-empty"
  >
    <div class="customer-empty__icon">☕</div>
    <p class="customer-empty__text">Товар не найден или ещё загружается.</p>
  </div>
</template>

<script lang="ts" setup>
import { useMenu } from "@/composables/useMenu";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useCart } from "@/composables/useCart";
import router from "@/router";
import { RouteNames } from "@/routes";
import {
  ProductType,
  SizeCode,
  type Addon,
  type Product,
  type ProductGroup,
  type ProductPrice,
} from "@/services/menu/types";

defineOptions({
  name: "MenuItemView",
});

const route = useRoute();
const { menu, getAddonGroupsForGroup } = useMenu();
const { addToCart, editCartItem } = useCart();

const drinkSizes = [SizeCode.Small, SizeCode.Medium, SizeCode.Large];
const quantity = ref(parseInt(String(route.query.quantity ?? "1"), 10) || 1);
const sizeSelector = ref(initialSizeSelector());
const selectedOptions = ref<Addon[]>([]);

const itemCartIndex = computed(() => {
  const idx = parseInt(String(route.query.cartIndex ?? ""), 10);
  return Number.isNaN(idx) ? null : idx;
});
const isEditForm = computed(() => itemCartIndex.value !== null);
const onConfirmCallback = computed(() => (isEditForm.value ? onEdit : onAdd));

const group = computed<ProductGroup | null>(() => {
  const { group: groupId } = route.params;
  return menu.value.find((menuGroup) => menuGroup.id === Number(groupId)) || null;
});

const item = computed<Product | null>(() => {
  const { group: groupId, item: itemId } = route.params;
  const activeGroup = menu.value.find((menuGroup) => menuGroup.id === Number(groupId));
  return activeGroup?.products.find((menuItem) => menuItem.id === Number(itemId)) || null;
});

const optionsItems = computed<Addon[] | null>(() => {
  if (!group.value) {
    return null;
  }

  const addonGroups = getAddonGroupsForGroup(group.value.id);
  const addons = addonGroups
    .filter((addonGroup) => addonGroup.isActive)
    .flatMap((addonGroup) =>
      (addonGroup.addons || []).filter((addon) => addon.isActive),
    );

  const uniq = new Map<number, Addon>();
  for (const addon of addons) {
    uniq.set(addon.id, addon);
  }

  return Array.from(uniq.values());
});

type DrinkSizeItem = { size: SizeCode; price: number };

const sizes = computed<DrinkSizeItem[] | null>(() => {
  if (!item.value || item.value.type !== ProductType.Drink) {
    return null;
  }

  return drinkSizes
    .map((size) =>
      (item.value?.prices || []).find((price) => price.sizeCode === size),
    )
    .filter((price): price is ProductPrice => Boolean(price))
    .map((price) => ({
      size: price.sizeCode as SizeCode,
      price: price.priceRub,
    }));
});

const selectedDrinkSize = computed<DrinkSizeItem | null>(
  () => sizes.value?.[sizeSelector.value] ?? null,
);

const quantityComputed = computed({
  get() {
    return quantity.value;
  },
  set(value) {
    quantity.value = Math.min(20, Math.max(1, value));
  },
});

const totalPrice = computed(() => {
  if (!item.value) {
    return 0;
  }

  const itemBasePrice =
    item.value.type === ProductType.Drink
      ? (selectedDrinkSize.value?.price ?? 0)
      : (item.value.prices?.[0]?.priceRub ?? 0);

  const optionsPrice = selectedOptions.value.reduce((acc, value) => {
    return acc + (value.priceRub ?? 0);
  }, 0);

  return (itemBasePrice + optionsPrice) * quantity.value;
});

watch(
  optionsItems,
  (nextOptions) => {
    if (!nextOptions?.length || selectedOptions.value.length) {
      return;
    }

    const queryOptions = route.query.options;
    const selectedIds = Array.isArray(queryOptions)
      ? queryOptions.map((value) => Number(value))
      : typeof queryOptions === "string"
        ? [Number(queryOptions)]
        : [];

    selectedOptions.value = nextOptions.filter((option) =>
      selectedIds.includes(option.id),
    );
  },
  { immediate: true },
);

function initialSizeSelector(): number {
  const size = route.query.size as string | undefined;
  const index = size ? drinkSizes.indexOf(size as SizeCode) : -1;
  return index >= 0 ? index : 1;
}

function onOptionClick(option: Addon): void {
  if (isOptionSelected(option)) {
    selectedOptions.value = selectedOptions.value.filter(
      ({ id }) => id !== option.id,
    );
    return;
  }

  selectedOptions.value = [...selectedOptions.value, option];
}

function isOptionSelected(option: Addon): boolean {
  return selectedOptions.value.some(({ id }) => id === option.id);
}

function onAdd(): void {
  if (!item.value) {
    return;
  }

  addToCart({
    id: item.value.id,
    groupId: group.value?.id ?? null,
    name: item.value.name,
    price: Math.round(totalPrice.value / quantity.value),
    quantity: quantity.value,
    size: selectedDrinkSize.value?.size,
    selectedOptions: selectedOptions.value,
  });

  router.push({ name: RouteNames.Cart });
}

function onEdit(): void {
  if (!item.value || itemCartIndex.value === null) {
    return;
  }

  editCartItem(itemCartIndex.value, {
    id: item.value.id,
    groupId: group.value?.id ?? null,
    name: item.value.name,
    price: Math.round(totalPrice.value / quantity.value),
    quantity: quantity.value,
    size: selectedDrinkSize.value?.size,
    selectedOptions: selectedOptions.value,
  });

  router.push({ name: RouteNames.Cart });
}
</script>

<style lang="scss" scoped>
.product-view__hero {
  position: relative;
  min-height: 264px;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.15), transparent 20%),
    linear-gradient(180deg, #8d6443 0%, #463221 34%, #0d1b35 100%);
}

.product-view__hero::before,
.product-view__hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
}

.product-view__hero::before {
  width: 220px;
  height: 220px;
  top: 16px;
  right: -36px;
  background: radial-gradient(circle, rgba(201, 169, 110, 0.3), transparent 64%);
}

.product-view__hero::after {
  width: 170px;
  height: 170px;
  bottom: 34px;
  left: -44px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08), transparent 68%);
}

.product-view__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(13, 27, 53, 0.1), rgba(13, 27, 53, 0.88));
}

.product-view__hero-content {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 24px 20px;
}

.product-view__content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.product-view__summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-view__description {
  color: var(--customer-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.product-view__total {
  color: var(--customer-accent);
  font-size: 24px;
  font-weight: 600;
}

.product-view__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-view__section-label {
  color: var(--customer-text-soft);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.product-view__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.product-view__choice {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 9px 14px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.68);
  font-size: 13px;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.product-view__choice--active {
  border-color: var(--customer-accent);
  background: rgba(201, 169, 110, 0.12);
  color: var(--customer-accent);
}

.product-view__action-bar {
  align-items: center;
}

.product-view__quantity {
  display: flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.product-view__quantity-btn {
  width: 40px;
  height: 44px;
  color: rgba(255, 255, 255, 0.7);
}

.product-view__quantity-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 44px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--customer-text);
  font-size: 16px;
  font-weight: 500;
}

.product-view__submit.v-btn {
  flex: 1 1 auto;
  height: 44px;
  border-radius: 14px;
  background: var(--customer-accent);
  color: var(--customer-bg);
  font-weight: 600;
}
</style>
