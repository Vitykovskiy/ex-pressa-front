<template>
  <v-dialog
    :model-value="modelValue"
    max-width="460"
    @update:model-value="onModelUpdate"
  >
    <v-card>
      <v-card-title>Отклонить заказ</v-card-title>
      <v-card-text>
        <v-textarea
          :model-value="reason"
          data-testid="barista-reject-reason"
          label="Причина отклонения"
          variant="outlined"
          rows="4"
          auto-grow
          :error-messages="reasonError"
          @update:model-value="onReasonUpdate"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="$emit('cancel')"
        >
          Отмена
        </v-btn>
        <v-btn
          variant="flat"
          color="error"
          data-testid="barista-reject-confirm"
          :loading="isSubmitting"
          @click="$emit('confirm')"
        >
          Подтвердить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean;
  reason: string;
  reasonError: string;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:reason": [value: string];
  cancel: [];
  confirm: [];
}>();

function onModelUpdate(value: boolean): void {
  emit("update:modelValue", value);
}

function onReasonUpdate(value: string): void {
  emit("update:reason", value);
}

void props;
</script>
