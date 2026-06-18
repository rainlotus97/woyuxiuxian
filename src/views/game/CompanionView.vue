<template>
  <div class="companion-view">
    <!-- 功能标签 -->
    <div class="function-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </div>

    <!-- 伙伴列表 -->
    <GameSurface v-if="activeTab === 'bonds'" tone="gold" padding="md" compact class="npc-bond-panel">
      <div class="bond-hero">
        <div>
          <span>人物缘分</span>
          <strong>可结识人物</strong>
          <p>与世界中的关键人物互动会提升好感，并把关系变化写入世界日志与人物纪闻。</p>
        </div>
        <div class="bond-hero-actions">
          <GameActionButton icon="闻" tone="gold" :disabled="!canObserveNpcActivity" @click="handleObserveNpcActivity">
            探听一时辰
          </GameActionButton>
          <div class="bond-count">{{ worldStore.npcCompanionCandidates.length }}</div>
        </div>
      </div>

      <NpcActivityPanel
        :items="activityItems"
        :total-events="npcActivityInsight?.totalEvents ?? 0"
        :time-label="npcActivityInsight?.timeLabel ?? worldStore.currentTimeLabel"
      />

      <div class="npc-bond-list">
        <NpcBondCard
          v-for="candidate in worldStore.npcCompanionCandidates"
          :key="candidate.id"
          :candidate="candidate"
          @interact="handleNpcInteraction"
        />
      </div>
    </GameSurface>

    <div v-if="activeTab === 'companions'" class="companions-panel">
      <div v-if="companionStore.ownedCompanionDetails.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-text">暂无伙伴</div>
        <div class="empty-hint">前往招募获取伙伴</div>
      </div>

      <div v-else class="companions-grid">
        <div
          v-for="{ owned, definition } in companionStore.ownedCompanionDetails"
          :key="owned.definitionId"
          class="companion-card"
          :class="{ equipped: owned.equipped }"
          @click="selectedCompanionId = owned.definitionId"
        >
          <div class="card-header" :style="{ background: definition ? getQualityBg(definition.quality) : '' }">
            <div class="card-icon">{{ definition?.icon ?? '?' }}</div>
            <div class="card-stars">
              <span v-for="i in owned.stars" :key="i">★</span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-name">{{ definition?.name ?? '未知' }}</div>
            <div class="card-level">Lv.{{ owned.level }}</div>
            <div class="card-bond">❤️ {{ owned.bond }}</div>
            <div class="card-specialty">{{ definition?.specialty ?? '-' }}</div>
          </div>
          <div class="card-badge" v-if="owned.equipped">上阵</div>
        </div>
      </div>
    </div>

    <!-- 招募面板 -->
    <div v-if="activeTab === 'gacha'" class="gacha-panel">
      <div class="gacha-header">
        <div class="gacha-title">伙伴招募</div>
        <div class="pity-counter">
          <span class="pity-label">保底计数</span>
          <span class="pity-value">{{ 80 - (companionStore.gachaPoints % 80) }}抽</span>
        </div>
      </div>

      <div class="gacha-buttons">
        <button
          class="gacha-btn single"
          :class="{ disabled: !companionStore.canSingleGacha }"
          @click="handleSingleGacha"
        >
          <div class="btn-title">单抽</div>
          <div class="btn-cost">💎 100</div>
        </button>
        <button
          class="gacha-btn ten"
          :class="{ disabled: !companionStore.canTenGacha }"
          @click="handleTenGacha"
        >
          <div class="btn-title">十连</div>
          <div class="btn-cost">💎 900</div>
        </button>
      </div>

      <div class="gacha-rates">
        <div class="rate-title">招募概率</div>
        <div class="rate-list">
          <span class="rate-item" style="color: #ffd700">神品 2%</span>
          <span class="rate-item" style="color: #f59e0b">仙品 8%</span>
          <span class="rate-item" style="color: #4ade80">灵品 30%</span>
          <span class="rate-item" style="color: #9ca3af">凡品 60%</span>
        </div>
      </div>

      <!-- 抽卡结果 -->
      <div v-if="gachaResults.length > 0" class="gacha-results">
        <div class="results-title">招募结果</div>
        <div class="results-grid">
          <div
            v-for="result in gachaResults"
            :key="result.companion.id"
            class="result-card"
            :style="{ borderColor: getQualityColor(result.companion.quality) }"
          >
            <div class="result-icon">{{ result.companion.icon }}</div>
            <div class="result-name">{{ result.companion.name }}</div>
            <div class="result-quality" :style="{ color: getQualityColor(result.companion.quality) }">
              {{ result.companion.quality }}
            </div>
            <div v-if="!result.isNew" class="result-fragments">+{{ result.fragments }}碎片</div>
            <div v-else class="result-new">NEW!</div>
          </div>
        </div>
        <button class="close-results-btn" @click="gachaResults = []">关闭</button>
      </div>
    </div>

    <!-- 上阵面板 -->
    <div v-if="activeTab === 'formation'" class="formation-panel">
      <div class="formation-title">上阵配置 ({{ companionStore.equippedCompanionIds.length }}/4)</div>

      <div class="formation-slots">
        <div
          v-for="i in 4"
          :key="i"
          class="formation-slot"
          :class="{ filled: companionStore.equippedCompanions[i - 1] }"
        >
          <template v-if="companionStore.equippedCompanions[i - 1]">
            <div class="slot-icon">{{ companionStore.equippedCompanions[i - 1]?.definition?.icon }}</div>
            <div class="slot-name">{{ companionStore.equippedCompanions[i - 1]?.definition?.name }}</div>
            <button class="unequip-btn" @click="handleUnequip(companionStore.equippedCompanions[i - 1]?.owned.definitionId ?? '')">
              下阵
            </button>
          </template>
          <template v-else>
            <div class="slot-empty">空位</div>
          </template>
        </div>
      </div>

      <div class="available-companions">
        <div class="available-title">可上阵伙伴</div>
        <div class="available-list">
          <div
            v-for="{ owned, definition } in companionStore.ownedCompanionDetails"
            :key="owned.definitionId"
            class="available-item"
            :class="{ equipped: owned.equipped }"
          >
            <div class="item-icon">{{ definition?.icon ?? '?' }}</div>
            <div class="item-name">{{ definition?.name ?? '未知' }}</div>
            <div class="item-level">Lv.{{ owned.level }}</div>
            <button
              v-if="!owned.equipped"
              class="equip-btn"
              :disabled="companionStore.equippedCompanionIds.length >= 4"
              @click="handleEquip(owned.definitionId)"
            >
              上阵
            </button>
            <span v-else class="equipped-label">已上阵</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 伙伴详情弹窗 -->
    <div v-if="selectedCompanionId" class="modal-overlay" @click.self="selectedCompanionId = null">
      <div class="modal-content companion-detail-modal">
        <template v-if="selectedCompanionDef && selectedOwned">
          <div class="modal-header" :style="{ background: getQualityBg(selectedCompanionDef.quality) }">
            <div class="detail-icon">{{ selectedCompanionDef.icon }}</div>
            <div class="detail-stars">
              <span v-for="i in selectedOwned.stars" :key="i">★</span>
            </div>
            <button class="modal-close" @click="selectedCompanionId = null">×</button>
          </div>

          <div class="modal-body">
            <div class="detail-name">{{ selectedCompanionDef.name }}</div>
            <div class="detail-quality" :style="{ color: getQualityColor(selectedCompanionDef.quality) }">
              {{ selectedCompanionDef.quality }}
            </div>

            <div class="detail-stats">
              <div class="stat-row">
                <span>等级</span>
                <span>Lv.{{ selectedOwned.level }}</span>
              </div>
              <div class="stat-row">
                <span>好感度</span>
                <span>❤️ {{ selectedOwned.bond }}/100</span>
              </div>
              <div class="stat-row">
                <span>专长</span>
                <span>{{ selectedCompanionDef.specialty }}</span>
              </div>
              <div class="stat-row">
                <span>碎片</span>
                <span>{{ selectedOwned.fragments }}/{{ GACHA_CONFIG.fragmentsForStar }}</span>
              </div>
            </div>

            <div class="detail-story">
              <h4>背景故事</h4>
              <p>{{ selectedCompanionDef.backstory }}</p>
            </div>

            <!-- 技能列表 -->
            <div class="detail-skills">
              <h4>技能 ({{ selectedOwned.learnedSkills?.length || 0 }}/{{ selectedOwned.maxSkillSlots }})</h4>
              <div class="skills-list">
                <div v-for="skillId in companionStore.getCompanionAllSkills(selectedOwned.definitionId)" :key="skillId" class="skill-item">
                  <span class="skill-icon">✨</span>
                  <span class="skill-name">{{ getSkillName(skillId) }}</span>
                  <span v-if="!selectedCompanionDef.skills.includes(skillId)" class="skill-learned">学</span>
                </div>
                <div v-if="companionStore.getCompanionAllSkills(selectedOwned.definitionId).length === 0" class="no-skills">
                  暂无技能
                </div>
              </div>
            </div>

            <div class="detail-actions">
              <button
                v-if="selectedOwned.fragments >= GACHA_CONFIG.fragmentsForStar && selectedOwned.stars < 5"
                class="action-btn star-up"
                @click="handleStarUp"
              >
                ⭐ 升星
              </button>
              <button
                v-if="!selectedOwned.equipped"
                class="action-btn equip"
                @click="handleEquipAndClose"
              >
                ⚔️ 上阵
              </button>
              <button
                v-else
                class="action-btn unequip"
                @click="handleUnequipAndClose"
              >
                下阵
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCompanionStore } from '@/stores/companionStore'
import { useWorldStore } from '@/stores/worldStore'
import { COMPANION_QUALITY_CONFIG, GACHA_CONFIG, type GachaResult } from '@/types/companion'
import { SKILL_DEFINITIONS } from '@/types/skill'
import { useToast } from '@/composables/useToast'
import { useNpcActivityInsight } from '@/composables/useNpcActivityInsight'
import { useNpcInteraction } from '@/composables/useNpcInteraction'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import NpcActivityPanel from '@/components/companion/NpcActivityPanel.vue'
import NpcBondCard from '@/components/companion/NpcBondCard.vue'
import type { NpcInteractionKind } from '@/world/runtime/npcCompanionResolver'

const companionStore = useCompanionStore()
const worldStore = useWorldStore()
const { success, warning, info } = useToast()
const {
  canObserve: canObserveNpcActivity,
  lastInsight: npcActivityInsight,
  observeOneTick: observeNpcActivityOneTick
} = useNpcActivityInsight()
const { interactWithNpc: interactWithNpcWithJourney } = useNpcInteraction()

const activeTab = ref<'bonds' | 'companions' | 'gacha' | 'formation'>('bonds')
const selectedCompanionId = ref<string | null>(null)
const gachaResults = ref<GachaResult[]>([])

const tabs = [
  { id: 'bonds' as const, name: '缘分', icon: '缘' },
  { id: 'companions' as const, name: '伙伴', icon: '伴' },
  { id: 'gacha' as const, name: '招募', icon: '招' },
  { id: 'formation' as const, name: '上阵', icon: '阵' }
]

const activityItems = computed(() => {
  if (npcActivityInsight.value) return npcActivityInsight.value.items
  const latest = worldStore.importantNpcStoryViews.slice(0, 2)
  if (latest.length > 0) {
    return latest.map(view => ({
      id: view.entry.id,
      npcId: view.entry.npcId,
      npcName: view.actorNames[0] ?? '人物',
      label: '纪闻',
      title: view.entry.title,
      text: view.entry.text,
      timeLabel: view.entry.timeLabel,
      severity: view.entry.severity,
      tags: view.entry.tags,
      tone: view.entry.severity === 'legendary' ? 'rose' as const : view.entry.severity === 'major' ? 'gold' as const : 'jade' as const
    }))
  }
  return [{
    id: 'npc_activity_empty',
    npcId: null,
    npcName: '天下人物',
    label: '提示',
    title: '可主动探听',
    text: '点击探听一时辰，会推进世界时钟并汇总新出现的人物纪闻、破境、受伤、谋算或关系变化。',
    timeLabel: worldStore.currentTimeLabel,
    severity: 'minor' as const,
    tags: ['npc'],
    tone: 'mist' as const
  }]
})

// 选中的伙伴详情
const selectedCompanionDef = computed(() => {
  if (!selectedCompanionId.value) return null
  return companionStore.ownedCompanionDetails.find(
    c => c.owned.definitionId === selectedCompanionId.value
  )?.definition ?? null
})

const selectedOwned = computed(() => {
  if (!selectedCompanionId.value) return null
  return companionStore.ownedCompanions.find(
    c => c.definitionId === selectedCompanionId.value
  ) ?? null
})

// 获取品质颜色
function getQualityColor(quality: string): string {
  return COMPANION_QUALITY_CONFIG[quality as keyof typeof COMPANION_QUALITY_CONFIG]?.color ?? '#9ca3af'
}

// 获取品质背景
function getQualityBg(quality: string): string {
  const color = getQualityColor(quality)
  return `linear-gradient(135deg, ${color}33, ${color}11)`
}

// 获取技能名称
function getSkillName(skillId: string): string {
  const skill = SKILL_DEFINITIONS[skillId]
  return skill?.name ?? skillId
}

// 单抽
function handleSingleGacha() {
  const result = companionStore.singleGacha()
  if (result) {
    gachaResults.value = [result]
    if (result.isNew) {
      success(`获得新伙伴: ${result.companion.name}!`)
    }
  } else {
    warning('灵石不足')
  }
}

// 十连
function handleTenGacha() {
  const results = companionStore.tenGacha()
  if (results.length > 0) {
    gachaResults.value = results
    const newCount = results.filter(r => r.isNew).length
    if (newCount > 0) {
      success(`获得 ${newCount} 位新伙伴!`)
    }
  } else {
    warning('灵石不足')
  }
}

// 上阵
function handleEquip(definitionId: string) {
  if (companionStore.equipCompanion(definitionId)) {
    success('上阵成功')
  } else {
    warning('上阵失败')
  }
}

// 下阵
function handleUnequip(definitionId: string) {
  if (companionStore.unequipCompanion(definitionId)) {
    info('已下阵')
  }
}

// 上阵并关闭弹窗
function handleEquipAndClose() {
  if (selectedCompanionId.value) {
    handleEquip(selectedCompanionId.value)
    selectedCompanionId.value = null
  }
}

// 下阵并关闭弹窗
function handleUnequipAndClose() {
  if (selectedCompanionId.value) {
    handleUnequip(selectedCompanionId.value)
    selectedCompanionId.value = null
  }
}

// 升星
function handleStarUp() {
  if (selectedCompanionId.value) {
    if (companionStore.starUpCompanion(selectedCompanionId.value)) {
      success('升星成功!')
    } else {
      warning('碎片不足')
    }
  }
}

function handleNpcInteraction(npcId: string, kind: NpcInteractionKind) {
  const result = interactWithNpcWithJourney(npcId, kind)
  if (!result.success || !result.resolution) {
    warning('当前无法互动')
    return
  }

  success(result.resolution.title)
  info(`好感 +${result.resolution.favorDelta}`)
}

function handleObserveNpcActivity() {
  if (!canObserveNpcActivity.value) {
    warning('尚未结识可追踪人物')
    return
  }
  const insight = observeNpcActivityOneTick()
  if (insight.totalEvents > 0) {
    success(`探听到 ${insight.totalEvents} 条人物动向`)
  } else {
    info('这一时辰没有新的关键人物动向')
  }
}
</script>

<style scoped>
.companion-view {
  padding-bottom: 16px;
}

.bond-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
  padding: 16px;
  border: 1px solid rgba(188, 141, 58, 0.24);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 252, 238, 0.96), rgba(241, 249, 244, 0.84)),
    radial-gradient(circle at top right, rgba(255, 212, 112, 0.18), transparent 58%);
  box-shadow: 0 16px 34px rgba(87, 126, 121, 0.12);
}

.bond-hero div:first-child {
  display: grid;
  gap: 4px;
}

.bond-hero span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.bond-hero strong {
  color: #8b6226;
  font-size: 18px;
}

.bond-hero p {
  margin: 0;
  color: rgba(53, 81, 83, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

.bond-hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.bond-count {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.74);
  color: #8b6226;
  font-size: 22px;
  font-weight: 800;
}

.npc-bond-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

/* 功能标签 */
.function-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 6px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.88), rgba(239, 249, 245, 0.76)),
    radial-gradient(circle at top, rgba(255, 223, 147, 0.16), transparent 58%);
}

.tab-btn {
  flex: 1;
  min-height: 42px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.56);
  border: 1px solid rgba(103, 149, 144, 0.14);
  border-radius: 12px;
  color: rgba(65, 91, 89, 0.74);
  font-family: var(--font-game);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: rgba(255, 248, 229, 0.92);
  border-color: rgba(194, 146, 66, 0.24);
  color: #8b6226;
  box-shadow: inset 0 0 0 1px rgba(194, 146, 66, 0.12);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 1rem;
  color: #e8e4d0;
  margin-bottom: 6px;
}

.empty-hint {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

/* 伙伴网格 */
.companions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.companion-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease;
}

.companion-card.equipped {
  border-color: rgba(74, 222, 128, 0.4);
}

.companion-card:active {
  transform: scale(0.98);
}

.card-header {
  padding: 12px;
  text-align: center;
}

.card-icon {
  font-size: 2.5rem;
}

.card-stars {
  font-size: 0.75rem;
  color: #fbbf24;
  margin-top: 4px;
}

.card-body {
  padding: 10px;
}

.card-name {
  font-size: 0.875rem;
  color: #e8e4d0;
  font-weight: 500;
  text-align: center;
}

.card-level {
  font-size: 0.6875rem;
  color: var(--color-muted);
  text-align: center;
  margin-top: 2px;
}

.card-bond {
  font-size: 0.6875rem;
  color: #f472b6;
  text-align: center;
  margin-top: 4px;
}

.card-specialty {
  font-size: 0.625rem;
  color: #7eb8da;
  text-align: center;
  margin-top: 4px;
}

.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(74, 222, 128, 0.9);
  color: #000;
  font-size: 0.5625rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.companion-card {
  position: relative;
}

/* 招募面板 */
.gacha-panel {
  position: relative;
}

.gacha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.gacha-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  font-weight: 500;
}

.pity-counter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.pity-label {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.pity-value {
  font-size: 0.875rem;
  color: #fbbf24;
  font-weight: 500;
}

.gacha-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.gacha-btn {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gacha-btn.single {
  background: linear-gradient(135deg, rgba(126, 184, 218, 0.2), rgba(126, 184, 218, 0.1));
  border: 1px solid rgba(126, 184, 218, 0.4);
}

.gacha-btn.ten {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1));
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.gacha-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gacha-btn:not(.disabled):active {
  transform: scale(0.98);
}

.btn-title {
  font-size: 1rem;
  color: #e8e4d0;
  font-weight: 500;
}

.btn-cost {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-top: 4px;
}

.gacha-rates {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.rate-title {
  font-size: 0.8125rem;
  color: #e8e4d0;
  margin-bottom: 8px;
}

.rate-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rate-item {
  font-size: 0.75rem;
}

/* 抽卡结果 */
.gacha-results {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.results-title {
  font-size: 1.25rem;
  color: var(--color-accent-warm);
  margin-bottom: 20px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  max-width: 400px;
}

.result-card {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  border-width: 2px;
  border-style: solid;
}

.result-icon {
  font-size: 1.5rem;
}

.result-name {
  font-size: 0.6875rem;
  color: #e8e4d0;
  margin-top: 4px;
}

.result-quality {
  font-size: 0.5625rem;
  margin-top: 2px;
}

.result-fragments,
.result-new {
  font-size: 0.5625rem;
  color: #4ade80;
  margin-top: 2px;
}

.close-results-btn {
  margin-top: 20px;
  padding: 10px 24px;
  background: rgba(126, 184, 218, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.4);
  border-radius: 10px;
  color: #7eb8da;
  font-size: 0.875rem;
  cursor: pointer;
}

/* 上阵面板 */
.formation-title {
  font-size: 0.9375rem;
  color: #e8e4d0;
  margin-bottom: 12px;
}

.formation-slots {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.formation-slot {
  flex: 1;
  height: 100px;
  background: rgba(0, 0, 0, 0.2);
  border: 2px dashed rgba(126, 184, 218, 0.3);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.formation-slot.filled {
  border-style: solid;
  border-color: rgba(74, 222, 128, 0.4);
}

.slot-icon {
  font-size: 2rem;
}

.slot-name {
  font-size: 0.75rem;
  color: #e8e4d0;
  margin-top: 4px;
}

.slot-empty {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.unequip-btn {
  margin-top: 6px;
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  color: #ef4444;
  font-size: 0.6875rem;
  cursor: pointer;
}

.available-title {
  font-size: 0.8125rem;
  color: var(--color-muted);
  margin-bottom: 8px;
}

.available-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.available-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.available-item.equipped {
  background: rgba(74, 222, 128, 0.1);
}

.item-icon {
  font-size: 1.5rem;
}

.item-name {
  flex: 1;
  font-size: 0.875rem;
  color: #e8e4d0;
}

.item-level {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.equip-btn {
  padding: 6px 12px;
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  border-radius: 6px;
  color: #4ade80;
  font-size: 0.75rem;
  cursor: pointer;
}

.equip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.equipped-label {
  font-size: 0.75rem;
  color: #4ade80;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(180deg, rgba(35, 38, 52, 0.98) 0%, rgba(25, 27, 38, 0.98) 100%);
  border: 1px solid rgba(200, 164, 92, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 340px;
  overflow: hidden;
}

.modal-header {
  position: relative;
  padding: 20px;
  text-align: center;
}

.detail-icon {
  font-size: 4rem;
}

.detail-stars {
  font-size: 1rem;
  color: #fbbf24;
  margin-top: 8px;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--color-muted);
  font-size: 1.125rem;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.detail-name {
  font-size: 1.25rem;
  color: #e8e4d0;
  font-weight: 500;
  text-align: center;
}

.detail-quality {
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 12px;
}

.detail-stats {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: #e8e4d0;
  padding: 4px 0;
}

.stat-row span:first-child {
  color: var(--color-muted);
}

.detail-story {
  margin-bottom: 16px;
}

.detail-story h4 {
  font-size: 0.8125rem;
  color: var(--color-accent-warm);
  margin-bottom: 6px;
}

.detail-story p {
  font-size: 0.8125rem;
  color: var(--color-muted);
  line-height: 1.5;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.action-btn.star-up {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fbbf24;
}

.action-btn.equip {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.action-btn.unequip {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.action-btn:active {
  transform: scale(0.98);
}

/* 横屏适配 */
@media (max-height: 500px) and (orientation: landscape) {
  .companions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .gacha-buttons {
    gap: 10px;
    margin-bottom: 12px;
  }

  .gacha-btn {
    padding: 12px;
  }

  .formation-slots {
    gap: 8px;
  }

  .formation-slot {
    height: 80px;
  }
}

@media (max-width: 720px) {
  .activity-list,
  .npc-bond-list {
    grid-template-columns: 1fr;
  }

  .bond-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .bond-hero-actions {
    justify-content: space-between;
  }

  .observe-btn {
    flex: 1;
  }
}

/* 技能列表 */
.detail-skills {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.detail-skills h4 {
  font-size: 0.875rem;
  color: #e8e4d0;
  margin-bottom: 8px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  font-size: 0.75rem;
  color: #e8e4d0;
}

.skill-icon {
  font-size: 0.625rem;
}

.skill-learned {
  font-size: 0.5rem;
  padding: 1px 4px;
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
  color: #93c5fd;
}

.no-skills {
  color: var(--color-muted);
  font-size: 0.75rem;
  font-style: italic;
}
</style>
