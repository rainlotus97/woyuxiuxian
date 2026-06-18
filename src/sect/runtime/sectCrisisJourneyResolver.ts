import type { PlayerJourneyEntry, WorldLogEntry } from '@/types/world'
import type { SectEventEffectTotals } from './sectEventResolver'
import type { SectRecoveryActionId } from './sectRecoveryResolver'

export type SectCrisisAction =
  | 'recovery'
  | 'npc_rescue'
  | 'war_declaration'
  | 'event_choice'

export interface SectCrisisJourneyInput {
  action: SectCrisisAction
  sectName: string
  targetSectName?: string | null
  npcName?: string | null
  eventTitle?: string | null
  choiceText?: string | null
  recoveryTitle?: string | null
  recoveryMessage?: string | null
  recoveryActionId?: SectRecoveryActionId | null
  contributionCost?: number | null
  goldCost?: number | null
  hpRestore?: number | null
  progressGain?: number | null
  effects?: SectEventEffectTotals | null
}

export interface SectCrisisJourneyResult {
  severity: WorldLogEntry['severity']
  title: string
  text: string
  rewards: PlayerJourneyEntry['rewards']
  tags: string[]
}

export function resolveSectCrisisJourney(input: SectCrisisJourneyInput): SectCrisisJourneyResult {
  if (input.action === 'recovery') {
    const rewards = buildCostRewards(input)
    if (input.hpRestore && input.hpRestore > 0) {
      rewards.push({ type: 'flag', label: '山门修复', value: input.hpRestore })
    }
    if (input.progressGain && input.progressGain > 0) {
      rewards.push({ type: 'flag', label: '恢复进度', value: input.progressGain })
    }
    return {
      severity: input.recoveryActionId === 'buy_freedom' || input.recoveryActionId === 'rescue_sortie' ? 'major' : 'normal',
      title: input.recoveryTitle ?? `${input.sectName}恢复行动`,
      text: `${input.sectName}投入资源推进恢复事务。${input.recoveryMessage ?? '山门状态有所回稳。'}`,
      rewards,
      tags: ['sect', 'crisis', 'recovery', input.recoveryActionId ?? 'recovery']
    }
  }

  if (input.action === 'npc_rescue') {
    return {
      severity: 'major',
      title: `${input.npcName ?? '同门'}脱困`,
      text: `你调动${input.sectName}资源营救${input.npcName ?? '被俘同门'}，对方已经脱离囚局，后续仍需疗伤与安置。`,
      rewards: [
        ...buildCostRewards(input),
        { type: 'reputation', label: '营救', value: input.npcName ?? '同门' }
      ],
      tags: ['sect', 'crisis', 'rescue']
    }
  }

  if (input.action === 'war_declaration') {
    return {
      severity: 'major',
      title: `${input.sectName}宣战`,
      text: `${input.sectName}正式向${input.targetSectName ?? '敌对势力'}宣战，宗门外交进入战时状态，后续世界时钟会持续推进战局。`,
      rewards: [{ type: 'flag', label: '宣战', value: input.targetSectName ?? '敌对势力' }],
      tags: ['sect', 'crisis', 'war', 'declaration']
    }
  }

  const eventRewards = buildEventRewards(input.effects)
  return {
    severity: eventRewards.length > 0 ? 'normal' : 'minor',
    title: `${input.sectName}宗门事件`,
    text: `你处理了${input.eventTitle ?? '宗门事件'}，选择“${input.choiceText ?? '处置'}”。事件影响已写入宗门资源与后续世界记录。`,
    rewards: eventRewards,
    tags: ['sect', 'crisis', 'event']
  }
}

function buildCostRewards(input: SectCrisisJourneyInput): PlayerJourneyEntry['rewards'] {
  const rewards: PlayerJourneyEntry['rewards'] = []
  if (input.contributionCost && input.contributionCost > 0) {
    rewards.push({ type: 'contribution', label: '贡献消耗', value: -input.contributionCost })
  }
  if (input.goldCost && input.goldCost > 0) {
    rewards.push({ type: 'gold', label: '灵石消耗', value: -input.goldCost })
  }
  return rewards
}

function buildEventRewards(effects?: SectEventEffectTotals | null): PlayerJourneyEntry['rewards'] {
  if (!effects) return []
  const rewards: PlayerJourneyEntry['rewards'] = []
  if (effects.gold !== 0) rewards.push({ type: 'gold', label: '灵石', value: effects.gold })
  if (effects.contribution !== 0) rewards.push({ type: 'contribution', label: '贡献', value: effects.contribution })
  if (effects.reputation !== 0) rewards.push({ type: 'reputation', label: '声望', value: effects.reputation })
  for (const value of effects.relationValues) {
    rewards.push({ type: 'flag', label: '关系', value })
  }
  for (const value of effects.itemValues) {
    rewards.push({ type: 'item', label: value, value: 1 })
  }
  return rewards
}
