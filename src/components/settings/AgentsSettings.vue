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
import {storeToRefs} from 'pinia'
import {useAgentConnectionStore} from '@/stores/AgentConnection'
import {useAgentControlStore} from '@/stores/agentControl'
import {useAuthentStore} from '@/stores/authent'
import type {AgentDetail} from "@/components/agent/Agent";

const agentStore = useAgentConnectionStore()
const {agentConnectionState} = storeToRefs(agentStore)
const agentControlStore = useAgentControlStore()
const {transceiverCapabilities} = storeToRefs(agentControlStore)
const authentStore = useAuthentStore()

const agentList = ref<AgentDetail[]>([])
const loading = ref(false)

const connectedTransceiverLabel = computed(() => {
  return [transceiverCapabilities.value?.manufacturerName, transceiverCapabilities.value?.modelName]
    .filter(Boolean)
    .join(' ')
})

async function loadAgents() {
  if (!authentStore.isAuthenticated()) return

  loading.value = true
  try {
    agentList.value = await agentStore.getAgents()
    console.log(agentList)
  } finally {
    loading.value = false
  }
}

onMounted(loadAgents)
</script>

<template>
  <v-card-title>Agents</v-card-title>
  <v-card-text>
    <template v-if="!authentStore.isAuthenticated()">
      <p class="text-body-2">
        Log in to see the available agents.
      </p>
    </template>
    <template v-else>
      <v-list lines="two">
        <v-list-item
          v-for="agent in agentList"
          :key="agent.id"
          :title="agent.displayName"
          :subtitle="agent.sessionDescription"
        >
          <template v-slot:title = "title">
            <span class="text-primary">{{ agent.displayName }}</span><span v-if="agent.sessionName !== null"> &mdash; {{ agent.sessionName }} </span>
          </template>
        </v-list-item>
        <v-list-item
          v-if="!loading && agentList.length === 0"
          title="No agent available"
        />


      </v-list>

      <v-btn
        class="mt-2"
        variant="text"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadAgents"
      >
        Refresh
      </v-btn>
    </template>
  </v-card-text>
</template>

<style scoped lang="sass">
</style>
