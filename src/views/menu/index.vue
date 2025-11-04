<template>
  <div class="menu">
    <v-data-table hide-default-footer :items-per-page="-1" :items="items" :headers="headers" hover
      @click:row="onRowClick">
      <template v-slot:header.name>
        <h2>{{ title }}</h2>
      </template>

    </v-data-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, } from "vue";
import { DRINKS_TABLE_HEADERS, GROUPS_TABLE_HEADERS, OTHER_TABLE_HEADERS } from "./constants";
import { type TableRow, MenuGroupType, isMenuGroup, isMenuItem } from "./types";
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

const items = computed<TableRow[]>(() =>
  activeGroup.value ? activeGroup.value.items : menu.value
);

const headers = computed<DataTableHeader[]>(() => {
  if (!activeGroup.value) {
    return GROUPS_TABLE_HEADERS
  }

  switch (activeGroup.value.type) {
    case MenuGroupType.Drinks:
      return DRINKS_TABLE_HEADERS;

    case MenuGroupType.Food:
      return OTHER_TABLE_HEADERS;

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

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
}
</style>
