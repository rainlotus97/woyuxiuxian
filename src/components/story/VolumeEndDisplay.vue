<template>
  <div class="volume-end-display">
    <div class="volume-end-overlay">
      <div class="volume-end-card">
        <!-- 卷号展示 -->
        <div class="volume-number">
          <span class="label">卷</span>
          <span class="number">{{ volumeNumber }}</span>
        </div>

        <!-- 完结文字 -->
        <h2 class="complete-text">完</h2>

        <!-- 提示信息 -->
        <div class="volume-summary">
          <p>你已完成第{{ volumeNumber }}卷的内容</p>
          <p v-if="hasNextVolume" class="next-hint">
            卷{{ volumeNumber + 1 }}已解锁
          </p>
          <p v-else class="no-next">
            敬请期待后续内容
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="volume-actions">
          <button
            v-if="hasNextVolume"
            class="action-btn primary"
            @click="$emit('continue')"
          >
            继续下一卷
            <span class="arrow">→</span>
          </button>
          <button
            class="action-btn"
            @click="$emit('returnToMenu')"
          >
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  volumeNumber: number
  hasNextVolume: boolean
}>()

defineEmits<{
  continue: []
  returnToMenu: []
}>()
</script>

<style scoped>
.volume-end-display {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.volume-end-overlay {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.5s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.volume-end-card {
  text-align: center;
  animation: card-appear 0.8s ease-out 0.2s both;
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.volume-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.volume-number .label {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.5);
}

.volume-number .number {
  font-size: 72px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.complete-text {
  font-size: 120px;
  color: #ffd700;
  margin: 0;
  font-weight: bold;
  letter-spacing: 20px;
  text-shadow:
    0 0 30px rgba(255, 215, 0, 0.5),
    0 0 60px rgba(255, 215, 0, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow:
      0 0 30px rgba(255, 215, 0, 0.5),
      0 0 60px rgba(255, 215, 0, 0.3);
  }
  to {
    text-shadow:
      0 0 40px rgba(255, 215, 0, 0.7),
      0 0 80px rgba(255, 215, 0, 0.5);
  }
}

.volume-summary {
  margin-top: 40px;
  margin-bottom: 40px;
}

.volume-summary p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 8px 0;
}

.next-hint {
  color: #6495ed !important;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.no-next {
  color: rgba(255, 255, 255, 0.5) !important;
  font-style: italic;
}

.volume-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.action-btn {
  padding: 14px 40px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #e8e8e8;
  min-width: 200px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.action-btn.primary {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.1) 100%);
  border-color: rgba(255, 215, 0, 0.5);
  color: #ffd700;
  font-weight: bold;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0.2) 100%);
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.action-btn.primary .arrow {
  margin-left: 8px;
  transition: transform 0.3s;
}

.action-btn.primary:hover .arrow {
  transform: translateX(5px);
}
</style>
