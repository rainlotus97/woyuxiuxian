<template>
  <button
    type="button"
    class="npc-bond-card"
    :class="`bond-${candidate.bond}`"
    @click="$emit('interact', candidate.id, candidate.canInvite ? 'invite' : 'greet')"
  >
    <span class="npc-mark">{{ candidate.name.slice(0, 1) }}</span>
    <span class="npc-bond-copy">
      <small>{{ candidate.title }} · {{ candidate.realm }} · {{ candidate.locationName }}</small>
      <strong>{{ candidate.name }}</strong>
      <em>{{ candidate.summary }}</em>
      <span class="npc-bond-meta">
        <i>{{ candidate.statusLabel }}</i>
        <i>好感 {{ candidate.favor }}</i>
      </span>
    </span>
    <span class="npc-action">{{ candidate.actionLabel }}</span>
  </button>
</template>

<script setup lang="ts">
import type { NpcCompanionCandidate, NpcInteractionKind } from '@/world/runtime/npcCompanionResolver'

defineProps<{
  candidate: NpcCompanionCandidate
}>()

defineEmits<{
  interact: [npcId: string, kind: NpcInteractionKind]
}>()
</script>

<style scoped>
.npc-bond-card {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(103, 149, 144, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.68);
  color: #315257;
  font-family: var(--font-game);
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.npc-bond-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(87, 126, 121, 0.14);
}

.npc-bond-card.bond-friend,
.npc-bond-card.bond-companion,
.npc-bond-card.bond-lover {
  border-color: rgba(188, 141, 58, 0.26);
  background: rgba(255, 250, 236, 0.88);
}

.npc-mark {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(255, 238, 180, 0.96), rgba(125, 216, 191, 0.78));
  color: #8b6226;
  font-size: 18px;
  font-weight: 800;
}

.npc-bond-copy {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.npc-bond-copy small {
  overflow: hidden;
  color: rgba(73, 97, 95, 0.66);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.npc-bond-copy strong {
  color: #315257;
  font-size: 15px;
}

.npc-bond-copy em {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: rgba(53, 81, 83, 0.78);
  font-size: 12px;
  font-style: normal;
  line-height: 1.55;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.npc-bond-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.npc-bond-meta i,
.npc-action {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(73, 97, 95, 0.78);
  font-size: 10px;
  font-style: normal;
}

.npc-action {
  grid-column: 1 / -1;
  width: fit-content;
  color: #8b6226;
  background: rgba(255, 249, 233, 0.9);
}
</style>
