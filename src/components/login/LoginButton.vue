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

const fav = ref(true)
const menu = ref(false)
const message = ref(false)
const hints = ref(true)

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
  <div
    v-else
    class="text-center"
  >
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          prepend-icon="mdi-account-circle"
          rounded="xl"
          @click="getServerInfo"
        >
          {{ authentStore.account.name }}
        </v-btn>
      </template>

      <v-card min-width="300">
        <v-list>
          <v-list-item :title="authentStore.account.name" />
          <v-list-item
            :title="serverInfoName"
            :subtitle="serverInfoDescription"
          />
        </v-list>

        <v-divider />

        <v-list>
          <v-list-item>
            <v-btn
              block
              class="justify-start"
              variant="text"
              prepend-icon="mdi-cog"
              text="Profil"
              to="/settings"
              @click="menu = false"
            />
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-btn
            color="primary"
            variant="text"
            @click="menu = false"
          >
            Close
          </v-btn>
          <v-spacer />
          <v-btn
            variant="outlined"
            color="error"
            @click="logoutClick()"
          >
            Log out
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<style scoped lang="sass">
</style>
