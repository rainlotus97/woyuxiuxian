export interface StoryBusEvent<T = unknown> {
  type: string
  timestamp: number
  data: T
  nodeId?: string
  volumeNumber?: number
}

export type StoryEventCallback<T = unknown> = (event: StoryBusEvent<T>) => void | Promise<void>

interface StoryEventSubscription {
  id: string
  eventType: string | '*'
  callback: StoryEventCallback
  once: boolean
}

type StoryEventInput<T> = Omit<StoryBusEvent<T>, 'timestamp'>

export class StoryEventBus {
  private subscriptions = new Map<string, StoryEventSubscription>()
  private eventHistory: StoryBusEvent[] = []
  private readonly maxHistorySize: number

  constructor(maxHistorySize = 100) {
    this.maxHistorySize = Math.max(1, maxHistorySize)
  }

  on<T = unknown>(eventType: string | '*', callback: StoryEventCallback<T>): () => void {
    return this.subscribe(eventType, callback, false)
  }

  once<T = unknown>(eventType: string | '*', callback: StoryEventCallback<T>): () => void {
    return this.subscribe(eventType, callback, true)
  }

  off(subscriptionId: string): void
  off<T = unknown>(eventType: string | '*', callback: StoryEventCallback<T>): void
  off<T = unknown>(subscriptionOrType: string, callback?: StoryEventCallback<T>): void {
    if (!callback) {
      this.subscriptions.delete(subscriptionOrType)
      return
    }

    for (const [id, subscription] of this.subscriptions) {
      if (subscription.eventType === subscriptionOrType && subscription.callback === callback) {
        this.subscriptions.delete(id)
      }
    }
  }

  async emit<T = unknown>(event: StoryEventInput<T>): Promise<void> {
    const fullEvent = this.recordEvent(event)

    for (const [id, subscription] of this.subscriptions) {
      if (!this.matches(subscription, fullEvent.type)) continue
      if (subscription.once) this.subscriptions.delete(id)
      try {
        await subscription.callback(fullEvent)
      } catch (error) {
        console.error(`[StoryEventBus] Event handler failed for ${fullEvent.type}:`, error)
      }
    }
  }

  emitSync<T = unknown>(event: StoryEventInput<T>): void {
    const fullEvent = this.recordEvent(event)

    for (const [id, subscription] of this.subscriptions) {
      if (!this.matches(subscription, fullEvent.type)) continue
      if (subscription.once) this.subscriptions.delete(id)
      try {
        const result = subscription.callback(fullEvent)
        if (result instanceof Promise) {
          void result.catch(error => {
            console.error(`[StoryEventBus] Async event handler failed for ${fullEvent.type}:`, error)
          })
        }
      } catch (error) {
        console.error(`[StoryEventBus] Event handler failed for ${fullEvent.type}:`, error)
      }
    }
  }

  getHistory(eventType?: string): StoryBusEvent[] {
    const events = eventType
      ? this.eventHistory.filter(event => event.type === eventType)
      : this.eventHistory
    return events.map(event => ({ ...event }))
  }

  getRecentEvents(count = 10): StoryBusEvent[] {
    return this.eventHistory.slice(-Math.max(0, count)).map(event => ({ ...event }))
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size
  }

  hasSubscribers(eventType: string): boolean {
    return [...this.subscriptions.values()].some(subscription => this.matches(subscription, eventType))
  }

  clear(): void {
    this.subscriptions.clear()
    this.eventHistory = []
  }

  private subscribe<T>(eventType: string | '*', callback: StoryEventCallback<T>, once: boolean): () => void {
    const id = `story-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    this.subscriptions.set(id, {
      id,
      eventType,
      callback: callback as StoryEventCallback,
      once
    })
    return () => this.off(id)
  }

  private matches(subscription: StoryEventSubscription, eventType: string): boolean {
    return subscription.eventType === '*' || subscription.eventType === eventType
  }

  private recordEvent<T>(event: StoryEventInput<T>): StoryBusEvent<T> {
    const fullEvent: StoryBusEvent<T> = { ...event, timestamp: Date.now() }
    this.eventHistory.push(fullEvent)
    if (this.eventHistory.length > this.maxHistorySize) this.eventHistory.shift()
    return fullEvent
  }
}

export const storyEventBus = new StoryEventBus()
