<template>
  <div class="recruit-panel">
    <GameSurface tone="mist" padding="lg" eyebrow="宗门归属" title="尚未拜入宗门" subtitle="攻占区域、推进剧情与世界事件后，可解锁更多宗门选择。">
      <div class="empty-hero">
        <div class="empty-icon">🏛️</div>
        <p>当前尚无正式师承。你可以先通过地图与历练扩大接触面，再决定投向哪方势力。</p>
      </div>
    </GameSurface>

    <GameSurface v-if="candidates.length > 0" tone="gold" padding="md" eyebrow="可加入势力" title="待选宗门" subtitle="不同宗门会决定任务、外交、设施与后续战事走向。">
      <div class="sect-list">
        <button
          v-for="candidate in candidates"
          :key="candidate.sect.id"
          class="sect-card"
          :class="{ locked: !candidate.canJoin }"
          :disabled="!candidate.canJoin"
          @click="$emit('join', candidate.sect.id)"
        >
          <div class="sect-leading">
            <div class="sect-icon">{{ candidate.sect.icon }}</div>
            <div class="sect-copy">
              <strong>{{ candidate.sect.name }}</strong>
              <small>{{ candidate.areaName }} · {{ candidate.sect.specialty }}</small>
            </div>
            <span class="join-badge" :class="`reason-${candidate.reason}`">{{ candidate.reasonLabel }}</span>
          </div>
          <p>{{ candidate.sect.description }}</p>
        </button>
      </div>
    </GameSurface>
  </div>
</template>

<script setup lang="ts">
import GameSurface from '@/components/game-ui/GameSurface.vue'
import type { SectJoinCandidate } from '@/sect/runtime/sectMembershipResolver'

defineProps<{
  candidates: SectJoinCandidate[]
}>()

defineEmits<{
  join: [sectId: string]
}>()
</script>

<style scoped>
.recruit-panel,
.sect-list {
  display: grid;
  gap: 14px;
}

.empty-hero {
  display: grid;
  justify-items: center;
  gap: 12px;
  text-align: center;
}

.empty-icon {
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.74);
  font-size: 34px;
}

.empty-hero p,
.sect-card p {
  margin: 0;
  color: rgba(53, 81, 83, 0.8);
  font-size: 13px;
  line-height: 1.65;
}

.sect-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(188, 141, 58, 0.18);
  background: rgba(255, 255, 255, 0.72);
  text-align: left;
  cursor: pointer;
}

.sect-card.locked {
  opacity: 0.72;
  cursor: not-allowed;
}

.sect-leading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sect-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: rgba(255, 248, 234, 0.9);
  font-size: 24px;
}

.sect-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
  flex: 1 1 auto;
}

.sect-copy strong {
  color: #315257;
  font-size: 15px;
}

.sect-copy small {
  color: rgba(73, 97, 95, 0.72);
  font-size: 11px;
}

.join-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(188, 141, 58, 0.22);
  background: rgba(255, 249, 233, 0.86);
  color: #8b6226;
  font-size: 11px;
}

.join-badge.reason-realm_locked,
.join-badge.reason-area_locked {
  border-color: rgba(120, 146, 149, 0.18);
  background: rgba(245, 249, 248, 0.82);
  color: rgba(73, 97, 95, 0.72);
}

@media (max-width: 720px) {
  .sect-leading {
    align-items: flex-start;
  }

  .join-badge {
    max-width: 92px;
    justify-content: center;
    text-align: center;
  }
}
</style>
