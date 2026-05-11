<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>QSP</v-app-bar-title>
      <template #append>
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
