<template>
  <section class="story-route" aria-label="故事">
    <StoryPlayer @back="leaveStory" />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StoryPlayer from '@/components/story/StoryPlayer.vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useStoryStore } from '@/story/storyStore'

const router = useRouter()
const playerStore = usePlayerStore()
const storyStore = useStoryStore()

onMounted(async () => {
  const perspective = playerStore.perspective ?? 'male'
  if (storyStore.currentNodeId && storyStore.currentNode) {
    await storyStore.continueStory(perspective)
  } else {
    await storyStore.initStory(perspective, storyStore.currentVolume || 1)
  }
})

async function leaveStory() {
  storyStore.suspendStory()
  await router.replace('/game/cultivation')
}
</script>

<style scoped>
.story-route {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(238, 247, 242, 0.08), rgba(22, 38, 34, 0.08)),
    var(--theme-app-base, #eef8f1);
}

.story-route :deep(.story-player) {
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: max(18px, env(safe-area-inset-bottom));
}
</style>
