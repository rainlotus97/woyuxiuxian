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
  evidenceDetail: string
  evidenceSources: string[]
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

function countJourneyTags(evidence: P0LoopClosureEvidence, matcher: (tags: string[]) => boolean) {
  return evidence.playerJourneyTags.filter(tags => matcher(tags)).length
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
  missingText: string,
  evidenceDetail: string,
  missingDetail: string,
  evidenceSources: string[]
): P0LoopClosureItem {
  const readiness = input.readiness[id]
  const state = getClosureState(readiness.state, hasEvidence)
  return {
    id,
    state,
    label: LOOP_LABELS[id],
    evidence: hasEvidence ? evidenceText : missingText,
    evidenceDetail: hasEvidence ? evidenceDetail : missingDetail,
    evidenceSources: hasEvidence ? evidenceSources : [],
    nextAction: state === 'closed' ? '继续扩展' : readiness.actionHint
  }
}

export function resolveP0LoopClosure(input: P0LoopClosureInput): P0LoopClosureSummary {
  const { evidence } = input
  const idleJourneyCount = countJourneyTags(evidence, tags => hasAnyTag(tags, ['idle', 'cultivation', 'fortune', 'herb', 'skill', 'duty']))
  const adventureJourneyCount = countJourneyTags(evidence, tags => hasAnyTag(tags, ['adventure', 'battle']))
  const storyJourneyCount = countJourneyTags(evidence, tags => tags.includes('story'))
  const npcJourneyCount = countJourneyTags(evidence, tags => tags.includes('npc'))
  const mapJourneyCount = countJourneyTags(evidence, tags => tags.includes('map'))
  const sectJourneyCount = countJourneyTags(evidence, tags => tags.includes('sect'))

  const idleEvidence = idleJourneyCount > 0
  const adventureEvidence = adventureJourneyCount > 0
  const storyEvidence = evidence.storyCompletedCount > 0
    || Boolean(evidence.storyCurrentNodeId)
    || storyJourneyCount > 0
  const npcEvidence = evidence.npcStoryCount > 0 || npcJourneyCount > 0
  const mapEvidence = evidence.areaAnomalyCount > 0
    || evidence.mapConqueredCount > 0
    || evidence.mapHistoryCount > 0
    || mapJourneyCount > 0
  const sectEvidence = evidence.sectJoined || sectJourneyCount > 0

  const storySources = [
    evidence.storyCurrentNodeId ? `当前节点 ${evidence.storyCurrentNodeId}` : null,
    evidence.storyCompletedCount > 0 ? `完成节点 ${evidence.storyCompletedCount}` : null,
    storyJourneyCount > 0 ? `故事行程 ${storyJourneyCount}` : null
  ].filter((item): item is string => Boolean(item))
  const npcSources = [
    evidence.npcStoryCount > 0 ? `人物纪闻 ${evidence.npcStoryCount}` : null,
    npcJourneyCount > 0 ? `互动行程 ${npcJourneyCount}` : null
  ].filter((item): item is string => Boolean(item))
  const mapSources = [
    evidence.mapHistoryCount > 0 ? `地图历史 ${evidence.mapHistoryCount}` : null,
    evidence.areaAnomalyCount > 0 ? `区域异动 ${evidence.areaAnomalyCount}` : null,
    evidence.mapConqueredCount > 0 ? `征服区域 ${evidence.mapConqueredCount}` : null,
    mapJourneyCount > 0 ? `地图行程 ${mapJourneyCount}` : null
  ].filter((item): item is string => Boolean(item))
  const sectSources = [
    evidence.sectJoined ? '已有宗门归属' : null,
    sectJourneyCount > 0 ? `宗门行程 ${sectJourneyCount}` : null
  ].filter((item): item is string => Boolean(item))

  const items: P0LoopClosureItem[] = [
    createItem(
      input,
      'idle',
      idleEvidence,
      '已有挂机/机缘/修炼类行程',
      '尚未看到主角行动结果',
      `主角行程中已有 ${idleJourneyCount} 条挂机、修炼、机缘、采药、功法或宗门差遣记录。`,
      '暂无主角行动行程；先开始挂机、处理机缘或切换挂机安排。',
      [`主角行程 ${idleJourneyCount}`]
    ),
    createItem(
      input,
      'adventure',
      adventureEvidence,
      '已有历险扫荡或战斗行程',
      '尚未看到历险或战斗结果',
      `主角行程中已有 ${adventureJourneyCount} 条历险、扫荡或战斗记录。`,
      '暂无历险/战斗行程；先进入历险并完成一次扫荡或战斗。',
      [`历险行程 ${adventureJourneyCount}`]
    ),
    createItem(
      input,
      'story',
      storyEvidence,
      '故事卷宗已有行程或节点进度',
      '尚未看到故事节点进度',
      storySources.join('，'),
      '暂无故事节点、完成进度或故事行程；先开启主线卷宗。',
      storySources
    ),
    createItem(
      input,
      'npc',
      npcEvidence,
      '已有人物纪闻或互动行程',
      evidence.unlockedNpcCount > 0 ? '人物已解锁但未产生日志' : '尚未解锁可观察人物',
      npcSources.join('，'),
      evidence.unlockedNpcCount > 0
        ? `已解锁 ${evidence.unlockedNpcCount} 名人物，但暂无人物纪闻或互动行程。`
        : '暂无可观察人物；先推进故事、历险或人物解锁效果。',
      npcSources
    ),
    createItem(
      input,
      'map',
      mapEvidence,
      '已有地图处置/探索/异动记录',
      evidence.mapTotalAreaCount > 0 ? '地图可进入但缺少处置结果' : '尚未读取到地图区域',
      mapSources.join('，'),
      evidence.mapTotalAreaCount > 0
        ? `当前界域有 ${evidence.mapTotalAreaCount} 处区域，但暂无处置、探索、异动或地图行程。`
        : '暂无可读取区域；先检查地图配置或界域解锁。',
      mapSources
    ),
    createItem(
      input,
      'sect',
      sectEvidence,
      '已有宗门归属或宗门行程',
      evidence.sectJoinableCount > 0 ? '可拜山但尚未建立宗门结果' : '尚未建立宗门归属',
      sectSources.join('，'),
      evidence.sectJoinableCount > 0
        ? `当前有 ${evidence.sectJoinableCount} 个可拜山宗门，但暂无归属或宗门行程。`
        : '暂无宗门归属或宗门行程；先推进拜山、故事或地图前置。',
      sectSources
    )
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
