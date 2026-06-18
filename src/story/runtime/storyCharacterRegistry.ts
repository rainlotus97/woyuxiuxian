import { getCompanionById } from '@/types/companion'
import { useWorldStore } from '@/stores/worldStore'

export interface StoryCharacterBinding {
  storyCharacterId: string
  storyCharacterName: string
  worldNpcId?: string
  companionDefinitionId?: string
  storyOnlyReason?: string
  aliases?: string[]
}

export const STORY_CHARACTER_BINDINGS: StoryCharacterBinding[] = [
  {
    storyCharacterId: 'C000',
    storyCharacterName: '凌辰',
    storyOnlyReason: '主角/性别线核心角色，由 playerStore 承载，不映射为 world npc 或 companion',
    aliases: ['主角', '男主', '女主']
  },
  {
    storyCharacterId: 'C001',
    storyCharacterName: '苏清鸢',
    worldNpcId: 'npc_su_qingyuan',
    aliases: ['苏清鸢', '苏清鸢儿']
  },
  {
    storyCharacterId: 'C002',
    storyCharacterName: '林清寒',
    companionDefinitionId: 'companion_swordsman',
    aliases: ['林清寒']
  },
  {
    storyCharacterId: 'C003',
    storyCharacterName: '阿翠',
    storyOnlyReason: '凡人支线角色，待后续青阳城凡人关系系统接入',
    aliases: ['阿翠']
  },
  {
    storyCharacterId: 'C004',
    storyCharacterName: '墨老',
    worldNpcId: 'npc_mo_lao',
    aliases: ['墨老']
  },
  {
    storyCharacterId: 'C005',
    storyCharacterName: '小豆子',
    storyOnlyReason: '情报支线角色，待后续青阳城情报/坊市 NPC 系统接入',
    aliases: ['小豆子']
  }
]

function normalizeCharacterKey(value: string) {
  return value.trim().toLowerCase()
}

export function getStoryCharacterBindingById(storyCharacterId: string): StoryCharacterBinding | null {
  return STORY_CHARACTER_BINDINGS.find(binding => binding.storyCharacterId === storyCharacterId) ?? null
}

export function findStoryCharacterBinding(key: string): StoryCharacterBinding | null {
  const normalized = normalizeCharacterKey(key)
  return STORY_CHARACTER_BINDINGS.find(binding => {
    if (binding.storyCharacterId.toLowerCase() === normalized) return true
    if (normalizeCharacterKey(binding.storyCharacterName) === normalized) return true
    return (binding.aliases || []).some(alias => normalizeCharacterKey(alias) === normalized)
  }) ?? null
}

export function resolveStoryCharacterTarget(target: string) {
  const binding = findStoryCharacterBinding(target)
  if (!binding) {
    return {
      sourceKey: target,
      storyCharacterId: null,
      storyCharacterName: target,
      worldNpcId: null,
      companionDefinitionId: null
    }
  }

  return {
    sourceKey: target,
    storyCharacterId: binding.storyCharacterId,
    storyCharacterName: binding.storyCharacterName,
    worldNpcId: binding.worldNpcId ?? null,
    companionDefinitionId: binding.companionDefinitionId ?? null
  }
}

export function describeStoryCharacterTarget(target: string) {
  const resolved = resolveStoryCharacterTarget(target)
  return resolved.storyCharacterName
}

export function validateStoryCharacterBindings() {
  const worldStore = useWorldStore()

  return STORY_CHARACTER_BINDINGS.map(binding => ({
    binding,
    worldNpcExists: binding.worldNpcId ? worldStore.npcDefinitions.some(item => item.id === binding.worldNpcId) : true,
    companionExists: binding.companionDefinitionId ? Boolean(getCompanionById(binding.companionDefinitionId)) : true
  }))
}
