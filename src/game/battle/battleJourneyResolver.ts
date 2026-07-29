import type { PlayerJourneyEntry, WorldLogEntry } from '@/types/world'

export type BattleJourneyResultKind = 'victory' | 'defeat' | 'fled'

export interface BattleJourneyDrop {
  name: string
  quantity: number
  status?: 'claimed' | 'pending'
}

export interface BattleJourneyInput {
  result: BattleJourneyResultKind
  areaName?: string | null
  mapAreaName?: string | null
  turns: number
  rewards: {
    cultivation: number
    gold: number
  }
  drops?: BattleJourneyDrop[]
  isStoryBattle?: boolean
}

export interface BattleJourneyResult {
  severity: WorldLogEntry['severity']
  title: string
  text: string
  rewards: PlayerJourneyEntry['rewards']
  tags: string[]
}

export function resolveBattleJourney(input: BattleJourneyInput): BattleJourneyResult {
  const areaName = input.mapAreaName ?? input.areaName ?? '未知战场'
  const battleType = input.isStoryBattle ? '剧情战' : '历险战斗'
  const severity: WorldLogEntry['severity'] = input.result === 'victory' ? 'major' : 'normal'
  const rewards = buildBattleJourneyRewards(input)
  const claimedDrops = (input.drops ?? []).filter(drop => drop.status !== 'pending')
  const pendingDrops = (input.drops ?? []).filter(drop => drop.status === 'pending')
  const claimedDropText = claimedDrops.length
    ? `，并收得${claimedDrops.slice(0, 3).map(drop => `${drop.name}x${drop.quantity}`).join('、')}${claimedDrops.length > 3 ? '等物' : ''}`
    : ''
  const pendingDropText = pendingDrops.length
    ? `；${pendingDrops.slice(0, 3).map(drop => `${drop.name}x${drop.quantity}`).join('、')}${pendingDrops.length > 3 ? '等物' : ''}因背包已满暂存待领取`
    : ''

  if (input.result === 'victory') {
    return {
      severity,
      title: `${areaName}${battleType}胜利`,
      text: `你在${areaName}完成一场${battleType}，共历 ${Math.max(1, input.turns)} 手后取胜，获得修为与灵石回报${claimedDropText}${pendingDropText}。`,
      rewards,
      tags: buildBattleJourneyTags(input)
    }
  }

  if (input.result === 'fled') {
    return {
      severity,
      title: `${areaName}脱离战场`,
      text: `你在${areaName}中止战斗并撤离，战局暂未分出胜负。这次经历仍会成为后续历险判断风险的依据。`,
      rewards,
      tags: buildBattleJourneyTags(input)
    }
  }

  return {
    severity,
    title: `${areaName}${battleType}败北`,
    text: `你在${areaName}遭遇苦战，${Math.max(1, input.turns)} 手后败退。此战没有获得战利，但会留下可回顾的战斗经历。`,
    rewards,
    tags: buildBattleJourneyTags(input)
  }
}

function buildBattleJourneyRewards(input: BattleJourneyInput): PlayerJourneyEntry['rewards'] {
  if (input.result !== 'victory') return []
  const rewards: PlayerJourneyEntry['rewards'] = []
  if (input.rewards.cultivation > 0) {
    rewards.push({ type: 'cultivation', label: '修为', value: input.rewards.cultivation })
  }
  if (input.rewards.gold > 0) {
    rewards.push({ type: 'gold', label: '灵石', value: input.rewards.gold })
  }
  for (const drop of input.drops ?? []) {
    rewards.push({
      type: drop.status === 'pending' ? 'flag' : 'item',
      label: drop.status === 'pending' ? `待领取：${drop.name}` : drop.name,
      value: drop.quantity
    })
  }
  return rewards
}

function buildBattleJourneyTags(input: BattleJourneyInput) {
  return [
    'battle',
    input.result,
    input.isStoryBattle ? 'story' : 'adventure'
  ]
}
