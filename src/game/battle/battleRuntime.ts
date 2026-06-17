import type { Unit } from '@/types/unit'
import type { Skill } from '@/types/skill'
import { getSkillById } from '@/types/skill'

export type BattleRuntimePhase = 'intro' | 'running' | 'selecting' | 'animating' | 'ended'
export type BattleRuntimeResult = 'victory' | 'defeat' | 'fled' | null

export interface BattleRuntimeUnit extends Unit {
  side: 'ally' | 'enemy'
  spriteKey: string
  portraitKey?: string
  actionGauge: number
}

export interface BattleRuntimeCommand {
  type: 'attack' | 'skill'
  actorId: string
  targetIds: string[]
  skillId?: string
}

export interface BattleRuntimeHit {
  actorId: string
  targetId: string
  amount: number
  isCrit: boolean
  isHeal?: boolean
}

export interface BattleRuntimeLog {
  id: string
  text: string
  severity: 'normal' | 'major'
}

export interface BattleRuntimeSnapshot {
  phase: BattleRuntimePhase
  units: BattleRuntimeUnit[]
  currentActorId: string | null
  spiritFire: number
  maxSpiritFire: number
  turn: number
  result: BattleRuntimeResult
  logs: BattleRuntimeLog[]
}

export class BattleRuntime {
  phase: BattleRuntimePhase = 'intro'
  units: BattleRuntimeUnit[] = []
  currentActorId: string | null = null
  spiritFire = 3
  maxSpiritFire = 8
  turn = 1
  result: BattleRuntimeResult = null
  logs: BattleRuntimeLog[] = []

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
    const delta = deltaMs / 1000
    for (const unit of this.units) {
      if (!unit.isAlive) continue
      unit.actionGauge = Math.min(100, unit.actionGauge + unit.stats.speed * delta * 0.22 * speed)
    }
    const ready = this.units
      .filter(unit => unit.isAlive && unit.actionGauge >= 100)
      .sort((a, b) => b.stats.speed - a.stats.speed)[0]
    if (ready) {
      ready.actionGauge = 0
      this.currentActorId = ready.id
      this.phase = 'selecting'
      if (ready.side === 'ally') {
        this.spiritFire = Math.min(this.maxSpiritFire, this.spiritFire + 1)
      }
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
    const enemies = actor.side === 'ally' ? this.aliveEnemies : this.aliveAllies
    if (enemies.length === 0) return null
    const target = [...enemies].sort((a, b) => a.stats.currentHp - b.stats.currentHp)[0]
    if (!target) return null
    const skill = this.getAvailableSkills(actor.id)
      .filter(item => item.effects.some(effect => effect.type === 'damage'))
      .sort((a, b) => this.getSpiritFireCost(b) - this.getSpiritFireCost(a))[0]
    if (skill && this.spiritFire >= this.getSpiritFireCost(skill) && Math.random() < 0.68) {
      return { type: 'skill', actorId: actor.id, targetIds: [target.id], skillId: skill.id }
    }
    return { type: 'attack', actorId: actor.id, targetIds: [target.id] }
  }

  previewCommand(command: BattleRuntimeCommand): BattleRuntimeHit[] {
    const actor = this.units.find(unit => unit.id === command.actorId)
    if (!actor) return []
    const skill = command.skillId ? getSkillById(command.skillId) : null
    const hits: BattleRuntimeHit[] = []
    for (const targetId of command.targetIds) {
      const target = this.units.find(unit => unit.id === targetId)
      if (!target || !target.isAlive) continue
      const base = skill
        ? Math.max(8, Math.floor(actor.stats.attack * (skill.effects[0]?.scaling ?? 1) + (skill.effects[0]?.baseValue ?? 0) - target.stats.defense * 0.55))
        : Math.max(5, Math.floor(actor.stats.attack * 1.05 - target.stats.defense * 0.55))
      const isCrit = Math.random() < actor.stats.critRate
      hits.push({
        actorId: actor.id,
        targetId: target.id,
        amount: Math.floor(base * (isCrit ? actor.stats.critDamage : 1)),
        isCrit
      })
    }
    return hits
  }

  applyCommand(command: BattleRuntimeCommand, hits: BattleRuntimeHit[]) {
    const actor = this.units.find(unit => unit.id === command.actorId)
    if (!actor) return
    const skill = command.skillId ? getSkillById(command.skillId) : null
    if (skill) {
      actor.stats.currentMp = Math.max(0, actor.stats.currentMp - skill.mpCost)
      this.spiritFire = Math.max(0, this.spiritFire - this.getSpiritFireCost(skill))
    }
    for (const hit of hits) {
      const target = this.units.find(unit => unit.id === hit.targetId)
      if (!target || !target.isAlive) continue
      target.stats.currentHp = Math.max(0, target.stats.currentHp - hit.amount)
      if (target.stats.currentHp <= 0) {
        target.isAlive = false
        this.addLog(`${target.name}被击败。`, 'major')
      }
    }
    const actionName = skill?.name ?? '普通攻击'
    this.addLog(`${actor.name}施展${actionName}，造成${hits.reduce((sum, hit) => sum + hit.amount, 0)}点伤害。`, skill ? 'major' : 'normal')
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
}
