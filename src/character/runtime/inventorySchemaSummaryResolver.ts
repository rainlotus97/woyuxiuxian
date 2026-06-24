import type { InventoryItem } from '@/stores/playerStore'
import {
  normalizeInventoryItemSchema,
  resolveInventoryDefinitionId,
  validateInventoryItemsSchema,
  type InventoryItemSchemaDiagnostic,
  type InventoryItemSchemaDiagnosticType
} from './inventoryItemSchemaResolver'

export type InventorySchemaSeverity = 'info' | 'warning'

export interface InventorySchemaIssue {
  diagnostic: InventoryItemSchemaDiagnostic
  severity: InventorySchemaSeverity
  itemName: string
  itemIcon: string
  normalizedDefinitionId: string
}

export interface InventorySchemaSummary {
  totalItems: number
  stackableItems: number
  equipmentItems: number
  consumableItems: number
  materialItems: number
  issueCount: number
  warningCount: number
  infoCount: number
  normalizedDefinitionCount: number
  issues: InventorySchemaIssue[]
}

const DIAGNOSTIC_SEVERITY: Record<InventoryItemSchemaDiagnosticType, InventorySchemaSeverity> = {
  missing_definition_id: 'info',
  definition_alias: 'info',
  equipment_id_missing: 'warning',
  invalid_quantity: 'warning'
}

export function resolveInventorySchemaIssueSeverity(type: InventoryItemSchemaDiagnosticType) {
  return DIAGNOSTIC_SEVERITY[type]
}

export function resolveInventorySchemaSummary(items: InventoryItem[]): InventorySchemaSummary {
  const diagnostics = validateInventoryItemsSchema(items)
  const itemById = new Map(items.map(item => [item.id, item]))
  const normalizedDefinitionIds = new Set<string>()

  for (const item of items) {
    normalizedDefinitionIds.add(resolveInventoryDefinitionId(item))
  }

  const issues = diagnostics.map(diagnostic => {
    const item = itemById.get(diagnostic.itemId)
    const normalized = item ? normalizeInventoryItemSchema(item) : undefined
    return {
      diagnostic,
      severity: resolveInventorySchemaIssueSeverity(diagnostic.type),
      itemName: item?.name ?? diagnostic.itemId,
      itemIcon: item?.icon ?? '物',
      normalizedDefinitionId: normalized?.definitionId ?? String(diagnostic.after ?? diagnostic.before ?? diagnostic.itemId)
    }
  })

  return {
    totalItems: items.length,
    stackableItems: items.filter(item => item.type !== 'equipment').length,
    equipmentItems: items.filter(item => item.type === 'equipment').length,
    consumableItems: items.filter(item => item.type === 'consumable').length,
    materialItems: items.filter(item => item.type === 'material').length,
    issueCount: issues.length,
    warningCount: issues.filter(issue => issue.severity === 'warning').length,
    infoCount: issues.filter(issue => issue.severity === 'info').length,
    normalizedDefinitionCount: normalizedDefinitionIds.size,
    issues
  }
}
