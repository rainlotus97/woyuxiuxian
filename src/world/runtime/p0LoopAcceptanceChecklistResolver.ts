import type {
  MainLoopReadinessKey,
  MainLoopReadinessSummary
} from './mainLoopReadinessResolver'
import type {
  P0LoopClosureItem,
  P0LoopClosureSummary
} from './p0LoopClosureResolver'
import type { P0LoopNextActionSummary } from './p0LoopNextActionResolver'
import {
  resolveP0LoopRouteTarget,
  type P0LoopRouteTarget
} from './p0LoopRouteResolver'

export interface P0LoopAcceptanceChecklistItem {
  id: MainLoopReadinessKey
  label: string
  state: P0LoopClosureItem['state']
  stateLabel: string
  requirement: string
  actionLabel: string
  routeTarget: P0LoopRouteTarget
  proof: string
  proofDetail: string
  proofSources: string[]
  readinessReason: string
  isClosed: boolean
  isBlocked: boolean
  isNext: boolean
  order: number
}

export interface P0LoopAcceptanceChecklistSummary {
  items: P0LoopAcceptanceChecklistItem[]
  closedItems: P0LoopAcceptanceChecklistItem[]
  remainingItems: P0LoopAcceptanceChecklistItem[]
  blockedItems: P0LoopAcceptanceChecklistItem[]
  nextItem: P0LoopAcceptanceChecklistItem
  closedCount: number
  remainingCount: number
  blockedCount: number
  totalCount: number
  readyForP1: boolean
  headline: string
}

export interface P0LoopAcceptanceChecklistInput {
  readiness: MainLoopReadinessSummary
  closure: P0LoopClosureSummary
  nextAction: P0LoopNextActionSummary
  hotspotAreaId?: string | null
}

const ACCEPTANCE_ORDER: Record<MainLoopReadinessKey, number> = {
  idle: 10,
  adventure: 20,
  story: 30,
  npc: 40,
  map: 50,
  sect: 60
}

const REQUIREMENTS: Record<MainLoopReadinessKey, string> = {
  idle: '主角行程至少出现一次挂机、机缘、修炼、采药、功法或宗门差遣记录。',
  adventure: '历险入口至少产出一次扫荡、战斗、奖励或掉落行程。',
  story: '故事入口至少产生推进痕迹、完成记录或故事行程。',
  npc: '人物入口至少产生人物纪闻或主角与 NPC 的互动行程。',
  map: '地图入口至少产生区域处置、探索、异动、征服或地图行程。',
  sect: '宗门入口至少产生宗门归属、拜山、任务、奖励或宗门行程。'
}

const STATE_LABELS: Record<P0LoopClosureItem['state'], string> = {
  closed: '已闭环',
  actionable: '待验证',
  blocked: '阻塞'
}

function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

export function resolveP0LoopAcceptanceChecklist(
  input: P0LoopAcceptanceChecklistInput
): P0LoopAcceptanceChecklistSummary {
  const readinessById = input.readiness.byId
  const items = sortByOrder(input.closure.items.map(closure => {
    const readiness = readinessById[closure.id]
    return {
      id: closure.id,
      label: closure.label,
      state: closure.state,
      stateLabel: STATE_LABELS[closure.state],
      requirement: REQUIREMENTS[closure.id],
      actionLabel: closure.nextAction,
      routeTarget: resolveP0LoopRouteTarget({
        id: closure.id,
        hotspotAreaId: input.hotspotAreaId
      }),
      proof: closure.evidence,
      proofDetail: closure.evidenceDetail,
      proofSources: closure.evidenceSources,
      readinessReason: readiness?.reason ?? '暂无入口状态说明。',
      isClosed: closure.state === 'closed',
      isBlocked: closure.state === 'blocked',
      isNext: closure.id === input.nextAction.primary.id,
      order: ACCEPTANCE_ORDER[closure.id]
    } satisfies P0LoopAcceptanceChecklistItem
  }))

  const closedItems = items.filter(item => item.isClosed)
  const remainingItems = items.filter(item => !item.isClosed)
  const blockedItems = items.filter(item => item.isBlocked)
  const fallbackItem = {
    id: 'idle',
    label: '挂机',
    state: 'actionable',
    stateLabel: '待验证',
    requirement: REQUIREMENTS.idle,
    actionLabel: '开始挂机',
    routeTarget: resolveP0LoopRouteTarget({ id: 'idle' }),
    proof: '暂无 P0 验收项',
    proofDetail: '暂无 P0 验收清单数据；先回到修炼主界。',
    proofSources: [],
    readinessReason: '暂无入口状态说明。',
    isClosed: false,
    isBlocked: false,
    isNext: true,
    order: ACCEPTANCE_ORDER.idle
  } satisfies P0LoopAcceptanceChecklistItem
  const nextItem = items.find(item => item.isNext) ?? remainingItems[0] ?? items[0] ?? fallbackItem
  const totalCount = items.length
  const readyForP1 = totalCount > 0 && remainingItems.length === 0
  const headline = readyForP1
    ? 'P0 六项验收清单均有可回看证据。'
    : blockedItems.length > 0
      ? `P0 仍有 ${blockedItems.length} 项阻塞，先处理 ${nextItem.label}。`
      : `P0 仍有 ${remainingItems.length} 项待验证，建议先处理 ${nextItem.label}。`

  return {
    items,
    closedItems,
    remainingItems,
    blockedItems,
    nextItem,
    closedCount: closedItems.length,
    remainingCount: remainingItems.length,
    blockedCount: blockedItems.length,
    totalCount,
    readyForP1,
    headline
  }
}
