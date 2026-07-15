/**
 * 故事章节系统 — 极简类型定义
 * 每个章节是一个 TypeScript 数据对象
 * 自动触发 + 卡片段落展示 + 回看打字机
 */
export type Perspective = 'male' | 'female' | 'both'
/** 触发条件 */
export interface ChapterTrigger {
  type: 'realm' | 'first_enter' | 'sect_join' | 'encounter' | 'npc_interaction' | 'auto' | 'choice_flag'
  realm?: string; realmLevel?: number
  mapId?: string; sectId?: string; encounterId?: string
  npcId?: string; minFavor?: number
  flag?: string; flagValue?: boolean
  /** 卷内排序，保证按顺序触发 */
  order?: number
}
/** 选项效果 */
export interface ChoiceEffect {
  type: 'npc_unlock' | 'npc_favor' | 'npc_hatred' | 'npc_fear' | 'item_gain' | 'item_lose' | 'flag_set' | 'realm_exp' | 'gold' | 'skill_unlock' | 'map_unlock' | 'ending_point'
  npcId?: string; value?: number
  itemId?: string; quantity?: number
  flag?: string; flagValue?: boolean
  skillId?: string; mapId?: string
  endingKey?: string; endingValue?: number
}
/** 选项 */
export interface StoryChoice {
  text: string; nextSectionId: string
  effects?: ChoiceEffect[]
}
/** 段落类型 */
export type SectionType = 'narrative' | 'dialog' | 'choice' | 'battle_trigger' | 'section_end'
/** 段落 */
export interface StorySection {
  id: string; type: SectionType
  text: string; narratorText?: string
  speaker?: string; speakerTitle?: string
  emotion?: string
  choices?: StoryChoice[]
  /** 自动跳转到下一段 */
  autoNext?: string
  /** 触发战斗 */
  battleConfig?: { enemyIds: string[]; onWin?: string; onLose?: string; onFlee?: string }
}
/** 故事章节 */
export interface StoryChapter {
  id: string; title: string; volume: number; order: number
  perspective: Perspective
  triggers: ChapterTrigger[]
  /** 本章完成后解锁的NPC */
  npcIntroductions?: string[]
  /** 本章完成后增加的功法 */
  skillUnlocks?: string[]
  sections: StorySection[]
}
/** 章节注册表条目 */
export interface ChapterRegistryEntry {
  chapter: StoryChapter
  completed: boolean
  completedAt?: number
  /** 玩家的选择记录 */
  choiceRecord?: Record<string, number>
}
/** 故事档案（已完成的章节，用于回看） */
export interface StoryArchiveEntry {
  chapterId: string; title: string; volume: number; order: number
  perspective: Perspective
  completedAt: number
  choices: Record<string, number>
  unlockedNpcs: string[]
  unlockedSkills: string[]
}
/** 故事回看过滤器 */
export interface ArchiveFilter {
  volume?: number; perspective?: Perspective
  searchText?: string
}
