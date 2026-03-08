/**
 * 故事缓存管理器
 */

import type { StoryNode, CharacterEvent, CharacterInfo, TriggerRule, Perspective } from '../types'

interface CacheEntry<T> {
  data: T
  lastAccessed: number
  volume: number
}

export class StoryCacheManager {
  private nodeCache = new Map<string, CacheEntry<StoryNode>>()
  private eventCache = new Map<string, CacheEntry<CharacterEvent>>()
  private characterInfoCache = new Map<string, CacheEntry<CharacterInfo>>()
  private triggerRuleCache = new Map<number, CacheEntry<TriggerRule[]>>()

  private maxCacheSize = 200
  private maxInactiveTime = 30 * 60 * 1000 // 30分钟

  // ============ 节点缓存 ============

  cacheNode(node: StoryNode, volume: number): void {
    this.nodeCache.set(node.id, {
      data: node,
      lastAccessed: Date.now(),
      volume,
    })
    this.pruneIfNeeded()
  }

  cacheNodes(nodes: StoryNode[], volume: number): void {
    for (const node of nodes) {
      this.cacheNode(node, volume)
    }
  }

  // 批量获取节点（用于导航）
  getNodes(ids: string[]): StoryNode[] {
    return ids
      .map(id => this.getNode(id))
      .filter((n): n is StoryNode => n !== null)
  }

  // 按卷获取节点
  getNodesByVolume(volume: number): StoryNode[] {
    return Array.from(this.nodeCache.values())
      .filter(entry => entry.volume === volume)
      .map(entry => entry.data)
  }

  // 获取起始节点
  getStartNode(perspective: Perspective, volume: number): StoryNode | null {
    const prefix = perspective === 'male' ? 'V' + volume + 'M' : 'V' + volume + 'F'
    // 查找以该前缀开头的最小序号节点
    const nodes = this.getNodesByVolume(volume)
    const startNode = nodes.find(n =>
      n.id.startsWith(prefix) &&
      n.id.endsWith('01')
    )
    return startNode || null
  }

  getNode(id: string): StoryNode | null {
    const entry = this.nodeCache.get(id)
    if (entry) {
      entry.lastAccessed = Date.now()
      return entry.data
    }
    return null
  }

  getAllNodes(): StoryNode[] {
    return Array.from(this.nodeCache.values()).map(entry => entry.data)
  }

  hasNode(id: string): boolean {
    return this.nodeCache.has(id)
  }

  // ============ 事件缓存 ============

  cacheEvent(event: CharacterEvent, volume: number): void {
    this.eventCache.set(event.id, {
      data: event,
      lastAccessed: Date.now(),
      volume
    })
  }

  cacheEvents(events: CharacterEvent[], volume: number): void {
    for (const event of events) {
      this.cacheEvent(event, volume)
    }
  }

  getEvent(id: string): CharacterEvent | null {
    const entry = this.eventCache.get(id)
    if (entry) {
      entry.lastAccessed = Date.now()
      return entry.data
    }
    return null
  }

  getAllEvents(): CharacterEvent[] {
    return Array.from(this.eventCache.values()).map(entry => entry.data)
  }

  // ============ 角色信息缓存 ============

  cacheCharacterInfo(info: CharacterInfo, volume: number): void {
    this.characterInfoCache.set(info.id, {
      data: info,
      lastAccessed: Date.now(),
      volume
    })
  }

  getCharacterInfo(id: string): CharacterInfo | null {
    const entry = this.characterInfoCache.get(id)
    if (entry) {
      entry.lastAccessed = Date.now()
      return entry.data
    }
    return null
  }

  getAllCharacterInfos(): CharacterInfo[] {
    return Array.from(this.characterInfoCache.values()).map(entry => entry.data)
  }

  // ============ 触发规则缓存 ============

  cacheTriggerRules(rules: TriggerRule[], volume: number): void {
    this.triggerRuleCache.set(volume, {
      data: rules,
      lastAccessed: Date.now(),
      volume
    })
  }

  getTriggerRules(volume: number): TriggerRule[] | null {
    const entry = this.triggerRuleCache.get(volume)
    if (entry) {
      entry.lastAccessed = Date.now()
      return entry.data
    }
    return null
  }

  // ============ 卷管理 ============

  clearVolume(volume: number): void {
    // 清理指定卷的节点
    for (const [id, entry] of this.nodeCache.entries()) {
      if (entry.volume === volume) {
        this.nodeCache.delete(id)
      }
    }
    // 清理指定卷的事件
    for (const [id, entry] of this.eventCache.entries()) {
      if (entry.volume === volume) {
        this.eventCache.delete(id)
      }
    }
    // 清理触发规则
    this.triggerRuleCache.delete(volume)
  }

  clearAll(): void {
    this.nodeCache.clear()
    this.eventCache.clear()
    this.characterInfoCache.clear()
    this.triggerRuleCache.clear()
  }

  // ============ 内存管理 ============

  private pruneIfNeeded(): void {
    if (this.nodeCache.size > this.maxCacheSize) {
      const entries = Array.from(this.nodeCache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize)
      for (const [id] of toDelete) {
        this.nodeCache.delete(id)
      }
    }
  }

  pruneInactive(): void {
    const now = Date.now()
    for (const [id, entry] of this.nodeCache.entries()) {
      if (now - entry.lastAccessed > this.maxInactiveTime) {
        this.nodeCache.delete(id)
      }
    }
    for (const [id, entry] of this.eventCache.entries()) {
      if (now - entry.lastAccessed > this.maxInactiveTime) {
        this.eventCache.delete(id)
      }
    }
  }

  // ============ 统计 ============

  getStats() {
    return {
      nodeCount: this.nodeCache.size,
      eventCount: this.eventCache.size,
      characterCount: this.characterInfoCache.size,
      ruleCount: this.triggerRuleCache.size,
    }
  }
}

// 导出单例
export const storyCache = new StoryCacheManager()
