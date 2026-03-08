<template>
  <div class="shop-view">
    <div class="game-panel">
      <h2 class="panel-title">坊市</h2>
      <p class="panel-desc">购买修炼所需物品</p>

      <!-- 分类标签 - 立即响应 -->
      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['tab', { active: activeTab === cat.id }]"
          @click="handleTabClick(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Loading状态 -->
      <div v-show="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <!-- 商品列表 - 使用v-show缓存DOM -->
      <div
        v-show="!isLoading"
        class="shop-grid"
        :key="displayCategory"
      >
        <div
          v-for="item in currentItems"
          :key="item.id"
          v-memo="[item.id, canAfford(item)]"
          class="shop-item"
          :class="{ 'affordable': canAfford(item), 'unaffordable': !canAfford(item) }"
          @click="handleBuy(item)"
        >
          <div class="item-icon" :class="item.quality">{{ item.icon }}</div>
          <div class="item-info">
            <div class="item-name" :class="item.quality">{{ item.name }}</div>
            <div class="item-desc">{{ item.description }}</div>
            <div class="item-price">
              <span class="price-value">{{ item.price }}</span>
              <span class="price-unit">灵石</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 购买确认弹窗 -->
      <div v-if="showConfirm" class="confirm-modal" @click.self="showConfirm = false">
        <div class="modal-content">
          <h4 class="modal-title">确认购买</h4>
          <div class="item-preview">
            <span class="preview-icon" :class="selectedItem?.quality">{{ selectedItem?.icon }}</span>
            <div class="preview-info">
              <div class="preview-name" :class="selectedItem?.quality">{{ selectedItem?.name }}</div>
              <div class="preview-price">{{ selectedItem?.price }} 灵石</div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="action-btn cancel" @click="showConfirm = false">取消</button>
            <button class="action-btn confirm" @click="confirmBuy">确认购买</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, shallowRef } from 'vue'
import { usePlayerStore, type InventoryItem } from '@/stores/playerStore'
import { useToast } from '@/composables/useToast'
import { useAudio, sfxSpiritStone } from '@/composables/useAudio'
import { useModal } from '@/composables/useModal'
import type { Equipment } from '@/types/equipment'

const playerStore = usePlayerStore()
const { success, warning } = useToast()
const { startShopBgm } = useAudio()
const { showItemAcquire } = useModal()

onMounted(() => {
  startShopBgm()
})

// UI状态
const activeTab = ref('all')          // 当前激活的tab（立即响应）
const displayCategory = ref('all')    // 当前显示的分类（延迟更新）
const isLoading = ref(false)          // loading状态
const showConfirm = ref(false)
const selectedItem = shallowRef<ShopItem | null>(null)

interface ShopItem {
  id: string
  name: string
  icon: string
  category: string
  type: 'equipment' | 'consumable' | 'material'
  quality: string
  price: number
  description: string
  equipmentId?: string
  equipmentData?: Equipment
  effects?: { type: string; value: number; duration?: number }[]
}

const categories = [
  { id: 'all', name: '全部' },
  { id: 'equipment', name: '装备' },
  { id: 'consumable', name: '丹药' },
  { id: 'material', name: '材料' }
]

// 使用shallowRef避免深层响应式追踪
const shopItems = shallowRef<ShopItem[]>([
  // ========== 装备 ==========
  {
    id: 'shop_weapon_001',
    name: '新手木剑',
    icon: '木',
    category: 'equipment',
    type: 'equipment',
    quality: 'common',
    price: 50,
    description: '攻击+5',
    equipmentId: 'weapon_001'
  },
  {
    id: 'shop_weapon_002',
    name: '玄铁剑',
    icon: '剑',
    category: 'equipment',
    type: 'equipment',
    quality: 'fine',
    price: 200,
    description: '攻击+15, 暴击率+5%',
    equipmentId: 'weapon_002'
  },
  {
    id: 'shop_armor_001',
    name: '皮甲',
    icon: '甲',
    category: 'equipment',
    type: 'equipment',
    quality: 'fine',
    price: 180,
    description: '生命+50, 防御+8',
    equipmentId: 'armor_002'
  },
  {
    id: 'shop_armor_002',
    name: '布衣',
    icon: '布',
    category: 'equipment',
    type: 'equipment',
    quality: 'common',
    price: 30,
    description: '生命+20, 防御+2',
    equipmentId: 'armor_001'
  },
  {
    id: 'shop_accessory_001',
    name: '铜戒指',
    icon: '戒',
    category: 'equipment',
    type: 'equipment',
    quality: 'common',
    price: 40,
    description: '速度+3',
    equipmentId: 'accessory_001'
  },
  {
    id: 'shop_accessory_002',
    name: '灵玉佩',
    icon: '玉',
    category: 'equipment',
    type: 'equipment',
    quality: 'fine',
    price: 150,
    description: '灵力+30, 速度+5',
    equipmentId: 'accessory_002'
  },

  // ========== 丹药 ==========
  {
    id: 'shop_consumable_001',
    name: '聚气丹',
    icon: '丹',
    category: 'consumable',
    type: 'consumable',
    quality: 'fine',
    price: 50,
    description: '服用后增加50修为',
    effects: [{ type: 'cultivation', value: 50 }]
  },
  {
    id: 'shop_consumable_002',
    name: '疗伤丹',
    icon: '药',
    category: 'consumable',
    type: 'consumable',
    quality: 'common',
    price: 30,
    description: '服用后恢复50生命',
    effects: [{ type: 'hp', value: 50 }]
  },
  {
    id: 'shop_consumable_003',
    name: '回灵丹',
    icon: '灵',
    category: 'consumable',
    type: 'consumable',
    quality: 'common',
    price: 25,
    description: '服用后恢复30灵力',
    effects: [{ type: 'mp', value: 30 }]
  },
  {
    id: 'shop_consumable_004',
    name: '大力丸',
    icon: '力',
    category: 'consumable',
    type: 'consumable',
    quality: 'fine',
    price: 100,
    description: '战斗中攻击+20%，持续3回合',
    effects: [{ type: 'buff_atk', value: 0.2, duration: 3 }]
  },
  {
    id: 'shop_consumable_005',
    name: '铁甲丹',
    icon: '铁',
    category: 'consumable',
    type: 'consumable',
    quality: 'fine',
    price: 100,
    description: '战斗中防御+20%，持续3回合',
    effects: [{ type: 'buff_def', value: 0.2, duration: 3 }]
  },

  // ========== 材料 ==========
  {
    id: 'shop_material_001',
    name: '灵石',
    icon: '石',
    category: 'material',
    type: 'material',
    quality: 'common',
    price: 10,
    description: '修仙界的通用货币'
  },
  {
    id: 'shop_material_002',
    name: '灵草',
    icon: '草',
    category: 'material',
    type: 'material',
    quality: 'common',
    price: 20,
    description: '炼丹的基础材料'
  },
  {
    id: 'shop_material_003',
    name: '玄铁',
    icon: '铁',
    category: 'material',
    type: 'material',
    quality: 'fine',
    price: 100,
    description: '锻造武器的上好材料'
  },
  {
    id: 'shop_material_004',
    name: '符纸',
    icon: '纸',
    category: 'material',
    type: 'material',
    quality: 'common',
    price: 10,
    description: '绘制符箓的基础材料'
  },
  {
    id: 'shop_material_005',
    name: '阵旗',
    icon: '旗',
    category: 'material',
    type: 'material',
    quality: 'excellent',
    price: 200,
    description: '布置阵法的核心材料'
  }
])

// 预计算每个分类的商品列表，避免每次切换重新计算
const itemsByCategory = computed(() => {
  const result: Record<string, ShopItem[]> = {
    all: shopItems.value
  }
  for (const cat of categories) {
    if (cat.id !== 'all') {
      result[cat.id] = shopItems.value.filter(item => item.category === cat.id)
    }
  }
  return result
})

// 当前显示的商品列表
const currentItems = computed(() => {
  return itemsByCategory.value[displayCategory.value] || []
})

// Tab点击处理 - 立即响应tab样式，延迟加载内容
let loadingTimer: ReturnType<typeof setTimeout> | null = null

function handleTabClick(categoryId: string) {
  // 如果点击的是当前显示的分类，直接返回
  if (categoryId === displayCategory.value) {
    activeTab.value = categoryId
    return
  }

  // 立即更新tab激活状态
  activeTab.value = categoryId

  // 清除之前的timer
  if (loadingTimer) {
    clearTimeout(loadingTimer)
  }

  // 显示loading
  isLoading.value = true

  // 使用requestAnimationFrame + setTimeout实现平滑过渡
  loadingTimer = setTimeout(() => {
    displayCategory.value = categoryId
    // 使用requestAnimationFrame确保DOM更新后再隐藏loading
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isLoading.value = false
      })
    })
    loadingTimer = null
  }, 80) // 80ms的loading时间，让用户感知到切换
}

function canAfford(item: ShopItem): boolean {
  return playerStore.gold >= item.price
}

function handleBuy(item: ShopItem) {
  if (!canAfford(item)) {
    warning('灵石不足！')
    return
  }

  if (playerStore.isInventoryFull) {
    warning('背包已满！')
    return
  }

  selectedItem.value = item
  showConfirm.value = true
}

function confirmBuy() {
  if (!selectedItem.value) return

  const item = selectedItem.value

  // 扣款
  playerStore.gold -= item.price

  // 添加到背包
  const inventoryItem: InventoryItem = {
    id: `item_${Date.now()}`,
    name: item.name,
    icon: item.icon,
    type: item.type,
    quality: item.quality,
    quantity: 1,
    description: item.description,
    effects: item.effects
  }

  // 如果是装备，添加装备相关数据
  if (item.type === 'equipment') {
    inventoryItem.equipmentId = item.equipmentId
  }

  playerStore.addToInventory(inventoryItem)

  // 播放音效和显示提示
  sfxSpiritStone()
  success(`购买了 ${item.name}`)
  showItemAcquire({
    name: item.name,
    quantity: 1,
    quality: item.quality as 'normal' | 'fine' | 'excellent' | 'supreme',
    icon: item.icon
  })

  showConfirm.value = false
  selectedItem.value = null
}
</script>

<style scoped>
.shop-view {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.shop-view .game-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.panel-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  margin: 0 0 4px 0;
  text-align: center;
  flex-shrink: 0;
}

.panel-desc {
  font-size: 0.8125rem;
  color: var(--color-muted);
  margin: 0 0 12px 0;
  text-align: center;
  flex-shrink: 0;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-shrink: 0;
  padding: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  /* 硬件加速 */
  transform: translateZ(0);
}

.tab {
  flex: 1;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--color-muted);
  font-size: 0.8125rem;
  cursor: pointer;
  /* 精简transition */
  transition: background-color 0.1s ease, color 0.1s ease;
  white-space: nowrap;
  text-align: center;
  line-height: 1.3;
  /* 硬件加速 */
  transform: translateZ(0);
  /* CSS隔离 */
  contain: layout style;
}

.tab:hover {
  color: rgb(232 228 217);
}

.tab.active {
  background: rgba(200, 164, 92, 0.2);
  color: var(--color-accent-warm);
  font-weight: 500;
}

/* Loading状态 */
.loading-overlay {
  position: absolute;
  inset: 0;
  top: 100px; /* 避开标题和tab区域 */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(126, 184, 218, 0.2);
  border-top-color: var(--color-accent-warm);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 商品网格 */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: min-content;
  gap: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
  padding: 2px;
  padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  align-content: start;
  justify-items: stretch;
  /* 硬件加速 */
  transform: translateZ(0);
  /* CSS隔离 */
  contain: layout style;
  /* 淡入动画 */
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0.5; }
  to { opacity: 1; }
}

/* 隐藏滚动条 */
.shop-grid::-webkit-scrollbar {
  display: none;
}
.shop-grid {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.shop-item {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(126, 184, 218, 0.15);
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  /* 精简transition */
  transition: border-color 0.1s ease, background-color 0.1s ease;
  min-height: 80px;
  height: auto;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  /* 硬件加速 */
  transform: translateZ(0);
  /* CSS隔离 */
  contain: layout style;
}

.shop-item.unaffordable {
  opacity: 0.5;
  cursor: not-allowed;
}

.shop-item.unaffordable:hover {
  background: rgba(0, 0, 0, 0.25);
  border-color: rgba(126, 184, 218, 0.15);
}

.shop-item.affordable:hover {
  border-color: rgba(126, 184, 218, 0.4);
  background: rgba(0, 0, 0, 0.35);
}

.shop-item.affordable:active {
  transform: scale(0.98);
}

.item-icon {
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(107, 114, 128, 0.5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  flex-shrink: 0;
  /* 硬件加速 */
  transform: translateZ(0);
}

.item-icon.common { border-color: #6b7280; }
.item-icon.fine { border-color: #d4976a; background: rgba(212, 151, 106, 0.15); }
.item-icon.excellent { border-color: #a8c4d4; background: rgba(168, 196, 212, 0.15); }
.item-icon.supreme { border-color: #ffd700; background: rgba(255, 215, 0, 0.15); }

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 2px;
  overflow: hidden;
}

.item-name {
  font-size: 0.9375rem;
  color: rgb(232 228 217);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;
}

.item-name.fine { color: #d4976a; }
.item-name.excellent { color: #a8c4d4; }
.item-name.supreme { color: #ffd700; }

.item-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 0.8125rem;
  color: var(--color-accent-warm);
  font-weight: 500;
}

.price-value {
  font-weight: 600;
}

.price-unit {
  margin-left: 2px;
  opacity: 0.8;
  font-weight: 400;
}

/* 确认弹窗 */
.confirm-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(145deg, rgb(35, 38, 52), rgb(30, 32, 48));
  border: 1px solid rgba(126, 184, 218, 0.3);
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  max-width: 320px;
}

.modal-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  margin: 0 0 16px 0;
  text-align: center;
  font-weight: 500;
}

.item-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  margin-bottom: 18px;
}

.preview-icon {
  width: 52px;
  height: 52px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(107, 114, 128, 0.5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.625rem;
  flex-shrink: 0;
}

.preview-icon.common { border-color: #6b7280; }
.preview-icon.fine { border-color: #d4976a; }
.preview-icon.excellent { border-color: #a8c4d4; }

.preview-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.preview-name {
  font-size: 1.0625rem;
  color: rgb(232 228 217);
  margin-bottom: 6px;
  font-weight: 500;
}

.preview-name.fine { color: #d4976a; }
.preview-name.excellent { color: #a8c4d4; }

.preview-price {
  font-size: 0.9375rem;
  color: var(--color-accent-warm);
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  font-weight: 500;
}

.action-btn.cancel {
  background: rgba(107, 114, 128, 0.25);
  border: 1px solid rgba(107, 114, 128, 0.4);
  color: rgb(180 185 195);
}

.action-btn.cancel:hover {
  background: rgba(107, 114, 128, 0.35);
}

.action-btn.confirm {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.5);
  color: #4ade80;
}

.action-btn.confirm:hover {
  background: rgba(74, 222, 128, 0.3);
}

/* 小屏幕适配 - 手机端使用单列布局 */
@media (max-width: 480px) {
  .shop-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .shop-item {
    padding: 12px;
    gap: 12px;
    min-height: 60px;
  }

  .item-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .item-name {
    font-size: 1rem;
  }

  .item-desc {
    font-size: 0.8125rem;
  }

  .item-price {
    font-size: 0.875rem;
  }
}

/* 平板端适配 */
@media (min-width: 768px) {
  .shop-view .game-panel {
    padding: 20px;
  }

  .panel-title {
    font-size: 1.25rem;
  }

  .panel-desc {
    font-size: 0.875rem;
    margin-bottom: 16px;
  }

  .category-tabs {
    gap: 8px;
    margin-bottom: 16px;
  }

  .tab {
    padding: 8px 16px;
    font-size: 0.875rem;
  }

  .shop-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .shop-item {
    padding: 14px;
    min-height: 90px;
  }

  .item-icon {
    width: 52px;
    height: 52px;
    font-size: 1.625rem;
  }

  .item-name {
    font-size: 1rem;
  }

  .item-desc {
    font-size: 0.8125rem;
  }

  .item-price {
    font-size: 0.875rem;
  }
}

/* 桌面端适配 */
@media (min-width: 1024px) {
  .shop-view .game-panel {
    padding: 24px;
  }

  .shop-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .shop-item {
    padding: 16px;
    min-height: 100px;
  }

  .shop-item.affordable:hover {
    transform: translateY(-2px);
  }

  .item-icon {
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
  }

  .modal-content {
    max-width: 380px;
  }
}

/* 横屏手机 */
@media (max-height: 500px) and (orientation: landscape) {
  .shop-view {
    height: 100%;
  }

  .shop-view .game-panel {
    padding: 8px;
    height: 100%;
  }

  .panel-title {
    font-size: 0.875rem;
    margin-bottom: 2px;
  }

  .panel-desc {
    display: none;
  }

  .category-tabs {
    margin-bottom: 6px;
    gap: 4px;
  }

  .tab {
    padding: 4px 6px;
    font-size: 0.6875rem;
  }

  .loading-overlay {
    top: 70px;
  }

  .shop-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    padding: 0 2px 4px 0;
  }

  .shop-item {
    padding: 6px;
    gap: 6px;
    min-height: auto;
  }

  .item-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
    border-width: 1px;
  }

  .item-info {
    padding-top: 0;
  }

  .item-name {
    font-size: 0.75rem;
    margin-bottom: 2px;
  }

  .item-desc {
    font-size: 0.625rem;
    margin-bottom: 2px;
  }

  .item-price {
    font-size: 0.6875rem;
  }
}
</style>
