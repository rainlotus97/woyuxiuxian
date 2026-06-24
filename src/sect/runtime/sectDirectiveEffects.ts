import type { SectTask } from '@/types/sect'
import type { SectDirectiveId } from './sectPositionResolver'

export interface SectDirectiveEffectPack {
  taskContributionMultiplier: number
  taskGoldMultiplier: number
  alchemySuccessBonus: number
  herbYieldMultiplier: number
  warRewardMultiplier: number
}

const DIRECTIVE_EFFECTS: Record<SectDirectiveId, SectDirectiveEffectPack> = {
  balanced: {
    taskContributionMultiplier: 1,
    taskGoldMultiplier: 1,
    alchemySuccessBonus: 0,
    herbYieldMultiplier: 1,
    warRewardMultiplier: 1
  },
  cultivation: {
    taskContributionMultiplier: 1,
    taskGoldMultiplier: 0.96,
    alchemySuccessBonus: 0.06,
    herbYieldMultiplier: 1.15,
    warRewardMultiplier: 0.92
  },
  supply: {
    taskContributionMultiplier: 1.05,
    taskGoldMultiplier: 1.08,
    alchemySuccessBonus: 0.02,
    herbYieldMultiplier: 1.12,
    warRewardMultiplier: 0.95
  },
  warfare: {
    taskContributionMultiplier: 1.12,
    taskGoldMultiplier: 1.04,
    alchemySuccessBonus: -0.02,
    herbYieldMultiplier: 0.94,
    warRewardMultiplier: 1.18
  }
}

export function getSectDirectiveEffects(directive: SectDirectiveId): SectDirectiveEffectPack {
  return DIRECTIVE_EFFECTS[directive]
}

export function applyDirectiveToTaskRewards(task: SectTask, directive: SectDirectiveId): SectTask {
  const effects = getSectDirectiveEffects(directive)
  return {
    ...task,
    rewards: {
      ...task.rewards,
      contribution: Math.max(1, Math.floor(task.rewards.contribution * effects.taskContributionMultiplier)),
      gold: Math.max(1, Math.floor(task.rewards.gold * effects.taskGoldMultiplier))
    }
  }
}
