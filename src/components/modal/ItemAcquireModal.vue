<template>
  <BaseModal
    :visible="items.length > 0"
    title="获得物品"
    @close="closeItemAcquire"
  >
    <div v-if="currentItem" class="item-acquire-content">
      <!-- 物品图标区域 -->
      <div class="item-icon-wrapper" :class="`quality-${currentItem.quality || 'normal'}`">
        <div class="item-icon">
          {{ currentItem.icon || '丹' }}
        </div>
        <div v-if="currentItem.quantity > 1" class="item-quantity">
          x{{ currentItem.quantity }}
        </div>
      </div>

      <!-- 物品信息 -->
      <div class="item-info">
        <h4 class="item-name" :class="`quality-${currentItem.quality || 'normal'}`">
          {{ currentItem.name }}
        </h4>
        <p v-if="currentItem.description" class="item-desc">
          {{ currentItem.description }}
        </p>
      </div>

      <!-- 物品计数 -->
      <div v-if="items.length > 1" class="item-counter">
        {{ currentIndex + 1 }} / {{ items.length }}
      </div>
    </div>

    <template #footer>
      <GameButton @click="handleNext">
        {{ isLastItem ? '收下' : '下一个' }}
      </GameButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { useModal } from '@/composables/useModal'
import { sfxItem } from '@/composables/useAudio'
import BaseModal from './BaseModal.vue'
import GameButton from '@/components/common/GameButton.vue'

const { acquiredItems: items, currentItemIndex: currentIndex, currentItem, isLastItem, nextItem, closeItemAcquire } = useModal()

const handleNext = () => {
  sfxItem()
  if (isLastItem.value) {
    closeItemAcquire()
  } else {
    nextItem()
  }
}
</script>

<style scoped>
.item-acquire-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.item-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: rgba(0, 0, 0, 0.3);
}

.item-icon-wrapper.quality-normal {
  border: 2px solid #6b7280;
}

.item-icon-wrapper.quality-fine {
  border: 2px solid #d4976a;
  box-shadow: 0 0 12px rgba(212, 151, 106, 0.4);
}

.item-icon-wrapper.quality-excellent {
  border: 2px solid #a8c4d4;
  box-shadow: 0 0 16px rgba(168, 196, 212, 0.5);
}

.item-icon-wrapper.quality-supreme {
  border: 2px solid #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  animation: supreme-glow 2s ease-in-out infinite;
}

@keyframes supreme-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
}

.item-icon {
  font-size: 2rem;
}

.item-quantity {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.item-info {
  text-align: center;
}

.item-name {
  font-size: 1.125rem;
  margin: 0 0 8px 0;
}

.item-name.quality-normal { color: #e8e4d8; }
.item-name.quality-fine { color: #d4976a; }
.item-name.quality-excellent { color: #a8c4d4; }
.item-name.quality-supreme { color: #ffd700; }

.item-desc {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
  max-width: 260px;
}

.item-counter {
  margin-top: 12px;
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
