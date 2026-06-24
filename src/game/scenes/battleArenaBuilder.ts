import Phaser from 'phaser'
import type {
  BattleArenaDriftLayerSpec,
  BattleArenaLayerSpec,
  BattleArenaOverlaySpec,
  BattleArenaTheme
} from '@/game/battle/config/arenas'

function resolveBlendMode(blendMode?: 'normal' | 'add' | 'screen') {
  if (blendMode === 'add') return Phaser.BlendModes.ADD
  if (blendMode === 'screen') return Phaser.BlendModes.SCREEN
  return Phaser.BlendModes.NORMAL
}

function addOverlay(scene: Phaser.Scene, arena: Phaser.GameObjects.Container, overlay: BattleArenaOverlaySpec) {
  const { width, height } = scene.scale
  const node = scene.add.rectangle(
    width * overlay.xRatio,
    height * overlay.yRatio,
    width * overlay.widthRatio,
    height * overlay.heightRatio,
    overlay.color,
    overlay.alpha
  ).setBlendMode(resolveBlendMode(overlay.blendMode))
  arena.add(node)
}

function addBackgroundLayer(scene: Phaser.Scene, arena: Phaser.GameObjects.Container, layerSpec: BattleArenaLayerSpec) {
  const { width, height } = scene.scale
  const node = scene.add.image(width * layerSpec.xRatio, height * layerSpec.yRatio, layerSpec.key)
    .setOrigin(0.5)
    .setAlpha(layerSpec.alpha)
    .setScale(Math.max(width / 270, height / 170) * layerSpec.fillScale)
    .setBlendMode(resolveBlendMode(layerSpec.blendMode))

  if (layerSpec.tint) {
    node.setTint(layerSpec.tint)
  }

  arena.add(node)
  return node
}

function addDriftingCloud(scene: Phaser.Scene, arena: Phaser.GameObjects.Container, cloudSpec: BattleArenaDriftLayerSpec) {
  const cloud = addBackgroundLayer(scene, arena, cloudSpec)
  scene.tweens.add({
    targets: cloud,
    x: cloud.x + cloudSpec.drift,
    duration: cloudSpec.duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })
}

function createBattleTerrace(scene: Phaser.Scene, arena: Phaser.GameObjects.Container, theme: BattleArenaTheme) {
  const { width, height } = scene.scale
  const isMobile = width <= 720
  const terrace = scene.add.graphics()
  const top = height * theme.terrace.topRatio
  terrace.fillStyle(theme.terrace.fillColor, theme.terrace.fillAlpha)
  terrace.fillRoundedRect(width * 0.08, top, width * 0.84, height * theme.terrace.heightRatio, theme.terrace.radius)
  terrace.lineStyle(2, theme.terrace.strokeColor, theme.terrace.strokeAlpha)
  terrace.strokeRoundedRect(width * 0.08, top, width * 0.84, height * theme.terrace.heightRatio, theme.terrace.radius)
  terrace.lineStyle(1, theme.terrace.accentColor, isMobile ? theme.terrace.accentAlpha * 0.05 : theme.terrace.accentAlpha * 0.22)
  const stripeCount = isMobile ? 0 : 2
  const stripeGap = isMobile ? 52 : 38
  for (let index = 0; index < stripeCount; index++) {
    const y = top + 20 + index * stripeGap
    terrace.beginPath()
    terrace.moveTo(width * 0.15, y)
    terrace.lineTo(width * 0.85, y + Math.sin(index) * 2)
    terrace.strokePath()
  }
  arena.add(terrace)
}

function createBattleSigil(scene: Phaser.Scene, arena: Phaser.GameObjects.Container, theme: BattleArenaTheme) {
  const { width, height } = scene.scale
  const isMobile = width <= 720
  const centerY = height * theme.sigil.centerYRatio
  const sigil = scene.add.graphics()
  sigil.lineStyle(isMobile ? 1 : 2, theme.sigil.primaryColor, isMobile ? theme.sigil.primaryAlpha * 0.08 : theme.sigil.primaryAlpha * 0.46)
  sigil.strokeCircle(width / 2, centerY, Math.min(width, height) * theme.sigil.outerRadiusRatio)
  sigil.strokeCircle(width / 2, centerY, Math.min(width, height) * theme.sigil.innerRadiusRatio)
  sigil.lineStyle(1, theme.sigil.secondaryColor, isMobile ? theme.sigil.secondaryAlpha * 0.06 : theme.sigil.secondaryAlpha * 0.3)
  const spokeCount = isMobile ? Math.max(3, Math.floor(theme.sigil.spokeCount / 2)) : Math.max(4, Math.floor(theme.sigil.spokeCount * 0.75))
  for (let index = 0; index < spokeCount; index++) {
    const angle = index * Math.PI * 2 / spokeCount
    const radius = Math.min(width, height) * (theme.sigil.outerRadiusRatio + 0.01)
    sigil.beginPath()
    sigil.moveTo(width / 2, centerY)
    sigil.lineTo(width / 2 + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius)
    sigil.strokePath()
  }
  if (!isMobile) {
    scene.tweens.add({
      targets: sigil,
      alpha: { from: 0.18, to: 0.34 },
      duration: Math.max(2400, theme.sigil.pulseDuration * 2),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  } else {
    sigil.setAlpha(0.08)
  }
  arena.add(sigil)
}

export function buildBattleArena(scene: Phaser.Scene, theme: BattleArenaTheme) {
  const arena = scene.add.container(0, 0).setDepth(0)

  for (const overlay of theme.overlays) {
    addOverlay(scene, arena, overlay)
  }

  for (const layer of theme.layers) {
    addBackgroundLayer(scene, arena, layer)
  }

  for (const cloud of theme.driftingClouds) {
    addDriftingCloud(scene, arena, cloud)
  }

  createBattleTerrace(scene, arena, theme)
  createBattleSigil(scene, arena, theme)

  return arena
}
