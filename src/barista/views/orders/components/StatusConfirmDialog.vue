<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    @update:model-value="onModelUpdate"
  >
    <v-card>
      <v-card-title>Подтверждение</v-card-title>
      <v-card-text>
        {{ text }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="isSubmitting"
          @click="$emit('cancel')"
        >
          Отмена
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
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
  text: string;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  cancel: [];
  confirm: [];
}>();

function onModelUpdate(value: boolean): void {
  emit("update:modelValue", value);
}

void props;
</script>
