<template>
  <div class="card">
    <div class="card__header">
      <h2>{{ item?.name }}</h2>
      <p>{{ item?.description }}</p>
      <h3>{{ basePrice * quantity + " ₽" }}</h3>
    </div>
    <v-divider />

    <template v-if="sizes?.length">
      <div class="card__body">
        <div class="card__sizes">
          <v-btn-toggle
            v-model="sizeSelector"
            color="primary"
            mandatory
          >
            <v-btn
              v-for="{ size } of sizes"
              :key="size"
              :data-testid="`menu-item-size-${size}`"
              variant="outlined"
              :ripple="false"
            >
              {{ size }}
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
      <v-divider />
    </template>

    <template v-if="optionsItems?.length">
      <div class="card__body">
        <h3>Добавить</h3>
        <div class="card__options">
          <v-btn
            v-for="option in optionsItems"
            :key="option.id"
            variant="outlined"
            :ripple="false"
            :active="isOptionSelected(option)"
            @click="onOptionClick(option)"
          >
            {{ option.name }} {{ option.priceRub }}
          </v-btn>
        </div>
      </div>
      <v-divider />
    </template>

    <div class="card__body">
      <div class="card__actions">
        <v-btn-toggle>
          <v-btn
            variant="outlined"
            icon="mdi-minus"
            :ripple="false"
            @click="() => quantityComputed--"
          />
          <v-btn
            variant="outlined"
            :ripple="false"
            >{{ quantityComputed }}</v-btn
          >
          <v-btn
            variant="outlined"
            icon="mdi-plus"
            :ripple="false"
            @click="() => quantityComputed++"
          />
        </v-btn-toggle>
        <v-btn
          height="48"
          color="primary"
          data-testid="menu-item-submit-btn"
          :ripple="false"
          @click="onConfirmCallback"
        >
          {{ isEditForm ? "Изменить" : "Добавить" }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMenu } from "@/composables/useMenu";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useCart } from "@/composables/useCart";
import router from "@/router";
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

const quantity = ref(parseInt(route.query.quantity as string) || 1);
const drinkSizes = [SizeCode.Small, SizeCode.Medium, SizeCode.Large];

const initialSizeSelector = () => {
  const size = route.query.size as string | undefined;
  const index = size ? drinkSizes.indexOf(size as SizeCode) : -1;
  return index >= 0 ? index : 1;
};

const itemCartIndex = computed(() => {
  const idx = parseInt(route.query.cartIndex as string);
  return isNaN(idx) ? null : idx;
});
const isEditForm = computed(() => itemCartIndex.value !== null);

const onConfirmCallback = computed(() => (isEditForm.value ? onEdit : onAdd));

const sizeSelector = ref<number>(initialSizeSelector());

const quantityComputed = computed({
  get() {
    return quantity.value;
  },
  set(value) {
    quantity.value = value && value <= 20 ? value : quantity.value;
  },
});

const group = computed<ProductGroup | null>(() => {
  const { group: groupId } = route.params;
  return menu.value.find((item) => item.id === Number(groupId)) || null;
});

const item = computed<Product | null>(() => {
  const { group: groupId, item: itemId } = route.params;
  const group = menu.value.find((item) => item.id === Number(groupId));
  return group?.products.find((item) => item.id === Number(itemId)) || null;
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

const initialSelectedOptions = () => {
  const { options } = route.query;

  if (options && Array.isArray(options)) {
    return (
      optionsItems.value?.filter(({ id }) =>
        options.some((optionId) => Number(optionId) === id),
      ) || []
    );
  }

  return [];
};

const selectedOptions = ref<Addon[]>(initialSelectedOptions());

const basePrice = computed(() => {
  if (!item.value) return 0;

  const basePrice =
    item.value.type === ProductType.Drink
      ? (selectedDrinkSize.value?.price ?? 0)
      : (item.value.prices?.[0]?.priceRub ?? 0);

  const optionsPrice = selectedOptions.value.reduce((acc, value) => {
    return acc + (value.priceRub ?? 0);
  }, 0);

  return basePrice + optionsPrice;
});

function onOptionClick(option: Addon): void {
  if (isOptionSelected(option)) {
    selectedOptions.value = selectedOptions.value.filter(
      ({ id }) => id !== option.id,
    );
  } else {
    selectedOptions.value.push(option);
  }
}

function isOptionSelected(option: Addon): boolean {
  return selectedOptions.value.some(({ id }) => id === option.id);
}

function onAdd(): void {
  if (!item.value) return;

  addToCart({
    id: item.value.id,
    groupId: group.value?.id ?? null,
    name: item.value.name,
    price: basePrice.value,
    quantity: quantity.value,
    size: selectedDrinkSize.value?.size,
    selectedOptions: selectedOptions.value,
  });

  router.back();
}

function onEdit(): void {
  if (!item.value || !itemCartIndex.value) return;

  editCartItem(itemCartIndex.value, {
    id: item.value.id,
    groupId: group.value?.id ?? null,
    name: item.value.name,
    price: basePrice.value,
    quantity: quantity.value,
    size: selectedDrinkSize.value?.size,
    selectedOptions: selectedOptions.value,
  });

  router.back();
}
</script>

<style lang="scss">
.card {
  display: flex;
  flex-direction: column;
  margin: 0 20px;
  gap: 15px;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__sizes,
  &__options,
  &__actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
  }
}
</style>

