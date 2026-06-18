import type { SectEvent } from '@/types/sect'

export interface SectEventEffectTotals {
  gold: number
  contribution: number
  reputation: number
  relationValues: string[]
  itemValues: string[]
}

export interface SectEventChoiceResolution {
  success: boolean
  reason: 'ready' | 'missing_event' | 'missing_choice'
  selectedChoiceId: string | null
  handledEvent: SectEvent | null
  effects: SectEventEffectTotals
}

const EMPTY_EFFECT_TOTALS: SectEventEffectTotals = {
  gold: 0,
  contribution: 0,
  reputation: 0,
  relationValues: [],
  itemValues: []
}

export function resolveSectEventChoice(event: SectEvent | null, choiceId: string): SectEventChoiceResolution {
  if (!event) {
    return createBlockedResolution('missing_event')
  }

  const choice = event.choices.find(item => item.id === choiceId)
  if (!choice) {
    return createBlockedResolution('missing_choice')
  }

  return {
    success: true,
    reason: 'ready',
    selectedChoiceId: choiceId,
    handledEvent: {
      ...event,
      handled: true,
      selectedChoice: choiceId
    },
    effects: choice.outcome.effects.reduce<SectEventEffectTotals>((totals, effect) => {
      switch (effect.type) {
        case 'gold':
          totals.gold += Number(effect.value) || 0
          break
        case 'contribution':
          totals.contribution += Number(effect.value) || 0
          break
        case 'reputation':
          totals.reputation += Number(effect.value) || 0
          break
        case 'relation':
          totals.relationValues.push(String(effect.value))
          break
        case 'item':
          totals.itemValues.push(String(effect.value))
          break
      }
      return totals
    }, createEmptyTotals())
  }
}

function createBlockedResolution(reason: SectEventChoiceResolution['reason']): SectEventChoiceResolution {
  return {
    success: false,
    reason,
    selectedChoiceId: null,
    handledEvent: null,
    effects: createEmptyTotals()
  }
}

function createEmptyTotals(): SectEventEffectTotals {
  return {
    ...EMPTY_EFFECT_TOTALS,
    relationValues: [],
    itemValues: []
  }
}
