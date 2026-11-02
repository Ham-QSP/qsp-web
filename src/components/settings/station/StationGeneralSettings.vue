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
import {type Station, stationErrorText} from '@/components/settings/station/Station'

const props = defineProps<{ stationId: string }>()

const stationsStore = useStationsStore()

const station = ref<Station | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const fields = computed(() => {
  if (station.value === null) return []
  return [
    {label: 'Main QRZ', value: station.value.mainQRZ},
    {label: 'Description', value: station.value.description},
    {label: 'Id', value: station.value.id},
  ]
})

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    station.value = await stationsStore.getStation(props.stationId)
  } catch (error) {
    station.value = null
    errorMessage.value = stationErrorText(error)
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.stationId, load)
</script>

<template>
  <v-card-title>General</v-card-title>
  <v-card-text>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-alert
      v-else-if="errorMessage"
      type="error"
      variant="tonal"
      :text="errorMessage"
    />
    <v-card
      v-else-if="station !== null"
      class="settings-block"
      title="Station"
      variant="outlined"
    >
      <v-list>
        <v-list-item
          v-for="field in fields"
          :key="field.label"
          :title="field.label"
          :subtitle="field.value"
        />
      </v-list>
    </v-card>
  </v-card-text>
</template>

<style scoped lang="sass">
.settings-block
  max-width: 480px
</style>
