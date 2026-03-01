<template>
  <v-app class="barista-shell">
    <v-main class="barista-main">
      <div class="barista-frame">
        <header class="barista-header">
          <h1>Панель баристы</h1>
        </header>

        <section class="barista-content">
          <router-view v-slot="{ Component }">
            <component :is="Component" class="barista-content__view" />
          </router-view>
        </section>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
defineOptions({
  name: "BaristaAppShell",
});
</script>

<style lang="scss" scoped>
.barista-main {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.barista-frame {
  width: 100%;
  max-width: 700px;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 10px;
}

.barista-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  min-height: 56px;
}

.barista-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.barista-content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.barista-content__view {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

:deep(.v-main) {
  padding: 0;
}
</style>
