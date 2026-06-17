import Phaser from 'phaser'
import { gameEvents, type BattleSceneCommand, type BattleSceneHit } from '@/game/engine/gameEvents'
import type { BattleRuntimeSnapshot, BattleRuntimeUnit } from '@/game/battle/battleRuntime'

interface ActorSprite {
  unitId: string
  sprite: Phaser.GameObjects.Sprite
  shadow: Phaser.GameObjects.Ellipse
  hpBar: Phaser.GameObjects.Rectangle
  hpBg: Phaser.GameObjects.Rectangle
  hpFrame: Phaser.GameObjects.Rectangle
  name: Phaser.GameObjects.Text
  side: 'ally' | 'enemy'
}

export class BattleScene extends Phaser.Scene {
  private actors = new Map<string, ActorSprite>()
  private unsubscribers: (() => void)[] = []
  private arena!: Phaser.GameObjects.Container
  private disposed = false
  private ready = false
  private pendingSnapshots: BattleRuntimeSnapshot[] = []
  private pendingCommands: BattleSceneCommand[] = []
  private pendingHits: BattleSceneHit[] = []
  private pendingEndResults: Array<'victory' | 'defeat' | 'fled'> = []

  constructor() {
    super('BattleScene')
  }

  create() {
    this.disposed = false
    this.ready = false
    this.pendingSnapshots = []
    this.pendingCommands = []
    this.pendingHits = []
    this.pendingEndResults = []
    this.cameras.main.setBackgroundColor('#e8f7ff')
    this.createArena()
    this.createAnimations()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.disposeScene())
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.disposeScene())
    this.unsubscribers.push(
      gameEvents.on('battle:snapshot', snapshot => {
        this.pendingSnapshots = [snapshot]
      }),
      gameEvents.on('battle:play-command', command => {
        this.pendingCommands.push(command)
      }),
      gameEvents.on('battle:damage-number', hit => {
        this.pendingHits.push(hit)
      }),
      gameEvents.on('battle:ended', payload => {
        this.pendingEndResults = [payload.result]
      })
    )
    this.time.delayedCall(0, () => {
      if (!this.hasLiveSceneSystems()) return
      this.ready = true
      gameEvents.emit('battle:scene-ready', { sceneKey: 'BattleScene' })
    })
  }

  update() {
    if (!this.canRenderRuntimeEvents()) return

    const snapshot = this.pendingSnapshots.pop()
    if (snapshot) {
      this.pendingSnapshots = []
      this.updateSnapshot(snapshot)
    }

    if (this.pendingCommands.length > 0) {
      const commands = [...this.pendingCommands]
      this.pendingCommands = []
      for (const command of commands) {
        if (!this.canRenderRuntimeEvents()) return
        this.playCommand(command)
      }
    }

    if (this.pendingHits.length > 0) {
      const hits = [...this.pendingHits]
      this.pendingHits = []
      for (const hit of hits) {
        if (!this.canRenderRuntimeEvents()) return
        this.showDamage(hit)
      }
    }

    const endResult = this.pendingEndResults.pop()
    if (endResult) {
      this.pendingEndResults = []
      this.playBattleEnd(endResult)
    }
  }

  shutdown() {
    this.disposeScene()
  }

  private disposeScene() {
    if (this.disposed) return
    this.disposed = true
    this.ready = false
    this.pendingSnapshots = []
    this.pendingCommands = []
    this.pendingHits = []
    this.pendingEndResults = []
    for (const off of this.unsubscribers) off()
    this.unsubscribers = []
    this.actors.clear()
  }

  updateSnapshot(snapshot: BattleRuntimeSnapshot) {
    if (!this.canRenderRuntimeEvents()) return
    this.ensureActors(snapshot.units)
    for (const unit of snapshot.units) {
      const actor = this.actors.get(unit.id)
      if (!actor || !actor.sprite.scene || !actor.name.scene) continue
      const hpRatio = Math.max(0, unit.stats.currentHp / unit.stats.maxHp)
      actor.hpBar.width = 46 * hpRatio
      actor.sprite.setAlpha(unit.isAlive ? 1 : 0.45)
      if (!unit.isAlive && actor.sprite.anims.currentAnim?.key !== `${unit.spriteKey}_down`) {
        actor.sprite.play(`${unit.spriteKey}_down`)
      }
      const gaugeGlow = snapshot.currentActorId === unit.id
      actor.sprite.setTint(gaugeGlow ? 0xfff1ad : 0xffffff)
      actor.name.setColor(gaugeGlow ? '#9d6314' : unit.side === 'ally' ? '#276d68' : '#8b3644')
    }
  }

  private createArena() {
    const { width, height } = this.scale
    this.arena = this.add.container(0, 0)

    this.addBackgroundLayer('bg_cloud_base', 0.5, 0.5, 1.02, 1)
    this.addBackgroundLayer('bg_cloud_glow', 0.5, 0.5, 1.02, 0.42)
    this.addBackgroundLayer('bg_mountain_far', 0.5, 0.44, 1.02, 0.86)
    this.addBackgroundLayer('bg_mountain_near', 0.5, 0.52, 1.02, 0.7)
    this.addDriftingCloud('bg_cloud_1', 0.22, 0.23, 1.15, 0.46, 18000, 52)
    this.addDriftingCloud('bg_cloud_2', 0.72, 0.31, 1.12, 0.42, 21000, -46)
    this.addDriftingCloud('bg_cloud_3', 0.44, 0.48, 1.18, 0.34, 16000, 38)
    this.addDriftingCloud('bg_cloud_4', 0.82, 0.57, 1.2, 0.32, 19000, -34)
    this.createBattleTerrace(width, height)

    const sigil = this.add.graphics()
    sigil.lineStyle(3, 0xd8a944, 0.34)
    sigil.strokeCircle(width / 2, height * 0.54, Math.min(width, height) * 0.21)
    sigil.strokeCircle(width / 2, height * 0.54, Math.min(width, height) * 0.12)
    sigil.lineStyle(1, 0x56b9a8, 0.28)
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4
      const radius = Math.min(width, height) * 0.22
      sigil.beginPath()
      sigil.moveTo(width / 2, height * 0.54)
      sigil.lineTo(width / 2 + Math.cos(angle) * radius, height * 0.54 + Math.sin(angle) * radius)
      sigil.strokePath()
    }
    this.tweens.add({ targets: sigil, angle: 360, duration: 32000, repeat: -1 })
    this.tweens.add({ targets: sigil, alpha: { from: 0.32, to: 0.82 }, scale: { from: 0.94, to: 1.04 }, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    this.arena.add(sigil)

    const sweep = this.add.rectangle(width * 0.5, height * 0.54, width * 0.72, 5, 0xfff0a6, 0.54)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAngle(-5)
    this.tweens.add({
      targets: sweep,
      x: { from: width * 0.16, to: width * 0.84 },
      alpha: { from: 0, to: 0.74 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      repeatDelay: 1300,
      ease: 'Sine.easeInOut'
    })
    this.arena.add(sweep)
  }

  private addBackgroundLayer(key: string, xRatio: number, yRatio: number, fillScale = 1, alpha = 1) {
    const { width, height } = this.scale
    const layer = this.add.image(width * xRatio, height * yRatio, key)
      .setOrigin(0.5)
      .setAlpha(alpha)
      .setScale(Math.max(width / 270, height / 170) * fillScale)
    this.arena.add(layer)
    return layer
  }

  private addDriftingCloud(key: string, xRatio: number, yRatio: number, fillScale: number, alpha: number, duration: number, drift: number) {
    const cloud = this.addBackgroundLayer(key, xRatio, yRatio, fillScale, alpha)
    cloud.setBlendMode(Phaser.BlendModes.SCREEN)
    this.tweens.add({ targets: cloud, x: cloud.x + drift, duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
  }

  private createBattleTerrace(width: number, height: number) {
    const terrace = this.add.graphics()
    const top = height * 0.52
    terrace.fillStyle(0xf3dfb5, 0.48)
    terrace.fillRoundedRect(width * 0.08, top, width * 0.84, height * 0.28, 26)
    terrace.lineStyle(2, 0xd0a85a, 0.24)
    terrace.strokeRoundedRect(width * 0.08, top, width * 0.84, height * 0.28, 26)
    terrace.lineStyle(1, 0xb88f4d, 0.18)
    for (let i = 0; i < 7; i++) {
      const y = top + 18 + i * 30
      terrace.beginPath()
      terrace.moveTo(width * 0.11, y)
      terrace.lineTo(width * 0.89, y + Math.sin(i) * 8)
      terrace.strokePath()
    }
    this.arena.add(terrace)
  }

  private createAnimations() {
    for (const key of ['actor_ally', 'actor_enemy']) {
      if (this.anims.exists(`${key}_idle`)) continue
      this.anims.create({
        key: `${key}_idle`,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1
      })
      this.anims.create({
        key: `${key}_attack`,
        frames: this.anims.generateFrameNumbers(key, { start: 6, end: 8 }),
        frameRate: 16,
        repeat: 0
      })
      this.anims.create({
        key: `${key}_hit`,
        frames: this.anims.generateFrameNumbers(key, { frames: [0, 1, 0] }),
        frameRate: 14,
        repeat: 0
      })
      this.anims.create({
        key: `${key}_down`,
        frames: this.anims.generateFrameNumbers(key, { frames: [3] }),
        frameRate: 1,
        repeat: 0
      })
    }
    if (!this.anims.exists('actor_boss_idle')) {
      this.anims.create({ key: 'actor_boss_idle', frames: this.anims.generateFrameNumbers('actor_boss', { start: 0, end: 2 }), frameRate: 8, repeat: -1 })
      this.anims.create({ key: 'actor_boss_attack', frames: this.anims.generateFrameNumbers('actor_boss', { start: 6, end: 8 }), frameRate: 16, repeat: 0 })
      this.anims.create({ key: 'actor_boss_hit', frames: this.anims.generateFrameNumbers('actor_boss', { frames: [0, 1, 0] }), frameRate: 14, repeat: 0 })
      this.anims.create({ key: 'actor_boss_down', frames: this.anims.generateFrameNumbers('actor_boss', { frames: [3] }), frameRate: 1, repeat: 0 })
    }
  }

  private ensureActors(units: BattleRuntimeUnit[]) {
    const ids = new Set(units.map(unit => unit.id))
    for (const [id, actor] of this.actors.entries()) {
      if (!ids.has(id)) {
        actor.sprite.destroy()
        actor.shadow.destroy()
        actor.hpBar.destroy()
        actor.hpBg.destroy()
        actor.hpFrame.destroy()
        actor.name.destroy()
        this.actors.delete(id)
      }
    }

    const allies = units.filter(unit => unit.side === 'ally')
    const enemies = units.filter(unit => unit.side === 'enemy')
    allies.forEach((unit, index) => this.ensureActor(unit, this.getPosition('ally', index, allies.length)))
    enemies.forEach((unit, index) => this.ensureActor(unit, this.getPosition('enemy', index, enemies.length)))
  }

  private ensureActor(unit: BattleRuntimeUnit, position: { x: number; y: number }) {
    if (!this.canRenderRuntimeEvents()) return
    const existing = this.actors.get(unit.id)
    if (existing) {
      existing.sprite.setPosition(position.x, position.y)
      existing.shadow.setPosition(position.x, position.y + 33)
      existing.hpFrame.setPosition(position.x - 29, position.y - 72)
      existing.hpBg.setPosition(position.x - 25, position.y - 69)
      existing.hpBar.setPosition(position.x - 24, position.y - 69)
      existing.name.setPosition(position.x, position.y - 91)
      return
    }
    const shadow = this.add.ellipse(position.x, position.y + 33, unit.side === 'ally' ? 64 : 58, 18, 0x4e6e68, 0.22)
    const sprite = this.add.sprite(position.x, position.y, unit.spriteKey, 0)
      .setScale(unit.spriteKey === 'actor_boss' ? 3.25 : unit.side === 'ally' ? 3.05 : 2.9)
      .play(`${unit.spriteKey}_idle`)
    sprite.setAlpha(0)
    const hpFrame = this.add.rectangle(position.x - 29, position.y - 72, 58, 10, 0xffffff, 0.78).setOrigin(0, 0.5)
    const hpBg = this.add.rectangle(position.x - 25, position.y - 69, 50, 5, 0xd7c9b1, 0.88).setOrigin(0, 0.5)
    const hpBar = this.add.rectangle(position.x - 24, position.y - 69, 48, 4, unit.side === 'ally' ? 0x45bda9 : 0xe55969, 1).setOrigin(0, 0.5)
    const name = this.add.text(position.x, position.y - 91, unit.name.replace('[BOSS]', '').replace('[精英]', ''), {
      fontFamily: 'serif',
      fontSize: '12px',
      color: unit.side === 'ally' ? '#276d68' : '#8b3644',
      stroke: '#fff8e6',
      strokeThickness: 4
    }).setOrigin(0.5)
    this.tweens.add({ targets: sprite, alpha: 1, y: position.y - 10, duration: 180, ease: 'Quad.easeOut', onComplete: () => sprite.setY(position.y) })
    const aura = this.add.image(position.x, position.y + 2, 'vfx_aura')
      .setAlpha(0.48)
      .setScale(unit.spriteKey === 'actor_boss' ? 0.72 : 0.58)
      .setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({ targets: aura, alpha: 0, scale: aura.scale * 1.4, duration: 820, ease: 'Sine.easeOut', onComplete: () => aura.destroy() })
    this.actors.set(unit.id, { unitId: unit.id, sprite, shadow, hpFrame, hpBg, hpBar, name, side: unit.side })
  }

  private getPosition(side: 'ally' | 'enemy', index: number, total: number) {
    const { width, height } = this.scale
    const centerX = width / 2
    const spacing = Math.min(76, width / Math.max(5, total + 1))
    const offset = (index - (total - 1) / 2) * spacing
    return {
      x: centerX + offset,
      y: side === 'ally' ? height * 0.69 + Math.abs(offset) * 0.06 : height * 0.36 - Math.abs(offset) * 0.04
    }
  }

  private playCommand(command: BattleSceneCommand) {
    if (!this.canRenderRuntimeEvents()) return
    const actor = this.actors.get(command.actorId)
    const target = this.actors.get(command.targetIds[0] ?? '')
    if (!this.isActorAlive(actor) || !this.isActorAlive(target)) return

    const originalX = actor.sprite.x
    const originalY = actor.sprite.y
    const lungeX = target.sprite.x + (actor.side === 'ally' ? -52 : 52)
    const lungeY = target.sprite.y + 8
    if (command.type === 'skill') {
      this.playCastAura(actor)
    }
    actor.sprite.play(`${actor.sprite.texture.key}_attack`)
    this.tweens.add({
      targets: actor.sprite,
      x: lungeX,
      y: lungeY,
      duration: command.type === 'skill' ? 210 : 160,
      ease: 'Quad.easeOut',
      yoyo: true,
      onYoyo: () => {
        if (!this.canRenderRuntimeEvents() || !this.isActorAlive(target)) return
        this.playHitEffects(command, target)
      },
      onComplete: () => {
        if (!this.canRenderRuntimeEvents() || !this.isActorAlive(actor)) return
        actor.sprite.setPosition(originalX, originalY)
        actor.sprite.play(`${actor.sprite.texture.key}_idle`)
      }
    })
  }

  private playHitEffects(command: BattleSceneCommand, target: ActorSprite) {
    if (!this.canRenderRuntimeEvents() || !this.isActorAlive(target)) return
    this.cameras.main.shake(command.type === 'skill' ? 190 : 110, command.type === 'skill' ? 0.008 : 0.004)
    target.sprite.play(`${target.sprite.texture.key}_hit`)
    target.sprite.setTint(0xffffff)
    this.time.addEvent({ delay: 80, callback: () => {
      if (this.isActorAlive(target)) target.sprite.clearTint()
    } })
    target.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.isActorAlive(target)) target.sprite.play(`${target.sprite.texture.key}_idle`)
    })

    const ring = this.add.image(target.sprite.x, target.sprite.y - 4, 'vfx_impact_ring')
      .setScale(command.type === 'skill' ? 0.55 : 0.42)
      .setAlpha(0.96)
      .setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({
      targets: ring,
      alpha: 0,
      scale: command.type === 'skill' ? 1.35 : 0.95,
      duration: command.type === 'skill' ? 360 : 280,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    })

    const slash = this.add.image(target.sprite.x, target.sprite.y - 14, command.type === 'skill' ? 'vfx_skill_slash' : 'vfx_slash')
      .setScale(command.type === 'skill' ? 1.55 : 1.05)
      .setAlpha(0.95)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAngle(target.side === 'enemy' ? -12 : 168)
    this.tweens.add({
      targets: slash,
      alpha: 0,
      scale: slash.scale * 1.35,
      angle: slash.angle + (target.side === 'enemy' ? 18 : -18),
      duration: command.type === 'skill' ? 320 : 240,
      onComplete: () => slash.destroy()
    })
    this.playImpactSparks(target.sprite.x, target.sprite.y - 10, command.type === 'skill' ? 14 : 8)
    this.tweens.add({
      targets: target.sprite,
      scaleX: target.sprite.scaleX * 1.08,
      scaleY: target.sprite.scaleY * 0.92,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut'
    })
  }

  private playCastAura(actor: ActorSprite) {
    if (!this.canRenderRuntimeEvents() || !this.isActorAlive(actor)) return
    const aura = this.add.image(actor.sprite.x, actor.sprite.y + 2, 'vfx_aura')
      .setScale(0.42)
      .setAlpha(0.86)
      .setBlendMode(Phaser.BlendModes.ADD)
    const ring = this.add.image(actor.sprite.x, actor.sprite.y + 2, 'vfx_impact_ring')
      .setScale(0.36)
      .setAlpha(0.72)
      .setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({ targets: aura, scale: 0.9, alpha: 0, duration: 420, ease: 'Sine.easeOut', onComplete: () => aura.destroy() })
    this.tweens.add({ targets: ring, scale: 0.78, alpha: 0, duration: 380, ease: 'Quad.easeOut', onComplete: () => ring.destroy() })
  }

  private playImpactSparks(x: number, y: number, count: number) {
    if (!this.canRenderRuntimeEvents()) return
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.25, 0.25)
      const distance = Phaser.Math.Between(28, 66)
      const spark = this.add.image(x, y, 'vfx_spark')
        .setScale(Phaser.Math.FloatBetween(0.46, 0.82))
        .setAlpha(0.95)
        .setBlendMode(Phaser.BlendModes.ADD)
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance * 0.72,
        alpha: 0,
        scale: 0.08,
        duration: Phaser.Math.Between(260, 460),
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy()
      })
    }
  }

  showDamage(hit: BattleSceneHit) {
    if (!this.canRenderRuntimeEvents()) return
    const target = this.actors.get(hit.targetId)
    if (!this.isActorAlive(target)) return
    const text = this.add.text(target.sprite.x, target.sprite.y - 96, `${hit.isHeal ? '+' : '-'}${hit.amount}`, {
      fontFamily: 'serif',
      fontSize: hit.isCrit ? '24px' : '18px',
      color: hit.isCrit ? '#a85c00' : hit.isHeal ? '#1d9c73' : '#c83f55',
      stroke: '#fff8e6',
      strokeThickness: 5
    }).setOrigin(0.5)
    this.tweens.add({
      targets: text,
      y: text.y - 38,
      alpha: 0,
      duration: 720,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy()
    })
    gameEvents.emit('battle:hit', hit)
  }

  private playBattleEnd(result: 'victory' | 'defeat' | 'fled') {
    if (!this.canRenderRuntimeEvents()) return
    const { width, height } = this.scale
    const veil = this.add.rectangle(width / 2, height / 2, width, height, 0xfff4d6, 0.64)
    const label = this.add.text(width / 2, height / 2, result === 'victory' ? '战斗胜利' : result === 'defeat' ? '战斗败北' : '脱离战场', {
      fontFamily: 'serif',
      fontSize: '34px',
      color: result === 'victory' ? '#9d6314' : '#b93d4c',
      stroke: '#fff8e6',
      strokeThickness: 6
    }).setOrigin(0.5).setScale(0.8)
    this.tweens.add({ targets: [veil, label], alpha: { from: 0, to: 1 }, duration: 260 })
    this.tweens.add({ targets: label, scale: 1, duration: 420, ease: 'Back.easeOut' })
  }

  private canRenderRuntimeEvents() {
    return this.ready && this.hasLiveSceneSystems()
  }

  private hasLiveSceneSystems() {
    const add = this.add as Phaser.GameObjects.GameObjectFactory & {
      scene?: Phaser.Scene | null
      displayList?: unknown
      updateList?: unknown
    }
    return !this.disposed
      && Boolean(this.sys?.isActive())
      && add?.scene === this
      && Boolean(add.displayList)
      && Boolean(add.updateList)
      && Boolean(this.textures)
  }

  private isActorAlive(actor: ActorSprite | undefined): actor is ActorSprite {
    return Boolean(actor?.sprite?.scene === this && actor?.name?.scene === this)
  }
}
