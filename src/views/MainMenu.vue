<template>
  <div class="main-menu">
    <div class="menu-content">
      <h1 class="game-title">我欲修仙</h1>
      <p class="game-subtitle">大道三千，只取一瓢</p>

      <div class="menu-buttons">
        <GameButton @click="handleStart">开始修仙</GameButton>
        <GameButton @click="handleContinue">继续修炼</GameButton>
        <GameButton @click="handleSettings">设置</GameButton>
      </div>

      <p class="version">v1.0.0</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import GameButton from '@/components/common/GameButton.vue'

const router = useRouter()
const { info } = useToast()

const handleStart = () => {
  info('踏入修仙之道...')
  void router.push('/game')
}

const handleContinue = () => {
  info('暂无存档')
}

const handleSettings = () => {
  info('设置功能开发中')
}
</script>

<style scoped>
.main-menu {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.menu-content {
  text-align: center;
}

.game-title {
  font-size: 2.5rem;
  color: var(--color-accent-warm);
  margin: 0 0 8px 0;
  text-shadow: 0 0 20px rgba(200, 164, 92, 0.5);
}

.game-subtitle {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin: 0 0 32px 0;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.version {
  margin-top: 32px;
  font-size: 0.75rem;
  color: var(--color-muted);
}
</style>
