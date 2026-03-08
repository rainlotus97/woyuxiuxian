<template>
  <Transition name="slide-in">
    <div v-if="visible && availableQuests.length > 0" class="side-quest-panel">
      <div class="panel-header">
        <span class="title">📋 可触发支线</span>
        <span class="count">{{ availableQuests.length }}</span>
      </div>

      <div class="quest-list">
        <div
          v-for="quest in availableQuests"
          :key="quest.id"
          class="quest-item"
          :class="{ completed: quest.isCompleted }"
          @click="selectQuest(quest)"
        >
          <div class="quest-icon">
            {{ quest.isCompleted ? '✓' : '!' }}
          </div>
          <div class="quest-info">
            <span class="quest-name">{{ quest.name }}</span>
            <span class="quest-character">{{ quest.characterName }}</span>
          </div>
          <div class="quest-trigger-type" :class="quest.triggerType">
            {{ triggerTypeLabel(quest.triggerType) }}
          </div>
        </div>
      </div>

      <!-- 支线详情弹窗 -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="selectedQuest" class="quest-detail-overlay" @click="closeDetail">
            <div class="quest-detail" @click.stop>
              <h3>{{ selectedQuest.name }}</h3>
              <p class="character">角色: {{ selectedQuest.characterName }}</p>

              <div class="prerequisites" v-if="selectedQuest.prerequisites.length > 0">
                <h4>前置条件</h4>
                <ul>
                  <li v-for="(pre, idx) in formatPrerequisites(selectedQuest.prerequisites)" :key="idx">
                    {{ pre }}
                  </li>
                </ul>
              </div>

              <div class="rewards" v-if="selectedQuest.rewards && selectedQuest.rewards.length > 0">
                <h4>奖励</h4>
                <ul>
                  <li v-for="(reward, idx) in formatRewards(selectedQuest.rewards)" :key="idx">
                    {{ reward }}
                  </li>
                </ul>
              </div>

              <div class="actions">
                <button
                  v-if="!selectedQuest.isCompleted"
                  class="btn primary"
                  @click="triggerQuest(selectedQuest)"
                >
                  触发支线
                </button>
                <span v-else class="completed-badge">✓ 已完成</span>
                <button class="btn secondary" @click="closeDetail">关闭</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStoryStore } from '@/story/storyStore'
import type { SideQuestDetail, Prerequisite, Effect, TriggerType } from '@/story/types'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  trigger: [questId: string]
  close: []
}>()

const store = useStoryStore()
const selectedQuest = ref<SideQuestDetail | null>(null)

// 获取可用支线任务
const availableQuests = computed(() => {
  // 从 store 获取可用的支线任务
  return store.availableSideQuests || []
})

function triggerTypeLabel(type: TriggerType): string {
  const labels: Record<TriggerType, string> = {
    must: '强制',
    prob: '概率',
    loop: '周目',
    favor: '好感',
    item: '物品'
  }
  return labels[type] || type
}

function formatPrerequisites(prerequisites: Prerequisite[]): string[] {
  return prerequisites.map(pre => {
    switch (pre.type) {
      case 'loop':
        return `周目 >= ${pre.value}`
      case 'node_complete':
        return `完成节点 ${pre.nodeId}`
      case 'event_triggered':
        return `已触发 ${pre.value}`
      case 'favor':
        return `${pre.characterId} 好感 >= ${pre.value}`
      case 'item':
        return `持有 ${pre.itemId}`
      case 'clue':
        return `解锁线索 ${pre.clueId}`
      case 'route':
        return `当前路线: ${pre.routeId}`
      case 'choice':
        return `选择记录: ${pre.value}`
      default:
        return JSON.stringify(pre)
    }
  })
}

function formatRewards(rewards: Effect[]): string[] {
  return rewards.map(effect => {
    switch (effect.type) {
      case 'gain_item':
        return `获得: ${effect.target}`
      case 'gain_clue':
      case 'unlock_clue':
        return `解锁线索: ${effect.target}`
      case 'favor_up':
        return `${effect.target} 好感 +${effect.value || 1}`
      case 'ability':
        return `解锁能力: ${effect.target}`
      case 'route':
        return `进入路线: ${effect.target}`
      case 'realm':
        return `境界: ${effect.target}`
      case 'ending':
        return `解锁结局: ${effect.target}`
      case 'info':
        return `得知: ${effect.target}`
      default:
        return effect.target || '未知奖励'
    }
  })
}

function selectQuest(quest: SideQuestDetail) {
  selectedQuest.value = quest
}

function closeDetail() {
  selectedQuest.value = null
}

function triggerQuest(quest: SideQuestDetail) {
  emit('trigger', quest.id)
  closeDetail()
}
</script>

<style scoped>
.side-quest-panel {
  position: fixed;
  right: 20px;
  top: 100px;
  width: 280px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  overflow: hidden;
  z-index: 100;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 215, 0, 0.1);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.panel-header .title {
  color: #ffd700;
  font-weight: bold;
  font-size: 14px;
}

.panel-header .count {
  background: #ffd700;
  color: #1a1a2e;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.quest-list {
  max-height: 300px;
  overflow-y: auto;
}

.quest-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.quest-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.quest-item.completed {
  opacity: 0.6;
}

.quest-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd700;
  margin-right: 12px;
  font-size: 14px;
}

.quest-item.completed .quest-icon {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.quest-info {
  flex: 1;
  min-width: 0;
}

.quest-name {
  display: block;
  color: #e8e8e8;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quest-character {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.quest-trigger-type {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.quest-trigger-type.must { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
.quest-trigger-type.prob { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.quest-trigger-type.loop { background: rgba(168, 139, 250, 0.2); color: #a78bfa; }
.quest-trigger-type.favor { background: rgba(244, 114, 182, 0.2); color: #f472b6; }
.quest-trigger-type.item { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }

/* 详情弹窗 */
.quest-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.quest-detail {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.quest-detail h3 {
  color: #ffd700;
  margin: 0 0 8px 0;
  font-size: 18px;
}

.quest-detail .character {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 16px 0;
  font-size: 14px;
}

.prerequisites h4,
.rewards h4 {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0 0 8px 0;
}

.prerequisites ul,
.rewards ul {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}

.prerequisites li,
.rewards li {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
}

.prerequisites li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #ffd700;
}

.rewards li::before {
  content: '★';
  position: absolute;
  left: 0;
  color: #ffd700;
  font-size: 10px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn.primary {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.4);
  color: #ffd700;
}

.btn.primary:hover {
  background: rgba(255, 215, 0, 0.3);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e8e8e8;
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.completed-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
}

/* 动画 */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
