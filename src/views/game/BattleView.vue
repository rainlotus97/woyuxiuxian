<template>
  <div class="battle-view min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col">
    <!-- 敌方区域（上方） -->
    <div class="enemy-zone flex-1 flex flex-col justify-end pb-4 relative">
      <!-- 敌方站位 -->
      <div class="enemy-formation flex justify-center items-end gap-2 px-4">
        <!-- 左侧敌人 -->
        <div class="enemy-flank flex flex-col gap-2">
          <UnitSlot
            v-for="enemy in leftEnemies"
            :key="enemy.id"
            :unit="enemy"
            :is-selected="selectedTargetIds.includes(enemy.id)"
            :is-targetable="canSelectEnemyTarget"
            :is-acting="currentActingUnitId === enemy.id"
            :is-hurt="hurtUnitIds.includes(enemy.id)"
            @click="onEnemyTargetClick(enemy.id)"
          />
        </div>

        <!-- 中间C位（BOSS/精英） -->
        <div class="enemy-center flex flex-col items-center gap-2 -mt-4">
          <UnitSlot
            v-for="enemy in centerEnemies"
            :key="enemy.id"
            :unit="enemy"
            :is-selected="selectedTargetIds.includes(enemy.id)"
            :is-targetable="canSelectEnemyTarget"
            :is-acting="currentActingUnitId === enemy.id"
            :is-hurt="hurtUnitIds.includes(enemy.id)"
            :is-c-position="true"
            @click="onEnemyTargetClick(enemy.id)"
          />
        </div>

        <!-- 右侧敌人 -->
        <div class="enemy-flank flex flex-col gap-2">
          <UnitSlot
            v-for="enemy in rightEnemies"
            :key="enemy.id"
            :unit="enemy"
            :is-selected="selectedTargetIds.includes(enemy.id)"
            :is-targetable="canSelectEnemyTarget"
            :is-acting="currentActingUnitId === enemy.id"
            :is-hurt="hurtUnitIds.includes(enemy.id)"
            @click="onEnemyTargetClick(enemy.id)"
          />
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="battle-divider relative h-12">
      <div class="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
      <!-- 回合信息 -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-400">
        第 {{ turnCount }} 回合
      </div>
      <!-- 波次信息 -->
      <div v-if="totalWaves > 1" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
        {{ currentWave }}/{{ totalWaves }}波
      </div>
    </div>

    <!-- 我方区域（下方） -->
    <div class="ally-zone flex-1 flex flex-col justify-start pt-4 relative">
      <!-- 我方站位 -->
      <div class="ally-formation flex justify-center items-start gap-2 px-4">
        <!-- 左侧伙伴 -->
        <div class="ally-flank flex flex-col gap-2">
          <UnitSlot
            v-for="companion in leftCompanions"
            :key="companion.id"
            :unit="companion"
            :is-selected="selectedTargetIds.includes(companion.id)"
            :is-targetable="canSelectAllyTarget"
            :is-acting="currentActingUnitId === companion.id"
            :is-hurt="hurtUnitIds.includes(companion.id)"
            @click="onAllyTargetClick(companion.id)"
          />
        </div>

        <!-- 中间主角（C位） -->
        <div class="ally-center flex flex-col items-center gap-2 mt-4">
          <UnitSlot
            v-if="protagonist"
            :unit="protagonist"
            :is-selected="selectedTargetIds.includes(protagonist.id)"
            :is-targetable="canSelectAllyTarget"
            :is-acting="currentActingUnitId === protagonist.id"
            :is-hurt="hurtUnitIds.includes(protagonist.id)"
            :is-c-position="true"
            @click="onAllyTargetClick(protagonist.id)"
          />
        </div>

        <!-- 右侧伙伴 -->
        <div class="ally-flank flex flex-col gap-2">
          <UnitSlot
            v-for="companion in rightCompanions"
            :key="companion.id"
            :unit="companion"
            :is-selected="selectedTargetIds.includes(companion.id)"
            :is-targetable="canSelectAllyTarget"
            :is-acting="currentActingUnitId === companion.id"
            :is-hurt="hurtUnitIds.includes(companion.id)"
            @click="onAllyTargetClick(companion.id)"
          />
        </div>
      </div>
    </div>

    <!-- 底部控制区 -->
    <div class="control-bar fixed bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
      <div class="flex items-center justify-between max-w-md mx-auto">
        <!-- 左侧菜单按钮 -->
        <div class="menu-buttons flex gap-2">
          <button
            class="menu-btn w-10 h-10 rounded-full bg-gray-700/80 flex items-center justify-center text-lg backdrop-blur border border-gray-600/50"
            @click="exitBattle"
          >
            ✕
          </button>
        </div>

        <!-- 中间行动菜单 -->
        <div v-if="showActionMenu" class="action-buttons flex gap-2">
          <button
            v-for="action in availableActions"
            :key="action.type"
            class="action-btn w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-medium transition-all backdrop-blur border"
            :class="getActionBtnClass(action.type)"
            @click="selectAction(action.type)"
          >
            <span class="text-base">{{ action.icon }}</span>
            <span class="text-[10px]">{{ action.name }}</span>
          </button>
        </div>

        <!-- 确认按钮 -->
        <div v-else-if="showConfirmButton" class="confirm-buttons flex gap-2">
          <button
            class="confirm-btn w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium backdrop-blur border border-gray-500/50"
            @click="cancelSelection"
          >
            ✕
          </button>
          <button
            class="confirm-btn w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-sm font-medium backdrop-blur border border-green-500/50"
            @click="confirmAction"
          >
            ✓
          </button>
        </div>

        <!-- 占位（当显示技能面板时） -->
        <div v-else class="action-placeholder w-48"></div>

        <!-- 右侧速度/自动按钮 -->
        <button
          class="speed-btn w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all backdrop-blur border"
          :class="getSpeedBtnClass()"
          @click="cycleSpeedAndAuto"
        >
          <span class="text-sm">{{ getSpeedIcon() }}</span>
          <span class="text-[10px]">{{ getSpeedLabel() }}</span>
        </button>
      </div>
    </div>

    <!-- 技能选择面板 -->
    <div v-if="showSkillPanel" class="skill-panel fixed inset-x-0 bottom-20 bg-gray-900/95 border-t border-gray-700 p-4 max-h-60 overflow-y-auto rounded-t-xl">
      <div class="flex justify-between items-center mb-3">
        <span class="text-white font-medium text-sm">选择技能</span>
        <button class="text-gray-400 hover:text-white text-sm" @click="cancelSkillSelection">取消</button>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="skill in availableSkills"
          :key="skill.id"
          class="skill-btn p-2 rounded-lg text-center transition-all"
          :class="getSkillBtnClass(skill)"
          :disabled="!canUseSkill(skill)"
          @click="onSkillSelect(skill.id)"
        >
          <div class="w-10 h-10 rounded-lg mx-auto mb-1 flex items-center justify-center text-lg"
            :style="{ backgroundColor: `${getElementColor(skill.effects[0]?.element || protagonist?.element || '金')}33` }">
            {{ skill.icon }}
          </div>
          <div class="text-white text-xs font-medium truncate">{{ skill.name }}</div>
          <div class="text-[10px] text-gray-400">MP: {{ skill.mpCost }}</div>
        </button>
      </div>
    </div>

    <!-- 行动顺序条（右侧竖向） -->
    <ActionOrderBar
      :units="allUnits"
      :speed-bar="speedBar"
      :current-acting-unit-id="currentActingUnitId"
    />

    <!-- 战斗结果 -->
    <div v-if="battleEnded && !isTransitioning" class="battle-result fixed inset-0 bg-black/80 flex items-center justify-center z-50">
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

    <!-- 多波战斗过渡提示 -->
    <div v-if="isTransitioning" class="wave-transition fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="text-4xl mb-4">⚔️</div>
        <div class="text-2xl text-yellow-400 font-bold">第 {{ currentWave }} 波</div>
        <div class="text-gray-400 mt-2">敌人来袭...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBattleStore } from '@/stores/battleStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useMapStore } from '@/stores/mapStore'
import { useCompanionStore } from '@/stores/companionStore'
import { createUnit, type Unit, ELEMENT_COLORS } from '@/types/unit'
import { getSkillById, getSkillsByIds, type Skill } from '@/types/skill'
import { getAreaById, ENEMIES, rollDrops, rollReward, DIFFICULTY_CONFIG, type AreaDefinition, type DropItem } from '@/types/adventure'
import UnitSlot from '@/components/battle/UnitSlot.vue'
import ActionOrderBar from '@/components/battle/ActionOrderBar.vue'

const router = useRouter()
const route = useRoute()
const battleStore = useBattleStore()
const playerStore = usePlayerStore()
const mapStore = useMapStore()
const companionStore = useCompanionStore()

// 当前区域配置
const currentArea = ref<AreaDefinition | null>(null)
const currentWave = ref(1)
const totalWaves = ref(3)
const accumulatedDrops = ref<Map<string, { item: DropItem; quantity: number }>>(new Map())
const accumulatedExp = ref(0)
const accumulatedGold = ref(0)
const isTransitioning = ref(false) // 是否正在过渡到下一波

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
const result = computed(() => battleStore.result)
const rewards = computed(() => battleStore.rewards)
const battleSpeed = computed(() => battleStore.battleSpeed)
const autoBattle = computed(() => battleStore.autoBattle)
const shouldEnemyAutoAct = computed(() => battleStore.shouldEnemyAutoAct)
const currentActingUnitId = computed(() => battleStore.currentActingUnitId)

// 主角
const protagonist = computed(() => battleStore.allyUnits.find(u => u.type === 'protagonist'))

// 存活的伙伴（用于战斗区域显示）
const aliveCompanions = computed(() => battleStore.allyUnits.filter(u => u.type === 'companion' && u.isAlive))

// 受伤动画单位ID列表
const hurtUnitIds = ref<string[]>([])

// 敌人分组（左/中/右）
const leftEnemies = computed(() => {
  const enemies = aliveEnemies.value
  return enemies.filter((_, i) => i % 3 === 0)
})

const centerEnemies = computed(() => {
  const enemies = aliveEnemies.value
  // BOSS/精英放在中间
  const bossOrElite = enemies.filter(e => e.name.includes('[BOSS]') || e.name.includes('[精英]'))
  if (bossOrElite.length > 0) return bossOrElite
  return enemies.filter((_, i) => i % 3 === 1)
})

const rightEnemies = computed(() => {
  const enemies = aliveEnemies.value
  return enemies.filter((_, i) => i % 3 === 2)
})

// 伙伴分组（左/右）
const leftCompanions = computed(() => {
  const companions = aliveCompanions.value
  return companions.filter((_, i) => i % 2 === 0)
})

const rightCompanions = computed(() => {
  const companions = aliveCompanions.value
  return companions.filter((_, i) => i % 2 === 1)
})

// 触发受伤动画
function triggerHurtAnimation(unitId: string) {
  hurtUnitIds.value.push(unitId)
  setTimeout(() => {
    const index = hurtUnitIds.value.indexOf(unitId)
    if (index > -1) {
      hurtUnitIds.value.splice(index, 1)
    }
  }, 300)
}

// 速度按钮样式
function getSpeedBtnClass(): string {
  if (autoBattle.value) {
    return battleSpeed.value >= 3
      ? 'bg-orange-500 text-white border-orange-400/50'
      : battleSpeed.value >= 2
        ? 'bg-yellow-500 text-white border-yellow-400/50'
        : 'bg-green-500 text-white border-green-400/50'
  }
  return 'bg-gray-600 text-gray-200 border-gray-500/50'
}

// 速度图标
function getSpeedIcon(): string {
  if (autoBattle.value) {
    return battleSpeed.value >= 3 ? '3x' : battleSpeed.value >= 2 ? '2x' : '1x'
  }
  return '手'
}

// 速度标签
function getSpeedLabel(): string {
  if (autoBattle.value) {
    return '自动'
  }
  return '手动'
}

// 循环切换速度和自动模式
function cycleSpeedAndAuto() {
  if (!autoBattle.value) {
    // 手动 -> 自动1x
    battleStore.toggleAutoBattle()
  } else if (battleSpeed.value === 1) {
    // 自动1x -> 自动2x
    battleStore.setBattleSpeed(2)
  } else if (battleSpeed.value === 2) {
    // 自动2x -> 自动3x
    battleStore.setBattleSpeed(3)
  } else {
    // 自动3x -> 手动
    battleStore.setBattleSpeed(1)
    battleStore.toggleAutoBattle()
  }
}

// 可用行动
const availableActions = [
  { type: 'attack' as const, name: '攻击', icon: '⚔️' },
  { type: 'skill' as const, name: '技能', icon: '✨' },
  { type: 'defend' as const, name: '防御', icon: '🛡️' },
  { type: 'flee' as const, name: '逃跑', icon: '🏃' }
]

// 可用技能（使用玩家已学习的技能，过滤掉被动技能）
const availableSkills = computed(() => {
  const unit = battleStore.currentActingUnit
  if (!unit) return []

  // 获取玩家已学习的技能ID列表
  const skillIds = unit.skills || []
  if (skillIds.length === 0) return []

  // 根据技能ID获取技能定义
  const skills = getSkillsByIds(skillIds)

  return skills.filter(skill => {
    // 过滤掉被动技能（被动技能不能在战斗中主动使用）
    if (skill.category === 'passive') return false
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
  const difficulty = area.difficulty
  const difficultyConfig = DIFFICULTY_CONFIG[difficulty]

  // 根据难度配置获取每波敌人数量
  // easy: [3], normal: [3,3,3], hard: [5,3,3,1], nightmare: [5], extreme: [1]
  const enemiesPerWave = difficultyConfig.enemiesPerWave || [3]
  const enemyCount = enemiesPerWave[wave - 1] || enemiesPerWave[enemiesPerWave.length - 1] || 3

  // 是否是超绝模式（全服Boss挑战）
  const isExtremeMode = difficulty === 'extreme'
  // 是否是噩梦模式
  const isNightmareMode = difficulty === 'nightmare'
  // 是否是困难模式的Boss波
  const isHardBossWave = difficulty === 'hard' && wave === 1

  for (let i = 0; i < enemyCount; i++) {
    // 随机选择一个敌人ID
    const randomIndex = Math.floor(Math.random() * enemyIds.length)
    const enemyId = enemyIds[randomIndex]
    if (!enemyId) continue

    const enemyDef = getEnemyDefinition(enemyId)
    if (!enemyDef) continue

    // 判断当前位置是否是C位（中间位置）
    const isCenterPosition = (enemyCount === 3 && i === 1) || (enemyCount === 5 && i === 2)

    // 计算属性倍率
    let statMultiplier = 1
    let isEnemyElite = false
    let isEnemyBoss = false

    // 超绝模式：唯一的Boss，数值爆炸高
    if (isExtremeMode) {
      statMultiplier = difficultyConfig.bossStatMult || 10
      isEnemyBoss = true
    }
    // 噩梦模式：中间位置是Boss，数值高
    else if (isNightmareMode && isCenterPosition) {
      statMultiplier = difficultyConfig.bossStatMult || 3
      isEnemyBoss = true
    }
    // 困难模式第一波：中间位置是Boss
    else if (isHardBossWave && isCenterPosition) {
      statMultiplier = 2.5
      isEnemyBoss = true
    }
    // 普通模式：中间位置是精英
    else if (difficulty === 'normal' && isCenterPosition) {
      statMultiplier = 1.5
      isEnemyElite = true
    }
    // 困难模式其他波次：中间位置是精英
    else if (difficulty === 'hard' && isCenterPosition && wave > 1) {
      statMultiplier = 1.5
      isEnemyElite = true
    }

    // 应用难度基础倍率
    statMultiplier *= difficultyConfig.enemyStatMult

    // 波次加成
    statMultiplier *= (1 + (wave - 1) * 0.2)

    enemies.push(createUnit({
      id: `enemy_${wave}_${i}`,
      name: isEnemyBoss ? `[BOSS]${enemyDef.name}` : isEnemyElite ? `[精英]${enemyDef.name}` : enemyDef.name,
      type: 'enemy',
      element: '金', // 默认元素
      realm: enemyDef.realm,
      realmLevel: enemyDef.realmLevel,
      quality: isEnemyBoss ? '仙品' : isEnemyElite ? '玄品' : '凡品',
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
        critRate: 0.05 + (isEnemyBoss ? 0.15 : isEnemyElite ? 0.08 : 0),
        critDamage: 1.5 + (isEnemyBoss ? 0.5 : isEnemyElite ? 0.2 : 0)
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
      // 根据难度配置获取波次数：简单1轮/普通2轮/困难3轮/噩梦3轮
      const difficultyConfig = DIFFICULTY_CONFIG[area.difficulty]
      totalWaves.value = difficultyConfig.waves
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

  // 添加已上阵的伙伴到 allies 数组
  const equippedCompanions = companionStore.equippedCompanions
  for (const { owned, definition, stats } of equippedCompanions) {
    if (!definition) continue

    const companionUnit = createUnit({
      id: `companion_${owned.definitionId}`,
      name: definition.name,
      type: 'companion',
      element: definition.element,
      realm: playerStore.realm, // 使用玩家当前境界
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
    })
    allies.push(companionUnit)
  }

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

  // 优先使用技能（过滤掉被动技能）
  const usableSkills = allSkills.filter(skill => {
    // 过滤掉被动技能
    if (skill.category === 'passive') return false
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

    // 如果来自地图挑战，攻占地图区域
    const mapAreaId = route.query.mapAreaId as string
    if (mapAreaId && !mapStore.isAreaConquered(mapAreaId)) {
      mapStore.conquerArea(mapAreaId)
    }
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

// 获取行动按钮样式
function getActionBtnClass(actionType: string): string {
  switch (actionType) {
    case 'attack':
      return 'bg-red-500/80 hover:bg-red-400 text-white border-red-400/50'
    case 'skill':
      return 'bg-blue-500/80 hover:bg-blue-400 text-white border-blue-400/50'
    case 'defend':
      return 'bg-green-500/80 hover:bg-green-400 text-white border-green-400/50'
    case 'flee':
      return 'bg-gray-500/80 hover:bg-gray-400 text-white border-gray-400/50'
    default:
      return 'bg-gray-500/80 hover:bg-gray-400 text-white border-gray-400/50'
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

// 记录上一次各单位HP，用于检测伤害
const lastHpMap = ref<Map<string, number>>(new Map())

// ��听单位HP变化，触发受伤动画
watch(allUnits, (units) => {
  for (const unit of units) {
    const lastHp = lastHpMap.value.get(unit.id)
    if (lastHp !== undefined && unit.stats.currentHp < lastHp) {
      // HP减少，触发受伤动画
      triggerHurtAnimation(unit.id)
    }
    lastHpMap.value.set(unit.id, unit.stats.currentHp)
  }
}, { deep: true })

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

// 监听 result 变化，处理多轮战斗
watch(result, (newResult) => {
  if (newResult === 'victory' && currentArea.value) {
    // 胜利后检查是否还有下一波
    if (currentWave.value < totalWaves.value) {
      // 累计当前波次的奖励
      const area = currentArea.value
      const waveExp = rollReward(area.expReward)
      const waveGold = rollReward(area.goldReward)
      accumulatedExp.value += waveExp
      accumulatedGold.value += waveGold

      // 累计掉落
      const drops = rollDrops(area.drops)
      for (const drop of drops) {
        const existing = accumulatedDrops.value.get(drop.item.id)
        if (existing) {
          existing.quantity += drop.quantity
        } else {
          accumulatedDrops.value.set(drop.item.id, { item: drop.item, quantity: drop.quantity })
        }
      }

      // 进入下一波
      currentWave.value++

      // 设置过渡状态，隐藏结果弹窗
      isTransitioning.value = true

      battleStore.addBattleLog({
        actorName: '系统',
        action: `第 ${currentWave.value} 波敌人来袭！`
      })

      // 延迟后生成新一波敌人
      setTimeout(() => {
        const newEnemies = generateEnemiesForWave(currentWave.value)
        if (newEnemies.length > 0) {
          // 使用 store 方法开始新一波战斗
          battleStore.startNextWave(newEnemies)

          // 结束过渡状态
          isTransitioning.value = false

          // 恢复战斗循环
          lastLoopTime = Date.now()
          battleLoopId.value = requestAnimationFrame(battleLoop)
        }
      }, 1500) // 1.5秒后开始下一波
    } else {
      // 所有波次完成，设置累计奖励
      if (accumulatedExp.value > 0 || accumulatedGold.value > 0) {
        // 通过临时变量来设置奖励
        const finalRewards = {
          cultivation: accumulatedExp.value,
          gold: accumulatedGold.value,
          items: [] as { itemId: string; quantity: number }[]
        }
        battleStore.rewards = finalRewards
      }
    }
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
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 敌方区域 */
.enemy-zone {
  background: linear-gradient(to bottom, rgba(139, 0, 0, 0.1), transparent);
}

/* 我方区域 */
.ally-zone {
  background: linear-gradient(to top, rgba(0, 100, 0, 0.1), transparent);
}

/* 分隔线 */
.battle-divider {
  background: rgba(0, 0, 0, 0.3);
}

/* 敌方阵型 */
.enemy-formation {
  perspective: 500px;
}

.enemy-flank {
  transform: translateZ(-20px);
}

.enemy-center {
  transform: translateZ(0);
  z-index: 10;
}

/* 我方阵型 */
.ally-formation {
  perspective: 500px;
}

.ally-flank {
  transform: translateZ(-20px);
}

.ally-center {
  transform: translateZ(0);
  z-index: 10;
}

/* 控制栏 */
.control-bar {
  backdrop-filter: blur(10px);
}

/* 菜单按钮 */
.menu-btn {
  transition: all 0.2s ease;
}

.menu-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.1);
}

/* 行动按钮 */
.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.action-btn:active {
  transform: scale(0.95);
}

/* 速度按钮 */
.speed-btn {
  transition: all 0.2s ease;
}

.speed-btn:hover {
  transform: scale(1.1);
}

/* 确认按钮 */
.confirm-btn {
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  transform: scale(1.1);
}

/* 技能面板 */
.skill-panel {
  backdrop-filter: blur(10px);
}

.skill-btn {
  transition: all 0.2s ease;
}

.skill-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.skill-btn:disabled {
  pointer-events: none;
  opacity: 0.5;
}

/* 波次过渡动画 */
.wave-transition {
  animation: fadeIn 0.3s ease-out;
}

.wave-transition .text-4xl {
  animation: bounce 0.6s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 自动战斗脉冲 */
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

/* 行动按钮样式 */
.bg-red-500\/80 {
  background-color: rgba(239, 68, 68, 0.8);
}

.bg-blue-500\/80 {
  background-color: rgba(59, 130, 246, 0.8);
}

.bg-green-500\/80 {
  background-color: rgba(34, 197, 94, 0.8);
}

.bg-gray-500\/80 {
  background-color: rgba(107, 114, 128, 0.8);
}

/* 速度按钮颜色 */
.bg-green-500 {
  background-color: rgb(34, 197, 94);
}

.bg-yellow-500 {
  background-color: rgb(234, 179, 8);
}

.bg-orange-500 {
  background-color: rgb(249, 115, 22);
}

.bg-gray-600 {
  background-color: rgb(75, 85, 99);
}
</style>
