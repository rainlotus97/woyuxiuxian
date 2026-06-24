/**
 * 剧情战回放归档 — 存根实现
 * （完整的实现由 story agent 提供）
 */
export interface StoryBattleReplaySummary {
  id: string
  chapterId: string
  sectionId: string
  title: string
  result: 'victory' | 'defeat' | 'fled'
  recordedAt: number
}

export function createStoryBattleReplayRecord(
  input: { battleInstanceId: string; chapterId: string; sectionId: string; title: string }
): void {
  // stub - will be implemented by story agent
}

export function saveStoryBattleReplayRecord(record: unknown): boolean {
  return true
}

export function getStoryBattleReplaySummaries(): StoryBattleReplaySummary[] {
  return []
}

export function getStoryBattleReplayById(id: string): unknown | null {
  return null
}


export function getStoryBattleReplayRecord(id: string): unknown | null {
  return null
}


export function clearStoryBattleReplayArchive(): void {
  // stub
}
