import type { BattleArenaTheme } from '@/game/battle/config/arenas'

export function getBattleActorScale(theme: BattleArenaTheme, side: 'ally' | 'enemy', spriteKey: string) {
  if (spriteKey === 'actor_boss') return theme.layout.actorScale.boss
  return side === 'ally' ? theme.layout.actorScale.ally : theme.layout.actorScale.enemy
}

export function getBattleActorPosition(
  width: number,
  height: number,
  theme: BattleArenaTheme,
  side: 'ally' | 'enemy',
  index: number,
  total: number
) {
  const formation = theme.layout[side]
  const spacing = Math.min(formation.spacingCap, width / Math.max(5, total + formation.spacingDivisor))
  const offset = (index - (total - 1) / 2) * spacing
  return {
    x: width / 2 + offset,
    y: height * formation.anchorY + Math.abs(offset) * formation.curveScale
  }
}

export function getBattleShadowSize(theme: BattleArenaTheme, side: 'ally' | 'enemy') {
  const formation = theme.layout[side]
  return {
    width: formation.shadowWidth,
    height: formation.shadowHeight
  }
}
