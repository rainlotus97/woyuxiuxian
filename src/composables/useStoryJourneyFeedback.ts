import { ref } from 'vue'
import { useWorldStore } from '@/stores/worldStore'
import { useStoryStore } from '@/story/storyStore'
import {
  resolveStoryJourney,
  type StoryJourneyAction,
  type StoryJourneyResult
} from '@/story/runtime/storyJourneyResolver'

export function useStoryJourneyFeedback() {
  const worldStore = useWorldStore()
  const storyStore = useStoryStore()
  const lastStoryJourneyFeedback = ref<StoryJourneyResult | null>(null)

  function recordStoryJourney(action: StoryJourneyAction) {
    const result = resolveStoryJourney({
      action,
      clock: worldStore.clock,
      perspective: storyStore.currentPerspective,
      volume: storyStore.currentVolume,
      currentNodeId: storyStore.currentNodeId,
      currentNodeName: storyStore.currentNode?.name,
      currentNodeMap: storyStore.currentNode?.map,
      completedCount: storyStore.completedNodes.size
    })

    worldStore.recordManualPlayerJourney(result)
    lastStoryJourneyFeedback.value = result
    return result
  }

  return {
    lastStoryJourneyFeedback,
    recordStoryJourney
  }
}
