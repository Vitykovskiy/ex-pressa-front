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
import { onMounted } from "vue";
import AddGroupDialog from "./components/AddGroupDialog.vue";
import AddProductDialog from "./components/AddProductDialog.vue";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog.vue";
import EditAddonDialog from "./components/EditAddonDialog.vue";
import EditGroupDialog from "./components/EditGroupDialog.vue";
import EditProductDialog from "./components/EditProductDialog.vue";
import { useAdminMenu } from "./composables/useAdminMenu";

defineOptions({
  name: "AdminMenuView",
});

const {
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
} = useAdminMenu();

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
