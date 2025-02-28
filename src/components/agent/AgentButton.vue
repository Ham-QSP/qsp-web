<script setup lang="ts">
import {AgentConnection, ConnectionState, getAgents} from "@/components/agent/Signaling";
import {userIsAuthenticated} from "@/components/login/useMsal";

const isAuthenticated = userIsAuthenticated();

const agentId = ref<AgentConnection>(new AgentConnection())
const radioList = ref([])

function loadRadios() {
  getAgents().then( agents => {
    const radioList = agents.map(agent => {
      title: agent.name
      subtitle: agent.description
    })
    console.log(radioList)

    //TODO
  })

  radioList.value = [
    {
      title: 'Radio #1',
      value: 1,
      subtitle: 'This is the first radio'
    },
    {
      title: 'Radio #2',
      value: 2,
      subtitle: 'This is the second radio'
    },
    {
      title: 'Radio #3',
      value: 3,
      subtitle: 'This is the third radio'
    },
  ];
}

loadRadios();

</script>

<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">

      <v-btn prepend-icon="mdi-radio" rounded="xl" v-bind="activatorProps" :disabled="!isAuthenticated">
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
      <v-card title="Agent">
        <v-card-text>
          <v-list :items="radioList" lines="three" item-props>
            <template v-slot:subtitle="{ subtitle }">
              <div v-html="subtitle"></div>
            </template>
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
