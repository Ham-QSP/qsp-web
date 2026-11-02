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
  <v-app>
    <v-app-bar>
      <v-app-bar-title>QSP</v-app-bar-title>

      <template #append>
        <v-btn to="/">Radio</v-btn>
        <v-divider vertical />
        <AgentButton />
        <v-divider vertical />
        <LoginButton />
      </template>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {useInputDispatcherStore} from '@/stores/inputDispatcher'

const inputDispatcherStore = useInputDispatcherStore()

function handleKeydown(event: KeyboardEvent) {
  inputDispatcherStore.dispatchKeyboardEvent(event)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="sass">
.v-app-bar .v-btn, .v-app-bar .v-divider
  margin-left: 10px
</style>
