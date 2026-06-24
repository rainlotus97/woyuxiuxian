import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStoryStore } from '@/story/storyStore'
import { usePlayerStore } from '@/stores/playerStore'

export function useStoryOverlay() {
  const router = useRouter()
  const storyStore = useStoryStore()
  const playerStore = usePlayerStore()

  const isStoryOverlayVisible = computed(() => routeWantsStoryOverlay(router.currentRoute.value.fullPath))
  const isStandaloneStoryRoute = computed(() => router.currentRoute.value.path === '/game/story')

  async function openStoryOverlay() {
    if (!storyStore.hasStoryContent) return false

    const preferredPerspective = playerStore.perspective ?? 'male'

    if (storyStore.currentNodeId && storyStore.currentNode) {
      await storyStore.continueStory(preferredPerspective)
    } else {
      await storyStore.initStory(preferredPerspective, 1)
    }

    if (!storyStore.currentNode) {
      await storyStore.initStory(preferredPerspective, 1)
    }

    if (!storyStore.currentNode) return false

    const currentPath = router.currentRoute.value.path
    if (currentPath !== '/game/cultivation' && currentPath !== '/game/adventure') {
      await router.push('/game/cultivation?story=1')
      return true
    }

    await router.push({
      path: currentPath,
      query: {
        ...router.currentRoute.value.query,
        story: '1'
      }
    })
    return true
  }

  async function closeStoryOverlay() {
    storyStore.suspendStory()
    const nextQuery = { ...router.currentRoute.value.query }
    delete nextQuery.story
    await router.replace({
      path: router.currentRoute.value.path,
      query: nextQuery
    })
  }

  return {
    isStoryOverlayVisible,
    isStandaloneStoryRoute,
    openStoryOverlay,
    closeStoryOverlay
  }
}

function routeWantsStoryOverlay(fullPath: string) {
  return fullPath.includes('story=1')
}
