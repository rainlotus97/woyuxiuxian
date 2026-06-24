<template>
  <GameSurface tone="jade" padding="md" eyebrow="宗务考核" title="宗门任务" subtitle="任务、俸禄与贡献晋升会共同推动你在山门内的地位。">
    <div class="task-groups">
      <section class="task-group">
        <div class="group-head">
          <div>
            <span class="group-eyebrow">每日差遣</span>
            <strong>日常任务</strong>
          </div>
          <span class="group-count">{{ claimedDaily }}/{{ dailyTasks.length }}</span>
        </div>

        <div class="task-list">
          <div v-for="task in dailyTasks" :key="task.id" class="task-card">
            <div class="task-head">
              <div class="task-copy">
                <strong>{{ task.name }}</strong>
                <small>{{ getTaskRequirementLabel(task) }}</small>
              </div>
              <span class="reward-label">{{ getTaskRewardLabel(task) }}</span>
            </div>

            <GameProgressBar
              label="进度"
              :current="task.progress"
              :max="task.requirements.count"
              :hint="task.description"
              tone="jade"
            />

            <div class="task-actions">
              <GameActionButton
                v-if="task.completed && !task.claimed"
                icon="🎁"
                tone="gold"
                @click="$emit('claim-task', task.id)"
              >
                领取奖励
              </GameActionButton>
              <span v-else-if="task.claimed" class="task-status success">已领取</span>
              <span v-else class="task-status">进行中 · {{ Math.round(getTaskProgressPercent(task)) }}%</span>
            </div>
          </div>
        </div>
      </section>

      <section class="task-group">
        <div class="group-head">
          <div>
            <span class="group-eyebrow">周度考绩</span>
            <strong>周常任务</strong>
          </div>
          <span class="group-count">{{ claimedWeekly }}/{{ weeklyTasks.length }}</span>
        </div>

        <div class="task-list">
          <div v-for="task in weeklyTasks" :key="task.id" class="task-card">
            <div class="task-head">
              <div class="task-copy">
                <strong>{{ task.name }}</strong>
                <small>{{ getTaskRequirementLabel(task) }}</small>
              </div>
              <span class="reward-label">{{ getTaskRewardLabel(task) }}</span>
            </div>

            <GameProgressBar
              label="进度"
              :current="task.progress"
              :max="task.requirements.count"
              :hint="task.description"
              tone="gold"
            />

            <div class="task-actions">
              <GameActionButton
                v-if="task.completed && !task.claimed"
                icon="🎁"
                tone="gold"
                @click="$emit('claim-task', task.id)"
              >
                领取奖励
              </GameActionButton>
              <span v-else-if="task.claimed" class="task-status success">已领取</span>
              <span v-else class="task-status">进行中 · {{ Math.round(getTaskProgressPercent(task)) }}%</span>
            </div>
          </div>
        </div>
      </section>

      <GameSurface tone="gold" padding="md" compact>
        <div class="salary-card">
          <div class="salary-copy">
            <span class="group-eyebrow">山门俸禄</span>
            <strong>{{ salary }} 灵石 / 日</strong>
            <small>领取后额外获得 {{ contributionGain }} 贡献。</small>
          </div>

          <GameActionButton
            icon="Coins"
            :tone="canClaimSalary ? 'gold' : 'stone'"
            :disabled="!canClaimSalary"
            @click="$emit('claim-salary')"
          >
            {{ canClaimSalary ? '领取俸禄' : '今日已领' }}
          </GameActionButton>
        </div>
      </GameSurface>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameProgressBar from '@/components/game-ui/GameProgressBar.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { SectTask } from '@/types/sect'
import { getTaskProgressPercent, getTaskRequirementLabel, getTaskRewardLabel } from './sectUi'

const props = defineProps<{
  dailyTasks: SectTask[]
  weeklyTasks: SectTask[]
  salary: number
  contributionGain: number
  canClaimSalary: boolean
}>()

defineEmits<{
  'claim-task': [taskId: string]
  'claim-salary': []
}>()

const claimedDaily = computed(() => props.dailyTasks.filter(task => task.claimed).length)
const claimedWeekly = computed(() => props.weeklyTasks.filter(task => task.claimed).length)
</script>

<style scoped>
.task-groups,
.task-group,
.task-list {
  display: grid;
  gap: 14px;
}

.group-head,
.task-head,
.salary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.group-head strong,
.task-copy strong,
.salary-copy strong {
  color: #315257;
  font-size: 15px;
}

.group-eyebrow,
.task-copy small,
.salary-copy small,
.task-status {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.group-count,
.reward-label {
  color: #8b6226;
  font-size: 11px;
}

.task-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.66);
  border: 1px solid rgba(103, 149, 144, 0.16);
}

.task-copy {
  display: grid;
  gap: 4px;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

.task-status.success {
  color: #4caa73;
}

.salary-card {
  align-items: end;
}

.salary-copy {
  display: grid;
  gap: 4px;
}

@media (max-width: 720px) {
  .group-head,
  .task-head,
  .salary-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
