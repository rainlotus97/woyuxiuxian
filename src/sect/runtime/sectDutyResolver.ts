import type { SectTask } from '@/types/sect'
import type { SectDirectiveId } from './sectPositionResolver'

export interface SectDutyInput {
  joinedSectId: string | null
  sectName: string | null
  positionName: string
  directive: SectDirectiveId
  stamina: number
  tasks: SectTask[]
}

export interface SectDutyResult {
  success: boolean
  reason: string
  title: string
  text: string
  staminaCost: number
  taskId: string | null
  taskName: string | null
  taskProgressType: SectTask['requirements']['type'] | null
  taskProgressTarget: string | null
  completedTask: boolean
  rewards: {
    contribution: number
    cultivation: number
    gold: number
  }
  severity: 'normal' | 'major'
  tags: string[]
}

const DUTY_STAMINA_COST = 10

export function resolveSectDuty(input: SectDutyInput): SectDutyResult {
  if (!input.joinedSectId || !input.sectName) {
    return fail('尚未加入宗门，无法处理宗门差遣。')
  }

  if (input.stamina < DUTY_STAMINA_COST) {
    return fail(`体力不足，需要 ${DUTY_STAMINA_COST} 点体力。`)
  }

  const targetTask = chooseDutyTask(input.tasks)
  const directiveBonus = input.directive === 'supply' ? 2 : input.directive === 'warfare' ? 1 : 0
  const contribution = 4 + directiveBonus
  const cultivation = input.directive === 'cultivation' ? 10 : 6
  const gold = input.directive === 'supply' ? 8 : 5

  if (!targetTask) {
    return {
      success: true,
      reason: '',
      title: `${input.sectName}山门巡值`,
      text: `你以${input.positionName}身份处理了一轮山门杂务，虽未对应具体考绩，也让宗门运转更稳。`,
      staminaCost: DUTY_STAMINA_COST,
      taskId: null,
      taskName: null,
      taskProgressType: null,
      taskProgressTarget: null,
      completedTask: false,
      rewards: { contribution: Math.max(2, contribution - 2), cultivation, gold },
      severity: 'normal',
      tags: ['sect', 'sect-duty']
    }
  }

  const nextProgress = Math.min(targetTask.requirements.count, targetTask.progress + 1)
  const completedTask = nextProgress >= targetTask.requirements.count && !targetTask.completed
  return {
    success: true,
    reason: '',
    title: completedTask ? `${targetTask.name}完成` : `${targetTask.name}推进`,
    text: completedTask
      ? `你完成了${input.sectName}交付的「${targetTask.name}」，可在任务栏领取考绩奖励。`
      : `你处理了${input.sectName}的「${targetTask.name}」，进度推进至 ${nextProgress}/${targetTask.requirements.count}。`,
    staminaCost: DUTY_STAMINA_COST,
    taskId: targetTask.id,
    taskName: targetTask.name,
    taskProgressType: targetTask.requirements.type,
    taskProgressTarget: targetTask.requirements.target,
    completedTask,
    rewards: { contribution, cultivation, gold },
    severity: completedTask ? 'major' : 'normal',
    tags: ['sect', 'sect-duty', targetTask.requirements.type]
  }
}

function chooseDutyTask(tasks: SectTask[]) {
  return tasks
    .filter(task => !task.completed && !task.claimed)
    .sort((a, b) => {
      const scoreA = getTaskPriority(a)
      const scoreB = getTaskPriority(b)
      return scoreB - scoreA
    })[0] ?? null
}

function getTaskPriority(task: SectTask) {
  const remain = Math.max(0, task.requirements.count - task.progress)
  const typeScore = task.type === 'daily' ? 20 : task.type === 'weekly' ? 10 : 0
  return typeScore + task.progress * 2 - remain
}

function fail(reason: string): SectDutyResult {
  return {
    success: false,
    reason,
    title: '无法处理宗门差遣',
    text: reason,
    staminaCost: DUTY_STAMINA_COST,
    taskId: null,
    taskName: null,
    taskProgressType: null,
    taskProgressTarget: null,
    completedTask: false,
    rewards: { contribution: 0, cultivation: 0, gold: 0 },
    severity: 'normal',
    tags: ['sect', 'sect-duty']
  }
}
