import type { Effect, Perspective, Prerequisite, StoryChoice, StoryNode } from '@/story/types'

export { createStoryEffectRuntime } from '@/story/runtime/storyEffectRuntime'

interface ParsedFrontMatter {
  id: string
  name: string
  perspective: Perspective
  map: string
  prerequisites: Prerequisite[]
  unlockLoop: number
}

function readFrontMatter(block: string): ParsedFrontMatter {
  const fields = new Map<string, string>()
  for (const line of block.split(/\r?\n/u)) {
    const separator = line.indexOf(':')
    if (separator < 0) continue
    fields.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim())
  }

  const perspectiveValue = fields.get('视角') ?? fields.get('Perspective') ?? '共同'
  const perspective: Perspective = perspectiveValue.includes('男')
    ? 'male'
    : perspectiveValue.includes('女')
      ? 'female'
      : 'both'
  const prerequisiteText = fields.get('前置') ?? ''

  return {
    id: fields.get('ID') ?? fields.get('id') ?? '',
    name: fields.get('名称') ?? fields.get('Name') ?? '',
    perspective,
    map: fields.get('地图') ?? fields.get('Map') ?? '',
    prerequisites: prerequisiteText && prerequisiteText !== '无'
      ? [{ type: 'raw', rawText: prerequisiteText }]
      : [],
    unlockLoop: Number(fields.get('解锁周目') ?? fields.get('UnlockLoop') ?? 1) || 1
  }
}

function parseChoices(section: string): StoryChoice[] {
  return section
    .split(/\r?\n/u)
    .map(line => line.trim())
    .map(line => line.match(/^\d+[.、]\s*(.+?)\s*(?:→|->)\s*([^\s]+)\s*$/u))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map(match => ({ text: match[1]!, targetId: match[2]! }))
}

function parseEffects(section: string): Effect[] {
  return section
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const separator = line.indexOf('：') >= 0 ? line.indexOf('：') : line.indexOf(':')
      const label = separator >= 0 ? line.slice(0, separator).trim() : line.trim()
      const value = separator >= 0 ? line.slice(separator + 1).trim() : ''
      if (label.includes('战斗')) return { type: 'story_battle', target: value }
      if (label.includes('线索')) return { type: 'unlock_clue', target: value }
      if (label.includes('解锁')) return { type: 'unlock', target: value }
      return { type: 'story_effect', target: value, source: label }
    })
}

function parseNode(block: string): StoryNode | null {
  const sections = block.split(/(?=【(?:正文|选择|效果)】)/u)
  const frontMatterEnd = block.indexOf('---', 3)
  const frontMatter = readFrontMatter(frontMatterEnd >= 0 ? block.slice(3, frontMatterEnd) : '')
  if (!frontMatter.id) return null

  const content = {
    text: sections.find(section => section.startsWith('【正文】'))?.replace(/^【正文】\s*/u, '').trim() ?? '',
    choices: parseChoices(sections.find(section => section.startsWith('【选择】'))?.replace(/^【选择】\s*/u, '') ?? ''),
    effects: parseEffects(sections.find(section => section.startsWith('【效果】'))?.replace(/^【效果】\s*/u, '') ?? '')
  }

  return {
    id: frontMatter.id,
    name: frontMatter.name || frontMatter.id,
    perspective: frontMatter.perspective,
    map: frontMatter.map,
    prerequisites: frontMatter.prerequisites,
    prerequisiteExpression: null,
    rawPrerequisiteText: null,
    unlockLoop: frontMatter.unlockLoop,
    fallbackNode: null,
    content
  }
}

export function parseMainStory(input: unknown): StoryNode[] {
  if (typeof input !== 'string') return []
  const markers = [...input.matchAll(/^---\s*$/gmu)].map(match => match.index ?? -1).filter(index => index >= 0)
  const blocks: string[] = []
  if (markers.length >= 2) {
    for (let index = 0; index + 1 < markers.length; index += 2) {
      const nextBlockStart = markers[index + 2] ?? input.length
      blocks.push(input.slice(markers[index], nextBlockStart))
    }
  } else {
    blocks.push(input)
  }
  return blocks
    .map(block => parseNode(block))
    .filter((node): node is StoryNode => Boolean(node))
}

export const storyParser = {
  parseMainStory,
  parseVolume: (input: unknown) => ({ nodes: parseMainStory(input), events: [], characters: [] }),
  validate: () => ({ errors: [], warnings: [] })
}

export default storyParser
