<template>
  <div class="home-theme-showcase">
    <div class="showcase-scroll">
      <div class="showcase-shell">
        <header class="showcase-header">
          <div class="header-copy">
            <span>首页组件页</span>
            <strong>第三版母版组件展板</strong>
            <p>先把可复用的首页组件做成稳定舞台，再逐块回接首页。</p>
          </div>
          <RouterLink to="/game/settings" class="showcase-back">返回设置</RouterLink>
        </header>

        <section class="hero-board">
          <div class="hero-backdrop"></div>

          <div class="hero-topline">
            <div class="hero-profile">
              <div class="hero-avatar">气</div>
              <div class="hero-meta">
                <strong>云昊</strong>
                <span>炼气六层</span>
                <small>修仙历 1 年 3 月 22 日</small>
              </div>
            </div>

            <div class="hero-actions">
              <ThemeHomeIconBadge size="md" alert>
                <Bell :size="18" />
              </ThemeHomeIconBadge>
              <ThemeHomeIconBadge size="md" alert>
                <Backpack :size="18" />
              </ThemeHomeIconBadge>
              <ThemeHomeIconBadge size="md">
                <Mail :size="18" />
              </ThemeHomeIconBadge>
            </div>
          </div>

          <div class="resource-strip hero-resources">
            <ThemeHomeResourcePill label="修为" value="12.35万" suffix="+">
              <template #icon>
                <GameIcon icon="修" :size="18" />
              </template>
            </ThemeHomeResourcePill>
            <ThemeHomeResourcePill label="灵石" value="2568" suffix="+">
              <template #icon>
                <GameIcon icon="石" :size="18" />
              </template>
            </ThemeHomeResourcePill>
            <ThemeHomeResourcePill label="异闻" value="1890" suffix="+">
              <template #icon>
                <GameIcon icon="闻" :size="18" />
              </template>
            </ThemeHomeResourcePill>
          </div>

          <ThemeHomePanelShell class="hero-panel">
            <div class="hero-panel-grid">
              <div class="panel-copy">
                <span>主修炼位</span>
                <strong>炼气六层</strong>
                <p>当前修为 1230 / 2345</p>
                <small>效率 36/5秒 · 破境丹已备</small>
              </div>

              <div class="panel-ring">
                <ThemeHomeProgressRing
                  :progress="52"
                  title="破境进度"
                  value="52%"
                  subtitle="00:12:34"
                />
              </div>

              <div class="panel-actions">
                <button type="button" class="mini-chip">
                  <ThemeHomeIconBadge size="lg">
                    <Pill :size="20" />
                  </ThemeHomeIconBadge>
                  <span>服药</span>
                </button>
                <ThemeHomeButton size="lg" block>开始修炼</ThemeHomeButton>
              </div>
            </div>
          </ThemeHomePanelShell>
        </section>

        <section class="board-section status-board">
          <div class="section-head">
            <span>图标与状态</span>
            <strong>侧边图标与资源条</strong>
          </div>

          <div class="status-grid">
            <div class="icon-rack">
              <div class="icon-rack-row">
                <ThemeHomeIconBadge size="sm" alert>
                  <Bell :size="16" />
                </ThemeHomeIconBadge>
                <ThemeHomeIconBadge size="md">
                  <Mail :size="18" />
                </ThemeHomeIconBadge>
                <ThemeHomeIconBadge size="lg" alert>
                  <Backpack :size="22" />
                </ThemeHomeIconBadge>
              </div>
              <p>统一做成装饰壳，不让业务页自己拼圆角和高光。</p>
            </div>

            <div class="pill-rack">
              <ThemeHomeResourcePill label="修为" value="8.26万" suffix="+">
                <template #icon>
                  <GameIcon icon="修" :size="18" />
                </template>
              </ThemeHomeResourcePill>
              <ThemeHomeResourcePill label="灵石" value="2568" suffix="+">
                <template #icon>
                  <GameIcon icon="石" :size="18" />
                </template>
              </ThemeHomeResourcePill>
              <ThemeHomeResourcePill label="异闻" value="12" suffix="+">
                <template #icon>
                  <GameIcon icon="闻" :size="18" />
                </template>
              </ThemeHomeResourcePill>
            </div>
          </div>
        </section>

        <section class="board-section">
          <div class="section-head">
            <span>核心按钮</span>
            <strong>主次 CTA 组合</strong>
          </div>

          <div class="button-board">
            <div class="button-row compact">
              <ThemeHomeButton size="sm" block>快速查看</ThemeHomeButton>
              <ThemeHomeButton size="md" block>前往探索</ThemeHomeButton>
            </div>
            <ThemeHomeButton size="lg" block>领取今日奖励</ThemeHomeButton>
          </div>
        </section>

        <section class="board-section">
          <div class="section-head">
            <span>功能卡片</span>
            <strong>首页卡片母版</strong>
          </div>

          <div class="card-board">
            <ThemeHomeFeatureCard title="历练" description="游历四方，获取资源">
              <template #icon>
                <Compass :size="16" />
              </template>
            </ThemeHomeFeatureCard>
            <ThemeHomeFeatureCard title="秘境" description="秘境挑战，觅得机缘">
              <template #icon>
                <Orbit :size="16" />
              </template>
            </ThemeHomeFeatureCard>
            <ThemeHomeFeatureCard title="斗法" description="仙友切磋，争夺排名">
              <template #icon>
                <Swords :size="16" />
              </template>
            </ThemeHomeFeatureCard>
            <ThemeHomeFeatureCard title="宗门" description="清虚道宗，贡献 1280">
              <template #icon>
                <Landmark :size="16" />
              </template>
            </ThemeHomeFeatureCard>
            <ThemeHomeFeatureCard title="地图" description="探索进度 32%">
              <template #icon>
                <Map :size="16" />
              </template>
            </ThemeHomeFeatureCard>
            <ThemeHomeFeatureCard title="修行路" description="第 3 章 逆流而上">
              <template #icon>
                <BookOpen :size="16" />
              </template>
            </ThemeHomeFeatureCard>
          </div>
        </section>

        <section class="board-section">
          <div class="section-head">
            <span>活动横幅</span>
            <strong>信息条与入口</strong>
          </div>

          <ThemeHomeEventBanner
            eyebrow="限时活动"
            title="问鼎仙途"
            description="剩 6 天 12 时 · 立即前往"
            cta="前往"
          />
        </section>

        <section class="board-section nav-board">
          <div class="section-head">
            <span>底部导航</span>
            <strong>首页底栏母版</strong>
          </div>

          <div class="nav-preview">
            <ThemeHomeNavTab label="首页" active>
              <template #icon>
                <Sparkles :size="19" />
              </template>
            </ThemeHomeNavTab>
            <ThemeHomeNavTab label="历练">
              <template #icon>
                <Swords :size="19" />
              </template>
            </ThemeHomeNavTab>
            <ThemeHomeNavTab label="地图">
              <template #icon>
                <Map :size="19" />
              </template>
            </ThemeHomeNavTab>
            <ThemeHomeNavTab label="宗门">
              <template #icon>
                <Landmark :size="19" />
              </template>
            </ThemeHomeNavTab>
            <ThemeHomeNavTab label="伙伴">
              <template #icon>
                <Users :size="19" />
              </template>
            </ThemeHomeNavTab>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Backpack,
  Bell,
  BookOpen,
  Compass,
  Landmark,
  Mail,
  Map,
  Orbit,
  Pill,
  Sparkles,
  Swords,
  Users
} from 'lucide-vue-next'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import ThemeHomeButton from '@/components/theme/homepage/ThemeHomeButton.vue'
import ThemeHomeEventBanner from '@/components/theme/homepage/ThemeHomeEventBanner.vue'
import ThemeHomeFeatureCard from '@/components/theme/homepage/ThemeHomeFeatureCard.vue'
import ThemeHomeIconBadge from '@/components/theme/homepage/ThemeHomeIconBadge.vue'
import ThemeHomeNavTab from '@/components/theme/homepage/ThemeHomeNavTab.vue'
import ThemeHomePanelShell from '@/components/theme/homepage/ThemeHomePanelShell.vue'
import ThemeHomeProgressRing from '@/components/theme/homepage/ThemeHomeProgressRing.vue'
import ThemeHomeResourcePill from '@/components/theme/homepage/ThemeHomeResourcePill.vue'

const originalHtmlOverflow = refDocumentStyle('html', 'overflow')
const originalBodyOverflow = refDocumentStyle('body', 'overflow')
const originalAppOverflow = refAppStyle('overflow')

function refDocumentStyle(selector: 'html' | 'body', property: 'overflow') {
  return typeof document === 'undefined'
    ? ''
    : window.getComputedStyle(document.querySelector(selector) as Element)[property as any] ?? ''
}

function refAppStyle(property: 'overflow') {
  if (typeof document === 'undefined') return ''
  const app = document.getElementById('app')
  return app ? window.getComputedStyle(app)[property as any] ?? '' : ''
}

onMounted(() => {
  document.documentElement.style.overflow = 'auto'
  document.body.style.overflow = 'auto'
  const app = document.getElementById('app')
  if (app) app.style.overflow = 'auto'
})

onBeforeUnmount(() => {
  document.documentElement.style.overflow = originalHtmlOverflow || ''
  document.body.style.overflow = originalBodyOverflow || ''
  const app = document.getElementById('app')
  if (app) app.style.overflow = originalAppOverflow || ''
})
</script>

<style scoped>
.home-theme-showcase {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  background:
    linear-gradient(180deg, rgba(247, 251, 248, 0.96), rgba(226, 238, 234, 0.92)),
    url('@/assets/theme/generated/homepage-v3-scenic-focus-clean.png') center top / cover no-repeat;
  overflow: hidden;
}

.showcase-scroll {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: calc(0.78rem + env(safe-area-inset-top, 0px)) 0.72rem calc(1.2rem + env(safe-area-inset-bottom, 0px));
}

.showcase-shell {
  width: min(100%, 24.375rem);
  margin: 0 auto;
  display: grid;
  gap: 0.8rem;
}

.showcase-header,
.hero-board,
.board-section {
  position: relative;
  overflow: hidden;
  border-radius: 1.32rem;
  border: 1px solid rgba(214, 196, 161, 0.78);
  background:
    linear-gradient(180deg, rgba(255, 251, 245, 0.94), rgba(244, 247, 243, 0.9)),
    radial-gradient(circle at top, rgba(255, 236, 190, 0.18), transparent 54%);
  box-shadow: 0 1rem 2.4rem rgba(79, 112, 113, 0.1);
}

.board-section {
  isolation: isolate;
}

.showcase-header::after,
.hero-board::after,
.board-section::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(135deg, transparent 0 64%, rgba(126, 186, 174, 0.05) 64% 65%, transparent 65% 100%),
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.22), transparent 34%);
}

.showcase-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.88rem 0.9rem 0.82rem;
}

.header-copy {
  display: grid;
  gap: 0.2rem;
}

.header-copy span,
.section-head span {
  color: rgba(113, 94, 54, 0.84);
  font-size: 0.62rem;
  line-height: 1;
}

.header-copy strong,
.section-head strong {
  color: #3f6478;
  font-family: var(--font-game);
  font-size: 1.04rem;
  line-height: 1.05;
}

.header-copy p {
  margin: 0;
  color: rgba(80, 92, 96, 0.8);
  font-size: 0.62rem;
  line-height: 1.28;
}

.showcase-back {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  color: #5b807d;
  font-size: 0.68rem;
  text-decoration: none;
}

.hero-board {
  padding: 0.84rem;
  display: grid;
  gap: 0.62rem;
  background:
    linear-gradient(180deg, rgba(252, 253, 248, 0.9), rgba(243, 247, 243, 0.82)),
    url('@/assets/theme/generated/homepage-v3-scenic-focus-clean.png') center top / cover no-repeat;
}

.hero-backdrop {
  position: absolute;
  inset: auto -18% -20% auto;
  width: 11rem;
  aspect-ratio: 1;
  border-radius: 999px;
  background:
    radial-gradient(circle, rgba(128, 193, 179, 0.26), rgba(128, 193, 179, 0.06) 56%, transparent 72%);
  filter: blur(10px);
}

.hero-topline,
.hero-panel,
.board-section,
.nav-preview {
  position: relative;
  z-index: 1;
}

.hero-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.hero-profile {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: 0.44rem;
  align-items: center;
  min-width: 0;
}

.hero-avatar {
  display: grid;
  place-items: center;
  width: 3rem;
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(218, 192, 150, 0.88);
  background:
    radial-gradient(circle at 50% 34%, rgba(208, 236, 224, 0.96), rgba(169, 216, 204, 0.94));
  color: #629995;
  font-family: var(--font-game);
  font-size: 1.22rem;
  box-shadow:
    inset 0 0 0 0.18rem rgba(255, 252, 244, 0.9),
    0 0.5rem 1rem rgba(112, 156, 151, 0.12);
}

.hero-meta {
  display: grid;
  gap: 0.12rem;
  min-width: 0;
}

.hero-meta strong {
  color: #4b433e;
  font-family: var(--font-game);
  font-size: 1rem;
  line-height: 1;
}

.hero-meta span {
  color: #528bae;
  font-size: 0.66rem;
  line-height: 1.08;
}

.hero-meta small {
  color: rgba(86, 100, 105, 0.74);
  font-size: 0.56rem;
  line-height: 1.2;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex: 0 0 auto;
}

.resource-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.26rem;
}

.hero-panel {
  width: 100%;
}

.hero-panel-grid {
  display: grid;
  grid-template-columns: 0.88fr 1.02fr 1fr;
  gap: 0.08rem;
  align-items: center;
  min-height: 100%;
}

.panel-copy,
.panel-ring,
.panel-actions {
  min-width: 0;
}

.panel-copy {
  display: grid;
  align-content: start;
  gap: 0.2rem;
  padding-top: 0.1rem;
  padding-left: 0.06rem;
}

.panel-copy span {
  color: rgba(115, 100, 66, 0.82);
  font-size: 0.56rem;
  letter-spacing: 0.06em;
}

.panel-copy strong {
  color: #4e433c;
  font-family: var(--font-game);
  font-size: 1.2rem;
  line-height: 1.02;
}

.panel-copy p,
.panel-copy small {
  margin: 0;
  color: rgba(84, 89, 84, 0.8);
  font-size: 0.6rem;
  line-height: 1.3;
}

.panel-ring {
  display: grid;
  place-items: center;
}

.panel-actions {
  display: grid;
  justify-items: center;
  gap: 0.3rem;
  align-content: center;
}

.mini-chip {
  display: grid;
  justify-items: center;
  gap: 0.16rem;
  border: 0;
  background: transparent;
  color: #546564;
  font-family: var(--font-game);
  font-size: 0.7rem;
  padding: 0;
}

.board-section {
  display: grid;
  gap: 0.58rem;
  padding: 0.84rem 0.84rem 0.9rem;
}

.section-head {
  display: grid;
  gap: 0.18rem;
  position: relative;
  z-index: 1;
}

.button-board {
  display: grid;
  gap: 0.24rem;
  position: relative;
  z-index: 1;
}

.button-row.compact {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.22rem;
}

.card-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.28rem 0.24rem;
  position: relative;
  z-index: 1;
}

.status-grid {
  display: grid;
  gap: 0.58rem;
  position: relative;
  z-index: 1;
}

.icon-rack,
.pill-rack {
  display: grid;
  gap: 0.34rem;
}

.icon-rack-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.22rem 0.1rem 0 0.04rem;
}

.icon-rack p {
  margin: 0;
  color: rgba(84, 96, 98, 0.78);
  font-size: 0.62rem;
  line-height: 1.42;
}

.pill-rack {
  grid-template-columns: 1fr;
  gap: 0.22rem;
}

.nav-board {
  padding-bottom: 0.52rem;
}

.nav-preview {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0;
  padding: 0.34rem 0.22rem 0.14rem;
  border-radius: 1.52rem 1.52rem 0 0;
  border: 1px solid rgba(224, 205, 175, 0.78);
  background:
    linear-gradient(180deg, rgba(255, 253, 248, 0.96), rgba(248, 247, 243, 0.92)),
    radial-gradient(circle at top, rgba(255, 223, 147, 0.16), transparent 58%);
  position: relative;
  z-index: 1;
}

.nav-preview > * + * {
  position: relative;
}

.nav-preview > * + *::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.8rem;
  bottom: 0.72rem;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(208, 192, 162, 0.72), transparent);
}

@media (max-width: 640px) {
  .showcase-scroll {
    padding-left: 0.62rem;
    padding-right: 0.62rem;
  }

  .showcase-shell {
    gap: 0.7rem;
  }

  .showcase-header {
    padding: 0.78rem 0.8rem;
  }

  .hero-board,
  .board-section {
    padding: 0.72rem;
  }

  .hero-profile {
    grid-template-columns: 2.72rem minmax(0, 1fr);
    gap: 0.38rem;
  }

  .hero-avatar {
    width: 2.72rem;
    font-size: 1.1rem;
  }

  .hero-meta strong {
    font-size: 0.94rem;
  }

  .hero-meta span {
    font-size: 0.62rem;
  }

  .hero-meta small {
    font-size: 0.52rem;
  }

  .hero-panel-grid {
    grid-template-columns: 0.84fr 0.98fr 0.98fr;
    gap: 0.04rem;
  }

  .panel-copy strong {
    font-size: 1.02rem;
  }

  .panel-copy p,
  .panel-copy small,
  .panel-copy span {
    font-size: 0.54rem;
  }

  .panel-ring :deep(.theme-home-progress-ring) {
    width: min(100%, 5.45rem);
  }

  .panel-actions :deep(.theme-home-button) {
    --button-height: 3.45rem;
    --button-content-width: 68%;
  }

  .status-grid {
    gap: 0.48rem;
  }

  .icon-rack-row {
    gap: 0.34rem;
  }

  .icon-rack p {
    font-size: 0.58rem;
  }

  .card-board {
    gap: 0.24rem 0.2rem;
  }
}
</style>
