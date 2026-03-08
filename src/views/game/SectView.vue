<template>
  <div class="sect-view">
    <!-- 未加入宗门时显示 -->
    <template v-if="!sectStore.joinedSectId">
      <div class="no-sect">
        <div class="no-sect-icon">🏛️</div>
        <div class="no-sect-title">尚未加入宗门</div>
        <p class="no-sect-desc">攻占地图区域后可解锁该区域的宗门</p>
      </div>

      <!-- 可加入的宗门列表 -->
      <div class="available-sects" v-if="sectStore.unlockedSectList.length > 0">
        <h3 class="section-title">可加入的宗门</h3>
        <div class="sects-list">
          <div
            v-for="sect in sectStore.unlockedSectList"
            :key="sect.id"
            class="sect-card"
            @click="handleJoinSect(sect)"
          >
            <div class="sect-icon">{{ sect.icon }}</div>
            <div class="sect-info">
              <div class="sect-name">{{ sect.name }}</div>
              <div class="sect-specialty">专长: {{ sect.specialty }}</div>
            </div>
            <div class="sect-realm">{{ sect.realm }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- 已加入宗门时显示 -->
    <template v-else>
      <!-- 宗门信息卡片 -->
      <div class="sect-info-card">
        <div class="sect-header">
          <div class="sect-icon-large">{{ sectStore.currentSect?.icon }}</div>
          <div class="sect-details">
            <div class="sect-name">{{ sectStore.currentSect?.name }}</div>
            <div class="sect-position">{{ sectStore.positionName }}</div>
          </div>
        </div>

        <!-- 宗门血量 -->
        <div class="sect-hp">
          <div class="hp-label">宗门血量</div>
          <div class="hp-bar">
            <div class="hp-fill" :style="{ width: sectStore.sectHpPercent + '%' }"></div>
          </div>
          <div class="hp-value">{{ sectStore.sectHp }}/{{ sectStore.sectMaxHp }}</div>
        </div>

        <!-- 贡献和声望 -->
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <span class="stat-label">贡献</span>
            <span class="stat-value">{{ sectStore.contribution }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🏅</span>
            <span class="stat-label">声望</span>
            <span class="stat-value">{{ sectStore.reputation }}</span>
          </div>
        </div>

        <!-- 晋升按钮 -->
        <button
          v-if="sectStore.canPromote"
          class="promote-btn"
          @click="handlePromote"
        >
          📈 晋升为 {{ sectStore.nextPosition?.name }}
        </button>
      </div>

      <!-- 功能入口 -->
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

      <!-- 任务面板 -->
      <div v-if="activeTab === 'tasks'" class="tasks-panel">
        <h4 class="panel-title">宗门任务</h4>

        <!-- 每日任务 -->
        <div class="task-section">
          <div class="section-header">
            <span>每日任务</span>
            <span class="task-count">{{ getCompletedCount('daily') }}/{{ sectStore.dailyTasks.length }}</span>
          </div>
          <div class="task-list">
            <div v-for="task in sectStore.dailyTasks" :key="task.id" class="task-item">
              <div class="task-info">
                <div class="task-name">{{ task.name }}</div>
                <div class="task-progress">
                  {{ task.progress }}/{{ task.requirements.count }}
                </div>
              </div>
              <button
                v-if="task.completed && !task.claimed"
                class="claim-btn"
                @click="handleClaimReward(task.id)"
              >
                领取
              </button>
              <span v-else-if="task.claimed" class="claimed">✓</span>
            </div>
          </div>
        </div>

        <!-- 每周任务 -->
        <div class="task-section">
          <div class="section-header">
            <span>每周任务</span>
            <span class="task-count">{{ getCompletedCount('weekly') }}/{{ sectStore.weeklyTasks.length }}</span>
          </div>
          <div class="task-list">
            <div v-for="task in sectStore.weeklyTasks" :key="task.id" class="task-item">
              <div class="task-info">
                <div class="task-name">{{ task.name }}</div>
                <div class="task-progress">
                  {{ task.progress }}/{{ task.requirements.count }}
                </div>
              </div>
              <button
                v-if="task.completed && !task.claimed"
                class="claim-btn"
                @click="handleClaimReward(task.id)"
              >
                领取
              </button>
              <span v-else-if="task.claimed" class="claimed">✓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 设施面板 -->
      <div v-if="activeTab === 'facilities'" class="facilities-panel">
        <h4 class="panel-title">宗门设施</h4>
        <div class="facility-list">
          <div
            v-for="facility in SECT_FACILITIES"
            :key="facility.id"
            class="facility-item"
            :class="{ locked: sectStore.positionLevel < facility.unlockPosition }"
          >
            <div class="facility-icon">{{ facility.icon }}</div>
            <div class="facility-info">
              <div class="facility-name">{{ facility.name }}</div>
              <div class="facility-level">Lv.{{ sectStore.getFacilityLevel(facility.id) }}/{{ facility.maxLevel }}</div>
              <div class="facility-desc">{{ facility.description }}</div>
            </div>
            <div class="facility-actions">
              <!-- 使用按钮（炼丹炉和药园） -->
              <button
                v-if="canUseFacility(facility.id)"
                class="use-btn"
                @click="handleUseFacility(facility.id)"
              >
                使用
              </button>
              <!-- 升级按钮 -->
              <button
                v-if="sectStore.positionLevel >= facility.unlockPosition && sectStore.getFacilityLevel(facility.id) < facility.maxLevel"
                class="upgrade-btn"
                @click="handleUpgradeFacility(facility.id)"
              >
                升级
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 俸禄面板 -->
      <div v-if="activeTab === 'salary'" class="salary-panel">
        <h4 class="panel-title">每日俸禄</h4>
        <div class="salary-info">
          <div class="salary-amount">
            <span class="salary-icon">💰</span>
            <span class="salary-value">{{ sectStore.currentPosition?.dailySalary || 0 }} 灵石</span>
          </div>
          <div class="salary-contribution">
            <span class="contribution-icon">⭐</span>
            <span class="contribution-value">+{{ Math.floor((sectStore.currentPosition?.dailySalary || 0) / 2) }} 贡献</span>
          </div>
        </div>
        <button
          class="claim-salary-btn"
          :class="{ canClaim: sectStore.canClaimSalary }"
          :disabled="!sectStore.canClaimSalary"
          @click="handleClaimSalary"
        >
          {{ sectStore.canClaimSalary ? '领取俸禄' : '今日已领取' }}
        </button>
      </div>

      <!-- 退出宗门 -->
      <button class="leave-btn" @click="handleLeaveSect">
        退出宗门
      </button>
    </template>

    <!-- 设施功能模态框 -->
    <FacilityModal
      :visible="showFacilityModal"
      :facility-id="selectedFacilityId"
      @close="closeFacilityModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSectStore } from '@/stores/sectStore'
import { SECT_FACILITIES, type SectDefinition } from '@/types/sect'
import { useToast } from '@/composables/useToast'
import FacilityModal from '@/components/sect/FacilityModal.vue'

const sectStore = useSectStore()
const { success, warning, info } = useToast()

const activeTab = ref<'tasks' | 'facilities' | 'salary'>('tasks')
const showFacilityModal = ref(false)
const selectedFacilityId = ref('')

const tabs = [
  { id: 'tasks' as const, name: '任务', icon: '📋' },
  { id: 'facilities' as const, name: '设施', icon: '🏛️' },
  { id: 'salary' as const, name: '俸禄', icon: '💰' }
]

// 获取已完成任务数量
function getCompletedCount(type: 'daily' | 'weekly'): number {
  const tasks = type === 'daily' ? sectStore.dailyTasks : sectStore.weeklyTasks
  return tasks.filter(t => t.claimed).length
}

// 加入宗门
function handleJoinSect(sect: SectDefinition) {
  if (sectStore.joinSect(sect.id)) {
    success(`成功加入${sect.name}!`)
  } else {
    warning('无法加入该宗门')
  }
}

// 晋升
function handlePromote() {
  if (sectStore.promotePosition()) {
    success(`晋升成功!`)
  }
}

// 领取任务奖励
function handleClaimReward(taskId: string) {
  if (sectStore.claimTaskReward(taskId)) {
    success('奖励已领取!')
  }
}

// 升级设施
function handleUpgradeFacility(facilityId: string) {
  if (sectStore.upgradeFacility(facilityId)) {
    success('设施升级成功!')
  } else {
    warning('资源不足')
  }
}

// 领取俸禄
function handleClaimSalary() {
  const result = sectStore.claimDailySalary()
  if (result) {
    success(`领取俸禄: ${result.gold}灵石, ${result.contribution}贡献`)
  } else {
    warning('今日已领取俸禄')
  }
}

// 退出宗门
function handleLeaveSect() {
  if (confirm('确定要退出宗门吗？退出后将失去所有贡献和声望。')) {
    sectStore.leaveSect()
    info('已退出宗门')
  }
}

// 判断设施是否可以使用（炼丹炉和药园）
function canUseFacility(facilityId: string): boolean {
  return facilityId === 'alchemy_furnace' || facilityId === 'medicine_garden'
}

// 打开设施使用界面
function handleUseFacility(facilityId: string) {
  selectedFacilityId.value = facilityId
  showFacilityModal.value = true
}

// 关闭设施模态框
function closeFacilityModal() {
  showFacilityModal.value = false
  selectedFacilityId.value = ''
}
</script>

<style scoped>
.sect-view {
  padding-bottom: 16px;
}

/* 未加入宗门 */
.no-sect {
  text-align: center;
  padding: 40px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
}

.no-sect-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.no-sect-title {
  font-size: 1.125rem;
  color: #e8e4d0;
  font-weight: 500;
  margin-bottom: 8px;
}

.no-sect-desc {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.section-title {
  font-size: 0.9375rem;
  color: var(--color-accent-warm);
  margin-bottom: 12px;
}

.sects-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sect-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sect-card:active {
  transform: scale(0.98);
}

.sect-icon {
  font-size: 1.75rem;
}

.sect-info {
  flex: 1;
}

.sect-name {
  font-size: 0.9375rem;
  color: #e8e4d0;
  font-weight: 500;
}

.sect-specialty {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.sect-realm {
  font-size: 0.75rem;
  color: #7eb8da;
  background: rgba(126, 184, 218, 0.15);
  padding: 4px 10px;
  border-radius: 8px;
}

/* 宗门信息卡片 */
.sect-info-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(200, 164, 92, 0.3);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
}

.sect-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.sect-icon-large {
  font-size: 2.5rem;
}

.sect-details {
  flex: 1;
}

.sect-name {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  font-weight: 500;
}

.sect-position {
  font-size: 0.8125rem;
  color: #7eb8da;
}

/* 宗门血量 */
.sect-hp {
  margin-bottom: 12px;
}

.hp-label {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-bottom: 4px;
}

.hp-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #f59e0b);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.hp-value {
  font-size: 0.6875rem;
  color: var(--color-muted);
  text-align: right;
}

/* 统计行 */
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
}

.stat-icon {
  font-size: 0.875rem;
}

.stat-label {
  color: var(--color-muted);
}

.stat-value {
  color: #e8e4d0;
  font-weight: 500;
}

/* 晋升按钮 */
.promote-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 10px;
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.promote-btn:active {
  transform: scale(0.98);
}

/* 功能标签 */
.function-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
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
  white-space: nowrap;
}

.tab-btn.active {
  background: rgba(126, 184, 218, 0.2);
  border-color: rgba(126, 184, 218, 0.4);
  color: #7eb8da;
}

/* 面板样式 */
.panel-title {
  font-size: 0.9375rem;
  color: #e8e4d0;
  margin-bottom: 12px;
}

/* 任务面板 */
.task-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--color-muted);
  margin-bottom: 8px;
}

.task-count {
  color: #7eb8da;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: 0.8125rem;
  color: #e8e4d0;
}

.task-progress {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.claim-btn {
  padding: 6px 12px;
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  border-radius: 6px;
  color: #4ade80;
  font-size: 0.75rem;
  cursor: pointer;
}

.claimed {
  color: #4ade80;
  font-size: 0.875rem;
}

/* 设施面板 */
.facility-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.facility-item.locked {
  opacity: 0.5;
}

.facility-icon {
  font-size: 1.5rem;
}

.facility-info {
  flex: 1;
}

.facility-name {
  font-size: 0.875rem;
  color: #e8e4d0;
}

.facility-level {
  font-size: 0.6875rem;
  color: #fbbf24;
}

.facility-desc {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.upgrade-btn {
  padding: 6px 12px;
  background: rgba(126, 184, 218, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.4);
  border-radius: 6px;
  color: #7eb8da;
  font-size: 0.75rem;
  cursor: pointer;
}

.use-btn {
  padding: 6px 12px;
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  border-radius: 6px;
  color: #4ade80;
  font-size: 0.75rem;
  cursor: pointer;
}

.facility-actions {
  display: flex;
  gap: 8px;
}

/* 俸禄面板 */
.salary-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.salary-amount,
.salary-contribution {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.salary-icon,
.contribution-icon {
  font-size: 1.25rem;
}

.salary-value {
  color: #fbbf24;
  font-weight: 500;
}

.contribution-value {
  color: #7eb8da;
}

.claim-salary-btn {
  width: 100%;
  padding: 12px;
  background: rgba(107, 114, 128, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.4);
  border-radius: 10px;
  color: #6b7280;
  font-size: 0.9375rem;
  cursor: not-allowed;
}

.claim-salary-btn.canClaim {
  background: rgba(74, 222, 128, 0.2);
  border-color: rgba(74, 222, 128, 0.4);
  color: #4ade80;
  cursor: pointer;
}

/* 退出按钮 */
.leave-btn {
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #ef4444;
  font-size: 0.8125rem;
  cursor: pointer;
}

/* 横屏适配 */
@media (max-height: 500px) and (orientation: landscape) {
  .sect-info-card {
    padding: 10px;
    margin-bottom: 10px;
  }

  .sect-header {
    margin-bottom: 8px;
  }

  .sect-icon-large {
    font-size: 2rem;
  }
}
</style>
