<template>
  <div class="result-panel">
    <BattlePanelShell class="result-card" variant="gold" padding="lg">
      <div class="result-body">
        <span class="result-mark">{{ resultMark }}</span>
        <h2>{{ title }}</h2>
        <p v-if="result === 'victory'">获得 {{ rewards.cultivation }} 修为、{{ rewards.gold }} 灵石。</p>
        <p v-else-if="result === 'defeat'">你被迫撤回，世界仍在继续流转。</p>
        <p v-else>你脱离了战场，没有获得战利品。</p>
        <button @click="$emit('confirm')">返回历练</button>
      </div>
    </BattlePanelShell>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BattleRuntimeResult } from '@/game/battle/battleRuntime'
import BattlePanelShell from './BattlePanelShell.vue'

const props = defineProps<{
  result: Exclude<BattleRuntimeResult, null>
  title: string
  rewards: { cultivation: number; gold: number }
}>()

defineEmits<{
  confirm: []
}>()

const resultMark = computed(() => {
  if (props.result === 'victory') return '胜'
  if (props.result === 'defeat') return '败'
  return '退'
})
</script>

<style scoped>
.result-panel {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  background: rgba(222, 247, 246, 0.54);
  backdrop-filter: blur(6px);
}

.result-card {
  width: min(340px, calc(100vw - 34px));
}

.result-body {
  text-align: center;
}

.result-mark {
  width: 62px;
  height: 62px;
  margin: 0 auto 10px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: radial-gradient(circle, #f6d78b, #b66a34);
  color: #170e0d;
  font-size: 32px;
  font-weight: 800;
}

.result-card h2 {
  margin: 0 0 8px;
  color: #9d6314;
}

.result-card p {
  color: rgba(53, 71, 68, 0.78);
}

.result-card button {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(135deg, #f6d78b, #78dac6);
  color: #151017;
  font-weight: 700;
}
</style>
