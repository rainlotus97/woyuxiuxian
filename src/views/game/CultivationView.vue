<template>
  <div class="cultivation-view">
    <GameSurface
      tone="mist"
      padding="lg"
      eyebrow="主界总览"
      title="修途总览"
      :subtitle="heroSubtitle"
    >
      <div class="hero-grid">
        <div class="hero-main">
          <div class="hero-header">
            <div class="hero-avatar" :class="{ active: playerStore.isIdling }">{{ playerStore.icon }}</div>
            <div class="hero-copy">
              <span class="hero-realm">{{ playerStore.realmInfo.fullName }}</span>
              <strong>{{ playerStore.name }}</strong>
              <p>{{ heroSummary }}</p>
            </div>
          </div>

          <div v-if="offlineGains > 0" class="offline-banner">
            <div class="offline-copy">
              <span>离线积累</span>
              <strong>+{{ offlineGains }} 修为</strong>
            </div>
            <GameActionButton icon="🎁" tone="gold" @click="claimOfflineGains">领取</GameActionButton>
          </div>
        </div>

        <div class="hero-stats">
          <GameStatChip icon="☯️" label="行动模式" :value="idleModeLabel" tone="jade" />
          <GameStatChip icon="⚡" label="体力" :value="`${playerStore.stamina}/${playerStore.maxStamina}`" tone="gold" />
          <GameStatChip icon="📜" label="世界异闻" :value="recentLogs.length" tone="rose" />
        </div>
      </div>
    </GameSurface>

    <div class="overview-grid">
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

        <template #footer>
          <div class="action-grid">
            <GameActionButton
              :icon="playerStore.isIdling ? '⏸️' : '▶️'"
              :tone="playerStore.isIdling ? 'rose' : 'jade'"
              block
              @click="toggleIdle"
            >
              {{ playerStore.isIdling ? '停止挂机' : '开始挂机' }}
            </GameActionButton>
            <GameActionButton icon="🧘" tone="gold" block :disabled="playerStore.isIdling" @click="handleMeditate">
              打坐修炼
            </GameActionButton>
            <GameActionButton
              icon="⤴️"
              tone="jade"
              block
              :disabled="!playerStore.canBreakthrough"
              @click="handleBreakthrough"
            >
              突破境界
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
              <span class="bond-pill" :class="`bond-${npc.bondTone}`">{{ npc.bondLabel }}</span>
              <span class="state-pill">{{ npc.hpLabel }}</span>
            </div>
            <p class="npc-story">{{ npc.background }}</p>
            <div class="npc-tags">
              <span v-for="tag in npc.destinyTags.slice(0, 3)" :key="tag" class="tag-pill">{{ tag }}</span>
            </div>
          </div>
        </div>
      </GameSurface>
    </div>

    <div class="world-grid">
      <GameSurface tone="gold" padding="md" eyebrow="挂机见闻" title="主角行程" subtitle="挂机期间，主角会留下自己的经历、收获和奇遇。">
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
        <div v-for="log in recentLogs" :key="log.id" class="log-card" :class="`severity-${log.severity}`">
          <div class="log-head">
            <strong>{{ log.title }}</strong>
            <span>{{ log.timeLabel }}</span>
          </div>
          <p>{{ log.text }}</p>
        </div>
      </div>
    </GameSurface>

    <GameSurface tone="realm" padding="md" eyebrow="人物纪闻" title="命运回响" subtitle="重要人物的成长、负伤、破境与冲突会沉淀成可追踪的故事记录。">
      <div class="log-list">
        <div v-for="story in npcStories" :key="story.id" class="log-card" :class="`severity-${story.severity}`">
          <div class="log-head">
            <strong>{{ story.title }}</strong>
            <span>{{ story.timeLabel }}</span>
          </div>
          <p>{{ story.text }}</p>
        </div>
      </div>
    </GameSurface>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import { useToast } from '@/composables/useToast'
import { useAudio, sfxBreakthrough, sfxMeditate } from '@/composables/useAudio'
import { useModal } from '@/composables/useModal'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import type { IdleMode } from '@/types/world'
import { getSectById } from '@/types/sect'
import {
  formatJourneyRewards,
  getAnomalyIcon,
  getBondLabel,
  getBondTone,
  getNpcGoalLabel,
  getNpcHealthLabel
} from '@/components/world/worldUi'

const playerStore = usePlayerStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()
const { success, warning, info } = useToast()
const { startCultivationBgm } = useAudio()
const { showItemAcquire } = useModal()

const IDLE_INTERVAL = 1000
const offlineGains = ref(0)
let idleTimer: number | null = null

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
  if (playerStore.canBreakthrough && playerStore.nextRealm) return `条件已满，可突破至${playerStore.nextRealm}。`
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
    .slice(0, 4)
    .map(item => {
      const relationship = worldStore.getRelationshipState(item.state.id)
      const profile = worldStore.getNpcDisplayProfile(item.state.id)
      return {
        id: item.state.id,
        name: item.definition?.name ?? item.state.id,
        title: profile?.title ?? '无名修士',
        background: profile?.background ?? '命数未明。',
        destinyTags: profile?.destinyTags ?? [],
        realm: item.state.realm,
        realmLevel: item.state.realmLevel,
        goalLabel: getNpcGoalLabel(item.state.currentGoal),
        bondLabel: getBondLabel(relationship.bond),
        bondTone: getBondTone(relationship.bond),
        hpLabel: getNpcHealthLabel(item.state.hpState)
      }
    })
})

const recentLogs = computed(() => worldStore.visibleLogs.slice(0, 4))
const recentJourneys = computed(() => worldStore.recentPlayerJourneys.slice(0, 4))
const npcStories = computed(() => worldStore.importantNpcStories.slice(0, 4))
const areaAnomalies = computed(() => worldStore.activeAreaAnomalies.slice(0, 4))

onMounted(() => {
  startCultivationBgm()
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
  if (!playerStore.canBreakthrough) {
    warning('条件不足，无法突破')
    return
  }

  const oldRealm = playerStore.realm
  const nextRealm = playerStore.nextRealm
  if (!nextRealm) {
    warning('已达最高境界')
    return
  }

  sfxBreakthrough()
  if (playerStore.breakthrough()) {
    success(`突破成功！进入${nextRealm}一层`)
    showItemAcquire({
      name: `${nextRealm}境界`,
      quantity: 1,
      quality: 'excellent',
      icon: '境界',
      description: `从${oldRealm}突破至${nextRealm}`
    })
  }
}

function handleIdleModeChange(mode: IdleMode) {
  worldStore.setIdleMode(mode)
  if (playerStore.isIdling) {
    info(`挂机安排已切换为${worldStore.getIdleModeLabel(mode)}`)
  }
}

</script>

<style scoped>
.cultivation-view {
  display: grid;
  gap: 14px;
  padding-bottom: 10px;
}

.hero-grid,
.overview-grid,
.world-grid {
  display: grid;
  gap: 14px;
}

.hero-grid {
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  align-items: start;
}

.hero-main,
.hero-copy,
.hero-stats,
.progress-stack,
.sect-panel,
.log-list,
.journey-list {
  display: grid;
  gap: 12px;
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero-avatar {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255, 238, 180, 0.95), rgba(121, 212, 189, 0.88));
  color: #8c6226;
  font-size: 30px;
  box-shadow: 0 18px 34px rgba(101, 171, 156, 0.2);
}

.hero-avatar.active {
  box-shadow: 0 18px 34px rgba(93, 199, 157, 0.28);
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
  font-size: 20px;
}

.hero-copy p,
.empty-state p,
.sect-event-banner p,
.log-card p {
  margin: 0;
  color: rgba(53, 81, 83, 0.8);
  font-size: 13px;
  line-height: 1.65;
}

.hero-stats {
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.overview-grid,
.world-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

@media (max-width: 980px) {
  .hero-grid,
  .overview-grid,
  .world-grid,
  .log-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero-header,
  .offline-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
