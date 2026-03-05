<template>
  <div class="battle-view min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
    <!-- 顶部信息栏 -->
    <div class="top-bar px-4 py-2 bg-black/30">
      <div class="flex justify-between items-center text-sm">
        <div class="flex items-center gap-2">
          <span class="text-gray-400">回合 {{ turnCount }}</span>
          <span class="px-2 py-0.5 rounded text-xs"
            :class="battleMode === 'pve' ? 'bg-blue-600/50 text-blue-300' : 'bg-purple-600/50 text-purple-300'">
            {{ battleMode === 'pve' ? 'PvE' : 'PvP' }}
          </span>
          <!-- 自动战斗指示器 -->
          <span v-if="autoBattle" class="px-2 py-0.5 rounded text-xs bg-green-600/50 text-green-300 pulse">
            AUTO
          </span>
        </div>
        <div class="flex items-center gap-2">
          <!-- 速度按钮 -->
          <button
            class="px-2 py-1 rounded text-xs font-medium transition-all"
            :class="battleSpeed === 1 ? 'bg-gray-600 text-gray-300' : battleSpeed === 2 ? 'bg-yellow-600 text-white' : 'bg-orange-600 text-white'"
            @click="toggleBattleSpeed"
          >
            {{ battleSpeed }}x
          </button>
          <!-- 战斗模式切换 -->
          <button
            class="px-2 py-1 rounded text-xs font-medium transition-all"
            :class="battleMode === 'pve' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'"
            @click="toggleBattleMode"
          >
            {{ battleMode === 'pve' ? 'PvE' : 'PvP' }}
          </button>
          <button
            class="px-3 py-1 rounded text-xs font-medium transition-all"
            :class="autoBattle ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'"
            @click="toggleAutoBattle"
          >
            {{ autoBattle ? '自动' : '手动' }}
          </button>
          <button
            class="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs font-medium hover:bg-gray-600 transition-all"
            @click="exitBattle"
          >
            退出
          </button>
        </div>
      </div>
    </div>

    <!-- 速度条显示 -->
    <div class="speed-bar-container px-4 py-2 border-b border-gray-700/50">
      <div class="flex gap-3 overflow-x-auto pb-1">
        <div
          v-for="unit in allUnits"
          :key="unit.id"
          class="speed-bar-item flex-shrink-0 flex items-center gap-1"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs"
            :style="{ backgroundColor: getElementColor(unit.element) }">
            {{ unit.icon?.charAt(0) }}
          </span>
          <div class="w-12">
            <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-75"
                :class="getSpeedBarColor(unit)"
                :style="{ width: `${speedBar.get(unit.id) || 0}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主角状态面板 -->
    <div v-if="protagonist" class="protagonist-panel mx-4 mt-3 p-3 bg-black/40 rounded-lg border border-gray-700/50">
      <div class="flex items-center gap-3">
        <div class="avatar w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold"
          :style="{ borderColor: getElementColor(protagonist.element), borderWidth: '2px', borderStyle: 'solid', backgroundColor: `${getElementColor(protagonist.element)}22` }">
          {{ protagonist.icon }}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-white font-medium">{{ protagonist.name }}</span>
            <span class="text-xs px-1.5 py-0.5 rounded" :style="{ backgroundColor: `${getQualityColor(protagonist.quality)}33`, color: getQualityColor(protagonist.quality) }">
              {{ protagonist.realm }}
            </span>
          </div>
          <!-- HP 条 -->
          <div class="mb-1">
            <div class="flex justify-between text-xs mb-0.5">
              <span class="text-gray-400">HP</span>
              <span class="text-green-400">{{ protagonist.stats.currentHp }}/{{ protagonist.stats.maxHp }}</span>
            </div>
            <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
                :style="{ width: `${(protagonist.stats.currentHp / protagonist.stats.maxHp) * 100}%` }"></div>
            </div>
          </div>
          <!-- MP 条 -->
          <div>
            <div class="flex justify-between text-xs mb-0.5">
              <span class="text-gray-400">MP</span>
              <span class="text-blue-400">{{ protagonist.stats.currentMp }}/{{ protagonist.stats.maxMp }}</span>
            </div>
            <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                :style="{ width: `${(protagonist.stats.currentMp / protagonist.stats.maxMp) * 100}%` }"></div>
            </div>
          </div>
        </div>
        <!-- 状态效果 -->
        <div v-if="protagonist.statusEffects.length > 0" class="status-icons flex flex-col gap-1">
          <span v-for="(effect, index) in protagonist.statusEffects.slice(0, 3)" :key="index"
            class="w-6 h-6 text-xs flex items-center justify-center rounded"
            :class="getStatusEffectClass(effect.type)">
            {{ getStatusEffectIcon(effect.type) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 战斗场地 -->
    <div class="battle-arena px-4 py-6">
      <!-- 敌方区域 -->
      <div class="enemy-area mb-8">
        <div class="text-center text-xs text-gray-500 mb-3">敌方</div>
        <div class="flex justify-center gap-3 flex-wrap">
          <UnitSlot
            v-for="enemy in aliveEnemies"
            :key="enemy.id"
            :unit="enemy"
            :is-selected="selectedTargetIds.includes(enemy.id)"
            :is-targetable="canSelectEnemyTarget"
            @click="onEnemyTargetClick(enemy.id)"
          />
        </div>
      </div>

      <!-- 我方区域（伙伴） -->
      <div class="ally-area" v-if="aliveCompanions.length > 0">
        <div class="text-center text-xs text-gray-500 mb-3">我方</div>
        <div class="flex justify-center gap-3 flex-wrap">
          <UnitSlot
            v-for="ally in aliveCompanions"
            :key="ally.id"
            :unit="ally"
            :is-selected="selectedTargetIds.includes(ally.id)"
            :is-targetable="canSelectAllyTarget"
            @click="onAllyTargetClick(ally.id)"
          />
        </div>
      </div>
    </div>

    <!-- 行动顺序条（右侧竖向） -->
    <ActionOrderBar
      :units="allUnits"
      :speed-bar="speedBar"
      :current-acting-unit-id="currentActingUnitId"
    />

    <!-- 技能选择面板 -->
    <div v-if="showSkillPanel" class="skill-panel fixed inset-x-0 bottom-40 bg-gray-900/95 border-t border-gray-700 p-4 max-h-60 overflow-y-auto">
      <div class="flex justify-between items-center mb-3">
        <span class="text-white font-medium">选择技能</span>
        <button class="text-gray-400 hover:text-white text-sm" @click="cancelSkillSelection">取消</button>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="skill in availableSkills"
          :key="skill.id"
          class="skill-btn p-3 rounded-lg text-left transition-all"
          :class="getSkillBtnClass(skill)"
          :disabled="!canUseSkill(skill)"
          @click="onSkillSelect(skill.id)"
        >
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded flex items-center justify-center text-sm"
              :style="{ backgroundColor: `${getElementColor(skill.effects[0]?.element || protagonist?.element || '金')}33` }">
              {{ skill.icon }}
            </span>
            <div class="flex-1">
              <div class="text-white text-sm font-medium">{{ skill.name }}</div>
              <div class="text-xs text-gray-400">MP: {{ skill.mpCost }}</div>
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ skill.description }}</div>
        </button>
      </div>
    </div>

    <!-- 行动菜单 -->
    <div v-if="showActionMenu" class="action-menu fixed bottom-20 left-0 right-0 px-4">
      <div class="bg-gray-800/95 rounded-xl p-3 backdrop-blur border border-gray-700/50">
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="action in availableActions"
            :key="action.type"
            class="action-btn py-3 px-2 rounded-lg text-sm font-medium transition-all"
            :class="getActionBtnClass(action.type)"
            @click="selectAction(action.type)"
          >
            <div class="text-lg mb-1">{{ action.icon }}</div>
            <div>{{ action.name }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 确认按钮 -->
    <div v-if="showConfirmButton" class="confirm-btn fixed bottom-20 left-0 right-0 px-4">
      <div class="flex gap-2">
        <button
          class="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
          @click="cancelSelection"
        >
          取消
        </button>
        <button
          class="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-all"
          @click="confirmAction"
        >
          确认行动
        </button>
      </div>
    </div>

    <!-- 战斗日志 -->
    <div class="battle-log fixed bottom-4 left-4 right-4 h-14 overflow-hidden">
      <div class="bg-black/60 rounded-lg p-2 text-xs text-gray-300 h-full overflow-y-auto backdrop-blur">
        <div v-for="(log, index) in recentLogs" :key="index" class="mb-0.5">
          <span class="text-yellow-400">{{ log.actorName }}</span>
          <span class="text-gray-400">{{ log.action }}</span>
          <span v-if="log.targetName" class="text-cyan-400"> → {{ log.targetName }}</span>
          <span v-if="log.result" class="text-green-400"> {{ log.result }}</span>
        </div>
      </div>
    </div>

    <!-- 战斗结果 -->
    <div v-if="battleEnded" class="battle-result fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-xl p-8 text-center mx-4 max-w-sm w-full">
        <h2 class="text-3xl font-bold mb-4" :class="result === 'victory' ? 'text-yellow-400' : result === 'defeat' ? 'text-red-400' : 'text-blue-400'">
          {{ result === 'victory' ? '战斗胜利!' : result === 'defeat' ? '战斗失败' : '成功逃跑' }}
        </h2>
        <div v-if="rewards && result === 'victory'" class="rewards mb-6 py-4 bg-black/30 rounded-lg">
          <div class="flex justify-center gap-8">
            <div class="text-center">
              <div class="text-2xl text-green-400 font-bold">{{ rewards.cultivation }}</div>
              <div class="text-xs text-gray-400">修为</div>
            </div>
            <div class="text-center">
              <div class="text-2xl text-yellow-400 font-bold">{{ rewards.gold }}</div>
              <div class="text-xs text-gray-400">灵石</div>
            </div>
          </div>
        </div>
        <button
          class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all"
          @click="exitBattle"
        >
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBattleStore } from '@/stores/battleStore'
import { usePlayerStore } from '@/stores/playerStore'
import { createUnit, type Unit, ELEMENT_COLORS, QUALITY_COLORS } from '@/types/unit'
import { getSkillById, getSkillsByIds, type Skill } from '@/types/skill'
import { getAreaById, ENEMIES, rollDrops, rollReward, type AreaDefinition, type DropItem } from '@/types/adventure'
import UnitSlot from '@/components/battle/UnitSlot.vue'
import ActionOrderBar from '@/components/battle/ActionOrderBar.vue'

const router = useRouter()
const route = useRoute()
const battleStore = useBattleStore()
const playerStore = usePlayerStore()

// 当前区域配置
const currentArea = ref<AreaDefinition | null>(null)
const currentWave = ref(1)
const totalWaves = ref(3)
const accumulatedDrops = ref<Map<string, { item: DropItem; quantity: number }>>(new Map())
const accumulatedExp = ref(0)
const accumulatedGold = ref(0)

// 本地状态
const battleLoopId = ref<number>(0)

// 从 store 获取状态
const phase = computed(() => battleStore.phase)
const turnCount = computed(() => battleStore.turnCount)
const allUnits = computed(() => battleStore.allUnits)
const aliveAllies = computed(() => battleStore.aliveAllies)
const aliveEnemies = computed(() => battleStore.aliveEnemies)
const isPlayerTurn = computed(() => battleStore.isPlayerTurn)
const battleEnded = computed(() => battleStore.battleEnded)
const selectedAction = computed(() => battleStore.selectedAction)
const selectedSkillId = computed(() => battleStore.selectedSkillId)
const selectedTargetIds = computed(() => battleStore.selectedTargetIds)
const speedBar = computed(() => battleStore.speedBar)
const battleLog = computed(() => battleStore.battleLog)
const result = computed(() => battleStore.result)
const rewards = computed(() => battleStore.rewards)
const battleSpeed = computed(() => battleStore.battleSpeed)
const autoBattle = computed(() => battleStore.autoBattle)
const shouldEnemyAutoAct = computed(() => battleStore.shouldEnemyAutoAct)
const battleMode = computed(() => battleStore.battleMode)
const currentActingUnitId = computed(() => battleStore.currentActingUnitId)

// 主角
const protagonist = computed(() => battleStore.allyUnits.find(u => u.type === 'protagonist'))

// 伙伴（非主角）
const aliveCompanions = computed(() => battleStore.allyUnits.filter(u => u.type !== 'protagonist' && u.isAlive))

// 可用行动
const availableActions = [
  { type: 'attack' as const, name: '攻击', icon: '⚔️' },
  { type: 'skill' as const, name: '技能', icon: '✨' },
  { type: 'defend' as const, name: '防御', icon: '🛡️' },
  { type: 'flee' as const, name: '逃跑', icon: '🏃' }
]

// 可用技能（使用玩家已学习的技能）
const availableSkills = computed(() => {
  const unit = battleStore.currentActingUnit
  if (!unit) return []

  // 获取玩家已学习的技能ID列表
  const skillIds = unit.skills || []
  if (skillIds.length === 0) return []

  // 根据技能ID获取技能定义
  const skills = getSkillsByIds(skillIds)

  return skills.filter(skill => {
    // 检查 MP 是否足够
    if (unit.stats.currentMp < skill.mpCost) return false
    // 检查冷却时间
    if (skill.currentCooldown > 0) return false
    return true
  })
})

// 显示技能面板
// 显示技能面板 - 自动战斗时隐藏
const showSkillPanel = computed(() => {
  if (autoBattle.value) return false
  return isPlayerTurn.value && selectedAction.value === 'skill' && phase.value === 'select_action'
})

// 显示行动菜单 - 自动战斗时隐藏
const showActionMenu = computed(() => {
  if (autoBattle.value) return false
  return isPlayerTurn.value && phase.value === 'select_action' && !selectedAction.value
})

// 显示确认按钮
const showConfirmButton = computed(() => {
  return isPlayerTurn.value && phase.value === 'select_target' && selectedTargetIds.value.length > 0
})

// 是否可以选择敌方目标
const canSelectEnemyTarget = computed(() => {
  return isPlayerTurn.value && (
    selectedAction.value === 'attack' ||
    (selectedAction.value === 'skill' && canTargetEnemy.value)
  )
})

// 是否可以选择友方目标
const canSelectAllyTarget = computed(() => {
  return isPlayerTurn.value && selectedAction.value === 'skill' && canTargetAlly.value
})

// 技能是否可以指定敌方
const canTargetEnemy = computed(() => {
  const skill = selectedSkillId.value ? getSkillById(selectedSkillId.value) : null
  if (!skill) return false
  const targetType = skill.effects[0]?.targetType
  return targetType === 'single_enemy' || targetType === 'all_enemies'
})

// 技能是否可以指定友方
const canTargetAlly = computed(() => {
  const skill = selectedSkillId.value ? getSkillById(selectedSkillId.value) : null
  if (!skill) return false
  const targetType = skill.effects[0]?.targetType
  return targetType === 'single_ally' || targetType === 'all_allies' || targetType === 'self'
})

// 最近的战斗日志
const recentLogs = computed(() => battleLog.value.slice(-6).reverse())

// 根据敌人ID获取敌人定义
function getEnemyDefinition(enemyId: string) {
  return ENEMIES[enemyId]
}

// 根据波次生成敌人
function generateEnemiesForWave(wave: number): Unit[] {
  if (!currentArea.value) return []

  const area = currentArea.value
  const enemyIds = area.enemies
  const enemies: Unit[] = []

  // 根据波次决定敌人数量和类型
  let enemyCount = 1
  let useElite = false
  let useBoss = false

  if (wave === 1) {
    enemyCount = 2 // 第一波：2只普通怪
  } else if (wave === 2) {
    enemyCount = 1
    useElite = true // 第二波：1只精英怪
  } else if (wave === 3) {
    enemyCount = 1
    useBoss = true // 第三波：1只Boss
  }

  for (let i = 0; i < enemyCount; i++) {
    // 随机选择一个敌人ID
    const randomIndex = Math.floor(Math.random() * enemyIds.length)
    const enemyId = enemyIds[randomIndex]
    if (!enemyId) continue

    const enemyDef = getEnemyDefinition(enemyId)
    if (!enemyDef) continue

    // 计算属性倍率
    let statMultiplier = 1
    if (useElite) statMultiplier = 1.5
    if (useBoss) statMultiplier = 2.5

    // 波次加成
    statMultiplier *= (1 + (wave - 1) * 0.2)

    enemies.push(createUnit({
      id: `enemy_${wave}_${i}`,
      name: useBoss ? `[BOSS]${enemyDef.name}` : useElite ? `[精��]${enemyDef.name}` : enemyDef.name,
      type: 'enemy',
      element: '金', // 默认元素
      realm: enemyDef.realm,
      realmLevel: enemyDef.realmLevel,
      quality: useBoss ? '仙品' : useElite ? '玄品' : '凡品',
      level: enemyDef.realmLevel + wave * 2,
      icon: enemyDef.icon,
      stats: {
        maxHp: Math.floor(enemyDef.baseStats.maxHp * statMultiplier),
        currentHp: Math.floor(enemyDef.baseStats.maxHp * statMultiplier),
        maxMp: 50,
        currentMp: 50,
        attack: Math.floor(enemyDef.baseStats.attack * statMultiplier),
        defense: Math.floor(enemyDef.baseStats.defense * statMultiplier),
        speed: enemyDef.baseStats.speed,
        critRate: 0.05 + (useBoss ? 0.1 : useElite ? 0.05 : 0),
        critDamage: 1.5 + (useBoss ? 0.3 : useElite ? 0.15 : 0)
      },
      skills: enemyDef.skills
    }))
  }

  return enemies
}

// 初始化战斗数据
function initBattle() {
  // 从路由参数获取区域ID
  const areaId = route.query.areaId as string

  // 如果有区域ID，加载区域配置
  if (areaId) {
    const area = getAreaById(areaId)
    if (area) {
      currentArea.value = area
      currentWave.value = 1
      totalWaves.value = 3
      accumulatedDrops.value.clear()
      accumulatedExp.value = 0
      accumulatedGold.value = 0
    }
  }

  // 恢复玩家满生命值和灵力
  playerStore.baseStats.currentHp = playerStore.totalStats.maxHp
  playerStore.baseStats.currentMp = playerStore.totalStats.maxMp

  // 使用 playerStore 的主角数据（已恢复满状态）
  const protagonist = playerStore.toBattleUnit()
  const allies: Unit[] = [protagonist]

  // 生成第一波敌人
  let enemies: Unit[]

  if (currentArea.value) {
    enemies = generateEnemiesForWave(currentWave.value)
  } else {
    // 没有区域配置时使用默认敌人
    const playerLevel = playerStore.level
    enemies = [
      createUnit({
        id: 'enemy1',
        name: '妖狼',
        type: 'enemy',
        element: '木',
        realm: '炼气',
        quality: '凡品',
        level: Math.max(1, playerLevel - 2),
        icon: '🐺',
        stats: {
          maxHp: 60 + playerLevel * 10,
          currentHp: 60 + playerLevel * 10,
          maxMp: 20 + playerLevel * 5,
          currentMp: 20 + playerLevel * 5,
          attack: 10 + playerLevel * 3,
          defense: 5 + playerLevel * 2,
          speed: 90 + playerLevel * 2,
          critRate: 0.05,
          critDamage: 1.5
        },
        skills: ['ice_spike']
      }),
      createUnit({
        id: 'enemy2',
        name: '妖蛇',
        type: 'enemy',
        element: '水',
        realm: '炼气',
        quality: '凡品',
        level: Math.max(1, playerLevel - 1),
        icon: '🐍',
        stats: {
          maxHp: 50 + playerLevel * 8,
          currentHp: 50 + playerLevel * 8,
          maxMp: 30 + playerLevel * 5,
          currentMp: 30 + playerLevel * 5,
          attack: 8 + playerLevel * 2,
          defense: 4 + playerLevel * 1,
          speed: 85 + playerLevel * 2,
          critRate: 0.05,
          critDamage: 1.5
        },
        skills: ['poison_fog', 'ice_spike']
      })
    ]
  }

  battleStore.initBattle(allies, enemies)
}

// 战斗循环相关变量
let lastLoopTime = Date.now()

// 战斗主循环
function battleLoop() {
  if (battleEnded.value) {
    battleLoopId.value = 0
    return
  }

  const now = Date.now()
  const deltaTime = (now - lastLoopTime) / 1000 * 60 * battleSpeed.value
  lastLoopTime = now

  // 更新速度条
  battleStore.updateSpeedBar(deltaTime)

  // 检查是否有单位可以行动
  const readyUnitId = battleStore.getUnitReadyToAct()
  if (readyUnitId) {
    battleStore.consumeUnitAction(readyUnitId)

    const unit = allUnits.value.find(u => u.id === readyUnitId)
    if (unit && unit.type === 'enemy') {
      // 敌方回合
      if (shouldEnemyAutoAct.value) {
        // PvE模式或自动模式：敌人自动行动
        setTimeout(() => {
          executeEnemyTurn(unit)
          // 敌人行动完成后继续循环
          resumeLoop()
        }, 500)
      } else {
        // PvP模式：等待敌方玩家操作
        // 这里可以让敌人也使用自动战斗逻辑（如果开启了自动战斗）
        if (autoBattle.value) {
          setTimeout(() => {
            executeEnemyTurn(unit)
            resumeLoop()
          }, 500)
        }
      }
      return
    } else if (unit && autoBattle.value) {
      // 自动战斗
      setTimeout(() => {
        executeAutoBattle(unit)
        resumeLoop()
      }, 500)
      return
    }
    // 玩家手动操作 - 循环暂停，等待玩家操作
    return
  }

  battleLoopId.value = requestAnimationFrame(battleLoop)
}

// 恢复战斗循环
function resumeLoop() {
  if (battleEnded.value) {
    battleLoopId.value = 0
    return
  }
  lastLoopTime = Date.now()
  battleLoopId.value = requestAnimationFrame(battleLoop)
}

// 启动战斗循环
function startBattleLoop() {
  if (battleEnded.value) return
  lastLoopTime = Date.now()
  battleLoopId.value = requestAnimationFrame(battleLoop)
}

// 敌方回合 AI
function executeEnemyTurn(enemy: Unit) {
  if (battleEnded.value || !enemy.isAlive) return

  // 使用 store 中的敌人AI逻辑
  battleStore.executeEnemyAutoAction(enemy)
}

// 自动战斗逻辑
function executeAutoBattle(unit: Unit) {
  if (battleEnded.value || !unit.isAlive) return

  // 获取单位可用的技能
  const skillIds = unit.skills || []
  const allSkills = skillIds.length > 0 ? getSkillsByIds(skillIds) : []

  // 优先使用技能
  const usableSkills = allSkills.filter(skill => {
    if (unit.stats.currentMp < skill.mpCost) return false
    if (skill.currentCooldown > 0) return false
    return true
  })

  if (usableSkills.length > 0 && Math.random() > 0.3) {
    // 随机选择一个技能
    const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)]
    if (skill) {
      battleStore.selectAction('skill')
      battleStore.selectSkill(skill.id)

      // 根据技能类型选择目标
      const targetType = skill.effects[0]?.targetType
      if (targetType === 'self' || targetType === 'all_allies') {
        // 治疗类技能
        const allies = aliveAllies.value
        if (allies.length > 0) {
          const target = allies[Math.floor(Math.random() * allies.length)]
          if (target) {
            battleStore.selectTarget(target.id)
          }
        }
      } else {
        // 攻击类技能
        const enemies = aliveEnemies.value
        if (enemies.length > 0) {
          const target = enemies[Math.floor(Math.random() * enemies.length)]
          if (target) {
            battleStore.selectTarget(target.id)
          }
        }
      }

      battleStore.confirmAction()
    }
  } else {
    // 普通攻击
    const enemies = aliveEnemies.value
    if (enemies.length > 0) {
      const target = enemies[Math.floor(Math.random() * enemies.length)]
      if (target) {
        battleStore.selectAction('attack')
        battleStore.selectTarget(target.id)
        battleStore.confirmAction()
      }
    }
  }
}

// 选择行动
function selectAction(actionType: typeof availableActions[number]['type']) {
  battleStore.selectAction(actionType)
}

// 选择技能
function onSkillSelect(skillId: string) {
  const skill = getSkillById(skillId)
  if (!skill) return

  const unit = battleStore.currentActingUnit
  if (!unit) return

  battleStore.selectSkill(skillId)

  // 获取技能目标类型
  const targetType = skill.effects[0]?.targetType

  // 如果是单体友方技能（治疗等），检查友方数量
  if (targetType === 'single_ally') {
    const allies = battleStore.aliveAllies
    if (allies.length === 1) {
      // 只有一个友方，自动选中并执行
      battleStore.selectTarget(allies[0]!.id)
      battleStore.confirmAction()
    }
    // 多个友方时，等待玩家手动选择
  }
  // 如果是自身技能，selectSkill 已经设置了目标，直接确认
  else if (targetType === 'self') {
    battleStore.confirmAction()
  }
  // 如果是全体敌人/全体友方技能，selectSkill 已经设置了目标，直接确认
  else if (targetType === 'all_enemies' || targetType === 'all_allies') {
    battleStore.confirmAction()
  }
  // 单体敌人技能需要等待选择目标
}

// 取消技能选择
function cancelSkillSelection() {
  battleStore.selectedAction = null
  battleStore.selectedSkillId = null
}

// 取消选择
function cancelSelection() {
  battleStore.selectedAction = null
  battleStore.selectedSkillId = null
  battleStore.selectedTargetIds = []
  battleStore.phase = 'select_action'
}

// 点击敌方目标
function onEnemyTargetClick(targetId: string) {
  if (!canSelectEnemyTarget.value) return
  battleStore.selectTarget(targetId)
  // 选择目标后直接执行行动，不需要额外确认
  battleStore.confirmAction()
}

// 点击友方目标
function onAllyTargetClick(targetId: string) {
  if (!canSelectAllyTarget.value) return
  battleStore.selectTarget(targetId)
  // 选择目标后直接执行行动，不需要额外确认
  battleStore.confirmAction()
}

// 确认行动
function confirmAction() {
  battleStore.confirmAction()
}

// 切换自动战斗
function toggleAutoBattle() {
  battleStore.toggleAutoBattle()
}

// 切换战斗模式（PvE/PvP）
function toggleBattleMode() {
  const newMode = battleMode.value === 'pve' ? 'pvp' : 'pve'
  battleStore.setBattleMode(newMode)
}

// 切换战斗速度
function toggleBattleSpeed() {
  battleStore.toggleBattleSpeed()
}

// 退出战斗
function exitBattle() {
  if (battleLoopId.value) {
    cancelAnimationFrame(battleLoopId.value)
  }

  // 发放奖励
  if (result.value === 'victory' && currentArea.value) {
    // 使用历练区域的奖励配置
    const area = currentArea.value

    // 计算修为和灵石奖励
    const totalExp = accumulatedExp.value > 0 ? accumulatedExp.value : rollReward(area.expReward)
    const totalGold = accumulatedGold.value > 0 ? accumulatedGold.value : rollReward(area.goldReward)

    playerStore.addCultivation(totalExp)
    playerStore.addGold(totalGold)

    // 发放掉落物品
    const drops = accumulatedDrops.value.size > 0
      ? Array.from(accumulatedDrops.value.values())
      : rollDrops(area.drops).map(d => ({ item: d.item, quantity: d.quantity }))

    for (const drop of drops) {
      const added = playerStore.addToInventory({
        id: `drop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: drop.item.name,
        icon: drop.item.icon,
        type: drop.item.type === 'equipment' ? 'equipment' : 'material',
        quality: drop.item.quality,
        quantity: drop.quantity,
        description: drop.item.description
      })
      if (!added) {
        console.warn(`背包已满，无法添加 ${drop.item.name}`)
      }
    }

    // 更新区域通关记录
    playerStore.clearArea(area.id, 0, 3) // 简化处理，给3星
  } else if (result.value === 'victory' && rewards.value) {
    // 兼容旧的战斗模式
    playerStore.addCultivation(rewards.value.cultivation)
    playerStore.addGold(rewards.value.gold)
  }

  battleStore.reset()
  router.push('/game/adventure')
}

// 获取元素颜色
function getElementColor(element: string): string {
  return ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS] || '#666'
}

// 获取品质颜色
function getQualityColor(quality: string): string {
  return QUALITY_COLORS[quality as keyof typeof QUALITY_COLORS] || '#666'
}

// 获取速度条颜色
function getSpeedBarColor(unit: Unit): string {
  if (unit.type === 'enemy') {
    return 'bg-red-500'
  }
  return 'bg-blue-500'
}

// 获取行动按钮样式
function getActionBtnClass(actionType: string): string {
  switch (actionType) {
    case 'attack':
      return 'bg-red-600/80 hover:bg-red-500 text-white'
    case 'skill':
      return 'bg-blue-600/80 hover:bg-blue-500 text-white'
    case 'defend':
      return 'bg-green-600/80 hover:bg-green-500 text-white'
    case 'flee':
      return 'bg-gray-600/80 hover:bg-gray-500 text-white'
    default:
      return 'bg-gray-600/80 hover:bg-gray-500 text-white'
  }
}

// 获取技能按钮样式
function getSkillBtnClass(skill: Skill): string {
  const canUse = canUseSkill(skill)
  if (!canUse) {
    return 'bg-gray-800 opacity-50 cursor-not-allowed'
  }
  return 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
}

// 检查技能是否可用
function canUseSkill(skill: Skill): boolean {
  const unit = battleStore.currentActingUnit
  if (!unit) return false
  return unit.stats.currentMp >= skill.mpCost && skill.currentCooldown === 0
}

// 状态效果样式
function getStatusEffectClass(type: string): string {
  const classes: Record<string, string> = {
    poison: 'bg-purple-500 text-white',
    burn: 'bg-orange-500 text-white',
    freeze: 'bg-cyan-500 text-white',
    stun: 'bg-yellow-500 text-black',
    buff_atk: 'bg-red-500 text-white',
    buff_def: 'bg-blue-500 text-white',
    buff_spd: 'bg-green-500 text-white',
    debuff_atk: 'bg-gray-500 text-white',
    debuff_def: 'bg-gray-500 text-white',
    shield: 'bg-gray-300 text-black',
    invincible: 'bg-yellow-300 text-black'
  }
  return classes[type] || 'bg-gray-500 text-white'
}

// 状态效果图标
function getStatusEffectIcon(type: string): string {
  const icons: Record<string, string> = {
    poison: '毒',
    burn: '燃',
    freeze: '冻',
    stun: '晕',
    buff_atk: '攻',
    buff_def: '防',
    buff_spd: '速',
    debuff_atk: '弱',
    debuff_def: '破',
    shield: '盾',
    invincible: '无'
  }
  return icons[type] || '?'
}

// 监听自动战斗状态
watch(autoBattle, (newVal) => {
  if (newVal && isPlayerTurn.value) {
    // 开启自动战斗时，如果当前是玩家回合，执行自动战斗
    const unit = battleStore.currentActingUnit
    if (unit) {
      setTimeout(() => {
        executeAutoBattle(unit)
        // 自动战斗后恢复循环
        resumeLoop()
      }, 300)
    }
  }
})

// 监听 phase 变化，在玩家回合结束后恢复战斗循环
watch(phase, (newPhase) => {
  if (newPhase === 'speed_bar' && !battleEnded.value) {
    // 玩家操作完成，恢复战斗循环
    setTimeout(() => resumeLoop(), 100)
  }
})

onMounted(() => {
  initBattle()
  startBattleLoop()
})

onUnmounted(() => {
  if (battleLoopId.value) {
    cancelAnimationFrame(battleLoopId.value)
  }
})
</script>

<style scoped>
.battle-view {
  padding-bottom: 100px;
}

.speed-bar-item {
  min-width: 60px;
}

.skill-btn:disabled {
  pointer-events: none;
}

.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
