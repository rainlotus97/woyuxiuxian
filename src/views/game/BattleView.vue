<template>
  <div class="battle-page">
    <PhaserHost start-scene="BattleScene" />

    <div class="battle-hud top">
      <button class="icon-btn" @click="exitBattle">×</button>
      <div class="battle-title">
        <span class="eyebrow">{{ currentArea?.name || '遭遇战' }}</span>
        <strong>{{ runtimeSnapshot?.result ? resultLabel : `第 ${runtimeSnapshot?.turn || 1} 手` }}</strong>
      </div>
      <button class="speed-btn" :class="{ active: autoBattle }" @click="cycleAuto">
        {{ autoBattle ? `${battleSpeed}x 自动` : '手动' }}
      </button>
    </div>

    <div class="action-order" v-if="runtimeSnapshot">
      <div class="order-title">行动序列</div>
      <div
        v-for="unit in sortedUnits"
        :key="unit.id"
        class="order-row"
        :class="{ active: runtimeSnapshot.currentActorId === unit.id, enemy: unit.side === 'enemy' }"
      >
        <span>{{ unit.icon }}</span>
        <div class="order-meta">
          <b>{{ cleanName(unit.name) }}</b>
          <div class="gauge"><i :style="{ width: `${unit.actionGauge}%` }"></i></div>
        </div>
      </div>
    </div>

    <section class="world-strip">
      <div class="world-time">
        <b>{{ worldStore.currentTimeLabel }}</b>
        <span>{{ weatherLabel }}</span>
      </div>
      <p>{{ worldStore.visibleLogs[0]?.text || '天地静默，灵气在暗处流动。' }}</p>
    </section>

    <section v-if="runtimeSnapshot?.phase === 'selecting' && isPlayerSelecting" class="command-dock">
      <div class="dock-header">
        <div class="spirit-fire" v-if="runtimeSnapshot">
          <b>灵火</b>
          <span
            v-for="i in runtimeSnapshot.maxSpiritFire"
            :key="i"
            :class="{ lit: i <= runtimeSnapshot.spiritFire }"
          ></span>
        </div>
        <small>{{ cleanName(playerActor?.name || '等待出手') }}</small>
      </div>

      <div class="target-row">
        <button
          v-for="target in targetableEnemies"
          :key="target.id"
          class="target-chip"
          :class="{ selected: selectedTargetId === target.id }"
          @click="selectedTargetId = target.id"
        >
          {{ target.icon }} {{ cleanName(target.name) }}
        </button>
      </div>

      <div class="command-row">
        <button class="command attack" @click="playerAttack">
          <span>斩</span>
          普攻
        </button>
        <button
          v-for="skill in playerSkills"
          :key="skill.id"
          class="command skill"
          :disabled="battleRuntime ? battleRuntime.getSpiritFireCost(skill) > battleRuntime.spiritFire : true"
          @click="playerSkill(skill.id)"
        >
          <span>{{ skill.icon }}</span>
          {{ skill.name }}
          <small>{{ battleRuntime?.getSpiritFireCost(skill) || 1 }}火</small>
        </button>
        <button class="command flee" @click="fleeBattle">
          <span>退</span>
          脱战
        </button>
      </div>
    </section>

    <section v-else class="log-dock">
      <div class="dock-header passive" v-if="runtimeSnapshot">
        <div class="spirit-fire">
          <b>灵火</b>
          <span
            v-for="i in runtimeSnapshot.maxSpiritFire"
            :key="i"
            :class="{ lit: i <= runtimeSnapshot.spiritFire }"
          ></span>
        </div>
      </div>
      <div
        v-for="log in runtimeSnapshot?.logs || []"
        :key="log.id"
        class="battle-log"
        :class="log.severity"
      >
        {{ log.text }}
      </div>
    </section>

    <div v-if="runtimeSnapshot?.phase === 'ended'" class="result-panel">
      <div class="result-card">
        <span class="result-mark">{{ runtimeSnapshot.result === 'victory' ? '胜' : runtimeSnapshot.result === 'defeat' ? '败' : '退' }}</span>
        <h2>{{ resultLabel }}</h2>
        <p v-if="runtimeSnapshot.result === 'victory'">获得 {{ pendingRewards.cultivation }} 修为、{{ pendingRewards.gold }} 灵石。</p>
        <p v-else-if="runtimeSnapshot.result === 'defeat'">你被迫撤回，世界仍在继续流转。</p>
        <p v-else>你脱离了战场，没有获得战利品。</p>
        <button @click="claimAndExit">返回历练</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PhaserHost from '@/game/engine/PhaserHost.vue'
import { gameEvents, type BattleSceneCommand } from '@/game/engine/gameEvents'
import { BattleRuntime, type BattleRuntimeSnapshot } from '@/game/battle/battleRuntime'
import { usePlayerStore } from '@/stores/playerStore'
import { useCompanionStore } from '@/stores/companionStore'
import { useSectStore } from '@/stores/sectStore'
import { useMapStore } from '@/stores/mapStore'
import { useWorldStore } from '@/stores/worldStore'
import { createUnit, type Unit } from '@/types/unit'
import { getSkillsByIds } from '@/types/skill'
import { getAreaById, ENEMIES, rollDrops, rollReward, DIFFICULTY_CONFIG, type AreaDefinition } from '@/types/adventure'

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
const battleSpeed = ref<1 | 2 | 3>((localStorage.getItem('battleSpeed') === '3' ? 3 : localStorage.getItem('battleSpeed') === '2' ? 2 : 1))
const pendingRewards = ref({ cultivation: 0, gold: 0 })

let frameId = 0
let lastFrame = 0
let executing = false
let unsubSceneReady: (() => void) | null = null
let disposed = false
let battleRunId = 0
const commandTimers = new Set<number>()

const sortedUnits = computed(() => {
  return [...(runtimeSnapshot.value?.units || [])].sort((a, b) => b.actionGauge - a.actionGauge)
})

const playerActor = computed(() => {
  if (!battleRuntime.value || !runtimeSnapshot.value?.currentActorId) return null
  return battleRuntime.value.units.find(unit => unit.id === runtimeSnapshot.value?.currentActorId && unit.side === 'ally') ?? null
})

const isPlayerSelecting = computed(() => Boolean(playerActor.value))
const targetableEnemies = computed(() => battleRuntime.value?.aliveEnemies || [])
const playerSkills = computed(() => {
  const actor = playerActor.value
  if (!actor) return []
  return getSkillsByIds(actor.skills).filter(skill => skill.category !== 'passive').slice(0, 4)
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
  if (runtimeSnapshot.value) {
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
  gameEvents.emit('battle:play-command', command)
  const timer = window.setTimeout(() => {
    commandTimers.delete(timer)
    if (disposed || battleRunId !== runId || battleRuntime.value !== runtime) {
      executing = false
      return
    }
    for (const hit of hits) {
      gameEvents.emit('battle:damage-number', hit)
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
    refreshSnapshot()
  })
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
  bindScene()
  initBattle()
  frameId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  disposed = true
  battleRunId++
  if (frameId) cancelAnimationFrame(frameId)
  for (const timer of commandTimers) {
    window.clearTimeout(timer)
  }
  commandTimers.clear()
  unsubSceneReady?.()
  unsubSceneReady = null
  battleRuntime.value = null
})
</script>

<style scoped>
.battle-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #e8f7ff;
  color: #244a52;
  font-family: var(--font-pixel), serif;
}

.battle-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 58%, rgba(255, 239, 180, 0.34), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(181, 222, 218, 0.18));
  z-index: 1;
}

.battle-hud,
.command-dock,
.log-dock,
.world-strip,
.action-order,
.result-panel {
  position: absolute;
  z-index: 2;
}

.battle-hud.top {
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(12px + env(safe-area-inset-top, 0px)) 20px 12px;
  background: linear-gradient(180deg, rgba(244, 251, 246, 0.88), rgba(244, 251, 246, 0));
}

.icon-btn,
.speed-btn {
  border: 1px solid rgba(128, 102, 49, 0.26);
  background: rgba(255, 252, 236, 0.78);
  color: #6c5131;
  min-width: 54px;
  height: 42px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(88, 130, 128, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
  font-weight: 700;
}

.speed-btn.active {
  color: #204b46;
  border-color: rgba(58, 156, 139, 0.5);
  background: linear-gradient(135deg, #fff1a8, #9fe5ce);
}

.battle-title {
  text-align: center;
  display: grid;
  gap: 2px;
}

.battle-title .eyebrow {
  color: rgba(71, 93, 91, 0.72);
  font-size: 12px;
}

.battle-title strong {
  color: #95672a;
  font-size: 20px;
  letter-spacing: 0;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
}

.action-order {
  right: 18px;
  top: 106px;
  width: 148px;
  display: grid;
  gap: 8px;
  padding: 11px 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(97, 147, 135, 0.28);
  background: rgba(255, 252, 236, 0.56);
  box-shadow: 0 18px 45px rgba(89, 139, 130, 0.16);
  backdrop-filter: blur(12px);
}

.order-title {
  color: #8c652c;
  font-size: 12px;
  text-align: center;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(176, 133, 55, 0.18);
}

.order-row {
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  gap: 7px;
  opacity: 0.82;
  padding: 6px;
  border-radius: 11px;
}

.order-row.active {
  opacity: 1;
  background: rgba(255, 235, 154, 0.56);
  filter: drop-shadow(0 4px 10px rgba(188, 134, 44, 0.24));
}

.order-row.enemy .gauge i {
  background: linear-gradient(90deg, #f47c8c, #d64a5e);
}

.order-meta {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.order-meta b {
  color: #345b59;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gauge {
  height: 7px;
  background: rgba(112, 130, 121, 0.18);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(60, 86, 83, 0.2);
}

.gauge i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #4cc7b4, #9ee6cf);
}

.dock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.dock-header small {
  color: rgba(76, 86, 78, 0.72);
  font-size: 12px;
}

.dock-header.passive {
  margin: 0 0 8px;
}

.spirit-fire {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 253, 238, 0.88), rgba(239, 249, 240, 0.8)),
    radial-gradient(circle at 0 50%, rgba(255, 216, 116, 0.28), transparent 58%);
  border: 1px solid rgba(178, 130, 46, 0.26);
  box-shadow: 0 8px 18px rgba(126, 102, 54, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
}

.spirit-fire b {
  color: #8c652c;
  font-size: 12px;
  padding-right: 2px;
}

.spirit-fire span {
  width: 15px;
  height: 15px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(207, 220, 213, 0.78), rgba(143, 165, 154, 0.76));
  box-shadow: inset 0 2px 3px rgba(64, 77, 74, 0.16);
}

.spirit-fire span.lit {
  background: radial-gradient(circle at 35% 30%, #ffffff, #fff0a9 32%, #f4a943 68%, #dc7130);
  box-shadow: 0 0 10px rgba(235, 160, 52, 0.48), 0 2px 6px rgba(154, 92, 30, 0.2);
}

.world-strip {
  left: 18px;
  right: 18px;
  bottom: 98px;
  border: 1px solid rgba(65, 155, 142, 0.24);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.78), rgba(255, 250, 227, 0.72)),
    linear-gradient(135deg, rgba(93, 184, 166, 0.16), rgba(248, 214, 133, 0.18));
  border-radius: 14px;
  padding: 12px 15px;
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 42px rgba(79, 126, 121, 0.16);
}

.world-time {
  display: flex;
  justify-content: space-between;
  color: #2d8e82;
  font-size: 12px;
}

.world-strip p {
  margin: 7px 0 0;
  color: rgba(45, 66, 64, 0.9);
  font-size: 13px;
  line-height: 1.55;
}

.command-dock {
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 18px calc(14px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(0deg, rgba(244, 251, 246, 0.96), rgba(244, 251, 246, 0.2));
}

.target-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.target-chip {
  white-space: nowrap;
  border: 1px solid rgba(200, 98, 105, 0.28);
  background: rgba(255, 255, 255, 0.76);
  color: #88404b;
  border-radius: 999px;
  padding: 8px 12px;
  box-shadow: 0 8px 18px rgba(114, 90, 74, 0.1);
}

.target-chip.selected {
  border-color: #c98339;
  color: #5f361b;
  background: linear-gradient(135deg, #fff3b2, #ffd783);
}

.command-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(68px, 1fr));
  gap: 10px;
}

.command {
  min-height: 66px;
  border: 1px solid rgba(123, 151, 135, 0.24);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 248, 239, 0.88)),
    radial-gradient(circle at 50% 0%, rgba(255, 225, 130, 0.34), transparent 70%);
  color: #395b58;
  display: grid;
  place-items: center;
  gap: 2px;
  font-size: 13px;
  position: relative;
  box-shadow: 0 12px 26px rgba(89, 130, 128, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.command span {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  font-size: 17px;
  color: #8b5a20;
  background: linear-gradient(135deg, #fff4bd, #f0bd5a);
}

.command small {
  color: #2f9c8c;
}

.command:disabled {
  opacity: 0.38;
}

.command.attack {
  border-color: rgba(223, 121, 80, 0.38);
}

.command.skill {
  border-color: rgba(76, 184, 166, 0.38);
}

.log-dock {
  left: 18px;
  bottom: 18px;
  display: grid;
  gap: 7px;
  max-width: min(560px, calc(100vw - 36px));
}

.battle-log {
  padding: 8px 12px;
  border-radius: 10px;
  color: rgba(53, 71, 68, 0.82);
  background: rgba(255, 255, 255, 0.72);
  border-left: 3px solid rgba(76, 184, 166, 0.34);
  box-shadow: 0 8px 20px rgba(89, 130, 128, 0.11);
  font-size: 13px;
}

.battle-log.major {
  color: #8b5a20;
  border-left-color: #e3a642;
  background: rgba(255, 248, 218, 0.78);
}

.result-panel {
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(222, 247, 246, 0.54);
  backdrop-filter: blur(6px);
}

.result-card {
  width: min(340px, calc(100vw - 34px));
  border: 1px solid rgba(188, 137, 45, 0.34);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 253, 240, 0.98), rgba(235, 250, 242, 0.98));
  padding: 24px 18px 18px;
  text-align: center;
  box-shadow: 0 28px 80px rgba(95, 133, 124, 0.24);
}

.result-mark {
  width: 62px;
  height: 62px;
  margin: 0 auto 10px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: radial-gradient(circle, #f6d78b, #b66a34);
  color: #170e0d;
  font-size: 32px;
  font-weight: 800;
}

.result-card h2 {
  margin: 0 0 8px;
  color: #9d6314;
}

.result-card p {
  color: rgba(53, 71, 68, 0.78);
}

.result-card button {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(135deg, #f6d78b, #78dac6);
  color: #151017;
  font-weight: 700;
}

@media (max-width: 720px) {
  .action-order {
    width: 118px;
    right: 10px;
  }

  .order-title,
  .order-meta b {
    display: none;
  }

  .order-row {
    grid-template-columns: 22px 1fr;
    padding: 5px;
  }

  .command-row {
    display: flex;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .command {
    min-width: 74px;
  }
}
</style>
