<template>
  <div class="access-state">
    <v-alert :type="type"
             variant="tonal"
             class="access-state__card">
      {{ message }}
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  type: "warning" | "error";
  message: string;
}>();
</script>

<style lang="scss" scoped>
.access-state {
  height: 100%;
  display: flex;
  align-items: center;
}

.access-state__card {
  width: 100%;
}
</style>
