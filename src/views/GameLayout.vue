<template>
  <div class="game-layout">
    <div class="layout-backdrop">
      <div class="mist mist-a"></div>
      <div class="mist mist-b"></div>
      <div class="mist mist-c"></div>
    </div>

    <header class="top-shell">
      <GameSurface class="status-shell" tone="mist" padding="md">
        <div class="status-row">
          <div class="player-block">
            <div class="avatar-orb">{{ realmIcon }}</div>
            <div class="player-copy">
              <span class="realm-pill" :class="getRealmClass">{{ playerStore.realmInfo.fullName }}</span>
              <strong>{{ playerStore.name }}</strong>
              <small>修为 {{ formatCultivation }}</small>
            </div>
          </div>

          <div class="resource-row">
            <GameStatChip icon="💎" label="灵石" :value="playerStore.gold" tone="gold" />
            <GameStatChip icon="✨" label="修为" :value="formatCultivation" tone="jade" />
          </div>
        </div>
      </GameSurface>

      <GameSurface class="world-shell" :tone="sectAlertTone" padding="md" compact>
        <div class="world-row">
          <div class="world-copy">
            <span class="world-eyebrow">天地流转</span>
            <strong>{{ worldStore.currentTimeLabel }} · {{ weatherLabel }}</strong>
            <p>{{ sectAlertSummary }}</p>
          </div>

          <div class="world-meta">
            <GameStatChip icon="📜" label="异闻" :value="worldStore.visibleLogs.length" tone="rose" />
            <GameStatChip icon="👥" label="已识人物" :value="worldStore.unlockedNpcDefinitions.length" tone="jade" />
          </div>
        </div>
      </GameSurface>
    </header>

    <main class="main-shell">
      <RouterView />
    </main>

    <footer class="nav-shell">
      <GameSurface class="nav-surface" tone="jade" padding="md">
        <div class="nav-header">
          <div class="nav-copy">
            <span class="nav-eyebrow">主循环</span>
            <strong>{{ currentMenuItem?.name || '修仙界面' }}</strong>
          </div>
          <button class="menu-toggle" @click="toggleMenu">
            <span>{{ isMenuExpanded ? '收起' : '展开' }}</span>
          </button>
        </div>

        <div v-if="isMenuExpanded" class="menu-grid">
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="menu-card"
            :class="{ active: isActive(item.path) }"
            @click="handleMenuClick"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <div class="menu-copy">
              <strong>{{ item.name }}</strong>
              <small>{{ item.desc }}</small>
            </div>
          </RouterLink>
        </div>

        <div v-else class="quick-bar">
          <RouterLink
            v-for="item in quickAccessItems"
            :key="item.path"
            :to="item.path"
            class="quick-card"
            :class="{ active: isActive(item.path) }"
          >
            <span class="quick-icon">{{ item.icon }}</span>
            <span class="quick-label">{{ item.shortName }}</span>
          </RouterLink>
        </div>
      </GameSurface>
    </footer>

    <AnnouncementModal />
    <ItemAcquireModal />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import AnnouncementModal from '@/components/modal/AnnouncementModal.vue'
import ItemAcquireModal from '@/components/modal/ItemAcquireModal.vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { getSectById } from '@/types/sect'

interface MenuItem {
  path: string
  name: string
  shortName: string
  desc: string
  icon: string
}

const playerStore = usePlayerStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()
const route = useRoute()
const isMenuExpanded = ref(false)
let worldTickTimer: number | null = null

const WORLD_TICK_INTERVAL_MS = 60 * 1000

const menuItems: MenuItem[] = [
  { path: '/game/cultivation', name: '修炼', shortName: '修炼', desc: '吐纳灵气，突破小境。', icon: '🧘' },
  { path: '/game/story', name: '故事', shortName: '故事', desc: '主线、支线与人物因果。', icon: '📖' },
  { path: '/game/adventure', name: '历险', shortName: '历险', desc: '历练刷图，搜罗材料。', icon: '⚔️' },
  { path: '/game/map', name: '地图', shortName: '地图', desc: '查看界域、战线与风险。', icon: '🗺️' },
  { path: '/game/sect', name: '宗门', shortName: '宗门', desc: '宗门关系、任务和战事。', icon: '🏛️' },
  { path: '/game/companion', name: '伙伴', shortName: '伙伴', desc: '伙伴、灵兽与同行者。', icon: '👥' },
  { path: '/game/skills', name: '功法', shortName: '功法', desc: '功法树、招式与搭配。', icon: '📜' },
  { path: '/game/inventory', name: '背包', shortName: '背包', desc: '丹药、材料、法器与装备。', icon: '🎒' },
  { path: '/game/shop', name: '坊市', shortName: '坊市', desc: '补货、交易与稀有奇珍。', icon: '🏪' },
  { path: '/game/profile', name: '角色', shortName: '角色', desc: '角色面板与成长总览。', icon: '👤' },
  { path: '/game/settings', name: '设置', shortName: '设置', desc: '音画、存档与辅助选项。', icon: '⚙️' }
]

const quickAccessItems = computed<MenuItem[]>(() => {
  const currentPath = route.path
  const items: MenuItem[] = [menuItems[0]!]
  const currentItem = menuItems.find(item => item.path === currentPath)
  if (currentItem && currentItem.path !== items[0]?.path) {
    items.push(currentItem)
  }

  for (const item of menuItems) {
    if (items.length >= 4) break
    if (!items.some(existing => existing.path === item.path)) {
      items.push(item)
    }
  }

  return items.slice(0, 4)
})

const currentMenuItem = computed(() => menuItems.find(item => item.path === route.path) ?? null)

const weatherLabel = computed(() => {
  const labels: Record<typeof worldStore.weather, string> = {
    clear: '天朗气清',
    rain: '灵雨细落',
    storm: '雷暴压境',
    flood: '洪水漫野',
    fire: '火势蔓延',
    mist: '雾锁山河'
  }
  return labels[worldStore.weather]
})

const sectAlertSummary = computed(() => {
  if (playerStore.captivity.isCaptured) {
    const captor = playerStore.captivity.captorSectId
      ? getSectById(playerStore.captivity.captorSectId)?.name ?? '敌对势力'
      : '敌对势力'
    return `你当前被${captor}控制，主循环行动应优先处理脱困。`
  }

  if (!sectStore.joinedSectId || !sectStore.currentSect) {
    return worldStore.visibleLogs[0]?.title ?? '尚未加入宗门，游历与结识人物会决定你的归属。'
  }

  if (sectStore.worldCondition.status === 'collapsed') {
    return `${sectStore.currentSect.name}已陷入沦陷状态，宗门循环需要尽快重建。`
  }

  if (sectStore.worldCondition.status === 'rebuilding') {
    return `${sectStore.currentSect.name}正在重建，资源调配与人手稳定优先。`
  }

  if (sectStore.activeWar) {
    return `${sectStore.currentSect.name}正卷入战事，地图和世界异闻会持续变化。`
  }

  return `${sectStore.currentSect.name}山门暂稳，当前可通过历练、宗门事务与人物关系推进局势。`
})

const sectAlertTone = computed<'jade' | 'gold' | 'mist'>(() => {
  if (playerStore.captivity.isCaptured || sectStore.worldCondition.status === 'collapsed') {
    return 'mist'
  }
  if (sectStore.activeWar || sectStore.worldCondition.status === 'rebuilding') {
    return 'gold'
  }
  return 'jade'
})

const formatCultivation = computed(() => {
  const cur = playerStore.cultivation
  const max = playerStore.maxCultivation
  if (max >= 10000) {
    return `${(cur / 1000).toFixed(1)}k/${(max / 1000).toFixed(0)}k`
  }
  return `${cur}/${max}`
})

const realmIcon = computed(() => {
  const realm = playerStore.realm
  if (realm.includes('炼气')) return '气'
  if (realm.includes('筑基')) return '筑'
  if (realm.includes('金丹')) return '丹'
  if (realm.includes('元婴')) return '婴'
  if (realm.includes('化神')) return '神'
  if (realm.includes('渡劫')) return '劫'
  if (realm.includes('大乘')) return '乘'
  return '仙'
})

const getRealmClass = computed(() => {
  const realm = playerStore.realm
  const classMap: Record<string, string> = {
    炼气: 'realm-qi',
    筑基: 'realm-foundation',
    金丹: 'realm-golden',
    元婴: 'realm-infant',
    化神: 'realm-god',
    渡劫: 'realm-tribulation',
    大乘: 'realm-mahayana',
    仙人: 'realm-immortal'
  }

  for (const [key, value] of Object.entries(classMap)) {
    if (realm.includes(key)) return value
  }
  return ''
})

function isActive(path: string) {
  return route.path === path
}

function toggleMenu() {
  isMenuExpanded.value = !isMenuExpanded.value
}

function handleMenuClick() {
  isMenuExpanded.value = false
}

function startWorldClock() {
  worldStore.simulateOffline()
  if (worldTickTimer) return
  worldTickTimer = window.setInterval(() => {
    worldStore.advanceTick()
  }, WORLD_TICK_INTERVAL_MS)
}

onMounted(() => {
  startWorldClock()
})

onUnmounted(() => {
  if (worldTickTimer) {
    clearInterval(worldTickTimer)
    worldTickTimer = null
  }
})
</script>

<style scoped>
.game-layout {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  background:
    linear-gradient(180deg, #f2fffb 0%, #e5f4ef 48%, #dbece7 100%),
    radial-gradient(circle at top, rgba(126, 212, 188, 0.22), transparent 48%);
}

.layout-backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.mist {
  position: absolute;
  border-radius: 999px;
  filter: blur(34px);
  opacity: 0.52;
}

.mist-a {
  inset: 4% auto auto -8%;
  width: 240px;
  height: 240px;
  background: rgba(132, 223, 198, 0.36);
}

.mist-b {
  inset: auto 8% 20% auto;
  width: 220px;
  height: 220px;
  background: rgba(251, 225, 162, 0.32);
}

.mist-c {
  inset: auto auto -12% 18%;
  width: 280px;
  height: 220px;
  background: rgba(179, 220, 230, 0.28);
}

.top-shell,
.main-shell,
.nav-shell {
  position: relative;
  z-index: 1;
}

.top-shell {
  padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 0;
  display: grid;
  gap: 10px;
}

.status-shell,
.world-shell {
  max-width: 1120px;
  margin: 0 auto;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.player-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-orb {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #fff0b0, #73d4be);
  color: #8e6227;
  font-size: 20px;
  box-shadow: 0 12px 24px rgba(113, 196, 177, 0.18);
}

.player-copy {
  display: grid;
  gap: 4px;
}

.player-copy strong {
  color: #315257;
  font-size: 16px;
}

.player-copy small {
  color: rgba(74, 97, 96, 0.7);
  font-size: 11px;
}

.realm-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(123, 166, 176, 0.2);
  background: rgba(255, 255, 255, 0.74);
  font-size: 11px;
}

.realm-qi { color: #4d99c2; }
.realm-foundation { color: #4caa73; }
.realm-golden { color: #c28b25; }
.realm-infant { color: #8966cb; }
.realm-god { color: #c05d8f; }
.realm-tribulation { color: #3ba7bd; }
.realm-mahayana { color: #c2932f; }
.realm-immortal { color: #a6882d; }

.resource-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.world-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.world-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.world-eyebrow {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.world-copy strong {
  color: #8e6227;
  font-size: 14px;
}

.world-copy p {
  margin: 0;
  color: rgba(55, 82, 84, 0.78);
  font-size: 12px;
  line-height: 1.55;
}

.world-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.main-shell {
  min-height: 0;
  overflow: auto;
  padding: 12px;
}

.nav-shell {
  padding: 0 12px calc(12px + env(safe-area-inset-bottom, 0px));
}

.nav-surface {
  max-width: 1120px;
  margin: 0 auto;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.nav-copy {
  display: grid;
  gap: 3px;
}

.nav-eyebrow {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.nav-copy strong {
  color: #8e6227;
  font-size: 18px;
}

.menu-toggle {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(188, 141, 58, 0.24);
  background: rgba(255, 251, 237, 0.82);
  color: #8b6226;
  font-family: var(--font-game);
  font-size: 12px;
  font-weight: 700;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.menu-card {
  display: grid;
  gap: 10px;
  align-content: start;
  min-height: 120px;
  padding: 14px;
  text-decoration: none;
  border-radius: 18px;
  border: 1px solid rgba(103, 149, 144, 0.2);
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.94), rgba(241, 249, 244, 0.82)),
    radial-gradient(circle at top, rgba(170, 232, 214, 0.15), transparent 62%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.84);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.menu-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(87, 126, 121, 0.14);
}

.menu-card.active {
  border-color: rgba(188, 141, 58, 0.3);
  background:
    linear-gradient(180deg, rgba(255, 251, 236, 0.98), rgba(247, 240, 215, 0.88)),
    radial-gradient(circle at top, rgba(255, 213, 112, 0.2), transparent 62%);
}

.menu-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 20px;
}

.menu-copy {
  display: grid;
  gap: 4px;
}

.menu-copy strong {
  color: #315257;
  font-size: 14px;
}

.menu-copy small {
  color: rgba(74, 97, 96, 0.7);
  font-size: 11px;
  line-height: 1.5;
}

.quick-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.quick-card {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 10px 6px;
  text-decoration: none;
  border-radius: 18px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  background: rgba(255, 255, 255, 0.58);
}

.quick-card.active {
  border-color: rgba(188, 141, 58, 0.28);
  background: rgba(255, 249, 233, 0.82);
}

.quick-icon {
  font-size: 18px;
}

.quick-label {
  color: #496463;
  font-size: 11px;
}

@media (max-width: 860px) {
  .status-row {
    flex-direction: column;
    align-items: stretch;
  }

  .world-row {
    flex-direction: column;
    align-items: stretch;
  }

  .resource-row {
    justify-content: flex-start;
  }

  .world-meta {
    justify-content: flex-start;
  }

  .menu-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .main-shell {
    padding: 10px;
  }

  .nav-shell,
  .top-shell {
    padding-inline: 10px;
  }

  .menu-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-bar {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .menu-card {
    min-height: 108px;
  }
}
</style>
