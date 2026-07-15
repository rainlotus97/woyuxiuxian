<template>
  <div class="game-layout" :class="{ 'is-cultivation': isCultivationRoute }" :style="themeCssVars">
    <div class="layout-backdrop"></div>

    <header class="top-shell">
      <div class="hud-stack">
        <XPlayerHud
          class="player-hud"
          :player-name="playerStore.name"
          :realm="playerStore.realmInfo.fullName"
          :level="playerStore.level"
          :items="hudResourceItems"
        >
          <!-- @vue-ignore: published component declarations currently omit named slots -->
          <template #avatar>
            <XAvatarFrame
              :alt="`${playerStore.name}的头像`"
              size="2.9rem"
              :tone="sectAlertTone"
            >
              <span class="avatar-glyph" :class="getRealmClass">{{ realmIcon }}</span>
            </XAvatarFrame>
          </template>
        </XPlayerHud>

        <XAnnouncement
          v-if="!isStoryOverlayVisible"
          class="hud-announcement"
          :eyebrow="hudAnnouncementEyebrow"
          :title="hudAnnouncementTitle"
          :message="hudAnnouncementMessage"
          :icon="hudAnnouncementIcon"
          :tone="sectAlertTone"
        />
      </div>
    </header>

    <main class="main-shell">
      <div class="content-stage">
        <RouterView />
      </div>
    </main>

    <Transition name="scrim-fade">
      <button
        v-if="isMenuExpanded"
        type="button"
        class="nav-scrim"
        aria-label="收起功能菜单"
        @click="closeMenu"
      ></button>
    </Transition>

    <footer class="nav-shell" :class="{ expanded: isMenuExpanded }">
      <Transition name="drawer-rise">
        <GameSurface v-if="isMenuExpanded" class="nav-drawer" tone="jade" padding="md">
          <div class="nav-header">
            <div class="nav-copy">
              <span class="nav-eyebrow">功能总览</span>
              <strong>前往修仙界面</strong>
            </div>
            <button class="drawer-close" type="button" aria-label="收起菜单" @click="closeMenu">
              <XIcon icon="close" size="1.05rem" />
            </button>
          </div>

          <div class="menu-grid" @click.stop>
            <XTaskEntry
              v-for="item in menuItems"
              :key="item.path"
              :title="item.name"
              :description="item.desc"
              :icon="item.icon"
              :tag="isActive(item.path) ? '当前' : ''"
              :tone="isActive(item.path) ? 'gold' : 'jade'"
              state="active"
              @click="handleMenuClick(item.path)"
            />
          </div>
        </GameSurface>
      </Transition>

      <XTabBar
        class="main-tab-bar"
        :model-value="activeTabValue"
        :items="tabBarItems"
        @select="handleTabSelect"
      />
    </footer>

    <AnnouncementModal />
    <ItemAcquireModal />

    <Transition name="story-overlay-fade">
      <div
        v-if="isStoryOverlayVisible && !isStandaloneStoryRoute"
        class="story-overlay-wrap"
        @click.self="handleCloseStoryOverlay"
      >
        <div class="story-overlay-shell">
          <StoryPlayer @back="handleCloseStoryOverlay" />
        </div>
      </div>
    </Transition>
    
    <GameDialog
      :visible="randomEvent.hasCurrentEvent.value"
      :title="randomEvent.currentEvent.value?.title ?? '缘起一页'"
      eyebrow="奇遇回响"
      @close="randomEvent.dismissEvent()"
    >
      <div class="event-dialog-body">
        <small class="event-dialog-hint">{{ randomEvent.currentEvent.value?.prompt ?? '这段遭遇会被后续记住。' }}</small>
        <p>{{ randomEvent.currentEvent.value?.description }}</p>
      </div>
      <template #footer>
        <div class="event-dialog-actions">
          <GameActionButton tone="stone" @click="randomEvent.dismissEvent()">暂缓</GameActionButton>
          <GameActionButton
            v-for="(choice, i) in randomEvent.currentEvent.value?.choices ?? []"
            :key="i"
            tone="gold"
            @click="randomEvent.confirmChoice(i)"
          >
            {{ choice.text }}
          </GameActionButton>
        </div>
      </template>
    </GameDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  XAnnouncement,
  XAvatarFrame,
  XIcon,
  XPlayerHud,
  XTabBar,
  XTaskEntry,
  type XIconName,
  type XTone
} from '@xianxia/ui'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import AnnouncementModal from '@/components/modal/AnnouncementModal.vue'
import ItemAcquireModal from '@/components/modal/ItemAcquireModal.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import StoryPlayer from '@/components/story/StoryPlayer.vue'
import { sfxDiscovery, sfxStoryChoice, useAudio } from '@/composables/useAudio'
import { useRandomEvent } from '@/composables/useRandomEvent'
import { useStoryOverlay } from '@/composables/useStoryOverlay'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { useStoryStore } from '@/story/storyStore'
import { getSectById } from '@/types/sect'
import { GAME_THEME_TOKENS, MAIN_NAV_ITEMS, resolveRouteBgmType } from '@/game/theme/gameTheme'
import { resolveThemeCssVars } from '@/game/theme/themeAssetPack'

interface MenuItem {
  path: string
  name: string
  shortName: string
  desc: string
  icon: XIconName
}

interface HudResourceItem {
  label: string
  value: string | number
  suffix?: string
  icon?: XIconName
  tone?: XTone
}

interface HudTabItem {
  value: string
  label: string
  icon: XIconName
  disabled?: boolean
}

const MORE_TAB_VALUE = '__more__'
const NAV_ICON_BY_PATH: Record<string, XIconName> = {
  '/game/cultivation': 'cultivation',
  '/game/adventure': 'sword',
  '/game/map': 'map',
  '/game/sect': 'sect',
  '/game/companion': 'jade',
  '/game/skills': 'scroll',
  '/game/inventory': 'backpack',
  '/game/shop': 'spirit-stone',
  '/game/profile': 'crown',
  '/game/settings': 'settings'
}

const playerStore = usePlayerStore()
const sectStore = useSectStore()
const storyStore = useStoryStore()
const worldStore = useWorldStore()
const randomEvent = useRandomEvent()
const { bgmEnabled, switchBgm } = useAudio()
const { isStoryOverlayVisible, isStandaloneStoryRoute, closeStoryOverlay } = useStoryOverlay()
const route = useRoute()
const router = useRouter()
const isMenuExpanded = ref(false)
let worldTickTimer: number | null = null

const WORLD_TICK_INTERVAL_MS = 60 * 1000

const menuItems: MenuItem[] = MAIN_NAV_ITEMS.map(item => ({
  ...item,
  icon: NAV_ICON_BY_PATH[item.path] ?? 'scroll'
}))

const tabItems = computed<MenuItem[]>(() => menuItems.slice(0, 5))
const tabBarItems = computed<HudTabItem[]>(() => [
  ...tabItems.value.map(item => ({
    value: item.path,
    label: item.shortName,
    icon: item.icon
  })),
  {
    value: MORE_TAB_VALUE,
    label: isMenuExpanded.value ? '收起' : '更多',
    icon: isMenuExpanded.value ? 'close' : 'settings'
  }
])
const activeTabValue = computed(() => {
  if (isMenuExpanded.value) return MORE_TAB_VALUE
  return tabItems.value.some(item => item.path === route.path) ? route.path : MORE_TAB_VALUE
})
const themeCssVars = computed(() => resolveThemeCssVars())

const currentSectionName = computed(() => {
  return menuItems.find(item => item.path === route.path)?.name ?? '修途'
})

const isCultivationRoute = computed(() => route.path === '/game/cultivation')

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

watch(isStoryOverlayVisible, visible => {
  if (visible) {
    sfxDiscovery()
    return
  }
  sfxStoryChoice()
})

const sectAlertSummary = computed(() => {
  if (playerStore.captivity.isCaptured) {
    const captor = playerStore.captivity.captorSectId
      ? getSectById(playerStore.captivity.captorSectId)?.name ?? '敌对势力'
      : '敌对势力'
    return `你现在落在${captor}手里，先别想旁的，眼下只看怎么脱身。`
  }

  if (!sectStore.joinedSectId || !sectStore.currentSect) {
    return worldStore.visibleLogs[0]?.title ?? '还没定下归处，先在路上碰人碰事，山门自然会找上来。'
  }

  if (sectStore.worldCondition.status === 'collapsed') {
    return `${sectStore.currentSect.name}山门已塌，接下来是谁救火、谁弃山门，很快就会见分晓。`
  }

  if (sectStore.worldCondition.status === 'rebuilding') {
    return `${sectStore.currentSect.name}还在重整，人手、库藏和脸面都得一点点重新接回来。`
  }

  if (sectStore.activeWar) {
    return `${sectStore.currentSect.name}正陷在战事里，这几天地界和人物动向都会跟着偏转。`
  }

  return `${sectStore.currentSect.name}眼下还算稳，但一句话、一次历练，也足够把后面的事牵出来。`
})

const currentPrompt = computed(() => {
  if (isStoryOverlayVisible.value) {
    return '眼前这件事已经压过来了，顺着它往下走。'
  }
  if (route.path === '/game/adventure') {
    return '这一路最要紧的不是掉多少东西，而是谁认得你，又是谁记恨你。'
  }
  if (route.path === '/game/sect') {
    return '山门里一句话、坊市里一笔买卖，都可能把后面的人和事牵出来。'
  }
  return '这一轮修行不会白过，做过的事、人情旧账和后头的风声都会慢慢追上来。'
})

const encounterStatus = computed(() => randomEvent.getEncounterStatus())

const encounterPrompt = computed(() => {
  const status = encounterStatus.value
  const memoryText = status.memoryHighlights.length
    ? `旧账还在：${status.memoryHighlights.join('、')}`
    : '旧恩旧怨暂时还没回头。'

  if (status.isDailyBlocked) {
    return `今天额外冒头的事已经露完了。${memoryText}`
  }

  if (status.isStoryDailyBlocked) {
    return `今天和这条事相关的人情旧怨已经露过脸了。${memoryText}`
  }

  return `${status.storyGateReason}${memoryText ? ` ${memoryText}` : ''}`
})

const ambientPrompt = computed(() => {
  if (route.path === '/game/cultivation' || route.path === '/game/adventure') {
    return encounterPrompt.value
  }
  return currentPrompt.value
})

const sectAlertTone = computed<XTone>(() => {
  if (playerStore.captivity.isCaptured || sectStore.worldCondition.status === 'collapsed') {
    return 'rose'
  }
  if (sectStore.activeWar || sectStore.worldCondition.status === 'rebuilding') {
    return 'gold'
  }
  return 'jade'
})

const resourceCultivationDisplay = computed(() => {
  const cur = sanitizeNumber(playerStore.cultivation)
  const max = sanitizeNumber(playerStore.maxCultivation)
  if (isCultivationRoute.value) {
    return formatAmount(cur)
  }
  if (max >= 10000) {
    return `${Math.floor(cur / 1000)}k/${Math.floor(max / 1000)}k`
  }
  return `${formatAmount(cur)}/${formatAmount(max)}`
})

const hudResourceItems = computed<HudResourceItem[]>(() => [
  {
    label: '修为',
    value: resourceCultivationDisplay.value,
    suffix: '+',
    icon: 'cultivation',
    tone: 'jade'
  },
  {
    label: '灵石',
    value: playerStore.gold,
    suffix: '+',
    icon: 'spirit-stone',
    tone: 'gold'
  },
  {
    label: '异闻',
    value: worldStore.visibleLogs.length,
    suffix: '+',
    icon: 'scroll',
    tone: sectAlertTone.value
  }
])

const hudAnnouncementEyebrow = computed(() => {
  return `${currentSectionName.value} · ${worldStore.currentTimeLabel} · ${weatherLabel.value}`
})

const hudAnnouncementTitle = computed(() => {
  return sectStore.currentSect?.name ?? (playerStore.captivity.isCaptured ? '身陷囹圄' : '行走修途')
})

const hudAnnouncementMessage = computed(() => {
  if (isCultivationRoute.value || route.path === '/game/adventure') {
    return ambientPrompt.value
  }
  return `${sectAlertSummary.value} ${currentPrompt.value}`
})

const hudAnnouncementIcon = computed<XIconName>(() => {
  if (playerStore.captivity.isCaptured || sectStore.worldCondition.status === 'collapsed') {
    return 'lock'
  }
  if (sectStore.activeWar || sectStore.worldCondition.status === 'rebuilding') {
    return 'sect'
  }
  if (route.path === '/game/adventure' || route.path === '/game/map') {
    return 'map'
  }
  return 'spark'
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

function handleMenuClick(path: string) {
  isMenuExpanded.value = false
  if (route.path !== path) {
    void router.push(path)
  }
}

function handleTabSelect(item: HudTabItem) {
  if (item.value === MORE_TAB_VALUE) {
    toggleMenu()
    return
  }

  isMenuExpanded.value = false
  if (route.path !== item.value) {
    void router.push(item.value)
  }
}

function closeMenu() {
  isMenuExpanded.value = false
}

function handleCloseStoryOverlay() {
  void closeStoryOverlay()
}

async function ensureStoryOverlayReady() {
  if (!isStoryOverlayVisible.value || isStandaloneStoryRoute.value) return
  if (!storyStore.hasStoryContent) return

  const preferredPerspective = playerStore.perspective ?? 'male'

  if (storyStore.currentNodeId && storyStore.currentNode) {
    await storyStore.continueStory(preferredPerspective)
    return
  }

  await storyStore.initStory(preferredPerspective, storyStore.currentVolume || 1)
}

function formatAmount(value: number) {
  return String(Math.round(sanitizeNumber(value)))
}

function sanitizeNumber(value: number) {
  return Number.isFinite(value) ? value : 0
}

function startWorldClock() {
  worldStore.simulateOffline()
  if (worldTickTimer) return
  worldTickTimer = window.setInterval(() => {
    worldStore.advanceTick()
    randomEvent.checkForEvent()
  }, WORLD_TICK_INTERVAL_MS)
}

function syncRouteBgm(path: string) {
  if (!bgmEnabled.value) return
  switchBgm(resolveRouteBgmType(path))
}

onMounted(() => {
  startWorldClock()
  syncRouteBgm(route.fullPath)
  void ensureStoryOverlayReady()
})

watch(
  () => route.fullPath,
  path => {
    isMenuExpanded.value = false
    syncRouteBgm(path)
    void ensureStoryOverlayReady()
  }
)

watch(
  () => bgmEnabled.value,
  enabled => {
    if (enabled) {
      syncRouteBgm(route.fullPath)
    }
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
  max-width: 430px;
  margin: 0 auto;
  box-shadow: 0 0 60px rgba(49, 82, 87, 0.12);
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background:
    v-bind('GAME_THEME_TOKENS.surfaceBackdrop');
  color: #315257;
}

.layout-backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.layout-backdrop::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(115deg, transparent 0 34%, rgba(255, 238, 185, 0.24) 34% 35%, transparent 35% 100%),
    linear-gradient(25deg, transparent 0 62%, rgba(122, 180, 154, 0.16) 62% 63%, transparent 63% 100%);
  opacity: 0.8;
}

.game-layout.is-cultivation {
  background:
    linear-gradient(180deg, rgba(245, 251, 249, 0.96), rgba(232, 241, 239, 0.92));
}

.game-layout.is-cultivation .layout-backdrop::before {
  background:
    linear-gradient(180deg, rgba(247, 252, 251, 0.16), rgba(243, 248, 247, 0.38) 22%, rgba(230, 240, 239, 0.78) 100%),
    url('@/assets/theme/generated/main/bg-main-9x16-v1.png') center top / cover no-repeat;
  filter: saturate(0.96) blur(2px);
  transform: scale(1.05);
  opacity: 0.98;
}

.game-layout.is-cultivation .layout-backdrop::after {
  background-image:
    radial-gradient(circle at 8% 18%, rgba(255, 255, 255, 0.88), transparent 16%),
    radial-gradient(circle at 88% 12%, rgba(255, 255, 255, 0.76), transparent 14%),
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: auto, auto, 44px 44px, 44px 44px;
  opacity: 0.34;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.88), rgba(0, 0, 0, 0.42) 46%, transparent 78%);
}

.layout-backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(65, 102, 97, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(65, 102, 97, 0.055) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.68), transparent 72%);
}

.top-shell,
.main-shell,
.nav-shell {
  position: relative;
  z-index: 2;
}

.top-shell {
  padding: calc(0.55rem + env(safe-area-inset-top, 0px)) 0.75rem 0;
  z-index: 6;
  pointer-events: none;
}

.hud-stack,
.nav-drawer,
.main-tab-bar {
  margin: 0 auto;
}

.hud-stack {
  display: grid;
  gap: 0.36rem;
  width: 100%;
  pointer-events: auto;
}

.game-layout.is-cultivation .top-shell {
  padding-top: calc(0.18rem + env(safe-area-inset-top, 0px));
  padding-inline: 0.58rem;
}

.game-layout.is-cultivation .hud-stack {
  gap: 0.24rem;
}

.player-hud,
.hud-announcement {
  width: 100%;
  min-width: 0;
}

.player-hud :deep(.x-player-hud__identity) {
  min-width: 0;
  gap: 0.48rem;
  padding: 0.44rem 0.62rem;
}

.player-hud :deep(.x-player-hud__avatar) {
  width: 2.9rem;
  height: 2.9rem;
}

.player-hud :deep(.x-player-hud__name) {
  overflow: hidden;
}

.player-hud :deep(.x-player-hud__name strong) {
  font-size: 0.84rem;
}

.player-hud :deep(.x-player-hud__name span) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-hud :deep(.x-player-hud__resources) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.22rem;
  padding: 0.28rem;
}

.player-hud :deep(.x-player-hud__resource) {
  min-height: 2.65rem;
  gap: 0.28rem;
  padding: 0.36rem 0.4rem;
}

.player-hud :deep(.x-player-hud__resource small) {
  font-size: 0.56rem;
}

.player-hud :deep(.x-player-hud__resource strong) {
  font-size: 0.76rem;
}

.hud-announcement {
  gap: 0.58rem;
  padding: 0.56rem 0.68rem;
  border-radius: 0.82rem;
}

.hud-announcement :deep(.x-announcement__icon) {
  width: 1.95rem;
  height: 1.95rem;
}

.hud-announcement :deep(.x-announcement__copy) {
  gap: 0.12rem;
}

.hud-announcement :deep(.x-announcement__eyebrow) {
  overflow: hidden;
  font-size: 0.58rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hud-announcement :deep(strong) {
  overflow: hidden;
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hud-announcement :deep(p) {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.66rem;
  line-height: 1.38;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.game-layout.is-cultivation .hud-announcement :deep(p) {
  -webkit-line-clamp: 1;
}

.avatar-glyph {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 1.08rem;
  font-weight: 700;
}

.realm-qi { color: #4d99c2; }
.realm-foundation { color: #4caa73; }
.realm-golden { color: #c28b25; }
.realm-infant { color: #8966cb; }
.realm-god { color: #c05d8f; }
.realm-tribulation { color: #3ba7bd; }
.realm-mahayana { color: #c2932f; }
.realm-immortal { color: #a6882d; }

.event-dialog-body {
  display: grid;
  gap: 10px;
}

.event-dialog-body p {
  margin: 0;
  line-height: 1.7;
}

.event-dialog-hint {
  color: rgba(92, 114, 110, 0.84);
  line-height: 1.5;
}

.event-dialog-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  width: 100%;
}

.story-overlay-wrap {
  position: fixed;
  inset: 0;
  z-index: 26;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding:
    max(6px, calc(env(safe-area-inset-top) + 2px))
    max(12px, env(safe-area-inset-right))
    max(72px, calc(env(safe-area-inset-bottom) + 8px))
    max(12px, env(safe-area-inset-left));
  background:
    linear-gradient(180deg, rgba(14, 22, 20, 0.01), rgba(17, 28, 26, 0.04) 28%, rgba(12, 20, 18, 0.1)),
    radial-gradient(circle at 50% 82%, rgba(216, 176, 91, 0.05), transparent 16%);
  backdrop-filter: blur(2px) saturate(0.96) brightness(0.99);
  overflow: hidden;
}

.story-overlay-wrap::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 82%, rgba(255, 228, 163, 0.06), transparent 14%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.01), transparent 18%, rgba(255, 242, 196, 0.018) 74%, rgba(8, 15, 14, 0.03));
  opacity: 0.1;
  pointer-events: none;
}

.story-overlay-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, 414px);
  min-height: 0;
  max-height: min(calc(100dvh - 10px - env(safe-area-inset-bottom)), 920px);
  margin: 0 auto;
  border-radius: 0;
  overflow: visible;
  border: 0;
  box-shadow: none;
  background: transparent;
  animation: story-shell-enter 0.42s cubic-bezier(0.2, 0.84, 0.24, 1);
}

.story-overlay-shell::before {
  display: none;
}

.story-overlay-fade-enter-active,
.story-overlay-fade-leave-active {
  transition: opacity 0.24s ease;
}

.story-overlay-fade-enter-from,
.story-overlay-fade-leave-to {
  opacity: 0;
}

.story-overlay-fade-enter-from .story-overlay-shell {
  transform: translateY(26px) scale(0.975);
  filter: blur(8px);
  opacity: 0.34;
}

.story-overlay-fade-leave-to .story-overlay-shell {
  transform: translateY(18px) scale(0.985);
  filter: blur(5px);
  opacity: 0.24;
}

@keyframes story-shell-enter {
  0% {
    transform: translateY(22px) scale(0.978);
    filter: blur(10px);
    opacity: 0.34;
  }
  60% {
    transform: translateY(-2px) scale(1.004);
    filter: blur(0);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    filter: blur(0);
    opacity: 1;
  }
}

@media (min-width: 720px) {
  .story-overlay-wrap {
    padding:
      max(24px, env(safe-area-inset-top))
      max(18px, env(safe-area-inset-right))
      max(88px, env(safe-area-inset-bottom))
      max(18px, env(safe-area-inset-left));
    align-items: center;
  }

  .story-overlay-shell {
    width: min(414px, calc(100vw - 32px));
    min-height: 0;
    max-height: min(86dvh, 860px);
    margin: 0 auto;
    border-radius: 0;
  }
}

.main-shell {
  min-height: 0;
  overflow: auto;
  padding: 7px 10px 8px;
  position: relative;
  z-index: 3;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scroll-padding-bottom: 18px;
  isolation: isolate;
}

.game-layout.is-cultivation .main-shell {
  padding: 2px 8px 6px;
}

.content-stage {
  width: 100%; max-width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.nav-shell {
  position: relative;
  z-index: 18;
  padding: 0 0.8rem calc(0.55rem + env(safe-area-inset-bottom, 0px));
  pointer-events: none;
}

.game-layout.is-cultivation .nav-shell {
  padding-inline: 0.56rem;
  padding-bottom: calc(0.22rem + env(safe-area-inset-bottom, 0px));
}

.nav-shell.expanded {
  z-index: 42;
}

.nav-shell .main-tab-bar,
.nav-shell .nav-drawer {
  pointer-events: auto;
}

.nav-scrim {
  position: fixed;
  inset: 0;
  z-index: 34;
  border: 0;
  padding: 0;
  border-radius: 0;
  background:
    linear-gradient(180deg, rgba(248, 255, 245, 0.1), rgba(49, 82, 87, 0.14)),
    rgba(239, 249, 244, 0.2);
  pointer-events: auto;
  backdrop-filter: blur(1px);
  cursor: pointer;
}

.nav-drawer {
  position: absolute;
  left: 0.7rem;
  right: 0.7rem;
  bottom: calc(4.65rem + env(safe-area-inset-bottom, 0px));
  width: auto;
  max-height: min(56vh, 430px);
  overflow: auto;
  border-radius: 14px;
  box-shadow: 0 24px 62px rgba(58, 85, 82, 0.22);
  z-index: 43;
}

.scrim-fade-enter-active,
.scrim-fade-leave-active {
  transition: opacity 0.16s ease;
}

.scrim-fade-leave-active {
  pointer-events: none;
}

.scrim-fade-enter-from,
.scrim-fade-leave-to {
  opacity: 0;
}

.drawer-rise-enter-active,
.drawer-rise-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.drawer-rise-leave-active {
  pointer-events: none;
}

.drawer-rise-enter-from,
.drawer-rise-leave-to {
  opacity: 0;
  transform: translateY(12px);
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
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: 1px solid rgba(188, 141, 58, 0.24);
  background: rgba(255, 251, 237, 0.82);
  color: #8b6226;
  cursor: pointer;
  touch-action: manipulation;
}

.menu-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}

.menu-grid :deep(.x-task-entry) {
  min-height: 4.1rem;
  gap: 0.68rem;
  padding: 0.58rem 0.72rem;
  border-radius: 0.92rem;
}

.menu-grid :deep(.x-task-entry::before) {
  border-radius: 0.68rem;
}

.menu-grid :deep(.x-task-entry__icon) {
  width: 2.25rem;
  height: 2.25rem;
}

.menu-grid :deep(.x-task-entry__description) {
  white-space: normal;
}

.main-tab-bar {
  position: relative;
  z-index: 44;
  width: 100%;
  min-height: 4.2rem;
  gap: 0.12rem;
  padding: 0.3rem 0.24rem;
  box-shadow: 0 -0.1rem 0 rgba(255, 255, 255, 0.8), 0 -0.5rem 2rem rgba(72, 98, 100, 0.1);
  backdrop-filter: blur(18px);
}

.main-tab-bar :deep(.x-tab-bar__item) {
  min-height: 3.35rem;
  padding-inline: 0.08rem;
}

.game-layout.is-cultivation .main-tab-bar {
  min-height: 4rem;
  padding-block: 0.24rem;
}

@media (min-width: 380px) {
  .menu-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .menu-grid :deep(.x-task-entry) {
    min-height: 3.95rem;
    gap: 0.5rem;
    padding-inline: 0.58rem;
  }

  .menu-grid :deep(.x-task-entry__description) {
    display: none;
  }
}

@media (min-width: 390px) {
  .player-hud {
    grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
  }

  .player-hud :deep(.x-player-hud__identity) {
    border-right: 1px solid rgba(101, 152, 145, 0.25);
    border-bottom: 0;
  }
}

@media (max-width: 640px) {
  .main-shell {
    padding: 5px 8px 6px;
  }

  .game-layout.is-cultivation .main-shell {
    padding: 1px 7px 5px;
  }

  .top-shell {
    padding-inline: 0.7rem;
  }

  .nav-shell {
    padding-inline: 0.7rem;
  }

  .game-layout.is-cultivation .top-shell {
    padding-top: calc(0.08rem + env(safe-area-inset-top, 0px));
    padding-inline: 0.5rem;
  }

  .game-layout.is-cultivation .nav-shell {
    padding-inline: 0.46rem;
    padding-bottom: calc(0.14rem + env(safe-area-inset-bottom, 0px));
  }

  .nav-drawer {
    max-height: min(52vh, 420px);
  }

  .main-tab-bar {
    min-height: 4.05rem;
    padding: 0.26rem 0.18rem;
  }
}

@media (max-height: 700px) {
  .hud-announcement :deep(p) {
    -webkit-line-clamp: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drawer-rise-enter-active,
  .drawer-rise-leave-active,
  .scrim-fade-enter-active,
  .scrim-fade-leave-active,
  .story-overlay-fade-enter-active,
  .story-overlay-fade-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
