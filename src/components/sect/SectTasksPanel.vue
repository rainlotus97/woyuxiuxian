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
          <XTaskEntry
            v-for="task in dailyTasks"
            :key="task.id"
            class="task-entry"
            :title="task.name"
            :description="getTaskDescription(task)"
            :tag="getTaskTag(task)"
            :reward="getTaskRewardLabel(task)"
            :progress="task.progress"
            :progress-max="task.requirements.count"
            :state="getTaskState(task)"
            :interactive="task.completed && !task.claimed"
            icon="mission"
            tone="jade"
            @click="handleTaskClick(task)"
          />
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
          <XTaskEntry
            v-for="task in weeklyTasks"
            :key="task.id"
            class="task-entry"
            :title="task.name"
            :description="getTaskDescription(task)"
            :tag="getTaskTag(task)"
            :reward="getTaskRewardLabel(task)"
            :progress="task.progress"
            :progress-max="task.requirements.count"
            :state="getTaskState(task)"
            :interactive="task.completed && !task.claimed"
            icon="crown"
            tone="gold"
            @click="handleTaskClick(task)"
          />
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
import { XTaskEntry } from '@rainlotus97/ui'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
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

const emit = defineEmits<{
  'claim-task': [taskId: string]
  'claim-salary': []
}>()

const claimedDaily = computed(() => props.dailyTasks.filter(task => task.claimed).length)
const claimedWeekly = computed(() => props.weeklyTasks.filter(task => task.claimed).length)

function getTaskState(task: SectTask): 'active' | 'ready' | 'done' {
  if (task.claimed) return 'done'
  if (task.completed) return 'ready'
  return 'active'
}

function getTaskTag(task: SectTask) {
  if (task.claimed) return '已领取'
  if (task.completed) return '可领取'
  return `${Math.round(getTaskProgressPercent(task))}%`
}

function getTaskDescription(task: SectTask) {
  return `${getTaskRequirementLabel(task)} · ${task.description}`
}

function handleTaskClick(task: SectTask) {
  if (task.completed && !task.claimed) emit('claim-task', task.id)
}
</script>

<style scoped>
.task-groups,
.task-group,
.task-list {
  display: grid;
  gap: 14px;
}

.group-head,
.salary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.group-head strong,
.salary-copy strong {
  color: #315257;
  font-size: 15px;
}

.group-eyebrow,
.salary-copy small {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.group-count {
  color: #8b6226;
  font-size: 11px;
}

.task-entry {
  min-width: 0;
}

.task-entry :deep(.x-task-entry__description) {
  display: -webkit-box;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.task-entry :deep(.x-task-entry__reward) {
  overflow: hidden;
  max-width: min(32vw, 11rem);
  text-overflow: ellipsis;
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
  .salary-card {
    flex-direction: column;
    align-items: stretch;
  }

  .task-entry :deep(.x-task-entry__end) {
    min-width: 0;
    max-width: 7rem;
  }

  .task-entry :deep(.x-task-entry__reward) {
    max-width: 7rem;
  }
}

@media (max-width: 420px) {
  .task-entry.x-task-entry {
    gap: 8px;
    padding-inline: 10px;
  }

  .task-entry :deep(.x-task-entry__icon) {
    width: 2.2rem;
    height: 2.2rem;
  }

  .task-entry :deep(.x-task-entry__end) {
    max-width: 5.5rem;
  }

  .task-entry :deep(.x-task-entry__reward) {
    max-width: 5.5rem;
  }
}
</style>
