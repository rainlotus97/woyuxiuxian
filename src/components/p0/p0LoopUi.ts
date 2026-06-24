import type {
  MainLoopReadinessItem,
  MainLoopReadinessKey,
  MainLoopReadinessTone
} from '@/world/runtime/mainLoopReadinessResolver'
import type { P0LoopClosureItem } from '@/world/runtime/p0LoopClosureResolver'

export interface P0MainLoopTask {
  id: MainLoopReadinessKey
  icon: string
  label: string
  title: string
  summary: string
  meta: string
  tone: MainLoopReadinessTone
  readiness: MainLoopReadinessItem
  closure: P0LoopClosureItem
  active?: boolean
}
