<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>QSP</v-app-bar-title>
      <template v-slot:append>
        <AgentButton></AgentButton>
        <v-divider vertical></v-divider>
        <LoginButton></LoginButton>
      </template>

    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>

</script>

