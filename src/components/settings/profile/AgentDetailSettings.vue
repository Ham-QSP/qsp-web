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
import {useAuthentStore} from '@/stores/authent'
import type {AgentDetail} from '@/components/agent/Agent'
import {type AgentSessionDetail, ConnectionState} from '@/components/agent/Signaling'

const props = defineProps<{ id: string }>()

const agentStore = useAgentConnectionStore()
const {agentConnectionState} = storeToRefs(agentStore)
const authentStore = useAuthentStore()

const agent = ref<AgentDetail | null>(null)
const onlineSession = ref<AgentSessionDetail | null>(null)
const loading = ref(false)

const isConnectedToAgent = computed(() =>
  agentConnectionState.value.state !== ConnectionState.NOT_CONNECTED
  && onlineSession.value !== null
  && agentConnectionState.value.agent?.id === onlineSession.value.id
)

const staticFields = computed(() => {
  if (agent.value === null) return []
  return [
    {label: 'Station', value: agent.value.station},
    {label: 'Secret', value: agent.value.secret},
  ].filter((field) => field.value)
})

const sessionFields = computed(() => {
  if (agent.value === null) return []
  return [
    {label: 'Session name', value: agent.value.sessionName},
    {label: 'Description', value: agent.value.sessionDescription},
    {label: 'Version', value: agent.value.sessionVersion},
    {label: 'Type', value: agent.value.sessionType},
  ].filter((field) => field.value)
})

async function load() {
  if (!authentStore.isAuthenticated()) return

  loading.value = true
  try {
    const [agents, onlineAgents] = await Promise.all([
      agentStore.getAgents(),
      agentStore.getOnlineAgents(),
    ])
    agent.value = agents.find((a) => a.id === props.id) ?? null
    onlineSession.value = onlineAgents.find((a) => a.id === agent.value?.sessionId) ?? null
  } finally {
    loading.value = false
  }
}

function connect() {
  if (onlineSession.value !== null) agentStore.connectToAgent(onlineSession.value)
}

onMounted(load)
watch(() => props.id, load)
</script>

<template>
  <v-card-title class="d-flex align-center">
    <v-btn
      icon="mdi-arrow-left"
      variant="text"
      to="/settings/profile/agents"
    />
    <span class="ml-2">{{ agent?.id ?? 'Agent' }}</span>
    <v-chip
      v-if="agent !== null"
      class="ml-4"
      size="small"
      :color="onlineSession !== null ? 'success' : undefined"
    >
      {{ onlineSession !== null ? 'Online' : 'Offline' }}
    </v-chip>
  </v-card-title>
  <v-card-text>
    <p
      v-if="!authentStore.isAuthenticated()"
      class="text-body-2"
    >
      Log in to see the agent details.
    </p>
    <v-progress-linear
      v-else-if="loading"
      indeterminate
    />
    <p
      v-else-if="agent === null"
      class="text-body-2"
    >
      Agent not found.
    </p>
    <template v-else>
      <div class="d-flex flex-wrap ga-4">
        <v-card
          class="settings-block"
          title="Identification"
          variant="outlined"
        >
          <v-list>
            <v-list-item
              v-for="field in staticFields"
              :key="field.label"
              :title="field.label"
              :subtitle="field.value ?? undefined"
            />
          </v-list>
        </v-card>

        <v-card
          v-if="sessionFields.length > 0"
          class="settings-block"
          title="Connection information"
          variant="outlined"
        >
          <v-list>
            <v-list-item
              v-for="field in sessionFields"
              :key="field.label"
              :title="field.label"
              :subtitle="field.value ?? undefined"
            />
          </v-list>
        </v-card>
      </div>

      <v-btn
        v-if="isConnectedToAgent"
        class="mt-2"
        color="error"
        @click="agentStore.disconnectFromAgent()"
      >
        Disconnect
      </v-btn>
      <v-btn
        v-else-if="onlineSession !== null && agentConnectionState.state === ConnectionState.NOT_CONNECTED"
        class="mt-2"
        prepend-icon="mdi-radio"
        @click="connect"
      >
        Connect
      </v-btn>
    </template>
  </v-card-text>
</template>

<style scoped lang="sass">
.settings-block
  flex: 1 1 280px
</style>
