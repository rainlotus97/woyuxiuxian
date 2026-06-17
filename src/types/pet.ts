import type { Element, Quality, Realm, UnitStats } from './unit'

export type PetSpecies = 'fox' | 'wolf' | 'bird' | 'dragon' | 'tortoise'
export type PetTemperament = 'fierce' | 'gentle' | 'cunning' | 'steady' | 'wild'
export type PetTrait = 'fighter' | 'guardian' | 'swift' | 'support' | 'lucky'

export interface PetDefinition {
  id: string
  name: string
  icon: string
  species: PetSpecies
  realm: Realm
  realmLevel: number
  quality: Quality
  element: Element
  temperament: PetTemperament
  trait: PetTrait
  description: string
  baseStats: {
    maxHp: number
    maxMp: number
    attack: number
    defense: number
    speed: number
    critRate: number
    critDamage: number
  }
  growth: {
    maxHp: number
    maxMp: number
    attack: number
    defense: number
    speed: number
  }
  skills: string[]
}

export interface OwnedPet {
  definitionId: string
  level: number
  exp: number
  maxExp: number
  intimacy: number
  currentHp: number
  currentMp: number
  equipped: boolean
}

export const PET_DEFINITIONS: PetDefinition[] = [
  {
    id: 'pet_cloud_fox',
    name: '踏云灵狐',
    icon: '🦊',
    species: 'fox',
    realm: '炼气',
    realmLevel: 5,
    quality: '灵品',
    element: '木',
    temperament: 'cunning',
    trait: 'swift',
    description: '擅长游走与缠斗的轻灵狐兽，可在战斗中扰乱敌方节奏。',
    baseStats: {
      maxHp: 260,
      maxMp: 120,
      attack: 46,
      defense: 18,
      speed: 132,
      critRate: 0.12,
      critDamage: 1.55
    },
    growth: {
      maxHp: 38,
      maxMp: 8,
      attack: 6,
      defense: 3,
      speed: 2
    },
    skills: ['basic_sword', 'fireball']
  },
  {
    id: 'pet_ironback_wolf',
    name: '铁脊苍狼',
    icon: '🐺',
    species: 'wolf',
    realm: '炼气',
    realmLevel: 7,
    quality: '玄品',
    element: '金',
    temperament: 'fierce',
    trait: 'fighter',
    description: '善于正面冲阵的狼形灵兽，拥有比普通伙伴更高的生存与突进能力。',
    baseStats: {
      maxHp: 340,
      maxMp: 80,
      attack: 58,
      defense: 28,
      speed: 118,
      critRate: 0.1,
      critDamage: 1.5
    },
    growth: {
      maxHp: 46,
      maxMp: 6,
      attack: 7,
      defense: 4,
      speed: 1
    },
    skills: ['basic_sword', 'shield']
  },
  {
    id: 'pet_mist_crane',
    name: '雾羽灵鹤',
    icon: '🪽',
    species: 'bird',
    realm: '筑基',
    realmLevel: 2,
    quality: '玄品',
    element: '水',
    temperament: 'gentle',
    trait: 'support',
    description: '能凝聚水雾护持同伴的灵鹤，适合补足队伍续航。',
    baseStats: {
      maxHp: 300,
      maxMp: 180,
      attack: 36,
      defense: 24,
      speed: 126,
      critRate: 0.08,
      critDamage: 1.4
    },
    growth: {
      maxHp: 34,
      maxMp: 12,
      attack: 4,
      defense: 4,
      speed: 2
    },
    skills: ['heal', 'shield']
  }
]

export function getPetDefinitionById(id: string): PetDefinition | undefined {
  return PET_DEFINITIONS.find(def => def.id === id)
}

export function getPetExpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.32, level - 1))
}

export function calculatePetStats(definition: PetDefinition, owned: OwnedPet): UnitStats {
  const levelOffset = Math.max(0, owned.level - 1)
  return {
    maxHp: definition.baseStats.maxHp + definition.growth.maxHp * levelOffset,
    currentHp: Math.min(
      owned.currentHp,
      definition.baseStats.maxHp + definition.growth.maxHp * levelOffset
    ),
    maxMp: definition.baseStats.maxMp + definition.growth.maxMp * levelOffset,
    currentMp: Math.min(
      owned.currentMp,
      definition.baseStats.maxMp + definition.growth.maxMp * levelOffset
    ),
    attack: definition.baseStats.attack + definition.growth.attack * levelOffset,
    defense: definition.baseStats.defense + definition.growth.defense * levelOffset,
    speed: definition.baseStats.speed + definition.growth.speed * levelOffset,
    critRate: definition.baseStats.critRate,
    critDamage: definition.baseStats.critDamage
  }
}
