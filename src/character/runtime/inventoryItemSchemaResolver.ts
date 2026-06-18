import type { InventoryItem } from '@/stores/playerStore'

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

export function resolveInventoryDefinitionId(item: InventoryItem) {
  const candidate = item.definitionId
    ?? item.equipmentId
    ?? (item.type === 'equipment' ? EQUIPMENT_DEFINITION_BY_NAME[item.name] : ITEM_DEFINITION_BY_NAME[item.name])
    ?? ITEM_DEFINITION_BY_NAME[item.name]
    ?? item.id

  return DEFINITION_ALIASES[candidate] ?? candidate
}
