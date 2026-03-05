<template>
  <div class="profile-view">
    <!-- 角色卡片 -->
    <div class="character-card">
      <div class="avatar-section">
        <div class="avatar" :style="{ borderColor: getElementColor(playerStore.element) }">
          {{ playerStore.icon }}
        </div>
        <div class="info">
          <h2 class="name">{{ playerStore.name }}</h2>
          <div class="tags">
            <span class="tag quality" :style="{ color: getQualityColor(playerStore.quality), backgroundColor: `${getQualityColor(playerStore.quality)}22` }">
              {{ playerStore.quality }}
            </span>
            <span class="tag realm">{{ playerStore.realmInfo.fullName }}</span>
          </div>
          <div class="element">
            五行: <span :style="{ color: getElementColor(playerStore.element) }">{{ playerStore.element }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 修炼进度 -->
    <div class="panel cultivation-panel">
      <h3 class="panel-title">修炼进度</h3>
      <div class="progress-row">
        <div class="progress-header">
          <span>修为</span>
          <span class="value">{{ playerStore.cultivation }} / {{ playerStore.maxCultivation }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill cultivation" :style="{ width: `${playerStore.cultivationProgress}%` }"></div>
        </div>
      </div>
      <div v-if="playerStore.canBreakthrough" class="breakthrough-hint can">
        境界已圆满，可以进行突破！
      </div>
      <div v-else-if="playerStore.realmLevel === 9" class="breakthrough-hint wait">
        炼气九层，修为满后可突破至筑基
      </div>
    </div>

    <!-- 装备面板 -->
    <div class="panel equipment-panel">
      <h3 class="panel-title">装备</h3>
      <div class="equipment-slots">
        <div class="equipment-slot" :class="{ equipped: !!playerStore.equippedWeapon }" @click="handleEquipmentClick('weapon')">
          <div class="slot-type">武器</div>
          <div v-if="playerStore.equippedWeapon" class="slot-item" :class="playerStore.equippedWeapon.quality">
            <span class="item-icon">{{ playerStore.equippedWeapon.icon }}</span>
            <span class="item-name">{{ playerStore.equippedWeapon.name }}</span>
          </div>
          <div v-else class="slot-empty">点击装备</div>
        </div>
        <div class="equipment-slot" :class="{ equipped: !!playerStore.equippedArmor }" @click="handleEquipmentClick('armor')">
          <div class="slot-type">防具</div>
          <div v-if="playerStore.equippedArmor" class="slot-item" :class="playerStore.equippedArmor.quality">
            <span class="item-icon">{{ playerStore.equippedArmor.icon }}</span>
            <span class="item-name">{{ playerStore.equippedArmor.name }}</span>
          </div>
          <div v-else class="slot-empty">点击装备</div>
        </div>
        <div class="equipment-slot" :class="{ equipped: !!playerStore.equippedAccessory1 }" @click="handleEquipmentClick('accessory1')">
          <div class="slot-type">饰品1</div>
          <div v-if="playerStore.equippedAccessory1" class="slot-item" :class="playerStore.equippedAccessory1.quality">
            <span class="item-icon">{{ playerStore.equippedAccessory1.icon }}</span>
            <span class="item-name">{{ playerStore.equippedAccessory1.name }}</span>
          </div>
          <div v-else class="slot-empty">点击装备</div>
        </div>
        <div class="equipment-slot" :class="{ equipped: !!playerStore.equippedAccessory2 }" @click="handleEquipmentClick('accessory2')">
          <div class="slot-type">饰品2</div>
          <div v-if="playerStore.equippedAccessory2" class="slot-item" :class="playerStore.equippedAccessory2.quality">
            <span class="item-icon">{{ playerStore.equippedAccessory2.icon }}</span>
            <span class="item-name">{{ playerStore.equippedAccessory2.name }}</span>
          </div>
          <div v-else class="slot-empty">点击装备</div>
        </div>
      </div>
    </div>

    <!-- 属性面板 -->
    <div class="panel stats-panel">
      <h3 class="panel-title">属性</h3>
      <div class="stats-list">
        <div v-for="stat in statList" :key="stat.key" class="stat-row">
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-values">
            <span class="stat-total">{{ formatValue(stat) }}</span>
            <span class="stat-detail">
              ({{ stat.base }}<span v-if="stat.bonus > 0" class="bonus"> +{{ stat.bonus }}</span>)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 技能列表 -->
    <div class="panel skills-panel">
      <div class="panel-header" @click="toggleSkillsExpand">
        <h3 class="panel-title">已学技能 ({{ playerStore.learnedSkills.length }})</h3>
        <span class="expand-toggle">{{ skillsExpanded ? '收起' : '展开' }}</span>
      </div>
      <div class="skills-grid" :class="{ collapsed: !skillsExpanded && playerStore.learnedSkills.length > 4 }">
        <div v-for="learnedSkill in displayedSkills" :key="learnedSkill.id" class="skill-item">
          <div class="skill-icon" :style="{ backgroundColor: `${getSkillElementColor(learnedSkill.id)}33` }">
            {{ getSkillIcon(learnedSkill.id) }}
          </div>
          <div class="skill-info">
            <div class="skill-name">{{ getSkillName(learnedSkill.id) }} (Lv.{{ learnedSkill.level }})</div>
            <div class="skill-cost">MP: {{ getSkillCost(learnedSkill.id, learnedSkill.level) }}</div>
          </div>
        </div>
      </div>
      <div v-if="playerStore.learnedSkills.length > 4" class="skills-toggle-btn" @click="toggleSkillsExpand">
        <span>{{ skillsExpanded ? '收起技能' : `查看全部 ${playerStore.learnedSkills.length} 个技能` }}</span>
      </div>
    </div>

    <!-- 装备选择弹窗 -->
    <div v-if="showEquipModal" class="equip-modal" @click.self="closeModal">
      <div class="modal-content">
        <h4 class="modal-title">{{ getSlotName(selectedSlot!) }}</h4>

        <!-- 当前装备 -->
        <div class="current-equip section">
          <div class="section-title">当前装备</div>
          <div v-if="currentEquipped" class="equip-card current" :class="currentEquipped.quality">
            <div class="equip-header">
              <span class="equip-icon">{{ currentEquipped.icon }}</span>
              <span class="equip-name">{{ currentEquipped.name }}</span>
            </div>
            <div class="equip-stats">
              <div v-for="(value, key) in currentEquipped.bonuses" :key="key" class="stat-line">
                <span class="stat-name">{{ getStatName(key as string) }}</span>
                <span class="stat-value">+{{ formatStatValue(key as string, value as number) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-equip">未装备</div>
        </div>

        <!-- 可装备列表 -->
        <div class="available-equips section">
          <div class="section-title">可装备</div>
          <div v-if="availableEquips.length > 0" class="equip-list">
            <div
              v-for="item in availableEquips"
              :key="item.id"
              class="equip-card"
              :class="[item.equipmentData?.quality || 'common', { selected: previewEquip?.id === (item.equipmentData?.id || item.equipmentId) }]"
              @click="previewEquip = getEquipmentFromItem(item)"
              @dblclick="handleEquipItem(item)"
            >
              <div class="equip-header">
                <span class="equip-icon">{{ item.icon }}</span>
                <span class="equip-name">{{ item.name }}</span>
              </div>
              <div class="equip-stats">
                <div v-for="(value, key) in getEquipmentFromItem(item)?.bonuses" :key="key" class="stat-line">
                  <span class="stat-name">{{ getStatName(key as string) }}</span>
                  <span class="stat-value">+{{ formatStatValue(key as string, value as number) }}</span>
                  <!-- 属性差异对比 -->
                  <span v-if="currentEquipped" class="stat-diff" :class="getDiffClass(key as string, value as number)">
                    {{ getDiffText(key as string, value as number) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-equip">背包中没有可装备的物品</div>
        </div>

        <!-- 操作按钮 -->
        <div class="modal-actions">
          <button
            v-if="currentEquipped"
            class="action-btn unequip"
            @click="handleUnequip"
          >
            卸下装备
          </button>
          <button
            v-if="previewEquip"
            class="action-btn equip"
            @click="handleEquipSelectedItem"
          >
            {{ currentEquipped ? '替换装备' : '装备' }}
          </button>
          <button class="action-btn cancel" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore, type InventoryItem } from '@/stores/playerStore'
import { ELEMENT_COLORS, QUALITY_COLORS } from '@/types/unit'
import { getSkillById, calculateSkillMpCost } from '@/types/skill'
import type { Equipment } from '@/types/equipment'
import { getEquipmentById } from '@/types/equipment'

const playerStore = usePlayerStore()

const showEquipModal = ref(false)
const selectedSlot = ref<'weapon' | 'armor' | 'accessory1' | 'accessory2' | null>(null)
const previewEquip = ref<Equipment | null | undefined>(null)
const skillsExpanded = ref(false)

interface StatItem {
  key: string
  label: string
  base: number
  bonus: number
  suffix?: string
}

const statList = computed<StatItem[]>(() => {
  const base = playerStore.baseStats
  const bonus = playerStore.equipmentBonuses

  return [
    { key: 'maxHp', label: '生命', base: base.maxHp, bonus: (bonus.maxHp || 0) },
    { key: 'maxMp', label: '灵力', base: base.maxMp, bonus: (bonus.maxMp || 0) },
    { key: 'attack', label: '攻击', base: base.attack, bonus: (bonus.attack || 0) },
    { key: 'defense', label: '防御', base: base.defense, bonus: (bonus.defense || 0) },
    { key: 'speed', label: '速度', base: base.speed, bonus: (bonus.speed || 0) },
    { key: 'critRate', label: '暴击率', base: Math.round(base.critRate * 100), bonus: Math.round((bonus.critRate || 0) * 100), suffix: '%' },
    { key: 'critDamage', label: '暴击伤害', base: base.critDamage, bonus: (bonus.critDamage || 0), suffix: 'x' }
  ]
})

// 当前选中槽位的装备
const currentEquipped = computed(() => {
  if (!selectedSlot.value) return undefined
  switch (selectedSlot.value) {
    case 'weapon': return playerStore.equippedWeapon
    case 'armor': return playerStore.equippedArmor
    case 'accessory1': return playerStore.equippedAccessory1
    case 'accessory2': return playerStore.equippedAccessory2
    default: return undefined
  }
})

// 背包中可装备到此槽位的物品
const availableEquips = computed(() => {
  if (!selectedSlot.value) return []

  const slotType = selectedSlot.value === 'weapon' ? 'weapon'
    : selectedSlot.value === 'armor' ? 'armor'
    : 'accessory'

  return playerStore.inventory.filter(item => {
    if (item.type !== 'equipment') return false
    const equip = getEquipmentFromItem(item)
    if (!equip) return false
    return equip.type === slotType
  })
})

// 技能展示：默认只显示4个，展开后显示全部
const displayedSkills = computed(() => {
  const allSkills = playerStore.learnedSkills
  if (skillsExpanded.value || allSkills.length <= 4) {
    return allSkills
  }
  return allSkills.slice(0, 4)
})

function toggleSkillsExpand() {
  skillsExpanded.value = !skillsExpanded.value
}

function getEquipmentFromItem(item: InventoryItem): Equipment | undefined {
  if (item.equipmentData) return item.equipmentData
  if (item.equipmentId) return getEquipmentById(item.equipmentId)
  return undefined
}

function formatValue(stat: StatItem): string {
  const total = stat.base + stat.bonus
  if (stat.suffix === '%') return `${total}%`
  if (stat.suffix === 'x') return `${total.toFixed(1)}x`
  return total.toString()
}

function getElementColor(element: string): string {
  return ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS] || '#666'
}

function getQualityColor(quality: string): string {
  return QUALITY_COLORS[quality as keyof typeof QUALITY_COLORS] || '#666'
}

function getSkillName(skillId: string): string {
  const skill = getSkillById(skillId)
  return skill?.name || skillId
}

function getSkillIcon(skillId: string): string {
  const skill = getSkillById(skillId)
  return skill?.icon || '?'
}

function getSkillCost(skillId: string, level: number = 1): number {
  const skill = getSkillById(skillId)
  if (!skill) return 0
  return calculateSkillMpCost(skill, level)
}

function getSkillElementColor(skillId: string): string {
  const skill = getSkillById(skillId)
  const element = skill?.effects[0]?.element || '金'
  return getElementColor(element)
}

function getSlotName(slot: string): string {
  const names: Record<string, string> = {
    weapon: '武器',
    armor: '防具',
    accessory1: '饰品1',
    accessory2: '饰品2'
  }
  return names[slot] || slot
}

function getStatName(key: string): string {
  const names: Record<string, string> = {
    maxHp: '生命',
    maxMp: '灵力',
    attack: '攻击',
    defense: '防御',
    speed: '速度',
    critRate: '暴击率',
    critDamage: '暴击伤害'
  }
  return names[key] || key
}

function formatStatValue(key: string, value: number): string {
  if (key === 'critRate') return `${(value * 100).toFixed(0)}%`
  if (key === 'critDamage') return `${value.toFixed(1)}x`
  return value.toString()
}

// 获取属性差异
function getDiffValue(key: string, newValue: number): number {
  if (!currentEquipped.value) return newValue
  const currentValue = (currentEquipped.value.bonuses as Record<string, number>)[key] || 0
  return newValue - currentValue
}

function getDiffClass(key: string, newValue: number): string {
  const diff = getDiffValue(key, newValue)
  if (diff > 0) return 'positive'
  if (diff < 0) return 'negative'
  return 'neutral'
}

function getDiffText(key: string, newValue: number): string {
  const diff = getDiffValue(key, newValue)
  if (diff === 0) return ''
  const sign = diff > 0 ? '+' : ''
  if (key === 'critRate') return `(${sign}${(diff * 100).toFixed(0)}%)`
  if (key === 'critDamage') return `(${sign}${diff.toFixed(1)})`
  return `(${sign}${diff})`
}

function handleEquipmentClick(slot: 'weapon' | 'armor' | 'accessory1' | 'accessory2') {
  selectedSlot.value = slot
  previewEquip.value = null
  showEquipModal.value = true
}

function closeModal() {
  showEquipModal.value = false
  selectedSlot.value = null
  previewEquip.value = null
}

function handleEquipItem(item: InventoryItem) {
  const equipment = getEquipmentFromItem(item)
  if (!equipment) return

  if (playerStore.equip(equipment, item.id)) {
    closeModal()
  }
}

function handleEquipSelectedItem() {
  if (!previewEquip.value) return

  const item = availableEquips.value.find(i => {
    const equip = getEquipmentFromItem(i)
    return equip?.id === previewEquip.value?.id
  })

  if (item) {
    handleEquipItem(item)
  }
}

function handleUnequip() {
  if (selectedSlot.value) {
    playerStore.unequip(selectedSlot.value)
    closeModal()
  }
}
</script>

<style scoped>
.profile-view {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 角色卡片 */
.character-card {
  background: linear-gradient(145deg, rgba(30, 32, 48, 0.95), rgba(25, 27, 40, 0.95));
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: rgba(126, 184, 218, 0.1);
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.info {
  flex: 1;
}

.name {
  font-size: 1.125rem;
  color: rgb(232 228 217);
  margin: 0 0 6px 0;
}

.tags {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.tag {
  font-size: 0.625rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.tag.realm {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.element {
  font-size: 0.75rem;
  color: var(--color-muted);
}

/* 面板通用样式 */
.panel {
  background: linear-gradient(145deg, rgba(30, 32, 48, 0.95), rgba(25, 27, 40, 0.95));
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.panel-title {
  font-size: 0.875rem;
  color: var(--color-accent-warm);
  margin: 0 0 12px 0;
}

/* 修炼进度 */
.progress-row {
  margin-bottom: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: 4px;
}

.progress-header .value {
  color: #facc15;
}

.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.cultivation {
  background: linear-gradient(90deg, #eab308, #facc15);
}

.breakthrough-hint {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  text-align: center;
}

.breakthrough-hint.can {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.breakthrough-hint.wait {
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.3);
  color: #60a5fa;
}

/* 装备面板 */
.equipment-slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.equipment-slot {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.3);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.equipment-slot:hover {
  border-color: var(--color-accent);
  background: rgba(126, 184, 218, 0.1);
}

.equipment-slot.equipped {
  border-color: rgba(126, 184, 218, 0.4);
}

.slot-type {
  font-size: 0.625rem;
  color: var(--color-muted);
  margin-bottom: 6px;
}

.slot-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-item .item-icon {
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.slot-item .item-name {
  font-size: 0.75rem;
  color: rgb(232 228 217);
}

.slot-item.fine .item-icon { border: 1px solid #d4976a; }
.slot-item.excellent .item-icon { border: 1px solid #a8c4d4; }
.slot-item.supreme .item-icon { border: 1px solid #ffd700; }
.slot-item.legendary .item-icon { border: 1px solid #ff69b4; }

.slot-empty {
  font-size: 0.75rem;
  color: var(--color-accent);
}

/* 属性面板 */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(107, 114, 128, 0.15);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.stat-values {
  text-align: right;
}

.stat-total {
  font-size: 0.875rem;
  color: rgb(232 228 217);
  margin-right: 6px;
}

.stat-detail {
  font-size: 0.625rem;
  color: var(--color-muted);
}

.stat-detail .bonus {
  color: #4ade80;
}

/* 技能面板 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
}

.panel-header .panel-title {
  margin: 0;
}

.expand-toggle {
  font-size: 0.6875rem;
  color: var(--color-accent);
  padding: 2px 8px;
  background: rgba(126, 184, 218, 0.1);
  border-radius: 4px;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  transition: max-height 0.3s ease;
}

.skills-grid.collapsed {
  max-height: 200px;
  overflow: hidden;
}

.skills-toggle-btn {
  margin-top: 12px;
  padding: 8px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-accent);
  background: rgba(126, 184, 218, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skills-toggle-btn:hover {
  background: rgba(126, 184, 218, 0.2);
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.skill-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.skill-name {
  font-size: 0.75rem;
  color: rgb(232 228 217);
}

.skill-cost {
  font-size: 0.625rem;
  color: var(--color-muted);
}

/* 装备弹窗 */
.equip-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-content {
  background: linear-gradient(145deg, rgb(35, 38, 52), rgb(30, 32, 48));
  border: 1px solid rgba(126, 184, 218, 0.3);
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1rem;
  color: var(--color-accent-warm);
  margin: 0 0 12px 0;
  text-align: center;
}

.section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(107, 114, 128, 0.3);
}

.no-equip {
  text-align: center;
  color: var(--color-muted);
  font-size: 0.75rem;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.equip-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.equip-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(107, 114, 128, 0.3);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.equip-card:hover {
  border-color: var(--color-accent);
}

.equip-card.selected {
  border-color: var(--color-accent);
  background: rgba(126, 184, 218, 0.15);
}

.equip-card.current {
  border-color: rgba(74, 222, 128, 0.5);
  background: rgba(74, 222, 128, 0.1);
  cursor: default;
}

.equip-card.fine { border-left: 3px solid #d4976a; }
.equip-card.excellent { border-left: 3px solid #a8c4d4; }
.equip-card.supreme { border-left: 3px solid #ffd700; }
.equip-card.legendary { border-left: 3px solid #ff69b4; }

.equip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.equip-icon {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.equip-name {
  font-size: 0.875rem;
  color: rgb(232 228 217);
}

.equip-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-line {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.stat-line .stat-name {
  flex: 1;
  color: var(--color-muted);
}

.stat-line .stat-value {
  color: #4ade80;
}

.stat-diff {
  margin-left: 8px;
  font-size: 0.625rem;
}

.stat-diff.positive {
  color: #4ade80;
}

.stat-diff.negative {
  color: #f87171;
}

.stat-diff.neutral {
  color: var(--color-muted);
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.unequip {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.action-btn.unequip:hover {
  background: rgba(239, 68, 68, 0.3);
}

.action-btn.equip {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.action-btn.equip:hover {
  background: rgba(74, 222, 128, 0.3);
}

.action-btn.cancel {
  background: rgba(107, 114, 128, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.3);
  color: rgb(156 163 175);
}

.action-btn.cancel:hover {
  background: rgba(107, 114, 128, 0.3);
}

/* 响应式适配 */
@media (min-width: 768px) {
  .profile-view {
    max-width: 600px;
    gap: 16px;
  }

  .character-card {
    padding: 20px;
  }

  .avatar {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }

  .name {
    font-size: 1.25rem;
  }

  .panel {
    padding: 20px;
  }

  .panel-title {
    font-size: 1rem;
  }

  .skills-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .skill-item {
    padding: 10px;
  }

  .skill-icon {
    width: 42px;
    height: 42px;
    font-size: 1.125rem;
  }

  .skill-name {
    font-size: 0.875rem;
  }

  .modal-content {
    max-width: 420px;
  }
}

@media (min-width: 1024px) {
  .profile-view {
    max-width: 700px;
  }

  .equipment-slots {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .skills-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
