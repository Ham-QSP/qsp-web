<script setup lang="ts">
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
const displayText = '00.000.00'
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

  context.font = `100px ${displayFont}`
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.fillStyle = props.primaryTextColor
  context.fillText(displayText, 50, 50)
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
</script>

<template>
  <div class="transceiver-control">
    <canvas ref="canvas" />
  </div>
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
