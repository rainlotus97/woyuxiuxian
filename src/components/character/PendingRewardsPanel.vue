<template>
  <section v-if="items.length" class="pending-rewards" aria-label="待领取奖励">
    <div class="pending-heading">
      <div>
        <span class="eyebrow">战利品暂存</span>
        <strong>待领取奖励</strong>
      </div>
      <span class="pending-count">{{ totalQuantity }} 件</span>
    </div>
    <div class="pending-capacity">
      <p>战斗奖励会先放在这里，不会被静默丢弃。</p>
      <span>{{ availableSlots }} 个空槽，可直接领取 {{ claimableCount }} 项</span>
    </div>
    <div class="pending-toolbar">
      <small>预计需要 {{ newSlotsNeeded }} 个新槽位</small>
      <GameActionButton
        tone="jade"
        :disabled="claimableCount === 0"
        @click="emit('claim-all')"
      >
        一键领取
      </GameActionButton>
    </div>
    <div class="pending-list">
      <div v-for="item in items" :key="item.id" class="pending-item">
        <ItemArt :icon="item.iconKey || item.icon" :art-key="item.artKey" :label="item.name" :tone="item.quality === 'legendary' ? 'gold' : 'jade'" size="2.25rem" />
        <div class="pending-copy">
          <strong>{{ item.name }}</strong>
          <span>x{{ item.quantity }}</span>
        </div>
        <GameActionButton tone="jade" @click="emit('claim', item.id)">领取</GameActionButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import ItemArt from '@/components/game-ui/ItemArt.vue'
import type { InventoryItem } from '@/stores/playerStore'

const props = defineProps<{
  items: InventoryItem[]
  availableSlots: number
  newSlotsNeeded: number
  claimableCount: number
}>()

const emit = defineEmits<{
  claim: [itemId: string]
  'claim-all': []
}>()

const totalQuantity = computed(() => props.items.reduce((total, item) => total + item.quantity, 0))
</script>

<style scoped>
.pending-rewards {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
  padding: 11px;
  border: 1px solid rgba(195, 139, 54, 0.28);
  border-radius: 14px;
  background: rgba(255, 246, 215, 0.62);
}

.pending-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pending-heading > div {
  display: grid;
  gap: 3px;
}

.eyebrow {
  color: rgba(123, 88, 35, 0.66);
  font-size: 10px;
}

.pending-heading strong {
  color: #7e5723;
  font-size: 14px;
}

.pending-count {
  color: rgba(101, 79, 43, 0.72);
  font-size: 11px;
  white-space: nowrap;
}

.pending-capacity {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.pending-capacity p {
  margin: 0;
  color: rgba(83, 77, 57, 0.72);
  font-size: 11px;
  line-height: 1.45;
}

.pending-capacity span,
.pending-toolbar small {
  color: rgba(101, 79, 43, 0.64);
  font-size: 10px;
}

.pending-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.pending-toolbar small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pending-toolbar :deep(.game-action-btn) {
  min-height: 32px;
  flex: 0 0 auto;
  padding-inline: 10px;
  font-size: 11px;
}

.pending-list {
  display: grid;
  gap: 6px;
}

.pending-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 7px;
  border: 1px solid rgba(132, 117, 78, 0.16);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.5);
}

.pending-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.pending-copy strong {
  overflow: hidden;
  color: #45635d;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pending-copy span {
  color: rgba(78, 107, 100, 0.66);
  font-size: 11px;
}

.pending-item :deep(.game-action-btn) {
  min-height: 32px;
  padding-inline: 10px;
  font-size: 11px;
}
</style>
