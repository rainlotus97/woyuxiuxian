<template>
  <GameSurface tone="gold" padding="md" eyebrow="宗门循环" title="山门运转" subtitle="任务、药园、设施和战后收益会在这里汇总成日常经营节奏。">
    <div class="cycle-grid">
      <section class="cycle-card">
        <div class="card-head">
          <div>
            <span class="card-eyebrow">考绩进度</span>
            <strong>任务与俸禄</strong>
          </div>
          <span class="card-metric">{{ completedTaskCount }}/{{ totalTaskCount }}</span>
        </div>

        <div class="stat-row">
          <span class="stat-pill">待领奖励 {{ rewardReadyCount }}</span>
          <span class="stat-pill">今日俸禄 {{ canClaimSalary ? '可领' : '已领' }}</span>
        </div>

        <p class="card-copy">{{ taskSummary }}</p>
        <div v-if="lastDutyTitle" class="duty-feedback">
          <strong>{{ lastDutyTitle }}</strong>
          <span>{{ lastDutyText }}</span>
        </div>

        <div class="action-row">
          <GameActionButton icon="令" tone="jade" @click="$emit('resolve-duty')">
            处理差遣
          </GameActionButton>
          <GameActionButton icon="🎁" tone="gold" :disabled="rewardReadyCount === 0" @click="$emit('claim-all-tasks')">
            一键领取
          </GameActionButton>
          <GameActionButton icon="Coins" tone="jade" :disabled="!canClaimSalary" @click="$emit('claim-salary')">
            领取俸禄
          </GameActionButton>
        </div>
      </section>

      <section class="cycle-card">
        <div class="card-head">
          <div>
            <span class="card-eyebrow">药园经营</span>
            <strong>灵草收成</strong>
          </div>
          <span class="card-metric">{{ activeGardenSlots }}/{{ gardenSlotCount }}</span>
        </div>

        <div class="stat-row">
          <span class="stat-pill">成熟 {{ readyGardenSlots }}</span>
          <span class="stat-pill">{{ gardenSummary }}</span>
        </div>

        <p class="card-copy">{{ gardenHint }}</p>

        <div class="action-row">
          <GameActionButton icon="🌿" tone="jade" :disabled="readyGardenSlots === 0" @click="$emit('harvest-ready')">
            收取成熟作物
          </GameActionButton>
          <GameActionButton icon="🏛️" tone="gold" @click="$emit('open-facility', 'medicine_garden')">
            管理药园
          </GameActionButton>
        </div>
      </section>

      <section class="cycle-card">
        <div class="card-head">
          <div>
            <span class="card-eyebrow">设施深度</span>
            <strong>核心设施</strong>
          </div>
          <span class="card-metric">Lv.{{ alchemyLevel }} / Lv.{{ gardenLevel }}</span>
        </div>

        <div class="facility-strip">
          <div class="facility-pill">
            <span>炼丹炉</span>
            <strong>{{ alchemyLevel }}</strong>
          </div>
          <div class="facility-pill">
            <span>药园</span>
            <strong>{{ gardenLevel }}</strong>
          </div>
          <div class="facility-pill">
            <span>可用丹方</span>
            <strong>{{ availableRecipeCount }}</strong>
          </div>
        </div>

        <p class="card-copy">{{ facilitySummary }}</p>

        <div class="action-row">
          <GameActionButton icon="🧪" tone="jade" @click="$emit('open-facility', 'alchemy_furnace')">
            开炉炼丹
          </GameActionButton>
          <GameActionButton icon="⬆️" tone="gold" @click="$emit('go-tab', 'facilities')">
            查看设施
          </GameActionButton>
        </div>
      </section>

      <section class="cycle-card" :class="{ alert: hasWarReport || hasActiveWar }">
        <div class="card-head">
          <div>
            <span class="card-eyebrow">前线回报</span>
            <strong>战局与战利</strong>
          </div>
          <span class="card-metric">{{ warStatusLabel }}</span>
        </div>

        <div v-if="hasActiveWar" class="war-score-strip">
          <span class="stat-pill">我方 {{ attackerScore }}/{{ activeWarWinScore }}</span>
          <span class="stat-pill">敌方 {{ defenderScore }}/{{ activeWarWinScore }}</span>
        </div>

        <div v-else-if="lastWarReport" class="war-score-strip">
          <span class="stat-pill">贡献 {{ lastWarReport.rewards.contribution }}</span>
          <span class="stat-pill">灵石 {{ lastWarReport.rewards.gold }}</span>
          <span class="stat-pill">声望 {{ lastWarReport.rewards.reputation }}</span>
        </div>

        <p class="card-copy">{{ warSummary }}</p>

        <div class="action-row">
          <GameActionButton icon="Swords" tone="jade" @click="$emit('go-tab', 'diplomacy')">
            查看战局
          </GameActionButton>
          <GameActionButton icon="📋" tone="gold" :disabled="!hasWarReport" @click="$emit('ack-war-report')">
            收起战报
          </GameActionButton>
        </div>
      </section>
    </div>
  </GameSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { SectWar } from '@/types/sect'

interface WarReport {
  warId: string
  title: string
  summary: string
  time: number
  winner: 'attacker' | 'defender'
  rewards: {
    contribution: number
    gold: number
    reputation: number
  }
  penalties: {
    contribution: number
    reputation: number
  }
}

const props = defineProps<{
  totalTaskCount: number
  completedTaskCount: number
  rewardReadyCount: number
  canClaimSalary: boolean
  taskSummary: string
  gardenSlotCount: number
  activeGardenSlots: number
  readyGardenSlots: number
  gardenSummary: string
  gardenHint: string
  alchemyLevel: number
  gardenLevel: number
  availableRecipeCount: number
  facilitySummary: string
  activeWar: SectWar | null
  lastWarReport: WarReport | null
  lastDutyTitle: string | null
  lastDutyText: string | null
}>()

defineEmits<{
  'resolve-duty': []
  'claim-all-tasks': []
  'claim-salary': []
  'harvest-ready': []
  'open-facility': [facilityId: string]
  'go-tab': [tabId: 'tasks' | 'facilities' | 'diplomacy']
  'ack-war-report': []
}>()

const hasActiveWar = computed(() => Boolean(props.activeWar))
const hasWarReport = computed(() => Boolean(props.lastWarReport))
const attackerScore = computed(() => props.activeWar?.attackerScore ?? 0)
const defenderScore = computed(() => props.activeWar?.defenderScore ?? 0)
const activeWarWinScore = computed(() => props.activeWar?.winScore ?? 100)
const warStatusLabel = computed(() => {
  if (props.activeWar) return '交战中'
  if (props.lastWarReport) return props.lastWarReport.winner === 'attacker' ? '凯旋' : '失利'
  return '平稳'
})
const warSummary = computed(() => {
  if (props.activeWar) {
    return '前线正在持续消耗资源与人手，宗门收益与地图局势会跟着战果波动。'
  }
  if (props.lastWarReport) {
    return `${props.lastWarReport.title}：${props.lastWarReport.summary}`
  }
  return '当前暂无新的战报，宗门资源可优先投入药园、炼丹与职位晋升。'
})
</script>

<style scoped>
.cycle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cycle-card {
  display: grid;
  gap: 12px;
  min-height: 220px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(194, 146, 66, 0.18);
  background: rgba(255, 255, 255, 0.72);
}

.cycle-card.alert {
  border-color: rgba(198, 121, 137, 0.24);
  background: rgba(255, 246, 248, 0.82);
}

.card-head,
.action-row,
.facility-strip,
.war-score-strip,
.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.duty-feedback {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(103, 149, 144, 0.14);
  background: rgba(244, 252, 248, 0.78);
}

.duty-feedback strong {
  color: #8b6226;
  font-size: 12px;
}

.duty-feedback span {
  color: rgba(73, 97, 95, 0.76);
  font-size: 11px;
  line-height: 1.55;
}

.card-head {
  align-items: start;
}

.card-eyebrow,
.card-copy {
  color: rgba(73, 97, 95, 0.76);
}

.card-eyebrow {
  font-size: 11px;
}

.card-head strong,
.facility-pill strong {
  color: #315257;
}

.card-head strong {
  font-size: 15px;
}

.card-metric,
.stat-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 250, 239, 0.82);
  border: 1px solid rgba(194, 146, 66, 0.18);
  color: #8b6226;
  font-size: 11px;
}

.stat-row,
.facility-strip,
.war-score-strip {
  flex-wrap: wrap;
  justify-content: flex-start;
}

.facility-pill {
  display: grid;
  gap: 2px;
  min-width: 86px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(247, 250, 249, 0.92);
  border: 1px solid rgba(103, 149, 144, 0.16);
}

.facility-pill span {
  color: rgba(73, 97, 95, 0.72);
  font-size: 10px;
}

.card-copy {
  margin: 0;
  min-height: 42px;
  font-size: 12px;
  line-height: 1.65;
}

.action-row {
  margin-top: auto;
  justify-content: flex-start;
  flex-wrap: wrap;
}

@media (max-width: 920px) {
  .cycle-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .action-row {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
