import type { PlayerJourneyEntry, WorldLogEntry } from '@/types/world'

export type SectProgressionAction =
  | 'promotion'
  | 'facility_upgrade'
  | 'garden_plant'
  | 'garden_harvest'
  | 'alchemy_craft'
  | 'garden_accelerate'

export interface SectProgressionJourneyInput {
  action: SectProgressionAction
  sectName: string
  positionName?: string | null
  previousPositionName?: string | null
  nextPositionName?: string | null
  facilityName?: string | null
  previousLevel?: number | null
  nextLevel?: number | null
  seedName?: string | null
  cropName?: string | null
  itemName?: string | null
  quantity?: number | null
  itemCount?: number | null
  rewards?: PlayerJourneyEntry['rewards']
}

export interface SectProgressionJourneyResult {
  severity: WorldLogEntry['severity']
  title: string
  text: string
  rewards: PlayerJourneyEntry['rewards']
  tags: string[]
}

export function resolveSectProgressionJourney(input: SectProgressionJourneyInput): SectProgressionJourneyResult {
  const rewards = input.rewards ?? []

  if (input.action === 'promotion') {
    return {
      severity: 'major',
      title: `${input.sectName}晋升`,
      text: `你在${input.sectName}积累功绩，由${input.previousPositionName ?? '旧职'}晋升为${input.nextPositionName ?? input.positionName ?? '新职'}。宗门权限、俸禄与后续差遣随职位一并提升。`,
      rewards: rewards.length > 0 ? rewards : [{ type: 'reputation', label: '职位', value: input.nextPositionName ?? input.positionName ?? '晋升' }],
      tags: ['sect', 'progression', 'promotion']
    }
  }

  if (input.action === 'facility_upgrade') {
    const levelText = input.previousLevel && input.nextLevel
      ? `由 Lv.${input.previousLevel} 升至 Lv.${input.nextLevel}`
      : '完成升级'
    return {
      severity: (input.nextLevel ?? 1) >= 3 ? 'major' : 'normal',
      title: `${input.facilityName ?? '宗门设施'}升级`,
      text: `你调配${input.sectName}资源，使${input.facilityName ?? '宗门设施'}${levelText}。这会影响炼丹、药园、功法或战备等后续循环。`,
      rewards: rewards.length > 0 ? rewards : [{ type: 'flag', label: input.facilityName ?? '设施升级', value: input.nextLevel ?? '完成' }],
      tags: ['sect', 'progression', 'facility']
    }
  }

  if (input.action === 'garden_plant') {
    return {
      severity: 'minor',
      title: `${input.sectName}药园播种`,
      text: `你在${input.sectName}药园种下${input.seedName ?? '灵种'}，药圃会随世界时间继续生长，成熟后可收取炼丹与任务材料。`,
      rewards,
      tags: ['sect', 'progression', 'garden', 'plant']
    }
  }

  if (input.action === 'garden_harvest') {
    const countText = input.itemCount && input.itemCount > 1
      ? `等 ${input.itemCount} 类药材`
      : input.itemName ?? input.cropName ?? '灵草'
    return {
      severity: (input.quantity ?? 0) >= 5 || (input.itemCount ?? 0) >= 2 ? 'normal' : 'minor',
      title: `${input.sectName}药园收获`,
      text: `你收取了${input.sectName}药园成熟作物，获得${countText}。药园产物会进入背包，并推动采集类宗门任务进度。`,
      rewards,
      tags: ['sect', 'progression', 'garden', 'harvest']
    }
  }

  if (input.action === 'alchemy_craft') {
    return {
      severity: 'normal',
      title: `${input.sectName}炼丹成品`,
      text: `你借${input.sectName}${input.facilityName ?? '炼丹炉'}开炉炼制，成功取得${input.itemName ?? '丹药'}。丹药已收入背包，可服务修炼、战斗或破境准备。`,
      rewards,
      tags: ['sect', 'progression', 'alchemy']
    }
  }

  return {
    severity: 'minor',
    title: `${input.sectName}药园催熟`,
    text: `你投入灵石催动${input.sectName}药园灵机，使${input.cropName ?? '作物'}提前成熟，后续可直接收获。`,
    rewards,
    tags: ['sect', 'progression', 'garden', 'accelerate']
  }
}
