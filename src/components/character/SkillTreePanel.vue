<template>
  <div class="skill-tree-panel">
    <div class="skill-header">
      <div class="skill-summary">
        <div class="skill-points">
          <span>技能点</span>
          <strong>{{ skillPoints }}</strong>
        </div>
        <div class="summary-chip">
          <span>已学</span>
          <strong>{{ summary.learnedCount }}/{{ summary.totalCount }}</strong>
        </div>
        <div class="summary-chip">
          <span>启用</span>
          <strong>{{ summary.enabledCount }}</strong>
        </div>
        <div class="summary-chip">
          <span>可学</span>
          <strong>{{ summary.availableCount }}</strong>
        </div>
      </div>

      <div class="branch-row">
        <button
          v-for="branch in branches"
          :key="branch.id"
          :class="{ active: activeBranch === branch.id }"
          @click="$emit('update:activeBranch', branch.id)"
        >
          {{ branch.label }}
          <span>{{ branch.learnedCount }}/{{ branch.totalCount }}</span>
        </button>
      </div>
    </div>

    <div class="skill-list">
      <article
        v-for="node in nodes"
        :key="node.skillId"
        class="skill-node"
        :class="skillNodeClass(node.skillId)"
      >
        <div class="skill-icon">{{ getState(node.skillId).definition?.icon ?? '?' }}</div>
        <div class="skill-copy">
          <div>
            <strong>{{ getState(node.skillId).definition?.name ?? node.skillId }}</strong>
            <span v-if="getState(node.skillId).isLearned">
              Lv.{{ getState(node.skillId).learnedLevel }}
            </span>
          </div>
          <p>{{ getState(node.skillId).definition?.description ?? '未知功法' }}</p>
          <div class="effect-tags">
            <i v-for="effect in getState(node.skillId).effects" :key="effect">{{ effect }}</i>
          </div>
        </div>
        <div class="skill-actions">
          <GameActionButton
            v-if="!getState(node.skillId).isLearned"
            tone="jade"
            :disabled="!getState(node.skillId).canLearn"
            @click="$emit('learn', node.skillId)"
          >
            {{ getState(node.skillId).canLearn ? '学习' : getState(node.skillId).lockReason }}
          </GameActionButton>
          <template v-else>
            <GameActionButton
              tone="gold"
              :disabled="!getState(node.skillId).canUpgrade"
              @click="$emit('upgrade', node.skillId)"
            >
              升级
            </GameActionButton>
            <button
              class="skill-toggle"
              :class="{ enabled: getState(node.skillId).enabled }"
              @click="$emit('toggle', node.skillId)"
            >
              {{ getState(node.skillId).enabled ? '启' : '禁' }}
            </button>
          </template>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import type { SkillProgressSummary } from '@/composables/useCharacterLoadout'
import type { SkillBranch, SkillTreeNode } from '@/types/skill'

interface SkillBranchOption {
  id: SkillBranch
  label: string
  learnedCount: number
  totalCount: number
}

interface SkillNodeState {
  definition?: {
    icon: string
    name: string
    description: string
  }
  learnedLevel: number
  isLearned: boolean
  canLearn: boolean
  canUpgrade: boolean
  enabled: boolean
  lockReason: string
  effects: string[]
}

defineEmits<{
  'update:activeBranch': [branch: SkillBranch]
  learn: [skillId: string]
  upgrade: [skillId: string]
  toggle: [skillId: string]
}>()

const props = defineProps<{
  skillPoints: number
  summary: SkillProgressSummary
  branches: SkillBranchOption[]
  activeBranch: SkillBranch
  nodes: SkillTreeNode[]
  getState: (skillId: string) => SkillNodeState
}>()

function skillNodeClass(skillId: string) {
  const state = props.getState(skillId)
  return {
    learned: state.isLearned,
    available: !state.isLearned && state.canLearn,
    locked: !state.isLearned && !state.canLearn
  }
}
</script>

<style scoped>
.skill-tree-panel {
  display: grid;
  gap: 12px;
}

.skill-header {
  display: grid;
  gap: 12px;
}

.skill-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, auto));
  justify-content: start;
  gap: 8px;
}

.skill-points {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 249, 226, 0.82);
  color: #8b6326;
}

.summary-chip {
  display: grid;
  gap: 2px;
  min-width: 66px;
  padding: 8px 10px;
  border: 1px solid rgba(123, 153, 145, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.56);
}

.skill-points span,
.summary-chip span {
  font-size: 11px;
}

.summary-chip span {
  color: rgba(73, 97, 95, 0.68);
}

.summary-chip strong {
  color: #315257;
  font-size: 13px;
}

.branch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.branch-row button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(123, 153, 145, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.56);
  color: #55706a;
  font-family: var(--font-game);
  font-size: 12px;
  font-weight: 800;
}

.branch-row button.active {
  color: #8b6326;
  background: rgba(255, 247, 218, 0.86);
  border-color: rgba(188, 141, 58, 0.26);
}

.branch-row span {
  margin-left: 6px;
  color: rgba(80, 111, 104, 0.68);
}

.skill-list {
  display: grid;
  gap: 10px;
}

.skill-node {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(123, 153, 145, 0.18);
  background: rgba(255, 255, 255, 0.58);
}

.skill-node.learned {
  border-color: rgba(80, 178, 140, 0.28);
  background: linear-gradient(180deg, rgba(245, 255, 248, 0.86), rgba(235, 248, 242, 0.78));
}

.skill-node.locked {
  opacity: 0.62;
}

.skill-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  color: #8b6326;
  font-size: 22px;
  font-weight: 800;
}

.skill-copy {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.skill-copy div:first-child {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-copy strong {
  color: #315257;
  font-size: 14px;
}

.skill-copy div:first-child span {
  color: #8b6326;
  font-size: 11px;
}

.skill-copy p {
  margin: 0;
  color: rgba(55, 82, 80, 0.72);
  font-size: 12px;
  line-height: 1.45;
}

.effect-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.effect-tags i {
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  color: #5d756f;
  font-size: 10px;
  font-style: normal;
}

.skill-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-toggle {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(123, 153, 145, 0.22);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.62);
  color: #7a8f89;
  font-family: var(--font-game);
  font-weight: 800;
}

.skill-toggle.enabled {
  color: #2e8d72;
  background: rgba(229, 250, 239, 0.9);
}

@media (max-width: 820px) {
  .skill-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .skill-points {
    width: auto;
    justify-content: space-between;
  }

  .skill-node {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .skill-actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
}
</style>
