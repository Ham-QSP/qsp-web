<!--
    Copyright (C) 2026 Florian MAZEN

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script setup lang="ts">
import {useUsersStore} from '@/stores/users'
import {useAuthentStore} from '@/stores/authent'
import type {User} from '@/components/settings/admin/User'

const usersStore = useUsersStore()
const authentStore = useAuthentStore()

const userList = ref<User[]>([])
const loading = ref(false)

async function loadUsers() {
  if (!authentStore.isAuthenticated()) return

  loading.value = true
  try {
    userList.value = await usersStore.getUsers()
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <v-card-title class="d-flex align-center">
    <span>Users</span>
    <v-spacer />
    <v-btn
      v-if="authentStore.isAuthenticated()"
      prepend-icon="mdi-plus"
      to="/settings/admin/users/new"
    >
      New user
    </v-btn>
  </v-card-title>
  <v-card-text>
    <p
      v-if="!authentStore.isAuthenticated()"
      class="text-body-2"
    >
      Log in to manage the users.
    </p>
    <template v-else>
      <v-list lines="two">
        <v-list-item
          v-for="user in userList"
          :key="user.id"
          :title="user.username"
          :subtitle="user.email"
          :to="`/settings/admin/users/${user.id}`"
        >
          <template #prepend>
            <v-icon
              :icon="user.enabled ? 'mdi-circle' : 'mdi-circle-outline'"
              :color="user.enabled ? 'success' : undefined"
              :title="user.enabled ? 'Enabled' : 'Disabled'"
              size="small"
            />
          </template>
        </v-list-item>
        <v-list-item
          v-if="!loading && userList.length === 0"
          title="No user"
        />
      </v-list>

      <v-btn
        class="mt-2"
        variant="text"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadUsers"
      >
        Refresh
      </v-btn>
    </template>
  </v-card-text>
</template>
