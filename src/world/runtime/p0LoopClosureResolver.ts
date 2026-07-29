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
      '这一路已经留下修炼和行脚的动静',
      '主角还没真正动起来',
      `主角已经留下了 ${idleJourneyCount} 条修炼、机缘、采药、功法或差遣痕迹。`,
      '眼下还没留下主角自己的动静；先开始挂机、处理机缘或改一路数。',
      [`主角行程 ${idleJourneyCount}`]
    ),
    createItem(
      input,
      'adventure',
      adventureEvidence,
      '外头这条路已经闹出动静',
      '还没真正出去闯过',
      `主角已经留下了 ${adventureJourneyCount} 条历险、扫荡或斗法痕迹。`,
      '眼下还没在外头闯出响动；先去打一场，或先扫一遍地界。',
      [`历险行程 ${adventureJourneyCount}`]
    ),
    createItem(
      input,
      'story',
      storyEvidence,
      '故事卷宗已有行程或节点进度',
      '这条事还没真正压进来',
      storySources.join('，'),
      '眼下还没留下这条事推进的痕迹；先让第一段风声真正压进主循环。',
      storySources
    ),
    createItem(
      input,
      'npc',
      npcEvidence,
      '已有人物纪闻或互动行程',
      evidence.unlockedNpcCount > 0 ? '人已经露面，但还没真正牵上你' : '眼下还没碰上能记住你的人',
      npcSources.join('，'),
      evidence.unlockedNpcCount > 0
        ? `已经露面的 ${evidence.unlockedNpcCount} 个人里，还没人真正和你结下回响。`
        : '眼下还没有能回头撞上你的人；先推进故事、历练或人物解锁。',
      npcSources
    ),
    createItem(
      input,
      'map',
      mapEvidence,
      '这片地界已经起过事了',
      evidence.mapTotalAreaCount > 0 ? '地界已经摆在眼前，但你还没真正踩进去' : '眼下还没有能走进去的地界',
      mapSources.join('，'),
      evidence.mapTotalAreaCount > 0
        ? `眼下有 ${evidence.mapTotalAreaCount} 处地界可看，但还没留下处置、探索或异动回响。`
        : '眼下还没有地界能真正接过来；先检查解锁和地图配置。',
      mapSources
    ),
    createItem(
      input,
      'sect',
      sectEvidence,
      '山门这条线已经搭上了',
      evidence.sectJoinableCount > 0 ? '山门已经朝你开口，但你还没真正选边站' : '眼下还没有山门收你入局',
      sectSources.join('，'),
      evidence.sectJoinableCount > 0
        ? `眼下有 ${evidence.sectJoinableCount} 个可拜山宗门，但你还没真正和哪一边牵上线。`
        : '眼下还没和任何山门牵上线；先推进拜山、故事或地图前置。',
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
    ? `眼下已有 ${counts.closed}/${totalCount} 条路留下了动静，另有 ${counts.blocked} 条发生阻塞。`
    : counts.closed === totalCount
      ? '六项核心循环都已经留了回响。'
      : `眼下已有 ${counts.closed}/${totalCount} 条路留下了动静，可继续验证；另外 ${counts.actionable} 条还得亲自去碰一碰。`

  return {
    items,
    byId,
    counts,
    closedCount: counts.closed,
    totalCount,
    headline
  }
}
