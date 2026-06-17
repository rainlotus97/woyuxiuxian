<template>
  <section class="command-dock">
    <div class="dock-header">
      <SpiritFireBar :current="spiritFire" :max="maxSpiritFire" />
      <small>{{ actorName }} · {{ targetHint }}</small>
    </div>

    <div v-if="targets.length" class="target-row">
      <button
        v-for="target in targets"
        :key="target.id"
        class="target-chip"
        :class="{ selected: selectedTargetId === target.id, ally: target.side === 'ally' }"
        @click="$emit('select-target', target.id)"
      >
        {{ target.icon }} {{ cleanName(target.name) }}
      </button>
    </div>

    <div class="command-row">
      <button class="command attack" @click="$emit('attack')">
        <span>斩</span>
        普攻
      </button>
      <button
        v-for="skill in skills"
        :key="skill.id"
        class="command skill"
        :class="{ selected: selectedSkillId === skill.id }"
        :disabled="skill.cost > spiritFire"
        @click="$emit('skill', skill.id)"
      >
        <span>{{ skill.icon }}</span>
        {{ skill.name }}
        <small>{{ skill.cost }}火</small>
      </button>
      <button class="command flee" @click="$emit('flee')">
        <span>退</span>
        脱战
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import SpiritFireBar from './SpiritFireBar.vue'

interface TargetChip {
  id: string
  name: string
  icon: string
  side: 'ally' | 'enemy'
}

interface SkillChip {
  id: string
  name: string
  icon: string
  cost: number
  targetType: string
}

defineProps<{
  spiritFire: number
  maxSpiritFire: number
  actorName: string
  targetHint: string
  targets: TargetChip[]
  selectedSkillId: string | null
  selectedTargetId: string | null
  skills: SkillChip[]
}>()

defineEmits<{
  attack: []
  flee: []
  skill: [skillId: string]
  'select-target': [targetId: string]
}>()

function cleanName(name: string) {
  return name.replace('[BOSS]', '').replace('[精英]', '')
}
</script>

<style scoped>
.command-dock {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 12px 18px calc(14px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(0deg, rgba(244, 251, 246, 0.96), rgba(244, 251, 246, 0.2));
}

.dock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.dock-header small {
  color: rgba(76, 86, 78, 0.72);
  font-size: 12px;
}

.target-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.target-chip {
  white-space: nowrap;
  border: 1px solid rgba(200, 98, 105, 0.28);
  background: rgba(255, 255, 255, 0.76);
  color: #88404b;
  border-radius: 999px;
  padding: 8px 12px;
  box-shadow: 0 8px 18px rgba(114, 90, 74, 0.1);
}

.target-chip.selected {
  border-color: #c98339;
  color: #5f361b;
  background: linear-gradient(135deg, #fff3b2, #ffd783);
}

.target-chip.ally {
  border-color: rgba(76, 184, 166, 0.3);
  color: #266a63;
}

.command-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(68px, 1fr));
  gap: 10px;
}

.command {
  min-height: 66px;
  border: 1px solid rgba(123, 151, 135, 0.24);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 248, 239, 0.88)),
    radial-gradient(circle at 50% 0%, rgba(255, 225, 130, 0.34), transparent 70%);
  color: #395b58;
  display: grid;
  place-items: center;
  gap: 2px;
  font-size: 13px;
  position: relative;
  box-shadow: 0 12px 26px rgba(89, 130, 128, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.command span {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  font-size: 17px;
  color: #8b5a20;
  background: linear-gradient(135deg, #fff4bd, #f0bd5a);
}

.command small {
  color: #2f9c8c;
}

.command:disabled {
  opacity: 0.38;
}

.command.attack {
  border-color: rgba(223, 121, 80, 0.38);
}

.command.skill {
  border-color: rgba(76, 184, 166, 0.38);
}

.command.skill.selected {
  border-color: rgba(201, 131, 57, 0.56);
  box-shadow: 0 16px 30px rgba(201, 131, 57, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

@media (max-width: 720px) {
  .command-row {
    display: flex;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .command {
    min-width: 74px;
  }
}
</style>
