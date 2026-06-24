import type {
  P0LoopAuditChecklistItem,
  P0LoopAuditSummary
} from './p0LoopAuditResolver'

export type P0LoopAcceptanceState = 'accepted' | 'verifying' | 'blocked'

export interface P0LoopAcceptanceItem {
  id: P0LoopAuditChecklistItem['id']
  label: string
  state: P0LoopAuditChecklistItem['state']
  stateLabel: string
  detail: string
  nextAction: string
  order: number
}

export interface P0LoopAcceptanceSummary {
  state: P0LoopAcceptanceState
  gateLabel: string
  headline: string
  progressText: string
  progressPercent: number
  acceptedCount: number
  remainingCount: number
  blockedCount: number
  acceptedItems: P0LoopAcceptanceItem[]
  remainingItems: P0LoopAcceptanceItem[]
  primaryGap: P0LoopAcceptanceItem | null
  readyForP1: boolean
}

const ACCEPTANCE_ORDER: Record<P0LoopAuditChecklistItem['id'], number> = {
  idle: 10,
  adventure: 20,
  story: 30,
  npc: 40,
  map: 50,
  sect: 60
}

function toAcceptanceItem(item: P0LoopAuditChecklistItem): P0LoopAcceptanceItem {
  return {
    id: item.id,
    label: item.label,
    state: item.state,
    stateLabel: item.stateLabel,
    detail: item.detail,
    nextAction: item.nextAction,
    order: ACCEPTANCE_ORDER[item.id]
  }
}

function sortByAcceptanceOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}

export function resolveP0LoopAcceptance(audit: P0LoopAuditSummary): P0LoopAcceptanceSummary {
  const items = sortByAcceptanceOrder(audit.checklist.map(toAcceptanceItem))
  const acceptedItems = items.filter(item => item.state === 'closed')
  const remainingItems = items.filter(item => item.state !== 'closed')
  const blockedItems = remainingItems.filter(item => item.state === 'blocked')
  const readyForP1 = remainingItems.length === 0 && items.length > 0
  const state: P0LoopAcceptanceState = readyForP1
    ? 'accepted'
    : blockedItems.length > 0
      ? 'blocked'
      : 'verifying'
  const recommendedGap = remainingItems.find(item => item.id === audit.nextActionId)
  const primaryGap = recommendedGap ?? blockedItems[0] ?? remainingItems[0] ?? null

  const copy: Record<P0LoopAcceptanceState, { gateLabel: string; headline: string }> = {
    accepted: {
      gateLabel: '可以进入 P1',
      headline: 'P0 六项核心入口均已有可回看的结果证据。'
    },
    blocked: {
      gateLabel: '先解阻塞',
      headline: `${blockedItems.length} 项入口仍阻塞，先处理前置条件。`
    },
    verifying: {
      gateLabel: '继续 P0 验收',
      headline: `还剩 ${remainingItems.length} 项入口缺少结果证据。`
    }
  }

  return {
    state,
    gateLabel: copy[state].gateLabel,
    headline: copy[state].headline,
    progressText: audit.progressText,
    progressPercent: audit.progressPercent,
    acceptedCount: acceptedItems.length,
    remainingCount: remainingItems.length,
    blockedCount: blockedItems.length,
    acceptedItems,
    remainingItems,
    primaryGap,
    readyForP1
  }
}
