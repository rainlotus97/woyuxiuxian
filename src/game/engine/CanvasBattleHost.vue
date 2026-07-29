<template>
  <div ref="hostEl" class="canvas-battle-host">
    <canvas ref="canvasEl" aria-label="圆形头像战斗演出"></canvas>
    <div class="canvas-battle-caption" aria-live="polite">{{ actionCaption }}</div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { BattleRuntimeSnapshot, BattleRuntimeUnit } from '@/game/battle/runtimeTypes'
import type { WorldWeather } from '@/types/world'
import { getEffectForElement } from '@/game/battle/battleEffectsConfig'
import { resolveBattleBossPhase } from '@/game/battle/battleReplay'
import { resolveCommandTargetGroups } from '@/game/battle/targeting'
import { resolveGeneratedGameIconSource } from '@/game/theme/generatedIconAssets'
import { getSkillById } from '@/types/skill'
import {
  gameEvents,
  getActiveBattleInstanceId,
  markBattleRendererReady,
  type BattleRenderCommand,
  type BattleRenderHit
} from './gameEvents'
import { createBattleVfxCommand, type BattleVfxCommand } from './battleVfx'
import mountainFar from '@/assets/battle/backgrounds/BackgroundMountain_01.png'
import mountainNear from '@/assets/battle/backgrounds/BackgroundMuntain02.png'
import mountainBase from '@/assets/battle/backgrounds/Background01.png'
import cloudOne from '@/assets/battle/backgrounds/Cloud01.png'
import cloudTwo from '@/assets/battle/backgrounds/Cloud02.png'
import cloudThree from '@/assets/battle/backgrounds/Cloud03.png'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  shape: 'dot' | 'spark' | 'shard' | 'ring' | 'trail' | 'flare'
  rotation: number
  spin: number
  gravity: number
}

interface FloatingText {
  x: number
  y: number
  value: string
  label?: string
  color: string
  life: number
  maxLife: number
  size: number
}

interface Shockwave {
  x: number
  y: number
  life: number
  maxLife: number
  color: string
  radius: number
  width: number
}

interface ImpactBurst {
  vfx: BattleVfxCommand
  x: number
  y: number
  life: number
  maxLife: number
  color: string
  critical: boolean
  heal: boolean
}

interface StatusPulse {
  vfx: BattleVfxCommand
  x: number
  y: number
  life: number
  maxLife: number
  color: string
}

interface DefeatBurst {
  vfx: BattleVfxCommand
  x: number
  y: number
  life: number
  maxLife: number
  color: string
  outcome: 'defeat' | 'retreat'
}

interface UnitVisualState {
  isAlive: boolean
  side: BattleRuntimeUnit['side']
  type: BattleRuntimeUnit['type']
  statusEffects: BattleRuntimeUnit['statusEffects']
}

interface CommandTargetGroup {
  targetIds: string[]
  effect: ReturnType<typeof getEffectForElement>
}

interface ActiveCommand {
  command: BattleRenderCommand
  startedAt: number
  effect: ReturnType<typeof getEffectForElement>
  groups: CommandTargetGroup[]
  vfx: BattleVfxCommand
}

interface BackgroundLayer {
  src: string
  y: number
  scale: number
  alpha: number
  drift: number
  speed: number
}

const props = defineProps<{
  selectedTargetId: string | null
  areaName?: string | null
  weather?: WorldWeather
}>()

const hostEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const snapshot = ref<BattleRuntimeSnapshot | null>(null)
const actionCaption = ref('灵气在阵中流转')
const particles: Particle[] = []
const floatingTexts: FloatingText[] = []
const shockwaves: Shockwave[] = []
const impactBursts: ImpactBurst[] = []
const statusPulses: StatusPulse[] = []
const defeatBursts: DefeatBurst[] = []
const commands: ActiveCommand[] = []
const imageCache = new Map<string, HTMLImageElement>()
const targetEffectById = new Map<string, string[]>()
const previousUnitVisuals = new Map<string, UnitVisualState>()
const processedReplayEventIds = new Set<string>()

let battleInstanceId: string | null = null
let resizeObserver: ResizeObserver | null = null
let frameId = 0
let width = 390
let height = 520
let disposed = false
let lastFrame = 0
let shakeUntil = 0
let shakeStrength = 0
let hitFlashUntil = 0
let hitFlashColor = '#f8e5b2'
let ambientClock = 0
let reduceMotion = false
let hasSnapshotVisualState = false
let previousBattleResult: BattleRuntimeSnapshot['result'] = null
const cleanupListeners: Array<() => void> = []

const portraitModules = import.meta.glob('@/assets/story/characters/portraits-9x16/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const backgroundLayers: BackgroundLayer[] = [
  { src: mountainFar, y: 0.39, scale: 1.02, alpha: 0.24, drift: 0, speed: 0 },
  { src: mountainNear, y: 0.46, scale: 1.1, alpha: 0.32, drift: 10, speed: 0.00008 },
  { src: mountainBase, y: 0.56, scale: 1.18, alpha: 0.2, drift: -16, speed: 0.00006 },
  { src: cloudOne, y: 0.16, scale: 1.22, alpha: 0.12, drift: 32, speed: 0.00011 },
  { src: cloudTwo, y: 0.28, scale: 1.12, alpha: 0.1, drift: -25, speed: 0.00009 },
  { src: cloudThree, y: 0.44, scale: 1.24, alpha: 0.08, drift: 20, speed: 0.00007 }
]

const portraitByName: Record<string, string> = {
  洛衍之: findPortrait('luo-yanzhi-main-9x16-v1.png'),
  顾长惜: findPortrait('gu-changxi-adult-9x16-v1.png'),
  江溯: findPortrait('jiangsu-redesign-9x16-v3.png'),
  九幽子: findPortrait('jiuyouzi-redesign-9x16-v2.png'),
  谢不语: findPortrait('xiebuyu-redesign-9x16-v2.png')
}

function findPortrait(filename: string) {
  return Object.entries(portraitModules).find(([path]) => path.endsWith(filename))?.[1] ?? ''
}

function getImage(src: string) {
  if (!src) return null
  const cached = imageCache.get(src)
  if (cached) return cached
  const image = new Image()
  image.src = src
  imageCache.set(src, image)
  return image
}

function isCurrent(instanceId: string) {
  return Boolean(battleInstanceId && instanceId === battleInstanceId)
}

function resize() {
  const canvas = canvasEl.value
  const host = hostEl.value
  if (!canvas || !host) return
  const rect = host.getBoundingClientRect()
  width = Math.max(320, Math.floor(rect.width))
  height = Math.max(420, Math.floor(rect.height))
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
}

function cleanName(name: string) {
  return name.replace('[BOSS]', '').replace('[精英]', '').trim()
}

function getUnitPortrait(unit: BattleRuntimeUnit) {
  if (unit.type === 'protagonist') return unit.avatarUrl || portraitByName.洛衍之
  const knownPortrait = Object.entries(portraitByName).find(([name]) => unit.name.includes(name))?.[1]
  return knownPortrait || unit.avatarUrl || ''
}

function getUnitIconSource(unit: BattleRuntimeUnit) {
  if (unit.side === 'enemy') {
    return resolveGeneratedGameIconSource(unit.battleRole === 'elite' ? 'mission' : 'skull')
  }
  if (unit.type === 'pet') return resolveGeneratedGameIconSource('beast')
  if (unit.type === 'summon') return resolveGeneratedGameIconSource('spark')
  if (unit.type === 'companion') return resolveGeneratedGameIconSource('companion')
  return resolveGeneratedGameIconSource('sword')
}

function unitPoint(unit: BattleRuntimeUnit) {
  const sameSide = snapshot.value?.units.filter(item => item.side === unit.side) ?? []
  const position = Math.max(0, sameSide.findIndex(item => item.id === unit.id))
  const total = Math.max(1, sameSide.length)
  const compactLandscape = width > 800 && height <= 560
  const radius = compactLandscape
    ? Math.min(46, Math.max(36, width * 0.06))
    : width > 1100
      ? 82
      : Math.min(70, Math.max(44, width * 0.112))
  const preferredSpacing = compactLandscape
    ? Math.min(width * 0.2, 112)
    : width > 1100
      ? Math.min(width * 0.18, 220)
      : Math.min(width * 0.27, 124)
  const fittedSpacing = total > 1 ? (width - radius * 2 - 22) / (total - 1) : preferredSpacing
  const spacing = Math.min(preferredSpacing, Math.max(38, fittedSpacing))
  const x = width * 0.5 + (position - (total - 1) / 2) * spacing
  const laneRatios = getBattleLaneRatios()
  const y = height * (unit.side === 'ally' ? laneRatios.ally : laneRatios.enemy)
  return { x, y, radius }
}

function getBattleLaneRatios() {
  const compactLandscape = width > 800 && height <= 560
  const selecting = Boolean(snapshot.value?.currentActorId && snapshot.value.phase === 'selecting')
  if (compactLandscape) {
    return { enemy: 0.15, ally: 0.38 }
  }
  return {
    enemy: width <= 800 ? 0.26 : 0.29,
    ally: width <= 800
      ? (selecting ? 0.60 : height <= 700 ? 0.59 : 0.61)
      : (selecting ? 0.61 : 0.68)
  }
}

function getTargetGroupsForCommand(command: BattleRenderCommand): CommandTargetGroup[] {
  const actor = snapshot.value?.units.find(unit => unit.id === command.actorId)
  const units = snapshot.value?.units
  if (!actor || !units) return []
  const skill = command.skillId ? getSkillById(command.skillId) ?? null : null
  return resolveCommandTargetGroups(command, actor, units, skill).map((group, index) => ({
    targetIds: group.targetIds,
    effect: resolveEffect(command, skill?.effects[index])
  }))
}

function effectColor(effect: string) {
  const colors: Record<string, string> = {
    fire: '#f08b57',
    thunder: '#c99cff',
    wind: '#75dbc1',
    ice: '#8bd5f4',
    water: '#5cbce8',
    wood: '#8ed77c',
    earth: '#d4a36a',
    heal: '#f5df87',
    slash: '#f2c96e',
    hit: '#f08476',
    void_magic: '#d6a3fa'
  }
  return colors[effect] ?? '#a7ded0'
}

function drawBackgroundImage(ctx: CanvasRenderingContext2D, layer: BackgroundLayer, now: number) {
  const image = getImage(layer.src)
  if (!image || !image.complete || !image.naturalWidth) return
  const scale = Math.max(width / image.naturalWidth, 1) * layer.scale
  const imageWidth = image.naturalWidth * scale
  const imageHeight = image.naturalHeight * scale
  const drift = layer.drift * Math.sin(now * layer.speed)
  const x = (width - imageWidth) / 2 + drift
  const y = height * layer.y - imageHeight * 0.5
  ctx.save()
  ctx.globalAlpha = layer.alpha
  ctx.globalCompositeOperation = 'screen'
  ctx.drawImage(image, x, y, imageWidth, imageHeight)
  ctx.restore()
}

function drawBackground(ctx: CanvasRenderingContext2D, now: number) {
  const palette = resolveBattlePalette()
  const sky = ctx.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, palette.top)
  sky.addColorStop(0.38, palette.mid)
  sky.addColorStop(0.7, palette.low)
  sky.addColorStop(1, palette.ground)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, height)

  const arenaCoreY = height * (width > 800 && height <= 560 ? 0.3 : 0.47)
  const glow = ctx.createRadialGradient(width * 0.5, arenaCoreY, 0, width * 0.5, arenaCoreY, Math.max(width, height) * 0.62)
  glow.addColorStop(0, `${palette.glow}2e`)
  glow.addColorStop(0.5, `${palette.glow}12`)
  glow.addColorStop(1, 'rgba(4, 12, 20, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  for (let index = 0; index < 46; index += 1) {
    const x = ((index * 83) % 997) / 997 * width
    const y = (((index * 137) % 997) / 997) * height * 0.58
    const pulse = 0.18 + (Math.sin(now * 0.0014 + index) + 1) * 0.16
    ctx.fillStyle = `rgba(198, 233, 218, ${pulse.toFixed(3)})`
    ctx.fillRect(x, y, index % 4 === 0 ? 2 : 1, index % 4 === 0 ? 2 : 1)
  }

  backgroundLayers.forEach(layer => drawBackgroundImage(ctx, layer, now))

  const laneRatios = getBattleLaneRatios()
  const enemyLaneY = height * laneRatios.enemy
  const allyLaneY = height * laneRatios.ally
  drawLaneGlow(ctx, enemyLaneY, '#f08476', 0.2)
  drawLaneGlow(ctx, allyLaneY, '#70d5bd', 0.18)
  drawArenaLane(ctx, enemyLaneY, '#f08476', now, false)
  drawArenaLane(ctx, allyLaneY, '#70d5bd', now, true)
  drawBattleSpine(ctx, now)

  const ground = ctx.createLinearGradient(0, height * 0.5, 0, height)
  ground.addColorStop(0, 'rgba(8, 31, 38, 0)')
  ground.addColorStop(1, 'rgba(3, 12, 19, 0.72)')
  ctx.fillStyle = ground
  ctx.fillRect(0, height * 0.42, width, height * 0.58)

  drawBattleSigil(ctx, now)
  drawBattleConstellation(ctx, now)
  drawBattleThreads(ctx, now)
  drawWeatherOverlay(ctx, now)
}

interface BattlePalette {
  top: string
  mid: string
  low: string
  ground: string
  glow: string
}

function resolveBattlePalette(): BattlePalette {
  const area = props.areaName ?? ''
  if (area.includes('湖') || area.includes('碧水') || area.includes('水')) {
    return { top: '#d7eff0', mid: '#a6d5d0', low: '#77aaa5', ground: '#466f73', glow: '#f1d48c' }
  }
  if (area.includes('火') || area.includes('烈焰') || area.includes('熔')) {
    return { top: '#f3d7ba', mid: '#c98e6d', low: '#8d5b52', ground: '#4e3c42', glow: '#f3c56f' }
  }
  if (area.includes('雷') || area.includes('平原')) {
    return { top: '#d8e2e6', mid: '#9fb6bf', low: '#627f88', ground: '#374d5d', glow: '#d8cbf0' }
  }
  if (area.includes('洞') || area.includes('渊') || area.includes('魔')) {
    return { top: '#98a7ae', mid: '#66757d', low: '#3f515b', ground: '#29343e', glow: '#a5d7cf' }
  }
  return { top: '#c9e4dc', mid: '#8eb9ae', low: '#5f8e83', ground: '#385d5d', glow: '#f2d998' }
}

function drawWeatherOverlay(ctx: CanvasRenderingContext2D, now: number) {
  const weather = props.weather ?? 'clear'
  if (weather === 'rain' || weather === 'storm' || weather === 'flood') {
    ctx.save()
    ctx.globalAlpha = weather === 'storm' ? 0.34 : 0.18
    ctx.strokeStyle = '#d8f2ef'
    ctx.lineWidth = 1
    for (let index = 0; index < 34; index += 1) {
      const x = ((index * 67 + now * 0.05) % (width + 60)) - 30
      const y = ((index * 43 + now * 0.11) % (height + 30)) - 20
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 5, y + (weather === 'storm' ? 20 : 13))
      ctx.stroke()
    }
    ctx.restore()
  }
  if (weather === 'mist') {
    const mist = ctx.createLinearGradient(0, height * 0.25, 0, height * 0.72)
    mist.addColorStop(0, 'rgba(235, 249, 243, 0)')
    mist.addColorStop(0.5, 'rgba(235, 249, 243, 0.18)')
    mist.addColorStop(1, 'rgba(235, 249, 243, 0)')
    ctx.fillStyle = mist
    ctx.fillRect(0, height * 0.18, width, height * 0.64)
  }
}

function drawLaneGlow(ctx: CanvasRenderingContext2D, y: number, color: string, alpha: number) {
  const glow = ctx.createRadialGradient(width * 0.5, y, 0, width * 0.5, y, Math.max(width * 0.62, 180))
  glow.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`)
  glow.addColorStop(0.48, `${color}${Math.round(alpha * 0.35 * 255).toString(16).padStart(2, '0')}`)
  glow.addColorStop(1, `${color}00`)
  ctx.fillStyle = glow
  ctx.fillRect(0, y - 100, width, 200)
}

function drawArenaLane(ctx: CanvasRenderingContext2D, y: number, color: string, now: number, reverse: boolean) {
  const drift = (Math.sin(now * 0.0012) * 6) * (reverse ? -1 : 1)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.42
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 12
  ctx.lineWidth = 1
  ctx.setLineDash([2, 12])
  ctx.lineDashOffset = reverse ? now * 0.014 : -now * 0.014
  ctx.beginPath()
  ctx.moveTo(width * 0.1 + drift, y)
  ctx.lineTo(width * 0.9 + drift, y)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 0.24
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(width * 0.5, y, Math.min(width * 0.33, 132), Math.PI * 0.08, Math.PI * 0.92)
  ctx.stroke()
  for (let index = 0; index < 5; index += 1) {
    const x = width * (0.18 + index * 0.16) + drift * 0.35
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, index === 2 ? 2.3 : 1.1, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawBattleSpine(ctx: CanvasRenderingContext2D, now: number) {
  const centerX = width * 0.5
  const top = height * 0.31
  const bottom = height * 0.59
  const pulse = 0.36 + (Math.sin(now * 0.002) + 1) * 0.1
  const gradient = ctx.createLinearGradient(centerX, top, centerX, bottom)
  gradient.addColorStop(0, `rgba(240, 132, 118, ${pulse * 0.65})`)
  gradient.addColorStop(0.5, `rgba(228, 184, 102, ${pulse})`)
  gradient.addColorStop(1, `rgba(112, 213, 189, ${pulse * 0.65})`)
  ctx.save()
  ctx.strokeStyle = gradient
  ctx.lineWidth = 1.5
  ctx.setLineDash([2, 9])
  ctx.beginPath()
  ctx.moveTo(centerX, top)
  ctx.lineTo(centerX, bottom)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 0.42 + pulse
  ctx.fillStyle = '#e4b866'
  ctx.beginPath()
  ctx.arc(centerX, (top + bottom) * 0.5, 3 + pulse * 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawBattleSigil(ctx: CanvasRenderingContext2D, now: number) {
  const centerX = width * 0.5
  const centerY = height * (width > 800 && height <= 560 ? 0.3 : 0.47)
  const outer = Math.min(width * 0.42, height * 0.2)
  const inner = outer * 0.56
  const pulse = 0.88 + Math.sin(now * 0.0017) * 0.14

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outer * 1.18)
  coreGlow.addColorStop(0, `rgba(228, 184, 102, ${0.22 * pulse})`)
  coreGlow.addColorStop(0.28, `rgba(112, 213, 189, ${0.14 * pulse})`)
  coreGlow.addColorStop(0.72, 'rgba(40, 128, 126, 0.025)')
  coreGlow.addColorStop(1, 'rgba(40, 128, 126, 0)')
  ctx.fillStyle = coreGlow
  ctx.beginPath()
  ctx.arc(centerX, centerY, outer * 1.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(now * 0.00006)
  ctx.lineCap = 'round'
  ctx.setLineDash([4, 11])
  ctx.strokeStyle = `rgba(114, 218, 190, ${0.38 * pulse})`
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, 0, outer, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([1, 9])
  ctx.strokeStyle = `rgba(228, 184, 102, ${0.44 * pulse})`
  ctx.beginPath()
  ctx.arc(0, 0, inner, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8
    ctx.strokeStyle = `rgba(228, 184, 102, ${0.3 * pulse})`
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * inner * 0.8, Math.sin(angle) * inner * 0.8)
    ctx.lineTo(Math.cos(angle) * outer * 0.92, Math.sin(angle) * outer * 0.92)
    ctx.stroke()
  }
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.32 + (pulse - 0.88) * 0.45
  ctx.fillStyle = '#e4b866'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 4 + pulse * 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(243, 209, 129, 0.7)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - inner * 0.28)
  ctx.lineTo(centerX + inner * 0.22, centerY)
  ctx.lineTo(centerX, centerY + inner * 0.28)
  ctx.lineTo(centerX - inner * 0.22, centerY)
  ctx.closePath()
  ctx.stroke()
  for (let index = 0; index < 6; index += 1) {
    const angle = now * 0.0007 + (Math.PI * 2 * index) / 6
    const orbitRadius = inner * 0.72
    ctx.fillStyle = index % 2 === 0 ? '#70d5bd' : '#f08476'
    ctx.beginPath()
    ctx.arc(centerX + Math.cos(angle) * orbitRadius, centerY + Math.sin(angle) * orbitRadius, index === 0 ? 2.6 : 1.6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawBattleConstellation(ctx: CanvasRenderingContext2D, now: number) {
  const centerX = width * 0.5
  const centerY = height * (width > 800 && height <= 560 ? 0.3 : 0.47)
  const radius = Math.min(width * 0.22, 98)
  const pulse = 0.72 + (Math.sin(now * 0.0024) + 1) * 0.14
  const points = Array.from({ length: 8 }, (_, index) => {
    const angle = now * 0.00035 + (Math.PI * 2 * index) / 8
    const pointRadius = radius * (0.84 + (index % 2) * 0.1)
    return {
      x: centerX + Math.cos(angle) * pointRadius,
      y: centerY + Math.sin(angle) * pointRadius * 0.58
    }
  })

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.lineCap = 'round'
  ctx.lineWidth = 1
  ctx.strokeStyle = `rgba(228, 184, 102, ${0.18 * pulse})`
  ctx.beginPath()
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y)
    else ctx.lineTo(point.x, point.y)
  })
  ctx.closePath()
  ctx.stroke()

  points.forEach((point, index) => {
    const color = index % 2 === 0 ? '#70d5bd' : '#f3d181'
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 9
    ctx.globalAlpha = 0.46 + (Math.sin(now * 0.003 + index) + 1) * 0.13
    ctx.beginPath()
    ctx.arc(point.x, point.y, index === 0 ? 2.5 : 1.45, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.globalAlpha = 0.24 + (pulse - 0.72) * 0.55
  ctx.strokeStyle = '#f3d181'
  ctx.shadowColor = '#f3d181'
  ctx.shadowBlur = 16
  ctx.setLineDash([2, 8])
  ctx.beginPath()
  ctx.ellipse(centerX, centerY, radius * 1.2, radius * 0.52, now * 0.00022, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawBattleThreads(ctx: CanvasRenderingContext2D, now: number) {
  const centerX = width * 0.5
  const upperY = height * 0.29
  const lowerY = height * 0.58
  const pulse = 0.12 + (Math.sin(now * 0.0012) + 1) * 0.035

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.lineCap = 'round'
  for (let index = 0; index < 4; index += 1) {
    const offset = (index - 1.5) * Math.min(width * 0.16, 92)
    const sway = Math.sin(now * 0.001 + index * 1.7) * 18
    const color = index % 2 === 0 ? '#e4b866' : '#70d5bd'
    ctx.globalAlpha = pulse
    ctx.strokeStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 10
    ctx.lineWidth = index === 1 || index === 2 ? 1.5 : 1
    ctx.beginPath()
    ctx.moveTo(centerX + offset * 0.4, upperY + height * 0.09)
    ctx.quadraticCurveTo(centerX + sway, (upperY + lowerY) * 0.5, centerX - offset * 0.65, lowerY - height * 0.03)
    ctx.stroke()
  }
  ctx.restore()
}

function drawPortraitCircle(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, radius: number) {
  if (!image.complete || !image.naturalWidth) return false
  const sourceWidth = image.naturalWidth
  const sourceHeight = Math.min(image.naturalWidth, image.naturalHeight)
  const sourceY = Math.min(image.naturalHeight - sourceHeight, image.naturalHeight * 0.09)
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, radius - 2, 0, Math.PI * 2)
  ctx.clip()
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(image, 0, sourceY, sourceWidth, sourceHeight, x - radius, y - radius, radius * 2, radius * 2)
  ctx.restore()
  return true
}

function drawGeneratedIconCircle(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, radius: number) {
  if (!image.complete || !image.naturalWidth) return false
  const size = radius * 1.56
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, radius - 3, 0, Math.PI * 2)
  ctx.clip()
  ctx.globalAlpha = 0.92
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(image, x - size / 2, y - size / 2, size, size)
  ctx.restore()
  return true
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawUnit(ctx: CanvasRenderingContext2D, unit: BattleRuntimeUnit, now: number) {
  const point = unitPoint(unit)
  const current = snapshot.value?.currentActorId === unit.id
  const acting = commands.some(command => command.command.actorId === unit.id)
  const selected = props.selectedTargetId === unit.id
  // The attack trail carries the motion; moving the portrait itself makes the
  // actor snap back when the render command is removed on the next frame.
  const lunge = 0
  const bob = acting ? Math.sin(now * 0.018) * 2 : current ? Math.sin(now * 0.003) * 1.2 : 0
  const x = point.x + lunge
  const y = point.y + bob
  const ratio = Math.max(0, Math.min(1, unit.stats.currentHp / Math.max(1, unit.stats.maxHp)))
  const ringColor = unit.side === 'ally' ? '#70d5bd' : '#f08476'

  ctx.save()
  ctx.globalAlpha = unit.isAlive ? 1 : 0.26

  ctx.fillStyle = 'rgba(2, 9, 14, 0.5)'
  ctx.shadowColor = unit.side === 'ally' ? 'rgba(63, 208, 183, 0.3)' : 'rgba(240, 132, 118, 0.25)'
  ctx.shadowBlur = 22
  ctx.beginPath()
  ctx.ellipse(x, y + point.radius + 17, point.radius * 0.88, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  if (current) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(now * 0.001)
    ctx.setLineDash([4, 8])
    ctx.lineWidth = 2
    ctx.strokeStyle = '#e4b866'
    ctx.shadowColor = 'rgba(228, 184, 102, 0.72)'
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.arc(0, 0, point.radius + 16, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  if (selected) {
    ctx.setLineDash([3, 5])
    ctx.lineWidth = 2
    ctx.strokeStyle = '#f3d181'
    ctx.shadowColor = 'rgba(243, 209, 129, 0.8)'
    ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.arc(x, y, point.radius + 12, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.shadowBlur = 0
  }

  drawUnitAura(ctx, x, y, point.radius, unit, now, current, selected, acting)
  drawBossPhaseRing(ctx, x, y, point.radius, unit, now)

  const orbGradient = ctx.createRadialGradient(x - point.radius * 0.38, y - point.radius * 0.46, 2, x, y, point.radius)
  if (unit.side === 'ally') {
    orbGradient.addColorStop(0, '#2c6f67')
    orbGradient.addColorStop(0.68, '#102d38')
    orbGradient.addColorStop(1, '#071923')
  } else {
    orbGradient.addColorStop(0, '#7b413f')
    orbGradient.addColorStop(0.68, '#3a202b')
    orbGradient.addColorStop(1, '#1a1722')
  }
  ctx.fillStyle = orbGradient
  ctx.beginPath()
  ctx.arc(x, y, point.radius, 0, Math.PI * 2)
  ctx.fill()

  const portrait = getUnitPortrait(unit)
  if (portrait) {
    const image = getImage(portrait)
    if (image) drawPortraitCircle(ctx, image, x, y, point.radius)
  } else {
    const iconImage = getImage(getUnitIconSource(unit))
    if (!iconImage || !drawGeneratedIconCircle(ctx, iconImage, x, y, point.radius)) {
      drawUnitMark(ctx, unit, x, y, point.radius, ringColor)
    }
  }

  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(5, 16, 23, 0.9)'
  ctx.beginPath()
  ctx.arc(x, y, point.radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.strokeStyle = ringColor
  ctx.shadowColor = ringColor
  ctx.shadowBlur = current || selected ? 11 : 4
  ctx.beginPath()
  ctx.arc(x, y, point.radius + 1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio)
  ctx.stroke()
  ctx.shadowBlur = 0

  drawUnitBadge(ctx, unit, x + point.radius * 0.68, y - point.radius * 0.68)
  drawUnitName(ctx, cleanName(unit.name), x, y + point.radius + 8, unit.side, unit.isAlive)
  drawUnitHpBar(ctx, x, y + point.radius + 21, point.radius * 1.25, ratio, ringColor)
  drawStatusEffects(ctx, unit, x, y + point.radius + 33)

  if (!unit.isAlive) {
    ctx.strokeStyle = 'rgba(245, 220, 198, 0.75)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x - point.radius * 0.48, y - point.radius * 0.48)
    ctx.lineTo(x + point.radius * 0.48, y + point.radius * 0.48)
    ctx.stroke()
  }
  ctx.restore()
}

function drawUnitAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  unit: BattleRuntimeUnit,
  now: number,
  current: boolean,
  selected: boolean,
  acting: boolean
) {
  const color = unit.side === 'ally' ? '#70d5bd' : '#f08476'
  const alpha = current || selected || acting ? 0.7 : 0.34
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(now * 0.00035 * (unit.side === 'ally' ? 1 : -1))
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = current || selected ? 13 : 5
  ctx.lineWidth = current || selected ? 1.8 : 1.2
  ctx.setLineDash(current || selected ? [3, 8] : [2, 10])
  ctx.beginPath()
  ctx.arc(0, 0, radius + (current || selected ? 19 : 13), 0.18, Math.PI * 0.9)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, radius + (current || selected ? 19 : 13), Math.PI * 1.18, Math.PI * 1.9)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = color
  for (let index = 0; index < 5; index += 1) {
    const angle = index * Math.PI * 0.4 + 0.35
    const dotRadius = current || selected ? radius + 21 : radius + 15
    ctx.beginPath()
    ctx.arc(Math.cos(angle) * dotRadius, Math.sin(angle) * dotRadius, current || selected ? 2 : 1.25, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawBossPhaseRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  unit: BattleRuntimeUnit,
  now: number
) {
  if (unit.side !== 'enemy' || unit.battleRole !== 'boss') return
  const phase = resolveBattleBossPhase(unit.stats.currentHp, unit.stats.maxHp)
  const colors: Record<number, string> = {
    1: '#e4b866',
    2: '#f0a16d',
    3: '#dc6c8e'
  }
  const color = colors[phase] ?? colors[1]
  const pulse = 0.48 + (Math.sin(now * 0.004 + phase) + 1) * 0.12

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-now * 0.00028)
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = pulse
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = phase === 3 ? 20 : 12
  ctx.lineWidth = phase === 3 ? 2.4 : 1.6
  ctx.setLineDash(phase === 3 ? [5, 6] : [3, 8])
  ctx.beginPath()
  ctx.arc(0, 0, radius + 23 + phase * 3, -Math.PI * 0.78, Math.PI * 0.78)
  ctx.stroke()
  if (phase >= 2) {
    ctx.globalAlpha = pulse * 0.72
    ctx.beginPath()
    ctx.arc(0, 0, radius + 30 + phase * 3, Math.PI * 0.22, Math.PI * 1.78)
    ctx.stroke()
  }
  ctx.setLineDash([])
  ctx.restore()

  ctx.save()
  ctx.fillStyle = 'rgba(7, 14, 22, 0.92)'
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.arc(x - radius * 0.72, y - radius * 0.72, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = color
  ctx.font = '700 8px PingFang SC, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`P${phase}`, x - radius * 0.72, y - radius * 0.72 + 0.5)
  ctx.restore()
}

function drawUnitMark(ctx: CanvasRenderingContext2D, unit: BattleRuntimeUnit, x: number, y: number, radius: number, color: string) {
  const name = cleanName(unit.name)
  const hash = [...`${name}:${unit.id}`].reduce((value, character) => value * 31 + character.charCodeAt(0), 7)
  const scale = Math.max(0.82, radius / 46)
  const accentByElement: Record<string, string> = {
    金: '#e4c979',
    木: '#8ed77c',
    水: '#75c9e8',
    火: '#f08b57',
    土: '#d4a36a',
    雷: '#c99cff'
  }
  const accent = accentByElement[unit.element] ?? color
  const dark = unit.side === 'ally' ? '#0c3940' : '#3b202c'
  const family = name.includes('狼') || name.includes('狐')
    ? 'beast'
    : name.includes('蛛') || name.includes('蝎')
      ? 'insect'
      : name.includes('蛾') || name.includes('蜂')
        ? 'wing'
        : name.includes('蝙') || name.includes('鸟') || name.includes('凤')
          ? 'bird'
          : name.includes('蛇') || name.includes('龙')
            ? 'serpent'
            : name.includes('影') || name.includes('虚空') || name.includes('魔')
              ? 'shadow'
              : unit.type === 'pet'
                ? 'bird'
                : 'relic'

  ctx.save()
  ctx.translate(x, y)

  const innerGlow = ctx.createRadialGradient(-radius * 0.28, -radius * 0.38, 2, 0, 0, radius)
  innerGlow.addColorStop(0, `${accent}4d`)
  innerGlow.addColorStop(0.52, `${color}26`)
  innerGlow.addColorStop(1, `${dark}f2`)
  ctx.fillStyle = innerGlow
  ctx.beginPath()
  ctx.arc(0, 0, radius - 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, radius - 4, 0, Math.PI * 2)
  ctx.clip()
  for (let index = 0; index < 12; index += 1) {
    const angle = (Math.PI * 2 * index) / 12 + (Math.abs(hash) % 7) * 0.04
    const orbit = radius * (0.25 + (index % 3) * 0.16)
    ctx.globalAlpha = 0.08 + (index % 4) * 0.02
    ctx.fillStyle = index % 2 ? accent : color
    ctx.beginPath()
    ctx.arc(Math.cos(angle) * orbit, Math.sin(angle) * orbit, 1 + (index % 3) * 0.7, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.72
  ctx.strokeStyle = `${accent}9a`
  ctx.lineWidth = Math.max(0.8, 1.1 * scale)
  ctx.setLineDash([2 * scale, 6 * scale])
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.78, -Math.PI * 0.78, Math.PI * 0.78)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 0.96
  ctx.fillStyle = `${dark}e8`
  ctx.strokeStyle = `${accent}d0`
  ctx.lineWidth = Math.max(1.2, 1.8 * scale)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  if (family === 'beast') {
    ctx.beginPath()
    ctx.moveTo(-22 * scale, 8 * scale)
    ctx.quadraticCurveTo(-24 * scale, -13 * scale, -12 * scale, -20 * scale)
    ctx.quadraticCurveTo(-6 * scale, -24 * scale, -2 * scale, -15 * scale)
    ctx.quadraticCurveTo(0, -16 * scale, 2 * scale, -15 * scale)
    ctx.quadraticCurveTo(6 * scale, -24 * scale, 12 * scale, -20 * scale)
    ctx.quadraticCurveTo(24 * scale, -13 * scale, 22 * scale, 8 * scale)
    ctx.quadraticCurveTo(15 * scale, 23 * scale, 0, 27 * scale)
    ctx.quadraticCurveTo(-15 * scale, 23 * scale, -22 * scale, 8 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = `${color}cc`
    ctx.lineWidth = Math.max(1, 1.3 * scale)
    ctx.beginPath()
    ctx.moveTo(-14 * scale, 1 * scale)
    ctx.quadraticCurveTo(-8 * scale, -4 * scale, -3 * scale, 1 * scale)
    ctx.moveTo(3 * scale, 1 * scale)
    ctx.quadraticCurveTo(8 * scale, -4 * scale, 14 * scale, 1 * scale)
    ctx.moveTo(-7 * scale, 13 * scale)
    ctx.quadraticCurveTo(0, 18 * scale, 7 * scale, 13 * scale)
    ctx.stroke()
  } else if (family === 'bird') {
    ctx.beginPath()
    ctx.moveTo(0, -26 * scale)
    ctx.quadraticCurveTo(-8 * scale, -12 * scale, -4 * scale, -5 * scale)
    ctx.quadraticCurveTo(-21 * scale, -15 * scale, -24 * scale, 2 * scale)
    ctx.quadraticCurveTo(-18 * scale, 0, -10 * scale, 8 * scale)
    ctx.quadraticCurveTo(-19 * scale, 13 * scale, -17 * scale, 22 * scale)
    ctx.quadraticCurveTo(-7 * scale, 15 * scale, 0, 12 * scale)
    ctx.quadraticCurveTo(7 * scale, 15 * scale, 17 * scale, 22 * scale)
    ctx.quadraticCurveTo(19 * scale, 13 * scale, 10 * scale, 8 * scale)
    ctx.quadraticCurveTo(18 * scale, 0, 24 * scale, 2 * scale)
    ctx.quadraticCurveTo(21 * scale, -15 * scale, 4 * scale, -5 * scale)
    ctx.quadraticCurveTo(8 * scale, -12 * scale, 0, -26 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = `${color}c4`
    ctx.beginPath()
    ctx.moveTo(0, -12 * scale)
    ctx.lineTo(0, 16 * scale)
    ctx.moveTo(-11 * scale, 5 * scale)
    ctx.quadraticCurveTo(0, 0, 11 * scale, 5 * scale)
    ctx.stroke()
  } else if (family === 'wing') {
    ctx.beginPath()
    ctx.moveTo(-3 * scale, 18 * scale)
    ctx.quadraticCurveTo(-31 * scale, 11 * scale, -24 * scale, -13 * scale)
    ctx.quadraticCurveTo(-13 * scale, -21 * scale, -3 * scale, -5 * scale)
    ctx.moveTo(3 * scale, 18 * scale)
    ctx.quadraticCurveTo(31 * scale, 11 * scale, 24 * scale, -13 * scale)
    ctx.quadraticCurveTo(13 * scale, -21 * scale, 3 * scale, -5 * scale)
    ctx.stroke()
    ctx.fillStyle = `${accent}bb`
    ctx.beginPath()
    ctx.ellipse(0, 5 * scale, 4 * scale, 18 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (family === 'serpent') {
    ctx.strokeStyle = `${accent}e0`
    ctx.lineWidth = Math.max(2.4, 3.7 * scale)
    ctx.beginPath()
    ctx.moveTo(-24 * scale, 12 * scale)
    ctx.bezierCurveTo(-8 * scale, 26 * scale, -3 * scale, -26 * scale, 21 * scale, -13 * scale)
    ctx.bezierCurveTo(32 * scale, -7 * scale, 22 * scale, 18 * scale, 6 * scale, 18 * scale)
    ctx.stroke()
    ctx.strokeStyle = `${color}cc`
    ctx.lineWidth = Math.max(0.9, 1.25 * scale)
    ctx.beginPath()
    ctx.moveTo(-24 * scale, 12 * scale)
    ctx.bezierCurveTo(-8 * scale, 26 * scale, -3 * scale, -26 * scale, 21 * scale, -13 * scale)
    ctx.stroke()
    ctx.fillStyle = '#fff3cf'
    ctx.beginPath()
    ctx.arc(21 * scale, -13 * scale, 2.2 * scale, 0, Math.PI * 2)
    ctx.fill()
  } else if (family === 'shadow') {
    ctx.beginPath()
    ctx.arc(-5 * scale, 1 * scale, 23 * scale, 0.35, Math.PI * 1.62)
    ctx.quadraticCurveTo(16 * scale, 18 * scale, 23 * scale, 0)
    ctx.quadraticCurveTo(12 * scale, -18 * scale, -5 * scale, -23 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = `${color}b0`
    ctx.setLineDash([3 * scale, 5 * scale])
    ctx.beginPath()
    ctx.arc(0, 0, 27 * scale, -Math.PI * 0.82, Math.PI * 0.72)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#fff0c2'
    ctx.beginPath()
    ctx.arc(7 * scale, -5 * scale, 2.4 * scale, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(0, -25 * scale)
    ctx.lineTo(21 * scale, -8 * scale)
    ctx.lineTo(16 * scale, 19 * scale)
    ctx.lineTo(-5 * scale, 25 * scale)
    ctx.lineTo(-22 * scale, 7 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = `${color}c8`
    ctx.beginPath()
    ctx.moveTo(0, -23 * scale)
    ctx.lineTo(0, 19 * scale)
    ctx.moveTo(-20 * scale, 7 * scale)
    ctx.lineTo(16 * scale, 18 * scale)
    ctx.stroke()
  }

  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = '#fff2b8'
  ctx.shadowColor = accent
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(0, 2 * scale, 2.6 * scale + (Math.abs(hash) % 3) * 0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.globalAlpha = 0.7
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(0.8, 1.1 * scale)
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.9, -Math.PI * 0.34, Math.PI * 0.42)
  ctx.stroke()
  ctx.restore()
}

function drawLegacyUnitMark(ctx: CanvasRenderingContext2D, unit: BattleRuntimeUnit, x: number, y: number, radius: number, color: string) {
  const name = cleanName(unit.name)
  const scale = radius / 46
  const dark = unit.side === 'ally' ? '#0b3439' : '#421e2b'
  const elementColor: Record<string, string> = {
    金: '#e4c979',
    木: '#8ed77c',
    水: '#75c9e8',
    火: '#f08b57',
    土: '#d4a36a',
    雷: '#c99cff'
  }
  const qualityColor: Record<string, string> = {
    凡品: '#9ca3af',
    灵品: '#7eb8da',
    玄品: '#b794f6',
    仙品: '#f5b45f',
    神品: '#ffe09a'
  }
  const accent = elementColor[unit.element] ?? color
  const quality = qualityColor[unit.quality] ?? color
  const markFamilies = ['crystal', 'bird', 'moth', 'bee', 'snake', 'turtle', 'shadow', 'ghost'] as const
  const hash = [...`${name}:${unit.id}`].reduce((value, character) => value * 31 + character.charCodeAt(0), 7)
  const variant = Math.abs(hash) % 3
  const family = name.includes('狼') || name.includes('狐')
    ? 'beast'
    : name.includes('蛛') || name.includes('蝎')
      ? 'insect'
      : name.includes('蛾')
        ? 'moth'
        : name.includes('蜂')
          ? 'bee'
          : name.includes('蝙') || name.includes('鸟') || name.includes('凤')
            ? 'bird'
            : name.includes('蛇')
              ? 'snake'
              : name.includes('龙')
                ? 'dragon'
                : name.includes('龟') || name.includes('甲')
                  ? 'turtle'
                  : name.includes('影') || name.includes('虚空')
                    ? 'shadow'
                    : name.includes('鬼') || name.includes('魂') || name.includes('魔')
                      ? 'ghost'
                      : name.includes('岩') || name.includes('像') || name.includes('守卫') || name.includes('巨人')
                        ? 'crystal'
                        : unit.type === 'pet'
                          ? 'bird'
                          : markFamilies[Math.abs(hash) % markFamilies.length]
  ctx.save()
  ctx.translate(x, y)
  ctx.globalAlpha = 0.96
  ctx.fillStyle = unit.side === 'ally' ? 'rgba(112, 213, 189, 0.25)' : 'rgba(240, 132, 118, 0.23)'
  ctx.beginPath()
  ctx.arc(0, 0, radius - 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = `${color}99`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.64, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = dark
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(1.3, 2 * scale)
  ctx.lineJoin = 'round'

  ctx.save()
  ctx.globalAlpha = 0.7
  ctx.strokeStyle = quality
  ctx.lineWidth = Math.max(0.8, 1.1 * scale)
  ctx.setLineDash([2 * scale, 4 * scale])
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.82, -Math.PI * 0.7, Math.PI * 0.7)
  ctx.stroke()
  ctx.restore()

  if (family === 'beast') {
    ctx.beginPath()
    ctx.moveTo(-24 * scale, -11 * scale)
    ctx.lineTo(-14 * scale, -28 * scale)
    ctx.lineTo(-4 * scale, -18 * scale)
    ctx.lineTo(4 * scale, -18 * scale)
    ctx.lineTo(14 * scale, -28 * scale)
    ctx.lineTo(24 * scale, -11 * scale)
    ctx.lineTo(18 * scale, 17 * scale)
    ctx.quadraticCurveTo(0, 31 * scale, -18 * scale, 17 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(-9 * scale, -2 * scale, 2.2 * scale, 0, Math.PI * 2)
    ctx.arc(9 * scale, -2 * scale, 2.2 * scale, 0, Math.PI * 2)
    ctx.fill()
  } else if (family === 'insect') {
    ctx.beginPath()
    ctx.arc(0, 2 * scale, 15 * scale, 0, Math.PI * 2)
    ctx.arc(0, -15 * scale, 8 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    for (let index = 0; index < 4; index += 1) {
      const offset = (index - 1.5) * 8 * scale
      ctx.moveTo(-10 * scale, offset)
      ctx.lineTo(-29 * scale, offset - (index - 1.5) * 8 * scale)
      ctx.moveTo(10 * scale, offset)
      ctx.lineTo(29 * scale, offset - (index - 1.5) * 8 * scale)
    }
    ctx.stroke()
  } else if (family === 'moth') {
    ctx.fillStyle = dark
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.moveTo(-4 * scale, -2 * scale)
    ctx.quadraticCurveTo(-31 * scale, -28 * scale, -27 * scale, 1 * scale)
    ctx.quadraticCurveTo(-21 * scale, 17 * scale, -4 * scale, 8 * scale)
    ctx.closePath()
    ctx.moveTo(4 * scale, -2 * scale)
    ctx.quadraticCurveTo(31 * scale, -28 * scale, 27 * scale, 1 * scale)
    ctx.quadraticCurveTo(21 * scale, 17 * scale, 4 * scale, 8 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.ellipse(0, 3 * scale, 4 * scale, 18 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.arc(-16 * scale, -7 * scale, 3 * scale, 0, Math.PI * 2)
    ctx.arc(16 * scale, -7 * scale, 3 * scale, 0, Math.PI * 2)
    ctx.stroke()
  } else if (family === 'bee') {
    ctx.fillStyle = dark
    ctx.strokeStyle = accent
    ctx.beginPath()
    for (let index = 0; index < 6; index += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 6
      const pointX = Math.cos(angle) * 17 * scale
      const pointY = Math.sin(angle) * 21 * scale
      if (index === 0) ctx.moveTo(pointX, pointY)
      else ctx.lineTo(pointX, pointY)
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1, 2.2 * scale)
    ctx.beginPath()
    ctx.moveTo(-12 * scale, -5 * scale)
    ctx.lineTo(12 * scale, -5 * scale)
    ctx.moveTo(-14 * scale, 5 * scale)
    ctx.lineTo(14 * scale, 5 * scale)
    ctx.stroke()
    ctx.strokeStyle = accent
    ctx.lineWidth = Math.max(1, 1.4 * scale)
    ctx.beginPath()
    ctx.ellipse(-18 * scale, -13 * scale, 10 * scale, 6 * scale, -0.35, 0, Math.PI * 2)
    ctx.ellipse(18 * scale, -13 * scale, 10 * scale, 6 * scale, 0.35, 0, Math.PI * 2)
    ctx.stroke()
  } else if (family === 'bird' || unit.type === 'pet' || name.includes('灵狐')) {
    ctx.beginPath()
    ctx.moveTo(-22 * scale, -6 * scale)
    ctx.lineTo(-13 * scale, -27 * scale)
    ctx.lineTo(-3 * scale, -16 * scale)
    ctx.lineTo(3 * scale, -16 * scale)
    ctx.lineTo(13 * scale, -27 * scale)
    ctx.lineTo(22 * scale, -6 * scale)
    ctx.quadraticCurveTo(18 * scale, 22 * scale, 0, 26 * scale)
    ctx.quadraticCurveTo(-18 * scale, 22 * scale, -22 * scale, -6 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = `${color}bb`
    ctx.beginPath()
    ctx.moveTo(0, -13 * scale)
    ctx.lineTo(0, 16 * scale)
    ctx.moveTo(-12 * scale, 4 * scale)
    ctx.quadraticCurveTo(0, -2 * scale, 12 * scale, 4 * scale)
    ctx.stroke()
  } else if (family === 'snake') {
    ctx.strokeStyle = accent
    ctx.lineWidth = Math.max(2.4, 4.2 * scale)
    ctx.beginPath()
    ctx.moveTo(-25 * scale, 12 * scale)
    ctx.bezierCurveTo(-5 * scale, 27 * scale, 2 * scale, -26 * scale, 25 * scale, -10 * scale)
    ctx.bezierCurveTo(35 * scale, -2 * scale, 18 * scale, 18 * scale, 7 * scale, 17 * scale)
    ctx.stroke()
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1, 1.4 * scale)
    ctx.beginPath()
    ctx.moveTo(-25 * scale, 12 * scale)
    ctx.bezierCurveTo(-5 * scale, 27 * scale, 2 * scale, -26 * scale, 25 * scale, -10 * scale)
    ctx.stroke()
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(25 * scale, -10 * scale, 5 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff5d8'
    ctx.beginPath()
    ctx.arc(27 * scale, -11 * scale, 1.2 * scale, 0, Math.PI * 2)
    ctx.fill()
  } else if (family === 'dragon') {
    ctx.fillStyle = dark
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.moveTo(-25 * scale, 14 * scale)
    ctx.lineTo(-19 * scale, -9 * scale)
    ctx.lineTo(-27 * scale, -25 * scale)
    ctx.lineTo(-9 * scale, -17 * scale)
    ctx.lineTo(0, -29 * scale)
    ctx.lineTo(9 * scale, -17 * scale)
    ctx.lineTo(27 * scale, -25 * scale)
    ctx.lineTo(19 * scale, -9 * scale)
    ctx.lineTo(25 * scale, 14 * scale)
    ctx.lineTo(0, 27 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1, 1.4 * scale)
    ctx.beginPath()
    ctx.moveTo(-15 * scale, 4 * scale)
    ctx.lineTo(0, 14 * scale)
    ctx.lineTo(15 * scale, 4 * scale)
    ctx.moveTo(-10 * scale, -4 * scale)
    ctx.lineTo(0, 3 * scale)
    ctx.lineTo(10 * scale, -4 * scale)
    ctx.stroke()
  } else if (family === 'turtle') {
    ctx.fillStyle = dark
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.arc(0, 0, 24 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(-18 * scale, -12 * scale)
    ctx.lineTo(0, 0)
    ctx.lineTo(18 * scale, -12 * scale)
    ctx.moveTo(-20 * scale, 9 * scale)
    ctx.lineTo(0, 0)
    ctx.lineTo(20 * scale, 9 * scale)
    ctx.moveTo(0, -22 * scale)
    ctx.lineTo(0, 22 * scale)
    ctx.stroke()
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(0, 0, 4 * scale, 0, Math.PI * 2)
    ctx.fill()
  } else if (family === 'shadow') {
    ctx.fillStyle = dark
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.arc(-4 * scale, 0, 24 * scale, 0.4, Math.PI * 1.65)
    ctx.quadraticCurveTo(17 * scale, 15 * scale, 23 * scale, 0)
    ctx.quadraticCurveTo(12 * scale, -18 * scale, -4 * scale, -24 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.setLineDash([3 * scale, 6 * scale])
    ctx.beginPath()
    ctx.arc(0, 0, 28 * scale, -Math.PI * 0.9, Math.PI * 0.8)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#fff0c2'
    ctx.beginPath()
    ctx.arc(6 * scale, -5 * scale, 3 * scale, 0, Math.PI * 2)
    ctx.fill()
  } else if (family === 'ghost') {
    ctx.fillStyle = dark
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.moveTo(0, -27 * scale)
    ctx.bezierCurveTo(-20 * scale, -25 * scale, -25 * scale, -3 * scale, -20 * scale, 20 * scale)
    ctx.lineTo(-10 * scale, 13 * scale)
    ctx.lineTo(0, 22 * scale)
    ctx.lineTo(10 * scale, 13 * scale)
    ctx.lineTo(20 * scale, 20 * scale)
    ctx.bezierCurveTo(25 * scale, -3 * scale, 20 * scale, -25 * scale, 0, -27 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(-8 * scale, -4 * scale, 2.4 * scale, 0, Math.PI * 2)
    ctx.arc(8 * scale, -4 * scale, 2.4 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = `${color}aa`
    ctx.beginPath()
    ctx.arc(0, 5 * scale, 8 * scale, 0.2, Math.PI - 0.2)
    ctx.stroke()
  } else if (family === 'crystal') {
    ctx.fillStyle = dark
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.moveTo(0, -29 * scale)
    ctx.lineTo(23 * scale, -10 * scale)
    ctx.lineTo(18 * scale, 19 * scale)
    ctx.lineTo(-5 * scale, 28 * scale)
    ctx.lineTo(-25 * scale, 8 * scale)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(0, -29 * scale)
    ctx.lineTo(0, 23 * scale)
    ctx.moveTo(-25 * scale, 8 * scale)
    ctx.lineTo(18 * scale, 19 * scale)
    ctx.moveTo(23 * scale, -10 * scale)
    ctx.lineTo(-5 * scale, 28 * scale)
    ctx.stroke()
  } else {
    ctx.beginPath()
    const sides = 5 + Math.abs(hash) % 4
    for (let index = 0; index < sides; index += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / sides
      const pointX = Math.cos(angle) * 24 * scale
      const pointY = Math.sin(angle) * 24 * scale
      if (index === 0) ctx.moveTo(pointX, pointY)
      else ctx.lineTo(pointX, pointY)
    }
    ctx.closePath()
    ctx.stroke()
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.save()
  ctx.globalAlpha = 0.42
  ctx.strokeStyle = accent
  ctx.lineWidth = Math.max(0.8, 1.2 * scale)
  if (variant === 0) {
    ctx.beginPath()
    ctx.moveTo(-22 * scale, 0)
    ctx.lineTo(0, -22 * scale)
    ctx.lineTo(22 * scale, 0)
    ctx.lineTo(0, 22 * scale)
    ctx.closePath()
    ctx.stroke()
  } else if (variant === 1) {
    ctx.beginPath()
    ctx.arc(0, 0, radius * 0.48, 0, Math.PI * 2)
    ctx.moveTo(-20 * scale, -12 * scale)
    ctx.lineTo(20 * scale, 12 * scale)
    ctx.stroke()
  } else {
    ctx.setLineDash([1.5 * scale, 5 * scale])
    ctx.beginPath()
    ctx.arc(0, 0, radius * 0.52, 0.2, Math.PI * 1.82)
    ctx.stroke()
    ctx.setLineDash([])
  }
  ctx.restore()
  ctx.restore()
}

function drawUnitHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, widthValue: number, ratio: number, color: string) {
  const barWidth = Math.min(78, widthValue)
  const barHeight = 3
  ctx.save()
  ctx.fillStyle = 'rgba(4, 15, 22, 0.78)'
  roundedRect(ctx, x - barWidth / 2, y - barHeight / 2, barWidth, barHeight, 2)
  ctx.fill()
  ctx.fillStyle = color
  roundedRect(ctx, x - barWidth / 2, y - barHeight / 2, barWidth * ratio, barHeight, 2)
  ctx.fill()
  ctx.restore()
}

function drawUnitBadge(ctx: CanvasRenderingContext2D, unit: BattleRuntimeUnit, x: number, y: number) {
  const color = unit.side === 'ally' ? '#70d5bd' : '#f08476'
  const elementColor: Record<string, string> = {
    金: '#e4c979', 木: '#8ed77c', 水: '#75c9e8', 火: '#f08b57', 土: '#d4a36a', 雷: '#c99cff'
  }
  const element = elementColor[unit.element] ?? color
  ctx.fillStyle = 'rgba(5, 15, 22, 0.94)'
  ctx.strokeStyle = element
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(x, y, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = element
  ctx.fillStyle = element
  ctx.lineWidth = 1.25
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (unit.element === '金') {
    ctx.rotate(Math.PI / 4)
    ctx.strokeRect(-3.2, -3.2, 6.4, 6.4)
  } else if (unit.element === '木') {
    ctx.beginPath()
    ctx.moveTo(0, 5)
    ctx.lineTo(0, -5)
    ctx.moveTo(0, -1)
    ctx.lineTo(-4, -4)
    ctx.moveTo(0, 1)
    ctx.lineTo(4, -2)
    ctx.stroke()
  } else if (unit.element === '水') {
    ctx.beginPath()
    ctx.moveTo(-5, -1)
    ctx.quadraticCurveTo(-2, 4, 0, 5)
    ctx.quadraticCurveTo(2, 4, 5, -1)
    ctx.quadraticCurveTo(0, -4, -5, -1)
    ctx.stroke()
  } else if (unit.element === '火') {
    ctx.beginPath()
    ctx.moveTo(0, -5)
    ctx.quadraticCurveTo(5, -1, 3, 4)
    ctx.quadraticCurveTo(0, 6, -3, 4)
    ctx.quadraticCurveTo(-5, -1, 0, -5)
    ctx.stroke()
  } else if (unit.element === '土') {
    ctx.strokeRect(-4, -4, 8, 8)
    ctx.beginPath()
    ctx.moveTo(-4, 0)
    ctx.lineTo(4, 0)
    ctx.stroke()
  } else if (unit.element === '雷') {
    ctx.beginPath()
    ctx.moveTo(2, -5)
    ctx.lineTo(-2, -1)
    ctx.lineTo(1, -1)
    ctx.lineTo(-2, 5)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(0, 0, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawUnitName(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, side: 'ally' | 'enemy', alive: boolean) {
  ctx.save()
  ctx.font = '600 11px PingFang SC, sans-serif'
  const textWidth = Math.min(108, ctx.measureText(name).width)
  ctx.globalAlpha = alive ? 0.9 : 0.38
  ctx.fillStyle = side === 'ally' ? '#d9f1e6' : '#ffd5c9'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(3, 12, 18, 0.9)'
  ctx.shadowBlur = 5
  ctx.fillText(name, x, y)
  ctx.shadowBlur = 0
  ctx.globalAlpha = alive ? 0.48 : 0.2
  ctx.strokeStyle = side === 'ally' ? '#70d5bd' : '#f08476'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x - Math.min(22, textWidth * 0.32), y + 9)
  ctx.lineTo(x + Math.min(22, textWidth * 0.32), y + 9)
  ctx.stroke()
  ctx.restore()
}

function statusLabel(type: string) {
  const labels: Record<string, string> = {
    poison: '毒', burn: '燃', bleed: '血', freeze: '冻', stun: '晕', spirit_seal: '封',
    buff_atk: '攻', buff_def: '防', buff_spd: '速', debuff_atk: '弱', debuff_def: '破',
    vulnerable: '伤', shield: '盾', invincible: '无', lifesteal: '吸', dodge: '闪', counter: '反',
    element_damage: '行'
  }
  return labels[type] ?? '灵'
}

function drawStatusEffects(ctx: CanvasRenderingContext2D, unit: BattleRuntimeUnit, x: number, y: number) {
  const effects = unit.statusEffects.slice(0, 3)
  if (!effects.length) return
  const spacing = 15
  effects.forEach((effect, index) => {
    const effectX = x + (index - (effects.length - 1) / 2) * spacing
    drawStatusGlyph(ctx, effect.type, effectX, y, 6, effect.type === 'shield' || effect.type.startsWith('buff'))
  })
}

function drawStatusGlyph(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, radius: number, positive: boolean) {
  const color = positive ? '#70d5bd' : '#f08476'
  ctx.save()
  ctx.translate(x, y)
  ctx.globalAlpha = 0.92
  ctx.fillStyle = positive ? 'rgba(16, 74, 67, 0.94)' : 'rgba(84, 37, 44, 0.94)'
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.globalCompositeOperation = 'screen'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (type === 'burn') {
    ctx.beginPath()
    ctx.moveTo(0, radius * 0.62)
    ctx.quadraticCurveTo(-radius * 0.72, radius * 0.12, -radius * 0.12, -radius * 0.7)
    ctx.quadraticCurveTo(-radius * 0.08, -radius * 0.08, radius * 0.18, -radius * 0.28)
    ctx.quadraticCurveTo(radius * 0.28, -radius * 0.6, radius * 0.48, -radius * 0.38)
    ctx.quadraticCurveTo(radius * 0.72, radius * 0.16, 0, radius * 0.62)
    ctx.stroke()
  } else if (type === 'freeze') {
    for (let index = 0; index < 4; index += 1) {
      const angle = index * Math.PI * 0.5 + Math.PI * 0.25
      ctx.beginPath()
      ctx.moveTo(Math.cos(angle) * radius * 0.18, Math.sin(angle) * radius * 0.18)
      ctx.lineTo(Math.cos(angle) * radius * 0.64, Math.sin(angle) * radius * 0.64)
      ctx.stroke()
    }
  } else if (type === 'shield' || type.startsWith('buff')) {
    ctx.beginPath()
    ctx.moveTo(0, -radius * 0.66)
    ctx.lineTo(radius * 0.56, -radius * 0.28)
    ctx.lineTo(radius * 0.42, radius * 0.48)
    ctx.lineTo(0, radius * 0.7)
    ctx.lineTo(-radius * 0.42, radius * 0.48)
    ctx.lineTo(-radius * 0.56, -radius * 0.28)
    ctx.closePath()
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(-radius * 0.58, radius * 0.45)
    ctx.lineTo(radius * 0.55, -radius * 0.5)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, radius * 0.32, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

function cloneUnitVisualState(unit: BattleRuntimeUnit): UnitVisualState {
  return {
    isAlive: unit.isAlive,
    side: unit.side,
    type: unit.type,
    statusEffects: unit.statusEffects.map(effect => ({ ...effect }))
  }
}

function getStatusPulseEffect(statusType: string) {
  if (statusType === 'burn') return 'fire'
  if (statusType === 'poison') return 'wood'
  if (statusType === 'bleed') return 'slash'
  if (statusType === 'freeze') return 'ice'
  if (statusType === 'spirit_seal' || statusType === 'vulnerable') return 'void_magic'
  if (statusType.startsWith('debuff')) return 'thunder'
  return 'heal'
}

function spawnStatusPulse(unit: BattleRuntimeUnit, statusType: string) {
  const point = unitPoint(unit)
  const effect = getStatusPulseEffect(statusType)
  const config = getEffectForElement(effect)
  const vfx = createBattleVfxCommand('status', config.type, {
    targetId: unit.id,
    statusType,
    duration: 620,
    label: statusLabel(statusType)
  })
  statusPulses.push({
    vfx,
    x: point.x,
    y: point.y,
    life: 0,
    maxLife: vfx.duration ?? 620,
    color: effectColor(effect)
  })
  if (statusPulses.length > 36) statusPulses.shift()
  spawnParticles(point.x, point.y, effect, 10, false)
}

function spawnBossPhasePulse(boss: BattleRuntimeUnit, phase: number) {
  const point = unitPoint(boss)
  const effect = phase === 3 ? 'thunder' : 'fire'
  const config = getEffectForElement(effect)
  const vfx = createBattleVfxCommand('flash', config.type, {
    targetId: boss.id,
    phase,
    duration: 920,
    label: `P${phase}`
  })
  statusPulses.push({
    vfx,
    x: point.x,
    y: point.y,
    life: 0,
    maxLife: vfx.duration ?? 920,
    color: effectColor(effect)
  })
  if (statusPulses.length > 36) statusPulses.shift()
  shockwaves.push({
    x: point.x,
    y: point.y,
    life: 0,
    maxLife: 760,
    color: effectColor(effect),
    radius: phase === 3 ? 92 : 72,
    width: phase === 3 ? 4 : 2
  })
  spawnParticles(point.x, point.y, effect, phase === 3 ? 30 : 18)
  floatingTexts.push({
    x: point.x,
    y: point.y - 68,
    value: `P${phase}`,
    label: 'BOSS阶段',
    color: effectColor(effect),
    life: 0,
    maxLife: 980,
    size: phase === 3 ? 24 : 20
  })
}

function spawnDefeatBurst(unit: BattleRuntimeUnit, outcome: 'defeat' | 'retreat') {
  const point = unitPoint(unit)
  const effect = outcome === 'retreat' ? 'wind' : 'hit'
  const config = getEffectForElement(effect)
  const vfx = createBattleVfxCommand('death', config.type, {
    targetId: unit.id,
    duration: outcome === 'retreat' ? 760 : 900,
    reason: outcome,
    label: outcome === 'retreat' ? '退场' : '击败'
  })
  defeatBursts.push({
    vfx,
    x: point.x,
    y: point.y,
    life: 0,
    maxLife: vfx.duration ?? 900,
    color: effectColor(effect),
    outcome
  })
  if (defeatBursts.length > 24) defeatBursts.shift()
  spawnParticles(point.x, point.y, effect, outcome === 'retreat' ? 18 : 28)
  shockwaves.push({
    x: point.x,
    y: point.y,
    life: 0,
    maxLife: outcome === 'retreat' ? 520 : 680,
    color: effectColor(effect),
    radius: outcome === 'retreat' ? 54 : 68,
    width: outcome === 'retreat' ? 2 : 3
  })
  floatingTexts.push({
    x: point.x,
    y: point.y - 58,
    value: outcome === 'retreat' ? '退场' : '击败',
    color: outcome === 'retreat' ? '#8bd5f4' : '#ffb38e',
    life: 0,
    maxLife: outcome === 'retreat' ? 720 : 900,
    size: 16
  })
  actionCaption.value = `${cleanName(unit.name)}${outcome === 'retreat' ? '退离战场' : '倒下了'}`
}

function spawnBattleResultVfx(result: Exclude<BattleRuntimeSnapshot['result'], null>, next: BattleRuntimeSnapshot) {
  if (result === 'fled') {
    next.units
      .filter(unit => unit.side === 'ally' && unit.isAlive)
      .forEach(unit => spawnDefeatBurst(unit, 'retreat'))
  }
  const effect = result === 'victory' ? 'heal' : result === 'fled' ? 'wind' : 'hit'
  const centerX = width * 0.5
  const centerY = height * 0.47
  shockwaves.push({
    x: centerX,
    y: centerY,
    life: 0,
    maxLife: result === 'fled' ? 620 : 880,
    color: effectColor(effect),
    radius: result === 'fled' ? 86 : 110,
    width: result === 'victory' ? 3 : 2
  })
  floatingTexts.push({
    x: centerX,
    y: centerY - 24,
    value: result === 'victory' ? '胜利' : result === 'fled' ? '撤退' : '败北',
    color: effectColor(effect),
    life: 0,
    maxLife: 1100,
    size: 26
  })
}

function processReplayVisualEvents(next: BattleRuntimeSnapshot) {
  for (const event of next.replayEvents) {
    if (processedReplayEventIds.has(event.id)) continue
    processedReplayEventIds.add(event.id)
    if (event.type !== 'turn_status' || typeof event.payload?.bossPhase !== 'number') continue
    const bossId = event.actor?.id
    const boss = next.units.find(unit => unit.id === bossId && unit.battleRole === 'boss')
    if (boss) spawnBossPhasePulse(boss, event.payload.bossPhase)
  }
  if (processedReplayEventIds.size > 600) {
    const recentIds = next.replayEvents.map(event => event.id)
    processedReplayEventIds.clear()
    recentIds.forEach(id => processedReplayEventIds.add(id))
  }
}

function syncSnapshotVisuals(next: BattleRuntimeSnapshot) {
  if (!hasSnapshotVisualState) {
    next.units.forEach(unit => previousUnitVisuals.set(unit.id, cloneUnitVisualState(unit)))
    hasSnapshotVisualState = true
    previousBattleResult = next.result
    processReplayVisualEvents(next)
    if (next.result) spawnBattleResultVfx(next.result, next)
    return
  }

  for (const unit of next.units) {
    const previous = previousUnitVisuals.get(unit.id)
    if (previous?.isAlive && !unit.isAlive) {
      spawnDefeatBurst(unit, unit.type === 'summon' ? 'retreat' : 'defeat')
    }
    if (unit.isAlive && previous?.isAlive) {
      const previousStatuses = new Map(previous.statusEffects.map(effect => [effect.type, effect]))
      for (const status of unit.statusEffects) {
        const prior = previousStatuses.get(status.type)
        if (!prior || status.duration > prior.duration || status.value !== prior.value) {
          spawnStatusPulse(unit, status.type)
        }
      }
    }
    previousUnitVisuals.set(unit.id, cloneUnitVisualState(unit))
  }

  processReplayVisualEvents(next)
  if (next.result && next.result !== previousBattleResult) {
    spawnBattleResultVfx(next.result, next)
  }
  previousBattleResult = next.result
}

function spawnParticles(x: number, y: number, effect: string, count = 20, burst = true) {
  const color = effectColor(effect)
  for (let index = 0; index < count && particles.length < 280; index += 1) {
    const angle = burst ? Math.PI * 2 * Math.random() : (Math.PI * 2 * index) / count
    const speed = burst ? 24 + Math.random() * 78 : 20 + Math.random() * 38
    particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (effect === 'heal' ? 18 : 0),
      life: 0,
      maxLife: 360 + Math.random() * 420,
      color,
      size: 1.5 + Math.random() * (effect === 'thunder' ? 3.4 : 2.8),
      shape: effect === 'heal' && index % 3 === 0
        ? 'ring'
        : effect === 'fire' && index % 3 === 0
          ? 'flare'
          : effect === 'water' || effect === 'wood' || effect === 'wind' || index % 9 === 0
            ? 'trail'
            : effect === 'thunder' || index % 7 === 0
              ? 'spark'
              : effect === 'slash' || effect === 'ice' || effect === 'earth'
                ? 'shard'
                : 'dot',
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.15,
      gravity: effect === 'heal' ? -14 : effect === 'wind' ? -3 : 26
    })
  }
}

function spawnAmbientParticles(delta: number, now: number) {
  if (reduceMotion) return
  ambientClock += delta
  if (ambientClock < 130) return
  ambientClock = 0
  const effects = ['wind', 'water', 'heal']
  const effect = effects[Math.floor(now / 900) % effects.length] ?? 'wind'
  const coreX = width * 0.5 + Math.sin(now * 0.0011) * 9
  const coreY = height * (width > 800 && height <= 560 ? 0.3 : 0.47) + Math.cos(now * 0.0013) * 6
  spawnParticles(coreX, coreY, effect, 3, false)
}

function handleCommand(payload: { command: BattleRenderCommand; battleInstanceId: string }) {
  if (!isCurrent(payload.battleInstanceId)) return
  const groups = getTargetGroupsForCommand(payload.command)
  const effect = groups[0]?.effect ?? resolveEffect(payload.command)
  const targetIds = groups.flatMap(group => group.targetIds)
  const vfx = createBattleVfxCommand('projectile', effect.type, {
    actorId: payload.command.actorId,
    targetId: targetIds[0],
    targetIds,
    duration: payload.command.type === 'skill' ? 620 : 460
  })
  commands.push({ command: payload.command, startedAt: performance.now(), effect, groups, vfx })
  const actor = snapshot.value?.units.find(unit => unit.id === payload.command.actorId)
  if (actor) {
    const actorPoint = unitPoint(actor)
    spawnParticles(actorPoint.x, actorPoint.y, effect.type, effect.type === 'thunder' ? 22 : 13, false)
    actionCaption.value = `${cleanName(actor.name)}施展${getSkillById(payload.command.skillId ?? '')?.name ?? '普通攻击'}`
    groups.forEach(group => {
      const groupTargets = group.targetIds
        .map(targetId => snapshot.value?.units.find(unit => unit.id === targetId) ?? null)
        .filter((unit): unit is BattleRuntimeUnit => Boolean(unit))
      groupTargets.forEach(target => {
        const queuedEffects = targetEffectById.get(target.id) ?? []
        queuedEffects.push(group.effect.type)
        targetEffectById.set(target.id, queuedEffects)
        const targetPoint = unitPoint(target)
        spawnParticles((actorPoint.x + targetPoint.x) / 2, (actorPoint.y + targetPoint.y) / 2, group.effect.type, groupTargets.length > 1 ? 6 : 8, false)
      })
      if (groupTargets.length > 1) {
        const centerX = groupTargets.reduce((sum, target) => sum + unitPoint(target).x, 0) / groupTargets.length
        const centerY = groupTargets.reduce((sum, target) => sum + unitPoint(target).y, 0) / groupTargets.length
        spawnParticles(centerX, centerY, group.effect.type, 12 + groupTargets.length * 3, false)
      }
    })
  }
}

function handleHit(payload: { hit: BattleRenderHit; battleInstanceId: string }) {
  if (!isCurrent(payload.battleInstanceId)) return
  const target = snapshot.value?.units.find(unit => unit.id === payload.hit.targetId)
  if (!target) return
  const point = unitPoint(target)
  const queuedEffects = targetEffectById.get(target.id)
  const queuedEffect = queuedEffects?.shift()
  if (queuedEffects && queuedEffects.length === 0) targetEffectById.delete(target.id)
  const effect = payload.hit.isHeal
    ? 'heal'
    : queuedEffect ?? getIncomingStatusEffect(target) ?? 'hit'
  const effectConfig = getEffectForElement(effect)
  const vfx = createBattleVfxCommand(payload.hit.isHeal ? 'heal' : 'impact', payload.hit.isHeal ? 'heal' : effectConfig.type, {
    actorId: payload.hit.actorId,
    targetId: target.id,
    value: payload.hit.amount,
    duration: payload.hit.isCrit ? 720 : 520
  })
  spawnParticles(point.x, point.y, effect, payload.hit.isCrit ? 42 : 25)
  impactBursts.push({
    vfx,
    x: point.x,
    y: point.y,
    life: 0,
    maxLife: payload.hit.isCrit ? 720 : 520,
    color: effectColor(effect),
    critical: payload.hit.isCrit,
    heal: Boolean(payload.hit.isHeal)
  })
  shockwaves.push({
    x: point.x,
    y: point.y,
    life: 0,
    maxLife: payload.hit.isCrit ? 620 : 440,
    color: effectColor(effect),
    radius: payload.hit.isCrit ? 62 : 46,
    width: payload.hit.isCrit ? 4 : 2
  })
  floatingTexts.push({
    x: point.x,
    y: point.y - 62,
    value: payload.hit.isHeal ? `+${payload.hit.amount}` : `-${payload.hit.amount}`,
    label: payload.hit.isCrit ? '暴击' : undefined,
    color: payload.hit.isHeal ? '#f5df87' : payload.hit.isCrit ? '#ffb38e' : '#f3d4bc',
    life: 0,
    maxLife: payload.hit.isCrit ? 1050 : 860,
    size: payload.hit.isCrit ? 23 : 18
  })
  actionCaption.value = payload.hit.isHeal ? `${cleanName(target.name)}恢复了灵力` : `${cleanName(target.name)}受到${payload.hit.amount}点伤害`
  if (!payload.hit.isHeal) {
    shakeStrength = payload.hit.isCrit ? 6 : 3
    shakeUntil = performance.now() + (payload.hit.isCrit ? 260 : 150)
    hitFlashColor = payload.hit.isCrit ? '#f5b47e' : '#f8e5b2'
    hitFlashUntil = performance.now() + (payload.hit.isCrit ? 150 : 90)
  }
}

function getIncomingStatusEffect(unit: BattleRuntimeUnit) {
  const status = unit.statusEffects.find(effect => effect.type === 'burn' || effect.type === 'poison' || effect.type === 'bleed')
  if (status?.type === 'burn') return 'fire'
  if (status?.type === 'poison') return 'wood'
  if (status?.type === 'bleed') return 'slash'
  return null
}

function resolveEffect(command: BattleRenderCommand, effect?: { type: string; element?: string }) {
  const skill = command.skillId ? getSkillById(command.skillId) : null
  const element = effect?.element ?? skill?.effects.find(item => item.element)?.element
  if (effect?.type === 'heal' || (!effect && skill?.effects.some(item => item.type === 'heal'))) {
    return getEffectForElement('heal')
  }
  return getEffectForElement(element ?? (skill?.name || 'slash'))
}

function drawCommandTrail(ctx: CanvasRenderingContext2D, active: ActiveCommand, now: number) {
  if (reduceMotion && now - active.startedAt > 90) return false
  const progress = reduceMotion
    ? 0.72
    : Math.min(1, (now - active.startedAt) / (active.vfx.duration ?? (active.command.type === 'skill' ? 620 : 460)))
  if (progress >= 1) return false
  const actor = snapshot.value?.units.find(unit => unit.id === active.command.actorId)
  if (!actor || !active.groups.length) return true
  const from = unitPoint(actor)
  const skillName = active.command.skillId ? getSkillById(active.command.skillId)?.name ?? '' : ''

  const travelProgress = Math.min(1, progress / 0.68)
  const trailAlpha = progress <= 0.68
    ? 1
    : Math.max(0, (1 - progress) / 0.32)

  if (progress < 0.32) {
    drawChargeField(ctx, from.x, from.y, progress / 0.32, effectColor(active.effect.type), active.effect.type)
  }

  active.groups.forEach(group => {
    const targets = group.targetIds
      .map(targetId => snapshot.value?.units.find(unit => unit.id === targetId) ?? null)
      .filter((unit): unit is BattleRuntimeUnit => Boolean(unit))
    if (!targets.length) return
    const color = effectColor(group.effect.type)
    if (targets.length > 1) {
      drawGroupBloom(ctx, targets.map(target => unitPoint(target)), travelProgress, color)
    }
    targets.forEach(target => {
      const to = unitPoint(target)
      const x = from.x + (to.x - from.x) * travelProgress
      const y = from.y + (to.y - from.y) * travelProgress - Math.sin(travelProgress * Math.PI) * 26
      if (progress > 0.66) {
        drawImpactPreview(ctx, to.x, to.y, (progress - 0.66) / 0.34, color, group.effect.type)
      }
      if (progress > 0.2 && progress < 0.82 && particles.length < 250 && Math.random() < 0.42) {
        spawnParticles(x, y, group.effect.type, targets.length > 1 ? 1 : 2, false)
      }

      ctx.save()
      ctx.globalAlpha *= trailAlpha
      if (group.effect.type === 'slash') {
        if (active.command.type === 'attack' && !active.command.skillId) {
          drawSwordThrust(ctx, from.x, from.y, x, y, travelProgress, color)
        } else {
          drawSlashTrail(ctx, x, y, travelProgress, color, skillName)
        }
      } else if (group.effect.type === 'thunder') {
        drawLightning(ctx, from.x, from.y, x, y, color, travelProgress)
      } else if (group.effect.type === 'heal') {
        drawHealOrbit(ctx, to.x, to.y, travelProgress, color)
      } else {
        drawProjectile(ctx, x, y, from.x, from.y, color, group.effect.type, travelProgress)
      }
      ctx.restore()
    })
  })
  return true
}

function drawGroupBloom(ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>, progress: number, color: string) {
  if (points.length < 2) return
  const centerX = points.reduce((sum, point) => sum + point.x, 0) / points.length
  const centerY = points.reduce((sum, point) => sum + point.y, 0) / points.length
  const maxDistance = Math.max(...points.map(point => Math.hypot(point.x - centerX, point.y - centerY)))
  const radius = maxDistance + 36 + Math.sin(progress * Math.PI) * 16
  const pulse = Math.sin(progress * Math.PI)

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  glow.addColorStop(0, `${color}4c`)
  glow.addColorStop(0.42, `${color}25`)
  glow.addColorStop(1, `${color}00`)
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.36 + pulse * 0.45
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 22
  ctx.lineWidth = 2
  ctx.setLineDash([6, 9])
  ctx.lineDashOffset = -progress * 44
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.78, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.lineWidth = 1
  points.forEach(point => {
    ctx.globalAlpha = 0.22 + pulse * 0.28
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    ctx.globalAlpha = 0.52 + pulse * 0.28
    ctx.beginPath()
    ctx.arc(point.x, point.y, 10 + pulse * 13, 0, Math.PI * 2)
    ctx.stroke()
  })
  ctx.restore()
}

function drawChargeField(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number, color: string, effect: string) {
  const eased = Math.sin(Math.min(1, progress) * Math.PI * 0.5)
  ctx.save()
  ctx.translate(x, y)
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.72 - eased * 0.25
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 18
  ctx.lineWidth = 2
  ctx.setLineDash([4, 7])
  ctx.rotate(progress * 2.2)
  ctx.beginPath()
  ctx.arc(0, 0, 24 + eased * 13, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.strokeStyle = '#fff2bd'
  ctx.lineWidth = 1
  for (let index = 0; index < 4; index += 1) {
    const angle = index * Math.PI * 0.5 + progress * 3
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * 9, Math.sin(angle) * 9)
    ctx.lineTo(Math.cos(angle) * (20 + eased * 12), Math.sin(angle) * (20 + eased * 12))
    ctx.stroke()
  }
  if (effect === 'thunder') {
    ctx.fillStyle = '#fff5d8'
    ctx.beginPath()
    ctx.moveTo(0, -15)
    ctx.lineTo(-6, 0)
    ctx.lineTo(1, -2)
    ctx.lineTo(-3, 15)
    ctx.lineTo(8, -3)
    ctx.lineTo(1, -1)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function drawImpactPreview(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number, color: string, effect: string) {
  const eased = Math.sin(Math.min(1, progress) * Math.PI)
  ctx.save()
  ctx.translate(x, y)
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = eased * 0.55
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 16
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, 16 + progress * 35, 0, Math.PI * 2)
  ctx.stroke()
  if (effect === 'ice' || effect === 'wind' || effect === 'slash') {
    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6 + progress
      ctx.beginPath()
      ctx.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8)
      ctx.lineTo(Math.cos(angle) * (28 + progress * 20), Math.sin(angle) * (28 + progress * 20))
      ctx.stroke()
    }
  } else if (effect === 'fire') {
    for (let index = 0; index < 5; index += 1) {
      const angle = -Math.PI * 0.78 + (Math.PI * 1.56 * index) / 4
      ctx.beginPath()
      ctx.moveTo(Math.cos(angle) * 12, Math.sin(angle) * 12)
      ctx.lineTo(Math.cos(angle) * (25 + progress * 18), Math.sin(angle) * (25 + progress * 18))
      ctx.stroke()
    }
  } else if (effect === 'thunder') {
    ctx.lineWidth = 2.2
    ctx.beginPath()
    ctx.moveTo(-10, -18)
    ctx.lineTo(2, -5)
    ctx.lineTo(-5, 3)
    ctx.lineTo(14, 18)
    ctx.stroke()
  } else if (effect === 'water' || effect === 'wood') {
    ctx.beginPath()
    ctx.ellipse(0, 0, 24 + progress * 18, 9 + progress * 6, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(0, 0, 12 + progress * 14, 5 + progress * 4, 0, 0, Math.PI * 2)
    ctx.stroke()
  } else if (effect === 'earth') {
    ctx.beginPath()
    ctx.moveTo(-24, 14)
    ctx.lineTo(-10, -10)
    ctx.lineTo(0, 5)
    ctx.lineTo(12, -18)
    ctx.lineTo(26, 14)
    ctx.stroke()
  } else if (effect === 'void_magic') {
    ctx.setLineDash([3, 6])
    ctx.beginPath()
    ctx.arc(0, 0, 20 + progress * 22, -Math.PI * 0.7, Math.PI * 1.1)
    ctx.stroke()
    ctx.setLineDash([])
  }
  ctx.restore()
}

function drawProjectile(ctx: CanvasRenderingContext2D, x: number, y: number, fromX: number, fromY: number, color: string, effect: string, progress: number) {
  const angle = Math.atan2(y - fromY, x - fromX)
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.globalCompositeOperation = 'screen'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (effect === 'fire') {
    drawFireProjectile(ctx, color, progress)
  } else if (effect === 'ice') {
    drawIceProjectile(ctx, color, progress)
  } else if (effect === 'water') {
    drawWaterProjectile(ctx, color, progress)
  } else if (effect === 'wood') {
    drawWoodProjectile(ctx, color, progress)
  } else if (effect === 'earth') {
    drawEarthProjectile(ctx, color, progress)
  } else if (effect === 'wind') {
    drawWindProjectile(ctx, color, progress)
  } else if (effect === 'void_magic') {
    drawVoidProjectile(ctx, color, progress)
  } else {
    drawGenericProjectile(ctx, color, progress)
  }
  ctx.restore()
}

function drawProjectileCore(ctx: CanvasRenderingContext2D, color: string, progress: number, radius = 6) {
  ctx.shadowColor = color
  ctx.shadowBlur = 18
  ctx.fillStyle = '#fff3c6'
  ctx.beginPath()
  ctx.arc(5, 0, radius + Math.sin(progress * Math.PI) * 1.5, 0, Math.PI * 2)
  ctx.fill()
}

function drawGenericProjectile(ctx: CanvasRenderingContext2D, color: string, progress: number) {
  const tail = ctx.createLinearGradient(-58, 0, 8, 0)
  tail.addColorStop(0, 'rgba(255,255,255,0)')
  tail.addColorStop(0.55, `${color}66`)
  tail.addColorStop(1, color)
  ctx.fillStyle = tail
  ctx.beginPath()
  ctx.moveTo(-60, 0)
  ctx.quadraticCurveTo(-24, -7, 7, -3)
  ctx.quadraticCurveTo(-24, 7, -60, 0)
  ctx.fill()
  drawProjectileCore(ctx, color, progress, 5)
}

function drawFireProjectile(ctx: CanvasRenderingContext2D, color: string, progress: number) {
  ctx.shadowColor = color
  ctx.shadowBlur = 24
  for (let index = 0; index < 3; index += 1) {
    const offset = (index - 1) * 5
    ctx.fillStyle = index === 1 ? color : `${color}a8`
    ctx.beginPath()
    ctx.moveTo(-65, offset)
    ctx.bezierCurveTo(-39, offset - 18 - index * 2, -17, offset + 14, 7, offset - 4)
    ctx.bezierCurveTo(-13, offset + 1, -37, offset + 5, -65, offset)
    ctx.fill()
  }
  ctx.fillStyle = '#ffbd73'
  ctx.beginPath()
  ctx.arc(3, -1, 9 + Math.sin(progress * Math.PI) * 2, 0, Math.PI * 2)
  ctx.fill()
  drawProjectileCore(ctx, color, progress, 4)
  ctx.fillStyle = '#ffeec0'
  ctx.beginPath()
  ctx.arc(5, 0, 3, 0, Math.PI * 2)
  ctx.fill()
}

function drawIceProjectile(ctx: CanvasRenderingContext2D, color: string, progress: number) {
  ctx.shadowColor = color
  ctx.shadowBlur = 20
  ctx.strokeStyle = `${color}aa`
  ctx.lineWidth = 2
  for (let index = 0; index < 3; index += 1) {
    const offset = (index - 1) * 9
    ctx.beginPath()
    ctx.moveTo(-58, offset + 8)
    ctx.lineTo(-10, offset - 2)
    ctx.stroke()
  }
  ctx.fillStyle = `${color}c7`
  ctx.beginPath()
  ctx.moveTo(10, 0)
  ctx.lineTo(0, -12 - progress * 3)
  ctx.lineTo(-10, 0)
  ctx.lineTo(0, 12 + progress * 3)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#e9fbff'
  ctx.lineWidth = 1.5
  ctx.stroke()
  for (let index = 0; index < 4; index += 1) {
    const offset = (index - 1.5) * 10
    ctx.fillStyle = `${color}b0`
    ctx.beginPath()
    ctx.moveTo(-22, offset)
    ctx.lineTo(-12, offset - 5)
    ctx.lineTo(-9, offset + 3)
    ctx.closePath()
    ctx.fill()
  }
  drawProjectileCore(ctx, color, progress, 3)
}

function drawWaterProjectile(ctx: CanvasRenderingContext2D, color: string, progress: number) {
  ctx.shadowColor = color
  ctx.shadowBlur = 16
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  for (let index = 0; index < 3; index += 1) {
    const offset = (index - 1) * 8
    ctx.globalAlpha = 0.82 - index * 0.16
    ctx.beginPath()
    ctx.moveTo(-64, offset + 6)
    ctx.bezierCurveTo(-40, offset - 18, -22, offset + 20, 6, offset - 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = `${color}c4`
  ctx.beginPath()
  ctx.ellipse(4, 0, 10 + progress * 2, 7, -0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#e9fbff'
  ctx.lineWidth = 1
  ctx.stroke()
  for (let index = 0; index < 4; index += 1) {
    ctx.fillStyle = '#d9f7ff'
    ctx.beginPath()
    ctx.arc(-18 + index * 8, Math.sin(progress * 5 + index) * 7, 1.5 + index * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawWoodProjectile(ctx: CanvasRenderingContext2D, color: string, progress: number) {
  ctx.shadowColor = color
  ctx.shadowBlur = 17
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  for (let index = 0; index < 3; index += 1) {
    const offset = (index - 1) * 7
    ctx.beginPath()
    ctx.moveTo(-62, offset + 10)
    ctx.bezierCurveTo(-42, offset - 12, -27, offset + 16, -7, offset - 3)
    ctx.stroke()
    ctx.fillStyle = `${color}e0`
    ctx.beginPath()
    ctx.moveTo(-31, offset - 4)
    ctx.lineTo(-22, offset - 12)
    ctx.lineTo(-24, offset + 1)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = `${color}c8`
  ctx.beginPath()
  ctx.arc(4, 0, 8 + Math.sin(progress * Math.PI) * 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#eaffc8'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

function drawEarthProjectile(ctx: CanvasRenderingContext2D, color: string, progress: number) {
  ctx.shadowColor = color
  ctx.shadowBlur = 19
  for (let index = 0; index < 4; index += 1) {
    const offset = (index - 1.5) * 12
    const size = 7 + (index % 2) * 4
    ctx.save()
    ctx.translate(-30 + index * 10, offset + Math.sin(progress * 4 + index) * 4)
    ctx.rotate(index * 0.6 + progress)
    ctx.fillStyle = index % 2 ? `${color}c9` : `${color}8f`
    ctx.beginPath()
    ctx.moveTo(-size, size * 0.6)
    ctx.lineTo(-size * 0.2, -size)
    ctx.lineTo(size, -size * 0.2)
    ctx.lineTo(size * 0.35, size)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  ctx.fillStyle = `${color}d8`
  ctx.beginPath()
  ctx.arc(4, 0, 9 + Math.sin(progress * Math.PI), 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fff0c2'
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawWindProjectile(ctx: CanvasRenderingContext2D, color: string, progress: number) {
  ctx.shadowColor = color
  ctx.shadowBlur = 19
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  for (let index = 0; index < 4; index += 1) {
    const offset = (index - 1.5) * 8
    ctx.globalAlpha = 0.9 - index * 0.12
    ctx.lineWidth = index === 1 || index === 2 ? 3 : 1.6
    ctx.beginPath()
    ctx.moveTo(-64, offset + 13)
    ctx.quadraticCurveTo(-29, offset - 18 - progress * 8, 7, offset - 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#effff8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-4, -10)
  ctx.lineTo(11, 0)
  ctx.lineTo(-4, 10)
  ctx.stroke()
}

function drawVoidProjectile(ctx: CanvasRenderingContext2D, color: string, progress: number) {
  ctx.globalCompositeOperation = 'source-over'
  ctx.shadowColor = color
  ctx.shadowBlur = 24
  ctx.fillStyle = 'rgba(8, 6, 18, 0.96)'
  ctx.beginPath()
  ctx.arc(5, 0, 10 + Math.sin(progress * Math.PI) * 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(5, 0, 15 + progress * 5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 0.65
  ctx.setLineDash([4, 7])
  ctx.beginPath()
  ctx.arc(5, 0, 25 + progress * 8, -Math.PI * 0.8, Math.PI * 0.9)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1
  ctx.fillStyle = '#f3dcff'
  ctx.beginPath()
  ctx.arc(5, 0, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = `${color}66`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-58, 0)
  ctx.lineTo(-14, 0)
  ctx.stroke()
}

function drawLightning(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, progress: number) {
  const points = 7
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 22
  ctx.lineWidth = 4
  ctx.beginPath()
  for (let index = 0; index <= points; index += 1) {
    const ratio = index / points
    const jitter = index === 0 || index === points ? 0 : Math.sin(index * 9.7) * 16
    const x = fromX + (toX - fromX) * ratio + jitter
    const y = fromY + (toY - fromY) * ratio + Math.cos(index * 5.3) * 12
    if (index === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.globalAlpha = 0.84
  ctx.strokeStyle = '#fff5da'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = '#fff5da'
  ctx.beginPath()
  ctx.arc(toX, toY, 5 + Math.sin(progress * Math.PI) * 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSlashTrail(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number, color: string, skillName: string) {
  const count = skillName.includes('万剑') || skillName.includes('剑阵') ? 5 : 2
  ctx.save()
  ctx.translate(x, y)
  ctx.globalCompositeOperation = 'screen'
  ctx.lineCap = 'round'
  for (let index = 0; index < count; index += 1) {
    const offset = (index - (count - 1) / 2) * 13
    const rotation = -0.72 + index * 0.1 + progress * 0.65
    ctx.save()
    ctx.rotate(rotation)
    ctx.strokeStyle = index === Math.floor(count / 2) ? '#fff0b0' : color
    ctx.shadowColor = color
    ctx.shadowBlur = 18
    ctx.lineWidth = index === Math.floor(count / 2) ? 4 : 2
    ctx.beginPath()
    ctx.moveTo(-38, offset + 17)
    ctx.quadraticCurveTo(0, offset - 18, 40, offset - 4)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

function drawSwordThrust(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  x: number,
  y: number,
  progress: number,
  color: string
) {
  const angle = Math.atan2(y - fromY, x - fromX)
  const length = 34 + Math.sin(Math.min(1, progress) * Math.PI) * 18
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.globalCompositeOperation = 'screen'
  ctx.lineCap = 'round'
  ctx.shadowColor = color
  ctx.shadowBlur = 14
  ctx.strokeStyle = '#fff1b5'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-length * 0.62, 0)
  ctx.lineTo(length * 0.45, 0)
  ctx.stroke()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(-length * 0.16, -6)
  ctx.lineTo(-length * 0.16, 6)
  ctx.moveTo(-length * 0.62, -4)
  ctx.lineTo(length * 0.45, -4)
  ctx.stroke()
  ctx.fillStyle = '#fff7cf'
  ctx.beginPath()
  ctx.moveTo(length * 0.72, 0)
  ctx.lineTo(length * 0.38, -5)
  ctx.lineTo(length * 0.45, 0)
  ctx.lineTo(length * 0.38, 5)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawHealOrbit(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.globalCompositeOperation = 'screen'
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 16
  ctx.lineWidth = 2
  ctx.setLineDash([6, 8])
  ctx.rotate(progress * 2.4)
  ctx.beginPath()
  ctx.arc(0, 0, 28 + progress * 16, 0, Math.PI * 2)
  ctx.stroke()
  ctx.rotate(-progress * 4.2)
  ctx.beginPath()
  ctx.arc(0, 0, 16 + progress * 8, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = '#fff2af'
  ctx.fillRect(-2, -14, 4, 28)
  ctx.fillRect(-14, -2, 28, 4)
  ctx.restore()
}

function drawParticles(ctx: CanvasRenderingContext2D, delta: number) {
  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index]
    if (!particle) continue
    particle.life += delta
    if (particle.life >= particle.maxLife) {
      particles.splice(index, 1)
      continue
    }
    const ratio = particle.life / particle.maxLife
    particle.x += particle.vx * delta / 1000
    particle.y += particle.vy * delta / 1000
    particle.vy += particle.gravity * delta / 1000
    particle.rotation += particle.spin * delta
    const alpha = Math.max(0, 1 - ratio) * (ratio < 0.16 ? ratio / 0.16 : 1)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = particle.color
    ctx.strokeStyle = particle.color
    ctx.shadowColor = particle.color
    ctx.shadowBlur = particle.shape === 'spark' ? 13 : 7
    if (particle.shape === 'ring') {
      ctx.lineWidth = Math.max(0.8, particle.size * 0.55)
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * (1 + ratio * 2.4), 0, Math.PI * 2)
      ctx.stroke()
    } else if (particle.shape === 'shard') {
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      ctx.beginPath()
      ctx.moveTo(-particle.size * 1.8, 0)
      ctx.lineTo(particle.size * 1.8, -particle.size * 0.6)
      ctx.lineTo(particle.size * 1.1, particle.size * 0.6)
      ctx.closePath()
      ctx.fill()
    } else if (particle.shape === 'spark') {
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(particle.x - particle.size * 2, particle.y + particle.size * 2)
      ctx.lineTo(particle.x + particle.size * 2, particle.y - particle.size * 2)
      ctx.stroke()
    } else if (particle.shape === 'trail') {
      ctx.lineWidth = Math.max(0.8, particle.size * 0.72)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(particle.x - particle.vx * 0.08, particle.y - particle.vy * 0.08)
      ctx.lineTo(particle.x + particle.vx * 0.02, particle.y + particle.vy * 0.02)
      ctx.stroke()
    } else if (particle.shape === 'flare') {
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      ctx.lineWidth = Math.max(0.9, particle.size * 0.7)
      ctx.beginPath()
      ctx.moveTo(-particle.size * 3.2, 0)
      ctx.lineTo(particle.size * 3.2, 0)
      ctx.moveTo(0, -particle.size * 2.2)
      ctx.lineTo(0, particle.size * 2.2)
      ctx.stroke()
      ctx.fillStyle = '#fff3c6'
      ctx.beginPath()
      ctx.arc(0, 0, particle.size * 0.72, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * (1 - ratio * 0.35), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}

function drawShockwaves(ctx: CanvasRenderingContext2D, delta: number) {
  for (let index = shockwaves.length - 1; index >= 0; index -= 1) {
    const wave = shockwaves[index]
    if (!wave) continue
    wave.life += delta
    if (wave.life >= wave.maxLife) {
      shockwaves.splice(index, 1)
      continue
    }
    const ratio = wave.life / wave.maxLife
    ctx.save()
    ctx.globalAlpha = (1 - ratio) * 0.74
    ctx.strokeStyle = wave.color
    ctx.shadowColor = wave.color
    ctx.shadowBlur = 14
    ctx.lineWidth = wave.width * (1 - ratio * 0.45)
    ctx.beginPath()
    ctx.arc(wave.x, wave.y, wave.radius * (0.4 + ratio), 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

function drawImpactBursts(ctx: CanvasRenderingContext2D, delta: number) {
  for (let index = impactBursts.length - 1; index >= 0; index -= 1) {
    const burst = impactBursts[index]
    if (!burst) continue
    burst.life += delta
    if (burst.life >= burst.maxLife) {
      impactBursts.splice(index, 1)
      continue
    }
    const progress = burst.life / burst.maxLife
    const easeOut = 1 - Math.pow(1 - progress, 2)
    const rayCount = burst.critical ? 14 : 9
    ctx.save()
    ctx.translate(burst.x, burst.y)
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = Math.max(0, 1 - progress) * 0.8
    ctx.strokeStyle = burst.heal ? '#f5df87' : burst.color
    ctx.shadowColor = burst.heal ? '#f5df87' : burst.color
    ctx.shadowBlur = burst.critical ? 25 : 14
    ctx.lineCap = 'round'
    ctx.lineWidth = burst.critical ? 2.5 : 1.6
    for (let ray = 0; ray < rayCount; ray += 1) {
      const angle = (Math.PI * 2 * ray) / rayCount + progress * 0.7
      const inner = 6 + easeOut * 9
      const outer = inner + (burst.critical ? 26 : 18) * Math.sin(Math.min(1, progress) * Math.PI)
      ctx.beginPath()
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
      ctx.stroke()
    }
    ctx.lineWidth = burst.critical ? 3 : 2
    ctx.beginPath()
    ctx.arc(0, 0, 9 + easeOut * (burst.critical ? 30 : 22), 0, Math.PI * 2)
    ctx.stroke()
    drawImpactGlyph(ctx, burst.heal ? 'heal' : burst.vfx.effect, progress, burst.color, burst.critical)
    ctx.restore()
  }
}

function drawImpactGlyph(
  ctx: CanvasRenderingContext2D,
  effect: string,
  progress: number,
  color: string,
  critical: boolean
) {
  const pulse = Math.sin(Math.min(1, progress) * Math.PI)
  const size = (critical ? 28 : 20) * (0.72 + pulse * 0.34)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = Math.max(0, 1 - progress) * 0.78
  ctx.strokeStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = critical ? 24 : 14
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = critical ? 2.2 : 1.5

  if (effect === 'heal') {
    ctx.strokeStyle = '#fff0ae'
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.52)
    ctx.lineTo(0, size * 0.52)
    ctx.moveTo(-size * 0.52, 0)
    ctx.lineTo(size * 0.52, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.72, 0, Math.PI * 2)
    ctx.stroke()
  } else if (effect === 'thunder') {
    ctx.beginPath()
    ctx.moveTo(-size * 0.28, -size * 0.78)
    ctx.lineTo(size * 0.06, -size * 0.14)
    ctx.lineTo(-size * 0.12, -size * 0.14)
    ctx.lineTo(size * 0.34, size * 0.78)
    ctx.lineTo(size * 0.02, size * 0.16)
    ctx.lineTo(size * 0.2, size * 0.16)
    ctx.closePath()
    ctx.stroke()
  } else if (effect === 'ice') {
    for (let index = 0; index < 6; index += 1) {
      const angle = index * Math.PI / 3 + progress * 0.5
      ctx.beginPath()
      ctx.moveTo(Math.cos(angle) * size * 0.18, Math.sin(angle) * size * 0.18)
      ctx.lineTo(Math.cos(angle) * size * 0.88, Math.sin(angle) * size * 0.88)
      ctx.stroke()
    }
  } else if (effect === 'wind' || effect === 'slash') {
    for (let index = 0; index < 2; index += 1) {
      ctx.beginPath()
      ctx.arc(0, 0, size * (0.45 + index * 0.24), -1.15 + index * 0.42, 1.1 + index * 0.42)
      ctx.stroke()
    }
  } else if (effect === 'fire') {
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.9)
    ctx.quadraticCurveTo(size * 0.54, -size * 0.36, size * 0.25, size * 0.72)
    ctx.quadraticCurveTo(0, size * 0.96, -size * 0.25, size * 0.72)
    ctx.quadraticCurveTo(-size * 0.54, -size * 0.36, 0, -size * 0.9)
    ctx.stroke()
  } else if (effect === 'water' || effect === 'wood') {
    ctx.beginPath()
    ctx.ellipse(-size * 0.2, 0, size * 0.52, size * 0.25, -0.32, 0, Math.PI * 2)
    ctx.ellipse(size * 0.22, 0, size * 0.52, size * 0.25, 0.32, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(-size * 0.68, size * 0.42)
    ctx.lineTo(-size * 0.22, -size * 0.72)
    ctx.lineTo(size * 0.08, -size * 0.12)
    ctx.lineTo(size * 0.7, -size * 0.52)
    ctx.lineTo(size * 0.26, size * 0.72)
    ctx.closePath()
    ctx.stroke()
  }
  ctx.restore()
}

function drawStatusPulses(ctx: CanvasRenderingContext2D, delta: number) {
  for (let index = statusPulses.length - 1; index >= 0; index -= 1) {
    const pulse = statusPulses[index]
    if (!pulse) continue
    pulse.life += delta
    if (pulse.life >= pulse.maxLife) {
      statusPulses.splice(index, 1)
      continue
    }
    const progress = pulse.life / pulse.maxLife
    const eased = Math.sin(Math.min(1, progress) * Math.PI)
    ctx.save()
    ctx.translate(pulse.x, pulse.y)
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = Math.max(0, 1 - progress) * 0.78
    ctx.strokeStyle = pulse.color
    ctx.shadowColor = pulse.color
    ctx.shadowBlur = 14
    ctx.lineWidth = pulse.vfx.phase ? 2.6 : 1.8
    ctx.setLineDash(pulse.vfx.phase ? [5, 7] : [3, 8])
    ctx.rotate(progress * (pulse.vfx.phase ? -2.5 : 1.8))
    ctx.beginPath()
    ctx.arc(0, 0, 18 + eased * (pulse.vfx.phase ? 42 : 26), 0, Math.PI * 2)
    ctx.stroke()
    if (pulse.vfx.phase) {
      ctx.globalAlpha *= 0.7
      ctx.beginPath()
      ctx.arc(0, 0, 30 + eased * 34, Math.PI * 0.18, Math.PI * 1.78)
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.restore()

    const label = pulse.vfx.phase ? pulse.vfx.label : pulse.vfx.label ?? statusLabel(pulse.vfx.statusType ?? '')
    if (label && progress < 0.72) {
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - progress / 0.72)
      ctx.fillStyle = pulse.color
      ctx.font = pulse.vfx.phase ? '750 12px PingFang SC, sans-serif' : '700 10px PingFang SC, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = pulse.color
      ctx.shadowBlur = 10
      ctx.fillText(label, pulse.x, pulse.y - 34 - eased * 18)
      ctx.restore()
    }
  }
}

function drawDefeatBursts(ctx: CanvasRenderingContext2D, delta: number) {
  for (let index = defeatBursts.length - 1; index >= 0; index -= 1) {
    const burst = defeatBursts[index]
    if (!burst) continue
    burst.life += delta
    if (burst.life >= burst.maxLife) {
      defeatBursts.splice(index, 1)
      continue
    }
    const progress = burst.life / burst.maxLife
    const eased = 1 - Math.pow(1 - progress, 2)
    ctx.save()
    ctx.translate(burst.x, burst.y)
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = Math.max(0, 1 - progress) * 0.72
    ctx.strokeStyle = burst.color
    ctx.shadowColor = burst.color
    ctx.shadowBlur = burst.outcome === 'defeat' ? 20 : 14
    ctx.lineWidth = burst.outcome === 'defeat' ? 2.4 : 1.7
    ctx.lineCap = 'round'
    if (burst.outcome === 'retreat') {
      ctx.setLineDash([5, 8])
      for (let arc = 0; arc < 2; arc += 1) {
        ctx.beginPath()
        ctx.arc(0, 0, 16 + eased * 40 + arc * 9, -Math.PI * 0.72 + arc * 0.9, Math.PI * 0.8 + arc * 0.9)
        ctx.stroke()
      }
      ctx.setLineDash([])
    } else {
      const rayCount = 10
      for (let ray = 0; ray < rayCount; ray += 1) {
        const angle = (Math.PI * 2 * ray) / rayCount + progress * 0.5
        const inner = 8 + eased * 8
        const outer = inner + Math.sin(Math.min(1, progress) * Math.PI) * 32
        ctx.beginPath()
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(0, 0, 10 + eased * 32, 0, Math.PI * 2)
      ctx.stroke()
      ctx.rotate(progress * 0.5)
      ctx.beginPath()
      ctx.moveTo(-20 - eased * 10, -20 - eased * 10)
      ctx.lineTo(20 + eased * 10, 20 + eased * 10)
      ctx.moveTo(20 + eased * 10, -20 - eased * 10)
      ctx.lineTo(-20 - eased * 10, 20 + eased * 10)
      ctx.stroke()
    }
    ctx.restore()
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, delta: number) {
  for (let index = floatingTexts.length - 1; index >= 0; index -= 1) {
    const text = floatingTexts[index]
    if (!text) continue
    text.life += delta
    if (text.life >= text.maxLife) {
      floatingTexts.splice(index, 1)
      continue
    }
    const ratio = text.life / text.maxLife
    const y = text.y - ratio * 44
    ctx.save()
    ctx.globalAlpha = 1 - ratio
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `750 ${text.size}px PingFang SC, sans-serif`
    ctx.lineWidth = 4
    ctx.strokeStyle = 'rgba(4, 13, 19, 0.8)'
    ctx.strokeText(text.value, text.x, y)
    ctx.fillStyle = text.color
    ctx.shadowColor = text.color
    ctx.shadowBlur = 13
    ctx.fillText(text.value, text.x, y)
    if (text.label) {
      ctx.font = '700 10px PingFang SC, sans-serif'
      ctx.fillStyle = '#fff0b0'
      ctx.fillText(text.label, text.x, y - text.size * 0.78)
    }
    ctx.restore()
  }
}

function render(now: number) {
  if (disposed) return
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const delta = Math.min(40, lastFrame ? now - lastFrame : 16)
  lastFrame = now
  const dpr = (canvas.width / width) || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const shakeRatio = reduceMotion ? 0 : now < shakeUntil ? Math.max(0, (shakeUntil - now) / 280) : 0
  const shakeX = shakeRatio * shakeStrength * Math.sin(now * 0.11)
  const shakeY = shakeRatio * shakeStrength * Math.cos(now * 0.13)
  const visualNow = reduceMotion ? 0 : now
  ctx.save()
  ctx.translate(shakeX, shakeY)
  drawBackground(ctx, visualNow)
  spawnAmbientParticles(delta, now)
  const units = snapshot.value?.units ?? []
  units.forEach(unit => drawUnit(ctx, unit, visualNow))
  commands.forEach(command => {
    if (!drawCommandTrail(ctx, command, now)) {
      const index = commands.indexOf(command)
      if (index >= 0) commands.splice(index, 1)
    }
  })
  drawShockwaves(ctx, delta)
  drawImpactBursts(ctx, delta)
  drawStatusPulses(ctx, delta)
  drawDefeatBursts(ctx, delta)
  drawParticles(ctx, delta)
  drawFloatingTexts(ctx, delta)
  ctx.restore()

  if (now < hitFlashUntil) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, (hitFlashUntil - now) / 150) * 0.16
    ctx.fillStyle = hitFlashColor
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  }
  frameId = requestAnimationFrame(render)
}

onMounted(() => {
  battleInstanceId = getActiveBattleInstanceId()
  if (!battleInstanceId) return
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  resizeObserver = new ResizeObserver(resize)
  if (hostEl.value) resizeObserver.observe(hostEl.value)

  const offSnapshot = gameEvents.on('battle:snapshot', payload => {
    if (!isCurrent(payload.battleInstanceId)) return
    snapshot.value = payload.snapshot
    syncSnapshotVisuals(payload.snapshot)
  })
  const offCommand = gameEvents.on('battle:play-command', handleCommand)
  const offHit = gameEvents.on('battle:damage-number', handleHit)
  const offEnd = gameEvents.on('battle:ended', payload => {
    if (!isCurrent(payload.battleInstanceId)) return
    actionCaption.value = payload.result === 'victory' ? '战场归于寂静' : payload.result === 'fled' ? '你离开了战场' : '灵力从阵中散去'
  })

  markBattleRendererReady(battleInstanceId)
  gameEvents.emit('battle:scene-ready', { sceneKey: 'CanvasBattleRenderer', battleInstanceId })
  frameId = requestAnimationFrame(render)
  cleanupListeners.push(offSnapshot, offCommand, offHit, offEnd)
})

onBeforeUnmount(() => {
  disposed = true
  cleanupListeners.splice(0).forEach(cleanup => cleanup())
  resizeObserver?.disconnect()
  if (frameId) cancelAnimationFrame(frameId)
  particles.length = 0
  floatingTexts.length = 0
  shockwaves.length = 0
  impactBursts.length = 0
  statusPulses.length = 0
  defeatBursts.length = 0
  commands.length = 0
  targetEffectById.clear()
  previousUnitVisuals.clear()
  processedReplayEventIds.clear()
})
</script>

<style scoped>
.canvas-battle-host {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.canvas-battle-caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
  padding: 0;
  margin: -1px;
  color: transparent;
  text-align: center;
  pointer-events: none;
}
</style>
