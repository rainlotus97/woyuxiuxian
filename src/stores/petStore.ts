import { defineStore } from 'pinia'
import { computed, ref, toRaw, watchEffect } from 'vue'
import type { OwnedPet } from '@/types/pet'
import {
  calculatePetStats,
  getPetDefinitionById,
  getPetExpForLevel,
  PET_DEFINITIONS
} from '@/types/pet'
import {
  applyPetBondStatBonuses,
  resolvePetBondEffects
} from '@/pet/runtime/petBondResolver'

interface PetState {
  ownedPets: OwnedPet[]
  equippedPetId: string | null
}

const STORAGE_KEY = 'woyu-xiuxian-pets'

function createDefaultPetState(): PetState {
  return {
    ownedPets: [
      {
        definitionId: 'pet_cloud_fox',
        level: 1,
        exp: 0,
        maxExp: getPetExpForLevel(1),
        intimacy: 18,
        currentHp: 260,
        currentMp: 120,
        equipped: true
      }
    ],
    equippedPetId: 'pet_cloud_fox'
  }
}

export const usePetStore = defineStore('pets', () => {
  let initialData: PetState
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<PetState>
      const defaults = createDefaultPetState()
      initialData = {
        ...defaults,
        ...parsed,
        ownedPets: parsed.ownedPets ?? defaults.ownedPets,
        equippedPetId: parsed.equippedPetId ?? defaults.equippedPetId
      }
    } else {
      initialData = createDefaultPetState()
    }
  } catch (error) {
    console.warn('Failed to load pet data from localStorage, using defaults:', error)
    initialData = createDefaultPetState()
  }

  const ownedPets = ref<OwnedPet[]>(initialData.ownedPets)
  const equippedPetId = ref<string | null>(initialData.equippedPetId)

  const ownedPetDetails = computed(() => ownedPets.value
    .map(owned => {
      const definition = getPetDefinitionById(owned.definitionId)
      if (!definition) return null
      const baseStats = calculatePetStats(definition, owned)
      const bondEffects = resolvePetBondEffects(definition, owned)
      return {
        owned,
        definition,
        stats: applyPetBondStatBonuses(baseStats, bondEffects.statBonuses),
        baseStats,
        bondEffects
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null))

  const equippedPet = computed(() => {
    if (!equippedPetId.value) return null
    return ownedPetDetails.value.find(item => item.owned.definitionId === equippedPetId.value) ?? null
  })

  function saveToStorage() {
    const data: PetState = {
      ownedPets: toRaw(ownedPets.value),
      equippedPetId: equippedPetId.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function adoptPet(definitionId: string) {
    const definition = getPetDefinitionById(definitionId)
    if (!definition) return false
    if (ownedPets.value.some(pet => pet.definitionId === definitionId)) return false

    ownedPets.value.push({
      definitionId,
      level: 1,
      exp: 0,
      maxExp: getPetExpForLevel(1),
      intimacy: 0,
      currentHp: definition.baseStats.maxHp,
      currentMp: definition.baseStats.maxMp,
      equipped: false
    })
    return true
  }

  function equipPet(definitionId: string) {
    const pet = ownedPets.value.find(item => item.definitionId === definitionId)
    if (!pet) return false
    equippedPetId.value = definitionId
    for (const owned of ownedPets.value) {
      owned.equipped = owned.definitionId === definitionId
    }
    return true
  }

  function unequipPet() {
    equippedPetId.value = null
    for (const pet of ownedPets.value) {
      pet.equipped = false
    }
  }

  function addPetExp(definitionId: string, expAmount: number) {
    const pet = ownedPets.value.find(item => item.definitionId === definitionId)
    const definition = pet ? getPetDefinitionById(pet.definitionId) : null
    if (!pet || !definition) return false

    pet.exp += expAmount
    while (pet.exp >= pet.maxExp) {
      pet.exp -= pet.maxExp
      pet.level += 1
      pet.maxExp = getPetExpForLevel(pet.level)
      const stats = calculatePetStats(definition, {
        ...pet,
        currentHp: Number.MAX_SAFE_INTEGER,
        currentMp: Number.MAX_SAFE_INTEGER
      })
      pet.currentHp = stats.maxHp
      pet.currentMp = stats.maxMp
    }
    return true
  }

  function addIntimacy(definitionId: string, amount: number) {
    const pet = ownedPets.value.find(item => item.definitionId === definitionId)
    if (!pet) return false
    pet.intimacy = Math.max(0, Math.min(100, pet.intimacy + amount))
    return true
  }

  function restorePet(definitionId: string, hpAmount: number, mpAmount: number) {
    const petDetail = ownedPetDetails.value.find(item => item.owned.definitionId === definitionId)
    if (!petDetail) return false

    petDetail.owned.currentHp = Math.min(petDetail.stats.maxHp, petDetail.owned.currentHp + hpAmount)
    petDetail.owned.currentMp = Math.min(petDetail.stats.maxMp, petDetail.owned.currentMp + mpAmount)
    return true
  }

  watchEffect(() => {
    saveToStorage()
  })

  return {
    PET_DEFINITIONS,
    ownedPets,
    equippedPetId,
    ownedPetDetails,
    equippedPet,
    adoptPet,
    equipPet,
    unequipPet,
    addPetExp,
    addIntimacy,
    restorePet,
    saveToStorage
  }
})
