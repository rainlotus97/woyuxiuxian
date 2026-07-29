<template>
  <section class="market-brief" aria-label="坊市货架概况">
    <div class="market-brief-stat">
      <span>当前货架</span>
      <strong>{{ visibleCount }}/{{ totalCount }} 件</strong>
    </div>
    <div class="market-brief-stat">
      <span>下次换货</span>
      <strong>{{ nextRefreshHint }}</strong>
    </div>
    <button
      type="button"
      class="market-brief-detail"
      aria-label="查看本轮市况"
      title="查看本轮市况"
      @click="$emit('details')"
    >
      <GameIcon icon="scroll" :size="16" />
      <span>市况</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import GameIcon from '@/components/game-ui/GameIcon.vue'

defineProps<{
  totalCount: number
  visibleCount: number
  nextRefreshHint: string
}>()

defineEmits<{
  details: []
}>()
</script>

<style scoped>
.market-brief {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr) auto;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  min-width: 0;
  padding: 0.35rem 0.42rem;
  border: 1px solid rgba(123, 153, 145, 0.18);
  border-radius: 0.78rem;
  background: rgba(255, 255, 255, 0.5);
}

.market-brief-stat {
  display: grid;
  min-width: 0;
  gap: 0.12rem;
  padding: 0.24rem 0.48rem;
  border-right: 1px solid rgba(123, 153, 145, 0.14);
}

.market-brief-stat span {
  color: rgba(73, 97, 95, 0.62);
  font-size: 0.58rem;
}

.market-brief-stat strong {
  min-width: 0;
  overflow: hidden;
  color: #80602e;
  font-size: 0.72rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.market-brief-detail {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.22rem;
  min-height: 2.1rem;
  padding: 0 0.52rem;
  border: 1px solid rgba(123, 153, 145, 0.22);
  border-radius: 0.62rem;
  background: rgba(237, 247, 239, 0.78);
  color: #4d8175;
  font-family: var(--font-game);
  font-size: 0.66rem;
  cursor: pointer;
}

.market-brief-detail:active {
  transform: translateY(1px);
}

@container game-stage (max-width: 350px) {
  .market-brief {
    gap: 0.28rem;
  }

  .market-brief-stat {
    padding-inline: 0.3rem;
  }

  .market-brief-detail {
    padding-inline: 0.4rem;
  }

  .market-brief-detail span {
    display: none;
  }
}
</style>
