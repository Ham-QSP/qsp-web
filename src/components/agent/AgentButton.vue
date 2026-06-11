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
import {storeToRefs} from "pinia";
import {type AgentDetail, ConnectionState} from "@/components/agent/Signaling";
import {useAgentConnectionStore} from "@/stores/AgentConnection";
import {useAuthentStore} from "@/stores/authent";
import {useAgentControlStore} from "@/stores/agentControl";

const agentStore = useAgentConnectionStore()
const {agentConnectionState} = storeToRefs(agentStore)
const agentControlStore = useAgentControlStore()
const {transceiverCapabilities} = storeToRefs(agentControlStore)

const authentStore = useAuthentStore();

const agentList = ref<AgentDetail[]>([])
const dialogOpen = ref(false)

async function loadRadios() {
  agentList.value = await agentStore.getAgents();
}

const agentClick = async (agent: AgentDetail) => {
  agentStore.connectToAgent(agent);
  dialogOpen.value = false
}

const disconnectClick = async () => {
  agentStore.disconnectFromAgent();
  dialogOpen.value = false;
}

</script>

<template>
  <div id="remoteTracks" />
  <v-dialog
    v-model="dialogOpen"
    max-width="500"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        prepend-icon="mdi-radio"
        rounded="xl"
        v-bind="activatorProps"
        :disabled="!authentStore.isAuthenticated()"
        @click="loadRadios()"
      >
        <template #prepend>
          <v-icon />
        </template>
        <div>
          {{
            (agentConnectionState.state === ConnectionState.NOT_CONNECTED || agentConnectionState.agent === null) ? 'Not Connected' : agentConnectionState.agent.name
          }}
        </div>
      </v-btn>
    </template>

    <template #default>
      <v-card
        v-if="agentConnectionState.state === ConnectionState.NOT_CONNECTED"
        :title="'Transceivers'"
      >
        <v-card-text
          id="login-popup"
        >
          <v-list lines="two">
            <v-list-item
              v-for="agent in agentList"
              :key="agent.id"
              :title="agent.name"
              :subtitle="agent.description"
              @click="agentClick(agent)"
            />
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Close"
            @click="dialogOpen = false"
          />
        </v-card-actions>
      </v-card>
<!-- -->
      <v-card
        v-else
        :title="agentConnectionState.agent ? agentConnectionState.agent.name : '<Unknow>'"
      >
        <v-card-text
          id="radio-popup"
        >
          <span id="trx-brand">
            {{ transceiverCapabilities?.manufacturerName ?? '' }}
          </span>
          <span id="trx-model">
            {{ transceiverCapabilities?.modelName ?? '' }}
          </span>
        </v-card-text>

        <v-card-actions>
          <v-btn @click="disconnectClick" color="error">
            Disconnect
          </v-btn>
          <v-spacer />
          <v-btn
            text="Close"
            @click="dialogOpen = false"
          />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped lang="sass">
#trx-brand
  font-size: 1.5rem
  font-weight: 600
  margin-right: 10px
</style>
