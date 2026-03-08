/**
 * 卷加载器
 * 按需加载故事卷内容
 */

import { storyParser } from '../parser'
import { storyCache } from './cacheManager'
import type { Perspective, VolumeContent, StoryNode, CharacterEvent, TriggerRule } from '../types'

// 故事文件路径映射
const STORY_PATHS = {
  male: 'main.md',
  female: 'female.md',
  common: 'common.md',
}

export class VolumeLoader {
  private loadedVolumes = new Set<number>()
  private currentVolume = 0

  /**
   * 加载指定卷的所有内容
   */
  async loadVolume(volume: number, perspective: Perspective): Promise<VolumeContent> {
    if (this.currentVolume !== volume) {
      this.currentVolume = volume
    }

    const mainNodes = await this.loadMainStory(volume, perspective)
    const commonNodes = await this.loadCommonStory(volume)
    const triggerRules = await this.loadTriggerRules(volume)
    const characterEvents = await this.loadCharacterEvents(volume, triggerRules)

    this.loadedVolumes.add(volume)

    return {
      mainNodes,
      commonNodes,
      characterEvents,
      triggerRules,
    }
  }

  /**
   * 加载主线故事
   */
  private async loadMainStory(volume: number, perspective: Perspective): Promise<StoryNode[]> {
    try {
      const filename = STORY_PATHS[perspective] || STORY_PATHS.male
      const content = await this.readStoryFile(`volume-${volume}/${filename}`)

      if (!content) {
        console.warn(`No main story file found for volume ${volume}`)
        return []
      }

      const nodes = storyParser.parseMainStory(content)
      storyCache.cacheNodes(nodes, volume)

      console.log(`Loaded ${nodes.length} main story nodes for volume ${volume}`)
      return nodes
    } catch (error) {
      console.error(`Failed to load main story for volume ${volume}:`, error)
      return []
    }
  }

  /**
   * 加载共同事件
   */
  private async loadCommonStory(volume: number): Promise<StoryNode[]> {
    try {
      const content = await this.readStoryFile(`volume-${volume}/common.md`)

      if (!content) {
        return []
      }

      const nodes = storyParser.parseCommonStory(content)
      storyCache.cacheNodes(nodes, volume)

      return nodes
    } catch (error) {
      console.error(`Failed to load common story for volume ${volume}:`, error)
      return []
    }
  }

  /**
   * 加载触发规则表
   */
  private async loadTriggerRules(volume: number): Promise<TriggerRule[]> {
    try {
      const content = await this.readStoryFile(`links/link-volume-${volume}.md`)

      if (!content) {
        return []
      }

      const rules = storyParser.parseTriggerTable(content)
      storyCache.cacheTriggerRules(rules, volume)

      return rules
    } catch (error) {
      console.error(`Failed to load trigger rules for volume ${volume}:`, error)
      return []
    }
  }

  /**
   * 加载角色事件
   */
  private async loadCharacterEvents(
    volume: number,
    triggerRules: TriggerRule[]
  ): Promise<CharacterEvent[]> {
    const characterIds = new Set<string>()

    for (const rule of triggerRules) {
      if (rule.characterId) {
        characterIds.add(rule.characterId)
      }
    }

    const allEvents: CharacterEvent[] = []

    for (const characterId of characterIds) {
      const events = await this.loadCharacterFile(characterId, volume)
      allEvents.push(...events)
    }

    return allEvents
  }

  /**
   * 加载单个角色文件
   */
  private async loadCharacterFile(characterId: string, volume: number): Promise<CharacterEvent[]> {
    try {
      const content = await this.readStoryFile(`characters/char-${characterId.replace('C', '')}.md`)

      if (!content) {
        return []
      }

      const { events } = storyParser.parseCharacterStory(content)
      storyCache.cacheEvents(events, volume)

      return events
    } catch (error) {
      console.error(`Failed to load character file ${characterId}:`, error)
      return []
    }
  }

  /**
   * 读取故事文件
   */
  private async readStoryFile(relativePath: string): Promise<string | null> {
    try {
      // 使用 Vite 的 raw 导入
      const modules = import.meta.glob('/src/assets/story/**/*.md', { query: '?raw', eager: false })
      const fullPath = `/src/assets/story/${relativePath}`
      const loader = modules[fullPath]

      if (loader) {
        const module = await loader() as { default: string }
        return module.default || module as unknown as string
      }
      return null
    } catch (error) {
      console.error(`Failed to read story file ${relativePath}:`, error)
      return null
    }
  }

  /**
   * 卸载指定卷
   */
  unloadVolume(volume: number): void {
    if (!this.loadedVolumes.has(volume)) return
    storyCache.clearVolume(volume)
    this.loadedVolumes.delete(volume)
  }

  getLoadedVolumes(): number[] {
    return Array.from(this.loadedVolumes)
  }

  isVolumeLoaded(volume: number): boolean {
    return this.loadedVolumes.has(volume)
  }
}

// 导出单例
export const volumeLoader = new VolumeLoader()
