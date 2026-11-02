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
import {type Station, stationErrorText} from '@/components/settings/station/Station'

const authentStore = useAuthentStore()
const stationsStore = useStationsStore()

const stationList = ref<Station[]>([])
const loading = ref(false)
const errorMessage = ref('')

async function loadStations() {
  if (!authentStore.isAuthenticated()) return

  loading.value = true
  errorMessage.value = ''
  try {
    stationList.value = await stationsStore.getStations()
  } catch (error) {
    errorMessage.value = stationErrorText(error)
  } finally {
    loading.value = false
  }
}

onMounted(loadStations)
</script>

<template>
  <v-card-title>Stations</v-card-title>
  <v-card-text>
    <template v-if="!authentStore.isAuthenticated()">
      <p class="text-body-2">
        Log in to see your stations.
      </p>
    </template>
    <template v-else>
      <v-alert
        v-if="errorMessage"
        class="mb-2"
        type="error"
        variant="tonal"
        :text="errorMessage"
      />
      <v-list lines="two">
        <v-list-item
          v-for="station in stationList"
          :key="station.id"
          :subtitle="station.description"
          :to="`/settings/station/${station.id}`"
          prepend-icon="mdi-radio-tower"
        >
          <template #title>
            <span class="text-primary">{{ station.mainQRZ }}</span>
          </template>
        </v-list-item>
        <v-list-item
          v-if="!loading && !errorMessage && stationList.length === 0"
          title="No station available"
        />
      </v-list>

      <v-btn
        class="mt-2"
        variant="text"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadStations"
      >
        Refresh
      </v-btn>
    </template>
  </v-card-text>
</template>
