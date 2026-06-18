import { computed, ref } from 'vue'
import { useWorldStore } from '@/stores/worldStore'
import {
  resolveNpcActivityInsight,
  type NpcActivityInsight
} from '@/world/runtime/npcActivityInsightResolver'

export function useNpcActivityInsight() {
  const worldStore = useWorldStore()
  const lastInsight = ref<NpcActivityInsight | null>(null)

  const canObserve = computed(() => worldStore.unlockedNpcDefinitions.length > 0)

  function observeOneTick() {
    const previousNpcStoryIds = new Set(worldStore.npcStories.map(story => story.id))
    const previousLogIds = new Set(worldStore.logs.map(log => log.id))

    worldStore.advanceTick()

    lastInsight.value = resolveNpcActivityInsight({
      npcStories: worldStore.npcStories,
      logs: worldStore.logs,
      npcDefinitions: worldStore.npcDefinitions,
      previousNpcStoryIds,
      previousLogIds,
      timeLabel: worldStore.currentTimeLabel,
      maxItems: 4
    })

    return lastInsight.value
  }

  return {
    canObserve,
    lastInsight,
    observeOneTick
  }
}
