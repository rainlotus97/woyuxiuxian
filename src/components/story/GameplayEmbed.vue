<template>
  <XPanel
    class="gameplay-embed"
    :class="[`type-${gameplayType}`, { resolved: showResult }]"
    :tone="panelTone"
  >
    <div class="gameplay-atmosphere" aria-hidden="true"></div>

    <header class="gameplay-head">
      <div class="gameplay-head-copy">
        <small>{{ toneLabel }}</small>
        <strong>{{ gameplayTitle }}</strong>
        <p>{{ headline }}</p>
      </div>
      <span class="gameplay-seal" aria-hidden="true">
        <XIcon :icon="gameplayIcon" size="1.4rem" />
      </span>
    </header>

    <div class="gameplay-body">
      <XCard class="gameplay-summary-card" :tone="panelTone">
        <template #title>
          <span class="summary-kicker">{{ targetLabel }}</span>
        </template>
        <strong>{{ targetHeadline }}</strong>
        <p>{{ detailText }}</p>
      </XCard>

      <div class="gameplay-intent-grid">
        <XStatChip
          v-for="(item, index) in intentItems"
          :key="item.label"
          class="intent-card"
          :label="item.label"
          :value="item.value"
          :icon="resolveIntentIcon(index)"
          :tone="resolveIntentTone(index)"
        />
      </div>

      <div class="gameplay-rail" aria-hidden="true">
        <span class="rail-node active">剧情推进</span>
        <span class="rail-line"></span>
        <span class="rail-node">事件落地</span>
        <span class="rail-line"></span>
        <span class="rail-node">后续回响</span>
      </div>
    </div>

    <footer class="gameplay-actions">
      <XButton :tone="panelTone" :disabled="isRunning" size-tone="sm" @click="handleStart">
        <template #icon><XIcon :icon="gameplayIcon" size="1rem" /></template>
        {{ startButtonText }}
      </XButton>
      <XButton v-if="canSkip" tone="stone" :disabled="isRunning" size-tone="sm" @click="handleSkip">
        <template #icon><XIcon icon="chevron-right" size="1rem" /></template>
        先略过
      </XButton>
    </footer>

    <Transition name="fade">
      <XAnnouncement
        v-if="showResult"
        class="gameplay-result"
        :class="resultClass"
        :eyebrow="resultSuccess ? '已应下' : '出了岔子'"
        :title="resultText"
        :message="resultDetail"
        :icon="resultSuccess ? 'spark' : 'armor'"
        :tone="resultSuccess ? 'jade' : 'rose'"
      >
        <template v-if="resultRewards.length > 0" #action>
          <div class="result-rewards">
            <span v-for="reward in resultRewards" :key="reward">{{ reward }}</span>
          </div>
        </template>
      </XAnnouncement>
    </Transition>
  </XPanel>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { XAnnouncement, XButton, XCard, XIcon, XPanel, XStatChip } from '@xianxia/ui'
import type { XIconName, XTone } from '@xianxia/ui'
import { gameplayBridge } from '@/story/gameplayBridge'
import type { GameplayResult, GameplayTrigger, GameplayType } from '@/story/types'

const props = defineProps<{
  trigger?: GameplayTrigger
  gameplayType: GameplayType
  targetId: string
  params?: Record<string, unknown>
  canSkip?: boolean
}>()

const emit = defineEmits<{
  complete: [result: GameplayResult]
  skip: []
}>()

const showResult = ref(false)
const resultSuccess = ref(false)
const lastResult = ref<GameplayResult | null>(null)
const isRunning = ref(false)
let resultTimer: number | null = null

const panelTone = computed<'gold' | 'rose'>(() => (
  props.gameplayType === 'battle' ? 'rose' : 'gold'
))

const targetLabel = computed(() => {
  const labels: Record<string, string> = {
    battle: '即将交锋',
    collect: '接下来要找',
    dialog: '接下来要应对',
    upgrade: '接下来要突破',
    explore: '接下来要踏入',
    puzzle: '接下来要解开'
  }
  return labels[props.gameplayType] ?? '接下来会发生'
})

const gameplayTitle = computed(() => {
  const titles: Record<string, string> = {
    battle: '杀机已经压到眼前',
    collect: '线索还得自己拾起来',
    upgrade: '这一步必须硬顶过去',
    explore: '路已经摆在前头',
    dialog: '这一回得正面接话',
    puzzle: '眼前这层机关得拆开'
  }
  return titles[props.gameplayType] ?? '这件事得落地'
})

const toneLabel = computed(() => {
  const labels: Record<string, string> = {
    battle: '前情未断',
    collect: '线索牵引',
    upgrade: '关口已至',
    explore: '行路在前',
    dialog: '人物开口',
    puzzle: '暗扣显形'
  }
  return labels[props.gameplayType] ?? '事件续接'
})

const gameplayIcon = computed<XIconName>(() => {
  const icons: Record<string, XIconName> = {
    battle: 'sword',
    collect: 'backpack',
    upgrade: 'cultivation',
    explore: 'map',
    dialog: 'scroll',
    puzzle: 'settings'
  }
  return icons[props.gameplayType] ?? 'mission'
})

const headline = computed(() => {
  const text = summarizeNarrative(
    asString(props.params?.description) || asString(props.params?.hint)
  )
  if (text) return text
  if (props.gameplayType === 'battle') return '先把这一口冲撞接住，后面的剧情才会继续往下压。'
  if (props.gameplayType === 'dialog') return '这不是单独的小游戏，而是眼前这段人物关系真正开始生效。'
  return '这是剧情里的一次落点，做完才会接回后面的风声。'
})

const targetHeadline = computed(() => {
  return props.targetId?.trim() || '这一口未明之事'
})

const detailText = computed(() => {
  if (props.gameplayType === 'battle') {
    return '这场冲突不是额外插进来的，它会决定这一截故事接下来往哪边偏。'
  }
  const text = summarizeNarrative(
    asString(props.params?.detail) || asString(props.params?.description)
  )
  return text || '先把眼前这件事处理完，剧情自然会接着往下走。'
})

const startButtonText = computed(() => {
  const texts: Record<string, string> = {
    battle: '接战',
    collect: '去处理',
    upgrade: '去突破',
    explore: '继续上路',
    dialog: '应下这句话',
    puzzle: '拆开这层局'
  }
  return texts[props.gameplayType] ?? '继续'
})

const intentItems = computed(() => {
  const defaults = [
    {
      label: '事件类型',
      value: resolveTypeLabel(props.gameplayType)
    },
    {
      label: '推进方式',
      value: resolveApproachLabel(props.gameplayType)
    },
    {
      label: '后续影响',
      value: resolveImpactLabel(props.gameplayType)
    }
  ]

  const source = Array.isArray(props.params?.previewItems)
    ? props.params?.previewItems
    : null

  if (!source) return defaults

  const custom = source
    .map(item => normalizePreviewItem(item))
    .filter((item): item is { label: string; value: string } => Boolean(item))

  return custom.length > 0 ? custom.slice(0, 3) : defaults
})

const resultClass = computed(() => (resultSuccess.value ? 'success' : 'failure'))
const resultText = computed(() => {
  const label = lastResult.value?.data?.resultLabel
  if (typeof label === 'string' && label.trim()) return label
  return resultSuccess.value ? '这一截接住了' : '这一截没完全压稳'
})
const resultDetail = computed(() => {
  const text = lastResult.value?.data?.text
  return typeof text === 'string' ? text : ''
})
const resultRewards = computed(() => {
  const rewards = lastResult.value?.data?.rewards
  return Array.isArray(rewards) ? rewards.filter((item): item is string => typeof item === 'string') : []
})

async function handleStart() {
  if (isRunning.value) return
  isRunning.value = true

  const trigger = props.trigger
    ? cloneGameplayTrigger(props.trigger)
    : {
        type: props.gameplayType,
        targetId: props.targetId,
        params: props.params
      }

  try {
    const result = await gameplayBridge.execute(trigger)
    presentResult(result)
  } catch {
    const result: GameplayResult = {
      success: false,
      gameplayType: props.gameplayType,
      targetId: props.targetId,
      data: {
        resultLabel: '这一截没接住',
        text: '眼前的事暂时没能落定，稍后再试。'
      }
    }
    presentResult(result)
  }
}

function presentResult(result: GameplayResult) {
  lastResult.value = result
  resultSuccess.value = result.success
  showResult.value = true

  if (resultTimer !== null) window.clearTimeout(resultTimer)
  resultTimer = window.setTimeout(() => {
    showResult.value = false
    isRunning.value = false
    resultTimer = null
    if (result.success) emit('complete', result)
  }, 1300)
}

function handleSkip() {
  emit('skip')
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function cloneGameplayTrigger(trigger: GameplayTrigger): GameplayTrigger {
  return {
    ...trigger,
    params: trigger.params ? { ...trigger.params } : undefined,
    context: trigger.context ? { ...trigger.context } : undefined,
    outcomeNodeIds: trigger.outcomeNodeIds ? { ...trigger.outcomeNodeIds } : undefined,
    completionCondition: trigger.completionCondition?.map(condition => ({ ...condition }))
  }
}

function resolveIntentIcon(index: number): XIconName {
  return (['mission', 'chevron-right', 'spark'] as const)[index] ?? 'mission'
}

function resolveIntentTone(index: number): XTone {
  return (['stone', 'jade', 'gold'] as const)[index] ?? 'stone'
}

function normalizePreviewItem(item: unknown) {
  if (!item || typeof item !== 'object') return null
  const record = item as Record<string, unknown>
  const label = asString(record.label)
  const value = asString(record.value)
  if (!label || !value) return null
  return { label, value }
}

function summarizeNarrative(text: string, maxLength = 42) {
  const cleaned = text.replace(/\s+/g, '').trim()
  if (!cleaned) return ''

  const firstSentence = cleaned.split(/(?<=[。！？!?])/u).find(Boolean)?.trim() ?? cleaned
  const compact = firstSentence.replace(/[。！？!?]+$/u, '')
  if (!compact) return ''
  if (compact.length <= maxLength) return `${compact}。`

  const clauses = compact.split(/[，、；：]/u).map(item => item.trim()).filter(Boolean)
  const firstClause = clauses[0] ?? compact
  if (firstClause.length <= maxLength - 1) return `${firstClause}。`
  return `${firstClause.slice(0, maxLength - 1)}…`
}

function resolveTypeLabel(type: string) {
  const labels: Record<string, string> = {
    battle: '正面冲突',
    collect: '搜寻取物',
    upgrade: '境界关口',
    explore: '地图推进',
    dialog: '人物应对',
    puzzle: '机关判断'
  }
  return labels[type] ?? '特殊事件'
}

function resolveApproachLabel(type: string) {
  const labels: Record<string, string> = {
    battle: '先应敌',
    collect: '先收束线索',
    upgrade: '先稳气机',
    explore: '先看前路',
    dialog: '先接话锋',
    puzzle: '先找破口'
  }
  return labels[type] ?? '顺势处理'
}

function resolveImpactLabel(type: string) {
  const labels: Record<string, string> = {
    battle: '会改写后续态势',
    collect: '会补全后续信息',
    upgrade: '会打开后续节点',
    explore: '会牵出新地点',
    dialog: '会记入人物关系',
    puzzle: '会放出后续变化'
  }
  return labels[type] ?? '会留在后续记录里'
}

watch(() => props.gameplayType, () => {
  if (resultTimer !== null) window.clearTimeout(resultTimer)
  resultTimer = null
  showResult.value = false
  lastResult.value = null
  isRunning.value = false
})

onBeforeUnmount(() => {
  if (resultTimer !== null) window.clearTimeout(resultTimer)
})
</script>

<style scoped>
.gameplay-embed {
  position: relative;
  width: 100%;
  min-height: 0;
  border-radius: 26px;
  overflow: hidden;
  isolation: isolate;
}

.gameplay-embed :deep(.x-panel__content) {
  display: grid;
  gap: 16px;
  padding: 18px 16px 16px;
}

.gameplay-atmosphere {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 14% 14%, rgba(110, 153, 137, 0.08), transparent 22%),
    radial-gradient(circle at 82% 16%, rgba(227, 189, 112, 0.12), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(227, 236, 232, 0.2));
}

.gameplay-head,
.gameplay-body,
.gameplay-actions {
  position: relative;
  z-index: 1;
}

.gameplay-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.gameplay-head-copy {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.gameplay-head-copy small {
  color: rgba(134, 95, 38, 0.78);
  font-size: 9px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.gameplay-head-copy strong {
  color: #7a4f1d;
  font-size: 20px;
  line-height: 1.08;
}

.gameplay-head-copy p {
  margin: 0;
  color: rgba(55, 79, 75, 0.78);
  font-size: 12px;
  line-height: 1.7;
  text-wrap: pretty;
}

.gameplay-seal {
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: rgba(255, 247, 230, 0.92);
  border: 1px solid rgba(181, 145, 82, 0.16);
  color: #8d6029;
  font-size: 18px;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(41, 57, 54, 0.08);
}

.gameplay-body {
  display: grid;
  gap: 12px;
}

.gameplay-summary-card {
  min-height: 0;
  border-radius: 18px;
}

.gameplay-summary-card :deep(.x-card__content) {
  gap: 5px;
  min-height: 0;
  padding: 14px 14px 15px;
}

.gameplay-summary-card :deep(.x-card__title) {
  font-family: inherit;
  letter-spacing: 0;
}

.summary-kicker {
  color: rgba(128, 91, 36, 0.72);
  font-size: 10px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.gameplay-summary-card strong {
  color: #2f4742;
  font-size: 17px;
  line-height: 1.24;
}

.gameplay-summary-card p {
  margin: 0;
  color: rgba(59, 81, 78, 0.82);
  font-size: 12px;
  line-height: 1.72;
}

.gameplay-intent-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.intent-card {
  width: 100%;
  min-width: 0;
}

.intent-card :deep(.x-stat-chip__copy) {
  overflow: hidden;
}

.intent-card :deep(.x-stat-chip__copy strong) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gameplay-rail {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(92, 118, 112, 0.62);
  font-size: 9px;
  line-height: 1.2;
}

.rail-node {
  flex: none;
}

.rail-node.active {
  color: #9d6a2d;
}

.rail-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(175, 139, 79, 0.4), rgba(132, 166, 153, 0.18));
}

.gameplay-actions {
  display: flex;
  gap: 10px;
}

.gameplay-actions :deep(.x-button) {
  flex: 1;
  min-width: 0;
}

.gameplay-result {
  position: absolute;
  inset: auto 16px 16px;
  z-index: 3;
  box-shadow: 0 16px 30px rgba(28, 43, 41, 0.18);
  backdrop-filter: blur(8px);
}

.gameplay-result :deep(.x-announcement__copy) {
  min-width: 0;
}

.gameplay-result :deep(.x-announcement__actions) {
  max-width: 12rem;
}

.result-rewards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.result-rewards span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(255, 248, 230, 0.92);
  color: #8a6127;
  font-size: 10px;
  border: 1px solid rgba(187, 147, 78, 0.16);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 560px) {
  .gameplay-embed {
    border-radius: 22px;
  }

  .gameplay-embed :deep(.x-panel__content) {
    gap: 14px;
    padding: 15px 13px 13px;
  }

  .gameplay-head-copy strong {
    font-size: 18px;
  }

  .gameplay-head-copy p,
  .gameplay-summary-card p {
    font-size: 11.5px;
  }

  .gameplay-summary-card strong {
    font-size: 15px;
  }

  .gameplay-intent-grid {
    grid-template-columns: 1fr;
  }

  .gameplay-actions {
    flex-direction: column;
  }

  .gameplay-result {
    inset-inline: 13px;
  }

  .gameplay-result :deep(.x-announcement__actions) {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
</style>
