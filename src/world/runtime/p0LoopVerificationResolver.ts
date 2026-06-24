import {
  resolveMainLoopReadiness,
  type MainLoopReadinessInput,
  type MainLoopReadinessSummary
} from './mainLoopReadinessResolver'
import {
  resolveP0LoopClosure,
  type P0LoopClosureEvidence,
  type P0LoopClosureSummary
} from './p0LoopClosureResolver'
import {
  resolveP0LoopNextAction,
  type P0LoopNextActionSummary
} from './p0LoopNextActionResolver'
import {
  resolveP0LoopAudit,
  type P0LoopAuditSummary
} from './p0LoopAuditResolver'
import {
  resolveP0LoopAcceptance,
  type P0LoopAcceptanceSummary
} from './p0LoopAcceptanceResolver'
import {
  resolveP0LoopReport,
  type P0LoopReportSummary
} from './p0LoopReportResolver'
import {
  resolveP0LoopAcceptanceChecklist,
  type P0LoopAcceptanceChecklistSummary
} from './p0LoopAcceptanceChecklistResolver'

export interface P0LoopVerificationInput {
  readiness: MainLoopReadinessInput
  evidence: P0LoopClosureEvidence
  hotspotAreaId?: string | null
}

export interface P0LoopVerificationSummary {
  loopReadiness: MainLoopReadinessSummary
  p0LoopClosure: P0LoopClosureSummary
  p0NextAction: P0LoopNextActionSummary
  p0Audit: P0LoopAuditSummary
  p0Acceptance: P0LoopAcceptanceSummary
  p0Report: P0LoopReportSummary
  p0Checklist: P0LoopAcceptanceChecklistSummary
}

export function resolveP0LoopVerification(input: P0LoopVerificationInput): P0LoopVerificationSummary {
  const loopReadiness = resolveMainLoopReadiness(input.readiness)
  const p0LoopClosure = resolveP0LoopClosure({
    readiness: loopReadiness.byId,
    evidence: input.evidence
  })
  const p0NextAction = resolveP0LoopNextAction({
    readinessItems: loopReadiness.items,
    closureItems: p0LoopClosure.items
  })
  const p0Audit = resolveP0LoopAudit({
    closure: p0LoopClosure,
    nextAction: p0NextAction
  })
  const p0Acceptance = resolveP0LoopAcceptance(p0Audit)
  const p0Report = resolveP0LoopReport({
    audit: p0Audit,
    acceptance: p0Acceptance,
    nextAction: p0NextAction
  })
  const p0Checklist = resolveP0LoopAcceptanceChecklist({
    readiness: loopReadiness,
    closure: p0LoopClosure,
    nextAction: p0NextAction,
    hotspotAreaId: input.hotspotAreaId
  })

  return {
    loopReadiness,
    p0LoopClosure,
    p0NextAction,
    p0Audit,
    p0Acceptance,
    p0Report,
    p0Checklist
  }
}
