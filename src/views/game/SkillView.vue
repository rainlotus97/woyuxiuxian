<template>
  <div class="skill-view">
    <div class="game-panel">
      <div class="panel-header">
        <h2 class="panel-title">功法技能</h2>
        <div class="skill-points">
          <span class="points-label">技能点</span>
          <span class="points-value">{{ playerStore.skillPoints }}</span>
        </div>
      </div>

      <!-- 技能树分支选择 -->
      <div class="branch-tabs">
        <button
          v-for="branch in skillBranches"
          :key="branch.key"
          :class="['branch-tab', { active: activeBranch === branch.key }]"
          @click="activeBranch = branch.key"
        >
          {{ branch.label }}
        </button>
      </div>

      <!-- 当前分支技能树 -->
      <div class="skill-tree">
        <div
          v-for="node in currentBranchNodes"
          :key="node.skillId"
          :class="['skill-node', getSkillNodeClass(node.skillId)]"
        >
          <div class="skill-icon" :style="getSkillIconStyle(node.skillId)">
            {{ getSkillIcon(node.skillId) }}
          </div>
          <div class="skill-info">
            <div class="skill-header">
              <span class="skill-name">{{ getSkillName(node.skillId) }}</span>
              <span v-if="isLearned(node.skillId)" class="skill-level-badge">
                Lv.{{ getLearnedLevel(node.skillId) }}
              </span>
            </div>
            <div class="skill-desc">{{ getSkillDesc(node.skillId) }}</div>

            <!-- 经验条（已学习技能） -->
            <div v-if="isLearned(node.skillId)" class="skill-exp-bar">
              <div class="exp-fill" :style="{ width: `${getExpProgress(node.skillId)}%` }"></div>
            </div>

            <!-- 技能效果预览 -->
            <div class="skill-effects">
              <span v-for="effect in getSkillEffects(node.skillId)" :key="effect" class="effect-tag">
                {{ effect }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="skill-actions">
            <template v-if="!isLearned(node.skillId)">
              <GameButton
                v-if="canLearn(node.skillId)"
                @click="handleLearn(node.skillId)"
                size="small"
              >
                学习
              </GameButton>
              <span v-else class="locked-hint">
                {{ getLockReason(node.skillId) }}
              </span>
            </template>
            <template v-else>
              <div class="learned-actions">
                <GameButton
                  v-if="canUpgrade(node.skillId)"
                  @click="handleUpgrade(node.skillId)"
                  size="small"
                >
                  升级
                </GameButton>
                <button
                  :class="['toggle-btn', { enabled: isSkillEnabled(node.skillId) }]"
                  @click="handleToggle(node.skillId)"
                  :title="isSkillEnabled(node.skillId) ? '点击禁用' : '点击启用'"
                >
                  {{ isSkillEnabled(node.skillId) ? '启' : '禁' }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 被动加成预览 -->
      <div class="passive-bonuses" v-if="Object.keys(playerStore.skillBonuses).length > 0">
        <h3 class="bonuses-title">被动加成</h3>
        <div class="bonuses-list">
          <span v-for="(value, stat) in playerStore.skillBonuses" :key="stat" class="bonus-item">
            {{ getStatLabel(stat as keyof UnitStats) }}: +{{ formatBonus(stat as keyof UnitStats, value ?? 0) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useToast } from '@/composables/useToast'
import { sfxSkillUp } from '@/composables/useAudio'
import GameButton from '@/components/common/GameButton.vue'
import type { SkillBranch as SkillBranchType, SkillTreeNode } from '@/types/skill'
import { SKILL_TREE, getSkillDefinition, calculateSkillMpCost } from '@/types/skill'
import type { UnitStats, Realm } from '@/types/unit'
import { REALM_ORDER } from '@/types/unit'

const playerStore = usePlayerStore()
const { success, warning, info } = useToast()

// 技能分支选项
const skillBranches = [
  { key: 'attack' as SkillBranchType, label: '攻击' },
  { key: 'defense' as SkillBranchType, label: '防御' },
  { key: 'cultivation' as SkillBranchType, label: '修炼' },
  { key: 'special' as SkillBranchType, label: '特殊' }
]

const activeBranch = ref<SkillBranchType>('attack')

// 当前分支的技能节点
const currentBranchNodes = computed<SkillTreeNode[]>(() => {
  return SKILL_TREE[activeBranch.value] || []
})

// 获取技能信息
function getSkillIcon(skillId: string): string {
  return getSkillDefinition(skillId)?.icon || '?'
}

function getSkillName(skillId: string): string {
  return getSkillDefinition(skillId)?.name || '未知技能'
}

function getSkillDesc(skillId: string): string {
  return getSkillDefinition(skillId)?.description || ''
}

function getSkillIconStyle(skillId: string): Record<string, string> {
  const skill = getSkillDefinition(skillId)
  if (!skill) return {}

  const categoryColors: Record<string, string> = {
    attack: 'rgba(199, 80, 80, 0.2)',
    defense: 'rgba(80, 140, 199, 0.2)',
    support: 'rgba(80, 199, 120, 0.2)',
    passive: 'rgba(180, 150, 220, 0.2)'
  }

  return {
    background: categoryColors[skill.category] || 'rgba(126, 184, 218, 0.1)'
  }
}

function getSkillNodeClass(skillId: string): string[] {
  const classes: string[] = []

  if (isLearned(skillId)) {
    classes.push('learned')
  } else if (canLearn(skillId)) {
    classes.push('available')
  } else {
    classes.push('locked')
  }

  return classes
}

// 检查技能状态
function isLearned(skillId: string): boolean {
  return playerStore.hasLearnedSkill(skillId)
}

function canLearn(skillId: string): boolean {
  return playerStore.canLearnSkill(skillId)
}

function canUpgrade(skillId: string): boolean {
  const learned = playerStore.getLearnedSkill(skillId)
  const definition = getSkillDefinition(skillId)

  if (!learned || !definition) return false
  if (learned.level >= definition.maxLevel) return false
  if (playerStore.skillPoints < 1) return false

  return true
}

function isSkillEnabled(skillId: string): boolean {
  const learned = playerStore.getLearnedSkill(skillId)
  return learned?.enabled ?? false
}

function getLearnedLevel(skillId: string): number {
  return playerStore.getLearnedSkill(skillId)?.level || 1
}

function getExpProgress(skillId: string): number {
  const learned = playerStore.getLearnedSkill(skillId)
  if (!learned) return 0
  return (learned.exp / learned.maxExp) * 100
}

function getLockReason(skillId: string): string {
  const definition = getSkillDefinition(skillId)
  if (!definition) return '未知技能'

  // 检查前置技能
  if (definition.prerequisites) {
    for (const prereq of definition.prerequisites) {
      if (!playerStore.hasLearnedSkill(prereq)) {
        const prereqDef = getSkillDefinition(prereq)
        return `需要先学习: ${prereqDef?.name || prereq}`
      }
    }
  }

  // 检查境界要求
  if (definition.unlockRealm) {
    const currentRealmIndex = REALM_ORDER.indexOf(playerStore.realm)
    const requiredRealmIndex = REALM_ORDER.indexOf(definition.unlockRealm as Realm)
    if (currentRealmIndex < requiredRealmIndex) {
      return `需要境界: ${definition.unlockRealm}`
    }
  }

  // 检查技能点
  if (playerStore.skillPoints < 1) {
    return '技能点不足'
  }
  return '条件不满足'
}

function getSkillEffects(skillId: string): string[] {
  const definition = getSkillDefinition(skillId)
  if (!definition) return []

  const effects: string[] = []

  // MP 消耗
  const mpCost = calculateSkillMpCost(definition, getLearnedLevel(skillId))
  if (mpCost > 0) {
    effects.push(`MP:${mpCost}`)
  }

  // 冷却
  if (definition.cooldown > 0) {
    effects.push(`CD:${definition.cooldown}回合`)
  }

  // 效果类型
  for (const effect of definition.effects) {
    switch (effect.type) {
      case 'damage':
        effects.push('伤害')
        break
      case 'heal':
        effects.push('治疗')
        break
      case 'buff':
        effects.push('增益')
        break
      case 'debuff':
        effects.push('减益')
        break
    }
  }

  // 被动加成
  if (definition.passiveBonus) {
    effects.push(`被动+${definition.passiveBonus.valuePerLevel}/级`)
  }

  return effects
}

function getStatLabel(stat: keyof UnitStats): string {
  const labels: Record<keyof UnitStats, string> = {
    maxHp: '生命上限',
    currentHp: '当前生命',
    maxMp: '灵力上限',
    currentMp: '当前灵力',
    attack: '攻击',
    defense: '防御',
    speed: '速度',
    critRate: '暴击率',
    critDamage: '暴击伤害'
  }
  return labels[stat] || stat
}

function formatBonus(stat: keyof UnitStats, value: number): string {
  if (stat === 'critRate') {
    return `${(value * 100).toFixed(0)}%`
  }
  if (stat === 'critDamage') {
    return `${value.toFixed(1)}x`
  }
  return `${value}`
}

// 操作处理
function handleLearn(skillId: string) {
  if (playerStore.learnSkill(skillId)) {
    const skill = getSkillDefinition(skillId)
    success(`学会了 ${skill?.name || skillId}！`)
    sfxSkillUp()
  } else {
    warning('无法学习该技能')
  }
}

function handleUpgrade(skillId: string) {
  if (playerStore.upgradeSkill(skillId)) {
    const skill = getSkillDefinition(skillId)
    const learned = playerStore.getLearnedSkill(skillId)
    success(`${skill?.name || skillId} 升级到 Lv.${learned?.level}！`)
    sfxSkillUp()
  } else {
    warning('无法升级该技能')
  }
}

function handleToggle(skillId: string) {
  if (playerStore.toggleSkillEnabled(skillId)) {
    const skill = getSkillDefinition(skillId)
    const enabled = isSkillEnabled(skillId)
    info(`${skill?.name || skillId} ${enabled ? '已启用' : '已禁用'}`)
  }
}
</script>

<style scoped>
.skill-view {
  padding-bottom: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  margin: 0;
}

.skill-points {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(126, 184, 218, 0.1);
  padding: 4px 12px;
  border-radius: 16px;
}

.points-label {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.points-value {
  font-size: 1rem;
  color: var(--color-accent);
  font-weight: bold;
}

.branch-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.branch-tab {
  flex: 1;
  min-width: 60px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 8px;
  color: var(--color-muted);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.branch-tab.active {
  background: rgba(126, 184, 218, 0.2);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.skill-tree {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-node {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.2s ease;
}

.skill-node.learned {
  border-color: rgba(80, 199, 120, 0.4);
  background: rgba(80, 199, 120, 0.1);
}

.skill-node.available {
  border-color: rgba(126, 184, 218, 0.4);
}

.skill-node.locked {
  opacity: 0.6;
}

.skill-icon {
  width: 48px;
  height: 48px;
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.skill-info {
  flex: 1;
  min-width: 0;
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.skill-name {
  font-size: 0.875rem;
  color: rgb(232 228 217);
}

.skill-level-badge {
  font-size: 0.75rem;
  color: var(--color-accent);
  background: rgba(126, 184, 218, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.skill-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: 6px;
  line-height: 1.4;
}

.skill-exp-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-warm));
  transition: width 0.3s ease;
}

.skill-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.effect-tag {
  font-size: 0.625rem;
  color: var(--color-muted);
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
}

.skill-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.locked-hint {
  font-size: 0.75rem;
  color: rgba(199, 80, 80, 0.8);
  white-space: nowrap;
}

.learned-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-btn {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(126, 184, 218, 0.3);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.enabled {
  background: rgba(80, 199, 120, 0.3);
  border-color: rgba(80, 199, 120, 0.5);
  color: rgb(80, 199, 120);
}

.passive-bonuses {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 8px;
}

.bonuses-title {
  font-size: 0.875rem;
  color: var(--color-accent-warm);
  margin: 0 0 8px 0;
}

.bonuses-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bonus-item {
  font-size: 0.75rem;
  color: rgb(80, 199, 120);
  background: rgba(80, 199, 120, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
