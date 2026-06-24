/**
 * 章节触发器 — 在游戏状态变更时检查可触发的故事章节
 */
import { computed, ref } from 'vue'
import type { StoryChapter, ChapterTrigger } from '@/types/storyChapter'
import { usePlayerStore } from '@/stores/playerStore'
import { useStoryArchiveStore } from '@/stores/storyArchiveStore'
import { useWorldStore } from '@/stores/worldStore'

export function useChapterTrigger() {
  const playerStore = usePlayerStore()
  const archiveStore = useStoryArchiveStore()
  const worldStore = useWorldStore()

  const registry = ref<StoryChapter[]>([])

  const availableChapters = computed(() => {
    const playerPerspective = playerStore.perspective ?? 'male'
    return registry.value.filter(ch => {
      if (ch.perspective !== 'both' && ch.perspective !== playerPerspective) return false
      if (archiveStore.isChapterCompleted(ch.id)) return false
      return true
    })
  })

  function register(chapters: StoryChapter[]) {
    registry.value = chapters
  }

  function checkTrigger(trigger: ChapterTrigger): boolean {
    switch (trigger.type) {
      case 'realm': {
        const playerRealm = playerStore.realm
        const targetRealm = trigger.realm
        const targetLevel = trigger.realmLevel ?? 1
        if (!targetRealm) return false
        return playerRealm === targetRealm && playerStore.realmLevel >= targetLevel
      }
      case 'first_enter': {
        if (!trigger.mapId) return false
        return worldStore.hasWorldFlag(`entered_${trigger.mapId}`)
      }
      case 'sect_join': {
        if (!trigger.sectId) return false
        return worldStore.hasWorldFlag(`joined_sect_${trigger.sectId}`)
      }
      case 'encounter': {
        if (!trigger.encounterId) return false
        return worldStore.hasWorldFlag(`encounter_${trigger.encounterId}`)
      }
      case 'choice_flag': {
        if (!trigger.flag) return false
        return worldStore.hasWorldFlag(trigger.flag)
      }
      case 'auto':
        return true
      default:
        return false
    }
  }

  function getPendingChapters(): StoryChapter[] {
    return availableChapters.value.filter(ch => {
      for (const trigger of ch.triggers) {
        if (checkTrigger(trigger)) return true
      }
      return false
    })
  }

  function onRealmBreakthrough(realm: string, level: number) {
    return getPendingChapters().filter(ch =>
      ch.triggers.some(t => t.type === 'realm' && t.realm === realm && (!t.realmLevel || level >= t.realmLevel))
    )
  }

  function onFirstEnterMap(mapId: string) {
    return getPendingChapters().filter(ch =>
      ch.triggers.some(t => t.type === 'first_enter' && t.mapId === mapId)
    )
  }

  function onSectJoin(sectId: string) {
    return getPendingChapters().filter(ch =>
      ch.triggers.some(t => t.type === 'sect_join' && t.sectId === sectId)
    )
  }

  return {
    registry, availableChapters,
    register, checkTrigger, getPendingChapters,
    onRealmBreakthrough, onFirstEnterMap, onSectJoin
  }
}
