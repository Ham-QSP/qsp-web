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

<template>
  <v-footer
    height="40"
    app
  >
    <a
      v-for="item in items"
      :key="item.title"
      :href="item.href"
      :title="item.title"
      class="d-inline-block mx-2 social-link"
      rel="noopener noreferrer"
      target="_blank"
    >
      <v-icon
        :icon="item.icon"
        :size="item.icon === '$vuetify' ? 24 : 16"
      />
    </a>

    <div
      class="text-caption text-disabled"
      style="position: absolute; right: 16px;"
    >
      &copy; 2026-{{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">Florian MAZEN</span>
      —
      <a
        class="text-decoration-none on-surface"
        href="https://www.gnu.org/licenses/agpl-3.0.html"
        rel="noopener noreferrer"
        target="_blank"
      >
        AGPLv3 License
      </a>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
  const items = [
    {
      title: 'Vuetify GitHub',
      icon: `mdi-github`,
      href: 'https://github.com/Ham-QSP/Qsp',
    },

  ]
</script>

<style scoped lang="sass">
.social-link :deep(.v-icon)
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: rgba(25, 118, 210, 1)
</style>
