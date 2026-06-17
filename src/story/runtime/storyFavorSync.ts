import { describeStoryCharacterTarget } from './storyCharacterRegistry'
import { syncStoryRelationshipMetric } from './storyRelationshipSync'

export function syncStoryFavorToWorld(characterKey: string, amount: number) {
  return syncStoryRelationshipMetric(characterKey, 'favor', amount)
}

export function formatStoryFavorLabel(characterKey: string) {
  return describeStoryCharacterTarget(characterKey)
}
