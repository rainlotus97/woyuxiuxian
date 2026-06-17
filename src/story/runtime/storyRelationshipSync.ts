import { useWorldStore } from '@/stores/worldStore'
import { describeStoryCharacterTarget, resolveStoryCharacterTarget } from './storyCharacterRegistry'

export type StoryRelationshipMetric = 'favor' | 'hatred' | 'debt' | 'fear'

const RELATIONSHIP_LABELS: Record<StoryRelationshipMetric, string> = {
  favor: '好感',
  hatred: '仇恨',
  debt: '恩情',
  fear: '畏惧'
}

export function formatStoryRelationshipLabel(characterKey: string, metric: StoryRelationshipMetric) {
  return `${describeStoryCharacterTarget(characterKey)}${RELATIONSHIP_LABELS[metric]}`
}

export function syncStoryRelationshipMetric(
  characterKey: string,
  metric: StoryRelationshipMetric,
  amount: number
) {
  const worldStore = useWorldStore()
  const resolved = resolveStoryCharacterTarget(characterKey)
  if (!resolved.worldNpcId) return false

  const metricLabel = RELATIONSHIP_LABELS[metric]
  return worldStore.applyStoryRelationshipChange(resolved.worldNpcId, {
    favorDelta: metric === 'favor' ? amount : 0,
    hatredDelta: metric === 'hatred' ? amount : 0,
    debtDelta: metric === 'debt' ? amount : 0,
    fearDelta: metric === 'fear' ? amount : 0,
    title: `与${resolved.storyCharacterName}的${metricLabel}变化`,
    text: amount >= 0
      ? `${resolved.storyCharacterName}对你的${metricLabel}加深了。`
      : `${resolved.storyCharacterName}对你的${metricLabel}减弱了。`
  })
}
