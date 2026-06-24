/**
 * 故事档案 Store — 持久化已完成章节，支持回看
 */
import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import type { StoryArchiveEntry, StoryChapter, Perspective } from '@/types/storyChapter'

const STORAGE_KEY = 'woyu-xiuxian-story-archive'

interface ArchiveState {
  entries: StoryArchiveEntry[]
}

function getDefaultArchive(): ArchiveState {
  return { entries: [] }
}

export const useStoryArchiveStore = defineStore('storyArchive', () => {
  let initialData: ArchiveState
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    initialData = saved ? JSON.parse(saved) : getDefaultArchive()
  } catch {
    initialData = getDefaultArchive()
  }

  const entries = ref<StoryArchiveEntry[]>(initialData.entries)

  // 按卷分组
  const entriesByVolume = computed(() => {
    const grouped: Record<number, StoryArchiveEntry[]> = {}
    for (const entry of entries.value) {
      if (!grouped[entry.volume]) grouped[entry.volume] = []
      grouped[entry.volume]!.push(entry)
    }
    return grouped
  })

  // 已完成的总章节数
  const totalCompleted = computed(() => entries.value.length)

  // 已完成的最新章节
  const lastCompleted = computed(() => {
    if (entries.value.length === 0) return null
    return entries.value.reduce((a, b) => a.completedAt > b.completedAt ? a : b)
  })

  // 获取某卷的所有完成章节
  function getEntriesForVolume(volume: number): StoryArchiveEntry[] {
    return entries.value.filter(e => e.volume === volume)
  }

  // 检查章节是否已完成
  function isChapterCompleted(chapterId: string): boolean {
    return entries.value.some(e => e.chapterId === chapterId)
  }

  // 完成一个章节，存入档案
  function completeChapter(
    chapter: StoryChapter,
    choices: Record<string, number>,
    unlockedNpcs: string[],
    unlockedSkills: string[]
  ) {
    // 如果已经完成，覆盖
    const existing = entries.value.findIndex(e => e.chapterId === chapter.id)
    const entry: StoryArchiveEntry = {
      chapterId: chapter.id,
      title: chapter.title,
      volume: chapter.volume,
      order: chapter.order,
      perspective: chapter.perspective,
      completedAt: Date.now(),
      choices,
      unlockedNpcs,
      unlockedSkills
    }
    if (existing >= 0) {
      entries.value[existing] = entry
    } else {
      entries.value.push(entry)
    }
    saveToStorage()
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      entries: toRaw(entries.value)
    }))
  }

  // 清除所有档案
  function clearArchive() {
    entries.value = []
    saveToStorage()
  }

  return {
    entries, entriesByVolume, totalCompleted, lastCompleted,
    getEntriesForVolume, isChapterCompleted, completeChapter, clearArchive
  }
})
