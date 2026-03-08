<template>
  <div
    class="unit-slot relative"
    :class="{
      'cursor-pointer': isTargetable,
      'is-selected': isSelected,
      'is-dead': !unit.isAlive,
      'is-attacking': isActing,
      'is-hurt': isHurt,
      'is-c-position': isCPosition
    }"
    @click="$emit('click')"
  >
    <!-- 攻击动画效果 -->
    <div v-if="isActing" class="attack-effect"></div>

    <!-- 受伤闪烁效果 -->
    <div v-if="isHurt" class="hurt-flash"></div>

    <!-- 头像区域 -->
    <div
      class="avatar flex items-center justify-center font-bold"
      :class="isCPosition ? 'avatar-large' : 'avatar-normal'"
      :style="{ borderColor: elementColor, borderWidth: isCPosition ? '4px' : '3px', borderStyle: 'solid', backgroundColor: bgColor }"
    >
      {{ unit.icon }}
    </div>

    <!-- 名称 -->
    <div class="name text-white text-center" :class="isCPosition ? 'text-sm font-bold' : 'text-xs'">{{ unit.name }}</div>

    <!-- HP 条 -->
    <div class="hp-bar w-full bg-gray-700 rounded-full overflow-hidden" :class="isCPosition ? 'h-2.5' : 'h-1.5'">
      <div
        class="h-full transition-all duration-300"
        :class="hpBarColor"
        :style="{ width: `${hpPercent}%` }"
      ></div>
    </div>

    <!-- 状态效果图标 -->
    <div v-if="unit.statusEffects.length > 0" class="status-effects flex justify-center gap-1 mt-1">
      <span
        v-for="(effect, index) in unit.statusEffects.slice(0, 3)"
        :key="index"
        class="status-icon w-4 h-4 text-xs flex items-center justify-center rounded"
        :class="getStatusEffectClass(effect.type)"
      >
        {{ getStatusEffectIcon(effect.type) }}
      </span>
    </div>

    <!-- BOSS/精英标记 -->
    <div v-if="isBoss" class="boss-badge">BOSS</div>
    <div v-else-if="isElite" class="elite-badge">精英</div>
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
  isActing?: boolean
  isHurt?: boolean
  isCPosition?: boolean
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
  return `${baseColor}33`
})

// HP 百分比
const hpPercent = computed(() => {
  const { currentHp, maxHp } = props.unit.stats
  return Math.max(0, Math.min(100, (currentHp / maxHp) * 100))
})

// HP 条颜色
const hpBarColor = computed(() => {
  const percent = hpPercent.value
  if (percent > 60) return 'bg-gradient-to-r from-green-600 to-green-400'
  if (percent > 30) return 'bg-gradient-to-r from-yellow-600 to-yellow-400'
  return 'bg-gradient-to-r from-red-600 to-red-400'
})

// 是否是 BOSS
const isBoss = computed(() => props.unit.name.includes('[BOSS]'))

// 是否是精英
const isElite = computed(() => props.unit.name.includes('[精英]'))

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
  min-width: 60px;
  padding: 6px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  position: relative;
}

.unit-slot:hover {
  transform: translateY(-2px);
}

.unit-slot.cursor-pointer:hover {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.unit-slot.is-selected {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
  border: 2px solid rgba(59, 130, 246, 0.8);
  transform: scale(1.05);
  background: rgba(59, 130, 246, 0.1);
}

.unit-slot.is-dead {
  opacity: 0.4;
  filter: grayscale(50%);
}

.unit-slot.is-c-position {
  min-width: 80px;
  padding: 10px;
  z-index: 10;
}

.avatar-normal {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.25rem;
  margin: 0 auto 4px;
}

.avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  font-size: 1.75rem;
  margin: 0 auto 6px;
}

/* 攻击动画 */
.unit-slot.is-attacking {
  animation: attackJump 0.4s ease-out;
  z-index: 100;
}

@keyframes attackJump {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.2) translateY(-10px);
  }
  60% {
    transform: scale(1.1) translateY(-5px);
  }
  100% {
    transform: scale(1);
  }
}

.attack-effect {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
  animation: attackPulse 0.4s ease-out;
  pointer-events: none;
}

@keyframes attackPulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 受伤动画 */
.unit-slot.is-hurt {
  animation: hurtShake 0.3s ease-out;
}

@keyframes hurtShake {
  0%, 100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-3px);
  }
  80% {
    transform: translateX(3px);
  }
}

.hurt-flash {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.5);
  animation: flashRed 0.3s ease-out;
  pointer-events: none;
}

@keyframes flashRed {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* BOSS/精英标记 */
.boss-badge {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
  font-size: 0.5rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.elite-badge {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff9900, #cc6600);
  color: white;
  font-size: 0.5rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
