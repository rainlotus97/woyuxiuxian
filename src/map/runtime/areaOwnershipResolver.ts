import type { MapArea } from '@/types/map'
import { getSectById } from '@/types/sect'
import type { SectWarResolution } from '@/sect/runtime/sectWorldTypes'
import type { AreaRuntimeUpdate } from './mapRuntimeTypes'

export interface AreaOwnershipResolution {
  update: AreaRuntimeUpdate
  mapEvent: {
    type: 'sect' | 'world'
    title: string
    description: string
    impact: string
  }
  worldLog?: {
    scope: 'sect' | 'world'
    severity: 'normal' | 'major'
    title: string
    text: string
    actorIds: string[]
    tags: string[]
    mapId: string
  }
}

function resolveWinningSectId(war: SectWarResolution) {
  return war.winner === 'attacker' ? war.attackerSectId : war.defenderSectId
}

function resolveLosingSectId(war: SectWarResolution) {
  return war.winner === 'attacker' ? war.defenderSectId : war.attackerSectId
}

export function resolveAreaOwnershipChange(
  area: MapArea,
  war: SectWarResolution,
  currentControllerSectId: string | null
): AreaOwnershipResolution | null {
  const winningSectId = resolveWinningSectId(war)
  const losingSectId = resolveLosingSectId(war)

  if (!area.sects.includes(winningSectId)) return null
  if (currentControllerSectId === winningSectId) return null

  const winningSect = getSectById(winningSectId)
  const losingSect = getSectById(losingSectId)
  const areaName = area.name

  return {
    update: {
      areaId: area.id,
      controllingSectId: winningSectId,
      contested: false,
      stabilityDelta: 10,
      pressureDelta: -12,
      log: {
        type: 'sect',
        title: '边境控制权更替',
        description: `${winningSect?.name ?? winningSectId}夺取了${areaName}的主导权。`,
        impact: `${areaName}控制宗门变更`
      }
    },
    mapEvent: {
      type: 'sect',
      title: `${areaName}易主`,
      description: `${winningSect?.name ?? winningSectId}在与${losingSect?.name ?? losingSectId}的争斗后控制了${areaName}。`,
      impact: `${areaName}当前由${winningSect?.name ?? winningSectId}掌控`
    },
    worldLog: {
      scope: 'sect',
      severity: 'major',
      title: `${areaName}易主`,
      text: `${winningSect?.name ?? winningSectId}击退了${losingSect?.name ?? losingSectId}，接管了${areaName}。`,
      actorIds: [winningSectId, losingSectId],
      tags: ['sect', 'war', 'ownership'],
      mapId: area.id
    }
  }
}
