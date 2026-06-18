export type MainLoopReadinessKey = 'idle' | 'adventure' | 'story' | 'npc' | 'map' | 'sect'
export type MainLoopReadinessState = 'ready' | 'warning' | 'blocked'
export type MainLoopReadinessTone = 'jade' | 'gold' | 'rose' | 'mist'

export interface MainLoopReadinessItem {
  id: MainLoopReadinessKey
  state: MainLoopReadinessState
  label: string
  reason: string
  actionHint: string
  tone: MainLoopReadinessTone
  priority: number
}

export interface MainLoopReadinessInput {
  player: {
    isCaptured: boolean
    isIdling: boolean
    stamina: number
    maxStamina: number
    canBreakthrough: boolean
  }
  world: {
    unlockedNpcCount: number
    worldBriefingCount: number
    hasRecentJourney: boolean
  }
  story: {
    currentNodeId: string | null
    completedCount: number
    isInitialized: boolean
  }
  map: {
    conqueredCount: number
    totalAreaCount: number
    hasHotspot: boolean
  }
  sect: {
    joined: boolean
    joinableCount: number
    activeWar: boolean
    completedTaskCount: number
    availableTaskCount: number
    canClaimSalary: boolean
  }
}

export interface MainLoopReadinessSummary {
  items: MainLoopReadinessItem[]
  byId: Record<MainLoopReadinessKey, MainLoopReadinessItem>
  counts: Record<MainLoopReadinessState, number>
  headline: string
}

function createItem(item: MainLoopReadinessItem): MainLoopReadinessItem {
  return item
}

function resolveIdle(input: MainLoopReadinessInput): MainLoopReadinessItem {
  if (input.player.isCaptured) {
    return createItem({
      id: 'idle',
      state: 'blocked',
      label: '受制',
      reason: '主角被俘，常规挂机暂停。',
      actionHint: '先处理脱困或宗门营救',
      tone: 'rose',
      priority: 100
    })
  }

  if (input.player.canBreakthrough) {
    return createItem({
      id: 'idle',
      state: 'warning',
      label: '可破境',
      reason: '修为已到关键节点，继续挂机前应考虑突破。',
      actionHint: '尝试突破境界',
      tone: 'gold',
      priority: 76
    })
  }

  return createItem({
    id: 'idle',
    state: 'ready',
    label: input.player.isIdling ? '进行中' : '可安排',
    reason: input.player.isIdling ? '主角正在按当前排程行动。' : '可以立即安排主角进入挂机循环。',
    actionHint: input.player.isIdling ? '查看收益与日志' : '开始挂机',
    tone: input.player.isIdling ? 'gold' : 'jade',
    priority: input.player.isIdling ? 60 : 52
  })
}

function resolveAdventure(input: MainLoopReadinessInput): MainLoopReadinessItem {
  if (input.player.isCaptured) {
    return createItem({
      id: 'adventure',
      state: 'blocked',
      label: '无法外出',
      reason: '被俘期间不能正常历险。',
      actionHint: '先脱困',
      tone: 'rose',
      priority: 98
    })
  }

  if (input.player.stamina <= 0) {
    return createItem({
      id: 'adventure',
      state: 'warning',
      label: '体力不足',
      reason: '体力耗尽，挑战和扫荡会被限制。',
      actionHint: '等待恢复或购买体力',
      tone: 'mist',
      priority: 68
    })
  }

  return createItem({
    id: 'adventure',
    state: 'ready',
    label: input.map.hasHotspot ? '高风险' : '可历练',
    reason: input.map.hasHotspot ? '地图存在高压区域，历险收益和风险都会抬升。' : '体力充足，可以推进挑战、扫荡和掉落。',
    actionHint: input.map.hasHotspot ? '处理高压区域' : '进入历险',
    tone: input.map.hasHotspot ? 'gold' : 'jade',
    priority: input.map.hasHotspot ? 72 : 54
  })
}

function resolveStory(input: MainLoopReadinessInput): MainLoopReadinessItem {
  if (!input.story.currentNodeId) {
    return createItem({
      id: 'story',
      state: 'warning',
      label: '未开卷',
      reason: '主线尚未进入当前节点，故事效果还没有持续回写。',
      actionHint: '开启主线卷宗',
      tone: 'gold',
      priority: 70
    })
  }

  return createItem({
    id: 'story',
    state: 'ready',
    label: input.story.isInitialized ? '推进中' : '待续读',
    reason: `当前卷宗已有 ${input.story.completedCount} 个节点完成，故事可继续解锁人物、地图与宗门。`,
    actionHint: '继续卷宗',
    tone: 'gold',
    priority: 58
  })
}

function resolveNpc(input: MainLoopReadinessInput): MainLoopReadinessItem {
  if (input.world.unlockedNpcCount <= 0) {
    return createItem({
      id: 'npc',
      state: 'warning',
      label: '待结识',
      reason: '尚未解锁可观察人物，NPC 自主演化缺少主角可感知对象。',
      actionHint: '推进故事或历险',
      tone: 'mist',
      priority: 62
    })
  }

  return createItem({
    id: 'npc',
    state: 'ready',
    label: input.world.worldBriefingCount > 0 ? '有动向' : '可探听',
    reason: `${input.world.unlockedNpcCount} 名人物已进入世界时钟，可探听关系、纪闻与自主行动。`,
    actionHint: '查看人物缘分',
    tone: input.world.worldBriefingCount > 0 ? 'gold' : 'jade',
    priority: input.world.worldBriefingCount > 0 ? 64 : 50
  })
}

function resolveMap(input: MainLoopReadinessInput): MainLoopReadinessItem {
  if (input.map.totalAreaCount <= 0) {
    return createItem({
      id: 'map',
      state: 'blocked',
      label: '无界域',
      reason: '当前没有可显示区域，地图循环无法推进。',
      actionHint: '检查地图配置',
      tone: 'rose',
      priority: 90
    })
  }

  if (input.map.hasHotspot) {
    return createItem({
      id: 'map',
      state: 'warning',
      label: '有异动',
      reason: '区域压力或争夺正在影响历险和宗门态势。',
      actionHint: '查看并处置区域',
      tone: 'gold',
      priority: 74
    })
  }

  return createItem({
    id: 'map',
    state: 'ready',
    label: '可探索',
    reason: `当前界域进度 ${input.map.conqueredCount}/${input.map.totalAreaCount}，可继续探索和处置。`,
    actionHint: '打开地图',
    tone: 'jade',
    priority: 46
  })
}

function resolveSect(input: MainLoopReadinessInput): MainLoopReadinessItem {
  if (!input.sect.joined) {
    return createItem({
      id: 'sect',
      state: input.sect.joinableCount > 0 ? 'warning' : 'blocked',
      label: input.sect.joinableCount > 0 ? '可拜山' : '未解锁',
      reason: input.sect.joinableCount > 0
        ? `${input.sect.joinableCount} 个宗门可加入，宗门任务和俸禄循环尚未建立。`
        : '暂无可加入宗门，需要先推进地图、故事或境界。',
      actionHint: input.sect.joinableCount > 0 ? '选择宗门' : '推进前置条件',
      tone: input.sect.joinableCount > 0 ? 'gold' : 'mist',
      priority: input.sect.joinableCount > 0 ? 78 : 66
    })
  }

  if (input.sect.activeWar) {
    return createItem({
      id: 'sect',
      state: 'warning',
      label: '战事中',
      reason: '宗门战争会持续影响地图控制权、人物命运和宗门资源。',
      actionHint: '处理宗门战局',
      tone: 'rose',
      priority: 86
    })
  }

  if (input.sect.completedTaskCount > 0 || input.sect.canClaimSalary) {
    return createItem({
      id: 'sect',
      state: 'ready',
      label: '可领奖',
      reason: '已有宗门收益可领取，能回流贡献、灵石或材料。',
      actionHint: '领取宗门收益',
      tone: 'gold',
      priority: 72
    })
  }

  return createItem({
    id: 'sect',
    state: 'ready',
    label: '可经营',
    reason: `${input.sect.availableTaskCount} 项宗门任务可推进，设施、药园与外交可继续经营。`,
    actionHint: '进入宗门',
    tone: 'jade',
    priority: 48
  })
}

export function resolveMainLoopReadiness(input: MainLoopReadinessInput): MainLoopReadinessSummary {
  const items = [
    resolveIdle(input),
    resolveAdventure(input),
    resolveStory(input),
    resolveNpc(input),
    resolveMap(input),
    resolveSect(input)
  ]

  const byId = items.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {} as Record<MainLoopReadinessKey, MainLoopReadinessItem>)

  const counts = items.reduce((acc, item) => {
    acc[item.state] += 1
    return acc
  }, { ready: 0, warning: 0, blocked: 0 } as Record<MainLoopReadinessState, number>)

  const headline = counts.blocked > 0
    ? `${counts.blocked} 项阻塞，优先处理脱困或前置条件。`
    : counts.warning > 0
      ? `${counts.warning} 项需要处理，其余循环可继续推进。`
      : '六项 P0 主循环均可行动。'

  return {
    items: [...items].sort((a, b) => b.priority - a.priority),
    byId,
    counts,
    headline
  }
}
