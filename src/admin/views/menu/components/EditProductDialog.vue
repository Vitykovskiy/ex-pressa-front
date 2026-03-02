<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    @update:model-value="onModelUpdate"
  >
    <v-card>
      <v-card-title>Редактировать товар</v-card-title>
      <v-card-text>
        <v-select
          v-model="groupId"
          :items="groupItems"
          label="Группа"
          variant="outlined"
          density="comfortable"
          :error-messages="groupError"
        />

        <v-text-field
          v-model.trim="name"
          class="mt-2"
          label="Название"
          variant="outlined"
          density="comfortable"
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
        />

        <v-select
          v-model="type"
          class="mt-2"
          :items="typeItems"
          label="Тип продукта"
          variant="outlined"
          density="comfortable"
          :error-messages="typeError"
        />

        <template v-if="type === ProductType.Drink">
          <div class="admin-edit-product__price-grid mt-2">
            <v-text-field
              v-model.number="drinkPriceSmall"
              type="number"
              min="1"
              label="Цена S"
              variant="outlined"
              density="comfortable"
              :error-messages="drinkPriceSmallError"
            />
            <v-text-field
              v-model.number="drinkPriceMedium"
              type="number"
              min="1"
              label="Цена M"
              variant="outlined"
              density="comfortable"
              :error-messages="drinkPriceMediumError"
            />
            <v-text-field
              v-model.number="drinkPriceLarge"
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
          type="number"
          min="1"
          label="Цена"
          variant="outlined"
          density="comfortable"
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
        />

        <v-switch
          v-model="isActive"
          class="mt-1"
          label="Активен"
          color="primary"
          hide-details
        />

        <v-switch
          v-model="isAvailable"
          label="Доступен к заказу"
          color="primary"
          hide-details
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
          :loading="isSubmitting"
          @click="onSubmit"
        >
          Сохранить
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
  type Product,
  type ProductGroup,
} from "@/services/menu/types";
import type { EditProductSubmitPayload } from "./types";

const props = defineProps<{
  modelValue: boolean;
  isSubmitting: boolean;
  groups: ProductGroup[];
  product: Product | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [payload: EditProductSubmitPayload];
  cancel: [];
}>();

const groupId = ref<number | null>(null);
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

const groupItems = computed(() =>
  props.groups.map((group) => ({
    title: group.name,
    value: group.id,
  })),
);

const typeItems = [
  { title: "Напиток", value: ProductType.Drink },
  { title: "Еда", value: ProductType.Food },
  { title: "Мерч", value: ProductType.Merch },
] as const;

watch(
  () => [props.modelValue, props.product] as const,
  ([isOpen, product]) => {
    if (!isOpen || !product) {
      return;
    }

    const fallbackGroupId = props.groups[0]?.id ?? null;
    groupId.value = product.group?.id ?? fallbackGroupId;
    name.value = product.name;
    description.value = product.description ?? "";
    type.value = product.type;
    sortOrder.value = product.sortOrder ?? 0;
    isActive.value = product.isActive;
    isAvailable.value = product.isAvailable;

    singlePrice.value = product.prices[0]?.priceRub ?? null;
    drinkPriceSmall.value =
      product.prices.find((price) => price.sizeCode === SizeCode.Small)
        ?.priceRub ?? null;
    drinkPriceMedium.value =
      product.prices.find((price) => price.sizeCode === SizeCode.Medium)
        ?.priceRub ?? null;
    drinkPriceLarge.value =
      product.prices.find((price) => price.sizeCode === SizeCode.Large)
        ?.priceRub ?? null;

    groupError.value = "";
    nameError.value = "";
    typeError.value = "";
    singlePriceError.value = "";
    drinkPriceSmallError.value = "";
    drinkPriceMediumError.value = "";
    drinkPriceLargeError.value = "";
  },
);

function onModelUpdate(value: boolean): void {
  emit("update:modelValue", value);
}

function onSubmit(): void {
  if (!props.product) {
    return;
  }

  groupError.value = "";
  nameError.value = "";
  typeError.value = "";
  singlePriceError.value = "";
  drinkPriceSmallError.value = "";
  drinkPriceMediumError.value = "";
  drinkPriceLargeError.value = "";

  if (!groupId.value) {
    groupError.value = "Выбери группу";
  }
  if (!name.value) {
    nameError.value = "Укажи название";
  }
  if (!type.value) {
    typeError.value = "Выбери тип продукта";
  }

  if (groupError.value || nameError.value || typeError.value) {
    return;
  }

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
      productId: props.product.id,
      payload: {
        groupId: groupId.value!,
        name: name.value,
        description: description.value || null,
        type: type.value,
        isActive: isActive.value,
        isAvailable: isAvailable.value,
        sortOrder: sortOrder.value ?? 0,
      },
      prices: [
        { sizeCode: SizeCode.Small, priceRub: drinkPriceSmall.value! },
        { sizeCode: SizeCode.Medium, priceRub: drinkPriceMedium.value! },
        { sizeCode: SizeCode.Large, priceRub: drinkPriceLarge.value! },
      ],
    });
    return;
  }

  if (!singlePrice.value || singlePrice.value <= 0) {
    singlePriceError.value = "Укажи цену больше 0";
    return;
  }

  emit("submit", {
    productId: props.product.id,
    payload: {
      groupId: groupId.value!,
      name: name.value,
      description: description.value || null,
      type: type.value!,
      isActive: isActive.value,
      isAvailable: isAvailable.value,
      sortOrder: sortOrder.value ?? 0,
    },
    prices: [{ priceRub: singlePrice.value }],
  });
}
</script>

<style lang="scss" scoped>
.admin-edit-product__price-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

@media (max-width: 740px) {
  .admin-edit-product__price-grid {
    grid-template-columns: 1fr;
  }
}
</style>
