<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    @update:model-value="onModelUpdate"
  >
    <v-card>
      <v-card-title>Добавить товар</v-card-title>
      <v-card-text>
        <v-select
          v-model="groupId"
          :items="groupItems"
          data-testid="admin-product-group-select"
          label="Группа"
          variant="outlined"
          density="comfortable"
          :error-messages="groupError"
        />

        <v-text-field
          v-model.trim="name"
          class="mt-2"
          data-testid="admin-product-name-input"
          label="Название"
          variant="outlined"
          density="comfortable"
          :disabled="!groupId"
          :error-messages="nameError"
        />

        <v-textarea
          v-model.trim="description"
          class="mt-2"
          label="Описание"
          variant="outlined"
          density="comfortable"
          rows="3"
          auto-grow
          :disabled="!groupId"
        />

        <v-select
          v-if="!isAddonGroup"
          v-model="type"
          class="mt-2"
          :items="typeItems"
          data-testid="admin-product-type-select"
          label="Тип продукта"
          variant="outlined"
          density="comfortable"
          :disabled="!groupId"
          :error-messages="typeError"
        />

        <v-chip
          v-else
          class="mt-2"
          color="secondary"
          size="small"
          label
        >
          Тип: Еда (группа допов)
        </v-chip>

        <template v-if="type === ProductType.Drink">
          <div class="admin-add-product__price-grid mt-2">
            <v-text-field
              v-model.number="drinkPriceSmall"
              data-testid="admin-product-price-s"
              type="number"
              min="1"
              label="Цена S"
              variant="outlined"
              density="comfortable"
              :error-messages="drinkPriceSmallError"
            />
            <v-text-field
              v-model.number="drinkPriceMedium"
              data-testid="admin-product-price-m"
              type="number"
              min="1"
              label="Цена M"
              variant="outlined"
              density="comfortable"
              :error-messages="drinkPriceMediumError"
            />
            <v-text-field
              v-model.number="drinkPriceLarge"
              data-testid="admin-product-price-l"
              type="number"
              min="1"
              label="Цена L"
              variant="outlined"
              density="comfortable"
              :error-messages="drinkPriceLargeError"
            />
          </div>
        </template>

        <v-text-field
          v-else
          v-model.number="singlePrice"
          class="mt-2"
          data-testid="admin-product-price-single"
          type="number"
          :min="isAddonGroup ? 0 : 1"
          :label="isAddonGroup ? 'Цена (0 — бесплатно)' : 'Цена'"
          variant="outlined"
          density="comfortable"
          :disabled="!groupId"
          :error-messages="singlePriceError"
        />

        <v-text-field
          v-model.number="sortOrder"
          class="mt-2"
          type="number"
          min="0"
          label="Порядок сортировки"
          variant="outlined"
          density="comfortable"
          :disabled="!groupId"
        />

        <v-switch
          v-model="isActive"
          class="mt-1"
          label="Активен"
          color="primary"
          hide-details
          :disabled="!groupId"
        />

        <v-switch
          v-model="isAvailable"
          label="Доступен к заказу"
          color="primary"
          hide-details
          :disabled="!groupId"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="isSubmitting"
          @click="$emit('cancel')"
        >
          Отмена
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          data-testid="admin-product-submit-btn"
          :loading="isSubmitting"
          @click="onSubmit"
        >
          Добавить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import {
  ProductType,
  SizeCode,
  type CreateProductDto,
  type ProductGroup,
} from "@/services/menu/types";
import type { AddProductSubmitPayload } from "./types";

const props = defineProps<{
  modelValue: boolean;
  isSubmitting: boolean;
  groups: ProductGroup[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [payload: AddProductSubmitPayload];
  cancel: [];
}>();

// Составной ключ 'p:{id}' для групп товаров, 'a:{id}' для групп аддонов.
// Необходим, чтобы избежать коллизий ID между двумя отдельными таблицами БД.
const groupId = ref<string | null>(null);
const name = ref("");
const description = ref("");
const type = ref<ProductType | null>(null);
const sortOrder = ref<number | null>(0);
const isActive = ref(true);
const isAvailable = ref(true);

const singlePrice = ref<number | null>(null);
const drinkPriceSmall = ref<number | null>(null);
const drinkPriceMedium = ref<number | null>(null);
const drinkPriceLarge = ref<number | null>(null);

const groupError = ref("");
const nameError = ref("");
const typeError = ref("");
const singlePriceError = ref("");
const drinkPriceSmallError = ref("");
const drinkPriceMediumError = ref("");
const drinkPriceLargeError = ref("");

const isAddonGroup = computed(() => groupId.value?.startsWith("a:") ?? false);

const groupItems = computed(() =>
  props.groups.map((group) => ({
    title: group.name,
    value: (group.isAddonsGroup ? "a:" : "p:") + group.id,
  })),
);

const typeItems = [
  { title: "Напиток", value: ProductType.Drink },
  { title: "Еда", value: ProductType.Food },
  { title: "Мерч", value: ProductType.Merch },
] as const;

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) resetForm();
  },
);

watch(groupId, (key) => {
  if (key?.startsWith("a:")) {
    type.value = ProductType.Food;
  } else if (!key) {
    type.value = null;
  }
  singlePriceError.value = "";
  drinkPriceSmallError.value = "";
  drinkPriceMediumError.value = "";
  drinkPriceLargeError.value = "";
});

watch(type, () => {
  singlePriceError.value = "";
  drinkPriceSmallError.value = "";
  drinkPriceMediumError.value = "";
  drinkPriceLargeError.value = "";
});

function resetForm(): void {
  groupId.value = null;
  name.value = "";
  description.value = "";
  type.value = null;
  sortOrder.value = 0;
  isActive.value = true;
  isAvailable.value = true;

  singlePrice.value = null;
  drinkPriceSmall.value = null;
  drinkPriceMedium.value = null;
  drinkPriceLarge.value = null;

  groupError.value = "";
  nameError.value = "";
  typeError.value = "";
  singlePriceError.value = "";
  drinkPriceSmallError.value = "";
  drinkPriceMediumError.value = "";
  drinkPriceLargeError.value = "";
}

function onModelUpdate(value: boolean): void {
  emit("update:modelValue", value);
}

function validateCommon(): boolean {
  groupError.value = "";
  nameError.value = "";
  typeError.value = "";

  if (!groupId.value) {
    groupError.value = "Выбери группу";
  }
  if (!name.value) {
    nameError.value = "Укажи название";
  }
  if (!type.value) {
    typeError.value = "Выбери тип продукта";
  }

  return !groupError.value && !nameError.value && !typeError.value;
}

function onSubmit(): void {
  if (!validateCommon()) {
    return;
  }

  singlePriceError.value = "";
  drinkPriceSmallError.value = "";
  drinkPriceMediumError.value = "";
  drinkPriceLargeError.value = "";

  const key = groupId.value!;
  const isAddonsGroupValue = isAddonGroup.value;
  const numericGroupId = parseInt(key.slice(2), 10);

  const product: CreateProductDto = {
    groupId: numericGroupId,
    name: name.value,
    description: description.value || null,
    type: type.value!,
    isActive: isActive.value,
    isAvailable: isAvailable.value,
    sortOrder: sortOrder.value ?? 0,
  };

  if (type.value === ProductType.Drink) {
    if (!drinkPriceSmall.value || drinkPriceSmall.value <= 0) {
      drinkPriceSmallError.value = "Укажи цену больше 0";
    }
    if (!drinkPriceMedium.value || drinkPriceMedium.value <= 0) {
      drinkPriceMediumError.value = "Укажи цену больше 0";
    }
    if (!drinkPriceLarge.value || drinkPriceLarge.value <= 0) {
      drinkPriceLargeError.value = "Укажи цену больше 0";
    }

    if (
      drinkPriceSmallError.value ||
      drinkPriceMediumError.value ||
      drinkPriceLargeError.value
    ) {
      return;
    }

    emit("submit", {
      product,
      isAddonsGroup: isAddonsGroupValue,
      prices: [
        { sizeCode: SizeCode.Small, priceRub: drinkPriceSmall.value! },
        { sizeCode: SizeCode.Medium, priceRub: drinkPriceMedium.value! },
        { sizeCode: SizeCode.Large, priceRub: drinkPriceLarge.value! },
      ],
    });

    return;
  }

  if (isAddonsGroupValue) {
    if (singlePrice.value === null || singlePrice.value < 0) {
      singlePriceError.value = "Укажи цену (0 или больше)";
      return;
    }
  } else {
    if (!singlePrice.value || singlePrice.value <= 0) {
      singlePriceError.value = "Укажи цену больше 0";
      return;
    }
  }

  emit("submit", {
    product,
    isAddonsGroup: isAddonsGroupValue,
    prices: [{ priceRub: singlePrice.value! }],
  });
}
</script>

<style lang="scss" scoped>
.admin-add-product__price-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

@media (max-width: 740px) {
  .admin-add-product__price-grid {
    grid-template-columns: 1fr;
  }
}
</style>

