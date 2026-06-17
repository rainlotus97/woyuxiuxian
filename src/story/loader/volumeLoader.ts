/**
 * 卷加载器
 * 按需加载故事卷内容
 */

import { storyParser } from '../parser'
import { storyCache } from './cacheManager'
import type {
  CharacterEvent,
  CharacterInfo,
  Perspective,
  StoryManifestFile,
  StoryNode,
  TriggerRule,
  VolumeContent
} from '../types'
import { normalizeCharacterFileId } from '../parser/shared'

// 故事文件路径映射
const STORY_PATHS = {
  male: 'main.md',
  female: 'female.md',
  common: 'common.md',
}

export class VolumeLoader {
  private loadedVolumes = new Set<number>()
  private currentVolume = 0

  private cacheVolumeContent(
    volume: number,
    mainNodes: StoryNode[],
    commonNodes: StoryNode[],
    triggerRules: TriggerRule[],
    characterInfos: CharacterInfo[],
    characterEvents: CharacterEvent[]
  ) {
    storyCache.clearVolume(volume)
    storyCache.cacheNodes(mainNodes, volume)
    storyCache.cacheNodes(commonNodes, volume)
    storyCache.cacheTriggerRules(triggerRules, volume)
    storyCache.cacheCharacterInfos(characterInfos, volume)
    storyCache.cacheEvents(characterEvents, volume)
  }

  /**
   * 加载指定卷的所有内容
   */
  async loadVolume(volume: number, perspective: Perspective): Promise<VolumeContent> {
    if (this.currentVolume !== volume) {
      this.currentVolume = volume
    }

    const mainStory = await this.loadMainStory(volume, perspective)
    const commonStory = await this.loadCommonStory(volume)
    const triggerRuleResult = await this.loadTriggerRules(volume)
    const characterResult = await this.loadCharacterEvents(volume, triggerRuleResult.rules)

    const manifestFiles: StoryManifestFile[] = [
      { path: `volume-${volume}/${STORY_PATHS[perspective] || STORY_PATHS.male}`, kind: 'main', ids: mainStory.nodes.map(node => node.id) },
      { path: `volume-${volume}/common.md`, kind: 'common', ids: commonStory.nodes.map(node => node.id) },
      { path: `links/link-volume-${volume}.md`, kind: 'link', ids: triggerRuleResult.rules.map(rule => rule.eventId) },
      ...characterResult.files
    ]

    const manifest = storyParser.buildManifest({
      volume,
      perspective,
      files: manifestFiles,
      mainNodes: mainStory.nodes,
      commonNodes: commonStory.nodes,
      characterInfos: characterResult.characterInfos,
      characterEvents: characterResult.events,
      triggerRules: triggerRuleResult.rules,
    })

    if (manifest.hasErrors) {
      console.error(`Story manifest validation failed for volume ${volume}`, manifest.diagnostics)
      throw new Error(`Story manifest validation failed for volume ${volume}`)
    }

    this.cacheVolumeContent(
      volume,
      mainStory.nodes,
      commonStory.nodes,
      triggerRuleResult.rules,
      characterResult.characterInfos,
      characterResult.events
    )

    this.loadedVolumes.add(volume)

    return {
      mainNodes: mainStory.nodes,
      commonNodes: commonStory.nodes,
      characterEvents: characterResult.events,
      triggerRules: triggerRuleResult.rules,
      characterInfos: characterResult.characterInfos,
      manifest,
    }
  }

  /**
   * 加载主线故事
   */
  private async loadMainStory(volume: number, perspective: Perspective): Promise<{ nodes: StoryNode[]; filePath: string }> {
    try {
      const filename = STORY_PATHS[perspective] || STORY_PATHS.male
      const filePath = `volume-${volume}/${filename}`
      const content = await this.readStoryFile(filePath)

      if (!content) {
        console.warn(`No main story file found for volume ${volume}`)
        return { nodes: [], filePath }
      }

      const nodes = storyParser.parseMainStory(content)

      console.log(`Loaded ${nodes.length} main story nodes for volume ${volume}`)
      return { nodes, filePath }
    } catch (error) {
      console.error(`Failed to load main story for volume ${volume}:`, error)
      return { nodes: [], filePath: `volume-${volume}/${STORY_PATHS[perspective] || STORY_PATHS.male}` }
    }
  }

  /**
   * 加载共同事件
   */
  private async loadCommonStory(volume: number): Promise<{ nodes: StoryNode[]; filePath: string }> {
    try {
      const filePath = `volume-${volume}/common.md`
      const content = await this.readStoryFile(filePath)

      if (!content) {
        return { nodes: [], filePath }
      }

      const nodes = storyParser.parseCommonStory(content)

      return { nodes, filePath }
    } catch (error) {
      console.error(`Failed to load common story for volume ${volume}:`, error)
      return { nodes: [], filePath: `volume-${volume}/common.md` }
    }
  }

  /**
   * 加载触发规则表
   */
  private async loadTriggerRules(volume: number): Promise<{ rules: TriggerRule[]; filePath: string }> {
    try {
      const filePath = `links/link-volume-${volume}.md`
      const content = await this.readStoryFile(filePath)

      if (!content) {
        return { rules: [], filePath }
      }

      const rules = storyParser.parseTriggerTable(content)

      return { rules, filePath }
    } catch (error) {
      console.error(`Failed to load trigger rules for volume ${volume}:`, error)
      return { rules: [], filePath: `links/link-volume-${volume}.md` }
    }
  }

  /**
   * 加载角色事件
   */
  private async loadCharacterEvents(
    volume: number,
    triggerRules: TriggerRule[]
  ): Promise<{ events: CharacterEvent[]; characterInfos: CharacterInfo[]; files: StoryManifestFile[] }> {
    const characterIds = new Set<string>()

    for (const rule of triggerRules) {
      if (rule.characterId) {
        characterIds.add(rule.characterId)
      }
    }

    const allEvents: CharacterEvent[] = []
    const characterInfos: CharacterInfo[] = []
    const files: StoryManifestFile[] = []

    for (const characterId of characterIds) {
      const result = await this.loadCharacterFile(characterId, volume)
      allEvents.push(...result.events)
      if (result.info) {
        characterInfos.push(result.info)
      }
      files.push({
        path: result.filePath,
        kind: 'character',
        ids: [
          ...result.events.map(event => event.id),
          ...(result.info ? [result.info.id] : [])
        ]
      })
    }

    return { events: allEvents, characterInfos, files }
  }

  /**
   * 加载单个角色文件
   */
  private async loadCharacterFile(
    characterId: string,
    _volume: number
  ): Promise<{ info: CharacterInfo | null; events: CharacterEvent[]; filePath: string }> {
    try {
      const filePath = `characters/char-${normalizeCharacterFileId(characterId)}.md`
      const content = await this.readStoryFile(filePath)

      if (!content) {
        return { info: null, events: [], filePath }
      }

      const { info, events } = storyParser.parseCharacterStory(content)

      return { info, events, filePath }
    } catch (error) {
      console.error(`Failed to load character file ${characterId}:`, error)
      return {
        info: null,
        events: [],
        filePath: `characters/char-${normalizeCharacterFileId(characterId)}.md`
      }
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
