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
import type {SettingItem} from '@/components/settings/SettingsNavLayout.vue'
import {type Station, stationErrorText, stationKey} from '@/components/settings/station/Station'
import {useAuthentStore} from '@/stores/authent'
import {useStationsStore} from '@/stores/stations'

const route = useRoute('/settings/station/[stationId]')
const authentStore = useAuthentStore()
const stationsStore = useStationsStore()

const station = ref<Station | null>(null)
const errorMessage = ref('')
const loading = ref(false)

provide(stationKey, station)

const items = computed<SettingItem[]>(() => [
  {to: `/settings/station/${route.params.stationId}`, title: 'General', icon: 'mdi-information-outline', exact: true},
  {to: `/settings/station/${route.params.stationId}/agents`, title: 'Agents', icon: 'mdi-radio'},
])

async function load() {
  station.value = null
  errorMessage.value = ''
  if (!authentStore.isAuthenticated()) return

  loading.value = true
  try {
    station.value = await stationsStore.getStation(route.params.stationId)
  } catch (error) {
    errorMessage.value = stationErrorText(error)
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.params.stationId, load)
</script>

<template>
  <SettingsNavLayout
    v-if="station !== null"
    :items="items"
  >
    <template #header>
      <div class="d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          to="/settings/station"
        />
        <span class="ml-2 text-h6 text-primary">{{ station.mainQRZ }}</span>
        <v-chip
          class="ml-2"
          size="small"
        >
          {{ station.role === 'OWNER' ? 'Owner' : 'Member' }}
        </v-chip>
      </div>
    </template>
  </SettingsNavLayout>

  <v-container
    v-else
    fluid
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          to="/settings/station"
        />
        <span class="ml-2">Station</span>
      </v-card-title>
      <v-card-text>
        <p
          v-if="!authentStore.isAuthenticated()"
          class="text-body-2"
        >
          Log in to see the station.
        </p>
        <v-progress-linear
          v-else-if="loading"
          indeterminate
        />
        <v-alert
          v-else-if="errorMessage"
          type="error"
          variant="tonal"
          :text="errorMessage"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>
