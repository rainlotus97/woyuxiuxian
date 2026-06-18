import { computed, ref } from 'vue'
import { resolvePlayerFortune, type PlayerFortuneResolution } from '@/world/runtime/playerFortuneResolver'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'

export interface PlayerFortuneFeedback {
  result: PlayerFortuneResolution
  rewardText: string
}

function formatRewardText(result: PlayerFortuneResolution) {
  const parts: string[] = []
  if (result.cultivationGain > 0) parts.push(`修为 +${result.cultivationGain}`)
  if (result.goldGain > 0) parts.push(`灵石 +${result.goldGain}`)
  if (result.item) parts.push(`${result.item.icon}${result.item.name} x${result.item.quantity}`)
  if (parts.length === 0) return '获得一条异闻线索'
  return parts.join('、')
}

export function usePlayerFortune() {
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()
  const mapStore = useMapStore()
  const sectStore = useSectStore()
  const lastFortuneFeedback = ref<PlayerFortuneFeedback | null>(null)

  const fortuneAreaId = computed(() => {
    return worldStore.activeAreaAnomalies[0]?.areaId
      ?? sectStore.currentSect?.areaId
      ?? mapStore.currentRealmAreas[0]?.id
      ?? null
  })

  function handleFortune() {
    const result = resolvePlayerFortune({
      clock: worldStore.clock,
      idleMode: worldStore.idleMode,
      weather: worldStore.weather,
      stamina: playerStore.stamina,
      areaId: fortuneAreaId.value,
      sectName: sectStore.currentSect?.name ?? null,
      npcCount: worldStore.unlockedNpcDefinitions.length
    })

    if (!result.success) return result

    if (!playerStore.consumeStamina(result.staminaCost)) {
      return {
        success: false as const,
        reason: `体力不足，需要 ${result.staminaCost} 点体力处理机缘。`,
        staminaCost: result.staminaCost
      }
    }

    if (result.cultivationGain > 0) playerStore.addCultivation(result.cultivationGain)
    if (result.goldGain > 0) playerStore.addGold(result.goldGain)
    if (result.item) {
      playerStore.addToInventory({
        ...result.item,
        effects: []
      })
    }

    worldStore.recordManualPlayerJourney({
      severity: result.severity,
      title: result.title,
      text: result.text,
      rewards: result.rewards,
      areaId: result.areaId,
      tags: result.tags
    })

    lastFortuneFeedback.value = {
      result,
      rewardText: formatRewardText(result)
    }

    return result
  }

  return {
    lastFortuneFeedback,
    handleFortune
  }
}
