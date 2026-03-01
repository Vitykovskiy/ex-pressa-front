<template>
  <v-dialog :model-value="modelValue"
            max-width="460"
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
import type { CreateProductGroupDto } from "@/services/menu/types";

const props = defineProps<{
  modelValue: boolean;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [payload: CreateProductGroupDto];
  cancel: [];
}>();

const name = ref("");
const sortOrder = ref<number | null>(0);
const isActive = ref(true);
const nameError = ref("");

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  },
);

function resetForm(): void {
  name.value = "";
  sortOrder.value = 0;
  isActive.value = true;
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
  emit("submit", {
    name: name.value,
    sortOrder: sortOrder.value ?? 0,
    isActive: isActive.value,
  });
}
</script>
