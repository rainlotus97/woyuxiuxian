export interface StoryRunReportMetric {
  label: string
  value: string
  detail: string
  tone: 'gold' | 'jade' | 'rose'
}

export interface StoryRunReportEntry {
  id: string
  title: string
  text: string
  tone: 'gold' | 'jade' | 'rose'
}

export interface StoryRunReport {
  summary: string
  headline: string
  metrics: StoryRunReportMetric[]
  entries: StoryRunReportEntry[]
}

export interface StoryRunReportInput {
  notifications: Array<{ message: string; type: 'info' | 'success' | 'warning' | 'error' }>
  storyItems: Array<[string, number]>
  favorability: Array<[string, number]>
  unlockedClues: string[]
  availableSideQuests: Array<{ id: string; name: string }>
  completedCount: number
  currentNodeId: string | null
}

export function resolveStoryRunReport(input: StoryRunReportInput): StoryRunReport {
  const notificationCount = input.notifications.length
  const itemCount = input.storyItems.reduce((sum, [, count]) => sum + Number(count || 0), 0)
  const favorCount = input.favorability.length
  const questCount = input.availableSideQuests.length

  return {
    summary: input.currentNodeId ? '剧情状态与因果回写摘要' : '尚未进入卷宗，当前为预览状态',
    headline: input.currentNodeId ?? '未入卷',
    metrics: [
      {
        label: '已读节点',
        value: String(input.completedCount),
        detail: '当前已完成的故事节点数',
        tone: 'gold'
      },
      {
        label: '线索',
        value: String(input.unlockedClues.length),
        detail: '已解锁的关键线索',
        tone: 'jade'
      },
      {
        label: '支线',
        value: String(questCount),
        detail: '当前可触发支线',
        tone: questCount > 0 ? 'rose' : 'jade'
      },
      {
        label: '卷宗物品',
        value: String(itemCount),
        detail: `关系记录 ${favorCount} 项`,
        tone: 'gold'
      }
    ],
    entries: [
      ...input.notifications.slice(0, 3).map((item, index) => ({
        id: `notice_${index}`,
        title: item.type === 'success' ? '进展' : item.type === 'warning' ? '提醒' : '卷宗回写',
        text: item.message,
        tone: item.type === 'warning' || item.type === 'error' ? 'rose' : item.type === 'success' ? 'gold' : 'jade'
      })),
      ...input.availableSideQuests.slice(0, 2).map((quest, index) => ({
        id: `quest_${index}`,
        title: '可继续故事',
        text: quest.name,
        tone: 'jade' as const
      }))
    ].slice(0, 5),
    ...(notificationCount === 0 && questCount === 0
      ? {
          entries: [
            {
              id: 'idle',
              title: '卷宗平稳',
              text: '当前没有新的回写或支线提示，可继续推进主线节点。',
              tone: 'jade' as const
            }
          ]
        }
      : {})
  }
}
