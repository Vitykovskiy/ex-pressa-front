<template>
  <div class="customer-page menu-view">
    <template v-if="!activeGroup && !isMissingGroup">
      <div class="customer-section-label">
        <span class="customer-section-label__text">Categories</span>
        <span class="customer-section-label__line" />
      </div>

      <div
        v-if="menu.length"
        class="menu-list"
      >
        <button
          v-for="(group, index) in menu"
          :key="group.id"
          class="menu-category"
          :class="rowToneClass(index)"
          type="button"
          @click="onGroupClick(group.id)"
        >
          <div class="menu-category__content">
            <div>
              <p class="menu-category__eyebrow">{{ group.products.length }} позиций</p>
              <h2 class="menu-category__title">{{ group.name }}</h2>
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
      <section class="menu-group-hero">
        <div class="menu-group-hero__overlay" />
        <div class="menu-group-hero__content">
          <p class="customer-eyebrow">Selected collection</p>
          <h1 class="customer-title">{{ activeGroup.name }}</h1>
          <p class="customer-subtitle">
            Собранный список позиций для быстрого выбора и перехода в карточку товара.
          </p>
        </div>
      </section>

      <div class="customer-section-label">
        <span class="customer-section-label__text">
          {{ activeGroup.products.length }} позиций
        </span>
        <span class="customer-section-label__line" />
      </div>

      <div class="menu-products">
        <button
          v-for="(product, index) in activeGroup.products"
          :key="product.id"
          class="menu-product"
          type="button"
          @click="onProductClick(product.id)"
        >
          <div
            class="menu-product__content"
            :class="rowToneClass(index)"
          >
            <div>
              <h2 class="menu-product__title">{{ product.name }}</h2>
              <p class="menu-product__type">{{ productTypeLabel(product.type) }}</p>
            </div>

            <div class="menu-product__chips">
              <span class="menu-product__price-chip">
                {{ productPriceLabel(product) }}
              </span>
              <span
                v-for="price in product.prices.filter((item) => item.sizeCode)"
                :key="price.id"
                class="menu-product__size-chip"
              >
                {{ price.sizeCode }} · {{ price.priceRub }} ₽
              </span>
            </div>
          </div>

          <div
            class="menu-product__preview"
            :class="previewToneClass(index)"
          />
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
import router from "@/router";
import { RouteNames } from "@/routes";
import { useMenu } from "@/composables/useMenu";
import {
  ProductType,
  type Product,
  type ProductGroup,
} from "@/services/menu/types";
import { computed } from "vue";
import { useRoute } from "vue-router";

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
  const prices = product.prices.map((item) => item.priceRub);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  return product.type === ProductType.Drink ? `от ${minPrice} ₽` : `${minPrice} ₽`;
}

function rowToneClass(index: number): string {
  return index % 2 === 0 ? "tone-surface" : "tone-surface-soft";
}

function previewToneClass(index: number): string {
  return index % 3 === 0
    ? "tone-preview-coffee"
    : index % 3 === 1
      ? "tone-preview-cream"
      : "tone-preview-night";
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
.menu-list,
.menu-products {
  display: flex;
  flex-direction: column;
}

.menu-category,
.menu-product {
  width: 100%;
  border-bottom: 1px solid var(--customer-border-soft);
  text-align: left;
}

.menu-category {
  display: block;
}

.menu-category__content,
.menu-product__content {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  min-height: 72px;
}

.menu-category__eyebrow {
  margin-bottom: 4px;
  color: var(--customer-accent);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.menu-category__title {
  color: var(--customer-text);
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 20px;
  line-height: 1.2;
}

.menu-category__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(201, 169, 110, 0.28);
  border-radius: 999px;
  color: var(--customer-accent);
  background: rgba(201, 169, 110, 0.12);
}

.menu-group-hero {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.12), transparent 20%),
    linear-gradient(180deg, #6e4d31 0%, #2f241c 34%, #0d1b35 100%);
}

.menu-group-hero__overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(13, 27, 53, 0.06), rgba(13, 27, 53, 0.86)),
    radial-gradient(circle at 72% 28%, rgba(201, 169, 110, 0.18), transparent 24%);
}

.menu-group-hero__content {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 24px 20px;
}

.menu-product {
  display: flex;
  align-items: stretch;
}

.menu-product__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 92px;
  gap: 12px;
}

.menu-product__title {
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

.menu-product__preview {
  width: 80px;
  min-height: 92px;
}

.tone-surface {
  background: var(--customer-bg);
}

.tone-surface-soft {
  background: var(--customer-bg-soft);
}

.tone-preview-coffee {
  background:
    linear-gradient(180deg, rgba(13, 27, 53, 0.12), rgba(13, 27, 53, 0.28)),
    linear-gradient(145deg, #9b6d44, #412512);
}

.tone-preview-cream {
  background:
    linear-gradient(180deg, rgba(13, 27, 53, 0.16), rgba(13, 27, 53, 0.32)),
    linear-gradient(145deg, #c8a27a, #6a4730);
}

.tone-preview-night {
  background:
    radial-gradient(circle at 28% 24%, rgba(201, 169, 110, 0.26), transparent 18%),
    linear-gradient(145deg, #233a69, #0d1b35);
}
</style>
