<template>
  <v-dialog :model-value="modelValue"
            max-width="520"
            @update:model-value="onModelUpdate">
    <v-card>
      <v-card-title>Добавить группу</v-card-title>
      <v-card-text>
        <v-text-field v-model.trim="name"
                      label="Название группы"
                      variant="outlined"
                      density="comfortable"
                      :error-messages="nameError" />

        <v-text-field v-model.number="sortOrder"
                      class="mt-2"
                      type="number"
                      label="Порядок сортировки"
                      variant="outlined"
                      density="comfortable"
                      min="0" />

        <v-switch v-model="isActive"
                  label="Активна"
                  color="primary"
                  hide-details />

        <v-switch v-model="isAddonsGroup"
                  class="mt-1"
                  label="Это группа допов"
                  color="primary"
                  hide-details />

        <v-select v-model="selectedAddonGroupIds"
                  class="mt-3"
                  label="Группы допов"
                  variant="outlined"
                  density="comfortable"
                  multiple
                  chips
                  clearable
                  item-title="name"
                  item-value="id"
                  :items="addonGroups"
                  :disabled="isAddonsGroup" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text"
               :disabled="isSubmitting"
               @click="$emit('cancel')">
          Отмена
        </v-btn>
        <v-btn variant="flat"
               color="primary"
               :loading="isSubmitting"
               @click="onSubmit">
          Добавить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import type { ProductGroup } from "@/services/menu/types";
import type { AddGroupSubmitPayload } from "./types";

const props = defineProps<{
  modelValue: boolean;
  isSubmitting: boolean;
  addonGroups: ProductGroup[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [payload: AddGroupSubmitPayload];
  cancel: [];
}>();

const name = ref("");
const sortOrder = ref<number | null>(0);
const isActive = ref(true);
const isAddonsGroup = ref(false);
const selectedAddonGroupIds = ref<number[]>([]);
const nameError = ref("");

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  },
);

watch(isAddonsGroup, (next) => {
  if (next) {
    selectedAddonGroupIds.value = [];
  }
});

function resetForm(): void {
  name.value = "";
  sortOrder.value = 0;
  isActive.value = true;
  isAddonsGroup.value = false;
  selectedAddonGroupIds.value = [];
  nameError.value = "";
}

function onModelUpdate(value: boolean): void {
  emit("update:modelValue", value);
}

function onSubmit(): void {
  if (!name.value) {
    nameError.value = "Укажи название группы";
    return;
  }

  nameError.value = "";

  if (isAddonsGroup.value) {
    emit("submit", {
      mode: "addon",
      payload: {
        name: name.value,
        sortOrder: sortOrder.value ?? 0,
        isActive: isActive.value,
        isAddonsGroup: true,
      },
    });
    return;
  }

  emit("submit", {
    mode: "product",
    payload: {
      name: name.value,
      sortOrder: sortOrder.value ?? 0,
      isActive: isActive.value,
      isAddonsGroup: false,
    },
    addonGroupIds: selectedAddonGroupIds.value,
  });
}
</script>
