<template>
  <div class="auth-required">
    <v-alert type="warning"
             variant="tonal"
             class="auth-required__card">
      Для входа в панель баристы нужна авторизация через Telegram.
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: "BaristaAuthRequiredView",
});
</script>

<style lang="scss" scoped>
.auth-required {
  height: 100%;
  display: flex;
  align-items: center;
}

.auth-required__card {
  width: 100%;
}
</style>
