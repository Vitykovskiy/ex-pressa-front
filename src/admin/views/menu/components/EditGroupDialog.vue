<template>
  <v-dialog :model-value="modelValue"
            max-width="520"
            @update:model-value="onModelUpdate">
    <v-card>
      <v-card-title>Редактировать группу</v-card-title>
      <v-card-text>
        <v-text-field v-model.trim="name"
                      label="Название группы"
                      variant="outlined"
                      density="comfortable"
                      :error-messages="nameError" />

        <v-text-field v-model.number="sortOrder"
                      class="mt-2"
                      type="number"
                      min="0"
                      label="Порядок сортировки"
                      variant="outlined"
                      density="comfortable" />

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
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import type { ProductGroup } from "@/services/menu/types";
import type { EditGroupSubmitPayload } from "./types";

const props = defineProps<{
  modelValue: boolean;
  isSubmitting: boolean;
  group: ProductGroup | null;
  addonGroups: ProductGroup[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [payload: EditGroupSubmitPayload];
  cancel: [];
}>();

const name = ref("");
const sortOrder = ref<number | null>(0);
const isActive = ref(true);
const isAddonsGroup = ref(false);
const selectedAddonGroupIds = ref<number[]>([]);
const nameError = ref("");

watch(
  () => [props.modelValue, props.group] as const,
  ([isOpen, group]) => {
    if (!isOpen || !group) {
      return;
    }
    name.value = group.name;
    sortOrder.value = group.sortOrder ?? 0;
    isActive.value = group.isActive;
    isAddonsGroup.value = group.isAddonsGroup;
    selectedAddonGroupIds.value = group.addonLinks.map((link) => link.addonGroupId);
    nameError.value = "";
  },
);

watch(isAddonsGroup, (next) => {
  if (next) {
    selectedAddonGroupIds.value = [];
  }
});

function onModelUpdate(value: boolean): void {
  emit("update:modelValue", value);
}

function onSubmit(): void {
  if (!props.group) {
    return;
  }

  if (!name.value) {
    nameError.value = "Укажи название группы";
    return;
  }

  nameError.value = "";
  emit("submit", {
    groupId: props.group.id,
    payload: {
      name: name.value,
      sortOrder: sortOrder.value ?? 0,
      isActive: isActive.value,
      isAddonsGroup: isAddonsGroup.value,
    },
    addonGroupIds: selectedAddonGroupIds.value,
  });
}
</script>
