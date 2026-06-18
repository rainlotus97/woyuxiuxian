<template>
  <div class="gameplay-embed">
    <!-- 玩法标题 -->
    <div class="gameplay-header">
      <span class="gameplay-icon">{{ gameplayIcon }}</span>
      <h3 class="gameplay-title">{{ gameplayTitle }}</h3>
    </div>

    <!-- 玩法内容区域 -->
    <div class="gameplay-content">
      <!-- 战斗玩法 -->
      <div v-if="gameplayType === 'battle'" class="gameplay-battle">
        <div class="battle-info">
          <p class="battle-desc">即将进入战斗：{{ targetId }}</p>
          <p class="battle-hint">请准备好后开始战斗</p>
        </div>
        <div class="battle-preview">
          <div class="enemy-slot">
            <span class="enemy-icon">👹</span>
            <span class="enemy-name">{{ targetId }}</span>
          </div>
        </div>
      </div>

      <!-- 收集玩法 -->
      <div v-else-if="gameplayType === 'collect'" class="gameplay-collect">
        <div class="collect-info">
          <p class="collect-desc">需要收集：{{ targetId }}</p>
          <div class="collect-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: collectProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ collectedCount }} / {{ requiredCount }}</span>
          </div>
        </div>
      </div>

      <!-- 对话挑战 -->
      <div v-else-if="gameplayType === 'dialog'" class="gameplay-dialog">
        <div class="dialog-info">
          <p class="dialog-desc">与 {{ targetId }} 进行对话挑战</p>
          <p class="dialog-hint">选择正确的对话选项以获得好感</p>
        </div>
      </div>

      <!-- 升级/突破 -->
      <div v-else-if="gameplayType === 'upgrade'" class="gameplay-upgrade">
        <div class="upgrade-info">
          <p class="upgrade-desc">突破挑战：{{ targetId }}</p>
          <p class="upgrade-hint">完成挑战以提升境界</p>
        </div>
      </div>

      <!-- 探索 -->
      <div v-else-if="gameplayType === 'explore'" class="gameplay-explore">
        <div class="explore-info">
          <p class="explore-desc">探索任务：{{ targetId }}</p>
          <p class="explore-hint">在指定区域进行探索</p>
        </div>
      </div>

      <!-- 解谜 -->
      <div v-else-if="gameplayType === 'puzzle'" class="gameplay-puzzle">
        <div class="puzzle-info">
          <p class="puzzle-desc">解谜挑战：{{ targetId }}</p>
          <p class="puzzle-hint">解开谜题以继续前进</p>
        </div>
      </div>

      <!-- 自定义/通用玩法 -->
      <div v-else class="gameplay-custom">
        <div class="custom-info">
          <p class="custom-desc">特殊事件：{{ targetId }}</p>
          <p class="custom-hint">{{ params?.description || '完成挑战以继续' }}</p>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="gameplay-actions">
      <button class="btn primary" @click="handleStart">
        {{ startButtonText }}
      </button>
      <button v-if="canSkip" class="btn secondary" @click="handleSkip">
        跳过
      </button>
    </div>

    <!-- 结果显示 -->
    <Transition name="fade">
      <div v-if="showResult" class="gameplay-result" :class="resultClass">
        <span class="result-icon">{{ resultIcon }}</span>
        <span class="result-text">{{ resultText }}</span>
        <p v-if="resultDetail" class="result-detail">{{ resultDetail }}</p>
        <div v-if="resultRewards.length > 0" class="result-rewards">
          <span v-for="reward in resultRewards" :key="reward">{{ reward }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { gameplayBridge } from '@/story/gameplayBridge'
import type { GameplayResult } from '@/story/types'

const props = defineProps<{
  gameplayType: string
  targetId: string
  params?: Record<string, unknown>
  canSkip?: boolean
}>()

const emit = defineEmits<{
  complete: [result: GameplayResult]
  skip: []
}>()

// 收集玩法状态
const collectedCount = ref(0)
const requiredCount = computed(() => (props.params?.required as number) || 1)
const collectProgress = computed(() =>
  requiredCount.value > 0 ? (collectedCount.value / requiredCount.value) * 100 : 0
)

// 结果显示
const showResult = ref(false)
const resultSuccess = ref(false)
const lastResult = ref<GameplayResult | null>(null)

// 计算属性
const gameplayIcon = computed(() => {
  const icons: Record<string, string> = {
    battle: '⚔️',
    collect: '📦',
    upgrade: '⬆️',
    explore: '🗺️',
    dialog: '💬',
    puzzle: '🧩',
    custom: '🎮'
  }
  return icons[props.gameplayType] || '🎮'
})

const gameplayTitle = computed(() => {
  const titles: Record<string, string> = {
    battle: '战斗挑战',
    collect: '收集任务',
    upgrade: '突破挑战',
    explore: '探索任务',
    dialog: '对话挑战',
    puzzle: '解谜挑战',
    custom: '特殊事件'
  }
  return titles[props.gameplayType] || '特殊事件'
})

const startButtonText = computed(() => {
  const texts: Record<string, string> = {
    battle: '开始战斗',
    collect: '开始收集',
    upgrade: '开始突破',
    explore: '开始探索',
    dialog: '开始对话',
    puzzle: '开始解谜',
    custom: '开始挑战'
  }
  return texts[props.gameplayType] || '开始'
})

const resultClass = computed(() => resultSuccess.value ? 'success' : 'failure')
const resultIcon = computed(() => resultSuccess.value ? '✓' : '✗')
const resultText = computed(() => {
  const label = lastResult.value?.data?.resultLabel
  if (typeof label === 'string') return label
  return resultSuccess.value ? '成功' : '失败'
})
const resultDetail = computed(() => {
  const text = lastResult.value?.data?.text
  return typeof text === 'string' ? text : ''
})
const resultRewards = computed(() => {
  const rewards = lastResult.value?.data?.rewards
  return Array.isArray(rewards) ? rewards.filter((item): item is string => typeof item === 'string') : []
})

// 方法
async function handleStart() {
  // 模拟玩法执行（实际应由外部处理器完成）
  const result = await gameplayBridge.execute()
  lastResult.value = result
  showResult.value = true
  resultSuccess.value = result.success

  // 短暂显示结果后继续
  setTimeout(() => {
    showResult.value = false
    emit('complete', result)
  }, 1500)
}

function handleSkip() {
  emit('skip')
}

// 监听玩法类型变化
watch(() => props.gameplayType, () => {
  showResult.value = false
  collectedCount.value = 0
  lastResult.value = null
})
</script>

<style scoped>
.gameplay-embed {
  position: relative;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.96), rgba(240, 249, 244, 0.9)),
    radial-gradient(circle at top, rgba(255, 227, 150, 0.18), transparent 62%);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(188, 141, 58, 0.26);
  color: #315257;
  box-shadow: 0 22px 48px rgba(88, 123, 116, 0.18);
  animation: embed-appear 0.3s ease-out;
}

@keyframes embed-appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.gameplay-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(103, 149, 144, 0.16);
}

.gameplay-icon {
  font-size: 32px;
}

.gameplay-title {
  font-size: 20px;
  color: #8b6226;
  margin: 0;
}

.gameplay-content {
  min-height: 120px;
  margin-bottom: 20px;
}

/* 战斗样式 */
.battle-info,
.collect-info,
.dialog-info,
.upgrade-info,
.explore-info,
.puzzle-info,
.custom-info {
  text-align: center;
}

.battle-desc,
.collect-desc,
.dialog-desc,
.upgrade-desc,
.explore-desc,
.puzzle-desc,
.custom-desc {
  color: #315257;
  font-size: 16px;
  margin: 0 0 12px 0;
}

.battle-hint,
.dialog-hint,
.upgrade-hint,
.explore-hint,
.puzzle-hint,
.custom-hint {
  color: rgba(53, 81, 83, 0.72);
  font-size: 14px;
  margin: 0;
}

.battle-preview {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.enemy-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 245, 247, 0.78);
  border: 1px solid rgba(198, 121, 137, 0.22);
  border-radius: 12px;
}

.enemy-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.enemy-name {
  color: #9b4353;
  font-weight: bold;
}

/* 收集进度条 */
.collect-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(103, 149, 144, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8ecfb6 0%, #d4a342 100%);
  transition: width 0.3s ease-out;
}

.progress-text {
  color: rgba(53, 81, 83, 0.78);
  font-size: 14px;
  min-width: 60px;
}

/* 操作按钮 */
.gameplay-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn.primary {
  background: linear-gradient(180deg, #fff3c5, #bfe9d4);
  border: 1px solid rgba(188, 141, 58, 0.32);
  color: #735022;
  font-weight: bold;
}

.btn.primary:hover {
  background: linear-gradient(180deg, #fff0b2, #a9dfc7);
  border-color: rgba(188, 141, 58, 0.48);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(104, 151, 132, 0.16);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(103, 149, 144, 0.18);
  color: #496463;
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.82);
}

/* 结果显示 */
.gameplay-result {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: min(360px, calc(100% - 32px));
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  z-index: 10;
  box-shadow: 0 18px 36px rgba(58, 85, 82, 0.22);
}

.gameplay-result.success {
  background: rgba(238, 252, 247, 0.96);
  border: 1px solid rgba(103, 149, 144, 0.24);
}

.gameplay-result.failure {
  background: rgba(255, 245, 247, 0.96);
  border: 1px solid rgba(198, 121, 137, 0.24);
}

.result-icon {
  font-size: 36px;
  color: #8b6226;
}

.result-text {
  font-size: 20px;
  font-weight: bold;
  color: #315257;
}

.result-detail {
  margin: 0;
  color: rgba(53, 81, 83, 0.76);
  font-size: 12px;
  line-height: 1.6;
}

.result-rewards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.result-rewards span {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 248, 229, 0.86);
  border: 1px solid rgba(194, 146, 66, 0.2);
  color: #8b6226;
  font-size: 10px;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
