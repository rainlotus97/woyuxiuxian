<template>
  <div class="companion-view">
    <header class="companion-page-header">
      <button
        type="button"
        class="companion-back-button"
        aria-label="返回角色总览"
        title="返回角色总览"
        @click="goBackToCharacter"
      >
        <GameIcon class="companion-back-icon" icon="chevron-right" :size="16" />
        <span>角色</span>
      </button>
      <div>
        <span>角色 · 灵伴</span>
        <strong>人物关系与队伍</strong>
      </div>
    </header>

    <nav class="function-actions" aria-label="灵伴功能入口">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="function-action"
        :class="{ current: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <GameIcon :icon="tab.icon" :size="16" />
        <span>{{ tab.name }}</span>
      </button>
    </nav>

    <!-- 伙伴列表 -->
    <GameSurface v-if="activeTab === 'bonds'" tone="gold" padding="md" compact class="npc-bond-panel">
      <div class="bond-hero">
        <div>
          <span>人物缘分</span>
          <strong>可结识人物</strong>
          <p>与世界中的关键人物互动会提升好感，并把关系变化写入世界日志与人物纪闻。</p>
        </div>
        <div class="bond-hero-actions">
          <GameActionButton class="observe-btn" icon="map" tone="gold" :disabled="!canObserveNpcActivity" @click="handleObserveNpcActivity">
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
      <GameSurface tone="jade" padding="md" compact class="companions-hero">
        <div class="companions-hero-copy">
          <span>人物册</span>
          <strong>立绘与来历</strong>
          <p>当前只跟随你选中的主角推进。初见先认其形，再翻面看一句来历，后续恩怨、羁绊和语音都从这里接。</p>
        </div>
      </GameSurface>

      <div class="companion-workspace-actions" aria-label="伙伴工作区">
        <button
          type="button"
          :class="{ current: companionWorkspace === 'roster' }"
          @click="companionWorkspace = 'roster'"
        >
          同行 <small>{{ companionStore.ownedCompanionDetails.length }}</small>
        </button>
        <button
          type="button"
          :class="{ current: companionWorkspace === 'codex' }"
          @click="companionWorkspace = 'codex'"
        >
          人物图鉴 <small>{{ codexProfiles.length }}</small>
        </button>
      </div>

      <section v-if="companionWorkspace === 'roster' && currentProtagonistProfile" class="current-protagonist-section">
        <div class="section-heading">
          <span>当前命线</span>
          <strong>{{ currentProtagonistProfile.name }}</strong>
          <p>本轮剧情只跟随当前主角前行，另一位主角暂不前置，可留到后续作为独立人物或好友线查看。</p>
        </div>
        <div class="companions-grid story-codex-grid protagonist-grid">
          <StoryCharacterPreviewCard
            :profile="currentProtagonistProfile"
            class="companion-story-card protagonist-card"
          />
        </div>
      </section>

      <section v-if="companionWorkspace === 'roster' && companionStore.ownedCompanionDetails.length === 0" class="empty-state">
        <GameIcon class="empty-icon" icon="companion" :size="32" />
        <div class="empty-text">暂无伙伴</div>
        <div class="empty-hint">前往招募获取伙伴</div>
      </section>

      <section v-else-if="companionWorkspace === 'roster'" class="companions-owned-section">
        <div class="section-heading">
          <span>同行中</span>
          <strong>已入队伙伴</strong>
        </div>
        <div
          class="companions-grid"
        >
          <div
            v-for="{ owned, definition } in companionStore.ownedCompanionDetails"
            :key="owned.definitionId"
            class="companion-card"
            :class="{ equipped: owned.equipped }"
          >
            <div class="companion-card-shell">
              <StoryCharacterPreviewCard
                v-if="getStoryCharacterProfile(owned.definitionId)"
                :profile="getStoryCharacterProfile(owned.definitionId)!"
                class="companion-story-card"
              />
              <StoryProfileFallbackCard
                v-else-if="definition"
                :name="definition.name"
                :title="`${definition.specialty}同行`"
                :faction="resolveCompanionFaction(definition.name)"
                :specialty="definition.specialty"
                :quality="definition.quality"
                :icon="definition.icon"
                :intro="resolveCompanionIntro(definition.name)"
                :description="definition.backstory"
                :accent-color="getQualityColor(definition.quality)"
                class="companion-story-card"
              />
              <div v-else class="companion-fallback-card">
                <div class="card-body">
                  <div class="card-name">未知伙伴</div>
                  <div class="card-level">档案待补</div>
                </div>
              </div>
            </div>
            <div class="companion-card-status">
              <span>Lv.{{ owned.level }}</span>
              <span><GameIcon icon="jade" :size="11" /> {{ owned.bond }}</span>
              <span>{{ definition?.specialty ?? '-' }}</span>
            </div>
            <button class="companion-card-open" type="button" @click="selectedCompanionId = owned.definitionId">
              查看
            </button>
            <div class="card-badge" v-if="owned.equipped">上阵</div>
          </div>
        </div>
      </section>

      <section v-if="companionWorkspace === 'codex'" class="story-codex-section">
        <div class="section-heading">
          <span>人物图鉴</span>
          <strong>已入局人物立绘</strong>
          <p>这里先记住样子、气息和出场方式。剧情正式揭名后，会继续沿用同一套人物档案与语音接口。</p>
        </div>
        <div class="companions-grid story-codex-grid">
          <StoryCharacterPreviewCard
            v-for="profile in codexProfiles"
            :key="profile.id"
            :profile="profile"
            class="companion-story-card"
          />
        </div>
      </section>
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
          <div class="btn-cost"><GameIcon icon="Diamond" :size="14" /> 100</div>
        </button>
        <button
          class="gacha-btn ten"
          :class="{ disabled: !companionStore.canTenGacha }"
          @click="handleTenGacha"
        >
          <div class="btn-title">十连</div>
          <div class="btn-cost"><GameIcon icon="Diamond" :size="14" /> 900</div>
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
            <GameIcon class="result-icon" :icon="result.companion.icon" :size="28" />
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
            <GameIcon class="slot-icon" :icon="companionStore.equippedCompanions[i - 1]?.definition?.icon ?? 'companion'" :size="28" />
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
            <GameIcon class="item-icon" :icon="definition?.icon ?? 'companion'" :size="24" />
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

    <XDialog
      :model-value="Boolean(selectedCompanionId)"
      :title="selectedCompanionDef?.name ?? '伙伴详情'"
      :subtitle="selectedCompanionDef?.specialty ?? ''"
      size="lg"
      tone="gold"
      @close="selectedCompanionId = null"
    >
      <template v-if="selectedCompanionDef && selectedOwned">
        <div class="detail-stars" :style="{ color: getQualityColor(selectedCompanionDef.quality) }">
          <span v-for="i in selectedOwned.stars" :key="i">★</span>
        </div>

        <div class="modal-body">
            <StoryCharacterPreviewCard
              v-if="selectedStoryProfile"
              :profile="selectedStoryProfile"
              class="detail-story-card"
            />
            <StoryProfileFallbackCard
              v-else-if="selectedCompanionDef"
              :name="selectedCompanionDef.name"
              :title="`${selectedCompanionDef.specialty}同行`"
              :faction="resolveCompanionFaction(selectedCompanionDef.name)"
              :specialty="selectedCompanionDef.specialty"
              :quality="selectedCompanionDef.quality"
              :icon="selectedCompanionDef.icon"
              :intro="resolveCompanionIntro(selectedCompanionDef.name)"
              :description="selectedCompanionDef.backstory"
              :accent-color="getQualityColor(selectedCompanionDef.quality)"
              class="detail-story-card"
            />
            <div class="detail-stats">
              <div class="stat-row">
                <span>等级</span>
                <span>Lv.{{ selectedOwned.level }}</span>
              </div>
              <div class="stat-row">
                <span>好感度</span>
                <span>{{ selectedOwned.bond }}/100</span>
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
              <h4>{{ selectedStoryProfile ? '人物小传' : '背景故事' }}</h4>
              <p>{{ selectedStoryProfile?.description ?? selectedCompanionDef.backstory }}</p>
            </div>

            <!-- 技能列表 -->
            <div class="detail-skills">
              <h4>技能 ({{ selectedOwned.learnedSkills?.length || 0 }}/{{ selectedOwned.maxSkillSlots }})</h4>
              <div class="skills-list">
                <div v-for="skillId in companionStore.getCompanionAllSkills(selectedOwned.definitionId)" :key="skillId" class="skill-item">
                  <GameIcon class="skill-icon" icon="spark" :size="16" />
                  <span class="skill-name">{{ getSkillName(skillId) }}</span>
                  <span v-if="!selectedCompanionDef.skills.includes(skillId)" class="skill-learned">学</span>
                </div>
                <div v-if="companionStore.getCompanionAllSkills(selectedOwned.definitionId).length === 0" class="no-skills">
                  暂无技能
                </div>
              </div>
            </div>

            <div v-if="selectedCompanionDef.relationshipSkills.length" class="detail-relationship-skills">
              <div class="relationship-skills-heading">
                <h4>关系技能</h4>
                <small>好感 {{ selectedOwned.bond }}/100</small>
              </div>
              <div class="relationship-skills-list">
                <button
                  v-for="relationshipSkill in selectedCompanionDef.relationshipSkills"
                  :key="relationshipSkill.id"
                  type="button"
                  class="relationship-skill-item"
                  :class="{ locked: selectedOwned.bond < relationshipSkill.bondRequired }"
                  :disabled="selectedOwned.bond < relationshipSkill.bondRequired"
                  :title="relationshipSkill.description"
                  @click="handleRelationshipSkill(relationshipSkill.id)"
                >
                  <span class="relationship-skill-icon">
                    <GameIcon :icon="relationshipSkill.icon" :size="16" />
                  </span>
                  <span class="relationship-skill-copy">
                    <strong>{{ relationshipSkill.name }}</strong>
                    <small>{{ relationshipSkill.description }}</small>
                  </span>
                  <span class="relationship-skill-state">
                    {{ selectedOwned.bond >= relationshipSkill.bondRequired ? '施展' : `${relationshipSkill.bondRequired}好感` }}
                  </span>
                </button>
              </div>
            </div>

            <div class="detail-actions">
              <GameActionButton
                v-if="selectedOwned.fragments >= GACHA_CONFIG.fragmentsForStar && selectedOwned.stars < 5"
                tone="gold"
                @click="handleStarUp"
              >
                升星
              </GameActionButton>
              <GameActionButton
                v-if="!selectedOwned.equipped"
                tone="jade"
                @click="handleEquipAndClose"
              >
                上阵
              </GameActionButton>
              <GameActionButton
                v-else
                tone="stone"
                @click="handleUnequipAndClose"
              >
                下阵
              </GameActionButton>
            </div>
        </div>
      </template>
    </XDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { XDialog } from '@rainlotus97/ui'
import { useCompanionStore } from '@/stores/companionStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useWorldStore } from '@/stores/worldStore'
import {
  COMPANION_QUALITY_CONFIG,
  GACHA_CONFIG,
  type CompanionRelationshipSkill,
  type GachaResult
} from '@/types/companion'
import type { StatusEffectType } from '@/types/unit'
import { SKILL_DEFINITIONS } from '@/types/skill'
import { useToast } from '@/composables/useToast'
import { useNpcActivityInsight } from '@/composables/useNpcActivityInsight'
import { useNpcInteraction } from '@/composables/useNpcInteraction'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import NpcActivityPanel from '@/components/companion/NpcActivityPanel.vue'
import NpcBondCard from '@/components/companion/NpcBondCard.vue'
import StoryCharacterPreviewCard from '@/components/story/StoryCharacterPreviewCard.vue'
import StoryProfileFallbackCard from '@/components/story/StoryProfileFallbackCard.vue'
import {
  resolveStoryCharacterProfileByName,
  resolveStoryCodexProfiles,
  resolveStoryProtagonistProfile
} from '@/story/runtime/storyCharacterCodex'
import type { NpcInteractionKind } from '@/world/runtime/npcCompanionResolver'

const companionStore = useCompanionStore()
const playerStore = usePlayerStore()
const worldStore = useWorldStore()
const router = useRouter()
const { success, warning, info } = useToast()
const {
  canObserve: canObserveNpcActivity,
  lastInsight: npcActivityInsight,
  observeOneTick: observeNpcActivityOneTick
} = useNpcActivityInsight()
const { interactWithNpc: interactWithNpcWithJourney } = useNpcInteraction()

const activeTab = ref<'bonds' | 'companions' | 'gacha' | 'formation'>('companions')
const companionWorkspace = ref<'roster' | 'codex'>('roster')
const selectedCompanionId = ref<string | null>(null)
const gachaResults = ref<GachaResult[]>([])
const codexProfiles = computed(() => resolveStoryCodexProfiles(playerStore.perspective))
const currentProtagonistProfile = computed(() => resolveStoryProtagonistProfile(playerStore.perspective))

const tabs = [
  { id: 'bonds' as const, name: '缘分', icon: 'jade' },
  { id: 'companions' as const, name: '伙伴', icon: 'companion' },
  { id: 'gacha' as const, name: '招募', icon: 'gift' },
  { id: 'formation' as const, name: '上阵', icon: 'formation' }
]

function goBackToCharacter() {
  void router.push('/game/profile')
}

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

const selectedStoryProfile = computed(() => {
  if (!selectedCompanionId.value) return null
  return getStoryCharacterProfile(selectedCompanionId.value)
})

// 获取品质颜色
function getQualityColor(quality: string): string {
  return COMPANION_QUALITY_CONFIG[quality as keyof typeof COMPANION_QUALITY_CONFIG]?.color ?? '#9ca3af'
}

// 获取技能名称
function getSkillName(skillId: string): string {
  const skill = SKILL_DEFINITIONS[skillId]
  return skill?.name ?? skillId
}

function getStoryCharacterProfile(definitionId: string) {
  const definition = getCompanionByDefinitionId(definitionId)
  if (!definition) return null
  return resolveStoryCharacterProfileByName(definition.name)
}

function getCompanionByDefinitionId(definitionId: string) {
  return companionStore.ownedCompanionDetails.find(item => item.owned.definitionId === definitionId)?.definition ?? null
}

function resolveCompanionFaction(name: string) {
  if (name.includes('白若璃')) return '药王谷'
  if (name.includes('林清寒')) return '青云剑阁'
  if (name.includes('叶无痕')) return '影城'
  return '同行人物'
}

function resolveCompanionIntro(name: string) {
  if (name.includes('白若璃')) return '她先替你稳住伤势，再慢慢把药脉和人情债一起带进命里。'
  if (name.includes('林清寒')) return '她认不认你，不在嘴上，而在那一剑会不会替你拦灾。'
  if (name.includes('叶无痕')) return '这种人先记住影子和出手，真心话往往要很后面才会露。'
  return '先记住这人的样子和来路，后头的关系会慢慢接上。'
}

function handleRelationshipSkill(skillId: string) {
  const companionId = selectedCompanionId.value
  if (!companionId) return
  const result = companionStore.activateRelationshipSkill(companionId, skillId)
  if (!result.success || !result.skill) {
    warning(result.message)
    return
  }

  const definition = selectedCompanionDef.value
  const skill = result.skill
  if (!definition) return

  const effects = applyRelationshipSkill(skill, definition.id)
  worldStore.recordWorldEffectTransaction({
    source: 'companion',
    sourceId: skill.id,
    title: `${definition.name}施展${skill.name}`,
    summary: skill.description,
    actorIds: ['player', definition.id],
    effects,
    tags: ['companion', 'relationship', skill.kind]
  })
  success(`${definition.name}：${skill.name}`)
}

function applyRelationshipSkill(skill: CompanionRelationshipSkill, companionId: string) {
  if (skill.kind === 'heal') {
    const amount = Math.max(1, Math.floor(playerStore.totalStats.maxHp * skill.value / 100))
    playerStore.baseStats.currentHp = Math.min(playerStore.totalStats.maxHp, playerStore.baseStats.currentHp + amount)
    return [{ type: 'outcome' as const, targetId: 'player', value: amount, label: '恢复气血', reason: skill.description }]
  }

  if (skill.kind === 'shield') {
    const amount = Math.max(1, Math.floor(playerStore.totalStats.maxHp * skill.value / 100))
    playerStore.addBuff({
      type: 'shield',
      duration: skill.duration ?? 3,
      value: amount,
      sourceId: companionId,
      icon: 'armor'
    })
    return [{ type: 'outcome' as const, targetId: 'player', value: amount, label: '护盾', reason: skill.description }]
  }

  if (skill.kind === 'buff') {
    const statusType: StatusEffectType = skill.statusType ?? 'buff_def'
    playerStore.addBuff({
      type: statusType,
      duration: skill.duration ?? 3,
      value: skill.value,
      sourceId: companionId,
      icon: skill.icon
    })
    return [{ type: 'outcome' as const, targetId: 'player', value: skill.value, label: '临时增益', reason: skill.description }]
  }

  if (skill.kind === 'control') {
    return [{ type: 'area' as const, targetId: 'next-world-tick', value: 1, label: '风险压制', reason: skill.description }]
  }

  return [{ type: 'npc' as const, targetId: companionId, value: 1, label: '援灵召唤', reason: skill.description }]
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
  height: 100%;
  min-height: 0;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  padding-bottom: 4px;
}

.companion-view > * {
  min-width: 0;
}

.companion-view > :not(.function-actions):not(.companion-page-header) {
  min-height: 90px;
  flex: 1 1 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1px 2px 14px;
  scrollbar-width: thin;
}

.npc-bond-panel,
.companions-panel,
.gacha-panel,
.formation-panel {
  min-width: 0;
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
  min-width: 0;
  flex: 1 1 auto;
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
  overflow-wrap: anywhere;
  margin: 0;
  color: rgba(53, 81, 83, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

.bond-hero-actions {
  min-width: 0;
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

.observe-btn {
  min-width: 0;
  flex: 0 1 auto;
}

.observe-btn :deep(.x-button__label) {
  white-space: normal;
  overflow-wrap: anywhere;
}

.npc-bond-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.companion-page-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 2.9rem;
  padding: 0 0.1rem;
}

.companion-page-header > div {
  display: grid;
  min-width: 0;
  gap: 0.12rem;
}

.companion-page-header span {
  color: rgba(73, 97, 95, 0.64);
  font-size: 0.62rem;
}

.companion-page-header strong {
  color: #3c6961;
  font-size: 0.86rem;
}

.companion-back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.18rem;
  min-height: 2.15rem;
  padding: 0 0.48rem 0 0.34rem;
  border: 1px solid rgba(123, 153, 145, 0.22);
  border-radius: 0.68rem;
  background: rgba(255, 255, 255, 0.58);
  color: #4d8175;
  font-family: var(--font-game);
  font-size: 0.66rem;
  cursor: pointer;
}

.companion-back-button:active {
  transform: translateY(1px);
}

.companion-back-icon {
  transform: rotate(180deg);
}

.function-actions {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.42rem;
  margin-bottom: 0.12rem;
  padding: 0.1rem 0;
}

.function-action {
  min-width: 0;
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  padding: 0 0.3rem;
  border: 1px solid rgba(103, 149, 144, 0.18);
  border-radius: 0.78rem;
  background: rgba(255, 255, 255, 0.58);
  color: rgba(65, 91, 89, 0.74);
  font-family: var(--font-game);
  font-size: 0.7rem;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.function-action.current,
.function-action:hover {
  background: rgba(255, 248, 229, 0.86);
  border-color: rgba(194, 146, 66, 0.42);
  color: #8b6226;
  box-shadow: 0 5px 12px rgba(134, 112, 65, 0.1);
}

.function-action:active {
  transform: translateY(1px);
}

.function-action span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 空状态 */
.empty-state {
  min-width: 0;
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
  color: #54716d;
  margin-bottom: 6px;
}

.empty-hint {
  font-size: 0.8125rem;
  color: rgba(84, 113, 109, 0.7);
}

/* 伙伴网格 */
.companions-grid {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 12px;
  align-items: start;
}

.companion-card {
  position: relative;
  min-width: 0;
  width: 100%;
  transition: all 0.15s ease;
}

.companion-card.equipped {
  border-color: rgba(74, 222, 128, 0.4);
}

.companion-card:active {
  transform: scale(0.98);
}

.companions-hero {
  min-width: 0;
  margin-bottom: 12px;
}

.companion-workspace-actions {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.42rem;
  margin-bottom: 14px;
  padding: 0;
}

.companion-workspace-actions button {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.32rem;
  min-height: 2.35rem;
  border: 1px solid rgba(103, 149, 144, 0.2);
  border-radius: 0.72rem;
  background: rgba(255, 255, 255, 0.54);
  color: rgba(65, 91, 89, 0.72);
  font-family: var(--font-game);
  font-size: 0.7rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.companion-workspace-actions button.current,
.companion-workspace-actions button:hover {
  border-color: rgba(194, 146, 66, 0.4);
  background: rgba(255, 248, 229, 0.84);
  color: #8b6226;
  box-shadow: 0 5px 12px rgba(134, 112, 65, 0.08);
}

.companion-workspace-actions button:active {
  transform: translateY(1px);
}

.companion-workspace-actions small {
  flex: 0 0 auto;
  min-width: 18px;
  padding: 2px 5px;
  border-radius: 999px;
  background: rgba(103, 149, 144, 0.12);
  font-size: 10px;
}

.companions-owned-section,
.story-codex-section {
  min-width: 0;
  display: grid;
  gap: 10px;
}

.current-protagonist-section {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.story-codex-section {
  margin-top: 14px;
}

.protagonist-grid {
  grid-template-columns: minmax(0, 340px);
  justify-content: center;
}

.protagonist-card {
  width: min(100%, 340px);
  max-width: min(100%, 340px);
}

.section-heading {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.section-heading span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.section-heading strong {
  color: #8b6226;
  font-size: 16px;
}

.section-heading p {
  overflow-wrap: anywhere;
  margin: 0;
  color: rgba(53, 81, 83, 0.74);
  font-size: 11px;
  line-height: 1.55;
}

.companions-hero-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.companions-hero-copy span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.companions-hero-copy strong {
  color: #8b6226;
  font-size: 18px;
}

.companions-hero-copy p {
  overflow-wrap: anywhere;
  margin: 0;
  color: rgba(53, 81, 83, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

.companion-card-shell {
  position: relative;
  min-width: 0;
  padding-bottom: 52px;
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
  white-space: nowrap;
  padding: 2px 6px;
  border-radius: 4px;
}

.companion-story-card {
  width: min(100%, 352px);
  max-width: 100%;
  min-height: 0;
  justify-self: center;
}

.story-codex-grid .companion-story-card {
  min-height: 0;
}

.detail-story-card {
  margin-bottom: 12px;
  min-height: 0;
}

.companion-fallback-card {
  overflow: hidden;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
}

.companion-card-status {
  position: absolute;
  left: 8px;
  right: 66px;
  bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
  z-index: 2;
}

.companion-card-status span {
  min-width: 0;
  max-width: 100%;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(245, 251, 248, 0.84);
  color: #6a6f5d;
  font-size: 10px;
  overflow-wrap: anywhere;
  box-shadow: 0 4px 10px rgba(47, 70, 67, 0.08);
}

.companion-card-open {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 2;
  min-width: 52px;
  padding: 6px 10px;
  border: 1px solid rgba(166, 129, 69, 0.18);
  border-radius: 999px;
  background: rgba(255, 248, 232, 0.94);
  color: #8b632c;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.companion-card-open + .card-badge {
  top: 10px;
}

@media (max-width: 560px) {
  .npc-bond-list,
  .companions-grid {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
  }

  .bond-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .bond-hero-actions {
    width: 100%;
    justify-content: space-between;
  }

  .companion-story-card {
    width: min(100%, 304px);
  }

  .story-codex-grid .companion-story-card {
    width: min(100%, 304px);
  }

  .companion-card-status {
    left: 8px;
    right: 72px;
    bottom: 10px;
    gap: 5px;
  }

  .companion-card-status span {
    padding: 4px 7px;
    font-size: 9px;
  }

  .companion-card-open {
    min-width: 56px;
    padding: 7px 10px;
    font-size: 10px;
  }
}

/* 招募面板 */
.gacha-panel {
  width: 100%;
  max-width: 760px;
  min-width: 0;
  margin: 0 auto;
  padding: clamp(14px, 2.4vw, 22px);
  border: 1px solid rgba(103, 149, 144, 0.18);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.92), rgba(239, 249, 245, 0.82)),
    radial-gradient(circle at top right, rgba(255, 223, 147, 0.16), transparent 58%);
  box-shadow: 0 16px 34px rgba(87, 126, 121, 0.1);
  position: relative;
}

.gacha-header {
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.gacha-title {
  min-width: 0;
  font-size: 1.125rem;
  color: #8b6226;
  font-weight: 500;
}

.pity-counter {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.pity-label {
  font-size: 0.6875rem;
  color: rgba(84, 113, 109, 0.68);
}

.pity-value {
  font-size: 0.875rem;
  color: #9b702b;
  font-weight: 500;
}

.gacha-buttons {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.gacha-btn {
  min-width: 0;
  min-height: 76px;
  display: grid;
  place-content: center;
  gap: 4px;
  padding: 14px 12px;
  border-radius: 12px;
  font-family: var(--font-game);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gacha-btn.single {
  background: linear-gradient(135deg, rgba(126, 184, 218, 0.16), rgba(126, 184, 218, 0.08));
  border: 1px solid rgba(126, 184, 218, 0.38);
}

.gacha-btn.ten {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(251, 191, 36, 0.08));
  border: 1px solid rgba(194, 146, 66, 0.34);
}

.gacha-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gacha-btn:not(.disabled):active {
  transform: scale(0.98);
}

.btn-title {
  min-width: 0;
  font-size: 1rem;
  color: #426864;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.btn-cost {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  color: rgba(84, 113, 109, 0.72);
  overflow-wrap: anywhere;
}

.gacha-rates {
  min-width: 0;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(103, 149, 144, 0.14);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.rate-title {
  font-size: 0.8125rem;
  color: #426864;
  margin-bottom: 8px;
}

.rate-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rate-item {
  min-width: 0;
  font-size: 0.75rem;
  overflow-wrap: anywhere;
}

/* 抽卡结果 */
.gacha-results {
  box-sizing: border-box;
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
  overflow-x: hidden;
  overflow-y: auto;
}

.results-title {
  min-width: 0;
  font-size: 1.25rem;
  color: #d9b25d;
  margin-bottom: 20px;
}

.results-grid {
  width: min(100%, 400px);
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.result-card {
  min-width: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  padding: 8px 4px;
  text-align: center;
  border-width: 2px;
  border-style: solid;
}

.result-icon {
  font-size: 1.5rem;
}

.result-name {
  min-width: 0;
  font-size: 0.6875rem;
  color: #426864;
  margin-top: 4px;
  overflow-wrap: anywhere;
}

.result-quality {
  min-width: 0;
  font-size: 0.5625rem;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.result-fragments,
.result-new {
  min-width: 0;
  font-size: 0.5625rem;
  color: #5a9e6f;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.close-results-btn {
  width: min(100%, 180px);
  min-height: 44px;
  margin-top: 20px;
  padding: 10px 24px;
  background: rgba(126, 184, 218, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.4);
  border-radius: 10px;
  color: #b8d9d2;
  font-size: 0.875rem;
  font-family: var(--font-game);
  cursor: pointer;
}

/* 上阵面板 */
.formation-panel {
  width: 100%;
  max-width: 980px;
  min-width: 0;
  margin: 0 auto;
  padding: clamp(14px, 2.4vw, 22px);
  border: 1px solid rgba(103, 149, 144, 0.18);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.92), rgba(239, 249, 245, 0.82)),
    radial-gradient(circle at top right, rgba(255, 223, 147, 0.16), transparent 58%);
  box-shadow: 0 16px 34px rgba(87, 126, 121, 0.1);
}

.formation-title {
  font-size: 0.9375rem;
  color: #8b6226;
  line-height: 1.35;
  margin-bottom: 12px;
  overflow-wrap: anywhere;
}

.formation-slots {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.formation-slot {
  min-width: 0;
  min-height: 108px;
  height: auto;
  padding: 12px 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.58);
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
  min-width: 0;
  max-width: 100%;
  font-size: 0.75rem;
  color: #426864;
  margin-top: 4px;
  line-height: 1.35;
  text-align: center;
  overflow-wrap: anywhere;
}

.slot-empty {
  font-size: 0.75rem;
  color: rgba(84, 113, 109, 0.68);
}

.unequip-btn {
  min-width: 0;
  min-height: 32px;
  margin-top: 6px;
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  color: #ef4444;
  font-size: 0.6875rem;
  white-space: nowrap;
  cursor: pointer;
}

.available-title {
  font-size: 0.8125rem;
  color: rgba(84, 113, 109, 0.72);
  margin-bottom: 8px;
}

.available-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.available-item {
  min-width: 0;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.58);
  border-radius: 10px;
}

.available-item.equipped {
  background: rgba(74, 222, 128, 0.1);
}

.item-icon {
  font-size: 1.5rem;
}

.item-name {
  min-width: 0;
  font-size: 0.875rem;
  color: #426864;
  overflow-wrap: anywhere;
}

.item-level {
  min-width: 0;
  font-size: 0.75rem;
  color: rgba(84, 113, 109, 0.68);
  white-space: nowrap;
}

.equip-btn {
  min-width: 48px;
  min-height: 34px;
  padding: 6px 12px;
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  border-radius: 6px;
  color: #4ade80;
  font-size: 0.75rem;
  white-space: nowrap;
  cursor: pointer;
}

.equip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.equipped-label {
  min-width: 0;
  font-size: 0.75rem;
  color: #4ade80;
  white-space: nowrap;
}

/* 弹窗样式 */
.modal-content {
  background:
    linear-gradient(180deg, rgba(255, 250, 242, 0.98), rgba(233, 243, 238, 0.96));
  border: 1px solid rgba(200, 164, 92, 0.22);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: min(88vh, 860px);
  overflow: hidden;
}

.detail-stars {
  min-width: 0;
  font-size: 1rem;
  color: #fbbf24;
  margin-top: 4px;
}

.modal-body {
  width: 100%;
  min-width: 0;
  max-height: min(80vh, 800px);
  padding: 14px 16px 18px;
  overflow-y: auto;
}

.detail-stats {
  min-width: 0;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(137, 171, 162, 0.14);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
}

.stat-row {
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.8125rem;
  color: #35504b;
  padding: 4px 0;
}

.stat-row span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.stat-row span:last-child {
  text-align: right;
}

.stat-row span:first-child {
  color: rgba(94, 116, 111, 0.74);
}

.detail-story {
  margin-bottom: 16px;
}

.detail-story h4 {
  margin-top: 0;
  font-size: 0.8125rem;
  color: #8b6226;
  margin-bottom: 6px;
}

.detail-story p {
  margin: 0;
  font-size: 0.8125rem;
  color: rgba(53, 81, 83, 0.78);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.detail-actions {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 120px), 1fr));
  gap: 10px;
}

.detail-actions :deep(.game-action-btn) {
  width: 100%;
  min-width: 0;
}

.detail-actions :deep(.x-button__label) {
  white-space: normal;
  overflow-wrap: anywhere;
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
    flex: 1 1 auto;
  }

  .companions-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .companion-story-card {
    min-height: 468px;
  }

  .detail-story-card {
    min-height: 0;
  }

  .gacha-panel,
  .formation-panel {
    padding: 14px;
  }

  .formation-slots {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .companion-card-status {
    left: 8px;
    right: 68px;
    bottom: 10px;
    gap: 5px;
  }

  .companion-card-status span {
    padding: 4px 7px;
    font-size: 9px;
  }

  .companion-card-open {
    right: 8px;
    bottom: 10px;
    min-width: 48px;
    padding: 6px 9px;
    font-size: 10px;
  }
}

@container game-stage (max-width: 720px) {
  .activity-list,
  .npc-bond-list,
  .companions-grid {
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
    flex: 1 1 auto;
  }

  .companion-story-card {
    min-height: 468px;
  }

  .detail-story-card {
    min-height: 0;
  }

  .gacha-panel,
  .formation-panel {
    padding: 14px;
  }

  .formation-slots {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 360px) {
  .function-actions {
    gap: 4px;
  }

  .function-action {
    gap: 3px;
    padding-inline: 3px;
    font-size: 0.6875rem;
  }

  .gacha-buttons,
  .formation-slots {
    grid-template-columns: minmax(0, 1fr);
  }
}

@container game-stage (max-width: 360px) {
  .function-actions {
    gap: 4px;
  }

  .function-action {
    gap: 3px;
    padding-inline: 3px;
    font-size: 0.6875rem;
  }

  .gacha-buttons,
  .formation-slots {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* 技能列表 */
.detail-skills {
  min-width: 0;
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(137, 171, 162, 0.14);
  border-radius: 14px;
}

.detail-skills h4 {
  font-size: 0.875rem;
  color: #35504b;
  margin-bottom: 8px;
}

.skills-list {
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-item {
  min-width: 0;
  max-width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(239, 247, 244, 0.92);
  border: 1px solid rgba(107, 154, 143, 0.2);
  border-radius: 999px;
  font-size: 0.75rem;
  color: #35504b;
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

.skill-name {
  min-width: 0;
  overflow-wrap: anywhere;
}

.no-skills {
  color: rgba(96, 118, 114, 0.72);
  font-size: 0.75rem;
  font-style: italic;
}

.detail-relationship-skills {
  min-width: 0;
  display: grid;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(194, 146, 66, 0.18);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 251, 236, 0.78), rgba(244, 249, 245, 0.68));
}

.relationship-skills-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.relationship-skills-heading h4 {
  margin: 0;
  color: #8b6226;
  font-size: 0.875rem;
}

.relationship-skills-heading small {
  color: rgba(84, 113, 109, 0.72);
  font-size: 0.6875rem;
}

.relationship-skills-list {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.relationship-skill-item {
  min-width: 0;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(107, 154, 143, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.68);
  color: #35504b;
  text-align: left;
  cursor: pointer;
}

.relationship-skill-item:not(:disabled):hover {
  border-color: rgba(194, 146, 66, 0.46);
  background: rgba(255, 250, 231, 0.92);
}

.relationship-skill-item.locked,
.relationship-skill-item:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.relationship-skill-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(194, 146, 66, 0.28);
  border-radius: 9px;
  background: rgba(255, 248, 225, 0.72);
  color: #9b702b;
}

.relationship-skill-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.relationship-skill-copy strong,
.relationship-skill-copy small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relationship-skill-copy strong {
  color: #35504b;
  font-size: 0.75rem;
}

.relationship-skill-copy small {
  color: rgba(84, 113, 109, 0.72);
  font-size: 0.625rem;
}

.relationship-skill-state {
  color: #9b702b;
  font-size: 0.625rem;
  white-space: nowrap;
}
</style>
