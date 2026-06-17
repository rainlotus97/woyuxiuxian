import { useWorldStore } from '@/stores/worldStore'
import { describeStoryCharacterTarget, resolveStoryCharacterTarget } from './storyCharacterRegistry'

export function syncStoryFavorToWorld(characterKey: string, amount: number) {
  const worldStore = useWorldStore()
  const resolved = resolveStoryCharacterTarget(characterKey)
  if (!resolved.worldNpcId) return false

  return worldStore.applyStoryRelationshipChange(resolved.worldNpcId, {
    favorDelta: amount,
    title: `与${resolved.storyCharacterName}的因果生变`,
    text: amount >= 0
      ? `你与${resolved.storyCharacterName}之间的信任加深了。`
      : `你与${resolved.storyCharacterName}之间出现了一丝裂痕。`
  })
}

export function formatStoryFavorLabel(characterKey: string) {
  return describeStoryCharacterTarget(characterKey)
}
