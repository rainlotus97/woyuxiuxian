export type ProtagonistPeriod =
  | 'maiden'
  | 'adolescent'
  | 'teen'
  | 'young-main'
  | 'young-war'
  | 'mature-main'
  | 'mature-final'

export interface ProtagonistPeriodAsset {
  id: string
  name: string
  period: ProtagonistPeriod
  portrait: string
  version: 'v1'
}

export const protagonistPeriodAssets: ProtagonistPeriodAsset[] = [
  {
    id: 'npc_luoyanzhi',
    name: '洛衍之',
    period: 'teen',
    portrait: '/src/assets/story/characters/portraits/luo-yanzhi-teen-v1.png',
    version: 'v1',
  },
  {
    id: 'npc_luoyanzhi',
    name: '洛衍之',
    period: 'young-war',
    portrait: '/src/assets/story/characters/portraits/luo-yanzhi-war-v1.png',
    version: 'v1',
  },
  {
    id: 'npc_guchangxi',
    name: '顾长惜',
    period: 'maiden',
    portrait: '/src/assets/story/characters/portraits/gu-changxi-maiden-v1.png',
    version: 'v1',
  },
  {
    id: 'npc_guchangxi',
    name: '顾长惜',
    period: 'adolescent',
    portrait: '/src/assets/story/characters/portraits/gu-changxi-adolescent-v1.png',
    version: 'v1',
  },
  {
    id: 'npc_guchangxi',
    name: '顾长惜',
    period: 'young-main',
    portrait: '/src/assets/story/characters/portraits/gu-changxi-v1.png',
    version: 'v1',
  },
]
