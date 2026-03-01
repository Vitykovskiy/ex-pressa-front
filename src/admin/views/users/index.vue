<template>
  <div class="admin-users">
    <div class="admin-users__toolbar">
      <h2>Пользователи</h2>
      <v-text-field v-model="search"
                    class="admin-users__search"
                    variant="outlined"
                    density="compact"
                    hide-details
                    placeholder="Поиск по имени"
                    prepend-inner-icon="mdi-magnify" />
    </div>

    <div class="admin-users__list">
      <v-card v-for="user in filteredUsers"
              :key="user.id"
              class="admin-users__card"
              variant="outlined">
        <div class="admin-users__row">
          <div>
            <div class="admin-users__name">{{ user.fullName }}</div>
            <div class="admin-users__meta">@{{ user.tgUsername }}</div>
          </div>
          <v-chip :color="user.isActive ? 'success' : 'error'"
                  size="small"
                  variant="tonal">
            {{ user.isActive ? "Активен" : "Отключен" }}
          </v-chip>
        </div>

        <div class="admin-users__roles">
          <v-chip v-for="role in user.roles"
                  :key="role"
                  size="small"
                  color="primary"
                  variant="outlined">
            {{ role }}
          </v-chip>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

defineOptions({
  name: "AdminUsersView",
});

type AdminUser = {
  id: number;
  tgUsername: string;
  fullName: string;
  isActive: boolean;
  roles: Array<"Admin" | "Barista" | "User">;
};

const users = ref<AdminUser[]>([
  {
    id: 1,
    tgUsername: "owner",
    fullName: "Владелец Кофейни",
    isActive: true,
    roles: ["Admin"],
  },
  {
    id: 2,
    tgUsername: "barista_1",
    fullName: "Анна Бариста",
    isActive: true,
    roles: ["Barista"],
  },
  {
    id: 3,
    tgUsername: "test_user",
    fullName: "Иван Тестовый",
    isActive: false,
    roles: ["User"],
  },
]);

const search = ref("");

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) {
    return users.value;
  }

  return users.value.filter((user) => {
    return (
      user.fullName.toLowerCase().includes(q) ||
      user.tgUsername.toLowerCase().includes(q) ||
      user.roles.join(" ").toLowerCase().includes(q)
    );
  });
});
</script>

<style lang="scss" scoped>
.admin-users {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-users__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.admin-users__toolbar h2 {
  margin: 0;
}

.admin-users__search {
  max-width: 320px;
  width: 100%;
}

.admin-users__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 10px;
}

.admin-users__card {
  padding: 12px;
}

.admin-users__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.admin-users__name {
  font-size: 16px;
  font-weight: 600;
}

.admin-users__meta {
  margin-top: 3px;
  font-size: 13px;
  opacity: 0.7;
}

.admin-users__roles {
  margin-top: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
