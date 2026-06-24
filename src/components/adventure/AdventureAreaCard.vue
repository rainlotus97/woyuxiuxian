<template>
  <GameSurface
    class="area-card"
    :class="{ locked: !unlocked, cleared: stars > 0 }"
    :tone="stars > 0 ? 'realm' : 'jade'"
    padding="lg"
    compact
  >
    <div class="area-header">
      <div class="area-leading">
        <div class="area-icon">
          <GameIcon :icon="area.icon" :size="22" />
        </div>
        <div class="area-copy">
          <strong>{{ area.name }}</strong>
          <small :style="{ color: realmColor }">
            {{ getRealmRequirementText(area.requiredRealm, area.requiredRealmLevel) }}
          </small>
        </div>
      </div>
      <span class="difficulty-badge" :style="{ color: difficultyColor }">
        {{ difficultyLabel }}
      </span>
    </div>

    <div v-if="encounter" class="area-world-state">
      <span
        class="risk-badge"
        :style="{ color: encounter.riskColor, borderColor: `${encounter.riskColor}55` }"
      >
        {{ encounter.statusText }}
      </span>
      <p>{{ compactEncounterNote }}</p>
    </div>
    <p v-else class="area-desc compact">{{ fieldLine }}</p>

    <div class="area-access-row" :class="`state-${access.entryState}`">
      <span class="access-badge">{{ access.entryLabel }}</span>
      <p>{{ compactEntryReason }}</p>
    </div>
    <small v-if="showAccessWarning" class="access-warning">
      {{ access.warnings[0] }}
    </small>

    <div class="area-meta-grid">
      <div class="drop-strip">
        <span class="meta-label">容易出</span>
        <div class="drops-items">
          <span
            v-for="drop in area.drops.slice(0, 2)"
            :key="drop.id"
            class="drop-preview"
            :class="drop.quality"
            :title="drop.name"
          >
            <GameIcon :icon="drop.icon" :size="14" />
          </span>
          <span v-if="area.drops.length > 2" class="more-drops">+{{ area.drops.length - 2 }}</span>
        </div>
      </div>

      <div class="meta-chips">
        <GameStatChip icon="⚡" label="体力" :value="access.staminaCost" tone="gold" />
        <GameStatChip icon="🌊" label="波次" :value="`${difficultyWaves}波`" tone="jade" />
      </div>
    </div>

    <div v-if="stars > 0" class="area-stars">
      <span v-for="i in 3" :key="i" class="star" :class="{ filled: i <= stars }">★</span>
    </div>

    <template #footer>
      <div class="area-actions">
        <GameActionButton
          v-if="!unlocked"
          icon="🔒"
          tone="stone"
          block
          disabled
        >
          境界不足
        </GameActionButton>

        <GameActionButton
          v-else-if="!access.challengeAllowed"
          icon="⛔"
          tone="stone"
          block
          disabled
        >
          {{ access.entryLabel }}
        </GameActionButton>

        <template v-else-if="stars === 0">
          <GameActionButton
            icon="Swords"
            tone="jade"
            block
            :disabled="stamina < access.staminaCost"
            @click="$emit('challenge', area)"
          >
            挑战
          </GameActionButton>
        </template>

        <template v-else>
          <GameActionButton
            icon="Swords"
            tone="jade"
            block
            :disabled="stamina < access.staminaCost"
            @click="$emit('challenge', area)"
          >
            挑战
          </GameActionButton>
          <GameActionButton
            icon="🔄"
            tone="gold"
            block
            :disabled="stamina < access.sweepCost || !access.sweepAllowed"
            @click="$emit('sweep', area)"
          >
            扫荡x3
          </GameActionButton>
        </template>
      </div>
    </template>
  </GameSurface>
</template>

<script setup lang="ts">
import GameIcon from '@/components/game-ui/GameIcon.vue'
import { computed } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { AreaGameplayAccess } from '@/map/runtime/mapAreaAccessResolver'
import type { MapAreaEncounterContext } from '@/map/runtime/mapAreaEncounterResolver'
import {
  DIFFICULTY_CONFIG,
  REALM_PRIMARY_COLOR,
  getRealmRequirementText,
  type AreaDefinition
} from '@/types/adventure'

const props = defineProps<{
  area: AreaDefinition
  access: AreaGameplayAccess
  encounter: MapAreaEncounterContext | null
  unlocked: boolean
  stars: number
  stamina: number
}>()

defineEmits<{
  challenge: [area: AreaDefinition]
  sweep: [area: AreaDefinition]
}>()

const realmColor = computed(() => REALM_PRIMARY_COLOR[props.area.requiredRealm] || '#7eb8da')
const difficultyConfig = computed(() => DIFFICULTY_CONFIG[props.area.difficulty as keyof typeof DIFFICULTY_CONFIG])
const difficultyColor = computed(() => difficultyConfig.value?.color || '#7eb8da')
const difficultyLabel = computed(() => difficultyConfig.value?.label || props.area.difficulty)
const difficultyWaves = computed(() => difficultyConfig.value?.waves || 1)

const areaFlavorMap = [
  { match: /竹|林|森/u, line: '竹影和湿土气都重，适合先探风声。' },
  { match: /沙|漠/u, line: '风沙埋痕很快，路上多半只留下半截线索。' },
  { match: /剑峰|剑|崖/u, line: '石壁上多旧剑痕，来的人大多不肯空手下山。' },
  { match: /火山|熔岩/u, line: '地火脾气躁，敢往里走的人一般都图大东西。' },
  { match: /洞|穴/u, line: '光线压得低，脚步声和别人的心思都会被放大。' },
  { match: /雪|冰/u, line: '风雪遮人脸，先站稳再谈往深处探。' },
  { match: /湖|水|海/u, line: '水气会藏动静，很多事要等波纹散开才看得清。' },
  { match: /谷/u, line: '谷里回声重，适合先听，再决定要不要正面撞上。' },
  { match: /遗迹|古|殿|宫/u, line: '旧东西多，来路和禁制往往比妖兽更麻烦。' }
]

function compactLine(text: string, max = 34) {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned
}

const compactDescription = computed(() => compactLine(props.area.description, 34))
const compactEncounterNote = computed(() => {
  const text = props.encounter?.encounterNote ?? ''
  const cleaned = text
    .replace(/边境摩擦频发，?/u, '')
    .replace(/强敌与机缘同时增多。?/u, '人和事都更杂。')
    .replace(/天象平稳。?/u, '天象还算稳。')
    .replace(/细雨助长灵气，也让战场更湿滑。?/u, '雨气压着脚下的路。')
    .trim()
  return compactLine(cleaned || text, 24)
})
const compactEntryReason = computed(() => compactLine(props.access.entryReason, 26))
const showAccessWarning = computed(() => {
  if (!props.access.warnings[0]) return false
  return props.access.entryState !== 'open'
})
const fieldLine = computed(() => {
  const realm = getRealmRequirementText(props.area.requiredRealm, props.area.requiredRealmLevel)
  const source = props.area.description.replace(/\s+/g, ' ').trim()
  const namedScene = source
    .replace(/^位于[^，。]*[，。]\s*/u, '')
    .replace(/适合[^，。]*修士历练[。]?/u, '')
    .replace(/可获得.*$/u, '')
    .trim()

  if (namedScene) {
    return compactLine(namedScene, 28)
  }

  const flavor = areaFlavorMap.find(entry => entry.match.test(props.area.name))?.line
  if (flavor) {
    return compactLine(flavor, 28)
  }

  return compactLine(`${realm}也能进去，先看风头再决定深不深入。`, 28)
})
</script>

<style scoped>
.area-card.locked {
  opacity: 0.74;
}

.area-card.cleared {
  border-color: rgba(98, 177, 132, 0.28);
}

.area-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 10px;
}

.area-leading {
  display: flex;
  gap: 10px;
  min-width: 0;
}

.area-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 20px;
}

.area-copy {
  display: grid;
  gap: 4px;
}

.area-copy strong {
  color: #315257;
  font-size: 15px;
}

.area-copy small {
  font-size: 10px;
}

.difficulty-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(105, 149, 143, 0.16);
  font-size: 10px;
  white-space: nowrap;
}

.area-desc {
  margin: 8px 0 0;
  color: rgba(49, 82, 87, 0.8);
  font-size: 11px;
  line-height: 1.55;
}

.area-desc.compact {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.area-world-state {
  margin-top: 8px;
  display: grid;
  gap: 4px;
}

.risk-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 3px 8px;
  border: 1px solid rgba(126, 184, 218, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  font-size: 9px;
  font-weight: 700;
}

.area-world-state p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 10px;
  line-height: 1.45;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.area-access-row {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(104, 150, 145, 0.16);
  background: rgba(255, 255, 255, 0.62);
}

.area-access-row p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: rgba(73, 97, 95, 0.78);
  font-size: 10px;
  line-height: 1.45;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.access-badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(104, 150, 145, 0.18);
  color: #4c7a78;
  background: rgba(239, 250, 247, 0.78);
  font-size: 10px;
}

.area-access-row.state-risky .access-badge {
  color: #9b6a1c;
  border-color: rgba(214, 153, 58, 0.24);
  background: rgba(255, 248, 232, 0.92);
}

.area-access-row.state-blocked .access-badge {
  color: #9b4a55;
  border-color: rgba(190, 103, 122, 0.24);
  background: rgba(255, 242, 245, 0.92);
}

.access-warning {
  display: block;
  margin-top: 6px;
  color: rgba(73, 97, 95, 0.64);
  font-size: 10px;
  line-height: 1.45;
}

.area-meta-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}

.drop-strip {
  display: grid;
  gap: 4px;
}

.meta-label {
  color: rgba(73, 97, 95, 0.68);
  font-size: 10px;
}

.drops-items {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.drop-preview {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #5d4a24;
  font-size: 12px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.74);
}

.drop-preview.common { border: 1px solid rgba(122, 150, 148, 0.18); }
.drop-preview.fine { border: 1px solid rgba(87, 162, 118, 0.22); }
.drop-preview.rare { border: 1px solid rgba(89, 137, 206, 0.24); }
.drop-preview.epic { border: 1px solid rgba(146, 108, 191, 0.26); }
.drop-preview.legendary {
  border: 1px solid rgba(198, 144, 53, 0.32);
  background: rgba(255, 248, 227, 0.92);
}

.more-drops {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.58);
  color: rgba(73, 97, 95, 0.72);
  font-size: 9px;
  font-weight: 700;
}

.meta-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.area-stars {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.star {
  font-size: 14px;
  color: rgba(251, 191, 36, 0.26);
}

.star.filled {
  color: #f0b84d;
}

.area-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

@media (max-width: 880px) {
  .area-meta-grid {
    grid-template-columns: 1fr;
  }

  .meta-chips {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .area-header {
    flex-direction: column;
  }

  .area-actions {
    grid-template-columns: 1fr;
  }
}
</style>
