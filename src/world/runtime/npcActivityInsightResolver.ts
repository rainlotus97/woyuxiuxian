import type { NpcDefinition, NpcStoryRecord, WorldLogEntry, WorldLogSeverity } from '@/types/world'

export interface NpcActivityInsightSource {
  npcStories: NpcStoryRecord[]
  logs: WorldLogEntry[]
  npcDefinitions: Pick<NpcDefinition, 'id' | 'name' | 'role'>[]
  previousNpcStoryIds: Set<string>
  previousLogIds: Set<string>
  timeLabel: string
  maxItems?: number
}

export interface NpcActivityInsightItem {
  id: string
  npcId: string | null
  npcName: string
  label: string
  title: string
  text: string
  timeLabel: string
  severity: WorldLogSeverity
  tags: string[]
  tone: 'jade' | 'gold' | 'rose' | 'mist'
}

export interface NpcActivityInsight {
  timeLabel: string
  totalEvents: number
  items: NpcActivityInsightItem[]
}

function getSeverityTone(severity: WorldLogSeverity): NpcActivityInsightItem['tone'] {
  if (severity === 'legendary') return 'rose'
  if (severity === 'major') return 'gold'
  if (severity === 'minor') return 'mist'
  return 'jade'
}

function getNpcName(npcId: string | null, definitions: Pick<NpcDefinition, 'id' | 'name'>[]) {
  if (!npcId) return '人物'
  return definitions.find(definition => definition.id === npcId)?.name ?? npcId
}

function inferNpcIdFromLog(log: WorldLogEntry) {
  return log.actorIds.find(actorId => actorId !== 'player') ?? null
}

function getActivityLabel(tags: string[], severity: WorldLogSeverity) {
  if (tags.includes('captured') || tags.includes('captivity')) return '危局'
  if (tags.includes('breakthrough')) return '破境'
  if (tags.includes('injured')) return '负伤'
  if (tags.includes('scheme')) return '谋算'
  if (tags.includes('relationship')) return '关系'
  if (tags.includes('lineage')) return '血脉'
  if (severity === 'legendary') return '命数'
  if (severity === 'major') return '要闻'
  return '动向'
}

function dedupeInsightItems(items: NpcActivityInsightItem[]) {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = `${item.npcId ?? item.npcName}:${item.title}:${item.text}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function resolveNpcActivityInsight(input: NpcActivityInsightSource): NpcActivityInsight {
  const maxItems = input.maxItems ?? 4

  const storyItems: NpcActivityInsightItem[] = input.npcStories
    .filter(story => !input.previousNpcStoryIds.has(story.id))
    .map(story => ({
      id: story.id,
      npcId: story.npcId,
      npcName: getNpcName(story.npcId, input.npcDefinitions),
      label: getActivityLabel(story.tags, story.severity),
      title: story.title,
      text: story.text,
      timeLabel: story.timeLabel,
      severity: story.severity,
      tags: story.tags,
      tone: getSeverityTone(story.severity)
    }))

  const npcLogItems: NpcActivityInsightItem[] = input.logs
    .filter(log => !input.previousLogIds.has(log.id))
    .filter(log => log.scope === 'npc' || log.tags.includes('npc') || log.actorIds.some(actorId => actorId !== 'player'))
    .map(log => {
      const npcId = inferNpcIdFromLog(log)
      return {
        id: log.id,
        npcId,
        npcName: getNpcName(npcId, input.npcDefinitions),
        label: getActivityLabel(log.tags, log.severity),
        title: log.title,
        text: log.text,
        timeLabel: log.timeLabel,
        severity: log.severity,
        tags: log.tags,
        tone: getSeverityTone(log.severity)
      }
    })

  const items = dedupeInsightItems([...storyItems, ...npcLogItems]).slice(0, maxItems)

  return {
    timeLabel: input.timeLabel,
    totalEvents: items.length,
    items: items.length > 0
      ? items
      : [{
          id: `quiet_npc_${input.timeLabel}`,
          npcId: null,
          npcName: '天下人物',
          label: '静观',
          title: '一时辰无大事',
          text: '此刻没有新的关键人物纪闻，但各方修士仍在暗处修行、游历与布局。',
          timeLabel: input.timeLabel,
          severity: 'minor',
          tags: ['npc', 'quiet'],
          tone: 'mist'
        }]
  }
}
