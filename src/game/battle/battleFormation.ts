import type { BattleArenaRoleStyle, BattleArenaTheme } from '@/game/battle/config/arenas'
import type { BattleRuntimeUnit } from './runtimeTypes'
import type { BattleActorRole } from './presentationRoles'

interface BattleFormationStyle extends BattleArenaRoleStyle {
  scaleMultiplier: number
  xOffset: number
  yOffset: number
  shadowWidthDelta: number
  shadowHeightDelta: number
}

export interface BattleFormationPlacement {
  unitId: string
  role: BattleActorRole
  x: number
  y: number
  scale: number
  shadowWidth: number
  shadowHeight: number
}

const DEFAULT_ROLE_STYLES: Record<BattleActorRole, BattleFormationStyle> = {
  protagonist: { scaleMultiplier: 1.08, xOffset: 0, yOffset: 8, shadowWidthDelta: 8, shadowHeightDelta: 2 },
  companion: { scaleMultiplier: 0.96, xOffset: 0, yOffset: 0, shadowWidthDelta: -2, shadowHeightDelta: 0 },
  pet: { scaleMultiplier: 0.82, xOffset: 0, yOffset: 20, shadowWidthDelta: -16, shadowHeightDelta: -4 },
  summon: { scaleMultiplier: 0.88, xOffset: 0, yOffset: 12, shadowWidthDelta: -10, shadowHeightDelta: -2 },
  enemy: { scaleMultiplier: 1, xOffset: 0, yOffset: 0, shadowWidthDelta: 0, shadowHeightDelta: 0 },
  elite: { scaleMultiplier: 1.04, xOffset: 0, yOffset: -4, shadowWidthDelta: 4, shadowHeightDelta: 1 },
  boss: { scaleMultiplier: 1.1, xOffset: 0, yOffset: -10, shadowWidthDelta: 12, shadowHeightDelta: 2 }
}

const ROLE_PRIORITY: Record<'ally' | 'enemy', Record<BattleActorRole, number>> = {
  ally: {
    protagonist: 0,
    companion: 1,
    pet: 2,
    summon: 3,
    enemy: 4,
    elite: 5,
    boss: 6
  },
  enemy: {
    boss: 0,
    elite: 1,
    enemy: 2,
    summon: 3,
    pet: 4,
    companion: 5,
    protagonist: 6
  }
}

const DEFAULT_ROLE_SLOT_ORDER: Record<'ally' | 'enemy', Record<BattleActorRole, number[]>> = {
  ally: {
    protagonist: [0, -1, 1],
    companion: [0, -1, 1, -2, 2, -3, 3],
    pet: [1, -1, 2, -2, 3, -3, 4, -4],
    summon: [2, -2, 3, -3, 4, -4, 5, -5],
    enemy: [0, -1, 1],
    elite: [0, -1, 1],
    boss: [0]
  },
  enemy: {
    boss: [0, -1, 1, -2, 2],
    elite: [0, -1, 1, -2, 2, -3, 3],
    enemy: [0, -1, 1, -2, 2, -3, 3, -4, 4],
    summon: [1, -1, 2, -2, 3, -3, 4, -4],
    pet: [1, -1, 2, -2, 3, -3],
    companion: [0, -1, 1],
    protagonist: [0]
  }
}

function sortUnitsForFormation(units: BattleRuntimeUnit[], side: 'ally' | 'enemy') {
  return [...units]
    .map((unit, originalIndex) => ({ unit, originalIndex }))
    .sort((left, right) => {
      const priorityDiff = ROLE_PRIORITY[side][left.unit.battleRole] - ROLE_PRIORITY[side][right.unit.battleRole]
      if (priorityDiff !== 0) return priorityDiff
      return left.originalIndex - right.originalIndex
    })
}

function buildFallbackSlots(total: number) {
  const fallback: number[] = [0]
  for (let index = 1; fallback.length < total + 8; index++) {
    fallback.push(-index, index)
  }
  return fallback
}

function mergeRoleStyle(theme: BattleArenaTheme, role: BattleActorRole): BattleFormationStyle {
  const defaultStyle = DEFAULT_ROLE_STYLES[role]
  const override = theme.layout.roleStyles?.[role]
  return {
    scaleMultiplier: override?.scaleMultiplier ?? defaultStyle.scaleMultiplier,
    xOffset: override?.xOffset ?? defaultStyle.xOffset,
    yOffset: override?.yOffset ?? defaultStyle.yOffset,
    shadowWidthDelta: override?.shadowWidthDelta ?? defaultStyle.shadowWidthDelta,
    shadowHeightDelta: override?.shadowHeightDelta ?? defaultStyle.shadowHeightDelta
  }
}

function pickSlot(
  role: BattleActorRole,
  side: 'ally' | 'enemy',
  usedSlots: Set<number>,
  theme: BattleArenaTheme,
  fallbackSlots: number[]
) {
  const preferredSlots = theme.layout.roleSlotOrder?.[side]?.[role] ?? DEFAULT_ROLE_SLOT_ORDER[side][role]
  for (const slot of preferredSlots) {
    if (!usedSlots.has(slot)) {
      usedSlots.add(slot)
      return slot
    }
  }

  for (const slot of fallbackSlots) {
    if (!usedSlots.has(slot)) {
      usedSlots.add(slot)
      return slot
    }
  }

  const emergencySlot = fallbackSlots.length
  usedSlots.add(emergencySlot)
  return emergencySlot
}

export function resolveBattleFormation(
  units: BattleRuntimeUnit[],
  theme: BattleArenaTheme,
  side: 'ally' | 'enemy',
  width: number,
  height: number
) {
  const formation = theme.layout[side]
  const spacing = Math.min(formation.spacingCap, width / Math.max(5, units.length + formation.spacingDivisor))
  const fallbackSlots = buildFallbackSlots(units.length)
  const usedSlots = new Set<number>()
  const placements = new Map<string, BattleFormationPlacement>()

  for (const { unit } of sortUnitsForFormation(units, side)) {
    const slot = pickSlot(unit.battleRole, side, usedSlots, theme, fallbackSlots)
    const slotOffset = slot * spacing
    const roleStyle = mergeRoleStyle(theme, unit.battleRole)
    const baseScale = unit.battleRole === 'boss'
      ? theme.layout.actorScale.boss
      : side === 'ally'
        ? theme.layout.actorScale.ally
        : theme.layout.actorScale.enemy

    placements.set(unit.id, {
      unitId: unit.id,
      role: unit.battleRole,
      x: width / 2 + slotOffset + roleStyle.xOffset,
      y: height * formation.anchorY + Math.abs(slotOffset) * formation.curveScale + roleStyle.yOffset,
      scale: baseScale * roleStyle.scaleMultiplier,
      shadowWidth: Math.max(28, formation.shadowWidth + roleStyle.shadowWidthDelta),
      shadowHeight: Math.max(10, formation.shadowHeight + roleStyle.shadowHeightDelta)
    })
  }

  return placements
}
