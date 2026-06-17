import type {
  CharacterEvent,
  CharacterInfo,
  Perspective,
  StoryManifest,
  StoryNode,
  TriggerRule,
} from '../types'
import { parseCharacterEvent, parseCharacterHeader, parseStoryNode } from './metadataParser'
import { buildStoryManifest } from './storyValidator'
import { splitNodeBlocks } from './shared'
import { parseTriggerTable as parseTriggerMarkdownTable } from './triggerParser'

export class StoryParser {
  parseMainStory(content: string): StoryNode[] {
    return splitNodeBlocks(content)
      .map(block => parseStoryNode(block))
      .filter((node): node is StoryNode => Boolean(node))
  }

  parseCommonStory(content: string): StoryNode[] {
    return this.parseMainStory(content)
  }

  parseCharacterStory(content: string): { info: CharacterInfo | null; events: CharacterEvent[] } {
    const info = parseCharacterHeader(content)
    const events = splitNodeBlocks(content)
      .map(block => parseCharacterEvent(block))
      .filter((event): event is CharacterEvent => Boolean(event))

    return { info, events }
  }

  parseTriggerTable(content: string): TriggerRule[] {
    return parseTriggerMarkdownTable(content)
  }

  buildManifest(input: {
    volume: number
    perspective: Perspective
    files: StoryManifest['files']
    mainNodes: StoryNode[]
    commonNodes: StoryNode[]
    characterInfos: CharacterInfo[]
    characterEvents: CharacterEvent[]
    triggerRules: TriggerRule[]
  }): StoryManifest {
    return buildStoryManifest(input)
  }
}

export const storyParser = new StoryParser()

export {
  parsePrerequisiteExpression,
  parsePrerequisites,
  prerequisiteExpressionToText,
  hasComplexPrerequisiteExpression,
  normalizePrerequisiteBlock,
} from './prerequisiteParser'
