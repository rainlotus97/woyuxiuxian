<template>
  <div class="action-order-bar">
    <div class="order-title text-xs text-gray-400 text-center mb-1">行动顺序</div>
    <div class="order-list">
      <div
        v-for="item in sortedUnits"
        :key="item.unit.id"
        class="order-item"
        :class="{
          'is-current': item.unit.id === currentActingUnitId,
          'is-enemy': item.unit.type === 'enemy',
          'is-ally': item.unit.type !== 'enemy'
        }"
      >
        <!-- 回合数指示 -->
        <div class="turns-indicator" v-if="item.turnsUntilAction > 0">
          {{ item.turnsUntilAction }}
        </div>

        <!-- 单位图标 -->
        <div
          class="unit-icon"
          :style="{ borderColor: getElementColor(item.unit.element), backgroundColor: `${getElementColor(item.unit.element)}33` }"
        >
          {{ item.unit.icon?.charAt(0) }}
        </div>

        <!-- 迷你进度条 -->
        <div class="speed-bar-mini">
          <div
            class="speed-fill"
            :style="{ height: `${item.progress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Unit } from '@/types/unit'
import { ELEMENT_COLORS } from '@/types/unit'

interface Props {
  units: Unit[]
  speedBar: Map<string, number>
  currentActingUnitId: string | null
}

const props = defineProps<Props>()

interface SortedUnitItem {
  unit: Unit
  progress: number
  turnsUntilAction: number
}

// 按预计行动顺序排序
const sortedUnits = computed<SortedUnitItem[]>(() => {
  const aliveUnits = props.units.filter(u => u.isAlive)

  const items = aliveUnits.map(unit => {
    const progress = props.speedBar.get(unit.id) || 0
    const remainingProgress = 100 - progress
    // 预计需要的"回合数"（简化计算）
    const turnsUntilAction = Math.ceil(remainingProgress / unit.stats.speed)

    return {
      unit,
      progress,
      turnsUntilAction
    }
  })

  // 按进度降序排序（进度高的先行动）
  // 如果进度相同，按速度降序
  return items.sort((a, b) => {
    if (a.progress >= 100 && b.progress < 100) return -1
    if (a.progress < 100 && b.progress >= 100) return 1
    if (a.progress >= 100 && b.progress >= 100) {
      return b.unit.stats.speed - a.unit.stats.speed
    }
    return b.progress - a.progress
  })
})

function getElementColor(element: string): string {
  return ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS] || '#666'
}
</script>

<style scoped>
.action-order-bar {
  position: fixed;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  padding: 6px;
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-title {
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
  width: 100%;
  text-align: center;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-width: 40px;
}

.order-item.is-current {
  background: rgba(74, 222, 128, 0.2);
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
}

.order-item.is-enemy .unit-icon {
  border-color: #ef4444;
}

.turns-indicator {
  font-size: 0.5rem;
  color: #9ca3af;
  width: 10px;
  min-width: 10px;
  text-align: center;
  flex-shrink: 0;
}

.unit-icon {
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  border-width: 2px;
  border-style: solid;
  flex-shrink: 0;
}

.speed-bar-mini {
  width: 4px;
  min-width: 4px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse;
  flex-shrink: 0;
}

.speed-fill {
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 2px;
  transition: height 0.1s ease;
}

.order-item.is-current .speed-fill {
  background: linear-gradient(to top, #22c55e, #4ade80);
}

.order-item.is-enemy .speed-fill {
  background: linear-gradient(to top, #ef4444, #f87171);
}
</style>
