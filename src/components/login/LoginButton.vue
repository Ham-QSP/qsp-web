<script setup lang="ts">

import {userIsAuthenticated, useMsal} from '../../stores/useMsal';
import {loginRequest} from "@/plugins/authConfig";
import {getQspServerInfo} from "./QspServerInfo";

const {instance} = useMsal();
const isAuthenticated = userIsAuthenticated();
const serverInfoReady = ref(false);
const serverInfoName = ref("[Loading...]");
const serverInfoType = ref("");
const serverInfoVersion = ref("");
const serverInfoDescription = ref("");

const loginClick = () => {
  instance.loginPopup(loginRequest);
}
const logoutClick = () => {
  instance.logoutPopup({
    mainWindowRedirectUri: "/"
  });
}

function getServerInfo() {
  getQspServerInfo().then(serverInfo => {
    serverInfoReady.value = true;
    serverInfoName.value = serverInfo.name;
    serverInfoType.value = serverInfo.type;
    serverInfoVersion.value = serverInfo.version;
    serverInfoDescription.value = serverInfo.description;
  });
}
</script>

<template>
  <v-btn v-if="!isAuthenticated" prepend-icon="mdi-account-circle" rounded="xl" @click="loginClick" text="Log in"
  ></v-btn>
  <v-dialog v-else max-width="500" @after-enter="getServerInfo">
    <template v-slot:activator="{ props: activatorProps }">

      <v-btn prepend-icon="mdi-account-circle" rounded="xl" v-bind="activatorProps">
        <template v-slot:prepend>
          <v-icon></v-icon>
        </template>
        <div>
          {{ instance.getActiveAccount().name }}
        </div>
      </v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card title="QSP Server">
        <v-card-text>
          <v-expansion-panels :disabled="!serverInfoReady">
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ serverInfoName }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <span>{{ serverInfoType }}</span>
                <v-chip size="x-small">{{ serverInfoVersion }}</v-chip>
                <p class="font-weight-light ml-2 text-body-2">
                  {{ serverInfoDescription }}
                </p>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

        </v-card-text>

        <v-card-actions>
          <v-btn variant="outlined" color="error" @click="logoutClick()">Log out</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            text="Close"
            @click="isActive.value = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped lang="sass">
</style>
