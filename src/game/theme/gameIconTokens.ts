export const GAME_ICON_SIZE_TOKENS = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
} as const

export type GameIconSizeToken = keyof typeof GAME_ICON_SIZE_TOKENS

export function resolveGameIconSize(size: number | GameIconSizeToken) {
  return typeof size === 'number' ? size : GAME_ICON_SIZE_TOKENS[size]
}
