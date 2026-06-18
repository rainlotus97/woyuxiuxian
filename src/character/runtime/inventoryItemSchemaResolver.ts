import type { InventoryItem } from '@/stores/playerStore'

export type InventoryItemSchemaDiagnosticType =
  | 'missing_definition_id'
  | 'definition_alias'
  | 'equipment_id_missing'
  | 'invalid_quantity'

export interface InventoryItemSchemaDiagnostic {
  type: InventoryItemSchemaDiagnosticType
  itemId: string
  message: string
  before?: string | number
  after?: string | number
}

const EQUIPMENT_DEFINITION_BY_NAME: Record<string, string> = {
  新手木剑: 'weapon_001',
  玄铁剑: 'weapon_002',
  青锋剑: 'weapon_003',
  紫霄神剑: 'weapon_004',
  混沌古剑: 'weapon_005',
  布衣: 'armor_001',
  皮甲: 'armor_002',
  玄铁甲: 'armor_003',
  金丝软甲: 'armor_004',
  九天玄甲: 'armor_005',
  铜戒指: 'accessory_001',
  灵玉佩: 'accessory_002',
  暴击护符: 'accessory_003',
  凤血镯: 'accessory_004',
  龙魂珠: 'accessory_005'
}

const ITEM_DEFINITION_BY_NAME: Record<string, string> = {
  灵石: 'material_spirit_stone',
  灵草: 'herb_spirit_grass',
  灵花: 'herb_spirit_flower',
  仙草: 'herb_immortal_grass',
  玄铁: 'material_black_iron',
  符纸: 'material_talisman_paper',
  阵旗: 'material_array_flag',
  聚气丹: 'pill_qi_gathering',
  疗伤丹: 'pill_healing',
  回灵丹: 'pill_spirit_recover',
  大力丸: 'pill_mighty',
  铁甲丹: 'pill_iron_shell',
  护脉筑基丹: 'pill_foundation_guard',
  凝金丹: 'pill_gold_core'
}

const DEFINITION_ALIASES: Record<string, string> = {
  material_spirit_grass: 'herb_spirit_grass',
  herb_grass: 'herb_spirit_grass',
  wooden_sword: 'weapon_001',
  iron_sword: 'weapon_002',
  desert_boots: 'accessory_002',
  frost_armor: 'armor_003',
  flame_sword: 'weapon_003',
  celestial_blade: 'weapon_005',
  abyss_crown: 'accessory_005'
}

export function normalizeInventoryItemSchema(item: InventoryItem): InventoryItem {
  const definitionId = resolveInventoryDefinitionId(item)
  return {
    ...item,
    definitionId,
    equipmentId: item.equipmentId ?? (item.type === 'equipment' ? definitionId : undefined),
    quantity: Math.max(1, Math.floor(item.quantity || 1))
  }
}

export function normalizeInventoryItemsSchema(items: InventoryItem[]) {
  return items.map(normalizeInventoryItemSchema)
}

export function validateInventoryItemSchema(item: InventoryItem): InventoryItemSchemaDiagnostic[] {
  const diagnostics: InventoryItemSchemaDiagnostic[] = []
  const rawDefinitionId = item.definitionId ?? item.equipmentId
  const resolvedDefinitionId = resolveInventoryDefinitionId(item)

  if (!rawDefinitionId) {
    diagnostics.push({
      type: 'missing_definition_id',
      itemId: item.id,
      message: `${item.name} 缺少 definitionId，已按名称或物品 ID 回填。`,
      after: resolvedDefinitionId
    })
  }

  if (rawDefinitionId && rawDefinitionId !== resolvedDefinitionId) {
    diagnostics.push({
      type: 'definition_alias',
      itemId: item.id,
      message: `${item.name} 的 definitionId 已从别名归一。`,
      before: rawDefinitionId,
      after: resolvedDefinitionId
    })
  }

  if (item.type === 'equipment' && !item.equipmentId) {
    diagnostics.push({
      type: 'equipment_id_missing',
      itemId: item.id,
      message: `${item.name} 是装备但缺少 equipmentId，已按 definitionId 回填。`,
      after: resolvedDefinitionId
    })
  }

  if (!Number.isFinite(item.quantity) || item.quantity < 1 || Math.floor(item.quantity) !== item.quantity) {
    diagnostics.push({
      type: 'invalid_quantity',
      itemId: item.id,
      message: `${item.name} 数量非法，已归一为正整数。`,
      before: item.quantity,
      after: Math.max(1, Math.floor(item.quantity || 1))
    })
  }

  return diagnostics
}

export function validateInventoryItemsSchema(items: InventoryItem[]) {
  return items.flatMap(validateInventoryItemSchema)
}

export function resolveInventoryDefinitionId(item: InventoryItem) {
  const candidate = item.definitionId
    ?? item.equipmentId
    ?? (item.type === 'equipment' ? EQUIPMENT_DEFINITION_BY_NAME[item.name] : ITEM_DEFINITION_BY_NAME[item.name])
    ?? ITEM_DEFINITION_BY_NAME[item.name]
    ?? item.id

  return DEFINITION_ALIASES[candidate] ?? candidate
}
