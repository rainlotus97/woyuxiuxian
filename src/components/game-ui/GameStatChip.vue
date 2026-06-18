<template>
  <div class="stat-chip" :class="[`tone-${tone}`, { compact }]">
    <span class="stat-icon">{{ icon }}</span>
    <div class="stat-copy">
      <small>{{ label }}</small>
      <strong>{{ value }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  label: string
  value: string | number
  tone?: 'jade' | 'gold' | 'rose'
  compact?: boolean
}>(), {
  tone: 'jade',
  compact: false
})
</script>

<style scoped>
.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 16px;
  border: 1px solid rgba(100, 148, 141, 0.2);
  background: rgba(255, 255, 255, 0.62);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.stat-chip.compact {
  gap: 7px;
  min-height: 40px;
  padding: 7px 10px;
  border-radius: 13px;
}

.tone-gold {
  border-color: rgba(188, 141, 58, 0.26);
  background: rgba(255, 251, 236, 0.78);
}

.tone-rose {
  border-color: rgba(198, 121, 137, 0.24);
  background: rgba(255, 246, 247, 0.74);
}

.stat-icon {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 240, 176, 0.96), rgba(255, 206, 118, 0.92));
  color: #8e6227;
  font-size: 14px;
}

.stat-chip.compact .stat-icon {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.stat-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.stat-copy small {
  color: rgba(77, 101, 99, 0.72);
  font-size: 10px;
}

.stat-copy strong {
  color: #305256;
  font-size: 13px;
}

.stat-chip.compact .stat-copy strong {
  overflow: hidden;
  max-width: 92px;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
