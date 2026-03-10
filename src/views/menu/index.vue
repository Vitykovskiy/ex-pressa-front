<template>
  <div class="customer-page menu-view">
    <template v-if="!activeGroup && !isMissingGroup">
      <section class="customer-hero menu-root-hero">
        <p class="customer-eyebrow">Меню кофейни</p>
        <h1 class="customer-title customer-title--xl">Что будем заказывать?</h1>
      </section>

      <div
        v-if="menu.length"
        class="menu-list"
      >
        <button
          v-for="group in menu"
          :key="group.id"
          class="menu-category"
          type="button"
          @click="onGroupClick(group.id)"
        >
          <div>
            <h2 class="menu-category__title">{{ group.name }}</h2>
            <p class="menu-category__meta">{{ group.products.length }} позиций</p>
          </div>

          <span class="menu-category__arrow">
            <v-icon icon="mdi-arrow-right" size="18" />
          </span>
        </button>
      </div>

      <div
        v-else
        class="customer-empty"
      >
        <div class="customer-empty__icon">☕</div>
        <p class="customer-empty__text">Загружаем меню кофейни.</p>
      </div>
    </template>

    <template v-else-if="activeGroup">
      <section class="customer-hero">
        <p class="customer-eyebrow">{{ activeGroup.products.length }} позиций</p>
        <h1 class="customer-title">{{ activeGroup.name }}</h1>
      </section>

      <div class="menu-products">
        <button
          v-for="product in activeGroup.products"
          :key="product.id"
          class="menu-product"
          type="button"
          @click="onProductClick(product.id)"
        >
          <div class="menu-product__main">
            <div>
              <h2 class="menu-product__title">{{ product.name }}</h2>
              <p class="menu-product__type">{{ productTypeLabel(product.type) }}</p>
            </div>

            <v-icon icon="mdi-chevron-right" size="18" class="menu-product__chevron" />
          </div>

          <div v-if="priceChips(product).length" class="menu-product__chips">
            <span
              v-for="chip in priceChips(product)"
              :key="chip"
              class="menu-product__chip"
            >
              {{ chip }}
            </span>
          </div>
        </button>
      </div>
    </template>

    <div
      v-else
      class="customer-empty"
    >
      <div class="customer-empty__icon">☕</div>
      <p class="customer-empty__text">Категория не найдена.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useMenu } from "@/composables/useMenu";
import router from "@/router";
import { RouteNames } from "@/routes";
import { ProductType, type Product, type ProductGroup } from "@/services/menu/types";

defineOptions({
  name: "MenuView",
});

const route = useRoute();
const { menu } = useMenu();

const activeGroup = computed<ProductGroup | null>(() => {
  if (!route.params.group) {
    return null;
  }

  return menu.value.find(({ id }) => id === Number(route.params.group)) ?? null;
});

const isMissingGroup = computed(
  () => Boolean(route.params.group) && menu.value.length > 0 && !activeGroup.value,
);

function productTypeLabel(type: ProductType): string {
  switch (type) {
    case ProductType.Drink:
      return "Напиток";
    case ProductType.Food:
      return "Еда";
    case ProductType.Merch:
      return "Доп. позиция";
    default:
      return "Позиция";
  }
}

function priceChips(product: Product): string[] {
  const withSizes = (product.prices ?? [])
    .filter((entry) => entry.sizeCode)
    .map((entry) => `${entry.sizeCode} · ${entry.priceRub} ₽`);

  if (withSizes.length) {
    return withSizes;
  }

  const basePrice = product.prices?.[0]?.priceRub;
  return typeof basePrice === "number" ? [`${basePrice} ₽`] : [];
}

function onGroupClick(groupId: number): void {
  router.push({ name: RouteNames.Menu, params: { group: groupId } });
}

function onProductClick(itemId: number): void {
  if (!activeGroup.value) {
    return;
  }

  router.push({
    name: RouteNames.MenuItem,
    params: { group: activeGroup.value.id, item: itemId },
  });
}
</script>

<style lang="scss" scoped>
.menu-root-hero {
  padding-top: 34px;
  padding-bottom: 24px;
}

.menu-list,
.menu-products {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 16px 28px;
}

.menu-category,
.menu-product {
  width: 100%;
  border-radius: 24px;
  padding: 18px 18px 16px;
  text-align: left;
  background: #fff;
  box-shadow: 0 10px 30px rgba(6, 28, 109, 0.16);
}

.menu-category {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 92px;
}

.menu-category__title,
.menu-product__title {
  margin: 0;
  color: var(--customer-ink);
  font-size: 22px;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.menu-category__meta,
.menu-product__type {
  margin: 8px 0 0;
  color: rgba(15, 40, 128, 0.55);
  font-size: 13px;
  font-weight: 600;
}

.menu-category__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border-radius: 999px;
  color: #fff;
  background: var(--customer-blue);
}

.menu-product {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.menu-product__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.menu-product__title {
  font-size: 20px;
}

.menu-product__chevron {
  color: rgba(15, 40, 128, 0.4);
}

.menu-product__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.menu-product__chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 12px;
  background: #e7efff;
  color: var(--customer-blue);
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 420px) {
  .menu-category__title,
  .menu-product__title {
    font-size: 18px;
  }
}
</style>
