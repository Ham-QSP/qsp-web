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
import {useAuthentStore} from '@/stores/authent'
import {useStationsStore} from '@/stores/stations'
import {useUsersStore} from '@/stores/users'
import type {UserSummary} from '@/components/settings/admin/User'
import {
  canManageStation,
  type StationGrant,
  type StationRole,
  stationErrorText,
  stationKey
} from '@/components/settings/station/Station'

const props = defineProps<{ stationId: string }>()

const authentStore = useAuthentStore()
const stationsStore = useStationsStore()
const usersStore = useUsersStore()

const station = inject(stationKey, ref(null))
const canManage = computed(() => canManageStation(station.value))

const roles: { title: string, value: StationRole }[] = [
  {title: 'Owner', value: 'OWNER'},
  {title: 'Member', value: 'MEMBER'},
]

const grants = ref<StationGrant[]>([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const deleteGrant = ref<StationGrant | null>(null)

const addDialog = ref(false)
const searchEmail = ref('')
const searching = ref(false)
const searched = ref(false)
const searchResults = ref<UserSummary[]>([])
const selectedUser = ref<UserSummary | null>(null)
const newRole = ref<StationRole>('MEMBER')
const addError = ref('')

const emailRule = (value: string) => /^\S+@\S+\.\S+$/.test(value) || 'Invalid email'

const ownerCount = computed(() => grants.value.filter((grant) => grant.role === 'OWNER').length)

// The last owner cannot be demoted or removed, otherwise nobody could manage the station anymore.
function isLastOwner(grant: StationGrant) {
  return grant.role === 'OWNER' && ownerCount.value <= 1
}

function isCurrentUser(subject: string) {
  return subject === authentStore.account?.name
}

function isGranted(user: UserSummary) {
  return grants.value.some((grant) => grant.subject === user.username)
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    grants.value = await stationsStore.getStationGrants(props.stationId)
  } catch (error) {
    grants.value = []
    errorMessage.value = stationErrorText(error)
  } finally {
    loading.value = false
  }
}

function applyOwnRole(grant: StationGrant) {
  if (station.value !== null && isCurrentUser(grant.subject)) {
    station.value = {...station.value, role: grant.role}
  }
}

async function changeRole(grant: StationGrant, role: StationRole) {
  if (role === grant.role) return

  saving.value = true
  errorMessage.value = ''
  try {
    const updated = await stationsStore.updateStationGrant(props.stationId, grant.id, {subject: grant.subject, role})
    grants.value = grants.value.map((g) => (g.id === updated.id ? updated : g))
    applyOwnRole(updated)
  } catch (error) {
    errorMessage.value = stationErrorText(error)
  } finally {
    saving.value = false
  }
}

async function remove() {
  const grant = deleteGrant.value
  if (grant === null) return

  saving.value = true
  errorMessage.value = ''
  try {
    await stationsStore.deleteStationGrant(props.stationId, grant.id)
    grants.value = grants.value.filter((g) => g.id !== grant.id)
  } catch (error) {
    errorMessage.value = stationErrorText(error)
  } finally {
    deleteGrant.value = null
    saving.value = false
  }
}

function openAddDialog() {
  searchEmail.value = ''
  searched.value = false
  searchResults.value = []
  selectedUser.value = null
  newRole.value = 'MEMBER'
  addError.value = ''
  addDialog.value = true
}

function searchErrorText(error: unknown): string {
  const response = (error as { response?: { status?: number, data?: { message?: string, detail?: string } } }).response
  if (response?.status === 403) return 'You are not allowed to search users'
  return response?.data?.detail ?? response?.data?.message ?? 'Search failed'
}

async function search() {
  if (emailRule(searchEmail.value) !== true) return

  searching.value = true
  addError.value = ''
  selectedUser.value = null
  try {
    searchResults.value = await usersStore.searchUsers(searchEmail.value.trim())
    searched.value = true
    if (searchResults.value.length === 1) selectedUser.value = searchResults.value[0]!
  } catch (error) {
    searchResults.value = []
    addError.value = searchErrorText(error)
  } finally {
    searching.value = false
  }
}

async function add() {
  if (selectedUser.value === null || isGranted(selectedUser.value)) return

  saving.value = true
  addError.value = ''
  try {
    const created = await stationsStore.createStationGrant(props.stationId, {
      subject: selectedUser.value.username,
      role: newRole.value,
    })
    grants.value = [...grants.value, created]
    addDialog.value = false
  } catch (error) {
    addError.value = stationErrorText(error)
  } finally {
    saving.value = false
  }
}

watch(searchEmail, () => {
  searched.value = false
  searchResults.value = []
  selectedUser.value = null
})

onMounted(load)
watch(() => props.stationId, load)
</script>

<template>
  <v-card-title>Access control</v-card-title>
  <v-card-text>
    <v-alert
      v-if="errorMessage"
      class="mb-2"
      type="error"
      variant="tonal"
      :text="errorMessage"
    />
    <v-progress-linear
      v-if="loading"
      indeterminate
    />

    <v-list v-else>
      <v-list-item
        v-for="grant in grants"
        :key="grant.id"
        prepend-icon="mdi-account"
      >
        <v-list-item-title>
          {{ grant.subject }}
          <v-chip
            v-if="isCurrentUser(grant.subject)"
            class="ml-2"
            size="x-small"
          >
            You
          </v-chip>
        </v-list-item-title>

        <template #append>
          <template v-if="canManage">
            <v-select
              class="role-select"
              density="compact"
              variant="outlined"
              hide-details
              :items="roles"
              :model-value="grant.role"
              :disabled="saving || isLastOwner(grant)"
              :title="isLastOwner(grant) ? 'The station needs at least one owner' : undefined"
              @update:model-value="changeRole(grant, $event)"
            />
            <v-btn
              class="ml-2"
              icon="mdi-delete"
              variant="text"
              color="error"
              :disabled="saving || isLastOwner(grant)"
              :title="isLastOwner(grant) ? 'The station needs at least one owner' : 'Remove access'"
              @click="deleteGrant = grant"
            />
          </template>
          <v-chip
            v-else
            size="small"
          >
            {{ grant.role === 'OWNER' ? 'Owner' : 'Member' }}
          </v-chip>
        </template>
      </v-list-item>
      <v-list-item
        v-if="!errorMessage && grants.length === 0"
        title="No access granted"
      />
    </v-list>

    <div class="d-flex mt-2">
      <v-btn
        variant="text"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="load"
      >
        Refresh
      </v-btn>
      <v-btn
        v-if="canManage"
        class="ml-2"
        color="primary"
        prepend-icon="mdi-account-plus"
        @click="openAddDialog"
      >
        Add user
      </v-btn>
    </div>

    <v-dialog
      v-model="addDialog"
      max-width="480"
    >
      <v-card title="Add user">
        <v-card-text>
          <v-form @submit.prevent="search">
            <v-text-field
              v-model="searchEmail"
              label="Email"
              type="email"
              autofocus
              :rules="[emailRule]"
            >
              <template #append>
                <v-btn
                  icon="mdi-magnify"
                  variant="text"
                  type="submit"
                  title="Search"
                  :loading="searching"
                  :disabled="emailRule(searchEmail) !== true"
                />
              </template>
            </v-text-field>
          </v-form>

          <v-alert
            v-if="addError"
            class="mb-2"
            type="error"
            variant="tonal"
            :text="addError"
          />

          <p
            v-if="searched && searchResults.length === 0"
            class="text-body-2"
          >
            No user found with this email.
          </p>
          <v-list
            v-else-if="searchResults.length > 0"
            density="compact"
          >
            <v-list-item
              v-for="user in searchResults"
              :key="user.id"
              :title="user.username"
              :subtitle="isGranted(user) ? `${user.email} — already has access` : user.email"
              :active="selectedUser?.id === user.id"
              :disabled="isGranted(user)"
              prepend-icon="mdi-account"
              @click="selectedUser = user"
            />
          </v-list>

          <v-select
            v-if="selectedUser !== null"
            v-model="newRole"
            class="mt-2"
            label="Role"
            :items="roles"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Cancel"
            @click="addDialog = false"
          />
          <v-btn
            color="primary"
            text="Add"
            :loading="saving"
            :disabled="selectedUser === null || isGranted(selectedUser)"
            @click="add"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      :model-value="deleteGrant !== null"
      max-width="400"
      @update:model-value="deleteGrant = null"
    >
      <v-card title="Remove access">
        <v-card-text>
          Remove the access of {{ deleteGrant?.subject }} to this station?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Cancel"
            @click="deleteGrant = null"
          />
          <v-btn
            color="error"
            text="Remove"
            :loading="saving"
            @click="remove"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card-text>
</template>

<style scoped lang="sass">
.role-select
  width: 140px
</style>
