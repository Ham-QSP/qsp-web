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
import {useStationsStore} from '@/stores/stations'
import type {AgentDetail} from "@/components/agent/Agent";
import {ConnectionState} from '@/components/agent/Signaling'
import {canManageStation, stationKey} from '@/components/settings/station/Station'

const props = defineProps<{ stationId: string }>()

const agentStore = useAgentConnectionStore()
const {agentConnectionState} = storeToRefs(agentStore)
const agentControlStore = useAgentControlStore()
const {transceiverCapabilities} = storeToRefs(agentControlStore)
const authentStore = useAuthentStore()
const stationsStore = useStationsStore()

const station = inject(stationKey, ref(null))
const canManage = computed(() => canManageStation(station.value))

const agentList = ref<AgentDetail[]>([])
const loading = ref(false)

const connectedTransceiverLabel = computed(() => {
  return [transceiverCapabilities.value?.manufacturerName, transceiverCapabilities.value?.modelName]
    .filter(Boolean)
    .join(' ')
})

function agentStatus(agent: AgentDetail) {
  if (agent.sessionId === null) return {label: 'Offline', icon: 'mdi-circle-outline', color: undefined}
  if (agentConnectionState.value.state !== ConnectionState.NOT_CONNECTED
    && agentConnectionState.value.agent?.id === agent.sessionId) {
    return {label: 'Connected', icon: 'mdi-radio-tower', color: 'primary'}
  }
  return {label: 'Online', icon: 'mdi-circle', color: 'success'}
}

async function loadAgents() {
  if (!authentStore.isAuthenticated()) return

  loading.value = true
  try {
    agentList.value = await stationsStore.getStationAgents(props.stationId)
  } finally {
    loading.value = false
  }
}

onMounted(loadAgents)
watch(() => props.stationId, loadAgents)
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
          :to="agent.id ? `/settings/station/${stationId}/agents/${agent.id}` : undefined"
        >
          <template #prepend>
            <v-icon
              :icon="agentStatus(agent).icon"
              :color="agentStatus(agent).color"
              :title="agentStatus(agent).label"
              size="small"
            />
          </template>
          <template v-slot:title = "title">
            <span class="text-primary">{{ agent.id }}</span><span v-if="agent.sessionName !== null"> &mdash; {{ agent.sessionName }} </span>
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
      <v-btn
        v-if="canManage"
        class="mt-2 ml-2"
        color="primary"
        prepend-icon="mdi-plus"
        :to="`/settings/station/${stationId}/agents/new`"
      >
        New agent
      </v-btn>
    </template>
  </v-card-text>
</template>

<style scoped lang="sass">
</style>
