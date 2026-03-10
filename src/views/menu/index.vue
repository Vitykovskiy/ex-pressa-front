<template>
  <div class="customer-page menu-view">
    <template v-if="!activeGroup && !isMissingGroup">
      <section class="customer-hero menu-root-hero">
        <p class="customer-eyebrow">Daily menu</p>
        <h1 class="customer-title customer-title--xl">Меню кофейни</h1>

        <div class="menu-root-hero__meta">
          <p class="menu-root-hero__count">{{ menu.length }} категории</p>
          <span class="menu-root-hero__line" />
        </div>
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
          <div class="menu-category__content">
            <div>
              <h2 class="menu-category__title">{{ group.name }}</h2>
              <p class="menu-category__meta">{{ group.products.length }} позиций</p>
            </div>

            <span class="menu-category__arrow">
              <v-icon icon="mdi-arrow-top-right" size="16" />
            </span>
          </div>
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
        <p class="customer-eyebrow">Selected collection</p>
        <h1 class="customer-title">{{ activeGroup.name }}</h1>
        <p class="customer-subtitle">
          Собранный список позиций для быстрого выбора и перехода в карточку товара.
        </p>
      </section>

      <div class="customer-section-label">
        <span class="customer-section-label__text">
          {{ activeGroup.products.length }} позиций
        </span>
        <span class="customer-section-label__line" />
      </div>

      <div class="menu-products">
        <button
          v-for="product in activeGroup.products"
          :key="product.id"
          class="menu-product"
          type="button"
          @click="onProductClick(product.id)"
        >
          <div class="menu-product__content">
            <div>
              <h2 class="menu-product__title">{{ product.name }}</h2>
              <p class="menu-product__type">{{ productTypeLabel(product.type) }}</p>
            </div>

            <div class="menu-product__chips">
              <span class="menu-product__price-chip">
                {{ productPriceLabel(product) }}
              </span>
              <span
                v-for="price in product.prices.filter((entry) => entry.sizeCode)"
                :key="price.id"
                class="menu-product__size-chip"
              >
                {{ price.sizeCode }} · {{ price.priceRub }} ₽
              </span>
            </div>
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
import {
  ProductType,
  type Product,
  type ProductGroup,
} from "@/services/menu/types";

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

function productPriceLabel(product: Product): string {
  const prices = product.prices.map((entry) => entry.priceRub);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  return product.type === ProductType.Drink ? `от ${minPrice} ₽` : `${minPrice} ₽`;
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
  padding-top: 32px;
  padding-bottom: 24px;
}

.menu-root-hero__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.menu-root-hero__count {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  white-space: nowrap;
}

.menu-root-hero__line {
  flex: 1 1 auto;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.menu-list,
.menu-products {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px 40px;
}

.menu-category,
.menu-product {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 16px 18px;
  text-align: left;
  background: #111e38;
}

.menu-category__content,
.menu-product__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.menu-category__title {
  margin: 0 0 4px;
  color: var(--customer-text);
  font-family: var(--customer-display-font);
  font-size: 20px;
  line-height: 1.2;
}

.menu-category__meta,
.menu-product__type {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.menu-category__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(201, 169, 110, 0.25);
  border-radius: 999px;
  color: var(--customer-accent);
  background: rgba(201, 169, 110, 0.1);
}

.menu-product__content {
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.menu-product__title {
  margin: 0 0 4px;
  color: var(--customer-text);
  font-size: 16px;
  line-height: 1.3;
}

.menu-product__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.menu-product__price-chip,
.menu-product__size-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 11px;
}

.menu-product__price-chip {
  border: 1px solid rgba(201, 169, 110, 0.24);
  background: rgba(201, 169, 110, 0.12);
  color: var(--customer-accent);
  font-weight: 600;
}

.menu-product__size-chip {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: var(--customer-text-muted);
}
</style>
