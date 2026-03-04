<template>
  <div class="shop-view">
    <div class="game-panel">
      <h2 class="panel-title">坊市</h2>
      <p class="panel-desc">购买��炼所需物品</p>

      <!-- 分类标签 -->
      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['tab', { active: currentCategory === cat.id }]"
          @click="currentCategory = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- 商品列表 -->
      <div class="shop-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
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
import { ref, computed, onMounted } from 'vue'
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

const currentCategory = ref('all')
const showConfirm = ref(false)
const selectedItem = ref<ShopItem | null>(null)

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

const shopItems = ref<ShopItem[]>([
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

const filteredItems = computed(() => {
  if (currentCategory.value === 'all') return shopItems.value
  return shopItems.value.filter(item => item.category === currentCategory.value)
})

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
  padding-bottom: 16px;
}

.panel-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  margin: 0 0 4px 0;
  text-align: center;
}

.panel-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0 0 12px 0;
  text-align: center;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.tab {
  flex: 1;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.3);
  border-radius: 6px;
  color: var(--color-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab:hover {
  border-color: var(--color-accent);
}

.tab.active {
  background: rgba(126, 184, 218, 0.2);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* 商品网格 */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.shop-item {
  display: flex;
  gap: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.3);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.shop-item.affordable:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 12px rgba(126, 184, 218, 0.2);
}

.shop-item.unaffordable {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-icon {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(107, 114, 128, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.item-icon.common { border-color: #6b7280; }
.item-icon.fine { border-color: #d4976a; background: rgba(212, 151, 106, 0.1); }
.item-icon.excellent { border-color: #a8c4d4; background: rgba(168, 196, 212, 0.1); }
.item-icon.supreme { border-color: #ffd700; background: rgba(255, 215, 0, 0.1); }

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.875rem;
  color: rgb(232 228 217);
  margin-bottom: 2px;
}

.item-name.fine { color: #d4976a; }
.item-name.excellent { color: #a8c4d4; }
.item-name.supreme { color: #ffd700; }

.item-desc {
  font-size: 0.625rem;
  color: var(--color-muted);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 0.75rem;
  color: var(--color-accent-warm);
}

.price-value {
  font-weight: 600;
}

.price-unit {
  margin-left: 2px;
  opacity: 0.8;
}

/* 确认弹窗 */
.confirm-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: linear-gradient(145deg, rgb(35, 38, 52), rgb(30, 32, 48));
  border: 1px solid rgba(126, 184, 218, 0.3);
  border-radius: 12px;
  padding: 20px;
  width: 280px;
}

.modal-title {
  font-size: 1rem;
  color: var(--color-accent-warm);
  margin: 0 0 16px 0;
  text-align: center;
}

.item-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 16px;
}

.preview-icon {
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(107, 114, 128, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.preview-icon.common { border-color: #6b7280; }
.preview-icon.fine { border-color: #d4976a; }
.preview-icon.excellent { border-color: #a8c4d4; }

.preview-name {
  font-size: 1rem;
  color: rgb(232 228 217);
  margin-bottom: 4px;
}

.preview-name.fine { color: #d4976a; }
.preview-name.excellent { color: #a8c4d4; }

.preview-price {
  font-size: 0.875rem;
  color: var(--color-accent-warm);
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.cancel {
  background: rgba(107, 114, 128, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.3);
  color: rgb(156 163 175);
}

.action-btn.cancel:hover {
  background: rgba(107, 114, 128, 0.3);
}

.action-btn.confirm {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.action-btn.confirm:hover {
  background: rgba(74, 222, 128, 0.3);
}
</style>
