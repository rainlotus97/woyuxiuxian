<template>
  <div class="loop-hub-panel">
    <div class="loop-compact-strip">
      <div class="compact-copy">
        <span>{{ presentProgressText(audit.progressText) }}</span>
        <strong>{{ presentAuditTitle(audit.title) }}</strong>
        <small>
          <template v-if="acceptance.primaryGap">
            {{ presentGapPrefix() }}{{ acceptance.primaryGap.label }} · {{ acceptance.primaryGap.detail }}
          </template>
          <template v-else>
            {{ presentAcceptanceHeadline(acceptance.headline) }}
          </template>
        </small>
      </div>
      <button
        type="button"
        class="compact-primary-action"
        :class="`kind-${nextAction.primary.kind}`"
        @click="$emit('next-action')"
      >
        <span>{{ nextAction.primary.actionHint }}</span>
        <strong>{{ nextAction.primary.title }}</strong>
      </button>
      <button type="button" class="compact-toggle" @click="expanded = !expanded">
        <span>{{ expanded ? '先收起' : '展开细看' }}</span>
        <strong>{{ expanded ? '收起这张总览' : '看六条路和缺口' }}</strong>
      </button>
    </div>

    <div v-if="expanded" class="loop-detail-stack">
      <div class="loop-readiness-strip">
      <div>
        <span>{{ presentProgressText(audit.progressText) }}</span>
        <strong>{{ presentAuditTitle(audit.title) }}</strong>
        <small>{{ audit.subtitle }}</small>
        <i class="p0-progress-meter" aria-hidden="true">
          <b :style="{ width: `${audit.progressPercent}%` }"></b>
        </i>
      </div>
      <button
        type="button"
        class="next-loop-action"
        :class="`kind-${nextAction.primary.kind}`"
        @click="$emit('next-action')"
      >
        <span>{{ nextAction.primary.actionHint }}</span>
        <strong>{{ nextAction.primary.title }}</strong>
        <small>{{ nextAction.primary.reason }}</small>
      </button>
      <div class="readiness-counts">
        <span class="state-ready">{{ presentCountLabel('可行动', readiness.counts.ready) }}</span>
        <span class="state-warning">{{ presentCountLabel('需处理', readiness.counts.warning) }}</span>
        <span class="state-blocked">{{ presentCountLabel('阻塞', readiness.counts.blocked) }}</span>
        <span class="state-closed">{{ presentClosedCount(`闭环 ${closure.counts.closed}/${closure.totalCount}`) }}</span>
      </div>
      </div>

      <div class="p0-acceptance-panel" :class="`state-${acceptance.state}`">
        <div class="acceptance-copy">
          <span>{{ presentAcceptanceLabel(acceptance.gateLabel) }}</span>
          <strong>{{ presentAcceptanceHeadline(acceptance.headline) }}</strong>
          <small v-if="acceptance.primaryGap">
            {{ presentGapPrefix() }}{{ acceptance.primaryGap.label }} · {{ acceptance.primaryGap.detail }}
          </small>
          <small v-else>继续往深处写人物、宗门、战斗和大世界，也不会空转了。</small>
        </div>
        <div class="acceptance-side">
          <div class="acceptance-gap-list" aria-label="P0 验收缺口">
            <button
              v-for="item in acceptance.remainingItems"
              :key="item.id"
              type="button"
              :class="`gap-${item.state}`"
              @click="$emit('acceptance-gap', item.id)"
            >
              {{ item.label }} · {{ presentStateLabel(item.stateLabel) }}
            </button>
            <span v-if="acceptance.readyForP1" class="gap-closed">{{ presentClosedLabel() }}</span>
          </div>
          <button
            v-if="acceptance.primaryGap"
            type="button"
            class="acceptance-action"
            @click="$emit('acceptance-gap', acceptance.primaryGap.id)"
          >
            <span>{{ acceptance.primaryGap.nextAction }}</span>
            <strong>{{ presentPrimaryAction('处理缺口') }}</strong>
          </button>
        </div>
      </div>

      <div class="loop-task-grid" aria-label="P0 主循环入口">
        <button
          v-for="task in tasks"
          :key="task.id"
          class="loop-task-card"
          :class="[`tone-${task.tone}`, `state-${task.readiness.state}`, { active: task.active }]"
          @click="$emit('task', task.id)"
        >
          <GameIcon class="task-icon" :icon="task.icon" :size="20" />
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import type {
  MainLoopReadinessKey,
  MainLoopReadinessSummary
} from '@/world/runtime/mainLoopReadinessResolver'
import type { P0LoopAcceptanceSummary } from '@/world/runtime/p0LoopAcceptanceResolver'
import type { P0LoopAuditSummary } from '@/world/runtime/p0LoopAuditResolver'
import type { P0LoopClosureSummary } from '@/world/runtime/p0LoopClosureResolver'
import type { P0LoopNextActionSummary } from '@/world/runtime/p0LoopNextActionResolver'
import type { P0MainLoopTask } from './p0LoopUi'

defineProps<{
  audit: P0LoopAuditSummary
  acceptance: P0LoopAcceptanceSummary
  nextAction: P0LoopNextActionSummary
  readiness: MainLoopReadinessSummary
  closure: P0LoopClosureSummary
  tasks: P0MainLoopTask[]
}>()

defineEmits<{
  'next-action': []
  'acceptance-gap': [id: MainLoopReadinessKey]
  task: [id: MainLoopReadinessKey]
}>()

const expanded = ref(false)

function presentProgressText(text: string) {
  return text.replace(/^P0\s*/u, '眼下进度 ')
}

function presentAuditTitle(text: string) {
  return text
    .replace('P0 先解阻塞', '先把眼前的阻碍解开')
    .replace('P0 开始跑闭环', '先把路数走顺')
    .replace('P0 闭环复核中', '主角的路正在铺开')
    .replace('P0 已具备可玩底座', '六条路都已经留下回响')
}

function presentAcceptanceLabel(text: string) {
  return text
    .replace('可以进入 P1', '后路已开')
    .replace('继续 P0 验收', '眼下还有要紧事')
    .replace('先解阻塞', '先解眼前困局')
}

function presentAcceptanceHeadline(text: string) {
  return text
    .replace('P0 六项核心入口均已有可回看的结果证据。', '修炼、历练、故事、人物、地图、宗门都已经留下了回响。')
    .replace(/还剩 (\d+) 项入口缺少结果证据。/u, '还有 $1 条路还没真正碰出回响。')
    .replace(/(\d+) 项入口仍阻塞，先处理前置条件。/u, '$1 条路还被拦着，先把前置因果理顺。')
}

function presentGapPrefix() {
  return '眼下最缺：'
}

function presentClosedLabel() {
  return '六路已通'
}

function presentClosedCount(text: string) {
  return text.replace(/^闭环/u, '已有回响')
}

function presentStateLabel(text: string) {
  return text
    .replace('待验证', '还没碰出回响')
    .replace('已闭环', '已有回响')
    .replace('阻塞', '受阻')
}

function presentPrimaryAction(text: string) {
  return text.replace('处理缺口', '先去处理')
}

function presentCountLabel(kind: string, count: number) {
  if (kind === '可行动') return count > 0 ? `已有 ${count} 条路可走` : '眼下先别乱动'
  if (kind === '需处理') return count > 0 ? `还有 ${count} 桩眼前事` : '眼下暂无急事'
  if (kind === '阻塞') return count > 0 ? `还有 ${count} 处受阻` : '眼下没有死路'
  return `${kind} ${count}`
}
</script>

<style scoped>
.loop-hub-panel {
  display: grid;
  grid-column: 1 / -1;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(188, 141, 58, 0.18);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 252, 240, 0.58), rgba(241, 250, 245, 0.44)),
    radial-gradient(circle at 18% 0%, rgba(255, 224, 150, 0.2), transparent 48%);
}

.loop-compact-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(170px, 0.66fr) minmax(148px, 0.52fr);
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgba(103, 149, 144, 0.16);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.8), rgba(241, 249, 244, 0.66)),
    radial-gradient(circle at top right, rgba(255, 213, 112, 0.14), transparent 62%);
}

.compact-copy {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.compact-copy span {
  color: rgba(75, 100, 98, 0.66);
  font-size: 10px;
}

.compact-copy strong {
  color: #315257;
  font-size: 13px;
  line-height: 1.35;
}

.compact-copy small {
  display: -webkit-box;
  overflow: hidden;
  color: rgba(73, 97, 95, 0.68);
  font-size: 10px;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.compact-primary-action,
.compact-toggle {
  min-width: 0;
  min-height: 52px;
  display: grid;
  gap: 2px;
  align-content: center;
  padding: 8px 10px;
  border-radius: 10px;
  font-family: var(--font-game);
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
}

.compact-primary-action {
  border: 1px solid rgba(194, 146, 66, 0.2);
  background:
    linear-gradient(180deg, rgba(255, 251, 235, 0.88), rgba(242, 253, 247, 0.72)),
    radial-gradient(circle at top right, rgba(255, 220, 132, 0.16), transparent 60%);
  color: #315257;
}

.compact-primary-action.kind-unblock {
  border-color: rgba(199, 121, 138, 0.24);
  background: rgba(255, 244, 247, 0.86);
}

.compact-primary-action.kind-expand {
  border-color: rgba(88, 164, 143, 0.2);
  background: rgba(239, 252, 247, 0.84);
}

.compact-toggle {
  border: 1px solid rgba(103, 149, 144, 0.14);
  background: rgba(255, 255, 255, 0.68);
  color: #315257;
}

.compact-primary-action span,
.compact-toggle span {
  overflow: hidden;
  color: #8b6226;
  font-size: 10px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-primary-action strong,
.compact-toggle strong {
  overflow: hidden;
  color: #315257;
  font-size: 11px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loop-detail-stack {
  display: grid;
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

.acceptance-side {
  min-width: min(430px, 48vw);
  display: grid;
  justify-items: end;
  gap: 8px;
}

.acceptance-gap-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.acceptance-gap-list span,
.acceptance-gap-list button {
  flex: 0 0 auto;
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

.loop-task-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.loop-task-card {
  min-width: 0;
  min-height: 96px;
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
  -webkit-line-clamp: 1;
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

@media (max-width: 980px) {
  .loop-task-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .loop-compact-strip {
    grid-template-columns: 1fr;
  }

  .loop-task-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .loop-task-card {
    min-height: 86px;
    padding: 9px;
  }

  .loop-readiness-strip {
    align-items: stretch;
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 10px;
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

  .task-copy b {
    display: none;
  }
}
</style>
