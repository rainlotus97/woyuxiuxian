<template>
  <GameDialog
    :visible="Boolean(item)"
    title="物品详情"
    eyebrow="坊市交易"
    @close="$emit('close')"
  >
    <div v-if="item" class="confirm-body">
      <div class="confirm-preview" :class="`quality-${item.definition.quality}`">
        <GameIcon :icon="item.definition.icon" :size="28" />
        <div>
          <strong>{{ item.definition.name }}</strong>
          <p>{{ item.definition.description }}</p>
          <small v-if="item.merchantEvent" class="merchant-note">
            {{ item.merchantEvent.merchantName }} · {{ item.merchantEvent.title }}
          </small>
        </div>
      </div>
      <div v-if="item.tags.length" class="confirm-tags">
        <span v-for="tag in item.tags.slice(0, 4)" :key="tag">{{ tag }}</span>
      </div>
      <div class="confirm-stats">
        <span>价格</span>
        <strong>{{ costLabel }}</strong>
        <span>库存</span>
        <strong>{{ item.stock }}</strong>
      </div>
      <p v-if="!canBuy" class="purchase-blocked">{{ blockedReason }}</p>
    </div>

    <template #footer>
      <GameActionButton tone="stone" @click="$emit('close')">取消</GameActionButton>
      <GameActionButton tone="gold" :disabled="!canBuy" @click="$emit('confirm')">购买</GameActionButton>
    </template>
  </GameDialog>
</template>

<script setup lang="ts">
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import type { ShopInventoryItem } from '@/shop/runtime/shopInventoryResolver'

defineEmits<{
  close: []
  confirm: []
}>()

defineProps<{
  item: ShopInventoryItem | null
  costLabel: string
  canBuy: boolean
  blockedReason: string
}>()
</script>

<style scoped>
.confirm-body {
  min-width: 0;
  display: grid;
  gap: 14px;
}

.confirm-preview {
  min-width: 0;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.confirm-preview > .game-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(174, 139, 68, 0.26);
  color: #8d6528;
  font-size: 24px;
  font-weight: 800;
}

.confirm-preview strong {
  display: block;
  overflow-wrap: anywhere;
  color: #315257;
}

.confirm-preview p {
  overflow-wrap: anywhere;
  margin: 5px 0 0;
  color: rgba(58, 82, 80, 0.72);
  font-size: 12px;
  line-height: 1.5;
}

.merchant-note {
  display: block;
  margin-top: 6px;
  color: #8d6528;
  font-size: 11px;
  line-height: 1.4;
}

.confirm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.confirm-tags span {
  padding: 4px 7px;
  border-radius: 999px;
  background: rgba(237, 247, 239, 0.8);
  color: #4c8171;
  font-size: 11px;
}

.confirm-stats {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 8px 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  color: #5a716d;
}

.confirm-stats strong {
  min-width: 0;
  color: #8d6528;
  text-align: right;
  overflow-wrap: anywhere;
}

.purchase-blocked {
  margin: 0;
  padding: 0.58rem 0.7rem;
  border: 1px solid rgba(185, 99, 82, 0.22);
  border-radius: 0.65rem;
  background: rgba(255, 243, 238, 0.82);
  color: #a05c50;
  font-size: 0.72rem;
  line-height: 1.45;
}
</style>
