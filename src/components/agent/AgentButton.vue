<script setup lang="ts">
import {storeToRefs} from "pinia";
import {type AgentDetail, ConnectionState} from "@/components/agent/Signaling";
import {useAgentStore} from "@/stores/Agent";
import {useAuthentStore} from "@/stores/authent";

const agentStore = useAgentStore()
const {agentConnectionState} = storeToRefs(agentStore)

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
  <v-dialog v-model="dialogOpen" max-width="500">
    <template v-slot:activator="{ props: activatorProps }">

      <v-btn prepend-icon="mdi-radio" rounded="xl" v-bind="activatorProps" :disabled="!authentStore.isAuthenticated()"
        @click="loadRadios()"
      >
        <template v-slot:prepend>
          <v-icon></v-icon>
        </template>
        <div>
          {{
            (agentConnectionState.state === ConnectionState.NOT_CONNECTED || agentConnectionState.agent === null) ? 'Not Connected' : agentConnectionState.agent.name
          }}
        </div>
      </v-btn>
    </template>

    <template v-slot:default>
      <v-card
        :title="agentConnectionState.state === ConnectionState.CONNECTED && agentConnectionState.agent ? agentConnectionState.agent.name : 'Transceivers'"
      >
        <v-card-text v-if="agentConnectionState.state === ConnectionState.NOT_CONNECTED" id="login-popup">
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
        <v-card-text v-else id="radio-popup">
          <v-btn @click="disconnectClick">Disconnect</v-btn>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text="Close"
            @click="dialogOpen = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

</template>

<style scoped lang="sass">

</style>
