import type { MainLoopReadinessItem, MainLoopReadinessKey } from './mainLoopReadinessResolver'
import type { P0LoopClosureItem, P0LoopClosureState } from './p0LoopClosureResolver'

export type P0LoopNextActionKind = 'unblock' | 'verify' | 'handle' | 'expand'

export interface P0LoopNextActionInput {
  readinessItems: MainLoopReadinessItem[]
  closureItems: P0LoopClosureItem[]
}

export interface P0LoopNextActionItem {
  id: MainLoopReadinessKey
  label: string
  kind: P0LoopNextActionKind
  title: string
  reason: string
  actionHint: string
  priority: number
  closureState: P0LoopClosureState
  readinessState: MainLoopReadinessItem['state']
}

export interface P0LoopNextActionSummary {
  primary: P0LoopNextActionItem
  items: P0LoopNextActionItem[]
  headline: string
  allClosed: boolean
}

const KIND_LABELS: Record<P0LoopNextActionKind, string> = {
  unblock: '先解阻塞',
  verify: '先补闭环',
  handle: '先处理状态',
  expand: '继续扩展'
}

function getKind(readiness: MainLoopReadinessItem, closure: P0LoopClosureItem): P0LoopNextActionKind {
  if (closure.state === 'blocked' || readiness.state === 'blocked') return 'unblock'
  if (closure.state === 'actionable') return 'verify'
  if (readiness.state === 'warning') return 'handle'
  return 'expand'
}

function getPriority(readiness: MainLoopReadinessItem, closure: P0LoopClosureItem, kind: P0LoopNextActionKind) {
  const kindWeight: Record<P0LoopNextActionKind, number> = {
    unblock: 300,
    verify: 240,
    handle: 180,
    expand: 90
  }
  const closureWeight = closure.state === 'actionable' ? 24 : closure.state === 'blocked' ? 40 : 0
  return kindWeight[kind] + closureWeight + readiness.priority
}

function createNextActionItem(readiness: MainLoopReadinessItem, closure: P0LoopClosureItem): P0LoopNextActionItem {
  const kind = getKind(readiness, closure)
  return {
    id: readiness.id,
    label: closure.label,
    kind,
    title: `${KIND_LABELS[kind]}：${closure.label}`,
    reason: kind === 'expand'
      ? `${closure.evidence}，可继续把该循环做深。`
      : `${closure.evidence}。${readiness.reason}`,
    actionHint: closure.nextAction,
    priority: getPriority(readiness, closure, kind),
    closureState: closure.state,
    readinessState: readiness.state
  }
}

export function resolveP0LoopNextAction(input: P0LoopNextActionInput): P0LoopNextActionSummary {
  const readinessById = input.readinessItems.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {} as Partial<Record<MainLoopReadinessKey, MainLoopReadinessItem>>)

  const items = input.closureItems
    .map(closure => {
      const readiness = readinessById[closure.id]
      return readiness ? createNextActionItem(readiness, closure) : null
    })
    .filter((item): item is P0LoopNextActionItem => item !== null)
    .sort((a, b) => b.priority - a.priority)

  const fallback = items[0] ?? {
    id: 'idle',
    label: '挂机',
    kind: 'expand',
    title: '继续扩展：挂机',
    reason: '暂无 P0 循环数据，先回到主角行动。',
    actionHint: '开始挂机',
    priority: 0,
    closureState: 'actionable',
    readinessState: 'ready'
  } satisfies P0LoopNextActionItem

  const primary = items[0] ?? fallback
  const allClosed = items.length > 0 && items.every(item => item.closureState === 'closed')
  const headline = allClosed
    ? 'P0 已有结果证据，下一步可以做深系统。'
    : primary.kind === 'unblock'
      ? `${primary.label} 阻塞，先处理前置。`
      : primary.kind === 'verify'
        ? `${primary.label} 还缺结果证据，建议先验证。`
        : `${primary.label} 状态需要处理。`

  return {
    primary,
    items,
    headline,
    allClosed
  }
}
