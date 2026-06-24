<template>
  <div class="theme-lab-view">
    <GameSurface
      tone="gold"
      padding="md"
      eyebrow="组件校准"
      title="按钮调试场"
      subtitle="只验证手机端比例、留白、禁用态和承载底板，不掺业务逻辑。"
    >
      <div class="lab-stack">
        <section class="lab-block">
          <div class="lab-heading">
            <strong>风格板验证</strong>
            <small>验证“水墨绢纸 + 漆金线 + 青灰雾”是否能承载按钮、卡片和提示系统。</small>
          </div>

          <div class="styleboard-stack">
            <article class="styleboard-card">
              <div class="styleboard-copy">
                <strong>按钮体系</strong>
                <small>主按钮、次按钮、禁用态、紧凑按钮、强调长按钮。</small>
              </div>
              <img :src="buttonStyleboard" alt="按钮风格板" class="styleboard-image" />
            </article>

            <article class="styleboard-card">
              <div class="styleboard-copy">
                <strong>卡片体系</strong>
                <small>故事卡、奇遇卡、栏目卡、信息条卡。</small>
              </div>
              <img :src="cardStyleboard" alt="卡片风格板" class="styleboard-image" />
            </article>

            <article class="styleboard-card">
              <div class="styleboard-copy">
                <strong>提示与公告</strong>
                <small>公告弹层、确认提示、说明 tooltip、通知横条。</small>
              </div>
              <img :src="panelStyleboard" alt="提示与公告风格板" class="styleboard-image" />
            </article>
          </div>
        </section>

        <section class="lab-block">
          <div class="lab-heading">
            <strong>牌匾按钮</strong>
            <small>目标：固定比例，不被父容器拉伸变形，并支持放缩。</small>
          </div>

          <div class="plaque-lane">
            <ThemePlaqueButton tone="gold" size="lg">
              <template #icon>
                <GameIcon icon="坐" :size="18" />
              </template>
              打坐修炼
            </ThemePlaqueButton>
          </div>

          <div class="plaque-lane">
            <ThemePlaqueButton tone="gold">
              <template #icon>
                <GameIcon icon="破" :size="18" />
              </template>
              突破境界
            </ThemePlaqueButton>
          </div>

          <div class="plaque-lane narrow">
            <ThemePlaqueButton tone="jade" size="sm">
              <template #icon>
                <GameIcon icon="装" :size="18" />
              </template>
              查看角色
            </ThemePlaqueButton>
          </div>

          <div class="plaque-lane">
            <ThemePlaqueButton tone="stone" disabled>
              <template #icon>
                <GameIcon icon="锁" :size="18" />
              </template>
              等待破境
            </ThemePlaqueButton>
          </div>
        </section>

        <section class="lab-block">
          <div class="lab-heading">
            <strong>长操作按钮</strong>
            <small>目标：全宽背景壳，文字不压边。</small>
          </div>

          <div class="action-stack">
            <GameActionButton block tone="gold" icon="Gift">领取离线修为</GameActionButton>
            <GameActionButton block tone="jade" icon="修">开始挂机</GameActionButton>
            <GameActionButton block tone="stone" disabled icon="锁">暂未解锁</GameActionButton>
          </div>
        </section>
      </div>
    </GameSurface>
  </div>
</template>

<script setup lang="ts">
import GameActionButton from '@/components/game-ui/GameActionButton.vue'
import GameIcon from '@/components/game-ui/GameIcon.vue'
import GameSurface from '@/components/game-ui/GameSurface.vue'
import ThemePlaqueButton from '@/components/theme/ThemePlaqueButton.vue'
import buttonStyleboard from '@/assets/theme/generated/styleboards/styleboard-buttons-v1.png'
import cardStyleboard from '@/assets/theme/generated/styleboards/styleboard-cards-v1.png'
import panelStyleboard from '@/assets/theme/generated/styleboards/styleboard-prompts-announcements-v1.png'
</script>

<style scoped>
.theme-lab-view {
  display: grid;
  gap: 12px;
}

.lab-stack {
  display: grid;
  gap: 16px;
}

.lab-block {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.72), rgba(246, 249, 244, 0.54)),
    radial-gradient(circle at top, rgba(255, 227, 152, 0.14), transparent 58%);
  border: 1px solid rgba(195, 158, 79, 0.14);
}

.lab-heading {
  display: grid;
  gap: 4px;
}

.lab-heading strong {
  color: #8b6226;
  font-size: 17px;
}

.lab-heading small {
  color: rgba(81, 98, 94, 0.72);
  font-size: 12px;
  line-height: 1.5;
}

.plaque-lane,
.action-stack,
.styleboard-stack {
  display: grid;
  gap: 10px;
}

.styleboard-stack {
  gap: 14px;
}

.styleboard-card {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 253, 248, 0.82), rgba(241, 246, 242, 0.72)),
    radial-gradient(circle at top left, rgba(216, 189, 121, 0.12), transparent 38%);
  border: 1px solid rgba(189, 153, 83, 0.16);
}

.styleboard-copy {
  display: grid;
  gap: 4px;
}

.styleboard-copy strong {
  color: #7d5b27;
  font-size: 15px;
}

.styleboard-copy small {
  color: rgba(79, 94, 90, 0.74);
  font-size: 12px;
  line-height: 1.5;
}

.styleboard-image {
  width: 100%;
  display: block;
  border-radius: 14px;
  border: 1px solid rgba(197, 180, 138, 0.24);
  box-shadow: 0 10px 24px rgba(87, 99, 96, 0.08);
}

.plaque-lane {
  justify-items: center;
  padding: 14px 12px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(251, 246, 248, 0.7), rgba(247, 243, 246, 0.5)),
    linear-gradient(90deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.12));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.34);
}

.plaque-lane.narrow {
  padding-inline: 24px;
}

@media (max-width: 720px) {
  .lab-block {
    padding: 12px;
  }

  .plaque-lane {
    padding: 12px 10px;
    border-radius: 22px;
  }
}
</style>
