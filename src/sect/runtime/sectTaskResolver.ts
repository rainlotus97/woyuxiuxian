import type { SectTask, SectTaskType } from '@/types/sect'
import type { SectDirectiveId } from './sectPositionResolver'
import { applyDirectiveToTaskRewards } from './sectDirectiveEffects'

export interface SectTaskProgressResolution {
  tasks: SectTask[]
  advancedTaskIds: string[]
  completedTaskIds: string[]
}

export interface SectTaskReward {
  contribution: number
  gold: number
  exp: number
  reputation: number
}

export interface SectTaskClaimResolution {
  canClaim: boolean
  taskId: string | null
  reward: SectTaskReward
}

export interface SectTaskClaimAllResolution {
  taskIds: string[]
  reward: SectTaskReward
}

export interface SectTaskGenerationResolution {
  tasks: SectTask[]
  generatedCount: number
}

export interface SectTaskRefreshResolution {
  shouldRefresh: boolean
  taskTypes: SectTaskType[]
  retainedTasks: SectTask[]
  nextRefreshAt: number
}

const EMPTY_REWARD: SectTaskReward = {
  contribution: 0,
  gold: 0,
  exp: 0,
  reputation: 0
}

export function resolveManualSectTaskProgress(tasks: SectTask[], taskId: string): SectTaskProgressResolution {
  return resolveTaskProgress(tasks, task => task.id === taskId && !task.completed)
}

export function resolveSectTaskProgress(
  tasks: SectTask[],
  input: {
    joinedSectId: string | null
    type: SectTask['requirements']['type']
    target?: string
  }
): SectTaskProgressResolution {
  if (!input.joinedSectId) {
    return {
      tasks,
      advancedTaskIds: [],
      completedTaskIds: []
    }
  }

  return resolveTaskProgress(tasks, task => {
    if (task.completed || task.claimed) return false
    if (task.requirements.type !== input.type) return false
    if (input.target && task.requirements.target !== input.target && task.requirements.target !== 'any') return false
    return true
  })
}

export function resolveSectTaskClaim(task: SectTask | undefined, directive: SectDirectiveId): SectTaskClaimResolution {
  if (!task || !task.completed || task.claimed) {
    return {
      canClaim: false,
      taskId: null,
      reward: { ...EMPTY_REWARD }
    }
  }

  return {
    canClaim: true,
    taskId: task.id,
    reward: resolveTaskReward(task, directive)
  }
}

export function resolveSectTaskClaimAll(tasks: SectTask[], directive: SectDirectiveId): SectTaskClaimAllResolution {
  return tasks
    .filter(task => task.completed && !task.claimed)
    .reduce<SectTaskClaimAllResolution>(
      (result, task) => {
        const reward = resolveTaskReward(task, directive)
        result.taskIds.push(task.id)
        result.reward.contribution += reward.contribution
        result.reward.gold += reward.gold
        result.reward.exp += reward.exp
        result.reward.reputation += reward.reputation
        return result
      },
      {
        taskIds: [],
        reward: { ...EMPTY_REWARD }
      }
    )
}

export function resolveSectTaskGeneration(input: {
  joinedSectId: string | null
  type: SectTaskType
  directive: SectDirectiveId
  generateTask: (type: SectTaskType, sectId: string) => SectTask
}): SectTaskGenerationResolution {
  if (!input.joinedSectId) {
    return {
      tasks: [],
      generatedCount: 0
    }
  }

  const generatedCount = getSectTaskGenerationCount(input.type)
  const tasks = Array.from({ length: generatedCount }, () => {
    return applyDirectiveToTaskRewards(input.generateTask(input.type, input.joinedSectId as string), input.directive)
  })

  return {
    tasks,
    generatedCount
  }
}

export function resolveSectTaskRefresh(input: {
  joinedSectId: string | null
  tasks: SectTask[]
  lastRefreshAt: number
  now: number
}): SectTaskRefreshResolution {
  if (!input.joinedSectId) {
    return {
      shouldRefresh: false,
      taskTypes: [],
      retainedTasks: input.tasks,
      nextRefreshAt: input.lastRefreshAt
    }
  }

  const elapsed = input.now - input.lastRefreshAt
  const shouldRefreshDaily = elapsed > 24 * 60 * 60 * 1000
  const shouldRefreshWeekly = elapsed > 7 * 24 * 60 * 60 * 1000
  if (!shouldRefreshDaily && !shouldRefreshWeekly) {
    return {
      shouldRefresh: false,
      taskTypes: [],
      retainedTasks: input.tasks,
      nextRefreshAt: input.lastRefreshAt
    }
  }

  return {
    shouldRefresh: true,
    taskTypes: ['daily', 'weekly'],
    retainedTasks: input.tasks.filter(task => task.type === 'special'),
    nextRefreshAt: input.now
  }
}

function resolveTaskProgress(
  tasks: SectTask[],
  shouldAdvance: (task: SectTask) => boolean
): SectTaskProgressResolution {
  const advancedTaskIds: string[] = []
  const completedTaskIds: string[] = []
  const nextTasks = tasks.map(task => {
    if (!shouldAdvance(task)) return task

    const progress = Math.min(task.requirements.count, task.progress + 1)
    const completed = progress >= task.requirements.count
    advancedTaskIds.push(task.id)
    if (completed && !task.completed) {
      completedTaskIds.push(task.id)
    }
    return {
      ...task,
      progress,
      completed
    }
  })

  return {
    tasks: advancedTaskIds.length > 0 ? nextTasks : tasks,
    advancedTaskIds,
    completedTaskIds
  }
}

function resolveTaskReward(task: SectTask, directive: SectDirectiveId): SectTaskReward {
  return {
    contribution: task.rewards.contribution,
    gold: task.rewards.gold,
    exp: task.rewards.exp ?? 0,
    reputation: directive === 'warfare' ? 14 : 10
  }
}

function getSectTaskGenerationCount(type: SectTaskType) {
  if (type === 'daily') return 3
  if (type === 'weekly') return 2
  return 1
}
