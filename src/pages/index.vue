<template>
  <div class="menu">
    <div class="menu__header">
      <v-btn variant="plain" color="primary" icon="mdi-cart-variant" />
    </div>
    <h2 class="menu__title">Меню</h2>
    <div class="menu__content">
      <template v-for="(item, idx) in menu">
        <v-btn class="menu__item" variant="flat">
          <span class="item__name">{{ item.name }}</span>
          <span class="item__price"> {{ item.price }}</span>
        </v-btn>
        <v-divider v-if="idx !== menu.length - 1"></v-divider>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import type { HttpError } from '@/services/http';
import menuService from '@/services/menu';
import type { MenuItem } from '@/services/menu/types';

const menu = ref<MenuItem[]>([])

onBeforeMount(async () => {
  try {
    menu.value = await menuService.fetchMenu();
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
</style>
