import appBackdropMain from '@/assets/theme/generated/main/bg-main-9x16-v1.png'
import panelShellWide from '@/assets/theme/generated/panels/panel-shell-wide-v1.png'
import buttonShellJade from '@/assets/theme/generated/buttons/button-shell-jade-tight-v2.png'

export interface ThemeAssetPack {
  id: string
  name: string
  images: {
    appBackdrop: string
    surfaceBackdrop: string
    storyBackdrop: string
    panelTexture: string
    buttonTexture: string
    emblemTexture: string
  }
  colors: {
    appBase: string
    appGlow: string
    surfaceBorder: string
    surfaceTitle: string
    surfaceText: string
    surfaceMuted: string
    storyText: string
    gold: string
    jade: string
    danger: string
  }
}

export const DEFAULT_THEME_ASSET_PACK: ThemeAssetPack = {
  id: 'mist-ivory-xianxia',
  name: '云岫绢光',
  images: {
    appBackdrop: appBackdropMain,
    surfaceBackdrop: '',
    storyBackdrop: appBackdropMain,
    panelTexture: panelShellWide,
    buttonTexture: buttonShellJade,
    emblemTexture: panelShellWide
  },
  colors: {
    appBase: '#eef8f1',
    appGlow: 'rgba(255, 223, 138, 0.22)',
    surfaceBorder: 'rgba(101, 152, 145, 0.22)',
    surfaceTitle: '#8e6227',
    surfaceText: '#325154',
    surfaceMuted: 'rgba(67, 92, 90, 0.72)',
    storyText: 'rgba(46, 71, 66, 0.92)',
    gold: '#c8a45c',
    jade: '#6fae98',
    danger: '#c36a61'
  }
}

export function resolveThemeCssVars(theme = DEFAULT_THEME_ASSET_PACK): Record<string, string> {
  return {
    '--theme-app-bg-image': theme.images.appBackdrop ? `url("${theme.images.appBackdrop}")` : 'none',
    '--theme-surface-image': theme.images.surfaceBackdrop ? `url("${theme.images.surfaceBackdrop}")` : 'none',
    '--theme-story-bg-image': theme.images.storyBackdrop ? `url("${theme.images.storyBackdrop}")` : 'none',
    '--theme-panel-texture': theme.images.panelTexture ? `url("${theme.images.panelTexture}")` : 'none',
    '--theme-button-texture': theme.images.buttonTexture ? `url("${theme.images.buttonTexture}")` : 'none',
    '--theme-emblem-texture': theme.images.emblemTexture ? `url("${theme.images.emblemTexture}")` : 'none',
    '--theme-app-base': theme.colors.appBase,
    '--theme-app-glow': theme.colors.appGlow,
    '--theme-surface-border': theme.colors.surfaceBorder,
    '--theme-surface-title': theme.colors.surfaceTitle,
    '--theme-surface-text': theme.colors.surfaceText,
    '--theme-surface-muted': theme.colors.surfaceMuted,
    '--theme-story-text': theme.colors.storyText,
    '--theme-gold': theme.colors.gold,
    '--theme-jade': theme.colors.jade,
    '--theme-danger': theme.colors.danger
  }
}
