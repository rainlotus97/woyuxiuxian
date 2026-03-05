import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Unit } from '@/types/unit'
import type { BattlePhase, BattleAction, BattleActionType, DamageResult, BattleLogEntry, BattleRewards } from '@/types/battle'
import type { Skill, SkillEffect } from '@/types/skill'
import { useDamageCalculator } from '@/composables/useDamageCalculator'
import { sfxAttack, sfxCastPrepare, sfxVictory, sfxDefeat } from '@/composables/useAudio'
import { getSkillById, getSkillsByIds, isSkillAvailable } from '@/types/skill'

// 战斗模式
export type BattleMode = 'pve' | 'pvp'

// 敌人行动模式
export type EnemyActionMode = 'auto' | 'manual'

// 战斗速度
export type BattleSpeed = 1 | 2 | 3

export const useBattleStore = defineStore('battle', () => {
  // ====== 状态 ======
  const phase = ref<BattlePhase>('preparing')
  const turnCount = ref(0)
  const battleMode = ref<BattleMode>('pve') // 默认 PvE 模式

  const allyUnits = ref<Unit[]>([])
  const enemyUnits = ref<Unit[]>([])

  const speedBar = ref<Map<string, number>>(new Map())
  const currentActingUnitId = ref<string | null>(null)

  const actionQueue = ref<BattleAction[]>([])

  const selectedAction = ref<BattleActionType | null>(null)
  const selectedSkillId = ref<string | null>(null)
  const selectedTargetIds = ref<string[]>([])

  const battleLog = ref<BattleLogEntry[]>([])
  const result = ref<'victory' | 'defeat' | 'fled' | null>(null)
  const rewards = ref<BattleRewards | null>(null)

  // 自动战斗模式（玩家手动控制开关）- 从 localStorage 恢复
  const autoBattle = ref(localStorage.getItem('autoBattle') === 'true')

  // 战斗速度 - 从 localStorage 恢复
  const savedSpeed = localStorage.getItem('battleSpeed')
  const battleSpeed = ref<BattleSpeed>(
    savedSpeed === '2' ? 2 : savedSpeed === '3' ? 3 : 1
  )

  // 敌人行动模式：auto=自动AI, manual=手动（PVP时对方玩家控制）
  const enemyActionMode = ref<EnemyActionMode>('auto')

  // PVP模式下，等待敌方玩家输入的状态
  const waitingForEnemyPlayerInput = ref(false)

  // ====== 计算属性 ======
  const allUnits = computed(() => [...allyUnits.value, ...enemyUnits.value])

  const aliveAllies = computed(() => allyUnits.value.filter(u => u.isAlive))
  const aliveEnemies = computed(() => enemyUnits.value.filter(u => u.isAlive))

  const currentActingUnit = computed(() =>
    allUnits.value.find(u => u.id === currentActingUnitId.value)
  )

  // 判断当前是否是玩家可控单位的回合
  const isPlayerTurn = computed(() => {
    const unit = currentActingUnit.value
    return unit && (unit.type === 'protagonist' || unit.type === 'companion' || unit.type === 'pet')
  })

  // 战斗是否结束（基础判断，需在其他计算属性之前定义）
  const battleEnded = computed(() =>
    phase.value === 'ended' ||
    aliveAllies.value.length === 0 ||
    aliveEnemies.value.length === 0
  )

  // 判断当前行动单位是否需要等待玩家输入
  // PvE: 玩家单位需要等待，敌人自动行动
  // PvP: 所有玩家控制的角色都需要等待
  const waitingForPlayerInput = computed(() => {
    if (battleEnded.value) return false
    if (!isPlayerTurn.value) return false
    if (autoBattle.value) return false // 自动战斗模式不等待
    return true
  })

  // 判断敌人是否应该自动行动
  const shouldEnemyAutoAct = computed(() => {
    // PvE 模式下敌人总是自动行动
    if (battleMode.value === 'pve') return true
    // PvP 模式下，根据 enemyActionMode 决定
    // auto: 敌人自动行动（可用于测试或AI对手）
    // manual: 等待敌方玩家手动操作（需要UI支持）
    // 但如果开启了自动战斗，敌人也应该自动行动
    if (autoBattle.value) return true
    return enemyActionMode.value === 'auto'
  })

  // 判断是否是敌人单位（包括PVP中的对方玩家控制单位）
  const isEnemyTurn = computed(() => {
    const unit = currentActingUnit.value
    return unit && unit.type === 'enemy'
  })

  // ====== 伤害计算器 ======
  const { calculateDamage } = useDamageCalculator()

  // ====== 动作 ======

  function initBattle(allies: Unit[], enemies: Unit[]) {
    allyUnits.value = allies.map(u => ({ ...u, isAlive: true }))
    enemyUnits.value = enemies.map(u => ({ ...u, isAlive: true }))

    // 初始化速度条，随机初始进度增加变化
    speedBar.value = new Map()
    allUnits.value.forEach(unit => {
      speedBar.value.set(unit.id, Math.random() * 30) // 0-30% 随机初始进度
    })

    phase.value = 'speed_bar'
    turnCount.value = 1
    battleLog.value = []
    result.value = null
    rewards.value = null
    selectedAction.value = null
    selectedSkillId.value = null
    selectedTargetIds.value = []
    currentActingUnitId.value = null
    autoBattle.value = false
    enemyActionMode.value = 'auto'
    waitingForEnemyPlayerInput.value = false

    addBattleLog({
      actorName: '系统',
      action: '战斗开始'
    })
  }

  /**
   * 敌人AI：选择最佳技能
   * @param enemy 敌人单位
   * @returns 选中的技能ID，或 null 表示使用普通攻击
   */
  function enemySelectSkill(enemy: Unit): string | null {
    // 获取敌人可用的技能列表
    const enemySkills = enemy.skills?.length > 0
      ? getSkillsByIds(enemy.skills)
      : []

    // 过滤出当前可用的技能（MP足够、冷却完成）
    const availableSkills = enemySkills.filter(skill => isSkillAvailable(skill, enemy))

    if (availableSkills.length === 0) {
      return null // 没有可用技能，使用普通攻击
    }

    // AI策略：根据情况选择技能
    // 1. 如果HP低于30%，有治疗技能则优先使用
    const hpRatio = enemy.stats.currentHp / enemy.stats.maxHp
    if (hpRatio < 0.3) {
      const healSkill = availableSkills.find(s =>
        s.effects.some(e => e.type === 'heal')
      )
      if (healSkill) return healSkill.id
    }

    // 2. 如果MP充足（>50%），有40%概率使用技能
    const mpRatio = enemy.stats.currentMp / enemy.stats.maxMp
    if (mpRatio > 0.5 && Math.random() < 0.4) {
      // 优先选择伤害技能
      const damageSkills = availableSkills.filter(s =>
        s.effects.some(e => e.type === 'damage')
      )
      if (damageSkills.length > 0) {
        // 随机选择一个伤害技能
        return damageSkills[Math.floor(Math.random() * damageSkills.length)]!.id
      }
    }

    // 3. 30%概率随机使用可用技能
    if (Math.random() < 0.3) {
      return availableSkills[Math.floor(Math.random() * availableSkills.length)]!.id
    }

    // 默认使用普通攻击
    return null
  }

  /**
   * 敌人AI：选择目标
   * @param enemy 敌人单位
   * @param skill 技能（可选）
   * @returns 目标ID数组
   */
  function enemySelectTarget(enemy: Unit, skill: Skill | null): string[] {
    if (!skill) {
      // 普通攻击：随机选择一个存活的玩家方单位
      const targets = aliveAllies.value
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)]
        return target ? [target.id] : []
      }
      return []
    }

    // 根据技能目标类型选择目标
    const targetType = skill.effects[0]?.targetType

    switch (targetType) {
      case 'single_enemy': {
        const targets = aliveAllies.value
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)]
          return target ? [target.id] : []
        }
        return []
      }
      case 'all_enemies':
        return aliveAllies.value.map(a => a.id)
      case 'self':
        return [enemy.id]
      case 'single_ally': {
        // 敌人治疗/增益：优先治疗血量最低的敌人
        const allies = aliveEnemies.value
        if (allies.length > 0) {
          const lowestHpAlly = allies.reduce((min, u) =>
            u.stats.currentHp / u.stats.maxHp < min.stats.currentHp / min.stats.maxHp ? u : min
          )
          return [lowestHpAlly.id]
        }
        return [enemy.id]
      }
      case 'all_allies':
        return aliveEnemies.value.map(e => e.id)
      default:
        return []
    }
  }

  /**
   * 执行敌人回合（自动AI）
   * 在 BattleView 中调用，也可用于自动战斗
   */
  function executeEnemyAutoAction(enemy: Unit): BattleAction | null {
    if (!enemy.isAlive) return null

    // 选择技能
    const skillId = enemySelectSkill(enemy)
    const skill = skillId ? getSkillById(skillId) ?? null : null

    // 选择目标
    const targetIds = enemySelectTarget(enemy, skill)

    if (targetIds.length === 0) return null

    // 构建行动
    const action: BattleAction = {
      type: skill ? 'skill' : 'attack',
      actorId: enemy.id,
      targetIds,
      skillId: skill?.id
    }

    // 执行行动
    selectAction(action.type)
    if (skill) {
      selectSkill(skill.id)
    }
    selectTarget(targetIds[0]!)
    confirmAction()

    return action
  }

  /**
   * 设置敌人行动模式（用于PVP切换）
   */
  function setEnemyActionMode(mode: EnemyActionMode) {
    enemyActionMode.value = mode
  }

  /**
   * 设置战斗模式
   */
  function setBattleMode(mode: BattleMode) {
    battleMode.value = mode
    // PVP模式下默认敌人使用自动AI（方便测试）
    // 后续可以切换为 manual 让敌方玩家手动操作
    if (mode === 'pvp') {
      enemyActionMode.value = 'auto'  // 改为默认自动，方便测试
    } else {
      enemyActionMode.value = 'auto'
    }
  }

  function updateSpeedBar(deltaTime: number) {
    if (phase.value !== 'speed_bar' || battleEnded.value) return

    speedBar.value.forEach((progress, unitId) => {
      const unit = allUnits.value.find(u => u.id === unitId)
      if (unit && unit.isAlive) {
        const newProgress = Math.min(100, progress + (unit.stats.speed * deltaTime / 100))
        speedBar.value.set(unitId, newProgress)
      }
    })
  }

  function getUnitReadyToAct(): string | null {
    if (currentActingUnitId.value) return null // 已有单位在行动

    // 按速度排序，确保高速单位优先行动
    const readyUnits: { unitId: string; speed: number }[] = []

    for (const [unitId, progress] of speedBar.value) {
      if (progress >= 100) {
        const unit = allUnits.value.find(u => u.id === unitId)
        if (unit?.isAlive) {
          readyUnits.push({ unitId, speed: unit.stats.speed })
        }
      }
    }

    if (readyUnits.length === 0) return null

    // 按速度降序排序，速度高的先行动
    readyUnits.sort((a, b) => b.speed - a.speed)
    return readyUnits[0]!.unitId
  }

  function consumeUnitAction(unitId: string) {
    speedBar.value.set(unitId, 0)
    currentActingUnitId.value = unitId

    const unit = allUnits.value.find(u => u.id === unitId)
    if (unit?.type === 'enemy') {
      phase.value = 'enemy_turn'
    } else {
      phase.value = 'select_action'
    }
  }

  function selectAction(action: BattleActionType) {
    selectedAction.value = action
    selectedTargetIds.value = []
    selectedSkillId.value = null

    if (action === 'attack') {
      phase.value = 'select_target'
    } else if (action === 'skill') {
      // 显示技能选择面板
      phase.value = 'select_action'
    } else if (action === 'defend') {
      // 立即执行防御
      executeDefend()
    } else if (action === 'flee') {
      // 尝试逃跑
      executeFlee()
    }
  }

  function selectTarget(targetId: string) {
    // 根据技能类型决定目标选择逻辑
    const skill = selectedSkillId.value ? getSkillById(selectedSkillId.value) : null
    const targetType = skill?.effects[0]?.targetType || 'single_enemy'

    if (targetType === 'all_enemies' || targetType === 'all_allies') {
      // 群体技能自动选择所有目标
      if (targetType === 'all_enemies') {
        selectedTargetIds.value = aliveEnemies.value.map(e => e.id)
      } else {
        selectedTargetIds.value = aliveAllies.value.map(a => a.id)
      }
    } else {
      // 单体目标切换
      const index = selectedTargetIds.value.indexOf(targetId)
      if (index > -1) {
        selectedTargetIds.value.splice(index, 1)
      } else {
        selectedTargetIds.value = [targetId] // 单选模式
      }
    }
  }

  function selectSkill(skillId: string) {
    const skill = getSkillById(skillId)
    if (!skill) return

    // 检查 MP 是否足够
    const unit = currentActingUnit.value
    if (unit && unit.stats.currentMp < skill.mpCost) {
      addBattleLog({
        actorName: unit.name,
        action: '灵力不足',
        result: '无法施放'
      })
      return
    }

    selectedSkillId.value = skillId

    // 根据技能目标类型自动选择或等待手动选择
    const targetType = skill.effects[0]?.targetType

    if (targetType === 'self') {
      selectedTargetIds.value = [unit!.id]
      phase.value = 'select_target'
    } else if (targetType === 'all_enemies') {
      selectedTargetIds.value = aliveEnemies.value.map(e => e.id)
      phase.value = 'select_target'
    } else if (targetType === 'all_allies') {
      selectedTargetIds.value = aliveAllies.value.map(a => a.id)
      phase.value = 'select_target'
    } else {
      phase.value = 'select_target'
    }
  }

  function confirmAction() {
    if (!currentActingUnitId.value || !selectedAction.value) return

    const action: BattleAction = {
      type: selectedAction.value,
      actorId: currentActingUnitId.value,
      targetIds: [...selectedTargetIds.value],
      skillId: selectedSkillId.value || undefined
    }

    actionQueue.value.push(action)
    executeAction(action)
  }

  function executeAction(action: BattleAction) {
    phase.value = 'executing'

    const actor = allUnits.value.find(u => u.id === action.actorId)
    if (!actor) {
      finishTurn()
      return
    }

    // 根据行动类型执行
    switch (action.type) {
      case 'attack':
        executeAttack(actor, action.targetIds)
        break
      case 'skill':
        executeSkill(actor, action)
        break
      case 'defend':
        executeDefend()
        break
      case 'flee':
        executeFlee()
        return // 逃跑会自己处理回合结束
    }

    // 延迟结束回合，让玩家看到动画
    setTimeout(() => {
      finishTurn()
    }, 300)
  }

  function executeAttack(actor: Unit, targetIds: string[]) {
    // 播放攻击音效
    sfxAttack()

    for (const targetId of targetIds) {
      const target = allUnits.value.find(u => u.id === targetId)
      if (target && target.isAlive) {
        // 计算伤害
        const damageResult = calculateDamage(actor, target)

        // 应用伤害
        applyDamageResult(damageResult)

        // 添加战斗日志
        addBattleLog({
          actorName: actor.name,
          action: '普通攻击',
          targetName: target.name,
          result: `${damageResult.damage}${damageResult.isCrit ? ' (暴击!)' : ''}${damageResult.isEffective ? ' (克制!)' : ''}`
        })
      }
    }

    // 检查战斗结束
    if (checkBattleEnd()) return
  }

  function executeSkill(actor: Unit, action: BattleAction) {
    if (!action.skillId) return

    const skill = getSkillById(action.skillId)
    if (!skill) return

    // 检查 MP 消耗
    if (actor.stats.currentMp < skill.mpCost) {
      addBattleLog({
        actorName: actor.name,
        action: '灵力不足',
        result: '无法施放'
      })
      return
    }

    // 消耗 MP
    actor.stats.currentMp -= skill.mpCost

    // 播放技能音效
    sfxCastPrepare()

    // 执行技能效果
    for (const targetId of action.targetIds) {
      const target = allUnits.value.find(u => u.id === targetId)
      if (!target || !target.isAlive) continue

      for (const effect of skill.effects) {
        applySkillEffect(actor, target, effect, skill)
      }
    }

    // 设置技能冷却
    skill.currentCooldown = skill.cooldown

    // 添加战斗日志
    const targetNames = action.targetIds.length > 1
      ? '全体'
      : allUnits.value.find(u => u.id === action.targetIds[0])?.name

    addBattleLog({
      actorName: actor.name,
      action: skill.name,
      targetName: targetNames,
      result: '施放成功'
    })

    // 检查战斗结束
    checkBattleEnd()
  }

  function applySkillEffect(actor: Unit, target: Unit, effect: SkillEffect, skill: Skill) {
    if (effect.type === 'damage') {
      const damageResult = calculateDamage(actor, target, skill)
      applyDamageResult(damageResult)
    } else if (effect.type === 'heal') {
      const healAmount = calculateHealing(actor, target, effect)
      target.stats.currentHp = Math.min(
        target.stats.maxHp,
        target.stats.currentHp + healAmount
      )
      addBattleLog({
        actorName: actor.name,
        action: skill.name,
        targetName: target.name,
        result: `+${healAmount} HP`
      })
    } else if (effect.type === 'buff' && effect.statusEffect) {
      target.statusEffects.push({
        type: effect.statusEffect.type,
        duration: effect.statusEffect.duration,
        value: effect.statusEffect.value,
        sourceId: actor.id
      })
      addBattleLog({
        actorName: actor.name,
        action: skill.name,
        targetName: target.name,
        result: '获得增益'
      })
    } else if (effect.type === 'debuff' && effect.statusEffect) {
      if (Math.random() < effect.statusEffect.chance) {
        target.statusEffects.push({
          type: effect.statusEffect.type,
          duration: effect.statusEffect.duration,
          value: effect.statusEffect.value,
          sourceId: actor.id
        })
        addBattleLog({
          actorName: actor.name,
          action: skill.name,
          targetName: target.name,
          result: '获得减益'
        })
      }
    }
  }

  function executeDefend() {
    const unit = currentActingUnit.value
    if (!unit) return

    // 添加防御增益
    unit.statusEffects.push({
      type: 'buff_def',
      duration: 1,
      value: 0.5 // 50% 减伤
    })

    addBattleLog({
      actorName: unit.name,
      action: '防御',
      result: '减伤50%'
    })

    finishTurn()
  }

  function executeFlee() {
    const avgAllySpeed = aliveAllies.value.length > 0
      ? aliveAllies.value.reduce((sum, u) => sum + u.stats.speed, 0) / aliveAllies.value.length
      : 0
    const avgEnemySpeed = aliveEnemies.value.length > 0
      ? aliveEnemies.value.reduce((sum, u) => sum + u.stats.speed, 0) / aliveEnemies.value.length
      : 0

    const fleeChance = 0.3 + (avgAllySpeed - avgEnemySpeed) * 0.01

    if (Math.random() < fleeChance) {
      result.value = 'fled'
      phase.value = 'ended'
      addBattleLog({
        actorName: '我方',
        action: '逃跑',
        result: '成功'
      })
    } else {
      addBattleLog({
        actorName: '我方',
        action: '逃跑',
        result: '失败'
      })
      finishTurn()
    }
  }

  function applyDamageResult(damageResult: DamageResult) {
    const target = allUnits.value.find(u => u.id === damageResult.targetId)
    if (target) {
      target.stats.currentHp = Math.max(0, target.stats.currentHp - damageResult.damage)
      if (target.stats.currentHp <= 0) {
        target.isAlive = false
        addBattleLog({
          actorName: target.name,
          action: '被击败'
        })
      }
    }
  }

  function calculateHealing(_healer: Unit, target: Unit, effect: SkillEffect): number {
    if (effect.type !== 'heal') return 0
    const healAmount = effect.baseValue
    return Math.min(healAmount, target.stats.maxHp - target.stats.currentHp)
  }

  function checkBattleEnd(): boolean {
    if (aliveAllies.value.length === 0) {
      result.value = 'defeat'
      phase.value = 'ended'
      sfxDefeat()
      addBattleLog({
        actorName: '系统',
        action: '战斗失败'
      })
      return true
    } else if (aliveEnemies.value.length === 0) {
      result.value = 'victory'
      phase.value = 'ended'
      sfxVictory()
      calculateRewards()
      addBattleLog({
        actorName: '系统',
        action: '战斗胜利'
      })
      return true
    }
    return false
  }

  function calculateRewards() {
    const totalCultivation = enemyUnits.value.reduce((sum, e) => sum + (e.level * 10), 0)
    const totalGold = enemyUnits.value.reduce((sum, e) => sum + (e.level * 5), 0)

    rewards.value = {
      cultivation: totalCultivation,
      gold: totalGold,
      items: []
    }
  }

  function finishTurn() {
    // 处理回合结束时的状态效果
    const unit = currentActingUnit.value
    if (unit) {
      unit.statusEffects = unit.statusEffects.filter(effect => {
        effect.duration--
        return effect.duration > 0
      })
    }

    // 重置状态
    currentActingUnitId.value = null
    selectedAction.value = null
    selectedSkillId.value = null
    selectedTargetIds.value = []

    // 回到速度条阶段
    if (!battleEnded.value) {
      phase.value = 'speed_bar'
      turnCount.value++
    }
  }

  function addBattleLog(entry: { actorName: string; action: string; targetName?: string; result?: string }) {
    battleLog.value.push({
      turn: turnCount.value,
      actorName: entry.actorName,
      action: entry.action,
      targetName: entry.targetName,
      result: entry.result,
      timestamp: Date.now()
    })

    // 限制日志数量
    if (battleLog.value.length > 50) {
      battleLog.value = battleLog.value.slice(-30)
    }
  }

  function toggleAutoBattle() {
    autoBattle.value = !autoBattle.value
    // 持久化到 localStorage
    localStorage.setItem('autoBattle', String(autoBattle.value))
  }

  // 切换战斗速度
  function toggleBattleSpeed() {
    const speeds: BattleSpeed[] = [1, 2, 3]
    const currentIndex = speeds.indexOf(battleSpeed.value)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    if (nextSpeed !== undefined) {
      battleSpeed.value = nextSpeed
      localStorage.setItem('battleSpeed', String(battleSpeed.value))
    }
  }

  // 设置战斗速度
  function setBattleSpeed(speed: BattleSpeed) {
    battleSpeed.value = speed
    localStorage.setItem('battleSpeed', String(speed))
  }

  function reset() {
    phase.value = 'preparing'
    turnCount.value = 0
    allyUnits.value = []
    enemyUnits.value = []
    speedBar.value = new Map()
    currentActingUnitId.value = null
    actionQueue.value = []
    selectedAction.value = null
    selectedSkillId.value = null
    selectedTargetIds.value = []
    battleLog.value = []
    result.value = null
    rewards.value = null
    autoBattle.value = false
  }

  return {
    // 状态
    phase,
    turnCount,
    allyUnits,
    enemyUnits,
    speedBar,
    currentActingUnitId,
    actionQueue,
    selectedAction,
    selectedSkillId,
    selectedTargetIds,
    battleLog,
    result,
    rewards,
    autoBattle,
    enemyActionMode,
    waitingForEnemyPlayerInput,

    // 计算属性
    allUnits,
    aliveAllies,
    aliveEnemies,
    currentActingUnit,
    isPlayerTurn,
    isEnemyTurn,
    battleEnded,
    waitingForPlayerInput,
    shouldEnemyAutoAct,
    battleMode,

    // 动作
    initBattle,
    updateSpeedBar,
    getUnitReadyToAct,
    consumeUnitAction,
    selectAction,
    selectTarget,
    selectSkill,
    confirmAction,
    executeAction,
    applyDamageResult,
    checkBattleEnd,
    finishTurn,
    toggleAutoBattle,
    reset,

    // 敌人AI相关
    executeEnemyAutoAction,
    setEnemyActionMode,
    setBattleMode,

    // 战斗速度
    battleSpeed,
    toggleBattleSpeed,
    setBattleSpeed
  }
})
