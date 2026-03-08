<template>
  <div class="game-layout">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="player-info">
        <span class="realm" :class="getRealmClass">{{ playerStore.realmInfo.fullName }}</span>
        <span class="name">{{ playerStore.name }}</span>
      </div>
      <div class="resources">
        <div class="resource-item">
          <span class="resource-icon">💎</span>
          <span class="resource-value">{{ playerStore.gold }}</span>
        </div>
        <div class="resource-item">
          <span class="resource-icon">✨</span>
          <span class="resource-value">{{ formatCultivation }}</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'menu-open': isMenuExpanded }">
      <RouterView />
    </div>

    <!-- 底部导航 -->
    <nav class="bottom-nav" :class="{ expanded: isMenuExpanded }">
      <!-- 主菜单按钮 -->
      <div class="menu-toggle" @click="toggleMenu">
        <div class="toggle-icon" :class="{ active: isMenuExpanded }">
          <span class="toggle-line"></span>
          <span class="toggle-line"></span>
          <span class="toggle-line"></span>
        </div>
        <span class="toggle-label">{{ isMenuExpanded ? '收起' : '菜单' }}</span>
      </div>

      <!-- 菜单内容区 -->
      <div v-if="isMenuExpanded" class="menu-items">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
          @click="handleMenuClick"
        >
          <div class="item-icon">{{ item.icon }}</div>
          <div class="item-content">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-desc">{{ item.desc }}</span>
          </div>
        </RouterLink>
      </div>

      <!-- 快捷入口（收起时显示） -->
      <div v-if="!isMenuExpanded" class="quick-access">
        <RouterLink
          v-for="item in quickAccessItems"
          :key="item.path"
          :to="item.path"
          class="quick-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="quick-icon">{{ item.icon }}</span>
          <span class="quick-label">{{ item.shortName }}</span>
        </RouterLink>
      </div>
    </nav>

    <!-- 模态框 -->
    <AnnouncementModal />
    <ItemAcquireModal />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import AnnouncementModal from '@/components/modal/AnnouncementModal.vue'
import ItemAcquireModal from '@/components/modal/ItemAcquireModal.vue'

const playerStore = usePlayerStore()
const route = useRoute()

const isMenuExpanded = ref(false)

// 菜单项配置
const menuItems = [
  { path: '/game/cultivation', name: '修炼', shortName: '修炼', desc: '闭关修炼，提升境界', icon: '🧘' },
  { path: '/game/story', name: '故事', shortName: '故事', desc: '体验剧情故事', icon: '📖' },
  { path: '/game/adventure', name: '历险', shortName: '历险', desc: '探索世界、历练战斗', icon: '⚔️' },
  { path: '/game/map', name: '地图', shortName: '地图', desc: '探索四大界域', icon: '🗺️' },
  { path: '/game/sect', name: '宗门', shortName: '宗门', desc: '加入宗门修行', icon: '🏛️' },
  { path: '/game/companion', name: '伙伴', shortName: '伙伴', desc: '招募培养伙伴', icon: '👥' },
  { path: '/game/skills', name: '功法', shortName: '功法', desc: '学习功法技能', icon: '📜' },
  { path: '/game/inventory', name: '背包', shortName: '背包', desc: '管理物品装备', icon: '🎒' },
  { path: '/game/shop', name: '坊市', shortName: '坊市', desc: '购买所需物品', icon: '🏪' },
  { path: '/game/profile', name: '角色', shortName: '角色', desc: '查看角色属性', icon: '👤' },
  { path: '/game/settings', name: '设置', shortName: '设置', desc: '游戏设置选项', icon: '⚙️' }
]

// 快捷入口（底部常驻显示的3个）
interface MenuItem {
  path: string
  name: string
  shortName: string
  desc: string
  icon: string
}

const quickAccessItems = computed<MenuItem[]>(() => {
  const currentPath = route.path
  const firstItem = menuItems[0]!
  const items: MenuItem[] = [firstItem]

  const currentItem = menuItems.find(item => item.path === currentPath)
  if (currentItem && currentItem.path !== '/game/cultivation') {
    items.push(currentItem)
  }

  while (items.length < 3) {
    const defaultItem = menuItems.find(item => !items.some(i => i.path === item.path))
    if (defaultItem) {
      items.push(defaultItem)
    } else {
      break
    }
  }

  return items.slice(0, 3)
})

// 境界样式
const getRealmClass = computed(() => {
  const realm = playerStore.realm
  const classMap: Record<string, string> = {
    '炼气': 'realm-qi',
    '筑基': 'realm-foundation',
    '金丹': 'realm-golden',
    '元婴': 'realm-infant',
    '化神': 'realm-god',
    '渡劫': 'realm-tribulation',
    '大乘': 'realm-mahayana',
    '仙人': 'realm-immortal'
  }
  for (const [key, value] of Object.entries(classMap)) {
    if (realm.includes(key)) return value
  }
  return ''
})

// 修为格式化
const formatCultivation = computed(() => {
  const cur = playerStore.cultivation
  const max = playerStore.maxCultivation
  if (max >= 10000) {
    return `${(cur / 1000).toFixed(1)}k/${(max / 1000).toFixed(0)}k`
  }
  return `${cur}/${max}`
})

function isActive(path: string): boolean {
  return route.path === path
}

function toggleMenu() {
  isMenuExpanded.value = !isMenuExpanded.value
}

function handleMenuClick() {
  isMenuExpanded.value = false
}
</script>

<style scoped>
.game-layout {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overscroll-behavior: none;
}

/* ��部状态栏 */
.status-bar {
  background: linear-gradient(145deg, rgb(35 38 52) 0%, rgba(30, 32, 48, 0.95) 100%);
  border-bottom: 1px solid rgba(200, 164, 92, 0.2);
  padding: 10px 16px;
  padding-left: max(16px, calc(16px + env(safe-area-inset-left, 0px)));
  padding-right: max(16px, calc(16px + env(safe-area-inset-right, 0px)));
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.player-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.realm {
  font-weight: 600;
  font-size: 0.875rem;
}

.realm-qi { color: #7eb8da; text-shadow: 0 0 8px rgba(126, 184, 218, 0.5); }
.realm-foundation { color: #4ade80; text-shadow: 0 0 8px rgba(74, 222, 128, 0.5); }
.realm-golden { color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.6); }
.realm-infant { color: #a78bfa; text-shadow: 0 0 12px rgba(167, 139, 250, 0.6); }
.realm-god { color: #f472b6; text-shadow: 0 0 12px rgba(244, 114, 182, 0.6); }
.realm-tribulation { color: #67e8f9; text-shadow: 0 0 14px rgba(103, 232, 249, 0.6); }
.realm-mahayana { color: #fcd34d; text-shadow: 0 0 16px rgba(252, 211, 77, 0.7); }
.realm-immortal { color: #fef08a; text-shadow: 0 0 20px rgba(254, 240, 138, 0.8); }

.name {
  color: rgb(232 228 217);
  font-size: 0.875rem;
}

.resources {
  display: flex;
  gap: 16px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.resource-icon {
  font-size: 0.875rem;
}

.resource-value {
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 500;
}

/* 主内容区 */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  padding-left: calc(12px + env(safe-area-inset-left));
  padding-right: calc(12px + env(safe-area-inset-right));
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* 隐藏滚动条 */
.main-content::-webkit-scrollbar {
  display: none;
}
.main-content {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 底部导航 */
.bottom-nav {
  background: linear-gradient(180deg, rgba(35, 38, 52, 0.98) 0%, rgb(20 22 30) 100%);
  border-top: 1px solid rgba(200, 164, 92, 0.15);
  padding: 8px 12px;
  /* 底部padding = 基础8px + 安全区域（iPhone上有34px，普通浏览器为0） */
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  padding-left: calc(12px + env(safe-area-inset-left, 0px));
  padding-right: calc(12px + env(safe-area-inset-right, 0px));
  flex-shrink: 0;
}

/* 菜单切换按钮 */
.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(200, 164, 92, 0.1);
  border: 1px solid rgba(200, 164, 92, 0.3);
  border-radius: 20px;
  cursor: pointer;
  margin: 0 auto;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.menu-toggle:active {
  transform: scale(0.98);
  background: rgba(200, 164, 92, 0.15);
}

.toggle-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 18px;
}

.toggle-line {
  width: 100%;
  height: 2px;
  background: var(--color-accent-warm);
  border-radius: 1px;
  transition: all 0.25s ease;
}

.toggle-icon.active .toggle-line:nth-child(1) {
  transform: rotate(45deg) translate(4px, 4px);
}

.toggle-icon.active .toggle-line:nth-child(2) {
  opacity: 0;
}

.toggle-icon.active .toggle-line:nth-child(3) {
  transform: rotate(-45deg) translate(4px, -4px);
}

.toggle-label {
  color: var(--color-accent-warm);
  font-size: 0.8125rem;
  font-weight: 500;
}

/* 展开的菜单项 */
.menu-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 0;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.15);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(126, 184, 218, 0.1);
  border-color: rgba(126, 184, 218, 0.3);
}

.menu-item:active {
  transform: scale(0.98);
}

.menu-item.active {
  background: rgba(200, 164, 92, 0.15);
  border-color: rgba(200, 164, 92, 0.4);
}

.item-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(126, 184, 218, 0.1);
  border-radius: 10px;
}

.menu-item.active .item-icon {
  background: rgba(200, 164, 92, 0.2);
}

.item-content {
  text-align: center;
}

.item-name {
  display: block;
  font-size: 0.8125rem;
  color: rgb(232 228 217);
  font-weight: 500;
}

.item-desc {
  display: block;
  font-size: 0.625rem;
  color: var(--color-muted);
  margin-top: 2px;
}

/* 快捷入口 */
.quick-access {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.quick-item:active {
  transform: scale(0.95);
}

.quick-icon {
  font-size: 1.375rem;
}

.quick-label {
  font-size: 0.75rem;
  color: var(--color-muted);
  line-height: 1.2;
}

.quick-item.active .quick-label {
  color: var(--color-accent-warm);
}

/* 小屏幕适配 */
@media (max-width: 360px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-bar {
    padding: 8px 12px;
  }

  .resources {
    gap: 10px;
  }

  .realm, .name, .resource-value {
    font-size: 0.75rem;
  }
}

/* 平板和桌面端适配 */
@media (min-width: 768px) {
  .game-layout {
    max-width: 800px;
    margin: 0 auto;
  }

  .status-bar {
    padding: 12px 20px;
    padding-top: max(14px, calc(12px + env(safe-area-inset-top)));
    padding-left: max(20px, calc(20px + env(safe-area-inset-left)));
    padding-right: max(20px, calc(20px + env(safe-area-inset-right)));
  }

  .main-content {
    padding: 16px;
    padding-left: max(16px, calc(16px + env(safe-area-inset-left)));
    padding-right: max(16px, calc(16px + env(safe-area-inset-right)));
  }

  .bottom-nav {
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    padding-left: max(20px, calc(20px + env(safe-area-inset-left, 0px)));
    padding-right: max(20px, calc(20px + env(safe-area-inset-right, 0px)));
  }

  .menu-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 500px;
    margin: 0 auto;
  }

  .menu-item {
    padding: 14px 10px;
  }

  .item-icon {
    width: 48px;
    height: 48px;
    font-size: 1.75rem;
  }

  .quick-item {
    padding: 8px 24px;
  }
}

/* 桌面端 */
@media (min-width: 1024px) {
  .game-layout {
    max-width: 900px;
  }

  .status-bar {
    padding: 14px 24px;
    padding-top: max(16px, calc(14px + env(safe-area-inset-top, 0px)));
    padding-left: max(24px, calc(24px + env(safe-area-inset-left, 0px)));
    padding-right: max(24px, calc(24px + env(safe-area-inset-right, 0px)));
  }

  .bottom-nav {
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    padding-left: max(24px, calc(24px + env(safe-area-inset-left, 0px)));
    padding-right: max(24px, calc(24px + env(safe-area-inset-right, 0px)));
  }

  .realm {
    font-size: 1rem;
  }

  .name {
    font-size: 1rem;
  }

  .resource-icon {
    font-size: 1rem;
  }

  .resource-value {
    font-size: 1rem;
  }

  .main-content {
    padding: 20px;
    padding-left: max(20px, calc(20px + env(safe-area-inset-left)));
    padding-right: max(20px, calc(20px + env(safe-area-inset-right)));
  }
}

/* 横屏手机 - 紧凑布局 */
@media (max-height: 500px) and (orientation: landscape) {
  /* 状态栏紧凑 */
  .status-bar {
    padding: 4px 12px;
    padding-left: max(16px, calc(12px + env(safe-area-inset-left, 0px)));
    padding-right: max(16px, calc(12px + env(safe-area-inset-right, 0px)));
  }

  .realm, .name {
    font-size: 0.75rem;
  }

  .resources {
    gap: 12px;
  }

  .resource-icon, .resource-value {
    font-size: 0.75rem;
  }

  /* 主内容区紧凑 */
  .main-content {
    padding: 6px 8px;
    padding-left: max(16px, calc(8px + env(safe-area-inset-left, 0px)));
    padding-right: max(16px, calc(8px + env(safe-area-inset-right, 0px)));
  }

  /* 底部导航紧凑 */
  .bottom-nav {
    padding: 4px 12px;
    padding-bottom: calc(4px + env(safe-area-inset-bottom, 0px));
    padding-left: calc(12px + env(safe-area-inset-left, 0px));
    padding-right: calc(12px + env(safe-area-inset-right, 0px));
  }

  .menu-toggle {
    padding: 4px 12px;
  }

  .toggle-label {
    font-size: 0.625rem;
  }

  /* 菜单项 - 竖着的2列布局 */
  .menu-items {
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
    padding-top: 4px;
  }

  .menu-item {
    padding: 4px;
    gap: 2px;
  }

  .item-icon {
    width: 24px;
    height: 24px;
    font-size: 0.875rem;
  }

  .item-name {
    font-size: 0.5rem;
  }

  .item-desc {
    display: none;
  }

  .quick-access {
    flex-direction: row;
    justify-content: space-around;
    gap: 4px;
    padding-top: 4px;
    align-items: center;
  }

  .quick-item {
    padding: 4px 8px;
  }

  .quick-icon {
    font-size: 0.875rem;
  }

  .quick-label {
    font-size: 0.5625rem;
  }
}
</style>
