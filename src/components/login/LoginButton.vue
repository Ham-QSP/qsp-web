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

import {getQspServerInfo} from "./QspServerInfo";
import {useAuthentStore} from "@/stores/authent";
import {useAgentConnectionStore} from "@/stores/AgentConnection";

const authentStore = useAuthentStore();
const agentStore = useAgentConnectionStore();
const serverInfoReady = ref(false);
const serverInfoName = ref("[Loading...]");
const serverInfoType = ref("");
const serverInfoVersion = ref("");
const serverInfoDescription = ref("");

const loginClick = () => {
  if (authentStore.isAuthenticated()) {
    getServerInfo();
  }
  else {
    authentStore.login()
  }
}
const logoutClick = () => {
  authentStore.logout();
}

function getServerInfo() {
  agentStore.getQspServerInfo().then(serverInfo => {
    serverInfoReady.value = true;
    serverInfoName.value = serverInfo.serverName;
    serverInfoType.value = serverInfo.type;
    serverInfoVersion.value = serverInfo.version;
    serverInfoDescription.value = serverInfo.description;
  });
}
</script>

<template>
  <v-btn
    v-if="!authentStore.isAuthenticated()"
    prepend-icon="mdi-account-circle"
    rounded="xl"
    text="Log in"
    @click="loginClick"
  />
  <v-dialog
    v-else
    max-width="500"
    @after-enter="getServerInfo"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        prepend-icon="mdi-account-circle"
        rounded="xl"
        v-bind="activatorProps"
      >
        <template #prepend>
          <v-icon />
        </template>
        <div>
          {{ authentStore.account.name }}
        </div>
      </v-btn>
    </template>

    <template #default="{ isActive }">
      <v-card title="QSP Server">
        <v-card-text>
          <v-expansion-panels :disabled="!serverInfoReady">
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ serverInfoName }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <span>{{ serverInfoType }}</span>
                <v-chip size="x-small">
                  {{ serverInfoVersion }}
                </v-chip>
                <p class="font-weight-light ml-2 text-body-2">
                  {{ serverInfoDescription }}
                </p>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>

        <v-card-actions>
          <v-btn
            variant="outlined"
            color="error"
            @click="logoutClick()"
          >
            Log out
          </v-btn>
          <v-spacer />
          <v-btn
            text="Close"
            @click="isActive.value = false"
          />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped lang="sass">
</style>
