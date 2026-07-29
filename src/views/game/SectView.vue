<template>
  <div class="sect-view">
    <div v-if="!sectStore.joinedSectId" class="sect-entry-drawer">
      <SectRecruitPanel
        :candidates="sectStore.joinCandidates"
        @join="handleJoinSect"
      />
    </div>

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
        :salary="sectStore.stipendPreview.gold"
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
              <GameIcon :icon="tab.icon" :size="18" />
              <span>{{ tab.name }}</span>
            </button>
          </div>
        </GameSurface>
      </div>

      <div class="sect-content-drawer">
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
          :last-duty-title="lastDuty?.title ?? null"
          :last-duty-text="lastDuty?.text ?? null"
          @resolve-duty="handleSectDuty"
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
          :salary="sectStore.stipendPreview.gold"
          :contribution-gain="sectStore.stipendPreview.contribution"
          :can-claim-salary="sectStore.canClaimSalary"
          @claim-task="handleClaimReward"
          @claim-salary="handleClaimSalary"
        />

        <SectFacilitiesPanel
          data-ui-state="sect-facilities-view"
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
            <GameActionButton icon="LogOut" tone="rose" @click="showLeaveDialog = true">
              退出宗门
            </GameActionButton>
          </div>
        </GameSurface>
      </div>
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
        <GameActionButton icon="close" tone="stone" @click="showLeaveDialog = false">取消</GameActionButton>
        <GameActionButton icon="spark" tone="rose" @click="handleLeaveSect">确认退出</GameActionButton>
      </template>
    </GameDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
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
import { SECT_FACILITIES } from '@/types/sect'
import { useToast } from '@/composables/useToast'
import { useSectCrisis } from '@/composables/useSectCrisis'
import { useSectDuty } from '@/composables/useSectDuty'
import { useSectMembership } from '@/composables/useSectMembership'
import { useSectProgression } from '@/composables/useSectProgression'
import { useSectRewards } from '@/composables/useSectRewards'
import { NPC_RESCUE_COST, useSectViewState } from '@/composables/useSectViewState'
import {
  type SectDirectiveId,
  getDirectiveLabel,
  canAuthorityAccessFacility
} from '@/sect/runtime/sectPositionResolver'
import type { SectRecoveryActionId } from '@/sect/runtime/sectRecoveryResolver'
import { useSectStore } from '@/stores/sectStore'

const sectStore = useSectStore()
const { success, warning, info } = useToast()
const {
  activeDirectiveLabel,
  activeWarLabel,
  authorityDescription,
  authorityLabel,
  captivityHint,
  capturedNpcRescueTarget,
  completedTaskCount,
  diplomacyRows,
  diplomacySubtitle,
  directiveOptions,
  facilitySummary,
  gardenHint,
  gardenSummary,
  overviewSubtitle,
  promotionProgress,
  sectTone,
  taskSummary,
  visibleSectEvent,
  worldStatusLabel
} = useSectViewState()
const { lastDuty, handleSectDuty: resolveSectDuty } = useSectDuty()
const { joinSect: joinSectWithJourney, leaveSect: leaveSectWithJourney } = useSectMembership()
const {
  promotePosition: promotePositionWithJourney,
  upgradeFacility: upgradeFacilityWithJourney,
  harvestAllReadyCrops: harvestAllReadyCropsWithJourney
} = useSectProgression()
const {
  claimDailySalary: claimDailySalaryWithJourney,
  claimTaskReward: claimTaskRewardWithJourney,
  claimAllCompletedTaskRewards: claimAllCompletedTaskRewardsWithJourney
} = useSectRewards()
const {
  applyRecoveryAction: applyRecoveryActionWithJourney,
  rescueNpc: rescueNpcWithJourney,
  declareWar: declareWarWithJourney,
  handleEventChoice: handleEventChoiceWithJourney
} = useSectCrisis()

const activeTab = ref<'tasks' | 'facilities' | 'diplomacy'>('tasks')
const showFacilityModal = ref(false)
const selectedFacilityId = ref('')
const showLeaveDialog = ref(false)

const tabs = [
  { id: 'tasks' as const, name: '任务', icon: 'Clipboard' },
  { id: 'facilities' as const, name: '设施', icon: 'Castle' },
  { id: 'diplomacy' as const, name: '外交', icon: 'sword' }
]

function handleJoinSect(sectId: string) {
  const result = joinSectWithJourney(sectId)
  if (result.success) {
    success(`成功加入${result.sectName ?? '宗门'}！`)
  } else {
    warning('无法加入该宗门')
  }
}

function handlePromote() {
  const result = promotePositionWithJourney()
  if (result.success) {
    success(`晋升成功，现为${result.positionName}`)
  }
}

function handleClaimReward(taskId: string) {
  const result = claimTaskRewardWithJourney(taskId)
  if (!result.success) {
    warning('暂无可领取的宗门奖励')
    return
  }

  success(`${result.taskName ?? '宗门任务'}奖励已领取`)
  if (result.contribution > 0 || result.gold > 0 || result.exp > 0) {
    info(`获得 ${result.contribution} 贡献、${result.gold} 灵石${result.exp > 0 ? `、${result.exp} 修为` : ''}`)
  }
}

function handleClaimAllRewards() {
  const result = claimAllCompletedTaskRewardsWithJourney()
  if (result.claimedCount <= 0) {
    warning('暂无可领取的宗门奖励')
    return
  }

  success(`已领取 ${result.claimedCount} 项宗门奖励`)
  info(`获得 ${result.totalContribution} 贡献、${result.totalGold} 灵石${result.totalExp > 0 ? `、${result.totalExp} 修为` : ''}`)
}

function handleSectDuty() {
  const result = resolveSectDuty()
  if (!result.success) {
    warning(result.reason)
    return
  }

  success(result.title)
  info(`贡献 +${result.rewards.contribution}，修为 +${result.rewards.cultivation}，灵石 +${result.rewards.gold}`)
}

function handleDirectiveChange(directive: SectDirectiveId) {
  if (sectStore.setActiveDirective(directive)) {
    success(`宗门方略已切换为${getDirectiveLabel(directive)}`)
  } else {
    warning('当前职位尚无法执行该方略')
  }
}

function handleUpgradeFacility(facilityId: string) {
  const result = upgradeFacilityWithJourney(facilityId)
  if (result.success) {
    success(`${result.facilityName ?? '设施'}升级成功`)
  } else {
    warning('升级失败，资源不足或职位不够')
  }
}

function handleClaimSalary() {
  const result = claimDailySalaryWithJourney()
  if (result.success) {
    success(`领取俸禄：${result.gold} 灵石，${result.contribution} 贡献`)
  } else {
    warning('今日俸禄已领取')
  }
}

function handleHarvestReady() {
  const result = harvestAllReadyCropsWithJourney()
  if (result.harvestedCount <= 0) {
    warning('当前没有可收取的成熟作物')
    return
  }

  success(`已收取 ${result.harvestedCount} 份成熟作物`)
  info(result.items.slice(0, 3).join('，'))
}

function handleRecoveryAction(actionId: SectRecoveryActionId) {
  const result = applyRecoveryActionWithJourney(actionId)
  if (!result.success) {
    warning(result.message)
    return
  }

  success(result.title ?? '恢复行动已执行')
  info(result.message)
}

function handleRescueNpc(npcId: string) {
  const result = rescueNpcWithJourney(npcId, capturedNpcRescueTarget.value, NPC_RESCUE_COST)
  if (!result.success) {
    warning(result.reason)
    return
  }

  success(`${result.targetName ?? '同门'}已被救回`)
  info('对方仍需疗伤，但已脱离囚局')
}

function handleLeaveSect() {
  const result = leaveSectWithJourney()
  if (result.success) {
    showLeaveDialog.value = false
    info(`已退出${result.sectName ?? '宗门'}`)
  }
}

function handleDeclareWar(sectId: string) {
  const result = declareWarWithJourney(sectId)
  if (result.success) {
    success(`已向${result.targetName ?? '目标宗门'}宣战`)
  } else {
    warning('当前职位不足或已有战事，无法宣战')
  }
}

function handleEventChoice(choiceId: string) {
  if (handleEventChoiceWithJourney(choiceId).success) {
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
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  overflow: hidden;
  padding-bottom: 4px;
}

.sect-view > :not(.sect-entry-drawer):not(.sect-content-drawer) {
  flex: 0 0 auto;
  min-height: 0;
}

.sect-entry-drawer,
.sect-content-drawer {
  min-height: 90px;
  flex: 1 1 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.sect-entry-drawer {
  padding: 1px 2px 12px;
}

.sect-content-drawer {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 1px 2px 12px;
}

.tab-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  min-height: 44px;
  padding: 0 10px;
  border-radius: 16px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  background: rgba(255, 255, 255, 0.62);
  color: #5b7272;
  font-family: var(--font-game);
  font-size: 12px;
}

.tab-btn > span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  .leave-row {
    flex-direction: column;
    align-items: stretch;
  }

  .tab-row {
    gap: 6px;
  }

  .tab-btn {
    gap: 5px;
    padding-inline: 5px;
    font-size: 11px;
  }
}

@container game-stage (max-width: 720px) {
  .leave-row {
    flex-direction: column;
    align-items: stretch;
  }

  .tab-row {
    gap: 6px;
  }

  .tab-btn {
    gap: 5px;
    padding-inline: 5px;
    font-size: 11px;
  }
}
</style>
