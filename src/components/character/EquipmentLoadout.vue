<template>
  <div class="equipment-loadout">
    <div class="equipment-grid">
      <button
        v-for="slot in slots"
        :key="slot.slot"
        class="equip-slot"
        :class="{ filled: slot.equipment }"
        @click="$emit('select-slot', slot.slot)"
      >
        <span class="slot-label">{{ slot.label }}</span>
        <template v-if="slot.equipment">
          <b>{{ slot.equipment.icon }}</b>
          <strong>{{ slot.equipment.name }}</strong>
        </template>
        <template v-else>
          <b>空</b>
          <strong>未装备</strong>
        </template>
        <em>{{ slot.candidates.length }} 件可换</em>
      </button>
    </div>

    <div class="stat-list">
      <div v-for="stat in stats" :key="stat.key" class="stat-row">
        <span>{{ stat.label }}</span>
        <strong>{{ stat.display }}</strong>
        <em v-if="stat.bonus">+{{ formatStatValue(stat.key, stat.bonus, true) }}</em>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CharacterStatItem, EquipmentSlotState } from '@/composables/useCharacterLoadout'
import type { EquipmentSlot } from '@/types/equipment'

defineEmits<{
  'select-slot': [slot: EquipmentSlot]
}>()

defineProps<{
  slots: EquipmentSlotState[]
  stats: CharacterStatItem[]
  formatStatValue: (stat: string, value: number, compact?: boolean) => string
}>()
</script>

<style scoped>
.equipment-loadout {
  display: grid;
  gap: 14px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.equip-slot {
  min-height: 104px;
  display: grid;
  gap: 6px;
  justify-items: start;
  padding: 12px;
  border: 1px solid rgba(123, 153, 145, 0.2);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.9), rgba(238, 249, 242, 0.86)),
    radial-gradient(circle at top right, rgba(238, 198, 113, 0.13), transparent 60%);
  color: #345b59;
  font-family: var(--font-game);
  text-align: left;
}

.equip-slot.filled {
  border-color: rgba(188, 141, 58, 0.28);
}

.slot-label,
.equip-slot em {
  color: rgba(72, 96, 94, 0.68);
  font-size: 11px;
  font-style: normal;
}

.equip-slot b {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  color: #94692b;
  font-size: 16px;
}

.equip-slot strong {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.stat-list {
  display: grid;
  gap: 8px;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid rgba(126, 153, 143, 0.12);
}

.stat-row span {
  color: rgba(55, 82, 80, 0.72);
  font-size: 12px;
}

.stat-row strong {
  color: #315257;
  font-size: 13px;
}

.stat-row em {
  color: #3fa785;
  font-size: 11px;
  font-style: normal;
}
</style>
