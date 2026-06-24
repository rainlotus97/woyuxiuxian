import { ref } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import { SECT_FACILITIES } from '@/types/sect'
import { ALCHEMY_RECIPES } from '@/types/alchemy'
import { SEEDS } from '@/types/garden'
import {
  resolveSectProgressionJourney,
  type SectProgressionJourneyResult
} from '@/sect/runtime/sectProgressionJourneyResolver'

export function useSectProgression() {
  const mapStore = useMapStore()
  const sectStore = useSectStore()
  const worldStore = useWorldStore()
  const lastProgressionJourney = ref<SectProgressionJourneyResult | null>(null)

  function promotePosition() {
    const sect = sectStore.currentSect
    const previousPositionName = sectStore.positionName
    const nextPositionName = sectStore.nextPosition?.name ?? null

    if (!sectStore.promotePosition() || !sect || !nextPositionName) {
      return { success: false, journey: null, positionName: sectStore.positionName }
    }

    const journey = resolveSectProgressionJourney({
      action: 'promotion',
      sectName: sect.name,
      previousPositionName,
      nextPositionName
    })
    recordJourney(journey, sect.areaId)

    return { success: true, journey, positionName: sectStore.positionName }
  }

  function upgradeFacility(facilityId: string) {
    const sect = sectStore.currentSect
    const facility = SECT_FACILITIES.find(item => item.id === facilityId) ?? null
    const previousLevel = sectStore.getFacilityLevel(facilityId)

    if (!sectStore.upgradeFacility(facilityId) || !sect || !facility) {
      return { success: false, journey: null, facilityName: facility?.name ?? null }
    }

    const nextLevel = sectStore.getFacilityLevel(facilityId)
    const journey = resolveSectProgressionJourney({
      action: 'facility_upgrade',
      sectName: sect.name,
      facilityName: facility.name,
      previousLevel,
      nextLevel
    })
    recordJourney(journey, sect.areaId)

    return { success: true, journey, facilityName: facility.name, nextLevel }
  }

  function craftAlchemy(recipeId: string) {
    const sect = sectStore.currentSect
    const recipe = ALCHEMY_RECIPES.find(item => item.id === recipeId) ?? null
    const result = sectStore.craftAlchemy(recipeId)

    if (!result.success || !result.item || !sect) {
      return { ...result, journey: null }
    }

    const journey = resolveSectProgressionJourney({
      action: 'alchemy_craft',
      sectName: sect.name,
      facilityName: '炼丹炉',
      itemName: result.item.name,
      rewards: [{ type: 'item', label: result.item.name, value: 1 }]
    })
    recordJourney(journey, sect.areaId)

    return { ...result, recipeName: recipe?.name ?? result.item.name, journey }
  }

  function plantSeed(seedId: string, slotIndex: number) {
    const sect = sectStore.currentSect
    const seed = SEEDS.find(item => item.id === seedId) ?? null
    const result = sectStore.plantSeed(seedId, slotIndex)

    if (!result.success || !sect) {
      return { ...result, journey: null }
    }

    const journey = resolveSectProgressionJourney({
      action: 'garden_plant',
      sectName: sect.name,
      seedName: seed?.name ?? seedId
    })
    recordJourney(journey, sect.areaId)

    return { ...result, journey }
  }

  function harvestCrop(slotIndex: number) {
    const sect = sectStore.currentSect
    const result = sectStore.harvestCrop(slotIndex)

    if (!result.success || !result.item || !result.quantity || !sect) {
      return { ...result, journey: null }
    }

    const journey = resolveSectProgressionJourney({
      action: 'garden_harvest',
      sectName: sect.name,
      itemName: result.item.name,
      quantity: result.quantity,
      rewards: [{ type: 'item', label: result.item.name, value: result.quantity }]
    })
    recordJourney(journey, sect.areaId)

    return { ...result, journey }
  }

  function harvestAllReadyCrops() {
    const sect = sectStore.currentSect
    const readyIndices = sectStore.gardenSlots
      .map((slot, index) => ({ slot, index }))
      .filter(entry => entry.index < sectStore.gardenSlotCount && entry.slot && Date.now() >= entry.slot.readyAt)
      .map(entry => entry.index)

    const harvestedItems: { name: string; icon: string; quantity: number }[] = []

    for (const index of readyIndices) {
      const result = sectStore.harvestCrop(index)
      if (!result.success || !result.item || !result.quantity) continue
      harvestedItems.push({
        name: result.item.name,
        icon: result.item.icon,
        quantity: result.quantity
      })
    }

    if (harvestedItems.length <= 0 || !sect) {
      return { harvestedCount: 0, items: [], journey: null }
    }

    const rewards = harvestedItems.map(item => ({
      type: 'item' as const,
      label: item.name,
      value: item.quantity
    }))
    const journey = resolveSectProgressionJourney({
      action: 'garden_harvest',
      sectName: sect.name,
      itemName: harvestedItems[0]?.name ?? '灵草',
      quantity: harvestedItems.reduce((sum, item) => sum + item.quantity, 0),
      itemCount: harvestedItems.length,
      rewards
    })
    recordJourney(journey, sect.areaId)

    return {
      harvestedCount: harvestedItems.length,
      items: harvestedItems.map(item => `${item.icon}${item.name}x${item.quantity}`),
      journey
    }
  }

  function accelerateCrop(slotIndex: number) {
    const sect = sectStore.currentSect
    const crop = sectStore.gardenSlots[slotIndex] ?? null
    const seed = crop ? SEEDS.find(item => item.id === crop.seedId) ?? null : null
    const result = sectStore.accelerateCrop(slotIndex)

    if (!result.success || !sect) {
      return { ...result, journey: null }
    }

    const journey = resolveSectProgressionJourney({
      action: 'garden_accelerate',
      sectName: sect.name,
      cropName: seed?.name ?? '灵植'
    })
    recordJourney(journey, sect.areaId)

    return { ...result, journey }
  }

  function recordJourney(journey: SectProgressionJourneyResult, areaId: string) {
    lastProgressionJourney.value = journey
    const area = mapStore.getAreaInfo(areaId)
    worldStore.recordManualPlayerJourney({
      ...journey,
      areaId: area?.id ?? areaId
    })
  }

  return {
    lastProgressionJourney,
    promotePosition,
    upgradeFacility,
    craftAlchemy,
    plantSeed,
    harvestCrop,
    harvestAllReadyCrops,
    accelerateCrop
  }
}
