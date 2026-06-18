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

test('battle status runtime negates damage while invincible', async () => {
  const { BattleRuntime } = await load('/src/game/battle/battleRuntime.ts')
  const { processTurnStartStatuses } = await load('/src/game/battle/statusRuntime.ts')
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
  const baseClock = { year: 1, month: 1, day: 1, shichenIndex: 4, totalTicks: 1, lastSimulatedAt: 0 }
  const baseContext = {
    clock: baseClock,
    weather: 'rain',
    baseCultivationGain: 100,
    hasEquippedPet: true,
    activeAnomaly: { areaId: 'qingyun_mountain' },
    fallbackAreaId: 'qingyun_mountain',
    sectHomeAreaId: 'qingyun_mountain'
  }

  const cultivate = resolvePlayerJourney({ ...baseContext, idleMode: 'cultivate' })
  assert.equal(cultivate.cultivationDelta, 110)
  assert.ok(cultivate.petExpDelta >= 2)

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
  const { resolveSectAuthority, canAuthorityAccessFacility } = await load('/src/sect/runtime/sectPositionResolver.ts')
  const { resolveSectStipend } = await load('/src/sect/runtime/sectStipendResolver.ts')

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
  assert.equal(blocked.sweepAllowed, false)

  const authority = resolveSectAuthority({ positionLevel: 5, contribution: 10000 })
  assert.equal(authority.canDeclareWar, true)
  assert.equal(authority.availableDirectives.includes('warfare'), true)
  assert.equal(canAuthorityAccessFacility(authority.canUseFacilityTier, 5), false)

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
