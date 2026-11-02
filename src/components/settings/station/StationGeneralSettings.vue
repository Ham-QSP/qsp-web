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
import {useStationsStore} from '@/stores/stations'
import {canManageStation, stationErrorText, stationKey} from '@/components/settings/station/Station'

const stationsStore = useStationsStore()

const station = inject(stationKey, ref(null))

const mainQRZ = ref('')
const description = ref('')
const saving = ref(false)
const errorMessage = ref('')
const saved = ref(false)

const canManage = computed(() => canManageStation(station.value))

const requiredRule = (value: string) => !!value || 'Required'

const canSave = computed(() => station.value !== null
  && mainQRZ.value.trim().length > 0
  && (mainQRZ.value !== station.value.mainQRZ || description.value !== station.value.description))

function fillForm() {
  mainQRZ.value = station.value?.mainQRZ ?? ''
  description.value = station.value?.description ?? ''
}

async function save() {
  if (station.value === null) return

  saving.value = true
  errorMessage.value = ''
  saved.value = false
  try {
    const updated = await stationsStore.updateStation(station.value.id, {
      mainQRZ: mainQRZ.value.trim(),
      description: description.value,
    })
    // The update response may omit the role, which belongs to the user rather than the station.
    station.value = {...updated, role: updated.role ?? station.value.role}
    saved.value = true
  } catch (error) {
    errorMessage.value = stationErrorText(error)
  } finally {
    saving.value = false
  }
}

watch(station, fillForm, {immediate: true})
watch([mainQRZ, description], () => {
  saved.value = false
})
</script>

<template>
  <v-card-title>General</v-card-title>
  <v-card-text v-if="station !== null">
    <v-form
      v-if="canManage"
      class="settings-block"
      @submit.prevent="canSave && save()"
    >
      <v-alert
        v-if="errorMessage"
        class="mb-4"
        type="error"
        variant="tonal"
        :text="errorMessage"
      />
      <v-alert
        v-else-if="saved"
        class="mb-4"
        type="success"
        variant="tonal"
        text="Station saved"
      />

      <v-text-field
        v-model="mainQRZ"
        label="Main QRZ"
        :rules="[requiredRule]"
      />
      <v-textarea
        v-model="description"
        label="Description"
        rows="3"
        auto-grow
      />
      <v-list density="compact">
        <v-list-item
          title="Id"
          :subtitle="station.id"
        />
      </v-list>

      <v-btn
        class="mt-4"
        color="primary"
        type="submit"
        :disabled="!canSave"
        :loading="saving"
      >
        Save
      </v-btn>
    </v-form>

    <v-card
      v-else
      class="settings-block"
      title="Station"
      variant="outlined"
    >
      <v-list>
        <v-list-item
          title="Main QRZ"
          :subtitle="station.mainQRZ"
        />
        <v-list-item
          title="Description"
          :subtitle="station.description"
        />
        <v-list-item
          title="Id"
          :subtitle="station.id"
        />
      </v-list>
    </v-card>
  </v-card-text>
</template>

<style scoped lang="sass">
.settings-block
  max-width: 480px
</style>
