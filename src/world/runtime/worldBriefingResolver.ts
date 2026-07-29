export type WorldBriefingTone = 'jade' | 'gold' | 'mist'

export interface WorldBriefingAction {
  kind: 'route' | 'escape'
  label: string
  path?: string
  disabled?: boolean
}

export interface WorldBriefingItem {
  id: string
  icon: string
  badge: string
  title: string
  summary: string
  meta: string
  tone: WorldBriefingTone
  priority: number
  action?: WorldBriefingAction
}

interface WorldBriefingInput {
  captivity: {
    isCaptured: boolean
    captorName: string | null
    forecastLabel?: string
    forecastHint?: string
    canAttemptEscape?: boolean
  }
  sect: {
    name: string | null
    status: 'stable' | 'rebuilding' | 'collapsed' | null
    activeWar: boolean
  }
  capturedNpc?: {
    name: string
    title: string
    sectName: string
    captorName: string | null
    locationName: string
    severity: 'normal' | 'major' | 'legendary'
  } | null
  hotspotArea?: {
    name: string
    riskLevel: 'safe' | 'watch' | 'danger' | 'chaos'
    contested: boolean
    anomalyTitle?: string | null
  } | null
  spotlightNpc?: {
    name: string
    goalLabel: string
    bondLabel: string
    hpLabel: string
    destinyRankLabel: string
    notorietyLabel: string
    bondTone: string
  } | null
  latestNpcStory?: {
    title: string
    severity: 'minor' | 'normal' | 'major' | 'legendary'
    timeLabel: string
  } | null
  latestLog?: {
    title: string
    severity: 'minor' | 'normal' | 'major' | 'legendary'
    timeLabel: string
  } | null
}

function getAreaRiskLabel(riskLevel: 'safe' | 'watch' | 'danger' | 'chaos') {
  const labels = {
    safe: '平稳',
    watch: '戒备',
    danger: '险境',
    chaos: '失控'
  }
  return labels[riskLevel]
}

export function resolveWorldBriefings(input: WorldBriefingInput): WorldBriefingItem[] {
  const items: WorldBriefingItem[] = []

  if (input.captivity.isCaptured) {
    items.push({
      id: 'captivity',
      icon: 'lock',
      badge: '囚局',
      title: `你正受制于${input.captivity.captorName ?? '敌对势力'}`,
      summary: input.captivity.forecastHint ?? '人已落进别人手里，外头的人情、追索和旧账却不会停，先等脱身的缝隙露出来。',
      meta: input.captivity.forecastLabel ?? '先盯住脱身时机',
      tone: 'mist',
      priority: 100,
      action: {
        kind: 'escape',
        label: input.captivity.canAttemptEscape ? '尝试脱困' : '本时辰已尝试',
        disabled: !input.captivity.canAttemptEscape
      }
    })
  }

  if (input.sect.name && input.sect.status === 'collapsed') {
    items.push({
      id: 'sect-collapsed',
      icon: 'landmark',
      badge: '山门',
      title: `${input.sect.name}已陷入沦陷`,
      summary: '山门已经乱了套，伤者、库藏和旧部都会在这时候分出向背。',
      meta: '先看谁还守得住山门',
      tone: 'mist',
      priority: 92,
      action: {
        kind: 'route',
        label: '查看宗门',
        path: '/game/sect'
      }
    })
  } else if (input.sect.name && input.sect.activeWar) {
    items.push({
      id: 'sect-war',
      icon: 'sword',
      badge: '战局',
      title: `${input.sect.name}仍在交战`,
      summary: '战线还在往前拱，哪片地界易主，谁被拖下水，都会很快回到你面前。',
      meta: '地图和山门都在跟着变',
      tone: 'gold',
      priority: 84,
      action: {
        kind: 'route',
        label: '前往宗门',
        path: '/game/sect'
      }
    })
  } else if (input.sect.name && input.sect.status === 'rebuilding') {
    items.push({
      id: 'sect-rebuilding',
      icon: 'armor',
      badge: '重建',
      title: `${input.sect.name}正在重整`,
      summary: '山门还没稳住，缺人、缺物还是缺脸面，都会决定它能不能重新立起来。',
      meta: '先把山门的气接回来',
      tone: 'gold',
      priority: 76,
      action: {
        kind: 'route',
        label: '返回宗门',
        path: '/game/sect'
      }
    })
  }

  if (input.capturedNpc) {
    items.push({
      id: 'npc-captured',
      icon: 'mission',
      badge: '俘获',
      title: `${input.capturedNpc.name}被控制`,
      summary: `${input.capturedNpc.title}已落入${input.capturedNpc.captorName ?? '未知势力'}手中，这一下会把${input.capturedNpc.sectName}的人情、仇怨和后手一并扯动。`,
      meta: `现踪：${input.capturedNpc.locationName}`,
      tone: input.capturedNpc.severity === 'legendary' ? 'mist' : 'gold',
      priority: input.capturedNpc.severity === 'legendary' ? 88 : 78,
      action: {
        kind: 'route',
        label: '查看宗门',
        path: '/game/sect'
      }
    })
  }

  if (input.hotspotArea) {
    items.push({
      id: 'area-hotspot',
      icon: input.hotspotArea.anomalyTitle ? 'globe' : 'map',
      badge: '地图',
      title: `${input.hotspotArea.name}态势紧张`,
      summary: input.hotspotArea.anomalyTitle
        ? `${input.hotspotArea.anomalyTitle}已经把这一带的风头顶起来了，机缘和凶险都会往这里聚。`
        : `${input.hotspotArea.name}已经起了${getAreaRiskLabel(input.hotspotArea.riskLevel)}之势，路上撞见的人和事都会更偏锋。`,
      meta: input.hotspotArea.contested ? '这一带正有人抢地盘' : `眼下是${getAreaRiskLabel(input.hotspotArea.riskLevel)}势头`,
      tone: input.hotspotArea.riskLevel === 'chaos' ? 'mist' : 'gold',
      priority: input.hotspotArea.riskLevel === 'chaos' ? 82 : 68,
      action: {
        kind: 'route',
        label: '查看地图',
        path: '/game/map'
      }
    })
  }

  if (input.spotlightNpc) {
    items.push({
      id: 'npc-spotlight',
      icon: 'map',
      badge: '人物',
      title: `${input.spotlightNpc.name}正在${input.spotlightNpc.goalLabel}`,
      summary: `${input.spotlightNpc.name}来头不小，眼下对你还是${input.spotlightNpc.bondLabel}，人也还算${input.spotlightNpc.hpLabel}。`,
      meta: `声势：${input.spotlightNpc.notorietyLabel}`,
      tone: input.spotlightNpc.bondTone === 'hostile' ? 'mist' : 'jade',
      priority: input.spotlightNpc.bondTone === 'hostile' ? 74 : 62,
      action: {
        kind: 'route',
        label: '查看人物',
        path: '/game/companion'
      }
    })
  }

  if (input.latestNpcStory) {
    items.push({
      id: 'npc-story',
      icon: 'mission',
      badge: '纪闻',
      title: input.latestNpcStory.title,
      summary: '这件事已经传开了，后面是追杀、报恩还是翻脸，就看谁先顺着它找过来。',
      meta: input.latestNpcStory.timeLabel,
      tone: input.latestNpcStory.severity === 'legendary' ? 'mist' : 'jade',
      priority: input.latestNpcStory.severity === 'legendary' ? 66 : 54,
      action: {
        kind: 'route',
        label: '回主界续读',
        path: '/game/cultivation'
      }
    })
  } else if (input.latestLog) {
    items.push({
      id: 'world-log',
      icon: 'mission',
      badge: '异闻',
      title: input.latestLog.title,
      summary: '外头刚起的动静已经记下来了，顺着这道风声走，多半能摸到下一桩事。',
      meta: input.latestLog.timeLabel,
      tone: input.latestLog.severity === 'legendary' || input.latestLog.severity === 'major' ? 'gold' : 'jade',
      priority: input.latestLog.severity === 'legendary' ? 60 : 48,
      action: {
        kind: 'route',
        label: '回主界续读',
        path: '/game/cultivation'
      }
    })
  }

  return items
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4)
}
