<template>
  <div class="shop-view">
    <div class="game-panel">
      <h2 class="panel-title">坊市</h2>
      <p class="panel-desc">购买修炼所需物品</p>

      <div class="shop-grid">
        <div v-for="item in shopItems" :key="item.id" class="shop-item" @click="handleBuy(item)">
          <div class="item-icon">{{ item.icon }}</div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-price">{{ item.price }} 灵石</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAudio, sfxSpiritStone } from '@/composables/useAudio'
import { useModal } from '@/composables/useModal'

const { success } = useToast()
const { startShopBgm } = useAudio()
const { showItemAcquire } = useModal()

onMounted(() => {
  startShopBgm()
})

const shopItems = ref([
  { id: 1, name: '聚气丹', icon: '丹', price: 50 },
  { id: 2, name: '疗伤丹', icon: '药', price: 30 },
  { id: 3, name: '玄铁', icon: '铁', price: 100 },
  { id: 4, name: '灵草', icon: '草', price: 20 },
  { id: 5, name: '符纸', icon: '纸', price: 10 },
  { id: 6, name: '阵旗', icon: '旗', price: 200 }
])

const handleBuy = (item: { id: number; name: string; icon: string; price: number }) => {
  sfxSpiritStone()
  success(`购买了 ${item.name}`)
  showItemAcquire({
    name: item.name,
    quantity: 1,
    quality: 'normal',
    icon: item.icon
  })
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
  margin: 0 0 16px 0;
  text-align: center;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.shop-item:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 12px rgba(126, 184, 218, 0.2);
}

.item-icon {
  width: 40px;
  height: 40px;
  background: rgba(200, 164, 92, 0.1);
  border: 1px solid var(--color-accent-warm);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 0.875rem;
  color: rgb(232 228 217);
  margin-bottom: 2px;
}

.item-price {
  font-size: 0.75rem;
  color: var(--color-accent-warm);
}
</style>
