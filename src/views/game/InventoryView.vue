<template>
  <div class="inventory-view">
    <!-- 顶部信息栏 -->
    <div class="header-bar">
      <h2 class="title">背包</h2>
      <span class="slot-info">{{ playerStore.inventory.length }}/{{ playerStore.maxInventorySlots }}</span>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <button :class="['tab', { active: filter === 'all' }]" @click="filter = 'all'">全部</button>
      <button :class="['tab', { active: filter === 'equipment' }]" @click="filter = 'equipment'">装备</button>
      <button :class="['tab', { active: filter === 'consumable' }]" @click="filter = 'consumable'">丹药</button>
      <button :class="['tab', { active: filter === 'material' }]" @click="filter = 'material'">材料</button>
    </div>

    <!-- 物品网格 -->
    <div class="inventory-grid">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="item-slot"
        :class="[`q-${item.quality}`]"
        @click="handleItemClick(item)"
      >
        <span class="icon">{{ item.icon }}</span>
        <span v-if="item.quantity > 1" class="qty">{{ item.quantity }}</span>
      </div>
      <!-- 空槽 -->
      <div v-for="i in Math.min(emptySlots, 8)" :key="'e'+i" class="item-slot empty"></div>
    </div>

    <!-- 底部悬浮详情弹窗 -->
    <Transition name="slide-up">
      <div v-if="selectedItem" class="detail-popup">
        <div class="popup-header">
          <div class="popup-icon" :class="selectedItem.quality">{{ selectedItem.icon }}</div>
          <div class="popup-title">
            <span class="name" :class="selectedItem.quality">{{ selectedItem.name }}</span>
            <span class="type">{{ getTypeName(selectedItem.type) }}</span>
          </div>
          <button class="close-btn" @click="selectedItem = null">×</button>
        </div>

        <p class="popup-desc">{{ selectedItem.description || '暂无描述' }}</p>

        <!-- 装备属性 -->
        <div v-if="selectedItem.type === 'equipment' && selectedEquipment" class="popup-stats">
          <div v-for="(value, key) in selectedEquipment.bonuses" :key="key" class="stat-row">
            <span>{{ getStatName(key as string) }}</span>
            <span class="val">+{{ formatStatValue(key as string, value as number) }}</span>
          </div>
        </div>

        <!-- 消耗品效果 -->
        <div v-if="selectedItem.type === 'consumable' && selectedItem.effects" class="popup-effects">
          <div v-for="(effect, idx) in selectedItem.effects" :key="idx" class="effect-row">
            <span>{{ getEffectName(effect.type) }}</span>
            <span class="val">{{ formatEffectValue(effect) }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="popup-actions">
          <button v-if="selectedItem.type === 'equipment' && selectedEquipment" class="btn equip" @click="handleEquip">装备</button>
          <button v-if="selectedItem.type === 'consumable'" class="btn use" @click="handleUse">使用</button>
          <button class="btn close" @click="selectedItem = null">关闭</button>
        </div>
      </div>
    </Transition>

    <!-- 遮罩 -->
    <Transition name="fade">
      <div v-if="selectedItem" class="overlay" @click="selectedItem = null"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore, type InventoryItem } from '@/stores/playerStore'
import { getEquipmentById, type Equipment } from '@/types/equipment'
import { useToast } from '@/composables/useToast'
import { sfxItem } from '@/composables/useAudio'

const playerStore = usePlayerStore()
const { info, success } = useToast()

const filter = ref<'all' | 'equipment' | 'consumable' | 'material'>('all')
const selectedItem = ref<InventoryItem | null>(null)

const filteredItems = computed(() => {
  if (filter.value === 'all') return playerStore.inventory
  return playerStore.inventory.filter(item => item.type === filter.value)
})

const emptySlots = computed(() => {
  const count = playerStore.maxInventorySlots - filteredItems.value.length
  return Math.max(0, count)
})

const selectedEquipment = computed<Equipment | undefined>(() => {
  if (!selectedItem.value) return undefined
  if (selectedItem.value.equipmentData) return selectedItem.value.equipmentData
  if (selectedItem.value.equipmentId) return getEquipmentById(selectedItem.value.equipmentId)
  return undefined
})

function handleItemClick(item: InventoryItem) {
  sfxItem()
  selectedItem.value = item
}

function getTypeName(type: string): string {
  const names: Record<string, string> = { equipment: '装备', consumable: '消耗品', material: '材料' }
  return names[type] || type
}

function getStatName(key: string): string {
  const names: Record<string, string> = {
    maxHp: '生命', maxMp: '灵力', attack: '攻击', defense: '防御',
    speed: '速度', critRate: '暴击率', critDamage: '暴击伤害'
  }
  return names[key] || key
}

function formatStatValue(key: string, value: number): string {
  if (key === 'critRate') return `${(value * 100).toFixed(0)}%`
  if (key === 'critDamage') return `${value.toFixed(1)}x`
  return value.toString()
}

function getEffectName(type: string): string {
  const names: Record<string, string> = {
    cultivation: '修为', hp: '生命', mp: '灵力',
    buff_atk: '攻击增益', buff_def: '防御增益', buff_spd: '速度增益'
  }
  return names[type] || type
}

function formatEffectValue(effect: { type: string; value: number; duration?: number }): string {
  if (effect.type.startsWith('buff_')) {
    return `+${(effect.value * 100).toFixed(0)}% (${effect.duration || 3}回合)`
  }
  return `+${effect.value}`
}

function handleEquip() {
  if (!selectedItem.value || !selectedEquipment.value) return
  if (playerStore.equip(selectedEquipment.value, selectedItem.value.id)) {
    success(`装备了 ${selectedEquipment.value.name}`)
    selectedItem.value = null
  }
}

function handleUse() {
  if (!selectedItem.value) return
  const result = playerStore.useConsumable(selectedItem.value.id)
  if (result.success) {
    success(result.message || `使用了 ${selectedItem.value.name}`)
    selectedItem.value = null
  } else {
    info(result.message || '无法使用')
  }
}
</script>

<style scoped>
.inventory-view {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  font-size: 1rem;
  color: var(--color-accent-warm);
  margin: 0;
}

.slot-info {
  font-size: 0.75rem;
  color: var(--color-muted);
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  padding: 0 2px;
}

.tab {
  flex: 1;
  padding: 8px 6px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(107, 114, 128, 0.25);
  border-radius: 6px;
  color: var(--color-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab:hover {
  background: rgba(126, 184, 218, 0.1);
}

.tab.active {
  background: rgba(126, 184, 218, 0.2);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* 物品网格 - 6列紧凑布局 */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  flex: 1;
  padding: 0 2px 8px 0;
  overflow-y: auto;
  align-content: start;
  box-sizing: border-box;
}

/* 隐藏滚动条 */
.inventory-grid::-webkit-scrollbar {
  display: none;
}
.inventory-grid {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.item-slot {
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border: 1px solid transparent;
  min-width: 0;
}

.item-slot.empty {
  border: 1px dashed rgba(107, 114, 128, 0.2);
  background: transparent;
}

.item-slot:active:not(.empty) {
  transform: scale(0.95);
}

/* 品质边框 */
.item-slot.q-common { border-color: rgba(107, 114, 128, 0.4); }
.item-slot.q-fine { border-color: rgba(212, 151, 106, 0.6); background: rgba(212, 151, 106, 0.08); }
.item-slot.q-excellent { border-color: rgba(168, 196, 212, 0.6); background: rgba(168, 196, 212, 0.1); }
.item-slot.q-supreme { border-color: rgba(255, 215, 0, 0.5); background: rgba(255, 215, 0, 0.1); }
.item-slot.q-legendary { border-color: rgba(255, 105, 180, 0.5); background: rgba(255, 105, 180, 0.1); }

.icon {
  font-size: 1.125rem;
}

.qty {
  position: absolute;
  bottom: 1px;
  right: 2px;
  font-size: 0.5rem;
  background: rgba(0, 0, 0, 0.75);
  padding: 1px 3px;
  border-radius: 2px;
  color: #fff;
  line-height: 1.2;
  font-weight: 500;
}

/* 遮罩 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
}

/* 底部悬浮弹窗 */
.detail-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgb(30, 32, 48) 0%, rgb(35, 38, 52) 100%);
  border-top: 1px solid rgba(126, 184, 218, 0.3);
  border-radius: 16px 16px 0 0;
  padding: 12px;
  /* 底部留出tab栏的空间 */
  padding-bottom: calc(12px + 56px + env(safe-area-inset-bottom, 0px));
  z-index: 200;
  max-height: 60vh;
  overflow-y: auto;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.popup-icon {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 2px solid;
}

.popup-icon.common { border-color: #6b7280; }
.popup-icon.fine { border-color: #d4976a; }
.popup-icon.excellent { border-color: #a8c4d4; }
.popup-icon.supreme { border-color: #ffd700; }
.popup-icon.legendary { border-color: #ff69b4; }

.popup-title {
  flex: 1;
}

.popup-title .name {
  display: block;
  font-size: 0.9375rem;
  margin-bottom: 2px;
}

.popup-title .name.common { color: #9ca3af; }
.popup-title .name.fine { color: #d4976a; }
.popup-title .name.excellent { color: #a8c4d4; }
.popup-title .name.supreme { color: #ffd700; }
.popup-title .name.legendary { color: #ff69b4; }

.popup-title .type {
  font-size: 0.625rem;
  color: var(--color-muted);
}

.close-btn {
  width: 28px;
  height: 28px;
  background: rgba(107, 114, 128, 0.2);
  border: none;
  border-radius: 50%;
  color: var(--color-muted);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.popup-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(107, 114, 128, 0.15);
}

.popup-stats, .popup-effects {
  margin-bottom: 10px;
}

.stat-row, .effect-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  padding: 4px 0;
  color: var(--color-muted);
}

.stat-row .val, .effect-row .val {
  color: #4ade80;
}

.popup-actions {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(107, 114, 128, 0.15);
}

.btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn.equip {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.btn.use {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #c4b5fd;
}

.btn.close {
  background: rgba(107, 114, 128, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.3);
  color: rgb(156 163 175);
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 小屏幕适配 */
@media (max-width: 360px) {
  .inventory-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  .icon {
    font-size: 1.125rem;
  }

  .tab {
    font-size: 0.625rem;
    padding: 4px 2px;
  }
}

/* 平板和桌面端适配 */
@media (min-width: 768px) {
  .inventory-view {
    max-width: 600px;
    margin: 0 auto;
  }

  .inventory-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
  }

  .icon {
    font-size: 1.5rem;
  }

  .qty {
    font-size: 0.625rem;
    padding: 2px 5px;
  }
}
</style>
