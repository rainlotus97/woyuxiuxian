<template>
  <div
    class="unit-slot relative"
    :class="{
      'cursor-pointer': isTargetable,
      'ring-2 ring-yellow-400': isSelected,
      'opacity-50': !unit.isAlive
    }"
    @click="$emit('click')"
  >
    <!-- 头像区域 -->
    <div
      class="avatar w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2"
      :style="{ borderColor: elementColor, borderWidth: '3px', borderStyle: 'solid', backgroundColor: bgColor }"
    >
      {{ unit.icon }}
    </div>

    <!-- 名称 -->
    <div class="name text-sm text-white text-center mb-1">{{ unit.name }}</div>

    <!-- 境界 -->
    <div class="realm text-xs text-gray-400 text-center mb-2">{{ unit.realm }}</div>

    <!-- HP 条 -->
    <div class="hp-bar w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
      <div
        class="h-full transition-all duration-300"
        :class="hpBarColor"
        :style="{ width: `${hpPercent}%` }"
      ></div>
    </div>

    <!-- MP 条 -->
    <div class="mp-bar w-full h-1 bg-gray-700 rounded-full overflow-hidden">
      <div
        class="h-full bg-blue-500 transition-all duration-300"
        :style="{ width: `${mpPercent}%` }"
      ></div>
    </div>

    <!-- 状态效果图标 -->
    <div v-if="unit.statusEffects.length > 0" class="status-effects absolute -top-2 -right-2 flex gap-1">
      <span
        v-for="(effect, index) in unit.statusEffects.slice(0, 3)"
        :key="index"
        class="w-4 h-4 text-xs flex items-center justify-center rounded-full"
        :class="getStatusEffectClass(effect.type)"
      >
        {{ getStatusEffectIcon(effect.type) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Unit, StatusEffectType } from '@/types/unit'
import { ELEMENT_COLORS, QUALITY_COLORS } from '@/types/unit'

const props = defineProps<{
  unit: Unit
  isSelected?: boolean
  isTargetable?: boolean
}>()

defineEmits<{
  click: []
}>()

// 元素颜色
const elementColor = computed(() => ELEMENT_COLORS[props.unit.element] || '#666')

// 背景颜色（基于品质）
const bgColor = computed(() => {
  const quality = props.unit.quality
  const baseColor = QUALITY_COLORS[quality] || '#666'
  return `${baseColor}33` // 添加透明度
})

// HP 百分比
const hpPercent = computed(() => {
  const { currentHp, maxHp } = props.unit.stats
  return maxHp > 0 ? (currentHp / maxHp) * 100 : 0
})

// MP 百分比
const mpPercent = computed(() => {
  const { currentMp, maxMp } = props.unit.stats
  return maxMp > 0 ? (currentMp / maxMp) * 100 : 0
})

// HP 条颜色（根据血量变化）
const hpBarColor = computed(() => {
  const percent = hpPercent.value
  if (percent > 60) return 'bg-green-500'
  if (percent > 30) return 'bg-yellow-500'
  return 'bg-red-500'
})

// 状态效果样式
function getStatusEffectClass(type: StatusEffectType): string {
  const classes: Record<StatusEffectType, string> = {
    poison: 'bg-purple-500 text-white',
    burn: 'bg-orange-500 text-white',
    freeze: 'bg-cyan-500 text-white',
    stun: 'bg-yellow-500 text-black',
    buff_atk: 'bg-red-500 text-white',
    buff_def: 'bg-blue-500 text-white',
    buff_spd: 'bg-green-500 text-white',
    debuff_atk: 'bg-gray-500 text-white',
    debuff_def: 'bg-gray-500 text-white',
    shield: 'bg-gray-300 text-black',
    invincible: 'bg-yellow-300 text-black'
  }
  return classes[type] || 'bg-gray-500 text-white'
}

// 状态效果图标
function getStatusEffectIcon(type: StatusEffectType): string {
  const icons: Record<StatusEffectType, string> = {
    poison: '毒',
    burn: '燃',
    freeze: '冻',
    stun: '晕',
    buff_atk: '攻',
    buff_def: '防',
    buff_spd: '速',
    debuff_atk: '弱',
    debuff_def: '破',
    shield: '盾',
    invincible: '无'
  }
  return icons[type] || '?'
}
</script>

<style scoped>
.unit-slot {
  min-width: 80px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.unit-slot:hover {
  transform: translateY(-2px);
}

.unit-slot.cursor-pointer:hover {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}
</style>
