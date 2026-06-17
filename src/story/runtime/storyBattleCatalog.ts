export interface StoryBattleTemplate {
  id: string
  areaId: string
  mapAreaId?: string
  description: string
}

export const STORY_BATTLE_TEMPLATES: Record<string, StoryBattleTemplate> = {
  story_qingyang_well_puppet: {
    id: 'story_qingyang_well_puppet',
    areaId: 'misty_forest',
    description: '古井异动引来的天道傀儡试探。'
  },
  story_memory_fragment_hunt: {
    id: 'story_memory_fragment_hunt',
    areaId: 'dark_cave',
    description: '追逐失控记忆碎片时卷入的伏击。'
  },
  story_sect_trial_outer_gate: {
    id: 'story_sect_trial_outer_gate',
    areaId: 'misty_forest',
    mapAreaId: 'qingyun_mountain',
    description: '宗门试炼中的护山战。'
  }
}

export function getStoryBattleTemplate(id: string) {
  return STORY_BATTLE_TEMPLATES[id]
}
