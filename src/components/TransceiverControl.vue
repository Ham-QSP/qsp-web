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
import {Direction, Edge, FlexDirection, loadYoga, Wrap, type Config, type Node, type Yoga} from 'yoga-layout/load'

const props = withDefaults(defineProps<{
  backgroundColor?: string
  primaryTextColor?: string
  secondaryTextColor?: string
  highlightColor?: string
  highlightTextColor?: string
  alertColor?: string
  warningColor?: string
}>(), {
  backgroundColor: '#07110f',
  primaryTextColor: '#d8fff4',
  secondaryTextColor: '#4f756e',
  highlightColor: '#6df7c1',
  highlightTextColor: '#07110f',
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
const mode = "USB";
const layoutParameter: LayoutParameter = {
  rootMargin: 20,
  rootPadding: 20,
  frequencyMinHeight: 50,
  frequencyMinWidth: 200,
  frequencyHeight: 50,
  frequencyFlexGrow: 1,
  frequencyAspectRatio: 2,
  modeContainerWidth: 100,
  modeContainerMinHeight: 50,
  modeContainerPadding: 10,
  modeWidth: 80,
  modeHeight: 26,
}

let resizeObserver: ResizeObserver | null = null
let yoga: Yoga | null = null

interface LayoutParameter {
  rootMargin: number
  rootPadding: number
  frequencyMinHeight: number
  frequencyMinWidth: number
  frequencyHeight: number
  frequencyFlexGrow: number
  frequencyAspectRatio: number
  modeContainerWidth: number
  modeContainerMinHeight: number
  modeContainerPadding: number
  modeWidth: number
  modeHeight: number
}

interface DisplayLayout {
  config: Config
  rootNode: Node
  frequencyNode: Node
  modeContainerNode: Node
  modeNode: Node
}

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

  if (!yoga) return

  const displayLayout = buildDisplayLayout(yoga, cssWidth, cssHeight, layoutParameter)

  try {
    const rootLayout = displayLayout.rootNode.getComputedLayout()

    context.save()
    context.strokeStyle = props.secondaryTextColor
    context.globalAlpha = 0.38
    context.lineWidth = 2
    context.strokeRect(rootLayout.left, rootLayout.top, rootLayout.width, rootLayout.height)
    context.restore()

    if (vfoState.value != null) {
      drawDisplayFrequency(context, displayLayout.frequencyNode);
      drawMode(context, displayLayout.modeContainerNode, displayLayout.modeNode);
    }
  } finally {
    displayLayout.rootNode.freeRecursive()
    displayLayout.config.free()
  }
}

function buildDisplayLayout(
  yogaEngine: Yoga,
  canvasWidth: number,
  canvasHeight: number,
  parameter: LayoutParameter,
): DisplayLayout {
  const config = yogaEngine.Config.create()
  config.setUseWebDefaults(false)

  const rootNode = yogaEngine.Node.create(config)
  rootNode.setWidth(canvasWidth - parameter.rootMargin * 2)
  rootNode.setHeight(canvasHeight - parameter.rootMargin * 2)
  rootNode.setMargin(Edge.All, parameter.rootMargin)
  rootNode.setPadding(Edge.All, parameter.rootPadding)
  rootNode.setFlexWrap(Wrap.Wrap)
  rootNode.setFlexDirection(FlexDirection.Row)

  const frequencyNode = yogaEngine.Node.create(config)
  frequencyNode.setMinHeight(parameter.frequencyMinHeight)
  frequencyNode.setMinWidth(parameter.frequencyMinWidth)
  frequencyNode.setHeight(parameter.frequencyHeight)
  frequencyNode.setFlexGrow(parameter.frequencyFlexGrow)
  frequencyNode.setAspectRatio(parameter.frequencyAspectRatio)
  rootNode.insertChild(frequencyNode, 0)

  const modeContainerNode = yogaEngine.Node.create(config)
  modeContainerNode.setWidth(parameter.modeContainerWidth)
  modeContainerNode.setMinHeight(parameter.modeContainerMinHeight)
  modeContainerNode.setPadding(Edge.All, parameter.modeContainerPadding)
  rootNode.insertChild(modeContainerNode, 1)

  const modeNode = yogaEngine.Node.create(config)
  modeNode.setWidth(parameter.modeWidth)
  modeNode.setHeight(parameter.modeHeight)
  modeContainerNode.insertChild(modeNode, 0)

  rootNode.calculateLayout(canvasWidth, canvasHeight, Direction.LTR)

  return {config, rootNode, frequencyNode, modeContainerNode, modeNode}
}

function estimateFontHeightForWidth(
  context: CanvasRenderingContext2D,
  width: number,
  text: string,
  fontFamily: string,
): number {
  if (width <= 0 || text.length === 0) return 1

  const baseFontHeight = 100
  context.save()
  context.font = `${baseFontHeight}px ${fontFamily}`
  const measuredWidth = context.measureText(text).width
  context.restore()

  if (measuredWidth <= 0) return 1

  return Math.max(1, Math.floor(baseFontHeight * width / measuredWidth))
}

function drawDisplayFrequency(context: CanvasRenderingContext2D, frequencyNode: Node) {
  const layout = frequencyNode.getComputedLayout()
  const fontHeight = estimateFontHeightForWidth(context, layout.width, frequency.value, displayFont)

  context.font = `${fontHeight}px ${displayFont}`
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.fillStyle = props.primaryTextColor
  context.fillText(frequency.value, layout.left, layout.top)
}
function drawMode(context: CanvasRenderingContext2D, modeContainerNode: Node, modeNode: Node) {
  const containerLayout = modeContainerNode.getComputedLayout()
  const modeLayout = modeNode.getComputedLayout()
  const modeLeft = containerLayout.left + modeLayout.left
  const modeTop = containerLayout.top + modeLayout.top

  context.fillStyle = props.highlightColor
  context.roundRect(modeLeft, modeTop, modeLayout.width, modeLayout.height, 5)
  context.fill()
  context.font = `bold 16px ${displayFont}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = props.highlightTextColor
  context.fillText(mode, modeLeft + modeLayout.width / 2, modeTop + modeLayout.height / 2)
}

onMounted(async () => {
  yoga = await loadYoga()

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
