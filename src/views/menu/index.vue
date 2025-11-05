<template>
  <v-data-table hide-default-footer :items-per-page="-1" :items="items" :headers="headers" hover
    no-data-text="Пока не загрузилось" @click:row="onRowClick">
    <template v-slot:header.name>
      <h2>{{ title }}</h2>
    </template>

  </v-data-table>
</template>

<script lang="ts" setup>
import { computed, } from "vue";
import { DRINKS_TABLE_HEADERS, GROUPS_TABLE_HEADERS, OTHER_TABLE_HEADERS } from "./constants";
import { type DrinkSizeVariant, type DrinkSizesRecord, type TableRow, MenuGroupType, isDrinksGroup, isMenuGroup, isMenuItem } from "./types";
import type { DataTableHeader } from "vuetify";
import type { ItemSlotBase } from "vuetify/lib/components/VDataTable/types.mjs";
import router from "@/router";
import { useRoute } from "vue-router";
import { RouteNames } from "@/routes";
import { useMenu } from "@/composables/useMenu";

const route = useRoute()
const { menu } = useMenu()
const activeGroup = computed(() => menu.value.find(({ id }) => id === Number(route.params.group)));

const title = computed(() =>
  activeGroup.value ? activeGroup.value.name : "Меню",
);

const items = computed<TableRow[]>(() => {
  if (!activeGroup.value) {
    return menu.value
  }

  if (isDrinksGroup(activeGroup.value)) {
    const unzip = (sizes: DrinkSizeVariant[]): DrinkSizesRecord =>
      sizes.reduce((acc, value) => {
        acc[value.size] = { price: value.price };
        return acc;
      }, {} as DrinkSizesRecord);

    const data = activeGroup.value.items.map(({ sizes, ...rest }) => ({ ...rest, sizes: unzip(sizes) }))
    console.log(data)
    return data
  }
  return activeGroup.value.items
}
);

const headers = computed<DataTableHeader[]>(() => {
  if (!activeGroup.value) {
    return GROUPS_TABLE_HEADERS
  }

  switch (activeGroup.value.type) {
    case MenuGroupType.Drinks:
      return DRINKS_TABLE_HEADERS;

    case MenuGroupType.Other:
      return OTHER_TABLE_HEADERS;

    default:
      return GROUPS_TABLE_HEADERS;
  }
});

function onRowClick(
  _event: MouseEvent,
  ctx: ItemSlotBase<TableRow>,
): void {
  const tableRow = ctx.item;

  if (isMenuGroup(tableRow)) {
    router.push({ name: RouteNames.Menu, params: { group: tableRow.id } })
    return;
  }

  if (isMenuItem(tableRow)) {
    router.push({ name: RouteNames.MenuItem, params: { item: tableRow.id } })
  }
}
</script>

<style lang="scss" scoped></style>
