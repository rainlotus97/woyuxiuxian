import type { Router } from 'vue-router'
import { gameplayBridge } from '../gameplayBridge'
import type { GameplayResult } from '../types'
import { getStoryBattleTemplate } from './storyBattleCatalog'

function createFallbackResult(success: boolean, gameplayType: string, targetId: string): GameplayResult {
  return {
    success,
    gameplayType: gameplayType as GameplayResult['gameplayType'],
    targetId
  }
}

export function registerDefaultGameplayHandlers(router: Router) {
  const unsubs = [
    gameplayBridge.registerHandler('battle', async trigger => {
      const template = getStoryBattleTemplate(trigger.targetId)
      if (!template) {
        return createFallbackResult(false, trigger.type, trigger.targetId)
      }

      await router.push({
        path: '/game/battle',
        query: {
          areaId: template.areaId,
          mapAreaId: template.mapAreaId
        }
      })

      return {
        success: true,
        gameplayType: trigger.type,
        targetId: trigger.targetId,
        data: {
          templateId: template.id,
          description: template.description
        }
      }
    }),
    gameplayBridge.registerHandler('collect', async trigger => ({
      success: true,
      gameplayType: trigger.type,
      targetId: trigger.targetId,
      data: { collected: trigger.params?.required ?? 1 }
    })),
    gameplayBridge.registerHandler('upgrade', async trigger => createFallbackResult(true, trigger.type, trigger.targetId)),
    gameplayBridge.registerHandler('explore', async trigger => createFallbackResult(true, trigger.type, trigger.targetId)),
    gameplayBridge.registerHandler('dialog', async trigger => createFallbackResult(true, trigger.type, trigger.targetId)),
    gameplayBridge.registerHandler('puzzle', async trigger => createFallbackResult(true, trigger.type, trigger.targetId)),
    gameplayBridge.registerHandler('custom', async trigger => createFallbackResult(true, trigger.type, trigger.targetId)),
  ]

  return () => {
    for (const off of unsubs) off()
  }
}
