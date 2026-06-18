<template>
  <div class="story-view">
    <div v-if="!isPlaying" class="story-select">
      <section class="story-hero">
        <div class="hero-copy">
          <span class="eyebrow">天衍卷宗 · 第一卷</span>
          <h2>命簿初开</h2>
          <p>选择视角进入主线，故事效果会同步解锁人物、宗门关系、地图与剧情战。</p>
        </div>
        <div class="hero-seal">卷</div>
      </section>

      <div class="story-grid">
        <GameSurface tone="mist" padding="lg" title="选择视角" subtitle="不同视角会读取独立正文和节点入口。">
          <div class="perspective-select">
            <StoryPerspectiveCard
              title="凌辰线"
              subtitle="少年入山，因果从一枚旧玉开始。"
              mark="辰"
              :active="selectedPerspective === 'male'"
              @select="selectedPerspective = 'male'"
            />
            <StoryPerspectiveCard
              title="苏清鸢线"
              subtitle="清鸢执卷，旧梦与宗门暗流相连。"
              mark="鸢"
              tone="rose"
              :active="selectedPerspective === 'female'"
              @select="selectedPerspective = 'female'"
            />
          </div>
        </GameSurface>

        <StoryProgressPanel
          :perspective-label="perspectiveLabel"
          :loop="storyStore.currentLoop"
          :volume="storyStore.currentVolume"
          :completed-count="storyStore.completedNodes.size"
          :total-nodes="storyNodeCountLabel"
          :current-node-name="currentNodeLabel"
          :current-node-map="storyStore.currentNode?.map"
        />
      </div>

      <GameSurface tone="jade" padding="md" compact>
        <div class="action-row">
          <template v-if="storyStore.currentNodeId">
            <GameActionButton tone="gold" icon="续" @click="continueSavedStory">
              继续{{ savedPerspectiveLabel }}
            </GameActionButton>
            <GameActionButton
              v-if="selectedPerspective !== storyStore.currentPerspective"
              tone="jade"
              icon="启"
              @click="startNewPerspective"
            >
              开启{{ selectedPerspectiveLabel }}
            </GameActionButton>
            <GameActionButton v-else tone="stone" icon="重" @click="restartStory">
              重启本线
            </GameActionButton>
          </template>

          <GameActionButton
            v-else
            tone="gold"
            icon="启"
            :disabled="!selectedPerspective"
            @click="startStory"
          >
            开始故事
          </GameActionButton>
        </div>
      </GameSurface>

      <GameSurface v-if="debugEnabled" tone="mist" padding="sm" compact>
        <details class="debug-panel">
          <summary>剧情运行诊断</summary>
          <div class="debug-actions">
            <GameActionButton icon="析" tone="stone" @click="testParser">解析器</GameActionButton>
            <GameActionButton icon="载" tone="stone" @click="testLoader">加载器</GameActionButton>
          </div>
          <pre v-if="debugOutput" class="debug-output">{{ debugOutput }}</pre>
        </details>
      </GameSurface>
    </div>

    <StoryPlayer v-else @back="isPlaying = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStoryStore } from '@/story/storyStore'
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import StoryPerspectiveCard from '@/components/story/StoryPerspectiveCard.vue'
import StoryPlayer from '@/components/story/StoryPlayer.vue'
import StoryProgressPanel from '@/components/story/StoryProgressPanel.vue'
import type { Perspective } from '@/story/types'

const storyStore = useStoryStore()

const isPlaying = ref(false)
const selectedPerspective = ref<'male' | 'female'>(storyStore.currentPerspective === 'female' ? 'female' : 'male')
const debugOutput = ref<string | null>(null)
const debugEnabled = import.meta.env.DEV

const perspectiveLabel = computed(() => {
  const perspective = storyStore.currentPerspective
  return perspective === 'male' ? '男主线' : perspective === 'female' ? '女主线' : '未选择'
})

const selectedPerspectiveLabel = computed(() => {
  return selectedPerspective.value === 'male' ? '凌辰线' : '苏清鸢线'
})

const savedPerspectiveLabel = computed(() => {
  return storyStore.currentPerspective === 'male' ? '凌辰线' : '苏清鸢线'
})

const storyNodeCountLabel = computed(() => {
  if (storyStore.allNodes.length > 0) return storyStore.allNodes.length
  return storyStore.currentNodeId ? '待载入' : 0
})

const currentNodeLabel = computed(() => {
  return storyStore.currentNode?.name ?? storyStore.currentNodeId ?? null
})

async function startStory() {
  try {
    await storyStore.initStory(selectedPerspective.value, 1)
    isPlaying.value = true
  } catch (error) {
    console.error('Failed to start story:', error)
    debugOutput.value = `Error: ${error}`
  }
}

async function continueSavedStory() {
  try {
    await storyStore.continueStory()
    isPlaying.value = true
  } catch (error) {
    console.error('Failed to continue story:', error)
    debugOutput.value = `Error: ${error}`
  }
}

async function startNewPerspective() {
  try {
    storyStore.resetStory()
    await storyStore.initStory(selectedPerspective.value, 1)
    isPlaying.value = true
  } catch (error) {
    console.error('Failed to start new perspective:', error)
    debugOutput.value = `Error: ${error}`
  }
}

async function restartStory() {
  try {
    const perspective = storyStore.currentPerspective as Perspective
    storyStore.resetStory()
    await storyStore.initStory(perspective, 1)
    isPlaying.value = true
  } catch (error) {
    console.error('Failed to restart story:', error)
    debugOutput.value = `Error: ${error}`
  }
}

async function testParser() {
  try {
    const response = await fetch('/src/assets/story/volume-1/main.md')
    if (!response.ok) {
      throw new Error('Failed to fetch story file')
    }
    const content = await response.text()

    debugOutput.value = `Story file loaded, length: ${content.length} chars\nFirst 500 chars:\n${content.substring(0, 500)}`
  } catch (error) {
    debugOutput.value = `Parser Error: ${error}`
  }
}

async function testLoader() {
  try {
    debugOutput.value = JSON.stringify(
      {
        currentVolume: storyStore.currentVolume,
        currentLoop: storyStore.currentLoop,
        currentPerspective: storyStore.currentPerspective,
        completedNodes: storyStore.completedNodes.size,
        nodeCount: storyStore.allNodes.length,
      },
      null,
      2
    )
  } catch (error) {
    debugOutput.value = `Loader Error: ${error}`
  }
}
</script>

<style scoped>
.story-view {
  height: 100%;
  overflow-y: auto;
  background:
    linear-gradient(180deg, rgba(247, 252, 244, 0.98), rgba(232, 244, 239, 0.96)),
    radial-gradient(circle at 10% 0%, rgba(218, 176, 94, 0.16), transparent 42%);
  color: #294846;
}

.story-select {
  display: grid;
  gap: 16px;
  width: min(1040px, 100%);
  padding: 20px;
  margin: 0 auto;
}

.story-hero {
  min-height: 210px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(127, 142, 101, 0.24);
  background:
    linear-gradient(110deg, rgba(255, 253, 239, 0.98), rgba(231, 248, 239, 0.92)),
    radial-gradient(circle at 82% 20%, rgba(193, 133, 56, 0.18), transparent 38%);
  box-shadow: 0 22px 56px rgba(77, 113, 101, 0.14);
  overflow: hidden;
}

.hero-copy {
  display: grid;
  gap: 10px;
  max-width: 620px;
}

.eyebrow {
  color: rgba(111, 91, 55, 0.74);
  font-size: 12px;
  font-weight: 700;
}

.hero-copy h2 {
  margin: 0;
  color: #764d1f;
  font-size: clamp(32px, 6vw, 58px);
  line-height: 1;
  letter-spacing: 0;
}

.hero-copy p {
  max-width: 520px;
  margin: 0;
  color: rgba(42, 73, 69, 0.74);
  font-size: 14px;
  line-height: 1.8;
}

.hero-seal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(145, 95, 37, 0.22);
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.94), rgba(232, 210, 156, 0.62)),
    repeating-linear-gradient(45deg, rgba(134, 91, 40, 0.08) 0 2px, transparent 2px 8px);
  color: rgba(132, 79, 26, 0.86);
  font-size: 44px;
  font-weight: 900;
  box-shadow: inset 0 0 0 12px rgba(255, 255, 255, 0.34);
}

.story-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 16px;
  align-items: start;
}

.perspective-select {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.debug-panel {
  display: grid;
  gap: 10px;
}

.debug-panel summary {
  color: rgba(52, 75, 72, 0.68);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.debug-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.debug-output {
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  background: rgba(31, 48, 45, 0.08);
  color: #47615d;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
}

@media (max-width: 820px) {
  .story-grid,
  .story-hero {
    grid-template-columns: 1fr;
  }

  .hero-seal {
    display: none;
  }
}

@media (max-width: 560px) {
  .story-select {
    padding: 12px;
  }

  .story-hero {
    min-height: auto;
    padding: 20px;
    border-radius: 18px;
  }

  .action-row {
    flex-direction: column;
  }
}
</style>
