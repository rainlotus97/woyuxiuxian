<template>
  <div class="game-layout">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="player-info">
        <span class="realm">炼气三层</span>
        <span class="name">无名修士</span>
      </div>
      <div class="resources">
        <span>灵石: 100</span>
        <span>修为: 0/100</span>
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
      <RouterLink to="/game/settings" class="nav-item">设置</RouterLink>
    </nav>

    <!-- 模态框 -->
    <AnnouncementModal />
    <ItemAcquireModal />
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import AnnouncementModal from '@/components/modal/AnnouncementModal.vue'
import ItemAcquireModal from '@/components/modal/ItemAcquireModal.vue'
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
  background: linear-gradient(145deg, rgb(35 38 52) 0%, rgba(30, 32, 48, 0.95) 100%);
  border-top: 1px solid rgba(200, 164, 92, 0.2);
  padding: 8px 4px;
  /* iOS 安全区域适配 */
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
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
}

.nav-item {
  color: var(--color-muted);
  text-decoration: none;
  font-size: 0.75rem;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.nav-item:hover {
  color: rgb(232 228 217);
}

.nav-item.router-link-active {
  color: var(--color-accent);
  background: rgba(126, 184, 218, 0.1);
}
</style>
