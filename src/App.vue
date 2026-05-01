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

</script>

