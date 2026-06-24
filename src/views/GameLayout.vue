<template>
  <div class="game-layout" :class="{ 'is-cultivation': isCultivationRoute }" :style="themeCssVars">
    <div class="layout-backdrop"></div>

    <header class="top-shell">
      <div class="hud-shell" :class="`tone-${sectAlertTone}`">
        <div class="player-block">
          <div class="avatar-orb" :class="getRealmClass">
            <div class="avatar-orb-inner">
              <span class="avatar-glyph">{{ realmIcon }}</span>
            </div>
          </div>
          <div class="player-copy">
            <strong>{{ sectStore.currentSect?.name ?? playerStore.name }}</strong>
            <span class="realm-pill" :class="getRealmClass">{{ playerStore.name }} · {{ playerStore.realmInfo.fullName }}</span>
            <small>{{ worldStore.currentTimeLabel }} · {{ weatherLabel }}</small>
          </div>
        </div>

        <div class="resource-row" aria-label="主资源状态">
          <ThemeHomeResourcePill label="修为" :value="resourceCultivationDisplay" suffix="+">
            <template #icon>
              <GameIcon icon="修" :size="18" />
            </template>
          </ThemeHomeResourcePill>
          <ThemeHomeResourcePill label="灵石" :value="playerStore.gold" suffix="+">
            <template #icon>
              <GameIcon icon="石" :size="18" />
            </template>
          </ThemeHomeResourcePill>
          <ThemeHomeResourcePill label="异闻" :value="worldStore.visibleLogs.length" suffix="+">
            <template #icon>
              <GameIcon icon="闻" :size="18" />
            </template>
          </ThemeHomeResourcePill>
        </div>

        <p v-if="!isStoryOverlayVisible && !isCultivationRoute" class="world-summary">
          <span>{{ currentSectionName }}</span>
          {{ sectAlertSummary }}
        </p>
        <p v-if="!isStoryOverlayVisible && ambientPrompt && !isCultivationRoute" class="encounter-prompt">{{ ambientPrompt }}</p>
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
      </Transition>

      <nav class="tab-bar" aria-label="主循环导航">
        <RouterLink
          v-for="item in tabItems"
          :key="item.path"
          :to="item.path"
          class="tab-item"
          :class="{ active: isActive(item.path) }"
        >
          <ThemeHomeNavTab :label="item.shortName" :active="isActive(item.path)">
            <template #icon>
              <component :is="item.icon" :size="21" />
            </template>
          </ThemeHomeNavTab>
        </RouterLink>

        <button
          class="tab-item tab-more"
          :class="{ active: isMenuExpanded }"
          type="button"
          @click.stop="toggleMenu"
        >
          <ThemeHomeNavTab :label="isMenuExpanded ? '收起' : '更多'" :active="isMenuExpanded">
            <template #icon>
              <component :is="isMenuExpanded ? X : Grid3X3" :size="21" />
            </template>
          </ThemeHomeNavTab>
        </button>
      </nav>
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
import { computed, onMounted, onUnmounted, ref, watch, type Component } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import {
  Grid3X3,
  X
} from 'lucide-vue-next'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import AnnouncementModal from '@/components/modal/AnnouncementModal.vue'
import ItemAcquireModal from '@/components/modal/ItemAcquireModal.vue'
import GameDialog from '@/components/game-ui/GameDialog.vue'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import StoryPlayer from '@/components/story/StoryPlayer.vue'
import ThemeHomeNavTab from '@/components/theme/homepage/ThemeHomeNavTab.vue'
import ThemeHomeResourcePill from '@/components/theme/homepage/ThemeHomeResourcePill.vue'
import { sfxDiscovery, sfxStoryChoice, useAudio } from '@/composables/useAudio'
import { useRandomEvent } from '@/composables/useRandomEvent'
import { useStoryOverlay } from '@/composables/useStoryOverlay'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { useStoryStore } from '@/story/storyStore'
import { getSectById } from '@/types/sect'
import { GAME_THEME_TOKENS, MAIN_NAV_ITEMS, resolveGameIconComponent, resolveRouteBgmType } from '@/game/theme/gameTheme'
import { resolveThemeCssVars } from '@/game/theme/themeAssetPack'

interface MenuItem {
  path: string
  name: string
  shortName: string
  desc: string
  icon: Component
}

const playerStore = usePlayerStore()
const sectStore = useSectStore()
const storyStore = useStoryStore()
const worldStore = useWorldStore()
const randomEvent = useRandomEvent()
const { bgmEnabled, switchBgm } = useAudio()
const { isStoryOverlayVisible, isStandaloneStoryRoute, closeStoryOverlay } = useStoryOverlay()
const route = useRoute()
const isMenuExpanded = ref(false)
let worldTickTimer: number | null = null

const WORLD_TICK_INTERVAL_MS = 60 * 1000

const menuItems: MenuItem[] = MAIN_NAV_ITEMS.map(item => ({
  ...item,
  icon: resolveGameIconComponent(item.icon)
}))

const tabItems = computed<MenuItem[]>(() => menuItems.slice(0, 5))
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

const sectAlertTone = computed<'jade' | 'gold' | 'mist'>(() => {
  if (playerStore.captivity.isCaptured || sectStore.worldCondition.status === 'collapsed') {
    return 'mist'
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
    url('@/assets/theme/generated/homepage-v3-scenic-focus-clean.png') center top / cover no-repeat;
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

.hud-shell,
.nav-drawer,
.tab-bar {
  margin: 0 auto;
}

.hud-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
  padding: 0.1rem 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  pointer-events: auto;
}

.game-layout.is-cultivation .top-shell {
  padding-top: calc(0.18rem + env(safe-area-inset-top, 0px));
  padding-inline: 0.58rem;
}

.game-layout.is-cultivation .hud-shell {
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 0.26rem;
}

.game-layout.is-cultivation .player-block {
  min-width: 0;
  padding-top: 0.02rem;
  gap: 0.56rem;
}

.game-layout.is-cultivation .resource-row {
  align-self: start;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.2rem;
  justify-content: stretch;
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
  gap: 0.75rem;
}

.avatar-orb {
  flex: 0 0 auto;
  position: relative;
  width: 4.1rem;
  height: 4.1rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 251, 238, 0.98), rgba(239, 248, 244, 0.94)),
    radial-gradient(circle at top, rgba(255, 220, 146, 0.2), transparent 58%);
  border: 1px solid rgba(205, 177, 116, 0.42);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.7),
    0 16px 28px rgba(88, 123, 116, 0.12);
}

.avatar-orb::before,
.avatar-orb::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.avatar-orb::before {
  inset: 0.2rem;
  border: 1px solid rgba(118, 181, 171, 0.34);
}

.avatar-orb::after {
  right: 0.1rem;
  top: 0.18rem;
  width: 0.62rem;
  height: 0.62rem;
  background: linear-gradient(180deg, #f19a74, #dd7751);
  box-shadow: 0 0 0 0.14rem rgba(255, 251, 247, 0.95);
}

.avatar-orb-inner {
  width: 3.1rem;
  height: 3.1rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.9), transparent 34%),
    linear-gradient(180deg, rgba(185, 226, 220, 0.9), rgba(120, 184, 176, 0.86));
  border: 1px solid rgba(111, 164, 155, 0.3);
  box-shadow: inset 0 2px 8px rgba(255, 255, 255, 0.34);
}

.avatar-orb.realm-golden .avatar-orb-inner,
.avatar-orb.realm-mahayana .avatar-orb-inner {
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.9), transparent 34%),
    linear-gradient(180deg, rgba(242, 220, 152, 0.92), rgba(209, 169, 82, 0.9));
}

.avatar-orb.realm-infant .avatar-orb-inner,
.avatar-orb.realm-god .avatar-orb-inner {
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.9), transparent 34%),
    linear-gradient(180deg, rgba(206, 191, 242, 0.92), rgba(145, 120, 204, 0.9));
}

.avatar-orb.realm-tribulation .avatar-orb-inner {
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.9), transparent 34%),
    linear-gradient(180deg, rgba(178, 224, 233, 0.94), rgba(78, 164, 184, 0.9));
}

.avatar-orb.realm-foundation .avatar-orb-inner,
.avatar-orb.realm-immortal .avatar-orb-inner {
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.9), transparent 34%),
    linear-gradient(180deg, rgba(194, 230, 193, 0.94), rgba(99, 176, 125, 0.9));
}

.player-copy {
  display: grid;
  gap: 0.18rem;
  min-width: 0;
}

.player-copy strong {
  overflow: hidden;
  color: #4d4b45;
  font-size: 1.35rem;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-copy small {
  color: rgba(95, 104, 108, 0.76);
  font-size: 0.78rem;
}

.realm-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  color: #4c5960;
  font-size: 0.96rem;
  line-height: 1.2;
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

.resource-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  justify-content: end;
  gap: 0.4rem;
}

.world-summary {
  grid-column: 1 / -1;
  margin: 0;
  color: rgba(74, 94, 97, 0.78);
  font-size: 0.72rem;
  line-height: 1.36;
  text-align: right;
}

.encounter-prompt {
  margin: -0.1rem 0 0;
  color: rgba(95, 109, 91, 0.72);
  font-size: 0.62rem;
  line-height: 1.36;
  text-align: right;
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

.nav-shell .tab-bar,
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
  pointer-events: none;
  backdrop-filter: blur(1px);
}

.nav-drawer {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: calc(78px + env(safe-area-inset-bottom, 0px));
  margin-bottom: 10px;
  width: 100%;
  max-height: min(50vh, 430px);
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
  width: 40px;
  height: 40px;
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
  border-radius: 10px;
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
  border-radius: 10px;
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
  position: relative;
  z-index: 44;
  min-height: 4.9rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: end;
  gap: 0;
  padding: 0.34rem 0.28rem 0.14rem;
  border: 1px solid rgba(224, 205, 175, 0.78);
  border-radius: 1.8rem 1.8rem 0 0;
  background:
    linear-gradient(180deg, rgba(255, 253, 248, 0.96), rgba(248, 247, 243, 0.92)),
    radial-gradient(circle at top, rgba(255, 223, 147, 0.16), transparent 58%);
  box-shadow: 0 -0.1rem 0 rgba(255, 255, 255, 0.8), 0 -0.5rem 2rem rgba(72, 98, 100, 0.1);
  backdrop-filter: blur(18px);
}

.game-layout.is-cultivation .tab-bar {
  min-height: 4.35rem;
  padding: 0.22rem 0.18rem 0.08rem;
  border-radius: 1.55rem 1.55rem 0 0;
}

.tab-item {
  min-width: 0;
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
}

.tab-item + .tab-item {
  position: relative;
}

.tab-item + .tab-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.85rem;
  bottom: 0.75rem;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(208, 192, 162, 0.72), transparent);
}

.world-summary span {
  display: inline-flex;
  margin-right: 0.5rem;
  padding: 0.12rem 0.45rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(188, 141, 58, 0.24);
  background: rgba(255, 248, 229, 0.72);
  color: #8b6226;
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .menu-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .hud-shell {
    gap: 0.4rem;
  }

  .game-layout.is-cultivation .hud-shell {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.22rem;
  }

  .player-block {
    gap: 0.65rem;
  }

  .player-copy {
    gap: 0.12rem;
  }

  .player-copy strong {
    font-size: 1.18rem;
  }

  .player-copy small {
    font-size: 0.72rem;
  }

  .realm-pill {
    font-size: 0.86rem;
  }

  .resource-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
  }

  .game-layout.is-cultivation .player-copy strong {
    font-size: 1.06rem;
  }

  .game-layout.is-cultivation .top-shell {
    padding-top: calc(0.08rem + env(safe-area-inset-top, 0px));
    padding-inline: 0.5rem;
  }

  .game-layout.is-cultivation .player-block {
    gap: 0.46rem;
  }

  .game-layout.is-cultivation .realm-pill {
    font-size: 0.8rem;
  }

  .game-layout.is-cultivation .player-copy small {
    font-size: 0.68rem;
  }

  .game-layout.is-cultivation .resource-row {
    gap: 3px;
  }

  .game-layout.is-cultivation .nav-shell {
    padding-inline: 0.46rem;
    padding-bottom: calc(0.14rem + env(safe-area-inset-bottom, 0px));
  }

  .game-layout.is-cultivation .tab-bar {
    min-height: 4.12rem;
    padding: 0.18rem 0.12rem 0.05rem;
    border-radius: 1.35rem 1.35rem 0 0;
  }

  .game-layout.is-cultivation .realm-pill {
    font-size: 0.82rem;
  }

  .game-layout.is-cultivation .player-copy small {
    font-size: 0.68rem;
  }

  .resource-row :deep(.theme-home-resource-pill) {
    width: 100%;
  }

  .world-summary {
    display: none;
  }

  .nav-drawer {
    max-height: min(52vh, 420px);
  }

  .nav-scrim {
    inset: 0;
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
    min-height: 4.55rem;
    padding: 0.28rem 0.22rem 0.1rem;
    border-radius: 1.55rem 1.55rem 0 0;
  }
}
</style>
