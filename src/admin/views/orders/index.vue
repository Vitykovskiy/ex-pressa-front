<template>
  <div class="admin-orders">
    <div class="admin-orders__toolbar">
      <h2>Заказы</h2>
      <v-btn
        variant="flat"
        color="primary"
        prepend-icon="mdi-refresh"
      >
        Обновить
      </v-btn>
    </div>

    <v-alert
      type="info"
      variant="tonal"
      class="admin-orders__stub"
    >
      MVP заглушка: здесь будет рабочий интерфейс баристы для обработки заказов.
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: "AdminOrdersView",
});
</script>

<style lang="scss" scoped>
.admin-orders {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-orders__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-orders__toolbar h2 {
  margin: 0;
}
</style>
