import type { InventoryItem } from '@/stores/playerStore'

export interface InventoryMaterialConsumption {
  success: boolean
  consumedQuantity: number
  remainingQuantity: number
  inventory: InventoryItem[]
}

export function isInventoryMaterialMatch(item: InventoryItem, materialId: string) {
  return item.type === 'material'
    && (item.definitionId === materialId || item.id === materialId || item.name === materialId)
}

export function resolveInventoryMaterialQuantity(inventory: InventoryItem[], materialId: string) {
  return inventory
    .filter(item => isInventoryMaterialMatch(item, materialId))
    .reduce((total, item) => total + item.quantity, 0)
}

export function resolveInventoryMaterialConsumption(
  inventory: InventoryItem[],
  materialId: string,
  quantity: number
): InventoryMaterialConsumption {
  let remainingQuantity = Math.max(0, quantity)
  let consumedQuantity = 0
  const nextInventory = inventory
    .map(item => {
      if (remainingQuantity <= 0 || !isInventoryMaterialMatch(item, materialId)) {
        return item
      }

      const consumed = Math.min(item.quantity, remainingQuantity)
      remainingQuantity -= consumed
      consumedQuantity += consumed
      return {
        ...item,
        quantity: item.quantity - consumed
      }
    })
    .filter(item => item.quantity > 0)

  return {
    success: remainingQuantity <= 0,
    consumedQuantity,
    remainingQuantity,
    inventory: nextInventory
  }
}
