<template>
  <v-app class="admin-shell">
    <v-main class="admin-main">
      <div class="admin-frame">
        <header class="admin-header">
          <h1>Панель администратора</h1>
          <v-tabs class="admin-tabs"
                  density="comfortable"
                  color="primary">
            <v-tab :to="{ name: AdminRouteNames.Menu }">
              Меню
            </v-tab>
            <v-tab :to="{ name: AdminRouteNames.Users }">
              Пользователи
            </v-tab>
          </v-tabs>
        </header>

        <section class="admin-content">
          <router-view v-slot="{ Component }">
            <component :is="Component" class="admin-content__view" />
          </router-view>
        </section>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { AdminRouteNames } from "@/admin/routes";

defineOptions({
  name: "AdminAppShell",
});
</script>

<style lang="scss" scoped>
.admin-main {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.admin-frame {
  width: 100%;
  max-width: 700px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 10px;
}

.admin-header {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 92px;
  padding-top: 10px;
}

.admin-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.admin-tabs {
  margin-top: 6px;
}

.admin-content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.admin-content__view {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

:deep(.v-main) {
  padding: 0;
}
</style>
