<template>
  <v-app class="admin-shell">
    <v-main class="admin-main">
      <div class="admin-frame">
        <header class="admin-header">
          <h1>Панель баристы</h1>
        </header>

        <section class="admin-content">
          <router-view />
        </section>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
defineOptions({
  name: "AdminAppShell",
});
</script>

<style lang="scss" scoped>
.admin-main {
  height: 100dvh;
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
  padding: 0 10px;
}

.admin-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  min-height: 56px;
}

.admin-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.admin-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
</style>
