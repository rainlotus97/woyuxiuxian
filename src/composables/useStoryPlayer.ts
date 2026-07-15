/**
 * 故事播放器 — 控制故事章节的播放、选择、效果写入
 */
import { ref, computed } from 'vue'
import type { StoryChapter, StorySection } from '@/types/storyChapter'
import type { ChoiceEffect } from '@/types/storyChapter'
import { usePlayerStore } from '@/stores/playerStore'
import { useStoryArchiveStore } from '@/stores/storyArchiveStore'
import { useWorldStore } from '@/stores/worldStore'

export type StoryPlayerState = 'idle' | 'playing' | 'paused' | 'finished'

export function useStoryPlayer() {
  const playerStore = usePlayerStore()
  const archiveStore = useStoryArchiveStore()
  const worldStore = useWorldStore()

  const state = ref<StoryPlayerState>('idle')
  const currentChapter = ref<StoryChapter | null>(null)
  const currentSectionIndex = ref(0)
  const choiceRecord = ref<Record<string, number>>({})
  const isVisible = ref(false)

  const currentSection = computed<StorySection | null>(() => {
    if (!currentChapter.value) return null
    return currentChapter.value.sections[currentSectionIndex.value] ?? null
  })

  const isLastSection = computed(() => {
    if (!currentChapter.value) return false
    return currentSectionIndex.value >= currentChapter.value.sections.length - 1
  })

  const progress = computed(() => {
    if (!currentChapter.value) return 0
    return Math.round((currentSectionIndex.value / currentChapter.value.sections.length) * 100)
  })

  // 开始播放一个章节
  function playChapter(chapter: StoryChapter) {
    currentChapter.value = chapter
    currentSectionIndex.value = 0
    choiceRecord.value = {}
    state.value = 'playing'
    isVisible.value = true
  }

  // 自动前进（无选择的叙事段）
  function autoAdvance() {
    if (isLastSection.value) {
      finishChapter()
      return
    }
    currentSectionIndex.value++
  }

  // 选择选项
  function makeChoice(choiceIndex: number) {
    const section = currentSection.value
    if (!section || !section.choices || !currentChapter.value) return

    const choice = section.choices[choiceIndex]
    if (!choice) return

    // 记录选择
    choiceRecord.value[section.id] = choiceIndex

    // 执行效果
    if (choice.effects) {
      applyEffects(choice.effects)
    }

    // 跳转到下一段
    const nextId = choice.nextSectionId
    const nextIdx = currentChapter.value.sections.findIndex(s => s.id === nextId)
    if (nextIdx >= 0) {
      currentSectionIndex.value = nextIdx
    } else if (isLastSection.value) {
      finishChapter()
    } else {
      currentSectionIndex.value++
    }
  }

  // 应用选择效果
  function applyEffects(effects: ChoiceEffect[]) {
    for (const effect of effects) {
      switch (effect.type) {
        case 'npc_favor':
          if (effect.npcId && effect.value) {
            worldStore.applyStoryRelationshipChange(effect.npcId, { favorDelta: effect.value })
          }
          break
        case 'npc_hatred':
          if (effect.npcId && effect.value) {
            worldStore.applyStoryRelationshipChange(effect.npcId, { hatredDelta: effect.value })
          }
          break
        case 'npc_unlock':
          if (effect.npcId) {
            worldStore.unlockNpc(effect.npcId)
          }
          break
        case 'item_gain':
          if (effect.itemId && effect.quantity) {
            playerStore.addToInventory({
              id: `item_${Date.now()}`,
              name: effect.itemId,
              icon: '物',
              type: 'material',
              quality: 'common',
              quantity: effect.quantity,
              description: ''
            })
          }
          break
        case 'realm_exp':
          if (effect.value) {
            playerStore.addCultivation(effect.value)
          }
          break
        case 'gold':
          if (effect.value) {
            playerStore.addGold(effect.value)
          }
          break
       case 'flag_set':
         if (effect.flag) {
            worldStore.addWorldFlag(effect.flag)
         }
         break
        case 'ending_point':
          if (effect.endingKey && effect.endingValue) {
            worldStore.addWorldFlag(`ending:${effect.endingKey}:${effect.endingValue}`)
          }
          break
      }
    }
  }

  // 完成章节
  function finishChapter() {
    if (!currentChapter.value) return
    
    const chapter = currentChapter.value
    const unlockedNpcs: string[] = []
    
    // 记录NPC解锁
    if (chapter.npcIntroductions) {
      for (const npcId of chapter.npcIntroductions) {
        worldStore.unlockNpc(npcId)
        unlockedNpcs.push(npcId)
      }
    }

    // 存入档案
    archiveStore.completeChapter(chapter, choiceRecord.value, unlockedNpcs, chapter.skillUnlocks ?? [])

    state.value = 'finished'
    isVisible.value = false
    currentChapter.value = null
    currentSectionIndex.value = 0
  }

  // 关闭面板
  function close() {
    isVisible.value = false
    state.value = 'idle'
  }

  return {
    state, currentChapter, currentSection, currentSectionIndex,
    isVisible, progress, isLastSection,
    playChapter, autoAdvance, makeChoice, finishChapter, close
  }
}
