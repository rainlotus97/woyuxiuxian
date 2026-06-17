import type { GameplayTrigger, NpcDialog, StoryChoice, StoryContent } from '../types'
import { parseEffects } from './effectParser'
import { extractSection } from './shared'

function parseNpcDialogs(content: string): NpcDialog[] {
  const npcSection = extractSection(content, 'NPC')
  const dialogSection = extractSection(content, '对话')
  const sharedDialogSection = extractSection(content, '通用对话')
  const source = npcSection || dialogSection || sharedDialogSection
  if (!source) return []

  const dialogs: NpcDialog[] = []
  for (const line of source.split('\n')) {
    const trimmed = line.trim()
    const match = trimmed.match(/^(.+?)[：:]\s*(.+)$/)
    if (match?.[1] && match[2]) {
      dialogs.push({ speaker: match[1].trim(), content: match[2].trim() })
    }
  }
  return dialogs
}

function parseChoices(content: string): StoryChoice[] {
  const section = extractSection(content, '选择')
  if (!section) return []

  const choices: StoryChoice[] = []
  let currentChoice: StoryChoice | null = null

  for (const line of section.split('\n')) {
    const rawLine = line.replace(/\t/g, '    ')
    const trimmed = rawLine.trim()
    if (!trimmed) continue

    const choiceMatch = trimmed.match(/^(\d+)\.\s*(.+?)\s*→\s*(\S+)$/)
    if (choiceMatch?.[2] && choiceMatch[3]) {
      currentChoice = { text: choiceMatch[2].trim(), targetId: choiceMatch[3].trim() }
      choices.push(currentChoice)
      continue
    }

    const endMatch = trimmed.match(/^(\d+)\.\s*(.+)$/)
    if (endMatch?.[2]) {
      const choiceText = endMatch[2].trim()
      if (/^卷\d+\s*完$/.test(choiceText) || /^(全剧终|故事完|结局)$/.test(choiceText) || /^【结局[：:]\s*.+】$/.test(choiceText)) {
        currentChoice = { text: choiceText, targetId: null, isEndMarker: true }
        choices.push(currentChoice)
        continue
      }
    }

    if (currentChoice) {
      const effectMatch = trimmed.match(/^效果[：:]\s*(.+)$/)
      if (effectMatch?.[1]) {
        currentChoice.effects = parseEffects(effectMatch[1])
      }
    }
  }

  return choices
}

function parseGameplayTrigger(content: string): GameplayTrigger | undefined {
  const section = extractSection(content, '效果')
  if (!section) return undefined

  const lines = section.split('\n')
  let trigger: GameplayTrigger | undefined

  for (let index = 0; index < lines.length; index++) {
    const rawLine = lines[index]
    if (!rawLine) continue
    const line = rawLine.trim()

    const triggerMatch = line.match(/^触发玩法[：:]\s*(战斗|收集|升级|探索|对话|解谜|自定义)[：:]\s*(.+)$/)
    if (triggerMatch?.[1] && triggerMatch[2]) {
      const typeMap: Record<string, GameplayTrigger['type']> = {
        战斗: 'battle',
        收集: 'collect',
        升级: 'upgrade',
        探索: 'explore',
        对话: 'dialog',
        解谜: 'puzzle',
        自定义: 'custom',
      }
      const gameplayType = typeMap[triggerMatch[1]]
      if (!gameplayType) continue

      trigger = {
        type: gameplayType,
        targetId: triggerMatch[2].trim(),
        outcomeNodeIds: {}
      }
      const activeTrigger = trigger

      for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex++) {
        const rawParamLine = lines[nextIndex]
        if (!rawParamLine) continue
        const paramLine = rawParamLine.trim()

        if (paramLine && !rawParamLine.startsWith(' ') && !rawParamLine.startsWith('\t')) {
          if (/^(获得|失去|解锁|路线|境界|触发玩法|得知)/.test(paramLine)) break
        }

        const paramMatch = paramLine.match(/^参数[：:]\s*(.+)$/)
        if (paramMatch?.[1]) {
          activeTrigger.params = activeTrigger.params || {}
          for (const param of paramMatch[1].split(',')) {
            const [key, value] = param.split('=').map(item => item.trim())
            if (key && value !== undefined) {
              activeTrigger.params[key] = Number.isNaN(Number(value)) ? value : Number(value)
            }
          }
        }

        const failMatch = paramLine.match(/^失败[：:]\s*(重试|跳过|结束|跳转)$/)
        if (failMatch?.[1]) {
          const failMap: Record<string, NonNullable<GameplayTrigger['onFailure']>> = {
            重试: 'retry',
            跳过: 'skip',
            结束: 'gameover',
            跳转: 'goto',
          }
          activeTrigger.onFailure = failMap[failMatch[1]]
        }

        const failNodeMatch = paramLine.match(/^失败跳转[：:]\s*(.+)$/)
        if (failNodeMatch?.[1]) {
          activeTrigger.failureNodeId = failNodeMatch[1].trim()
        }

        const continueMatch = paramLine.match(/^完成后跳转[：:]\s*(.+)$/)
        if (continueMatch?.[1]) {
          activeTrigger.continueNodeId = continueMatch[1].trim()
        }

        const victoryMatch = paramLine.match(/^胜利后跳转[：:]\s*(.+)$/)
        if (victoryMatch?.[1]) {
          activeTrigger.outcomeNodeIds = activeTrigger.outcomeNodeIds || {}
          activeTrigger.outcomeNodeIds.victory = victoryMatch[1].trim()
        }

        const defeatMatch = paramLine.match(/^败北后跳转[：:]\s*(.+)$/)
        if (defeatMatch?.[1]) {
          activeTrigger.outcomeNodeIds = activeTrigger.outcomeNodeIds || {}
          activeTrigger.outcomeNodeIds.defeat = defeatMatch[1].trim()
        }

        const fledMatch = paramLine.match(/^脱离后跳转[：:]\s*(.+)$/)
        if (fledMatch?.[1]) {
          activeTrigger.outcomeNodeIds = activeTrigger.outcomeNodeIds || {}
          activeTrigger.outcomeNodeIds.fled = fledMatch[1].trim()
        }
      }

      break
    }
  }

  return trigger
}

function resolveBodyText(content: string) {
  const sharedText = extractSection(content, '正文')
  const maleText = extractSection(content, '男主线专属正文') || undefined
  const femaleText = extractSection(content, '女主线专属正文') || undefined

  const text = sharedText || maleText || femaleText || ''
  return { text, maleText, femaleText }
}

export function parseStoryContent(block: string): StoryContent | null {
  const textContent = resolveBodyText(block)
  if (!textContent.text) return null

  return {
    text: textContent.text,
    maleText: textContent.maleText,
    femaleText: textContent.femaleText,
    npcDialogs: parseNpcDialogs(block),
    choices: parseChoices(block),
    effects: parseEffects(extractSection(block, '效果')),
    innerMonologue: extractSection(block, '内心独白') || undefined,
    gameplayTrigger: parseGameplayTrigger(block),
  }
}
