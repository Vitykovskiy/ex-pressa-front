<template>
  <v-dialog :model-value="modelValue"
            max-width="420"
            @update:model-value="onModelUpdate">
    <v-card>
      <v-card-title>Подтверждение удаления</v-card-title>
      <v-card-text>
        Удалить {{ entityLabel }} «{{ entityName }}»?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text"
               :disabled="isSubmitting"
               @click="$emit('cancel')">
          Отмена
        </v-btn>
        <v-btn variant="flat"
               color="error"
               :loading="isSubmitting"
               @click="$emit('confirm')">
          Удалить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: boolean;
  isSubmitting: boolean;
  entityLabel: string;
  entityName: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  cancel: [];
  confirm: [];
}>();

function onModelUpdate(value: boolean): void {
  emit("update:modelValue", value);
}
</script>
