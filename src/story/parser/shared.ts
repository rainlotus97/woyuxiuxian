import type { Perspective, TriggerType } from '../types'

export const METADATA_BLOCK = /---\n([\s\S]*?)\n---/
export const METADATA_FIELD = /^([\u4e00-\u9fa5A-Za-z]+)[：:]\s*(.*)$/gm

export function splitNodeBlocks(content: string): string[] {
  const blocks: string[] = []
  const nodePattern = /---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*?)(?=---\s*\n[\u4e00-\u9fa5A-Za-z]+[：:]|$)/g

  let match: RegExpExecArray | null
  while ((match = nodePattern.exec(content)) !== null) {
    const metadata = match[1]
    const body = match[2] || ''

    if (metadata && /(?:^|\n)(?:ID|事件ID)[：:]/.test(metadata)) {
      blocks.push(`---\n${metadata.trim()}\n---\n${body.trim()}`)
    }
  }

  return blocks
}

export function parseMetadata(block: string): Record<string, string> {
  const result: Record<string, string> = {}
  const match = block.match(METADATA_BLOCK)
  if (!match?.[1]) return result

  let fieldMatch: RegExpExecArray | null
  METADATA_FIELD.lastIndex = 0
  while ((fieldMatch = METADATA_FIELD.exec(match[1])) !== null) {
    if (fieldMatch[1] && fieldMatch[2] !== undefined) {
      result[fieldMatch[1]] = fieldMatch[2].trim()
    }
  }

  return result
}

export function stripMetadataBlock(block: string) {
  return block.replace(METADATA_BLOCK, '').trim()
}

export function extractSection(content: string, name: string): string {
  const regex = new RegExp(`【${name}】\\s*\\n([\\s\\S]*?)(?=\\n【|$)`)
  const match = content.match(regex)
  return match?.[1]?.trim() ?? ''
}

export function parsePerspective(value: string): Perspective {
  if (value === '男主' || value === 'male') return 'male'
  if (value === '女主' || value === 'female') return 'female'
  return 'common'
}

export function parseTriggerType(value: string): TriggerType {
  if (value === '强制' || value === 'must') return 'must'
  if (value === '概率' || value === 'prob') return 'prob'
  if (value === '周目' || value === 'loop') return 'loop'
  if (value === '好感' || value === 'favor') return 'favor'
  if (value === '物品' || value === 'item') return 'item'
  return 'must'
}

export function normalizeNullableValue(value?: string | null) {
  if (!value) return null
  const normalized = value.trim()
  if (!normalized || normalized === '无') return null
  return normalized
}

export function normalizeCharacterFileId(characterId: string) {
  return characterId.replace(/^C/, '').padStart(3, '0')
}

export function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))))
}
