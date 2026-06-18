import type { InventoryItem } from '@/stores/playerStore'
import type { DropItem } from '@/types/adventure'
import { normalizeInventoryItemSchema } from './inventoryItemSchemaResolver'

export interface EncounterDropStack {
  item: DropItem
  quantity: number
}

export interface DropInventorySource {
  idPrefix: string
  serial?: number | string
}

export function resolveDropDefinitionId(drop: DropItem) {
  return drop.id
}

export function createInventoryItemFromDrop(
  drop: EncounterDropStack,
  source: DropInventorySource
): InventoryItem {
  return normalizeInventoryItemSchema({
    id: `${source.idPrefix}_${drop.item.id}_${source.serial ?? Date.now()}`,
    definitionId: resolveDropDefinitionId(drop.item),
    name: drop.item.name,
    icon: drop.item.icon,
    type: drop.item.type === 'equipment' ? 'equipment' : drop.item.type === 'consumable' ? 'consumable' : 'material',
    quality: drop.item.quality,
    quantity: Math.max(1, Math.floor(drop.quantity)),
    description: drop.item.description
  })
}

export function createInventoryItemsFromDrops(
  drops: EncounterDropStack[],
  source: DropInventorySource
) {
  return drops.map((drop, index) => createInventoryItemFromDrop(drop, {
    ...source,
    serial: source.serial ?? index
  }))
}

export function mergeEncounterDrops(drops: EncounterDropStack[]) {
  const merged = new Map<string, EncounterDropStack>()
  for (const drop of drops) {
    const key = resolveDropDefinitionId(drop.item)
    const existing = merged.get(key)
    if (existing) {
      existing.quantity += drop.quantity
      continue
    }
    merged.set(key, {
      item: drop.item,
      quantity: drop.quantity
    })
  }
  return [...merged.values()]
}
