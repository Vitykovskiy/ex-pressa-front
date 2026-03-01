<template>
  <AccessState type="warning"
               message="Для входа в панель администратора нужна авторизация через Telegram." />
</template>

<script lang="ts" setup>
import AccessState from "@/components/AccessState.vue";

defineOptions({
  name: "AdminAuthRequiredView",
});
</script>
