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
  unblock: '先解眼前困局',
  verify: '先去把这件事碰出来',
  handle: '先顾眼前这件事',
  expand: '顺势再往深处走'
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
      ? `${closure.evidence}，这条路已经有了回响，可以继续往深处走。`
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
    title: '顺势再往深处走：挂机',
    reason: '眼下还没攒出多少动静，先让主角出门走一趟。',
    actionHint: '开始挂机',
    priority: 0,
    closureState: 'actionable',
    readinessState: 'ready'
  } satisfies P0LoopNextActionItem

  const primary = items[0] ?? fallback
  const allClosed = items.length > 0 && items.every(item => item.closureState === 'closed')
  const headline = allClosed
    ? '六条路都已经留下回响，可以做深系统，接下来只管往深处推。'
    : primary.kind === 'unblock'
      ? `${primary.label} 这条路被卡住了，先把眼前因果理顺。`
      : primary.kind === 'verify'
        ? `${primary.label} 这边还缺结果证据，先亲自去走一遭。`
        : `${primary.label} 眼下有事，先顺手把它处理掉。`

  return {
    primary,
    items,
    headline,
    allClosed
  }
}
