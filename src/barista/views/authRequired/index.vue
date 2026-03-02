<template>
  <AccessState
    type="warning"
    message="Для входа в панель баристы нужна авторизация через Telegram."
  />
</template>

<script lang="ts" setup>
import AccessState from "@/components/AccessState.vue";

defineOptions({
  name: "BaristaAuthRequiredView",
});
</script>
