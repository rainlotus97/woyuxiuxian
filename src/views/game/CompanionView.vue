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
import { COMPANION_QUALITY_CONFIG, GACHA_CONFIG, type GachaResult } from '@/types/companion'
import { SKILL_DEFINITIONS } from '@/types/skill'
import { useToast } from '@/composables/useToast'

const companionStore = useCompanionStore()
const { success, warning, info } = useToast()

const activeTab = ref<'companions' | 'gacha' | 'formation'>('companions')
const selectedCompanionId = ref<string | null>(null)
const gachaResults = ref<GachaResult[]>([])

const tabs = [
  { id: 'companions' as const, name: '伙伴', icon: '👥' },
  { id: 'gacha' as const, name: '招募', icon: '🎰' },
  { id: 'formation' as const, name: '上阵', icon: '⚔️' }
]

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
</script>

<style scoped>
.companion-view {
  padding-bottom: 16px;
}

/* 功能标签 */
.function-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 8px;
  color: var(--color-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: rgba(126, 184, 218, 0.2);
  border-color: rgba(126, 184, 218, 0.4);
  color: #7eb8da;
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
