import type { Unit } from '@/types/unit'
import type { Skill } from '@/types/skill'
import { getSkillById } from '@/types/skill'
import {
  applyPreparedEffects,
  resolveBattleCommand
} from './commandResolver'
import { resolveCommandTargetIds } from './targeting'
import {
  hasStatusEffect,
  processTurnStartStatuses
} from './statusRuntime'
import { applyPreparedSummons, hasSummonCapacity } from './summonRuntime'
import { resolveSummonActionLifecycle } from './summonLifecycleRuntime'
import { toBattleRuntimeUnit } from './runtimeUnitFactory'
import { resolveBattleSpeedModifier } from './battleStatusModifierResolver'
import {
  BattleReplayRecorder,
  resolveBattleBossPhase,
  type BattleBossPhase,
  type BattleReplayEvent
} from './battleReplay'
import {
  applySkillCooldown,
  canUseRuntimeSkill,
  reduceActorSkillCooldowns,
  withRuntimeSkillCooldown
} from './skillCooldownRuntime'
import type {
  BattleResolvedCommand,
  BattleRuntimeCommand,
  BattleRuntimeLog,
  BattleRuntimePhase,
  BattleRuntimeResult,
  BattleRuntimeSnapshot,
  BattleRuntimeUnit,
  BattleTurnContext
} from './runtimeTypes'

export type {
  BattleAppliedEffect,
  BattlePreparedSummon,
  BattlePreparedEffect,
  BattleResolvedCommand,
  BattleRuntimeCommand,
  BattleRuntimeHit,
  BattleRuntimeLog,
  BattleRuntimePhase,
  BattleRuntimeResult,
  BattleRuntimeSnapshot,
  BattleRuntimeUnit,
  BattleSummonOutcome
} from './runtimeTypes'

export class BattleRuntime {
  phase: BattleRuntimePhase = 'intro'
  units: BattleRuntimeUnit[] = []
  currentActorId: string | null = null
  spiritFire = 3
  maxSpiritFire = 8
  turn = 1
  result: BattleRuntimeResult = null
  logs: BattleRuntimeLog[] = []
  private pendingTurnContext: BattleTurnContext = { hits: [], logs: [] }
  private summonSerial = 0
  private replayRecorder = new BattleReplayRecorder()
  private bossPhases = new Map<string, BattleBossPhase>()

  constructor(allies: Unit[], enemies: Unit[]) {
    this.units = [
      ...allies.map((unit, index) => toBattleRuntimeUnit(unit, 'ally' as const, index * 8 + Math.random() * 18)),
      ...enemies.map((unit, index) => toBattleRuntimeUnit(unit, 'enemy' as const, index * 8 + Math.random() * 18))
    ]
    this.phase = 'running'
    this.addReplayEvent(this.replayRecorder.recordBattleStart(this.turn, '战斗开始，灵火在阵中流转。'))
    this.syncBossPhases(this.turn, true)
  }

  get aliveAllies() {
    return this.units.filter(unit => unit.side === 'ally' && unit.isAlive)
  }

  get aliveEnemies() {
    return this.units.filter(unit => unit.side === 'enemy' && unit.isAlive)
  }

  get currentActor() {
    return this.units.find(unit => unit.id === this.currentActorId) ?? null
  }

  tick(deltaMs: number, speed: number) {
    if (this.phase !== 'running') return
    this.pendingTurnContext = { hits: [], logs: [] }
    const delta = deltaMs / 1000
    for (const unit of this.units) {
      if (!unit.isAlive) continue
      const statusSpeed = resolveBattleSpeedModifier({ statusEffects: unit.statusEffects })
      unit.actionGauge = Math.min(100, unit.actionGauge + unit.stats.speed * statusSpeed * delta * 0.22 * speed)
    }
    const ready = this.units
      .filter(unit => unit.isAlive && unit.actionGauge >= 100)
      .sort((a, b) => {
        const bSpeed = b.stats.speed * resolveBattleSpeedModifier({ statusEffects: b.statusEffects })
        const aSpeed = a.stats.speed * resolveBattleSpeedModifier({ statusEffects: a.statusEffects })
        return bSpeed - aSpeed
      })[0]
    if (ready) {
      this.startTurn(ready)
    }
  }

  getActorSkills(actorId: string): Skill[] {
    const actor = this.units.find(unit => unit.id === actorId)
    if (!actor) return []
    return actor.skills
      .map(skillId => getSkillById(skillId))
      .filter((skill): skill is Skill => Boolean(skill && skill.category !== 'passive'))
      .map(skill => withRuntimeSkillCooldown(skill, actor))
  }

  getAvailableSkills(actorId: string): Skill[] {
    const actor = this.units.find(unit => unit.id === actorId)
    if (!actor) return []
    return this.getActorSkills(actorId)
      .filter(skill => canUseRuntimeSkill(skill, actor))
      .filter(skill => this.getSpiritFireCost(skill) <= this.spiritFire)
  }

  createAutoCommand(actorId: string): BattleRuntimeCommand | null {
    const actor = this.units.find(unit => unit.id === actorId)
    if (!actor || !actor.isAlive) return null
    const allies = actor.side === 'ally' ? this.aliveAllies : this.aliveEnemies
    const enemies = actor.side === 'ally' ? this.aliveEnemies : this.aliveAllies
    if (enemies.length === 0) return null

    const woundedAllies = allies
      .filter(unit => unit.stats.currentHp < unit.stats.maxHp)
      .sort((a, b) => a.stats.currentHp / a.stats.maxHp - b.stats.currentHp / b.stats.maxHp)
    const availableSkills = this.getAvailableSkills(actor.id)
    const target = [...enemies].sort((a, b) => a.stats.currentHp - b.stats.currentHp)[0]

    const teamHeal = availableSkills.find(skill => skill.effects.some(effect => effect.type === 'heal' && effect.targetType === 'all_allies')) ?? null
    if (teamHeal && woundedAllies.length >= 2) {
      return {
        type: 'skill',
        actorId: actor.id,
        targetIds: resolveCommandTargetIds({ type: 'skill', actorId: actor.id, targetIds: [], skillId: teamHeal.id }, actor, this.units, teamHeal),
        skillId: teamHeal.id
      }
    }

    const singleHeal = availableSkills.find(skill => skill.effects.some(effect => effect.type === 'heal' && effect.targetType === 'single_ally')) ?? null
    if (singleHeal && woundedAllies[0] && woundedAllies[0].stats.currentHp / woundedAllies[0].stats.maxHp < 0.62) {
      return { type: 'skill', actorId: actor.id, targetIds: [woundedAllies[0].id], skillId: singleHeal.id }
    }

    const selfShield = availableSkills.find(skill => skill.effects.some(effect => effect.statusEffect?.type === 'shield')) ?? null
    if (selfShield && actor.stats.currentHp / actor.stats.maxHp < 0.55 && !hasStatusEffect(actor, 'shield')) {
      return { type: 'skill', actorId: actor.id, targetIds: [actor.id], skillId: selfShield.id }
    }

    const selfDefenseBuff = availableSkills.find(skill => skill.effects.some(effect => effect.statusEffect?.type === 'buff_def')) ?? null
    if (selfDefenseBuff && actor.stats.currentHp / actor.stats.maxHp < 0.55 && !hasStatusEffect(actor, 'buff_def')) {
      return { type: 'skill', actorId: actor.id, targetIds: [actor.id], skillId: selfDefenseBuff.id }
    }

    const summonSkill = availableSkills.find(skill => skill.effects.some(effect => effect.type === 'summon')) ?? null
    if (summonSkill && hasSummonCapacity(actor, this.units, summonSkill) && Math.random() < 0.72) {
      return { type: 'skill', actorId: actor.id, targetIds: [], skillId: summonSkill.id }
    }

    const controlSkill = availableSkills.find(skill => skill.effects.some(effect => {
      const statusType = effect.statusEffect?.type
      if (!statusType || (target && hasStatusEffect(target, statusType))) return false
      return statusType === 'spirit_seal'
        || statusType === 'vulnerable'
        || statusType === 'freeze'
        || statusType === 'stun'
        || statusType === 'debuff_atk'
        || statusType === 'debuff_def'
    })) ?? null
    if (controlSkill && target && Math.random() < 0.56) {
      return {
        type: 'skill',
        actorId: actor.id,
        targetIds: resolveCommandTargetIds({ type: 'skill', actorId: actor.id, targetIds: [target.id], skillId: controlSkill.id }, actor, this.units, controlSkill),
        skillId: controlSkill.id
      }
    }

    const damageSkill = availableSkills
      .filter(item => item.effects.some(effect => effect.type === 'damage'))
      .sort((a, b) => this.getSpiritFireCost(b) - this.getSpiritFireCost(a))[0] ?? null
    if (damageSkill && target && this.spiritFire >= this.getSpiritFireCost(damageSkill) && Math.random() < 0.68) {
      return {
        type: 'skill',
        actorId: actor.id,
        targetIds: resolveCommandTargetIds({ type: 'skill', actorId: actor.id, targetIds: [target.id], skillId: damageSkill.id }, actor, this.units, damageSkill),
        skillId: damageSkill.id
      }
    }
    if (!target) return null
    return { type: 'attack', actorId: actor.id, targetIds: [target.id] }
  }

  resolveCommand(command: BattleRuntimeCommand): BattleResolvedCommand | null {
    if (this.phase === 'ended') return null
    const actor = this.units.find(unit => unit.id === command.actorId)
    if (!actor || !actor.isAlive) return null
    if (this.currentActorId && this.currentActorId !== actor.id) return null
    const baseSkill = command.skillId ? (getSkillById(command.skillId) ?? null) : null
    const skill = baseSkill ? withRuntimeSkillCooldown(baseSkill, actor) : null
    if (skill && !canUseRuntimeSkill(skill, actor)) return null
    if (skill && this.getSpiritFireCost(skill) > this.spiritFire) return null
    return resolveBattleCommand(command, this.units, actor, skill)
  }

  applyResolvedCommand(resolved: BattleResolvedCommand) {
    if (this.phase === 'ended') return
    const actor = this.units.find(unit => unit.id === resolved.actorId)
    if (!actor || !actor.isAlive) return
    if (this.currentActorId && this.currentActorId !== actor.id) return

    const skill = resolved.skill
    if (skill) {
      actor.stats.currentMp = Math.max(0, actor.stats.currentMp - skill.mpCost)
      this.spiritFire = Math.max(0, this.spiritFire - this.getSpiritFireCost(skill))
      applySkillCooldown(actor, skill)
    }

    const appliedEffects = applyPreparedEffects(this.units, resolved.preparedEffects)
    const summonOutcomes = applyPreparedSummons(this.units, resolved.preparedSummons, () => this.nextSummonSerial())
    const commandTargets = resolved.targetIds
      .map(targetId => this.units.find(unit => unit.id === targetId))
      .filter((unit): unit is BattleRuntimeUnit => Boolean(unit))
    this.replayRecorder.recordCommand(this.turn, resolved, actor, commandTargets, skill ? this.getSpiritFireCost(skill) : 0)
    const defeatedTargets = new Set<string>()
    let totalDamage = 0
    let counterDamage = 0
    let totalHealing = 0
    let totalStatuses = 0
    let totalSummons = 0

    for (const effect of appliedEffects) {
      if (effect.effectType === 'damage') {
        if (effect.actorId === actor.id) {
          totalDamage += effect.amount
        } else {
          counterDamage += effect.amount
        }
      }
      if (effect.effectType === 'heal') {
        totalHealing += effect.amount
      }
      if (effect.effectType === 'status' && effect.appliedStatus) {
        totalStatuses++
        const target = this.units.find(unit => unit.id === effect.targetId)
        if (target) {
          this.addReplayEvent(this.replayRecorder.record({
            turn: this.turn,
            type: 'effect',
            text: `${target.name}获得${this.getStatusLabel(effect.appliedStatus.type)}效果。`,
            severity: 'normal',
            actor,
            targets: [target],
            payload: {
              effectType: 'status',
              statusType: effect.appliedStatus.type,
              duration: effect.appliedStatus.duration,
              value: effect.appliedStatus.value ?? null
            }
          }))
        }
      }
      if (effect.targetDefeated) {
        defeatedTargets.add(effect.targetId)
      }
      if (effect.effectType === 'damage' || effect.effectType === 'heal') {
        this.replayRecorder.recordEffect(
          this.turn,
          effect,
          this.units.find(unit => unit.id === effect.actorId),
          this.units.find(unit => unit.id === effect.targetId)
        )
      }
    }

    for (const summon of summonOutcomes) {
      if (summon.success) {
        totalSummons++
        this.addReplayEvent(this.replayRecorder.recordSummon(this.turn, summon, actor))
        continue
      }
      if (summon.reason === 'limit') {
        this.addReplayEvent(this.replayRecorder.recordSummon(this.turn, summon, actor))
      }
    }

    this.syncBossPhases(this.turn)

    for (const targetId of defeatedTargets) {
      const target = this.units.find(unit => unit.id === targetId)
      if (target) {
        this.addReplayEvent(this.replayRecorder.recordDefeat(this.turn, target))
      }
    }

    if (totalDamage > 0 && totalHealing > 0 && counterDamage > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，造成${totalDamage}点伤害、恢复${totalHealing}点气血，并被反击${counterDamage}点。`, skill ? 'major' : 'normal', 'command', actor, commandTargets, {
        actionName: resolved.actionName,
        totalDamage,
        totalHealing,
        counterDamage
      })
    } else if (totalDamage > 0 && totalHealing > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，造成${totalDamage}点伤害并恢复${totalHealing}点气血。`, skill ? 'major' : 'normal', 'command', actor, commandTargets, {
        actionName: resolved.actionName,
        totalDamage,
        totalHealing
      })
    } else if (totalDamage > 0 && counterDamage > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，造成${totalDamage}点伤害，并被反击${counterDamage}点。`, skill ? 'major' : 'normal', 'command', actor, commandTargets, {
        actionName: resolved.actionName,
        totalDamage,
        counterDamage
      })
    } else if (totalDamage > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，造成${totalDamage}点伤害。`, skill ? 'major' : 'normal', 'command', actor, commandTargets, {
        actionName: resolved.actionName,
        totalDamage
      })
    } else if (totalHealing > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，恢复${totalHealing}点气血。`, 'major', 'command', actor, commandTargets, {
        actionName: resolved.actionName,
        totalHealing
      })
    } else if (totalSummons > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，召来${totalSummons}个战场助力。`, 'major', 'command', actor, commandTargets, {
        actionName: resolved.actionName,
        totalSummons
      })
    } else if (totalStatuses > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，灵力效果在战场扩散。`, 'major', 'command', actor, commandTargets, {
        actionName: resolved.actionName,
        totalStatuses
      })
    } else if (counterDamage > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，却被反击震退${counterDamage}点气血。`, 'normal', 'command', actor, commandTargets, {
        actionName: resolved.actionName,
        counterDamage
      })
    } else {
      this.addLog(`${actor.name}施展${resolved.actionName}。`, skill ? 'major' : 'normal', 'command', actor, commandTargets, {
        actionName: resolved.actionName
      })
    }

    this.finishAction(actor.id)
  }

  finishAction(actorId = this.currentActorId) {
    if (this.phase === 'ended') return
    const exitingSummon = actorId
      ? resolveSummonActionLifecycle(this.units, actorId)
      : null
    if (exitingSummon) {
      const summon = this.units.find(unit => unit.id === exitingSummon.unitId)
      if (summon) {
        this.addReplayEvent(this.replayRecorder.recordSummonExit(this.turn, summon))
      }
    }

    if (this.aliveEnemies.length === 0) {
      this.result = 'victory'
      this.phase = 'ended'
      this.addReplayEvent(this.replayRecorder.recordBattleEnd(this.turn, 'victory', '战斗胜利。'))
      return
    }
    if (this.aliveAllies.length === 0) {
      this.result = 'defeat'
      this.phase = 'ended'
      this.addReplayEvent(this.replayRecorder.recordBattleEnd(this.turn, 'defeat', '战斗失败。'))
      return
    }
    this.currentActorId = null
    this.turn++
    this.phase = 'running'
  }

  flee() {
    if (this.phase === 'ended' || this.result) return
    this.result = 'fled'
    this.phase = 'ended'
    this.addReplayEvent(this.replayRecorder.recordBattleEnd(this.turn, 'fled', '你脱离了战场。'))
  }

  snapshot(): BattleRuntimeSnapshot {
    return {
      phase: this.phase,
      units: this.units,
      currentActorId: this.currentActorId,
      spiritFire: this.spiritFire,
      maxSpiritFire: this.maxSpiritFire,
      turn: this.turn,
      result: this.result,
      logs: this.logs.slice(-6),
      replayEvents: this.replayRecorder.getRecentEvents(12)
    }
  }

  getReplayEvents() {
    return this.replayRecorder.getEvents()
  }

  consumePendingTurnContext(): BattleTurnContext {
    const context = this.pendingTurnContext
    this.pendingTurnContext = { hits: [], logs: [] }
    return context
  }

  getSpiritFireCost(skill: Skill): number {
    if (skill.mpCost >= 45) return 4
    if (skill.mpCost >= 25) return 3
    if (skill.mpCost >= 12) return 2
    return 1
  }

  private addLog(
    text: string,
    severity: BattleRuntimeLog['severity'],
    type: BattleReplayEvent['type'] = 'command',
    actor?: BattleRuntimeUnit,
    targets?: BattleRuntimeUnit[],
    payload?: BattleReplayEvent['payload']
  ) {
    this.addReplayEvent(this.replayRecorder.record({
      turn: this.turn,
      type,
      text,
      severity,
      actor,
      targets,
      payload
    }))
  }

  private addReplayEvent(event: BattleReplayEvent) {
    this.logs.push(this.replayRecorder.createLog(event))
    if (this.logs.length > 40) {
      this.logs = this.logs.slice(-24)
    }
  }

  private nextSummonSerial() {
    this.summonSerial += 1
    return this.summonSerial
  }

  private getStatusLabel(type: string) {
    const labels: Record<string, string> = {
      poison: '中毒',
      burn: '灼烧',
      bleed: '流血',
      freeze: '冰封',
      stun: '眩晕',
      spirit_seal: '禁法',
      buff_atk: '攻势提升',
      buff_def: '护体',
      buff_spd: '身法提升',
      debuff_atk: '攻势受挫',
      debuff_def: '防御受创',
      vulnerable: '易伤',
      shield: '护盾',
      invincible: '无敌',
      lifesteal: '吸血',
      dodge: '闪避',
      counter: '反击',
      element_damage: '五行增伤',
      food_cultivation: '灵食调息',
      food_stamina: '灵食补给'
    }
    return labels[type] ?? '异象'
  }

  private startTurn(actor: BattleRuntimeUnit) {
    actor.actionGauge = 0
    this.currentActorId = actor.id
    reduceActorSkillCooldowns(actor)
    this.replayRecorder.recordTurnStart(this.turn, actor)
    if (actor.side === 'ally') {
      this.spiritFire = Math.min(this.maxSpiritFire, this.spiritFire + 1)
    }

    const turnStart = processTurnStartStatuses(actor)
    this.pendingTurnContext = {
      hits: turnStart.hits,
      logs: turnStart.logs
    }
    for (const log of turnStart.logs) {
      this.addReplayEvent(this.replayRecorder.recordStatusLog(this.turn, actor, log, turnStart.actorDefeated ? 'major' : 'normal'))
    }

    this.syncBossPhases(this.turn)

    if (turnStart.actorDefeated) {
      this.addReplayEvent(this.replayRecorder.recordDefeat(this.turn, actor, 'status'))
      this.finishAction()
      return
    }

    if (turnStart.actionBlocked) {
      this.finishAction()
      return
    }

    this.phase = 'selecting'
  }

  private syncBossPhases(turn: number, force = false) {
    for (const boss of this.units.filter(unit => unit.side === 'enemy' && unit.battleRole === 'boss')) {
      const phase = resolveBattleBossPhase(boss.stats.currentHp, boss.stats.maxHp)
      if (!force && this.bossPhases.get(boss.id) === phase) continue
      this.bossPhases.set(boss.id, phase)
      this.addReplayEvent(this.replayRecorder.recordBossPhase(turn, boss, phase))
    }
  }
}
