import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { createServer } from 'vite'

const root = resolve(process.cwd())

const server = await createServer({
  root,
  configFile: resolve(root, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error'
})

const diagnostics = []

async function load(modulePath) {
  return server.ssrLoadModule(modulePath)
}

function test(name, fn) {
  diagnostics.push(Promise.resolve()
    .then(fn)
    .then(() => ({ name, ok: true }))
    .catch(error => ({ name, ok: false, error })))
}

test('battle runtime resolves lethal command and replay', async () => {
  const { BattleRuntime } = await load('/src/game/battle/battleRuntime.ts')
  const { createUnit } = await load('/src/types/unit.ts')

  const ally = createUnit({
    id: 'ally',
    name: '试炼弟子',
    type: 'protagonist',
    stats: {
      maxHp: 120,
      currentHp: 120,
      maxMp: 50,
      currentMp: 50,
      attack: 80,
      defense: 5,
      speed: 100,
      critRate: 0,
      critDamage: 1.5
    }
  })
  const enemy = createUnit({
    id: 'enemy',
    name: '试炼妖兽',
    type: 'enemy',
    stats: {
      maxHp: 20,
      currentHp: 20,
      maxMp: 30,
      currentMp: 30,
      attack: 8,
      defense: 0,
      speed: 60,
      critRate: 0,
      critDamage: 1.5
    }
  })

  const runtime = new BattleRuntime([ally], [enemy])
  const resolved = runtime.resolveCommand({ type: 'attack', actorId: 'ally', targetIds: ['enemy'] })
  assert.ok(resolved, 'attack command should resolve')
  runtime.applyResolvedCommand(resolved)

  const snapshot = runtime.snapshot()
  assert.equal(snapshot.phase, 'ended')
  assert.equal(snapshot.result, 'victory')
  assert.ok(snapshot.logs.some(log => log.text.includes('战斗胜利')))
  assert.ok(runtime.getReplayEvents().some(event => event.type === 'battle_end'))
})

test('story battle replay archive summarizes and dedupes route sessions', async () => {
  const {
    clearStoryBattleReplayArchive,
    createStoryBattleReplayRecord,
    getStoryBattleReplayRecord,
    getStoryBattleReplaySummaries,
    saveStoryBattleReplayRecord
  } = await load('/src/story/runtime/storyBattleReplayArchive.ts')
  const { createStoryBattleReplayViewerState } = await load('/src/story/runtime/storyBattleReplayViewer.ts')

  clearStoryBattleReplayArchive()
  const record = createStoryBattleReplayRecord({
    sessionId: 'story-session-a',
    storyBattleId: 'ambush_test',
    targetId: 'ambush_test',
    result: 'victory',
    now: 1000,
    events: [
      { id: 'e1', turn: 1, type: 'battle_start', text: '战斗开始。', severity: 'major' },
      { id: 'e2', turn: 1, type: 'command', text: '试炼弟子出剑。', severity: 'major' },
      { id: 'e3', turn: 2, type: 'battle_end', text: '战斗胜利。', severity: 'major', payload: { result: 'victory' } }
    ]
  })

  assert.equal(record.resultLabel, '胜利')
  assert.equal(record.eventCount, 3)
  assert.equal(record.majorEventCount, 3)
  assert.equal(record.turns, 2)
  assert.deepEqual(record.highlights, ['试炼弟子出剑。', '战斗胜利。'])

  saveStoryBattleReplayRecord(record)
  saveStoryBattleReplayRecord({
    ...record,
    id: 'story-battle-replay-retry',
    result: 'defeat',
    resultLabel: '败北'
  })

  const summaries = getStoryBattleReplaySummaries()
  assert.equal(summaries.length, 1)
  assert.equal(summaries[0].sessionId, 'story-session-a')
  assert.equal(summaries[0].resultLabel, '败北')

  const savedRecord = getStoryBattleReplayRecord('story-battle-replay-retry')
  assert.ok(savedRecord, 'saved replay record should be readable by id')
  const viewer = createStoryBattleReplayViewerState(savedRecord)
  assert.equal(viewer.totalTurns, 2)
  assert.equal(viewer.turns.length, 2)
  assert.equal(viewer.turns[0].title, '第 1 手')
  assert.deepEqual(viewer.actorNames, [])
  assert.equal(viewer.turns[1].events[0].typeLabel, '终局')
  assert.equal(viewer.turns[1].events[0].payloadText, 'victory')
  assert.equal(viewer.turns[1].events[0].detailText, 'victory')
})

test('battle runtime tracks skill cooldown by actor turns', async () => {
  const { BattleRuntime } = await load('/src/game/battle/battleRuntime.ts')
  const { createUnit } = await load('/src/types/unit.ts')

  const ally = createUnit({
    id: 'cooldown_ally',
    name: '冷却试炼者',
    type: 'protagonist',
    skills: ['sword_qi'],
    stats: {
      maxHp: 200,
      currentHp: 200,
      maxMp: 80,
      currentMp: 80,
      attack: 24,
      defense: 5,
      speed: 120,
      critRate: 0,
      critDamage: 1.5
    }
  })
  const enemy = createUnit({
    id: 'cooldown_enemy',
    name: '厚甲木桩',
    type: 'enemy',
    stats: {
      maxHp: 500,
      currentHp: 500,
      maxMp: 30,
      currentMp: 30,
      attack: 1,
      defense: 6,
      speed: 1,
      critRate: 0,
      critDamage: 1.5
    }
  })

  const runtime = new BattleRuntime([ally], [enemy])
  const resolved = runtime.resolveCommand({
    type: 'skill',
    actorId: 'cooldown_ally',
    targetIds: ['cooldown_enemy'],
    skillId: 'sword_qi'
  })
  assert.ok(resolved, 'cooldown skill should resolve before use')
  runtime.applyResolvedCommand(resolved)
  const actor = runtime.units.find(unit => unit.id === 'cooldown_ally')
  assert.ok(actor, 'actor should remain in runtime')
  assert.equal(actor.skillCooldowns.sword_qi, 2)
  assert.equal(runtime.resolveCommand({
    type: 'skill',
    actorId: 'cooldown_ally',
    targetIds: ['cooldown_enemy'],
    skillId: 'sword_qi'
  }), null)

  actor.actionGauge = 100
  runtime.tick(16, 1)
  assert.equal(actor.skillCooldowns.sword_qi, 1)
  assert.equal(runtime.getAvailableSkills(actor.id).some(skill => skill.id === 'sword_qi'), false)

  runtime.finishAction()
  actor.actionGauge = 100
  runtime.tick(16, 1)
  assert.equal(actor.skillCooldowns.sword_qi, 0)
  assert.equal(runtime.getAvailableSkills(actor.id).some(skill => skill.id === 'sword_qi'), true)
})

test('battle summon exits after configured action turns', async () => {
  const { BattleRuntime } = await load('/src/game/battle/battleRuntime.ts')
  const { createUnit } = await load('/src/types/unit.ts')

  const owner = createUnit({
    id: 'summon_owner',
    name: '召唤修士',
    type: 'enemy',
    stats: {
      maxHp: 300,
      currentHp: 300,
      maxMp: 80,
      currentMp: 80,
      attack: 1,
      defense: 10,
      speed: 1,
      critRate: 0,
      critDamage: 1.5
    }
  })
  const summon = createUnit({
    id: 'summon_guard',
    name: '深渊魔侍',
    type: 'summon',
    summonOwnerId: 'summon_owner',
    summonDefinitionId: 'abyss_guard',
    summonRemainingTurns: 2,
    stats: {
      maxHp: 120,
      currentHp: 120,
      maxMp: 0,
      currentMp: 0,
      attack: 1,
      defense: 10,
      speed: 100,
      critRate: 0,
      critDamage: 1.5
    }
  })
  const target = createUnit({
    id: 'summon_target',
    name: '木傀',
    type: 'protagonist',
    stats: {
      maxHp: 500,
      currentHp: 500,
      maxMp: 50,
      currentMp: 50,
      attack: 1,
      defense: 50,
      speed: 1,
      critRate: 0,
      critDamage: 1.5
    }
  })

  const runtime = new BattleRuntime([target], [owner, summon])
  let resolved = runtime.resolveCommand({
    type: 'attack',
    actorId: 'summon_guard',
    targetIds: ['summon_target']
  })
  assert.ok(resolved, 'summon first attack should resolve')
  runtime.applyResolvedCommand(resolved)
  let runtimeSummon = runtime.units.find(unit => unit.id === 'summon_guard')
  assert.ok(runtimeSummon?.isAlive)
  assert.equal(runtimeSummon.summonRemainingTurns, 1)

  resolved = runtime.resolveCommand({
    type: 'attack',
    actorId: 'summon_guard',
    targetIds: ['summon_target']
  })
  assert.ok(resolved, 'summon second attack should resolve')
  runtime.applyResolvedCommand(resolved)
  runtimeSummon = runtime.units.find(unit => unit.id === 'summon_guard')
  assert.equal(runtimeSummon?.isAlive, false)
  assert.equal(runtimeSummon?.summonRemainingTurns, 0)
  assert.ok(runtime.getReplayEvents().some(event =>
    event.type === 'summon_exit'
    && event.actor?.id === 'summon_guard'
    && event.text.includes('退离战场')
  ))
})

test('battle summons use dedicated skills', async () => {
  const { BattleRuntime } = await load('/src/game/battle/battleRuntime.ts')
  const { createSummonRuntimeUnit } = await load('/src/game/battle/runtimeUnitFactory.ts')
  const { createUnit } = await load('/src/types/unit.ts')

  const owner = createUnit({
    id: 'summon_skill_owner',
    name: '魔修',
    type: 'enemy',
    stats: {
      maxHp: 300,
      currentHp: 300,
      maxMp: 80,
      currentMp: 80,
      attack: 10,
      defense: 10,
      speed: 1,
      critRate: 0,
      critDamage: 1.5
    }
  })
  const target = createUnit({
    id: 'summon_skill_target',
    name: '试炼木傀',
    type: 'protagonist',
    stats: {
      maxHp: 500,
      currentHp: 500,
      maxMp: 50,
      currentMp: 50,
      attack: 1,
      defense: 8,
      speed: 1,
      critRate: 0,
      critDamage: 1.5
    }
  })

  const runtime = new BattleRuntime([target], [owner])
  const runtimeOwner = runtime.units.find(unit => unit.id === 'summon_skill_owner')
  assert.ok(runtimeOwner, 'owner should be converted into runtime unit')
  const summon = createSummonRuntimeUnit('abyss_guard', runtimeOwner, 1)
  assert.ok(summon, 'abyss guard summon should be created')
  runtime.units.push(summon)

  const summonSkills = runtime.getActorSkills(summon.id)
  assert.equal(summonSkills[0]?.id, 'abyss_claw')
  assert.equal(summonSkills[0]?.name, '魔侍裂爪')

  const originalRandom = Math.random
  Math.random = () => 0
  try {
    const command = runtime.createAutoCommand(summon.id)
    assert.equal(command?.type, 'skill')
    assert.equal(command?.skillId, 'abyss_claw')
    assert.deepEqual(command?.targetIds, ['summon_skill_target'])

    const resolved = runtime.resolveCommand(command)
    assert.ok(resolved, 'summon dedicated skill command should resolve')
    runtime.applyResolvedCommand(resolved)
  } finally {
    Math.random = originalRandom
  }

  const damagedTarget = runtime.units.find(unit => unit.id === 'summon_skill_target')
  assert.ok(damagedTarget && damagedTarget.stats.currentHp < 500)
  assert.ok(damagedTarget?.statusEffects.some(effect => effect.type === 'bleed'))
  assert.ok(runtime.getReplayEvents().some(event =>
    event.type === 'command'
    && event.actor?.id === summon.id
    && event.payload?.skillId === 'abyss_claw'
  ))
})

test('battle status runtime negates damage while invincible', async () => {
  const { BattleRuntime } = await load('/src/game/battle/battleRuntime.ts')
  const { processTurnStartStatuses } = await load('/src/game/battle/statusRuntime.ts')
  const {
    resolveBattleCounterDamage,
    resolveBattleDamageModifier,
    resolveBattleDodgeChance,
    resolveBattleElementDamageModifier,
    resolveBattleLifestealAmount,
    resolveBattleSpeedModifier
  } = await load('/src/game/battle/battleStatusModifierResolver.ts')
  const { createUnit } = await load('/src/types/unit.ts')

  const ally = createUnit({
    id: 'invincible_attacker',
    name: '破阵者',
    type: 'protagonist',
    stats: {
      maxHp: 120,
      currentHp: 120,
      maxMp: 50,
      currentMp: 50,
      attack: 120,
      defense: 5,
      speed: 100,
      critRate: 0,
      critDamage: 1.5
    }
  })
  const enemy = createUnit({
    id: 'invincible_target',
    name: '无相护体者',
    type: 'enemy',
    statusEffects: [
      { type: 'invincible', duration: 2, sourceId: 'self' }
    ],
    stats: {
      maxHp: 80,
      currentHp: 80,
      maxMp: 30,
      currentMp: 30,
      attack: 8,
      defense: 0,
      speed: 80,
      critRate: 0,
      critDamage: 1.5
    }
  })

  const runtime = new BattleRuntime([ally], [enemy])
  const resolved = runtime.resolveCommand({ type: 'attack', actorId: 'invincible_attacker', targetIds: ['invincible_target'] })
  assert.ok(resolved, 'attack against invincible target should still resolve')
  runtime.applyResolvedCommand(resolved)
  const target = runtime.units.find(unit => unit.id === 'invincible_target')
  assert.ok(target, 'target should remain in runtime')
  assert.equal(target.stats.currentHp, 80)
  assert.equal(target.isAlive, true)

  target.statusEffects.push({ type: 'burn', duration: 1, value: 15, sourceId: 'invincible_attacker' })
  const turnStart = processTurnStartStatuses(target)
  assert.equal(target.stats.currentHp, 80)
  assert.equal(turnStart.hits.length, 0)
  assert.ok(turnStart.logs.some(log => log.includes('无敌状态')))

  const statusDamageModifier = resolveBattleDamageModifier({
    attackerStatuses: [{ type: 'buff_atk', duration: 2, value: 0.25, sourceId: 'self' }],
    targetStatuses: [
      { type: 'buff_def', duration: 2, value: 0.2, sourceId: 'self' },
      { type: 'vulnerable', duration: 1, value: 0.5, sourceId: 'curse' }
    ]
  })
  assert.ok(Math.abs(statusDamageModifier - 1.5) < 0.00001)
  assert.equal(resolveBattleElementDamageModifier({
    attackerElement: '金',
    targetElement: '木',
    attackerStatuses: [{ type: 'element_damage', duration: 999, value: 0.25, sourceId: '五行符' }]
  }), 1.25)
  assert.equal(resolveBattleElementDamageModifier({
    attackerElement: '金',
    targetElement: '火',
    attackerStatuses: [{ type: 'element_damage', duration: 999, value: 0.25, sourceId: '五行符' }]
  }), 1)
  assert.equal(resolveBattleCounterDamage({
    incomingDamage: 120,
    defenderAttack: 80,
    defenderStatuses: [{ type: 'counter', duration: 999, value: 0.35, sourceId: '反震甲' }]
  }), 42)
  assert.equal(resolveBattleSpeedModifier({
    statusEffects: [{ type: 'buff_spd', duration: 2, value: 0.5, sourceId: 'pill' }]
  }), 1.5)
  assert.equal(resolveBattleDodgeChance({
    statusEffects: [{ type: 'dodge', duration: 999, value: 0.1, sourceId: '九天玄甲' }]
  }), 0.1)
  assert.equal(resolveBattleDodgeChance({
    statusEffects: [{ type: 'dodge', duration: 999, value: 0.8, sourceId: '九天玄甲' }]
  }), 0.65)
  assert.equal(resolveBattleLifestealAmount({
    damage: 80,
    missingHp: 20,
    attackerStatuses: [{ type: 'lifesteal', duration: 999, value: 0.1, sourceId: '混沌古剑' }]
  }), 8)
  assert.equal(resolveBattleLifestealAmount({
    damage: 500,
    missingHp: 20,
    attackerStatuses: [{ type: 'lifesteal', duration: 999, value: 0.1, sourceId: '混沌古剑' }]
  }), 20)

  const slowAlly = createUnit({
    id: 'slow_ready',
    name: '未服丹修士',
    type: 'protagonist',
    stats: {
      maxHp: 120,
      currentHp: 120,
      maxMp: 50,
      currentMp: 50,
      attack: 10,
      defense: 5,
      speed: 100,
      critRate: 0,
      critDamage: 1.5
    }
  })
  const fastAlly = createUnit({
    id: 'fast_ready',
    name: '疾行丹修士',
    type: 'protagonist',
    statusEffects: [{ type: 'buff_spd', duration: 2, value: 0.5, sourceId: 'pill' }],
    stats: {
      maxHp: 120,
      currentHp: 120,
      maxMp: 50,
      currentMp: 50,
      attack: 10,
      defense: 5,
      speed: 100,
      critRate: 0,
      critDamage: 1.5
    }
  })
  const durableEnemy = createUnit({
    id: 'speed_target',
    name: '测速木桩',
    type: 'enemy',
    stats: {
      maxHp: 999,
      currentHp: 999,
      maxMp: 30,
      currentMp: 30,
      attack: 1,
      defense: 0,
      speed: 1,
      critRate: 0,
      critDamage: 1.5
    }
  })
  const speedRuntime = new BattleRuntime([slowAlly, fastAlly], [durableEnemy])
  speedRuntime.units.forEach(unit => {
    unit.actionGauge = 0
  })
  speedRuntime.tick(3100, 1)
  assert.equal(speedRuntime.currentActorId, 'fast_ready')

  const originalRandom = Math.random
  Math.random = () => 0.5
  try {
    const elementalAttacker = createUnit({
      id: 'element_attacker',
      name: '五行剑修',
      type: 'protagonist',
      element: '金',
      statusEffects: [{ type: 'element_damage', duration: 999, value: 0.25, sourceId: '五行符' }],
      stats: {
        maxHp: 300,
        currentHp: 300,
        maxMp: 50,
        currentMp: 50,
        attack: 100,
        defense: 0,
        speed: 100,
        critRate: 0,
        critDamage: 1.5
      }
    })
    const counterTarget = createUnit({
      id: 'counter_target',
      name: '反震木傀',
      type: 'enemy',
      element: '木',
      statusEffects: [{ type: 'counter', duration: 999, value: 0.4, sourceId: '反震甲' }],
      stats: {
        maxHp: 500,
        currentHp: 500,
        maxMp: 30,
        currentMp: 30,
        attack: 50,
        defense: 0,
        speed: 60,
        critRate: 0,
        critDamage: 1.5
      }
    })
    const effectRuntime = new BattleRuntime([elementalAttacker], [counterTarget])
    const elementalCommand = effectRuntime.resolveCommand({
      type: 'attack',
      actorId: 'element_attacker',
      targetIds: ['counter_target']
    })
    assert.ok(elementalCommand, 'elemental attack should resolve')
    effectRuntime.applyResolvedCommand(elementalCommand)
    const attackerAfterCounter = effectRuntime.units.find(unit => unit.id === 'element_attacker')
    const targetAfterElement = effectRuntime.units.find(unit => unit.id === 'counter_target')
    assert.ok(targetAfterElement.stats.currentHp < 365, 'elemental damage should exceed non-bonus baseline')
    assert.ok(attackerAfterCounter.stats.currentHp < 300, 'counter status should damage attacker after hit')
    assert.ok(effectRuntime.getReplayEvents().some(event =>
      event.type === 'effect'
      && event.actor?.id === 'counter_target'
      && event.targets?.some(target => target.id === 'element_attacker')
    ))
  } finally {
    Math.random = originalRandom
  }
})

test('enemy battle skills apply exclusive status effects', async () => {
  const { BattleRuntime } = await load('/src/game/battle/battleRuntime.ts')
  const { processTurnStartStatuses } = await load('/src/game/battle/statusRuntime.ts')
  const { createUnit } = await load('/src/types/unit.ts')
  const originalRandom = Math.random
  Math.random = () => 0

  try {
    const ally = createUnit({
      id: 'sealed_ally',
      name: '被封弟子',
      type: 'protagonist',
      skills: ['sword_qi'],
      stats: {
        maxHp: 180,
        currentHp: 180,
        maxMp: 80,
        currentMp: 80,
        attack: 35,
        defense: 6,
        speed: 100,
        critRate: 0,
        critDamage: 1.5
      }
    })
    const enemy = createUnit({
      id: 'status_enemy',
      name: '上古守卫',
      type: 'enemy',
      skills: ['ancient_seal', 'ancient_curse', 'shadow_strike'],
      stats: {
        maxHp: 320,
        currentHp: 320,
        maxMp: 120,
        currentMp: 120,
        attack: 45,
        defense: 20,
        speed: 80,
        critRate: 0,
        critDamage: 1.5
      }
    })

    const runtime = new BattleRuntime([ally], [enemy])
    runtime.spiritFire = runtime.maxSpiritFire
    const seal = runtime.resolveCommand({
      type: 'skill',
      actorId: 'status_enemy',
      targetIds: ['sealed_ally'],
      skillId: 'ancient_seal'
    })
    assert.ok(seal, 'ancient seal should resolve')
    runtime.applyResolvedCommand(seal)

    const sealedAlly = runtime.units.find(unit => unit.id === 'sealed_ally')
    assert.ok(sealedAlly?.statusEffects.some(effect => effect.type === 'spirit_seal'))
    assert.equal(runtime.getAvailableSkills('sealed_ally').length, 0)
    assert.ok(runtime.resolveCommand({ type: 'attack', actorId: 'sealed_ally', targetIds: ['status_enemy'] }), 'sealed unit should still attack')
    assert.equal(runtime.resolveCommand({
      type: 'skill',
      actorId: 'sealed_ally',
      targetIds: ['status_enemy'],
      skillId: 'sword_qi'
    }), null)

    runtime.finishAction()
    runtime.spiritFire = runtime.maxSpiritFire
    const curse = runtime.resolveCommand({
      type: 'skill',
      actorId: 'status_enemy',
      targetIds: ['sealed_ally'],
      skillId: 'ancient_curse'
    })
    assert.ok(curse, 'ancient curse should resolve')
    runtime.applyResolvedCommand(curse)
    assert.ok(sealedAlly?.statusEffects.some(effect => effect.type === 'vulnerable'))

    runtime.finishAction()
    runtime.spiritFire = runtime.maxSpiritFire
    const bleed = runtime.resolveCommand({
      type: 'skill',
      actorId: 'status_enemy',
      targetIds: ['sealed_ally'],
      skillId: 'shadow_strike'
    })
    assert.ok(bleed, 'shadow strike should resolve')
    runtime.applyResolvedCommand(bleed)
    assert.ok(sealedAlly?.statusEffects.some(effect => effect.type === 'bleed'))

    const hpBeforeBleed = sealedAlly?.stats.currentHp ?? 0
    const turnStart = processTurnStartStatuses(sealedAlly)
    assert.ok((sealedAlly?.stats.currentHp ?? 0) < hpBeforeBleed)
    assert.ok(turnStart.logs.some(log => log.includes('流血')))
  } finally {
    Math.random = originalRandom
  }
})

test('story parser reads node choices and gameplay effects', async () => {
  const { storyParser } = await load('/src/story/parser/index.ts')
  const content = `---
ID: T001
名称：试炼开端
视角：共同
地图：青云山
前置：无
解锁周目：1
补触发：无
---
【正文】
你在山门前醒来，听见远处钟声。

【选择】
1. 入山问道 → T002
2. 转身离开 → T003

【效果】
解锁线索：山门钟声
触发战斗：tutorial_duel
`
  const nodes = storyParser.parseMainStory(content)
  const firstNode = nodes.find(node => node.id === 'T001')
  const battleNode = nodes.find(node => node.content.effects.some(effect => effect.type === 'story_battle'))

  assert.equal(nodes.length, 1)
  assert.ok(firstNode, 'T001 should parse')
  assert.equal(firstNode.content.choices.length, 2)
  assert.ok(firstNode.content.effects.some(effect => effect.type === 'unlock_clue'))
  assert.ok(battleNode, 'fixture should include at least one story battle effect')
})

test('world log resolver classifies and merges repeated events', async () => {
  const {
    createWorldLogEntry,
    insertWorldLog,
    getVisibleWorldLogs,
    normalizeWorldLogs
  } = await load('/src/world/runtime/worldLogResolver.ts')

  const base = {
    id: 'log-a',
    tick: 10,
    timeLabel: '修仙历1年1月1日 辰时',
    scope: 'npc',
    severity: 'normal',
    title: '人物异动',
    text: '某位修士开始盯梢你。',
    actorIds: ['npc_001'],
    tags: ['relationship', 'pressure'],
    mapId: 'qingyun_mountain'
  }
  const first = createWorldLogEntry(base)
  const second = createWorldLogEntry({
    ...base,
    id: 'log-b',
    tick: 12,
    text: '某位修士再次出现在山门附近。'
  })
  const minor = createWorldLogEntry({
    ...base,
    id: 'log-c',
    tick: 13,
    severity: 'minor',
    title: '无关风声',
    text: '坊间传来零碎闲谈。',
    tags: ['ambient']
  })

  const logs = insertWorldLog(insertWorldLog([minor], first), second)
  assert.equal(logs.length, 2)
  assert.equal(logs[0].repeatCount, 2)
  assert.equal(logs[0].visibility, 'briefing')
  assert.ok(logs[0].text.includes('反复出现 2 次'))
  assert.equal(getVisibleWorldLogs(logs).length, 1)
  assert.equal(normalizeWorldLogs([{
    ...base,
    id: 'legacy',
    revealed: true
  }]).at(0)?.repeatCount, 1)
})

test('world log context resolver labels area sect and actors', async () => {
  const {
    resolveWorldLogContextView,
    resolveNpcStoryContextView
  } = await load('/src/world/runtime/worldLogContextResolver.ts')
  const { createDefaultNpcDefinitions } = await load('/src/world/runtime/npcRoster.ts')

  const npcDefinitions = createDefaultNpcDefinitions()
  const npc = npcDefinitions.find(definition => definition.id === 'npc_su_qingyuan')
  assert.ok(npc, 'fixture npc should exist')

  const logView = resolveWorldLogContextView({
    id: 'context-log',
    tick: 18,
    lastTick: 18,
    timeLabel: '修仙历1年1月2日 午时',
    scope: 'npc',
    severity: 'major',
    visibility: 'briefing',
    title: '苏清鸢破境',
    text: '苏清鸢在青云山灵脉旁破境。',
    actorIds: [npc.id],
    mapId: 'qingyun_mountain',
    tags: ['npc', 'breakthrough'],
    dedupeKey: 'context-log',
    repeatCount: 1,
    revealed: true
  }, { npcDefinitions })

  assert.equal(logView.areaName, '青云山')
  assert.ok(logView.sectNames.includes('青云宗'))
  assert.ok(logView.actorNames.includes(npc.name))
  assert.ok(logView.badges.some(badge => badge.label === '破境'))
  assert.ok(logView.contextLabel.includes('青云山'))

  const storyView = resolveNpcStoryContextView({
    id: 'context-story',
    tick: 18,
    timeLabel: '修仙历1年1月2日 午时',
    npcId: npc.id,
    title: '苏清鸢破境',
    text: '她的剑意更深了一分。',
    severity: 'major',
    mapId: 'qingyun_mountain',
    tags: ['npc', 'breakthrough']
  }, { npcDefinitions })

  assert.ok(storyView.actorNames.includes(npc.name))
  assert.ok(storyView.badges.some(badge => badge.label === '青云山'))
})

test('player journey resolver produces mode rewards', async () => {
  const { resolvePlayerJourney } = await load('/src/world/runtime/playerJourneyResolver.ts')
  const {
    resolveBattleSkillProgression,
    resolveIdleSkillTrainingProgression
  } = await load('/src/character/runtime/characterSkillProgressResolver.ts')
  const {
    applyPetBondStatBonuses,
    resolvePetBondEffects,
    resolvePetJourneyRewards
  } = await load('/src/pet/runtime/petBondResolver.ts')
  const { buildPetBattleUnit } = await load('/src/game/battle/allyRosterFactory.ts')
  const { getPetDefinitionById, calculatePetStats } = await load('/src/types/pet.ts')
  const baseClock = { year: 1, month: 1, day: 1, shichenIndex: 4, totalTicks: 1, lastSimulatedAt: 0 }
  const learnedSkills = [
    { id: 'basic_sword', level: 1, enabled: true },
    { id: 'gathering_qi', level: 1, enabled: true },
    { id: 'sword_rain', level: 3, enabled: false }
  ]
  const petDefinition = getPetDefinitionById('pet_cloud_fox')
  assert.ok(petDefinition, 'fixture pet should exist')
  const ownedPet = {
    definitionId: petDefinition.id,
    level: 3,
    exp: 0,
    maxExp: 100,
    intimacy: 80,
    currentHp: petDefinition.baseStats.maxHp,
    currentMp: petDefinition.baseStats.maxMp,
    equipped: true
  }
  const petBond = resolvePetBondEffects(petDefinition, ownedPet)
  const basePetStats = calculatePetStats(petDefinition, ownedPet)
  const bondedPetStats = applyPetBondStatBonuses(basePetStats, petBond.statBonuses)
  assert.ok(bondedPetStats.speed > basePetStats.speed)
  assert.ok(bondedPetStats.critRate > basePetStats.critRate)
  assert.ok(petBond.battleStatusEffects.some(effect => effect.type === 'dodge'))
  const petJourneyRewards = resolvePetJourneyRewards({
    basePetExp: 10,
    basePetIntimacy: 1,
    bondEffects: petBond.journeyEffects
  })
  assert.ok(petJourneyRewards.petExp > 10)
  assert.equal(petJourneyRewards.petIntimacy, 2)
  const petUnit = buildPetBattleUnit({
    owned: ownedPet,
    definition: petDefinition,
    stats: bondedPetStats,
    bondEffects: petBond
  })
  assert.ok(petUnit.statusEffects.some(effect => effect.type === 'dodge'))
  const baseContext = {
    clock: baseClock,
    weather: 'rain',
    baseCultivationGain: 100,
    hasEquippedPet: true,
    petBondEffects: petBond.journeyEffects,
    learnedSkills,
    activeAnomaly: { areaId: 'qingyun_mountain' },
    fallbackAreaId: 'qingyun_mountain',
    sectHomeAreaId: 'qingyun_mountain'
  }

  const cultivate = resolvePlayerJourney({ ...baseContext, idleMode: 'cultivate' })
  assert.equal(cultivate.cultivationDelta, 110)
  assert.ok(cultivate.petExpDelta >= 2)
  assert.ok(cultivate.petIntimacyDelta >= 1)

  let herb = null
  for (let tick = 1; tick < 80 && !herb; tick++) {
    const result = resolvePlayerJourney({
      ...baseContext,
      clock: { ...baseClock, totalTicks: tick },
      idleMode: 'gatherHerbs'
    })
    if (result.inventoryItems.length > 0) herb = result
  }
  assert.ok(herb, 'herb mode should produce a deterministic gathering tick')
  assert.equal(herb.inventoryItems[0].definitionId, 'herb_spirit_grass')
  assert.ok(herb.journeys.some(journey => journey.title === '采得灵草'))

  let sectDuty = null
  for (let tick = 1; tick < 120 && !sectDuty; tick++) {
    const result = resolvePlayerJourney({
      ...baseContext,
      clock: { ...baseClock, totalTicks: tick },
      idleMode: 'sectDuty'
    })
    if (result.sectContributionDelta > 0) sectDuty = result
  }
  assert.ok(sectDuty, 'sect duty mode should produce a deterministic duty tick')
  assert.equal(sectDuty.sectContributionDelta, 8)
  assert.equal(sectDuty.sectReputationDelta, 3)

  const idleTraining = resolveIdleSkillTrainingProgression({
    learnedSkills,
    baseCultivationGain: 100,
    seed: 1
  })
  assert.ok(idleTraining.totalExp > 0)
  assert.ok(idleTraining.skillExpDeltas.every(delta => delta.reason === 'idle_training'))

  let skillTraining = null
  for (let tick = 1; tick < 120 && !skillTraining; tick++) {
    const result = resolvePlayerJourney({
      ...baseContext,
      clock: { ...baseClock, totalTicks: tick },
      idleMode: 'trainSkill'
    })
    if (result.skillExpDeltas.length > 0) skillTraining = result
  }
  assert.ok(skillTraining, 'skill training mode should produce deterministic skill exp')
  assert.ok(skillTraining.skillExpDeltas[0].exp > 0)
  assert.ok(skillTraining.journeys[0].rewards.some(reward => reward.type === 'skill_exp'))

  const battleSkillUse = resolveBattleSkillProgression({
    learnedSkills,
    usedSkillIds: ['basic_sword', 'unknown_skill', 'basic_sword'],
    victory: true,
    cultivationReward: 120
  })
  assert.deepEqual(battleSkillUse.skillExpDeltas.map(delta => delta.skillId), ['basic_sword'])
  assert.equal(battleSkillUse.skillExpDeltas[0].reason, 'battle_use')

  const battleParticipation = resolveBattleSkillProgression({
    learnedSkills,
    usedSkillIds: [],
    victory: true,
    cultivationReward: 120
  })
  assert.equal(battleParticipation.skillExpDeltas.length, 1)
  assert.equal(battleParticipation.skillExpDeltas[0].reason, 'battle_participation')

  const battleDefeat = resolveBattleSkillProgression({
    learnedSkills,
    usedSkillIds: ['basic_sword'],
    victory: false,
    cultivationReward: 120
  })
  assert.equal(battleDefeat.totalExp, 0)
})

test('world narrative creates anomaly records with area context', async () => {
  const { createAreaAnomaly, resolveWorldDisasterTrigger } = await load('/src/world/runtime/worldNarrativeResolver.ts')
  const { HUMAN_REALM_AREAS } = await load('/src/types/map.ts')

  const area = HUMAN_REALM_AREAS.find(item => item.id === 'qingyun_mountain')
  assert.ok(area, 'fixture area should exist')
  const anomaly = createAreaAnomaly(
    { year: 1, month: 1, day: 1, shichenIndex: 4, totalTicks: 8, lastSimulatedAt: 0 },
    area,
    {
      areaId: area.id,
      type: 'spiritual_vein',
      severity: 'legendary',
      riskHint: '灵脉喷涌，争夺加剧。',
      stabilityDelta: 1,
      pressureDelta: 6,
      untilTick: 16
    }
  )

  assert.equal(anomaly.areaId, 'qingyun_mountain')
  assert.equal(anomaly.realm, '人界')
  assert.equal(anomaly.severity, 'legendary')
  assert.ok(anomaly.title.includes(area.name))

  const tickTrigger = resolveWorldDisasterTrigger({
    clock: { year: 1, month: 1, day: 2, shichenIndex: 10, totalTicks: 34, lastSimulatedAt: 0 },
    weather: 'flood',
    areaStates: {
      [area.id]: {
        areaId: area.id,
        controllingSectId: 'qingyun_sect',
        riskLevel: 'danger',
        stability: 35,
        pressure: 68,
        contested: true,
        lastUpdatedTick: 34
      }
    }
  })

  assert.ok(tickTrigger, 'dangerous flood tick should produce an anomaly trigger')
  assert.equal(tickTrigger.areaId, area.id)
  assert.equal(tickTrigger.type, 'flood')
})

test('map and sect rules block invalid gameplay paths', async () => {
  const { resolveAreaGameplayAccess } = await load('/src/map/runtime/mapAreaAccessResolver.ts')
  const {
    resolveMapExploration,
    resolveMapExplorationPoints
  } = await load('/src/map/runtime/mapExplorationResolver.ts')
  const {
    resolveInventoryMaterialConsumption,
    resolveInventoryMaterialQuantity
  } = await load('/src/character/runtime/inventoryMaterialResolver.ts')
  const {
    normalizeInventoryItemSchema,
    normalizeInventoryItemsSchema,
    resolveInventoryDefinitionId,
    validateInventoryItemSchema,
    validateInventoryItemsSchema
  } = await load('/src/character/runtime/inventoryItemSchemaResolver.ts')
  const {
    createInventoryItemFromDrop,
    createInventoryItemsFromDrops,
    mergeEncounterDrops,
    resolveDropDefinitionId
  } = await load('/src/character/runtime/inventoryDropResolver.ts')
  const {
    resolveInventorySchemaIssueSeverity,
    resolveInventorySchemaSummary
  } = await load('/src/character/runtime/inventorySchemaSummaryResolver.ts')
  const {
    resolveConsumableEffectDelta,
    resolveConsumableUse
  } = await load('/src/character/runtime/consumableEffectResolver.ts')
  const { tickFoodProgressionEffects } = await load('/src/character/runtime/characterFoodEffectResolver.ts')
  const { resolveEquipmentEffects } = await load('/src/character/runtime/characterEquipmentEffectResolver.ts')
  const { resolveCharacterProgression } = await load('/src/character/runtime/characterProgressionResolver.ts')
  const {
    resolveBreakthroughAttempt,
    resolveBreakthroughPreview
  } = await load('/src/character/runtime/characterBreakthroughResolver.ts')
  const { resolveCharacterBattleUnit } = await load('/src/character/runtime/characterBattleLoadoutResolver.ts')
  const {
    applyShopPurchases,
    canInventoryAcceptShopItem,
    createShopInventory,
    resolveShopCatalogEntries,
    resolveShopMarketInfluence,
    resolveShopMerchantInfluence,
    resolveShopPurchase
  } = await load('/src/shop/runtime/shopInventoryResolver.ts')
  const { resolveShopMerchantEvents } = await load('/src/shop/runtime/shopMerchantEventResolver.ts')
  const {
    resolveShopMerchantTradeLog,
    resolveShopMerchantTradeOutcome
  } = await load('/src/shop/runtime/shopMerchantLogResolver.ts')
  const { resolveShopMerchantRelationshipDeltas } = await load('/src/shop/runtime/shopMerchantRelationshipResolver.ts')
  const {
    createShopMerchantMemory,
    pruneShopMerchantMemories,
    resolveShopMerchantMemoryInfluence,
    upsertShopMerchantMemory
  } = await load('/src/shop/runtime/shopMerchantMemoryResolver.ts')
  const {
    resolveSectAuthority,
    canAuthorityAccessFacility,
    resolveSectDirectiveChange,
    resolveSectPromotion
  } = await load('/src/sect/runtime/sectPositionResolver.ts')
  const { resolveSectStipend } = await load('/src/sect/runtime/sectStipendResolver.ts')
  const { resolveSectWorldTick } = await load('/src/sect/runtime/sectWorldResolver.ts')
  const {
    resolveGardenAccelerateCost,
    resolveGardenAcceleration,
    resolveGardenHarvest,
    resolveGardenPlanting,
    resolveGardenSlotCount
  } = await load('/src/sect/runtime/sectGardenResolver.ts')
  const {
    resolveAlchemyCraft,
    resolveAlchemySuccessRate,
    resolveAvailableAlchemyRecipes
  } = await load('/src/sect/runtime/sectAlchemyResolver.ts')
  const {
    resolveManualSectTaskProgress,
    resolveSectTaskGeneration,
    resolveSectTaskClaim,
    resolveSectTaskClaimAll,
    resolveSectTaskProgress,
    resolveSectTaskRefresh
  } = await load('/src/sect/runtime/sectTaskResolver.ts')
  const { resolveSectDuty } = await load('/src/sect/runtime/sectDutyResolver.ts')
  const {
    resolveFacilityLevel,
    resolveFacilityUpgrade,
    resolveInitialFacilityLevels
  } = await load('/src/sect/runtime/sectFacilityResolver.ts')
  const {
    resolveSectJoin,
    resolveSectLeave
  } = await load('/src/sect/runtime/sectMembershipResolver.ts')
  const { resolveSectEventChoice } = await load('/src/sect/runtime/sectEventResolver.ts')
  const { resolveSectWarConclusion } = await load('/src/sect/runtime/sectWarRewardResolver.ts')
  const {
    resolveSectWarAdvance,
    resolveSectWarDeclaration
  } = await load('/src/sect/runtime/sectWarLifecycleResolver.ts')
  const { getSeedById } = await load('/src/types/garden.ts')
  const { ALCHEMY_RECIPES, getAlchemyRecipeById } = await load('/src/types/alchemy.ts')
  const { getSectById, SECT_FACILITIES } = await load('/src/types/sect.ts')

  const blocked = resolveAreaGameplayAccess({
    areaName: '青云山',
    mapAreaId: 'qingyun_mountain',
    mapAreaSectIds: ['qingyun_sect'],
    controllerSectId: 'qingyun_sect',
    encounter: null,
    baseStaminaCost: 2,
    playerCaptivity: { isCaptured: true, captorSectId: 'demon_sect' },
    sectRuntime: {
      joinedSectId: 'qingyun_sect',
      currentSectName: '青云宗',
      homeAreaId: 'qingyun_mountain',
      worldCondition: { status: 'stable', occupiedBySectId: null, lastUpdatedTick: null },
      activeWar: null
    }
  })
  assert.equal(blocked.entryState, 'blocked')
  assert.equal(blocked.blocker, 'captivity')
  assert.equal(blocked.challengeAllowed, false)

  const explorationArea = {
    id: 'qingyun_mountain',
    name: '青云山',
    realm: '人界',
    icon: '山',
    description: '青云宗山门所在。',
    requiredRealm: '炼气',
    requiredRealmLevel: 1,
    adjacentAreas: [],
    sects: ['qingyun_sect'],
    resources: ['青云草', '灵泉'],
    isUnlocked: true,
    isConquered: false
  }
  const explorationState = {
    areaId: 'qingyun_mountain',
    controllingSectId: 'qingyun_sect',
    riskLevel: 'danger',
    stability: 44,
    pressure: 70,
    contested: true,
    lastUpdatedTick: 12
  }
  const explorationPoints = resolveMapExplorationPoints({
    area: explorationArea,
    areaState: explorationState,
    weather: 'clear',
    hasAnomaly: true
  })
  assert.equal(explorationPoints.length, 3)
  assert.equal(explorationPoints[1].kind, 'resource')
  const exploration = resolveMapExploration({
    area: explorationArea,
    areaState: explorationState,
    pointId: explorationPoints[1].id,
    weather: 'clear',
    hasAnomaly: true,
    stamina: 100
  })
  assert.equal(exploration.success, true)
  assert.equal(exploration.rewards.itemName, '青云草')
  assert.equal(exploration.areaPatch.pressureDelta, -1)
  const weatherLockedPoints = resolveMapExplorationPoints({
    area: explorationArea,
    areaState: explorationState,
    weather: 'storm',
    hasAnomaly: false
  })
  const lockedTrail = resolveMapExploration({
    area: explorationArea,
    areaState: explorationState,
    pointId: weatherLockedPoints[2].id,
    weather: 'storm',
    hasAnomaly: false,
    stamina: 100
  })
  assert.equal(lockedTrail.success, false)
  assert.ok(lockedTrail.reason.includes('天象'))
  assert.equal(blocked.sweepAllowed, false)

  const inventoryFixture = [
    { id: 'item_a', definitionId: 'herb_spirit_grass', name: '灵草', icon: '草', type: 'material', quality: 'common', quantity: 2 },
    { id: 'item_b', definitionId: 'herb_spirit_grass', name: '旧灵草', icon: '草', type: 'material', quality: 'common', quantity: 3 },
    { id: 'item_c', name: '灵草', icon: '草', type: 'material', quality: 'common', quantity: 1 },
    { id: 'item_d', name: '回春丹', icon: '丹', type: 'consumable', quality: 'common', quantity: 1 }
  ]
  assert.equal(resolveInventoryMaterialQuantity(inventoryFixture, 'herb_spirit_grass'), 5)
  assert.equal(resolveInventoryMaterialQuantity(inventoryFixture, '灵草'), 3)
  const consumedMaterial = resolveInventoryMaterialConsumption(inventoryFixture, 'herb_spirit_grass', 4)
  assert.equal(consumedMaterial.success, true)
  assert.equal(consumedMaterial.consumedQuantity, 4)
  assert.equal(consumedMaterial.remainingQuantity, 0)
  assert.equal(resolveInventoryMaterialQuantity(consumedMaterial.inventory, 'herb_spirit_grass'), 1)
  const blockedMaterialConsumption = resolveInventoryMaterialConsumption(inventoryFixture, 'herb_spirit_grass', 9)
  assert.equal(blockedMaterialConsumption.success, false)
  assert.equal(blockedMaterialConsumption.remainingQuantity, 4)

  const normalizedLegacyEquipment = normalizeInventoryItemSchema({
    id: 'legacy_weapon',
    name: '玄铁剑',
    icon: '剑',
    type: 'equipment',
    quality: 'fine',
    quantity: 1
  })
  assert.equal(normalizedLegacyEquipment.definitionId, 'weapon_002')
  assert.equal(normalizedLegacyEquipment.equipmentId, 'weapon_002')
  const normalizedShopHerb = normalizeInventoryItemSchema({
    id: 'shop_herb',
    definitionId: 'material_spirit_grass',
    name: '灵草',
    icon: '草',
    type: 'material',
    quality: 'common',
    quantity: 0
  })
  assert.equal(normalizedShopHerb.definitionId, 'herb_spirit_grass')
  assert.equal(normalizedShopHerb.quantity, 1)
  assert.equal(normalizeInventoryItemSchema({
    id: 'legacy_tribulation_pill',
    name: '渡劫护心丹',
    icon: '劫',
    type: 'consumable',
    quality: 'legendary',
    quantity: 1
  }).definitionId, 'pill_tribulation_cloud')
  assert.equal(resolveInventoryDefinitionId({
    id: 'drop_wood',
    definitionId: 'wooden_sword',
    name: '新手木剑',
    icon: '木',
    type: 'equipment',
    quality: 'common',
    quantity: 1
  }), 'weapon_001')
  const mergedDrops = mergeEncounterDrops([
    {
      item: { id: 'herb_spirit_grass', name: '灵草', icon: '草', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 2, dropRate: 1 },
      quantity: 2
    },
    {
      item: { id: 'herb_spirit_grass', name: '灵草', icon: '草', type: 'material', quality: 'common', minQuantity: 1, maxQuantity: 2, dropRate: 1 },
      quantity: 3
    },
    {
      item: { id: 'pill_healing', name: '疗伤丹', icon: '药', type: 'consumable', quality: 'common', minQuantity: 1, maxQuantity: 1, dropRate: 1 },
      quantity: 1
    }
  ])
  assert.equal(mergedDrops.length, 2)
  assert.equal(mergedDrops.find(drop => drop.item.id === 'herb_spirit_grass')?.quantity, 5)
  assert.equal(resolveDropDefinitionId(mergedDrops[0].item), mergedDrops[0].item.id)
  const dropInventoryItem = createInventoryItemFromDrop(mergedDrops[0], { idPrefix: 'runtime_drop', serial: 1 })
  assert.equal(dropInventoryItem.definitionId, 'herb_spirit_grass')
  assert.equal(dropInventoryItem.quantity, 5)
  const dropInventoryItems = createInventoryItemsFromDrops(mergedDrops, { idPrefix: 'runtime_drop' })
  assert.equal(dropInventoryItems.find(item => item.definitionId === 'pill_healing')?.type, 'consumable')
  const normalizedInventory = normalizeInventoryItemsSchema([
    normalizedShopHerb,
    { id: 'garden_herb', definitionId: 'herb_spirit_grass', name: '灵草', icon: '草', type: 'material', quality: 'common', quantity: 2 }
  ])
  assert.equal(resolveInventoryMaterialQuantity(normalizedInventory, 'herb_spirit_grass'), 3)
  assert.deepEqual(
    validateInventoryItemSchema(normalizedLegacyEquipment).map(diagnostic => diagnostic.type),
    []
  )
  const itemSchemaDiagnostics = validateInventoryItemsSchema([
    { id: 'legacy_weapon', name: '玄铁剑', icon: '剑', type: 'equipment', quality: 'fine', quantity: 1 },
    { id: 'shop_herb', definitionId: 'material_spirit_grass', name: '灵草', icon: '草', type: 'material', quality: 'common', quantity: 0 }
  ])
  assert.deepEqual(itemSchemaDiagnostics.map(diagnostic => diagnostic.type), [
    'missing_definition_id',
    'equipment_id_missing',
    'definition_alias',
    'invalid_quantity'
  ])
  assert.equal(resolveInventorySchemaIssueSeverity('invalid_quantity'), 'warning')
  const itemSchemaSummary = resolveInventorySchemaSummary([
    { id: 'legacy_weapon', name: '玄铁剑', icon: '剑', type: 'equipment', quality: 'fine', quantity: 1 },
    { id: 'shop_herb', definitionId: 'material_spirit_grass', name: '灵草', icon: '草', type: 'material', quality: 'common', quantity: 0 },
    { id: 'pill_healing', definitionId: 'pill_healing', name: '疗伤丹', icon: '药', type: 'consumable', quality: 'common', quantity: 2 }
  ])
  assert.equal(itemSchemaSummary.totalItems, 3)
  assert.equal(itemSchemaSummary.equipmentItems, 1)
  assert.equal(itemSchemaSummary.warningCount, 2)
  assert.equal(itemSchemaSummary.infoCount, 2)
  assert.equal(itemSchemaSummary.normalizedDefinitionCount, 3)

  const consumableFixture = {
    id: 'pill_fixture',
    definitionId: 'pill_fixture',
    name: '试炼合丹',
    icon: '丹',
    type: 'consumable',
    quality: 'fine',
    quantity: 1,
    effects: [
      { type: 'add_cultivation', value: 120 },
      { type: 'restore_hp', value: 200 },
      { type: 'mp', value: 30 },
      { type: 'buff_atk', value: 0.2, duration: 4 }
    ]
  }
  const consumableDelta = resolveConsumableEffectDelta({
    item: consumableFixture,
    baseStats: { currentHp: 80, currentMp: 40 },
    totalStats: { maxHp: 150, maxMp: 100 }
  })
  assert.equal(consumableDelta.cultivation, 120)
  assert.equal(consumableDelta.hp, 70)
  assert.equal(consumableDelta.mp, 30)
  assert.equal(consumableDelta.buffs[0]?.type, 'buff_atk')
  assert.equal(consumableDelta.buffs[0]?.duration, 4)
  const consumableReady = resolveConsumableUse({
    itemId: 'pill_fixture',
    inventory: [consumableFixture],
    baseStats: { currentHp: 150, currentMp: 40 },
    totalStats: { maxHp: 150, maxMp: 100 }
  })
  assert.equal(consumableReady.success, true)
  assert.equal(consumableReady.delta.hp, 0)
  assert.equal(consumableReady.delta.mp, 30)
  const consumableBlocked = resolveConsumableUse({
    itemId: 'unknown_item',
    inventory: [consumableFixture],
    baseStats: { currentHp: 150, currentMp: 100 },
    totalStats: { maxHp: 150, maxMp: 100 }
  })
  assert.equal(consumableBlocked.success, false)
  assert.equal(consumableBlocked.reason, 'missing_item')
  const noEffectConsumable = resolveConsumableUse({
    itemId: 'no_effect',
    inventory: [{
      id: 'no_effect',
      name: '未接入丹药',
      icon: '丹',
      type: 'consumable',
      quality: 'common',
      quantity: 1,
      effects: [{ type: 'unknown_effect', value: 1 }]
    }],
    baseStats: { currentHp: 150, currentMp: 100 },
    totalStats: { maxHp: 150, maxMp: 100 }
  })
  assert.equal(noEffectConsumable.success, false)
  assert.equal(noEffectConsumable.reason, 'no_effect')
  assert.deepEqual(noEffectConsumable.delta.ignoredEffects, ['unknown_effect'])
  const foodConsumable = {
    id: 'food_fixture',
    definitionId: 'food_spirit_fruit',
    name: '灵果',
    icon: '果',
    type: 'consumable',
    quality: 'common',
    quantity: 1,
    effects: [
      { type: 'stamina', value: 10 },
      { type: 'food_cultivation', value: 0.12, duration: 3 }
    ]
  }
  const foodReady = resolveConsumableUse({
    itemId: 'food_fixture',
    inventory: [foodConsumable],
    baseStats: { currentHp: 150, currentMp: 100 },
    totalStats: { maxHp: 150, maxMp: 100 }
  })
  assert.equal(foodReady.success, true)
  assert.equal(foodReady.delta.stamina, 10)
  assert.equal(foodReady.delta.buffs[0]?.type, 'food_cultivation')
  assert.equal(foodReady.delta.buffs[0]?.duration, 3)
  const foodProgression = resolveCharacterProgression([], [], foodReady.delta.buffs)
  assert.equal(foodProgression.cultivationMultiplierBonus, 0.12)
  assert.equal(foodProgression.cultivationMultiplier, 1.12)
  assert.ok(foodProgression.sources.some(source => source.kind === 'food' && source.label === '灵果'))
  const tickedFoodBuffs = tickFoodProgressionEffects(foodReady.delta.buffs)
  assert.equal(tickedFoodBuffs[0]?.duration, 2)
  assert.equal(tickFoodProgressionEffects([{ ...foodReady.delta.buffs[0], duration: 1 }]).length, 0)
  const equipmentEffectFixtures = [
    {
      id: 'weapon_lifesteal_fixture',
      name: '试炼血剑',
      icon: '血',
      type: 'weapon',
      quality: 'legendary',
      level: 1,
      description: '测试吸血。',
      bonuses: { attack: 10 },
      effects: [{ type: 'lifesteal', value: 0.1, description: '吸血10%' }]
    },
    {
      id: 'armor_dodge_fixture',
      name: '试炼影衣',
      icon: '影',
      type: 'armor',
      quality: 'supreme',
      level: 1,
      description: '测试闪避。',
      bonuses: { defense: 8 },
      effects: [{ type: 'dodge', value: 0.12, description: '闪避12%' }]
    },
    {
      id: 'accessory_crit_fixture',
      name: '试炼会心符',
      icon: '会',
      type: 'accessory',
      quality: 'excellent',
      level: 1,
      description: '测试会心。',
      bonuses: {},
      effects: [{ type: 'crit_bonus', value: 0.05, description: '会心+5%' }]
    }
  ]
  const equipmentEffects = resolveEquipmentEffects(equipmentEffectFixtures)
  assert.equal(equipmentEffects.battleStatusEffects.some(effect => effect.type === 'lifesteal' && effect.sourceId === '试炼血剑'), true)
  assert.equal(equipmentEffects.battleStatusEffects.some(effect => effect.type === 'dodge' && effect.sourceId === '试炼影衣'), true)
  assert.equal(equipmentEffects.statBonuses.critRate, 0.05)
  const equipmentProgression = resolveCharacterProgression([equipmentEffectFixtures[2]], [])
  assert.equal(equipmentProgression.equipmentStatBonuses.critRate, 0.05)
  assert.ok(equipmentProgression.sources.some(source => source.id === 'equipment-effect:critRate'))
  const foundationAid = {
    id: 'foundation_aid',
    definitionId: 'pill_foundation_guard',
    name: '护脉筑基丹',
    icon: '基',
    type: 'consumable',
    quality: 'excellent',
    quantity: 1,
    effects: [{ type: 'breakthrough_success', value: 0.18 }]
  }
  const noAidBreakthrough = resolveBreakthroughPreview({
    realm: '炼气',
    realmLevel: 9,
    cultivation: 100,
    maxCultivation: 100,
    inventory: []
  })
  const aidedBreakthrough = resolveBreakthroughPreview({
    realm: '炼气',
    realmLevel: 9,
    cultivation: 100,
    maxCultivation: 100,
    inventory: [foundationAid]
  })
  assert.equal(noAidBreakthrough.canAttempt, true)
  assert.equal(noAidBreakthrough.nextRealm, '筑基')
  assert.ok(aidedBreakthrough.successRate > noAidBreakthrough.successRate)
  assert.equal(aidedBreakthrough.selectedAid?.itemId, 'foundation_aid')
  const blockedBreakthrough = resolveBreakthroughPreview({
    realm: '炼气',
    realmLevel: 8,
    cultivation: 100,
    maxCultivation: 100,
    inventory: [foundationAid]
  })
  assert.equal(blockedBreakthrough.canAttempt, false)
  assert.equal(blockedBreakthrough.reason, 'not_peak')
  const successBreakthrough = resolveBreakthroughAttempt({
    realm: '炼气',
    realmLevel: 9,
    cultivation: 100,
    maxCultivation: 100,
    inventory: [foundationAid],
    selectedAidItemId: 'foundation_aid',
    seedParts: ['runtime-success-0']
  })
  assert.equal(successBreakthrough.success, true)
  assert.equal(successBreakthrough.consumedItemId, 'foundation_aid')
  assert.equal(successBreakthrough.nextRealm, '筑基')
  assert.equal(successBreakthrough.nextMaxCultivation, 150)
  assert.equal(successBreakthrough.skillPointsGained, 1)
  const tribulationAid = {
    id: 'tribulation_aid',
    definitionId: 'pill_tribulation_cloud',
    name: '渡劫护心丹',
    icon: '劫',
    type: 'consumable',
    quality: 'legendary',
    quantity: 1,
    effects: [{ type: 'breakthrough_success', value: 0.16 }]
  }
  const noAidTribulation = resolveBreakthroughPreview({
    realm: '化神',
    realmLevel: 9,
    cultivation: 1000,
    maxCultivation: 1000,
    inventory: []
  })
  const aidedTribulation = resolveBreakthroughPreview({
    realm: '化神',
    realmLevel: 9,
    cultivation: 1000,
    maxCultivation: 1000,
    inventory: [tribulationAid]
  })
  assert.equal(aidedTribulation.nextRealm, '渡劫')
  assert.equal(aidedTribulation.selectedAid?.name, '渡劫护心丹')
  assert.ok(aidedTribulation.successRate > noAidTribulation.successRate)
  assert.ok(aidedTribulation.failureCultivationRetainRate > noAidTribulation.failureCultivationRetainRate)
  const immortalAidByName = resolveBreakthroughPreview({
    realm: '大乘',
    realmLevel: 9,
    cultivation: 3000,
    maxCultivation: 3000,
    inventory: [{
      id: 'immortal_aid_legacy_name',
      name: '登仙引',
      icon: '仙',
      type: 'consumable',
      quality: 'legendary',
      quantity: 1,
      effects: [{ type: 'breakthrough_success', value: 0.12 }]
    }]
  })
  assert.equal(immortalAidByName.nextRealm, '仙人')
  assert.equal(immortalAidByName.selectedAid?.itemId, 'immortal_aid_legacy_name')
  const failedBreakthrough = resolveBreakthroughAttempt({
    realm: '化神',
    realmLevel: 9,
    cultivation: 1000,
    maxCultivation: 1000,
    inventory: [],
    seedParts: ['runtime-fail-0']
  })
  assert.equal(failedBreakthrough.success, false)
  assert.ok(failedBreakthrough.failureCultivation > 0)
  assert.ok(failedBreakthrough.failureCultivation < 1000)

  const characterBattleUnit = resolveCharacterBattleUnit({
    id: 'player_fixture',
    name: '试炼修士',
    icon: '修',
    element: '木',
    realm: '筑基',
    realmLevel: 3,
    quality: '灵品',
    level: 12,
    stats: {
      maxHp: 300,
      currentHp: 240,
      maxMp: 160,
      currentMp: 120,
      attack: 55,
      defense: 32,
      speed: 128,
      critRate: 0.12,
      critDamage: 1.6
    },
    skillIds: ['sword_qi', 'heal_light'],
    statusEffects: [{ type: 'buff_atk', value: 0.2, duration: 3, icon: '攻' }]
  })
  assert.equal(characterBattleUnit.type, 'protagonist')
  assert.equal(characterBattleUnit.realm, '筑基')
  assert.deepEqual(characterBattleUnit.skills, ['sword_qi', 'heal_light'])
  assert.equal(characterBattleUnit.statusEffects[0]?.type, 'buff_atk')
  assert.equal(characterBattleUnit.stats.attack, 55)
  assert.equal(characterBattleUnit.isAlive, true)

  const shopItem = {
    stockId: 'shop_pill_001:0',
    definition: {
      id: 'shop_pill_001',
      definitionId: 'pill_qi_gathering',
      name: '聚气丹',
      icon: '丹',
      category: 'pill',
      type: 'consumable',
      quality: 'fine',
      basePrice: 50,
      description: '服用后增加50修为。',
      effects: [{ type: 'cultivation', value: 50 }],
      stockRange: [1, 3],
      refreshWeight: 1
    },
    price: 50,
    stock: 2,
    maxStock: 3,
    tags: []
  }
  const shopEquipment = {
    stockId: 'shop_weapon_001:0',
    definition: {
      id: 'shop_weapon_001',
      definitionId: 'weapon_001',
      name: '新手木剑',
      icon: '木',
      category: 'equipment',
      type: 'equipment',
      quality: 'common',
      basePrice: 50,
      description: '攻击+5。',
      equipmentId: 'weapon_001',
      stockRange: [1, 1],
      refreshWeight: 1
    },
    price: 50,
    stock: 1,
    maxStock: 1,
    tags: []
  }
  assert.equal(applyShopPurchases([shopItem], { [shopItem.stockId]: 1 }).at(0)?.stock, 1)
  assert.equal(applyShopPurchases([shopItem], { [shopItem.stockId]: 2 }).length, 0)
  assert.equal(canInventoryAcceptShopItem({
    item: shopItem,
    inventory: [
      { id: 'pill_stack', definitionId: 'pill_qi_gathering', name: '聚气丹', icon: '丹', type: 'consumable', quality: 'fine', quantity: 1 }
    ],
    isInventoryFull: true
  }), true)
  assert.equal(canInventoryAcceptShopItem({
    item: shopEquipment,
    inventory: [],
    isInventoryFull: true
  }), false)
  const purchaseReady = resolveShopPurchase({
    stockId: shopItem.stockId,
    inventory: [shopItem],
    purchasedByStockId: {},
    gold: 50,
    contribution: 0,
    playerInventory: [],
    isInventoryFull: false
  })
  assert.equal(purchaseReady.success, true)
  assert.equal(purchaseReady.price, 50)
  assert.equal(purchaseReady.nextPurchasedQuantity, 1)
  assert.equal(purchaseReady.purchasedItem?.definition.name, '聚气丹')
  assert.equal(purchaseReady.inventoryItem?.definitionId, 'pill_qi_gathering')
  const purchaseSoldOut = resolveShopPurchase({
    stockId: shopItem.stockId,
    inventory: [],
    purchasedByStockId: {},
    gold: 50,
    contribution: 0,
    playerInventory: [],
    isInventoryFull: false
  })
  assert.equal(purchaseSoldOut.success, false)
  assert.equal(purchaseSoldOut.reason, 'sold_out')
  const purchaseGoldBlocked = resolveShopPurchase({
    stockId: shopItem.stockId,
    inventory: [shopItem],
    purchasedByStockId: {},
    gold: 49,
    contribution: 0,
    playerInventory: [],
    isInventoryFull: false
  })
  assert.equal(purchaseGoldBlocked.success, false)
  assert.equal(purchaseGoldBlocked.reason, 'gold_shortage')
  const purchaseInventoryBlocked = resolveShopPurchase({
    stockId: shopEquipment.stockId,
    inventory: [shopEquipment],
    purchasedByStockId: {},
    gold: 50,
    contribution: 0,
    playerInventory: [],
    isInventoryFull: true
  })
  assert.equal(purchaseInventoryBlocked.success, false)
  assert.equal(purchaseInventoryBlocked.reason, 'inventory_full')
  const stableMarketContext = {
    totalTicks: 0,
    refreshSeed: 0,
    playerRealm: '炼气',
    joinedSectId: 'qingyun_sect',
    unlockedSectIds: ['qingyun_sect'],
    weather: 'clear',
    sectWorldCondition: { status: 'stable', occupiedBySectId: null, lastUpdatedTick: null },
    marketAreaStates: [
      {
        areaId: 'qingyun_mountain',
        controllingSectId: 'qingyun_sect',
        riskLevel: 'safe',
        stability: 82,
        pressure: 10,
        contested: false
      }
    ]
  }
  const contestedMarketContext = {
    ...stableMarketContext,
    marketAreaStates: [
      {
        areaId: 'qingyun_mountain',
        controllingSectId: 'demon_sect',
        riskLevel: 'chaos',
        stability: 24,
        pressure: 86,
        contested: true
      }
    ]
  }
  const stableMarket = resolveShopMarketInfluence(stableMarketContext)
  const contestedMarket = resolveShopMarketInfluence(contestedMarketContext)
  assert.ok(stableMarket.priceModifier < 1)
  assert.ok(stableMarket.stockModifier > 1)
  assert.ok(stableMarket.tags.includes('本宗商路'))
  assert.ok(contestedMarket.priceModifier > stableMarket.priceModifier)
  assert.ok(contestedMarket.stockModifier < stableMarket.stockModifier)
  assert.ok(contestedMarket.tags.includes('战线涨价'))
  const stableInventory = createShopInventory(stableMarketContext)
  const contestedInventory = createShopInventory(contestedMarketContext)
  const stablePill = stableInventory.find(item => item.definition.id === 'shop_pill_001')
  const contestedPill = contestedInventory.find(item => item.definition.id === 'shop_pill_001')
  const stableFood = stableInventory.find(item => item.definition.id === 'shop_food_001')
  assert.ok(stablePill, 'stable shop should include qi gathering pill')
  assert.ok(contestedPill, 'contested shop should include qi gathering pill')
  assert.ok(stableFood, 'stable shop should include spirit food')
  assert.equal(stableFood.definition.category, 'food')
  assert.equal(stableFood.definition.effects?.some(effect => effect.type === 'food_cultivation'), true)
  const highBreakthroughEntries = resolveShopCatalogEntries({
    ...stableMarketContext,
    totalTicks: 24,
    refreshSeed: 11
  })
  assert.equal(
    highBreakthroughEntries.find(entry => entry.definition.id === 'shop_breakthrough_005')?.definition.minRealm,
    '化神'
  )
  assert.equal(
    highBreakthroughEntries.find(entry => entry.definition.id === 'shop_breakthrough_007')?.definition.minRealm,
    '大乘'
  )
  const foundationOnlyInventory = createShopInventory({
    ...stableMarketContext,
    playerRealm: '筑基',
    totalTicks: 24,
    refreshSeed: 11
  })
  assert.equal(foundationOnlyInventory.some(entry => entry.definition.id === 'shop_breakthrough_005'), false)
  const greatAscensionCatalog = resolveShopCatalogEntries({
    ...stableMarketContext,
    playerRealm: '渡劫',
    totalTicks: 30,
    refreshSeed: 13
  })
  assert.ok(greatAscensionCatalog.some(entry => entry.definition.id === 'shop_breakthrough_006'))
  const ascensionCatalog = resolveShopCatalogEntries({
    ...stableMarketContext,
    playerRealm: '大乘',
    totalTicks: 36,
    refreshSeed: 19
  })
  assert.ok(ascensionCatalog.some(entry => entry.definition.id === 'shop_breakthrough_007'))
  assert.ok(stablePill.price < contestedPill.price)
  assert.ok(stablePill.tags.includes('本宗商路'))
  assert.ok(contestedPill.tags.includes('商路受阻'))
  const merchantMarketContext = {
    ...stableMarketContext,
    merchantNpcStates: [
      {
        npcId: 'npc_bai_ruoli',
        name: '白若璃',
        homeMapId: 'azure_valley',
        locationMapId: 'azure_valley',
        sectId: 'medicine_valley',
        title: '药王谷真传',
        tags: ['伙伴候选', '炼丹'],
        constitution: 'medicine_body',
        currentGoal: 'seekTreasure',
        hpState: 'healthy',
        relationship: { favor: 72, debt: 20, bond: 'companion' }
      }
    ]
  }
  const merchantInfluence = resolveShopMerchantInfluence(merchantMarketContext)
  assert.ok(merchantInfluence.categoryStockModifiers.pill > 1)
  assert.ok(merchantInfluence.categoryStockModifiers.food > 1)
  assert.ok(merchantInfluence.categoryStockModifiers.breakthrough > 1)
  assert.ok(merchantInfluence.priceModifier < 1)
  assert.ok(merchantInfluence.tags.includes('人物商缘'))
  assert.ok(merchantInfluence.tags.includes('药脉折价'))
  assert.equal(merchantInfluence.eventResolution.events[0]?.tag, '药脉折价')
  const merchantEvents = resolveShopMerchantEvents(merchantMarketContext.merchantNpcStates)
  assert.equal(merchantEvents.events.length, 1)
  assert.equal(merchantEvents.events[0].item?.definitionId, 'food_jade_marrow_soup')
  const merchantInventory = createShopInventory(merchantMarketContext)
  const merchantPill = merchantInventory.find(item => item.definition.id === 'shop_pill_001')
  const merchantPrivatePill = merchantInventory.find(item => item.definition.id === 'merchant_pill_bai_ruoli_001')
  const merchantEventFood = merchantInventory.find(item => item.definition.id === 'merchant_event_npc_bai_ruoli_jade_soup')
  assert.ok(merchantPill, 'merchant shop should include qi gathering pill')
  assert.ok(merchantPrivatePill, 'merchant shop should include private medicine item')
  assert.ok(merchantEventFood, 'merchant event should inject temporary food item')
  assert.ok(merchantPill.stock >= stablePill.stock)
  assert.ok(merchantPill.price <= stablePill.price)
  assert.ok(merchantPill.tags.some(tag => tag.includes('白若璃')))
  assert.ok(merchantPrivatePill.tags.some(tag => tag.includes('白若璃私货')))
  assert.ok(merchantEventFood.tags.some(tag => tag.includes('药脉折价')))
  assert.ok(merchantEventFood.tags.some(tag => tag.includes('白若璃私货')))
  assert.equal(merchantPrivatePill.definition.definitionId, 'pill_baicao_life')
  const lowFavorMerchantContext = {
    ...merchantMarketContext,
    merchantNpcStates: merchantMarketContext.merchantNpcStates.map(merchant => ({
      ...merchant,
      relationship: { favor: 20, debt: 0, bond: 'stranger' }
    }))
  }
  assert.equal(
    resolveShopCatalogEntries(lowFavorMerchantContext).some(entry => entry.definition.id === 'merchant_pill_bai_ruoli_001'),
    false
  )
  const merchantPrivatePurchase = resolveShopPurchase({
    stockId: merchantPrivatePill.stockId,
    inventory: [merchantPrivatePill],
    purchasedByStockId: {},
    gold: merchantPrivatePill.price,
    contribution: 0,
    playerInventory: [],
    isInventoryFull: false
  })
  assert.equal(merchantPrivatePurchase.success, true)
  assert.equal(merchantPrivatePurchase.inventoryItem?.definitionId, 'pill_baicao_life')
  const merchantEventPurchase = resolveShopPurchase({
    stockId: merchantEventFood.stockId,
    inventory: [merchantEventFood],
    purchasedByStockId: {},
    gold: merchantEventFood.price,
    contribution: 0,
    playerInventory: [],
    isInventoryFull: false
  })
  assert.equal(merchantEventPurchase.success, true)
  assert.equal(merchantEventPurchase.inventoryItem?.definitionId, 'food_jade_marrow_soup')
  assert.equal(merchantEventFood.merchantEvent?.merchantId, 'npc_bai_ruoli')
  const merchantTradeLog = resolveShopMerchantTradeLog(merchantEventFood)
  assert.equal(merchantTradeLog?.scope, 'npc')
  assert.equal(merchantTradeLog?.actorIds[0], 'npc_bai_ruoli')
  assert.ok(merchantTradeLog?.tags.includes('shop'))
  assert.equal(resolveShopMerchantTradeLog(merchantPill), null)
  const merchantRelationshipDeltas = resolveShopMerchantRelationshipDeltas(merchantEventFood)
  assert.equal(merchantRelationshipDeltas[0]?.npcId, 'npc_bai_ruoli')
  assert.ok((merchantRelationshipDeltas[0]?.favorDelta ?? 0) > 0)
  assert.ok((merchantRelationshipDeltas[0]?.debtDelta ?? 0) <= 0)
  assert.equal(resolveShopMerchantRelationshipDeltas(merchantPill).length, 0)
  const merchantTradeOutcome = resolveShopMerchantTradeOutcome(merchantEventFood, 24)
  assert.equal(merchantTradeOutcome?.relationshipDeltas[0]?.npcId, 'npc_bai_ruoli')
  assert.equal(merchantTradeOutcome?.merchantMemory?.merchantId, 'npc_bai_ruoli')
  assert.equal(merchantTradeOutcome?.merchantMemory?.expiresAtTick, 60)
  const merchantMemory = createShopMerchantMemory(merchantEventFood, 24)
  assert.equal(merchantMemory?.category, 'food')
  const memoryList = upsertShopMerchantMemory([], merchantMemory, 24)
  assert.equal(memoryList.length, 1)
  const memoryInfluence = resolveShopMerchantMemoryInfluence(memoryList, 25)
  assert.ok(memoryInfluence.stockModifier > 1)
  assert.ok(memoryInfluence.priceModifier <= 1)
  assert.ok(memoryInfluence.tags.some(tag => tag.includes('余脉')))
  assert.equal(pruneShopMerchantMemories(memoryList, 61).length, 0)
  const memoryOnlyInfluence = resolveShopMerchantInfluence({
    ...stableMarketContext,
    merchantNpcStates: [],
    merchantMemories: memoryList,
    totalTicks: 25
  })
  assert.ok(memoryOnlyInfluence.tags.some(tag => tag.includes('余脉')))
  const sectToken = stableInventory.find(item => item.definition.id === 'shop_sect_001')
  assert.ok(sectToken, 'joined sect should expose sect contribution exchange item')
  assert.equal(sectToken.definition.sectIds?.includes('qingyun_sect'), true)
  assert.equal(sectToken.definition.contributionCost, 45)
  const contributionBlocked = resolveShopPurchase({
    stockId: sectToken.stockId,
    inventory: [sectToken],
    purchasedByStockId: {},
    gold: sectToken.price,
    contribution: 44,
    playerInventory: [],
    isInventoryFull: false
  })
  assert.equal(contributionBlocked.success, false)
  assert.equal(contributionBlocked.reason, 'contribution_shortage')
  const contributionReady = resolveShopPurchase({
    stockId: sectToken.stockId,
    inventory: [sectToken],
    purchasedByStockId: {},
    gold: sectToken.price,
    contribution: 45,
    playerInventory: [],
    isInventoryFull: false
  })
  assert.equal(contributionReady.success, true)
  assert.equal(contributionReady.contributionCost, 45)
  assert.equal(contributionReady.inventoryItem?.definitionId, 'sect_cloud_order')

  const authority = resolveSectAuthority({ positionLevel: 5, contribution: 10000 })
  assert.equal(authority.canDeclareWar, true)
  assert.equal(authority.availableDirectives.includes('warfare'), true)
  assert.equal(canAuthorityAccessFacility(authority.canUseFacilityTier, 5), false)
  const promoted = resolveSectPromotion({ positionLevel: 1, contribution: 100 })
  assert.equal(promoted.canPromote, true)
  assert.equal(promoted.nextPositionLevel, 2)
  assert.equal(promoted.nextContribution, 0)
  const blockedPromotion = resolveSectPromotion({ positionLevel: 1, contribution: 99 })
  assert.equal(blockedPromotion.canPromote, false)
  assert.equal(blockedPromotion.reason, 'contribution_shortage')
  const directiveChange = resolveSectDirectiveChange({
    availableDirectives: authority.availableDirectives,
    directive: 'warfare'
  })
  assert.equal(directiveChange.canChange, true)
  const blockedDirectiveChange = resolveSectDirectiveChange({
    availableDirectives: ['balanced'],
    directive: 'warfare'
  })
  assert.equal(blockedDirectiveChange.canChange, false)
  assert.equal(blockedDirectiveChange.reason, 'locked')

  const position = { level: 4, name: '执事', requiredContribution: 1500, privileges: [], dailySalary: 150 }
  const readyStipend = resolveSectStipend({
    position,
    directive: 'warfare',
    joinedSectId: 'qingyun_sect',
    lastClaimAt: 0,
    now: 24 * 60 * 60 * 1000
  })
  assert.equal(readyStipend.canClaim, true)
  assert.equal(readyStipend.gold, 150)
  assert.equal(readyStipend.contribution, 84)

  const cooldownStipend = resolveSectStipend({
    position,
    directive: 'balanced',
    joinedSectId: 'qingyun_sect',
    lastClaimAt: 24 * 60 * 60 * 1000,
    now: 24 * 60 * 60 * 1000 + 1000
  })
  assert.equal(cooldownStipend.canClaim, false)
  assert.equal(cooldownStipend.reason, 'cooldown')

  assert.equal(resolveGardenSlotCount(1), 1)
  assert.equal(resolveGardenSlotCount(5), 3)
  const seed = getSeedById('seed_spirit_grass')
  assert.ok(seed, 'fixture seed should exist')
  const matureCrop = { seedId: seed.id, plantedAt: 0, readyAt: 1000, slotIndex: 0 }
  const harvest = resolveGardenHarvest({
    joinedSectId: 'qingyun_sect',
    slotIndex: 0,
    slotCount: 1,
    crop: matureCrop,
    seed,
    gardenLevel: 3,
    directive: 'supply',
    now: 1000,
    random: 0
  })
  assert.equal(harvest.success, true)
  assert.equal(harvest.quantity, 2)
  assert.equal(harvest.item?.definitionId, 'herb_spirit_grass')

  const unready = resolveGardenHarvest({
    joinedSectId: 'qingyun_sect',
    slotIndex: 0,
    slotCount: 1,
    crop: { ...matureCrop, readyAt: 61_000 },
    seed,
    gardenLevel: 1,
    directive: 'balanced',
    now: 1000,
    random: 0
  })
  assert.equal(unready.success, false)
  assert.ok(unready.message.includes('尚未成熟'))
  assert.equal(resolveGardenAccelerateCost({ crop: { ...matureCrop, readyAt: 61_000 }, now: 1000 }), 10)

  const planted = resolveGardenPlanting({
    joinedSectId: 'qingyun_sect',
    seedId: seed.id,
    seed,
    slotIndex: 0,
    slotCount: 1,
    occupiedCrop: null,
    gardenLevel: 1,
    gold: 10,
    now: 1000
  })
  assert.equal(planted.success, true)
  assert.equal(planted.goldCost, 10)
  assert.equal(planted.crop?.readyAt, 1000 + seed.growTime * 60 * 1000)
  const blockedPlant = resolveGardenPlanting({
    joinedSectId: 'qingyun_sect',
    seedId: seed.id,
    seed,
    slotIndex: 0,
    slotCount: 1,
    occupiedCrop: null,
    gardenLevel: 1,
    gold: 9,
    now: 1000
  })
  assert.equal(blockedPlant.success, false)
  assert.ok(blockedPlant.message.includes('灵石不足'))
  const accelerated = resolveGardenAcceleration({
    joinedSectId: 'qingyun_sect',
    crop: { ...matureCrop, readyAt: 61_000 },
    gold: 10,
    now: 1000
  })
  assert.equal(accelerated.success, true)
  assert.equal(accelerated.goldCost, 10)
  assert.equal(accelerated.readyAt, 1000)
  const blockedAcceleration = resolveGardenAcceleration({
    joinedSectId: 'qingyun_sect',
    crop: { ...matureCrop, readyAt: 61_000 },
    gold: 9,
    now: 1000
  })
  assert.equal(blockedAcceleration.success, false)
  assert.ok(blockedAcceleration.message.includes('灵石不足'))

  assert.equal(resolveAvailableAlchemyRecipes(ALCHEMY_RECIPES, 1).every(recipe => recipe.requiredFacilityLevel <= 1), true)
  const recipe = getAlchemyRecipeById('pill_hp_small')
  assert.ok(recipe, 'fixture alchemy recipe should exist')
  assert.ok(Math.abs(resolveAlchemySuccessRate({ recipe, furnaceLevel: 1, directive: 'balanced' }) - 0.85) < 0.00001)
  const blockedAlchemy = resolveAlchemyCraft({
    joinedSectId: 'qingyun_sect',
    recipe,
    furnaceLevel: 1,
    directive: 'balanced',
    gold: 0,
    getMaterialQuantity: () => 0,
    random: 0,
    now: 1000
  })
  assert.equal(blockedAlchemy.success, false)
  assert.equal(blockedAlchemy.consumesMaterials, false)
  assert.ok(blockedAlchemy.message.includes('材料不足'))

  const successfulAlchemy = resolveAlchemyCraft({
    joinedSectId: 'qingyun_sect',
    recipe,
    furnaceLevel: 1,
    directive: 'balanced',
    gold: 0,
    getMaterialQuantity: () => 99,
    random: 0,
    now: 1000
  })
  assert.equal(successfulAlchemy.success, true)
  assert.equal(successfulAlchemy.consumesMaterials, true)
  assert.equal(successfulAlchemy.item?.definitionId, 'pill_hp_small')

  const failedAlchemy = resolveAlchemyCraft({
    joinedSectId: 'qingyun_sect',
    recipe,
    furnaceLevel: 1,
    directive: 'balanced',
    gold: 0,
    getMaterialQuantity: () => 99,
    random: 0.99,
    now: 1000
  })
  assert.equal(failedAlchemy.success, false)
  assert.equal(failedAlchemy.consumesMaterials, true)
  assert.ok(failedAlchemy.message.includes('材料已消耗'))

  const taskFixture = [
    {
      id: 'daily_battle',
      name: '巡山除妖',
      description: '击败山中妖兽',
      type: 'daily',
      requirements: { type: 'battle', target: 'monster', count: 2 },
      rewards: { contribution: 10, gold: 20, exp: 5 },
      progress: 1,
      completed: false,
      claimed: false
    },
    {
      id: 'daily_any_craft',
      name: '内务炼制',
      description: '完成任意炼制',
      type: 'daily',
      requirements: { type: 'craft', target: 'any', count: 1 },
      rewards: { contribution: 6, gold: 8 },
      progress: 0,
      completed: false,
      claimed: false
    }
  ]
  const progressedTasks = resolveSectTaskProgress(taskFixture, {
    joinedSectId: 'qingyun_sect',
    type: 'battle',
    target: 'monster'
  })
  assert.deepEqual(progressedTasks.advancedTaskIds, ['daily_battle'])
  assert.deepEqual(progressedTasks.completedTaskIds, ['daily_battle'])
  assert.equal(progressedTasks.tasks[0].completed, true)

  const manualTask = resolveManualSectTaskProgress(taskFixture, 'daily_any_craft')
  assert.equal(manualTask.tasks[1].completed, true)
  const dutyProgress = resolveSectDuty({
    joinedSectId: 'qingyun_sect',
    sectName: '青云宗',
    positionName: '外门弟子',
    directive: 'balanced',
    stamina: 100,
    tasks: taskFixture
  })
  assert.equal(dutyProgress.success, true)
  assert.equal(dutyProgress.taskId, 'daily_battle')
  assert.equal(dutyProgress.completedTask, true)
  assert.equal(dutyProgress.staminaCost, 10)
  assert.equal(dutyProgress.rewards.contribution, 4)
  const dutyBlocked = resolveSectDuty({
    joinedSectId: null,
    sectName: null,
    positionName: '散修',
    directive: 'balanced',
    stamina: 100,
    tasks: taskFixture
  })
  assert.equal(dutyBlocked.success, false)
  assert.ok(dutyBlocked.reason.includes('尚未加入宗门'))
  const dutyStaminaBlocked = resolveSectDuty({
    joinedSectId: 'qingyun_sect',
    sectName: '青云宗',
    positionName: '外门弟子',
    directive: 'balanced',
    stamina: 2,
    tasks: taskFixture
  })
  assert.equal(dutyStaminaBlocked.success, false)
  assert.ok(dutyStaminaBlocked.reason.includes('体力不足'))
  const singleClaim = resolveSectTaskClaim(progressedTasks.tasks[0], 'warfare')
  assert.equal(singleClaim.canClaim, true)
  assert.equal(singleClaim.reward.reputation, 14)
  const claimAll = resolveSectTaskClaimAll(progressedTasks.tasks, 'balanced')
  assert.deepEqual(claimAll.taskIds, ['daily_battle'])
  assert.equal(claimAll.reward.contribution, 10)
  assert.equal(claimAll.reward.gold, 20)
  assert.equal(claimAll.reward.exp, 5)

  const generatedDailyTasks = resolveSectTaskGeneration({
    joinedSectId: 'qingyun_sect',
    type: 'daily',
    directive: 'warfare',
    generateTask: (type, sectId) => ({
      id: `${type}_${sectId}`,
      name: '巡山',
      description: '巡山任务',
      type,
      requirements: { type: 'battle', target: 'monster', count: 1 },
      rewards: { contribution: 10, gold: 10 },
      progress: 0,
      completed: false,
      claimed: false
    })
  })
  assert.equal(generatedDailyTasks.generatedCount, 3)
  assert.equal(generatedDailyTasks.tasks[0].rewards.contribution, 11)
  const blockedGeneratedTasks = resolveSectTaskGeneration({
    joinedSectId: null,
    type: 'weekly',
    directive: 'balanced',
    generateTask: () => {
      throw new Error('should not generate task without joined sect')
    }
  })
  assert.equal(blockedGeneratedTasks.generatedCount, 0)
  const refreshedTasks = resolveSectTaskRefresh({
    joinedSectId: 'qingyun_sect',
    tasks: [
      ...taskFixture,
      {
        id: 'special_task',
        name: '宗门密令',
        description: '特殊任务',
        type: 'special',
        requirements: { type: 'explore', target: 'any', count: 1 },
        rewards: { contribution: 1, gold: 1 },
        progress: 0,
        completed: false,
        claimed: false
      }
    ],
    lastRefreshAt: 0,
    now: 24 * 60 * 60 * 1000 + 1
  })
  assert.equal(refreshedTasks.shouldRefresh, true)
  assert.deepEqual(refreshedTasks.taskTypes, ['daily', 'weekly'])
  assert.deepEqual(refreshedTasks.retainedTasks.map(task => task.id), ['special_task'])

  const facilityLevels = resolveInitialFacilityLevels(SECT_FACILITIES)
  assert.equal(resolveFacilityLevel(facilityLevels, 'alchemy_furnace'), 1)
  assert.equal(resolveFacilityLevel({}, 'unknown_facility'), 1)
  const alchemyFurnace = SECT_FACILITIES.find(facility => facility.id === 'alchemy_furnace')
  assert.ok(alchemyFurnace, 'fixture facility should exist')
  const upgradeReady = resolveFacilityUpgrade({
    facility: alchemyFurnace,
    joinedSectId: 'qingyun_sect',
    positionLevel: 1,
    currentLevel: 1,
    gold: 500,
    contribution: 50
  })
  assert.equal(upgradeReady.canUpgrade, true)
  assert.equal(upgradeReady.nextLevel, 2)
  const upgradeBlocked = resolveFacilityUpgrade({
    facility: alchemyFurnace,
    joinedSectId: 'qingyun_sect',
    positionLevel: 1,
    currentLevel: 1,
    gold: 499,
    contribution: 50
  })
  assert.equal(upgradeBlocked.canUpgrade, false)
  assert.equal(upgradeBlocked.reason, 'gold_shortage')

  const qingyunSect = getSectById('qingyun_sect')
  assert.ok(qingyunSect, 'fixture sect should exist')
  const lockedJoin = resolveSectJoin({
    sect: qingyunSect,
    sectId: 'qingyun_sect',
    unlockedSectIds: [],
    currentJoinedSectId: null,
    facilityLevels
  })
  assert.equal(lockedJoin.canJoin, false)
  assert.equal(lockedJoin.reason, 'locked')
  const readyJoin = resolveSectJoin({
    sect: qingyunSect,
    sectId: 'qingyun_sect',
    unlockedSectIds: ['qingyun_sect'],
    currentJoinedSectId: null,
    facilityLevels
  })
  assert.equal(readyJoin.canJoin, true)
  assert.equal(readyJoin.nextState?.sectHp, qingyunSect.maxHp)
  assert.equal(readyJoin.nextState?.facilityLevels.alchemy_furnace, 1)
  const blockedLeave = resolveSectLeave({
    joinedSectId: null,
    defaultGardenSlots: [null, null, null]
  })
  assert.equal(blockedLeave.canLeave, false)
  assert.equal(blockedLeave.reason, 'not_joined')
  const readyLeave = resolveSectLeave({
    joinedSectId: 'qingyun_sect',
    defaultGardenSlots: [null, null, null]
  })
  assert.equal(readyLeave.canLeave, true)
  assert.equal(readyLeave.nextState?.worldCondition.status, 'stable')
  assert.equal(readyLeave.nextState?.activeDirective, 'balanced')

  const eventChoice = resolveSectEventChoice({
    id: 'event_fixture',
    type: 'resource_discovery',
    title: '灵矿显露',
    description: '山门发现一处灵矿',
    handled: false,
    choices: [
      {
        id: 'claim',
        text: '开采',
        outcome: {
          description: '获得资源',
          effects: [
            { type: 'gold', value: 120 },
            { type: 'contribution', value: 8 },
            { type: 'reputation', value: 3 },
            { type: 'item', value: 'ore' }
          ]
        }
      }
    ]
  }, 'claim')
  assert.equal(eventChoice.success, true)
  assert.equal(eventChoice.effects.gold, 120)
  assert.equal(eventChoice.effects.contribution, 8)
  assert.equal(eventChoice.effects.reputation, 3)
  assert.deepEqual(eventChoice.effects.itemValues, ['ore'])
  assert.equal(eventChoice.handledEvent?.handled, true)
  assert.equal(eventChoice.handledEvent?.selectedChoice, 'claim')
  const missingEventChoice = resolveSectEventChoice(null, 'claim')
  assert.equal(missingEventChoice.success, false)
  assert.equal(missingEventChoice.reason, 'missing_event')

  const warFixture = {
    id: 'war_fixture',
    attackerSectId: 'qingyun_sect',
    defenderSectId: 'medicine_valley',
    startDate: { year: 1, month: 1, day: 1 },
    status: 'ongoing',
    attackerScore: 100,
    defenderScore: 60,
    winScore: 100
  }
  const warVictory = resolveSectWarConclusion({
    war: warFixture,
    attackerWon: true,
    directive: 'warfare',
    sectHp: 1000,
    sectMaxHp: 1000,
    now: 1000
  })
  assert.equal(warVictory.winner, 'attacker')
  assert.equal(warVictory.rewards.contribution, 660)
  assert.equal(warVictory.rewards.gold, 1227)
  assert.equal(warVictory.rewards.reputation, 118)
  assert.equal(warVictory.nextDefenderRelation, 'hostile')
  assert.equal(warVictory.nextSectHp, 880)

  const warDefeat = resolveSectWarConclusion({
    war: { ...warFixture, attackerScore: 60, defenderScore: 100 },
    attackerWon: false,
    directive: 'balanced',
    sectHp: 1000,
    sectMaxHp: 1000,
    now: 1000
  })
  assert.equal(warDefeat.winner, 'defender')
  assert.equal(warDefeat.rewards.contribution, 200)
  assert.equal(warDefeat.penalties.contribution, 200)
  assert.equal(warDefeat.penalties.reputation, 100)
  assert.equal(warDefeat.nextDefenderRelation, 'neutral')
  assert.equal(warDefeat.nextSectHp, 780)

  const blockedWarDeclaration = resolveSectWarDeclaration({
    joinedSectId: 'qingyun_sect',
    canDeclareWar: false,
    hasActiveWar: false,
    targetSectId: 'medicine_valley',
    targetExists: true,
    now: 1000
  })
  assert.equal(blockedWarDeclaration.canDeclare, false)
  assert.equal(blockedWarDeclaration.reason, 'no_authority')
  const readyWarDeclaration = resolveSectWarDeclaration({
    joinedSectId: 'qingyun_sect',
    canDeclareWar: true,
    hasActiveWar: false,
    targetSectId: 'medicine_valley',
    targetExists: true,
    now: 1000
  })
  assert.equal(readyWarDeclaration.canDeclare, true)
  assert.equal(readyWarDeclaration.war?.id, 'war_1000')
  assert.equal(readyWarDeclaration.war?.startDate.year, 1970)
  const advancedWar = resolveSectWarAdvance({
    war: { ...warFixture, attackerScore: 89 },
    attackerWon: true,
    random: 0.99
  })
  assert.equal(advancedWar.ended, true)
  assert.equal(advancedWar.attackerWon, true)
  assert.equal(advancedWar.war.attackerScore, 103)
  assert.equal(advancedWar.war.status, 'victory')

  const worldTickWar = resolveSectWorldTick({
    totalTicks: 2,
    now: 1000,
    state: {
      joinedSectId: 'qingyun_sect',
      reputation: 1000,
      sectHp: 1000,
      sectMaxHp: 1000,
      relations: {},
      activeWar: warFixture
    },
    currentSect: qingyunSect,
    defenderSect: getSectById('medicine_valley'),
    unlockedSectIds: ['qingyun_sect', 'medicine_valley']
  })
  assert.equal(Boolean(worldTickWar.warProgress), true)
  assert.equal(worldTickWar.events[0]?.id, 'sect_world_war_1000')
  assert.equal(worldTickWar.events[0]?.type, 'sect_conflict')
  const quietWorldTick = resolveSectWorldTick({
    totalTicks: 2,
    now: 1000,
    state: {
      joinedSectId: 'qingyun_sect',
      reputation: 1000,
      sectHp: 1000,
      sectMaxHp: 1000,
      relations: {},
      activeWar: null
    },
    currentSect: qingyunSect,
    defenderSect: null,
    unlockedSectIds: ['qingyun_sect']
  })
  assert.equal(quietWorldTick.warProgress, null)
  assert.equal(quietWorldTick.relationDrift, null)
  assert.deepEqual(quietWorldTick.events, [])
})

test('story gameplay runtime resolves non-battle outcomes', async () => {
  const {
    applyStoryGameplayAreaPatch,
    resolveStoryGameplay
  } = await load('/src/story/runtime/storyGameplayRuntime.ts')

  const context = {
    player: {
      cultivation: 260,
      stamina: 18,
      maxStamina: 100,
      gold: 100,
      consumeStamina: () => true
    },
    world: {
      currentTimeLabel: '修仙历1年1月1日 午时',
      npcDefinitions: [
        { id: 'su_qingyuan', name: '苏清鸢', homeMapId: 'qingyun_mountain' },
        { id: 'npc_su_qingyuan', name: '苏清鸢', homeMapId: 'qingyun_mountain' }
      ],
      unlockedNpcDefinitions: [
        { id: 'su_qingyuan', name: '苏清鸢', homeMapId: 'qingyun_mountain' },
        { id: 'npc_su_qingyuan', name: '苏清鸢', homeMapId: 'qingyun_mountain' }
      ]
    },
    map: {
      getAreaState: areaId => areaId === 'qingyun_mountain'
        ? { stability: 52, pressure: 18, contested: false }
        : null
    }
  }

  const collect = resolveStoryGameplay({
    type: 'collect',
    targetId: '灵草',
    params: {
      required: 2,
      itemName: '剧情灵草',
      itemId: 'story_spirit_herb',
      areaId: 'qingyun_mountain'
    }
  }, context)
  assert.equal(collect.result.success, true)
  assert.equal(collect.reward.item?.name, '剧情灵草')
  assert.equal(collect.reward.item?.quantity, 2)
  assert.equal(collect.areaPatch?.areaId, 'qingyun_mountain')
  assert.equal(collect.areaPatch?.pressureDelta, -1)
  assert.equal(collect.log.scope, 'player')
  assert.ok(Array.isArray(collect.result.data?.rewards))

  const dialog = resolveStoryGameplay({
    type: 'dialog',
    targetId: 'C001',
    params: { favorDelta: 8 }
  }, context)
  assert.equal(dialog.result.success, true)
  assert.equal(dialog.relationshipDeltas[0]?.npcId, 'npc_su_qingyuan')
  assert.equal(dialog.relationshipDeltas[0]?.favorDelta, 8)
  assert.equal(dialog.log.scope, 'npc')

  const explore = resolveStoryGameplay({
    type: 'explore',
    targetId: 'qingyun_mountain',
    params: { unlockArea: true, stabilityDelta: 4, pressureDelta: -6 }
  }, context)
  assert.equal(explore.result.success, true)
  assert.equal(explore.areaPatch?.unlock, true)
  const patchedArea = applyStoryGameplayAreaPatch(explore.areaPatch, context.map.getAreaState('qingyun_mountain'))
  assert.equal(patchedArea.stability, 56)
  assert.equal(patchedArea.pressure, 12)

  const failed = resolveStoryGameplay({
    type: 'puzzle',
    targetId: 'ancient_lock',
    params: { difficulty: 12, staminaCost: 40 }
  }, context)
  assert.equal(failed.result.success, false)
  assert.equal(failed.reward.cultivation, 0)
  assert.equal(failed.areaPatch, undefined)
  assert.equal(failed.log.tags.includes('failure'), true)
})

test('npc activity insight summarizes new npc events', async () => {
  const { resolveNpcActivityInsight } = await load('/src/world/runtime/npcActivityInsightResolver.ts')

  const previousNpcStoryIds = new Set(['old_story'])
  const previousLogIds = new Set(['old_log'])
  const definitions = [
    { id: 'npc_su', name: '苏清鸢', role: 'main' },
    { id: 'npc_xue', name: '薛焰', role: 'enemy' }
  ]

  const insight = resolveNpcActivityInsight({
    timeLabel: '修仙历1年1月1日 午时',
    npcDefinitions: definitions,
    previousNpcStoryIds,
    previousLogIds,
    npcStories: [
      {
        id: 'old_story',
        tick: 1,
        timeLabel: '修仙历1年1月1日 巳时',
        npcId: 'npc_su',
        title: '旧纪闻',
        text: '旧事。',
        severity: 'normal',
        tags: ['npc']
      },
      {
        id: 'new_story',
        tick: 2,
        timeLabel: '修仙历1年1月1日 午时',
        npcId: 'npc_su',
        title: '苏清鸢破境',
        text: '苏清鸢在青云山悟出新的剑意。',
        severity: 'major',
        tags: ['npc', 'breakthrough']
      }
    ],
    logs: [
      {
        id: 'new_log',
        tick: 2,
        lastTick: 2,
        timeLabel: '修仙历1年1月1日 午时',
        scope: 'npc',
        severity: 'legendary',
        visibility: 'briefing',
        title: '薛焰设伏',
        text: '薛焰在血海截杀同行者。',
        actorIds: ['npc_xue'],
        tags: ['npc', 'scheme'],
        dedupeKey: 'npc:scheme',
        repeatCount: 1,
        revealed: true
      }
    ]
  })

  assert.equal(insight.totalEvents, 2)
  assert.equal(insight.items[0].npcName, '苏清鸢')
  assert.equal(insight.items[0].label, '破境')
  assert.equal(insight.items[0].tone, 'gold')
  assert.equal(insight.items[1].npcName, '薛焰')
  assert.equal(insight.items[1].label, '谋算')
  assert.equal(insight.items[1].tone, 'rose')

  const quiet = resolveNpcActivityInsight({
    timeLabel: '修仙历1年1月1日 未时',
    npcDefinitions: definitions,
    previousNpcStoryIds: new Set(['new_story']),
    previousLogIds: new Set(['new_log']),
    npcStories: [],
    logs: []
  })
  assert.equal(quiet.totalEvents, 0)
  assert.equal(quiet.items[0].label, '静观')
  assert.equal(quiet.items[0].tone, 'mist')
})

test('adventure sweep resolver returns structured rewards', async () => {
  const { resolveAdventureSweep } = await load('/src/map/runtime/adventureSweepResolver.ts')

  const area = {
    id: 'test_valley',
    name: '试炼谷',
    expReward: { min: 10, max: 10 },
    goldReward: { min: 5, max: 5 },
    drops: [
      {
        id: 'herb',
        name: '灵草',
        icon: '草',
        type: 'material',
        quality: 'common',
        minQuantity: 1,
        maxQuantity: 1,
        dropRate: 1
      }
    ]
  }
  const access = {
    sweepAllowed: true,
    sweepCost: 9,
    entryReason: '可扫荡'
  }
  const encounter = {
    rewardMultiplier: 2,
    riskLevel: 'watch',
    statusText: '灵气翻涌'
  }
  const result = resolveAdventureSweep({
    area,
    access,
    encounter,
    sweepCount: 3,
    rollReward: range => range.min,
    resolveDrops: drops => drops.map(item => ({ item, quantity: 1 }))
  })

  assert.equal(result.success, true)
  assert.equal(result.cultivationGain, 60)
  assert.equal(result.goldGain, 30)
  assert.equal(result.drops[0]?.quantity, 3)
  assert.equal(result.riskLabel, '灵气翻涌')
  assert.deepEqual(result.taskProgress, [
    { type: 'battle', target: 'monster', times: 3 },
    { type: 'explore', target: 'test_valley', times: 3 }
  ])

  const blocked = resolveAdventureSweep({
    area,
    access: { ...access, sweepAllowed: false, entryReason: '战线封锁' },
    encounter: null,
    rollReward: range => range.min,
    resolveDrops: () => []
  })
  assert.equal(blocked.success, false)
  assert.equal(blocked.reason, '战线封锁')
  assert.equal(blocked.staminaCost, 9)
})

test('main loop readiness summarizes p0 action states', async () => {
  const { resolveMainLoopReadiness } = await load('/src/world/runtime/mainLoopReadinessResolver.ts')

  const baseInput = {
    player: {
      isCaptured: false,
      isIdling: false,
      stamina: 80,
      maxStamina: 100,
      canBreakthrough: false
    },
    world: {
      unlockedNpcCount: 5,
      worldBriefingCount: 2,
      hasRecentJourney: false
    },
    story: {
      currentNodeId: null,
      completedCount: 0,
      isInitialized: false
    },
    map: {
      conqueredCount: 0,
      totalAreaCount: 6,
      hasHotspot: true
    },
    sect: {
      joined: false,
      joinableCount: 1,
      activeWar: false,
      completedTaskCount: 0,
      availableTaskCount: 0,
      canClaimSalary: false
    }
  }

  const summary = resolveMainLoopReadiness(baseInput)
  assert.equal(summary.items.length, 6)
  assert.equal(summary.byId.idle.state, 'ready')
  assert.equal(summary.byId.story.state, 'warning')
  assert.equal(summary.byId.sect.label, '可拜山')
  assert.equal(summary.counts.warning, 3)
  assert.match(summary.headline, /需要处理/)

  const captured = resolveMainLoopReadiness({
    ...baseInput,
    player: {
      ...baseInput.player,
      isCaptured: true,
      stamina: 0
    }
  })
  assert.equal(captured.byId.idle.state, 'blocked')
  assert.equal(captured.byId.adventure.state, 'blocked')
  assert.equal(captured.counts.blocked, 2)
  assert.match(captured.headline, /阻塞/)
})

test('player fortune resolver creates deterministic fortune rewards', async () => {
  const { resolvePlayerFortune } = await load('/src/world/runtime/playerFortuneResolver.ts')

  const baseClock = {
    year: 1,
    month: 1,
    day: 1,
    shichenIndex: 0,
    totalTicks: 42,
    lastSimulatedAt: 0
  }
  const blocked = resolvePlayerFortune({
    clock: baseClock,
    idleMode: 'cultivate',
    weather: 'storm',
    stamina: 4,
    areaId: 'misty_forest',
    sectName: null,
    npcCount: 3
  })
  assert.equal(blocked.success, false)
  assert.equal(blocked.staminaCost, 12)

  const fortune = resolvePlayerFortune({
    clock: baseClock,
    idleMode: 'gatherHerbs',
    weather: 'clear',
    stamina: 20,
    areaId: 'misty_forest',
    sectName: '青云宗',
    npcCount: 3
  })
  assert.equal(fortune.success, true)
  assert.equal(fortune.type, 'spirit_herb')
  assert.equal(fortune.staminaCost, 8)
  assert.ok(fortune.item)
  assert.equal(fortune.rewards.some(item => item.type === 'item'), true)
  assert.equal(fortune.tags.includes('fortune'), true)
})

const results = await Promise.all(diagnostics)
await server.close()

const failed = results.filter(result => !result.ok)
for (const result of results) {
  if (result.ok) {
    console.log(`PASS ${result.name}`)
  } else {
    console.error(`FAIL ${result.name}`)
    console.error(result.error?.stack ?? result.error)
  }
}

console.log(`Runtime validation report: ${results.length - failed.length} passed, ${failed.length} failed`)

if (failed.length > 0) {
  process.exitCode = 1
}
