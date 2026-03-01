<template>
  <div class="access-denied">
    <v-alert type="error"
             variant="tonal"
             class="access-denied__card">
      У вас нет прав для доступа к панели баристы.
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: "BaristaAccessDeniedView",
});
</script>

<style lang="scss" scoped>
.access-denied {
  height: 100%;
  display: flex;
  align-items: center;
}

.access-denied__card {
  width: 100%;
}
</style>
