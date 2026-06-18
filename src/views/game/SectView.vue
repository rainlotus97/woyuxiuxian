<template>
  <div class="sect-view">
    <SectRecruitPanel
      v-if="!sectStore.joinedSectId"
      :sects="sectStore.unlockedSectList"
      @join="handleJoinSect"
    />

    <template v-else-if="sectStore.currentSect">
      <SectOverviewPanel
        :sect="sectStore.currentSect"
        :tone="sectTone"
        :world-status-label="worldStatusLabel"
        :subtitle="overviewSubtitle"
        :position-name="sectStore.positionName"
        :next-position-name="sectStore.nextPosition?.name ?? null"
        :can-promote="sectStore.canPromote"
        :authority-label="authorityLabel"
        :directive-label="activeDirectiveLabel"
        :contribution="sectStore.contribution"
        :reputation="sectStore.reputation"
        :salary="sectStore.currentPosition?.dailySalary || 0"
        :sect-hp="sectStore.sectHp"
        :sect-max-hp="sectStore.sectMaxHp"
        :captivity-hint="captivityHint"
        :active-event="visibleSectEvent"
        :next-requirement-progress="promotionProgress"
        @promote="handlePromote"
        @event-choice="handleEventChoice"
      />

      <div class="tab-shell">
        <GameSurface tone="jade" padding="md" compact>
          <div class="tab-row">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <span>{{ tab.icon }}</span>
              <span>{{ tab.name }}</span>
            </button>
          </div>
        </GameSurface>
      </div>

      <SectCyclePanel
        :total-task-count="sectStore.dailyTasks.length + sectStore.weeklyTasks.length"
        :completed-task-count="completedTaskCount"
        :reward-ready-count="sectStore.completedTasks.length"
        :can-claim-salary="sectStore.canClaimSalary"
        :task-summary="taskSummary"
        :garden-slot-count="sectStore.gardenSlotCount"
        :active-garden-slots="sectStore.activeGardenSlots"
        :ready-garden-slots="sectStore.readyGardenSlots"
        :garden-summary="gardenSummary"
        :garden-hint="gardenHint"
        :alchemy-level="sectStore.getFacilityLevel('alchemy_furnace')"
        :garden-level="sectStore.getFacilityLevel('medicine_garden')"
        :available-recipe-count="sectStore.availableAlchemyRecipes.length"
        :facility-summary="facilitySummary"
        :active-war="sectStore.activeWar"
        :last-war-report="sectStore.lastWarReport"
        @claim-all-tasks="handleClaimAllRewards"
        @claim-salary="handleClaimSalary"
        @harvest-ready="handleHarvestReady"
        @open-facility="handleUseFacility"
        @go-tab="handleTabSelect"
        @ack-war-report="handleAcknowledgeWarReport"
      />

      <SectDirectivePanel
        :authority-label="authorityLabel"
        :authority-description="authorityDescription"
        :active-directive="sectStore.activeDirective"
        :active-directive-label="activeDirectiveLabel"
        :directives="directiveOptions"
        @change-directive="handleDirectiveChange"
      />

      <SectRecoveryPanel
        v-if="sectStore.recoveryState.active || capturedNpcRescueTarget"
        :state="sectStore.recoveryState"
        :captured-npc="capturedNpcRescueTarget"
        :npc-rescue-cost="NPC_RESCUE_COST"
        @act="handleRecoveryAction"
        @rescue-npc="handleRescueNpc"
      />

      <SectTasksPanel
        v-if="activeTab === 'tasks'"
        :daily-tasks="sectStore.dailyTasks"
        :weekly-tasks="sectStore.weeklyTasks"
        :salary="sectStore.currentPosition?.dailySalary || 0"
        :contribution-gain="Math.floor((sectStore.currentPosition?.dailySalary || 0) / 2)"
        :can-claim-salary="sectStore.canClaimSalary"
        @claim-task="handleClaimReward"
        @claim-salary="handleClaimSalary"
      />

      <SectFacilitiesPanel
        v-else-if="activeTab === 'facilities'"
        :facilities="SECT_FACILITIES"
        :position-level="sectStore.positionLevel"
        :get-level="sectStore.getFacilityLevel"
        :can-use-facility="canUseFacility"
        @use-facility="handleUseFacility"
        @upgrade-facility="handleUpgradeFacility"
      />

      <SectDiplomacyPanel
        v-else
        :tone="sectTone"
        :subtitle="diplomacySubtitle"
        :active-war="sectStore.activeWar"
        :relations="diplomacyRows"
        :active-war-label="activeWarLabel"
        @declare-war="handleDeclareWar"
      />

      <GameSurface tone="mist" padding="md" compact>
        <div class="leave-row">
          <div class="leave-copy">
            <strong>脱离宗门</strong>
            <small>退出后将失去当前宗门的贡献、声望与部分世界关联。</small>
          </div>
          <GameActionButton icon="🚪" tone="rose" @click="showLeaveDialog = true">
            退出宗门
          </GameActionButton>
        </div>
      </GameSurface>
    </template>

    <FacilityModal
      :visible="showFacilityModal"
      :facility-id="selectedFacilityId"
      @close="closeFacilityModal"
    />

    <GameDialog
      :visible="showLeaveDialog"
      title="退出宗门"
      eyebrow="归属变更"
      @close="showLeaveDialog = false"
    >
      <p class="dialog-copy">退出后将清空当前宗门贡献、声望与进行中的宗门任务。此操作用于世界分歧，但不适合频繁切换。</p>

      <template #footer>
        <GameActionButton icon="取消" tone="stone" @click="showLeaveDialog = false">取消</GameActionButton>
        <GameActionButton icon="确认" tone="rose" @click="handleLeaveSect">确认退出</GameActionButton>
      </template>
    </GameDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import FacilityModal from '@/components/sect/FacilityModal.vue'
import SectCyclePanel from '@/components/sect/SectCyclePanel.vue'
import SectDirectivePanel from '@/components/sect/SectDirectivePanel.vue'
import SectDiplomacyPanel from '@/components/sect/SectDiplomacyPanel.vue'
import SectFacilitiesPanel from '@/components/sect/SectFacilitiesPanel.vue'
import SectOverviewPanel from '@/components/sect/SectOverviewPanel.vue'
import SectRecoveryPanel from '@/components/sect/SectRecoveryPanel.vue'
import SectRecruitPanel from '@/components/sect/SectRecruitPanel.vue'
import SectTasksPanel from '@/components/sect/SectTasksPanel.vue'
import type { SectEvent } from '@/types/sect'
import { ALL_SECTS, SECT_FACILITIES, getSectById } from '@/types/sect'
import { useToast } from '@/composables/useToast'
import {
  type SectDirectiveId,
  getAuthorityLevelLabel,
  getDirectiveDescription,
  getDirectiveLabel,
  canAuthorityAccessFacility
} from '@/sect/runtime/sectPositionResolver'
import type { SectRecoveryActionId } from '@/sect/runtime/sectRecoveryResolver'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { getSectRelationDescription, getSectSurfaceTone, getSectWorldStatusLabel, type SectDiplomacyRow } from '@/components/sect/sectUi'

const sectStore = useSectStore()
const playerStore = usePlayerStore()
const worldStore = useWorldStore()
const { success, warning, info } = useToast()

const NPC_RESCUE_COST = {
  contribution: 38,
  gold: 180
}

const activeTab = ref<'tasks' | 'facilities' | 'diplomacy'>('tasks')
const showFacilityModal = ref(false)
const selectedFacilityId = ref('')
const showLeaveDialog = ref(false)

const tabs = [
  { id: 'tasks' as const, name: '任务', icon: '📋' },
  { id: 'facilities' as const, name: '设施', icon: '🏛️' },
  { id: 'diplomacy' as const, name: '外交', icon: '⚔️' }
]

const sectTone = computed(() => getSectSurfaceTone({
  isCaptured: playerStore.captivity.isCaptured,
  worldCondition: sectStore.worldCondition,
  hasActiveWar: Boolean(sectStore.activeWar)
}))

const worldStatusLabel = computed(() => getSectWorldStatusLabel(sectStore.worldCondition.status))

const overviewSubtitle = computed(() => {
  if (playerStore.captivity.isCaptured) {
    const captor = playerStore.captivity.captorSectId
      ? getSectById(playerStore.captivity.captorSectId)?.name ?? '敌对势力'
      : '敌对势力'
    return `你正被${captor}控制，宗门循环应优先处理赎回、营救或脱逃。`
  }
  if (sectStore.worldCondition.status === 'collapsed') {
    return '山门已陷入沦陷状态，需要后续补上重建与恢复链路。'
  }
  if (sectStore.activeWar) {
    return '当前战事会持续影响区域控制权、宗门关系与世界日志。'
  }
  return '宗门提供任务、俸禄、设施与外交关系，是主循环中的长期归属系统。'
})

const captivityHint = computed(() => {
  if (!playerStore.captivity.isCaptured) return '宗门完整度影响战后后果与后续事件。'
  return '主角被俘期间，宗门后果与世界事件仍会继续推进。'
})

const capturedNpcRescueTarget = computed(() => {
  const target = worldStore.getCapturedNpcRescueTarget(sectStore.joinedSectId)
  if (!target) return null
  return {
    id: target.id,
    name: target.name,
    title: target.title,
    captorName: target.captorName,
    locationName: target.locationName,
    severity: target.severity === 'legendary' ? 'legendary' as const : 'major' as const
  }
})

const promotionProgress = computed(() => {
  const next = sectStore.nextPosition
  if (!next) {
    return {
      current: sectStore.contribution,
      max: Math.max(1, sectStore.contribution),
      hint: '已抵达当前职位上限'
    }
  }

  return {
    current: Math.min(sectStore.contribution, next.requiredContribution),
    max: next.requiredContribution,
    hint: `距离晋升 ${next.name} 还需 ${Math.max(0, next.requiredContribution - sectStore.contribution)} 贡献`
  }
})

const visibleSectEvent = computed<SectEvent | null>(() => {
  return sectStore.activeEvent ?? null
})

const completedTaskCount = computed(() => {
  return [...sectStore.dailyTasks, ...sectStore.weeklyTasks].filter(task => task.completed).length
})

const diplomacyRows = computed<SectDiplomacyRow[]>(() => {
  if (!sectStore.currentSect) return []

  return ALL_SECTS
    .filter(sect => sect.id !== sectStore.currentSect?.id)
    .map(sect => {
      const relation = sectStore.relations[sect.id] ?? 'neutral'
      return {
        sectId: sect.id,
        name: sect.name,
        icon: sect.icon,
        realm: sect.realm,
        relation,
        description: getSectRelationDescription(relation),
        canDeclareWar: sectStore.authorityState.canDeclareWar && !sectStore.activeWar && relation !== 'at_war'
      }
    })
})

const diplomacySubtitle = computed(() => {
  if (sectStore.activeWar) return '战局已经开启，后续应继续补充更细粒度的宣战、停战与战后限制。'
  return '外交关系会被世界 tick 推动变化，也可由玩家主动宣战。'
})

const taskSummary = computed(() => {
  if (sectStore.completedTasks.length > 0) {
    return `已有 ${sectStore.completedTasks.length} 项宗务可立即结算，适合在推进地图或剧情前先回收贡献与灵石。`
  }
  return '当前暂无待领奖励，继续通过讨伐、采集、炼制与探索积累贡献。'
})

const gardenSummary = computed(() => {
  if (sectStore.readyGardenSlots > 0) {
    return `${sectStore.readyGardenSlots} 株已成熟`
  }
  if (sectStore.activeGardenSlots > 0) {
    return '药园生长中'
  }
  return '药园待播种'
})

const gardenHint = computed(() => {
  if (sectStore.readyGardenSlots > 0) {
    return '成熟作物已经可以直接回收，用来支撑炼丹与宗门采集任务。'
  }
  if (sectStore.activeGardenSlots > 0) {
    return '当前已有作物在生长，成熟后可直接回流材料链。'
  }
  return '药园当前空置，建议尽快播种以建立灵草到丹药的稳定循环。'
})

const facilitySummary = computed(() => {
  return '炼丹炉决定丹药层级，药园决定灵草供给。两者等级越高，宗门经济链越完整。'
})

const authorityLabel = computed(() => {
  return getAuthorityLevelLabel(sectStore.authorityState.authorityLevel)
})

const authorityDescription = computed(() => {
  if (!sectStore.authorityState.canIssueDirectives) {
    return '当前仍处弟子层级，主要负责执行宗门差遣，尚不能调整山门方略。'
  }
  if (sectStore.authorityState.canLeadSect) {
    return '你已进入掌权层级，可调整宗门方略并主导外交、战备与资源分配。'
  }
  return '你已拥有调度部分山门资源的权限，不同方略会影响任务、药园、炼丹和战局回报。'
})

const activeDirectiveLabel = computed(() => {
  return getDirectiveLabel(sectStore.activeDirective)
})

const directiveOptions = computed(() => {
  return sectStore.authorityState.availableDirectives.map(id => ({
    id,
    label: getDirectiveLabel(id),
    description: getDirectiveDescription(id)
  }))
})

const activeWarLabel = computed(() => {
  const war = sectStore.activeWar
  if (!war) return '暂无战事'
  const defender = getSectById(war.defenderSectId)
  return `我方与${defender?.name ?? war.defenderSectId}的战局`
})

function handleJoinSect(sectId: string) {
  const sect = sectStore.unlockedSectList.find(item => item.id === sectId)
  if (sectStore.joinSect(sectId)) {
    success(`成功加入${sect?.name ?? '宗门'}！`)
  } else {
    warning('无法加入该宗门')
  }
}

function handlePromote() {
  if (sectStore.promotePosition()) {
    success(`晋升成功，现为${sectStore.positionName}`)
  }
}

function handleClaimReward(taskId: string) {
  if (sectStore.claimTaskReward(taskId)) {
    success('任务奖励已领取')
  }
}

function handleClaimAllRewards() {
  const result = sectStore.claimAllCompletedTaskRewards()
  if (result.claimedCount <= 0) {
    warning('暂无可领取的宗门奖励')
    return
  }

  success(`已领取 ${result.claimedCount} 项宗门奖励`)
  info(`获得 ${result.totalContribution} 贡献、${result.totalGold} 灵石${result.totalExp > 0 ? `、${result.totalExp} 修为` : ''}`)
}

function handleDirectiveChange(directive: SectDirectiveId) {
  if (sectStore.setActiveDirective(directive)) {
    success(`宗门方略已切换为${getDirectiveLabel(directive)}`)
  } else {
    warning('当前职位尚无法执行该方略')
  }
}

function handleUpgradeFacility(facilityId: string) {
  if (sectStore.upgradeFacility(facilityId)) {
    success('设施升级成功')
  } else {
    warning('升级失败，资源不足或职位不够')
  }
}

function handleClaimSalary() {
  const result = sectStore.claimDailySalary()
  if (result) {
    success(`领取俸禄：${result.gold} 灵石，${result.contribution} 贡献`)
  } else {
    warning('今日俸禄已领取')
  }
}

function handleHarvestReady() {
  const result = sectStore.harvestAllReadyCrops()
  if (result.harvestedCount <= 0) {
    warning('当前没有可收取的成熟作物')
    return
  }

  success(`已收取 ${result.harvestedCount} 份成熟作物`)
  info(result.items.slice(0, 3).join('，'))
}

function handleRecoveryAction(actionId: SectRecoveryActionId) {
  const result = sectStore.applyRecoveryAction(actionId)
  if (!result.success) {
    warning(result.message)
    return
  }

  success(result.title ?? '恢复行动已执行')
  info(result.message)
}

function handleRescueNpc(npcId: string) {
  const target = capturedNpcRescueTarget.value
  if (!target || target.id !== npcId) {
    warning('当前没有可营救的宗门人物')
    return
  }
  if (sectStore.contribution < NPC_RESCUE_COST.contribution) {
    warning(`贡献不足，需要 ${NPC_RESCUE_COST.contribution}`)
    return
  }
  if (playerStore.gold < NPC_RESCUE_COST.gold) {
    warning(`灵石不足，需要 ${NPC_RESCUE_COST.gold}`)
    return
  }

  if (!worldStore.rescueCapturedNpc(npcId, sectStore.joinedSectId)) {
    warning('营救失败，目标状态已变化')
    return
  }

  sectStore.addContribution(-NPC_RESCUE_COST.contribution)
  playerStore.addGold(-NPC_RESCUE_COST.gold)

  success(`${target.name}已被救回`)
  info('对方仍需疗伤，但已脱离囚局')
}

function handleLeaveSect() {
  if (sectStore.leaveSect()) {
    showLeaveDialog.value = false
    info('已退出宗门')
  }
}

function handleDeclareWar(sectId: string) {
  const target = getSectById(sectId)
  if (sectStore.declareWar(sectId)) {
    success(`已向${target?.name ?? '目标宗门'}宣战`)
  } else {
    warning('当前职位不足或已有战事，无法宣战')
  }
}

function handleEventChoice(choiceId: string) {
  if (sectStore.handleEventChoice(choiceId)) {
    success('已处理宗门事件')
  } else {
    warning('事件处理失败')
  }
}

function handleTabSelect(tabId: 'tasks' | 'facilities' | 'diplomacy') {
  activeTab.value = tabId
}

function canUseFacility(facilityId: string) {
  const facility = SECT_FACILITIES.find(item => item.id === facilityId)
  if (!facility) return false
  if (facilityId !== 'alchemy_furnace' && facilityId !== 'medicine_garden') return false
  return canAuthorityAccessFacility(sectStore.authorityState.canUseFacilityTier, facility.unlockPosition)
}

function handleUseFacility(facilityId: string) {
  selectedFacilityId.value = facilityId
  showFacilityModal.value = true
}

function handleAcknowledgeWarReport() {
  sectStore.lastWarReport = null
  info('战报已收起')
}

function closeFacilityModal() {
  showFacilityModal.value = false
  selectedFacilityId.value = ''
}
</script>

<style scoped>
.sect-view {
  display: grid;
  gap: 14px;
  padding-bottom: 10px;
}

.tab-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  background: rgba(255, 255, 255, 0.62);
  color: #5b7272;
  font-family: var(--font-game);
  font-size: 12px;
}

.tab-btn.active {
  border-color: rgba(188, 141, 58, 0.28);
  background: rgba(255, 249, 233, 0.82);
  color: #8b6226;
}

.leave-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.leave-copy {
  display: grid;
  gap: 4px;
}

.leave-copy strong {
  color: #315257;
  font-size: 14px;
}

.leave-copy small,
.dialog-copy {
  color: rgba(73, 97, 95, 0.76);
  font-size: 12px;
  line-height: 1.65;
}

.dialog-copy {
  margin: 0;
}

@media (max-width: 720px) {
  .tab-row {
    grid-template-columns: 1fr;
  }

  .leave-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
