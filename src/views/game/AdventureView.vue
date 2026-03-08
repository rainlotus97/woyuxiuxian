<template>
  <div class="adventure-view">
    <!-- 体力值显示 -->
    <div class="stamina-bar">
      <div class="stamina-header">
        <span class="stamina-icon">⚡</span>
        <span class="stamina-text">体力</span>
        <span class="stamina-value">{{ playerStore.stamina }}/{{ playerStore.maxStamina }}</span>
      </div>
      <div class="stamina-progress">
        <div class="stamina-fill" :style="{ width: playerStore.staminaPercent + '%' }"></div>
      </div>
      <div class="stamina-info">
        <span v-if="playerStore.stamina < playerStore.maxStamina" class="recover-time">
          {{ Math.floor(playerStore.nextRecoverCountdown / 60) }}:{{ String(playerStore.nextRecoverCountdown % 60).padStart(2, '0') }} 后恢复+1
        </span>
        <span v-else class="stamina-full">已满</span>
        <button class="buy-stamina-btn" @click="showBuyStaminaModal = true">
          <span class="gem-icon">💎</span>
          购买
        </button>
      </div>
    </div>

    <!-- 区域列表 -->
    <div class="areas-list">
      <div
        v-for="area in areas"
        :key="area.id"
        class="area-card"
        :class="{
          locked: !isAreaUnlockedByPlayer(area),
          cleared: getAreaStars(area.id) > 0
        }"
      >
        <!-- 区域头部 -->
        <div class="area-header">
          <div class="area-icon">{{ area.icon }}</div>
          <div class="area-info">
            <div class="area-name">{{ area.name }}</div>
            <div class="area-realm" :style="{ color: getRealmColor(area.requiredRealm) }">
              {{ getRealmRequirementText(area.requiredRealm, area.requiredRealmLevel) }}
            </div>
          </div>
          <div class="area-difficulty" :style="{ color: getDifficultyColor(area.difficulty) }">
            {{ getDifficultyLabel(area.difficulty) }}
          </div>
        </div>

        <!-- 区域描述 -->
        <div class="area-desc">{{ area.description }}</div>

        <!-- 掉落预览 -->
        <div class="area-drops">
          <span class="drops-label">掉落:</span>
          <div class="drops-items">
            <span
              v-for="drop in area.drops.slice(0, 4)"
              :key="drop.id"
              class="drop-preview"
              :class="drop.quality"
              :title="drop.name"
            >
              {{ drop.icon }}
            </span>
            <span v-if="area.drops.length > 4" class="more-drops">+{{ area.drops.length - 4 }}</span>
          </div>
        </div>

        <!-- 星级评价 -->
        <div class="area-stars" v-if="getAreaStars(area.id) > 0">
          <span v-for="i in 3" :key="i" class="star" :class="{ filled: i <= getAreaStars(area.id) }">★</span>
        </div>

        <!-- 体力消耗和波次 -->
        <div class="area-meta">
          <div class="area-cost">
            <span class="cost-icon">⚡</span>
            <span class="cost-value">{{ area.staminaCost }}</span>
          </div>
          <div class="area-waves">
            <span class="waves-icon">🌊</span>
            <span class="waves-value">{{ getDifficultyWaves(area.difficulty) }}波</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="area-actions">
          <!-- 未解锁 -->
          <template v-if="!isAreaUnlockedByPlayer(area)">
            <button class="action-btn locked-btn" disabled>
              <span class="lock-icon">🔒</span>
              境界不足
            </button>
          </template>

          <!-- 已解锁未通关 -->
          <template v-else-if="getAreaStars(area.id) === 0">
            <button
              class="action-btn challenge-btn"
              :disabled="playerStore.stamina < area.staminaCost"
              @click="handleChallenge(area)"
            >
              <span class="btn-icon">⚔️</span>
              挑战
            </button>
          </template>

          <!-- 已通关 -->
          <template v-else>
            <button
              class="action-btn challenge-btn"
              :disabled="playerStore.stamina < area.staminaCost"
              @click="handleChallenge(area)"
            >
              <span class="btn-icon">⚔️</span>
              挑战
            </button>
            <button
              class="action-btn sweep-btn"
              :disabled="playerStore.stamina < area.staminaCost * 3"
              @click="handleSweep(area)"
            >
              <span class="btn-icon">🔄</span>
              扫荡x3
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 购买体力弹窗 -->
    <div v-if="showBuyStaminaModal" class="modal-overlay" @click.self="showBuyStaminaModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span class="modal-title">购买体力</span>
          <button class="modal-close" @click="showBuyStaminaModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="stamina-options">
            <div
              v-for="option in staminaBuyOptions"
              :key="option.amount"
              class="stamina-option"
              :class="{ disabled: playerStore.gold < option.cost || playerStore.stamina >= playerStore.maxStamina }"
              @click="handleBuyStamina(option)"
            >
              <div class="option-amount">
                <span class="option-icon">⚡</span>
                <span class="option-value">+{{ option.amount }}</span>
              </div>
              <div class="option-cost">
                <span class="cost-gem">💎</span>
                <span class="cost-value">{{ option.cost }}</span>
              </div>
            </div>
          </div>
          <div class="stamina-tip">
            <span>💡 体力每分钟自动恢复{{ playerStore.staminaRecoverRate }}点</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { useToast } from '@/composables/useToast'
import {
  AREAS,
  type AreaDefinition,
  type DropItem,
  getRealmRequirementText,
  isAreaUnlocked,
  rollDrops,
  rollReward,
  DIFFICULTY_CONFIG,
  REALM_PRIMARY_COLOR,
  type Realm
} from '@/types/adventure'

const router = useRouter()
const playerStore = usePlayerStore()
const { info, warning, success } = useToast()

const showBuyStaminaModal = ref(false)

// 体力购买选项
const staminaBuyOptions = [
  { amount: 20, cost: 50 },
  { amount: 50, cost: 100 },
  { amount: 100, cost: 180 }
]

// 定时器ID
let recoverTimer: number | null = null

// 获取区域列表
const areas = AREAS

// 获取境界颜色
function getRealmColor(realm: Realm): string {
  return REALM_PRIMARY_COLOR[realm] || '#7eb8da'
}

// 获取难度颜色
function getDifficultyColor(difficulty: string): string {
  return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.color || '#7eb8da'
}

// 获取难度标签
function getDifficultyLabel(difficulty: string): string {
  return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.label || difficulty
}

// 获取难度对应的波数
function getDifficultyWaves(difficulty: string): number {
  return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.waves || 1
}

// 检查区域是否解锁
function isAreaUnlockedByPlayer(area: AreaDefinition): boolean {
  return isAreaUnlocked(area, playerStore.realm, playerStore.realmLevel)
}

// 获取区域星级
function getAreaStars(areaId: string): number {
  const progress = playerStore.getAreaProgress(areaId)
  return progress?.stars ?? 0
}

// 挑战区域
function handleChallenge(area: AreaDefinition) {
  if (playerStore.stamina < area.staminaCost) {
    warning('体力不足！')
    return
  }

  // 消耗体力
  playerStore.consumeStamina(area.staminaCost)

  // 进入战斗
  router.push({
    path: '/game/battle',
    query: { areaId: area.id }
  })
}

// 扫荡区域（快速完成3次）
function handleSweep(area: AreaDefinition) {
  const sweepCost = area.staminaCost * 3
  if (playerStore.stamina < sweepCost) {
    warning('体力不足！需要' + sweepCost + '点体力')
    return
  }

  // 消耗体力
  playerStore.consumeStamina(sweepCost)

  // 计算扫荡奖励
  let totalExp = 0
  let totalGold = 0
  const allDrops: Map<string, { item: DropItem; quantity: number }> = new Map()

  for (let i = 0; i < 3; i++) {
    // 经验和灵石
    totalExp += rollReward(area.expReward)
    totalGold += rollReward(area.goldReward)

    // 掉落物品
    const drops = rollDrops(area.drops)
    for (const drop of drops) {
      const existing = allDrops.get(drop.item.id)
      if (existing) {
        existing.quantity += drop.quantity
      } else {
        allDrops.set(drop.item.id, { item: drop.item, quantity: drop.quantity })
      }
    }
  }

  // 发放奖励
  playerStore.addCultivation(totalExp)
  playerStore.addGold(totalGold)

  // 添加掉落物品到背包
  const dropMessages: string[] = []
  for (const [, drop] of allDrops) {
    const added = playerStore.addToInventory({
      id: `drop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: drop.item.name,
      icon: drop.item.icon,
      type: drop.item.type === 'equipment' ? 'equipment' : 'material',
      quality: drop.item.quality,
      quantity: drop.quantity,
      description: drop.item.description
    })
    if (added) {
      dropMessages.push(`${drop.item.icon}${drop.item.name} x${drop.quantity}`)
    }
  }

  // 更新通关记录
  const progress = playerStore.getAreaProgress(area.id)
  if (progress) {
    playerStore.updateAreaProgress(area.id, {
      clearCount: progress.clearCount + 3,
      stars: Math.max(progress.stars, 1) // 扫荡至少给1星
    })
  }

  // 显示结果
  success(`扫荡完成！获得 ${totalExp} 修为, ${totalGold} 灵石`)
  if (dropMessages.length > 0) {
    info('获得物品: ' + dropMessages.slice(0, 3).join(', ') + (dropMessages.length > 3 ? '...' : ''))
  }
}

// 购买体力
function handleBuyStamina(option: { amount: number; cost: number }) {
  const result = playerStore.buyStamina(option.cost, option.amount)
  if (result.success) {
    success(result.message)
    showBuyStaminaModal.value = false
  } else {
    warning(result.message)
  }
}

// 启动体力恢复定时器
onMounted(() => {
  // 每秒检查体力恢复
  recoverTimer = window.setInterval(() => {
    playerStore.recoverStamina()
  }, 1000)
})

onUnmounted(() => {
  if (recoverTimer) {
    clearInterval(recoverTimer)
  }
})
</script>

<style scoped>
.adventure-view {
  padding-bottom: 16px;
}

/* 体力值条 */
.stamina-bar {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.stamina-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.stamina-icon {
  font-size: 1rem;
}

.stamina-text {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.stamina-value {
  color: rgb(232 228 217);
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: auto;
}

.stamina-progress {
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.stamina-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stamina-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.recover-time {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.stamina-full {
  font-size: 0.6875rem;
  color: #4ade80;
}

.buy-stamina-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 12px;
  color: #fbbf24;
  font-size: 0.6875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.buy-stamina-btn:active {
  transform: scale(0.95);
}

.gem-icon {
  font-size: 0.75rem;
}

/* 区域列表 */
.areas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.area-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.2);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.15s ease;
}

.area-card.locked {
  opacity: 0.6;
}

.area-card.cleared {
  border-color: rgba(74, 222, 128, 0.3);
}

.area-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.area-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(126, 184, 218, 0.1);
  border-radius: 8px;
}

.area-info {
  flex: 1;
}

.area-name {
  font-size: 0.9375rem;
  color: rgb(232 228 217);
  font-weight: 500;
}

.area-realm {
  font-size: 0.6875rem;
  margin-top: 2px;
}

.area-difficulty {
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.area-desc {
  font-size: 0.6875rem;
  color: var(--color-muted);
  margin-bottom: 8px;
  line-height: 1.4;
}

.area-drops {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.drops-label {
  font-size: 0.625rem;
  color: var(--color-muted);
}

.drops-items {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.drop-preview {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.drop-preview.common { border: 1px solid #9ca3af; }
.drop-preview.fine { border: 1px solid #4ade80; }
.drop-preview.rare { border: 1px solid #7eb8da; }
.drop-preview.epic { border: 1px solid #a78bfa; }
.drop-preview.legendary { border: 1px solid #fbbf24; }

.more-drops {
  font-size: 0.5625rem;
  color: var(--color-muted);
  display: flex;
  align-items: center;
}

.area-stars {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
}

.star {
  font-size: 0.75rem;
  color: rgba(251, 191, 36, 0.3);
}

.star.filled {
  color: #fbbf24;
}

.area-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.area-cost,
.area-waves {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.cost-icon,
.waves-icon {
  font-size: 0.75rem;
}

.area-waves {
  color: #60a5fa;
}

.area-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.challenge-btn {
  background: rgba(126, 184, 218, 0.2);
  border: 1px solid rgba(126, 184, 218, 0.4);
  color: #7eb8da;
}

.challenge-btn:not(:disabled):active {
  transform: scale(0.98);
  background: rgba(126, 184, 218, 0.3);
}

.sweep-btn {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.sweep-btn:not(:disabled):active {
  transform: scale(0.98);
  background: rgba(74, 222, 128, 0.3);
}

.locked-btn {
  background: rgba(107, 114, 128, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.4);
  color: #6b7280;
}

.btn-icon {
  font-size: 0.875rem;
}

.lock-icon {
  font-size: 0.875rem;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(180deg, rgba(35, 38, 52, 0.98) 0%, rgba(25, 27, 38, 0.98) 100%);
  border: 1px solid rgba(200, 164, 92, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 320px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(126, 184, 218, 0.15);
}

.modal-title {
  font-size: 1rem;
  color: var(--color-accent-warm);
  font-weight: 500;
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--color-muted);
  font-size: 1.125rem;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.stamina-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stamina-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.stamina-option:not(.disabled):active {
  transform: scale(0.98);
  background: rgba(251, 191, 36, 0.1);
}

.stamina-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-amount {
  display: flex;
  align-items: center;
  gap: 6px;
}

.option-icon {
  font-size: 1rem;
}

.option-value {
  font-size: 0.9375rem;
  color: #fbbf24;
  font-weight: 500;
}

.option-cost {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cost-gem {
  font-size: 0.875rem;
}

.stamina-tip {
  margin-top: 14px;
  padding: 10px;
  background: rgba(126, 184, 218, 0.1);
  border-radius: 8px;
  font-size: 0.6875rem;
  color: var(--color-muted);
  text-align: center;
}

/* 横屏适配 */
@media (max-height: 500px) and (orientation: landscape) {
  .stamina-bar {
    padding: 8px;
    margin-bottom: 10px;
  }

  .stamina-header {
    margin-bottom: 4px;
  }

  .areas-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .area-card {
    padding: 8px;
  }

  .area-header {
    margin-bottom: 4px;
  }

  .area-icon {
    width: 32px;
    height: 32px;
    font-size: 1.125rem;
  }

  .area-name {
    font-size: 0.8125rem;
  }

  .area-desc {
    display: none;
  }

  .area-drops {
    margin-bottom: 6px;
  }

  .area-cost {
    margin-bottom: 6px;
  }

  .action-btn {
    padding: 6px 8px;
    font-size: 0.6875rem;
  }
}
</style>
