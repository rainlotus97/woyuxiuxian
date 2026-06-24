import type { PlayerJourneyEntry, WorldLogEntry } from '@/types/world'

export type SectMembershipJourneyAction = 'join' | 'leave'

export interface SectMembershipJourneyInput {
  action: SectMembershipJourneyAction
  sectName: string
  areaName?: string | null
  positionName?: string | null
}

export interface SectMembershipJourneyResult {
  severity: WorldLogEntry['severity']
  title: string
  text: string
  rewards: PlayerJourneyEntry['rewards']
  tags: string[]
}

export function resolveSectMembershipJourney(input: SectMembershipJourneyInput): SectMembershipJourneyResult {
  const areaText = input.areaName ? `，山门坐落于${input.areaName}` : ''

  if (input.action === 'join') {
    const positionText = input.positionName ? `，暂列${input.positionName}` : ''
    return {
      severity: 'major',
      title: `${input.sectName}拜山`,
      text: `你正式拜入${input.sectName}${areaText}${positionText}。从这一刻起，宗门任务、俸禄、同门关系与敌对势力都会进入你的主循环。`,
      rewards: [
        { type: 'reputation', label: '宗门归属', value: input.sectName }
      ],
      tags: ['sect', 'membership', 'join']
    }
  }

  return {
    severity: 'major',
    title: `离开${input.sectName}`,
    text: `你脱离了${input.sectName}${areaText}。贡献、声望与未竟宗门事务随之清空，往后需通过故事、地图或机缘重新建立归属。`,
    rewards: [],
    tags: ['sect', 'membership', 'leave']
  }
}
