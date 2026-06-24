import { getSectById, type SectWar, type SectWorldCondition } from '@/types/sect'
import type { MapAreaEncounterContext } from './mapAreaEncounterResolver'

export type AreaEntryState = 'open' | 'risky' | 'blocked'
export type AreaEntryBlocker = 'captivity' | 'anomaly' | 'sect' | 'war' | null

export interface AreaGameplayAccessInput {
  areaName: string
  mapAreaId?: string | null
  mapAreaSectIds?: string[]
  controllerSectId?: string | null
  encounter: MapAreaEncounterContext | null
  baseStaminaCost: number
  sweepMultiplier?: number
  playerCaptivity: {
    isCaptured: boolean
    captorSectId: string | null
  }
  sectRuntime: {
    joinedSectId: string | null
    currentSectName?: string | null
    homeAreaId?: string | null
    worldCondition: SectWorldCondition
    activeWar: SectWar | null
  }
}

export interface AreaGameplayAccess {
  entryState: AreaEntryState
  entryLabel: string
  entryReason: string
  warnings: string[]
  staminaCost: number
  sweepCost: number
  challengeAllowed: boolean
  mapChallengeAllowed: boolean
  adventureChallengeAllowed: boolean
  sweepAllowed: boolean
  blocker: AreaEntryBlocker
}

const ENTRY_STATE_PRIORITY: Record<AreaEntryState, number> = {
  open: 0,
  risky: 1,
  blocked: 2
}

const ANOMALY_SURCHARGE: Record<'minor' | 'normal' | 'major' | 'legendary', number> = {
  minor: 1,
  normal: 1,
  major: 2,
  legendary: 3
}

function clampStaminaCost(cost: number) {
  return Math.max(1, Math.floor(cost))
}

export function resolveAreaGameplayAccess(input: AreaGameplayAccessInput): AreaGameplayAccess {
  const warnings = new Set<string>()
  const sweepMultiplier = input.sweepMultiplier ?? 3
  const controllerSectId = input.controllerSectId ?? input.encounter?.controllerSectId ?? null
  const joinedSectId = input.sectRuntime.joinedSectId
  const joinedSectName = input.sectRuntime.currentSectName
    ?? (joinedSectId ? getSectById(joinedSectId)?.name ?? '所属宗门' : '所属宗门')
  const homeAreaId = input.sectRuntime.homeAreaId ?? null
  const mapAreaSectIds = input.mapAreaSectIds ?? input.encounter?.mapArea.sects ?? []
  const touchJoinedSectTerritory = Boolean(
    joinedSectId
    && (
      input.mapAreaId === homeAreaId
      || mapAreaSectIds.includes(joinedSectId)
      || controllerSectId === joinedSectId
    )
  )
  const war = input.sectRuntime.activeWar
  const touchWarFront = Boolean(
    war
    && (
      mapAreaSectIds.includes(war.attackerSectId)
      || mapAreaSectIds.includes(war.defenderSectId)
      || controllerSectId === war.attackerSectId
      || controllerSectId === war.defenderSectId
    )
  )

  let entryState: AreaEntryState = 'open'
  let entryLabel = input.encounter?.accessLabel ?? '开放'
  let entryReason = '界路暂稳，可正常历练。'
  let blocker: AreaEntryBlocker = null
  let staminaCost = clampStaminaCost(input.baseStaminaCost)
  let sweepAllowed = true

  const applyState = (
    nextState: AreaEntryState,
    label: string,
    reason: string,
    nextBlocker: AreaEntryBlocker = null
  ) => {
    const currentPriority = ENTRY_STATE_PRIORITY[entryState]
    const nextPriority = ENTRY_STATE_PRIORITY[nextState]
    const shouldReplace =
      nextPriority > currentPriority
      || (nextPriority === currentPriority && nextBlocker !== null && blocker === null)

    if (!shouldReplace) return

    entryState = nextState
    entryLabel = label
    entryReason = reason
    blocker = nextBlocker
  }

  if (input.encounter?.accessState === 'blocked') {
    applyState(
      'blocked',
      input.encounter.accessLabel || '封锁',
      input.encounter.anomalyRiskHint ?? `${input.areaName}正遭逢剧烈异动，暂不可进入。`,
      'anomaly'
    )
    if (input.encounter.encounterNote) warnings.add(input.encounter.encounterNote)
    sweepAllowed = false
  } else if (input.encounter?.accessState === 'risky') {
    applyState(
      'risky',
      input.encounter.accessLabel || '异动中',
      input.encounter.anomalyRiskHint ?? `${input.areaName}天地异动未平，行脚消耗上升。`
    )
    staminaCost += ANOMALY_SURCHARGE[input.encounter.anomalySeverity ?? 'minor']
    if (input.encounter.encounterNote) warnings.add(input.encounter.encounterNote)
    warnings.add('当前异动下不建议直接扫荡，建议亲自处理战场。')
    sweepAllowed = false
  }

  if (input.encounter?.contested) {
    applyState(
      'risky',
      '争夺中',
      `${input.areaName}仍处于势力拉扯地带，远行调度会额外损耗体力。`
    )
    staminaCost += 1
    warnings.add('区域控制权尚未稳定，扫荡无法保证安全回收。')
    sweepAllowed = false
  }

  if (input.playerCaptivity.isCaptured) {
    const captorName = input.playerCaptivity.captorSectId
      ? getSectById(input.playerCaptivity.captorSectId)?.name ?? '敌对势力'
      : '敌对势力'
    applyState(
      'blocked',
      '受制',
      `你当前被${captorName}拘押，常规历练与征战入口已关闭。`,
      'captivity'
    )
    warnings.add('当前应优先推进脱逃、营救或赎回相关事件。')
    sweepAllowed = false
  }

  if (touchJoinedSectTerritory && input.sectRuntime.worldCondition.status === 'collapsed') {
    const occupierName = input.sectRuntime.worldCondition.occupiedBySectId
      ? getSectById(input.sectRuntime.worldCondition.occupiedBySectId)?.name ?? '敌对势力'
      : '敌对势力'
    applyState(
      'blocked',
      '山门沦陷',
      `${joinedSectName}地界已被${occupierName}压制，需先处理宗门重建。`,
      'sect'
    )
    warnings.add('山门与附属地界的常规出征、扫荡与物资调度暂时停摆。')
    sweepAllowed = false
  } else if (touchJoinedSectTerritory && input.sectRuntime.worldCondition.status === 'rebuilding') {
    applyState(
      'risky',
      '重建中',
      `${joinedSectName}仍在重建，道路调度紊乱，远行消耗增加。`
    )
    staminaCost += 1
    warnings.add('宗门资源优先用于修复山门，当前不开放批量扫荡。')
    sweepAllowed = false
  }

  if (touchWarFront) {
    applyState(
      'risky',
      '战线紧绷',
      `${input.areaName}已卷入宗门战线，行动成本与遭遇风险同步抬升。`,
      blocker === 'blocked' ? blocker : 'war'
    )
    staminaCost += 1
    warnings.add('战线尚未稳定，建议先处理前线冲突再做重复扫荡。')
    sweepAllowed = false
  }

  staminaCost = clampStaminaCost(staminaCost)

  const isBlocked = (entryState as AreaEntryState) === 'blocked'

  return {
    entryState,
    entryLabel,
    entryReason,
    warnings: [...warnings].slice(0, 3),
    staminaCost,
    sweepCost: clampStaminaCost(staminaCost * sweepMultiplier),
    challengeAllowed: !isBlocked,
    mapChallengeAllowed: !isBlocked,
    adventureChallengeAllowed: !isBlocked,
    sweepAllowed: !isBlocked && sweepAllowed,
    blocker
  }
}
