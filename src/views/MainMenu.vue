<template>
  <main class="main-menu">
    <section class="start-shell">
      <div class="brand-panel">
        <div class="seal-stack">
          <span class="seal">修</span>
          <small>云海初开</small>
        </div>
        <div class="brand-copy">
          <p>2D 文字修仙 · 世界自演</p>
          <h1>我欲修仙</h1>
          <strong>挂机修炼、奇遇历险、宗门势力与 NPC 命运会在同一个世界时钟里推进。</strong>
        </div>
      </div>

      <div v-if="!playerStore.created" class="guide-panel">
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

      <div v-else class="guide-panel save-panel">
        <div class="guide-head">
          <span>当前存档</span>
          <strong>继续修途</strong>
        </div>

        <div class="save-profile">
          <div class="save-avatar">{{ playerStore.icon }}</div>
          <div>
            <span>{{ playerStore.realmInfo.fullName }} · {{ playerStore.element }}灵根</span>
            <strong>{{ playerStore.name }}</strong>
            <p>本命已定，首页只负责进入主循环。灵根、气质和头像后续不在这里反复改动。</p>
          </div>
        </div>

        <div class="save-stats">
          <div>
            <span>修为</span>
            <strong>{{ playerStore.cultivation }}/{{ playerStore.maxCultivation }}</strong>
          </div>
          <div>
            <span>灵石</span>
            <strong>{{ playerStore.gold }}</strong>
          </div>
          <div>
            <span>体力</span>
            <strong>{{ playerStore.stamina }}/{{ playerStore.maxStamina }}</strong>
          </div>
        </div>

        <div class="resume-brief">
          <div class="resume-card primary">
            <span>下一步</span>
            <strong>主界任务台</strong>
            <p>先处理挂机、历险、故事、人物、地图与宗门这些 P0 核心循环。</p>
          </div>
          <div class="resume-card">
            <span>本命锁定</span>
            <strong>{{ playerStore.element }}灵根</strong>
            <p>角色创建信息已写入存档，成长转移到角色、功法和剧情系统。</p>
          </div>
          <div class="resume-card">
            <span>声音</span>
            <strong>默认静音</strong>
            <p>背景音需要手动开启，避免进入游戏立即播放不好听的占位 BGM。</p>
          </div>
        </div>

        <div class="start-actions">
          <button class="primary-action" @click="handleContinue">
            <span>进入主循环</span>
            <small>继续当前进度</small>
          </button>
          <button class="secondary-action" @click="handleSettings">
            系统设置
          </button>
        </div>
      </div>

      <aside class="world-preview">
        <div class="preview-card active">
          <span>P0 主循环</span>
          <strong>修炼 / 历险 / 故事</strong>
          <p>先保证进入、行动、反馈、返回这些基础链路稳定可玩。</p>
        </div>
        <div class="preview-card">
          <span>P0 世界</span>
          <strong>NPC / 奇遇 / 日志</strong>
          <p>挂机时世界继续推进，人物关系与异闻会写入主界面。</p>
        </div>
        <div class="preview-card">
          <span>P1 扩展</span>
          <strong>地图 / 宗门 / 战斗深化</strong>
          <p>可玩闭环稳定后，再继续扩展大世界、势力吞并和表现层。</p>
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

function handleSettings() {
  void router.push('/game/settings')
}
</script>

<style scoped>
.main-menu {
  min-height: 100vh;
  min-height: 100dvh;
  overflow: auto;
  padding: 24px;
  color: #315257;
  background:
    linear-gradient(135deg, rgba(243, 255, 248, 0.98) 0%, rgba(235, 249, 243, 0.96) 42%, rgba(255, 247, 222, 0.94) 100%),
    repeating-linear-gradient(90deg, rgba(82, 139, 127, 0.05) 0 1px, transparent 1px 76px),
    repeating-linear-gradient(0deg, rgba(188, 141, 58, 0.045) 0 1px, transparent 1px 76px);
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
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.9), rgba(244, 252, 247, 0.78)),
    linear-gradient(90deg, rgba(255, 235, 170, 0.18), transparent 38%);
  box-shadow: 0 24px 56px rgba(88, 123, 116, 0.16);
  backdrop-filter: blur(16px);
}

.brand-panel {
  grid-area: brand;
  min-height: 310px;
  display: grid;
  grid-template-columns: 116px minmax(0, 1fr);
  gap: 22px;
  align-items: center;
  padding: 34px;
}

.seal-stack {
  display: grid;
  gap: 10px;
  justify-items: center;
}

.seal {
  width: 108px;
  height: 108px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  border: 1px solid rgba(151, 99, 38, 0.22);
  background:
    linear-gradient(145deg, #fff3c0, #bfead6),
    repeating-linear-gradient(45deg, rgba(142, 98, 39, 0.08) 0 1px, transparent 1px 8px);
  color: #9a6827;
  font-size: 48px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 18px 34px rgba(91, 151, 132, 0.24);
}

.seal-stack small {
  color: rgba(93, 112, 105, 0.72);
  font-size: 11px;
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

.save-panel {
  align-content: center;
}

.save-profile {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(111, 157, 149, 0.18);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.74), rgba(242, 252, 247, 0.66)),
    linear-gradient(90deg, rgba(255, 236, 178, 0.26), transparent 48%);
}

.save-avatar {
  width: 78px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 18px;
  border: 1px solid rgba(188, 141, 58, 0.22);
  background: linear-gradient(145deg, #fff2bd, #91dfc2);
  color: #8e6227;
  font-size: 32px;
}

.save-profile div:last-child {
  display: grid;
  gap: 6px;
}

.save-profile span,
.save-stats span {
  color: rgba(70, 99, 96, 0.68);
  font-size: 12px;
}

.save-profile strong {
  color: #315257;
  font-size: 24px;
}

.save-profile p {
  margin: 0;
  color: rgba(49, 82, 87, 0.72);
  font-size: 13px;
  line-height: 1.7;
}

.save-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.save-stats div {
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid rgba(111, 157, 149, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.52);
}

.save-stats strong {
  color: #8e6227;
  font-size: 15px;
}

.resume-brief {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.resume-card {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid rgba(111, 157, 149, 0.16);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.64), rgba(244, 252, 248, 0.56)),
    radial-gradient(circle at top right, rgba(255, 224, 151, 0.18), transparent 64%);
}

.resume-card.primary {
  border-color: rgba(188, 141, 58, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 250, 231, 0.8), rgba(239, 252, 246, 0.64)),
    radial-gradient(circle at top right, rgba(255, 213, 112, 0.2), transparent 64%);
}

.resume-brief span {
  color: rgba(70, 99, 96, 0.68);
  font-size: 11px;
}

.resume-brief strong {
  color: #315257;
  font-size: 14px;
}

.resume-brief p {
  margin: 0;
  color: rgba(49, 82, 87, 0.7);
  font-size: 11px;
  line-height: 1.6;
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
  border-radius: 12px;
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
  border-radius: 12px;
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
  border-radius: 14px;
  border: 1px solid rgba(188, 141, 58, 0.28);
  font-family: var(--font-game);
  cursor: pointer;
}

.primary-action {
  display: grid;
  place-items: center;
  gap: 4px;
  background:
    linear-gradient(180deg, #fff3c5, #bfe9d4),
    linear-gradient(90deg, rgba(255, 255, 255, 0.38), transparent);
  color: #735022;
  box-shadow: 0 16px 30px rgba(104, 151, 132, 0.18);
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
  border-radius: 14px;
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

  .resume-brief,
  .save-stats {
    grid-template-columns: 1fr;
  }
}
</style>
