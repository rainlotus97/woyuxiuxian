/**
 * 游戏玩法桥接器
 * 负责故事与游戏玩法之间的状态转换和通信
 */
import { ref, type Ref } from 'vue'
import type {
  GameplayType,
  GameplayTrigger,
  GameplayResult,
  GameplaySuspendState
} from './types'
import { storyEventBus } from './eventBus'
import {
  clearRouteGameplaySession,
  createRouteGameplaySession,
  getRouteGameplaySession
} from './runtime/routeGameplaySession'

/** 玩法处理器类型 */
type GameplayHandler = (trigger: GameplayTrigger) => Promise<GameplayResult>

export class GameplayBridge {
  /** 当前是否有玩法正在进行 */
  isPlaying: Ref<boolean> = ref(false)

  /** 当前玩法触发配置 */
  currentTrigger: Ref<GameplayTrigger | null> = ref(null)

  /** 玩法处理器注册表 */
  private handlers: Map<string, GameplayHandler> = new Map()

  /** 暂停状态 */
  private suspendState: GameplaySuspendState | null = null
  /** 当前路由型玩法的挂起执行 */
  private pendingExecution: Promise<GameplayResult> | null = null
  private resolvePendingExecution: ((result: GameplayResult) => void) | null = null

  /**
   * 注册玩法处理器
   * @param gameplayType 玩法类型
   * @param handler 处理器函数
   * @returns 取消注册函数
   */
  registerHandler(gameplayType: GameplayType | string, handler: GameplayHandler): () => void {
    this.handlers.set(gameplayType, handler)
    console.log(`[GameplayBridge] Registered handler for gameplay type: ${gameplayType}`)
    return () => {
      this.handlers.delete(gameplayType)
      console.log(`[GameplayBridge] Unregistered handler for gameplay type: ${gameplayType}`)
    }
  }

  /**
   * 检查是否有处理器
   * @param gameplayType 玩法类型
   */
  hasHandler(gameplayType: GameplayType | string): boolean {
    return this.handlers.has(gameplayType)
  }

  /**
   * 触发玩法
   * @param trigger 玩法触发配置
   * @param previousNodeId 之前的节点ID
   * @returns 是否成功触发
   */
  async trigger(
    trigger: GameplayTrigger,
    previousNodeId: string
  ): Promise<boolean> {
    const handler = this.handlers.get(trigger.type)
    if (!handler) {
      console.error(`[GameplayBridge] No handler registered for gameplay type: ${trigger.type}`)
      // 没有处理器时，显示通用提示
      return false
    }

    // 设置状态
    this.isPlaying.value = true
    this.currentTrigger.value = trigger

    // 保存暂停状态
    this.suspendState = {
      type: 'gameplay',
      gameplayTrigger: trigger,
      previousNodeId,
      suspendedAt: Date.now(),
      retryCount: 0
    }

    if (trigger.type === 'battle') {
      createRouteGameplaySession({
        gameplayType: trigger.type,
        trigger,
        previousNodeId,
        returnPath: '/game/story'
      })
    }

    // 发射事件
    await storyEventBus.emit({
      type: 'gameplay:trigger',
      data: { trigger, previousNodeId },
      nodeId: previousNodeId
    })

    console.log(`[GameplayBridge] Triggered gameplay: ${trigger.type} - ${trigger.targetId}`)
    return true
  }

  /**
   * 执行玩法（由外部调用，如UI组件）
   */
  async execute(): Promise<GameplayResult> {
    if (!this.currentTrigger.value || !this.suspendState) {
      return { success: false, gameplayType: 'custom', targetId: '' }
    }

    const handler = this.handlers.get(this.currentTrigger.value.type)
    if (!handler) {
      console.error(`[GameplayBridge] No handler for ${this.currentTrigger.value.type}`)
      return {
        success: false,
        gameplayType: this.currentTrigger.value.type,
        targetId: this.currentTrigger.value.targetId
      }
    }

    try {
      const result = await handler(this.currentTrigger.value)

      // 发射完成事件
      await storyEventBus.emit({
        type: 'gameplay:complete',
        data: { result },
        nodeId: this.suspendState.previousNodeId
      })

      return result
    } catch (error) {
      console.error('[GameplayBridge] Error executing gameplay:', error)
      return {
        success: false,
        gameplayType: this.currentTrigger.value.type,
        targetId: this.currentTrigger.value.targetId
      }
    }
  }

  /**
   * 玩法完成回调
   * @param result 玩法结果
   * @returns 继续信息
   */
  async onComplete(result: GameplayResult): Promise<{
    continueNodeId: string | null
    shouldRetry: boolean
    shouldSkip: boolean
  }> {
    if (!this.suspendState || !this.currentTrigger.value) {
      return { continueNodeId: null, shouldRetry: false, shouldSkip: false }
    }

    const trigger = this.currentTrigger.value

    // 成功
    if (result.success) {
      this.isPlaying.value = false
      this.currentTrigger.value = null

      const continueNodeId = trigger.continueNodeId || null
      this.suspendState = null

      console.log(`[GameplayBridge] Gameplay completed successfully, continuing to: ${continueNodeId || 'current node'}`)

      return { continueNodeId, shouldRetry: false, shouldSkip: false }
    }

    // 失败处理
    const onFailure = trigger.onFailure || 'retry'

    switch (onFailure) {
      case 'retry':
        this.suspendState.retryCount++
        console.log(`[GameplayBridge] Gameplay failed, retrying (attempt ${this.suspendState.retryCount})`)
        return { continueNodeId: null, shouldRetry: true, shouldSkip: false }

      case 'skip':
        this.isPlaying.value = false
        this.currentTrigger.value = null
        this.suspendState = null
        this.pendingExecution = null
        this.resolvePendingExecution = null
        clearRouteGameplaySession()
        console.log('[GameplayBridge] Gameplay failed, skipping')
        return { continueNodeId: null, shouldRetry: false, shouldSkip: true }

      case 'gameover':
        // 触发游戏结束
        console.log('[GameplayBridge] Gameplay failed, game over')
        return { continueNodeId: null, shouldRetry: false, shouldSkip: false }

      case 'goto':
        this.isPlaying.value = false
        this.currentTrigger.value = null
        const failureNodeId = trigger.failureNodeId || null
        this.suspendState = null
        this.pendingExecution = null
        this.resolvePendingExecution = null
        clearRouteGameplaySession()
        console.log(`[GameplayBridge] Gameplay failed, going to: ${failureNodeId}`)
        return { continueNodeId: failureNodeId, shouldRetry: false, shouldSkip: false }

      default:
        return { continueNodeId: null, shouldRetry: false, shouldSkip: false }
    }
  }

  /**
   * 获取暂停状态
   */
  getSuspendState(): GameplaySuspendState | null {
    if (this.suspendState) return this.suspendState

    const routeSession = getRouteGameplaySession()
    if (!routeSession || routeSession.status !== 'pending') return null

    return {
      type: 'gameplay',
      gameplayTrigger: routeSession.trigger,
      previousNodeId: routeSession.previousNodeId,
      suspendedAt: routeSession.createdAt,
      retryCount: 0
    }
  }

  /**
   * 获取当前玩法类型
   */
  getCurrentGameplayType(): GameplayType | string | null {
    return this.currentTrigger.value?.type || null
  }

  /**
   * 获取当前玩法目标ID
   */
  getCurrentTargetId(): string | null {
    return this.currentTrigger.value?.targetId || null
  }

  /**
   * 获取重试次数
   */
  getRetryCount(): number {
    return this.suspendState?.retryCount || 0
  }

  /**
   * 手动跳过当前玩法
   */
  skip(): void {
    if (this.isPlaying.value) {
      this.isPlaying.value = false
      this.currentTrigger.value = null
      this.suspendState = null
      this.pendingExecution = null
      this.resolvePendingExecution = null
      clearRouteGameplaySession()
      console.log('[GameplayBridge] Gameplay skipped manually')
    }
  }

  /**
   * 清除状态
   */
  clear(): void {
    this.isPlaying.value = false
    this.currentTrigger.value = null
    this.suspendState = null
    this.pendingExecution = null
    this.resolvePendingExecution = null
    clearRouteGameplaySession()
  }

  createPendingRouteResult(): Promise<GameplayResult> {
    if (this.pendingExecution) return this.pendingExecution

    this.pendingExecution = new Promise<GameplayResult>(resolve => {
      this.resolvePendingExecution = resolve
    })

    return this.pendingExecution
  }

  async resolveRouteResult(result: GameplayResult): Promise<void> {
    if (!this.resolvePendingExecution) return

    const resolve = this.resolvePendingExecution
    this.resolvePendingExecution = null
    this.pendingExecution = null
    resolve(result)
  }
}

// 导出单例实例
export const gameplayBridge = new GameplayBridge()
