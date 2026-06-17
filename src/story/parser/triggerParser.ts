import type { TriggerRule } from '../types'
import { normalizeNullableValue, parseTriggerType } from './shared'

function parseTableRow(line: string): string[] | null {
  if (!line.trim().startsWith('|')) return null
  const columns = line
    .split('|')
    .slice(1, -1)
    .map(column => column.trim())
  return columns.length > 0 ? columns : null
}

function isSeparatorRow(columns: string[]) {
  return columns.every(column => /^:?-{2,}:?$/.test(column.replace(/\s+/g, '')))
}

function parseConditionType(value: string): TriggerRule['conditionType'] {
  return value === '本周目' ? 'this_loop' : 'loop_inherit'
}

export function parseTriggerTable(content: string): TriggerRule[] {
  const lines = content.split('\n')
  const rows: string[][] = []

  for (const line of lines) {
    const columns = parseTableRow(line)
    if (!columns) continue
    if (rows.length === 0 || !isSeparatorRow(columns)) {
      rows.push(columns)
    }
  }

  if (rows.length <= 1) return []

  const header = rows[0]
  if (!header) return []
  const columnIndex = new Map<string, number>()
  header.forEach((name, index) => columnIndex.set(name, index))

  const result: TriggerRule[] = []
  for (const row of rows.slice(1)) {
    const mainNodeId = row[columnIndex.get('主线节点ID') ?? -1]
    const eventId = row[columnIndex.get('事件ID') ?? -1]
    if (!mainNodeId || !eventId) continue

    result.push({
      mainNodeId,
      characterId: normalizeNullableValue(row[columnIndex.get('角色ID') ?? -1]),
      eventId,
      triggerType: parseTriggerType(row[columnIndex.get('触发类型') ?? -1] || 'must'),
      baseValue: Number(row[columnIndex.get('基础触发值') ?? -1] || 0) || 0,
      priority: Number(row[columnIndex.get('优先级') ?? -1] || 0) || 0,
      unlockLoop: Number(row[columnIndex.get('解锁周目') ?? -1] || 1) || 1,
      fallbackNode: normalizeNullableValue(row[columnIndex.get('补触发节点') ?? -1]),
      fallbackCondition: normalizeNullableValue(row[columnIndex.get('补触发条件') ?? -1]),
      conditionType: parseConditionType(row[columnIndex.get('条件类型') ?? -1] || '轮回继承'),
      exclusiveEventId: normalizeNullableValue(row[columnIndex.get('互斥事件ID') ?? -1]),
      note: normalizeNullableValue(row[columnIndex.get('备注') ?? -1]) || undefined,
    })
  }

  return result
}
