import type { P0LoopClosureItem, P0LoopClosureSummary } from './p0LoopClosureResolver'
import type { P0LoopNextActionSummary } from './p0LoopNextActionResolver'

export type P0LoopAuditStage = 'bootstrapping' | 'verifying' | 'ready_for_p1'

export interface P0LoopAuditChecklistItem {
  id: P0LoopClosureItem['id']
  label: string
  state: P0LoopClosureItem['state']
  stateLabel: string
  detail: string
  nextAction: string
}

export interface P0LoopAuditSummary {
  stage: P0LoopAuditStage
  title: string
  subtitle: string
  progressText: string
  progressPercent: number
  nextActionId: P0LoopNextActionSummary['primary']['id']
  nextActionTitle: string
  nextActionReason: string
  checklist: P0LoopAuditChecklistItem[]
}

const STATE_LABELS: Record<P0LoopClosureItem['state'], string> = {
  closed: '已闭环',
  actionable: '待验证',
  blocked: '阻塞'
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function resolveStage(closure: P0LoopClosureSummary): P0LoopAuditStage {
  if (closure.closedCount === closure.totalCount && closure.totalCount > 0) return 'ready_for_p1'
  if (closure.closedCount === 0 || closure.counts.blocked > 0) return 'bootstrapping'
  return 'verifying'
}

function createChecklistItem(item: P0LoopClosureItem): P0LoopAuditChecklistItem {
  return {
    id: item.id,
    label: item.label,
    state: item.state,
    stateLabel: STATE_LABELS[item.state],
    detail: item.evidence,
    nextAction: item.nextAction
  }
}

export function resolveP0LoopAudit(input: {
  closure: P0LoopClosureSummary
  nextAction: P0LoopNextActionSummary
}): P0LoopAuditSummary {
  const { closure, nextAction } = input
  const stage = resolveStage(closure)
  const progressPercent = closure.totalCount > 0
    ? clampPercent((closure.closedCount / closure.totalCount) * 100)
    : 0

  const stageCopy: Record<P0LoopAuditStage, { title: string; subtitle: string }> = {
    bootstrapping: {
      title: closure.counts.blocked > 0 ? 'P0 先解阻塞' : 'P0 开始跑闭环',
      subtitle: nextAction.headline
    },
    verifying: {
      title: 'P0 闭环复核中',
      subtitle: nextAction.headline
    },
    ready_for_p1: {
      title: 'P0 已具备可玩底座',
      subtitle: '六项核心循环都有可回看的结果证据，可以开始安排 P1 深化。'
    }
  }

  return {
    stage,
    title: stageCopy[stage].title,
    subtitle: stageCopy[stage].subtitle,
    progressText: `P0 ${closure.closedCount}/${closure.totalCount}`,
    progressPercent,
    nextActionId: nextAction.primary.id,
    nextActionTitle: nextAction.primary.title,
    nextActionReason: nextAction.primary.reason,
    checklist: closure.items.map(createChecklistItem)
  }
}
