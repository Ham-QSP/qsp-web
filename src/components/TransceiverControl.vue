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
import {useAgentControlStore} from '@/stores/agentControl'

const props = withDefaults(defineProps<{
  backgroundColor?: string
  primaryTextColor?: string
  secondaryTextColor?: string
  alertColor?: string
  warningColor?: string
}>(), {
  backgroundColor: '#07110f',
  primaryTextColor: '#d8fff4',
  secondaryTextColor: '#4f756e',
  alertColor: '#ff5a66',
  warningColor: '#ffcc66',
})

const canvas = ref<HTMLCanvasElement | null>(null)
const agentControlStore = useAgentControlStore()
const {vfoState} = storeToRefs(agentControlStore)
const frequency = computed(() => {
  if (vfoState.value === null || vfoState.value.frequency === 0) return ''

  return vfoState.value.frequency.toLocaleString('de-DE')
})
const displayFont = '"Roboto Mono", "SFMono-Regular", "Cascadia Mono", "Liberation Mono", Menlo, monospace'
let resizeObserver: ResizeObserver | null = null

function drawDisplay() {
  const element = canvas.value
  if (!element) return

  const context = element.getContext('2d')
  if (!context) return

  const bounds = element.getBoundingClientRect()
  const cssWidth = Math.max(1, bounds.width)
  const cssHeight = Math.max(1, bounds.height)
  const pixelRatio = window.devicePixelRatio || 1
  const canvasWidth = Math.round(cssWidth * pixelRatio)
  const canvasHeight = Math.round(cssHeight * pixelRatio)

  if (element.width !== canvasWidth || element.height !== canvasHeight) {
    element.width = canvasWidth
    element.height = canvasHeight
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, cssWidth, cssHeight)

  context.fillStyle = props.backgroundColor
  context.fillRect(0, 0, cssWidth, cssHeight)

  context.save()
  context.strokeStyle = props.secondaryTextColor
  context.globalAlpha = 0.38
  context.lineWidth = 2
  context.strokeRect(20, 20, cssWidth - 40, cssHeight - 40)
  context.restore()

  if (vfoState.value != null) {
    drawDisplayFrequency(context);
  }
}

function drawDisplayFrequency(context: CanvasRenderingContext2D) {
  context.font = `100px ${displayFont}`
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.fillStyle = props.primaryTextColor
  context.fillText(frequency.value, 50, 50)
}

onMounted(async () => {
  resizeObserver = new ResizeObserver(() => drawDisplay())

  if (canvas.value) {
    resizeObserver.observe(canvas.value)
  }

  await document.fonts?.load(`100px ${displayFont}`)
  drawDisplay()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(props, () => drawDisplay())
watch(frequency, () => drawDisplay())
</script>

<template>
  <canvas ref="canvas" class="transceiver-control" />
  <v-container class="">
    <v-responsive
      class="align-centerfill-height mx-auto"
      max-width="900"
    >

      <div class="text-center">
        <div class="text-body-2 font-weight-light mb-n1">
        </div>
      </div>
    </v-responsive>
  </v-container>
</template>

<style scoped lang="sass">
.transceiver-control
  width: 100%
  height: 300px
  overflow: hidden

canvas
  display: block
  width: 100%
  height: 100%
</style>
