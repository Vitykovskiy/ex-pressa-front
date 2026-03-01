<template>
  <div class="admin-users">
    <div class="admin-users__toolbar">
      <h2>Пользователи</h2>
      <div class="admin-users__toolbar-actions">
        <v-select
          v-model="roleFilters"
          class="admin-users__role-filter"
          :items="roleFilterItems"
          label="Типы пользователей"
          variant="outlined"
          density="compact"
          hide-details
          multiple
          chips
          clearable
        />

        <v-text-field
          v-model="search"
          class="admin-users__search"
          variant="outlined"
          density="compact"
          hide-details
          placeholder="Поиск по имени"
          prepend-inner-icon="mdi-magnify"
        />
      </div>
    </div>

    <div class="admin-users__list">
      <v-card
        v-for="user in filteredUsers"
        :key="user.id"
        class="admin-users__card"
        variant="outlined"
      >
        <div class="admin-users__row">
          <div>
            <div class="admin-users__name">{{ user.fullName }}</div>
            <div class="admin-users__meta">@{{ user.tgUsername }}</div>
          </div>
          <v-chip
            :color="user.isActive ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ user.isActive ? "Активен" : "Отключен" }}
          </v-chip>
        </div>

        <div class="admin-users__roles">
          <v-chip
            v-for="role in user.roles"
            :key="role"
            size="small"
            color="primary"
            variant="outlined"
          >
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

type UserRole = "Admin" | "Barista" | "User";

type AdminUser = {
  id: number;
  tgUsername: string;
  fullName: string;
  isActive: boolean;
  roles: UserRole[];
};

const users = ref<AdminUser[]>([
  {
    id: 1,
    tgUsername: "owner",
    fullName: "Владелец кофейни",
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
const roleFilters = ref<UserRole[]>([]);
const roleFilterItems = [
  { title: "Администратор", value: "Admin" },
  { title: "Бариста", value: "Barista" },
  { title: "Покупатель", value: "User" },
] as const;

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase();

  return users.value.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(q) ||
      user.tgUsername.toLowerCase().includes(q) ||
      user.roles.join(" ").toLowerCase().includes(q);

    const matchesRole =
      !roleFilters.value.length ||
      roleFilters.value.some((role) => user.roles.includes(role));

    return matchesSearch && matchesRole;
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
  align-items: flex-start;
  gap: 12px;
}

.admin-users__toolbar h2 {
  margin: 0;
}

.admin-users__toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.admin-users__role-filter {
  max-width: 280px;
  width: 100%;
}

.admin-users__search {
  max-width: 300px;
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

@media (max-width: 740px) {
  .admin-users__toolbar {
    flex-direction: column;
  }

  .admin-users__toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-users__role-filter,
  .admin-users__search {
    max-width: 100%;
  }
}
</style>
