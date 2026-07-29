<template>
  <div
    class="game-layout"
    :class="[
      { 'is-cultivation': isCultivationRoute },
      `layout-${layoutMode}`
    ]"
    :style="themeCssVars"
  >
    <div class="layout-backdrop"></div>

    <header v-if="showHud" class="top-shell">
      <div class="hud-stack">
        <div class="hud-row">
          <XPlayerHud
            class="player-hud"
            :player-name="playerStore.name"
            :realm="playerStore.realmInfo.fullName"
            :level="playerStore.level"
            :items="hudResourceItems"
          >
            <!-- @vue-ignore: published component declarations currently omit named slots -->
            <template #avatar>
              <button
                type="button"
                class="avatar-trigger"
                aria-label="打开人物与系统菜单"
                title="人物与系统菜单"
                @click="toggleSystemMenu"
              >
                <XAvatarFrame
                  :alt="`${playerStore.name}的头像`"
                  size="2.9rem"
                  :tone="sectAlertTone"
                >
                  <GameIcon class="avatar-glyph" :icon="realmIcon" :size="22" :class="getRealmClass" />
                </XAvatarFrame>
                <b v-if="unreadWorldCount > 0" class="avatar-trigger__badge">
                  {{ unreadWorldCount > 9 ? '9+' : unreadWorldCount }}
                </b>
              </button>
            </template>
          </XPlayerHud>
        </div>

        <div class="hud-announcement-slot" aria-live="polite">
          <Transition name="ticker-rise">
            <button
              v-if="showAnnouncement && !isStoryOverlayVisible"
              type="button"
              class="hud-announcement announcement-ticker"
              :aria-label="`查看世界消息：${hudAnnouncementTitle}`"
              @click="openWorldDrawer"
            >
              <span class="announcement-ticker__icon" aria-hidden="true">
                <GameIcon :icon="hudAnnouncementIcon" :size="15" />
              </span>
              <span class="announcement-ticker__viewport">
                <span class="announcement-ticker__line">
                  <strong>{{ hudAnnouncementTitle }}</strong>
                  <span>{{ hudAnnouncementMessage }}</span>
                </span>
              </span>
              <GameIcon class="announcement-ticker__arrow" icon="chevron-right" :size="14" aria-hidden="true" />
            </button>
          </Transition>
          <span
            v-if="!showAnnouncement || isStoryOverlayVisible"
            class="hud-time-strip"
            aria-label="当前修仙历与天气"
          >
            <GameIcon icon="clock" :size="13" />
            <span>{{ worldStore.currentTimeLabel }}</span>
            <i aria-hidden="true">·</i>
            <span>{{ weatherLabel }}</span>
          </span>
        </div>
      </div>

    </header>

    <Transition name="system-menu-rise">
      <div v-if="systemMenuOpen" class="system-menu" aria-label="系统菜单">
        <div class="system-menu-head">
          <div>
            <span>行囊与设置</span>
            <strong>{{ playerStore.name }}</strong>
          </div>
          <button type="button" aria-label="关闭系统菜单" @click="closeSystemMenu">
            <GameIcon icon="close" :size="16" />
          </button>
        </div>
        <div class="system-menu-grid">
          <button type="button" @click="openWorldDrawer">
            <GameIcon icon="globe" :size="17" />
            <span>世界记录</span>
            <b v-if="unreadWorldCount > 0">{{ unreadWorldCount }}</b>
          </button>
          <button type="button" @click="goToRoute('/game/profile')">
            <GameIcon icon="companion" :size="17" />
            <span>角色面板</span>
          </button>
          <button type="button" @click="goToRoute('/game/settings')">
            <GameIcon icon="settings" :size="17" />
            <span>设置</span>
          </button>
          <button type="button" @click="toggleBgmFromMenu">
            <GameIcon :icon="bgmEnabled ? 'Volume2' : 'VolumeX'" :size="17" />
            <span>{{ bgmEnabled ? '关闭音乐' : '开启音乐' }}</span>
          </button>
          <button type="button" @click="goToRoute('/')">
            <GameIcon icon="LogOut" :size="17" />
            <span>返回标题</span>
          </button>
        </div>
      </div>
    </Transition>

    <main class="main-shell">
      <div class="content-stage">
        <RouterView />
      </div>
    </main>

    <Transition v-if="showTabs" name="scrim-fade">
      <button
        v-if="worldDrawerOpen || systemMenuOpen"
        type="button"
        class="shell-scrim"
        aria-label="关闭浮层"
        @click="closeOverlays"
      ></button>
    </Transition>

    <Transition name="drawer-left">
      <aside v-if="worldDrawerOpen" class="world-drawer" aria-label="世界记录">
        <div class="world-drawer-head">
          <div>
            <span>世界记录</span>
            <strong>天地仍在运转</strong>
          </div>
          <button type="button" aria-label="关闭世界记录" @click="closeWorldDrawer">
            <GameIcon icon="close" :size="18" />
          </button>
        </div>
        <div class="world-drawer-summary">
          <span><GameIcon icon="clock" :size="14" /> {{ worldStore.currentTimeLabel }}</span>
          <span><GameIcon :icon="hudAnnouncementIcon" :size="14" /> {{ weatherLabel }}</span>
        </div>
        <div v-if="worldDrawerItems.length" class="world-drawer-list">
          <article v-for="item in worldDrawerItems" :key="item.id" class="world-drawer-item" :class="`severity-${item.severity}`">
            <div>
              <GameIcon :icon="item.icon" :size="16" />
              <strong>{{ item.title }}</strong>
            </div>
            <p>{{ item.message }}</p>
            <small>{{ item.timeLabel }}</small>
          </article>
        </div>
        <div v-else class="world-drawer-empty">
          <GameIcon icon="moon" :size="24" />
          <strong>暂时没有新的世界消息</strong>
          <span>挂机、赶路或推进时辰后，这里会留下世界的回声。</span>
        </div>
        <button type="button" class="world-history-button" @click="goToRoute('/game/cultivation')">
          <span>回到修炼主位</span>
          <GameIcon icon="chevron-right" :size="15" />
        </button>
      </aside>
    </Transition>

    <footer v-if="showTabs" class="nav-shell">
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
  XAvatarFrame,
  XPlayerHud,
  XTabBar,
  type XIconName,
  type XTone
} from '@rainlotus97/ui'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
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
import { formatWorldTimeAtTick } from '@/types/world'
import { GAME_THEME_TOKENS, MAIN_NAV_ITEMS, resolveRouteBgmType } from '@/game/theme/gameTheme'
import { resolveThemeCssVars } from '@/game/theme/themeAssetPack'
import { getWorldWeatherProfile } from '@/world/runtime/weatherCatalog'

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

type LayoutMode = 'normal' | 'half-immersive' | 'immersive' | 'battle'

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
const { bgmEnabled, switchBgm, setBgmEnabled } = useAudio()
const { isStoryOverlayVisible, isStandaloneStoryRoute, closeStoryOverlay } = useStoryOverlay()
const route = useRoute()
const router = useRouter()
const worldDrawerOpen = ref(false)
const systemMenuOpen = ref(false)
const announcementVisible = ref(false)
let worldTickTimer: number | null = null
let announcementDismissTimer: number | null = null

const WORLD_TICK_INTERVAL_MS = 60 * 1000

const menuItems: MenuItem[] = MAIN_NAV_ITEMS.map(item => ({
  ...item,
  icon: NAV_ICON_BY_PATH[item.path] ?? 'scroll'
}))

const primaryTabPaths = ['/game/cultivation', '/game/map', '/game/shop', '/game/profile']
const tabItems = computed<MenuItem[]>(() => primaryTabPaths
  .map(path => menuItems.find(item => item.path === path))
  .filter((item): item is MenuItem => Boolean(item)))
const tabBarItems = computed<HudTabItem[]>(() => [
  ...tabItems.value.map(item => ({
    value: item.path,
    label: item.shortName,
    icon: item.icon
  }))
])
const layoutMode = computed<LayoutMode>(() => {
  const routeMode = route.meta.layoutMode
  return routeMode === 'half-immersive' || routeMode === 'immersive' || routeMode === 'battle'
    ? routeMode
    : 'normal'
})
const showHud = computed(() => layoutMode.value === 'normal' || layoutMode.value === 'half-immersive')
const showTabs = computed(() => layoutMode.value === 'normal')
const latestWorldNotification = computed(() => worldStore.worldNotifications.find(notification => !notification.read) ?? null)
const unreadWorldCount = computed(() => worldStore.worldNotifications.filter(notification => !notification.read).length)
const showAnnouncement = computed(() => (
  (layoutMode.value === 'normal' || layoutMode.value === 'half-immersive')
  && announcementVisible.value
  && Boolean(latestWorldNotification.value)
))
const activeTabValue = computed(() => {
  if (route.path === '/game/adventure' || route.path === '/game/sect') return '/game/map'
  if (['/game/inventory', '/game/skills', '/game/companion'].includes(route.path)) return '/game/profile'
  return tabItems.value.some(item => item.path === route.path) ? route.path : '/game/cultivation'
})
const themeCssVars = computed(() => resolveThemeCssVars())

watch(
  () => latestWorldNotification.value?.id,
  notificationId => {
    if (announcementDismissTimer) {
      window.clearTimeout(announcementDismissTimer)
      announcementDismissTimer = null
    }

    announcementVisible.value = Boolean(notificationId)
    if (!notificationId) return

    announcementDismissTimer = window.setTimeout(() => {
      announcementVisible.value = false
      announcementDismissTimer = null
    }, 6800)
  },
  { immediate: true }
)

const worldDrawerItems = computed(() => worldStore.worldNotifications.slice(0, 8).map(notification => ({
  ...notification,
  icon: notification.kind === 'weather'
    ? 'cloud'
    : notification.kind === 'battle'
      ? 'sword'
      : notification.kind === 'unlock'
        ? 'map'
        : notification.kind === 'reward'
          ? 'gift'
          : notification.kind === 'story'
            ? 'scroll'
            : 'spark',
  timeLabel: formatWorldTimeAtTick(notification.createdAtTick)
})))

const isCultivationRoute = computed(() => route.path === '/game/cultivation')

const weatherLabel = computed(() => {
  return getWorldWeatherProfile(worldStore.weather).label
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

const hudAnnouncementTitle = computed(() => {
  return latestWorldNotification.value?.title ?? ''
})

const hudAnnouncementMessage = computed(() => {
  return latestWorldNotification.value?.message ?? ''
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
  if (realm.includes('炼气')) return 'cultivation'
  if (realm.includes('筑基')) return 'armor'
  if (realm.includes('金丹')) return 'spirit-stone'
  if (realm.includes('元婴')) return 'companion'
  if (realm.includes('化神')) return 'star'
  if (realm.includes('渡劫')) return 'thunder'
  if (realm.includes('大乘')) return 'sword'
  return 'spark'
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

function handleTabSelect(item: HudTabItem) {
  goToRoute(item.value)
}

function goToRoute(path: string) {
  closeOverlays()
  if (route.path !== path) void router.push(path)
}

function openWorldDrawer() {
  systemMenuOpen.value = false
  worldDrawerOpen.value = true
  worldStore.consumeWorldNotifications()
}

function handleOpenWorldDrawer() {
  openWorldDrawer()
}

function closeWorldDrawer() {
  worldDrawerOpen.value = false
}

function toggleSystemMenu() {
  worldDrawerOpen.value = false
  systemMenuOpen.value = !systemMenuOpen.value
}

function closeSystemMenu() {
  systemMenuOpen.value = false
}

function closeOverlays() {
  worldDrawerOpen.value = false
  systemMenuOpen.value = false
}

function toggleBgmFromMenu() {
  setBgmEnabled(!bgmEnabled.value)
  if (bgmEnabled.value) switchBgm(resolveRouteBgmType(route.fullPath))
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
  window.addEventListener('open-world-drawer', handleOpenWorldDrawer)
  startWorldClock()
  syncRouteBgm(route.fullPath)
  void ensureStoryOverlayReady()
})

watch(
  () => route.fullPath,
  path => {
    closeOverlays()
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
  window.removeEventListener('open-world-drawer', handleOpenWorldDrawer)
  if (worldTickTimer) {
    clearInterval(worldTickTimer)
    worldTickTimer = null
  }
  if (announcementDismissTimer) {
    clearTimeout(announcementDismissTimer)
    announcementDismissTimer = null
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

.game-layout.layout-immersive {
  grid-template-rows: minmax(0, 1fr);
}

.game-layout.layout-half-immersive {
  grid-template-rows: auto minmax(0, 1fr);
}

.layout-immersive .main-shell {
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

.layout-immersive .content-stage {
  height: 100%;
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
  inset: -2.5%;
  background:
    linear-gradient(180deg, rgba(247, 252, 251, 0.16), rgba(243, 248, 247, 0.38) 22%, rgba(230, 240, 239, 0.78) 100%),
    url('@/assets/theme/generated/main/bg-main-9x16-v1.png') center top / cover no-repeat;
  filter: saturate(0.96) blur(2px);
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
  min-width: 0;
  min-height: 2.65rem;
  gap: 0.28rem;
  padding: 0.36rem 0.4rem;
  overflow: hidden;
}

.player-hud :deep(.x-player-hud__resource > span:last-child) {
  min-width: 0;
  overflow: hidden;
}

.player-hud :deep(.x-player-hud__resource small) {
  font-size: 0.56rem;
}

.player-hud :deep(.x-player-hud__resource strong) {
  display: block;
  min-width: 0;
  overflow: hidden;
  font-size: 0.68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-hud :deep(.x-player-hud__resource strong em) {
  display: none;
}

.hud-announcement {
  width: 100%;
  min-width: 0;
}

.hud-announcement-slot {
  display: grid;
  align-items: center;
  width: 100%;
  min-width: 0;
  height: 2.25rem;
  min-height: 2.25rem;
}

.hud-time-strip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-width: 0;
  color: rgba(72, 108, 101, 0.66);
  font-size: 0.62rem;
  line-height: 1;
  white-space: nowrap;
}

.hud-time-strip span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.hud-time-strip i {
  color: rgba(155, 110, 36, 0.56);
  font-style: normal;
}

.announcement-ticker {
  display: grid;
  grid-template-columns: 1.9rem minmax(0, 1fr) 1.2rem;
  align-items: center;
  gap: 0.48rem;
  height: 2.25rem;
  min-height: 2.25rem;
  padding: 0 0.58rem;
  border: 1px solid rgba(101, 152, 145, 0.2);
  border-radius: 0.82rem;
  background: rgba(248, 255, 250, 0.84);
  color: #3e6f66;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.announcement-ticker:active {
  transform: scale(0.99);
}

.announcement-ticker__icon {
  display: grid;
  place-items: center;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 50%;
  background: rgba(226, 244, 235, 0.88);
  color: #4d897a;
}

.announcement-ticker__viewport {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.announcement-ticker__line {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  min-width: max-content;
  font-size: 0.68rem;
  line-height: 1;
  white-space: nowrap;
}

.announcement-ticker__line strong {
  color: #93682a;
  font-size: 0.76rem;
  font-weight: 700;
}

.announcement-ticker__line span {
  color: rgba(65, 99, 94, 0.78);
}

.announcement-ticker__arrow {
  color: #7b9e93;
}

.avatar-glyph {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
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
  container: game-stage / inline-size;
}

.nav-shell {
  position: relative;
  z-index: 18;
  padding: 0 0.8rem calc(0.55rem + env(safe-area-inset-bottom, 0px));
  pointer-events: none;
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

  .nav-drawer {
    max-height: min(52vh, 420px);
  }

}

@media (min-width: 900px) {
  .game-layout {
    max-width: 1180px;
  }

  .top-shell {
    padding-inline: 1.15rem;
  }

  .main-shell {
    padding: 10px 18px 14px;
  }

  .game-layout.is-cultivation .main-shell {
    padding: 8px 16px 12px;
  }

  .nav-shell {
    padding-inline: 1.15rem;
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

/* Mobile shell: the viewport is the frame; secondary content opens in panels. */
.game-layout {
  width: min(100%, 430px);
  max-width: 430px;
  min-width: 320px;
  margin: 0 auto;
  --mobile-tab-height: 4.2rem;
  --mobile-nav-height: calc(var(--mobile-tab-height) + 0.55rem + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, #f7fcf8 0%, #edf6f0 54%, #e5f0ea 100%);
}

.layout-backdrop,
.layout-backdrop::after {
  background-image: none !important;
  display: block;
}

.layout-backdrop::before {
  background: none !important;
  opacity: 0 !important;
}

.game-layout.is-cultivation .layout-backdrop::before {
  display: block;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(247, 252, 251, 0.14), rgba(243, 248, 247, 0.34) 34%, rgba(230, 240, 239, 0.82) 100%),
    url('@/assets/theme/generated/main/bg-main-9x16-v1.png') center top / cover no-repeat !important;
  filter: saturate(0.94);
  opacity: 0.72 !important;
}

.main-shell {
  min-height: 0;
  overflow: hidden !important;
  padding: 6px 8px var(--mobile-nav-height);
  overscroll-behavior: none;
}

.game-layout.is-cultivation .main-shell {
  padding: 6px 8px var(--mobile-nav-height);
}

.content-stage {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.content-stage > * {
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.nav-shell {
  position: fixed;
  right: auto;
  bottom: 0;
  left: 50%;
  width: min(100vw, 430px);
  height: var(--mobile-nav-height);
  min-height: var(--mobile-nav-height);
  max-height: var(--mobile-nav-height);
  transform: translateX(-50%);
  box-sizing: border-box;
  padding-inline: 0.75rem;
  padding-bottom: calc(0.55rem + env(safe-area-inset-bottom, 0px));
}

.game-layout.is-cultivation .top-shell {
  padding-top: calc(0.55rem + env(safe-area-inset-top, 0px));
  padding-inline: 0.7rem;
}

.game-layout.is-cultivation .hud-stack {
  gap: 0.36rem;
}

.main-tab-bar {
  box-sizing: border-box;
  height: var(--mobile-tab-height);
  min-height: var(--mobile-tab-height);
  max-height: var(--mobile-tab-height);
  padding: 0.3rem 0.24rem;
  align-items: stretch;
  grid-auto-rows: minmax(0, 1fr);
}

.main-tab-bar :deep(.x-tab-bar__item) {
  height: 100%;
  min-height: 0;
  padding: 0.26rem 0.08rem;
}

.hud-row {
  position: relative;
  min-width: 0;
}

.player-hud {
  padding-right: 0;
}

.avatar-trigger {
  display: grid;
  place-items: center;
  position: relative;
  width: 2.9rem;
  height: 2.9rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
}

.avatar-trigger:active {
  transform: scale(0.97);
}

.avatar-trigger__badge {
  position: absolute;
  top: -0.22rem;
  right: -0.26rem;
  display: grid;
  place-items: center;
  min-width: 1rem;
  height: 1rem;
  padding-inline: 0.18rem;
  border-radius: 999px;
  background: #c87869;
  color: #fffaf6;
  font: 700 0.58rem/1 var(--font-reading-sans), sans-serif;
}

.player-hud :deep(.x-player-hud__identity) {
  min-width: 10rem;
}

.player-hud :deep(.x-player-hud__resource) {
  justify-content: flex-start;
  gap: 0.28rem;
  padding-inline: 0.4rem;
}

.player-hud :deep(.x-player-hud__resource small) {
  display: block;
  font-size: 0.56rem;
}

.player-hud :deep(.x-player-hud__resource strong) {
  font-size: 0.68rem;
}

.player-hud :deep(.x-player-hud__resource > span) {
  place-items: start;
}

.player-hud :deep(.x-player-hud__resource strong em) {
  display: none;
}

.player-hud :deep(.x-player-hud__resource) {
  overflow: hidden;
}

.player-hud :deep(.x-player-hud__resource strong),
.player-hud :deep(.x-player-hud__resource small) {
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-hud :deep(.x-player-hud__resources) {
  min-width: 0;
}

.avatar-trigger .avatar-glyph {
  pointer-events: none;
}

.system-menu button:active,
.world-drawer-head button:active,
.world-history-button:active {
  transform: scale(0.97);
}

.system-menu {
  position: fixed;
  top: calc(4.65rem + env(safe-area-inset-top, 0px));
  right: max(0.75rem, calc((100vw - 430px) / 2 + 0.75rem));
  z-index: 60;
  width: min(17rem, calc(100vw - 1.5rem));
  max-height: calc(100dvh - 7rem);
  padding: 0.82rem;
  border: 1px solid rgba(82, 136, 120, 0.2);
  border-radius: 1rem;
  background: rgba(250, 255, 249, 0.97);
  box-shadow: 0 18px 40px rgba(68, 104, 96, 0.2);
  overflow: auto;
  pointer-events: auto;
}

.system-menu-head,
.world-drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.system-menu-head > div,
.world-drawer-head > div {
  display: grid;
  gap: 0.18rem;
}

.system-menu-head span,
.world-drawer-head span {
  color: rgba(72, 108, 101, 0.68);
  font-size: 0.68rem;
}

.system-menu-head strong,
.world-drawer-head strong {
  color: #315d58;
  font-size: 1rem;
}

.system-menu-head button,
.world-drawer-head button {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(82, 136, 120, 0.18);
  border-radius: 0.62rem;
  background: rgba(237, 247, 239, 0.82);
  color: #527e74;
  cursor: pointer;
}

.system-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
  margin-top: 0.75rem;
}

.system-menu-grid button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.8rem;
  padding: 0.45rem 0.52rem;
  border: 1px solid rgba(82, 136, 120, 0.15);
  border-radius: 0.68rem;
  background: rgba(244, 251, 245, 0.88);
  color: #416d65;
  font-size: 0.72rem;
  text-align: left;
  cursor: pointer;
}

.shell-scrim {
  position: fixed;
  inset: 0;
  z-index: 45;
  border: 0;
  background: rgba(39, 66, 61, 0.16);
  backdrop-filter: blur(2px);
  cursor: pointer;
}

.world-drawer {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: min(22rem, calc(100% - 2rem));
  padding: calc(1rem + env(safe-area-inset-top, 0px)) 1rem calc(1rem + env(safe-area-inset-bottom, 0px));
  border-right: 1px solid rgba(75, 128, 117, 0.24);
  background: rgba(248, 253, 248, 0.98);
  box-shadow: 18px 0 42px rgba(57, 93, 84, 0.18);
}

.world-drawer-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
  margin-top: 1rem;
}

.world-drawer-summary span {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  min-height: 1.8rem;
  padding: 0 0.55rem;
  border: 1px solid rgba(83, 134, 119, 0.15);
  border-radius: 999px;
  background: rgba(232, 245, 235, 0.78);
  color: #4c766e;
  font-size: 0.68rem;
}

.world-drawer-list {
  display: grid;
  gap: 0.55rem;
  min-height: 0;
  margin-top: 1rem;
  overflow: auto;
  overscroll-behavior: contain;
}

.world-drawer-item {
  display: grid;
  gap: 0.35rem;
  padding: 0.72rem;
  border-left: 3px solid #74a995;
  border-radius: 0.72rem;
  background: rgba(237, 247, 239, 0.8);
}

.world-drawer-item.severity-major,
.world-drawer-item.severity-legendary {
  border-left-color: #be7d63;
  background: rgba(255, 244, 233, 0.84);
}

.world-drawer-item > div {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #477970;
}

.world-drawer-item strong {
  color: #365f59;
  font-size: 0.84rem;
}

.world-drawer-item p {
  margin: 0;
  color: rgba(64, 91, 86, 0.82);
  font-size: 0.76rem;
  line-height: 1.52;
}

.world-drawer-item small {
  color: rgba(79, 112, 105, 0.58);
  font-size: 0.62rem;
}

.world-drawer-empty {
  display: grid;
  justify-items: center;
  gap: 0.48rem;
  margin: auto 0;
  padding: 1.5rem 1rem;
  color: rgba(72, 108, 101, 0.58);
  text-align: center;
}

.world-drawer-empty strong {
  color: #4d766e;
  font-size: 0.86rem;
}

.world-drawer-empty span {
  max-width: 14rem;
  font-size: 0.72rem;
  line-height: 1.5;
}

.world-history-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 2.8rem;
  margin-top: auto;
  padding: 0 0.8rem;
  border: 1px solid rgba(155, 110, 36, 0.28);
  border-radius: 0.72rem;
  background: rgba(255, 250, 232, 0.9);
  color: #8b6326;
  font-size: 0.76rem;
  cursor: pointer;
}

@media (prefers-reduced-motion: no-preference) {
  .announcement-ticker__line {
    animation: announcement-ticker-pan 10s ease-in-out infinite alternate;
  }
}

@keyframes announcement-ticker-pan {
  0%, 24% { transform: translateX(0); }
  76%, 100% { transform: translateX(-18%); }
}

.drawer-left-enter-active,
.drawer-left-leave-active,
.system-menu-rise-enter-active,
.system-menu-rise-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.drawer-left-enter-from,
.drawer-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.system-menu-rise-enter-from,
.system-menu-rise-leave-to {
  opacity: 0;
  transform: translateY(-0.4rem);
}

.ticker-rise-enter-active,
.ticker-rise-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.ticker-rise-enter-from,
.ticker-rise-leave-to {
  opacity: 0;
  transform: translateY(-0.28rem);
}

@media (prefers-reduced-motion: reduce) {
  .announcement-ticker__line {
    animation: none;
  }

  .drawer-left-enter-active,
  .drawer-left-leave-active,
  .system-menu-rise-enter-active,
  .system-menu-rise-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
