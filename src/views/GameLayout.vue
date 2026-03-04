<template>
  <div class="game-layout">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="player-info">
        <span class="realm">{{ playerStore.realmInfo.fullName }}</span>
        <span class="name">{{ playerStore.name }}</span>
      </div>
      <div class="resources">
        <span>灵石: {{ playerStore.gold }}</span>
        <span>修为: {{ playerStore.cultivation }}/{{ playerStore.maxCultivation }}</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <RouterView />
    </div>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <RouterLink to="/game/cultivation" class="nav-item">修炼</RouterLink>
      <RouterLink to="/game/adventure" class="nav-item">历险</RouterLink>
      <RouterLink to="/game/inventory" class="nav-item">背包</RouterLink>
      <RouterLink to="/game/skills" class="nav-item">功法</RouterLink>
      <RouterLink to="/game/shop" class="nav-item">坊市</RouterLink>
      <RouterLink to="/game/profile" class="nav-item">角色</RouterLink>
      <RouterLink to="/game/settings" class="nav-item">设置</RouterLink>
    </nav>

    <!-- 模态框 -->
    <AnnouncementModal />
    <ItemAcquireModal />
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import AnnouncementModal from '@/components/modal/AnnouncementModal.vue'
import ItemAcquireModal from '@/components/modal/ItemAcquireModal.vue'

const playerStore = usePlayerStore()
</script>

<style scoped>
.game-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: linear-gradient(145deg, rgb(35 38 52) 0%, rgba(30, 32, 48, 0.95) 100%);
  border-bottom: 1px solid rgba(200, 164, 92, 0.2);
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.player-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.realm {
  color: var(--color-success);
}

.name {
  color: rgb(232 228 217);
}

.resources {
  display: flex;
  gap: 12px;
  color: var(--color-accent);
}

.main-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  /* 留出底部固定导航栏的空间 */
  padding-bottom: calc(56px + 8px + env(safe-area-inset-bottom, 0px) + 12px);
}

.bottom-nav {
  background: linear-gradient(180deg, rgba(25, 28, 40, 0.98) 0%, rgba(20, 22, 35, 0.99) 100%);
  border-top: 1px solid rgba(126, 184, 218, 0.15);
  padding: 6px 8px;
  /* iOS 安全区域适配 */
  padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 1000px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.nav-item {
  color: rgba(156, 163, 175, 0.7);
  text-decoration: none;
  font-size: 0.6875rem;
  padding: 8px 6px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 24px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
  transition: transform 0.2s ease;
}

.nav-item:hover {
  color: rgba(232, 228, 217, 0.8);
}

.nav-item.router-link-active {
  color: var(--color-accent);
  background: rgba(126, 184, 218, 0.08);
}

.nav-item.router-link-active::before {
  transform: translateX(-50%) scaleX(1);
}
</style>
