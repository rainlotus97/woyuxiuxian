import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BattleRuntime, type BattleRuntimeSnapshot } from '@/game/battle/battleRuntime'
import { gameEvents, type BattleSceneCommand } from '@/game/engine/gameEvents'
import { usePlayerStore } from '@/stores/playerStore'
import { useCompanionStore } from '@/stores/companionStore'
import { useSectStore } from '@/stores/sectStore'
import { useMapStore } from '@/stores/mapStore'
import { useWorldStore } from '@/stores/worldStore'
import { createUnit, type Unit } from '@/types/unit'
import { getSkillsByIds } from '@/types/skill'
import { getAreaById, ENEMIES, rollDrops, rollReward, DIFFICULTY_CONFIG, type AreaDefinition } from '@/types/adventure'

interface BattleSkillOption {
  id: string
  name: string
  icon: string
  cost: number
}

interface BattleTargetOption {
  id: string
  name: string
  icon: string
}

export function useBattleSession() {
  const router = useRouter()
  const route = useRoute()
  const playerStore = usePlayerStore()
  const companionStore = useCompanionStore()
  const sectStore = useSectStore()
  const mapStore = useMapStore()
  const worldStore = useWorldStore()

  const battleRuntime = ref<BattleRuntime | null>(null)
  const runtimeSnapshot = ref<BattleRuntimeSnapshot | null>(null)
  const currentArea = ref<AreaDefinition | null>(null)
  const selectedTargetId = ref<string | null>(null)
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
  const commandTimers = new Set<number>()

  const sortedUnits = computed(() => [...(runtimeSnapshot.value?.units || [])].sort((a, b) => b.actionGauge - a.actionGauge))
  const playerActor = computed(() => {
    if (!battleRuntime.value || !runtimeSnapshot.value?.currentActorId) return null
    return battleRuntime.value.units.find(unit => unit.id === runtimeSnapshot.value?.currentActorId && unit.side === 'ally') ?? null
  })
  const isPlayerSelecting = computed(() => Boolean(playerActor.value))
  const targetableEnemies = computed<BattleTargetOption[]>(() => (battleRuntime.value?.aliveEnemies || []).map(target => ({
    id: target.id,
    name: target.name,
    icon: target.icon
  })))
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
        cost: battleRuntime.value?.getSpiritFireCost(skill) || 1
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

  function cleanName(name: string) {
    return name.replace('[BOSS]', '').replace('[精英]', '')
  }

  function createAllies(): Unit[] {
    playerStore.baseStats.currentHp = playerStore.totalStats.maxHp
    playerStore.baseStats.currentMp = playerStore.totalStats.maxMp
    const allies: Unit[] = [playerStore.toBattleUnit()]
    for (const { owned, definition, stats } of companionStore.equippedCompanions) {
      if (!definition) continue
      allies.push(createUnit({
        id: `companion_${owned.definitionId}`,
        name: definition.name,
        type: 'companion',
        element: definition.element,
        realm: playerStore.realm,
        quality: definition.quality === '凡品' ? '凡品' : definition.quality === '灵品' ? '玄品' : definition.quality === '仙品' ? '仙品' : '神品',
        level: owned.level,
        icon: definition.icon,
        stats: {
          maxHp: stats.maxHp,
          currentHp: stats.maxHp,
          maxMp: stats.maxMp,
          currentMp: stats.maxMp,
          attack: stats.attack,
          defense: stats.defense,
          speed: stats.speed,
          critRate: stats.critRate,
          critDamage: stats.critDamage
        },
        skills: definition.skills || []
      }))
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
    battleRunId++
    worldStore.simulateOffline()
    battleRuntime.value = new BattleRuntime(createAllies(), createEnemies())
    refreshSnapshot()
    selectedTargetId.value = battleRuntime.value.aliveEnemies[0]?.id ?? null
    pendingRewards.value = calculateRewards()
  }

  function refreshSnapshot() {
    if (disposed) return
    runtimeSnapshot.value = battleRuntime.value?.snapshot() ?? null
    if (runtimeSnapshot.value && sceneReady) {
      gameEvents.emit('battle:snapshot', runtimeSnapshot.value)
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
      refreshSnapshot()
      maybeAutoAct()
    }
    if (runtime.phase !== 'ended') {
      frameId = requestAnimationFrame(loop)
    } else {
      gameEvents.emit('battle:ended', { result: runtime.result || 'defeat' })
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
    const targetId = selectedTargetId.value || targetableEnemies.value[0]?.id
    if (!actor || !targetId) return
    executeCommand({ type: 'attack', actorId: actor.id, targetIds: [targetId] })
  }

  function playerSkill(skillId: string) {
    const actor = playerActor.value
    const targetId = selectedTargetId.value || targetableEnemies.value[0]?.id
    if (!actor || !targetId) return
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
    const hits = runtime.previewCommand(command)
    if (sceneReady) {
      gameEvents.emit('battle:play-command', command)
    }
    const timer = window.setTimeout(() => {
      commandTimers.delete(timer)
      if (disposed || battleRunId !== runId || battleRuntime.value !== runtime) {
        executing = false
        return
      }
      for (const hit of hits) {
        if (sceneReady) {
          gameEvents.emit('battle:damage-number', hit)
        }
      }
      runtime.applyCommand(command, hits)
      selectedTargetId.value = runtime.aliveEnemies[0]?.id ?? null
      executing = false
      refreshSnapshot()
      maybeAutoAct()
    }, command.type === 'skill' ? 560 : 420)
    commandTimers.add(timer)
  }

  function bindScene() {
    unsubSceneReady = gameEvents.on('battle:scene-ready', () => {
      if (disposed) return
      sceneReady = true
      refreshSnapshot()
    })
  }

  function disposeSession() {
    disposed = true
    sceneReady = false
    battleRunId++
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

  function claimAndExit() {
    const result = battleRuntime.value?.result
    if (result === 'victory') {
      playerStore.addCultivation(pendingRewards.value.cultivation)
      playerStore.addGold(pendingRewards.value.gold)
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
    router.push('/game/adventure')
  }

  function exitBattle() {
    battleRuntime.value?.flee()
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
    selectedTargetId,
    setSelectedTargetId: (targetId: string) => { selectedTargetId.value = targetId },
    sortedUnits,
    targetableEnemies,
    weatherLabel,
    worldStore
  }
}
