<template>
  <div class="cart-view">
    <v-data-table
      class="cart-view__table"
      hide-default-footer
      :items-per-page="-1"
      :items="cart"
      :headers="headers"
      hover
      no-data-text="Пока ничего не добавлено"
      @click:row="onRowClick"
    >
      <template v-slot:[HEADER_ITEM_SLOT]>
        <h2>Корзина</h2>
      </template>
      <template v-slot:[ITEM_ITEM_SLOT]="{ item, index }">
        <CartRow
          :item="item"
          @remove="onRemoveItem(index)"
        />
      </template>
    </v-data-table>

    <div class="cart-view__footer">
      <v-btn
        block
        size="large"
        color="primary"
        :disabled="!cart.length"
        @click="onSubmitOrder"
      >
        Оформить заказ
        <template v-if="cart.length"> · {{ totalPrice }} ₽</template>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCart } from "@/composables/useCart";
import CartRow from "./cartRow/index.vue";
import { computed, ref } from "vue";
import { CART_TABLE_HEADERS } from "./constants";
import type { DataTableHeader } from "vuetify";
import type { ItemSlotBase } from "vuetify/lib/components/VDataTable/types.mjs";
import router from "@/router";
import { RouteNames } from "@/routes";
import type { ICartItem } from "@/composables/types";

defineOptions({
  name: "CartView",
});

const HEADER_ITEM_SLOT = "header.item";
const ITEM_ITEM_SLOT = "item.item";

const { cart, removeCartItem } = useCart();
const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

const headers = ref<DataTableHeader[]>(CART_TABLE_HEADERS);

function onRowClick(
  _event: globalThis.MouseEvent,
  ctx: ItemSlotBase<ICartItem>,
): void {
  const index = ctx.index;
  const { id, groupId, selectedOptions, ...rest } = ctx.item;
  router.push({
    name: RouteNames.MenuItem,
    params: { group: groupId, item: id },
    query: {
      cartIndex: index,
      options: selectedOptions?.map(({ id }) => id),
      ...rest,
    },
  });
}

function onSubmitOrder(): void {
  // TODO: Подключить отправку заказа через API, когда корзина переедет на backend.
}

function onRemoveItem(index: number): void {
  removeCartItem(index);
}
</script>

<style lang="scss" scoped>
.cart-view {
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 88px);
  padding-bottom: 8px;
}

.cart-view__table {
  flex: 1 1 auto;
  min-height: 0;
}

.cart-view__footer {
  flex: 0 0 auto;
  margin-top: 12px;
  padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
}
</style>
