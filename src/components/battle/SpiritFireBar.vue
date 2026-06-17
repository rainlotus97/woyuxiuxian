<template>
  <div class="spirit-fire">
    <b>灵火</b>
    <span
      v-for="i in max"
      :key="i"
      :class="{ lit: i <= current }"
    ></span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  current: number
  max: number
}>()
</script>

<style scoped>
.spirit-fire {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 253, 238, 0.88), rgba(239, 249, 240, 0.8)),
    radial-gradient(circle at 0 50%, rgba(255, 216, 116, 0.28), transparent 58%);
  border: 1px solid rgba(178, 130, 46, 0.26);
  box-shadow: 0 8px 18px rgba(126, 102, 54, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
}

.spirit-fire b {
  color: #8c652c;
  font-size: 12px;
  padding-right: 2px;
}

.spirit-fire span {
  width: 15px;
  height: 15px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(207, 220, 213, 0.78), rgba(143, 165, 154, 0.76));
  box-shadow: inset 0 2px 3px rgba(64, 77, 74, 0.16);
}

.spirit-fire span.lit {
  background: radial-gradient(circle at 35% 30%, #ffffff, #fff0a9 32%, #f4a943 68%, #dc7130);
  box-shadow: 0 0 10px rgba(235, 160, 52, 0.48), 0 2px 6px rgba(154, 92, 30, 0.2);
}
</style>
