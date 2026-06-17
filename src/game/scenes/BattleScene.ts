import Phaser from 'phaser'
import { DEFAULT_BATTLE_ARENA_ID, getBattleArenaTheme, type BattleArenaTheme } from '@/game/battle/config'
import { gameEvents, type BattleSceneCommand, type BattleSceneHit } from '@/game/engine/gameEvents'
import type { BattleRuntimeSnapshot, BattleRuntimeUnit } from '@/game/battle/battleRuntime'
import { buildBattleArena } from './battleArenaBuilder'
import { getBattleActorPosition, getBattleActorScale, getBattleShadowSize } from './battleSceneLayout'

interface ActorSprite {
  unitId: string
  spriteKey: string
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
  private arenaTheme: BattleArenaTheme = getBattleArenaTheme(DEFAULT_BATTLE_ARENA_ID)
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
      gameEvents.on('battle:arena-theme', payload => {
        this.applyArenaTheme(payload.arenaId)
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

  private applyArenaTheme(arenaId: string) {
    this.arenaTheme = getBattleArenaTheme(arenaId)
    if (!this.sys?.isActive()) return
    this.cameras.main.setBackgroundColor(this.arenaTheme.cameraBackgroundColor)
    this.rebuildArena()
    this.relayoutActors()
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
    this.cameras.main.setBackgroundColor(this.arenaTheme.cameraBackgroundColor)
    this.arena = buildBattleArena(this, this.arenaTheme)
  }

  private rebuildArena() {
    this.arena?.destroy(true)
    this.arena = buildBattleArena(this, this.arenaTheme)
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
      existing.sprite.setScale(getBattleActorScale(this.arenaTheme, unit.side, unit.spriteKey))
      const shadowSize = getBattleShadowSize(this.arenaTheme, unit.side)
      existing.shadow.width = shadowSize.width
      existing.shadow.height = shadowSize.height
      return
    }
    const shadowSize = getBattleShadowSize(this.arenaTheme, unit.side)
    const shadow = this.add.ellipse(position.x, position.y + 33, shadowSize.width, shadowSize.height, 0x4e6e68, 0.22)
    const sprite = this.add.sprite(position.x, position.y, unit.spriteKey, 0)
      .setScale(getBattleActorScale(this.arenaTheme, unit.side, unit.spriteKey))
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
    this.actors.set(unit.id, { unitId: unit.id, spriteKey: unit.spriteKey, sprite, shadow, hpFrame, hpBg, hpBar, name, side: unit.side })
  }

  private getPosition(side: 'ally' | 'enemy', index: number, total: number) {
    const { width, height } = this.scale
    return getBattleActorPosition(width, height, this.arenaTheme, side, index, total)
  }

  private playCommand(command: BattleSceneCommand) {
    if (!this.canRenderRuntimeEvents()) return
    const actor = this.actors.get(command.actorId)
    const target = this.actors.get(command.targetIds[0] ?? '')
    if (!this.isActorAlive(actor) || !this.isActorAlive(target)) return

    const originalX = actor.sprite.x
    const originalY = actor.sprite.y
    const lungeX = target.sprite.x + (actor.side === 'ally' ? -this.arenaTheme.layout.lungeOffsetX : this.arenaTheme.layout.lungeOffsetX)
    const lungeY = target.sprite.y + this.arenaTheme.layout.lungeOffsetY
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

  private relayoutActors() {
    if (this.actors.size === 0) return
    const runtimeUnits = Array.from(this.actors.keys())
    const allies = runtimeUnits
      .map(id => this.actors.get(id))
      .filter((actor): actor is ActorSprite => Boolean(actor && actor.side === 'ally'))
    const enemies = runtimeUnits
      .map(id => this.actors.get(id))
      .filter((actor): actor is ActorSprite => Boolean(actor && actor.side === 'enemy'))

    allies.forEach((actor, index) => this.relayoutActor(actor, this.getPosition('ally', index, allies.length)))
    enemies.forEach((actor, index) => this.relayoutActor(actor, this.getPosition('enemy', index, enemies.length)))
  }

  private relayoutActor(actor: ActorSprite, position: { x: number; y: number }) {
    const shadowSize = getBattleShadowSize(this.arenaTheme, actor.side)
    actor.sprite.setPosition(position.x, position.y)
    actor.sprite.setScale(getBattleActorScale(this.arenaTheme, actor.side, actor.spriteKey))
    actor.shadow.setPosition(position.x, position.y + 33)
    actor.shadow.width = shadowSize.width
    actor.shadow.height = shadowSize.height
    actor.hpFrame.setPosition(position.x - 29, position.y - 72)
    actor.hpBg.setPosition(position.x - 25, position.y - 69)
    actor.hpBar.setPosition(position.x - 24, position.y - 69)
    actor.name.setPosition(position.x, position.y - 91)
  }
}
