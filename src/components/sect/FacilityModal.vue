<template>
  <GameDialog :visible="visible" :title="facility?.name || ''" eyebrow="宗门设施" @close="close">
    <template v-if="facility">
      <div class="facility-shell">
        <GameSurface tone="mist" padding="md" compact>
          <div class="facility-head">
            <div class="facility-leading">
              <div class="facility-icon">{{ facility.icon }}</div>
              <div class="facility-copy">
                <strong>{{ facility.name }}</strong>
                <small>Lv.{{ facilityLevel }}/{{ facility.maxLevel }}</small>
              </div>
            </div>
            <span class="effect-pill">{{ currentEffect }}</span>
          </div>
        </GameSurface>

        <div v-if="facilityId === 'alchemy_furnace'" class="section-stack">
          <GameSurface tone="gold" padding="md" compact>
            <div class="section-copy">
              <span class="section-label">炼丹配方</span>
            </div>
          </GameSurface>

          <div class="recipe-list">
            <GameSurface
              v-for="recipe in availableRecipes"
              :key="recipe.id"
              tone="mist"
              padding="md"
              compact
              class="recipe-card"
            >
              <div class="recipe-head">
                <div class="recipe-leading">
                  <span class="recipe-icon">{{ recipe.icon }}</span>
                  <div class="recipe-copy">
                    <strong>{{ recipe.name }}</strong>
                    <small>{{ getQualityLabel(recipe.quality) }}</small>
                  </div>
                </div>
                <span class="success-rate">成功率 {{ getSuccessRate(recipe) }}%</span>
              </div>

              <div class="material-list">
                <span
                  v-for="mat in recipe.materials"
                  :key="mat.itemId"
                  class="material-chip"
                  :class="{ insufficient: !hasMaterial(mat) }"
                >
                  {{ getMaterialName(mat.itemId) }} x{{ mat.quantity }}
                </span>
              </div>

              <div class="surface-actions">
                <GameActionButton
                  icon="🧪"
                  tone="gold"
                  :disabled="!canCraft(recipe)"
                  @click="handleCraft(recipe)"
                >
                  炼制
                </GameActionButton>
              </div>
            </GameSurface>
          </div>
        </div>

        <div v-else-if="facilityId === 'medicine_garden'" class="section-stack">
          <div class="garden-grid">
            <GameSurface
              v-for="(slot, index) in displaySlots"
              :key="index"
              :tone="index >= slotCount ? 'mist' : isReady(slot) ? 'gold' : 'jade'"
              padding="md"
              compact
              class="garden-slot"
            >
              <div v-if="index >= slotCount" class="slot-copy">
                <strong>锁定槽位</strong>
                <small>需要药园 Lv.{{ getRequiredLevel(index) }}</small>
              </div>

              <template v-else-if="slot">
                <div class="slot-copy">
                  <strong>{{ getCropName(slot) }}</strong>
                  <small>{{ isReady(slot) ? '已成熟，可收获' : getRemainingTime(slot) }}</small>
                </div>

                <div class="surface-actions">
                  <GameActionButton
                    v-if="isReady(slot)"
                    icon="🌿"
                    tone="gold"
                    @click="handleHarvest(index)"
                  >
                    收获
                  </GameActionButton>
                  <GameActionButton
                    v-else
                    icon="⚡"
                    tone="jade"
                    @click="handleAccelerate(index)"
                  >
                    加速
                  </GameActionButton>
                </div>
              </template>

              <template v-else>
                <div class="slot-copy">
                  <strong>空闲药田</strong>
                  <small>选择种子后可开始培育。</small>
                </div>

                <div class="surface-actions">
                  <GameActionButton icon="🌱" tone="jade" @click="showSeedSelector(index)">
                    种植
                  </GameActionButton>
                </div>
              </template>
            </GameSurface>
          </div>

          <GameSurface v-if="selectingSlot !== null" tone="gold" padding="md" compact>
            <div class="section-copy">
              <span class="section-label">选择种子</span>
            </div>

            <div class="seed-list">
              <button
                v-for="seed in availableSeeds"
                :key="seed.id"
                class="seed-card"
                :class="{ disabled: !canPlant(seed) }"
                @click="handlePlant(seed)"
              >
                <div class="seed-leading">
                  <span class="seed-icon">{{ seed.icon }}</span>
                  <div class="seed-copy">
                    <strong>{{ seed.name }}</strong>
                    <small>{{ seed.growTime }} 分钟</small>
                  </div>
                </div>
                <span class="seed-price"><GameIcon icon="Diamond" :size="12" />{{ seed.buyPrice }}</span>
              </button>
            </div>
          </GameSurface>
        </div>

        <GameSurface v-else tone="mist" padding="md" compact>
          <div class="section-copy">
            <span class="section-label">设施说明</span>
            <p>{{ facility.description }}</p>
            <small v-if="facilityLevel < facility.maxLevel">下一阶段：{{ nextEffect }}</small>
          </div>
        </GameSurface>
      </div>
    </template>

    <template #footer>
      <GameActionButton
        v-if="canUpgrade"
        icon="⬆️"
        tone="gold"
        @click="handleUpgrade"
      >
        升级（{{ upgradeCost }}）
      </GameActionButton>
    </template>
  </GameDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import { useSectStore } from '@/stores/sectStore'
import { usePlayerStore } from '@/stores/playerStore'
import { SECT_FACILITIES } from '@/types/sect'
import { ALCHEMY_RECIPES, type AlchemyRecipe } from '@/types/alchemy'
import { SEEDS, type PlantedCrop, type SeedDefinition } from '@/types/garden'
import { useToast } from '@/composables/useToast'
import { useSectProgression } from '@/composables/useSectProgression'

const props = defineProps<{
  visible: boolean
  facilityId: string
}>()

const emit = defineEmits<{
  close: []
}>()

const sectStore = useSectStore()
const playerStore = usePlayerStore()
const { success, warning } = useToast()
const {
  upgradeFacility,
  craftAlchemy,
  plantSeed,
  harvestCrop,
  accelerateCrop
} = useSectProgression()
const selectingSlot = ref<number | null>(null)

const facility = computed(() => SECT_FACILITIES.find(item => item.id === props.facilityId) ?? null)
const facilityLevel = computed(() => sectStore.getFacilityLevel(props.facilityId))

const currentEffect = computed(() => {
  const effect = facility.value?.effects[0]
  if (!effect) return ''
  const bonus = facilityLevel.value * effect.value
  return `${effect.description.replace(/\+\d+%/, '')}+${bonus}%`
})

const nextEffect = computed(() => {
  const effect = facility.value?.effects[0]
  if (!effect) return ''
  const bonus = (facilityLevel.value + 1) * effect.value
  return `${effect.description.replace(/\+\d+%/, '')}+${bonus}%`
})

const canUpgrade = computed(() => {
  if (!facility.value) return false
  if (facilityLevel.value >= facility.value.maxLevel) return false
  return sectStore.contribution >= facility.value.upgradeCost.contribution
    && playerStore.gold >= facility.value.upgradeCost.gold
})

const upgradeCost = computed(() => {
  if (!facility.value) return ''
  return `${facility.value.upgradeCost.contribution}贡献 ${facility.value.upgradeCost.gold}灵石`
})

const availableRecipes = computed(() => {
  return ALCHEMY_RECIPES.filter(recipe => recipe.requiredFacilityLevel <= facilityLevel.value)
})

function hasMaterial(mat: { itemId: string; quantity: number }) {
  if (mat.itemId === 'gold') return playerStore.gold >= mat.quantity
  const item = playerStore.inventory.find(entry => entry.id === mat.itemId || entry.name === mat.itemId)
  return (item?.quantity || 0) >= mat.quantity
}

function canCraft(recipe: AlchemyRecipe) {
  return recipe.materials.every(hasMaterial)
}

function getMaterialName(itemId: string) {
  const names: Record<string, string> = {
    gold: '灵石',
    herb_spirit_grass: '灵草',
    herb_spirit_flower: '灵花',
    herb_immortal_grass: '仙草'
  }
  if (names[itemId]) return names[itemId]
  const item = playerStore.inventory.find(entry => entry.id === itemId || entry.name === itemId)
  return item?.name || itemId
}

function getSuccessRate(recipe: AlchemyRecipe) {
  return Math.min(100, Math.floor((recipe.baseSuccessRate + facilityLevel.value * 0.05) * 100))
}

function getQualityLabel(quality: string) {
  const labels: Record<string, string> = {
    common: '凡品',
    fine: '灵品',
    rare: '玄品',
    epic: '仙品',
    legendary: '神品'
  }
  return labels[quality] || quality
}

function handleCraft(recipe: AlchemyRecipe) {
  if (!canCraft(recipe)) {
    warning('材料不足')
    return
  }
  const result = craftAlchemy(recipe.id)
  if (result.success) success(result.message)
  else warning(result.message)
}

const slotCount = computed(() => {
  if (facilityLevel.value >= 5) return 3
  if (facilityLevel.value >= 3) return 2
  return 1
})

const displaySlots = computed<(PlantedCrop | null)[]>(() => [0, 1, 2].map(index => sectStore.gardenSlots[index] ?? null))
const availableSeeds = computed(() => SEEDS.filter(seed => seed.requiredGardenLevel <= facilityLevel.value))

function getRequiredLevel(slotIndex: number) {
  if (slotIndex === 0) return 1
  if (slotIndex === 1) return 3
  return 5
}

function getCropName(slot: PlantedCrop | null) {
  if (!slot) return ''
  return SEEDS.find(seed => seed.id === slot.seedId)?.name || '未知作物'
}

function isReady(slot: PlantedCrop | null) {
  return Boolean(slot && Date.now() >= slot.readyAt)
}

function getRemainingTime(slot: PlantedCrop | null) {
  if (!slot) return ''
  const remaining = slot.readyAt - Date.now()
  if (remaining <= 0) return '已成熟'
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`
}

function showSeedSelector(slotIndex: number) {
  selectingSlot.value = slotIndex
}

function canPlant(seed: SeedDefinition) {
  return playerStore.gold >= seed.buyPrice
}

function handlePlant(seed: SeedDefinition) {
  if (selectingSlot.value === null) return
  const result = plantSeed(seed.id, selectingSlot.value)
  if (result.success) {
    success(result.message)
    selectingSlot.value = null
  } else {
    warning(result.message)
  }
}

function handleHarvest(slotIndex: number) {
  const result = harvestCrop(slotIndex)
  if (result.success) success(result.message)
  else warning(result.message)
}

function handleAccelerate(slotIndex: number) {
  const result = accelerateCrop(slotIndex)
  if (result.success) success(result.message)
  else warning(result.message)
}

function handleUpgrade() {
  if (upgradeFacility(props.facilityId).success) success('升级成功')
  else warning('升级失败，资源不足')
}

function close() {
  selectingSlot.value = null
  emit('close')
}
</script>

<style scoped>
.facility-shell,
.section-stack,
.recipe-list,
.garden-grid,
.seed-list {
  display: grid;
  gap: 12px;
}

.facility-head,
.facility-leading,
.recipe-head,
.recipe-leading,
.seed-leading,
.surface-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.facility-head,
.recipe-head {
  justify-content: space-between;
}

.facility-icon,
.recipe-icon,
.seed-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.74);
  font-size: 22px;
}

.facility-copy,
.recipe-copy,
.seed-copy,
.slot-copy,
.section-copy {
  display: grid;
  gap: 4px;
}

.facility-copy strong,
.recipe-copy strong,
.seed-copy strong,
.slot-copy strong,
.section-copy strong {
  color: #315257;
  font-size: 14px;
}

.facility-copy small,
.recipe-copy small,
.seed-copy small,
.slot-copy small,
.section-label,
.section-copy p,
.section-copy small,
.success-rate {
  color: rgba(73, 97, 95, 0.74);
  font-size: 11px;
}

.section-copy p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

.effect-pill {
  color: #8b6226;
  font-size: 11px;
}

.material-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.material-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(103, 149, 144, 0.16);
  color: #486566;
  font-size: 11px;
}

.material-chip.insufficient {
  color: #a64f61;
  border-color: rgba(198, 121, 137, 0.22);
  background: rgba(255, 243, 246, 0.84);
}

.surface-actions {
  justify-content: flex-end;
  flex-wrap: wrap;
}

.seed-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(188, 141, 58, 0.18);
  background: rgba(255, 255, 255, 0.72);
  text-align: left;
}

.seed-card.disabled {
  opacity: 0.5;
}

.seed-price {
  color: #8b6226;
  font-size: 11px;
}

@media (max-width: 720px) {
  .facility-head,
  .recipe-head,
  .seed-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
