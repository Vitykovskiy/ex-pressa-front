<template>
  <v-data-table
    hide-default-footer
    :items-per-page="-1"
    :items="items"
    :headers="headers"
    hover
    no-data-text="Пока не загрузилось"
    @click:row="onRowClick"
  >
    <template v-slot:[HEADER_NAME_SLOT]>
      <h2>{{ title }}</h2>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import {
  DRINKS_TABLE_HEADERS,
  GROUPS_TABLE_HEADERS,
  OTHER_TABLE_HEADERS,
} from "./constants";
import {
  type DrinkSizesRecord,
  type GroupTableRowItem,
  type OtherTableRowItem,
  type TableRow,
} from "./types";
import type { DataTableHeader } from "vuetify";
import type { ItemSlotBase } from "vuetify/lib/components/VDataTable/types.mjs";
import router from "@/router";
import { useRoute } from "vue-router";
import { RouteNames } from "@/routes";
import { useMenu } from "@/composables/useMenu";
import {
  ProductType,
  type ProductGroup,
  type ProductPrice,
} from "@/services/menu/types";

defineOptions({
  name: "MenuView",
});

const HEADER_NAME_SLOT = "header.name";

const route = useRoute();
const { menu } = useMenu();
const activeGroup = computed<ProductGroup | null>(
  () => menu.value.find(({ id }) => id === Number(route.params.group)) ?? null,
);

const title = computed(() =>
  activeGroup.value ? activeGroup.value.name : "Меню",
);

const items = computed<TableRow[]>(() => {
  if (!activeGroup.value) {
    return menu.value.map(({ id, name }) => ({
      id,
      name,
    })) as GroupTableRowItem[];
  }

  const products = activeGroup.value.products ?? [];
  const isDrinkGroup = products.some((item) => item.type === ProductType.Drink);

  if (isDrinkGroup) {
    const unzip = (prices: ProductPrice[]): DrinkSizesRecord =>
      prices.reduce((acc, value) => {
        if (!value.sizeCode) {
          return acc;
        }
        acc[value.sizeCode] = { price: value.priceRub };
        return acc;
      }, {} as DrinkSizesRecord);

    return products.map(({ prices, ...rest }) => ({
      ...rest,
      type: ProductType.Drink,
      sizes: unzip(prices ?? []),
    }));
  }

  return products.map(({ id, name, prices, type }) => ({
    id,
    name,
    type: type === ProductType.Drink ? ProductType.Food : type,
    price: prices?.[0]?.priceRub ?? 0,
  })) as OtherTableRowItem[];
});

const headers = computed<DataTableHeader[]>(() => {
  if (!activeGroup.value) {
    return GROUPS_TABLE_HEADERS;
  }

  const isDrinkGroup = activeGroup.value.products?.some(
    (item) => item.type === ProductType.Drink,
  );

  return isDrinkGroup ? DRINKS_TABLE_HEADERS : OTHER_TABLE_HEADERS;
});

function onRowClick(
  _event: globalThis.MouseEvent,
  ctx: ItemSlotBase<TableRow>,
): void {
  const tableRow = ctx.item as { id: number };

  if (!activeGroup.value) {
    router.push({ name: RouteNames.Menu, params: { group: tableRow.id } });
    return;
  }

  router.push({ name: RouteNames.MenuItem, params: { item: tableRow.id } });
}
</script>

<style lang="scss" scoped></style>
