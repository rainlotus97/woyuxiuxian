/**
 * 选择状态系统 — 记录玩家在每个故事章节中的选择及其影响
 */
export interface ChoiceState {
  /** 章节ID → 选择的选项索引 */
  choices: Record<string, number>
  /** NPC好感变化累积 */
  npcFavor: Record<string, number>
  /** 解锁的NPC */
  unlockedNpcs: string[]
  /** 锁定的NPC（永远不可用） */
  lockedNpcs: string[]
  /** 世界标记（flag → true/false） */
  flags: Record<string, boolean>
  /** 结局点数（key → 累计值） */
  endingPoints: Record<string, number>
  /** 已完成的章节 */
  completedChapters: string[]
}
export const EMPTY_CHOICE_STATE: ChoiceState = {
  choices: {}, npcFavor: {}, unlockedNpcs: [], lockedNpcs: [],
  flags: {}, endingPoints: {}, completedChapters: []
}
