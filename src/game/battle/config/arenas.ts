import type { AreaDifficulty } from '@/types/adventure'
import type { BattleActorRole } from '@/game/battle/presentationRoles'

export interface BattleArenaOverlaySpec {
  xRatio: number
  yRatio: number
  widthRatio: number
  heightRatio: number
  color: number
  alpha: number
  blendMode?: 'normal' | 'add' | 'screen'
}

export interface BattleArenaLayerSpec {
  key: string
  xRatio: number
  yRatio: number
  fillScale: number
  alpha: number
  tint?: number
  blendMode?: 'normal' | 'add' | 'screen'
}

export interface BattleArenaDriftLayerSpec extends BattleArenaLayerSpec {
  duration: number
  drift: number
}

export interface BattleArenaTerraceSpec {
  topRatio: number
  heightRatio: number
  radius: number
  fillColor: number
  fillAlpha: number
  strokeColor: number
  strokeAlpha: number
  accentColor: number
  accentAlpha: number
}

export interface BattleArenaSigilSpec {
  centerYRatio: number
  outerRadiusRatio: number
  innerRadiusRatio: number
  spokeCount: number
  primaryColor: number
  primaryAlpha: number
  secondaryColor: number
  secondaryAlpha: number
  rotationDuration: number
  pulseDuration: number
}

export interface BattleArenaSweepSpec {
  centerYRatio: number
  widthRatio: number
  height: number
  color: number
  alpha: number
  angle: number
  duration: number
  repeatDelay: number
}

export interface BattleArenaSideFormation {
  anchorY: number
  curveScale: number
  spacingCap: number
  spacingDivisor: number
  shadowWidth: number
  shadowHeight: number
}

export interface BattleArenaRoleStyle {
  scaleMultiplier?: number
  xOffset?: number
  yOffset?: number
  shadowWidthDelta?: number
  shadowHeightDelta?: number
}

export interface BattleArenaLayout {
  ally: BattleArenaSideFormation
  enemy: BattleArenaSideFormation
  actorScale: {
    ally: number
    enemy: number
    boss: number
  }
  lungeOffsetX: number
  lungeOffsetY: number
  roleStyles?: Partial<Record<BattleActorRole, BattleArenaRoleStyle>>
  roleSlotOrder?: Partial<Record<'ally' | 'enemy', Partial<Record<BattleActorRole, number[]>>>>
}

export interface BattleArenaTheme {
  id: string
  name: string
  cameraBackgroundColor: string
  overlays: BattleArenaOverlaySpec[]
  layers: BattleArenaLayerSpec[]
  driftingClouds: BattleArenaDriftLayerSpec[]
  terrace: BattleArenaTerraceSpec
  sigil: BattleArenaSigilSpec
  sweep: BattleArenaSweepSpec
  mobile?: {
    sweepEnabled?: boolean
  }
  layout: BattleArenaLayout
}

const defaultLayout: BattleArenaLayout = {
  ally: {
    anchorY: 0.69,
    curveScale: 0.06,
    spacingCap: 76,
    spacingDivisor: 1,
    shadowWidth: 64,
    shadowHeight: 18
  },
  enemy: {
    anchorY: 0.36,
    curveScale: -0.04,
    spacingCap: 76,
    spacingDivisor: 1,
    shadowWidth: 58,
    shadowHeight: 18
  },
  actorScale: {
    ally: 3.05,
    enemy: 2.9,
    boss: 3.25
  },
  lungeOffsetX: 52,
  lungeOffsetY: 8
}

export const DEFAULT_BATTLE_ARENA_ID = 'misty_forest'

export const BATTLE_ARENA_THEMES: Record<string, BattleArenaTheme> = {
  misty_forest: {
    id: 'misty_forest',
    name: '迷雾森林',
    cameraBackgroundColor: '#dceee8',
    overlays: [
      { xRatio: 0.5, yRatio: 0.18, widthRatio: 1.1, heightRatio: 0.42, color: 0xdff6ee, alpha: 0.18 },
      { xRatio: 0.5, yRatio: 0.82, widthRatio: 1.05, heightRatio: 0.32, color: 0xe8efd8, alpha: 0.1 }
    ],
    layers: [
      { key: 'bg_cloud_base', xRatio: 0.5, yRatio: 0.5, fillScale: 1.02, alpha: 0.94, tint: 0xf8fff8 },
      { key: 'bg_cloud_glow', xRatio: 0.5, yRatio: 0.5, fillScale: 1.02, alpha: 0.22, tint: 0xf0e7a6 },
      { key: 'bg_mountain_far', xRatio: 0.5, yRatio: 0.44, fillScale: 1.02, alpha: 0.78, tint: 0xa9cab0 },
      { key: 'bg_mountain_near', xRatio: 0.5, yRatio: 0.52, fillScale: 1.02, alpha: 0.58, tint: 0x83ae91 }
    ],
    driftingClouds: [
      { key: 'bg_cloud_1', xRatio: 0.22, yRatio: 0.23, fillScale: 1.15, alpha: 0.24, duration: 18000, drift: 32, blendMode: 'screen', tint: 0xffffff },
      { key: 'bg_cloud_2', xRatio: 0.72, yRatio: 0.31, fillScale: 1.12, alpha: 0.2, duration: 21000, drift: -28, blendMode: 'screen', tint: 0xf7fff1 },
      { key: 'bg_cloud_3', xRatio: 0.44, yRatio: 0.48, fillScale: 1.18, alpha: 0.16, duration: 16000, drift: 22, blendMode: 'screen', tint: 0xffffff },
      { key: 'bg_cloud_4', xRatio: 0.82, yRatio: 0.57, fillScale: 1.2, alpha: 0.14, duration: 19000, drift: -18, blendMode: 'screen', tint: 0xf6fffc }
    ],
    terrace: {
      topRatio: 0.52,
      heightRatio: 0.28,
      radius: 26,
      fillColor: 0xf3dfb5,
      fillAlpha: 0.38,
      strokeColor: 0xd0a85a,
      strokeAlpha: 0.16,
      accentColor: 0xb88f4d,
      accentAlpha: 0.12
    },
    sigil: {
      centerYRatio: 0.54,
      outerRadiusRatio: 0.21,
      innerRadiusRatio: 0.12,
      spokeCount: 8,
      primaryColor: 0xd8a944,
      primaryAlpha: 0.18,
      secondaryColor: 0x56b9a8,
      secondaryAlpha: 0.14,
      rotationDuration: 32000,
      pulseDuration: 1600
    },
    sweep: {
      centerYRatio: 0.54,
      widthRatio: 0.72,
      height: 5,
      color: 0xfff0a6,
      alpha: 0.54,
      angle: -5,
      duration: 1400,
      repeatDelay: 1300
    },
    mobile: {
      sweepEnabled: false
    },
    layout: defaultLayout
  },
  dark_cave: {
    id: 'dark_cave',
    name: '幽暗洞穴',
    cameraBackgroundColor: '#d7e6ef',
    overlays: [
      { xRatio: 0.5, yRatio: 0.26, widthRatio: 1.08, heightRatio: 0.5, color: 0xb7d5e2, alpha: 0.22 },
      { xRatio: 0.5, yRatio: 0.84, widthRatio: 1.12, heightRatio: 0.36, color: 0x8ca2a7, alpha: 0.14, blendMode: 'add' }
    ],
    layers: [
      { key: 'bg_cloud_base', xRatio: 0.5, yRatio: 0.5, fillScale: 1.04, alpha: 0.94, tint: 0xcfe1e9 },
      { key: 'bg_cloud_glow', xRatio: 0.5, yRatio: 0.5, fillScale: 1.04, alpha: 0.26, tint: 0x93d0dd },
      { key: 'bg_mountain_far', xRatio: 0.5, yRatio: 0.45, fillScale: 1.04, alpha: 0.88, tint: 0x728f97 },
      { key: 'bg_mountain_near', xRatio: 0.5, yRatio: 0.54, fillScale: 1.06, alpha: 0.82, tint: 0x526975 }
    ],
    driftingClouds: [
      { key: 'bg_cloud_1', xRatio: 0.18, yRatio: 0.25, fillScale: 1.18, alpha: 0.32, duration: 19000, drift: 44, blendMode: 'screen', tint: 0xc5e5ee },
      { key: 'bg_cloud_2', xRatio: 0.7, yRatio: 0.32, fillScale: 1.12, alpha: 0.28, duration: 22000, drift: -38, blendMode: 'screen', tint: 0xb5dae4 },
      { key: 'bg_cloud_3', xRatio: 0.5, yRatio: 0.5, fillScale: 1.14, alpha: 0.24, duration: 17000, drift: 30, blendMode: 'screen', tint: 0xdaf3f7 }
    ],
    terrace: {
      topRatio: 0.54,
      heightRatio: 0.27,
      radius: 22,
      fillColor: 0xd5ddd8,
      fillAlpha: 0.42,
      strokeColor: 0x8ca3aa,
      strokeAlpha: 0.32,
      accentColor: 0x6f8790,
      accentAlpha: 0.26
    },
    sigil: {
      centerYRatio: 0.56,
      outerRadiusRatio: 0.2,
      innerRadiusRatio: 0.1,
      spokeCount: 6,
      primaryColor: 0x93d0dd,
      primaryAlpha: 0.28,
      secondaryColor: 0xe7e3b4,
      secondaryAlpha: 0.18,
      rotationDuration: 36000,
      pulseDuration: 1800
    },
    sweep: {
      centerYRatio: 0.56,
      widthRatio: 0.66,
      height: 4,
      color: 0xb8f2ff,
      alpha: 0.34,
      angle: -8,
      duration: 1600,
      repeatDelay: 1800
    },
    mobile: {
      sweepEnabled: false
    },
    layout: {
      ...defaultLayout,
      ally: { ...defaultLayout.ally, anchorY: 0.7, curveScale: 0.05 },
      enemy: { ...defaultLayout.enemy, anchorY: 0.35, curveScale: -0.035 },
      actorScale: { ally: 3, enemy: 2.85, boss: 3.2 }
    }
  },
  barren_desert: {
    id: 'barren_desert',
    name: '荒芜沙漠',
    cameraBackgroundColor: '#f7ead1',
    overlays: [
      { xRatio: 0.5, yRatio: 0.18, widthRatio: 1.12, heightRatio: 0.44, color: 0xfff0c7, alpha: 0.22 },
      { xRatio: 0.5, yRatio: 0.82, widthRatio: 1.08, heightRatio: 0.34, color: 0xf2c98c, alpha: 0.16 }
    ],
    layers: [
      { key: 'bg_cloud_base', xRatio: 0.5, yRatio: 0.49, fillScale: 1.06, alpha: 0.92, tint: 0xf4dbc2 },
      { key: 'bg_cloud_glow', xRatio: 0.5, yRatio: 0.49, fillScale: 1.06, alpha: 0.28, tint: 0xffd490 },
      { key: 'bg_mountain_far', xRatio: 0.5, yRatio: 0.46, fillScale: 1.04, alpha: 0.82, tint: 0xd6b587 },
      { key: 'bg_mountain_near', xRatio: 0.5, yRatio: 0.55, fillScale: 1.08, alpha: 0.8, tint: 0xb98d5b }
    ],
    driftingClouds: [
      { key: 'bg_cloud_1', xRatio: 0.18, yRatio: 0.24, fillScale: 1.16, alpha: 0.3, duration: 17000, drift: 58, blendMode: 'screen', tint: 0xfff5d8 },
      { key: 'bg_cloud_2', xRatio: 0.76, yRatio: 0.3, fillScale: 1.15, alpha: 0.26, duration: 23000, drift: -52, blendMode: 'screen', tint: 0xffeec3 },
      { key: 'bg_cloud_4', xRatio: 0.58, yRatio: 0.52, fillScale: 1.22, alpha: 0.2, duration: 18000, drift: 36, blendMode: 'screen', tint: 0xfff6e7 }
    ],
    terrace: {
      topRatio: 0.53,
      heightRatio: 0.27,
      radius: 24,
      fillColor: 0xf1d6a7,
      fillAlpha: 0.52,
      strokeColor: 0xd09c55,
      strokeAlpha: 0.3,
      accentColor: 0xc17d31,
      accentAlpha: 0.22
    },
    sigil: {
      centerYRatio: 0.55,
      outerRadiusRatio: 0.22,
      innerRadiusRatio: 0.11,
      spokeCount: 10,
      primaryColor: 0xe7b95d,
      primaryAlpha: 0.32,
      secondaryColor: 0xd9722d,
      secondaryAlpha: 0.2,
      rotationDuration: 28000,
      pulseDuration: 1500
    },
    sweep: {
      centerYRatio: 0.55,
      widthRatio: 0.74,
      height: 6,
      color: 0xffdc93,
      alpha: 0.42,
      angle: -2,
      duration: 1500,
      repeatDelay: 1200
    },
    mobile: {
      sweepEnabled: false
    },
    layout: {
      ...defaultLayout,
      ally: { ...defaultLayout.ally, anchorY: 0.68, curveScale: 0.045 },
      enemy: { ...defaultLayout.enemy, anchorY: 0.37, curveScale: -0.03 }
    }
  },
  frozen_tundra: {
    id: 'frozen_tundra',
    name: '冰封雪原',
    cameraBackgroundColor: '#e7f5ff',
    overlays: [
      { xRatio: 0.5, yRatio: 0.18, widthRatio: 1.1, heightRatio: 0.44, color: 0xf4fbff, alpha: 0.26 },
      { xRatio: 0.5, yRatio: 0.82, widthRatio: 1.08, heightRatio: 0.34, color: 0xbbe5ff, alpha: 0.16 }
    ],
    layers: [
      { key: 'bg_cloud_base', xRatio: 0.5, yRatio: 0.5, fillScale: 1.03, alpha: 0.98, tint: 0xf7fdff },
      { key: 'bg_cloud_glow', xRatio: 0.5, yRatio: 0.5, fillScale: 1.03, alpha: 0.32, tint: 0xdaf2ff },
      { key: 'bg_mountain_far', xRatio: 0.5, yRatio: 0.44, fillScale: 1.03, alpha: 0.88, tint: 0xd0e8f7 },
      { key: 'bg_mountain_near', xRatio: 0.5, yRatio: 0.53, fillScale: 1.06, alpha: 0.82, tint: 0x8ec7ea }
    ],
    driftingClouds: [
      { key: 'bg_cloud_1', xRatio: 0.22, yRatio: 0.2, fillScale: 1.2, alpha: 0.38, duration: 18000, drift: 48, blendMode: 'screen', tint: 0xffffff },
      { key: 'bg_cloud_2', xRatio: 0.74, yRatio: 0.28, fillScale: 1.12, alpha: 0.34, duration: 22000, drift: -42, blendMode: 'screen', tint: 0xf8ffff },
      { key: 'bg_cloud_3', xRatio: 0.48, yRatio: 0.47, fillScale: 1.2, alpha: 0.28, duration: 16000, drift: 26, blendMode: 'screen', tint: 0xecfaff }
    ],
    terrace: {
      topRatio: 0.54,
      heightRatio: 0.26,
      radius: 28,
      fillColor: 0xe1eff7,
      fillAlpha: 0.56,
      strokeColor: 0x8bc3e7,
      strokeAlpha: 0.32,
      accentColor: 0x74a6c9,
      accentAlpha: 0.22
    },
    sigil: {
      centerYRatio: 0.56,
      outerRadiusRatio: 0.2,
      innerRadiusRatio: 0.11,
      spokeCount: 8,
      primaryColor: 0x82c7f4,
      primaryAlpha: 0.32,
      secondaryColor: 0xeefcff,
      secondaryAlpha: 0.26,
      rotationDuration: 34000,
      pulseDuration: 1700
    },
    sweep: {
      centerYRatio: 0.56,
      widthRatio: 0.68,
      height: 5,
      color: 0xe8fbff,
      alpha: 0.44,
      angle: -6,
      duration: 1300,
      repeatDelay: 1500
    },
    mobile: {
      sweepEnabled: false
    },
    layout: {
      ...defaultLayout,
      ally: { ...defaultLayout.ally, anchorY: 0.7, curveScale: 0.05 },
      enemy: { ...defaultLayout.enemy, anchorY: 0.34, curveScale: -0.035 }
    }
  },
  lava_volcano: {
    id: 'lava_volcano',
    name: '熔岩火山',
    cameraBackgroundColor: '#fff1df',
    overlays: [
      { xRatio: 0.5, yRatio: 0.18, widthRatio: 1.08, heightRatio: 0.42, color: 0xffe6bc, alpha: 0.22 },
      { xRatio: 0.5, yRatio: 0.82, widthRatio: 1.12, heightRatio: 0.36, color: 0xff9c4b, alpha: 0.12, blendMode: 'add' }
    ],
    layers: [
      { key: 'bg_cloud_base', xRatio: 0.5, yRatio: 0.48, fillScale: 1.04, alpha: 0.92, tint: 0xffd8b5 },
      { key: 'bg_cloud_glow', xRatio: 0.5, yRatio: 0.48, fillScale: 1.04, alpha: 0.34, tint: 0xffa85c },
      { key: 'bg_mountain_far', xRatio: 0.5, yRatio: 0.44, fillScale: 1.04, alpha: 0.86, tint: 0xcf7b4e },
      { key: 'bg_mountain_near', xRatio: 0.5, yRatio: 0.54, fillScale: 1.08, alpha: 0.84, tint: 0xa44b37 }
    ],
    driftingClouds: [
      { key: 'bg_cloud_1', xRatio: 0.2, yRatio: 0.24, fillScale: 1.18, alpha: 0.28, duration: 16000, drift: 64, blendMode: 'screen', tint: 0xffe0bb },
      { key: 'bg_cloud_2', xRatio: 0.76, yRatio: 0.31, fillScale: 1.14, alpha: 0.25, duration: 19000, drift: -58, blendMode: 'screen', tint: 0xffcf9c },
      { key: 'bg_cloud_4', xRatio: 0.54, yRatio: 0.55, fillScale: 1.22, alpha: 0.18, duration: 15000, drift: 28, blendMode: 'screen', tint: 0xfff1dd }
    ],
    terrace: {
      topRatio: 0.53,
      heightRatio: 0.28,
      radius: 22,
      fillColor: 0xf2c89b,
      fillAlpha: 0.48,
      strokeColor: 0xd2693d,
      strokeAlpha: 0.3,
      accentColor: 0xad482e,
      accentAlpha: 0.24
    },
    sigil: {
      centerYRatio: 0.55,
      outerRadiusRatio: 0.22,
      innerRadiusRatio: 0.12,
      spokeCount: 8,
      primaryColor: 0xff8c4d,
      primaryAlpha: 0.34,
      secondaryColor: 0xffd27c,
      secondaryAlpha: 0.22,
      rotationDuration: 26000,
      pulseDuration: 1400
    },
    sweep: {
      centerYRatio: 0.55,
      widthRatio: 0.76,
      height: 6,
      color: 0xffbc5e,
      alpha: 0.52,
      angle: -4,
      duration: 1200,
      repeatDelay: 900
    },
    mobile: {
      sweepEnabled: false
    },
    layout: {
      ...defaultLayout,
      actorScale: { ally: 3.08, enemy: 2.95, boss: 3.28 }
    }
  },
  immortal_ruins: {
    id: 'immortal_ruins',
    name: '仙界遗迹',
    cameraBackgroundColor: '#f8f3ff',
    overlays: [
      { xRatio: 0.5, yRatio: 0.16, widthRatio: 1.08, heightRatio: 0.44, color: 0xf7f0ff, alpha: 0.26 },
      { xRatio: 0.5, yRatio: 0.82, widthRatio: 1.1, heightRatio: 0.34, color: 0xf0d8a5, alpha: 0.12 }
    ],
    layers: [
      { key: 'bg_cloud_base', xRatio: 0.5, yRatio: 0.49, fillScale: 1.03, alpha: 0.96, tint: 0xfaf6ff },
      { key: 'bg_cloud_glow', xRatio: 0.5, yRatio: 0.49, fillScale: 1.03, alpha: 0.32, tint: 0xf4dc9b },
      { key: 'bg_mountain_far', xRatio: 0.5, yRatio: 0.44, fillScale: 1.03, alpha: 0.84, tint: 0xd6c4ec },
      { key: 'bg_mountain_near', xRatio: 0.5, yRatio: 0.53, fillScale: 1.06, alpha: 0.82, tint: 0xb59ad6 }
    ],
    driftingClouds: [
      { key: 'bg_cloud_1', xRatio: 0.24, yRatio: 0.21, fillScale: 1.16, alpha: 0.34, duration: 17000, drift: 46, blendMode: 'screen', tint: 0xffffff },
      { key: 'bg_cloud_2', xRatio: 0.72, yRatio: 0.29, fillScale: 1.14, alpha: 0.28, duration: 21000, drift: -44, blendMode: 'screen', tint: 0xfffbf1 },
      { key: 'bg_cloud_3', xRatio: 0.48, yRatio: 0.48, fillScale: 1.2, alpha: 0.24, duration: 15000, drift: 22, blendMode: 'screen', tint: 0xfcf5ff }
    ],
    terrace: {
      topRatio: 0.53,
      heightRatio: 0.28,
      radius: 28,
      fillColor: 0xf1e5cf,
      fillAlpha: 0.54,
      strokeColor: 0xc9ab6f,
      strokeAlpha: 0.32,
      accentColor: 0xa68ed5,
      accentAlpha: 0.2
    },
    sigil: {
      centerYRatio: 0.55,
      outerRadiusRatio: 0.21,
      innerRadiusRatio: 0.11,
      spokeCount: 12,
      primaryColor: 0xe0c16e,
      primaryAlpha: 0.32,
      secondaryColor: 0xa990db,
      secondaryAlpha: 0.22,
      rotationDuration: 30000,
      pulseDuration: 1800
    },
    sweep: {
      centerYRatio: 0.55,
      widthRatio: 0.72,
      height: 5,
      color: 0xfff1ba,
      alpha: 0.48,
      angle: -5,
      duration: 1400,
      repeatDelay: 1400
    },
    mobile: {
      sweepEnabled: false
    },
    layout: {
      ...defaultLayout,
      ally: { ...defaultLayout.ally, anchorY: 0.685, curveScale: 0.05 },
      enemy: { ...defaultLayout.enemy, anchorY: 0.355, curveScale: -0.032 }
    }
  },
  abyss_depths: {
    id: 'abyss_depths',
    name: '深渊之底',
    cameraBackgroundColor: '#e9e4f7',
    overlays: [
      { xRatio: 0.5, yRatio: 0.18, widthRatio: 1.12, heightRatio: 0.46, color: 0xded8f1, alpha: 0.2 },
      { xRatio: 0.5, yRatio: 0.82, widthRatio: 1.1, heightRatio: 0.38, color: 0x6d59a8, alpha: 0.12, blendMode: 'add' }
    ],
    layers: [
      { key: 'bg_cloud_base', xRatio: 0.5, yRatio: 0.5, fillScale: 1.06, alpha: 0.88, tint: 0xd1c7ec },
      { key: 'bg_cloud_glow', xRatio: 0.5, yRatio: 0.5, fillScale: 1.06, alpha: 0.28, tint: 0xa690df },
      { key: 'bg_mountain_far', xRatio: 0.5, yRatio: 0.45, fillScale: 1.05, alpha: 0.84, tint: 0x6d5a96 },
      { key: 'bg_mountain_near', xRatio: 0.5, yRatio: 0.56, fillScale: 1.08, alpha: 0.86, tint: 0x44386f }
    ],
    driftingClouds: [
      { key: 'bg_cloud_1', xRatio: 0.16, yRatio: 0.24, fillScale: 1.18, alpha: 0.26, duration: 22000, drift: 42, blendMode: 'screen', tint: 0xd9d2f6 },
      { key: 'bg_cloud_2', xRatio: 0.8, yRatio: 0.33, fillScale: 1.16, alpha: 0.22, duration: 24000, drift: -36, blendMode: 'screen', tint: 0xc7c0ef },
      { key: 'bg_cloud_4', xRatio: 0.54, yRatio: 0.56, fillScale: 1.24, alpha: 0.18, duration: 20000, drift: 26, blendMode: 'screen', tint: 0xe5ddff }
    ],
    terrace: {
      topRatio: 0.54,
      heightRatio: 0.29,
      radius: 24,
      fillColor: 0xd8d0ea,
      fillAlpha: 0.42,
      strokeColor: 0x8570b5,
      strokeAlpha: 0.34,
      accentColor: 0x5a4a92,
      accentAlpha: 0.26
    },
    sigil: {
      centerYRatio: 0.56,
      outerRadiusRatio: 0.23,
      innerRadiusRatio: 0.12,
      spokeCount: 10,
      primaryColor: 0x8f74d8,
      primaryAlpha: 0.34,
      secondaryColor: 0xf0d89d,
      secondaryAlpha: 0.18,
      rotationDuration: 24000,
      pulseDuration: 1500
    },
    sweep: {
      centerYRatio: 0.56,
      widthRatio: 0.74,
      height: 5,
      color: 0xc9afff,
      alpha: 0.34,
      angle: -8,
      duration: 1500,
      repeatDelay: 1600
    },
    layout: {
      ...defaultLayout,
      ally: { ...defaultLayout.ally, anchorY: 0.7, curveScale: 0.055 },
      enemy: { ...defaultLayout.enemy, anchorY: 0.34, curveScale: -0.038 },
      actorScale: { ally: 3.08, enemy: 2.92, boss: 3.32 }
    }
  }
}

const areaArenaMap: Record<string, string> = {
  misty_forest: 'misty_forest',
  dark_cave: 'dark_cave',
  barren_desert: 'barren_desert',
  frozen_tundra: 'frozen_tundra',
  lava_volcano: 'lava_volcano',
  immortal_ruins: 'immortal_ruins',
  abyss_depths: 'abyss_depths'
}

const difficultyFallbackMap: Record<AreaDifficulty, string> = {
  easy: 'misty_forest',
  normal: 'barren_desert',
  hard: 'frozen_tundra',
  nightmare: 'immortal_ruins',
  extreme: 'abyss_depths'
}

export function getBattleArenaIdForArea(areaId?: string | null, difficulty?: AreaDifficulty | null): string {
  if (areaId && areaArenaMap[areaId]) return areaArenaMap[areaId]
  if (difficulty && difficultyFallbackMap[difficulty]) return difficultyFallbackMap[difficulty]
  return DEFAULT_BATTLE_ARENA_ID
}

export function getBattleArenaTheme(arenaId?: string | null): BattleArenaTheme {
  const fallbackTheme = BATTLE_ARENA_THEMES[DEFAULT_BATTLE_ARENA_ID]
  if (!fallbackTheme) {
    throw new Error(`Missing default battle arena theme: ${DEFAULT_BATTLE_ARENA_ID}`)
  }
  const arenaTheme = arenaId ? BATTLE_ARENA_THEMES[arenaId] : undefined
  return arenaTheme || fallbackTheme
}
