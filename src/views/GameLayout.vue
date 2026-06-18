<template>
  <div class="game-layout">
    <div class="layout-backdrop">
      <div class="mist mist-a"></div>
      <div class="mist mist-b"></div>
      <div class="mist mist-c"></div>
    </div>

    <header class="top-shell">
      <div class="hud-shell" :class="`tone-${sectAlertTone}`">
        <div class="player-block">
          <div class="avatar-orb">{{ realmIcon }}</div>
          <div class="player-copy">
            <span class="realm-pill" :class="getRealmClass">{{ playerStore.realmInfo.fullName }}</span>
            <strong>{{ playerStore.name }}</strong>
            <small>{{ worldStore.currentTimeLabel }} · {{ weatherLabel }}</small>
          </div>
        </div>

        <div class="resource-row">
          <GameStatChip icon="石" label="灵石" :value="playerStore.gold" tone="gold" />
          <GameStatChip icon="修" label="修为" :value="formatCultivation" tone="jade" />
          <GameStatChip icon="闻" label="异闻" :value="worldStore.visibleLogs.length" tone="rose" />
          <GameStatChip icon="人" label="人物" :value="worldStore.unlockedNpcDefinitions.length" tone="jade" />
          <button
            class="audio-toggle"
            :class="{ active: bgmEnabled }"
            :aria-label="bgmEnabled ? '关闭背景音' : '开启背景音'"
            @click="handleToggleBgm"
          >
            <span><component :is="bgmEnabled ? Volume2 : VolumeX" :size="15" /></span>
            <small>{{ bgmEnabled ? '背景音' : '已静音' }}</small>
          </button>
        </div>

        <p class="world-summary">{{ sectAlertSummary }}</p>
      </div>
    </header>

    <main class="main-shell" @click="closeMenu">
      <RouterView />
    </main>

    <div v-if="isMenuExpanded" class="nav-scrim" @click="closeMenu"></div>

    <footer class="nav-shell" :class="{ expanded: isMenuExpanded }">
      <GameSurface v-if="isMenuExpanded" class="nav-drawer" tone="jade" padding="md">
        <div class="nav-header">
          <div class="nav-copy">
            <span class="nav-eyebrow">功能总览</span>
            <strong>前往修仙界面</strong>
          </div>
          <button class="drawer-close" aria-label="收起菜单" @click="closeMenu">
            <X :size="18" />
          </button>
        </div>

        <div class="menu-grid" @click.stop>
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="menu-card"
            :class="{ active: isActive(item.path) }"
            @click="handleMenuClick"
          >
            <span class="menu-icon"><component :is="item.icon" :size="20" /></span>
            <div class="menu-copy">
              <strong>{{ item.name }}</strong>
              <small>{{ item.desc }}</small>
            </div>
          </RouterLink>
        </div>
      </GameSurface>

      <nav class="tab-bar" aria-label="主循环导航">
        <RouterLink
          v-for="item in tabItems"
          :key="item.path"
          :to="item.path"
          class="tab-item"
          :class="{ active: isActive(item.path) }"
        >
          <component :is="item.icon" :size="21" />
          <span>{{ item.shortName }}</span>
        </RouterLink>

        <button
          class="tab-item tab-more"
          :class="{ active: isMenuExpanded }"
          type="button"
          @click.stop="toggleMenu"
        >
          <component :is="isMenuExpanded ? X : Grid3X3" :size="21" />
          <span>{{ isMenuExpanded ? '收起' : '更多' }}</span>
        </button>
      </nav>
    </footer>

    <AnnouncementModal />
    <ItemAcquireModal />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type Component } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  Backpack,
  BookOpen,
  Grid3X3,
  Landmark,
  Map,
  ScrollText,
  Settings,
  Sparkles,
  Store,
  Swords,
  UserRound,
  UsersRound,
  Volume2,
  VolumeX,
  X
} from 'lucide-vue-next'
import GameStatChip from '@/components/game-ui/GameStatChip.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import AnnouncementModal from '@/components/modal/AnnouncementModal.vue'
import ItemAcquireModal from '@/components/modal/ItemAcquireModal.vue'
import { useAudio } from '@/composables/useAudio'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { getSectById } from '@/types/sect'

interface MenuItem {
  path: string
  name: string
  shortName: string
  desc: string
  icon: Component
}

const playerStore = usePlayerStore()
const sectStore = useSectStore()
const worldStore = useWorldStore()
const { bgmEnabled, toggleBgm, startCultivationBgm } = useAudio()
const route = useRoute()
const isMenuExpanded = ref(false)
let worldTickTimer: number | null = null

const WORLD_TICK_INTERVAL_MS = 60 * 1000

const menuItems: MenuItem[] = [
  { path: '/game/cultivation', name: '修炼', shortName: '修炼', desc: '吐纳灵气，突破小境。', icon: Sparkles },
  { path: '/game/adventure', name: '历险', shortName: '历险', desc: '历练刷图，搜罗材料。', icon: Swords },
  { path: '/game/story', name: '故事', shortName: '故事', desc: '主线、支线与人物因果。', icon: BookOpen },
  { path: '/game/map', name: '地图', shortName: '地图', desc: '查看界域、战线与风险。', icon: Map },
  { path: '/game/sect', name: '宗门', shortName: '宗门', desc: '宗门关系、任务和战事。', icon: Landmark },
  { path: '/game/companion', name: '伙伴', shortName: '伙伴', desc: '伙伴、灵兽与同行者。', icon: UsersRound },
  { path: '/game/skills', name: '功法', shortName: '功法', desc: '功法树、招式与搭配。', icon: ScrollText },
  { path: '/game/inventory', name: '背包', shortName: '背包', desc: '丹药、材料、法器与装备。', icon: Backpack },
  { path: '/game/shop', name: '坊市', shortName: '坊市', desc: '补货、交易与稀有奇珍。', icon: Store },
  { path: '/game/profile', name: '角色', shortName: '角色', desc: '角色面板与成长总览。', icon: UserRound },
  { path: '/game/settings', name: '设置', shortName: '设置', desc: '音画、存档与辅助选项。', icon: Settings }
]

const tabItems = computed<MenuItem[]>(() => menuItems.slice(0, 5))

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

function closeMenu() {
  isMenuExpanded.value = false
}

function handleToggleBgm() {
  toggleBgm()
  if (bgmEnabled.value) {
    startCultivationBgm()
  }
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

watch(
  () => route.fullPath,
  () => {
    isMenuExpanded.value = false
  }
)

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
  grid-template-rows: auto 1fr;
  height: 100vh;
  height: 100dvh;
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
  z-index: 2;
}

.top-shell {
  padding: calc(8px + env(safe-area-inset-top, 0px)) 12px 0;
}

.hud-shell,
.nav-drawer,
.tab-bar {
  max-width: 1120px;
  margin: 0 auto;
}

.hud-shell {
  display: grid;
  grid-template-columns: minmax(220px, auto) minmax(0, 1fr);
  align-items: center;
  gap: 10px 16px;
  padding: 10px;
  border: 1px solid rgba(101, 152, 145, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 250, 0.78);
  box-shadow: 0 18px 40px rgba(88, 123, 116, 0.14);
  backdrop-filter: blur(16px);
}

.hud-shell.tone-gold {
  border-color: rgba(188, 141, 58, 0.28);
  background: rgba(255, 250, 231, 0.84);
}

.hud-shell.tone-mist {
  border-color: rgba(198, 121, 137, 0.22);
  background: rgba(255, 248, 249, 0.84);
}

.player-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-orb {
  width: 44px;
  height: 44px;
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
  font-size: 15px;
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

.audio-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.58);
  color: #4b6767;
  font-family: var(--font-game);
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.audio-toggle.active {
  border-color: rgba(188, 141, 58, 0.28);
  background: rgba(255, 249, 233, 0.82);
  color: #8b6226;
}

.audio-toggle span {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 235, 169, 0.82);
  font-size: 13px;
}

.audio-toggle svg {
  color: currentColor;
}

.audio-toggle small {
  font-size: 10px;
  font-weight: 700;
}

.world-summary {
  grid-column: 1 / -1;
  margin: 0;
  color: rgba(55, 82, 84, 0.78);
  font-size: 12px;
  line-height: 1.45;
}

.main-shell {
  min-height: 0;
  overflow: auto;
  padding: 12px 12px calc(96px + env(safe-area-inset-bottom, 0px));
  position: relative;
  z-index: 3;
  -webkit-overflow-scrolling: touch;
}

.nav-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 12;
  padding: 0 12px calc(10px + env(safe-area-inset-bottom, 0px));
  pointer-events: none;
}

.nav-shell:not(.expanded) {
  transform: translateZ(0);
}

.nav-shell > * {
  pointer-events: auto;
}

.nav-scrim {
  position: fixed;
  inset: 0;
  z-index: 10;
  background: rgba(42, 68, 67, 0.16);
  backdrop-filter: blur(3px);
}

.nav-drawer {
  margin-bottom: 10px;
  max-height: min(68vh, 560px);
  overflow: auto;
  border-radius: 22px;
  box-shadow: 0 28px 72px rgba(58, 85, 82, 0.24);
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

.drawer-close {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid rgba(188, 141, 58, 0.24);
  background: rgba(255, 251, 237, 0.82);
  color: #8b6226;
  cursor: pointer;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.menu-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  align-content: start;
  min-height: 86px;
  padding: 12px;
  text-decoration: none;
  border-radius: 16px;
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
  color: #6d8f8d;
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

.tab-bar {
  height: 70px;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: center;
  gap: 2px;
  padding: 7px;
  border: 1px solid rgba(102, 146, 141, 0.2);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.94), rgba(239, 249, 245, 0.88)),
    radial-gradient(circle at top, rgba(255, 223, 147, 0.18), transparent 58%);
  box-shadow: 0 18px 48px rgba(57, 89, 84, 0.18);
  backdrop-filter: blur(18px);
}

.tab-item {
  height: 56px;
  min-width: 0;
  display: grid;
  place-items: center;
  gap: 3px;
  padding: 4px 2px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: rgba(65, 91, 89, 0.74);
  font-family: var(--font-game);
  font-size: 11px;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
}

.tab-item svg {
  display: block;
}

.tab-item.active {
  background: rgba(255, 248, 229, 0.92);
  color: #8b6226;
  box-shadow: inset 0 0 0 1px rgba(194, 146, 66, 0.2);
}

.tab-more {
  appearance: none;
  -webkit-appearance: none;
}

@media (max-width: 860px) {
  .hud-shell {
    grid-template-columns: 1fr;
  }

  .resource-row {
    justify-content: flex-start;
  }

  .menu-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .main-shell {
    padding: 10px 10px calc(92px + env(safe-area-inset-bottom, 0px));
  }

  .top-shell {
    padding-inline: 10px;
  }

  .nav-shell {
    padding-inline: 10px;
  }

  .hud-shell {
    gap: 8px;
    padding: 9px;
    border-radius: 18px;
  }

  .resource-row {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }

  .resource-row :deep(.stat-chip) {
    flex-direction: column;
    min-height: 48px;
    justify-content: center;
    gap: 3px;
    padding: 6px 4px;
  }

  .resource-row :deep(.stat-copy small) {
    display: none;
  }

  .resource-row :deep(.stat-copy strong) {
    font-size: 10px;
  }

  .audio-toggle {
    min-height: 48px;
    justify-content: center;
    padding: 6px 4px;
  }

  .audio-toggle small {
    display: none;
  }

  .world-summary {
    display: none;
  }

  .nav-drawer {
    max-height: min(70vh, 520px);
  }

  .menu-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .menu-card {
    min-height: 76px;
    padding: 10px;
  }

  .tab-bar {
    height: 66px;
    border-radius: 20px;
  }

  .tab-item {
    height: 52px;
    font-size: 10px;
  }
}
</style>
