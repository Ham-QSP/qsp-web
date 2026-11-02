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
import {useStationsStore} from '@/stores/stations'
import type {AgentDetail} from '@/components/agent/Agent'
import {type AgentSessionDetail, ConnectionState} from '@/components/agent/Signaling'
import {canManageStation, stationErrorText, stationKey} from '@/components/settings/station/Station'

const props = defineProps<{ stationId: string, id: string }>()

const agentStore = useAgentConnectionStore()
const {agentConnectionState} = storeToRefs(agentStore)
const authentStore = useAuthentStore()
const stationsStore = useStationsStore()
const router = useRouter()

const station = inject(stationKey, ref(null))
const canManage = computed(() => canManageStation(station.value))
const isNew = computed(() => props.id === 'new')
const agentsPath = computed(() => `/settings/station/${props.stationId}/agents`)

const agent = ref<AgentDetail | null>(null)
const onlineSession = ref<AgentSessionDetail | null>(null)
const displayName = ref('')
// The secret is only returned on creation and regeneration, so it is kept here to survive the reload.
const revealedSecret = ref<{ agentId: string, secret: string } | null>(null)
const showSecret = ref(false)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const deleteDialog = ref(false)
const secretDialog = ref(false)

const requiredRule = (value: string) => !!value.trim() || 'Required'
const maxRule = (value: string) => value.length <= 100 || '100 characters max'

const canSave = computed(() => {
  const name = displayName.value.trim()
  if (name.length === 0 || name.length > 100) return false
  return isNew.value || (agent.value !== null && name !== agent.value.displayName)
})

const secret = computed(() => {
  if (revealedSecret.value !== null && revealedSecret.value.agentId === props.id) return revealedSecret.value.secret
  return agent.value?.secret ?? null
})

const isConnectedToAgent = computed(() =>
  agentConnectionState.value.state !== ConnectionState.NOT_CONNECTED
  && onlineSession.value !== null
  && agentConnectionState.value.agent?.id === onlineSession.value.id
)

const sessionFields = computed(() => {
  if (agent.value === null) return []
  return [
    {label: 'Session name', value: agent.value.sessionName},
    {label: 'Description', value: agent.value.sessionDescription},
    {label: 'Version', value: agent.value.sessionVersion},
    {label: 'Type', value: agent.value.sessionType},
  ].filter((field) => field.value)
})

function fillForm(value: AgentDetail | null) {
  agent.value = value
  displayName.value = value?.displayName ?? ''
}

function revealSecret(value: AgentDetail) {
  if (value.id !== null && value.secret) {
    revealedSecret.value = {agentId: value.id, secret: value.secret}
    showSecret.value = true
  }
}

async function load() {
  errorMessage.value = ''
  if (isNew.value) {
    fillForm(null)
    onlineSession.value = null
    return
  }
  if (!authentStore.isAuthenticated()) return

  loading.value = true
  try {
    const [agents, onlineAgents] = await Promise.all([
      stationsStore.getStationAgents(props.stationId),
      agentStore.getOnlineAgents(),
    ])
    fillForm(agents.find((a) => a.id === props.id) ?? null)
    onlineSession.value = onlineAgents.find((a) => a.id === agent.value?.sessionId) ?? null
  } catch (error) {
    fillForm(null)
    errorMessage.value = stationErrorText(error)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    const request = {displayName: displayName.value.trim()}
    if (isNew.value) {
      const created = await stationsStore.createStationAgent(props.stationId, request)
      revealSecret(created)
      await router.replace(`${agentsPath.value}/${created.id}`)
    } else {
      const updated = await stationsStore.updateStationAgent(props.stationId, props.id, request)
      fillForm({...agent.value, ...updated})
    }
  } catch (error) {
    errorMessage.value = stationErrorText(error)
  } finally {
    saving.value = false
  }
}

async function regenerateSecret() {
  saving.value = true
  errorMessage.value = ''
  try {
    const updated = await stationsStore.generateStationAgentSecret(props.stationId, props.id)
    fillForm({...agent.value, ...updated})
    revealSecret(updated)
  } catch (error) {
    errorMessage.value = stationErrorText(error)
  } finally {
    secretDialog.value = false
    saving.value = false
  }
}

async function remove() {
  saving.value = true
  errorMessage.value = ''
  try {
    await stationsStore.deleteStationAgent(props.stationId, props.id)
    deleteDialog.value = false
    await router.push(agentsPath.value)
  } catch (error) {
    deleteDialog.value = false
    errorMessage.value = stationErrorText(error)
  } finally {
    saving.value = false
  }
}

function connect() {
  if (onlineSession.value !== null) agentStore.connectToAgent(onlineSession.value)
}

onMounted(load)
watch(() => [props.stationId, props.id], load)
</script>

<template>
  <v-card-title class="d-flex align-center">
    <v-btn
      icon="mdi-arrow-left"
      variant="text"
      :to="agentsPath"
    />
    <span class="ml-2">{{ isNew ? 'New agent' : (agent?.displayName || agent?.id || 'Agent') }}</span>
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
      v-else-if="isNew && !canManage"
      class="text-body-2"
    >
      Only the station owner can create an agent.
    </p>
    <template v-else-if="isNew || agent !== null">
      <v-alert
        v-if="errorMessage"
        class="mb-4"
        type="error"
        variant="tonal"
        :text="errorMessage"
      />

      <div class="d-flex flex-wrap ga-4">
        <v-card
          class="settings-block"
          title="Identification"
          variant="outlined"
        >
          <v-card-text>
            <v-form
              v-if="canManage"
              @submit.prevent="canSave && save()"
            >
              <v-text-field
                v-model="displayName"
                label="Display name"
                :rules="[requiredRule, maxRule]"
              />
              <v-btn
                color="primary"
                type="submit"
                :disabled="!canSave"
                :loading="saving"
              >
                {{ isNew ? 'Create' : 'Save' }}
              </v-btn>
            </v-form>
            <v-list
              v-else
              class="pa-0"
            >
              <v-list-item
                title="Display name"
                :subtitle="agent?.displayName"
              />
            </v-list>

            <v-list
              v-if="!isNew"
              class="pa-0 mt-2"
            >
              <v-list-item
                title="Id"
                :subtitle="agent?.id ?? undefined"
              />
            </v-list>

            <template v-if="secret !== null">
              <v-text-field
                class="mt-2"
                :model-value="secret"
                label="Secret"
                readonly
                :type="showSecret ? 'text' : 'password'"
                :append-inner-icon="showSecret ? 'mdi-eye-off' : 'mdi-eye'"
                :hint="revealedSecret?.agentId === id ? 'Copy it now and configure it in the agent' : undefined"
                persistent-hint
                @click:append-inner="showSecret = !showSecret"
              />
            </template>
          </v-card-text>
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

      <div
        v-if="!isNew"
        class="d-flex flex-wrap ga-2 mt-4"
      >
        <v-btn
          v-if="isConnectedToAgent"
          color="error"
          @click="agentStore.disconnectFromAgent()"
        >
          Disconnect
        </v-btn>
        <v-btn
          v-else-if="onlineSession !== null && agentConnectionState.state === ConnectionState.NOT_CONNECTED"
          prepend-icon="mdi-radio"
          @click="connect"
        >
          Connect
        </v-btn>
        <v-spacer />
        <template v-if="canManage">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-key-change"
            :disabled="saving"
            @click="secretDialog = true"
          >
            Regenerate secret
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="mdi-delete"
            :disabled="saving"
            @click="deleteDialog = true"
          >
            Delete
          </v-btn>
        </template>
      </div>
    </template>
    <template v-else>
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        :text="errorMessage"
      />
      <p
        v-else
        class="text-body-2"
      >
        Agent not found.
      </p>
    </template>

    <v-dialog
      v-model="secretDialog"
      max-width="400"
    >
      <v-card title="Regenerate secret">
        <v-card-text>
          The agent will have to be configured with the new secret to connect again.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Cancel"
            @click="secretDialog = false"
          />
          <v-btn
            color="primary"
            text="Regenerate"
            :loading="saving"
            @click="regenerateSecret"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card title="Delete agent">
        <v-card-text>
          Delete {{ agent?.displayName || agent?.id }}? This cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Cancel"
            @click="deleteDialog = false"
          />
          <v-btn
            color="error"
            text="Delete"
            :loading="saving"
            @click="remove"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card-text>
</template>

<style scoped lang="sass">
.settings-block
  flex: 1 1 280px
</style>
