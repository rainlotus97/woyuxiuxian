import Phaser from 'phaser'
import { DEFAULT_BATTLE_ARENA_ID, getBattleArenaTheme, type BattleArenaTheme } from '@/game/battle/config'
import {
  clearBattleSceneReady,
  gameEvents,
  isActiveBattleInstance,
  getActiveBattleInstanceId,
  markBattleSceneReady,
  type BattleSceneCommand,
  type BattleSceneHit
} from '@/game/engine/gameEvents'
import type { BattleRuntimeSnapshot, BattleRuntimeUnit } from '@/game/battle/battleRuntime'
import { buildBattleArena } from './battleArenaBuilder'
import { resolveBattleFormation, type BattleFormationPlacement } from './battleSceneLayout'
import { getEffectForElement, ELEMENT_EFFECTS } from '@/game/battle/battleEffectsConfig'

interface ActorSprite {
  unitId: string
  spriteKey: string
  battleRole: BattleRuntimeUnit['battleRole']
  icon: Phaser.GameObjects.Text
  crest: Phaser.GameObjects.Ellipse
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
  private battleInstanceId: string | null = null
  private pendingArenaId: string | null = null
  private pendingSnapshots: BattleRuntimeSnapshot[] = []
  private pendingCommands: BattleSceneCommand[] = []
  private pendingHits: BattleSceneHit[] = []
  private pendingEndResults: Array<'victory' | 'defeat' | 'fled'> = []
  private latestUnits = new Map<string, BattleRuntimeUnit>()
  private readyTimer: Phaser.Time.TimerEvent | null = null
  private readyAttempts = 0

  constructor() {
    super('BattleScene')
  }

  create() {
    this.disposed = false
    this.ready = false
    this.battleInstanceId = getActiveBattleInstanceId()
    this.pendingArenaId = null
    this.pendingSnapshots = []
    this.pendingCommands = []
    this.pendingHits = []
    this.pendingEndResults = []
    this.readyAttempts = 0
    this.createArena()
    this.createAnimations()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.disposeScene())
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.disposeScene())
    this.unsubscribers.push(
      gameEvents.on('battle:snapshot', payload => {
        if (!this.isCurrentBattleInstance(payload.battleInstanceId)) return
        this.pendingSnapshots = [payload.snapshot]
      }),
      gameEvents.on('battle:play-command', payload => {
        if (!this.isCurrentBattleInstance(payload.battleInstanceId)) return
        this.pendingCommands.push(payload.command)
      }),
      gameEvents.on('battle:arena-theme', payload => {
        if (!this.isCurrentBattleInstance(payload.battleInstanceId)) return
        this.pendingArenaId = payload.arenaId
      }),
      gameEvents.on('battle:damage-number', payload => {
        if (!this.isCurrentBattleInstance(payload.battleInstanceId)) return
        this.pendingHits.push(payload.hit)
      }),
      gameEvents.on('battle:ended', payload => {
        if (!this.isCurrentBattleInstance(payload.battleInstanceId)) return
        this.pendingEndResults = [payload.result]
      })
    )
    this.game.events.once(Phaser.Core.Events.POST_RENDER, () => {
      this.scheduleReadyProbe(0)
    })
    this.scheduleReadyProbe(24)
  }

  update() {
    if (!this.ready) return
    if (!this.canRenderRuntimeEvents()) return

    const arenaId = this.pendingArenaId
    if (arenaId) {
      this.pendingArenaId = null
      this.applyArenaTheme(arenaId)
      if (!this.canRenderRuntimeEvents()) return
    }

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
    clearBattleSceneReady(this.battleInstanceId)
    this.battleInstanceId = null
    this.pendingArenaId = null
    this.pendingSnapshots = []
    this.pendingCommands = []
    this.pendingHits = []
    this.pendingEndResults = []
    this.latestUnits = new Map()
    this.readyTimer?.destroy()
    this.readyTimer = null
    this.readyAttempts = 0
    this.time?.removeAllEvents()
    this.tweens?.killAll()
    for (const off of this.unsubscribers) off()
    this.unsubscribers = []
    for (const actor of this.actors.values()) {
      this.destroyActor(actor)
    }
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
    this.latestUnits = new Map(snapshot.units.map(unit => [unit.id, unit]))
    this.ensureActors(snapshot.units)
    for (const unit of snapshot.units) {
      const actor = this.actors.get(unit.id)
      if (!actor || !actor.sprite.scene || !actor.name.scene) continue
      const hpRatio = Math.max(0, unit.stats.currentHp / unit.stats.maxHp)
      actor.hpBar.width = 46 * hpRatio
      actor.sprite.setAlpha(unit.isAlive ? 1 : 0.45)
      actor.icon.setAlpha(unit.isAlive ? 1 : 0.45)
      actor.crest.setAlpha(unit.isAlive ? 0.88 : 0.42)
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

  private scheduleReadyProbe(delay: number) {
    if (this.disposed || this.ready || !this.time) return
    this.readyTimer?.destroy()
    this.readyTimer = this.time.delayedCall(delay, () => {
      this.readyTimer = null
      this.tryMarkReady()
    })
  }

  private tryMarkReady() {
    if (this.disposed || this.ready) return
    const battleInstanceId = this.battleInstanceId
    if (
      this.hasRenderableScene()
      && this.hasBattleAssets()
      && battleInstanceId
      && isActiveBattleInstance(battleInstanceId)
    ) {
      this.ready = true
      this.readyAttempts = 0
      markBattleSceneReady(battleInstanceId)
      gameEvents.emit('battle:scene-ready', {
        sceneKey: 'BattleScene',
        battleInstanceId
      })
      return
    }

    this.readyAttempts += 1
    if (this.readyAttempts < 20) {
      this.scheduleReadyProbe(40)
    }
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
        this.destroyActor(actor)
        this.actors.delete(id)
      }
    }

    const allies = units.filter(unit => unit.side === 'ally')
    const enemies = units.filter(unit => unit.side === 'enemy')
    const allyPlacements = this.getPlacements(allies, 'ally')
    const enemyPlacements = this.getPlacements(enemies, 'enemy')
    allies.forEach(unit => this.ensureActor(unit, allyPlacements.get(unit.id)))
    enemies.forEach(unit => this.ensureActor(unit, enemyPlacements.get(unit.id)))
  }

  private ensureActor(unit: BattleRuntimeUnit, placement: BattleFormationPlacement | undefined) {
    const add = this.getRenderableFactory()
    if (!add || !placement) return
    const existing = this.actors.get(unit.id)
    if (existing) {
      this.applyPlacement(existing, placement)
      return
    }
    const shadow = add.ellipse(placement.x, placement.y + 33, placement.shadowWidth, placement.shadowHeight, 0x4e6e68, 0.22)
    const crest = add.ellipse(placement.x, placement.y - 6, Math.max(24, placement.scale * 9), Math.max(24, placement.scale * 9), unit.side === 'ally' ? 0xeafaf5 : 0xffeff1, 0.88)
      .setStrokeStyle(2, this.resolveEffectTint(this.resolveUnitAccentType(unit)), 0.9)
    const sprite = add.sprite(placement.x, placement.y, unit.spriteKey, 0)
      .setScale(placement.scale)
      .play(`${unit.spriteKey}_idle`)
    sprite.setAlpha(0)
    const icon = add.text(placement.x, placement.y - 7, unit.markerText || unit.icon || '·', {
      fontFamily: 'serif',
      fontSize: `${Math.max(14, Math.round(placement.scale * 5.2))}px`,
      color: unit.side === 'ally' ? '#245f57' : '#7f3242',
      stroke: '#fff8e6',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(sprite.depth + 1)
    const hpFrame = add.rectangle(placement.x - 29, placement.y - 72, 58, 10, 0xffffff, 0.78).setOrigin(0, 0.5)
    const hpBg = add.rectangle(placement.x - 25, placement.y - 69, 50, 5, 0xd7c9b1, 0.88).setOrigin(0, 0.5)
    const hpBar = add.rectangle(placement.x - 24, placement.y - 69, 48, 4, unit.side === 'ally' ? 0x45bda9 : 0xe55969, 1).setOrigin(0, 0.5)
    const name = add.text(placement.x, placement.y - 91, unit.name.replace('[BOSS]', '').replace('[精英]', ''), {
      fontFamily: 'serif',
      fontSize: '12px',
      color: unit.side === 'ally' ? '#276d68' : '#8b3644',
      stroke: '#fff8e6',
      strokeThickness: 4
    }).setOrigin(0.5)
    this.tweens.add({ targets: sprite, alpha: 1, y: placement.y - 10, duration: 180, ease: 'Quad.easeOut', onComplete: () => sprite.setY(placement.y) })
    const aura = add.image(placement.x, placement.y + 2, 'vfx_aura')
      .setAlpha(0.48)
      .setScale(Math.max(0.5, placement.scale * 0.2))
      .setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({ targets: aura, alpha: 0, scale: aura.scale * 1.4, duration: 820, ease: 'Sine.easeOut', onComplete: () => aura.destroy() })
    this.actors.set(unit.id, { unitId: unit.id, spriteKey: unit.spriteKey, battleRole: unit.battleRole, icon, crest, sprite, shadow, hpFrame, hpBg, hpBar, name, side: unit.side })
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
    const add = this.getRenderableFactory()
    if (!add || !this.isActorAlive(target)) return
    const sourceUnit = this.latestUnits.get(command.actorId)
    const effectConfig = command.type === 'skill' && command.skillId
      ? getEffectForElement(this.resolveSkillElement(command.skillId, sourceUnit?.element ?? '金'))
      : ELEMENT_EFFECTS.slash
    this.cameras.main.shake(command.type === 'skill' ? 190 : 110, command.type === 'skill' ? 0.008 : 0.004)
    target.sprite.play(`${target.sprite.texture.key}_hit`)
    target.sprite.setTint(0xffffff)
    this.time.addEvent({ delay: 80, callback: () => {
      if (this.isActorAlive(target)) target.sprite.clearTint()
    } })
    target.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.isActorAlive(target)) target.sprite.play(`${target.sprite.texture.key}_idle`)
    })

    const resolvedType = effectConfig.type
    const ring = add.image(target.sprite.x, target.sprite.y - 4, 'vfx_impact_ring')
      .setScale(command.type === 'skill' ? (resolvedType === 'defend' ? 0.72 : 0.55) : 0.42)
      .setAlpha(0.96)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(this.resolveEffectTint(resolvedType))
    this.tweens.add({
      targets: ring,
      alpha: 0,
      scale: command.type === 'skill' ? (resolvedType === 'defend' ? 1.02 : 1.35) : 0.95,
      duration: command.type === 'skill' ? 360 : 280,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    })

    this.playElementEffect(resolvedType, target)
    this.playImpactSparks(target.sprite.x, target.sprite.y - 10, command.type === 'skill' ? 14 : 8, this.resolveEffectTint(resolvedType))
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
    const add = this.getRenderableFactory()
    if (!add || !this.isActorAlive(actor)) return
    const aura = add.image(actor.sprite.x, actor.sprite.y + 2, 'vfx_aura')
      .setScale(0.42)
      .setAlpha(0.86)
      .setBlendMode(Phaser.BlendModes.ADD)
    const ring = add.image(actor.sprite.x, actor.sprite.y + 2, 'vfx_impact_ring')
      .setScale(0.36)
      .setAlpha(0.72)
      .setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({ targets: aura, scale: 0.9, alpha: 0, duration: 420, ease: 'Sine.easeOut', onComplete: () => aura.destroy() })
    this.tweens.add({ targets: ring, scale: 0.78, alpha: 0, duration: 380, ease: 'Quad.easeOut', onComplete: () => ring.destroy() })
  }

  private playImpactSparks(x: number, y: number, count: number, tint: number) {
    const add = this.getRenderableFactory()
    if (!add) return
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.25, 0.25)
      const distance = Phaser.Math.Between(28, 66)
      const spark = add.image(x, y, 'vfx_spark')
        .setScale(Phaser.Math.FloatBetween(0.46, 0.82))
        .setAlpha(0.95)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(tint)
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

  private playElementEffect(type: string, target: ActorSprite) {
    const add = this.getRenderableFactory()
    if (!add) return

    if (type === 'fire') {
      const blaze = add.ellipse(target.sprite.x, target.sprite.y - 10, 54, 66, 0xff9a5a, 0.14)
        .setStrokeStyle(2, 0xffc97d, 0.9)
      this.tweens.add({
        targets: blaze,
        alpha: 0,
        scaleX: 1.24,
        scaleY: 1.18,
        duration: 260,
        onComplete: () => blaze.destroy()
      })
      for (let i = 0; i < 4; i++) {
        const flame = add.circle(target.sprite.x + (i - 1.5) * 10, target.sprite.y - 12 - i * 8, 7 + i * 2, 0xff8d57, 0.88)
          .setBlendMode(Phaser.BlendModes.ADD)
        this.tweens.add({
          targets: flame,
          y: flame.y - 32,
          alpha: 0,
          scale: 1.56,
          duration: 260 + i * 50,
          onComplete: () => flame.destroy()
        })
      }
      return
    }

    if (type === 'ice') {
      const frost = add.ellipse(target.sprite.x, target.sprite.y - 8, 58, 72, 0x8ed9ff, 0.1)
        .setStrokeStyle(2, 0xc8ecff, 0.92)
      this.tweens.add({
        targets: frost,
        alpha: 0,
        scaleX: 1.12,
        scaleY: 1.08,
        duration: 280,
        onComplete: () => frost.destroy()
      })
      for (let i = 0; i < 5; i++) {
        const shard = add.rectangle(target.sprite.x - 20 + i * 10, target.sprite.y - 18 + (i % 2) * 5, 5, 18, 0x8ed9ff, 0.94)
          .setAngle(i % 2 === 0 ? -28 : 24)
          .setBlendMode(Phaser.BlendModes.ADD)
        this.tweens.add({
          targets: shard,
          y: shard.y + 22,
          alpha: 0,
          duration: 340,
          onComplete: () => shard.destroy()
        })
      }
      return
    }

    if (type === 'defend' || type === 'block') {
      const shield = add.ellipse(target.sprite.x, target.sprite.y - 8, 62, 76, 0xe5f5c8, 0.16)
        .setStrokeStyle(3, type === 'block' ? 0xf1c982 : 0xbfe28a, 0.9)
      const guard = add.image(target.sprite.x, target.sprite.y - 10, 'vfx_impact_ring')
        .setScale(0.56)
        .setAlpha(0.78)
        .setTint(type === 'block' ? 0xf1c982 : 0xbfe28a)
        .setBlendMode(Phaser.BlendModes.ADD)
      this.tweens.add({
        targets: shield,
        alpha: 0,
        scaleX: 1.12,
        scaleY: 1.08,
        duration: 340,
        onComplete: () => shield.destroy()
      })
      this.tweens.add({
        targets: guard,
        alpha: 0,
        scale: 0.92,
        duration: 280,
        onComplete: () => guard.destroy()
      })
      return
    }

    const slash = add.image(target.sprite.x, target.sprite.y - 14, 'vfx_slash')
      .setScale(0.92)
      .setAlpha(0.84)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(this.resolveEffectTint(type))
      .setAngle(target.side === 'enemy' ? -12 : 168)
    this.tweens.add({
      targets: slash,
      alpha: 0,
      scale: slash.scale * 1.3,
      angle: slash.angle + (target.side === 'enemy' ? 18 : -18),
      duration: 220,
      onComplete: () => slash.destroy()
    })
  }

  showDamage(hit: BattleSceneHit) {
    const add = this.getRenderableFactory()
    if (!add) return
    const target = this.actors.get(hit.targetId)
    if (!this.isActorAlive(target)) return
    const text = add.text(target.sprite.x, target.sprite.y - 96, `${hit.isHeal ? '+' : '-'}${hit.amount}`, {
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
    if (this.battleInstanceId) {
      gameEvents.emit('battle:hit', { hit, battleInstanceId: this.battleInstanceId })
    }
  }

  private playBattleEnd(result: 'victory' | 'defeat' | 'fled') {
    const add = this.getRenderableFactory()
    if (!add) return
    const { width, height } = this.scale
    const veil = add.rectangle(width / 2, height / 2, width, height, 0xfff4d6, 0.64)
    const label = add.text(width / 2, height / 2, result === 'victory' ? '战斗胜利' : result === 'defeat' ? '战斗败北' : '脱离战场', {
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
    return this.ready && this.hasRenderableScene() && Boolean(this.battleInstanceId)
  }

  private hasRenderableScene() {
    const add = this.add as Phaser.GameObjects.GameObjectFactory & {
      scene?: Phaser.Scene | null
      displayList?: Phaser.GameObjects.DisplayList | null
      updateList?: Phaser.GameObjects.UpdateList | null
    }
    const sys = this.sys
    return !this.disposed
      && Boolean(sys?.isActive())
      && Boolean(sys?.displayList)
      && Boolean(sys?.updateList)
      && Boolean(sys?.game?.renderer)
      && Boolean(this.cameras?.main)
      && Boolean(this.time)
      && Boolean(this.tweens)
      && Boolean(this.textures)
      && Boolean(add?.displayList)
      && Boolean(add?.updateList)
      && add?.scene === this
  }

  private hasBattleAssets() {
    return ['actor_ally', 'actor_enemy', 'actor_boss', 'vfx_aura', 'vfx_impact_ring', 'vfx_spark', 'vfx_slash', 'vfx_skill_slash']
      .every(key => this.textures.exists(key))
  }

  private getRenderableFactory() {
    if (!this.canRenderRuntimeEvents()) return null
    const add = this.add as Phaser.GameObjects.GameObjectFactory & {
      scene?: Phaser.Scene | null
      displayList?: Phaser.GameObjects.DisplayList | null
      updateList?: Phaser.GameObjects.UpdateList | null
    } | null

    if (!add || add.scene !== this || !add.displayList || !add.updateList) {
      return null
    }

    return add
  }

  private isActorAlive(actor: ActorSprite | undefined): actor is ActorSprite {
    return Boolean(actor?.sprite?.scene === this && actor?.name?.scene === this)
  }

  private isCurrentBattleInstance(battleInstanceId: string) {
    return Boolean(this.battleInstanceId && battleInstanceId === this.battleInstanceId)
  }

  private resolveSkillElement(skillId: string, fallback: string) {
    if (skillId.includes('fire')) return '火'
    if (skillId.includes('ice')) return '冰'
    if (skillId.includes('thunder')) return '雷'
    if (skillId.includes('shield') || skillId.includes('defense')) return '防'
    return fallback
  }

  private resolveEffectTint(type: string) {
    const tintMap: Record<string, number> = {
      slash: 0xf8d781,
      fire: 0xff8d57,
      ice: 0x8ed9ff,
      thunder: 0xd8b5ff,
      wind: 0xc8f1d0,
      earth: 0xd9b381,
      water: 0x7dd9e8,
      wood: 0x9be28e,
      defend: 0xe3f0b8
    }
    return tintMap[type] ?? 0xf8d781
  }

  private relayoutActors() {
    if (this.actors.size === 0 || this.latestUnits.size === 0) return
    const allyUnits = Array.from(this.latestUnits.values()).filter(unit => unit.side === 'ally')
    const enemyUnits = Array.from(this.latestUnits.values()).filter(unit => unit.side === 'enemy')
    const allyPlacements = this.getPlacements(allyUnits, 'ally')
    const enemyPlacements = this.getPlacements(enemyUnits, 'enemy')

    for (const unit of allyUnits) {
      const actor = this.actors.get(unit.id)
      const placement = allyPlacements.get(unit.id)
      if (actor && placement) this.applyPlacement(actor, placement)
    }
    for (const unit of enemyUnits) {
      const actor = this.actors.get(unit.id)
      const placement = enemyPlacements.get(unit.id)
      if (actor && placement) this.applyPlacement(actor, placement)
    }
  }

  private applyPlacement(actor: ActorSprite, placement: BattleFormationPlacement) {
    const isMobile = this.scale.width <= 720
    const nameYOffset = isMobile ? 102 : 91
    const hpYOffset = isMobile ? 80 : 72
    actor.battleRole = placement.role
    actor.sprite.setPosition(placement.x, placement.y)
    actor.sprite.setScale(placement.scale)
    actor.crest.setPosition(placement.x, placement.y - 6)
    actor.crest.width = Math.max(24, placement.scale * 9)
    actor.crest.height = Math.max(24, placement.scale * 9)
    actor.icon.setPosition(placement.x, placement.y - 7)
    actor.icon.setFontSize(Math.max(14, Math.round(placement.scale * 5.2)))
    actor.shadow.setPosition(placement.x, placement.y + 33)
    actor.shadow.width = placement.shadowWidth
    actor.shadow.height = placement.shadowHeight
    actor.hpFrame.setPosition(placement.x - 29, placement.y - hpYOffset)
    actor.hpBg.setPosition(placement.x - 25, placement.y - (hpYOffset - 3))
    actor.hpBar.setPosition(placement.x - 24, placement.y - (hpYOffset - 3))
    actor.name.setPosition(placement.x, placement.y - nameYOffset)
  }

  private getPlacements(units: BattleRuntimeUnit[], side: 'ally' | 'enemy') {
    return resolveBattleFormation(units, this.arenaTheme, side, this.scale.width, this.scale.height)
  }

  private destroyActor(actor: ActorSprite) {
    actor.icon.destroy()
    actor.crest.destroy()
    actor.sprite.destroy()
    actor.shadow.destroy()
    actor.hpBar.destroy()
    actor.hpBg.destroy()
    actor.hpFrame.destroy()
    actor.name.destroy()
  }

  private resolveUnitAccentType(unit: BattleRuntimeUnit) {
    if (unit.element.includes('火')) return 'fire'
    if (unit.element.includes('冰')) return 'ice'
    if (unit.element.includes('雷')) return 'thunder'
    if (unit.element.includes('风')) return 'wind'
    if (unit.element.includes('木')) return 'wood'
    if (unit.element.includes('水')) return 'water'
    if (unit.element.includes('土')) return 'earth'
    return unit.side === 'ally' ? 'defend' : 'slash'
  }
}
