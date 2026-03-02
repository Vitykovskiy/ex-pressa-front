<template>
  <v-dialog :model-value="modelValue"
            max-width="460"
            @update:model-value="onModelUpdate">
    <v-card>
      <v-card-title>Редактировать доп</v-card-title>
      <v-card-text>
        <v-text-field v-model.trim="name"
                      label="Название"
                      variant="outlined"
                      density="comfortable"
                      :error-messages="nameError" />

        <v-text-field v-model.number="priceRub"
                      class="mt-2"
                      type="number"
                      min="0"
                      label="Цена, ₽"
                      variant="outlined"
                      density="comfortable" />

        <v-switch v-model="isActive"
                  label="Активен"
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
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import type { EditAddonSubmitPayload } from "./types";

type EditableAddon = {
  id: number;
  addonGroupId: number;
  name: string;
  priceRub: number;
  isActive: boolean;
};

const props = defineProps<{
  modelValue: boolean;
  isSubmitting: boolean;
  addon: EditableAddon | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [payload: EditAddonSubmitPayload];
  cancel: [];
}>();

const name = ref("");
const priceRub = ref<number | null>(0);
const isActive = ref(true);
const nameError = ref("");

watch(
  () => [props.modelValue, props.addon] as const,
  ([isOpen, addon]) => {
    if (!isOpen || !addon) {
      return;
    }
    name.value = addon.name;
    priceRub.value = addon.priceRub;
    isActive.value = addon.isActive;
    nameError.value = "";
  },
);

function onModelUpdate(value: boolean): void {
  emit("update:modelValue", value);
}

function onSubmit(): void {
  if (!props.addon) {
    return;
  }

  if (!name.value) {
    nameError.value = "Укажи название";
    return;
  }

  nameError.value = "";
  emit("submit", {
    addonId: props.addon.id,
    payload: {
      addonGroupId: props.addon.addonGroupId,
      name: name.value,
      priceRub: priceRub.value ?? 0,
      isActive: isActive.value,
    },
  });
}
</script>
