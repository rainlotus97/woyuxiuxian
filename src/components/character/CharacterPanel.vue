<template>
  <div class="character-panel">
    <GameSurface class="hero-surface" tone="realm" padding="md">
      <div class="hero-row">
        <XAvatarFrame size="3.6rem" shape="square" tone="gold" :alt="`${summary.name}的头像`">
          <GameIcon class="avatar-glyph" :icon="summary.icon" :size="24" :style="{ color: loadout.getElementColor(summary.element) }" />
        </XAvatarFrame>
        <div class="hero-copy">
          <span class="eyebrow">本命修士</span>
          <h2>{{ summary.name }}</h2>
          <div class="hero-tags">
            <i :style="{ color: loadout.getQualityColor(summary.quality) }">{{ summary.quality }}</i>
            <i>{{ summary.realm }}</i>
            <i>{{ summary.element }}灵根</i>
            <i v-if="loadout.playerStore.spiritRoot" :style="{ color: rootColor }">{{ getSpiritRootName(loadout.playerStore.spiritRoot) }}</i>
            <i v-if="loadout.playerStore.bloodline" :style="{ color: bloodlineColor }">{{ getBloodlineName(loadout.playerStore.bloodline) }}</i>
          </div>
        </div>
        <div class="hero-metrics">
          <div>
            <span>穿戴</span>
            <strong>{{ loadout.loadoutProgressSummary.value.equippedCount }}/{{ loadout.loadoutProgressSummary.value.totalSlots }}</strong>
          </div>
          <div>
            <span>包裹</span>
            <strong>{{ summary.inventoryCount }}/{{ summary.maxInventorySlots }}</strong>
          </div>
          <div>
            <span>功法</span>
            <strong>{{ loadout.skillProgressSummary.value.learnedCount }}/{{ loadout.skillProgressSummary.value.totalCount }}</strong>
          </div>
        </div>
      </div>

      <GameProgressBar
        class="hero-progress"
        label="修为"
        :current="summary.cultivation"
        :max="summary.maxCultivation"
        :hint="breakthroughHint"
        tone="gold"
      />
    </GameSurface>

    <nav class="character-tools" aria-label="角色入口">
      <button
        type="button"
        :class="{ current: loadout.activeTab.value === 'overview' }"
        @click="goToRoute('/game/profile')"
      >
        <GameIcon icon="companion" :size="16" />
        <span>总览</span>
      </button>
      <button
        type="button"
        :class="{ current: loadout.activeTab.value === 'inventory' }"
        @click="goToRoute('/game/inventory')"
      >
        <GameIcon icon="backpack" :size="16" />
        <span>包裹</span>
      </button>
      <button
        type="button"
        :class="{ current: loadout.activeTab.value === 'skills' }"
        @click="goToRoute('/game/skills')"
      >
        <GameIcon icon="scroll" :size="16" />
        <span>功法</span>
      </button>
      <button type="button" @click="goToRoute('/game/companion')">
        <GameIcon icon="beast" :size="16" />
        <span>灵伴</span>
      </button>
    </nav>

    <main class="panel-layout">
      <GameSurface
        v-if="loadout.activeTab.value === 'overview'"
        class="content-card overview-card"
        tone="mist"
        padding="md"
        eyebrow="养成总览"
        title="人物"
      >
        <div class="summary-grid" aria-label="人物概览">
          <div>
            <span>包裹</span>
            <strong>{{ summary.inventoryCount }}/{{ summary.maxInventorySlots }}</strong>
          </div>
          <div>
            <span>技能点</span>
            <strong>{{ summary.skillPoints }}</strong>
          </div>
          <div>
            <span>每息修为</span>
            <strong>{{ formatRate(summary.cultivationPerSecond) }}</strong>
          </div>
          <div>
            <span>调息增幅</span>
            <strong>+{{ formatPercent(summary.cultivationMultiplier - 1) }}</strong>
          </div>
        </div>

        <div class="overview-entries">
          <button type="button" class="overview-entry" @click="detailsDialogOpen = true">
            <span class="overview-entry-icon"><GameIcon icon="scroll" :size="17" /></span>
            <span class="overview-entry-copy">
              <strong>根骨、属性与修行记录</strong>
              <small>{{ summary.element }}灵根 · {{ loadout.learnedSkillCards.value.length }} 门功法已入册</small>
            </span>
            <GameIcon icon="chevron-right" :size="15" />
          </button>
          <button type="button" class="overview-entry" @click="equipmentDialogOpen = true">
            <span class="overview-entry-icon overview-entry-icon--gold"><GameIcon icon="sword" :size="17" /></span>
            <span class="overview-entry-copy">
              <strong>装备与战斗属性</strong>
              <small>{{ loadout.loadoutProgressSummary.value.equippedCount }}/{{ loadout.loadoutProgressSummary.value.totalSlots }} 已装备 · {{ loadout.loadoutProgressSummary.value.candidateCount }} 件可替换</small>
            </span>
            <GameIcon icon="chevron-right" :size="15" />
          </button>
        </div>

        <div class="overview-footer-note">
          <GameIcon icon="spark" :size="15" />
          <span>更多明细只在需要时展开，人物主位保持清爽。</span>
        </div>
      </GameSurface>

      <GameSurface
        v-else-if="loadout.activeTab.value === 'inventory'"
        class="content-card inventory-card"
        tone="mist"
        padding="md"
        eyebrow="随身包裹"
        title="背包"
      >
        <InventorySchemaPanel :summary="loadout.inventorySchemaSummary.value" />
        <PendingRewardsPanel
          :items="loadout.playerStore.pendingRewards"
          :available-slots="loadout.playerStore.pendingRewardAvailableSlots"
          :new-slots-needed="loadout.playerStore.pendingRewardNewSlotCount"
          :claimable-count="loadout.playerStore.pendingRewardClaimableCount"
          @claim="loadout.playerStore.claimPendingReward"
          @claim-all="handleClaimPendingRewards"
        />
        <InventoryGrid
          :filters="loadout.inventoryFilterOptions.value"
          :active-filter="loadout.inventoryFilter.value"
          :items="loadout.filteredInventory.value"
          :empty-slots="loadout.emptyInventorySlots.value"
          @update:active-filter="loadout.inventoryFilter.value = $event"
          @select="loadout.selectInventoryItem"
        />
      </GameSurface>

      <GameSurface
        v-else-if="loadout.activeTab.value === 'skills'"
        class="content-card skills-card"
        tone="mist"
        padding="md"
        eyebrow="功法修行"
        title="技能树"
      >
        <div class="combat-loadout-panel">
          <div class="combat-loadout-heading">
            <div>
              <span>战斗配置</span>
              <strong>{{ loadout.playerStore.getActiveCombatLoadout()?.name ?? '默认配置' }}</strong>
            </div>
            <small>主动 4 槽 · 终极 1 槽</small>
          </div>
          <div class="combat-loadout-options">
            <button
              v-for="combatLoadout in loadout.playerStore.combatLoadouts"
              :key="combatLoadout.id"
              type="button"
              :class="{ active: loadout.playerStore.activeCombatLoadoutId === combatLoadout.id }"
              @click="loadout.playerStore.setActiveCombatLoadout(combatLoadout.id)"
            >
              {{ combatLoadout.name }}
            </button>
          </div>
        </div>
        <SkillTreePanel
          :skill-points="summary.skillPoints"
          :summary="loadout.skillProgressSummary.value"
          :branches="loadout.skillBranchOptions.value"
          :active-branch="loadout.activeSkillBranch.value"
          :nodes="loadout.currentSkillNodes.value"
          :get-state="loadout.getSkillNodeState"
          @update:active-branch="loadout.activeSkillBranch.value = $event"
          @learn="loadout.learnSkill"
          @upgrade="loadout.upgradeSkill"
          @toggle="loadout.toggleSkill"
        />
      </GameSurface>

      <GameSurface
        v-else
        class="content-card companions-card"
        tone="mist"
        padding="md"
        eyebrow="灵伴同行"
        title="伙伴与灵兽"
      >
        <div class="companion-summary">
          <div class="companion-summary-main">
            <span class="companion-summary-icon"><GameIcon icon="companion" :size="22" /></span>
            <div>
              <strong>{{ companionStore.equippedCompanions.length }} 位伙伴已上阵</strong>
              <small>战斗中最多携带 3 位伙伴，Combo 按明确关系触发。</small>
            </div>
          </div>
          <span class="companion-count">{{ companionStore.ownedCompanions.length }} 位</span>
        </div>
        <div class="pet-summary">
          <span class="pet-summary-icon"><GameIcon icon="beast" :size="20" /></span>
          <div>
            <strong>{{ petStore.equippedPet?.definition.name ?? '尚未携带灵兽' }}</strong>
            <small>{{ petStore.equippedPet ? `亲密 ${petStore.equippedPet.owned.intimacy} · Lv.${petStore.equippedPet.owned.level}` : '去寻找一只愿意同行的灵兽' }}</small>
          </div>
        </div>
        <button type="button" class="open-secondary-button" @click="goToRoute('/game/companion')">
          <span>打开伙伴与灵兽管理</span>
          <GameIcon icon="chevron-right" :size="15" />
        </button>
      </GameSurface>
    </main>

    <GameDialog
      :visible="detailsDialogOpen"
      title="人物详情"
      eyebrow="修行底册"
      @close="detailsDialogOpen = false"
    >
      <div class="character-details-dialog">
        <section class="details-section">
          <div class="details-section-heading">
            <strong>基础属性</strong>
            <small>装备与功法加成后的结果</small>
          </div>
          <div class="character-stat-grid">
            <div v-for="stat in loadout.statList.value" :key="stat.key">
              <span>{{ stat.label }}</span>
              <strong>{{ stat.display }}</strong>
              <small v-if="stat.bonus">基础 {{ stat.base }} · 加成 +{{ stat.bonus }}</small>
            </div>
          </div>
        </section>

        <section
          v-if="loadout.playerStore.spiritRoot || loadout.playerStore.bloodline"
          class="details-section"
        >
          <div class="details-section-heading">
            <strong>根骨与血脉</strong>
            <small>决定修行倾向，不占主界面空间</small>
          </div>
          <div class="details-lines">
            <div v-if="loadout.playerStore.spiritRoot">
              <span>灵根</span>
              <strong>{{ getSpiritRootName(loadout.playerStore.spiritRoot) }}</strong>
            </div>
            <div v-if="loadout.playerStore.spiritRoot">
              <span>修炼速度</span>
              <strong>+{{ (loadout.playerStore.spiritRoot.cultivationSpeedBonus * 100).toFixed(0) }}%</strong>
            </div>
            <div v-if="loadout.playerStore.spiritRoot">
              <span>元素亲和</span>
              <strong>+{{ (loadout.playerStore.spiritRoot.elementAffinity * 100).toFixed(0) }}%</strong>
            </div>
            <div v-if="loadout.playerStore.spiritRoot">
              <span>突破加成</span>
              <strong>+{{ (loadout.playerStore.spiritRoot.breakthroughBonus * 100).toFixed(0) }}%</strong>
            </div>
            <div v-if="loadout.playerStore.bloodline">
              <span>血脉</span>
              <strong>{{ loadout.playerStore.bloodline.name }}</strong>
            </div>
          </div>
        </section>

        <section v-if="loadout.learnedSkillCards.value.length" class="details-section">
          <div class="details-section-heading">
            <strong>已入册功法</strong>
            <small>{{ loadout.skillProgressSummary.value.learnedCount }}/{{ loadout.skillProgressSummary.value.totalCount }}</small>
          </div>
          <div class="learned-strip">
            <div v-for="skill in loadout.learnedSkillCards.value" :key="skill.learned.id" class="learned-pill">
              <GameIcon :icon="skill.icon" :size="16" />
              <b>{{ skill.name }}</b>
              <em>Lv.{{ skill.learned.level }}</em>
            </div>
          </div>
        </section>

        <section v-if="loadout.passiveBonusRows.value.length || loadout.cultivationSourceRows.value.length" class="details-section">
          <div class="details-section-heading">
            <strong>修行回响</strong>
            <small>挂机、奇遇与被动效果</small>
          </div>
          <div v-if="loadout.passiveBonusRows.value.length" class="details-lines">
            <div v-for="bonus in loadout.passiveBonusRows.value" :key="bonus.stat">
              <span>{{ bonus.label }}被动</span>
              <strong>+{{ bonus.value }}</strong>
            </div>
          </div>
          <div v-if="loadout.cultivationSourceRows.value.length" class="progression-list">
            <div v-for="source in loadout.cultivationSourceRows.value" :key="source.id">
              <span>{{ source.label }}</span>
              <strong>{{ source.valueLabel }}</strong>
              <em>{{ source.description }}</em>
            </div>
          </div>
        </section>
      </div>

      <template #footer>
        <GameActionButton tone="stone" @click="detailsDialogOpen = false">收起</GameActionButton>
      </template>
    </GameDialog>

    <GameDialog
      :visible="equipmentDialogOpen"
      title="装备"
      eyebrow="本命法器"
      @close="equipmentDialogOpen = false"
    >
      <EquipmentLoadout
        :slots="loadout.equipmentSlots.value"
        :summary="loadout.loadoutProgressSummary.value"
        :stats="loadout.statList.value"
        :format-stat-value="loadout.formatStatValue"
        @select-slot="loadout.selectEquipmentSlot"
      />

      <template #footer>
        <GameActionButton tone="stone" @click="equipmentDialogOpen = false">收起</GameActionButton>
      </template>
    </GameDialog>

    <GameDialog
      :visible="Boolean(loadout.selectedInventoryItem.value)"
      title="物品详情"
      eyebrow="包裹"
      @close="loadout.selectInventoryItem(null)"
    >
      <div v-if="loadout.selectedInventoryItem.value" class="item-detail">
        <div class="detail-head">
          <GameIcon :icon="loadout.selectedInventoryItem.value.icon" :size="30" />
          <div>
            <strong>{{ loadout.selectedInventoryItem.value.name }}</strong>
            <em>{{ loadout.getTypeLabel(loadout.selectedInventoryItem.value.type) }}</em>
          </div>
        </div>
        <p>{{ loadout.selectedInventoryItem.value.description ?? '暂无描述' }}</p>
        <div v-if="loadout.selectedEquipment.value" class="detail-lines">
          <div v-for="(value, key) in loadout.selectedEquipment.value.bonuses" :key="key">
            <span>{{ getDetailStatLabel(key) }}</span>
            <strong>+{{ loadout.formatStatValue(key, value as number, true) }}</strong>
          </div>
        </div>
        <div v-else-if="loadout.selectedInventoryItem.value.effects" class="detail-lines">
          <div v-for="effect in loadout.selectedInventoryItem.value.effects" :key="`${effect.type}-${effect.value}`">
            <span>{{ loadout.getEffectLabel(effect) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <GameActionButton tone="stone" @click="loadout.selectInventoryItem(null)">关闭</GameActionButton>
        <GameActionButton
          v-if="loadout.selectedInventoryItem.value?.type === 'equipment'"
          tone="gold"
          @click="loadout.selectedInventoryItem.value && loadout.equipItem(loadout.selectedInventoryItem.value)"
        >
          装备
        </GameActionButton>
        <GameActionButton
          v-if="loadout.selectedInventoryItem.value?.type === 'consumable'"
          tone="jade"
          @click="loadout.useSelectedConsumable()"
        >
          使用
        </GameActionButton>
      </template>
    </GameDialog>

    <GameDialog
      :visible="Boolean(loadout.selectedEquipmentSlot.value)"
      :title="loadout.selectedEquipmentSlot.value?.label ?? '装备'"
      eyebrow="穿戴"
      @close="loadout.selectEquipmentSlot(null)"
    >
      <div v-if="loadout.selectedEquipmentSlot.value" class="slot-detail">
        <div v-if="loadout.selectedEquipmentSlot.value.equipment" class="current-equip">
          <GameIcon :icon="loadout.selectedEquipmentSlot.value.equipment.icon" :size="30" />
          <div>
            <strong>{{ loadout.selectedEquipmentSlot.value.equipment.name }}</strong>
            <p>{{ loadout.selectedEquipmentSlot.value.equipment.description }}</p>
          </div>
        </div>
        <div v-else class="empty-slot-note">此处尚未装备法器。</div>

        <div class="candidate-list">
          <button
            v-for="item in loadout.selectedEquipmentSlot.value.candidates"
            :key="item.id"
            @click="loadout.equipItemToSelectedSlot(item)"
          >
            <GameIcon :icon="item.icon" :size="18" />
            <strong>{{ item.name }}</strong>
          </button>
          <div v-if="!loadout.selectedEquipmentSlot.value.candidates.length" class="empty-slot-note">
            包裹中没有可替换装备。
          </div>
        </div>
      </div>

      <template #footer>
        <GameActionButton
          v-if="loadout.selectedEquipmentSlot.value?.equipment"
          tone="rose"
          @click="loadout.selectedEquipmentSlot.value && loadout.unequipSlot(loadout.selectedEquipmentSlot.value.slot)"
        >
          卸下
        </GameActionButton>
        <GameActionButton tone="stone" @click="loadout.selectEquipmentSlot(null)">关闭</GameActionButton>
      </template>
    </GameDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { XAvatarFrame } from '@rainlotus97/ui'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import EquipmentLoadout from '@/components/character/EquipmentLoadout.vue'
import InventoryGrid from '@/components/character/InventoryGrid.vue'
import InventorySchemaPanel from '@/components/character/InventorySchemaPanel.vue'
import PendingRewardsPanel from '@/components/character/PendingRewardsPanel.vue'
import SkillTreePanel from '@/components/character/SkillTreePanel.vue'
import { useCharacterLoadout, type CharacterPanelTab } from '@/composables/useCharacterLoadout'
import { useCompanionStore } from '@/stores/companionStore'
import { usePetStore } from '@/stores/petStore'
import { BLOODLINE_GRADE_BASE, getBloodlineName } from '@/types/bloodline'
import { getSpiritRootName, ROOT_GRADE_STATS } from '@/types/spiritRoot'
import type { UnitStats } from '@/types/unit'

const props = withDefaults(defineProps<{
  initialTab?: CharacterPanelTab
}>(), {
  initialTab: 'overview'
})

const loadout = useCharacterLoadout(props.initialTab)
const router = useRouter()
const companionStore = useCompanionStore()
const petStore = usePetStore()

const detailsDialogOpen = ref(false)
const equipmentDialogOpen = ref(false)

const summary = computed(() => loadout.characterSummary.value)

const rootColor = computed(() => {
  const spiritRoot = loadout.playerStore.spiritRoot
  return spiritRoot ? ROOT_GRADE_STATS[spiritRoot.grade]?.color ?? '#5e9387' : '#5e9387'
})

const bloodlineColor = computed(() => {
  const bloodline = loadout.playerStore.bloodline
  return bloodline ? BLOODLINE_GRADE_BASE[bloodline.grade]?.color ?? '#9b6e24' : '#9b6e24'
})

function handleClaimPendingRewards() {
  loadout.playerStore.claimPendingRewards()
}

const breakthroughHint = computed(() => {
  if (loadout.playerStore.canBreakthrough) {
    return `境界圆满，破境成功率 ${formatPercent(loadout.playerStore.breakthroughPreview.successRate)}`
  }
  if (loadout.playerStore.realmLevel === 9) return '九层圆满后可尝试破境'
  return '挂机修炼、丹药和奇遇都会推动修为'
})

function getDetailStatLabel(key: string | number) {
  return loadout.getStatLabel(String(key) as keyof UnitStats)
}

function formatRate(value: number) {
  return String(Math.max(1, Math.round(value)))
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function goToRoute(path: string) {
  void router.push(path)
}
</script>

<style scoped>
.character-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.character-panel > :not(.panel-layout) {
  flex: 0 0 auto;
  min-height: 0;
}

.hero-surface :deep(.x-card__content) {
  padding: 0.7rem 0.78rem;
}

.hero-row {
  display: grid;
  grid-template-columns: 3.6rem minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.avatar-glyph {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 34px;
  font-weight: 800;
}

.hero-copy {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.eyebrow {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.hero-copy h2 {
  margin: 0;
  color: #315257;
  font-size: 1.35rem;
  line-height: 1.1;
}

.hero-tags {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}

.hero-tags i {
  flex: 0 0 auto;
  max-width: 7rem;
  overflow: hidden;
  padding: 3px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(128, 153, 143, 0.16);
  color: #5d756f;
  font-size: 0.64rem;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-tags i:nth-child(n + 4) {
  display: none;
}

.hero-metrics {
  display: grid;
  grid-column: 2;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
}

.hero-metrics div {
  min-width: 0;
  display: grid;
  gap: 2px;
  padding: 5px 4px;
  border: 1px solid rgba(123, 153, 145, 0.16);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.56);
  text-align: center;
}

.hero-metrics span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 0.58rem;
}

.hero-metrics strong {
  color: #8b6326;
  font-size: 0.72rem;
  white-space: nowrap;
}

.hero-progress {
  margin-top: 2px;
  padding-top: 7px;
  border-top: 1px solid rgba(123, 153, 145, 0.16);
}

.hero-progress :deep(.progress-shell) {
  gap: 4px;
}

.hero-progress :deep(.progress-kernel .x-progress__track) {
  height: 6px;
}

.hero-progress :deep(.progress-shell small) {
  display: block;
  overflow: hidden;
  font-size: 0.62rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.character-tools {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.38rem;
  padding: 0.1rem 0;
}

.character-tools button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.26rem;
  min-width: 0;
  min-height: 2.25rem;
  padding: 0 0.3rem;
  border: 1px solid rgba(123, 153, 145, 0.18);
  border-radius: 0.72rem;
  background: rgba(255, 255, 255, 0.54);
  color: #55706a;
  font-family: var(--font-game);
  font-size: 0.66rem;
  font-weight: 700;
  cursor: pointer;
}

.character-tools button.current,
.character-tools button:hover {
  border-color: rgba(188, 141, 58, 0.34);
  background: rgba(255, 247, 218, 0.76);
  color: #8b6326;
}

.character-tools button:active {
  transform: translateY(1px);
}

.character-tools button .game-icon {
  color: #6a9186;
}

.character-tools button.current .game-icon,
.character-tools button:hover .game-icon {
  color: #a57427;
}

.character-tools button span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-entries {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.8rem;
}

.overview-entry {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  min-width: 0;
  min-height: 3.35rem;
  padding: 0.48rem 0.58rem;
  border: 1px solid rgba(123, 153, 145, 0.18);
  border-radius: 0.78rem;
  background: rgba(255, 255, 255, 0.54);
  color: #55706a;
  font-family: var(--font-game);
  text-align: left;
  cursor: pointer;
}

.overview-entry:hover {
  border-color: rgba(101, 152, 145, 0.36);
  background: rgba(237, 247, 239, 0.72);
}

.overview-entry:active {
  transform: translateY(1px);
}

.overview-entry-icon {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.62rem;
  background: rgba(231, 247, 238, 0.88);
  color: #4d897a;
}

.overview-entry-icon--gold {
  background: rgba(255, 248, 220, 0.78);
  color: #a57427;
}

.overview-entry-copy {
  display: grid;
  min-width: 0;
  gap: 0.16rem;
}

.overview-entry-copy strong,
.overview-entry-copy small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-entry-copy strong {
  color: #3c6961;
  font-size: 0.76rem;
}

.overview-entry-copy small {
  color: rgba(73, 97, 95, 0.64);
  font-size: 0.62rem;
}

.overview-entry > .game-icon {
  color: #78968b;
}

.overview-footer-note {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.7rem;
  color: rgba(73, 97, 95, 0.6);
  font-size: 0.62rem;
}

.overview-card.game-surface.padding-md :deep(.x-card__content) {
  padding: 0.72rem;
}

.overview-card .summary-grid {
  gap: 0.42rem;
}

.overview-card .summary-grid div {
  gap: 0.2rem;
  padding: 0.56rem 0.5rem;
  border-radius: 0.78rem;
}

.overview-card .summary-grid strong {
  font-size: 0.92rem;
}

.character-details-dialog {
  display: grid;
  gap: 1rem;
}

.details-section {
  display: grid;
  gap: 0.55rem;
}

.details-section + .details-section {
  padding-top: 0.85rem;
  border-top: 1px solid rgba(123, 153, 145, 0.16);
}

.details-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
}

.details-section-heading strong {
  color: #3c6961;
  font-size: 0.84rem;
}

.details-section-heading small {
  color: rgba(73, 97, 95, 0.6);
  font-size: 0.62rem;
}

.character-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.42rem;
}

.character-stat-grid > div {
  display: grid;
  gap: 0.18rem;
  padding: 0.56rem 0.62rem;
  border: 1px solid rgba(123, 153, 145, 0.16);
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.54);
}

.character-stat-grid span,
.character-stat-grid small {
  color: rgba(73, 97, 95, 0.64);
  font-size: 0.62rem;
}

.character-stat-grid strong {
  color: #8b6326;
  font-size: 0.86rem;
}

.character-stat-grid small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.character-details-dialog .learned-strip {
  margin-top: 0;
}

.character-details-dialog .learned-pill {
  min-height: 2.1rem;
  padding-inline: 0.58rem;
}

.character-details-dialog .progression-list {
  margin-top: 0;
}

.panel-layout {
  flex: 1 1 0;
  display: grid;
  grid-template-columns: minmax(260px, 0.86fr) minmax(0, 1.35fr);
  gap: 14px;
  align-items: start;
  min-height: 90px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1px 2px 4px;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summary-grid div,
.root-stats div,
.passive-list div,
.progression-list div {
  display: grid;
  gap: 5px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(123, 153, 145, 0.16);
}

.summary-grid span,
.passive-list span,
.progression-list span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.summary-grid strong,
.passive-list strong,
.progression-list strong {
  color: #8b6326;
  font-size: 18px;
}

.lineage-summary {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  padding: 8px;
  border: 1px solid rgba(123, 153, 145, 0.15);
  border-radius: 11px;
  background: rgba(232, 247, 239, 0.48);
}

.lineage-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  color: #4c766d;
  font-size: 0.68rem;
}

.lineage-heading small {
  color: rgba(73, 97, 95, 0.6);
  font-size: 0.58rem;
}

.lineage-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
}

.lineage-grid div {
  min-width: 0;
  display: grid;
  gap: 2px;
  padding: 5px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.54);
}

.lineage-grid span {
  overflow: hidden;
  color: rgba(73, 97, 95, 0.64);
  font-size: 0.56rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lineage-grid strong {
  overflow: hidden;
  color: #8b6326;
  font-size: 0.66rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equipment-disclosure {
  margin-top: 10px;
  border-top: 1px solid rgba(123, 153, 145, 0.16);
}

.equipment-summary {
  display: grid;
  grid-template-columns: 1.8rem minmax(0, 1fr) auto 1rem;
  align-items: center;
  gap: 7px;
  min-height: 3rem;
  padding: 6px 0 2px;
  color: #416c63;
  cursor: pointer;
  list-style: none;
}

.equipment-summary::-webkit-details-marker {
  display: none;
}

.equipment-summary-icon {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: rgba(255, 248, 220, 0.72);
  color: #a57427;
}

.equipment-summary-copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.equipment-summary-copy strong {
  font-size: 0.76rem;
}

.equipment-summary-copy small {
  overflow: hidden;
  color: rgba(73, 97, 95, 0.64);
  font-size: 0.6rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equipment-summary-value {
  color: #9a6f2c;
  font-size: 0.7rem;
  font-weight: 700;
}

.equipment-summary-chevron {
  color: #73958a;
  transition: transform 160ms ease;
}

.equipment-disclosure[open] .equipment-summary-chevron {
  transform: rotate(180deg);
}

.equipment-disclosure-body {
  padding-top: 6px;
  overflow: hidden;
}

.equipment-disclosure:not([open]) .equipment-disclosure-body {
  display: none;
}

.learned-strip,
.passive-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.progression-list {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.progression-list div {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.progression-list em {
  grid-column: 1 / -1;
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
  font-style: normal;
}

.learned-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid rgba(123, 153, 145, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  color: #345b59;
  font-family: var(--font-game);
}

.learned-pill span {
  color: #94692b;
}

.learned-pill b,
.learned-pill em {
  font-size: 12px;
  font-style: normal;
}

.item-detail,
.slot-detail {
  display: grid;
  gap: 14px;
}

.detail-head,
.current-equip {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.detail-head > span,
.current-equip > span {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  color: #8b6326;
  font-size: 24px;
  font-weight: 800;
}

.detail-head strong,
.current-equip strong {
  color: #315257;
}

.detail-head em,
.item-detail p,
.current-equip p,
.empty-slot-note {
  margin: 4px 0 0;
  color: rgba(55, 82, 80, 0.72);
  font-size: 12px;
  font-style: normal;
  line-height: 1.5;
}

.detail-lines {
  display: grid;
  gap: 8px;
}

.detail-lines div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid rgba(123, 153, 145, 0.14);
  color: #55706a;
  font-size: 12px;
}

.detail-lines strong {
  color: #2e8d72;
}

.candidate-list {
  display: grid;
  gap: 8px;
}

.candidate-list button {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(123, 153, 145, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
}

.combat-loadout-panel {
  display: grid;
  gap: 0.58rem;
  margin-bottom: 0.8rem;
  padding: 0.7rem;
  border: 1px solid rgba(155, 110, 36, 0.2);
  border-radius: 0.82rem;
  background: rgba(255, 250, 232, 0.68);
}

.combat-loadout-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.55rem;
}

.combat-loadout-heading > div {
  display: grid;
  gap: 0.12rem;
}

.combat-loadout-heading span,
.combat-loadout-heading small {
  color: rgba(73, 97, 95, 0.66);
  font-size: 0.62rem;
}

.combat-loadout-heading strong {
  color: #8b6326;
  font-size: 0.78rem;
}

.combat-loadout-options {
  display: flex;
  gap: 0.34rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.combat-loadout-options::-webkit-scrollbar {
  display: none;
}

.combat-loadout-options button {
  min-height: 2rem;
  flex: 0 0 auto;
  padding: 0 0.58rem;
  border: 1px solid rgba(123, 153, 145, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #55706a;
  font-family: var(--font-game);
  font-size: 0.66rem;
}

.combat-loadout-options button.active {
  border-color: rgba(155, 110, 36, 0.36);
  background: rgba(255, 244, 205, 0.92);
  color: #8b6326;
}

.companion-summary,
.pet-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 0.7rem;
  border: 1px solid rgba(123, 153, 145, 0.16);
  border-radius: 0.82rem;
  background: rgba(255, 255, 255, 0.64);
}

.companion-summary-main,
.pet-summary {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.58rem;
}

.companion-summary-main > div,
.pet-summary > div {
  display: grid;
  min-width: 0;
  gap: 0.2rem;
}

.companion-summary-icon,
.pet-summary-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  border-radius: 0.72rem;
  background: rgba(231, 247, 238, 0.88);
  color: #4d897a;
}

.companion-summary strong,
.pet-summary strong {
  overflow: hidden;
  color: #3c6961;
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.companion-summary small,
.pet-summary small {
  color: rgba(73, 97, 95, 0.68);
  font-size: 0.68rem;
  line-height: 1.45;
}

.companion-count {
  flex: 0 0 auto;
  color: #9b6e24;
  font-size: 0.78rem;
  font-weight: 700;
}

.pet-summary {
  justify-content: flex-start;
  margin-top: 0.55rem;
}

.open-secondary-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 2.8rem;
  margin-top: 0.7rem;
  padding: 0 0.75rem;
  border: 1px solid rgba(155, 110, 36, 0.28);
  border-radius: 0.72rem;
  background: rgba(255, 250, 232, 0.88);
  color: #8b6326;
  font-family: var(--font-game);
  font-size: 0.76rem;
  cursor: pointer;
}

.candidate-list span {
  color: #8b6326;
  font-weight: 800;
}

@media (max-width: 820px) {
  .hero-row {
    grid-template-columns: 3.6rem minmax(0, 1fr);
  }

  .hero-metrics {
    grid-column: 2;
  }

  .panel-layout {
    grid-template-columns: 1fr;
  }

  .panel-layout.is-focused-tab .content-card {
    order: 1;
  }

  .panel-layout.is-focused-tab .loadout-card {
    order: 2;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}

@container game-stage (max-width: 820px) {
  .hero-row {
    grid-template-columns: 3.6rem minmax(0, 1fr);
  }

  .hero-metrics {
    grid-column: 2;
  }

  .panel-layout {
    grid-template-columns: 1fr;
  }

  .panel-layout.is-focused-tab .content-card {
    order: 1;
  }

  .panel-layout.is-focused-tab .loadout-card {
    order: 2;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-layout.is-focused-tab .loadout-card {
    display: none;
  }
}
</style>
