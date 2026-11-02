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
import {useUsersStore} from '@/stores/users'
import {useAuthentStore} from '@/stores/authent'
import {useStationsStore} from '@/stores/stations'
import type {User} from '@/components/settings/admin/User'
import {stationErrorText} from '@/components/settings/station/Station'

const props = defineProps<{ id: string }>()

const usersStore = useUsersStore()
const stationsStore = useStationsStore()
const authentStore = useAuthentStore()
const router = useRouter()

const isNew = computed(() => props.id === 'new')

const user = ref<User | null>(null)
const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const enabled = ref(true)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const deleteDialog = ref(false)
const createStation = ref(true)
const mainQRZ = ref('')
const mainQRZEdited = ref(false)
const stationDescription = ref('')
// Set when the user was created but not the station; shown once the page of the new user is loaded.
const pendingError = ref('')

const emailRule = (value: string) => /^\S+@\S+\.\S+$/.test(value) || 'Invalid email'
const requiredRule = (value: string) => !!value || 'Required'
const maxRule = (value: string) => value.length <= 100 || '100 characters max'

const canSave = computed(() => {
  if (emailRule(email.value) !== true || email.value.length > 320) return false
  if (password.value.length > 100) return false
  if (isNew.value) {
    return username.value.length > 0 && username.value.length <= 100 && password.value.length > 0
      && (!createStation.value || mainQRZ.value.trim().length > 0)
  }
  return user.value !== null && (
    email.value !== user.value.email
    || enabled.value !== user.value.enabled
    || password.value.length > 0
  )
})

function fillForm(value: User) {
  user.value = value
  username.value = value.username
  email.value = value.email
  enabled.value = value.enabled
  password.value = ''
}

function errorText(error: unknown): string {
  const data = (error as { response?: { data?: { message?: string, detail?: string } } }).response?.data
  return data?.detail ?? data?.message ?? 'Request failed'
}

async function load() {
  errorMessage.value = pendingError.value
  pendingError.value = ''
  if (isNew.value) {
    user.value = null
    username.value = ''
    email.value = ''
    password.value = ''
    enabled.value = true
    createStation.value = true
    mainQRZ.value = ''
    mainQRZEdited.value = false
    stationDescription.value = ''
    return
  }
  if (!authentStore.isAuthenticated()) return

  loading.value = true
  try {
    fillForm(await usersStore.getUser(props.id))
  } catch {
    user.value = null
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    if (isNew.value) {
      const created = await usersStore.createUser({
        username: username.value,
        password: password.value,
        email: email.value,
        enabled: enabled.value,
      })
      if (createStation.value) {
        try {
          await createStationFor(created.username)
        } catch (error) {
          pendingError.value = `User created, but the station setup failed: ${stationErrorText(error)}`
        }
      }
      await router.replace(`/settings/admin/users/${created.id}`)
    } else {
      fillForm(await usersStore.updateUser(props.id, {
        email: email.value,
        enabled: enabled.value,
        password: password.value || null,
      }))
    }
  } catch (error) {
    errorMessage.value = errorText(error)
  } finally {
    saving.value = false
  }
}

// The station is created by the admin, then handed over to the new user.
async function createStationFor(owner: string) {
  const station = await stationsStore.createStation({
    mainQRZ: mainQRZ.value.trim(),
    description: stationDescription.value,
  })
  await stationsStore.createStationGrant(station.id, {subject: owner, role: 'OWNER'})
  const adminGrants = (await stationsStore.getStationGrants(station.id))
    .filter((grant) => grant.subject === authentStore.account?.name && grant.subject !== owner)
  for (const grant of adminGrants) {
    await stationsStore.deleteStationGrant(station.id, grant.id)
  }
}

async function remove() {
  saving.value = true
  errorMessage.value = ''
  try {
    await usersStore.deleteUser(props.id)
    deleteDialog.value = false
    await router.push('/settings/admin/users')
  } catch (error) {
    deleteDialog.value = false
    errorMessage.value = errorText(error)
  } finally {
    saving.value = false
  }
}

onMounted(load)
watch(username, (value) => {
  if (!mainQRZEdited.value) mainQRZ.value = value.toUpperCase()
})
watch(() => props.id, load)
</script>

<template>
  <v-card-title class="d-flex align-center">
    <v-btn
      icon="mdi-arrow-left"
      variant="text"
      to="/settings/admin/users"
    />
    <span class="ml-2">{{ isNew ? 'New user' : (user?.username ?? 'User') }}</span>
  </v-card-title>
  <v-card-text>
    <p
      v-if="!authentStore.isAuthenticated()"
      class="text-body-2"
    >
      Log in to manage the users.
    </p>
    <v-progress-linear
      v-else-if="loading"
      indeterminate
    />
    <p
      v-else-if="!isNew && user === null"
      class="text-body-2"
    >
      User not found.
    </p>
    <v-form
      v-else
      @submit.prevent="canSave && save()"
    >
      <v-alert
        v-if="errorMessage"
        class="mb-4"
        type="error"
        variant="tonal"
        :text="errorMessage"
      />

      <v-text-field
        v-model="username"
        label="Username"
        :disabled="!isNew"
        :rules="isNew ? [requiredRule, maxRule] : []"
      />
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        :rules="[requiredRule, emailRule]"
      />
      <v-text-field
        v-model="password"
        :label="isNew ? 'Password' : 'New password'"
        :hint="isNew ? undefined : 'Leave empty to keep the current password'"
        :persistent-hint="!isNew"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        autocomplete="new-password"
        :rules="isNew ? [requiredRule, maxRule] : [maxRule]"
        @click:append-inner="showPassword = !showPassword"
      />
      <v-switch
        v-model="enabled"
        label="Enabled"
        color="primary"
      />

      <template v-if="isNew">
        <v-switch
          v-model="createStation"
          label="Create a station"
          color="primary"
          hide-details
        />
        <template v-if="createStation">
          <v-text-field
            v-model="mainQRZ"
            class="mt-2"
            label="Main QRZ"
            hint="The new user will own this station"
            persistent-hint
            :rules="[requiredRule]"
            @update:model-value="mainQRZEdited = true"
          />
          <v-textarea
            v-model="stationDescription"
            class="mt-2"
            label="Station description"
            rows="2"
            auto-grow
          />
        </template>
      </template>

      <v-list
        v-if="!isNew && user !== null"
        density="compact"
      >
        <v-list-item
          title="Email validated"
          :subtitle="user.emailValidated ? 'Yes' : 'No'"
        />
        <v-list-item
          v-if="user.passwordExpiration"
          title="Password expiration"
          :subtitle="new Date(user.passwordExpiration).toLocaleString()"
        />
      </v-list>

      <div class="d-flex mt-4">
        <v-btn
          color="primary"
          type="submit"
          :disabled="!canSave"
          :loading="saving"
        >
          Save
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="!isNew"
          color="error"
          variant="outlined"
          prepend-icon="mdi-delete"
          :disabled="saving"
          @click="deleteDialog = true"
        >
          Delete
        </v-btn>
      </div>
    </v-form>

    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card title="Delete user">
        <v-card-text>
          Delete {{ user?.username }}? This cannot be undone.
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
