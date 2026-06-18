<template>
  <main class="main-menu">
    <section class="start-shell" :class="{ 'has-save': playerStore.created }">
      <div class="brand-panel">
        <div class="brand-art" aria-hidden="true">
          <div class="moon-ring">
            <span class="seal">修</span>
          </div>
          <div class="mountain-line"></div>
        </div>
        <div class="brand-copy">
          <p>2D 挂机文字修仙 · 世界自演</p>
          <h1>我欲修仙</h1>
          <strong>挂机修炼、奇遇历险、宗门势力与 NPC 命运会在同一个世界时钟里推进。</strong>
          <div class="brand-tags" aria-label="当前版本重点">
            <span><Sparkles :size="13" />明亮主界</span>
            <span><LockKeyhole :size="13" />本命锁定</span>
            <span><VolumeX :size="13" />默认静音</span>
          </div>
        </div>
      </div>

      <div v-if="!playerStore.created" class="guide-panel creation-panel">
        <div class="guide-head">
          <span>首次创建</span>
          <strong>定下本命</strong>
          <p>这里仅用于建立第一份角色档案。创建后灵根与气质不再从首页反复修改，后续成长交给角色、功法、剧情与机缘系统。</p>
        </div>

        <div class="creation-step-row" aria-label="创建流程">
          <div v-for="step in creationSteps" :key="step.label" class="creation-step">
            <span>{{ step.index }}</span>
            <strong>{{ step.label }}</strong>
          </div>
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

        <div class="creation-lock-note">
          <strong>创建后锁定</strong>
          <p>本命设定会写入存档。首页后续只显示继续入口，灵根、气质、头像不再从这里反复改动。</p>
        </div>

        <div class="start-actions">
          <button class="primary-action" @click="handleStart">
            <Play :size="18" />
            <span>开始修仙</span>
            <small>进入主循环</small>
          </button>
        </div>
      </div>

      <div v-else class="guide-panel save-panel">
        <div class="guide-head">
          <span>当前存档</span>
          <strong>继续修途</strong>
          <p>本命已定，首页只负责读取存档和进入主循环。灵根、气质、头像不再从这里重选，后续变化交给角色成长、剧情和机缘。</p>
        </div>

        <div class="save-pass">
          <div class="save-profile">
            <div class="save-avatar">{{ playerStore.icon }}</div>
            <div>
              <span>{{ playerStore.realmInfo.fullName }} · {{ playerStore.element }}灵根 · {{ playerStore.quality }}</span>
              <strong>{{ playerStore.name }}</strong>
              <p>创建信息已写入存档。首页不再提供反复重选灵根和气质，后续变化交给角色成长、剧情、功法和机缘。</p>
            </div>
          </div>

          <div class="save-lock-row" aria-label="创建设定状态">
            <span>本命锁定</span>
            <span>声音默认关闭</span>
            <span>P0 优先</span>
          </div>
        </div>

        <div class="save-command-docket" aria-label="当前修途摘要">
          <div>
            <span>主循环</span>
            <strong>先跑通六项基础玩法</strong>
          </div>
          <button class="primary-action docket-action" @click="handleContinue">
            <Play :size="18" />
            <span>进入游戏</span>
            <small>修炼首页</small>
          </button>
        </div>

        <div class="save-next-step">
          <div>
            <span>推荐先做</span>
            <strong>进入主界任务台</strong>
            <p>先把挂机、历险、故事、人物、地图、宗门这六个 P0 入口跑通，再继续扩展战斗和大世界深度。</p>
          </div>
        </div>

        <div class="locked-profile-grid" aria-label="本命信息">
          <div v-for="item in lockedProfileItems" :key="item.label" class="locked-profile-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.hint }}</small>
          </div>
        </div>

        <div class="save-stats">
          <div>
            <span>修为</span>
            <strong>{{ formatAmount(playerStore.cultivation) }}/{{ formatAmount(playerStore.maxCultivation) }}</strong>
          </div>
          <div>
            <span>灵石</span>
            <strong>{{ formatAmount(playerStore.gold) }}</strong>
          </div>
          <div>
            <span>体力</span>
            <strong>{{ formatAmount(playerStore.stamina) }}/{{ formatAmount(playerStore.maxStamina) }}</strong>
          </div>
        </div>

        <div class="priority-board">
          <div class="priority-title">
            <span>P0 当前目标</span>
            <strong>先让主循环真的可玩</strong>
          </div>
          <div class="priority-grid">
            <div v-for="item in priorityItems" :key="item.title" class="priority-item">
              <span>{{ item.icon }}</span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.desc }}</small>
            </div>
          </div>
        </div>

        <div class="start-actions">
          <div class="save-action-row">
            <button class="secondary-action" @click="handleSettings">
              <Settings :size="16" />
              系统设置
            </button>
            <button class="secondary-action ghost" @click="handleStory">
              <ScrollText :size="16" />
              命簿卷宗
            </button>
          </div>
        </div>
      </div>

      <aside class="world-preview">
        <div
          v-for="card in roadmapCards"
          :key="card.title"
          class="preview-card"
          :class="{ active: card.active }"
        >
          <span>{{ card.label }}</span>
          <strong>{{ card.title }}</strong>
          <p>{{ card.desc }}</p>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockKeyhole, Play, ScrollText, Settings, Sparkles, VolumeX } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { usePlayerStore } from '@/stores/playerStore'
import type { Element } from '@/types/unit'

const router = useRouter()
const route = useRoute()
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

const creationSteps = [
  { index: '一', label: '道号' },
  { index: '二', label: '灵根' },
  { index: '三', label: '入世' }
]

const priorityItems = [
  { icon: '修', title: '挂机', desc: '开始、停止、收益和离线反馈稳定。' },
  { icon: '游', title: '历险', desc: '消耗体力、触发战斗和获得掉落。' },
  { icon: '卷', title: '故事', desc: '主线解锁人物、地图、宗门与剧情战。' },
  { icon: '人', title: 'NPC', desc: '人物关系和世界日志持续变化。' },
  { icon: '图', title: '地图', desc: '区域风险、处置和宗门位置可见。' },
  { icon: '门', title: '宗门', desc: '拜山、任务、俸禄和战事入口可用。' }
]

const roadmapCards = [
  {
    label: 'P0 主循环',
    title: '修炼 / 历险 / 故事',
    desc: '先保证进入、行动、反馈、返回这些基础链路稳定可玩。',
    active: true
  },
  {
    label: 'P0 世界',
    title: 'NPC / 奇遇 / 日志',
    desc: '挂机时世界继续推进，人物关系与异闻会写入主界面。',
    active: false
  },
  {
    label: 'P1 扩展',
    title: '地图 / 宗门 / 战斗深化',
    desc: '可玩闭环稳定后，再扩展大世界、势力吞并和表现层。',
    active: false
  }
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
  void router.push(getRedirectPath())
}

function handleContinue() {
  info('读取当前存档。')
  void router.push(getRedirectPath())
}

function handleSettings() {
  void router.push('/game/settings')
}

function handleStory() {
  void router.push('/game/story')
}

function getRedirectPath() {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/game')) return redirect
  return '/game/cultivation'
}

const lockedProfileItems = [
  { label: '本命灵根', value: `${playerStore.element}灵根`, hint: '首页不可重选' },
  { label: '先天气质', value: playerStore.quality, hint: '由机缘继续变化' },
  { label: '声音状态', value: '默认静音', hint: '进游戏后手动开声' }
]

function formatAmount(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}
</script>

<style scoped>
.main-menu {
  height: 100vh;
  height: 100dvh;
  overflow: auto;
  padding: 14px;
  color: #315257;
  background:
    linear-gradient(90deg, rgba(69, 118, 104, 0.052) 1px, transparent 1px),
    linear-gradient(0deg, rgba(69, 118, 104, 0.044) 1px, transparent 1px),
    linear-gradient(120deg, transparent 0 34%, rgba(255, 237, 174, 0.28) 34% 35%, transparent 35% 100%),
    linear-gradient(135deg, rgba(248, 255, 244, 0.98) 0%, rgba(235, 249, 243, 0.96) 46%, rgba(255, 248, 226, 0.94) 100%);
  background-size: 44px 44px, 44px 44px, auto, auto, auto, auto;
}

.start-shell {
  min-height: calc(100dvh - 36px);
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.82fr);
  grid-template-areas:
    "brand guide"
    "preview guide";
  gap: 16px;
  align-content: center;
}

.start-shell.has-save {
  grid-template-columns: minmax(0, 0.78fr) minmax(460px, 0.92fr);
}

.brand-panel,
.guide-panel,
.world-preview {
  border: 1px solid rgba(111, 157, 149, 0.2);
  border-radius: 16px;
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
  grid-template-columns: 144px minmax(0, 1fr);
  gap: 22px;
  align-items: center;
  padding: 34px;
}

.brand-art {
  position: relative;
  min-height: 188px;
  display: grid;
  place-items: center;
}

.moon-ring {
  width: 136px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid rgba(151, 99, 38, 0.18);
  background:
    radial-gradient(circle at 36% 28%, rgba(255, 255, 255, 0.86), transparent 24%),
    linear-gradient(145deg, #fff3c0, #bfead6);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 18px 34px rgba(91, 151, 132, 0.24);
}

.mountain-line {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 18px;
  height: 64px;
  border-radius: 999px 999px 14px 14px;
  background:
    linear-gradient(135deg, transparent 0 28%, rgba(96, 143, 126, 0.34) 28% 42%, transparent 42%),
    linear-gradient(45deg, transparent 0 34%, rgba(139, 98, 38, 0.18) 34% 50%, transparent 50%),
    linear-gradient(180deg, transparent, rgba(115, 196, 177, 0.16));
  opacity: 0.8;
}

.seal {
  width: 92px;
  height: 92px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  border: 1px solid rgba(151, 99, 38, 0.22);
  background:
    linear-gradient(145deg, rgba(255, 248, 221, 0.88), rgba(235, 252, 244, 0.8)),
    repeating-linear-gradient(45deg, rgba(142, 98, 39, 0.08) 0 1px, transparent 1px 8px);
  color: #9a6827;
  font-size: 44px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.7);
}

.brand-copy {
  display: grid;
  gap: 12px;
}

.brand-copy p,
.guide-head span,
.choice-group > span,
.name-field span,
.preview-card span,
.priority-title span {
  margin: 0;
  color: rgba(70, 99, 96, 0.68);
  font-size: 12px;
}

.guide-head p {
  margin: 0;
  color: rgba(49, 82, 87, 0.72);
  font-size: 12px;
  line-height: 1.7;
}

.save-panel {
  align-content: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 250, 0.97), rgba(241, 252, 247, 0.88)),
    linear-gradient(135deg, rgba(127, 205, 180, 0.18), transparent 42%),
    linear-gradient(90deg, rgba(255, 226, 145, 0.24), transparent 62%);
}

.save-pass {
  display: grid;
  gap: 10px;
}

.creation-lock-note,
.save-next-step {
  border: 1px solid rgba(188, 141, 58, 0.22);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 251, 236, 0.78), rgba(241, 252, 247, 0.64)),
    radial-gradient(circle at top right, rgba(255, 213, 112, 0.18), transparent 64%);
}

.creation-lock-note {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
}

.creation-lock-note strong,
.save-next-step strong {
  color: #8e6227;
  font-size: 14px;
}

.creation-lock-note p,
.save-next-step p {
  margin: 0;
  color: rgba(49, 82, 87, 0.72);
  font-size: 12px;
  line-height: 1.7;
}

.save-profile {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(111, 157, 149, 0.18);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(242, 252, 247, 0.7)),
    linear-gradient(90deg, rgba(255, 236, 178, 0.34), transparent 52%);
}

.save-lock-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.save-lock-row span {
  min-height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(188, 141, 58, 0.18);
  border-radius: 12px;
  background: rgba(255, 250, 233, 0.72);
  color: #8b6226;
  font-size: 11px;
}

.save-avatar {
  width: 86px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 20px;
  border: 1px solid rgba(188, 141, 58, 0.22);
  background:
    linear-gradient(145deg, #fff2bd, #91dfc2),
    repeating-linear-gradient(45deg, rgba(142, 98, 39, 0.08) 0 1px, transparent 1px 8px);
  color: #8e6227;
  font-size: 34px;
  box-shadow: 0 16px 30px rgba(94, 144, 130, 0.18);
}

.save-command-docket {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(160px, 0.42fr);
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(91, 151, 132, 0.18);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(242, 255, 249, 0.86), rgba(255, 251, 235, 0.64)),
    linear-gradient(90deg, rgba(130, 213, 188, 0.16), transparent);
}

.save-command-docket > div {
  display: grid;
  gap: 5px;
}

.save-command-docket span {
  color: rgba(70, 99, 96, 0.68);
  font-size: 11px;
}

.save-command-docket strong {
  color: #315257;
  font-size: 15px;
  line-height: 1.4;
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

.save-next-step {
  display: grid;
  gap: 14px;
  align-items: center;
  padding: 14px;
}

.save-next-step > div {
  display: grid;
  gap: 6px;
}

.save-next-step span {
  color: rgba(70, 99, 96, 0.68);
  font-size: 12px;
}

.save-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.locked-profile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.locked-profile-item {
  min-width: 0;
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid rgba(111, 157, 149, 0.16);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(242, 252, 247, 0.54)),
    radial-gradient(circle at top right, rgba(255, 224, 151, 0.16), transparent 64%);
}

.locked-profile-item span {
  color: rgba(70, 99, 96, 0.68);
  font-size: 11px;
}

.locked-profile-item strong {
  min-width: 0;
  overflow: hidden;
  color: #315257;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.locked-profile-item small {
  color: rgba(49, 82, 87, 0.68);
  font-size: 10px;
  line-height: 1.5;
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

.priority-board {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(111, 157, 149, 0.16);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.64), rgba(244, 252, 248, 0.56)),
    radial-gradient(circle at top right, rgba(255, 224, 151, 0.18), transparent 64%);
}

.priority-title {
  display: grid;
  gap: 4px;
}

.priority-title strong {
  color: #315257;
  font-size: 15px;
}

.priority-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.priority-item {
  min-width: 0;
  display: grid;
  gap: 5px;
  padding: 10px;
  border: 1px solid rgba(111, 157, 149, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.58);
}

.priority-item span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: rgba(255, 246, 218, 0.84);
  color: #8b6226;
  font-size: 13px;
  font-weight: 800;
}

.priority-item strong {
  color: #315257;
  font-size: 12px;
}

.priority-item small {
  color: rgba(49, 82, 87, 0.68);
  font-size: 10px;
  line-height: 1.55;
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

.brand-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.brand-tags span {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
  border: 1px solid rgba(188, 141, 58, 0.22);
  border-radius: 10px;
  background: rgba(255, 249, 231, 0.76);
  color: #8b6226;
  font-size: 11px;
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

.creation-step-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(111, 157, 149, 0.16);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.66), rgba(242, 252, 247, 0.54)),
    radial-gradient(circle at top right, rgba(255, 226, 145, 0.18), transparent 70%);
}

.creation-step {
  min-width: 0;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  min-height: 42px;
  padding: 6px 8px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.56);
}

.creation-step span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(255, 244, 208, 0.9);
  color: #8b6226;
  font-size: 12px;
  font-weight: 800;
}

.creation-step strong {
  min-width: 0;
  overflow: hidden;
  color: #315257;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.save-action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.primary-action,
.secondary-action {
  min-height: 56px;
  border-radius: 14px;
  border: 1px solid rgba(188, 141, 58, 0.28);
  font-family: var(--font-game);
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.primary-action {
  display: inline-grid;
  grid-template-columns: auto auto;
  place-content: center;
  align-items: center;
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
  grid-column: 1 / -1;
  color: rgba(88, 72, 44, 0.66);
  font-size: 11px;
}

.primary-action.compact {
  min-height: 66px;
}

.primary-action.docket-action {
  min-height: 62px;
}

.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: rgba(255, 255, 255, 0.68);
  color: #496463;
}

.secondary-action.ghost {
  border-color: rgba(111, 157, 149, 0.2);
  background: rgba(243, 252, 248, 0.64);
}

.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(104, 151, 132, 0.15);
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
    padding: 10px;
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
    grid-template-columns: 92px minmax(0, 1fr);
    padding: 16px;
  }

  .brand-copy h1 {
    font-size: 40px;
  }

  .brand-copy strong {
    font-size: 14px;
  }

  .guide-panel {
    padding: 16px;
  }

  .brand-art {
    min-height: 116px;
  }

  .moon-ring {
    width: 88px;
  }

  .mountain-line {
    bottom: 8px;
    height: 42px;
  }

  .seal {
    width: 62px;
    height: 62px;
    font-size: 30px;
  }

  .choice-grid,
  .avatar-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .world-preview {
    grid-template-columns: 1fr;
  }

  .creation-step-row,
  .save-lock-row,
  .save-command-docket,
  .save-next-step,
  .locked-profile-grid,
  .save-stats,
  .save-action-row,
  .priority-grid {
    grid-template-columns: 1fr;
  }
}
</style>
