<template>
  <Transition name="slide-in">
    <XPanel
      v-if="visible && availableQuests.length > 0"
      class="side-quest-panel"
      tone="gold"
      @click.stop
    >
      <header class="panel-header">
        <span class="panel-title">
          <XIcon icon="mission" size="1.1rem" />
          可触发支线
        </span>
        <span class="panel-actions">
          <span class="quest-count">{{ availableQuests.length }}</span>
          <XButton
            class="panel-close"
            tone="stone"
            size-tone="sm"
            icon-only
            aria-label="关闭支线面板"
            @click="emit('close')"
          >
            <template #icon><XIcon icon="close" size="0.9rem" /></template>
          </XButton>
        </span>
      </header>

      <div class="quest-list">
        <XTaskEntry
          v-for="quest in availableQuests"
          :key="quest.id"
          class="quest-entry"
          :title="quest.name"
          :description="quest.characterName"
          :tag="triggerTypeLabel(quest.triggerType)"
          :icon="resolveQuestIcon(quest.triggerType)"
          :tone="resolveQuestTone(quest.triggerType)"
          :state="quest.isCompleted ? 'done' : 'active'"
          @click="selectQuest(quest)"
        />
      </div>
    </XPanel>
  </Transition>

  <XDialog
    :model-value="Boolean(selectedQuest)"
    :title="selectedQuest?.name ?? '支线详情'"
    :subtitle="selectedQuest ? `角色: ${selectedQuest.characterName}` : ''"
    eyebrow="人物线"
    tone="gold"
    size="sm"
    @update:model-value="handleDialogVisible"
    @close="closeDetail"
  >
    <div v-if="selectedQuest" class="quest-detail">
      <section v-if="selectedQuest.prerequisites.length > 0" class="detail-section">
        <h3>
          <XIcon icon="lock" size="1rem" />
          前置条件
        </h3>
        <div class="prerequisite-list">
          <XTaskEntry
            v-for="(prerequisite, index) in formatPrerequisites()"
            :key="`${selectedQuest.id}-${index}`"
            :title="prerequisite"
            tag="前置"
            icon="lock"
            tone="stone"
            state="done"
            :interactive="false"
          />
        </div>
      </section>

      <XAnnouncement
        v-else
        eyebrow="前置条件"
        title="此线已可触发"
        message="现在就可以接下这段人物因果。"
        icon="spark"
        tone="jade"
      />
    </div>

    <template #footer>
      <XStatChip
        v-if="selectedQuest?.isCompleted"
        label="当前状态"
        value="已完成"
        icon="spark"
        tone="jade"
      />
      <XButton
        v-else-if="selectedQuest"
        tone="gold"
        size-tone="sm"
        @click="triggerQuest(selectedQuest)"
      >
        <template #icon><XIcon icon="mission" size="1rem" /></template>
        触发支线
      </XButton>
      <XButton tone="stone" size-tone="sm" @click="closeDetail">
        <template #icon><XIcon icon="close" size="1rem" /></template>
        关闭
      </XButton>
    </template>
  </XDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { XAnnouncement, XButton, XDialog, XIcon, XPanel, XStatChip, XTaskEntry } from '@rainlotus97/ui'
import type { XIconName, XTone } from '@rainlotus97/ui'
import { useStoryStore } from '@/story/storyStore'
import type { SideQuestInfo } from '@/story/storyStore'
import type { TriggerType } from '@/story/types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  trigger: [questId: string]
  close: []
}>()

const store = useStoryStore()
const selectedQuest = ref<SideQuestInfo | null>(null)

const availableQuests = computed(() => store.availableSideQuests || [])

function triggerTypeLabel(type: TriggerType): string {
  const labels: Record<TriggerType, string> = {
    auto: '自动',
    realm: '境界',
    npc_interaction: '人物',
    encounter: '邂逅',
    sect_join: '入宗',
    choice_flag: '选择'
  }
  return labels[type]
}

function resolveQuestIcon(type: TriggerType): XIconName {
  if (type === 'realm') return 'cultivation'
  if (type === 'npc_interaction') return 'jade'
  if (type === 'encounter') return 'spark'
  if (type === 'sect_join') return 'sect'
  if (type === 'choice_flag') return 'scroll'
  return 'mission'
}

function resolveQuestTone(type: TriggerType): XTone {
  if (type === 'realm' || type === 'choice_flag') return 'gold'
  if (type === 'npc_interaction' || type === 'encounter') return 'rose'
  if (type === 'sect_join') return 'jade'
  return 'stone'
}

function formatPrerequisites(): string[] {
  if (!selectedQuest.value) return []
  return store.formatPrerequisiteSummary(selectedQuest.value.prerequisites)
}

function selectQuest(quest: SideQuestInfo) {
  selectedQuest.value = quest
}

function closeDetail() {
  selectedQuest.value = null
}

function handleDialogVisible(visible: boolean) {
  if (!visible) closeDetail()
}

function triggerQuest(quest: SideQuestInfo) {
  emit('trigger', quest.id)
  closeDetail()
}

watch(() => props.visible, visible => {
  if (!visible) closeDetail()
})
</script>

<style scoped>
.side-quest-panel {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 100;
  width: min(320px, calc(100vw - 32px));
  min-height: 0;
  max-height: min(68vh, 560px);
}

.side-quest-panel :deep(.x-panel__content) {
  min-height: 0;
  padding: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 12px 10px 16px;
  border-bottom: 1px solid rgba(193, 151, 70, 0.2);
  background: rgba(255, 251, 237, 0.76);
}

.panel-title,
.panel-actions {
  display: inline-flex;
  align-items: center;
}

.panel-title {
  gap: 7px;
  min-width: 0;
  color: #8d6427;
  font-size: 14px;
  font-weight: 800;
}

.panel-actions {
  flex: 0 0 auto;
  gap: 7px;
}

.quest-count {
  min-width: 24px;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(226, 182, 83, 0.18);
  color: #9b6e24;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}

.panel-close {
  min-width: 2.7rem;
  width: 2.7rem;
  min-height: 2.7rem;
}

.quest-list {
  display: grid;
  gap: 8px;
  max-height: calc(min(68vh, 560px) - 64px);
  overflow-y: auto;
  padding: 10px;
}

.quest-entry {
  min-width: 0;
}

.quest-entry :deep(.x-task-entry__description) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.quest-detail,
.detail-section,
.prerequisite-list {
  display: grid;
  gap: 10px;
}

.detail-section h3 {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  color: #5d756f;
  font-size: 13px;
}

.prerequisite-list :deep(.x-task-entry) {
  min-height: 4rem;
}

.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(24px);
  opacity: 0;
}

@media (max-width: 640px) {
  .side-quest-panel {
    top: auto;
    right: 12px;
    bottom: 12px;
    width: min(360px, calc(100vw - 24px));
    max-height: min(52vh, 440px);
  }

  .quest-list {
    max-height: calc(min(52vh, 440px) - 64px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .slide-in-enter-active,
  .slide-in-leave-active {
    transition: none;
  }
}
</style>
