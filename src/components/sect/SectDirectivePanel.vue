<template>
  <GameSurface tone="mist" padding="md" eyebrow="职位方略" title="宗门调度" subtitle="不同职位可下达不同方针，直接影响山门资源与战局节奏。">
    <div class="directive-head">
      <div class="directive-copy">
        <strong>{{ authorityLabel }}</strong>
        <small>{{ authorityDescription }}</small>
      </div>
      <span class="directive-pill">{{ activeDirectiveLabel }}</span>
    </div>

    <div class="directive-list">
      <button
        v-for="directive in directives"
        :key="directive.id"
        class="directive-card"
        :class="{ active: directive.id === activeDirective }"
        @click="$emit('change-directive', directive.id)"
      >
        <strong>{{ directive.label }}</strong>
        <small>{{ directive.description }}</small>
      </button>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { SectDirectiveId } from '@/sect/runtime/sectPositionResolver'

const props = defineProps<{
  authorityLabel: string
  authorityDescription: string
  activeDirective: SectDirectiveId
  activeDirectiveLabel: string
  directives: {
    id: SectDirectiveId
    label: string
    description: string
  }[]
}>()

defineEmits<{
  'change-directive': [directive: SectDirectiveId]
}>()

const directives = computed(() => props.directives)
</script>

<style scoped>
.directive-head,
.directive-list {
  display: grid;
  gap: 12px;
}

.directive-copy {
  display: grid;
  gap: 4px;
}

.directive-copy strong {
  color: #315257;
  font-size: 15px;
}

.directive-copy small {
  color: rgba(73, 97, 95, 0.74);
  font-size: 12px;
  line-height: 1.6;
}

.directive-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 250, 239, 0.82);
  border: 1px solid rgba(194, 146, 66, 0.18);
  color: #8b6226;
  font-size: 11px;
}

.directive-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.directive-card {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  background: rgba(255, 255, 255, 0.68);
  color: #315257;
  text-align: left;
  font-family: var(--font-game);
}

.directive-card.active {
  border-color: rgba(188, 141, 58, 0.28);
  background: rgba(255, 249, 233, 0.84);
}

.directive-card strong {
  font-size: 13px;
}

.directive-card small {
  color: rgba(73, 97, 95, 0.74);
  font-size: 11px;
  line-height: 1.55;
}

@media (max-width: 720px) {
  .directive-list {
    grid-template-columns: 1fr;
  }
}
</style>
