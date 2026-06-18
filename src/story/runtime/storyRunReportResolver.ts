import type { SideQuestInfo, StoryNotification } from '@/story/storyStore'

export interface StoryRunReportInput {
  notifications: StoryNotification[]
  storyItems: Array<[string, number]>
  favorability: Array<[string, number]>
  unlockedClues: string[]
  availableSideQuests: SideQuestInfo[]
  completedCount: number
  currentNodeId: string | null
}

export interface StoryRunReportMetric {
  label: string
  value: string | number
  detail: string
  tone: 'jade' | 'gold' | 'rose' | 'mist'
}

export interface StoryRunReportEntry {
  id: string
  title: string
  text: string
  tone: 'jade' | 'gold' | 'rose' | 'mist'
}

export interface StoryRunReport {
  headline: string
  summary: string
  metrics: StoryRunReportMetric[]
  entries: StoryRunReportEntry[]
}

const notificationToneMap: Record<StoryNotification['type'], StoryRunReportEntry['tone']> = {
  success: 'jade',
  info: 'mist',
  warning: 'gold',
  error: 'rose'
}

export function resolveStoryRunReport(input: StoryRunReportInput): StoryRunReport {
  const itemCount = input.storyItems.reduce((sum, [, count]) => sum + Number(count || 0), 0)
  const favorChanges = input.favorability.filter(([, value]) => Number(value) !== 0)
  const activeQuestCount = input.availableSideQuests.filter(quest => quest.isAvailable && !quest.isCompleted).length
  const recentNotifications = input.notifications.slice(-4).reverse()

  const entries: StoryRunReportEntry[] = recentNotifications.map(notification => ({
    id: notification.id,
    title: formatNotificationTitle(notification.type),
    text: notification.message,
    tone: notificationToneMap[notification.type]
  }))

  if (entries.length === 0) {
    entries.push(...buildPersistentEntries({
      storyItems: input.storyItems,
      favorability: favorChanges,
      unlockedClues: input.unlockedClues,
      availableSideQuests: input.availableSideQuests
    }))
  }

  if (entries.length === 0) {
    entries.push({
      id: 'empty-story-report',
      title: input.currentNodeId ? '等待下一段因果' : '尚未入卷',
      text: input.currentNodeId
        ? '继续阅读或做出选择后，人物、地图、宗门与剧情战的写回会汇总在这里。'
        : '开启故事后，卷宗效果会在这里沉淀为可追踪的运行记录。',
      tone: 'mist'
    })
  }

  return {
    headline: input.currentNodeId ? '卷宗正在影响世界' : '卷宗尚未启动',
    summary: buildSummary({
      completedCount: input.completedCount,
      activeQuestCount,
      itemCount,
      clueCount: input.unlockedClues.length,
      favorCount: favorChanges.length
    }),
    metrics: [
      {
        label: '故事道具',
        value: itemCount,
        detail: input.storyItems[0] ? `${input.storyItems[0][0]} x${input.storyItems[0][1]}` : '暂无道具',
        tone: itemCount > 0 ? 'gold' : 'mist'
      },
      {
        label: '人物关系',
        value: favorChanges.length,
        detail: favorChanges[0] ? `${favorChanges[0][0]} ${formatSigned(favorChanges[0][1])}` : '暂无变化',
        tone: favorChanges.length > 0 ? 'jade' : 'mist'
      },
      {
        label: '线索',
        value: input.unlockedClues.length,
        detail: input.unlockedClues[0] ?? '暂无线索',
        tone: input.unlockedClues.length > 0 ? 'gold' : 'mist'
      },
      {
        label: '可触发支线',
        value: activeQuestCount,
        detail: input.availableSideQuests.find(quest => quest.isAvailable && !quest.isCompleted)?.name ?? '暂无支线',
        tone: activeQuestCount > 0 ? 'rose' : 'mist'
      }
    ],
    entries
  }
}

function buildPersistentEntries(input: {
  storyItems: Array<[string, number]>
  favorability: Array<[string, number]>
  unlockedClues: string[]
  availableSideQuests: SideQuestInfo[]
}): StoryRunReportEntry[] {
  const entries: StoryRunReportEntry[] = []
  const clue = input.unlockedClues[0]
  if (clue) {
    entries.push({
      id: `clue-${clue}`,
      title: '线索已记录',
      text: `卷宗已解锁线索：${clue}。后续节点和支线会继续消耗或引用它。`,
      tone: 'gold'
    })
  }

  const item = input.storyItems.find(([, count]) => Number(count) > 0)
  if (item) {
    entries.push({
      id: `item-${item[0]}`,
      title: '道具入卷',
      text: `${item[0]} x${item[1]} 已进入故事道具记录，可作为后续前置条件。`,
      tone: 'jade'
    })
  }

  const favor = input.favorability[0]
  if (favor) {
    entries.push({
      id: `favor-${favor[0]}`,
      title: '关系变动',
      text: `${favor[0]} 的故事好感为 ${formatSigned(favor[1])}，会同步影响世界人物关系。`,
      tone: favor[1] >= 0 ? 'jade' : 'rose'
    })
  }

  const sideQuest = input.availableSideQuests.find(quest => quest.isAvailable && !quest.isCompleted)
  if (sideQuest) {
    entries.push({
      id: `sidequest-${sideQuest.id}`,
      title: '支线可触发',
      text: `${sideQuest.characterName}相关事件「${sideQuest.name}」已满足条件。`,
      tone: 'rose'
    })
  }

  return entries.slice(0, 4)
}

function buildSummary(input: {
  completedCount: number
  activeQuestCount: number
  itemCount: number
  clueCount: number
  favorCount: number
}) {
  const parts = [`已完成 ${input.completedCount} 个节点`]
  if (input.itemCount > 0) parts.push(`${input.itemCount} 件故事道具`)
  if (input.clueCount > 0) parts.push(`${input.clueCount} 条线索`)
  if (input.favorCount > 0) parts.push(`${input.favorCount} 名人物关系变化`)
  if (input.activeQuestCount > 0) parts.push(`${input.activeQuestCount} 条支线待处理`)
  return parts.join(' · ')
}

function formatNotificationTitle(type: StoryNotification['type']) {
  if (type === 'success') return '效果写回'
  if (type === 'warning') return '剧情警讯'
  if (type === 'error') return '卷宗异常'
  return '卷宗记录'
}

function formatSigned(value: number) {
  return value >= 0 ? `+${value}` : `${value}`
}
