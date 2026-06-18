import { toValue, type MaybeRefOrGetter } from 'vue'
import { useRouter } from 'vue-router'
import type { MainLoopReadinessKey } from '@/world/runtime/mainLoopReadinessResolver'
import {
  resolveP0LoopRouteTarget,
  type P0LoopRouteTarget
} from '@/world/runtime/p0LoopRouteResolver'

export interface UseP0LoopActionsOptions {
  hotspotAreaId?: MaybeRefOrGetter<string | null | undefined>
  onIdle?: () => void
}

export function useP0LoopActions(options: UseP0LoopActionsOptions = {}) {
  const router = useRouter()

  function getP0LoopRouteTarget(id: MainLoopReadinessKey): P0LoopRouteTarget {
    return resolveP0LoopRouteTarget({
      id,
      hotspotAreaId: toValue(options.hotspotAreaId)
    })
  }

  function handleP0LoopAction(id: MainLoopReadinessKey) {
    if (id === 'idle' && options.onIdle) {
      options.onIdle()
      return
    }

    void router.push(getP0LoopRouteTarget(id))
  }

  return {
    getP0LoopRouteTarget,
    handleP0LoopAction
  }
}
