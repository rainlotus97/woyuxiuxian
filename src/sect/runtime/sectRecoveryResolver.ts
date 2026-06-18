import type { SectWorldCondition } from '@/types/sect'

export type SectRecoveryActionId =
  | 'raise_banner'
  | 'secure_supplies'
  | 'repair_barrier'
  | 'rally_disciples'
  | 'buy_freedom'
  | 'rescue_sortie'

export interface SectRecoveryActionDefinition {
  id: SectRecoveryActionId
  label: string
  description: string
  contributionCost: number
  goldCost: number
  progressGain: number
  hpRestorePercent: number
  clearsCaptivity?: boolean
  tone: 'jade' | 'gold' | 'mist'
}

export interface SectRecoveryState {
  active: boolean
  status: SectWorldCondition['status']
  stageLabel: string
  summary: string
  progressCurrent: number
  progressMax: number
  progressHint: string
  tone: 'jade' | 'gold' | 'mist'
  options: SectRecoveryActionDefinition[]
}

export interface SectRecoveryContext {
  worldCondition: SectWorldCondition
  sectHp: number
  sectMaxHp: number
  recoveryProgress: number
  isPlayerCaptured: boolean
  captorSectName?: string | null
}

export interface SectRecoveryOutcome {
  nextStatus: SectWorldCondition['status']
  nextProgress: number
  nextOccupiedBySectId: string | null
  hpRestore: number
  clearsCaptivity: boolean
  title: string
  summary: string
}

const COLLAPSED_PROGRESS_MAX = 160
const REBUILDING_PROGRESS_MAX = 120

function getProgressMax(status: SectWorldCondition['status']) {
  if (status === 'collapsed') return COLLAPSED_PROGRESS_MAX
  if (status === 'rebuilding') return REBUILDING_PROGRESS_MAX
  return 0
}

function getRecoveryOptions(status: SectWorldCondition['status'], isPlayerCaptured: boolean): SectRecoveryActionDefinition[] {
  if (status === 'collapsed') {
    const options: SectRecoveryActionDefinition[] = [
      {
        id: 'raise_banner',
        label: '重立山门',
        description: '召集残存弟子重整山门旗号，先把秩序重新立住。',
        contributionCost: 80,
        goldCost: 260,
        progressGain: 46,
        hpRestorePercent: 0.14,
        tone: 'mist'
      },
      {
        id: 'secure_supplies',
        label: '暗运资材',
        description: '从外部调入药材和阵材，避免山门继续失血。',
        contributionCost: 42,
        goldCost: 190,
        progressGain: 30,
        hpRestorePercent: 0.08,
        tone: 'gold'
      }
    ]

    if (isPlayerCaptured) {
      options.push({
        id: 'buy_freedom',
        label: '赎回主角',
        description: '以宗门资财疏通敌方看守，先把主角从囚局中换出来。',
        contributionCost: 56,
        goldCost: 320,
        progressGain: 24,
        hpRestorePercent: 0.05,
        clearsCaptivity: true,
        tone: 'jade'
      })
    }

    return options
  }

  if (status === 'rebuilding') {
    const options: SectRecoveryActionDefinition[] = [
      {
        id: 'repair_barrier',
        label: '修复护山阵',
        description: '优先修补防御阵眼，让山门重新具备自保能力。',
        contributionCost: 36,
        goldCost: 150,
        progressGain: 28,
        hpRestorePercent: 0.14,
        tone: 'gold'
      },
      {
        id: 'rally_disciples',
        label: '安定弟子',
        description: '安抚弟子与附庸势力，恢复人手和日常秩序。',
        contributionCost: 24,
        goldCost: 110,
        progressGain: 24,
        hpRestorePercent: 0.1,
        tone: 'jade'
      }
    ]

    if (isPlayerCaptured) {
      options.push({
        id: 'rescue_sortie',
        label: '组织营救',
        description: '抽调精锐夜袭敌营，把主角从囚地强行接回。',
        contributionCost: 44,
        goldCost: 230,
        progressGain: 18,
        hpRestorePercent: 0.06,
        clearsCaptivity: true,
        tone: 'mist'
      })
    }

    return options
  }

  return []
}

export function resolveSectRecoveryState(context: SectRecoveryContext): SectRecoveryState {
  const { status } = context.worldCondition
  if (status === 'stable') {
    return {
      active: false,
      status,
      stageLabel: '山门稳固',
      summary: '宗门当前未进入恢复阶段。',
      progressCurrent: 0,
      progressMax: 0,
      progressHint: '当前无需启动恢复工程。',
      tone: 'jade',
      options: []
    }
  }

  const progressMax = getProgressMax(status)
  const progressCurrent = Math.min(progressMax, Math.max(0, context.recoveryProgress))
  const hpPercent = context.sectMaxHp > 0 ? Math.floor((context.sectHp / context.sectMaxHp) * 100) : 0
  const tone = status === 'collapsed' ? 'mist' : 'gold'
  const captorLine = context.isPlayerCaptured && context.captorSectName
    ? `主角当前仍被${context.captorSectName}控制。`
    : ''

  return {
    active: true,
    status,
    stageLabel: status === 'collapsed' ? '沦陷恢复' : '重建恢复',
    summary: status === 'collapsed'
      ? `山门已经失守，需先重整旗号与补足资材，再把宗门从废墟中拉回。当前完整度约 ${hpPercent}%。${captorLine}`
      : `山门已脱离最危险阶段，但仍需修阵、安民与恢复秩序。当前完整度约 ${hpPercent}%。${captorLine}`,
    progressCurrent,
    progressMax,
    progressHint: status === 'collapsed'
      ? `恢复进度满 ${progressMax} 后可摆脱沦陷，转入重建。`
      : `恢复进度满 ${progressMax} 后可回到稳定态。`,
    tone,
    options: getRecoveryOptions(status, context.isPlayerCaptured)
  }
}

export function getSectRecoveryOption(
  status: SectWorldCondition['status'],
  actionId: SectRecoveryActionId,
  isPlayerCaptured: boolean
) {
  return getRecoveryOptions(status, isPlayerCaptured).find(option => option.id === actionId) ?? null
}

export function resolveSectRecoveryOutcome(
  context: SectRecoveryContext,
  action: SectRecoveryActionDefinition
): SectRecoveryOutcome {
  const progressMax = getProgressMax(context.worldCondition.status)
  const hpRestore = Math.max(1, Math.floor(context.sectMaxHp * action.hpRestorePercent))
  const updatedProgress = Math.min(progressMax, context.recoveryProgress + action.progressGain)

  if (context.worldCondition.status === 'collapsed' && updatedProgress >= progressMax) {
    return {
      nextStatus: 'rebuilding',
      nextProgress: 0,
      nextOccupiedBySectId: null,
      hpRestore: Math.max(hpRestore, Math.floor(context.sectMaxHp * 0.3) - context.sectHp),
      clearsCaptivity: Boolean(action.clearsCaptivity),
      title: '山门重燃',
      summary: '宗门已经从沦陷废墟中重新立起，后续进入重建阶段，可继续恢复阵法与秩序。'
    }
  }

  if (context.worldCondition.status === 'rebuilding' && updatedProgress >= progressMax) {
    return {
      nextStatus: 'stable',
      nextProgress: 0,
      nextOccupiedBySectId: null,
      hpRestore: Math.max(hpRestore, Math.floor(context.sectMaxHp * 0.68) - context.sectHp),
      clearsCaptivity: Boolean(action.clearsCaptivity),
      title: '山门安定',
      summary: '宗门已经恢复稳定，山门秩序与基础运转重新建立。'
    }
  }

  return {
    nextStatus: context.worldCondition.status,
    nextProgress: updatedProgress,
    nextOccupiedBySectId: context.worldCondition.status === 'collapsed'
      ? context.worldCondition.occupiedBySectId
      : null,
    hpRestore,
    clearsCaptivity: Boolean(action.clearsCaptivity),
    title: action.clearsCaptivity ? '恢复行动推进' : '山门恢复推进',
    summary: action.clearsCaptivity
      ? '宗门已抽出资源处理主角的囚局，同时也在逐步恢复山门秩序。'
      : '宗门恢复行动已推进，山门完整度与重建进度有所回升。'
  }
}
