<template>
  <section class="schema-panel" :class="{ clean: summary.issueCount === 0 }">
    <div class="schema-head">
      <div>
        <span class="schema-kicker">物品谱系</span>
        <strong>{{ summary.issueCount ? '发现可归一项' : '谱系完整' }}</strong>
      </div>
      <i>{{ summary.normalizedDefinitionCount }} 种定义</i>
    </div>

    <div class="schema-stats">
      <div>
        <span>装备</span>
        <b>{{ summary.equipmentItems }}</b>
      </div>
      <div>
        <span>丹食</span>
        <b>{{ summary.consumableItems }}</b>
      </div>
      <div>
        <span>材料</span>
        <b>{{ summary.materialItems }}</b>
      </div>
      <div>
        <span>校验</span>
        <b>{{ summary.warningCount }}/{{ summary.infoCount }}</b>
      </div>
    </div>

    <div v-if="summary.issueCount" class="schema-issues">
      <div
        v-for="issue in summary.issues.slice(0, 4)"
        :key="`${issue.diagnostic.itemId}-${issue.diagnostic.type}`"
        class="schema-issue"
        :class="issue.severity"
      >
        <span class="schema-issue-icon">
          <GameIcon :icon="issue.itemIcon" :size="18" />
        </span>
        <div>
          <strong>{{ issue.itemName }}</strong>
          <p>{{ issue.diagnostic.message }}</p>
          <em>{{ issue.normalizedDefinitionId }}</em>
        </div>
      </div>
      <small v-if="summary.issueCount > 4">另有 {{ summary.issueCount - 4 }} 条归一记录</small>
    </div>

    <p v-else class="schema-empty">当前包裹物品都能追溯到统一定义，炼丹、坊市、掉落和任务消耗可共用同一套标识。</p>
  </section>
</template>

<script setup lang="ts">
import GameIcon from '@/components/game-ui/GameIcon.vue'
import type { InventorySchemaSummary } from '@/character/runtime/inventorySchemaSummaryResolver'

defineProps<{
  summary: InventorySchemaSummary
}>()
</script>

<style scoped>
.schema-panel {
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
  padding: 13px;
  border: 1px solid rgba(189, 142, 59, 0.22);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(255, 249, 226, 0.82), rgba(235, 249, 243, 0.74)),
    rgba(255, 255, 255, 0.64);
}

.schema-panel.clean {
  border-color: rgba(88, 151, 128, 0.2);
}

.schema-head,
.schema-stats,
.schema-issue {
  display: grid;
  align-items: center;
}

.schema-head {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.schema-head div {
  display: grid;
  gap: 4px;
}

.schema-kicker,
.schema-stats span {
  color: rgba(73, 97, 95, 0.68);
  font-size: 11px;
}

.schema-head strong {
  color: #315257;
  font-size: 15px;
}

.schema-head i {
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  color: #8b6326;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
}

.schema-stats {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.schema-stats div {
  min-width: 0;
  display: grid;
  gap: 4px;
  padding: 9px;
  border: 1px solid rgba(123, 153, 145, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.52);
}

.schema-stats b {
  color: #8b6326;
  font-size: 15px;
}

.schema-issues {
  display: grid;
  gap: 8px;
}

.schema-issue {
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  padding: 9px;
  border: 1px solid rgba(123, 153, 145, 0.14);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.58);
}

.schema-issue.warning {
  border-color: rgba(185, 91, 72, 0.2);
}

.schema-issue-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 249, 226, 0.9);
  color: #8b6326;
  font-weight: 800;
}

.schema-issue div {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.schema-issue strong {
  color: #315257;
  font-size: 12px;
}

.schema-issue p,
.schema-empty,
.schema-issues small {
  margin: 0;
  color: rgba(55, 82, 80, 0.72);
  font-size: 11px;
  line-height: 1.5;
}

.schema-issue em {
  color: #2e8d72;
  font-size: 10px;
  font-style: normal;
}

@media (max-width: 520px) {
  .schema-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
