<template>
  <div class="story-player" @click="handleStageTap">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">风声正在接过来…</p>
    </div>

    <template v-else-if="currentNode">
      <StorySceneHeader
        :map-name="currentNode.map"
        :presence-label="headerPresenceLabel"
        :scene-hint="''"
        @back="$emit('back')"
      />

      <div class="story-stage" :class="{ 'story-stage-live': showDialogs || showChoices || showMonologue }">
        <section
          class="story-stage-event-shell"
          :class="[
            `template-${eventTemplate}`,
            {
              'with-illustration': !!currentIllustration,
              'with-supporting-visual': currentIllustration && currentIllustration.type !== 'character',
              'with-dialog': hasEventDialogue,
              'can-rest-here': canPauseHere && !showDialogs && !showChoices && !showMonologue,
              'compact-moment': isCompactNarrationMoment
            }
          ]"
        >
          <div
            v-if="currentIllustration && currentIllustration.type !== 'character'"
            class="story-stage-supporting-visual"
          >
            <StoryIllustrationPanel
              :illustration="currentIllustration"
              mode="supporting"
            />
          </div>

          <div class="story-stage-copy-flow">
            <StoryIllustrationPanel
              v-if="currentIllustration && currentIllustration.type === 'character' && shouldShowCharacterIllustration && isDebutDialog"
              :illustration="currentIllustration"
            />

            <StoryCharacterDebutBanner
              v-if="showDebutBanner"
              :profile="activeDebutCharacterProfile"
            />

            <StoryTextPanel
              v-if="showStoryTextPanel && !useLightweightPauseNarration"
              :page-status="pageStatusText"
              :page-count-label="currentPageCountLabel"
              :auto-label="autoAdvanceLabel"
              :typing="!pageComplete"
              :has-next="hasNextPage"
              :scene-pulse="currentBeatLabel"
              :scene-hint="storyPanelHint"
              :compact-meta="true"
              :short-text="isShortNarrationPage"
            >
              <TypewriterText
                :text="displayPageText"
                :speed="16"
                :instant="pageInstant || shouldInstantRevealPage"
                :prefill="displayPageText.length <= 8 ? 2 : 4"
                @complete="onPageComplete"
              />
              <p v-if="!displayPageText" class="story-fallback-text">这口风一散，马上就会接回上一截。</p>
            </StoryTextPanel>

            <div v-if="showPauseFallbackPanel || useLightweightPauseNarration" class="story-pause-card">
              <p class="story-pause-copy">{{ useLightweightPauseNarration ? displayPageText : pauseFallbackText }}</p>
            </div>

            <StoryDialogList
              v-if="showDialogs"
              :dialogs="dialogs"
              :active-index="currentDialogIndex"
              :single-mode="dialogs.length > 1"
              :instant="dialogInstant"
              :variant="isDebutDialog ? 'debut' : 'default'"
              @select="showNextDialog"
              @complete="onDialogLineComplete"
            />

            <section v-if="showMonologue" class="inner-monologue">
              <span>一念掠过</span>
              <TypewriterText
                :text="currentNode.content.innerMonologue ?? ''"
                :speed="22"
                @complete="onMonologueComplete"
              />
            </section>
          </div>
        </section>

        <div v-if="canPauseHere && !showDialogs && !showChoices && !showMonologue" class="story-pause-strip">
          <span class="story-pause-badge">{{ pauseBadgeText }}</span>
        </div>

        <StoryChoiceList
          v-if="showChoices"
          :choices="visibleChoices"
          @choose="selectChoice"
        />
      </div>
    </template>

    <div v-else class="empty-state">
      <p>眼前的事还没完全拢住，马上就接回上一截。</p>
    </div>

    <StoryNotificationStack v-if="notifications.length > 0" :notifications="notifications" />

    <EndingDisplay
      v-if="showEnding && currentTermination"
      :termination="currentTermination"
      @continueNextVolume="handleContinueNextVolume"
      @viewEndingGallery="handleViewEndingGallery"
      @restart="handleRestart"
      @returnToMenu="handleReturnToMenu"
    />

    <VolumeEndDisplay
      v-if="showVolumeEnd && currentTermination"
      :volumeNumber="currentTermination.volumeNumber || 1"
      :hasNextVolume="currentTermination?.hasNextVolume || false"
      @continue="handleContinueNextVolume"
      @returnToMenu="handleReturnToMenu"
    />

    <SideQuestPanel
      :visible="showSideQuestPanel && !showEnding && !showVolumeEnd && !showGameplay"
      @trigger="onSideQuestTrigger"
      @close="showSideQuestPanel = false"
    />

    <div v-if="showGameplay && currentGameplayTrigger" class="gameplay-layer">
      <GameplayEmbed
        :gameplay-type="currentGameplayTrigger.type"
        :target-id="currentGameplayTrigger.targetId ?? ''"
        :params="currentGameplayTrigger.params"
        :can-skip="false"
        @complete="onGameplayComplete"
        @skip="onGameplaySkip"
      />
    </div>

    <EffectFeedback />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { useStoryStore } from '@/story/storyStore'
import TypewriterText from './TypewriterText.vue'
import EndingDisplay from './EndingDisplay.vue'
import VolumeEndDisplay from './VolumeEndDisplay.vue'
import SideQuestPanel from './SideQuestPanel.vue'
import EffectFeedback from './EffectFeedback.vue'
import GameplayEmbed from './GameplayEmbed.vue'
import StoryChoiceList from './StoryChoiceList.vue'
import StoryCharacterDebutBanner from './StoryCharacterDebutBanner.vue'
import StoryDialogList from './StoryDialogList.vue'
import StoryIllustrationPanel from './StoryIllustrationPanel.vue'
import StoryNotificationStack from './StoryNotificationStack.vue'
import StorySceneHeader from './StorySceneHeader.vue'
import StoryTextPanel from './StoryTextPanel.vue'
import {
  resolveStoryCharacterProfileById,
  resolveStoryCharacterProfileByName,
  STORY_PROTAGONIST_PROFILE_IDS
} from '@/story/runtime/storyCharacterCodex'
import { enrichStoryDialogVisual, resolveStoryIllustration } from '@/story/runtime/storyArtResolver'
import { emitStoryVoiceCue } from '@/story/runtime/storyVoiceBridge'
import {
  sfxStoryChoice,
  sfxStoryDialog,
  sfxStoryTextSettle
} from '@/composables/useAudio'
import type { GameplayResult, GameplayTrigger, StoryTermination } from '@/story/types'

const AUTO_ADVANCE_DELAY_MS = 180
const STORY_OPENING_CINEMATIC_PAGES = 6
const STORY_PAGE_CHAR_LIMIT = 34
const STORY_PAGE_HARD_LIMIT = 46
const STORY_PAGE_MIN_LENGTH = 14
const STORY_DIALOG_PAGE_CHAR_LIMIT = 28
const STORY_DIALOG_PAGE_HARD_LIMIT = 40
const STORY_DIALOG_PAGE_MIN_LENGTH = 12
const STORY_PAGE_AUTO_ADVANCE_MIN_MS = 1120
const STORY_PAGE_AUTO_ADVANCE_MAX_MS = 2840
const STORY_DIALOG_AUTO_ADVANCE_BASE_MS = 680

const emit = defineEmits<{
  back: []
}>()

const store = useStoryStore()
const playerStore = usePlayerStore()
const router = useRouter()
const route = useRoute()

const isLoading = computed(() => store.isLoading)
const currentNode = computed(() => store.currentNode)
const notifications = computed(() => store.notifications)
const readableFallbackText = computed(() => store.currentReadableText?.trim() ?? '')

const pageIndex = ref(0)
const pageComplete = ref(false)
const pageInstant = ref(false)
const currentDialogIndex = ref(0)
const dialogsViewed = ref(false)
const dialogLineComplete = ref(false)
const dialogInstant = ref(false)
const autoAdvanceTimer = ref<number | null>(null)
const autoPageAdvanceTimer = ref<number | null>(null)
const autoDialogAdvanceTimer = ref<number | null>(null)

const showEnding = ref(false)
const showVolumeEnd = ref(false)
const currentTermination = ref<StoryTermination | null>(null)

const showGameplay = ref(false)
const currentGameplayTrigger = ref<GameplayTrigger | null>(null)
const showSideQuestPanel = ref(true)
const monologueComplete = ref(false)
const seenDebutCharacterIds = ref<string[]>([])
const lastDialogVoiceKey = ref('')
const lastDebutVoiceKey = ref('')

const perspectiveText = computed(() => {
  if (!currentNode.value) return ''
  if (store.currentPerspective === 'male' && currentNode.value.content.maleText) {
    return currentNode.value.content.maleText
  }
  if (store.currentPerspective === 'female' && currentNode.value.content.femaleText) {
    return currentNode.value.content.femaleText
  }
  return currentNode.value.content.text || ''
})

const textPages = computed(() => splitStoryText(perspectiveText.value))
const hasRawDialogs = computed(() => (currentNode.value?.content.npcDialogs?.length ?? 0) > 0)
const hasRawMonologue = computed(() => Boolean(currentNode.value?.content.innerMonologue))
const isNarrativeScene = computed<boolean>(() => !hasRawDialogs.value && !hasRawMonologue.value)
const isChapterOpeningNarration = computed<boolean>(() => (
  isNarrativeScene.value
  && currentNode.value?.id.endsWith(':s1') === true
))

const dialogs = computed(() => {
  const source = currentNode.value?.content.npcDialogs ?? []
  return source.flatMap(dialog => {
    const enriched = enrichStoryDialogVisual(dialog)
    const pages = splitDialogText(enriched.content)
    if (pages.length <= 1) return [enriched]
    return pages.map(page => ({
      ...enriched,
      content: page,
      speakerTitle: enriched.speakerTitle
    }))
  })
})
const currentIllustration = computed(() => resolveStoryIllustration(currentNode.value))
const hasNarrationIllustration = computed(() => (
  isNarrativeScene.value
  && Boolean(currentIllustration.value)
))
const displayPages = computed<string[]>(() => {
  const pages = textPages.value
    .map((page, index) => formatStoryPageText(page, {
      cinematic: (
        isChapterOpeningNarration.value
        && index < STORY_OPENING_CINEMATIC_PAGES
        && !hasNarrationIllustration.value
      ),
      firstNarrationPage: isNarrativeScene.value && index === 0,
      openingNarrationPage: (
        isChapterOpeningNarration.value
        && index < STORY_OPENING_CINEMATIC_PAGES
        && !hasNarrationIllustration.value
      ),
      leadTitle: '',
      hasIllustration: hasNarrationIllustration.value,
      pageIndex: index
    }))
    .filter(page => page.trim().length > 0)

  if (!hasNarrationIllustration.value) return pages
  return compactIllustratedOpeningPages(pages)
})

const hasStoryPages = computed<boolean>(() => displayPages.value.length > 0)
const currentPageText = computed(() => displayPages.value[pageIndex.value] ?? '')
const hasNextPage = computed(() => hasStoryPages.value && pageIndex.value < displayPages.value.length - 1)
const narrativeFlowComplete = computed<boolean>(() => !hasStoryPages.value || (pageComplete.value && !hasNextPage.value))
const showDialogs = computed<boolean>(() => narrativeFlowComplete.value && dialogs.value.length > 0)
const showMonologue = computed(() => narrativeFlowComplete.value && dialogsViewed.value && Boolean(currentNode.value?.content.innerMonologue))
const visibleChoices = computed(() => {
  const choices = currentNode.value?.content.choices ?? []
  if (choices.length === 1 && isImplicitAdvanceChoice(choices[0]?.text ?? '')) return []
  return choices.map(choice => {
    const text = choice.text?.trim() ?? ''
    if ((choice.isEndMarker || choice.targetId === null) && /终章待续|未完待续|本章完|章·完|卷[一二三四五六七八九十百千\d]+|第.+章/u.test(text)) {
      return {
        ...choice,
        text: '先把这件事压住'
      }
    }
    return choice
  })
})
const showChoices = computed(() => {
  const choices = visibleChoices.value
  const noDialogs = dialogs.value.length === 0
  return narrativeFlowComplete.value
    && (noDialogs || dialogsViewed.value)
    && (!currentNode.value?.content.innerMonologue || monologueComplete.value)
    && choices.length > 0
})
const hasEventDialogue = computed(() => showDialogs.value || showMonologue.value)
const hasWarningNotification = computed(() => notifications.value.some(item => item.type === 'warning' || item.type === 'error'))
const hasBattleTrigger = computed(() => currentNode.value?.content.gameplayTrigger?.type === 'battle')
const eventTemplate = computed(() => {
  if (hasBattleTrigger.value) return 'prebattle'
  if (hasWarningNotification.value) return 'warning'
  if (isDebutDialog.value) {
    return 'debut_dialog'
  }
  if (showDialogs.value) return 'dialog'
  if (showMonologue.value) return 'monologue'
  if (debutCharacterProfile.value) return 'debut'
  return 'narration'
})
const pageStatusText = computed(() => {
  return ''
})
const currentPageCountLabel = computed(() => {
  return ''
})
const currentIllustrationCharacterId = computed(() => {
  if (currentIllustration.value?.type !== 'character') return null
  return currentIllustration.value.subjectId ?? null
})
const currentProtagonistProfileId = computed(() => (
  store.currentPerspective === 'female'
    ? STORY_PROTAGONIST_PROFILE_IDS.female
    : STORY_PROTAGONIST_PROFILE_IDS.male
))
const isCurrentIllustrationNewCharacter = computed(() => {
  const characterId = currentIllustrationCharacterId.value
  if (!characterId) return false
  if (characterId === currentProtagonistProfileId.value) return false
  return !seenDebutCharacterIds.value.includes(characterId)
})
const isDebutDialog = computed(() => (
  showDialogs.value
  && currentIllustration.value?.type === 'character'
  && isCurrentIllustrationNewCharacter.value
))
const shouldShowCharacterIllustration = computed(() => {
  const characterId = currentIllustrationCharacterId.value
  if (!characterId) return false
  if (showDialogs.value) return characterId !== currentProtagonistProfileId.value
  return true
})
const showDebutBanner = computed(() => (
  Boolean(activeDebutCharacterProfile.value)
  && isDebutDialog.value
  && !(currentIllustration.value?.type === 'character' && shouldShowCharacterIllustration.value)
))
const debutCharacterProfile = computed(() => {
  const characterId = currentIllustrationCharacterId.value
  if (!characterId) return null
  if (showDialogs.value || showMonologue.value) return null
  if (characterId === currentProtagonistProfileId.value) return null
  if (seenDebutCharacterIds.value.includes(characterId)) return null
  return resolveStoryCharacterProfileById(characterId)
})
const activeDebutCharacterProfile = computed(() => {
  const characterId = currentIllustrationCharacterId.value
  if (!characterId) return null
  if (characterId === currentProtagonistProfileId.value) return null
  if (!isCurrentIllustrationNewCharacter.value) return null
  return resolveStoryCharacterProfileById(characterId)
})

const currentBeatLabel = computed(() => {
  if (store.currentPerspective === 'male') return '他先撞上了'
  if (store.currentPerspective === 'female') return '她先看见了'
  return '眼前这条线动了'
})

function normalizeLeadSeed(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[。！？!?]$/u, '')
    .replace(/^(此时|这时|那时|这一日|当夜|夜里|片刻后|不久后)/u, '')
    .trim()
}

function compactCinematicLeadTitle(text: string) {
  const seed = normalizeLeadSeed(text)
  if (!seed) return ''

  const mapped = seed
    .replace(/(.+?)的(黄昏|暮色|夜色|晨光|晚风|山门|镇口|街口|雨幕|炉火|海崖|山道).*/u, '$1$2')
    .replace(/(.+?)(比别处.+|显得.+|来得.+|还要.+|总是.+)$/u, '$1')
    .replace(/(.+?)(忽然|已经|正|便|才|像是|仿佛).*/u, '$1')
    .trim()

  const clauses = mapped.split(/[，、；：]/u).map(item => item.trim()).filter(Boolean)
  const candidate = clauses[0] ?? mapped
  if (!candidate) return ''
  return candidate.length > 10 ? `${candidate.slice(0, 10)}…` : candidate
}

function resolveSceneLeadTitle() {
  const mapName = normalizeLeadSeed(currentNode.value?.map ?? '')
  const illustrationAlt = normalizeLeadSeed(currentIllustration.value?.alt ?? '')

  if (mapName) {
    const title = compactCinematicLeadTitle(mapName)
    if (title) return title
  }

  if (illustrationAlt) {
    const title = compactCinematicLeadTitle(illustrationAlt)
    if (title) return title
  }

  const firstSentence = perspectiveText.value
    .replace(/\s+/g, ' ')
    .split(/(?<=[。！？!?])/u)
    .map(item => item.trim())
    .find(Boolean)
    ?? ''
  const clauses = firstSentence.split(/[，、；：]/u).map(item => item.trim()).filter(Boolean)
  for (const clause of clauses) {
    const title = compactCinematicLeadTitle(clause)
    if (title) return title
  }

  return '眼前这一幕'
}

const displayPageText = computed(() => {
  const formatted = formatReadableStoryPage(currentPageText.value, {
    preferCompact: isNarrativeScene.value,
    hasIllustration: Boolean(currentIllustration.value),
    isOpening: isChapterOpeningNarration.value && pageIndex.value < STORY_OPENING_CINEMATIC_PAGES
  }).trim()

  if (formatted) return formatted
  if (readableFallbackText.value) return readableFallbackText.value
  return currentPageText.value.trim()
})
const showStoryTextPanel = computed(() => {
  const text = displayPageText.value.trim()
  if (!showDialogs.value) return Boolean(text) || (!showMonologue.value && hasStoryPages.value)
  if (!text) return false

  const firstDialog = dialogs.value[0]?.content?.trim() ?? ''
  if (!firstDialog) return true

  const normalize = (value: string) => value.replace(/\s+/g, '').trim()
  const normalizedText = normalize(text)
  const normalizedFirstDialog = normalize(firstDialog)
  if (normalizedText === normalizedFirstDialog) return false
  if (normalizedText.includes(normalizedFirstDialog) || normalizedFirstDialog.includes(normalizedText)) return false

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  if (lines.length > 1) {
    const tail = lines[lines.length - 1] ?? ''
    const normalizedTail = normalize(tail)
    if (
      normalizedTail === normalizedFirstDialog
      || normalizedTail.includes(normalizedFirstDialog)
      || normalizedFirstDialog.includes(normalizedTail)
    ) {
      return lines.slice(0, -1).join('\n').trim().length > 0
    }
  }

  return true
})
const useLightweightPauseNarration = computed(() => (
  canPauseHere.value
  && !showDialogs.value
  && !showMonologue.value
  && !hasNextPage.value
  && !currentIllustration.value
  && displayPageText.value.replace(/\s+/g, '').length <= 28
))
const shouldInstantRevealPage = computed(() => (
  isNarrativeScene.value
  && pageIndex.value === 0
  && displayPageText.value.replace(/\s+/g, '').length <= 16
))
const isShortNarrationPage = computed(() => (
  !showDialogs.value
  && !showMonologue.value
  && displayPageText.value.replace(/\s+/g, '').length <= (currentIllustration.value ? 26 : 16)
))
const storyPanelHint = computed(() => (
  ''
))
const headerPresenceLabel = computed(() => (
  ''
))
const shouldCondenseHeader = computed(() => (
  isShortNarrationPage.value && Boolean(currentIllustration.value)
))
const isCompactNarrationMoment = computed(() => {
  if (!isNarrativeScene.value) return false
  if (showChoices.value || hasNextPage.value) return false
  if (Boolean(currentIllustration.value)) return false
  return displayPageText.value.replace(/\s+/g, '').length <= 24
})

const canPauseHere = computed(() => showChoices.value || Boolean(currentNode.value?.content.choices.find(choice => choice.isEndMarker || choice.targetId === null)))
const showPauseFallbackPanel = computed(() => (
  canPauseHere.value
  && !showDialogs.value
  && !showChoices.value
  && !showMonologue.value
  && !showStoryTextPanel.value
))
const pauseFallbackText = computed(() => {
  if (readableFallbackText.value) return readableFallbackText.value
  const nodeChoiceText = currentNode.value?.content.choices[0]?.text?.trim() ?? ''
  if (/终章待续|未完待续|本章完|章·完|卷.+完/u.test(nodeChoiceText)) {
    return '先把这件事压住，等境界、人和路都够了，再往下续。'
  }
  if (store.currentPerspective === 'female') return '她先把这一截压住了。'
  if (store.currentPerspective === 'male') return '他先把这一截压住了。'
  return '这一截先记在这里。'
})
const currentSceneHint = computed(() => {
  const displayHint = displayPageText.value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
    .find(item => item !== currentBeatLabel.value)
    ?? ''
  const normalizedDisplayHint = displayHint.replace(/[。！？!?]$/u, '').trim()
  if (normalizedDisplayHint) {
    return normalizedDisplayHint.length > 10
      ? `${normalizedDisplayHint.slice(0, 10)}…`
      : normalizedDisplayHint
  }

  const text = perspectiveText.value
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[。！？!?])/u)
    .map(item => item.trim())
    .filter(Boolean)

  const followSentence = sentences[1]?.replace(/[。！？!?]$/u, '').trim()
  if (followSentence) {
    return followSentence.length > 10 ? `${followSentence.slice(0, 10)}…` : followSentence
  }

  const firstSentence = sentences[0]?.replace(/[。！？!?]$/u, '').trim() ?? ''
  const clauses = firstSentence.split(/[，、；：]/u).map(item => item.trim()).filter(Boolean)
  if (clauses.length > 1) {
    const followClause = clauses[1] ?? ''
    return followClause.length > 10 ? `${followClause.slice(0, 10)}…` : followClause
  }

  if ((currentNode.value?.content.npcDialogs?.length ?? 0) > 0) return '有人开口'
  if (currentNode.value?.content.innerMonologue) return '念头压了上来'
  if (currentNode.value?.content.gameplayTrigger) return '眼前就要动手'
  if (hasNextPage.value) return '后头还有下文'
  return '这事还没真正完'
})

const autoAdvanceLabel = computed(() => {
  if ((hasStoryPages.value && !pageComplete.value) || showGameplay.value) return ''
  if (showChoices.value) return ''
  if (showDialogs.value) return dialogs.value.length > 1 ? '话还没停' : ''
  if (hasNextPage.value) return ''
  if (shouldAutoAdvanceNode.value) return '这一截会自己接下去'
  return canPauseHere.value ? '这里能先停住' : '马上会接回后头'
})
const pauseBadgeText = computed(() => {
  if (showChoices.value) return '该你定了'
  if (store.currentPerspective === 'female') return '她先停在这里'
  if (store.currentPerspective === 'male') return '他先停在这里'
  return '风声先压在这里'
})

const implicitAdvanceChoiceIndex = computed(() => {
  const choices = currentNode.value?.content.choices ?? []
  if (choices.length !== 1) return -1
  return isImplicitAdvanceChoice(choices[0]?.text ?? '') ? 0 : -1
})

const hasImplicitAdvanceChoice = computed(() => implicitAdvanceChoiceIndex.value >= 0)

const shouldAutoAdvanceNode = computed(() => {
  if (!hasImplicitAdvanceChoice.value) return false
  if (showGameplay.value) return false
  if (showChoices.value) return false
  if (showMonologue.value && !monologueComplete.value) return false
  if (showDialogs.value && !dialogsViewed.value) return false
  if (hasNextPage.value || !pageComplete.value) return false
  return true
})

function isImplicitAdvanceChoice(text: string) {
  const cleaned = text.trim()
  if (!cleaned) return false
  return /^(继续|顺着往下走|接着往下走|往前看|再往下看)$/u.test(cleaned)
}

const shouldFastAdvanceNode = computed(() => {
  if (!shouldAutoAdvanceNode.value) return false
  if (!isNarrativeScene.value) return false
  return (currentNode.value?.content.text?.length ?? 0) <= 34
})

function splitStoryText(text: string): string[] {
  const normalizedText = text
    .replace(/^翌日清晨天还没亮透，/u, '翌日天还没亮透，')
    .replace(/^次日卯时天还没亮，/u, '次日天还没亮，')
    .replace(/^第二天清晨司天命的传音符就到了。/u, '第二天一早，司天命的传音符到了。')
    .replace(/^第二天清晨洛衍之随第一批撤防部队离开了炎角镇。/u, '第二天一早，洛衍之随第一批撤防部队离开了炎角镇。')
    .replace(/^当天夜里洛衍之/u, '当天夜里，洛衍之')
    .replace(/^当天夜里云斐然/u, '当天夜里，云斐然')
    .replace(/^当夜，/u, '当夜，')
    .replace(/^天亮时江溯在松树下叫住洛衍之。/u, '天亮时，江溯在松树下叫住了洛衍之。')
    .replace(/^天亮时他在松针的气味里醒过来。/u, '天亮时，他在松针的气味里醒了过来。')
    .replace(/^天亮时江溯带他去了悬剑峰背后的那道大地裂。/u, '天亮时，江溯带他去了悬剑峰背后的那道大地裂。')
    .replace(/^黄昏时分营地外放哨的弟子传回了消息：/u, '黄昏压下来时，营外传回了消息：')
    .replace(/^那天黄昏江溯/u, '那天入暮时，江溯')
    .replace(/^第三天夜里——/u, '第三天夜里，')
    .replace(/^第七天黄昏他/u, '第七天入暮时，他')
  return splitTextForPages(normalizedText, {
    charLimit: STORY_PAGE_CHAR_LIMIT,
    hardLimit: STORY_PAGE_HARD_LIMIT,
    minLength: STORY_PAGE_MIN_LENGTH
  })
}

function splitDialogText(text: string): string[] {
  return splitTextForPages(text, {
    charLimit: STORY_DIALOG_PAGE_CHAR_LIMIT,
    hardLimit: STORY_DIALOG_PAGE_HARD_LIMIT,
    minLength: STORY_DIALOG_PAGE_MIN_LENGTH
  })
}

function splitTextForPages(
  text: string,
  options: {
    charLimit: number
    hardLimit: number
    minLength: number
  }
): string[] {
  const connectiveLeadPattern = /^(天还没亮透|天还没亮|天刚亮|一早|清晨|黄昏压下来时|黄昏时|入暮时|夜里|随后|然后|接着|紧接着|片刻后|过了一会|没多久)/u
  const detachedTimeLeadPattern = /^(翌日|次日|当夜|当天夜里|第二天一早|第二天|第三天夜里|第三天|第七天入暮时|第七天)$/u
  const protectedLeadSentencePattern = /^(翌日|次日|当夜|当天夜里|第二天一早|第二天|第三天夜里|第三天|第七天入暮时|第七天|天亮时|黄昏压下来时|黄昏时|那天入暮时)[，。].+/u
  const protectedObjectPhrasePattern = /(那枚按了[^，。！？!?]+的[^，。！？!?]+|那颗[^，。！？!?]+珠|那道[^，。！？!?]+剑意|那只[^，。！？!?]+手|那扇[^，。！？!?]+门|那枚[^，。！？!?]{6,}纸|那枚[^，。！？!?]{6,}玉简)/u

  const normalized = text
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  if (normalized.length === 0) return []

  const pages: string[] = []
  let current = ''

  const pushCurrent = () => {
    if (!current.trim()) return
    pages.push(current.trim())
    current = ''
  }

  const forceChunk = (segment: string) => {
    const trimmed = segment.trim()
    if (!trimmed) return

    if (!current) {
      current = trimmed
      return
    }

    const candidate = `${current}\n${trimmed}`
    if (current.length < options.minLength || candidate.length <= options.hardLimit) {
        current = candidate
        return
    }

    pushCurrent()
    current = trimmed
  }

  const appendSegment = (segment: string) => {
    const trimmed = segment.trim()
    if (!trimmed) return
    if (/^[——，、；：,.!?！？]+$/u.test(trimmed)) {
      if (current) {
        current = `${current}${trimmed}`
      } else {
        current = trimmed
      }
      return
    }

    if (!current) {
      current = trimmed
      return
    }

    const candidate = `${current}\n${trimmed}`
    if (candidate.length > options.charLimit && current.length >= options.minLength) {
      pushCurrent()
      current = trimmed
      return
    }

    current = candidate
  }

  const findNaturalSplitIndex = (value: string) => {
    if (value.length <= options.charLimit) return value.length

    const searchStart = Math.max(options.minLength, options.charLimit - 6)
    const searchEnd = Math.min(value.length - options.minLength, options.charLimit + 4)
    const phraseBreaks = [
      '之后', '之时', '之际', '的时候', '回来', '出来', '进去', '过去', '下来', '上来',
      '然后', '随后', '接着', '只是', '但是', '不过', '而是', '于是', '因此', '直到',
      '等到', '如果', '若是', '仿佛', '像是', '忽然', '终于', '已经', '仍旧', '还是'
    ]
    const protectedTailPhrases = [
      '看上去', '一副', '把手', '放下来', '放下了', '看见', '看到了', '靠着',
      '带着', '隔着', '贴在', '盯着', '坐在', '站在', '回头', '没有回头', '递剑的'
    ]

    for (let index = searchEnd; index >= searchStart; index -= 1) {
      const prefix = value.slice(0, index)
      const suffix = value.slice(index)
      if (protectedTailPhrases.some(phrase => suffix.startsWith(phrase))) continue
      if (/^(按了|血手印|薄膜纸|玉简|碧水珠)/u.test(suffix)) continue
      if (/[，、；：。！？!?——]$/u.test(prefix)) return index
      if (phraseBreaks.some(phrase => prefix.endsWith(phrase))) return index
    }

    return options.charLimit
  }

  const splitLongSentence = (sentence: string) => {
    const cleaned = sentence.trim()
    if (!cleaned) return []
    if (protectedLeadSentencePattern.test(cleaned) && cleaned.length <= options.hardLimit + 10) {
      return [cleaned]
    }
    if (
      /(看上去一副|把手从.+放下来|隔着.+站着|在.+门边靠着门框|看到.+第?一下|带着.+踏进|没有急着.+也没有急着)/u.test(cleaned)
      && cleaned.length <= options.hardLimit + 12
    ) {
      return [cleaned]
    }
    if (
      protectedObjectPhrasePattern.test(cleaned)
      && cleaned.length <= options.hardLimit + 14
    ) {
      return [cleaned]
    }
    if (cleaned.length <= options.hardLimit) return [cleaned]

    const fragments = cleaned
      .split(/(?<=[，、；：——])/u)
      .map(fragment => fragment.trim())
      .filter(Boolean)

    if (fragments.length <= 1) {
      if (!/[，、；：——]/u.test(cleaned) && cleaned.length <= options.hardLimit + 8) {
        return [cleaned]
      }
      const chunks: string[] = []
      let remaining = cleaned
      while (remaining.length > options.hardLimit) {
        const splitIndex = findNaturalSplitIndex(remaining)
        chunks.push(remaining.slice(0, splitIndex).trim())
        remaining = remaining.slice(splitIndex).trim()
      }
      if (remaining) {
        chunks.push(remaining)
      }
      return chunks
    }

    if (
      /——/u.test(cleaned)
      && cleaned.length <= options.hardLimit + 10
      && /(看上去|像是|仿佛|那只手|没有回头|旧伤|递剑)/u.test(cleaned)
    ) {
      return [cleaned]
    }

    const chunks: string[] = []
    let part = ''
    for (const fragment of fragments) {
      if (/^[——，、；：,.!?！？]+$/u.test(fragment)) {
        part = part ? `${part}${fragment}` : fragment
        continue
      }
      const candidate = part ? `${part}${fragment}` : fragment
      if (candidate.length > options.charLimit && part && part.length >= options.minLength) {
        chunks.push(part.trim())
        part = fragment
      } else if (candidate.length > options.hardLimit) {
        if (part) {
          chunks.push(part.trim())
          part = ''
        }
        let remaining = fragment
        while (remaining.length > options.hardLimit) {
          const splitIndex = findNaturalSplitIndex(remaining)
          chunks.push(remaining.slice(0, splitIndex).trim())
          remaining = remaining.slice(splitIndex).trim()
        }
        if (remaining) {
          chunks.push(remaining)
        }
      } else {
        part = candidate
      }
    }

    if (part.trim()) chunks.push(part.trim())
    return chunks
  }

  const rebalancePages = (sourcePages: string[]) => {
    const merged: string[] = []

    for (const page of sourcePages) {
      const trimmed = page.trim()
      if (!trimmed) continue

      const previous = merged[merged.length - 1]
      if (
        previous
        && (
          trimmed.length < options.minLength
          || /^[——，、；：,.!?！？]/u.test(trimmed)
          || /[——，、；：,.!?！？]$/u.test(previous)
        )
        && previous.length + trimmed.length <= options.hardLimit
      ) {
        merged[merged.length - 1] = `${previous}${trimmed}`
        continue
      }

      merged.push(trimmed)
    }

    const first = merged[0]
    const second = merged[1]
    const rest = merged.slice(2)
    if (merged.length >= 2 && first && second && first.length < options.minLength) {
      if ((first.length + second.length) <= options.hardLimit) {
        return [`${first}${second}`, ...rest]
      }
    }

    if (merged.length >= 2 && first && second) {
      const firstCompact = first.replace(/\s+/g, '')
      const secondCompact = second.replace(/\s+/g, '')
      if (
        firstCompact.length <= 5
        && /[，、；：——]$/u.test(firstCompact)
        && (firstCompact.length + secondCompact.length) <= options.hardLimit + 8
      ) {
        return [`${first}${second}`, ...rest]
      }
    }

    if (merged.length >= 2 && first && second) {
      const firstCompact = first.replace(/\s+/g, '')
      const secondCompact = second.replace(/\s+/g, '')
      if (
        !/[。！？!?]$/u.test(firstCompact)
        && /[，、；：——]$/u.test(firstCompact)
        && (firstCompact.length + secondCompact.length) <= options.hardLimit + 12
      ) {
        return [`${first}${second}`, ...rest]
      }
    }

    if (merged.length >= 2 && first && second) {
      const firstCompact = first.replace(/\s+/g, '')
      const secondCompact = second.replace(/\s+/g, '')
      if (
        /[——]$/u.test(firstCompact)
        && /^(看上去|像是|仿佛|那只手|没有回头|旧伤|递剑的|一副)/u.test(secondCompact)
        && (firstCompact.length + secondCompact.length) <= options.hardLimit + 12
      ) {
        return [`${first}${second}`, ...rest]
      }
    }

    if (merged.length >= 2 && first && second) {
      const secondCompact = second.replace(/\s+/g, '')
      if (
        /^(之后|之时|之际|那里|这里|此时|那时|这时|随后|然后|便|才|仍|又)/u.test(secondCompact)
        && (first.replace(/\s+/g, '').length + secondCompact.length) <= options.hardLimit + 8
      ) {
        return [`${first}${second}`, ...rest]
      }
    }

    if (merged.length >= 2 && first && second) {
      const firstCompact = first.replace(/\s+/g, '')
      const secondCompact = second.replace(/\s+/g, '')
      if (
        detachedTimeLeadPattern.test(firstCompact)
        && connectiveLeadPattern.test(secondCompact)
        && (firstCompact.length + secondCompact.length) <= options.hardLimit + 14
      ) {
        return [`${first}${second}`, ...rest]
      }
    }

    if (merged.length >= 2 && first && second) {
      const firstCompact = first.replace(/\s+/g, '')
      const secondCompact = second.replace(/\s+/g, '')
      if (
        /^(当夜。?|当天夜里。?|第三天夜里。?|翌日。?|次日。?)/u.test(firstCompact)
        && !/[。！？!?]$/u.test(firstCompact)
        && (firstCompact.length + secondCompact.length) <= options.hardLimit + 10
      ) {
        return [`${first}${second}`, ...rest]
      }
    }

    return merged
  }

  normalized.forEach(paragraph => {
    const sentences = paragraph.split(/(?<=[。！？!?])/u).filter(Boolean)
    sentences.forEach(sentence => {
      const segments = splitLongSentence(sentence)
      segments.forEach(segment => {
        if (segment.length > options.hardLimit) {
          forceChunk(segment)
          return
        }
        appendSegment(segment)
      })
    })
    pushCurrent()
  })

  const rebalanced = rebalancePages(pages)
  return (rebalanced.length > 0 ? rebalanced : [text])
    .map(page => page.replace(/\s+$/u, ''))
    .map((page, index, sourcePages) => {
      if (index === sourcePages.length - 1) return page
      const compact = page.replace(/\s+/g, '')
      const next = sourcePages[index + 1]?.replace(/\s+/g, '') ?? ''
      if (
        /^(当夜。?|当天夜里。?|第三天夜里。?|翌日。?|次日。?)$/u.test(compact)
        && next
      ) {
        return `${page}\n${sourcePages[index + 1]}`.trim()
      }
      return page
    })
    .filter((_, index, sourcePages) => {
      const previous = sourcePages[index - 1]?.replace(/\s+/g, '') ?? ''
      if (!previous) return true
      return !/^(当夜。?|当天夜里。?|第三天夜里。?|翌日。?|次日。?)$/u.test(previous)
    })
    .map((page, index, sourcePages) => {
      if (index === 0) return page
      const previous = sourcePages[index - 1]?.trim() ?? ''
      const current = page.trim()
      if (!previous || !current) return page
      const previousCompact = previous.replace(/\s+/g, '')
      const currentCompact = current.replace(/\s+/g, '')
      if (
        detachedTimeLeadPattern.test(previousCompact)
        && connectiveLeadPattern.test(currentCompact)
      ) {
        sourcePages[index - 1] = `${previous}\n${current}`.trim()
        return ''
      }
      return page
    })
    .filter(page => page.trim().length > 0)
}

function formatStoryPageText(
  text: string,
  options: {
    cinematic: boolean
    firstNarrationPage: boolean
    openingNarrationPage: boolean
    leadTitle: string
    hasIllustration?: boolean
    pageIndex?: number
  }
) {
  const cleaned = text.trim()
  if (!cleaned) return ''

  const normalizeStoryLineBreaks = (value: string) => value
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim()

  const stylizeCinematicNarration = (value: string) => {
    return value
      .replace(/^翌日清晨天还没亮透，江溯就把洛衍之从石床上拎了起来.*$/u, '翌日天还没亮透。')
      .replace(/^翌日天还没亮透，江溯就把洛衍之从石床上拎了起来.*$/u, '翌日天还没亮透。')
      .replace(/^镇口的老槐树在晚风里抖着叶子，?$/u, '晚风先吹动了镇口老槐。')
      .replace(/^每片叶子背面都覆着一层细细的灰。?$/u, '叶背上，全是细灰。')
      .replace(/^整座镇子都沉进了安静的暗灰里。?$/u, '镇子沉进了暗灰里。')
      .replace(/^把整座镇子染成了一种安详的暗灰色。?$/u, '镇子沉进了暗灰里。')
      .replace(/^把整座镇子染成了.*?暗灰色。?$/u, '镇子沉进了暗灰里。')
      .replace(/^把整座镇子染成了一种安详的暗灰色$/u, '镇子沉进了暗灰里')
      .replace(/^两座铁灰色的山一左一右夹着这座边陲小镇。?$/u, '两边的灰山，把小镇夹得很紧。')
      .replace(/^太阳刚沉到西山锯齿状的山脊线后面。?$/u, '太阳刚沉进西边山脊后。')
      .replace(/^整座镇子就被吞进了一片带着铁锈味的昏黄暮色里。?$/u, '镇子一下沉进昏黄暮色里。')
      .replace(/^镇口的老槐树在晚风里抖着叶子。?$/u, '镇口老槐，被晚风吹得发颤。')
      .replace(/^落在叶子上、屋顶上、井沿上。?$/u, '灰落满了叶子、屋顶和井沿。')
      .replace(/^整座镇子就被吞进了.*?暮色里。?$/u, '暮色一下压满了镇子。')
      .replace(/^整座镇子都被.*?暮色.*?罩住了。?$/u, '暮色已经压住了整座镇子。')
      .replace(/^整个镇子都.*?暗了下去。?$/u, '镇子一下暗了下去。')
      .replace(/^望石镇的黄昏比别处来得早。?$/u, '望石镇的黄昏，总是来得更早。')
      .replace(/^望石镇铁匠铺。?$/u, '望石镇的铁匠铺，还亮着火。')
      .replace(/^望石镇。?$/u, '望石镇还没彻底暗下去。')
      .replace(/^长青谷。?$/u, '长青谷里，气氛先绷住了。')
      .replace(/^炎角镇。?$/u, '炎角镇里，火气还没散干净。')
      .replace(/^第三峰。?$/u, '第三峰上，风一直没停。')
      .replace(/^赤炎域。?$/u, '赤炎域的热浪，一直顶在前头。')
      .replace(/^碧落宫。?$/u, '碧落宫里，水意压得很静。')
      .replace(/^天机阁。?$/u, '天机阁里，很多话都不能明说。')
      .replace(/^战后第七日，/u, '战后第七日，')
      .replace(/^大战后的第一次五域盟会，/u, '大战后的五域盟会，')
      .replace(/^大战后第.+?日，/u, '大战过后，')
      .replace(/^战后的第一个春天，/u, '战后的第一个春天，')
      .replace(/^后面的路越发像在死人与执念之间穿行。?$/u, '后面的路，像踩在死人和执念之间。')
      .replace(/^顾长惜以.+?身份重返长青谷——/u, '长青谷里，她再次现身。')
      .replace(/^顾长惜还没来得及在长青谷喘口气，/u, '她才踏稳脚，谷里就先乱了。')
      .replace(/^顾长惜捏碎碧水珠时，/u, '她一捏碎碧水珠，后路就断了。')
      .replace(/^顾长惜一手扶着母亲，/u, '她扶着亲人，一步步往外走。')
      .replace(/^顾长惜带着从天机阁禁地破译的玉简踏进了碧落宫。?$/u, '她带着禁地玉简回了碧落宫。')
      .replace(/^洛衍之在第三峰的木屋里守了三天。?$/u, '第三峰木屋里，他守了三天。')
      .replace(/^洛衍之从碧落宫连夜御剑飞回第三峰。?$/u, '他连夜飞回了第三峰。')
      .replace(/^洛衍之在赤炎域边境战场上已经连续作战三个月了。?$/u, '赤炎域边境上，他已经鏖战了三个月。')
      .replace(/^洛衍之在赤炎域边境战场上已经连续作战.+$/u, '赤炎域边境上，他已经鏖战许久。')
      .replace(/^洛衍之携归尘剑出席。?$/u, '他携剑而来。')
      .replace(/^他带着归尘剑走进了第三峰的剑冢。?$/u, '他带着归尘剑，走进了第三峰剑冢。')
      .replace(/^他推开江溯在第三峰住了几十年的那间破木门。?$/u, '那扇旧木门，终于还是被他推开了。')
      .replace(/^他在想的事情有三件。?$/u, '他心里压着三件事。')
      .replace(/^回到天机阁之后她第一件事不是去推演室向司天命呈报——而是去了碧落宫苏晚棠的静室。?$/u, '回到天机阁后，她先去了苏晚棠那里。')
      .replace(/^天道吞噬阵瓦解后，/u, '大阵瓦解后，')
      .replace(/^又过了三年，/u, '又过了三年，')
      .replace(/^归尘剑悬在五色洪流中央。?$/u, '五色洪流中央，归尘剑悬着。')
      .replace(/^第十八层深处只有一面镜子。?$/u, '第十八层最深处，只剩一面镜子。')
      .replace(/^五域联盟刚刚被迫成立，/u, '五域联盟才刚立住，')
      .replace(/^七峰峰主会议在半炷香内做出决定：/u, '半炷香后，七峰已经定了决断：')
      .replace(/^炎角镇在几个月前还是.+$/u, '炎角镇，已经不是几个月前的样子了。')
      .replace(/^司天命的密令送到顾长惜手中——/u, '司天命的密令，落到了她手里。')
      .replace(/^烈焰天宗没有派人迎接——/u, '赤炎域没人来迎。')
      .replace(/^第三个月末的一个黄昏，/u, '第三个月末的黄昏，')
      .replace(/^这个发现让她第一次在执行任务时产生了.+$/u, '她第一次，对任务之外的人起了兴趣。')
      .replace(/^第二天清晨司天命的传音符就到了。?$/u, '第二天一早，司天命的传音符到了。')
      .replace(/^翌日清晨天还没亮透，/u, '翌日天还没亮透，')
      .replace(/^翌日清晨天还没亮透，江溯就/u, '翌日天还没亮透，江溯就已经')
      .replace(/^翌日天还没亮透，江溯就/u, '翌日天还没亮透，江溯就已经')
      .replace(/^九幽子率吞天教主力猛扑赤晶矿脉——/u, '赤晶矿脉前，九幽子先压了上来。')
      .replace(/^战斗从清晨打到黄昏。?$/u, '这一战，从清晨拖到了黄昏。')
      .replace(/^剑宗每季度一次的内门小比——/u, '剑宗季比，又到了。')
      .replace(/^季比当天悬剑峰半山腰的演剑台上人山人海。?$/u, '季比那天，演剑台上人满为患。')
      .replace(/^赤炎域的任务结束后剑宗驻防小队开始分批撤回玄天域。?$/u, '赤炎域事了，剑宗开始撤防。')
      .replace(/^顾长惜在赤炎域多留了几天.+$/u, '她在赤炎域又多留了几天。')
      .replace(/^战后的第一个春天，/u, '战后的第一个春天，')
      .replace(/^他居然还能从她的步伐中看出旧伤的痕迹。?$/u, '他还是一眼认出了她旧伤的痕迹。')
      .replace(/^他没有等他说完第二句。?$/u, '他没等第二句话落下。')
      .replace(/^回到天机阁之后/u, '回到天机阁后')
      .replace(/^她没有回头。?$/u, '她终究没有回头。')
      .replace(/^他没有回头。?$/u, '他终究没有回头。')
      .replace(/^落在叶子上、屋顶上、井沿上，?$/u, '细雨把整座镇子都压低了。')
      .replace(/^落在叶子上，?$/u, '细雨先落下来。')
      .replace(/^落在屋顶上，?$/u, '雨先敲在屋顶上。')
      .replace(/^过了黑风峡之后是连绵的山。?$/u, '过了黑风峡，前头尽是连山。')
      .replace(/^第七天黄昏/u, '第七天入暮时')
      .replace(/^他下了马朝.+?走去。?$/u, '她终于下马走近了。')
      .replace(/^她下了马朝.+?走去。?$/u, '她终于下马走近了。')
      .replace(/^她一个人走向了.+?法则。?$/u, '她独自迎了上去。')
      .replace(/^剑宗的山门不是一扇门——是/u, '剑宗山门前，立着')
      .replace(/^第三峰的峰顶不大——/u, '第三峰峰顶不大。')
      .replace(/^天快亮了。?$/u, '天快亮了。')
      .replace(/^天亮时/u, '天亮时')
      .replace(/^黄昏时分营地外放哨的弟子传回了消息：/u, '黄昏时，营外消息传了回来：')
      .replace(/^小队在进入第七层地脉的时候，/u, '第七层地脉前，')
      .replace(/^五域所有在世的长老都聚在了.+?崖边——/u, '归尘渊边，五域长老都到了。')
      .replace(/^战后的第一个春天，/u, '战后的第一个春天，')
      .replace(/^炼气九层圆满的第二天，/u, '第二天一早，')
      .replace(/^先锋队出发那天下着玄天域少见的灰雨。?$/u, '灰雨一路压着先锋队。')
      .replace(/^井沿上，?$/u, '井沿边静得很。')
      .replace(/^井沿上，把整座镇子染成了一种安详的暗灰色。?$/u, '整座镇子都沉进了安静的暗灰里。')
      .replace(/^黄昏来得早。?$/u, '暮色先压下来。')
      .replace(/^暮色来得早。?$/u, '暮色先压下来。')
      .replace(/^夜色来得早。?$/u, '夜色先压下来。')
      .replace(/^.+?的黄昏来得早。?$/u, '黄昏先压下来。')
      .replace(/^.+?的暮色来得早。?$/u, '暮色先压下来。')
      .replace(/^黄昏时分/u, '黄昏压下来时')
      .replace(/^那天黄昏/u, '那天入暮时')
      .replace(/^第三天黄昏/u, '第三天入暮时')
      .replace(/^第三天夜里/u, '第三天夜里')
      .replace(/^第二天清晨/u, '第二天一早')
      .replace(/^翌日清晨/u, '翌日一早')
      .replace(/^清晨/u, '天刚亮时')
      .replace(/^入夜后/u, '夜里')
      .replace(/^前方灰红色的地平线上出现了/u, '前头地平线上露出了')
      .replace(/^当天夜里/u, '当天夜里')
      .replace(/^先锋队出发那天下着玄天域少见的灰雨。?$/u, '灰雨一路压着先锋队。')
      .replace(/^现在它的街道上散落着.+$/u, '可现在，街上只剩残局。')
      .replace(/^黄昏时分营地外放哨的弟子传回了消息：/u, '黄昏时，营外消息传了回来：')
      .replace(/^第二天清晨洛衍之随第一批撤防部队离开了炎角镇。?$/u, '第二天一早，他跟着撤防队离开了炎角镇。')
      .replace(/^右肩旧伤在这片火灵气浓厚的土地上又开始隐隐作痛。?$/u, '旧伤先在肩上醒了。')
      .replace(/^路上谁都没有说话。?$/u, '一路上，谁都没有说话。')
      .replace(/^两人在一条只能容两人侧身而过的石廊里碰面，/u, '狭窄石廊里，两人又撞见了。')
      .replace(/^他落在第三峰后山时，/u, '等他落回第三峰后山，')
      .replace(/^晨光在第三天终于照进了第三峰的后院。?$/u, '第三天的晨光，终于照进了后院。')
      .replace(/^夜降临的时候，/u, '夜真正落下来时，')
      .replace(/^风把远处的钟声吹过来——/u, '风把远处钟声送了过来。')
      .replace(/^他转身走出门外，没有回头。?$/u, '他转身走了出去，没再回头。')
      .replace(/^她跨上赤鬃灵驹朝南方的传送阵驰去——没有回头。?$/u, '她策马离开时，没有回头。')
      .replace(/^两个人在那块石头上并肩坐着，/u, '两个人并肩坐了下来。')
      .replace(/^他只是顾长惜，/u, '从这一刻起，')
      .replace(/比别处来得/u, '来得')
      .replace(/比旁处来得/u, '来得')
      .replace(/像是被吞进了/u, '已经沉进')
      .replace(/整座镇子就被吞进了一片/u, '整座镇子都沉进')
      .replace(/这辈子第一次理解了为什么/u, '终于明白了为什么')
      .replace(/他这辈子第一次看到/u, '他第一次看见')
      .replace(/带着铁锈味的/u, '')
      .replace(/昏黄暮色/u, '暮色')
      .replace(/^(这时|此时|那时)/u, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const compressCinematicSentence = (value: string) => {
    const compact = value
      .replace(/[。！？!?]+$/u, '')
      .replace(/^整座镇子都沉进了(.+?)里$/u, '镇子沉进了$1里')
      .replace(/^暮色已经压住了整座镇子$/u, '暮色压住了整座镇子')
      .replace(/^暮色一下压满了镇子$/u, '暮色压满了镇子')
      .replace(/^望石镇的黄昏，总是来得更早$/u, '黄昏先压下来')
      .replace(/^望石镇的黄昏比别处来得早$/u, '黄昏先压下来')
      .replace(/^.+?的黄昏比别处来得早$/u, '黄昏先压下来')
      .replace(/^.+?黄昏比别处来得早$/u, '黄昏先压下来')
      .replace(/^.+?黄昏来得早$/u, '黄昏先压下来')
      .replace(/^.+?暮色来得早$/u, '暮色先压下来')
      .replace(/^.+?的黄昏来得更早$/u, '黄昏先压下来')
      .replace(/^.+?的暮色来得更早$/u, '暮色先压下来')
      .replace(/^望石镇的黄昏来得早$/u, '黄昏先压下来')
      .replace(/^望石镇的暮色来得早$/u, '暮色先压下来')
      .replace(/^望石镇的夜色来得早$/u, '夜色先压下来')
      .replace(/^望石镇的铁匠铺，还亮着火$/u, '铁匠铺里还亮着火')
      .replace(/^两边的灰山，把小镇夹得很紧$/u, '灰山把小镇夹得很紧')
      .replace(/^太阳刚沉进西边山脊后$/u, '太阳刚沉进山脊后')
      .replace(/^镇子一下沉进昏黄暮色里$/u, '镇子沉进了暮色里')
      .replace(/^镇口老槐，被晚风吹得发颤$/u, '晚风吹得老槐发颤')
      .replace(/^灰落满了叶子、屋顶和井沿$/u, '灰落满了叶子和井沿')
      .replace(/^叶背上，全是细灰$/u, '叶背上全是细灰')
      .replace(/^镇子沉进了暗灰里$/u, '镇子沉进了暗灰里')
      .replace(/^炎角镇，已经不是几个月前的样子了$/u, '炎角镇早变了样')
      .replace(/^可现在，街上只剩残局$/u, '街上只剩残局')
      .replace(/^第二天一早，司天命的传音符到了$/u, '第二天一早，传音符到了')
      .replace(/^这一战，从清晨拖到了黄昏$/u, '这一战，拖了一整天')
      .replace(/^翌日天还没亮透$/u, '翌日天还没亮透')
      .replace(/^翌日天还没亮透，江溯就已经/u, '翌日天还没亮透，江溯已经')
      .replace(/^翌日天还没亮透，江溯就/u, '翌日天还没亮透，江溯已')
      .trim()

    if (!compact) return ''
    if (/^(翌日|次日|当夜|当天夜里|第二天一早|第二天|第三天|第七天)(天还没亮透|天刚亮|入暮时|夜里|一早|清晨|黄昏压下来时)(。)?$/u.test(compact)) {
      return `${compact}。`.replace(/。。$/u, '。')
    }
    if (compact.length <= 12) return `${compact}。`

    const clauses = compact.split(/[，、；：]/u).map(item => item.trim()).filter(Boolean)
    if (clauses.length > 1) {
      const first = clauses[0] ?? ''
      const second = clauses[1] ?? ''
      if ((first + second).length <= 14) return `${first}${second}。`
      if (first.length <= 10) return `${first}。`
    }

    if (compact.length <= 16) return `${compact}。`
    return `${compact.slice(0, 12)}…`
  }

  let source = cleaned
  const normalizedLead = options.leadTitle.replace(/\s+/g, '').trim()

  if (options.firstNarrationPage && normalizedLead) {
    let sharedPrefix = ''
    const compactSource = source.replace(/\s+/g, '')
    const length = Math.min(normalizedLead.length, compactSource.length)
    for (let index = 0; index < length; index += 1) {
      if (normalizedLead[index] !== compactSource[index]) break
      sharedPrefix += compactSource[index]
    }

    if (sharedPrefix.length >= 2) {
      source = source
        .replace(new RegExp(`^${sharedPrefix}[的里外上中旁边前后]*`, 'u'), '')
        .trim()
    }
  }

  if (
    options.firstNarrationPage
    && options.leadTitle
    && source.startsWith(options.leadTitle)
  ) {
    source = source.slice(options.leadTitle.length).replace(/^[，、；：——。！？!?…\s]+/u, '').trim()
  }

  if (!source || /^[，、；：——。！？!?…\s]+$/u.test(source)) return ''

  if (
    options.hasIllustration
    && typeof options.pageIndex === 'number'
    && options.pageIndex <= 2
    && cleaned.replace(/\s+/g, '').length <= 20
  ) {
    const compressed = compressIllustratedNarration(source)
    if (compressed && compressed !== source) return compressed
  }

  if (!options.openingNarrationPage) return normalizeStoryLineBreaks(source)

  source = stylizeCinematicNarration(source)
  source = compressCinematicSentence(source)

  const clauses = source
    .split(/(?<=[，、；：——])/u)
    .map(fragment => fragment.trim())
    .filter(Boolean)

  if (clauses.length >= 2) {
    const leadPair = clauses.slice(0, 2).map(stylizeCinematicNarration).filter(Boolean)
    const mergedLead = leadPair.join('')
    if (mergedLead.length <= 16) {
      return mergedLead
    }
    const firstLead = leadPair[0] ?? ''
    if (firstLead.length <= 14) return firstLead
    return `${firstLead.slice(0, 14)}…`
  }

  return normalizeStoryLineBreaks(source)
    .replace(/^黄昏来得早。?$/u, '暮色先压下来。')
    .replace(/^暮色来得早。?$/u, '暮色先压下来。')
    .replace(/^夜色来得早。?$/u, '夜色先压下来。')
    .replace(/^.+?黄昏来得早。?$/u, '黄昏先压下来。')
    .replace(/^.+?暮色来得早。?$/u, '暮色先压下来。')
    .replace(/^太阳刚沉到西山锯齿状的山脊线后面。?$/u, '太阳刚沉进山脊后。')
    .replace(/^整座镇子就被吞进了一片带着铁锈味的昏黄暮色里。?$/u, '镇子沉进了暮色里。')
    .replace(/^镇口的老槐树在晚风里抖着叶子。?$/u, '晚风吹得老槐发颤。')
    .replace(/^每片叶子背面都覆着一层细细的灰。?$/u, '叶背上全是细灰。')
    .replace(/^落在叶子上、屋顶上、井沿上。?$/u, '灰落满了叶子和井沿。')
    .replace(/^把整座镇子染成了一种安详的暗灰色。?$/u, '镇子沉进了暗灰里。')
}

function formatReadableStoryPage(
  text: string,
  options: {
    preferCompact: boolean
    hasIllustration: boolean
    isOpening: boolean
  }
) {
  const cleaned = normalizeDetachedStoryBreaks(text)
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim()

  if (!cleaned) return ''

  const normalizedParagraphs = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const compact = normalizedParagraphs.join('').replace(/\s+/g, '')
  if (compact.length <= 10) return cleaned

  const sentenceCount = normalizedParagraphs
    .join('')
    .split(/(?<=[。！？!?])/u)
    .map(part => part.trim())
    .filter(Boolean)
    .length

  const maxCharsPerLine = options.isOpening
    ? 16
    : options.hasIllustration
      ? 18
      : options.preferCompact
        ? 16
        : 18

  const splitBySentence = normalizedParagraphs.flatMap(paragraph => (
    paragraph
      .split(/(?<=[。！？!?])/u)
      .map(part => part.trim())
      .filter(Boolean)
  ))

  const sentenceLines: string[] = []
  splitBySentence.forEach(sentence => {
    const fragments = splitReadableSentence(sentence, maxCharsPerLine)
    fragments.forEach(fragment => {
      if (fragment.trim()) sentenceLines.push(fragment.trim())
    })
  })

  const mergedLines = mergeReadableLines(sentenceLines, maxCharsPerLine)
  const joinedMergedLines = mergedLines.join('\n')
  if (options.hasIllustration && options.preferCompact && compact.length <= 14) {
    return compressIllustratedNarration(joinedMergedLines || cleaned)
  }

  if (mergedLines.length <= 1) return mergedLines[0] ?? cleaned
  if (mergedLines.length <= 3) return joinedMergedLines

  const repaginated = repaginateReadableLines(mergedLines, {
    maxCharsPerLine,
    sentenceCount,
    hasIllustration: options.hasIllustration,
    preferCompact: options.preferCompact
  })

  return repaginated.join('\n')
}

function normalizeDetachedStoryBreaks(text: string) {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length <= 1) return lines.join('\n')

  const normalized: string[] = []
  const detachedLeadPattern = /^(翌日|次日|当夜|当天夜里|第二天一早|第二天|第三天夜里|第三天|第七天入暮时|第七天|天亮时|黄昏压下来时|黄昏时|那天入暮时)[，。]?$/u
  const connectiveLeadPattern = /^(天还没亮透|天还没亮|天刚亮|一早|清晨|黄昏压下来时|黄昏时|入暮时|夜里|随后|然后|接着|紧接着|片刻后|过了一会|没多久)/u

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index] ?? ''
    const next = lines[index + 1] ?? ''
    if (
      next
      && detachedLeadPattern.test(current)
      && (connectiveLeadPattern.test(next) || next.length <= 18)
    ) {
      normalized.push(`${current.replace(/[。]$/u, '')}，${next.replace(/^[，、；：]/u, '')}`)
      index += 1
      continue
    }

    normalized.push(current)
  }

  return normalized.join('\n')
}

function compressIllustratedNarration(text: string) {
  const compact = text
    .replace(/\r/g, '')
    .replace(/\n+/g, '\n')
    .trim()
  if (!compact) return ''

  const lines = compact.split('\n').map(line => line.trim()).filter(Boolean)
  const firstLine = lines[0] ?? ''
  const secondLine = lines[1] ?? ''
  const mergedLead = `${firstLine}${secondLine}`.trim()

  const source = (mergedLead || firstLine)
    .replace(/\s+/g, '')
    .replace(/[。！？!?]$/u, '')
    .trim()

  const mapped = resolveIllustratedNarrationCue(source)

  if (mapped.length <= 18) return mapped

  const clauses = mapped.split(/[，、；：]/u).map(line => line.trim()).filter(Boolean)
  const head = clauses[0] ?? mapped
  if (head.length <= 16) return head
  return `${head.slice(0, 14)}…`
}

function resolveIllustratedNarrationCue(source: string) {
  const explicit = source
    .replace(/^顾长惜从青木域返回沧澜域的灵鸟背上坐了很久.*$/u, '她回了天机阁。')
    .replace(/^顾长惜从青木域返回沧澜域.*$/u, '她回了天机阁。')
    .replace(/^江溯在后院门边靠着门框灌酒.*$/u, '江溯一直守在后院。')
    .replace(/^江溯三天没离开过后院.*$/u, '江溯一直守在后院。')
    .replace(/^她没有急着打开那枚按.*$/u, '她先把那枚玉简压住了。')
    .replace(/^她只是坐在灵鸟背上.*$/u, '她一路都没有开口。')
    .replace(/^洛衍之把手从断念剑剑柄上放下来.*$/u, '他先把手从剑柄上放开。')
    .replace(/^两个人隔着古井的井台站着.*$/u, '两人隔着井台站着。')
    .replace(/^当他看到断念剑.*$/u, '他先把酒壶放下了。')
    .replace(/^因为那只手是当年他和洛长渊一起.*$/u, '那是他旧年递剑的手。')

  if (explicit !== source) return explicit

  const subject = resolveNarrationSubject(source)
  const pronoun = resolveNarrationPronoun(source)
  const actor = subject || pronoun

  if (actor && /从.+返回.+(阁|宫|宗|峰|谷|山|城|域)/u.test(source)) {
    const place = source.match(/返回([^，。！？!?]+?(阁|宫|宗|峰|谷|山|城|域))/u)?.[1] ?? ''
    if (place) return `${actor}${place.startsWith('了') ? '' : '回了'}${place.replace(/^了/u, '')}。`
    return `${actor}回来了。`
  }

  if (actor && /没有急着(打开|动用|服下|说|回头|出手)/u.test(source)) {
    const target = source.match(/没有急着(?:打开|动用|服下)([^，。！？!?]+)/u)?.[1] ?? ''
    if (target) return `${actor}先把${target}压住了。`
    return `${actor}先压住了动作。`
  }

  if (actor && /(守了三天|三天没离开过|一直守在|一直没离开)/u.test(source)) {
    const place = source.match(/(?:在|守在|离开过)([^，。！？!?]+?(后院|门边|井台|木屋|山门|峰|谷|院))/u)?.[1] ?? ''
    if (place) return `${actor}一直守在${place.replace(/^(后院|门边|井台|木屋|山门|峰|谷|院)$/u, '$1')}。`
    return `${actor}一直守在那里。`
  }

  if (actor && /(坐了很久|看了很久|一路都没有开口|沉默了很久)/u.test(source)) {
    return `${actor}一路都没有开口。`
  }

  if (actor && /(把手从.+放下来|先把.+放下了|松开了.+剑柄)/u.test(source)) {
    const target = source.match(/把([^，。！？!?]+?)放下来/u)?.[1] ?? ''
    if (target) return `${actor}先把${target}放开了。`
    return `${actor}先把手收了回来。`
  }

  if (/两个人隔着.+站着/u.test(source)) {
    const site = source.match(/隔着([^，。！？!?]+?)站着/u)?.[1] ?? ''
    return site ? `两人隔着${site}站着。` : '两人隔着一段距离站着。'
  }

  if (actor && /看到.+(震|动|亮|响)第?一下/u.test(source)) {
    return `${actor}先停住了动作。`
  }

  return source
}

function resolveNarrationSubject(source: string) {
  const matched = source.match(/^(江溯|洛衍之|顾长惜|云斐然|苏清鸢|林清寒|宁玄策|沈镜玄|钟离越)/u)
  return matched?.[1] ?? ''
}

function resolveNarrationPronoun(source: string) {
  if (/^她/u.test(source)) return '她'
  if (/^他/u.test(source)) return '他'
  return ''
}

function compactIllustratedOpeningPages(pages: string[]) {
  if (pages.length === 0) return pages

  const rewritten = [...pages]
  const limit = Math.min(3, rewritten.length)

  for (let index = 0; index < limit; index += 1) {
    const current = rewritten[index]?.trim() ?? ''
    if (!current) continue
    if (current.replace(/\s+/g, '').length > 20) continue

    const compact = compressIllustratedNarration(current)
    if (!compact) continue

    const normalizedCurrent = current.replace(/\s+/g, '')
    const normalizedCompact = compact.replace(/\s+/g, '')
    if (normalizedCompact === normalizedCurrent) continue

    rewritten[index] = compact
  }

  return rewritten.filter((page, index, sourcePages) => {
    const current = page.trim()
    if (!current) return false
    const previous = sourcePages[index - 1]?.trim() ?? ''
    if (!previous) return true
    return previous.replace(/\s+/g, '') !== current.replace(/\s+/g, '')
  })
}

function splitReadableSentence(sentence: string, maxCharsPerLine: number) {
  const normalized = sentence.trim()
  if (!normalized) return []
  if (normalized.replace(/\s+/g, '').length <= maxCharsPerLine) return [normalized]

  const leadPairPattern = /^(翌日|次日|当夜|当天夜里|第二天一早|第二天|第三天夜里|第三天|第七天入暮时|第七天|天亮时|黄昏压下来时|黄昏时|那天入暮时)(，|。)(.+)$/u
  const leadPair = normalized.match(leadPairPattern)
  if (leadPair) {
    const lead = leadPair[1] ?? ''
    const punctuation = leadPair[2] ?? ''
    const rest = leadPair[3] ?? ''
    const mergedLead = `${lead}${punctuation}${rest.trim()}`
    if (mergedLead.replace(/\s+/g, '').length <= maxCharsPerLine + 8) {
      return [mergedLead]
    }
  }

  const clauses = normalized
    .split(/(?<=[，、；：——])/u)
    .map(part => part.trim())
    .filter(Boolean)

  if (clauses.length <= 1) {
    return hardSplitReadableText(normalized, maxCharsPerLine)
  }

  const lines: string[] = []
  let current = ''

  clauses.forEach(clause => {
    const candidate = `${current}${clause}`.trim()
    const compact = candidate.replace(/\s+/g, '')
    if (!current || compact.length <= maxCharsPerLine) {
      current = candidate
      return
    }

    if (current.trim()) lines.push(current.trim())
    const clauseCompact = clause.replace(/\s+/g, '')
    if (clauseCompact.length > maxCharsPerLine) {
      hardSplitReadableText(clause, maxCharsPerLine).forEach(chunk => lines.push(chunk))
      current = ''
      return
    }
    current = clause
  })

  if (current.trim()) lines.push(current.trim())
  return lines
}

function hardSplitReadableText(text: string, maxCharsPerLine: number) {
  const chunks: string[] = []
  let remaining = text.trim()
  const protectedObjectPhrasePattern = /(那枚按了[^，。！？!?]+的[^，。！？!?]+|那颗[^，。！？!?]+珠|那道[^，。！？!?]+剑意|那只[^，。！？!?]+手|那扇[^，。！？!?]+门|那枚[^，。！？!?]{6,}纸|那枚[^，。！？!?]{6,}玉简)/u

  while (remaining.replace(/\s+/g, '').length > maxCharsPerLine) {
    let splitIndex = Math.min(remaining.length, maxCharsPerLine)
    for (let index = Math.min(remaining.length - 1, maxCharsPerLine + 2); index >= Math.max(4, maxCharsPerLine - 4); index -= 1) {
      const prefix = remaining.slice(0, index)
      const suffix = remaining.slice(index)
      const lastChar = prefix.slice(-1)
      if (protectedObjectPhrasePattern.test(prefix) && !/[，、；：。！？!?——]/u.test(lastChar)) continue
      if (/^(按了|血手印|薄膜纸|玉简|碧水珠|剑意|递剑的手)/u.test(suffix)) continue
      if (/[，、；：。！？!?——]/u.test(lastChar)) {
        splitIndex = index
        break
      }
      if (/(然后|随后|接着|只是|但是|不过|于是|直到|如果|若是|忽然|终于)$/u.test(prefix)) {
        splitIndex = index
        break
      }
    }

    chunks.push(remaining.slice(0, splitIndex).trim())
    remaining = remaining.slice(splitIndex).trim()
  }

  if (remaining) chunks.push(remaining)
  return chunks.filter(Boolean)
}

function mergeReadableLines(lines: string[], maxCharsPerLine: number) {
  const merged: string[] = []
  const protectTrailingLeadPattern = /^(翌日|次日|当夜|当天夜里|第二天一早|第二天|第三天夜里|第三天|第七天入暮时|第七天|天亮时|黄昏压下来时|黄昏时|那天入暮时)[，。]?$/u
  const connectFollowingPattern = /^(天还没亮透|天还没亮|天刚亮|一早|清晨|江溯|洛衍之|顾长惜|云斐然|风|雨|他|她|营外|前头|这时|随后|然后|接着)/u

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return

    const previous = merged[merged.length - 1]
    if (!previous) {
      merged.push(trimmed)
      return
    }

    const previousCompact = previous.replace(/\s+/g, '')
    const currentCompact = trimmed.replace(/\s+/g, '')
    if (
      previousCompact.length <= Math.max(4, Math.floor(maxCharsPerLine * 0.55))
      && currentCompact.length <= Math.max(7, Math.floor(maxCharsPerLine * 0.85))
      && (previousCompact.length + currentCompact.length) <= maxCharsPerLine + 2
      && !/[。！？!?]$/u.test(previousCompact)
    ) {
      merged[merged.length - 1] = `${previous}${trimmed}`
      return
    }

    if (
      protectTrailingLeadPattern.test(previousCompact)
      && connectFollowingPattern.test(currentCompact)
      && (previousCompact.length + currentCompact.length) <= maxCharsPerLine + 8
    ) {
      merged[merged.length - 1] = `${previous}${trimmed}`
      return
    }

    merged.push(trimmed)
  })

  return merged
}

function repaginateReadableLines(
  lines: string[],
  options: {
    maxCharsPerLine: number
    sentenceCount: number
    hasIllustration: boolean
    preferCompact: boolean
  }
) {
  const maxLines = options.hasIllustration
    ? 5
    : options.preferCompact || options.sentenceCount >= 3
      ? 3
      : 3

  if (lines.length <= maxLines) {
    return lines
  }

  const pages = splitTextForPages(lines.join(''), {
    charLimit: Math.max(18, options.maxCharsPerLine * maxLines - 4),
    hardLimit: Math.max(26, options.maxCharsPerLine * maxLines + 3),
    minLength: Math.max(8, options.maxCharsPerLine - 4)
  })

  if (pages.length <= 1) {
    return mergeReadableLines(lines, options.maxCharsPerLine + 2).slice(0, maxLines)
  }

  return splitReadableSentence(pages[0] ?? lines.join(''), options.maxCharsPerLine)
    .slice(0, maxLines)
}

function clearAutoAdvanceTimer() {
  if (autoAdvanceTimer.value !== null) {
    window.clearTimeout(autoAdvanceTimer.value)
    autoAdvanceTimer.value = null
  }
}

function clearAutoPageAdvanceTimer() {
  if (autoPageAdvanceTimer.value !== null) {
    window.clearTimeout(autoPageAdvanceTimer.value)
    autoPageAdvanceTimer.value = null
  }
}

function clearAutoDialogAdvanceTimer() {
  if (autoDialogAdvanceTimer.value !== null) {
    window.clearTimeout(autoDialogAdvanceTimer.value)
    autoDialogAdvanceTimer.value = null
  }
}

function resetReadingState() {
  clearAutoAdvanceTimer()
  clearAutoPageAdvanceTimer()
  clearAutoDialogAdvanceTimer()
  pageIndex.value = 0
  pageComplete.value = false
  pageInstant.value = false
  currentDialogIndex.value = 0
  dialogsViewed.value = dialogs.value.length === 0
  dialogLineComplete.value = false
  dialogInstant.value = false
  monologueComplete.value = false
}

function tryLaunchPendingGameplay() {
  if (showGameplay.value) return
  const pendingTrigger = store.consumePendingGameplayTrigger()
  if (pendingTrigger) {
    triggerGameplay(pendingTrigger)
  }
}

function scheduleAutoAdvance() {
  clearAutoAdvanceTimer()
  if (!shouldAutoAdvanceNode.value && !showMonologue.value && !showDialogs.value) return
  autoAdvanceTimer.value = window.setTimeout(() => {
    if (shouldAutoAdvanceNode.value && implicitAdvanceChoiceIndex.value >= 0) {
      void selectChoice(implicitAdvanceChoiceIndex.value)
    }
  }, shouldAutoAdvanceNode.value ? (shouldFastAdvanceNode.value ? 240 : AUTO_ADVANCE_DELAY_MS) : 420)
}

function scheduleAutoPageAdvance() {
  clearAutoPageAdvanceTimer()
  if (!hasNextPage.value || showChoices.value || showDialogs.value || showGameplay.value) return
  const currentText = currentPageText.value.replace(/\s+/g, '')
  const punctuationPauseBonus = (
    (currentText.match(/[。！？!?]/gu)?.length ?? 0) * 140
    + (currentText.match(/[，、；：——]/gu)?.length ?? 0) * 72
  )
  const delay = Math.min(
    STORY_PAGE_AUTO_ADVANCE_MAX_MS,
    Math.max(STORY_PAGE_AUTO_ADVANCE_MIN_MS, currentText.length * 32 + punctuationPauseBonus)
  )
  autoPageAdvanceTimer.value = window.setTimeout(() => {
    advancePage(true)
  }, delay)
}

function scheduleAutoDialogAdvance() {
  clearAutoDialogAdvanceTimer()
  if (!showDialogs.value) return
  if (!dialogLineComplete.value) return
  if (currentDialogIndex.value >= dialogs.value.length - 1) return
  const dialogText = dialogs.value[currentDialogIndex.value]?.content ?? ''
  const delay = Math.min(
    1680,
    Math.max(STORY_DIALOG_AUTO_ADVANCE_BASE_MS, dialogText.length * 24)
  )
  autoDialogAdvanceTimer.value = window.setTimeout(() => {
    showNextDialog(currentDialogIndex.value + 1, true)
  }, delay)
}

function onPageComplete() {
  pageComplete.value = true
  sfxStoryTextSettle()

  if (hasNextPage.value) {
    scheduleAutoPageAdvance()
    return
  }

  const gameplayTrigger = currentNode.value?.content.gameplayTrigger
  if (gameplayTrigger && !showGameplay.value) {
    triggerGameplay(gameplayTrigger)
    return
  }

  tryLaunchPendingGameplay()
  if (showDialogs.value) {
    scheduleAutoDialogAdvance()
    return
  }
  scheduleAutoAdvance()
}

function onMonologueComplete() {
  monologueComplete.value = true
  scheduleAutoAdvance()
}

function onDialogLineComplete() {
  dialogLineComplete.value = true
  if (!showDialogs.value) return
  if (currentDialogIndex.value < dialogs.value.length - 1) {
    scheduleAutoDialogAdvance()
    return
  }
  dialogsViewed.value = true
  if (!currentNode.value?.content.innerMonologue) {
    scheduleAutoAdvance()
  }
}

function advancePage(force = false) {
  if (!pageComplete.value) {
    if (force) {
      pageInstant.value = true
    }
    return
  }

  if (hasNextPage.value) {
    clearAutoPageAdvanceTimer()
    pageIndex.value += 1
    pageComplete.value = false
    pageInstant.value = false
  }
}

function handleStageTap(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('button, a, input, textarea, select')) return
  if (showChoices.value || showGameplay.value) return
  if (showDialogs.value) {
    if (!dialogLineComplete.value) {
      dialogInstant.value = true
      return
    }
    if (currentDialogIndex.value < dialogs.value.length - 1) {
      showNextDialog(currentDialogIndex.value + 1)
      return
    }
    if (hasImplicitAdvanceChoice.value) {
      void selectChoice(implicitAdvanceChoiceIndex.value)
    }
    return
  }
  advancePage(false)
}

function showNextDialog(index: number, silent = false) {
  currentDialogIndex.value = index
  dialogsViewed.value = false
  dialogLineComplete.value = false
  dialogInstant.value = false
  if (!silent) {
    sfxStoryDialog()
  } else if (dialogs.value.length > 1) {
    sfxStoryDialog()
  }

  clearAutoDialogAdvanceTimer()
}

async function selectChoice(index: number) {
  clearAutoAdvanceTimer()
  const choice = visibleChoices.value[index]
  if (!choice) return
  sfxStoryChoice()

  if (choice.isEndMarker || choice.targetId === null) {
    await store.makeChoice(index)
    const termination = store.checkEndNode()
    if (termination) {
      currentTermination.value = termination
      if (termination.reason === 'volume_end') {
        showVolumeEnd.value = true
      } else {
        showEnding.value = true
      }
    }
    return
  }

  await store.makeChoice(index)
  resetReadingState()
}

async function handleContinueNextVolume() {
  const success = await store.transitionToNextVolume()
  if (success) {
    showEnding.value = false
    showVolumeEnd.value = false
    currentTermination.value = null
    resetReadingState()
  }
}

function handleRestart() {
  store.resetStory()
  showEnding.value = false
  showVolumeEnd.value = false
  currentTermination.value = null
  resetReadingState()
}

function handleReturnToMenu() {
  store.suspendStory()
  showEnding.value = false
  showVolumeEnd.value = false
  currentTermination.value = null
  emit('back')
}

function handleViewEndingGallery() {
}

async function triggerGameplay(trigger: GameplayTrigger) {
  currentGameplayTrigger.value = trigger
  showGameplay.value = true
}

async function onGameplayComplete(_result: GameplayResult) {
  showGameplay.value = false
  currentGameplayTrigger.value = null
  store.clearPendingGameplayTrigger()
  resetReadingState()
}

function onGameplaySkip() {
  showGameplay.value = false
  currentGameplayTrigger.value = null
  store.clearPendingGameplayTrigger()
}

async function onSideQuestTrigger(questId: string) {
  await store.executeSideQuest(questId)
}

onMounted(async () => {
  if (!currentNode.value) {
    const preferredPerspective = playerStore.perspective === 'female' ? 'female' : 'male'
    await store.initStory(preferredPerspective, store.currentVolume || 1)
  }
})

watch(
  () => playerStore.perspective,
  perspective => {
    if (!perspective) return
    if (perspective === store.currentPerspective) return
    void store.continueStory(perspective)
  }
)

onBeforeUnmount(() => {
  clearAutoAdvanceTimer()
  clearAutoPageAdvanceTimer()
  clearAutoDialogAdvanceTimer()
})

watch(currentNode, () => {
  lastDialogVoiceKey.value = ''
  lastDebutVoiceKey.value = ''
  resetReadingState()
})

watch(
  () => dialogs.value.length,
  length => {
    dialogsViewed.value = length === 0
    currentDialogIndex.value = 0
  },
  { immediate: true }
)

watch(showDialogs, visible => {
  if (!visible) {
    clearAutoDialogAdvanceTimer()
    return
  }

  currentDialogIndex.value = 0
  dialogsViewed.value = false
  dialogLineComplete.value = false
  dialogInstant.value = false
})

watch(debutCharacterProfile, profile => {
  if (!profile?.voice) return
  if (!seenDebutCharacterIds.value.includes(profile.id)) {
    seenDebutCharacterIds.value = [...seenDebutCharacterIds.value, profile.id]
  }
  const nodeId = currentNode.value?.id ?? 'unknown'
  const cueKey = `${nodeId}:${profile.voice.key}`
  if (lastDebutVoiceKey.value === cueKey) return
  lastDebutVoiceKey.value = cueKey
  void emitStoryVoiceCue({
    key: profile.voice.key,
    text: profile.voice.sampleLine,
    speaker: profile.name,
    characterId: profile.id,
    mode: 'debut'
  })
})

watch(isDebutDialog, active => {
  if (!active) return
  const characterId = currentIllustrationCharacterId.value
  if (!characterId) return
  if (seenDebutCharacterIds.value.includes(characterId)) return
  seenDebutCharacterIds.value = [...seenDebutCharacterIds.value, characterId]
})

watch(
  () => {
    if (!showDialogs.value) return ''
    const dialog = dialogs.value[currentDialogIndex.value]
    return dialog ? `${currentNode.value?.id ?? 'unknown'}:${currentDialogIndex.value}:${dialog.speaker}:${dialog.content}` : ''
  },
  dialogKey => {
    if (!dialogKey || dialogKey === lastDialogVoiceKey.value) return
    const dialog = dialogs.value[currentDialogIndex.value]
    if (!dialog) return
    const profile = resolveStoryCharacterProfileByName(dialog.speaker)
    lastDialogVoiceKey.value = dialogKey
    void emitStoryVoiceCue({
      key: profile?.voice?.key ?? `dialog:${dialog.speaker}:${currentDialogIndex.value}`,
      text: dialog.content,
      speaker: dialog.speaker,
      characterId: profile?.id,
      mode: 'dialog'
    })
  }
)

watch(
  () => showGameplay.value,
  visible => {
    if (visible) {
      clearAutoAdvanceTimer()
      clearAutoPageAdvanceTimer()
    } else {
      scheduleAutoAdvance()
    }
  }
)

async function jumpToDebugStoryNode(nodeId: string, perspective?: string) {
  const normalizedPerspective = perspective === 'female' ? 'female' : 'male'
  if (store.currentPerspective !== normalizedPerspective) {
    await store.continueStory(normalizedPerspective)
  }
  await store.goToNode(nodeId)
  resetReadingState()
}

watch(
  () => [route.query.storyNode, route.query.storyPerspective] as const,
  ([storyNode, storyPerspective]) => {
    if (typeof storyNode !== 'string' || !storyNode.trim()) return
    void jumpToDebugStoryNode(storyNode, typeof storyPerspective === 'string' ? storyPerspective : undefined)
  },
  { immediate: true }
)

defineExpose({
  triggerGameplay,
  router
})
</script>

<style scoped>
.story-player {
  --story-scene-strip-height: clamp(210px, 28vh, 268px);
  --story-scene-strip-offset: clamp(176px, 23vh, 224px);
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  background: transparent;
  color: #2f4d47;
  overflow-y: auto;
  padding: 0 8px 22px;
  font-family: var(--font-game);
  isolation: isolate;
}

.story-player > :not(.loading-overlay, .story-notification-stack, .gameplay-layer) {
  width: min(640px, 100%);
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 2;
}

.story-player::before {
  display: none;
}

.story-stage {
  display: grid;
  gap: 12px;
  margin-top: 6px;
  min-width: 0;
  align-content: start;
}

.story-stage.story-stage-live {
  gap: 6px;
}

.story-stage-event-shell {
  position: relative;
  display: grid;
  gap: 12px;
  padding: 6px 6px 10px;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  min-width: 0;
  overflow: visible;
}

.story-stage-event-shell::before {
  display: none;
}

.story-stage-event-shell.with-illustration {
  gap: 8px;
}

.story-stage-event-shell.with-supporting-visual {
  overflow: hidden;
  padding-top: 0;
}

.story-stage-event-shell.can-rest-here {
  padding-bottom: 0;
}

.story-stage-event-shell.template-narration {
  background: transparent;
}

.story-stage-event-shell.template-narration.compact-moment {
  padding-bottom: 2px;
  background: transparent;
}

.story-stage-event-shell.template-narration.compact-moment .story-stage-copy-flow {
  width: min(100%, 340px);
  gap: 6px;
  padding-top: 2px;
}

.story-stage-event-shell.template-narration.compact-moment :deep(.story-text-panel) {
  padding: 0;
  border-radius: 16px;
  background: transparent;
}

.story-stage-event-shell.template-narration.compact-moment :deep(.story-main-text) {
  max-width: 14ch;
  font-size: 11px;
  line-height: 1.68;
}

.story-stage-event-shell.template-narration.with-supporting-visual {
  --story-scene-strip-height: clamp(258px, 33vh, 328px);
  --story-scene-strip-offset: clamp(212px, 27vh, 252px);
  padding: 0 0 10px;
  background:
    linear-gradient(180deg, rgba(248, 252, 248, 0.12), rgba(239, 246, 242, 0.42) 56%, rgba(239, 246, 242, 0.56));
}

.story-stage-event-shell.template-debut {
  background:
    linear-gradient(180deg, rgba(255, 251, 242, 0.44), rgba(238, 246, 241, 0.24)),
    radial-gradient(circle at top right, rgba(221, 184, 111, 0.08), transparent 30%);
  min-height: min(68dvh, 660px);
}

.story-stage-event-shell.template-debut .story-stage-copy-flow {
  gap: 10px;
  padding-top: 10px;
  padding-bottom: 12px;
}

.story-stage-event-shell.template-debut_dialog {
  background:
    linear-gradient(180deg, rgba(245, 248, 243, 0.5), rgba(232, 240, 236, 0.58)),
    radial-gradient(circle at top right, rgba(221, 184, 111, 0.08), transparent 24%);
  min-height: min(54dvh, 520px);
  padding-bottom: 6px;
}

.story-stage-event-shell.template-debut_dialog .story-stage-copy-flow {
  gap: 8px;
  padding: 8px 8px 0 10px;
}

.story-stage-event-shell.template-debut_dialog :deep(.story-illustration) {
  order: 0;
}

.story-stage-event-shell.template-debut_dialog :deep(.story-character-debut-stage) {
  width: min(100%, 262px);
  min-height: clamp(228px, 31vh, 324px);
}

.story-stage-event-shell.template-debut_dialog :deep(.story-character-debut-banner) {
  margin: 0 2px;
}

.story-stage-event-shell.template-debut_dialog :deep(.story-dialog-stage) {
  margin-top: -2px;
}

.story-stage-event-shell.template-dialog {
  background:
    linear-gradient(180deg, rgba(245, 249, 244, 0.28), rgba(231, 239, 235, 0.18));
  min-height: min(56dvh, 520px);
  padding-bottom: 0;
}

.story-stage-event-shell.template-monologue {
  background:
    linear-gradient(180deg, rgba(244, 250, 247, 0.32), rgba(234, 242, 239, 0.24)),
    radial-gradient(circle at top right, rgba(163, 196, 184, 0.06), transparent 30%);
  min-height: min(50dvh, 460px);
}

.story-stage-event-shell.template-warning {
  background:
    linear-gradient(180deg, rgba(255, 247, 240, 0.86), rgba(246, 238, 232, 0.76)),
    radial-gradient(circle at top right, rgba(203, 110, 88, 0.12), transparent 28%);
}

.story-stage-event-shell.template-warning::before {
  background: linear-gradient(180deg, rgba(191, 92, 61, 0.58), rgba(148, 63, 54, 0.16));
}

.story-stage-event-shell.template-warning {
  box-shadow: 0 12px 30px rgba(146, 77, 60, 0.08);
}

.story-stage-event-shell.template-prebattle {
  background:
    linear-gradient(180deg, rgba(248, 244, 239, 0.88), rgba(239, 234, 228, 0.78)),
    radial-gradient(circle at top right, rgba(161, 88, 53, 0.14), transparent 28%);
}

.story-stage-event-shell.template-prebattle::before {
  background: linear-gradient(180deg, rgba(175, 86, 47, 0.64), rgba(103, 46, 33, 0.18));
}

.story-stage-event-shell.template-prebattle {
  box-shadow: 0 14px 34px rgba(118, 60, 40, 0.1);
}

.story-stage-copy-flow {
  display: grid;
  gap: 12px;
  padding: 0;
  min-width: 0;
  order: 1;
  position: relative;
  z-index: 2;
}

.story-stage-event-shell.with-supporting-visual .story-stage-copy-flow {
  margin-top: var(--story-scene-strip-offset);
  padding: 0 12px 0;
}

.story-stage-supporting-visual {
  position: absolute;
  inset: 0 0 auto 0;
  display: flex;
  justify-content: stretch;
  align-items: flex-start;
  height: var(--story-scene-strip-height);
  padding: 0;
  z-index: 1;
  pointer-events: none;
}

.story-stage-supporting-visual::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 88%;
  background:
    linear-gradient(180deg, rgba(17, 26, 24, 0), rgba(236, 243, 239, 0.06) 22%, rgba(236, 243, 239, 0.5) 66%, rgba(236, 243, 239, 0.82));
  pointer-events: none;
}

.story-stage-supporting-visual :deep(.story-illustration) {
  width: 100%;
  order: initial;
}

.story-stage-supporting-visual :deep(.story-illustration.mode-supporting .story-illustration-frame) {
  max-width: none;
  width: 100%;
  border-radius: 28px 28px 0 0;
  opacity: 0.88;
  box-shadow: 0 8px 18px rgba(44, 61, 57, 0.04);
  overflow: hidden;
}

.story-stage-supporting-visual :deep(.story-illustration-media),
.story-stage-supporting-visual :deep(.story-illustration-frame) {
  height: 100%;
}

.story-stage-supporting-visual :deep(.story-illustration.type-scene .story-illustration-frame),
.story-stage-supporting-visual :deep(.story-illustration.type-faction .story-illustration-frame) {
  width: 100%;
}

.story-stage-supporting-visual :deep(.story-illustration img) {
  filter: saturate(0.94) contrast(1.01) brightness(0.88);
}

.story-stage-supporting-visual :deep(.story-illustration-voice) {
  display: none;
}

.story-stage-event-shell :deep(.story-text-panel) {
  padding: 0;
  border-left: 0;
  box-shadow: none;
  background: transparent;
}

.story-stage-event-shell :deep(.story-main-text) {
  max-width: min(100%, 26ch);
}

.story-stage-event-shell.template-narration :deep(.story-text-panel) {
  background: transparent;
}

.story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-text-panel) {
  margin: 0;
  width: 100%;
  max-width: none;
  min-height: auto;
  padding: 9px 12px 11px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(252, 254, 250, 0.94), rgba(246, 250, 247, 0.92)),
    radial-gradient(circle at top left, rgba(231, 196, 118, 0.12), transparent 42%);
  box-shadow:
    0 14px 26px rgba(31, 46, 43, 0.08),
    inset 0 0 0 1px rgba(191, 155, 92, 0.1);
  overflow: visible;
}

.story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-main-text) {
  max-width: none;
  min-height: auto;
  font-size: 15.5px;
  line-height: 1.78;
  color: rgba(42, 63, 59, 0.94);
  text-wrap: pretty;
  overflow: visible;
}

.story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-text-panel.short-text) {
  min-height: auto;
  padding: 8px 10px 10px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(252, 254, 250, 0.92), rgba(245, 250, 246, 0.84)),
    radial-gradient(circle at top left, rgba(231, 196, 118, 0.08), transparent 42%);
  box-shadow:
    0 10px 18px rgba(31, 46, 43, 0.06),
    inset 0 0 0 1px rgba(191, 155, 92, 0.08);
}

.story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-text-panel.short-text .story-main-text) {
  min-height: auto;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 16.5px;
  line-height: 1.62;
}

.story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-text-panel.short-text .story-panel-head) {
  min-height: 4px;
  margin-bottom: 0;
}

.story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-text-panel.short-text .panel-breath) {
  width: 4px;
  height: 4px;
}

.story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-text-panel.short-text .story-main-text::before) {
  width: 3px;
  opacity: 0.42;
}

.story-stage-event-shell.with-dialog .story-stage-copy-flow {
  gap: 4px;
}

.story-stage-event-shell.template-dialog .story-stage-copy-flow {
  gap: 0;
  min-height: 0;
  align-content: stretch;
  padding: 0;
  justify-content: end;
}

.story-stage-event-shell.template-dialog::after {
  display: none;
}

.story-stage-event-shell.template-monologue .story-stage-copy-flow {
  gap: 4px;
  min-height: min(42dvh, 400px);
  align-content: center;
}

.story-stage-event-shell.template-warning .story-stage-copy-flow,
.story-stage-event-shell.template-prebattle .story-stage-copy-flow {
  gap: 6px;
}

.story-stage-event-shell.template-prebattle :deep(.story-text-panel) {
  padding-top: 0;
}

.story-stage-event-shell.template-prebattle :deep(.story-main-text) {
  font-weight: 560;
}

.story-stage-event-shell.template-warning :deep(.moment-hint) {
  color: #9a4f37;
}

.story-stage-event-shell.template-warning :deep(.story-main-text::before) {
  background: linear-gradient(180deg, rgba(191, 92, 61, 0.3), rgba(135, 74, 58, 0.08));
}

.story-stage-event-shell.template-prebattle :deep(.moment-hint) {
  color: #93451d;
}

.story-stage-event-shell.template-prebattle :deep(.story-main-text::before) {
  background: linear-gradient(180deg, rgba(175, 86, 47, 0.34), rgba(103, 46, 33, 0.1));
}

.story-stage-event-shell.template-prebattle :deep(.story-main-text) {
  color: rgba(57, 43, 35, 0.94);
}

.story-pause-strip {
  display: flex;
  justify-content: flex-start;
  margin-top: -2px;
  padding-left: 8px;
}

.story-pause-card {
  display: grid;
  gap: 0;
  width: min(100%, 298px);
  max-width: min(100%, 298px);
  padding: 6px 0 2px 12px;
}

.story-pause-copy {
  margin: 0;
  color: rgba(52, 76, 71, 0.92);
  font-family: var(--font-story);
  font-size: 17px;
  line-height: 1.7;
  white-space: pre-wrap;
  text-wrap: pretty;
  word-break: keep-all;
  overflow-wrap: anywhere;
  position: relative;
  padding-left: 10px;
}

.story-pause-copy::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.24em;
  bottom: 0.2em;
  width: 1px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(183, 135, 58, 0.14), rgba(112, 166, 148, 0.05));
  opacity: 0.26;
}

.story-pause-badge {
  padding: 2px 8px 2px 10px;
  border-radius: 999px;
  background: rgba(248, 252, 248, 0.22);
  border: 0;
  color: rgba(100, 118, 112, 0.4);
  font-size: 8px;
  line-height: 1.2;
  position: relative;
  font-family: var(--font-ui);
}

.story-pause-badge::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 4px;
  margin-top: -2px;
  border-radius: 999px;
  background: rgba(166, 128, 67, 0.28);
}

.story-fallback-text {
  margin: 0;
  color: rgba(73, 91, 80, 0.62);
  font-size: 12px;
  line-height: 1.62;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(250, 253, 247, 0.88), rgba(232, 243, 239, 0.92));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(124, 150, 137, 0.24);
  border-top-color: #9a6827;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  font-size: 13px;
  color: rgba(49, 76, 70, 0.68);
}

.inner-monologue {
  display: grid;
  gap: 2px;
  padding: 2px 2px 1px 7px;
  border: 0;
  border-left: 2px solid rgba(182, 132, 55, 0.18);
  border-radius: 0;
  background: transparent;
  color: rgba(47, 72, 67, 0.76);
  font-style: italic;
  position: relative;
  overflow: hidden;
}

.inner-monologue::after {
  display: none;
}

.inner-monologue > span {
  color: rgba(137, 95, 38, 0.72);
  font-size: 8px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.inner-monologue :deep(.typewriter) {
  display: block;
  font-family: var(--font-story);
  font-size: 14px;
  line-height: 1.72;
}

.empty-state {
  min-height: 62%;
  display: grid;
  gap: 8px;
  place-items: center;
  align-content: center;
  color: rgba(58, 82, 77, 0.62);
}

.empty-state p {
  margin: 0;
  max-width: 18ch;
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
  text-wrap: pretty;
}

.gameplay-layer {
  position: fixed;
  inset: 0;
  z-index: 180;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background: rgba(29, 45, 42, 0.42);
  backdrop-filter: blur(12px);
}

.gameplay-layer :deep(.gameplay-embed) {
  width: min(560px, 100%);
}

@keyframes breathe {
  0%, 100% { opacity: 0.42; }
  50% { opacity: 0.82; }
}

@media (max-width: 560px) {
  .story-player {
    --story-scene-strip-height: clamp(224px, 29vh, 270px);
    --story-scene-strip-offset: clamp(184px, 24vh, 224px);
    padding: 0 6px 16px;
  }

  .story-stage {
    gap: 10px;
  }

  .story-stage-event-shell {
    gap: 10px;
    padding: 4px 4px 8px;
    border-radius: 0;
  }

  .story-stage-event-shell.template-dialog {
    min-height: min(54dvh, 458px);
  }

  .story-stage-event-shell.template-debut {
    min-height: min(60dvh, 560px);
  }

  .story-stage-event-shell.template-debut_dialog {
    min-height: min(48dvh, 440px);
  }

  .story-stage-event-shell.template-monologue {
    min-height: min(42dvh, 360px);
  }

  .story-stage-event-shell.template-debut_dialog :deep(.story-character-debut-stage) {
    width: min(100%, 228px);
    min-height: clamp(206px, 24vh, 276px);
  }

  .story-stage-event-shell.template-narration.with-supporting-visual {
    --story-scene-strip-height: clamp(220px, 26vh, 252px);
    --story-scene-strip-offset: clamp(178px, 22vh, 208px);
    padding: 0 0 8px;
  }

  .story-stage-event-shell.template-narration.compact-moment .story-stage-copy-flow {
    width: min(100%, 264px);
    padding-top: 0;
  }

  .story-stage-event-shell.template-narration.compact-moment :deep(.story-text-panel) {
    padding: 3px 8px 5px 0;
  }

  .story-stage-event-shell.template-narration.compact-moment :deep(.story-main-text) {
    max-width: 13ch;
    font-size: 10px;
    line-height: 1.62;
  }

  .story-stage-event-shell.with-supporting-visual {
    padding-top: 0;
  }

  .story-stage-copy-flow {
    gap: 10px;
    padding: 0;
  }

  .story-stage-event-shell.template-dialog .story-stage-copy-flow {
    padding-top: 0;
  }

  .story-stage-event-shell.template-monologue .story-stage-copy-flow {
    min-height: min(34dvh, 288px);
  }

  .story-stage-event-shell.with-supporting-visual .story-stage-copy-flow {
    margin-top: var(--story-scene-strip-offset);
    padding: 0 10px 0;
  }

  .story-stage-event-shell :deep(.story-text-panel) {
    padding: 0;
  }

  .story-stage-event-shell :deep(.story-main-text) {
    max-width: min(100%, 100%);
  }

  .story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-text-panel) {
    margin-right: 0;
    width: 100%;
    max-width: none;
    padding: 8px 10px 10px;
    border-radius: 20px;
  }

  .story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-main-text) {
    max-width: none;
    min-height: auto;
    font-size: 14.8px;
    line-height: 1.72;
  }

  .story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-text-panel.short-text) {
    min-height: auto;
    padding: 7px 8px 9px;
    border-radius: 16px;
  }

  .story-stage-event-shell.template-narration.with-supporting-visual :deep(.story-text-panel.short-text .story-main-text) {
    min-height: auto;
    font-size: 15.2px;
    line-height: 1.56;
  }

  .story-pause-badge {
    font-size: 8px;
  }

  .story-pause-card {
    width: min(100%, 312px);
    max-width: min(100%, 312px);
    padding: 6px 0 2px 10px;
  }

  .story-pause-copy {
    font-size: 16px;
    line-height: 1.66;
  }

  .story-player > :not(.loading-overlay, .story-notification-stack, .gameplay-layer) {
    width: 100%;
  }
}
</style>
