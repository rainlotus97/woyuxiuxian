<template>
  <div class="cultivation-view">
    <div class="game-panel">
      <h2 class="panel-title">修炼</h2>
      <p class="panel-desc">打坐修炼，感悟天地灵气</p>

      <div class="cultivation-area">
        <div class="character">
          <div class="avatar">修</div>
          <div class="status">入定中...</div>
        </div>

        <div class="progress-section">
          <div class="progress-label">
            <span>修为</span>
            <span>{{ cultivation }} / {{ maxCultivation }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(cultivation / maxCultivation) * 100}%` }"></div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <GameButton @click="handleMeditate">打坐修炼</GameButton>
        <GameButton @click="handleBreakthrough" :disabled="cultivation < maxCultivation">
          突破境界
        </GameButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAudio, sfxMeditate, sfxBreakthrough } from '@/composables/useAudio'
import { useModal } from '@/composables/useModal'
import GameButton from '@/components/common/GameButton.vue'

const { success, warning } = useToast()
const { startCultivationBgm } = useAudio()
const { showItemAcquire } = useModal()

onMounted(() => {
  startCultivationBgm()
})

const cultivation = ref(50)
const maxCultivation = ref(100)

const handleMeditate = () => {
  sfxMeditate()
  cultivation.value = Math.min(cultivation.value + 10, maxCultivation.value)
  success('修为 +10')
}

const handleBreakthrough = () => {
  if (cultivation.value >= maxCultivation.value) {
    sfxBreakthrough()
    success('突破成功！进入下一境界')
    cultivation.value = 0
    maxCultivation.value += 50
    showItemAcquire({
      name: '灵气精华',
      quantity: 1,
      quality: 'fine',
      icon: '灵',
      description: '突破时凝聚的天地灵气精华'
    })
  } else {
    warning('修为不足，无法突破')
  }
}
</script>

<style scoped>
.cultivation-view {
  padding-bottom: 16px;
}

.panel-title {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  margin: 0 0 4px 0;
  text-align: center;
}

.panel-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0 0 16px 0;
  text-align: center;
}

.cultivation-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.character {
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(126, 184, 218, 0.2), rgba(126, 184, 218, 0.1));
  border: 2px solid var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 8px;
}

.status {
  font-size: 0.75rem;
  color: var(--color-accent);
}

.progress-section {
  width: 100%;
  max-width: 280px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 4px;
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-success));
  transition: width 0.3s ease;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
