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
