import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useWorldStore } from '@/stores/worldStore'
import type { WorldBriefingItem } from '@/world/runtime/worldBriefingResolver'

export function useWorldBriefingActions() {
  const router = useRouter()
  const worldStore = useWorldStore()
  const { success, warning, info } = useToast()

  function handleWorldBriefingAction(item: WorldBriefingItem) {
    if (!item.action || item.action.disabled) return

    if (item.action.kind === 'escape') {
      const result = worldStore.attemptCaptivityEscape()
      if (!result) {
        warning('当前无法再次尝试脱困')
        return
      }

      if (result.success) {
        success('你已成功脱困')
      } else {
        info('本次脱困未成，但你已摸清更多守备痕迹')
      }
      return
    }

    if (item.action.kind === 'route' && item.action.path) {
      void router.push(item.action.path)
    }
  }

  return {
    handleWorldBriefingAction
  }
}
