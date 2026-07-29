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
      reason: '人还在别人手里，眼下这口气运不该再按常路往外走。',
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
      reason: '这口修为已经顶到关口，再往里憋，气势反而容易散掉。',
      actionHint: '尝试突破境界',
      tone: 'gold',
      priority: 76
    })
  }

  return createItem({
    id: 'idle',
    state: 'ready',
    label: input.player.isIdling ? '进行中' : '可安排',
    reason: input.player.isIdling ? '主角已经照着你定下的路数往前走了。' : '眼下正适合定一条路，让主角自己去撞人撞事。',
    actionHint: input.player.isIdling ? '看看这一路留下了什么' : '开始挂机',
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
      reason: '人都没脱身，路自然也走不出去。',
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
      reason: '这口气已经快耗干了，再闯只会把路走窄。',
      actionHint: '等待恢复或购买体力',
      tone: 'mist',
      priority: 68
    })
  }

  return createItem({
    id: 'adventure',
    state: 'ready',
    label: input.map.hasHotspot ? '高风险' : '可历练',
    reason: input.map.hasHotspot ? '前头那几片地界正起风，机缘和凶险都会往一处挤。' : '人和气都够，正适合出去闯一遭，让外头记住你这一次。 ',
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
      label: '异动未起',
      reason: '眼下还没真起风，人物、地图和山门都还没被这条事卷进来。',
      actionHint: '先去跑图、修炼或碰人，把故事引出来',
      tone: 'gold',
      priority: 70
    })
  }

    return createItem({
      id: 'story',
      state: 'ready',
      label: input.story.isInitialized ? '正在逼近' : '尚可接续',
      reason: `这条事已经往前走了 ${input.story.completedCount} 步，再顺下去，人物、地图和宗门都会一起起波澜。`,
      actionHint: '进去看看发生了什么',
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
      reason: '眼下还没真正结识到能回头撞上你的人。',
      actionHint: '推进故事或历险',
      tone: 'mist',
      priority: 62
    })
  }

  return createItem({
    id: 'npc',
    state: 'ready',
    label: input.world.worldBriefingCount > 0 ? '有动向' : '可探听',
    reason: `${input.world.unlockedNpcCount} 个人已经在外头各自动了起来，探一探就知道谁会记你，谁会恨你。`,
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
      reason: '眼下还没有能真正走进去的地界。',
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
      reason: '有地界已经起事了，再拖下去，后面的局面只会更乱。',
      actionHint: '查看并处置区域',
      tone: 'gold',
      priority: 74
    })
  }

  return createItem({
    id: 'map',
    state: 'ready',
    label: '可探索',
    reason: `这片界域已经走开了 ${input.map.conqueredCount}/${input.map.totalAreaCount}，还剩不少地方等你亲自去闯。`,
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
        ? `眼下已有 ${input.sect.joinableCount} 座山门朝你开了缝，就看你先去叩哪一扇门。`
        : '还没有山门真正朝你开口，得先把路和名声走出来。',
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
      reason: '战火还在烧，地盘、人物和库藏都在跟着换气。',
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
      reason: '山门这边已经给你留了回响，先把该拿的拿回来。',
      actionHint: '领取宗门收益',
      tone: 'gold',
      priority: 72
    })
  }

  return createItem({
    id: 'sect',
    state: 'ready',
    label: '可经营',
    reason: `山门里还有 ${input.sect.availableTaskCount} 桩事等你伸手，药园、差遣和来往都能继续往下走。`,
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
    ? `眼下有 ${counts.blocked} 处发生阻塞，先解脱困或前置因果。`
    : counts.warning > 0
      ? `眼下有 ${counts.warning} 桩事需要处理，正在催你，其余路数都还能继续走。`
      : '六条路眼下都能往前走。'

  return {
    items: [...items].sort((a, b) => b.priority - a.priority),
    byId,
    counts,
    headline
  }
}
