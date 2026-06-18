import type { P0LoopAcceptanceSummary } from './p0LoopAcceptanceResolver'
import type { P0LoopAuditSummary } from './p0LoopAuditResolver'
import type { P0LoopNextActionSummary } from './p0LoopNextActionResolver'
import type { MainLoopReadinessKey } from './mainLoopReadinessResolver'

export type P0LoopReportTone = 'jade' | 'gold' | 'rose' | 'mist'

export interface P0LoopReportItem {
  id: MainLoopReadinessKey
  label: string
  stateLabel: string
  detail: string
  nextAction: string
  tone: P0LoopReportTone
}

export interface P0LoopReportSummary {
  title: string
  headline: string
  stageLabel: string
  gateLabel: string
  progressText: string
  progressPercent: number
  readyForP1: boolean
  nextActionId: MainLoopReadinessKey
  nextActionLabel: string
  nextActionTitle: string
  nextActionReason: string
  acceptedCount: number
  remainingCount: number
  blockedCount: number
  acceptedItems: P0LoopReportItem[]
  remainingItems: P0LoopReportItem[]
}

const STAGE_LABELS: Record<P0LoopAuditSummary['stage'], string> = {
  bootstrapping: '建立底座',
  verifying: '闭环复核',
  ready_for_p1: '准备 P1'
}

function getTone(state: string): P0LoopReportTone {
  if (state === 'closed') return 'jade'
  if (state === 'blocked') return 'rose'
  if (state === 'actionable') return 'gold'
  return 'mist'
}

function toReportItem(item: P0LoopAcceptanceSummary['remainingItems'][number]): P0LoopReportItem {
  return {
    id: item.id,
    label: item.label,
    stateLabel: item.stateLabel,
    detail: item.detail,
    nextAction: item.nextAction,
    tone: getTone(item.state)
  }
}

export function resolveP0LoopReport(input: {
  audit: P0LoopAuditSummary
  acceptance: P0LoopAcceptanceSummary
  nextAction: P0LoopNextActionSummary
}): P0LoopReportSummary {
  const { audit, acceptance, nextAction } = input

  return {
    title: audit.title,
    headline: acceptance.headline,
    stageLabel: STAGE_LABELS[audit.stage],
    gateLabel: acceptance.gateLabel,
    progressText: acceptance.progressText,
    progressPercent: acceptance.progressPercent,
    readyForP1: acceptance.readyForP1,
    nextActionId: nextAction.primary.id,
    nextActionLabel: nextAction.primary.label,
    nextActionTitle: nextAction.primary.title,
    nextActionReason: nextAction.primary.reason,
    acceptedCount: acceptance.acceptedCount,
    remainingCount: acceptance.remainingCount,
    blockedCount: acceptance.blockedCount,
    acceptedItems: acceptance.acceptedItems.map(toReportItem),
    remainingItems: acceptance.remainingItems.map(toReportItem)
  }
}
