import { computed, ref } from 'vue'
import { useWorldStore } from '@/stores/worldStore'

export interface WorldAdvanceSummaryItem {
  id: string
  label: string
  title: string
  text: string
  tone: 'jade' | 'gold' | 'rose' | 'mist'
}

export interface WorldAdvanceSummary {
  tick: number
  timeLabel: string
  totalEvents: number
  items: WorldAdvanceSummaryItem[]
}

function dedupeSummaryItems(items: WorldAdvanceSummaryItem[]) {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = `${item.title}:${item.text}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getSeverityTone(severity: string): WorldAdvanceSummaryItem['tone'] {
  if (severity === 'legendary') return 'rose'
  if (severity === 'major') return 'gold'
  if (severity === 'minor') return 'mist'
  return 'jade'
}

export function useWorldAdvanceSummary() {
  const worldStore = useWorldStore()
  const lastSummary = ref<WorldAdvanceSummary | null>(null)

  const canAdvance = computed(() => true)

  function advanceOneTick() {
    const before = {
      tick: worldStore.clock.totalTicks,
      logIds: new Set(worldStore.logs.map(item => item.id)),
      journeyIds: new Set(worldStore.playerJourneys.map(item => item.id)),
      npcStoryIds: new Set(worldStore.npcStories.map(item => item.id)),
      anomalyIds: new Set(worldStore.areaAnomalies.map(item => item.id))
    }

    worldStore.advanceTick()

    const newJourneys = worldStore.playerJourneys
      .filter(item => !before.journeyIds.has(item.id))
      .slice(0, 2)
      .map(item => ({
        id: item.id,
        label: '主角',
        title: item.title,
        text: item.text,
        tone: getSeverityTone(item.severity)
      }))

    const newNpcStories = worldStore.npcStories
      .filter(item => !before.npcStoryIds.has(item.id))
      .slice(0, 2)
      .map(item => ({
        id: item.id,
        label: '人物',
        title: item.title,
        text: item.text,
        tone: getSeverityTone(item.severity)
      }))

    const newAnomalies = worldStore.areaAnomalies
      .filter(item => !before.anomalyIds.has(item.id))
      .slice(0, 1)
      .map(item => ({
        id: item.id,
        label: '区域',
        title: item.title,
        text: item.text,
        tone: getSeverityTone(item.severity)
      }))

    const newLogs = worldStore.logs
      .filter(item => !before.logIds.has(item.id))
      .filter(item => !item.tags.includes('player-journey'))
      .slice(0, 3)
      .map(item => ({
        id: item.id,
        label: item.scope === 'npc' ? '人物' : item.scope === 'sect' ? '宗门' : item.scope === 'weather' ? '天象' : '世界',
        title: item.title,
        text: item.text,
        tone: getSeverityTone(item.severity)
      }))

    const items = dedupeSummaryItems([...newJourneys, ...newNpcStories, ...newAnomalies, ...newLogs]).slice(0, 5)

    lastSummary.value = {
      tick: worldStore.clock.totalTicks,
      timeLabel: worldStore.currentTimeLabel,
      totalEvents: items.length,
      items: items.length > 0
        ? items
        : [{
            id: `quiet_${before.tick}_${worldStore.clock.totalTicks}`,
            label: '世界',
            title: '无事一时辰',
            text: '这一个时辰风平浪静，修行、宗门与人物命数仍在暗处缓慢推进。',
            tone: 'mist'
          }]
    }

    return lastSummary.value
  }

  return {
    canAdvance,
    lastSummary,
    advanceOneTick
  }
}
