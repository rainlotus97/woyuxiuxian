<template>
  <div class="effect-feed">
    <div v-if="transactions.length" class="effect-feed-list">
      <article v-for="transaction in transactions" :key="transaction.id" class="effect-entry">
        <div class="effect-entry-head">
          <div class="effect-entry-copy">
            <strong>{{ transaction.title }}</strong>
            <small>{{ sourceLabel(transaction.source) }} · {{ transaction.timeLabel }}</small>
          </div>
          <span class="effect-count">{{ transaction.effects.length }}项</span>
        </div>
        <p>{{ transaction.summary }}</p>
        <div class="effect-chips" aria-label="具体后果">
          <span
            v-for="(effect, index) in transaction.effects"
            :key="`${transaction.id}-${index}`"
            class="effect-chip"
            :class="`effect-type-${effect.type}`"
          >{{ formatEffect(effect) }}</span>
        </div>
      </article>
    </div>
    <p v-else class="effect-empty">尚无新的后果沉淀</p>
  </div>
</template>

<script setup lang="ts">
import type { WorldEffect, WorldEffectSource, WorldEffectTransaction } from '@/types/worldEvent'

defineProps<{
  transactions: WorldEffectTransaction[]
}>()

const SOURCE_LABELS: Record<WorldEffectSource, string> = {
  weather: '天象',
  idle: '挂机',
  travel: '赶路',
  battle: '战斗',
  random_event: '奇遇',
  story_choice: '故事选择',
  companion: '伙伴',
  sect: '宗门',
  map: '地图',
  npc: '人物',
  manual: '履历'
}

function sourceLabel(source: WorldEffectSource) {
  return SOURCE_LABELS[source]
}

function signedValue(value: number) {
  return value > 0 ? `+${value}` : String(value)
}

function formatEffect(effect: WorldEffect) {
  const label = effect.label || '结果'
  const target = effect.targetId ? ` · ${effect.targetId}` : ''

  if (typeof effect.value === 'number') {
    if (effect.type === 'cultivation' || effect.type === 'gold' || effect.type === 'stamina' || effect.type === 'relationship') {
      return `${label} ${signedValue(effect.value)}`
    }
    if (effect.type === 'item') {
      const verb = effect.value >= 0 ? '获得' : '失去'
      return `${verb}${target || '物品'} x${Math.abs(effect.value)}`
    }
    if (effect.type === 'flag' || effect.type === 'npc' || effect.type === 'skill' || effect.type === 'area' || effect.type === 'sect') {
      return `${label}${target}`
    }
    return `${label}${target} ${signedValue(effect.value)}`
  }

  if (effect.value !== undefined) return `${label}${target} · ${effect.value}`
  return `${label}${target}`
}
</script>

<style scoped>
.effect-feed {
  min-width: 0;
}

.effect-feed-list {
  display: grid;
  gap: 0;
}

.effect-entry {
  display: grid;
  gap: 0.38rem;
  min-width: 0;
  padding: 0.68rem 0;
  border-top: 1px solid rgba(112, 153, 143, 0.16);
}

.effect-entry:first-child {
  padding-top: 0;
  border-top: 0;
}

.effect-entry-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
  min-width: 0;
}

.effect-entry-copy {
  display: grid;
  gap: 0.14rem;
  min-width: 0;
}

.effect-entry-copy strong {
  min-width: 0;
  color: #315b57;
  font-size: 0.76rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.effect-entry-copy small {
  color: rgba(73, 105, 99, 0.62);
  font-size: 0.62rem;
  line-height: 1.3;
}

.effect-count {
  flex: 0 0 auto;
  color: rgba(151, 111, 46, 0.76);
  font-size: 0.62rem;
  white-space: nowrap;
}

.effect-entry p {
  margin: 0;
  color: rgba(82, 94, 89, 0.76);
  font-size: 0.7rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.effect-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
  min-width: 0;
}

.effect-chip {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  padding: 0.22rem 0.42rem;
  border: 1px solid rgba(96, 136, 126, 0.2);
  border-radius: 8px;
  background: rgba(241, 249, 245, 0.78);
  color: #3d6961;
  font-size: 0.64rem;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.effect-type-gold,
.effect-type-skill {
  border-color: rgba(184, 144, 65, 0.28);
  background: rgba(255, 248, 224, 0.76);
  color: #8b6429;
}

.effect-type-relationship,
.effect-type-npc {
  border-color: rgba(142, 99, 136, 0.24);
  background: rgba(249, 240, 248, 0.72);
  color: #76556f;
}

.effect-type-outcome,
.effect-type-flag,
.effect-type-area,
.effect-type-sect {
  border-color: rgba(101, 122, 155, 0.22);
  background: rgba(239, 245, 252, 0.74);
  color: #536b89;
}

.effect-empty {
  margin: 0;
  color: rgba(73, 105, 99, 0.62);
  font-size: 0.7rem;
}
</style>
