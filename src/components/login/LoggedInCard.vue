<script setup lang="ts">

</script>

<template>
  <v-card title="Dialog">
    <v-card-text>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        text="Close Dialog"
        @click="isActive.value = false"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped lang="sass">

</style>
