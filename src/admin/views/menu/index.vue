<template>
  <div class="admin-menu">
    <div class="admin-menu__toolbar">
      <h2>Меню</h2>
      <v-btn prepend-icon="mdi-plus"
             color="primary"
             variant="flat"
             disabled>
        Добавить позицию
      </v-btn>
    </div>

    <div class="admin-menu__list">
      <v-card v-for="group in groups"
              :key="group.id"
              class="admin-menu__group"
              variant="outlined">
        <div class="admin-menu__group-head">
          <strong>{{ group.name }}</strong>
          <v-chip size="small"
                  color="secondary"
                  variant="tonal">
            {{ group.products.length }} поз.
          </v-chip>
        </div>

        <v-divider class="my-2" />

        <div class="admin-menu__products">
          <div v-for="product in group.products"
               :key="product.id"
               class="admin-menu__product">
            <span>{{ product.name }}</span>
            <span>{{ minPrice(product.prices) }} ₽</span>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import menuService from "@/services/menu";
import type { ProductGroup, ProductPrice } from "@/services/menu/types";

defineOptions({
  name: "AdminMenuView",
});

const groups = ref<ProductGroup[]>([]);

function minPrice(prices: ProductPrice[]): number {
  return prices.reduce((acc, row) => Math.min(acc, row.priceRub), prices[0]?.priceRub ?? 0);
}

onMounted(async () => {
  groups.value = await menuService.fetchMenu();
});
</script>

<style lang="scss" scoped>
.admin-menu {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-menu__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.admin-menu__toolbar h2 {
  margin: 0;
}

.admin-menu__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 10px;
}

.admin-menu__group {
  padding: 12px;
}

.admin-menu__group-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-menu__products {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-menu__product {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
</style>
