import Phaser from 'phaser'
import { gameEvents } from '@/game/engine/gameEvents'
import battleBgBase from '@/assets/battle/backgrounds/Background02.png'
import battleBgGlow from '@/assets/battle/backgrounds/Background01.png'
import battleMountainFar from '@/assets/battle/backgrounds/BackgroundMountain_01.png'
import battleMountainNear from '@/assets/battle/backgrounds/BackgroundMuntain02.png'
import battleCloudOne from '@/assets/battle/backgrounds/Cloud01.png'
import battleCloudTwo from '@/assets/battle/backgrounds/Cloud02.png'
import battleCloudThree from '@/assets/battle/backgrounds/Cloud03.png'
import battleCloudFour from '@/assets/battle/backgrounds/Clouds04.png'
import rpgCharacterSprites from '@/assets/battle/actors/RPGCharacterSprites32x32-transparent.png'
import rpgSoldierSprites from '@/assets/battle/actors/RPGSoldier32x32-transparent.png'

interface PreloadData {
  startScene?: string
}

export class PreloadScene extends Phaser.Scene {
  private startScene = 'BattleScene'

  constructor() {
    super('PreloadScene')
  }

  init(data: PreloadData) {
    this.startScene = data.startScene ?? 'BattleScene'
  }

  preload() {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('#dff8ff')
    const label = this.add.text(width / 2, height / 2, '凝聚灵气...', {
      fontFamily: 'serif',
      fontSize: '18px',
      color: '#986b22'
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      label.setText(`凝聚灵气 ${Math.round(value * 100)}%`)
      gameEvents.emit('asset:preload-progress', { loaded: Math.round(value * 100), total: 100 })
    })

    this.createGeneratedTextures()
    this.loadBattleAssets()
  }

  create() {
    this.scene.start(this.startScene)
  }

  private createGeneratedTextures() {
    this.createSlashTexture('vfx_slash', 0xf6d78b)
    this.createSlashTexture('vfx_skill_slash', 0x6ee7d8)
    this.createRingTexture('vfx_impact_ring')
    this.createSparkTexture('vfx_spark')
    this.createAuraTexture('vfx_aura')
  }

  private loadBattleAssets() {
    this.load.image('bg_cloud_base', battleBgBase)
    this.load.image('bg_cloud_glow', battleBgGlow)
    this.load.image('bg_mountain_far', battleMountainFar)
    this.load.image('bg_mountain_near', battleMountainNear)
    this.load.image('bg_cloud_1', battleCloudOne)
    this.load.image('bg_cloud_2', battleCloudTwo)
    this.load.image('bg_cloud_3', battleCloudThree)
    this.load.image('bg_cloud_4', battleCloudFour)
    this.load.spritesheet('actor_ally', rpgCharacterSprites, { frameWidth: 32, frameHeight: 32, startFrame: 24, endFrame: 35 })
    this.load.spritesheet('actor_enemy', rpgCharacterSprites, { frameWidth: 32, frameHeight: 32, startFrame: 96, endFrame: 107 })
    this.load.spritesheet('actor_boss', rpgSoldierSprites, { frameWidth: 32, frameHeight: 32, startFrame: 0, endFrame: 17 })
  }

  private createRingTexture(key: string) {
    const canvas = this.textures.createCanvas(key, 120, 120)
    const ctx = canvas?.getContext()
    if (!canvas || !ctx) return

    const gradient = ctx.createRadialGradient(60, 60, 8, 60, 60, 56)
    gradient.addColorStop(0, 'rgba(255,255,255,0)')
    gradient.addColorStop(0.58, 'rgba(255,255,255,0)')
    gradient.addColorStop(0.7, 'rgba(255,238,153,0.92)')
    gradient.addColorStop(0.84, 'rgba(92,219,201,0.58)')
    gradient.addColorStop(1, 'rgba(92,219,201,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 120, 120)
    canvas.refresh()
  }

  private createSparkTexture(key: string) {
    const canvas = this.textures.createCanvas(key, 24, 24)
    const ctx = canvas?.getContext()
    if (!canvas || !ctx) return
    const gradient = ctx.createRadialGradient(12, 12, 1, 12, 12, 11)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(0.35, '#fff0a6')
    gradient.addColorStop(0.72, '#ff9e45')
    gradient.addColorStop(1, 'rgba(255,158,69,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 24, 24)
    canvas.refresh()
  }

  private createAuraTexture(key: string) {
    const canvas = this.textures.createCanvas(key, 160, 160)
    const ctx = canvas?.getContext()
    if (!canvas || !ctx) return
    const gradient = ctx.createRadialGradient(80, 80, 8, 80, 80, 78)
    gradient.addColorStop(0, 'rgba(255,255,255,.32)')
    gradient.addColorStop(0.35, 'rgba(255,235,139,.28)')
    gradient.addColorStop(0.62, 'rgba(94,215,198,.2)')
    gradient.addColorStop(1, 'rgba(94,215,198,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 160, 160)
    canvas.refresh()
  }

  private createSlashTexture(key: string, color: number) {
    const canvas = this.textures.createCanvas(key, 160, 96)
    const ctx = canvas?.getContext()
    if (!canvas || !ctx) return
    const gradient = ctx.createLinearGradient(20, 80, 140, 12)
    gradient.addColorStop(0, 'rgba(255,255,255,0)')
    gradient.addColorStop(0.4, `#${color.toString(16).padStart(6, '0')}`)
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.strokeStyle = gradient
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(24, 76)
    ctx.quadraticCurveTo(70, 10, 140, 18)
    ctx.stroke()
    canvas.refresh()
  }
}
