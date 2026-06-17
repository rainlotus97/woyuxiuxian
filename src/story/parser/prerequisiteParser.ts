import type {
  Prerequisite,
  PrerequisiteExpression,
  PrerequisiteGroupExpression,
} from '../types'

const OPERATOR_PATTERN = /(≥|<=|>=|≤|=|<|>)/

function normalizeOperator(value: string): Prerequisite['operator'] {
  if (value === '≥') return '>='
  if (value === '≤') return '<='
  return value as Prerequisite['operator']
}

function splitTopLevel(expression: string, delimiter: '+' | '|'): string[] {
  const parts: string[] = []
  let depth = 0
  let buffer = ''

  for (const char of expression) {
    if (char === '(' || char === '（') {
      depth++
      buffer += char
      continue
    }
    if (char === ')' || char === '）') {
      depth = Math.max(0, depth - 1)
      buffer += char
      continue
    }
    if (depth === 0 && char === delimiter) {
      if (buffer.trim()) parts.push(buffer.trim())
      buffer = ''
      continue
    }
    buffer += char
  }

  if (buffer.trim()) parts.push(buffer.trim())
  return parts
}

function unwrapExpression(expression: string) {
  const trimmed = expression.trim()
  if (!trimmed) return trimmed
  if (!((trimmed.startsWith('(') && trimmed.endsWith(')')) || (trimmed.startsWith('（') && trimmed.endsWith('）')))) {
    return trimmed
  }

  let depth = 0
  for (let index = 0; index < trimmed.length; index++) {
    const char = trimmed[index]
    if (char === '(' || char === '（') depth++
    if (char === ')' || char === '）') depth--
    if (depth === 0 && index < trimmed.length - 1) {
      return trimmed
    }
  }

  return trimmed.slice(1, -1).trim()
}

function parseSinglePrerequisite(rawText: string): Prerequisite {
  const text = rawText.trim()

  if (!text || text === '无') {
    return { type: 'node_complete', rawText: text }
  }

  const loopMatch = text.match(new RegExp(`^周目\\s*${OPERATOR_PATTERN.source}\\s*(\\d+)$`))
  if (loopMatch?.[1] && loopMatch[2]) {
    return {
      type: 'loop',
      operator: normalizeOperator(loopMatch[1]),
      value: Number(loopMatch[2]),
      rawText: text
    }
  }

  const completedNodeMatch = text.match(/^已完成\s+([A-Za-z0-9_]+)$/)
  if (completedNodeMatch) {
    return {
      type: 'node_complete',
      nodeId: completedNodeMatch[1],
      rawText: text
    }
  }

  const completedEventMatch = text.match(/^已触发\s+([A-Za-z0-9_]+)$/)
  if (completedEventMatch) {
    return {
      type: 'event_triggered',
      value: completedEventMatch[1],
      rawText: text
    }
  }

  const favorMatch = text.match(new RegExp(`^(.+?)好感\\s*${OPERATOR_PATTERN.source}\\s*(\\d+)$`))
  if (favorMatch?.[1] && favorMatch[2] && favorMatch[3]) {
    return {
      type: 'favor',
      characterId: favorMatch[1].trim(),
      operator: normalizeOperator(favorMatch[2]),
      value: Number(favorMatch[3]),
      rawText: text
    }
  }

  const itemCountMatch = text.match(new RegExp(`^持有\\s+(.+?)\\s*${OPERATOR_PATTERN.source}\\s*(\\d+)$`))
  if (itemCountMatch?.[1] && itemCountMatch[2] && itemCountMatch[3]) {
    return {
      type: 'item',
      itemId: itemCountMatch[1].trim(),
      operator: normalizeOperator(itemCountMatch[2]),
      value: Number(itemCountMatch[3]),
      rawText: text
    }
  }

  const itemMatch = text.match(/^持有\s+(.+)$/)
  if (itemMatch?.[1]) {
    return {
      type: 'item',
      itemId: itemMatch[1].trim(),
      operator: '>',
      value: 0,
      rawText: text
    }
  }

  const clueMatch = text.match(/^已解锁\s+(.+)$/)
  if (clueMatch?.[1]) {
    return {
      type: 'clue',
      clueId: clueMatch[1].trim(),
      rawText: text
    }
  }

  const routeMatch = text.match(/^当前路线[：:]\s*(.+)$/)
  if (routeMatch?.[1]) {
    return {
      type: 'route',
      routeId: routeMatch[1].trim(),
      rawText: text
    }
  }

  const choiceMatch = text.match(/^([A-Za-z0-9_]+)选择(\d+)$/)
  if (choiceMatch?.[1] && choiceMatch[2]) {
    return {
      type: 'choice',
      choiceRef: choiceMatch[1],
      value: Number(choiceMatch[2]),
      rawText: text
    }
  }

  const simpleNodeMatch = text.match(/^[Vv]\d+[MFC]\d+(?:_[A-Za-z0-9]+)?$/)
  if (simpleNodeMatch) {
    return {
      type: 'node_complete',
      nodeId: text,
      rawText: text
    }
  }

  return {
    type: 'node_complete',
    nodeId: text,
    rawText: text
  }
}

function parseExpressionInternal(rawExpression: string): PrerequisiteExpression | null {
  const expression = unwrapExpression(rawExpression)
  if (!expression || expression === '无') return null

  const andParts = splitTopLevel(expression, '+')
  if (andParts.length > 1) {
    return {
      type: 'and',
      conditions: andParts
        .map(parseExpressionInternal)
        .filter((condition): condition is PrerequisiteExpression => Boolean(condition))
    }
  }

  const orParts = splitTopLevel(expression, '|')
  if (orParts.length > 1) {
    return {
      type: 'or',
      conditions: orParts
        .map(parseExpressionInternal)
        .filter((condition): condition is PrerequisiteExpression => Boolean(condition))
    }
  }

  return {
    type: 'condition',
    condition: parseSinglePrerequisite(expression)
  }
}

function flattenExpression(expression: PrerequisiteExpression | null): Prerequisite[] {
  if (!expression) return []
  if (expression.type === 'condition') return [expression.condition]
  return expression.conditions.flatMap(flattenExpression)
}

export function parsePrerequisiteExpression(rawExpression?: string | null): PrerequisiteExpression | null {
  if (!rawExpression) return null
  return parseExpressionInternal(
    rawExpression
      .replace(/[（）]/g, bracket => bracket === '（' ? '(' : ')')
      .replace(/\s+且\s+/g, ' + ')
      .replace(/\s+或\s+/g, ' | ')
      .trim()
  )
}

export function parsePrerequisites(rawExpression?: string | null): Prerequisite[] {
  return flattenExpression(parsePrerequisiteExpression(rawExpression))
}

export function prerequisiteExpressionToText(expression: PrerequisiteExpression | null): string[] {
  if (!expression) return []
  if (expression.type === 'condition') {
    return [expression.condition.rawText || JSON.stringify(expression.condition)]
  }

  const joiner = expression.type === 'and' ? ' 且 ' : ' 或 '
  return [
    expression.conditions
      .map(condition => prerequisiteExpressionToText(condition).join(' '))
      .filter(Boolean)
      .join(joiner)
  ]
}

export function hasComplexPrerequisiteExpression(expression: PrerequisiteExpression | null): boolean {
  if (!expression) return false
  if (expression.type === 'condition') return false
  if (expression.type === 'or') return true
  return expression.conditions.some(condition =>
    condition.type !== 'condition' || hasComplexPrerequisiteExpression(condition)
  )
}

export function normalizePrerequisiteBlock(rawValue?: string | null) {
  if (!rawValue) return null
  const normalized = rawValue
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join(' + ')
    .trim()
  return normalized || null
}

export function wrapCondition(condition: Prerequisite): PrerequisiteExpression {
  return {
    type: 'condition',
    condition
  }
}

export function createExpressionGroup(
  type: PrerequisiteGroupExpression['type'],
  conditions: PrerequisiteExpression[]
): PrerequisiteExpression {
  return { type, conditions }
}
