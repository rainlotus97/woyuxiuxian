<template>
  <div class="character-panel">
    <GameSurface class="hero-surface" tone="realm" padding="lg">
      <div class="hero-row">
        <div class="avatar-wrap" :style="{ '--element-color': loadout.getElementColor(summary.element) }">
          <span>{{ summary.icon }}</span>
        </div>
        <div class="hero-copy">
          <span class="eyebrow">本命修士</span>
          <h2>{{ summary.name }}</h2>
          <div class="hero-tags">
            <i :style="{ color: loadout.getQualityColor(summary.quality) }">{{ summary.quality }}</i>
            <i>{{ summary.realm }}</i>
            <i>{{ summary.element }}灵根</i>
          </div>
        </div>
      </div>

      <GameProgressBar
        label="修为"
        :current="summary.cultivation"
        :max="summary.maxCultivation"
        :hint="breakthroughHint"
        tone="gold"
      />
    </GameSurface>

    <div class="panel-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: loadout.activeTab.value === tab.id }"
        @click="loadout.activeTab.value = tab.id"
      >
        <span>{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <div class="panel-layout">
      <GameSurface class="loadout-card" tone="gold" padding="md" eyebrow="随身法器" title="穿戴">
        <EquipmentLoadout
          :slots="loadout.equipmentSlots.value"
          :stats="loadout.statList.value"
          :format-stat-value="loadout.formatStatValue"
          @select-slot="loadout.selectEquipmentSlot"
        />
      </GameSurface>

      <GameSurface
        v-if="loadout.activeTab.value === 'overview'"
        class="content-card"
        tone="mist"
        padding="md"
        eyebrow="养成总览"
        title="人物"
      >
        <div class="summary-grid">
          <div>
            <span>包裹</span>
            <strong>{{ summary.inventoryCount }}/{{ summary.maxInventorySlots }}</strong>
          </div>
          <div>
            <span>技能点</span>
            <strong>{{ summary.skillPoints }}</strong>
          </div>
          <div>
            <span>修为/秒</span>
            <strong>{{ formatRate(summary.cultivationPerSecond) }}</strong>
          </div>
          <div>
            <span>调息增幅</span>
            <strong>+{{ formatPercent(summary.cultivationMultiplier - 1) }}</strong>
          </div>
        </div>

        <div class="learned-strip">
          <button
            v-for="skill in loadout.learnedSkillCards.value.slice(0, 6)"
            :key="skill.learned.id"
            class="learned-pill"
            @click="loadout.activeTab.value = 'skills'"
          >
            <span>{{ skill.icon }}</span>
            <b>{{ skill.name }}</b>
            <em>Lv.{{ skill.learned.level }}</em>
          </button>
        </div>

        <div v-if="loadout.passiveBonusRows.value.length" class="passive-list">
          <div v-for="bonus in loadout.passiveBonusRows.value" :key="bonus.stat">
            <span>{{ bonus.label }}</span>
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
      </GameSurface>

      <GameSurface
        v-else-if="loadout.activeTab.value === 'inventory'"
        class="content-card"
        tone="mist"
        padding="md"
        eyebrow="随身包裹"
        title="背包"
      >
        <InventorySchemaPanel :summary="loadout.inventorySchemaSummary.value" />
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
        v-else
        class="content-card"
        tone="mist"
        padding="md"
        eyebrow="功法修行"
        title="技能树"
      >
        <SkillTreePanel
          :skill-points="summary.skillPoints"
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
    </div>

    <GameDialog
      :visible="Boolean(loadout.selectedInventoryItem.value)"
      title="物品详情"
      eyebrow="包裹"
      @close="loadout.selectInventoryItem(null)"
    >
      <div v-if="loadout.selectedInventoryItem.value" class="item-detail">
        <div class="detail-head">
          <span>{{ loadout.selectedInventoryItem.value.icon }}</span>
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
          <span>{{ loadout.selectedEquipmentSlot.value.equipment.icon }}</span>
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
            <span>{{ item.icon }}</span>
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
import { computed } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import EquipmentLoadout from '@/components/character/EquipmentLoadout.vue'
import InventoryGrid from '@/components/character/InventoryGrid.vue'
import InventorySchemaPanel from '@/components/character/InventorySchemaPanel.vue'
import SkillTreePanel from '@/components/character/SkillTreePanel.vue'
import { useCharacterLoadout, type CharacterPanelTab } from '@/composables/useCharacterLoadout'
import type { UnitStats } from '@/types/unit'

const props = withDefaults(defineProps<{
  initialTab?: CharacterPanelTab
}>(), {
  initialTab: 'overview'
})

const loadout = useCharacterLoadout(props.initialTab)

const tabs: Array<{ id: CharacterPanelTab; label: string; icon: string }> = [
  { id: 'overview', label: '人物', icon: '身' },
  { id: 'inventory', label: '包裹', icon: '囊' },
  { id: 'skills', label: '功法', icon: '卷' }
]

const summary = computed(() => loadout.characterSummary.value)

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
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}
</script>

<style scoped>
.character-panel {
  display: grid;
  gap: 14px;
}

.hero-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.avatar-wrap {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background:
    radial-gradient(circle at 38% 24%, rgba(255, 244, 198, 0.9), transparent 35%),
    linear-gradient(145deg, rgba(255, 255, 250, 0.94), rgba(226, 247, 237, 0.9));
  border: 2px solid var(--element-color);
  box-shadow: 0 18px 34px rgba(84, 125, 113, 0.16);
}

.avatar-wrap span {
  color: #8b6326;
  font-size: 34px;
  font-weight: 800;
}

.hero-copy {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.eyebrow {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.hero-copy h2 {
  margin: 0;
  color: #315257;
  font-size: 24px;
  line-height: 1.1;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hero-tags i {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(128, 153, 143, 0.16);
  color: #5d756f;
  font-size: 11px;
  font-style: normal;
}

.panel-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(123, 153, 145, 0.18);
}

.panel-tabs button {
  flex: 1;
  min-height: 42px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: #55706a;
  font-family: var(--font-game);
  font-size: 13px;
  font-weight: 800;
}

.panel-tabs button span {
  margin-right: 6px;
  color: #9a6f2c;
}

.panel-tabs button.active {
  background: linear-gradient(180deg, rgba(255, 249, 226, 0.96), rgba(231, 248, 239, 0.92));
  color: #8b6326;
  box-shadow: 0 10px 20px rgba(91, 119, 111, 0.12);
}

.panel-layout {
  display: grid;
  grid-template-columns: minmax(260px, 0.86fr) minmax(0, 1.35fr);
  gap: 14px;
  align-items: start;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summary-grid div,
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

.candidate-list span {
  color: #8b6326;
  font-weight: 800;
}

@media (max-width: 820px) {
  .panel-layout {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}
</style>
