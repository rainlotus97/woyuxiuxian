import type { PlayerJourneyEntry, WorldLogEntry } from '@/types/world'

export type SectRewardJourneyAction = 'stipend' | 'task_claim_all'

export interface SectRewardJourneyInput {
  action: SectRewardJourneyAction
  sectName: string
  positionName?: string | null
  claimedCount?: number
  rewards: {
    contribution?: number
    gold?: number
    cultivation?: number
  }
}

export interface SectRewardJourneyResult {
  severity: WorldLogEntry['severity']
  title: string
  text: string
  rewards: PlayerJourneyEntry['rewards']
  tags: string[]
}

export function resolveSectRewardJourney(input: SectRewardJourneyInput): SectRewardJourneyResult {
  const rewards = buildJourneyRewards(input.rewards)

  if (input.action === 'stipend') {
    const positionText = input.positionName ? `${input.positionName}俸禄` : '山门俸禄'
    return {
      severity: 'minor',
      title: `${input.sectName}${positionText}`,
      text: `你在${input.sectName}领取了${positionText}，山门资源补入行囊，贡献也随日常考绩记入宗卷。`,
      rewards,
      tags: ['sect', 'reward', 'stipend']
    }
  }

  const count = input.claimedCount ?? 0
  return {
    severity: count >= 3 ? 'major' : 'minor',
    title: `${input.sectName}任务结算`,
    text: `你集中领取了${count}项宗门任务奖励，贡献、灵石与修为收益已回流到当前修炼循环。`,
    rewards,
    tags: ['sect', 'reward', 'task']
  }
}

function buildJourneyRewards(rewards: SectRewardJourneyInput['rewards']): PlayerJourneyEntry['rewards'] {
  const rows: PlayerJourneyEntry['rewards'] = []
  if (rewards.contribution && rewards.contribution > 0) {
    rows.push({ type: 'contribution', label: '贡献', value: rewards.contribution })
  }
  if (rewards.gold && rewards.gold > 0) {
    rows.push({ type: 'gold', label: '灵石', value: rewards.gold })
  }
  if (rewards.cultivation && rewards.cultivation > 0) {
    rows.push({ type: 'cultivation', label: '修为', value: rewards.cultivation })
  }
  return rows
}
