<template>
  <main class="main-menu">
    <section class="start-shell">
      <div class="brand-panel">
        <span class="seal">修</span>
        <div class="brand-copy">
          <p>文字修仙 · 世界自演</p>
          <h1>我欲修仙</h1>
          <strong>从一口灵气开始，卷入宗门、人物与天地异变。</strong>
        </div>
      </div>

      <div class="guide-panel">
        <div class="guide-head">
          <span>创建引导</span>
          <strong>定下本命</strong>
        </div>

        <label class="name-field">
          <span>道号</span>
          <input v-model="draftName" maxlength="8" placeholder="云逸" />
        </label>

        <div class="choice-group">
          <span>灵根</span>
          <div class="choice-grid">
            <button
              v-for="option in elementOptions"
              :key="option.id"
              :class="{ active: draftElement === option.id }"
              @click="draftElement = option.id"
            >
              <i :style="{ color: option.color }">{{ option.icon }}</i>
              <strong>{{ option.label }}</strong>
            </button>
          </div>
        </div>

        <div class="choice-group">
          <span>气质</span>
          <div class="avatar-row">
            <button
              v-for="option in avatarOptions"
              :key="option.icon"
              :class="{ active: draftIcon === option.icon }"
              @click="draftIcon = option.icon"
            >
              {{ option.icon }}
            </button>
          </div>
        </div>

        <div class="start-actions">
          <button class="primary-action" @click="handleStart">
            <span>开始修仙</span>
            <small>进入主循环</small>
          </button>
          <button class="secondary-action" @click="handleContinue">
            继续修炼
          </button>
        </div>
      </div>

      <aside class="world-preview">
        <div class="preview-card active">
          <span>主循环</span>
          <strong>修炼 / 历练 / 宗门</strong>
          <p>进入后直接操作，不再停留在纯文字菜单。</p>
        </div>
        <div class="preview-card">
          <span>世界</span>
          <strong>NPC 会行动</strong>
          <p>人物关系、坊市、宗门战事都会留下日志。</p>
        </div>
        <div class="preview-card">
          <span>资料片式扩展</span>
          <strong>故事与地图分离</strong>
          <p>后续卷宗、地图和事件会按模块扩展。</p>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { usePlayerStore } from '@/stores/playerStore'
import type { Element } from '@/types/unit'

const router = useRouter()
const playerStore = usePlayerStore()
const { info } = useToast()

const draftName = ref(playerStore.name || '云逸')
const draftElement = ref<Element>(playerStore.element)
const draftIcon = ref(playerStore.icon || '剑')

const elementOptions: Array<{ id: Element; label: string; icon: string; color: string }> = [
  { id: '金', label: '金灵根', icon: '金', color: '#b48a2d' },
  { id: '木', label: '木灵根', icon: '木', color: '#438f65' },
  { id: '水', label: '水灵根', icon: '水', color: '#3f8ba8' },
  { id: '火', label: '火灵根', icon: '火', color: '#bd5a45' },
  { id: '土', label: '土灵根', icon: '土', color: '#967047' }
]

const avatarOptions = [
  { icon: '剑' },
  { icon: '丹' },
  { icon: '符' },
  { icon: '阵' },
  { icon: '灵' }
]

function applyProfile() {
  playerStore.applyCreationProfile({
    name: draftName.value || '云逸',
    icon: draftIcon.value,
    element: draftElement.value
  })
}

function handleStart() {
  applyProfile()
  info('本命已定，踏入修仙界。')
  void router.push('/game/cultivation')
}

function handleContinue() {
  info('读取当前存档。')
  void router.push('/game/cultivation')
}
</script>

<style scoped>
.main-menu {
  min-height: 100vh;
  min-height: 100dvh;
  overflow: auto;
  padding: 28px;
  color: #315257;
  background:
    linear-gradient(180deg, rgba(239, 255, 250, 0.98), rgba(222, 239, 233, 0.95)),
    radial-gradient(circle at 18% 14%, rgba(129, 211, 183, 0.26), transparent 34%),
    radial-gradient(circle at 84% 22%, rgba(244, 205, 118, 0.24), transparent 30%);
}

.start-shell {
  min-height: calc(100dvh - 56px);
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.82fr);
  grid-template-areas:
    "brand guide"
    "preview guide";
  gap: 18px;
  align-content: center;
}

.brand-panel,
.guide-panel,
.world-preview {
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 22px;
  background: rgba(255, 255, 250, 0.74);
  box-shadow: 0 24px 56px rgba(88, 123, 116, 0.16);
  backdrop-filter: blur(16px);
}

.brand-panel {
  grid-area: brand;
  min-height: 310px;
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 22px;
  align-items: center;
  padding: 34px;
}

.seal {
  width: 104px;
  height: 104px;
  display: grid;
  place-items: center;
  border-radius: 26px;
  background: linear-gradient(145deg, #fff2bd, #8ee0c2);
  color: #9a6827;
  font-size: 48px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 18px 34px rgba(91, 151, 132, 0.24);
}

.brand-copy {
  display: grid;
  gap: 12px;
}

.brand-copy p,
.guide-head span,
.choice-group > span,
.name-field span,
.preview-card span {
  margin: 0;
  color: rgba(70, 99, 96, 0.68);
  font-size: 12px;
}

.brand-copy h1 {
  margin: 0;
  color: #8e6227;
  font-size: clamp(42px, 7vw, 78px);
  line-height: 1;
  letter-spacing: 0;
}

.brand-copy strong {
  max-width: 620px;
  color: #315257;
  font-size: 18px;
  line-height: 1.7;
}

.guide-panel {
  grid-area: guide;
  display: grid;
  gap: 18px;
  padding: 24px;
}

.guide-head {
  display: grid;
  gap: 6px;
}

.guide-head strong {
  color: #8e6227;
  font-size: 26px;
}

.name-field,
.choice-group {
  display: grid;
  gap: 10px;
}

.name-field input {
  width: 100%;
  min-height: 50px;
  padding: 0 14px;
  border: 1px solid rgba(111, 157, 149, 0.22);
  border-radius: 16px;
  outline: none;
  background: rgba(255, 255, 255, 0.72);
  color: #315257;
  font-family: var(--font-game);
  font-size: 16px;
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.choice-grid button,
.avatar-row button {
  min-height: 62px;
  border: 1px solid rgba(111, 157, 149, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
  color: #315257;
  font-family: var(--font-game);
}

.choice-grid button {
  display: grid;
  place-items: center;
  gap: 6px;
}

.choice-grid i {
  font-style: normal;
  font-size: 20px;
}

.choice-grid strong {
  font-size: 11px;
}

.avatar-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.avatar-row button {
  font-size: 22px;
}

.choice-grid button.active,
.avatar-row button.active {
  border-color: rgba(188, 141, 58, 0.38);
  background: rgba(255, 247, 220, 0.86);
  box-shadow: 0 12px 26px rgba(145, 104, 41, 0.12);
}

.start-actions {
  display: grid;
  gap: 10px;
  margin-top: 4px;
}

.primary-action,
.secondary-action {
  min-height: 56px;
  border-radius: 18px;
  border: 1px solid rgba(188, 141, 58, 0.28);
  font-family: var(--font-game);
}

.primary-action {
  display: grid;
  place-items: center;
  gap: 4px;
  background: linear-gradient(180deg, #fff3c5, #bfe9d4);
  color: #735022;
}

.primary-action span {
  font-size: 16px;
}

.primary-action small {
  color: rgba(88, 72, 44, 0.66);
  font-size: 11px;
}

.secondary-action {
  background: rgba(255, 255, 255, 0.68);
  color: #496463;
}

.world-preview {
  grid-area: preview;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 16px;
}

.preview-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(111, 157, 149, 0.14);
}

.preview-card.active {
  background: rgba(255, 247, 220, 0.72);
  border-color: rgba(188, 141, 58, 0.22);
}

.preview-card strong {
  color: #315257;
  font-size: 14px;
}

.preview-card p {
  margin: 0;
  color: rgba(70, 99, 96, 0.72);
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .main-menu {
    padding: 14px;
  }

  .start-shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      "brand"
      "guide"
      "preview";
  }

  .brand-panel {
    min-height: auto;
    grid-template-columns: 74px minmax(0, 1fr);
    padding: 20px;
  }

  .seal {
    width: 74px;
    height: 74px;
    font-size: 34px;
  }

  .choice-grid,
  .avatar-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .world-preview {
    grid-template-columns: 1fr;
  }
}
</style>
