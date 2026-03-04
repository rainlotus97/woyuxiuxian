<template>
  <div class="cultivation-view">
    <div class="game-panel">
      <h2 class="panel-title">修炼</h2>
      <p class="panel-desc">打坐修炼，感悟天地灵气</p>

      <div class="cultivation-area">
        <div class="character">
          <div class="avatar" :class="{ 'is-idling': playerStore.isIdling }">
            {{ playerStore.icon }}
          </div>
          <div class="status" :class="{ 'idling': playerStore.isIdling }">
            {{ playerStore.isIdling ? '修炼中...' : '入定中...' }}
          </div>
          <div v-if="playerStore.isIdling" class="idle-indicator">
            <span class="pulse">挂机中</span>
          </div>
        </div>

        <div class="realm-info">
          <span class="realm-name">{{ playerStore.realmInfo.fullName }}</span>
          <span v-if="playerStore.realmLevel === 9" class="realm-max">满层</span>
        </div>

        <div class="progress-section">
          <div class="progress-label">
            <span>修为</span>
            <span>{{ playerStore.cultivation }} / {{ playerStore.maxCultivation }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill cultivation"
              :style="{ width: `${playerStore.cultivationProgress}%` }"></div>
          </div>
        </div>

        <!-- 离线收益提示 -->
        <div v-if="offlineGains > 0" class="offline-gains" @click="claimOfflineGains">
          <span class="gain-icon">🎁</span>
          <span>离线收益: +{{ offlineGains }} 修为</span>
          <span class="tap-hint">点击领取</span>
        </div>
      </div>

      <div class="action-buttons">
        <GameButton @click="toggleIdle" :class="{ 'active': playerStore.isIdling }">
          {{ playerStore.isIdling ? '停止挂机' : '开始挂机' }}
        </GameButton>
        <GameButton @click="handleMeditate" :disabled="playerStore.isIdling">
          打坐修炼
        </GameButton>
        <GameButton
          @click="handleBreakthrough"
          :disabled="!playerStore.canBreakthrough"
          :class="{ 'can-breakthrough': playerStore.canBreakthrough }"
        >
          突破境界
        </GameButton>
      </div>

      <!-- 挂机说明 -->
      <div class="idle-info">
        <p v-if="playerStore.realm === '炼气' && playerStore.realmLevel < 9">
          💡 挂机中每秒自动获得 {{ CULTIVATION_PER_TICK }} 修为，炼气{{ playerStore.realmLevel }}层满后自动升至{{ playerStore.realmLevel + 1 }}层
        </p>
        <p v-else-if="playerStore.realmLevel === 9">
          💡 炼气九层修为满后需要手动突破至筑基
        </p>
        <p v-else>
          💡 挂机中每秒自动获得 {{ CULTIVATION_PER_TICK }} 修为
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useToast } from '@/composables/useToast'
import { useAudio, sfxMeditate, sfxBreakthrough } from '@/composables/useAudio'
import { useModal } from '@/composables/useModal'
import GameButton from '@/components/common/GameButton.vue'

const playerStore = usePlayerStore()
const { success, warning, info } = useToast()
const { startCultivationBgm } = useAudio()
const { showItemAcquire } = useModal()

// 挂机配置
const IDLE_INTERVAL = 1000 // 1秒
const CULTIVATION_PER_TICK = 5 // 每秒修为

// 离线收益
const offlineGains = ref(0)

// 挂机定时器
let idleTimer: number | null = null

onMounted(() => {
  startCultivationBgm()

  // 计算离线收益
  if (playerStore.idleStartTime) {
    offlineGains.value = playerStore.calculateOfflineGains()
  }

  // 如果之前在挂机，恢复挂机
  if (playerStore.isIdling) {
    startIdleLoop()
  }
})

onUnmounted(() => {
  stopIdleLoop()
})

// 领取离线收益
function claimOfflineGains() {
  if (offlineGains.value > 0) {
    playerStore.addCultivation(offlineGains.value)
    success(`获得 ${offlineGains.value} 修为`)
    offlineGains.value = 0
  }
}

// 切换挂机状态
function toggleIdle() {
  if (playerStore.isIdling) {
    stopIdle()
  } else {
    startIdle()
  }
}

// 开始挂机
function startIdle() {
  playerStore.startIdle()
  startIdleLoop()
  info('开始挂机修炼')
}

// 开始挂机循环
function startIdleLoop() {
  idleTimer = window.setInterval(() => {
    // 炼气9层且修为满，停止增长
    if (playerStore.realm === '炼气' && playerStore.realmLevel === 9) {
      if (playerStore.cultivation >= playerStore.maxCultivation) {
        // 停止挂机，等待手动突破
        return
      }
    }

    // 增加修为
    playerStore.addCultivation(CULTIVATION_PER_TICK)
  }, IDLE_INTERVAL)
}

// 停止挂机
function stopIdle() {
  playerStore.stopIdle()
  stopIdleLoop()
  info('停止挂机修炼')
}

// 停止挂机循环
function stopIdleLoop() {
  if (idleTimer) {
    clearInterval(idleTimer)
    idleTimer = null
  }
}

// 手动打坐
function handleMeditate() {
  if (playerStore.isIdling) {
    warning('挂机中无法手动打坐')
    return
  }

  sfxMeditate()

  // 检查是否已满
  if (playerStore.cultivation >= playerStore.maxCultivation) {
    if (playerStore.realm === '炼气' && playerStore.realmLevel === 9) {
      warning('修为已满，请突破境界')
    } else {
      warning('修为已满')
    }
    return
  }

  playerStore.addCultivation(15)
  success('修为 +15')
}

// 突破境界
function handleBreakthrough() {
  if (!playerStore.canBreakthrough) {
    warning('条件不足，无法突破')
    return
  }

  const oldRealm = playerStore.realm
  const nextRealm = playerStore.nextRealm

  if (!nextRealm) {
    warning('已达最高境界')
    return
  }

  sfxBreakthrough()

  if (playerStore.breakthrough()) {
    success(`突破成功！进入${nextRealm}一层`)

    showItemAcquire({
      name: `${nextRealm}境界`,
      quantity: 1,
      quality: 'excellent',
      icon: '境界',
      description: `从${oldRealm}突破至${nextRealm}`
    })
  }
}
</script>

<style scoped>
.cultivation-view {
  padding-bottom: 16px;
}

.panel-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  margin: 0 0 4px 0;
  text-align: center;
}

.panel-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0 0 16px 0;
  text-align: center;
}

.cultivation-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.character {
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(126, 184, 218, 0.2), rgba(126, 184, 218, 0.1));
  border: 2px solid var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 8px;
  transition: all 0.3s ease;
}

.avatar.is-idling {
  border-color: #4ade80;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(74, 222, 128, 0.5);
  }
}

.status {
  font-size: 0.75rem;
  color: var(--color-accent);
}

.status.idling {
  color: #4ade80;
}

.idle-indicator {
  margin-top: 4px;
}

.idle-indicator .pulse {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 4px;
  font-size: 0.625rem;
  color: #4ade80;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.realm-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.realm-name {
  font-size: 1rem;
  color: var(--color-success);
  font-weight: 500;
}

.realm-max {
  font-size: 0.625rem;
  padding: 2px 6px;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 4px;
  color: #f59e0b;
}

.progress-section {
  width: 100%;
  max-width: 280px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 4px;
  color: var(--color-muted);
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.cultivation {
  background: linear-gradient(90deg, #eab308, #facc15);
}

.offline-gains {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.offline-gains:hover {
  background: rgba(245, 158, 11, 0.2);
}

.gain-icon {
  font-size: 1.25rem;
}

.tap-hint {
  font-size: 0.625rem;
  color: var(--color-muted);
  margin-left: auto;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons :deep(.game-button.active) {
  background: linear-gradient(145deg, #166534, #15803d);
  border-color: #22c55e;
}

.action-buttons :deep(.game-button.can-breakthrough) {
  background: linear-gradient(145deg, #854d0e, #a16207);
  border-color: #fbbf24;
  animation: pulse-breakthrough 1.5s ease-in-out infinite;
}

@keyframes pulse-breakthrough {
  0%, 100% {
    box-shadow: 0 0 5px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(251, 191, 36, 0.5);
  }
}

.idle-info {
  margin-top: 16px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.idle-info p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-muted);
  text-align: center;
}
</style>
