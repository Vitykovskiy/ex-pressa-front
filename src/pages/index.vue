<template>
  <div class="menu">
    <div class="menu__header">
      <v-btn variant="plain" color="primary" icon="mdi-cart-variant" />
    </div>
    <h2 class="menu__title">{{ title }}</h2>
    <div class="menu__content">
      <v-data-table hide-default-footer :items-per-page="-1" :items="menu" :headers="headers" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import type { HttpError } from '@/services/http';
import menuService from '@/services/menu';
import type { MenuItem } from '@/services/menu/types';
import type { DataTableHeader } from 'vuetify';

const title = ref('Меню')
const menu = ref<MenuItem[]>([
  {
    "id": 1,
    "name": "Кофе",
    "price": 120,
    "isAvailable": true,
    "position": 1,
    "createdAt": "2025-11-03T12:59:40.000Z",
    "updatedAt": "2025-11-03T12:59:40.000Z"
  },
  {
    "id": 3,
    "name": "Кофе",
    "price": 120,
    "isAvailable": true,
    "position": 1,
    "createdAt": "2025-11-03T13:40:07.000Z",
    "updatedAt": "2025-11-03T13:40:07.000Z"
  },
  {
    "id": 2,
    "name": "Чай",
    "price": 100,
    "isAvailable": true,
    "position": 2,
    "createdAt": "2025-11-03T12:59:40.000Z",
    "updatedAt": "2025-11-03T12:59:40.000Z"
  },
  {
    "id": 4,
    "name": "Чай",
    "price": 100,
    "isAvailable": true,
    "position": 2,
    "createdAt": "2025-11-03T13:40:07.000Z",
    "updatedAt": "2025-11-03T13:40:07.000Z"
  }
])

const headers = ref<DataTableHeader[]>([
  { title: 'Наименование', key: 'name', sortable: false },
  { title: 'S', key: 'price', align: 'end', sortable: false },
  { title: 'M', key: 'price', align: 'end', sortable: false },
  { title: 'L', key: 'price', align: 'end', sortable: false }
])


onBeforeMount(async () => {
  try {
    /*  menu.value = await menuService.fetchMenu(); */
  } catch (e) {
    const err = e as HttpError;
    console.error(err.message, err.status, err.data);
  }
})

</script>

<style lang="scss" scoped>
.menu {
  max-width: 400px;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    justify-content: end;
  }

  &__title {
    padding: 5px 20px;
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
