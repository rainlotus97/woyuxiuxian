import type { SectWar } from '@/types/sect'
import { getSectDirectiveEffects } from './sectDirectiveEffects'
import type { SectDirectiveId } from './sectPositionResolver'
import type { SectWarResolution } from './sectWorldTypes'

export interface SectWarRewardPack {
  contribution: number
  gold: number
  reputation: number
}

export interface SectWarPenaltyPack {
  contribution: number
  reputation: number
}

export interface SectWarReport {
  warId: string
  title: string
  summary: string
  time: number
  winner: 'attacker' | 'defender'
  rewards: SectWarRewardPack
  penalties: SectWarPenaltyPack
}

export interface SectWarConclusion {
  winner: 'attacker' | 'defender'
  status: 'victory' | 'defeat'
  rewards: SectWarRewardPack
  penalties: SectWarPenaltyPack
  result: NonNullable<SectWar['result']>
  nextDefenderRelation: 'hostile' | 'neutral'
  nextSectHp: number
  report: SectWarReport
  resolution: SectWarResolution
}

export function resolveSectWarConclusion(input: {
  war: SectWar
  attackerWon: boolean
  directive: SectDirectiveId
  sectHp: number
  sectMaxHp: number
  now: number
}): SectWarConclusion {
  const winner = input.attackerWon ? 'attacker' : 'defender'
  const status = input.attackerWon ? 'victory' : 'defeat'
  const rewards = resolveSectWarRewards(input.attackerWon, input.directive)
  const penalties = input.attackerWon
    ? { contribution: 0, reputation: 0 }
    : { contribution: 200, reputation: 100 }
  const hpDamageRatio = input.attackerWon ? 0.12 : 0.22
  const nextSectHp = Math.max(1, input.sectHp - Math.max(12, Math.floor(input.sectMaxHp * hpDamageRatio)))

  const report: SectWarReport = {
    warId: input.war.id,
    title: input.attackerWon ? '宗门凯旋' : '宗门失利',
    summary: input.attackerWon
      ? '前线告捷，山门获得新的声望与资源。'
      : '前线败退，宗门需要重新整饬人手与威望。',
    time: input.now,
    winner,
    rewards,
    penalties
  }

  return {
    winner,
    status,
    rewards,
    penalties,
    result: {
      winner,
      rewards: formatWarRewards(rewards),
      penalties: formatWarPenalties(penalties)
    },
    nextDefenderRelation: input.attackerWon ? 'hostile' : 'neutral',
    nextSectHp,
    report,
    resolution: {
      warId: input.war.id,
      attackerSectId: input.war.attackerSectId,
      defenderSectId: input.war.defenderSectId,
      winner,
      status,
      attackerScore: input.war.attackerScore,
      defenderScore: input.war.defenderScore,
      rewards,
      penalties
    }
  }
}

function resolveSectWarRewards(attackerWon: boolean, directive: SectDirectiveId): SectWarRewardPack {
  const directiveEffects = getSectDirectiveEffects(directive)
  if (attackerWon) {
    return {
      contribution: Math.max(1, Math.floor(500 * directiveEffects.taskContributionMultiplier * directiveEffects.warRewardMultiplier)),
      gold: Math.max(1, Math.floor(1000 * directiveEffects.taskGoldMultiplier * directiveEffects.warRewardMultiplier)),
      reputation: Math.max(0, Math.floor(100 * directiveEffects.warRewardMultiplier))
    }
  }

  return {
    contribution: Math.max(1, Math.floor(200 * directiveEffects.taskContributionMultiplier)),
    gold: Math.max(1, Math.floor(500 * directiveEffects.taskGoldMultiplier)),
    reputation: 0
  }
}

function formatWarRewards(rewards: SectWarRewardPack) {
  const labels = [`${rewards.contribution}贡献点`, `${rewards.gold}灵石`]
  if (rewards.reputation > 0) {
    labels.push(`${rewards.reputation}声望`)
  }
  return labels
}

function formatWarPenalties(penalties: SectWarPenaltyPack) {
  const labels: string[] = []
  if (penalties.reputation > 0) {
    labels.push(`${penalties.reputation}声望`)
  }
  if (penalties.contribution > 0) {
    labels.push(`${penalties.contribution}贡献点`)
  }
  return labels
}
