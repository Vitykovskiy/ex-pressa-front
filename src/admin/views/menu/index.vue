<template>
  <div class="admin-menu">
    <div class="admin-menu__toolbar">
      <h2>Меню</h2>

      <div class="admin-menu__actions">
        <v-btn
          prepend-icon="mdi-folder-plus"
          color="primary"
          variant="flat"
          @click="isAddGroupDialogOpen = true"
        >
          Добавить группу</v-btn
        >

        <v-btn
          prepend-icon="mdi-plus"
          color="primary"
          variant="outlined"
          @click="isAddProductDialogOpen = true"
        >
          Добавить товар</v-btn
        >
      </div>
    </div>

    <div class="admin-menu__list">
      <v-card
        v-for="group in menuGroups"
        :key="group.id"
        class="admin-menu__group"
        variant="outlined"
      >
        <div class="admin-menu__group-head">
          <strong>{{ group.name }}</strong>
          <div class="admin-menu__group-actions">
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              variant="text"
              color="primary"
              @click="openEditGroupDialog(group)"
            />
            <v-btn
              icon="mdi-trash-can-outline"
              size="x-small"
              variant="text"
              color="error"
              @click="openDeleteGroupDialog(group)"
            />
          </div>
        </div>

        <v-divider class="my-2" />

        <div class="admin-menu__products">
          <div
            v-for="product in group.products"
            :key="product.id"
            class="admin-menu__product"
          >
            <span>{{ product.name }}</span>
            <div class="admin-menu__product-actions">
              <span>{{ formatProductPrice(product) }}</span>
              <v-btn
                icon="mdi-pencil"
                size="x-small"
                variant="text"
                color="primary"
                @click="onEditPosition(group, product)"
              />
              <v-btn
                icon="mdi-trash-can-outline"
                size="x-small"
                variant="text"
                color="error"
                @click="onDeletePosition(group, product)"
              />
            </div>
          </div>
        </div>
      </v-card>
    </div>

    <AddGroupDialog
      v-model="isAddGroupDialogOpen"
      :addon-groups="addonGroupOptions"
      :is-submitting="isCreateGroupLoading"
      @submit="onCreateGroup"
      @cancel="isAddGroupDialogOpen = false"
    />

    <AddProductDialog
      v-model="isAddProductDialogOpen"
      :groups="menuGroups"
      :is-submitting="isCreateProductLoading"
      @submit="onCreateProduct"
      @cancel="isAddProductDialogOpen = false"
    />

    <EditGroupDialog
      v-model="isEditGroupDialogOpen"
      :group="selectedGroup"
      :addon-groups="addonGroupOptions"
      :is-submitting="isUpdateGroupLoading"
      @submit="onEditGroup"
      @cancel="isEditGroupDialogOpen = false"
    />

    <EditProductDialog
      v-model="isEditProductDialogOpen"
      :groups="groups"
      :product="selectedProduct"
      :is-submitting="isUpdateProductLoading"
      @submit="onEditProduct"
      @cancel="isEditProductDialogOpen = false"
    />

    <EditAddonDialog
      v-model="isEditAddonDialogOpen"
      :addon="selectedAddon"
      :is-submitting="isUpdateAddonLoading"
      @submit="onEditAddon"
      @cancel="isEditAddonDialogOpen = false"
    />

    <DeleteConfirmDialog
      v-model="isDeleteDialogOpen"
      :entity-label="deleteEntityLabel"
      :entity-name="deleteEntityName"
      :is-submitting="isDeleteLoading"
      @cancel="closeDeleteDialog"
      @confirm="onDeleteEntity"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import menuService from "@/services/menu";
import { ProductType } from "@/services/menu/types";
import AddGroupDialog from "./components/AddGroupDialog.vue";
import AddProductDialog from "./components/AddProductDialog.vue";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog.vue";
import EditAddonDialog from "./components/EditAddonDialog.vue";
import EditGroupDialog from "./components/EditGroupDialog.vue";
import EditProductDialog from "./components/EditProductDialog.vue";
import type {
  Addon,
  AddonGroup,
  CreateProductPriceDto,
  ProductGroup,
  Product,
  ProductPrice,
} from "@/services/menu/types";
import type {
  AddGroupSubmitPayload,
  AddProductSubmitPayload,
  EditAddonSubmitPayload,
  EditGroupSubmitPayload,
  EditProductSubmitPayload,
} from "./components/types";

defineOptions({
  name: "AdminMenuView",
});

const groups = ref<ProductGroup[]>([]);
const standaloneAddonGroups = ref<ProductGroup[]>([]);
const isAddGroupDialogOpen = ref(false);
const isCreateGroupLoading = ref(false);
const isAddProductDialogOpen = ref(false);
const isCreateProductLoading = ref(false);
const isEditGroupDialogOpen = ref(false);
const isUpdateGroupLoading = ref(false);
const isEditProductDialogOpen = ref(false);
const isUpdateProductLoading = ref(false);
const isEditAddonDialogOpen = ref(false);
const isUpdateAddonLoading = ref(false);
const selectedGroup = ref<ProductGroup | null>(null);
const selectedProduct = ref<Product | null>(null);
const selectedAddon = ref<{
  id: number;
  addonGroupId: number;
  name: string;
  priceRub: number;
  isActive: boolean;
} | null>(null);
const isDeleteDialogOpen = ref(false);
const isDeleteLoading = ref(false);
const deleteEntityLabel = ref("");
const deleteEntityName = ref("");
const deleteTarget = ref<{
  kind: "group" | "product" | "addon";
  id: number;
  isAddonsGroup?: boolean;
} | null>(null);

function mapAddonGroupToProductGroup(group: AddonGroup): ProductGroup {
  return {
    id: group.id,
    name: group.name,
    sortOrder: group.sortOrder,
    isActive: group.isActive,
    isAddonsGroup: true,
    products: group.addons.map((addon: Addon) => ({
      id: addon.id,
      group: { id: group.id, name: group.name },
      name: addon.name,
      description: null,
      type: ProductType.Food,
      isActive: addon.isActive,
      isAvailable: true,
      sortOrder: 0,
      prices: [
        { id: addon.id, priceRub: addon.priceRub, isActive: addon.isActive },
      ],
    })),
    addonLinks: [],
  };
}

function extractAddonGroupsFromMenu(menu: ProductGroup[]): ProductGroup[] {
  const byId = new Map<number, ProductGroup>();

  for (const group of menu) {
    for (const link of group.addonLinks) {
      const addonGroup = link.addonGroup;
      if (!addonGroup) {
        continue;
      }

      if (!byId.has(addonGroup.id)) {
        byId.set(addonGroup.id, mapAddonGroupToProductGroup(addonGroup));
      }
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}

const addonGroupOptions = computed<ProductGroup[]>(() =>
  (() => {
    const byId = new Map<number, ProductGroup>();

    for (const group of extractAddonGroupsFromMenu(groups.value)) {
      byId.set(group.id, group);
    }
    for (const group of standaloneAddonGroups.value) {
      if (!byId.has(group.id)) {
        byId.set(group.id, group);
      }
    }

    return Array.from(byId.values()).sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  })(),
);

const menuGroups = computed<ProductGroup[]>(() => [
  ...groups.value,
  ...addonGroupOptions.value,
]);

function minPrice(prices: ProductPrice[]): number {
  return prices.reduce(
    (acc, row) => Math.min(acc, row.priceRub),
    prices[0]?.priceRub ?? 0,
  );
}

function formatProductPrice(product: Product): string {
  if (product.type !== ProductType.Drink) {
    return `${minPrice(product.prices)} руб.`;
  }

  const bySize = product.prices
    .filter((price) => price.sizeCode)
    .sort((a, b) => {
      const order = { S: 0, M: 1, L: 2 } as const;
      const aRank = order[(a.sizeCode ?? "L") as keyof typeof order] ?? 99;
      const bRank = order[(b.sizeCode ?? "L") as keyof typeof order] ?? 99;
      return aRank - bRank;
    })
    .map((price) => `${price.sizeCode} ${price.priceRub} руб.`);

  if (!bySize.length) {
    return `${minPrice(product.prices)} руб.`;
  }

  return bySize.join(" | ");
}

async function loadGroups(): Promise<void> {
  const [menu, addonGroups] = await Promise.all([
    menuService.fetchMenu(),
    menuService.fetchAddonGroups(),
  ]);
  groups.value = menu;

  const mappedAddonGroups = addonGroups.map((group) =>
    mapAddonGroupToProductGroup({
      ...group,
      addons: group.addons ?? [],
    }),
  );

  const linkedAddonIds = new Set(
    extractAddonGroupsFromMenu(groups.value).map((group) => group.id),
  );
  standaloneAddonGroups.value = mappedAddonGroups.filter(
    (group) => !linkedAddonIds.has(group.id),
  );
}

async function onCreateGroup(payload: AddGroupSubmitPayload): Promise<void> {
  isCreateGroupLoading.value = true;
  try {
    if (payload.mode === "addon") {
      const createdGroup = await menuService.createAddonGroup(payload.payload);
      standaloneAddonGroups.value.unshift(
        mapAddonGroupToProductGroup({
          ...createdGroup,
          addons: createdGroup.addons ?? [],
        }),
      );
    } else {
      const createdGroup = await menuService.createProductGroup(
        payload.payload,
      );
      if (payload.addonGroupIds.length) {
        await Promise.all(
          payload.addonGroupIds.map((addonGroupId) =>
            menuService.linkAddonGroup({
              productGroupId: createdGroup.id,
              addonGroupId,
            }),
          ),
        );
      }
    }
    isAddGroupDialogOpen.value = false;
    await loadGroups();
  } finally {
    isCreateGroupLoading.value = false;
  }
}

async function onCreateProduct(
  payload: AddProductSubmitPayload,
): Promise<void> {
  isCreateProductLoading.value = true;
  try {
    const targetGroup = menuGroups.value.find(
      (group) => group.id === payload.product.groupId,
    );
    if (targetGroup?.isAddonsGroup) {
      const basePrice = payload.prices[0]?.priceRub ?? 0;
      const createdAddon = await menuService.createAddon({
        addonGroupId: targetGroup.id,
        name: payload.product.name,
        priceRub: basePrice,
        isActive: payload.product.isActive,
      });
      const standaloneGroup = standaloneAddonGroups.value.find(
        (group) => group.id === targetGroup.id,
      );
      if (standaloneGroup) {
        standaloneGroup.products.unshift({
          id: createdAddon.id,
          group: { id: standaloneGroup.id, name: standaloneGroup.name },
          name: createdAddon.name,
          description: null,
          type: ProductType.Food,
          isActive: createdAddon.isActive,
          isAvailable: true,
          sortOrder: 0,
          prices: [
            {
              id: createdAddon.id,
              priceRub: createdAddon.priceRub,
              isActive: createdAddon.isActive,
            },
          ],
        });
      }
      isAddProductDialogOpen.value = false;
      await loadGroups();
      return;
    }

    const createdProduct = await menuService.createProduct(payload.product);
    const pricePayloads: CreateProductPriceDto[] = payload.prices.map(
      (price) => ({
        productId: createdProduct.id,
        sizeCode: price.sizeCode,
        priceRub: price.priceRub,
        isActive: true,
      }),
    );

    await Promise.all(
      pricePayloads.map((pricePayload) =>
        menuService.createProductPrice(pricePayload),
      ),
    );

    isAddProductDialogOpen.value = false;
    await loadGroups();
  } finally {
    isCreateProductLoading.value = false;
  }
}

function openEditGroupDialog(group: ProductGroup): void {
  selectedGroup.value = group;
  isEditGroupDialogOpen.value = true;
}

function openEditProductDialog(product: Product): void {
  selectedProduct.value = product;
  isEditProductDialogOpen.value = true;
}

function openEditAddonDialog(group: ProductGroup, product: Product): void {
  selectedAddon.value = {
    id: product.id,
    addonGroupId: group.id,
    name: product.name,
    priceRub: minPrice(product.prices),
    isActive: product.isActive,
  };
  isEditAddonDialogOpen.value = true;
}

function openDeleteGroupDialog(group: ProductGroup): void {
  deleteTarget.value = {
    kind: "group",
    id: group.id,
    isAddonsGroup: group.isAddonsGroup,
  };
  deleteEntityLabel.value = "группу";
  deleteEntityName.value = group.name;
  isDeleteDialogOpen.value = true;
}

function openDeleteProductDialog(product: Product): void {
  deleteTarget.value = { kind: "product", id: product.id };
  deleteEntityLabel.value = "товар";
  deleteEntityName.value = product.name;
  isDeleteDialogOpen.value = true;
}

function openDeleteAddonDialog(product: Product): void {
  deleteTarget.value = { kind: "addon", id: product.id };
  deleteEntityLabel.value = "доп";
  deleteEntityName.value = product.name;
  isDeleteDialogOpen.value = true;
}

function onEditPosition(group: ProductGroup, product: Product): void {
  if (group.isAddonsGroup) {
    openEditAddonDialog(group, product);
    return;
  }
  openEditProductDialog(product);
}

function onDeletePosition(group: ProductGroup, product: Product): void {
  if (group.isAddonsGroup) {
    openDeleteAddonDialog(product);
    return;
  }
  openDeleteProductDialog(product);
}

function closeDeleteDialog(): void {
  isDeleteDialogOpen.value = false;
  deleteTarget.value = null;
  deleteEntityLabel.value = "";
  deleteEntityName.value = "";
}

async function onEditGroup({
  groupId,
  payload,
  addonGroupIds,
}: EditGroupSubmitPayload): Promise<void> {
  isUpdateGroupLoading.value = true;
  try {
    if (selectedGroup.value?.isAddonsGroup) {
      const updatedGroup = await menuService.updateAddonGroup(groupId, payload);
      const standaloneGroup = standaloneAddonGroups.value.find(
        (group) => group.id === groupId,
      );
      if (standaloneGroup) {
        standaloneGroup.name = updatedGroup.name;
        standaloneGroup.sortOrder = updatedGroup.sortOrder;
        standaloneGroup.isActive = updatedGroup.isActive;
      }
    } else {
      await menuService.updateProductGroup(groupId, payload);
    }

    if (!payload.isAddonsGroup && addonGroupIds.length) {
      await Promise.all(
        addonGroupIds.map((addonGroupId) =>
          menuService.linkAddonGroup({
            productGroupId: groupId,
            addonGroupId,
          }),
        ),
      );
    }
    isEditGroupDialogOpen.value = false;
    await loadGroups();
  } finally {
    isUpdateGroupLoading.value = false;
  }
}

async function onEditProduct({
  productId,
  payload,
  prices,
}: EditProductSubmitPayload): Promise<void> {
  isUpdateProductLoading.value = true;
  try {
    await menuService.updateProduct(productId, payload);
    await menuService.replaceProductPrices(
      productId,
      prices.map((price) => ({
        sizeCode: price.sizeCode,
        priceRub: price.priceRub,
        isActive: true,
      })),
    );
    isEditProductDialogOpen.value = false;
    await loadGroups();
  } finally {
    isUpdateProductLoading.value = false;
  }
}

async function onEditAddon({
  addonId,
  payload,
}: EditAddonSubmitPayload): Promise<void> {
  isUpdateAddonLoading.value = true;
  try {
    const updatedAddon = await menuService.updateAddon(addonId, payload);
    const standaloneGroup = standaloneAddonGroups.value.find(
      (group) =>
        group.id ===
        (payload.addonGroupId ?? selectedAddon.value?.addonGroupId),
    );
    if (standaloneGroup) {
      const row = standaloneGroup.products.find(
        (product) => product.id === addonId,
      );
      if (row) {
        row.name = updatedAddon.name;
        row.isActive = updatedAddon.isActive;
        if (row.prices[0]) {
          row.prices[0].priceRub = updatedAddon.priceRub;
          row.prices[0].isActive = updatedAddon.isActive;
        }
      }
    }
    isEditAddonDialogOpen.value = false;
    await loadGroups();
  } finally {
    isUpdateAddonLoading.value = false;
  }
}

async function onDeleteEntity(): Promise<void> {
  if (!deleteTarget.value) {
    return;
  }

  isDeleteLoading.value = true;
  try {
    if (deleteTarget.value.kind === "group") {
      if (deleteTarget.value.isAddonsGroup) {
        await menuService.deleteAddonGroup(deleteTarget.value.id);
        standaloneAddonGroups.value = standaloneAddonGroups.value.filter(
          (group) => group.id !== deleteTarget.value?.id,
        );
      } else {
        await menuService.deleteProductGroup(deleteTarget.value.id);
      }
    } else if (deleteTarget.value.kind === "product") {
      await menuService.deleteProduct(deleteTarget.value.id);
    } else {
      const targetAddonId = deleteTarget.value.id;
      const targetGroupId = selectedAddon.value?.addonGroupId;
      await menuService.deleteAddon(deleteTarget.value.id);
      if (targetGroupId) {
        const standaloneGroup = standaloneAddonGroups.value.find(
          (group) => group.id === targetGroupId,
        );
        if (standaloneGroup) {
          standaloneGroup.products = standaloneGroup.products.filter(
            (product) => product.id !== targetAddonId,
          );
        }
      }
    }
    closeDeleteDialog();
    await loadGroups();
  } finally {
    isDeleteLoading.value = false;
  }
}

onMounted(async () => {
  await loadGroups();
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

.admin-menu__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-menu__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  flex-direction: column;
  padding-bottom: 10px;
}

.admin-menu__group {
  margin: 5px;
  padding: 12px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.admin-menu__group:hover {
  border-color: rgba(var(--v-theme-primary), 0.45);
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.admin-menu__group-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-menu__group-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.admin-menu__products {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-menu__product {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}

.admin-menu__product:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.admin-menu__product-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 740px) {
  .admin-menu__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-menu__actions {
    width: 100%;
  }

  .admin-menu__actions :deep(.v-btn) {
    flex: 1 1 50%;
  }
}
</style>
