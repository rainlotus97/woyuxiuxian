/**
 * 故事解析器 — 存根实现
 */
export { createStoryEffectRuntime } from '@/story/runtime/storyEffectRuntime'
export const storyParser = {
  parseVolume: () => ({ nodes: [], events: [], characters: [] }),
  validate: () => ({ errors: [], warnings: [] })
}
export default storyParser


export function parseMainStory(input: unknown): unknown {
  return null
}
