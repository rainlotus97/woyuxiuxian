<template>
  <GameDialog
    :visible="Boolean(item)"
    title="确认购入"
    eyebrow="坊市交易"
    @close="$emit('close')"
  >
    <div v-if="item" class="confirm-body">
      <div class="confirm-preview" :class="`quality-${item.definition.quality}`">
        <span>{{ item.definition.icon }}</span>
        <div>
          <strong>{{ item.definition.name }}</strong>
          <p>{{ item.definition.description }}</p>
        </div>
      </div>
      <div class="confirm-stats">
        <span>价格</span>
        <strong>{{ costLabel }}</strong>
        <span>库存</span>
        <strong>{{ item.stock }}</strong>
      </div>
    </div>

    <template #footer>
      <GameActionButton tone="stone" @click="$emit('close')">取消</GameActionButton>
      <GameActionButton tone="gold" @click="$emit('confirm')">购买</GameActionButton>
    </template>
  </GameDialog>
</template>

<script setup lang="ts">
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import type { ShopInventoryItem } from '@/shop/runtime/shopInventoryResolver'

defineEmits<{
  close: []
  confirm: []
}>()

defineProps<{
  item: ShopInventoryItem | null
  costLabel: string
}>()
</script>

<style scoped>
.confirm-body {
  display: grid;
  gap: 14px;
}

.confirm-preview {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 12px;
  align-items: center;
}

.confirm-preview > span {
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
  color: #315257;
}

.confirm-preview p {
  margin: 5px 0 0;
  color: rgba(58, 82, 80, 0.72);
  font-size: 12px;
  line-height: 1.5;
}

.confirm-stats {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  color: #5a716d;
}

.confirm-stats strong {
  color: #8d6528;
}
</style>
