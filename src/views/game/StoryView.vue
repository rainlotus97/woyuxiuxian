<template>
  <div class="story-redirect">
    <div class="redirect-copy" aria-hidden="true">
      <span class="redirect-eyebrow">正在接回眼前这件事</span>
      <h2>马上回到主界续上</h2>
      <p>故事会贴着修炼、历练和人物关系继续往前走。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

onMounted(async () => {
  await router.replace('/game/cultivation?story=1')
})
</script>

<style scoped>
.story-redirect {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 16px;
}

.redirect-copy {
  display: grid;
  gap: 8px;
  width: min(100%, 320px);
  padding: 16px 18px;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 252, 244, 0.92), rgba(242, 248, 244, 0.84));
  border: 1px solid rgba(183, 140, 62, 0.12);
  box-shadow: 0 16px 28px rgba(38, 57, 54, 0.08);
}

.redirect-eyebrow {
  color: rgba(116, 88, 47, 0.72);
  font-size: 11px;
  font-weight: 700;
}

.redirect-copy h2 {
  margin: 0;
  color: #764d1f;
  font-size: 20px;
  line-height: 1.24;
}

.redirect-copy p {
  margin: 0;
  color: rgba(49, 82, 87, 0.72);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .story-redirect {
    padding: 16px;
  }

  .redirect-copy {
    gap: 10px;
  }

  .redirect-copy h2 {
    font-size: 21px;
  }
}
</style>
