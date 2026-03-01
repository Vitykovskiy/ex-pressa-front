<template>
  <AccessState type="error"
               message="У вас нет прав для доступа к панели баристы." />
</template>

<script lang="ts" setup>
import AccessState from "@/components/AccessState.vue";

defineOptions({
  name: "BaristaAccessDeniedView",
});
</script>
