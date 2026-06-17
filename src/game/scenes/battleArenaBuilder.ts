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
  const terrace = scene.add.graphics()
  const top = height * theme.terrace.topRatio
  terrace.fillStyle(theme.terrace.fillColor, theme.terrace.fillAlpha)
  terrace.fillRoundedRect(width * 0.08, top, width * 0.84, height * theme.terrace.heightRatio, theme.terrace.radius)
  terrace.lineStyle(2, theme.terrace.strokeColor, theme.terrace.strokeAlpha)
  terrace.strokeRoundedRect(width * 0.08, top, width * 0.84, height * theme.terrace.heightRatio, theme.terrace.radius)
  terrace.lineStyle(1, theme.terrace.accentColor, theme.terrace.accentAlpha)
  for (let index = 0; index < 7; index++) {
    const y = top + 18 + index * 30
    terrace.beginPath()
    terrace.moveTo(width * 0.11, y)
    terrace.lineTo(width * 0.89, y + Math.sin(index) * 8)
    terrace.strokePath()
  }
  arena.add(terrace)
}

function createBattleSigil(scene: Phaser.Scene, arena: Phaser.GameObjects.Container, theme: BattleArenaTheme) {
  const { width, height } = scene.scale
  const centerY = height * theme.sigil.centerYRatio
  const sigil = scene.add.graphics()
  sigil.lineStyle(3, theme.sigil.primaryColor, theme.sigil.primaryAlpha)
  sigil.strokeCircle(width / 2, centerY, Math.min(width, height) * theme.sigil.outerRadiusRatio)
  sigil.strokeCircle(width / 2, centerY, Math.min(width, height) * theme.sigil.innerRadiusRatio)
  sigil.lineStyle(1, theme.sigil.secondaryColor, theme.sigil.secondaryAlpha)
  for (let index = 0; index < theme.sigil.spokeCount; index++) {
    const angle = index * Math.PI * 2 / theme.sigil.spokeCount
    const radius = Math.min(width, height) * (theme.sigil.outerRadiusRatio + 0.01)
    sigil.beginPath()
    sigil.moveTo(width / 2, centerY)
    sigil.lineTo(width / 2 + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius)
    sigil.strokePath()
  }
  scene.tweens.add({ targets: sigil, angle: 360, duration: theme.sigil.rotationDuration, repeat: -1 })
  scene.tweens.add({
    targets: sigil,
    alpha: { from: 0.32, to: 0.82 },
    scale: { from: 0.94, to: 1.04 },
    duration: theme.sigil.pulseDuration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  })
  arena.add(sigil)
}

function createSweep(scene: Phaser.Scene, arena: Phaser.GameObjects.Container, theme: BattleArenaTheme) {
  const { width, height } = scene.scale
  const sweep = scene.add.rectangle(
    width * 0.5,
    height * theme.sweep.centerYRatio,
    width * theme.sweep.widthRatio,
    theme.sweep.height,
    theme.sweep.color,
    theme.sweep.alpha
  )
    .setBlendMode(Phaser.BlendModes.ADD)
    .setAngle(theme.sweep.angle)

  scene.tweens.add({
    targets: sweep,
    x: { from: width * 0.16, to: width * 0.84 },
    alpha: { from: 0, to: Math.min(1, theme.sweep.alpha + 0.2) },
    duration: theme.sweep.duration,
    yoyo: true,
    repeat: -1,
    repeatDelay: theme.sweep.repeatDelay,
    ease: 'Sine.easeInOut'
  })

  arena.add(sweep)
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
  createSweep(scene, arena, theme)

  return arena
}
