import { ref } from 'vue'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import type { SectDutyResult } from '@/sect/runtime/sectDutyResolver'

export function useSectDuty() {
  const sectStore = useSectStore()
  const worldStore = useWorldStore()
  const lastDuty = ref<SectDutyResult | null>(null)

  function handleSectDuty() {
    const result = sectStore.resolveManualSectDuty()
    if (!result.success) {
      return result
    }

    lastDuty.value = result
    worldStore.recordManualPlayerJourney({
      severity: result.severity,
      title: result.title,
      text: result.text,
      rewards: [
        { type: 'contribution', label: '贡献', value: result.rewards.contribution },
        { type: 'cultivation', label: '修为', value: result.rewards.cultivation },
        { type: 'gold', label: '灵石', value: result.rewards.gold }
      ],
      tags: result.tags
    })
    return result
  }

  return {
    lastDuty,
    handleSectDuty
  }
}
