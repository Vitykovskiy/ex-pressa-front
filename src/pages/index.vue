<template>
  <div class="menu">
    <div class="menu__header">
      <div class="menu__header-left">
        <v-btn v-if="activeGroup" variant="plain" icon="mdi-arrow-left" @click="goToMenu" />
      </div>
      <div class="menu__header-right">
        <v-btn variant="plain" color="primary" icon="mdi-cart-variant" />
      </div>
    </div>

    <div class="menu__content">
      <v-data-table hide-default-footer :items-per-page="-1" :items="items" :headers="headers" hover
        @click:row="onRowClick">
        <template v-slot:header.name>
          <h2 class="menu__title">{{ title }}</h2>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, computed } from "vue";
import type { HttpError } from "@/services/http";
import {
  isMenuGroup,
  isMenuItem,
  MenuGroupType,
  type AnyMenuGroup,
  type TableRow,
} from "@/services/menu/types";
import type { DataTableHeader } from "vuetify";
import { DRINKS_TABLE_HEADERS, GROUPS_TABLE_HEADERS, MENU_DATA, OTHER_TABLE_HEADERS } from "./constants";
import type { ItemSlotBase } from "vuetify/lib/components/VDataTable/types.mjs";

const menu = ref<AnyMenuGroup[]>(MENU_DATA);

const activeGroup = ref<AnyMenuGroup | null>(null);

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

  if (!activeGroup.value && isMenuGroup(tableRow)) {
    activeGroup.value = tableRow;
    return;
  }

  if (activeGroup.value && isMenuItem(tableRow)) {
    console.log("clicked menu item", tableRow);
  }
}

function goToMenu(): void {
  activeGroup.value = null
}

onBeforeMount(async () => {
  try {
    // menu.value = await menuService.fetchMenu();
    // activeGroup.value = menu.value[0] ?? null;   // если надо сразу открыть первую группу
  } catch (e) {
    const err = e as HttpError;
    console.error(err.message, err.status, err.data);
  }
});
</script>

<style lang="scss" scoped>
.menu {
  max-width: 400px;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    justify-content: space-between;
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  :deep(.v-btn__content) {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  &__item {
    padding: 5px 20px;
    display: flex;

  }
}

.item {
  &__variants {
    display: flex;
    justify-content: end;
    gap: 5px
  }
}
</style>
