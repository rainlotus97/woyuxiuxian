<template>
  <div class="battle-ui" :class="{ 'is-ended': snapshot?.phase === 'ended', 'is-selecting': isPlayerSelecting }">
    <header class="battle-topbar">
      <button class="icon-button" type="button" aria-label="退出战斗" title="退出战斗" @click="$emit('exit')">
        <LogOut :size="17" :stroke-width="1.8" />
      </button>

      <div class="encounter-title">
        <small>{{ areaName || '无名战场' }} · {{ statusLabel }}</small>
        <h1>{{ snapshot?.result ? resultLabel : '天象斗法' }}</h1>
        <span>{{ currentTime }}</span>
      </div>

      <div class="top-actions">
        <div class="round-pip">
          <small>回合</small>
          <b>{{ snapshot?.turn || 1 }}</b>
        </div>
        <button
          class="tempo-button"
          :class="{ active: autoBattle }"
          type="button"
          :aria-pressed="autoBattle"
          :title="autoBattle ? '切换为手动战斗' : '开启自动战斗'"
          @click="$emit('cycle-auto')"
        >
          <FastForward v-if="autoBattle" :size="14" :stroke-width="2" />
          <Pause v-else :size="14" :stroke-width="2" />
          <span>{{ autoBattle ? `${battleSpeed}x` : '手动' }}</span>
        </button>
      </div>
    </header>

    <div class="battle-brief" aria-live="polite">
      <span class="brief-orb"><Sparkles :size="12" :stroke-width="1.8" /></span>
      <span>{{ latestLog?.text || encounterNote }}</span>
    </div>

    <aside v-if="timelineUnits.length" class="turn-track" aria-label="行动序列">
      <div class="turn-track-header">
        <span>行动轨迹</span>
        <small>{{ timelineUnits.filter(unit => unit.isAlive).length }} 位在场</small>
      </div>
      <ol>
        <li
          v-for="(unit, index) in timelineUnits.slice(0, 7)"
          :key="unit.id"
          class="turn-node"
          :class="{ active: unit.id === snapshot?.currentActorId, dead: !unit.isAlive }"
          :title="`${index + 1}. ${cleanName(unit.name)}${unit.isAlive ? '' : ' · 已退场'}`"
        >
          <span class="turn-node-orb" :class="unit.side">
            <img v-if="getPortrait(unit)" :src="getPortrait(unit)" :alt="`${cleanName(unit.name)}头像`" />
            <span v-else class="fallback-avatar-icon"><GameIcon :icon="battleUnitIcon(unit)" size="sm" /></span>
            <i>{{ index + 1 }}</i>
            <b v-if="!unit.isAlive"><X :size="10" :stroke-width="2.2" /></b>
          </span>
          <span class="turn-node-name">{{ shortName(unit.name) }}</span>
          <span class="turn-node-gauge"><i :style="{ width: `${unit.actionGauge}%` }"></i></span>
          <span v-if="unit.statusEffects.length" class="turn-node-statuses">
            <em
              v-for="effect in unit.statusEffects.slice(0, 2)"
              :key="`${unit.id}-${effect.type}`"
              :class="statusTone(effect.type)"
              :title="`${statusChipLabel(effect.type)} · 剩余${effect.duration}回合`"
            ><GameIcon :icon="statusIcon(effect.type)" size="xs" /></em>
          </span>
        </li>
      </ol>
    </aside>

    <section
      v-if="snapshot && snapshot.phase !== 'ended'"
      class="command-dock"
      :class="{ 'is-awaiting': !isPlayerSelecting }"
      aria-label="战斗指令"
    >
      <template v-if="isPlayerSelecting">
      <div class="dock-heading">
        <div class="active-actor">
          <span class="actor-avatar">
            <img v-if="currentActor && getPortrait(currentActor)" :src="getPortrait(currentActor)" :alt="`${actorName}头像`" />
            <span v-else class="fallback-avatar-icon"><GameIcon :icon="currentActor ? battleUnitIcon(currentActor) : 'sword'" size="sm" /></span>
          </span>
          <div>
            <small>轮到出手</small>
            <strong>{{ actorName }}</strong>
          </div>
        </div>

        <div class="spirit-meter" aria-label="灵火">
          <div class="spirit-meter-label">
            <span><Zap :size="13" :stroke-width="2.2" /> 灵火</span>
            <b>{{ snapshot.spiritFire }}/{{ snapshot.maxSpiritFire }}</b>
          </div>
          <div class="spirit-track"><i :style="{ width: `${spiritPercent}%` }"></i></div>
        </div>

        <div class="target-lock">
          <small>锁定方式</small>
          <strong>{{ targetHint }}</strong>
        </div>
      </div>

      <div v-if="targets.length" class="target-rail" aria-label="选择目标">
        <span class="rail-label"><Crosshair :size="12" /> 目标</span>
        <button
          v-for="target in targets"
          :key="target.id"
          class="target-button"
          :class="[target.side, { selected: selectedTargetId === target.id }]"
          type="button"
          :aria-pressed="selectedTargetId === target.id"
          :title="`选择${cleanName(target.name)}`"
          @click="$emit('select-target', target.id)"
        >
          <span class="target-avatar">
            <img v-if="getPortrait(target)" :src="getPortrait(target)" :alt="`${cleanName(target.name)}头像`" />
            <span v-else class="fallback-avatar-icon"><GameIcon :icon="battleUnitIcon(target)" size="sm" /></span>
            <span v-if="target.statusEffects.length" class="target-status-stack">
              <em
                v-for="effect in target.statusEffects.slice(0, 2)"
                :key="`${target.id}-${effect.type}`"
                :class="statusTone(effect.type)"
                :title="`${statusChipLabel(effect.type)} · 剩余${effect.duration}回合`"
              ><GameIcon :icon="statusIcon(effect.type)" size="xs" /></em>
            </span>
          </span>
          <span class="target-copy">
            <b>{{ cleanName(target.name) }}</b>
            <i><span :style="{ width: `${hpPercent(target)}%` }"></span></i>
          </span>
          <Crosshair v-if="selectedTargetId === target.id" class="target-selected" :size="13" :stroke-width="2" />
        </button>
      </div>

      <div class="command-row">
        <button class="command-button attack" type="button" title="普通攻击" @click="$emit('attack')">
          <span class="command-icon"><Swords :size="19" :stroke-width="1.7" /></span>
          <span class="command-label"><b>普通攻击</b><small>不消耗灵火</small></span>
        </button>

        <button
          v-for="skill in skills"
          :key="skill.id"
          class="command-button"
          :class="{ selected: selectedSkillId === skill.id, cooling: skill.currentCooldown > 0 }"
          type="button"
          :disabled="skill.cost > snapshot.spiritFire || skill.currentCooldown > 0"
          :title="skill.currentCooldown > 0 ? `${skill.name}冷却中` : `施展${skill.name}`"
          @click="$emit('skill', skill.id)"
        >
          <span class="command-icon"><GameIcon :icon="skill.icon" :size="19" /></span>
          <span class="command-label">
            <b>{{ skill.name }}</b>
            <small>{{ skill.currentCooldown > 0 ? `冷却 ${skill.currentCooldown}` : `消耗 ${skill.cost}` }}</small>
          </span>
          <span class="command-scope" :class="scopeClass(skill.targetType)" :title="scopeLabel(skill.targetType)">
            <UsersRound v-if="isGroupScope(skill.targetType)" :size="10" :stroke-width="2" />
            <UserRound v-else-if="skill.targetType === 'self'" :size="10" :stroke-width="2" />
            <Crosshair v-else :size="10" :stroke-width="2" />
          </span>
        </button>

        <button class="command-button retreat" type="button" title="脱离战场" @click="$emit('flee')">
          <span class="command-icon"><LogOut :size="17" :stroke-width="1.8" /></span>
          <span class="command-label"><b>脱战</b><small>离开当前战局</small></span>
        </button>
      </div>
      </template>
      <div v-else class="turn-await" aria-live="polite">
        <span class="await-orb"><CircleDot :size="15" :stroke-width="1.7" /></span>
        <div>
          <small>{{ autoBattle ? `自动战斗 ${battleSpeed}x` : '行动结算中' }}</small>
          <strong>{{ latestLog?.text || '气机正在重排' }}</strong>
        </div>
        <span class="await-spirit"><Zap :size="13" /> {{ snapshot.spiritFire }}/{{ snapshot.maxSpiritFire }}</span>
      </div>
    </section>

    <Transition name="result-rise">
      <section v-if="snapshot?.phase === 'ended' && snapshot.result" class="battle-result" aria-live="assertive">
        <div class="result-backdrop"></div>
        <div class="result-panel">
          <span class="result-seal" :class="snapshot.result">
            <Trophy v-if="snapshot.result === 'victory'" :size="28" :stroke-width="1.5" />
            <LogOut v-else-if="snapshot.result === 'fled'" :size="26" :stroke-width="1.6" />
            <X v-else :size="28" :stroke-width="1.6" />
          </span>
          <small class="result-kicker">交锋已定</small>
          <h2>{{ resultLabel }}</h2>
          <p v-if="snapshot.result === 'victory'">这一战的余波已经写入你的修途。</p>
          <p v-else-if="snapshot.result === 'defeat'">败势已成，天地不会因一次退败停下。</p>
          <p v-else>你从战局中抽身，未带走本场战利品。</p>

          <div v-if="snapshot.result === 'victory'" class="result-rewards">
            <div><small>修为</small><b>+{{ rewards.cultivation }}</b></div>
            <div><small>灵石</small><b>+{{ rewards.gold }}</b></div>
          </div>

          <div v-if="snapshot.result === 'victory' && drops.length" class="result-drops">
            <div class="result-drops-heading"><span>战利品</span><small>{{ drops.length }} 项</small></div>
            <div v-for="drop in drops" :key="drop.name" class="result-drop">
              <span>{{ drop.name }}</span>
              <b>x{{ drop.quantity }}</b>
            </div>
          </div>

          <button class="result-confirm" type="button" @click="$emit('confirm')">
            <span>{{ snapshot.result === 'victory' ? '收下战果' : '离开战场' }}</span>
            <ChevronRight :size="17" :stroke-width="1.9" />
          </button>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronRight,
  CircleDot,
  Crosshair,
  FastForward,
  LogOut,
  Pause,
  Sparkles,
  Swords,
  Trophy,
  UserRound,
  UsersRound,
  X,
  Zap
} from 'lucide-vue-next'
import type { BattleRuntimeSnapshot, BattleRuntimeUnit } from '@/game/battle/runtimeTypes'
import type { BattleJourneyDrop } from '@/game/battle/battleJourneyResolver'
import GameIcon from '@/components/game-ui/GameIcon.vue'

interface BattleSkillOption {
  id: string
  name: string
  icon: string
  cost: number
  currentCooldown: number
  targetType: string
}

interface BattleTargetOption {
  id: string
  name: string
  icon: string
  markerText?: string
  portraitKey?: string
  avatarUrl?: string
  side: 'ally' | 'enemy'
  currentHp: number
  maxHp: number
  statusEffects: BattleRuntimeUnit['statusEffects']
}

const portraitModules = import.meta.glob('@/assets/story/characters/portraits-9x16/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const props = defineProps<{
  snapshot: BattleRuntimeSnapshot | null
  areaName: string | null
  currentTime: string
  statusLabel: string
  encounterNote: string
  autoBattle: boolean
  battleSpeed: 1 | 2 | 3
  actorName: string
  targetHint: string
  targets: BattleTargetOption[]
  selectedSkillId: string | null
  selectedTargetId: string | null
  skills: BattleSkillOption[]
  resultLabel: string
  rewards: { cultivation: number; gold: number }
  drops: BattleJourneyDrop[]
  isPlayerSelecting: boolean
}>()

defineEmits<{
  exit: []
  'cycle-auto': []
  attack: []
  flee: []
  skill: [skillId: string]
  'select-target': [targetId: string]
  confirm: []
}>()

const timelineUnits = computed(() => [...(props.snapshot?.units ?? [])].sort((a, b) => b.actionGauge - a.actionGauge))
const currentActor = computed(() => {
  const id = props.snapshot?.currentActorId
  return props.snapshot?.units.find(unit => unit.id === id) ?? null
})
const latestLog = computed(() => {
  const logs = props.snapshot?.logs ?? []
  return logs[logs.length - 1] ?? null
})
const spiritPercent = computed(() => {
  const max = props.snapshot?.maxSpiritFire || 1
  return Math.min(100, Math.max(0, ((props.snapshot?.spiritFire || 0) / max) * 100))
})

function cleanName(name: string) {
  return name.replace('[BOSS]', '').replace('[精英]', '').trim()
}

function shortName(name: string) {
  return cleanName(name).slice(0, 5)
}

function hpPercent(target: BattleTargetOption) {
  return Math.min(100, Math.max(0, (target.currentHp / Math.max(1, target.maxHp)) * 100))
}

function isGroupScope(targetType: string) {
  return targetType === 'all_enemies' || targetType === 'all_allies'
}

function scopeClass(targetType: string) {
  if (isGroupScope(targetType)) return 'group'
  if (targetType === 'self') return 'self'
  if (targetType === 'single_ally') return 'ally'
  return 'enemy'
}

function scopeLabel(targetType: string) {
  const labels: Record<string, string> = {
    single_enemy: '单体敌方',
    all_enemies: '敌方全体',
    single_ally: '单体友方',
    all_allies: '我方全体',
    self: '自身'
  }
  return labels[targetType] ?? '单体敌方'
}

function statusChipLabel(type: string) {
  const labels: Record<string, string> = {
    poison: '毒', burn: '燃', bleed: '血', freeze: '冻', stun: '晕', spirit_seal: '封',
    buff_atk: '攻', buff_def: '防', buff_spd: '速', debuff_atk: '弱', debuff_def: '破',
    vulnerable: '伤', shield: '盾', invincible: '无', lifesteal: '吸', dodge: '闪', counter: '反',
    element_damage: '行'
  }
  return labels[type] ?? '异'
}

function statusIcon(type: string) {
  const icons: Record<string, string> = {
    poison: 'herb', burn: 'fire', bleed: 'slash', freeze: 'ice', stun: 'thunder', spirit_seal: 'lock',
    buff_atk: 'sword', buff_def: 'armor', buff_spd: 'wind', debuff_atk: 'sword', debuff_def: 'armor',
    vulnerable: 'void', shield: 'armor', invincible: 'star', lifesteal: 'spark', dodge: 'wind',
    counter: 'sword', element_damage: 'spark'
  }
  return icons[type] ?? 'spark'
}

function statusTone(type: string) {
  return type.startsWith('buff') || ['shield', 'invincible', 'lifesteal', 'dodge', 'counter', 'element_damage'].includes(type)
    ? 'positive'
    : 'negative'
}

function battleUnitIcon(unit: {
  side: 'ally' | 'enemy'
  type?: string
  battleRole?: string
  markerText?: string
  icon?: string
}) {
  const semanticMarkers: Record<string, string> = {
    剑: 'sword', 锋: 'mission', 敌: 'skull', 魁: 'crown', 灵: 'beast', 召: 'spark', 伴: 'companion'
  }
  const icon = unit.icon?.trim() || unit.markerText?.trim() || ''
  if (icon && !semanticMarkers[icon]) return icon
  if (unit.side === 'enemy') {
    if (unit.battleRole === 'boss' || icon === '魁') return 'crown'
    if (unit.battleRole === 'elite' || icon === '锋') return 'mission'
    return 'skull'
  }
  if (unit.type === 'pet') return 'beast'
  if (unit.type === 'summon') return 'spark'
  if (unit.type === 'companion') return 'companion'
  return semanticMarkers[icon] ?? 'sword'
}

function findPortrait(filename: string) {
  return Object.entries(portraitModules).find(([path]) => path.endsWith(filename))?.[1] ?? ''
}

function getPortrait(unit: Pick<BattleRuntimeUnit, 'name' | 'avatarUrl' | 'type'> | BattleTargetOption) {
  const name = cleanName(unit.name)
  if ('type' in unit && unit.type === 'protagonist') {
    return unit.avatarUrl || findPortrait('luo-yanzhi-main-9x16-v1.png')
  }
  const known: Record<string, string> = {
    洛衍之: findPortrait('luo-yanzhi-main-9x16-v1.png'),
    顾长惜: findPortrait('gu-changxi-adult-9x16-v1.png'),
    江溯: findPortrait('jiangsu-redesign-9x16-v3.png'),
    九幽子: findPortrait('jiuyouzi-redesign-9x16-v2.png'),
    谢不语: findPortrait('xiebuyu-redesign-9x16-v2.png')
  }
  return Object.entries(known).find(([key]) => name.includes(key))?.[1] || unit.avatarUrl || ''
}
</script>

<style scoped>
.battle-ui {
  --ink: #eaf4ef;
  --muted: rgba(194, 218, 208, 0.72);
  --faint: rgba(146, 177, 170, 0.58);
  --line: rgba(147, 191, 179, 0.2);
  --panel: rgba(5, 19, 26, 0.88);
  --jade: #70d5bd;
  --gold: #e4b866;
  --red: #f08476;
  position: absolute;
  inset: 0;
  z-index: 3;
  color: var(--ink);
  font-family: var(--font-reading-sans), sans-serif;
  pointer-events: none;
}

.battle-topbar,
.battle-brief,
.turn-track,
.command-dock,
.turn-await,
.battle-result {
  pointer-events: auto;
}

.battle-topbar {
  position: absolute;
  top: max(13px, env(safe-area-inset-top));
  left: max(14px, env(safe-area-inset-left));
  right: max(14px, env(safe-area-inset-right));
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-height: 42px;
}

.battle-topbar::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: -9px;
  left: 50px;
  height: 1px;
  background: linear-gradient(90deg, rgba(112, 213, 189, 0.42), rgba(112, 213, 189, 0.04) 76%, transparent);
}

.icon-button,
.tempo-button {
  min-width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: rgba(5, 18, 25, 0.68);
  color: var(--muted);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 8px 24px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(16px);
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease, transform 160ms ease;
}

.icon-button:hover,
.tempo-button:hover,
.command-button:hover:not(:disabled),
.target-button:hover {
  border-color: rgba(112, 213, 189, 0.64);
  color: #f4fff9;
}

.icon-button:active,
.tempo-button:active,
.command-button:active:not(:disabled),
.target-button:active {
  transform: translateY(1px) scale(0.98);
}

.encounter-title {
  min-width: 0;
  display: grid;
  gap: 1px;
}

.encounter-title small,
.encounter-title span,
.round-pip small,
.active-actor small,
.target-lock small,
.spirit-meter-label,
.turn-track-header,
.turn-await small,
.result-kicker,
.result-rewards small,
.result-drops-heading {
  color: var(--faint);
  font-size: 9px;
  letter-spacing: 0.1em;
}

.encounter-title small,
.encounter-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.encounter-title h1 {
  margin: 0;
  overflow: hidden;
  color: #f0c674;
  font-family: var(--font-game), serif;
  font-size: clamp(16px, 2.2vw, 22px);
  font-weight: 700;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.encounter-title span {
  color: rgba(188, 214, 204, 0.55);
  font-size: 9px;
  letter-spacing: 0.02em;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.round-pip {
  display: grid;
  justify-items: end;
  gap: 1px;
  line-height: 1;
}

.round-pip b {
  color: var(--ink);
  font-size: 16px;
  font-weight: 700;
}

.tempo-button {
  min-width: 68px;
  padding: 0 9px;
  font-size: 10px;
}

.tempo-button.active {
  border-color: rgba(112, 213, 189, 0.7);
  background: rgba(39, 116, 103, 0.48);
  color: var(--jade);
}

.battle-brief {
  position: absolute;
  top: 72px;
  left: 50%;
  width: min(430px, calc(100% - 62px));
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 25px;
  padding: 4px 9px;
  transform: translateX(-50%);
  border-bottom: 1px solid rgba(147, 191, 179, 0.15);
  color: rgba(218, 235, 226, 0.72);
  font-size: 10px;
  line-height: 1.25;
  text-align: center;
}

.battle-brief > span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brief-orb {
  width: 20px;
  height: 20px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(112, 213, 189, 0.4);
  border-radius: 50%;
  color: var(--jade);
}

.turn-track {
  position: absolute;
  top: 98px;
  right: max(14px, env(safe-area-inset-right));
  width: 86px;
  padding: 8px 7px 9px;
  border-left: 1px solid rgba(228, 184, 102, 0.42);
  background: linear-gradient(180deg, rgba(5, 19, 26, 0.24), rgba(5, 19, 26, 0.58));
  backdrop-filter: blur(10px);
}

.turn-track-header {
  display: grid;
  gap: 3px;
  margin-bottom: 8px;
  line-height: 1.1;
}

.turn-track-header small {
  color: var(--jade);
  font-size: 8px;
  letter-spacing: 0;
}

.turn-track ol {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.turn-node {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 3px;
  opacity: 0.55;
  transition: opacity 160ms ease, transform 160ms ease;
}

.turn-node.active {
  opacity: 1;
  transform: translateX(-3px);
}

.turn-node.dead {
  filter: grayscale(1);
  opacity: 0.16;
}

.turn-node-orb {
  position: relative;
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(112, 213, 189, 0.52);
  border-radius: 50%;
  background: rgba(16, 54, 57, 0.76);
  color: var(--jade);
  font-size: 10px;
}

.turn-node-orb.enemy {
  border-color: rgba(240, 132, 118, 0.55);
  background: rgba(84, 37, 44, 0.72);
  color: var(--red);
}

.turn-node.active .turn-node-orb {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(228, 184, 102, 0.18), 0 0 16px rgba(228, 184, 102, 0.3);
}

.turn-node-orb img,
.actor-avatar img,
.target-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: 50% 24%;
}

.turn-node-orb > i {
  position: absolute;
  top: -3px;
  left: -3px;
  width: 12px;
  height: 12px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(228, 184, 102, 0.56);
  border-radius: 50%;
  background: #10272d;
  color: var(--gold);
  font-size: 7px;
  font-style: normal;
}

.turn-node-orb > b {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(5, 12, 16, 0.62);
  color: var(--red);
}

.turn-node-name {
  max-width: 72px;
  overflow: hidden;
  color: rgba(220, 238, 228, 0.78);
  font-size: 9px;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.turn-node-gauge {
  width: 48px;
  height: 2px;
  display: block;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(146, 177, 170, 0.18);
}

.turn-node-gauge i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--jade);
}

.turn-node:nth-child(even) .turn-node-gauge i {
  background: var(--red);
}

.turn-node-statuses {
  min-height: 10px;
  display: flex;
  gap: 2px;
}

.turn-node-statuses em,
.target-status-stack em {
  width: 12px;
  height: 12px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(240, 132, 118, 0.46);
  border-radius: 50%;
  background: rgba(84, 37, 44, 0.86);
  color: #ffc3b6;
  font-size: 6px;
  font-style: normal;
  line-height: 1;
}

.turn-node-statuses em.positive,
.target-status-stack em.positive {
  border-color: rgba(112, 213, 189, 0.5);
  background: rgba(16, 74, 67, 0.88);
  color: #b6f5dd;
}

.command-dock {
  position: absolute;
  left: 50%;
  bottom: max(11px, env(safe-area-inset-bottom));
  width: min(780px, calc(100% - 28px));
  padding: 11px 12px 12px;
  transform: translateX(-50%);
  border: 1px solid rgba(147, 191, 179, 0.28);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(5, 25, 31, 0.78), rgba(3, 13, 19, 0.95));
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(22px) saturate(118%);
}

.command-dock::before,
.turn-await::before,
.result-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 18%;
  right: 18%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(112, 213, 189, 0.72), transparent);
}

.dock-heading {
  display: grid;
  grid-template-columns: minmax(140px, 0.9fr) minmax(170px, 1.2fr) minmax(90px, 0.7fr);
  align-items: center;
  gap: 14px;
  padding: 0 2px 10px;
  border-bottom: 1px solid rgba(147, 191, 179, 0.13);
}

.active-actor {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actor-avatar {
  width: 34px;
  height: 34px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(228, 184, 102, 0.82);
  border-radius: 50%;
  background: rgba(90, 63, 30, 0.62);
  color: var(--gold);
  box-shadow: 0 0 0 3px rgba(228, 184, 102, 0.1), 0 0 16px rgba(228, 184, 102, 0.2);
  font-size: 12px;
}

.active-actor > div {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.active-actor strong,
.target-lock strong {
  overflow: hidden;
  color: #f1f8f2;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spirit-meter {
  min-width: 0;
}

.spirit-meter-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.spirit-meter-label span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  letter-spacing: 0;
}

.spirit-meter-label b {
  color: #f2e1ae;
  font-size: 10px;
  letter-spacing: 0;
}

.spirit-track {
  height: 5px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(146, 177, 170, 0.16);
}

.spirit-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #a96b42, var(--gold), #fff0a8);
  box-shadow: 0 0 14px rgba(228, 184, 102, 0.62);
  transition: width 220ms ease;
}

.target-lock {
  min-width: 0;
  display: grid;
  justify-items: end;
  gap: 3px;
}

.target-lock strong {
  color: var(--jade);
  font-size: 10px;
}

.target-rail {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 48px;
  margin: 8px 0 9px;
  overflow-x: auto;
  scrollbar-width: none;
}

.target-rail::-webkit-scrollbar {
  display: none;
}

.rail-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  color: var(--faint);
  font-size: 9px;
  letter-spacing: 0.08em;
}

.target-button {
  position: relative;
  min-width: 104px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 7px 4px 4px;
  border: 1px solid rgba(240, 132, 118, 0.3);
  border-radius: 999px;
  background: rgba(84, 37, 44, 0.34);
  color: var(--muted);
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}

.target-button.ally {
  border-color: rgba(112, 213, 189, 0.3);
  background: rgba(16, 74, 67, 0.3);
}

.target-button.selected {
  border-color: var(--gold);
  background: rgba(99, 76, 39, 0.48);
  color: #fff2bf;
  box-shadow: 0 0 0 2px rgba(228, 184, 102, 0.12), 0 0 16px rgba(228, 184, 102, 0.16);
}

.target-avatar {
  position: relative;
  width: 31px;
  height: 31px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(240, 132, 118, 0.5);
  border-radius: 50%;
  background: rgba(84, 37, 44, 0.75);
  color: var(--red);
  font-size: 10px;
}

.target-button.ally .target-avatar {
  border-color: rgba(112, 213, 189, 0.5);
  background: rgba(16, 54, 57, 0.76);
  color: var(--jade);
}

.target-copy {
  min-width: 0;
  display: grid;
  flex: 1;
  gap: 4px;
}

.target-copy b {
  overflow: hidden;
  font-size: 9px;
  font-weight: 600;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.target-copy i {
  width: 100%;
  height: 3px;
  display: block;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(146, 177, 170, 0.22);
}

.target-copy i span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--red);
  transition: width 180ms ease;
}

.target-button.ally .target-copy i span {
  background: var(--jade);
}

.target-selected {
  flex: 0 0 auto;
  color: var(--gold);
}

.target-status-stack {
  position: absolute;
  right: -3px;
  bottom: -3px;
  display: flex;
  gap: 1px;
}

.command-row {
  display: grid;
  grid-template-columns: 1.1fr repeat(4, minmax(0, 1fr)) 0.84fr;
  gap: 6px;
}

.command-button {
  position: relative;
  min-width: 0;
  min-height: 55px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 8px;
  border: 1px solid rgba(147, 191, 179, 0.18);
  border-radius: 11px;
  background: rgba(20, 49, 53, 0.54);
  color: var(--muted);
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease, transform 160ms ease, opacity 160ms ease;
}

.command-button.attack {
  border-color: rgba(228, 184, 102, 0.44);
  background: linear-gradient(145deg, rgba(101, 71, 38, 0.6), rgba(34, 54, 52, 0.62));
  color: #f2d99a;
}

.command-button.retreat {
  border-color: rgba(240, 132, 118, 0.3);
  color: rgba(240, 177, 166, 0.86);
}

.command-button.selected {
  border-color: var(--gold);
  background: rgba(99, 76, 39, 0.56);
  color: #fff1ba;
  box-shadow: 0 0 0 1px rgba(228, 184, 102, 0.16), 0 0 18px rgba(228, 184, 102, 0.15);
}

.command-button.cooling,
.command-button:disabled {
  cursor: not-allowed;
  opacity: 0.34;
}

.command-icon {
  width: 29px;
  height: 29px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 50%;
  color: var(--jade);
}

.attack .command-icon { color: var(--gold); }
.retreat .command-icon { color: var(--red); }

.command-label {
  min-width: 0;
  display: grid;
  gap: 3px;
  padding-right: 10px;
}

.command-label b,
.command-label small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-label b {
  color: inherit;
  font-size: 10px;
  font-weight: 650;
}

.command-label small {
  color: rgba(173, 202, 191, 0.62);
  font-size: 8px;
}

.command-scope {
  position: absolute;
  top: 5px;
  right: 5px;
  display: inline-flex;
  color: var(--faint);
}

.command-scope.group { color: var(--gold); }
.command-scope.ally,
.command-scope.self { color: var(--jade); }

.turn-await {
  position: absolute;
  left: 50%;
  bottom: max(17px, env(safe-area-inset-bottom));
  width: min(390px, calc(100% - 32px));
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  transform: translateX(-50%);
  border: 1px solid rgba(147, 191, 179, 0.22);
  border-radius: 13px;
  background: rgba(5, 19, 26, 0.84);
  box-shadow: 0 16px 46px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

.await-orb {
  width: 30px;
  height: 30px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(112, 213, 189, 0.54);
  border-radius: 50%;
  color: var(--jade);
  animation: await-spin 2.2s linear infinite;
}

.turn-await > div {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.turn-await strong {
  overflow: hidden;
  color: rgba(224, 240, 230, 0.82);
  font-size: 10px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.await-spirit {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  color: var(--gold);
  font-size: 10px;
  white-space: nowrap;
}

.battle-result {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.result-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(3, 12, 18, 0.7);
  backdrop-filter: blur(10px) saturate(84%);
}

.result-panel {
  position: relative;
  width: min(370px, calc(100% - 28px));
  padding: 27px 21px 20px;
  overflow: hidden;
  border: 1px solid rgba(228, 184, 102, 0.4);
  border-radius: 17px;
  background: linear-gradient(165deg, rgba(13, 37, 42, 0.98), rgba(6, 19, 26, 0.99));
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.54), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  text-align: center;
}

.result-seal {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
  border: 1px solid rgba(228, 184, 102, 0.72);
  border-radius: 50%;
  color: var(--gold);
  background: radial-gradient(circle, rgba(228, 184, 102, 0.28), rgba(45, 58, 42, 0.2) 62%, transparent 63%);
  box-shadow: 0 0 0 5px rgba(228, 184, 102, 0.08), 0 0 28px rgba(228, 184, 102, 0.22);
}

.result-seal.defeat {
  border-color: rgba(240, 132, 118, 0.68);
  color: var(--red);
  box-shadow: 0 0 0 5px rgba(240, 132, 118, 0.07), 0 0 28px rgba(240, 132, 118, 0.16);
}

.result-seal.fled {
  border-color: rgba(112, 213, 189, 0.62);
  color: var(--jade);
}

.result-panel h2 {
  margin: 7px 0 8px;
  color: #f1d18b;
  font-family: var(--font-game), serif;
  font-size: 25px;
  font-weight: 700;
}

.result-panel p {
  max-width: 280px;
  margin: 0 auto;
  color: rgba(197, 222, 210, 0.72);
  font-size: 11px;
  line-height: 1.55;
}

.result-rewards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  margin: 18px 0 11px;
}

.result-rewards div {
  display: grid;
  gap: 4px;
  padding: 10px 8px;
  border: 1px solid rgba(147, 191, 179, 0.16);
  border-radius: 10px;
  background: rgba(15, 50, 53, 0.42);
}

.result-rewards b {
  color: var(--gold);
  font-size: 17px;
}

.result-drops {
  display: grid;
  gap: 6px;
  margin: 12px 0 15px;
  padding: 10px 11px;
  border-top: 1px solid rgba(147, 191, 179, 0.16);
  border-bottom: 1px solid rgba(147, 191, 179, 0.16);
  text-align: left;
}

.result-drops-heading,
.result-drop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.result-drops-heading small { color: var(--jade); font-size: 9px; letter-spacing: 0; }
.result-drop { color: rgba(221, 238, 228, 0.78); font-size: 10px; }
.result-drop span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.result-drop b { color: var(--gold); font-size: 10px; }

.result-confirm {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(228, 184, 102, 0.62);
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(168, 117, 51, 0.76), rgba(85, 119, 91, 0.72));
  color: #fff4c8;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition: transform 160ms ease, filter 160ms ease;
}

.result-confirm:hover { filter: brightness(1.12); transform: translateY(-1px); }
.result-confirm:active { transform: translateY(1px) scale(0.99); }

.result-rise-enter-active,
.result-rise-leave-active { transition: opacity 220ms ease; }
.result-rise-enter-active .result-panel,
.result-rise-leave-active .result-panel { transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms ease; }
.result-rise-enter-from,
.result-rise-leave-to { opacity: 0; }
.result-rise-enter-from .result-panel,
.result-rise-leave-to .result-panel { opacity: 0; transform: translateY(14px) scale(0.97); }

@keyframes await-spin { to { transform: rotate(360deg); } }

@media (max-width: 800px) {
  .battle-topbar {
    top: max(10px, env(safe-area-inset-top));
    left: max(10px, env(safe-area-inset-left));
    right: max(10px, env(safe-area-inset-right));
    grid-template-columns: 34px minmax(0, 1fr) auto;
    gap: 7px;
  }

  .icon-button,
  .tempo-button { min-width: 34px; height: 34px; border-radius: 10px; }
  .tempo-button { min-width: 58px; padding: 0 7px; font-size: 9px; }
  .round-pip { display: none; }
  .encounter-title h1 { font-size: 15px; }
  .encounter-title small,
  .encounter-title span { font-size: 8px; }

  .battle-brief {
    top: 59px;
    width: calc(100% - 38px);
    min-height: 23px;
    font-size: 9px;
  }

  .turn-track {
    top: 91px;
    right: 9px;
    left: 9px;
    width: auto;
    padding: 5px 7px 6px;
    border-top: 1px solid rgba(147, 191, 179, 0.13);
    border-left: 0;
    background: linear-gradient(180deg, rgba(5, 19, 26, 0.08), rgba(5, 19, 26, 0.38));
  }

  .turn-track-header { display: none; }
  .turn-track ol { display: flex; align-items: center; gap: 9px; overflow-x: auto; scrollbar-width: none; }
  .turn-track ol::-webkit-scrollbar { display: none; }
  .turn-node { min-width: 43px; gap: 2px; }
  .turn-node-orb { width: 27px; height: 27px; }
  .turn-node-name { max-width: 49px; font-size: 8px; }
  .turn-node-gauge { width: 35px; }
  .turn-node-statuses { min-height: 9px; }
  .turn-node-statuses em { width: 11px; height: 11px; font-size: 6px; }

  .command-dock {
    left: 8px;
    right: 8px;
    bottom: max(7px, env(safe-area-inset-bottom));
    width: auto;
    padding: 9px 8px 8px;
    transform: none;
    border-radius: 15px;
  }

  .dock-heading {
    grid-template-columns: minmax(0, 1fr) minmax(112px, 0.92fr);
    gap: 8px;
    padding-bottom: 8px;
  }

  .target-lock { display: none; }
  .actor-avatar { width: 31px; height: 31px; }
  .active-actor strong { font-size: 10px; }
  .active-actor small { font-size: 8px; }
  .spirit-meter-label { font-size: 8px; }
  .spirit-meter-label b { font-size: 9px; }
  .target-rail { min-height: 42px; margin: 6px 0 7px; }
  .rail-label { font-size: 8px; }
  .target-button { min-width: 92px; padding-right: 6px; }
  .target-avatar { width: 28px; height: 28px; }
  .target-copy b { font-size: 8px; }
  .command-row { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 5px; }
  .command-button { min-height: 48px; display: grid; justify-items: center; gap: 2px; padding: 4px 3px; text-align: center; }
  .command-icon { width: 24px; height: 24px; }
  .command-label { width: 100%; gap: 0; padding-right: 0; }
  .command-label b { font-size: 8px; }
  .command-label small { display: none; }
  .command-scope { top: 3px; right: 3px; }
  .battle-ui.is-selecting .turn-track { display: none; }

  .turn-await { left: 10px; right: 10px; bottom: max(9px, env(safe-area-inset-bottom)); width: auto; padding: 9px 10px; transform: none; }
  .turn-await strong { max-width: 185px; font-size: 9px; }
  .await-spirit { font-size: 9px; }
  .result-panel { width: calc(100% - 26px); padding: 24px 17px 18px; }
}

@media (max-height: 680px) and (orientation: landscape) {
  .battle-brief { display: none; }
  .turn-track { top: 76px; right: 10px; left: auto; width: 76px; border-top: 0; border-left: 1px solid rgba(147, 191, 179, 0.18); }
  .turn-track ol { display: grid; }
  .command-dock { max-width: 720px; padding-block: 6px; }
  .dock-heading { padding-bottom: 5px; }
  .target-rail { min-height: 34px; margin-block: 4px; }
}

@media (prefers-reduced-motion: reduce) {
  .icon-button,
  .tempo-button,
  .command-button,
  .target-button,
  .result-confirm,
  .spirit-track i { transition: none; }
  .await-orb { animation: none; }
}

/* Keep the lower command area reserved while its mode changes. */
.command-dock {
  height: 12.4rem;
  min-height: 12.4rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.command-dock.is-awaiting {
  align-items: center;
  justify-content: center;
}

.command-dock .turn-await {
  position: relative;
  inset: auto;
  width: 100%;
  padding: 0.45rem 0.2rem;
  transform: none;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.command-dock .turn-await::before {
  display: none;
}

.battle-ui.is-selecting .turn-track {
  display: block;
}

@media (max-width: 800px) {
  .command-dock {
    height: 10.4rem;
    min-height: 10.4rem;
  }

  .command-row {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.24rem;
  }

  .command-button {
    min-height: 3.25rem;
    min-width: 0;
  }

  .command-icon {
    width: 1.75rem;
    height: 1.75rem;
  }

  .command-dock .turn-await {
    left: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    padding: 0.2rem;
  }
}

@media (max-width: 350px) {
  .command-dock {
    height: 10.8rem;
    min-height: 10.8rem;
  }

  .command-label b {
    font-size: 0.47rem;
  }
}
</style>
