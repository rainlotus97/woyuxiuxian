import type { MapArea } from '@/types/map'
import type { Realm } from '@/types/unit'

const REALM_ORDER: Realm[] = ['炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘', '仙人']

export interface MapAreaUnlockInput {
  area: Pick<MapArea, 'requiredRealm' | 'requiredRealmLevel'>
  playerRealm: Realm
  playerRealmLevel: number
}

export function isMapAreaUnlocked(input: MapAreaUnlockInput): boolean {
  const playerRealmIndex = REALM_ORDER.indexOf(input.playerRealm)
  const requiredRealmIndex = REALM_ORDER.indexOf(input.area.requiredRealm)

  if (playerRealmIndex < 0 || requiredRealmIndex < 0) return false
  if (playerRealmIndex > requiredRealmIndex) return true
  if (playerRealmIndex === requiredRealmIndex && input.playerRealmLevel >= input.area.requiredRealmLevel) return true
  return false
}
