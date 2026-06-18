<template>
  <div class="cultivation-view">
    <GameSurface
      class="main-loop-surface"
      tone="mist"
      padding="lg"
      compact
      eyebrow="主循环"
      title="修仙行动台"
      :subtitle="heroSubtitle"
    >
      <div class="home-hero-layout">
        <div class="hero-main-card">
          <div class="protagonist-token">
            <span>{{ playerStore.icon }}</span>
            <small>{{ playerStore.realmInfo.fullName }}</small>
          </div>
          <div class="hero-copy">
            <span class="hero-realm">{{ idleModeLabel }}</span>
            <strong>{{ playerStore.isIdling ? '主角正在行动' : '等待安排' }}</strong>
            <p>{{ heroSummary }}</p>
          </div>

          <div v-if="offlineGains > 0" class="offline-banner">
            <div class="offline-copy">
              <span>离线积累</span>
              <strong>+{{ offlineGains }} 修为</strong>
            </div>
            <GameActionButton icon="🎁" tone="gold" @click="claimOfflineGains">领取</GameActionButton>
          </div>
        </div>

        <div class="quick-command-panel">
          <div class="quick-command-head">
            <span>今日可做</span>
            <strong>立即执行</strong>
          </div>
          <div class="quick-command-grid">
            <button type="button" class="quick-command primary" @click="toggleIdle">
              <span>{{ playerStore.isIdling ? '停' : '修' }}</span>
              <strong>{{ playerStore.isIdling ? '停止挂机' : '开始挂机' }}</strong>
            </button>
            <button type="button" class="quick-command" :disabled="!canAdvanceWorld" @click="handleAdvanceWorld">
              <span>时</span>
              <strong>推演一时辰</strong>
            </button>
            <button type="button" class="quick-command" :disabled="playerStore.captivity.isCaptured" @click="handlePlayerFortune">
              <span>缘</span>
              <strong>处理机缘</strong>
            </button>
            <button type="button" class="quick-command" @click="router.push('/game/story')">
              <span>卷</span>
              <strong>继续故事</strong>
            </button>
          </div>
        </div>

        <div class="action-feedback-panel">
          <div class="feedback-head">
            <span>最近反馈</span>
            <strong>{{ latestActionFeedbackTitle }}</strong>
          </div>
          <div v-if="latestActionFeedbackItems.length" class="feedback-list">
            <article
              v-for="item in latestActionFeedbackItems"
              :key="item.id"
              class="feedback-item"
              :class="`tone-${item.tone}`"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.text }}</p>
            </article>
          </div>
          <div v-else class="feedback-empty">
            <span>点击“推演一时辰”或“处理机缘”后，结果会直接写入主角行程和世界日志。</span>
          </div>
        </div>

        <div class="world-pulse-card">
          <div class="pulse-head">
            <span>{{ worldStore.currentTimeLabel }}</span>
            <strong>{{ worldStore.getIdleModeLabel(worldStore.idleMode) }}</strong>
            <p>{{ latestPulseText }}</p>
          </div>
          <div class="p0-rail">
            <div v-for="item in p0FocusItems" :key="item.label" class="p0-chip" :class="`tone-${item.tone}`">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>

        <div class="loop-hub-panel">
          <div class="loop-readiness-strip">
            <div>
              <span>{{ p0Audit.progressText }}</span>
              <strong>{{ p0Audit.title }}</strong>
              <small>{{ p0Audit.subtitle }}</small>
              <i class="p0-progress-meter" aria-hidden="true">
                <b :style="{ width: `${p0Audit.progressPercent}%` }"></b>
              </i>
            </div>
            <button
              type="button"
              class="next-loop-action"
              :class="`kind-${p0NextAction.primary.kind}`"
              @click="handleNextP0Action"
            >
              <span>{{ p0NextAction.primary.actionHint }}</span>
              <strong>{{ p0NextAction.primary.title }}</strong>
              <small>{{ p0NextAction.primary.reason }}</small>
            </button>
            <div class="readiness-counts">
              <span class="state-ready">可行动 {{ loopReadiness.counts.ready }}</span>
              <span class="state-warning">需处理 {{ loopReadiness.counts.warning }}</span>
              <span class="state-blocked">阻塞 {{ loopReadiness.counts.blocked }}</span>
              <span class="state-closed">闭环 {{ p0LoopClosure.counts.closed }}/{{ p0LoopClosure.totalCount }}</span>
            </div>
          </div>

          <div class="p0-acceptance-panel" :class="`state-${p0Acceptance.state}`">
            <div class="acceptance-copy">
              <span>{{ p0Acceptance.gateLabel }}</span>
              <strong>{{ p0Acceptance.headline }}</strong>
              <small v-if="p0Acceptance.primaryGap">
                当前缺口：{{ p0Acceptance.primaryGap.label }} · {{ p0Acceptance.primaryGap.detail }}
              </small>
              <small v-else>可以开始安排 P1 的大世界、战斗和宗门深化。</small>
            </div>
            <div class="acceptance-side">
              <div class="acceptance-gap-list" aria-label="P0 验收缺口">
                <button
                  v-for="item in p0Acceptance.remainingItems.slice(0, 4)"
                  :key="item.id"
                  type="button"
                  :class="`gap-${item.state}`"
                  @click="handleAcceptanceGap(item.id)"
                >
                  {{ item.label }} · {{ item.stateLabel }}
                </button>
                <span v-if="p0Acceptance.remainingCount > 4" class="gap-more">
                  +{{ p0Acceptance.remainingCount - 4 }}
                </span>
                <span v-if="p0Acceptance.readyForP1" class="gap-closed">P0 验收完成</span>
              </div>
              <button
                v-if="p0Acceptance.primaryGap"
                type="button"
                class="acceptance-action"
                @click="handleAcceptancePrimaryGap"
              >
                <span>{{ p0Acceptance.primaryGap.nextAction }}</span>
                <strong>处理缺口</strong>
              </button>
            </div>
          </div>

          <div class="loop-task-grid" aria-label="P0 主循环入口">
            <button
              v-for="task in mainLoopTasks"
              :key="task.id"
              class="loop-task-card"
              :class="[`tone-${task.tone}`, `state-${task.readiness.state}`, { active: task.active }]"
              @click="handleTaskAction(task)"
            >
              <span class="task-icon">{{ task.icon }}</span>
              <span class="task-copy">
                <small>{{ task.label }}</small>
                <strong>{{ task.title }}</strong>
                <em>{{ task.summary }}</em>
                <i>{{ task.readiness.reason }}</i>
                <b :class="`closure-${task.closure.state}`">{{ task.closure.evidence }}</b>
              </span>
              <span class="task-meta">{{ task.meta }}</span>
            </button>
          </div>
        </div>
      </div>
    </GameSurface>

    <div class="overview-grid secondary-home-grid">
      <GameSurface tone="gold" padding="md" eyebrow="修炼进程" title="境界推进" :subtitle="breakthroughHint">
        <div class="progress-stack">
          <GameProgressBar
            label="修为进度"
            :current="playerStore.cultivation"
            :max="playerStore.maxCultivation"
            tone="gold"
          />
          <GameProgressBar
            label="体力储备"
            :current="playerStore.stamina"
            :max="playerStore.maxStamina"
            :hint="staminaRecoverLabel"
            tone="jade"
          />
        </div>

        <div v-if="playerStore.nextRealm" class="breakthrough-forecast">
          <span>破境 {{ playerStore.realm }} -> {{ playerStore.nextRealm }}</span>
          <strong>{{ formatPercent(playerStore.breakthroughPreview.successRate) }}</strong>
          <em>{{ playerStore.breakthroughPreview.selectedAid?.name ?? '无护持丹药' }}</em>
        </div>

        <template #footer>
          <div class="action-grid">
            <GameActionButton icon="坐" tone="gold" block :disabled="playerStore.isIdling" @click="handleMeditate">
              打坐修炼
            </GameActionButton>
            <GameActionButton
              icon="破"
              tone="jade"
              block
              :disabled="!playerStore.canBreakthrough"
              @click="handleBreakthrough"
            >
              突破境界
            </GameActionButton>
            <GameActionButton icon="装" tone="stone" block @click="router.push('/game/profile')">
              查看角色
            </GameActionButton>
          </div>
        </template>
      </GameSurface>

      <GameSurface tone="jade" padding="md" eyebrow="挂机安排" title="行动排程" subtitle="挂机期间，主角与世界同步推进。">
        <div class="idle-mode-list">
          <button
            v-for="mode in idleModes"
            :key="mode.id"
            class="idle-mode-card"
            :class="{ active: worldStore.idleMode === mode.id }"
            @click="handleIdleModeChange(mode.id)"
          >
            <span class="mode-icon">{{ mode.icon }}</span>
            <div class="mode-copy">
              <strong>{{ mode.label }}</strong>
              <small>{{ mode.description }}</small>
            </div>
          </button>
        </div>
      </GameSurface>
    </div>

    <div class="world-grid secondary-home-grid">
      <WorldBriefingPanel :items="worldBriefings" @action="handleWorldBriefingAction" />

      <GameSurface tone="mist" padding="md" eyebrow="挂机见闻" title="主角行程" subtitle="挂机期间，主角会留下自己的经历、收获和奇遇。">
        <div class="journey-list">
          <div v-for="journey in recentJourneys" :key="journey.id" class="log-card" :class="`severity-${journey.severity}`">
            <div class="log-head">
              <strong>{{ journey.title }}</strong>
              <span>{{ journey.timeLabel }}</span>
            </div>
            <p>{{ journey.text }}</p>
            <small class="log-reward">{{ formatJourneyRewards(journey.rewards) }}</small>
          </div>
        </div>
      </GameSurface>
    </div>

    <div class="world-grid">
      <GameSurface
        :tone="sectPanelTone"
        padding="md"
        eyebrow="宗门态势"
        title="所属势力"
        :subtitle="sectStatusText"
      >
        <div class="sect-panel">
          <div v-if="sectStore.currentSect" class="sect-summary">
            <div class="sect-heading">
              <span class="sect-icon">{{ sectStore.currentSect.icon }}</span>
              <div>
                <strong>{{ sectStore.currentSect.name }}</strong>
                <small>{{ sectStore.positionName }} · 声望 {{ sectStore.reputation }}</small>
              </div>
            </div>

            <div class="sect-chip-row">
              <GameStatChip icon="🏯" label="宗门状态" :value="sectConditionLabel" :tone="sectStatusChipTone" />
              <GameStatChip icon="🎖️" label="贡献" :value="sectStore.contribution" tone="gold" />
            </div>

            <div v-if="sectStore.activeEvent" class="sect-event-banner">
              <strong>{{ sectStore.activeEvent.title }}</strong>
              <p>{{ sectStore.activeEvent.description }}</p>
            </div>
          </div>

          <div v-else class="empty-state">
            <strong>尚未拜入宗门</strong>
            <p>地图、故事与人物关系会持续解锁宗门归属。当前更适合优先推进历练和剧情。</p>
          </div>
        </div>
      </GameSurface>

      <GameSurface tone="realm" padding="md" eyebrow="重要人物" title="命运相逢" subtitle="关键 NPC 会持续在世界中成长、受伤、结盟或反目。">
        <div class="npc-list">
          <div v-for="npc in spotlightNpcs" :key="npc.id" class="npc-card">
            <div class="npc-leading">
              <div class="npc-badge">{{ npc.name.slice(0, 1) }}</div>
              <div class="npc-copy">
                <strong>{{ npc.name }}</strong>
                <small>{{ npc.title }} · {{ npc.realm }}{{ npc.realmLevel }}层 · {{ npc.goalLabel }}</small>
              </div>
            </div>
            <div class="npc-meta">
              <span class="destiny-pill" :class="`destiny-${npc.destinyTone}`">{{ npc.destinyRankLabel }}</span>
              <span class="bond-pill" :class="`bond-${npc.bondTone}`">{{ npc.bondLabel }}</span>
              <span class="state-pill">{{ npc.hpLabel }}</span>
            </div>
            <div class="npc-profile-grid">
              <div class="profile-chip">
                <span>灵根</span>
                <strong>{{ npc.root }}</strong>
              </div>
              <div class="profile-chip">
                <span>天资</span>
                <strong>{{ npc.talent }}</strong>
              </div>
              <div class="profile-chip">
                <span>血脉</span>
                <strong>{{ npc.bloodlineGradeLabel }}</strong>
              </div>
              <div class="profile-chip">
                <span>体质</span>
                <strong>{{ npc.constitution }}</strong>
              </div>
              <div class="profile-chip">
                <span>立场</span>
                <strong>{{ npc.factionStanceLabel }}</strong>
              </div>
              <div class="profile-chip">
                <span>缺陷</span>
                <strong>{{ npc.growthFlawSummary }}</strong>
              </div>
            </div>
            <p class="npc-story">{{ npc.background }}</p>
            <p class="npc-note">{{ npc.temperament }} · {{ npc.originLabel }} · {{ npc.notorietyLabel }}</p>
            <p class="npc-note">{{ npc.bloodline }} {{ npc.constitutionNote }}</p>
            <p class="npc-note">{{ npc.identityHook }}</p>
            <div class="npc-tags">
              <span v-for="tag in npc.destinyTags.slice(0, 3)" :key="tag" class="tag-pill">{{ tag }}</span>
              <span class="tag-pill tag-emphasis">潜力 {{ npc.potentialScore }}</span>
            </div>
          </div>
        </div>
      </GameSurface>
    </div>

    <div class="world-grid">
      <GameSurface tone="mist" padding="md" eyebrow="天地异变" title="区域异动" subtitle="灾害、遗迹、妖潮与灵脉会改变地图压力与修炼节奏。">
        <div class="journey-list">
          <div v-for="anomaly in areaAnomalies" :key="anomaly.id" class="anomaly-card" :class="`severity-${anomaly.severity}`">
            <div class="log-head">
              <strong>{{ getAnomalyIcon(anomaly.type) }} {{ anomaly.title }}</strong>
              <span>{{ anomaly.timeLabel }}</span>
            </div>
            <p>{{ anomaly.text }}</p>
            <small class="log-reward">{{ anomaly.riskHint }}</small>
          </div>
        </div>
      </GameSurface>
    </div>

    <GameSurface tone="mist" padding="md" eyebrow="世界流转" title="近期异闻" subtitle="挂机时，天气、宗门和 NPC 都会写入世界日志。">
      <div class="log-list">
        <div v-for="log in recentLogs" :key="log.entry.id" class="log-card" :class="`severity-${log.entry.severity}`">
          <div class="log-head">
            <strong>{{ log.entry.title }}<small v-if="log.entry.repeatCount > 1">x{{ log.entry.repeatCount }}</small></strong>
            <span>{{ log.entry.timeLabel }}</span>
          </div>
          <p>{{ log.entry.text }}</p>
          <div class="log-context">
            <span v-for="badge in log.badges" :key="`${badge.tone}-${badge.label}`" :class="`context-${badge.tone}`">
              {{ badge.label }}
            </span>
          </div>
        </div>
      </div>
    </GameSurface>

    <GameSurface tone="realm" padding="md" eyebrow="人物纪闻" title="命运回响" subtitle="重要人物的成长、负伤、破境与冲突会沉淀成可追踪的故事记录。">
      <div class="log-list">
        <div v-for="story in npcStories" :key="story.entry.id" class="log-card" :class="`severity-${story.entry.severity}`">
          <div class="log-head">
            <strong>{{ story.entry.title }}</strong>
            <span>{{ story.entry.timeLabel }}</span>
          </div>
          <p>{{ story.entry.text }}</p>
          <div class="log-context">
            <span v-for="badge in story.badges" :key="`${badge.tone}-${badge.label}`" :class="`context-${badge.tone}`">
              {{ badge.label }}
            </span>
          </div>
        </div>
      </div>
    </GameSurface>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import WorldBriefingPanel from '@/components/world/WorldBriefingPanel.vue'
import { useToast } from '@/composables/useToast'
import { sfxBreakthrough, sfxMeditate } from '@/composables/useAudio'
import { useModal } from '@/composables/useModal'
import { useWorldBriefingActions } from '@/composables/useWorldBriefingActions'
import { useWorldBriefings } from '@/composables/useWorldBriefings'
import { useWorldAdvanceSummary } from '@/composables/useWorldAdvanceSummary'
import { usePlayerFortune } from '@/composables/usePlayerFortune'
import { useMapStore } from '@/stores/mapStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { useStoryStore } from '@/story/storyStore'
import type { IdleMode } from '@/types/world'
import { getSectById } from '@/types/sect'
import { isMapAreaUnlocked } from '@/map/runtime/mapAreaUnlockResolver'
import {
  resolveMainLoopReadiness,
  type MainLoopReadinessItem,
  type MainLoopReadinessKey
} from '@/world/runtime/mainLoopReadinessResolver'
import {
  resolveP0LoopClosure,
  type P0LoopClosureItem
} from '@/world/runtime/p0LoopClosureResolver'
import { resolveP0LoopNextAction } from '@/world/runtime/p0LoopNextActionResolver'
import { resolveP0LoopAudit } from '@/world/runtime/p0LoopAuditResolver'
import { resolveP0LoopAcceptance } from '@/world/runtime/p0LoopAcceptanceResolver'
import {
  resolveP0LoopRouteTarget,
  type P0LoopRouteTarget
} from '@/world/runtime/p0LoopRouteResolver'
import {
  formatJourneyRewards,
  getAnomalyIcon,
  getBondLabel,
  getBondTone,
  getNpcGoalLabel,
  getNpcHealthLabel
} from '@/components/world/worldUi'

const playerStore = usePlayerStore()
const mapStore = useMapStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()
const storyStore = useStoryStore()
const router = useRouter()
const { success, warning, info } = useToast()
const { showItemAcquire } = useModal()
const { handleWorldBriefingAction } = useWorldBriefingActions()
const {
  canAdvance: canAdvanceWorld,
  lastSummary: lastAdvanceSummary,
  advanceOneTick
} = useWorldAdvanceSummary()
const { lastFortuneFeedback, handleFortune } = usePlayerFortune()

const IDLE_INTERVAL = 1000
const offlineGains = ref(0)
let idleTimer: number | null = null

interface MainLoopTask {
  id: MainLoopReadinessKey
  icon: string
  label: string
  title: string
  summary: string
  meta: string
  tone: 'jade' | 'gold' | 'rose' | 'mist'
  readiness: MainLoopReadinessItem
  closure: P0LoopClosureItem
  active?: boolean
  route?: P0LoopRouteTarget
  action?: 'toggleIdle'
}

interface ActionFeedbackItem {
  id: string
  label: string
  title: string
  text: string
  tone: 'jade' | 'gold' | 'rose' | 'mist'
}

const idleModes: Array<{ id: IdleMode; icon: string; label: string; description: string }> = [
  { id: 'cultivate', icon: '🧘', label: '闭关修炼', description: '稳定累积修为，适合准备突破。' },
  { id: 'adventure', icon: '🗺️', label: '外出游历', description: '世界更活跃，也更容易触发奇遇。' },
  { id: 'sectDuty', icon: '🏛️', label: '宗门差遣', description: '倾向于触发宗门事件与贡献收益。' },
  { id: 'gatherHerbs', icon: '🌿', label: '采集灵草', description: '偏向获得药草和基础材料。' },
  { id: 'trainSkill', icon: '📜', label: '演练功法', description: '强化功法熟练度与战斗准备。' }
]

const idleModeLabel = computed(() => worldStore.getIdleModeLabel(worldStore.idleMode))

const heroSubtitle = computed(() => {
  if (playerStore.captivity.isCaptured) {
    const captor = playerStore.captivity.captorSectId
      ? getSectById(playerStore.captivity.captorSectId)?.name ?? '敌对势力'
      : '敌对势力'
    return `你当前被${captor}俘获，世界仍在运转，优先处理脱困与宗门后续。`
  }
  if (sectStore.activeWar && sectStore.currentSect) {
    return `${sectStore.currentSect.name}卷入战事，挂机时世界风险、区域控制权和 NPC 命运会继续变化。`
  }
  return '这里是整个修仙循环的总入口：修炼、世界变化、宗门态势与重要人物在同一处汇流。'
})

const heroSummary = computed(() => {
  if (playerStore.isIdling) {
    return `当前正在${idleModeLabel.value}，挂机期间每秒获得 ${playerStore.cultivationPerSecond} 修为，并持续触发世界演化。`
  }
  return `当前可手动打坐冲境，也可调整挂机模式，让主角以不同方式参与这个不断变化的世界。`
})

const staminaRecoverLabel = computed(() => {
  if (playerStore.stamina >= playerStore.maxStamina) return '体力已满'
  return `${Math.floor(playerStore.nextRecoverCountdown / 60)}:${String(playerStore.nextRecoverCountdown % 60).padStart(2, '0')} 后恢复+1`
})

const breakthroughHint = computed(() => {
  if (playerStore.isMaxRealm && playerStore.realmLevel === 9) return '已抵达当前版本的最高境界。'
  if (playerStore.canBreakthrough && playerStore.nextRealm) return `${playerStore.breakthroughPreview.message}，当前成功率 ${formatPercent(playerStore.breakthroughPreview.successRate)}。`
  if (playerStore.realmLevel === 9 && playerStore.nextRealm) return `${playerStore.realm}九层圆满后，可手动突破至${playerStore.nextRealm}。`
  return `挂机中每秒自动获得 ${playerStore.cultivationPerSecond} 修为。`
})

const sectConditionLabel = computed(() => {
  const labels = {
    stable: '山门安稳',
    rebuilding: '宗门重建',
    collapsed: '宗门沦陷'
  }
  return labels[sectStore.worldCondition.status]
})

const sectStatusText = computed(() => {
  if (!sectStore.currentSect) return '未加入宗门时，故事推进与世界变化将决定你的归属。'
  if (playerStore.captivity.isCaptured) return '你已被俘，部分宗门循环应转向营救、赎回或脱逃。'
  if (sectStore.activeWar) return '当前存在宗门战争，地图风险与控制权会跟随战局波动。'
  return '宗门状态会受到外交、战争、重建和玩家挂机行为影响。'
})

const sectPanelTone = computed<'jade' | 'gold' | 'mist'>(() => {
  if (playerStore.captivity.isCaptured || sectStore.worldCondition.status === 'collapsed') return 'mist'
  if (sectStore.activeWar || sectStore.worldCondition.status === 'rebuilding') return 'gold'
  return 'jade'
})

const sectStatusChipTone = computed<'jade' | 'gold' | 'rose'>(() => {
  if (playerStore.captivity.isCaptured || sectStore.worldCondition.status === 'collapsed') return 'rose'
  if (sectStore.activeWar || sectStore.worldCondition.status === 'rebuilding') return 'gold'
  return 'jade'
})

const spotlightNpcs = computed(() => {
  return worldStore.importantNpcStates
    .slice(0, 2)
    .map(item => {
      const relationship = worldStore.getRelationshipState(item.state.id)
      const profile = worldStore.getNpcDisplayProfile(item.state.id)
      const destinyTone =
        profile?.destinyRank === 'legendary'
          ? 'legendary'
          : profile?.destinyRank === 'anomalous'
            ? 'anomalous'
            : profile?.destinyRank === 'fated'
              ? 'fated'
              : 'ordinary'
      return {
        id: item.state.id,
        name: item.definition?.name ?? item.state.id,
        title: profile?.title ?? '无名修士',
        background: profile?.background ?? '命数未明。',
        identityHook: profile?.identityHook ?? '命数未明。',
        originLabel: profile?.originLabel ?? '来历不详',
        bloodline: profile?.bloodline ?? '未显血脉',
        bloodlineGradeLabel: profile?.bloodlineGradeLabel ?? '无显血脉',
        constitution: profile?.constitution ?? '凡体',
        constitutionNote: profile?.constitutionNote ?? '体质平常。',
        factionStanceLabel: profile?.factionStanceLabel ?? '中立',
        growthFlawSummary: profile?.growthFlawSummary ?? '无明显缺陷',
        destinyTags: profile?.destinyTags ?? [],
        destinyRankLabel: profile?.destinyRankLabel ?? '平命',
        destinyTone,
        root: profile?.root ?? '未知灵根',
        talent: profile?.talent ?? '凡才',
        potentialScore: profile?.potentialScore ?? 0,
        temperament: profile?.temperament ?? '气机内敛',
        notorietyLabel: profile?.notorietyLabel ?? '尚在潜藏',
        realm: item.state.realm,
        realmLevel: item.state.realmLevel,
        goalLabel: getNpcGoalLabel(item.state.currentGoal),
        bondLabel: getBondLabel(relationship.bond),
        bondTone: getBondTone(relationship.bond),
        hpLabel: getNpcHealthLabel(item.state.hpState)
      }
    })
})

const recentLogs = computed(() => worldStore.visibleLogViews.slice(0, 3))
const recentJourneys = computed(() => worldStore.recentPlayerJourneys.slice(0, 3))
const npcStories = computed(() => worldStore.importantNpcStoryViews.slice(0, 3))
const areaAnomalies = computed(() => worldStore.activeAreaAnomalies.slice(0, 3))

const latestPulseText = computed(() => {
  if (playerStore.captivity.isCaptured) return '主角被俘，当前主循环应优先处理脱困、赎回或宗门营救。'
  if (recentLogs.value[0]) return recentLogs.value[0].entry.title
  if (npcStories.value[0]) return npcStories.value[0].entry.title
  if (areaAnomalies.value[0]) return areaAnomalies.value[0].title
  return '暂无紧急异动，适合安排挂机、历险或推进主线。'
})

const p0FocusItems = computed(() => [
  {
    label: '体力',
    value: `${playerStore.stamina}/${playerStore.maxStamina}`,
    tone: playerStore.stamina > 0 ? 'gold' : 'mist'
  },
  {
    label: '要事',
    value: worldBriefings.value.length,
    tone: worldBriefings.value.length > 0 ? 'rose' : 'jade'
  },
  {
    label: '人物',
    value: worldStore.unlockedNpcDefinitions.length,
    tone: 'jade'
  },
  {
    label: '宗门',
    value: sectStore.currentSect ? sectStore.positionName : '未入门',
    tone: sectStore.currentSect ? 'gold' : 'mist'
  }
])

const latestActionFeedbackItems = computed<ActionFeedbackItem[]>(() => {
  const items: ActionFeedbackItem[] = []

  if (lastFortuneFeedback.value) {
    items.push({
      id: `fortune_${lastFortuneFeedback.value.result.type}_${worldStore.clock.totalTicks}`,
      label: '机缘',
      title: lastFortuneFeedback.value.result.title,
      text: lastFortuneFeedback.value.rewardText,
      tone: 'gold'
    })
  }

  if (lastAdvanceSummary.value) {
    items.push(...lastAdvanceSummary.value.items.slice(0, 2).map(item => ({
      id: `advance_${item.id}`,
      label: item.label,
      title: item.title,
      text: item.text,
      tone: item.tone
    })))
  }

  return items.slice(0, 3)
})

const latestActionFeedbackTitle = computed(() => {
  if (lastFortuneFeedback.value) return '机缘已结算'
  if (lastAdvanceSummary.value) {
    return lastAdvanceSummary.value.totalEvents > 0
      ? `${lastAdvanceSummary.value.totalEvents} 条世界结果`
      : '世界平稳流转'
  }
  return '等待行动'
})

const hotspotArea = computed(() => {
  const ranked = Object.values(mapStore.areaStates)
    .filter(state => {
      const area = mapStore.getAreaInfo(state.areaId)
      return Boolean(area && mapStore.realmUnlockStatus[area.realm] && isMapAreaUnlocked({
        area,
        playerRealm: playerStore.realm,
        playerRealmLevel: playerStore.realmLevel
      }))
    })
    .filter(state => state.riskLevel === 'danger' || state.riskLevel === 'chaos' || state.contested)
    .sort((a, b) => {
      const scoreA = a.pressure + (a.riskLevel === 'chaos' ? 30 : a.riskLevel === 'danger' ? 20 : 8) + (a.contested ? 12 : 0)
      const scoreB = b.pressure + (b.riskLevel === 'chaos' ? 30 : b.riskLevel === 'danger' ? 20 : 8) + (b.contested ? 12 : 0)
      return scoreB - scoreA
    })[0]

  if (!ranked) return null

  const area = mapStore.getAreaInfo(ranked.areaId)
  const anomaly = areaAnomalies.value.find(item => item.areaId === ranked.areaId)
  if (!area) return null

  return {
    id: area.id,
    name: area.name,
    riskLevel: ranked.riskLevel,
    contested: ranked.contested,
    anomalyTitle: anomaly?.title ?? null
  }
})

const briefingSpotlightNpc = computed(() => spotlightNpcs.value[0]
  ? {
      name: spotlightNpcs.value[0].name,
      goalLabel: spotlightNpcs.value[0].goalLabel,
      bondLabel: spotlightNpcs.value[0].bondLabel,
      hpLabel: spotlightNpcs.value[0].hpLabel,
      destinyRankLabel: spotlightNpcs.value[0].destinyRankLabel,
      notorietyLabel: spotlightNpcs.value[0].notorietyLabel,
      bondTone: spotlightNpcs.value[0].bondTone
    }
  : null
)

const latestNpcStoryBriefing = computed(() => npcStories.value[0]
  ? {
      title: npcStories.value[0].entry.title,
      severity: npcStories.value[0].entry.severity,
      timeLabel: npcStories.value[0].entry.timeLabel
    }
  : null
)

const latestLogBriefing = computed(() => recentLogs.value[0]
  ? {
      title: recentLogs.value[0].entry.title,
      severity: recentLogs.value[0].entry.severity,
      timeLabel: recentLogs.value[0].entry.timeLabel
    }
  : null
)

const { worldBriefings } = useWorldBriefings({
  hotspotArea,
  spotlightNpc: briefingSpotlightNpc,
  latestNpcStory: latestNpcStoryBriefing,
  latestLog: latestLogBriefing
})

const loopReadiness = computed(() => resolveMainLoopReadiness({
  player: {
    isCaptured: playerStore.captivity.isCaptured,
    isIdling: playerStore.isIdling,
    stamina: playerStore.stamina,
    maxStamina: playerStore.maxStamina,
    canBreakthrough: playerStore.canBreakthrough
  },
  world: {
    unlockedNpcCount: worldStore.unlockedNpcDefinitions.length,
    worldBriefingCount: worldBriefings.value.length,
    hasRecentJourney: recentJourneys.value.length > 0
  },
  story: {
    currentNodeId: storyStore.currentNodeId,
    completedCount: storyStore.completedCount,
    isInitialized: storyStore.isInitialized
  },
  map: {
    conqueredCount: mapStore.conqueredCountInCurrentRealm,
    totalAreaCount: mapStore.currentRealmAreas.length,
    hasHotspot: Boolean(hotspotArea.value)
  },
  sect: {
    joined: Boolean(sectStore.currentSect),
    joinableCount: sectStore.joinCandidates.filter(candidate => candidate.canJoin).length,
    activeWar: Boolean(sectStore.activeWar),
    completedTaskCount: sectStore.completedTasks.length,
    availableTaskCount: sectStore.dailyTasks.length + sectStore.weeklyTasks.length,
    canClaimSalary: sectStore.canClaimSalary
  }
}))

const p0LoopClosure = computed(() => resolveP0LoopClosure({
  readiness: loopReadiness.value.byId,
  evidence: {
    playerJourneyTags: worldStore.playerJourneys.map(journey => journey.tags),
    storyCurrentNodeId: storyStore.currentNodeId,
    storyCompletedCount: storyStore.completedCount,
    unlockedNpcCount: worldStore.unlockedNpcDefinitions.length,
    npcStoryCount: worldStore.npcStories.length,
    worldBriefingCount: worldBriefings.value.length,
    mapTotalAreaCount: mapStore.currentRealmAreas.length,
    mapConqueredCount: mapStore.conqueredCountInCurrentRealm,
    mapHistoryCount: mapStore.historyEvents.length,
    areaAnomalyCount: worldStore.areaAnomalies.length,
    sectJoined: Boolean(sectStore.currentSect),
    sectJoinableCount: sectStore.joinCandidates.filter(candidate => candidate.canJoin).length
  }
}))

const p0NextAction = computed(() => resolveP0LoopNextAction({
  readinessItems: loopReadiness.value.items,
  closureItems: p0LoopClosure.value.items
}))

const p0Audit = computed(() => resolveP0LoopAudit({
  closure: p0LoopClosure.value,
  nextAction: p0NextAction.value
}))

const p0Acceptance = computed(() => resolveP0LoopAcceptance(p0Audit.value))

const mainLoopTasks = computed<MainLoopTask[]>(() => {
  const firstNpc = spotlightNpcs.value[0]
  const latestStoryLabel = storyStore.currentNode?.name ?? storyStore.currentNodeId ?? '未入卷'
  const sectTitle = sectStore.currentSect ? sectStore.currentSect.name : '选择宗门'
  const joinableSectCount = sectStore.joinCandidates.filter(candidate => candidate.canJoin).length
  const sectMeta = sectStore.currentSect
    ? `${sectStore.positionName} · 贡献 ${sectStore.contribution}`
    : `${joinableSectCount} 个可选势力`
  const hotspotTitle = hotspotArea.value
    ? hotspotArea.value.name
    : mapStore.currentRealm

  return [
    {
      id: 'idle',
      icon: playerStore.isIdling ? '停' : '修',
      label: '挂机',
      title: playerStore.isIdling ? `正在${idleModeLabel.value}` : '安排主角行动',
      summary: loopReadiness.value.byId.idle.actionHint,
      meta: loopReadiness.value.byId.idle.label,
      tone: loopReadiness.value.byId.idle.tone,
      readiness: loopReadiness.value.byId.idle,
      closure: p0LoopClosure.value.byId.idle,
      active: playerStore.isIdling,
      action: 'toggleIdle'
    },
    {
      id: 'adventure',
      icon: '战',
      label: '历险',
      title: '前往界域历练',
      summary: loopReadiness.value.byId.adventure.actionHint,
      meta: `体力 ${playerStore.stamina}/${playerStore.maxStamina}`,
      tone: loopReadiness.value.byId.adventure.tone,
      readiness: loopReadiness.value.byId.adventure,
      closure: p0LoopClosure.value.byId.adventure,
      route: resolveP0LoopRouteTarget({ id: 'adventure' })
    },
    {
      id: 'story',
      icon: '卷',
      label: '故事',
      title: storyStore.currentNodeId ? '继续命簿卷宗' : '开启主线卷宗',
      summary: loopReadiness.value.byId.story.actionHint,
      meta: `${latestStoryLabel}`,
      tone: loopReadiness.value.byId.story.tone,
      readiness: loopReadiness.value.byId.story,
      closure: p0LoopClosure.value.byId.story,
      route: resolveP0LoopRouteTarget({ id: 'story' })
    },
    {
      id: 'npc',
      icon: '人',
      label: '人物',
      title: firstNpc ? firstNpc.name : '结识同行者',
      summary: loopReadiness.value.byId.npc.actionHint,
      meta: firstNpc
        ? `${firstNpc.destinyRankLabel} · ${firstNpc.bondLabel}`
        : `${worldStore.unlockedNpcDefinitions.length} 人`,
      tone: loopReadiness.value.byId.npc.tone,
      readiness: loopReadiness.value.byId.npc,
      closure: p0LoopClosure.value.byId.npc,
      route: resolveP0LoopRouteTarget({ id: 'npc' })
    },
    {
      id: 'map',
      icon: '图',
      label: '地图',
      title: hotspotTitle,
      summary: loopReadiness.value.byId.map.actionHint,
      meta: `${mapStore.conqueredCountInCurrentRealm}/${mapStore.currentRealmAreas.length}`,
      tone: loopReadiness.value.byId.map.tone,
      readiness: loopReadiness.value.byId.map,
      closure: p0LoopClosure.value.byId.map,
      route: resolveP0LoopRouteTarget({ id: 'map', hotspotAreaId: hotspotArea.value?.id })
    },
    {
      id: 'sect',
      icon: '门',
      label: '宗门',
      title: sectTitle,
      summary: loopReadiness.value.byId.sect.actionHint,
      meta: sectMeta,
      tone: loopReadiness.value.byId.sect.tone,
      readiness: loopReadiness.value.byId.sect,
      closure: p0LoopClosure.value.byId.sect,
      route: resolveP0LoopRouteTarget({ id: 'sect' })
    }
  ]
})

onMounted(() => {
  worldStore.simulateOffline()

  if (playerStore.idleStartTime) {
    offlineGains.value = playerStore.calculateOfflineGains()
  }

  if (playerStore.isIdling) {
    startIdleLoop()
  }
})

onUnmounted(() => {
  stopIdleLoop()
})

function claimOfflineGains() {
  if (offlineGains.value <= 0) return
  playerStore.addCultivation(offlineGains.value)
  success(`获得 ${offlineGains.value} 修为`)
  offlineGains.value = 0
}

function toggleIdle() {
  if (playerStore.captivity.isCaptured) {
    warning('被俘期间无法继续常规挂机')
    return
  }
  if (playerStore.isIdling) {
    stopIdle()
  } else {
    startIdle()
  }
}

function startIdle() {
  playerStore.startIdle()
  startIdleLoop()
  info(`开始${idleModeLabel.value}`)
}

function stopIdle() {
  playerStore.stopIdle()
  stopIdleLoop()
  info('停止挂机修炼')
}

function startIdleLoop() {
  if (idleTimer) return
  idleTimer = window.setInterval(() => {
    if (playerStore.realmLevel === 9 && !playerStore.isMaxRealm && playerStore.cultivation >= playerStore.maxCultivation) {
      return
    }
    playerStore.addCultivation(playerStore.cultivationPerSecond)
  }, IDLE_INTERVAL)
}

function stopIdleLoop() {
  if (idleTimer) {
    clearInterval(idleTimer)
    idleTimer = null
  }
}

function handleMeditate() {
  if (playerStore.isIdling) {
    warning('挂机中无法手动打坐')
    return
  }

  if (!playerStore.isMaxRealm && playerStore.cultivation >= playerStore.maxCultivation) {
    warning(playerStore.realmLevel === 9 ? '修为已满，请突破境界' : '修为已满')
    return
  }

  sfxMeditate()
  const gain = playerStore.cultivationPerSecond * 15
  playerStore.addCultivation(gain)
  success(`修为 +${gain}`)
}

function handleBreakthrough() {
  if (!playerStore.breakthroughPreview.canAttempt) {
    warning(playerStore.breakthroughPreview.message)
    return
  }

  const oldRealm = playerStore.realm
  const nextRealm = playerStore.breakthroughPreview.nextRealm
  if (!nextRealm) {
    warning('已达最高境界')
    return
  }

  const aidName = playerStore.breakthroughPreview.selectedAid?.name
  sfxBreakthrough()
  const result = playerStore.attemptBreakthrough([worldStore.clock.totalTicks, Date.now()])
  if (result.success) {
    success(`${aidName ? `${aidName}护持，` : ''}突破成功！进入${nextRealm}一层`)
    showItemAcquire({
      name: `${nextRealm}境界`,
      quantity: 1,
      quality: 'excellent',
      icon: '境界',
      description: `从${oldRealm}突破至${nextRealm}`
    })
  } else {
    warning(`${aidName ? `${aidName}已消耗，` : ''}破境失败，修为保留 ${result.failureCultivation}/${playerStore.maxCultivation}`)
  }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function handleIdleModeChange(mode: IdleMode) {
  worldStore.setIdleMode(mode)
  if (playerStore.isIdling) {
    info(`挂机安排已切换为${worldStore.getIdleModeLabel(mode)}`)
  }
}

function handleTaskAction(task: MainLoopTask) {
  if (task.action === 'toggleIdle') {
    toggleIdle()
    return
  }

  if (task.route) {
    void router.push(task.route)
  }
}

function handleNextP0Action() {
  const task = mainLoopTasks.value.find(item => item.id === p0NextAction.value.primary.id)
  if (task) {
    handleTaskAction(task)
  }
}

function handleAcceptancePrimaryGap() {
  const gapId = p0Acceptance.value.primaryGap?.id
  if (!gapId) return
  handleAcceptanceGap(gapId)
}

function handleAcceptanceGap(gapId: string) {
  const task = mainLoopTasks.value.find(item => item.id === gapId)
  if (task) {
    handleTaskAction(task)
  }
}

function handleAdvanceWorld() {
  const summary = advanceOneTick()
  if (summary.totalEvents > 0) {
    success(`世界推进到${summary.timeLabel}，新增 ${summary.totalEvents} 条结果`)
  } else {
    info(`世界推进到${summary.timeLabel}`)
  }
}

function handlePlayerFortune() {
  if (playerStore.captivity.isCaptured) {
    warning('被俘期间无法处理常规机缘')
    return
  }
  const result = handleFortune()
  if (!result.success) {
    warning(result.reason)
    return
  }
  success(`${result.title}：${lastFortuneFeedback.value?.rewardText ?? '机缘已记录'}`)
}

</script>

<style scoped>
.cultivation-view {
  display: grid;
  gap: 12px;
  padding-bottom: 12px;
}

.main-loop-surface {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  box-shadow: 0 14px 34px rgba(88, 123, 116, 0.1);
}

.main-loop-surface::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 14% 6%, rgba(255, 226, 145, 0.26), transparent 28%),
    radial-gradient(circle at 88% 8%, rgba(113, 216, 190, 0.22), transparent 30%),
    linear-gradient(130deg, transparent 0 36%, rgba(255, 242, 196, 0.24) 36% 37%, transparent 37% 100%);
  pointer-events: none;
}

.main-loop-surface :deep(.surface-header) {
  position: relative;
  z-index: 1;
  margin-bottom: 8px;
}

.main-loop-surface :deep(.surface-copy strong) {
  font-size: 16px;
}

.main-loop-surface :deep(.surface-copy p) {
  max-width: 780px;
  font-size: 11px;
}

.home-hero-layout,
.overview-grid,
.world-grid {
  display: grid;
  gap: 14px;
}

.home-hero-layout {
  position: relative;
  z-index: 1;
  grid-template-columns: minmax(0, 0.78fr) minmax(340px, 1.22fr);
  align-items: stretch;
  gap: 10px;
}

.hero-main-card,
.hero-copy,
.action-feedback-panel,
.world-pulse-card,
.quick-command-panel,
.loop-hub-panel,
.progress-stack,
.sect-panel,
.log-list,
.journey-list {
  display: grid;
  gap: 12px;
}

.hero-main-card {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  min-height: 132px;
  padding: 12px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.72), rgba(241, 249, 244, 0.5)),
    radial-gradient(circle at 12% 20%, rgba(255, 223, 147, 0.24), transparent 44%);
}

.protagonist-token {
  width: 76px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  border-radius: 16px;
  border: 1px solid rgba(188, 141, 58, 0.26);
  background:
    linear-gradient(145deg, #fff2bd, #90dfc2),
    repeating-linear-gradient(45deg, rgba(142, 98, 39, 0.08) 0 1px, transparent 1px 8px);
  color: #8e6227;
  box-shadow: 0 16px 28px rgba(88, 146, 132, 0.18);
}

.protagonist-token span {
  color: #8e6227;
  font-size: 28px;
  line-height: 1;
}

.protagonist-token small {
  color: rgba(115, 88, 42, 0.72);
  font-size: 9px;
  line-height: 1.2;
}

.hero-copy {
  min-width: 0;
  gap: 4px;
}

.hero-realm {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(104, 150, 145, 0.18);
  color: rgba(73, 97, 95, 0.82);
  font-size: 11px;
}

.hero-copy strong {
  color: #315257;
  font-size: 18px;
}

.hero-actions {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.hero-copy p,
.pulse-head p,
.empty-state p,
.sect-event-banner p,
.log-card p {
  margin: 0;
  color: rgba(53, 81, 83, 0.8);
  font-size: 13px;
  line-height: 1.65;
}

.world-pulse-card {
  align-content: space-between;
  min-height: 132px;
  padding: 12px;
  border: 1px solid rgba(188, 141, 58, 0.2);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 251, 236, 0.62), rgba(239, 252, 246, 0.44)),
    radial-gradient(circle at top right, rgba(255, 213, 112, 0.22), transparent 62%);
}

.quick-command-panel {
  padding: 12px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.62), rgba(241, 249, 244, 0.48)),
    radial-gradient(circle at top right, rgba(141, 223, 197, 0.16), transparent 62%);
}

.action-feedback-panel {
  min-height: 120px;
  align-content: start;
  padding: 12px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.7), rgba(241, 249, 244, 0.5)),
    radial-gradient(circle at 12% 0%, rgba(255, 224, 150, 0.18), transparent 58%);
}

.loop-hub-panel {
  grid-column: 1 / -1;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(188, 141, 58, 0.18);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 252, 240, 0.58), rgba(241, 250, 245, 0.44)),
    radial-gradient(circle at 18% 0%, rgba(255, 224, 150, 0.2), transparent 48%);
}

.quick-command-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.quick-command-head span,
.feedback-head span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.quick-command-head strong,
.feedback-head strong {
  color: #315257;
  font-size: 15px;
}

.feedback-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.feedback-list {
  display: grid;
  gap: 8px;
}

.feedback-item,
.feedback-empty {
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid rgba(103, 149, 144, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.64);
}

.feedback-item {
  display: grid;
  gap: 4px;
}

.feedback-item span,
.feedback-empty span {
  color: rgba(73, 97, 95, 0.66);
  font-size: 10px;
}

.feedback-item strong {
  overflow: hidden;
  color: #315257;
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback-item p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: rgba(53, 81, 83, 0.74);
  font-size: 10px;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.feedback-item.tone-gold {
  border-color: rgba(194, 146, 66, 0.22);
  background: rgba(255, 250, 236, 0.78);
}

.feedback-item.tone-rose {
  border-color: rgba(198, 121, 137, 0.2);
  background: rgba(255, 244, 247, 0.78);
}

.feedback-item.tone-mist {
  border-color: rgba(119, 158, 178, 0.18);
  background: rgba(247, 253, 255, 0.78);
}

.quick-command-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.quick-command {
  min-width: 0;
  min-height: 50px;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.68);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
}

.quick-command.primary {
  border-color: rgba(188, 141, 58, 0.28);
  background: rgba(255, 249, 232, 0.84);
}

.quick-command:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.quick-command span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 240, 177, 0.82);
  color: #8b6226;
  font-size: 12px;
  font-weight: 800;
}

.quick-command strong {
  min-width: 0;
  overflow: hidden;
  color: #315257;
  font-size: 11px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pulse-head {
  display: grid;
  gap: 6px;
}

.pulse-head span {
  color: rgba(115, 88, 42, 0.72);
  font-size: 11px;
}

.pulse-head strong {
  color: #8b6226;
  font-size: 16px;
}

.p0-rail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.p0-chip {
  min-width: 0;
  display: grid;
  gap: 4px;
  padding: 10px;
  border: 1px solid rgba(103, 149, 144, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
}

.p0-chip span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 10px;
}

.p0-chip strong {
  overflow: hidden;
  color: #315257;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.p0-chip.tone-gold {
  border-color: rgba(188, 141, 58, 0.22);
  background: rgba(255, 250, 236, 0.78);
}

.p0-chip.tone-rose {
  border-color: rgba(198, 121, 137, 0.2);
  background: rgba(255, 244, 247, 0.78);
}

.p0-chip.tone-mist {
  border-color: rgba(119, 158, 178, 0.18);
  background: rgba(247, 253, 255, 0.76);
}

.offline-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(188, 141, 58, 0.24);
  background: rgba(255, 250, 236, 0.82);
}

.offline-copy {
  display: grid;
  gap: 2px;
}

.offline-copy span {
  color: rgba(115, 88, 42, 0.72);
  font-size: 11px;
}

.offline-copy strong,
.sect-heading strong,
.empty-state strong,
.npc-copy strong,
.log-head strong {
  color: #8b6226;
  font-size: 14px;
}

.log-head strong small {
  margin-left: 6px;
  color: rgba(139, 98, 38, 0.7);
  font-size: 11px;
}

.loop-task-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.loop-readiness-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 0.52fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.76), rgba(241, 249, 244, 0.62)),
    radial-gradient(circle at top right, rgba(255, 213, 112, 0.16), transparent 62%);
}

.p0-acceptance-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(103, 149, 144, 0.14);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.72), rgba(241, 249, 244, 0.58)),
    radial-gradient(circle at top right, rgba(141, 223, 197, 0.14), transparent 60%);
}

.p0-acceptance-panel.state-accepted {
  border-color: rgba(88, 164, 143, 0.22);
  background: rgba(239, 252, 247, 0.84);
}

.p0-acceptance-panel.state-blocked {
  border-color: rgba(199, 121, 138, 0.22);
  background: rgba(255, 244, 247, 0.84);
}

.acceptance-copy {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.acceptance-copy span {
  color: #8b6226;
  font-size: 10px;
  font-weight: 800;
}

.acceptance-copy strong {
  overflow: hidden;
  color: #315257;
  font-size: 12px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.acceptance-copy small {
  display: -webkit-box;
  overflow: hidden;
  color: rgba(53, 81, 83, 0.68);
  font-size: 10px;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.acceptance-gap-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.acceptance-side {
  min-width: min(360px, 42vw);
  display: grid;
  justify-items: end;
  gap: 8px;
}

.acceptance-gap-list span,
.acceptance-gap-list button {
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(103, 149, 144, 0.14);
  background: rgba(255, 255, 255, 0.66);
  color: rgba(73, 97, 95, 0.74);
  font-family: var(--font-game);
  font-size: 10px;
}

.acceptance-gap-list button {
  cursor: pointer;
  touch-action: manipulation;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.acceptance-gap-list button:hover {
  transform: translateY(-1px);
  border-color: rgba(194, 146, 66, 0.26);
  background: rgba(255, 251, 236, 0.9);
}

.acceptance-gap-list button:focus-visible {
  outline: 2px solid rgba(194, 146, 66, 0.48);
  outline-offset: 2px;
}

.acceptance-gap-list .gap-blocked {
  color: #9b4353;
  border-color: rgba(199, 121, 138, 0.2);
  background: rgba(255, 242, 245, 0.86);
}

.acceptance-gap-list .gap-actionable,
.acceptance-gap-list .gap-more {
  color: #8b6226;
  border-color: rgba(194, 146, 66, 0.2);
  background: rgba(255, 248, 230, 0.84);
}

.acceptance-gap-list .gap-closed {
  color: #2f746b;
  border-color: rgba(88, 164, 143, 0.22);
  background: rgba(238, 253, 247, 0.9);
}

.acceptance-action {
  min-width: 132px;
  min-height: 42px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 2px;
  padding: 6px 12px;
  border: 1px solid rgba(194, 146, 66, 0.24);
  border-radius: 11px;
  background:
    linear-gradient(180deg, rgba(255, 251, 235, 0.92), rgba(242, 253, 247, 0.76)),
    radial-gradient(circle at top right, rgba(255, 220, 132, 0.18), transparent 60%);
  color: #315257;
  font-family: var(--font-game);
  cursor: pointer;
  touch-action: manipulation;
}

.acceptance-action span {
  max-width: 100%;
  overflow: hidden;
  color: #8b6226;
  font-size: 9px;
  font-weight: 800;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.acceptance-action strong {
  color: #315257;
  font-size: 11px;
  line-height: 1.3;
}

.loop-readiness-strip > div:first-child {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.loop-readiness-strip span {
  color: rgba(75, 100, 98, 0.66);
  font-size: 10px;
}

.loop-readiness-strip strong {
  color: #315257;
  font-size: 13px;
  line-height: 1.45;
}

.loop-readiness-strip small {
  color: rgba(73, 97, 95, 0.68);
  font-size: 10px;
  line-height: 1.45;
}

.p0-progress-meter {
  width: min(260px, 100%);
  height: 7px;
  display: block;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(103, 149, 144, 0.12);
  box-shadow: inset 0 0 0 1px rgba(103, 149, 144, 0.1);
}

.p0-progress-meter b {
  height: 100%;
  display: block;
  border-radius: inherit;
  background: linear-gradient(90deg, #7ed7bc, #ffd66f);
  transition: width 0.2s ease;
}

.next-loop-action {
  min-width: 0;
  min-height: 58px;
  display: grid;
  gap: 3px;
  align-content: center;
  padding: 8px 10px;
  border: 1px solid rgba(194, 146, 66, 0.2);
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgba(255, 251, 235, 0.88), rgba(242, 253, 247, 0.72)),
    radial-gradient(circle at top right, rgba(255, 220, 132, 0.16), transparent 60%);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
}

.next-loop-action span {
  overflow: hidden;
  color: #8b6226;
  font-size: 10px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.next-loop-action strong {
  overflow: hidden;
  color: #315257;
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.next-loop-action small {
  display: -webkit-box;
  overflow: hidden;
  color: rgba(53, 81, 83, 0.68);
  font-size: 9px;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.next-loop-action.kind-unblock {
  border-color: rgba(199, 121, 138, 0.24);
  background: rgba(255, 244, 247, 0.86);
}

.next-loop-action.kind-expand {
  border-color: rgba(88, 164, 143, 0.2);
  background: rgba(239, 252, 247, 0.84);
}

.readiness-counts {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.readiness-counts span {
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(103, 149, 144, 0.14);
  background: rgba(255, 255, 255, 0.66);
  font-size: 10px;
}

.readiness-counts .state-ready {
  color: #497c66;
}

.readiness-counts .state-warning {
  color: #8b6226;
}

.readiness-counts .state-blocked {
  color: #8a4959;
}

.readiness-counts .state-closed {
  color: #2f746b;
  border-color: rgba(88, 164, 143, 0.2);
  background: rgba(239, 252, 247, 0.86);
}

.loop-task-card {
  min-width: 0;
  min-height: 118px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 7px;
  align-items: stretch;
  padding: 10px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  border-radius: 11px;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.9), rgba(241, 249, 244, 0.78)),
    radial-gradient(circle at top right, rgba(158, 225, 207, 0.16), transparent 58%);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.loop-task-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(87, 126, 121, 0.14);
}

.loop-task-card.active,
.loop-task-card.tone-gold {
  border-color: rgba(194, 146, 66, 0.26);
  background:
    linear-gradient(180deg, rgba(255, 252, 238, 0.96), rgba(247, 240, 215, 0.84)),
    radial-gradient(circle at top right, rgba(255, 212, 112, 0.2), transparent 58%);
}

.loop-task-card.tone-rose {
  border-color: rgba(198, 121, 137, 0.22);
  background:
    linear-gradient(180deg, rgba(255, 248, 249, 0.96), rgba(248, 235, 236, 0.84)),
    radial-gradient(circle at top right, rgba(244, 181, 188, 0.18), transparent 58%);
}

.loop-task-card.tone-mist {
  border-color: rgba(119, 158, 178, 0.2);
  background:
    linear-gradient(180deg, rgba(247, 253, 255, 0.94), rgba(239, 248, 246, 0.82)),
    radial-gradient(circle at top right, rgba(174, 218, 240, 0.16), transparent 58%);
}

.loop-task-card.state-blocked {
  border-color: rgba(198, 121, 137, 0.3);
}

.loop-task-card.state-warning {
  border-color: rgba(194, 146, 66, 0.3);
}

.task-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.76);
  color: #8b6226;
  font-size: 16px;
  font-weight: 800;
}

.task-copy {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.task-copy small {
  color: rgba(75, 100, 98, 0.66);
  font-size: 10px;
}

.task-copy strong {
  overflow: hidden;
  color: #315257;
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-copy em {
  display: -webkit-box;
  overflow: hidden;
  color: rgba(53, 81, 83, 0.76);
  font-size: 10px;
  font-style: normal;
  line-height: 1.55;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.task-copy i {
  display: none;
}

.task-copy b {
  width: fit-content;
  max-width: 100%;
  min-height: 20px;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  padding: 0 7px;
  border-radius: 999px;
  border: 1px solid rgba(103, 149, 144, 0.14);
  background: rgba(255, 255, 255, 0.62);
  color: rgba(73, 97, 95, 0.7);
  font-size: 9px;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-copy .closure-closed {
  color: #2f746b;
  border-color: rgba(88, 164, 143, 0.22);
  background: rgba(238, 253, 247, 0.86);
}

.task-copy .closure-actionable {
  color: #8b6226;
  border-color: rgba(194, 146, 66, 0.22);
  background: rgba(255, 248, 230, 0.86);
}

.task-copy .closure-blocked {
  color: #9b4353;
  border-color: rgba(199, 121, 138, 0.22);
  background: rgba(255, 242, 245, 0.86);
}

.task-meta {
  width: fit-content;
  max-width: 100%;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(75, 100, 98, 0.76);
  font-size: 10px;
}

.secondary-home-grid {
  opacity: 0.96;
}

.secondary-home-grid :deep(.game-surface) {
  border-radius: 12px;
}

.secondary-home-grid :deep(.surface-copy strong) {
  font-size: 15px;
}

.overview-grid,
.world-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.breakthrough-forecast {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 10px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid rgba(188, 141, 58, 0.2);
  border-radius: 14px;
  background: rgba(255, 250, 234, 0.72);
}

.breakthrough-forecast span,
.breakthrough-forecast em {
  min-width: 0;
  color: rgba(81, 93, 86, 0.78);
  font-size: 12px;
  font-style: normal;
}

.breakthrough-forecast strong {
  color: #8b6226;
  font-size: 16px;
}

.breakthrough-forecast em {
  grid-column: 1 / -1;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.idle-mode-list,
.npc-list {
  display: grid;
  gap: 10px;
}

.idle-mode-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  background: rgba(255, 255, 255, 0.64);
  color: #315257;
  text-align: left;
}

.idle-mode-card.active {
  border-color: rgba(188, 141, 58, 0.28);
  background: rgba(255, 249, 233, 0.82);
}

.mode-icon,
.sect-icon,
.npc-badge {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  font-size: 20px;
  flex: 0 0 auto;
}

.mode-copy,
.sect-heading > div,
.npc-copy {
  display: grid;
  gap: 3px;
}

.mode-copy small,
.sect-heading small,
.npc-copy small,
.log-head span,
.state-pill {
  color: rgba(75, 100, 98, 0.72);
  font-size: 11px;
}

.sect-heading,
.npc-leading,
.npc-meta,
.log-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sect-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sect-event-banner {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 246, 228, 0.72);
  border: 1px solid rgba(197, 150, 70, 0.18);
}

.npc-card,
.log-card,
.anomaly-card,
.empty-state {
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  background: rgba(255, 255, 255, 0.64);
}

.npc-meta {
  justify-content: flex-end;
  flex-wrap: wrap;
}

.npc-story {
  margin: 0;
  color: rgba(53, 81, 83, 0.78);
  font-size: 12px;
  line-height: 1.6;
}

.npc-note {
  margin: 0;
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
  line-height: 1.55;
}

.npc-profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.profile-chip {
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(252, 255, 251, 0.82);
  border: 1px solid rgba(120, 146, 149, 0.12);
}

.profile-chip span {
  color: rgba(73, 97, 95, 0.62);
  font-size: 10px;
}

.profile-chip strong {
  color: #355b5c;
  font-size: 11px;
  line-height: 1.4;
  word-break: break-word;
}

.npc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(120, 146, 149, 0.18);
  color: rgba(73, 97, 95, 0.82);
  font-size: 10px;
}

.bond-pill,
.state-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(120, 146, 149, 0.18);
  background: rgba(246, 252, 251, 0.78);
}

.bond-warm {
  color: #8b6226;
  background: rgba(255, 248, 233, 0.86);
  border-color: rgba(194, 146, 66, 0.22);
}

.bond-hostile {
  color: #9b4353;
  background: rgba(255, 242, 245, 0.84);
  border-color: rgba(199, 121, 138, 0.22);
}

.bond-neutral {
  color: #4b6f6f;
}

.log-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.log-card {
  display: grid;
  gap: 8px;
}

.log-context {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.log-context span {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(120, 146, 149, 0.16);
  background: rgba(252, 255, 251, 0.76);
  color: rgba(73, 97, 95, 0.76);
  font-size: 10px;
  line-height: 1.2;
}

.log-context .context-area {
  color: #4c7a78;
  background: rgba(239, 250, 247, 0.82);
}

.log-context .context-sect {
  color: #8b6226;
  background: rgba(255, 249, 233, 0.86);
}

.log-context .context-actor {
  color: #8f4c63;
  background: rgba(255, 244, 248, 0.82);
}

.anomaly-card {
  display: grid;
  gap: 8px;
}

.log-card.severity-major {
  border-color: rgba(195, 141, 54, 0.24);
  background: rgba(255, 250, 239, 0.8);
}

.log-card.severity-legendary {
  border-color: rgba(198, 121, 137, 0.24);
  background: rgba(255, 245, 247, 0.82);
}

.anomaly-card.severity-major {
  border-color: rgba(195, 141, 54, 0.24);
  background: rgba(255, 250, 239, 0.8);
}

.anomaly-card.severity-legendary {
  border-color: rgba(198, 121, 137, 0.24);
  background: rgba(255, 245, 247, 0.82);
}

.log-reward {
  color: rgba(73, 97, 95, 0.66);
  font-size: 11px;
}

.destiny-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(120, 146, 149, 0.18);
  background: rgba(255, 255, 255, 0.84);
  font-size: 11px;
  color: #4b6f6f;
}

.destiny-legendary {
  color: #9b4353;
  background: rgba(255, 242, 245, 0.84);
  border-color: rgba(199, 121, 138, 0.22);
}

.destiny-anomalous {
  color: #8b6226;
  background: rgba(255, 248, 233, 0.86);
  border-color: rgba(194, 146, 66, 0.22);
}

.destiny-fated {
  color: #2b6a71;
  background: rgba(238, 252, 251, 0.9);
  border-color: rgba(105, 177, 188, 0.24);
}

.tag-emphasis {
  color: #8b6226;
  border-color: rgba(194, 146, 66, 0.22);
  background: rgba(255, 248, 233, 0.86);
}

@media (max-width: 980px) {
  .home-hero-layout,
  .overview-grid,
  .world-grid,
  .log-list {
    grid-template-columns: 1fr;
  }

  .loop-task-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-main-card {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .protagonist-token {
    width: 64px;
  }
}

@media (max-width: 720px) {
  .loop-task-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .loop-task-card {
    min-height: 108px;
  }

  .loop-readiness-strip {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .p0-acceptance-panel {
    grid-template-columns: 1fr;
  }

  .acceptance-gap-list {
    justify-content: flex-start;
  }

  .acceptance-side {
    min-width: 0;
    justify-items: start;
  }

  .readiness-counts {
    justify-content: flex-start;
  }

  .offline-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions,
  .p0-rail {
    grid-template-columns: 1fr;
  }

  .quick-command-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .task-copy b {
    display: none;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .npc-profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
