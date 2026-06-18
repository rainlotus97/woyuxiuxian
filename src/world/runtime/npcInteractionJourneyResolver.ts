import type { PlayerJourneyEntry, RelationshipState, WorldLogEntry } from '@/types/world'
import type { NpcInteractionKind, NpcInteractionResolution } from './npcCompanionResolver'

export interface NpcInteractionJourneyInput {
  result: Pick<NpcInteractionResolution, 'kind' | 'title' | 'text' | 'favorDelta' | 'nextBond' | 'severity'>
  npcName: string
  npcTitle?: string | null
  locationName?: string | null
}

export interface NpcInteractionJourneyResult {
  severity: WorldLogEntry['severity']
  title: string
  text: string
  rewards: PlayerJourneyEntry['rewards']
  tags: string[]
}

const kindLabels: Record<NpcInteractionKind, string> = {
  greet: '结识问候',
  invite: '邀约同行'
}

const bondLabels: Record<RelationshipState['bond'], string> = {
  stranger: '萍水相逢',
  friend: '可托之友',
  rival: '亦敌亦友',
  enemy: '敌对',
  mentor: '引路人',
  companion: '同行伙伴',
  lover: '情缘'
}

export function resolveNpcInteractionJourney(input: NpcInteractionJourneyInput): NpcInteractionJourneyResult {
  const locationText = input.locationName ? `于${input.locationName}` : '在途中'
  const roleText = input.npcTitle ? `${input.npcTitle}${input.npcName}` : input.npcName
  const actionText = kindLabels[input.result.kind]
  const bondText = bondLabels[input.result.nextBond]

  return {
    severity: input.result.severity,
    title: `${input.npcName}${input.result.kind === 'invite' ? '同行之约' : '缘分初结'}`,
    text: `${locationText}${actionText}${roleText}。${input.result.text}当前关系已近「${bondText}」。`,
    rewards: [
      { type: 'flag', label: '好感', value: `+${input.result.favorDelta}` },
      { type: 'flag', label: '关系', value: bondText }
    ],
    tags: ['npc', 'relationship', input.result.kind, input.result.nextBond]
  }
}
