<template>
  <v-app>
    <v-main max-width="400">
      <div class="header">
        <div class="header__left">
          <v-btn v-if="activeGroup" variant="plain" icon="mdi-arrow-left" @click="goBack" />
        </div>
        <div class="header__right">
          <v-btn variant="plain" color="primary" icon="mdi-cart-variant" />
        </div>
      </div>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import router from './router';

const activeGroup = computed(() => true)

function goBack(): void {
  router.back()
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;

}

:deep(.v-main) {
  padding: 0 10px;
}
</style>