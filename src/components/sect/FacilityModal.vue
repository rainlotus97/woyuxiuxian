<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- 头部 -->
      <div class="modal-header">
        <div class="header-info">
          <span class="facility-icon">{{ facility?.icon }}</span>
          <div class="header-text">
            <h3 class="facility-name">{{ facility?.name }}</h3>
            <span class="facility-level">Lv.{{ facilityLevel }}</span>
          </div>
        </div>
        <button class="close-btn" @click="close">×</button>
      </div>

      <!-- 效果说明 -->
      <div class="facility-effect">
        <span class="effect-label">当前效果:</span>
        <span class="effect-value">{{ currentEffect }}</span>
      </div>

      <!-- 炼丹炉内容 -->
      <div v-if="facilityId === 'alchemy_furnace'" class="facility-body">
        <div class="section-title">炼丹配方</div>
        <div class="recipe-list">
          <div
            v-for="recipe in availableRecipes"
            :key="recipe.id"
            class="recipe-card"
            :class="{ disabled: !canCraft(recipe) }"
            @click="handleCraft(recipe)"
          >
            <div class="recipe-header">
              <span class="recipe-icon">{{ recipe.icon }}</span>
              <div class="recipe-info">
                <span class="recipe-name">{{ recipe.name }}</span>
                <span class="recipe-quality" :class="recipe.quality">
                  {{ getQualityLabel(recipe.quality) }}
                </span>
              </div>
            </div>
            <div class="recipe-materials">
              <span class="material-label">材料:</span>
              <span
                v-for="mat in recipe.materials"
                :key="mat.itemId"
                class="material-item"
                :class="{ insufficient: !hasMaterial(mat) }"
              >
                {{ getMaterialName(mat.itemId) }} x{{ mat.quantity }}
              </span>
            </div>
            <div class="recipe-footer">
              <span class="success-rate">成功率: {{ getSuccessRate(recipe) }}%</span>
              <button
                class="craft-btn"
                :disabled="!canCraft(recipe)"
                @click.stop="handleCraft(recipe)"
              >
                炼制
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 药园内容 -->
      <div v-else-if="facilityId === 'medicine_garden'" class="facility-body">
        <div class="section-title">药园槽位</div>
        <div class="garden-slots">
          <div
            v-for="(slot, index) in displaySlots"
            :key="index"
            class="garden-slot"
            :class="{ locked: index >= slotCount, planted: slot != null, ready: isReady(slot) }"
          >
            <template v-if="index >= slotCount">
              <div class="slot-locked">
                <span class="lock-icon">🔒</span>
                <span class="lock-text">需要药园Lv.{{ getRequiredLevel(index) }}</span>
              </div>
            </template>
            <template v-else-if="slot">
              <div class="slot-planted">
                <span class="crop-icon">{{ getCropIcon(slot) }}</span>
                <div class="crop-info">
                  <span class="crop-name">{{ getCropName(slot) }}</span>
                  <span v-if="isReady(slot)" class="crop-status ready">已成熟</span>
                  <span v-else class="crop-status">{{ getRemainingTime(slot) }}</span>
                </div>
                <div class="slot-actions">
                  <button
                    v-if="isReady(slot)"
                    class="action-btn harvest"
                    @click="handleHarvest(index)"
                  >
                    收获
                  </button>
                  <button
                    v-else
                    class="action-btn accelerate"
                    @click="handleAccelerate(index)"
                  >
                    加速
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="slot-empty" @click="showSeedSelector(index)">
                <span class="empty-icon">🌱</span>
                <span class="empty-text">点击种植</span>
              </div>
            </template>
          </div>
        </div>

        <!-- 种子选择器 -->
        <div v-if="selectingSlot !== null" class="seed-selector">
          <div class="selector-header">
            <span>选择种子</span>
            <button class="close-selector" @click="selectingSlot = null">×</button>
          </div>
          <div class="seed-list">
            <div
              v-for="seed in availableSeeds"
              :key="seed.id"
              class="seed-card"
              :class="{ disabled: !canPlant(seed) }"
              @click="handlePlant(seed)"
            >
              <span class="seed-icon">{{ seed.icon }}</span>
              <div class="seed-info">
                <span class="seed-name">{{ seed.name }}</span>
                <span class="seed-time">{{ seed.growTime }}分钟</span>
              </div>
              <span class="seed-price">💎{{ seed.buyPrice }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他设施内容 -->
      <div v-else class="facility-body">
        <div class="section-title">设施信息</div>
        <div class="facility-description">
          {{ facility?.description }}
        </div>
        <div class="upgrade-info">
          <div class="current-level">
            <span class="label">当前等级:</span>
            <span class="value">Lv.{{ facilityLevel }}</span>
          </div>
          <div class="next-effect" v-if="facilityLevel < (facility?.maxLevel || 5)">
            <span class="label">下一级效果:</span>
            <span class="value">{{ nextEffect }}</span>
          </div>
        </div>
      </div>

      <!-- 升级按钮 -->
      <div class="modal-footer">
        <button
          v-if="canUpgrade"
          class="upgrade-btn"
          :disabled="!canUpgrade"
          @click="handleUpgrade"
        >
          <span class="upgrade-icon">⬆️</span>
          升级 ({{ upgradeCost }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSectStore } from '@/stores/sectStore'
import { usePlayerStore } from '@/stores/playerStore'
import { SECT_FACILITIES, type SectFacility } from '@/types/sect'
import { ALCHEMY_RECIPES, type AlchemyRecipe } from '@/types/alchemy'
import { SEEDS, type SeedDefinition, type PlantedCrop } from '@/types/garden'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  visible: boolean
  facilityId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const sectStore = useSectStore()
const playerStore = usePlayerStore()
const { success, warning } = useToast()

const selectingSlot = ref<number | null>(null)

// 获取设施信息
const facility = computed(() => {
  return SECT_FACILITIES.find(f => f.id === props.facilityId)
})

// 设施等级
const facilityLevel = computed(() => {
  return sectStore.getFacilityLevel(props.facilityId)
})

// 当前效果描述
const currentEffect = computed(() => {
  if (!facility.value) return ''
  const effect = facility.value.effects[0]
  if (!effect) return ''
  // value 表示每级增加的百分比
  const bonus = facilityLevel.value * effect.value
  return `${effect.description.replace(/\+\d+%/, '')}+${bonus}%`
})

// 下一级效果
const nextEffect = computed(() => {
  if (!facility.value) return ''
  const effect = facility.value.effects[0]
  if (!effect) return ''
  const bonus = (facilityLevel.value + 1) * effect.value
  return `${effect.description.replace(/\+\d+%/, '')}+${bonus}%`
})

// 是否可以升级
const canUpgrade = computed(() => {
  if (!facility.value) return false
  if (facilityLevel.value >= (facility.value.maxLevel || 5)) return false
  return sectStore.contribution >= (facility.value.upgradeCost?.contribution || 0) &&
         playerStore.gold >= (facility.value.upgradeCost?.gold || 0)
})

// 升级消耗
const upgradeCost = computed(() => {
  if (!facility.value?.upgradeCost) return ''
  return `${facility.value.upgradeCost.contribution}贡献 ${facility.value.upgradeCost.gold}灵石`
})

// ====== 炼丹相关 ======

const availableRecipes = computed(() => {
  return ALCHEMY_RECIPES.filter(r => r.requiredFacilityLevel <= facilityLevel.value)
})

function canCraft(recipe: AlchemyRecipe): boolean {
  for (const mat of recipe.materials) {
    if (!hasMaterial(mat)) return false
  }
  return true
}

function hasMaterial(mat: { itemId: string; quantity: number }): boolean {
  if (mat.itemId === 'gold') {
    return playerStore.gold >= mat.quantity
  }
  const item = playerStore.inventory.find(i => i.id === mat.itemId || i.name === mat.itemId)
  return (item?.quantity || 0) >= mat.quantity
}

function getMaterialName(itemId: string): string {
  if (itemId === 'gold') return '灵石'
  const item = playerStore.inventory.find(i => i.id === itemId || i.name === itemId)
  return item?.name || itemId
}

function getSuccessRate(recipe: AlchemyRecipe): number {
  return Math.min(100, Math.floor((recipe.baseSuccessRate + facilityLevel.value * 0.05) * 100))
}

function getQualityLabel(quality: string): string {
  const labels: Record<string, string> = {
    common: '凡品',
    fine: '灵品',
    rare: '玄品',
    epic: '仙品',
    legendary: '神品'
  }
  return labels[quality] || quality
}

function handleCraft(recipe: AlchemyRecipe) {
  if (!canCraft(recipe)) {
    warning('材料不足')
    return
  }
  const result = sectStore.craftAlchemy(recipe.id)
  if (result.success) {
    success(result.message)
  } else {
    warning(result.message)
  }
}

// ====== 药园相关 ======

const slotCount = computed(() => {
  const level = facilityLevel.value
  if (level >= 5) return 3
  if (level >= 3) return 2
  return 1
})

const displaySlots = computed(() => {
  return [0, 1, 2].map(i => {
    if (i < sectStore.gardenSlots.length) {
      return sectStore.gardenSlots[i]
    }
    return null
  })
})

const availableSeeds = computed(() => {
  return SEEDS.filter(s => s.requiredGardenLevel <= facilityLevel.value)
})

function getRequiredLevel(slotIndex: number): number {
  if (slotIndex === 0) return 1
  if (slotIndex === 1) return 3
  return 5
}

function getCropIcon(slot: PlantedCrop | null): string {
  if (!slot) return ''
  const seed = SEEDS.find(s => s.id === slot.seedId)
  return seed?.icon || '🌱'
}

function getCropName(slot: PlantedCrop | null): string {
  if (!slot) return ''
  const seed = SEEDS.find(s => s.id === slot.seedId)
  return seed?.name || '未知作物'
}

function isReady(slot: PlantedCrop | null): boolean {
  if (!slot) return false
  return Date.now() >= slot.readyAt
}

function getRemainingTime(slot: PlantedCrop | null): string {
  if (!slot) return ''
  const remaining = slot.readyAt - Date.now()
  if (remaining <= 0) return '已成熟'

  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

function showSeedSelector(slotIndex: number) {
  selectingSlot.value = slotIndex
}

function canPlant(seed: SeedDefinition): boolean {
  return playerStore.gold >= seed.buyPrice
}

function handlePlant(seed: SeedDefinition) {
  if (selectingSlot.value === null) return

  const result = sectStore.plantSeed(seed.id, selectingSlot.value)
  if (result.success) {
    success(result.message)
    selectingSlot.value = null
  } else {
    warning(result.message)
  }
}

function handleHarvest(slotIndex: number) {
  const result = sectStore.harvestCrop(slotIndex)
  if (result.success) {
    success(result.message)
  } else {
    warning(result.message)
  }
}

function handleAccelerate(slotIndex: number) {
  const result = sectStore.accelerateCrop(slotIndex)
  if (result.success) {
    success(result.message)
  } else {
    warning(result.message)
  }
}

// ====== 通用操作 ======

function handleUpgrade() {
  const result = sectStore.upgradeFacility(props.facilityId)
  if (result) {
    success('升级成功')
  } else {
    warning('升级失败，资源不足')
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: linear-gradient(180deg, rgba(35, 38, 52, 0.98) 0%, rgba(25, 27, 38, 0.98) 100%);
  border: 1px solid rgba(126, 184, 218, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(126, 184, 218, 0.15);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.facility-icon {
  font-size: 2rem;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.facility-name {
  font-size: 1.125rem;
  color: var(--color-accent);
  font-weight: 500;
}

.facility-level {
  font-size: 0.75rem;
  color: var(--color-accent-warm);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--color-muted);
  font-size: 1.25rem;
  cursor: pointer;
}

.facility-effect {
  padding: 12px 16px;
  background: rgba(126, 184, 218, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.effect-label {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.effect-value {
  font-size: 0.875rem;
  color: var(--color-success);
}

.facility-body {
  padding: 16px;
}

.section-title {
  font-size: 0.875rem;
  color: var(--color-accent);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(126, 184, 218, 0.15);
}

/* 炼丹配方样式 */
.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recipe-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.recipe-card:hover:not(.disabled) {
  border-color: var(--color-accent);
}

.recipe-card.disabled {
  opacity: 0.5;
}

.recipe-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.recipe-icon {
  font-size: 1.5rem;
}

.recipe-info {
  display: flex;
  flex-direction: column;
}

.recipe-name {
  font-size: 0.9375rem;
  color: rgb(232 228 217);
}

.recipe-quality {
  font-size: 0.625rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.recipe-quality.common { background: rgba(156, 163, 175, 0.2); color: #9ca3af; }
.recipe-quality.fine { background: rgba(126, 184, 218, 0.2); color: #7eb8da; }
.recipe-quality.rare { background: rgba(183, 148, 246, 0.2); color: #b794f6; }
.recipe-quality.epic { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.recipe-quality.legendary { background: rgba(255, 215, 0, 0.2); color: #ffd700; }

.recipe-materials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.material-label {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.material-item {
  font-size: 0.6875rem;
  color: var(--color-text);
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.material-item.insufficient {
  color: var(--color-danger);
}

.recipe-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.success-rate {
  font-size: 0.75rem;
  color: var(--color-success);
}

.craft-btn {
  padding: 6px 16px;
  background: linear-gradient(145deg, rgba(126, 184, 218, 0.3), rgba(126, 184, 218, 0.1));
  border: 1px solid rgba(126, 184, 218, 0.4);
  border-radius: 8px;
  color: var(--color-accent);
  font-size: 0.75rem;
  cursor: pointer;
}

.craft-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 药园样式 */
.garden-slots {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.garden-slot {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  padding: 12px;
  min-height: 60px;
}

.garden-slot.locked {
  opacity: 0.5;
}

.garden-slot.planted {
  border-color: rgba(74, 222, 128, 0.3);
}

.garden-slot.ready {
  border-color: rgba(251, 191, 36, 0.5);
}

.slot-locked {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 4px;
}

.lock-icon {
  font-size: 1.25rem;
}

.lock-text {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.slot-planted {
  display: flex;
  align-items: center;
  gap: 12px;
}

.crop-icon {
  font-size: 1.5rem;
}

.crop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.crop-name {
  font-size: 0.875rem;
  color: rgb(232 228 217);
}

.crop-status {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.crop-status.ready {
  color: var(--color-success);
}

.slot-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  border: none;
}

.action-btn.harvest {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.action-btn.accelerate {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fbbf24;
}

.slot-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 4px;
  cursor: pointer;
}

.empty-icon {
  font-size: 1.5rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.75rem;
  color: var(--color-muted);
}

/* 种子选择器 */
.seed-selector {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: var(--color-accent);
}

.close-selector {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--color-muted);
  cursor: pointer;
}

.seed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seed-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 8px;
  cursor: pointer;
}

.seed-card:hover:not(.disabled) {
  border-color: var(--color-accent);
}

.seed-card.disabled {
  opacity: 0.5;
}

.seed-icon {
  font-size: 1.25rem;
}

.seed-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.seed-name {
  font-size: 0.8125rem;
  color: rgb(232 228 217);
}

.seed-time {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.seed-price {
  font-size: 0.75rem;
  color: #fbbf24;
}

/* 其他设施样式 */
.facility-description {
  font-size: 0.8125rem;
  color: var(--color-muted);
  line-height: 1.5;
  margin-bottom: 16px;
}

.upgrade-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.current-level,
.next-effect {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
}

.label {
  color: var(--color-muted);
}

.value {
  color: var(--color-accent);
}

/* 底部 */
.modal-footer {
  padding: 16px;
  border-top: 1px solid rgba(126, 184, 218, 0.15);
}

.upgrade-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(145deg, rgba(200, 164, 92, 0.3), rgba(200, 164, 92, 0.1));
  border: 1px solid rgba(200, 164, 92, 0.4);
  border-radius: 12px;
  color: var(--color-accent-warm);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upgrade-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upgrade-icon {
  font-size: 1rem;
}
</style>
