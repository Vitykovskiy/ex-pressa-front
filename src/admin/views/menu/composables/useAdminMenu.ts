import { computed, ref } from "vue";
import menuService from "@/services/menu";
import { ProductType } from "@/services/menu/types";
import type {
  Addon,
  AddonGroup,
  CreateProductPriceDto,
  Product,
  ProductGroup,
  ProductPrice,
} from "@/services/menu/types";
import type {
  AddGroupSubmitPayload,
  AddProductSubmitPayload,
  EditAddonSubmitPayload,
  EditGroupSubmitPayload,
  EditProductSubmitPayload,
} from "../components/types";

type SelectedAddon = {
  id: number;
  addonGroupId: number;
  name: string;
  priceRub: number;
  isActive: boolean;
};

type DeleteTarget = {
  kind: "group" | "product" | "addon";
  id: number;
  isAddonsGroup?: boolean;
};

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
      prices: [{ id: addon.id, priceRub: addon.priceRub, isActive: addon.isActive }],
    })),
    addonLinks: [],
  };
}

function extractAddonGroupsFromMenu(menu: ProductGroup[]): ProductGroup[] {
  const byId = new Map<number, ProductGroup>();

  for (const group of menu) {
    for (const link of group.addonLinks) {
      const addonGroup = link.addonGroup;
      if (!addonGroup) continue;
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

function minPrice(prices: ProductPrice[]): number {
  return prices.reduce((acc, row) => Math.min(acc, row.priceRub), prices[0]?.priceRub ?? 0);
}

export function useAdminMenu() {
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
  const selectedAddon = ref<SelectedAddon | null>(null);
  const isDeleteDialogOpen = ref(false);
  const isDeleteLoading = ref(false);
  const deleteEntityLabel = ref("");
  const deleteEntityName = ref("");
  const deleteTarget = ref<DeleteTarget | null>(null);

  const addonGroupOptions = computed<ProductGroup[]>(() => {
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
  });

  const menuGroups = computed<ProductGroup[]>(() => [...groups.value, ...addonGroupOptions.value]);

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
      mapAddonGroupToProductGroup({ ...group, addons: group.addons ?? [] }),
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
        const createdGroup = await menuService.createProductGroup(payload.payload);
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

  async function onCreateProduct(payload: AddProductSubmitPayload): Promise<void> {
    isCreateProductLoading.value = true;
    try {
      if (payload.isAddonsGroup) {
        const addonGroupId = payload.product.groupId;
        const basePrice = payload.prices[0]?.priceRub ?? 0;
        const createdAddon = await menuService.createAddon({
          addonGroupId,
          name: payload.product.name,
          priceRub: basePrice,
          isActive: payload.product.isActive,
        });
        const standaloneGroup = standaloneAddonGroups.value.find(
          (group) => group.id === addonGroupId,
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
            prices: [{ id: createdAddon.id, priceRub: createdAddon.priceRub, isActive: createdAddon.isActive }],
          });
        }
        isAddProductDialogOpen.value = false;
        await loadGroups();
        return;
      }

      const createdProduct = await menuService.createProduct(payload.product);
      const pricePayloads: CreateProductPriceDto[] = payload.prices.map((price) => ({
        productId: createdProduct.id,
        sizeCode: price.sizeCode,
        priceRub: price.priceRub,
        isActive: true,
      }));

      await Promise.all(
        pricePayloads.map((pricePayload) => menuService.createProductPrice(pricePayload)),
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

  async function onEditAddon({ addonId, payload }: EditAddonSubmitPayload): Promise<void> {
    isUpdateAddonLoading.value = true;
    try {
      const updatedAddon = await menuService.updateAddon(addonId, payload);
      const standaloneGroup = standaloneAddonGroups.value.find(
        (group) => group.id === (payload.addonGroupId ?? selectedAddon.value?.addonGroupId),
      );
      if (standaloneGroup) {
        const row = standaloneGroup.products.find((product) => product.id === addonId);
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
    if (!deleteTarget.value) return;

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

  return {
    addonGroupOptions,
    closeDeleteDialog,
    deleteEntityLabel,
    deleteEntityName,
    formatProductPrice,
    groups,
    isAddGroupDialogOpen,
    isAddProductDialogOpen,
    isCreateGroupLoading,
    isCreateProductLoading,
    isDeleteDialogOpen,
    isDeleteLoading,
    isEditAddonDialogOpen,
    isEditGroupDialogOpen,
    isEditProductDialogOpen,
    isUpdateAddonLoading,
    isUpdateGroupLoading,
    isUpdateProductLoading,
    loadGroups,
    menuGroups,
    onCreateGroup,
    onCreateProduct,
    onDeleteEntity,
    onDeletePosition,
    onEditAddon,
    onEditGroup,
    onEditPosition,
    onEditProduct,
    openDeleteGroupDialog,
    openEditGroupDialog,
    selectedAddon,
    selectedGroup,
    selectedProduct,
  };
}
