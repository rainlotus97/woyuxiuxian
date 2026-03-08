/**
 * 故事事件总线
 * 提供事件订阅、发布和历史记录功能
 */
import type { StoryEventType, StoryEvent, StoryEventCallback, StoryEventSubscription } from './types'

export class StoryEventBus {
  private subscriptions: Map<string, StoryEventSubscription> = new Map()
  private eventHistory: StoryEvent[] = []
  private maxHistorySize = 100

  /**
   * 订阅事件
   * @param eventType 事件类型，'*' 表示订阅所有事件
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  on<T = unknown>(
    eventType: StoryEventType | '*',
    callback: StoryEventCallback<T>
  ): () => void {
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const subscription: StoryEventSubscription = {
      id,
      eventType,
      callback: callback as StoryEventCallback,
      once: false
    }
    this.subscriptions.set(id, subscription)

    // 返回取消订阅函数
    return () => this.off(id)
  }

  /**
   * 订阅一次性事件
   * @param eventType 事件类型
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  once<T = unknown>(
    eventType: StoryEventType | '*',
    callback: StoryEventCallback<T>
  ): () => void {
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const subscription: StoryEventSubscription = {
      id,
      eventType,
      callback: callback as StoryEventCallback,
      once: true
    }
    this.subscriptions.set(id, subscription)

    return () => this.off(id)
  }

  /**
   * 取消订阅
   * @param subscriptionId 订阅ID
   */
  off(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId)
  }

  /**
   * 发射事件
   * @param event 事件数据（不含时间戳）
   */
  async emit<T = unknown>(event: Omit<StoryEvent<T>, 'timestamp'>): Promise<void> {
    const fullEvent: StoryEvent<T> = {
      ...event,
      timestamp: Date.now()
    }

    // 记录历史
    this.eventHistory.push(fullEvent)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // 通知订阅者
    const toRemove: string[] = []

    for (const [id, subscription] of this.subscriptions) {
      const matches = subscription.eventType === '*' ||
        subscription.eventType === event.type

      if (matches) {
        try {
          await subscription.callback(fullEvent)
        } catch (error) {
          console.error(`[StoryEventBus] Error in callback for ${event.type}:`, error)
        }

        if (subscription.once) {
          toRemove.push(id)
        }
      }
    }

    // 移除一次性订阅
    for (const id of toRemove) {
      this.subscriptions.delete(id)
    }
  }

  /**
   * 同步发射事件（不等待回调）
   * @param event 事件数据
   */
  emitSync<T = unknown>(event: Omit<StoryEvent<T>, 'timestamp'>): void {
    const fullEvent: StoryEvent<T> = {
      ...event,
      timestamp: Date.now()
    }

    // 记录历史
    this.eventHistory.push(fullEvent)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // 通知订阅者（同步）
    const toRemove: string[] = []

    for (const [id, subscription] of this.subscriptions) {
      const matches = subscription.eventType === '*' ||
        subscription.eventType === event.type

      if (matches) {
        try {
          const result = subscription.callback(fullEvent)
          // 处理可能的 Promise 返回
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`[StoryEventBus] Error in async callback for ${event.type}:`, error)
            })
          }
        } catch (error) {
          console.error(`[StoryEventBus] Error in callback for ${event.type}:`, error)
        }

        if (subscription.once) {
          toRemove.push(id)
        }
      }
    }

    // 移除一次性订阅
    for (const id of toRemove) {
      this.subscriptions.delete(id)
    }
  }

  /**
   * 获取事件历史
   * @param eventType 可选，筛选特定类型的事件
   */
  getHistory(eventType?: StoryEventType): StoryEvent[] {
    if (eventType) {
      return this.eventHistory.filter(e => e.type === eventType)
    }
    return [...this.eventHistory]
  }

  /**
   * 获取最近的事件
   * @param count 数量
   */
  getRecentEvents(count: number = 10): StoryEvent[] {
    return this.eventHistory.slice(-count)
  }

  /**
   * 清除所有订阅和历史
   */
  clear(): void {
    this.subscriptions.clear()
    this.eventHistory = []
  }

  /**
   * 获取订阅数量
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size
  }

  /**
   * 检查是否有订阅者
   * @param eventType 事件类型
   */
  hasSubscribers(eventType: StoryEventType): boolean {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.eventType === '*' || subscription.eventType === eventType) {
        return true
      }
    }
    return false
  }
}

// 导出单例实例
export const storyEventBus = new StoryEventBus()
