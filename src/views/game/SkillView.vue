<template>
  <div class="skill-view">
    <div class="game-panel">
      <h2 class="panel-title">功法</h2>
      <p class="panel-desc">修炼的功法与技能</p>

      <div class="skill-list">
        <div v-for="skill in skills" :key="skill.id" class="skill-item">
          <div class="skill-icon">{{ skill.icon }}</div>
          <div class="skill-info">
            <div class="skill-name">{{ skill.name }}</div>
            <div class="skill-level">Lv.{{ skill.level }}</div>
            <div class="skill-bar">
              <div class="skill-fill" :style="{ width: `${(skill.exp / skill.maxExp) * 100}%` }"></div>
            </div>
          </div>
          <GameButton @click="handleUpgrade(skill)" :disabled="skill.exp < skill.maxExp">
            升级
          </GameButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { sfxSkillUp } from '@/composables/useAudio'
import GameButton from '@/components/common/GameButton.vue'

const { success, warning } = useToast()

const skills = ref([
  { id: 1, name: '引气诀', icon: '气', level: 1, exp: 50, maxExp: 100 },
  { id: 2, name: '御剑术', icon: '剑', level: 1, exp: 30, maxExp: 100 },
  { id: 3, name: '五行遁法', icon: '遁', level: 2, exp: 80, maxExp: 200 }
])

const handleUpgrade = (skill: { id: number; name: string; level: number; exp: number; maxExp: number }) => {
  if (skill.exp >= skill.maxExp) {
    sfxSkillUp()
    skill.level++
    skill.exp = 0
    skill.maxExp = Math.floor(skill.maxExp * 1.5)
    success(`${skill.name} 升级到 Lv.${skill.level}！`)
  } else {
    warning('经验不足')
  }
}
</script>

<style scoped>
.skill-view {
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

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.skill-icon {
  width: 48px;
  height: 48px;
  background: rgba(126, 184, 218, 0.1);
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 0.875rem;
  color: rgb(232 228 217);
  margin-bottom: 2px;
}

.skill-level {
  font-size: 0.75rem;
  color: var(--color-accent);
  margin-bottom: 4px;
}

.skill-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.3s ease;
}
</style>
