import type { PlayerJourneyEntry, WorldClock } from '@/types/world'
import { formatWorldTime } from '@/types/world'
import type { Perspective } from '@/story/types'

export type StoryJourneyAction = 'start' | 'continue' | 'restart' | 'switchPerspective'

export interface StoryJourneyInput {
  action: StoryJourneyAction
  clock: WorldClock
  perspective: Perspective | null
  volume: number
  currentNodeId: string | null
  currentNodeName?: string | null
  currentNodeMap?: string | null
  completedCount: number
}

export type StoryJourneyResult = Omit<PlayerJourneyEntry, 'id' | 'tick' | 'timeLabel' | 'mode'>

const PERSPECTIVE_LABELS: Record<Perspective, string> = {
  male: '凌辰线',
  female: '苏清鸢线',
  common: '共同线'
}

const ACTION_COPY: Record<StoryJourneyAction, { title: string; label: string; verb: string }> = {
  start: { title: '命簿启卷', label: '故事开启', verb: '翻开' },
  continue: { title: '命簿续读', label: '故事续读', verb: '续读' },
  restart: { title: '命簿重启', label: '故事重启', verb: '重启' },
  switchPerspective: { title: '命簿换线', label: '视角切换', verb: '另启' }
}

function getPerspectiveLabel(perspective: Perspective | null) {
  if (!perspective) return '未定视角'
  return PERSPECTIVE_LABELS[perspective] ?? '未定视角'
}

function getNodeLabel(input: StoryJourneyInput) {
  return input.currentNodeName ?? input.currentNodeId ?? '未知章回'
}

function getMapLine(mapName?: string | null) {
  if (!mapName || mapName === '无') return '此卷暂未标定地点'
  return `当前落点在${mapName}`
}

export function resolveStoryJourney(input: StoryJourneyInput): StoryJourneyResult {
  const action = ACTION_COPY[input.action]
  const perspectiveLabel = getPerspectiveLabel(input.perspective)
  const nodeLabel = getNodeLabel(input)
  const mapLine = getMapLine(input.currentNodeMap)
  const chapterText = input.currentNodeId ? `章回「${nodeLabel}」` : '尚未落定具体章回'

  return {
    severity: input.action === 'switchPerspective' || input.action === 'restart' ? 'major' : 'normal',
    title: action.title,
    text: `${formatWorldTime(input.clock)}，你${action.verb}第 ${input.volume} 卷${perspectiveLabel}，${chapterText}已写入行程。${mapLine}，已完成 ${input.completedCount} 个节点。`,
    rewards: [
      { type: 'flag', label: action.label, value: nodeLabel },
      { type: 'flag', label: '故事视角', value: perspectiveLabel }
    ],
    tags: ['story', `story-${input.action}`, perspectiveLabel]
  }
}
