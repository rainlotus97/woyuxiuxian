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
      icon: '⛓️',
      badge: '囚局',
      title: `你正受制于${input.captivity.captorName ?? '敌对势力'}`,
      summary: input.captivity.forecastHint ?? '被俘后世界依旧推进，当前应优先寻找脱身窗口。',
      meta: input.captivity.forecastLabel ?? '等待脱困时机',
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
      icon: '🏚️',
      badge: '山门',
      title: `${input.sect.name}已陷入沦陷`,
      summary: '宗门正在失去秩序与控制，后续应优先补上重建、救援与战后恢复链路。',
      meta: '宗门主循环已进入高危阶段',
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
      icon: '⚔️',
      badge: '战局',
      title: `${input.sect.name}仍在交战`,
      summary: '战线会持续推动区域易主、宗门受创和人物被俘，当前适合优先关注宗门与地图联动。',
      meta: '战争会持续改写世界日志与地图压力',
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
      icon: '🧱',
      badge: '重建',
      title: `${input.sect.name}正在重整`,
      summary: '山门尚未恢复稳定，资源、设施与人手会直接影响后续世界态势。',
      meta: '当前应优先拉回宗门经济与任务循环',
      tone: 'gold',
      priority: 76,
      action: {
        kind: 'route',
        label: '返回宗门',
        path: '/game/sect'
      }
    })
  }

  if (input.hotspotArea) {
    items.push({
      id: 'area-hotspot',
      icon: input.hotspotArea.anomalyTitle ? '🌐' : '🗺️',
      badge: '地图',
      title: `${input.hotspotArea.name}态势紧张`,
      summary: input.hotspotArea.anomalyTitle
        ? `${input.hotspotArea.anomalyTitle}正在放大区域压力，历练收益与风险都会被推高。`
        : `${input.hotspotArea.name}当前处于${getAreaRiskLabel(input.hotspotArea.riskLevel)}状态，已开始影响遭遇与收益。`,
      meta: input.hotspotArea.contested ? '区域控制权正在争夺' : `风险评级：${getAreaRiskLabel(input.hotspotArea.riskLevel)}`,
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
      icon: '🧭',
      badge: '命数',
      title: `${input.spotlightNpc.name}正在${input.spotlightNpc.goalLabel}`,
      summary: `${input.spotlightNpc.destinyRankLabel}命数，当前对你的态度为${input.spotlightNpc.bondLabel}，状态${input.spotlightNpc.hpLabel}。`,
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
      icon: '📝',
      badge: '纪闻',
      title: input.latestNpcStory.title,
      summary: '重要人物的破境、受创与冲突已沉淀成独立纪闻，可继续作为剧情与世界事件的钩子。',
      meta: input.latestNpcStory.timeLabel,
      tone: input.latestNpcStory.severity === 'legendary' ? 'mist' : 'jade',
      priority: input.latestNpcStory.severity === 'legendary' ? 66 : 54,
      action: {
        kind: 'route',
        label: '查看故事',
        path: '/game/story'
      }
    })
  } else if (input.latestLog) {
    items.push({
      id: 'world-log',
      icon: '📜',
      badge: '异闻',
      title: input.latestLog.title,
      summary: '世界日志已经记录新的天气、势力或人物变化，可作为下一步行动的情报入口。',
      meta: input.latestLog.timeLabel,
      tone: input.latestLog.severity === 'legendary' || input.latestLog.severity === 'major' ? 'gold' : 'jade',
      priority: input.latestLog.severity === 'legendary' ? 60 : 48,
      action: {
        kind: 'route',
        label: '查看剧情',
        path: '/game/story'
      }
    })
  }

  return items
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4)
}
