<template>
  <button
    class="story-perspective-card"
    :class="[{ active, disabled }, `tone-${tone}`]"
    type="button"
    :disabled="disabled"
    @click="$emit('select')"
  >
    <span class="card-mark">{{ mark }}</span>
    <span class="card-copy">
      <strong>{{ title }}</strong>
      <small>{{ subtitle }}</small>
    </span>
    <span class="card-status">{{ disabled ? '暂不可切' : active ? '已选' : '切换' }}</span>
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  select: []
}>()

withDefaults(defineProps<{
  title: string
  subtitle: string
  mark: string
  tone?: 'pine' | 'rose'
  active?: boolean
  disabled?: boolean
}>(), {
  tone: 'pine',
  active: false,
  disabled: false
})
</script>

<style scoped>
.story-perspective-card {
  position: relative;
  display: grid;
  grid-template-columns: 46px 1fr auto;
  align-items: center;
  gap: 12px;
  min-height: 88px;
  padding: 16px;
  border: 1px solid rgba(97, 126, 113, 0.2);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(255, 255, 248, 0.96), rgba(237, 249, 242, 0.88)),
    radial-gradient(circle at 18% 0%, rgba(174, 224, 188, 0.24), transparent 58%);
  color: #284d48;
  box-shadow: 0 14px 30px rgba(83, 116, 103, 0.12);
  cursor: pointer;
  text-align: left;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.story-perspective-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(83, 116, 103, 0.16);
}

.story-perspective-card.disabled {
  opacity: 0.54;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 10px 22px rgba(83, 116, 103, 0.08);
}

.story-perspective-card.disabled:hover {
  transform: none;
  box-shadow: 0 10px 22px rgba(83, 116, 103, 0.08);
}

.story-perspective-card.active {
  border-color: rgba(172, 121, 45, 0.48);
  box-shadow: 0 18px 38px rgba(141, 105, 48, 0.16);
}

.tone-rose {
  background:
    linear-gradient(135deg, rgba(255, 250, 247, 0.98), rgba(248, 236, 232, 0.88)),
    radial-gradient(circle at 18% 0%, rgba(232, 155, 150, 0.22), transparent 58%);
  color: #6d3d3f;
}

.card-mark {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(126, 143, 117, 0.18);
  color: #9d6b25;
  font-size: 22px;
  font-weight: 800;
  box-shadow: inset 0 -8px 18px rgba(197, 180, 128, 0.13);
}

.card-copy {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.card-copy strong {
  font-size: 17px;
  line-height: 1.1;
}

.card-copy small {
  color: rgba(52, 75, 72, 0.68);
  font-size: 12px;
  line-height: 1.45;
}

.tone-rose .card-copy small {
  color: rgba(109, 61, 63, 0.66);
}

.card-status {
  padding: 6px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  color: rgba(84, 94, 79, 0.78);
  font-size: 11px;
  white-space: nowrap;
}

.active .card-status {
  background: #a76f24;
  color: #fffdf3;
}

@media (max-width: 620px) {
  .story-perspective-card {
    grid-template-columns: 40px 1fr;
    min-height: 82px;
  }

  .card-status {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
