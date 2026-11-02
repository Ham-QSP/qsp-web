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
definePage({meta: {permission: 'administrate'}})

interface SettingItem {
  to: string
  title: string
  icon: string
}

const items: SettingItem[] = [
  {to: '/settings/admin/users', title: 'Users', icon: 'mdi-account-group'},
]

const route = useRoute()

function isActive(item: SettingItem) {
  return route.path === item.to || route.path.startsWith(item.to + '/')
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="4" md="3">
        <v-list nav>
          <v-list-item
            v-for="item in items"
            :key="item.to"
            :active="isActive(item)"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
          />
        </v-list>
      </v-col>

      <v-col cols="12" sm="8" md="9">
        <v-card>
          <router-view />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
