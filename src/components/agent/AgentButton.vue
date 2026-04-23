<script setup lang="ts">
import {type AgentDetail, AgentConnection, ConnectionState} from "@/components/agent/Signaling";
import {useAgentStore} from "@/stores/Agent";
import {useAuthentStore} from "@/stores/authent";

const agentStore = useAgentStore()

const authentStore = useAuthentStore();

const agentId = ref<AgentConnection>(new AgentConnection())
const agentList = ref<AgentDetail[]>([])

async function loadRadios() {
  agentList.value = await agentStore.getAgents();
  console.log("loadRadios", agentList.value);
  // TODO
}

loadRadios();

</script>

<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">

      <v-btn prepend-icon="mdi-radio" rounded="xl" v-bind="activatorProps" :disabled="!authentStore.isAuthenticated()">
        <template v-slot:prepend>
          <v-icon></v-icon>
        </template>
        <div>
          {{
            (agentId.state === ConnectionState.NOT_CONNECTED || agentId.agent === null) ? 'Not Connected' : agentId.agent.name
          }}
        </div>
      </v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card title="Availables radios">
        <v-card-text>
          <v-list lines="two">
            <v-list-item
              v-for="agent in agentList"
              :key="agent.id"
              :title="agent.name"
              :subtitle="agent.description"
            />
          </v-list>
        </v-card-text>

        <v-card-actions>
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
