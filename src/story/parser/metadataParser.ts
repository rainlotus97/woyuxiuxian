import type { CharacterEvent, CharacterInfo, StoryNode } from '../types'
import { parseStoryContent } from './contentParser'
import {
  normalizeNullableValue,
  parseMetadata,
  parsePerspective,
  parseTriggerType,
} from './shared'
import {
  normalizePrerequisiteBlock,
  parsePrerequisiteExpression,
  parsePrerequisites,
} from './prerequisiteParser'

function parseTriggerTuning(metadata: Record<string, string>) {
  const triggerValue = metadata['触发值'] || metadata['triggerValue']
  const baseProbabilityRaw = metadata['基础概率'] || metadata['baseProbability']
  const loopIncrementRaw = metadata['周目递增'] || metadata['loopIncrement']
  const favorThresholdRaw = metadata['好感门槛'] || metadata['favorThreshold']

  const baseProbability = baseProbabilityRaw
    ? Number(baseProbabilityRaw.replace('%', '').trim())
    : undefined
  const loopIncrement = loopIncrementRaw
    ? Number(loopIncrementRaw.replace(/[^\d-]/g, '').trim())
    : undefined
  const favorThresholdMatch = favorThresholdRaw?.match(/^(.+?)好感\s*[≥>=]+\s*(\d+)$/)

  return {
    triggerValue: triggerValue ? Number(triggerValue) : undefined,
    baseProbability: Number.isFinite(baseProbability) ? baseProbability : undefined,
    loopIncrement: Number.isFinite(loopIncrement) ? loopIncrement : undefined,
    favorThreshold: favorThresholdMatch
      ? { character: (favorThresholdMatch[1] || '').trim(), value: Number(favorThresholdMatch[2] || 0) }
      : undefined,
  }
}

export function parseStoryNode(block: string): StoryNode | null {
  const metadata = parseMetadata(block)
  const id = metadata.ID || metadata.id || ''
  const name = metadata.名称 || metadata.name || ''
  if (!id || !name) return null

  const content = parseStoryContent(block)
  if (!content) return null

  const rawPrerequisiteText = normalizePrerequisiteBlock(metadata.前置 || metadata.prerequisites || metadata.前置条件 || null)
  const parsedTrigger = parseTriggerTuning(metadata)

  return {
    id,
    name,
    perspective: parsePerspective(metadata.视角 || metadata.perspective || '共同'),
    map: metadata.地图 || metadata.map || '无',
    prerequisites: parsePrerequisites(rawPrerequisiteText),
    prerequisiteExpression: parsePrerequisiteExpression(rawPrerequisiteText),
    rawPrerequisiteText,
    unlockLoop: Number(metadata.解锁周目 || metadata.unlockLoop || 1) || 1,
    fallbackNode: normalizeNullableValue(metadata.补触发 || metadata.fallbackNode),
    content,
    triggerType: metadata.触发类型 ? parseTriggerType(metadata.触发类型) : undefined,
    triggerValue: parsedTrigger.triggerValue,
  }
}

export function parseCharacterEvent(block: string): CharacterEvent | null {
  const metadata = parseMetadata(block)
  const id = metadata.事件ID || metadata.eventId || ''
  const name = metadata.事件名 || metadata.eventName || ''
  if (!id || !name) return null

  const content = parseStoryContent(block)
  if (!content) return null

  const rawPrerequisiteText = normalizePrerequisiteBlock(metadata.前置条件 || metadata.前置 || null)
  const parsedTrigger = parseTriggerTuning(metadata)

  return {
    id,
    name,
    triggerType: parseTriggerType(metadata.触发类型 || metadata.triggerType || '强制'),
    priority: Number(metadata.优先级 || metadata.priority || 0) || 0,
    unlockLoop: Number(metadata.解锁周目 || metadata.unlockLoop || 1) || 1,
    prerequisites: parsePrerequisites(rawPrerequisiteText),
    prerequisiteExpression: parsePrerequisiteExpression(rawPrerequisiteText),
    rawPrerequisiteText,
    fallbackNode: normalizeNullableValue(metadata.补触发 || metadata.fallbackNode),
    baseProbability: parsedTrigger.baseProbability,
    loopIncrement: parsedTrigger.loopIncrement,
    favorThreshold: parsedTrigger.favorThreshold,
    content,
  }
}

export function parseCharacterHeader(content: string): CharacterInfo | null {
  const nameMatch = content.match(/#\s*角色[：:]\s*(.+)/)
  const idMatch = content.match(/角色ID[：:]\s*(C\d+)/)
  if (!nameMatch?.[1] || !idMatch?.[1]) return null

  const rows = Array.from(content.matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm))
  const tableMap = new Map<string, string>()
  for (const row of rows) {
    const key = row[1]?.trim()
    const value = row[2]?.trim()
    if (!key || !value || key === '基础信息' || key.startsWith('---')) continue
    tableMap.set(key, value)
  }

  const relatedNodes = (tableMap.get('关联主线') || '无')
    .split(/[+,，]/)
    .map(value => value.trim())
    .filter(value => value && value !== '无')

  return {
    id: idMatch[1].trim(),
    name: nameMatch[1].trim(),
    gender: (tableMap.get('性别') === '男' ? '男' : '女'),
    identity: tableMap.get('身份') || '',
    relatedNodes,
    unlockLoop: Number(tableMap.get('解锁周目') || 1) || 1,
    fallbackNode: normalizeNullableValue(tableMap.get('补触发节点')),
  }
}
