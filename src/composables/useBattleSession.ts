import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BattleRuntime, type BattleRuntimeSnapshot } from '@/game/battle/battleRuntime'
import {
  clearBattleSceneReady,
  gameEvents,
  isBattleSceneReady,
  setActiveBattleInstanceId,
  type BattleSceneCommand
} from '@/game/engine/gameEvents'
import { usePlayerStore } from '@/stores/playerStore'
import { useCompanionStore } from '@/stores/companionStore'
import { usePetStore } from '@/stores/petStore'
import { useSectStore } from '@/stores/sectStore'
import { useMapStore } from '@/stores/mapStore'
import { useWorldStore } from '@/stores/worldStore'
import { DIFFICULTY_CONFIG, ENEMIES, getBattleArenaIdForArea } from '@/game/battle/config'
import { createUnit, type Unit } from '@/types/unit'
import { getSkillById, getSkillsByIds } from '@/types/skill'
import { getAreaById, rollDrops, rollReward, type AreaDefinition } from '@/types/adventure'
import { getManualTargetType, getSelectableTargets, type SelectableBattleTarget } from '@/game/battle/targeting'
import { buildCompanionBattleUnit, buildPetBattleUnit } from '@/game/battle/allyRosterFactory'
import {
  completeRouteGameplaySession,
  getRouteGameplaySession
} from '@/story/runtime/routeGameplaySession'
import type { GameplayResult } from '@/story/types'

interface BattleSkillOption {
  id: string
  name: string
  icon: string
  cost: number
  targetType: string
}

interface BattleTargetOption {
  id: string
  name: string
  icon: string
  side: 'ally' | 'enemy'
}

export function useBattleSession() {
  const router = useRouter()
  const route = useRoute()
  const playerStore = usePlayerStore()
  const companionStore = useCompanionStore()
  const petStore = usePetStore()
  const sectStore = useSectStore()
  const mapStore = useMapStore()
  const worldStore = useWorldStore()

  const battleRuntime = ref<BattleRuntime | null>(null)
  const runtimeSnapshot = ref<BattleRuntimeSnapshot | null>(null)
  const currentArea = ref<AreaDefinition | null>(null)
  const selectedTargetId = ref<string | null>(null)
  const selectedSkillId = ref<string | null>(null)
  const autoBattle = ref(localStorage.getItem('autoBattle') === 'true')
  const battleSpeed = ref<1 | 2 | 3>(localStorage.getItem('battleSpeed') === '3' ? 3 : localStorage.getItem('battleSpeed') === '2' ? 2 : 1)
  const pendingRewards = ref({ cultivation: 0, gold: 0 })

  let frameId = 0
  let lastFrame = 0
  let executing = false
  let unsubSceneReady: (() => void) | null = null
  let disposed = false
  let sceneReady = false
  let battleRunId = 0
  let battleInstanceId = ''
  const commandTimers = new Set<number>()

  const sortedUnits = computed(() => [...(runtimeSnapshot.value?.units || [])].sort((a, b) => b.actionGauge - a.actionGauge))
  const playerActor = computed(() => {
    if (!battleRuntime.value || !runtimeSnapshot.value?.currentActorId) return null
    return battleRuntime.value.units.find(unit => unit.id === runtimeSnapshot.value?.currentActorId && unit.side === 'ally') ?? null
  })
  const isPlayerSelecting = computed(() => Boolean(playerActor.value))
  const playerSkills = computed<BattleSkillOption[]>(() => {
    const actor = playerActor.value
    if (!actor || !battleRuntime.value) return []
    return getSkillsByIds(actor.skills)
      .filter(skill => skill.category !== 'passive')
      .slice(0, 4)
      .map(skill => ({
        id: skill.id,
        name: skill.name,
        icon: skill.icon,
        cost: battleRuntime.value?.getSpiritFireCost(skill) || 1,
        targetType: skill.effects[0]?.targetType ?? 'single_enemy'
      }))
  })
  const activeSkill = computed(() => selectedSkillId.value ? getSkillById(selectedSkillId.value) ?? null : null)
  const targetHint = computed<string>(() => {
    const fallback = '单体敌方'
    const labels: Record<string, string> = {
      single_enemy: fallback,
      all_enemies: '敌方全体',
      single_ally: '单体友方',
      all_allies: '我方全体',
      self: '自身'
    }
    if (!selectedSkillId.value) return fallback
    return labels[activeSkill.value?.effects[0]?.targetType ?? 'single_enemy'] ?? fallback
  })
  const targetOptions = computed<BattleTargetOption[]>(() => {
    const runtime = battleRuntime.value
    const actor = playerActor.value
    if (!runtime || !actor) return []
    const options: SelectableBattleTarget[] = getSelectableTargets(
      actor,
      runtime.units,
      selectedSkillId.value ? 'skill' : 'attack',
      activeSkill.value
    )
    return options.map(option => ({
      id: option.id,
      name: option.name,
      icon: option.icon,
      side: option.side
    }))
  })
  const resultLabel = computed(() => {
    const result = runtimeSnapshot.value?.result
    if (result === 'victory') return '战斗胜利'
    if (result === 'defeat') return '战斗败北'
    if (result === 'fled') return '脱离战场'
    return '战斗中'
  })
  const weatherLabel = computed(() => {
    const labels = {
      clear: '天色清朗',
      rain: '细雨',
      storm: '雷雨',
      flood: '洪水',
      fire: '火灾',
      mist: '雾起'
    }
    return labels[worldStore.weather]
  })
  const currentActorName = computed(() => cleanName(playerActor.value?.name || '等待出手'))
  const activeRouteGameplaySession = computed(() => {
    const sessionId = route.query.storySessionId as string | undefined
    const session = getRouteGameplaySession()
    if (!session) return null
    if (sessionId && session.id !== sessionId) return null
    return session
  })

  function cleanName(name: string) {
    return name.replace('[BOSS]', '').replace('[精英]', '')
  }

  function startBattleInstance() {
    battleRunId++
    battleInstanceId = `battle-${battleRunId}`
    lastFrame = 0
    clearBattleSceneReady(battleInstanceId)
    setActiveBattleInstanceId(battleInstanceId)
  }

  startBattleInstance()

  function createAllies(): Unit[] {
    playerStore.baseStats.currentHp = playerStore.totalStats.maxHp
    playerStore.baseStats.currentMp = playerStore.totalStats.maxMp
    const allies: Unit[] = [playerStore.toBattleUnit()]
    for (const { owned, definition, stats } of companionStore.equippedCompanions) {
      if (!definition) continue
      allies.push(buildCompanionBattleUnit({ owned, definition, stats }, playerStore.realm))
    }
    if (petStore.equippedPet) {
      allies.push(buildPetBattleUnit(petStore.equippedPet))
    }
    return allies
  }

  function createEnemies(): Unit[] {
    const areaId = route.query.areaId as string | undefined
    const area = areaId ? getAreaById(areaId) : undefined
    if (area) currentArea.value = area
    const enemyIds = area?.enemies?.length ? area.enemies : ['wild_wolf', 'forest_spider']
    const difficulty = area ? DIFFICULTY_CONFIG[area.difficulty] : DIFFICULTY_CONFIG.easy
    const count = Math.min(3, difficulty.enemiesPerWave[0] || 2)
    const enemies: Unit[] = []
    for (let i = 0; i < count; i++) {
      const enemyDef = ENEMIES[enemyIds[i % enemyIds.length] || 'wild_wolf']
      if (!enemyDef) continue
      const isBoss = area?.difficulty === 'nightmare' && i === 1
      const multiplier = difficulty.enemyStatMult * (isBoss ? difficulty.bossStatMult || 2.5 : i === 1 ? 1.35 : 1)
      enemies.push(createUnit({
        id: `enemy_${i}`,
        name: isBoss ? `[BOSS]${enemyDef.name}` : i === 1 ? `[精英]${enemyDef.name}` : enemyDef.name,
        type: 'enemy',
        element: '金',
        realm: enemyDef.realm,
        realmLevel: enemyDef.realmLevel,
        quality: isBoss ? '仙品' : i === 1 ? '玄品' : '凡品',
        level: enemyDef.realmLevel + 2,
        icon: enemyDef.icon,
        stats: {
          maxHp: Math.floor(enemyDef.baseStats.maxHp * multiplier),
          currentHp: Math.floor(enemyDef.baseStats.maxHp * multiplier),
          maxMp: 50,
          currentMp: 50,
          attack: Math.floor(enemyDef.baseStats.attack * multiplier),
          defense: Math.floor(enemyDef.baseStats.defense * multiplier),
          speed: enemyDef.baseStats.speed,
          critRate: 0.05 + (isBoss ? 0.12 : 0),
          critDamage: 1.5 + (isBoss ? 0.4 : 0)
        },
        skills: enemyDef.skills
      }))
    }
    return enemies
  }

  function initBattle() {
    worldStore.simulateOffline()
    battleRuntime.value = new BattleRuntime(createAllies(), createEnemies())
    const arenaId = getBattleArenaIdForArea(currentArea.value?.id, currentArea.value?.difficulty ?? null)
    gameEvents.emit('battle:arena-theme', { arenaId, battleInstanceId })
    refreshSnapshot()
    selectedSkillId.value = null
    selectedTargetId.value = battleRuntime.value.aliveEnemies[0]?.id ?? null
    pendingRewards.value = calculateRewards()
  }

  function refreshSnapshot() {
    if (disposed) return
    runtimeSnapshot.value = battleRuntime.value?.snapshot() ?? null
    if (runtimeSnapshot.value && sceneReady && isBattleSceneReady(battleInstanceId)) {
      gameEvents.emit('battle:snapshot', { snapshot: runtimeSnapshot.value, battleInstanceId })
    }
  }

  function loop(now: number) {
    if (disposed) return
    const runtime = battleRuntime.value
    if (!runtime) return
    const delta = lastFrame ? now - lastFrame : 16
    lastFrame = now
    if (!executing) {
      runtime.tick(delta, battleSpeed.value)
      const turnContext = runtime.consumePendingTurnContext()
      for (const hit of turnContext.hits) {
        if (sceneReady && isBattleSceneReady(battleInstanceId)) {
          gameEvents.emit('battle:damage-number', { hit, battleInstanceId })
        }
      }
      refreshSnapshot()
      maybeAutoAct()
    }
    if (runtime.phase !== 'ended') {
      frameId = requestAnimationFrame(loop)
    } else {
      if (isBattleSceneReady(battleInstanceId)) {
        gameEvents.emit('battle:ended', { result: runtime.result || 'defeat', battleInstanceId })
      }
      refreshSnapshot()
    }
  }

  function maybeAutoAct() {
    const runtime = battleRuntime.value
    if (!runtime || runtime.phase !== 'selecting' || executing) return
    const actor = runtime.currentActor
    if (!actor) return
    if (actor.side === 'enemy' || autoBattle.value) {
      const command = runtime.createAutoCommand(actor.id)
      if (command) executeCommand(command)
    }
  }

  function playerAttack() {
    const actor = playerActor.value
    const targetId = selectedTargetId.value || targetOptions.value[0]?.id
    if (!actor || !targetId) return
    selectedSkillId.value = null
    executeCommand({ type: 'attack', actorId: actor.id, targetIds: [targetId] })
  }

  function playerSkill(skillId: string) {
    const actor = playerActor.value
    const skill = getSkillById(skillId)
    if (!actor || !skill) return
    selectedSkillId.value = skillId
    const manualTargetType = getManualTargetType('skill', skill)
    if (manualTargetType === 'single_ally') {
      const firstTargetId = targetOptions.value[0]?.id ?? null
      selectedTargetId.value = firstTargetId
      return
    }
    if (!manualTargetType) {
      executeCommand({ type: 'skill', actorId: actor.id, targetIds: [], skillId })
      return
    }
    const targetId = selectedTargetId.value || targetOptions.value[0]?.id
    if (!targetId) return
    executeCommand({ type: 'skill', actorId: actor.id, targetIds: [targetId], skillId })
  }

  function fleeBattle() {
    battleRuntime.value?.flee()
    refreshSnapshot()
  }

  function executeCommand(command: BattleSceneCommand) {
    const runtime = battleRuntime.value
    if (!runtime || executing || disposed) return
    executing = true
    const runId = battleRunId
    const resolved = runtime.resolveCommand(command)
    if (!resolved) {
      executing = false
      return
    }
    if (sceneReady && isBattleSceneReady(battleInstanceId)) {
      gameEvents.emit('battle:play-command', { command: resolved.command, battleInstanceId })
    }
    const timer = window.setTimeout(() => {
      commandTimers.delete(timer)
      if (disposed || battleRunId !== runId || battleRuntime.value !== runtime) {
        executing = false
        return
      }
      for (const hit of resolved.displayHits) {
        if (sceneReady && isBattleSceneReady(battleInstanceId)) {
          gameEvents.emit('battle:damage-number', { hit, battleInstanceId })
        }
      }
      runtime.applyResolvedCommand(resolved)
      selectedSkillId.value = null
      selectedTargetId.value = runtime.aliveEnemies[0]?.id ?? runtime.aliveAllies[0]?.id ?? null
      executing = false
      refreshSnapshot()
      maybeAutoAct()
    }, command.type === 'skill' ? 560 : 420)
    commandTimers.add(timer)
  }

  function bindScene() {
    unsubSceneReady = gameEvents.on('battle:scene-ready', payload => {
      if (disposed || payload.battleInstanceId !== battleInstanceId) return
      sceneReady = true
      const arenaId = getBattleArenaIdForArea(currentArea.value?.id, currentArea.value?.difficulty ?? null)
      gameEvents.emit('battle:arena-theme', { arenaId, battleInstanceId })
      refreshSnapshot()
    })
  }

  function disposeSession() {
    disposed = true
    sceneReady = false
    battleRunId++
    battleInstanceId = ''
    setActiveBattleInstanceId(null)
    executing = false
    if (frameId) {
      cancelAnimationFrame(frameId)
      frameId = 0
    }
    for (const timer of commandTimers) {
      window.clearTimeout(timer)
    }
    commandTimers.clear()
    unsubSceneReady?.()
    unsubSceneReady = null
    battleRuntime.value = null
  }

  function cycleAuto() {
    if (!autoBattle.value) {
      autoBattle.value = true
      battleSpeed.value = 1
    } else if (battleSpeed.value === 1) {
      battleSpeed.value = 2
    } else if (battleSpeed.value === 2) {
      battleSpeed.value = 3
    } else {
      battleSpeed.value = 1
      autoBattle.value = false
    }
    localStorage.setItem('autoBattle', String(autoBattle.value))
    localStorage.setItem('battleSpeed', String(battleSpeed.value))
    maybeAutoAct()
  }

  function calculateRewards() {
    const area = currentArea.value
    if (!area) return { cultivation: 40, gold: 20 }
    return {
      cultivation: rollReward(area.expReward),
      gold: rollReward(area.goldReward)
    }
  }

  function createStoryBattleResult(result: 'victory' | 'defeat' | 'fled'): GameplayResult {
    const routeSession = activeRouteGameplaySession.value
    return {
      success: result === 'victory',
      gameplayType: 'battle',
      targetId: routeSession?.trigger.targetId || String(route.query.storyBattleId || currentArea.value?.id || 'story_battle'),
      data: {
        battleResult: result,
        areaId: currentArea.value?.id || null,
        mapAreaId: (route.query.mapAreaId as string | undefined) || null,
        rewards: result === 'victory' ? { ...pendingRewards.value } : { cultivation: 0, gold: 0 }
      }
    }
  }

  function finishStoryBattle(result: 'victory' | 'defeat' | 'fled') {
    const routeSession = activeRouteGameplaySession.value
    if (!routeSession) {
      router.push('/game/adventure')
      return
    }

    completeRouteGameplaySession(routeSession.id, createStoryBattleResult(result))
    router.push(routeSession.returnPath)
  }

  function claimAndExit() {
    const result = battleRuntime.value?.result
    if (result === 'victory') {
      playerStore.addCultivation(pendingRewards.value.cultivation)
      playerStore.addGold(pendingRewards.value.gold)
      if (petStore.equippedPet) {
        petStore.addPetExp(petStore.equippedPet.owned.definitionId, Math.max(12, Math.floor(pendingRewards.value.cultivation * 0.18)))
        petStore.addIntimacy(petStore.equippedPet.owned.definitionId, 2)
      }
      if (currentArea.value) {
        sectStore.updateTaskProgress('battle', 'monster')
        sectStore.updateTaskProgress('explore', currentArea.value.id)
        const drops = rollDrops(currentArea.value.drops)
        for (const drop of drops) {
          playerStore.addToInventory({
            id: `drop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: drop.item.name,
            icon: drop.item.icon,
            type: drop.item.type === 'equipment' ? 'equipment' : 'material',
            quality: drop.item.quality,
            quantity: drop.quantity,
            description: drop.item.description
          })
        }
        playerStore.clearArea(currentArea.value.id, 0, 3)
      }
      const mapAreaId = route.query.mapAreaId as string | undefined
      if (mapAreaId && !mapStore.isAreaConquered(mapAreaId)) {
        mapStore.conquerArea(mapAreaId)
      }
    }
    worldStore.advanceTick()
    if (activeRouteGameplaySession.value && result) {
      finishStoryBattle(result)
      return
    }
    router.push('/game/adventure')
  }

  function exitBattle() {
    battleRuntime.value?.flee()
    if (activeRouteGameplaySession.value) {
      finishStoryBattle('fled')
      return
    }
    router.push('/game/adventure')
  }

  onMounted(() => {
    disposed = false
    sceneReady = false
    bindScene()
    initBattle()
    frameId = requestAnimationFrame(loop)
  })

  onBeforeUnmount(() => {
    disposeSession()
  })

  return {
    autoBattle,
    battleRuntime,
    battleSpeed,
    claimAndExit,
    currentActorName,
    currentArea,
    cycleAuto,
    exitBattle,
    fleeBattle,
    isPlayerSelecting,
    pendingRewards,
    playerAttack,
    playerSkills,
    playerSkill,
    resultLabel,
    runtimeSnapshot,
    targetHint,
    targetOptions,
    selectedTargetId,
    selectedSkillId,
    setSelectedTargetId: (targetId: string) => {
      selectedTargetId.value = targetId
      const actor = playerActor.value
      const skill = activeSkill.value
      if (!actor || !skill || !selectedSkillId.value) return
      const manualTargetType = getManualTargetType('skill', skill)
      if (manualTargetType === 'single_ally') {
        executeCommand({ type: 'skill', actorId: actor.id, targetIds: [targetId], skillId: skill.id })
      }
    },
    sortedUnits,
    weatherLabel,
    worldStore
  }
}
