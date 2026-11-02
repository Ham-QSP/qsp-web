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
import {useUsersStore} from '@/stores/users'
import type {User} from '@/components/settings/admin/User'

const authentStore = useAuthentStore()
const usersStore = useUsersStore()

const currentUser = ref<User | null>(null)
const currentPassword = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const maxRule = (value: string) => value.length <= 100 || '100 characters max'
const confirmationRule = (value: string) => value === password.value || 'Passwords do not match'

const canSave = computed(() =>
  currentUser.value !== null
  && currentPassword.value.length > 0
  && password.value.length > 0
  && password.value.length <= 100
  && password.value === passwordConfirmation.value
)

function errorText(error: unknown): string {
  const data = (error as { response?: { data?: { message?: string, detail?: string } } }).response?.data
  return data?.detail ?? data?.message ?? 'Request failed'
}

async function loadCurrentUser() {
  if (!authentStore.isAuthenticated()) return

  try {
    currentUser.value = await usersStore.getCurrentUser()
  } catch (error) {
    errorMessage.value = errorText(error)
  }
}

async function changePassword() {
  if (currentUser.value === null) return

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await usersStore.changeCurrentUserPassword({
      currentPassword: currentPassword.value,
      newPassword: password.value,
    })
    currentPassword.value = ''
    password.value = ''
    passwordConfirmation.value = ''
    successMessage.value = 'Password changed'
  } catch (error) {
    errorMessage.value = errorText(error)
  } finally {
    saving.value = false
  }
}

onMounted(loadCurrentUser)
</script>

<template>
  <v-card-title>Profil</v-card-title>
  <v-card-text>
    <template v-if="authentStore.isAuthenticated()">
      <v-list-item
        :title="authentStore.account?.name"
        prepend-icon="mdi-account-circle"
      />
      <v-form
        class="mt-4"
        @submit.prevent="canSave && changePassword()"
      >
        <v-text-field
          :model-value="currentUser?.email ?? ''"
          label="Email"
          readonly
        />
        <v-alert
          v-if="errorMessage"
          class="mb-4"
          type="error"
          variant="tonal"
          :text="errorMessage"
        />
        <v-alert
          v-if="successMessage"
          class="mb-4"
          type="success"
          variant="tonal"
          :text="successMessage"
        />
        <v-text-field
          v-model="currentPassword"
          label="Current password"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          autocomplete="current-password"
          :rules="[maxRule]"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-text-field
          v-model="password"
          label="New password"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          autocomplete="new-password"
          :rules="[maxRule]"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-text-field
          v-model="passwordConfirmation"
          label="Confirm new password"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          autocomplete="new-password"
          :rules="[confirmationRule]"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-btn
          color="primary"
          type="submit"
          :disabled="!canSave"
          :loading="saving"
        >
          Change password
        </v-btn>
      </v-form>
      <v-btn
        class="mt-4"
        color="error"
        variant="outlined"
        @click="authentStore.logout()"
      >
        Log out
      </v-btn>
    </template>
    <template v-else>
      <p class="text-body-2 mb-4">
        You are not logged in.
      </p>
      <v-btn
        prepend-icon="mdi-account-circle"
        @click="authentStore.login()"
      >
        Log in
      </v-btn>
    </template>
  </v-card-text>
</template>

<style scoped lang="sass">
</style>
