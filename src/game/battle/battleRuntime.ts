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
  BattlePreparedEffect,
  BattleResolvedCommand,
  BattleRuntimeCommand,
  BattleRuntimeHit,
  BattleRuntimeLog,
  BattleRuntimePhase,
  BattleRuntimeResult,
  BattleRuntimeSnapshot,
  BattleRuntimeUnit
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

  constructor(allies: Unit[], enemies: Unit[]) {
    this.units = [
      ...allies.map((unit, index) => this.toRuntimeUnit(unit, 'ally' as const, index)),
      ...enemies.map((unit, index) => this.toRuntimeUnit(unit, 'enemy' as const, index))
    ]
    this.phase = 'running'
    this.addLog('战斗开始，灵火在阵中流转。', 'major')
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
      unit.actionGauge = Math.min(100, unit.actionGauge + unit.stats.speed * delta * 0.22 * speed)
    }
    const ready = this.units
      .filter(unit => unit.isAlive && unit.actionGauge >= 100)
      .sort((a, b) => b.stats.speed - a.stats.speed)[0]
    if (ready) {
      this.startTurn(ready)
    }
  }

  getAvailableSkills(actorId: string): Skill[] {
    const actor = this.units.find(unit => unit.id === actorId)
    if (!actor) return []
    const skills: Skill[] = []
    for (const skillId of actor.skills) {
      const skill = getSkillById(skillId)
      if (!skill || skill.category === 'passive') continue
      if (actor.stats.currentMp < skill.mpCost) continue
      if (this.getSpiritFireCost(skill) > this.spiritFire) continue
      skills.push(skill)
    }
    return skills
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

    const damageSkill = availableSkills
      .filter(item => item.effects.some(effect => effect.type === 'damage'))
      .sort((a, b) => this.getSpiritFireCost(b) - this.getSpiritFireCost(a))[0] ?? null
    const target = [...enemies].sort((a, b) => a.stats.currentHp - b.stats.currentHp)[0]
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
    const actor = this.units.find(unit => unit.id === command.actorId)
    if (!actor || !actor.isAlive) return null
    const skill = command.skillId ? (getSkillById(command.skillId) ?? null) : null
    return resolveBattleCommand(command, this.units, actor, skill)
  }

  applyResolvedCommand(resolved: BattleResolvedCommand) {
    const actor = this.units.find(unit => unit.id === resolved.actorId)
    if (!actor) return

    const skill = resolved.skill
    if (skill) {
      actor.stats.currentMp = Math.max(0, actor.stats.currentMp - skill.mpCost)
      this.spiritFire = Math.max(0, this.spiritFire - this.getSpiritFireCost(skill))
    }

    const appliedEffects = applyPreparedEffects(this.units, resolved.preparedEffects)
    const defeatedTargets = new Set<string>()
    let totalDamage = 0
    let totalHealing = 0
    let totalStatuses = 0

    for (const effect of appliedEffects) {
      if (effect.effectType === 'damage') {
        totalDamage += effect.amount
      }
      if (effect.effectType === 'heal') {
        totalHealing += effect.amount
      }
      if (effect.effectType === 'status' && effect.appliedStatus) {
        totalStatuses++
        const target = this.units.find(unit => unit.id === effect.targetId)
        if (target) {
          this.addLog(`${target.name}获得${this.getStatusLabel(effect.appliedStatus.type)}效果。`, 'normal')
        }
      }
      if (effect.targetDefeated) {
        defeatedTargets.add(effect.targetId)
      }
    }

    for (const targetId of defeatedTargets) {
      const target = this.units.find(unit => unit.id === targetId)
      if (target) {
        this.addLog(`${target.name}被击败。`, 'major')
      }
    }

    if (totalDamage > 0 && totalHealing > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，造成${totalDamage}点伤害并恢复${totalHealing}点气血。`, skill ? 'major' : 'normal')
    } else if (totalDamage > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，造成${totalDamage}点伤害。`, skill ? 'major' : 'normal')
    } else if (totalHealing > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，恢复${totalHealing}点气血。`, 'major')
    } else if (totalStatuses > 0) {
      this.addLog(`${actor.name}施展${resolved.actionName}，灵力效果在战场扩散。`, 'major')
    } else {
      this.addLog(`${actor.name}施展${resolved.actionName}。`, skill ? 'major' : 'normal')
    }

    this.finishAction()
  }

  finishAction() {
    if (this.aliveEnemies.length === 0) {
      this.result = 'victory'
      this.phase = 'ended'
      this.addLog('战斗胜利。', 'major')
      return
    }
    if (this.aliveAllies.length === 0) {
      this.result = 'defeat'
      this.phase = 'ended'
      this.addLog('战斗失败。', 'major')
      return
    }
    this.currentActorId = null
    this.turn++
    this.phase = 'running'
  }

  flee() {
    this.result = 'fled'
    this.phase = 'ended'
    this.addLog('你脱离了战场。', 'major')
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
      logs: this.logs.slice(-6)
    }
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

  private toRuntimeUnit(unit: Unit, side: 'ally' | 'enemy', index: number): BattleRuntimeUnit {
    const isBoss = unit.name.includes('BOSS') || unit.quality === '仙品' || unit.quality === '神品'
    return {
      ...unit,
      side,
      spriteKey: side === 'ally' ? 'actor_ally' : isBoss ? 'actor_boss' : 'actor_enemy',
      actionGauge: index * 8 + Math.random() * 18
    }
  }

  private addLog(text: string, severity: BattleRuntimeLog['severity']) {
    this.logs.push({ id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, text, severity })
    if (this.logs.length > 40) {
      this.logs = this.logs.slice(-24)
    }
  }

  private getStatusLabel(type: string) {
    const labels: Record<string, string> = {
      poison: '中毒',
      burn: '灼烧',
      freeze: '冰封',
      stun: '眩晕',
      buff_atk: '攻势提升',
      buff_def: '护体',
      buff_spd: '身法提升',
      debuff_atk: '攻势受挫',
      debuff_def: '防御受创',
      shield: '护盾',
      invincible: '无敌'
    }
    return labels[type] ?? '异象'
  }

  private startTurn(actor: BattleRuntimeUnit) {
    actor.actionGauge = 0
    this.currentActorId = actor.id
    if (actor.side === 'ally') {
      this.spiritFire = Math.min(this.maxSpiritFire, this.spiritFire + 1)
    }

    const turnStart = processTurnStartStatuses(actor)
    this.pendingTurnContext = {
      hits: turnStart.hits,
      logs: turnStart.logs
    }
    for (const log of turnStart.logs) {
      this.addLog(log, turnStart.actorDefeated ? 'major' : 'normal')
    }

    if (turnStart.actorDefeated) {
      this.finishAction()
      return
    }

    if (turnStart.actionBlocked) {
      this.finishAction()
      return
    }

    this.phase = 'selecting'
  }
}
