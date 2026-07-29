import type { BattleAppliedEffect, BattleResolvedCommand, BattleRuntimeResult, BattleRuntimeUnit, BattleSummonOutcome } from './runtimeTypes'

export type BattleReplayEventType =
  | 'battle_start'
  | 'turn_start'
  | 'turn_status'
  | 'command'
  | 'effect'
  | 'summon'
  | 'summon_exit'
  | 'defeat'
  | 'battle_end'

export type BattleBossPhase = 1 | 2 | 3

export function resolveBattleBossPhase(currentHp: number, maxHp: number): BattleBossPhase {
  const ratio = maxHp > 0 ? Math.max(0, currentHp) / maxHp : 0
  if (ratio > 0.66) return 1
  if (ratio > 0.33) return 2
  return 3
}

export interface BattleReplayActorRef {
  id: string
  name: string
  side: BattleRuntimeUnit['side']
}

export interface BattleReplayEvent {
  id: string
  turn: number
  type: BattleReplayEventType
  text: string
  severity: 'normal' | 'major'
  actor?: BattleReplayActorRef
  targets?: BattleReplayActorRef[]
  payload?: Record<string, string | number | boolean | null | string[]>
}

export interface BattleReplayLogEntry {
  id: string
  text: string
  severity: BattleReplayEvent['severity']
  eventId: string
  type: BattleReplayEventType
  turn: number
  actorId?: string
  targetIds?: string[]
}

interface RecordEventInput {
  turn: number
  type: BattleReplayEventType
  text: string
  severity: BattleReplayEvent['severity']
  actor?: BattleRuntimeUnit | null
  targets?: BattleRuntimeUnit[]
  payload?: BattleReplayEvent['payload']
}

function toActorRef(unit: BattleRuntimeUnit): BattleReplayActorRef {
  return {
    id: unit.id,
    name: unit.name,
    side: unit.side
  }
}

export class BattleReplayRecorder {
  private serial = 0
  private events: BattleReplayEvent[] = []

  record(input: RecordEventInput): BattleReplayEvent {
    this.serial += 1
    const event: BattleReplayEvent = {
      id: `replay_${input.turn}_${this.serial}`,
      turn: input.turn,
      type: input.type,
      text: input.text,
      severity: input.severity,
      actor: input.actor ? toActorRef(input.actor) : undefined,
      targets: input.targets?.map(toActorRef),
      payload: input.payload
    }
    this.events.push(event)
    return event
  }

  recordBattleStart(turn: number, text: string) {
    return this.record({ turn, type: 'battle_start', text, severity: 'major' })
  }

  recordTurnStart(turn: number, actor: BattleRuntimeUnit) {
    return this.record({
      turn,
      type: 'turn_start',
      text: `${actor.name}进入行动。`,
      severity: 'normal',
      actor,
      payload: {
        actionGauge: Math.round(actor.actionGauge),
        currentHp: actor.stats.currentHp,
        currentMp: actor.stats.currentMp
      }
    })
  }

  recordStatusLog(turn: number, actor: BattleRuntimeUnit, text: string, severity: BattleReplayEvent['severity']) {
    return this.record({
      turn,
      type: 'turn_status',
      text,
      severity,
      actor,
      targets: [actor]
    })
  }

  recordCommand(turn: number, resolved: BattleResolvedCommand, actor: BattleRuntimeUnit, targets: BattleRuntimeUnit[], spiritFireCost: number) {
    return this.record({
      turn,
      type: 'command',
      text: `${actor.name}施展${resolved.actionName}。`,
      severity: resolved.skill ? 'major' : 'normal',
      actor,
      targets,
      payload: {
        commandType: resolved.command.type,
        skillId: resolved.skill?.id ?? null,
        skillName: resolved.skill?.name ?? null,
        spiritFireCost,
        targetIds: resolved.targetIds
      }
    })
  }

  recordEffect(turn: number, effect: BattleAppliedEffect, actor: BattleRuntimeUnit | undefined, target: BattleRuntimeUnit | undefined) {
    const effectLabel = effect.effectType === 'damage' ? '伤害' : effect.effectType === 'heal' ? '治疗' : '状态'
    return this.record({
      turn,
      type: 'effect',
      text: target ? `${target.name}受到${effectLabel}结算。` : `${effectLabel}结算。`,
      severity: effect.targetDefeated || effect.isCrit ? 'major' : 'normal',
      actor,
      targets: target ? [target] : [],
      payload: {
        effectType: effect.effectType,
        amount: effect.amount,
        absorbed: effect.absorbed,
        isCrit: effect.isCrit,
        isHeal: effect.isHeal,
        statusType: effect.appliedStatus?.type ?? null,
        targetDefeated: effect.targetDefeated,
        targetHp: target?.stats.currentHp ?? null,
        targetMaxHp: target?.stats.maxHp ?? null,
        targetAlive: target?.isAlive ?? null,
        targetStatusTypes: target?.statusEffects.map(status => status.type) ?? []
      }
    })
  }

  recordBossPhase(turn: number, boss: BattleRuntimeUnit, phase: BattleBossPhase) {
    const phaseLabel = phase === 1 ? '第一' : phase === 2 ? '第二' : '最终'
    const hpRatio = boss.stats.maxHp > 0 ? Math.max(0, boss.stats.currentHp) / boss.stats.maxHp : 0
    return this.record({
      turn,
      type: 'turn_status',
      text: `${boss.name}进入${phaseLabel}阶段。`,
      severity: phase === 3 ? 'major' : 'normal',
      actor: boss,
      targets: [boss],
      payload: {
        bossPhase: phase,
        bossHp: boss.stats.currentHp,
        bossMaxHp: boss.stats.maxHp,
        hpRatio: Number(hpRatio.toFixed(3))
      }
    })
  }

  recordSummon(turn: number, outcome: BattleSummonOutcome, actor: BattleRuntimeUnit | undefined) {
    return this.record({
      turn,
      type: 'summon',
      text: outcome.success
        ? `${actor?.name ?? outcome.actorId}召来${outcome.summonName}。`
        : `${actor?.name ?? outcome.actorId}召唤${outcome.summonName}失败。`,
      severity: outcome.success ? 'major' : 'normal',
      actor,
      payload: {
        summonId: outcome.summonId,
        summonName: outcome.summonName,
        unitId: outcome.unitId ?? null,
        success: outcome.success,
        reason: outcome.reason ?? null
      }
    })
  }

  recordSummonExit(turn: number, summon: BattleRuntimeUnit) {
    return this.record({
      turn,
      type: 'summon_exit',
      text: `${summon.name}灵契耗尽，退离战场。`,
      severity: 'normal',
      actor: summon,
      targets: [summon],
      payload: {
        summonId: summon.summonDefinitionId ?? null,
        ownerId: summon.summonOwnerId ?? null,
        unitId: summon.id
      }
    })
  }

  recordDefeat(turn: number, target: BattleRuntimeUnit, reason = 'damage') {
    return this.record({
      turn,
      type: 'defeat',
      text: `${target.name}被击败。`,
      severity: 'major',
      actor: target,
      targets: [target],
      payload: {
        targetId: target.id,
        reason,
        targetHp: target.stats.currentHp,
        targetMaxHp: target.stats.maxHp
      }
    })
  }

  recordBattleEnd(turn: number, result: Exclude<BattleRuntimeResult, null>, text: string) {
    return this.record({
      turn,
      type: 'battle_end',
      text,
      severity: 'major',
      payload: { result }
    })
  }

  getEvents() {
    return this.events
  }

  getRecentEvents(limit: number) {
    return this.events.slice(-limit)
  }

  createLog(event: BattleReplayEvent): BattleReplayLogEntry {
    return {
      id: `log_${event.id}`,
      text: event.text,
      severity: event.severity,
      eventId: event.id,
      type: event.type,
      turn: event.turn,
      actorId: event.actor?.id,
      targetIds: event.targets?.map(target => target.id)
    }
  }
}
