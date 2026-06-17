<template>
  <div ref="hostEl" class="phaser-host"></div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type Phaser from 'phaser'
import { createGame } from './createGame'

const props = defineProps<{
  startScene?: string
}>()

const hostEl = ref<HTMLElement | null>(null)
let game: Phaser.Game | null = null
let resizeObserver: ResizeObserver | null = null

function mountGame() {
  const host = hostEl.value
  if (!host) return
  const rect = host.getBoundingClientRect()
  game = createGame({
    parent: host,
    width: Math.max(320, Math.floor(rect.width)),
    height: Math.max(480, Math.floor(rect.height)),
    startScene: props.startScene
  })
  resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry || !game) return
    const { width, height } = entry.contentRect
    game.scale.resize(Math.max(320, Math.floor(width)), Math.max(480, Math.floor(height)))
  })
  resizeObserver.observe(host)
}

onMounted(async () => {
  await nextTick()
  mountGame()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  game?.destroy(true)
  game = null
})
</script>

<style scoped>
.phaser-host {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #e8f7ff;
}

.phaser-host :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
