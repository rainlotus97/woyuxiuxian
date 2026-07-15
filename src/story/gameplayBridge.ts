import { ref, type Ref } from 'vue'
import type {
  Effect,
  GameplayResult,
  GameplaySuspendState,
  GameplayTrigger,
  GameplayType
} from './types'
import { storyEventBus } from './eventBus'

type GameplayHandler = (trigger: GameplayTrigger) => GameplayResult | Promise<GameplayResult>

export interface GameplayCompletion {
  continueNodeId: string | null
  shouldRetry: boolean
  shouldSkip: boolean
}

function cloneTrigger(trigger: GameplayTrigger): GameplayTrigger {
  return {
    ...trigger,
    params: trigger.params ? { ...trigger.params } : undefined,
    context: trigger.context ? { ...trigger.context } : undefined,
    outcomeNodeIds: trigger.outcomeNodeIds ? { ...trigger.outcomeNodeIds } : undefined,
    completionCondition: trigger.completionCondition?.map(condition => ({ ...condition }))
  }
}

function unsupportedResult(trigger: GameplayTrigger): GameplayResult {
  return {
    success: false,
    gameplayType: trigger.type,
    targetId: trigger.targetId,
    data: {
      resultLabel: '玩法未就绪',
      text: '当前玩法处理器尚未接入，请重试或返回故事节点。',
      rewards: []
    }
  }
}

function resolveOutcomeKey(result: GameplayResult) {
  const battleResult = result.data?.battleResult
  if (battleResult === 'victory' || battleResult === 'defeat' || battleResult === 'fled') {
    return battleResult
  }
  return result.success ? 'success' : 'failure'
}

export class GameplayBridge {
  readonly isPlaying: Ref<boolean> = ref(false)
  readonly currentTrigger: Ref<GameplayTrigger | null> = ref(null)

  private handlers = new Map<GameplayType, GameplayHandler>()
  private suspendState: GameplaySuspendState | null = null
  private pendingExecution: Promise<GameplayResult> | null = null
  private resolvePendingExecution: ((result: GameplayResult) => void) | null = null

  registerHandler(gameplayType: GameplayType, handler: GameplayHandler): () => void {
    this.handlers.set(gameplayType, handler)
    return () => {
      if (this.handlers.get(gameplayType) === handler) this.handlers.delete(gameplayType)
    }
  }

  hasHandler(gameplayType: GameplayType): boolean {
    return this.handlers.has(gameplayType)
  }

  async trigger(trigger: GameplayTrigger, previousNodeId = ''): Promise<boolean> {
    if (!this.hasHandler(trigger.type)) return false

    this.currentTrigger.value = cloneTrigger(trigger)
    this.isPlaying.value = true
    this.suspendState = {
      type: 'gameplay',
      gameplayTrigger: cloneTrigger(trigger),
      previousNodeId,
      suspendedAt: Date.now(),
      retryCount: 0
    }
    await storyEventBus.emit({
      type: 'gameplay:trigger',
      data: { trigger: cloneTrigger(trigger), previousNodeId },
      nodeId: previousNodeId || undefined
    })
    return true
  }

  async execute(trigger?: GameplayTrigger): Promise<GameplayResult> {
    const activeTrigger = trigger ? cloneTrigger(trigger) : this.currentTrigger.value
    if (!activeTrigger) {
      return {
        success: false,
        gameplayType: 'custom',
        targetId: '',
        data: { resultLabel: '无法继续', text: '玩法上下文已经失效，请重新进入当前故事节点。' }
      }
    }

    const handler = this.handlers.get(activeTrigger.type)
    let result: GameplayResult
    try {
      result = handler ? await handler(cloneTrigger(activeTrigger)) : unsupportedResult(activeTrigger)
    } catch (error) {
      console.error(`[GameplayBridge] Failed to execute ${activeTrigger.type}:`, error)
      result = {
        success: false,
        gameplayType: activeTrigger.type,
        targetId: activeTrigger.targetId,
        data: { resultLabel: '执行失败', text: '玩法执行时发生错误，请稍后重试。' }
      }
    }

    await storyEventBus.emit({
      type: 'gameplay:complete',
      data: { result },
      nodeId: this.suspendState?.previousNodeId || undefined
    })
    return result
  }

  async onComplete(result: GameplayResult): Promise<GameplayCompletion> {
    const trigger = this.currentTrigger.value
    if (!trigger) return { continueNodeId: null, shouldRetry: false, shouldSkip: false }

    if (result.success) {
      const outcome = resolveOutcomeKey(result)
      const continueNodeId = trigger.outcomeNodeIds?.[outcome] ?? trigger.continueNodeId ?? null
      this.resetActiveState()
      return { continueNodeId, shouldRetry: false, shouldSkip: false }
    }

    const failureMode = trigger.onFailure ?? 'retry'
    if (failureMode === 'retry') {
      if (this.suspendState) this.suspendState.retryCount += 1
      return { continueNodeId: null, shouldRetry: true, shouldSkip: false }
    }
    if (failureMode === 'skip') {
      this.resetActiveState()
      return { continueNodeId: null, shouldRetry: false, shouldSkip: true }
    }
    if (failureMode === 'goto') {
      const outcome = resolveOutcomeKey(result)
      const continueNodeId = trigger.outcomeNodeIds?.[outcome] ?? trigger.failureNodeId ?? null
      this.resetActiveState()
      return { continueNodeId, shouldRetry: false, shouldSkip: false }
    }
    return { continueNodeId: null, shouldRetry: false, shouldSkip: false }
  }

  applyGameplayEffect(effect: Effect): boolean {
    storyEventBus.emitSync({
      type: 'effect:execute',
      data: { effect, context: null }
    })
    return true
  }

  consumePendingTrigger(): GameplayTrigger | null {
    const trigger = this.currentTrigger.value ? cloneTrigger(this.currentTrigger.value) : null
    this.clearPendingTrigger()
    return trigger
  }

  clearPendingTrigger(): void {
    this.currentTrigger.value = null
  }

  getSuspendState(): GameplaySuspendState | null {
    if (!this.suspendState) return null
    return {
      ...this.suspendState,
      gameplayTrigger: cloneTrigger(this.suspendState.gameplayTrigger)
    }
  }

  getCurrentGameplayType(): GameplayType | null {
    return this.currentTrigger.value?.type ?? null
  }

  getCurrentTargetId(): string | null {
    return this.currentTrigger.value?.targetId ?? null
  }

  getRetryCount(): number {
    return this.suspendState?.retryCount ?? 0
  }

  skip(): void {
    this.resetActiveState()
  }

  clear(): void {
    this.resetActiveState()
  }

  createPendingRouteResult(): Promise<GameplayResult> {
    if (this.pendingExecution) return this.pendingExecution
    this.pendingExecution = new Promise(resolve => {
      this.resolvePendingExecution = resolve
    })
    return this.pendingExecution
  }

  resolveRouteResult(result: GameplayResult): void {
    const resolve = this.resolvePendingExecution
    this.pendingExecution = null
    this.resolvePendingExecution = null
    resolve?.(result)
  }

  private resetActiveState(): void {
    this.isPlaying.value = false
    this.currentTrigger.value = null
    this.suspendState = null
    this.pendingExecution = null
    this.resolvePendingExecution = null
  }
}

export const gameplayBridge = new GameplayBridge()

export default gameplayBridge

export function applyGameplayEffect(effect: Effect): boolean {
  return gameplayBridge.applyGameplayEffect(effect)
}
