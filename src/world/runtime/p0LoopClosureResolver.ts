import type {
  MainLoopReadinessItem,
  MainLoopReadinessKey,
  MainLoopReadinessState
} from './mainLoopReadinessResolver'

export type P0LoopClosureState = 'closed' | 'actionable' | 'blocked'

export interface P0LoopClosureEvidence {
  playerJourneyTags: string[][]
  storyCurrentNodeId: string | null
  storyCompletedCount: number
  unlockedNpcCount: number
  npcStoryCount: number
  worldBriefingCount: number
  mapTotalAreaCount: number
  mapConqueredCount: number
  mapHistoryCount: number
  areaAnomalyCount: number
  sectJoined: boolean
  sectJoinableCount: number
}

export interface P0LoopClosureInput {
  readiness: Record<MainLoopReadinessKey, Pick<MainLoopReadinessItem, 'state' | 'label' | 'actionHint'>>
  evidence: P0LoopClosureEvidence
}

export interface P0LoopClosureItem {
  id: MainLoopReadinessKey
  state: P0LoopClosureState
  label: string
  evidence: string
  nextAction: string
}

export interface P0LoopClosureSummary {
  items: P0LoopClosureItem[]
  byId: Record<MainLoopReadinessKey, P0LoopClosureItem>
  counts: Record<P0LoopClosureState, number>
  closedCount: number
  totalCount: number
  headline: string
}

const LOOP_LABELS: Record<MainLoopReadinessKey, string> = {
  idle: '挂机',
  adventure: '历险',
  story: '故事',
  npc: '人物',
  map: '地图',
  sect: '宗门'
}

function hasJourneyTag(evidence: P0LoopClosureEvidence, matcher: (tags: string[]) => boolean) {
  return evidence.playerJourneyTags.some(tags => matcher(tags))
}

function hasAnyTag(tags: string[], values: string[]) {
  return values.some(value => tags.includes(value))
}

function getClosureState(readinessState: MainLoopReadinessState, hasEvidence: boolean): P0LoopClosureState {
  if (hasEvidence) return 'closed'
  if (readinessState === 'blocked') return 'blocked'
  return 'actionable'
}

function createItem(
  input: P0LoopClosureInput,
  id: MainLoopReadinessKey,
  hasEvidence: boolean,
  evidenceText: string,
  missingText: string
): P0LoopClosureItem {
  const readiness = input.readiness[id]
  const state = getClosureState(readiness.state, hasEvidence)
  return {
    id,
    state,
    label: LOOP_LABELS[id],
    evidence: hasEvidence ? evidenceText : missingText,
    nextAction: state === 'closed' ? '继续扩展' : readiness.actionHint
  }
}

export function resolveP0LoopClosure(input: P0LoopClosureInput): P0LoopClosureSummary {
  const { evidence } = input
  const idleEvidence = hasJourneyTag(evidence, tags => hasAnyTag(tags, ['idle', 'cultivation', 'fortune', 'herb', 'skill', 'duty']))
  const adventureEvidence = hasJourneyTag(evidence, tags => hasAnyTag(tags, ['adventure', 'battle']))
  const storyEvidence = evidence.storyCompletedCount > 0
    || Boolean(evidence.storyCurrentNodeId)
    || hasJourneyTag(evidence, tags => tags.includes('story'))
  const npcEvidence = evidence.npcStoryCount > 0 || hasJourneyTag(evidence, tags => tags.includes('npc'))
  const mapEvidence = evidence.areaAnomalyCount > 0
    || evidence.mapConqueredCount > 0
    || evidence.mapHistoryCount > 0
    || hasJourneyTag(evidence, tags => tags.includes('map'))
  const sectEvidence = evidence.sectJoined || hasJourneyTag(evidence, tags => tags.includes('sect'))

  const items: P0LoopClosureItem[] = [
    createItem(input, 'idle', idleEvidence, '已有挂机/机缘/修炼类行程', '尚未看到主角行动结果'),
    createItem(input, 'adventure', adventureEvidence, '已有历险扫荡或战斗行程', '尚未看到历险或战斗结果'),
    createItem(input, 'story', storyEvidence, '故事卷宗已有行程或节点进度', '尚未看到故事节点进度'),
    createItem(input, 'npc', npcEvidence, '已有人物纪闻或互动行程', evidence.unlockedNpcCount > 0 ? '人物已解锁但未产生日志' : '尚未解锁可观察人物'),
    createItem(input, 'map', mapEvidence, '已有地图处置/探索/异动记录', evidence.mapTotalAreaCount > 0 ? '地图可进入但缺少处置结果' : '尚未读取到地图区域'),
    createItem(input, 'sect', sectEvidence, '已有宗门归属或宗门行程', evidence.sectJoinableCount > 0 ? '可拜山但尚未建立宗门结果' : '尚未建立宗门归属')
  ]

  const byId = items.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {} as Record<MainLoopReadinessKey, P0LoopClosureItem>)

  const counts = items.reduce((acc, item) => {
    acc[item.state] += 1
    return acc
  }, { closed: 0, actionable: 0, blocked: 0 } as Record<P0LoopClosureState, number>)

  const totalCount = items.length
  const headline = counts.blocked > 0
    ? `P0 闭环 ${counts.closed}/${totalCount}，${counts.blocked} 项仍阻塞。`
    : counts.closed === totalCount
      ? 'P0 六项核心循环均已有结果证据。'
      : `P0 闭环 ${counts.closed}/${totalCount}，${counts.actionable} 项可继续验证。`

  return {
    items,
    byId,
    counts,
    closedCount: counts.closed,
    totalCount,
    headline
  }
}
