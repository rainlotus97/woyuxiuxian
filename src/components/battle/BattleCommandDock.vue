<template>
  <BattlePanelShell
    class="command-dock"
    variant="gold"
    padding="md"
    eyebrow="灵脉调息"
    :title="actorName"
    :subtitle="targetHint"
  >
    <template #header>
      <SpiritFireBar :current="spiritFire" :max="maxSpiritFire" />
    </template>

    <div v-if="targets.length" class="target-row">
      <button
        v-for="target in targets"
        :key="target.id"
        class="target-chip"
        :class="[
          { selected: selectedTargetId === target.id, ally: target.side === 'ally' },
          target.portraitKey ? `portrait-${target.portraitKey}` : ''
        ]"
        @click="$emit('select-target', target.id)"
      >
        <span class="target-badge">
          <GameIcon :icon="target.icon" :size="12" />
        </span>
        <span class="target-name">{{ cleanName(target.name) }}</span>
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
        :class="{ selected: selectedSkillId === skill.id, cooling: skill.currentCooldown > 0 }"
        :disabled="skill.cost > spiritFire || skill.currentCooldown > 0"
        @click="$emit('skill', skill.id)"
      >
        <span>{{ skill.icon }}</span>
        {{ skill.name }}
        <small>{{ skill.currentCooldown > 0 ? `${skill.currentCooldown}手` : `${skill.cost}火` }}</small>
      </button>
      <button class="command flee" @click="$emit('flee')">
        <span>退</span>
        脱战
      </button>
    </div>
  </BattlePanelShell>
</template>

<script setup lang="ts">
import GameIcon from '@/components/game-ui/GameIcon.vue'
import BattlePanelShell from './BattlePanelShell.vue'
import SpiritFireBar from './SpiritFireBar.vue'

interface TargetChip {
  id: string
  name: string
  icon: string
  portraitKey?: string
  side: 'ally' | 'enemy'
}

interface SkillChip {
  id: string
  name: string
  icon: string
  cost: number
  currentCooldown: number
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
  padding: 10px 14px calc(12px + env(safe-area-inset-bottom, 0px));
  border-radius: 20px 20px 0 0;
  border-bottom: 0;
}

.target-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.target-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border: 1px solid rgba(200, 98, 105, 0.28);
  background: rgba(255, 255, 255, 0.76);
  color: #88404b;
  border-radius: 999px;
  padding: 6px 10px;
  box-shadow: 0 8px 18px rgba(114, 90, 74, 0.1);
}

.target-badge {
  width: 20px;
  height: 20px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #7f2f3c;
  flex: 0 0 auto;
}

.target-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
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

.target-chip.ally .target-badge {
  color: #1d6a61;
}

.target-chip.portrait-ally_protagonist .target-badge {
  background: linear-gradient(135deg, #fff1ba, #f4c468);
  color: #6a4518;
}

.target-chip.portrait-enemy_boss .target-badge {
  background: linear-gradient(135deg, #ffd4cf, #ea7f91);
  color: #8b3142;
}

.command-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(62px, 1fr));
  gap: 8px;
}

.command {
  min-height: 58px;
  border: 1px solid rgba(123, 151, 135, 0.24);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 248, 239, 0.88)),
    radial-gradient(circle at 50% 0%, rgba(255, 225, 130, 0.34), transparent 70%);
  color: #395b58;
  display: grid;
  place-items: center;
  gap: 2px;
  font-size: 12px;
  position: relative;
  box-shadow: 0 12px 26px rgba(89, 130, 128, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.command span {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  font-size: 14px;
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

.command.skill.cooling {
  border-color: rgba(115, 128, 145, 0.24);
  background: linear-gradient(180deg, rgba(238, 244, 245, 0.82), rgba(229, 236, 234, 0.78));
}

@media (max-width: 720px) {
  .command-dock {
    padding: 5px 8px calc(6px + env(safe-area-inset-bottom, 0px));
    border-radius: 16px 16px 0 0;
  }

  .target-row {
    gap: 6px;
    padding-bottom: 5px;
  }

  .target-chip {
    padding: 6px 10px;
    font-size: 12px;
  }

  .command-row {
    display: flex;
    overflow-x: auto;
    padding-bottom: 2px;
    gap: 6px;
  }

  .command {
    min-width: 58px;
    min-height: 44px;
    font-size: 10px;
  }

  .command span {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
}
</style>
