<template>
  <XIcon
    v-if="xIconName"
    :icon="xIconName"
    :size="size"
    class="game-icon"
    :class="[colorClass]"
  />
  <component
    :is="lucideComponent"
    v-else-if="hasLucideIcon"
    :size="size"
    :stroke-width="strokeWidth"
    class="game-icon"
    :class="[colorClass]"
    aria-hidden="true"
    focusable="false"
  />
  <span
    v-else
    class="game-icon-fallback"
    :class="[colorClass]"
    :style="fallbackStyle"
    aria-hidden="true"
  >{{ icon }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XIcon } from '@rainlotus97/ui'
import type { XIconName } from '@rainlotus97/ui'
import { resolveGameIconComponent, hasGameIcon } from '@/game/theme/gameTheme'

const props = withDefaults(defineProps<{
  icon: string
  size?: number
  strokeWidth?: number
  color?: string
}>(), {
  size: 16,
  strokeWidth: 2,
  color: ''
})

const X_ICON_MAP = {
  cultivation: 'cultivation',
  '修': 'cultivation',
  '修炼': 'cultivation',
  '坐': 'cultivation',
  '打坐': 'cultivation',
  '重': 'cultivation',
  '破': 'cultivation',
  Activity: 'cultivation',
  BookOpen: 'cultivation',
  pill: 'pill',
  '丹': 'pill',
  '药': 'pill',
  Pill: 'pill',
  alchemy: 'alchemy',
  '炼丹': 'alchemy',
  '🧪': 'alchemy',
  sword: 'sword',
  '剑': 'sword',
  '锋': 'sword',
  '霄': 'sword',
  '沌': 'sword',
  '玄': 'sword',
  '🗡': 'sword',
  '🗡️': 'sword',
  '⚔': 'sword',
  '⚔️': 'sword',
  Sword: 'sword',
  Swords: 'sword',
  armor: 'armor',
  '甲': 'armor',
  '布': 'armor',
  Shield: 'armor',
  jade: 'jade',
  '玉': 'jade',
  '镯': 'jade',
  '珠': 'jade',
  Gem: 'jade',
  scroll: 'scroll',
  '符': 'scroll',
  ScrollText: 'scroll',
  'spirit-stone': 'spirit-stone',
  '石': 'spirit-stone',
  '金': 'spirit-stone',
  '💎': 'spirit-stone',
  '💰': 'spirit-stone',
  Coins: 'spirit-stone',
  Diamond: 'spirit-stone',
  herb: 'herb',
  '木': 'herb',
  '果': 'herb',
  '羹': 'herb',
  '🌿': 'herb',
  '🌱': 'herb',
  Leaf: 'herb',
  forge: 'forge',
  '炼器': 'forge',
  '铁': 'forge',
  Hammer: 'forge',
  Pickaxe: 'forge',
  Store: 'forge',
  sect: 'sect',
  '宗': 'sect',
  '🏛️': 'sect',
  Castle: 'sect',
  Landmark: 'sect',
  map: 'map',
  '行': 'map',
  '闻': 'map',
  '📍': 'map',
  Map: 'map',
  MapPin: 'map',
  Compass: 'map',
  Globe: 'map',
  backpack: 'backpack',
  '物': 'backpack',
  '装': 'backpack',
  Backpack: 'backpack',
  Package: 'backpack',
  settings: 'settings',
  '换': 'settings',
  Settings: 'settings',
  Wrench: 'settings',
  gift: 'gift',
  '得': 'gift',
  '🎁': 'gift',
  Gift: 'gift',
  lock: 'lock',
  '🔒': 'lock',
  Lock: 'lock',
  'chevron-right': 'chevron-right',
  mission: 'mission',
  '令': 'mission',
  '📋': 'mission',
  Clipboard: 'mission',
  crown: 'crown',
  '🏅': 'crown',
  Crown: 'crown',
  Medal: 'crown',
  Trophy: 'crown',
  close: 'close',
  '取消': 'close',
  '⛔': 'close',
  X: 'close',
  spark: 'spark',
  '灵': 'spark',
  '力': 'spark',
  '确认': 'spark',
  '⚡': 'spark',
  '⭐': 'spark',
  '🌟': 'spark',
  Sparkles: 'spark',
  Star: 'spark',
  Zap: 'spark'
} as const satisfies Record<string, XIconName>

const xIconName = computed<XIconName | undefined>(() => X_ICON_MAP[props.icon as keyof typeof X_ICON_MAP])
const hasLucideIcon = computed(() => !xIconName.value && hasGameIcon(props.icon))
const lucideComponent = computed(() => resolveGameIconComponent(props.icon))
const colorClass = computed(() => props.color ? `icon-${props.color}` : '')
const fallbackStyle = computed(() => ({ fontSize: `${Math.max(10, props.size * 0.86)}px` }))
</script>

<style scoped>
.game-icon,
.game-icon-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: currentColor;
  vertical-align: middle;
}

.game-icon-fallback {
  line-height: 1;
}
</style>
