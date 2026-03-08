/**
 * MD故事文档解析器（简化版）
 */

import type {
  StoryNode,
  StoryContent,
  StoryChoice,
  NpcDialog,
  Effect,
  CharacterInfo,
  CharacterEvent,
  TriggerRule,
  Perspective,
  TriggerType,
  GameplayTrigger,
} from '../types'

const METADATA_BLOCK = /---\n([\s\S]*?)\n---/
const METADATA_FIELD = /^([\u4e00-\u9fa5A-Za-z]+)[：:]\s*(.*)$/gm

export class StoryParser {
  parseMainStory(content: string): StoryNode[] {
    const nodes: StoryNode[] = []
    const blocks = this.splitNodeBlocks(content)
    for (const block of blocks) {
      const node = this.parseNode(block)
      if (node) nodes.push(node)
    }
    return nodes
  }

  parseCharacterStory(content: string): { info: CharacterInfo | null; events: CharacterEvent[] } {
    const info = this.parseCharacterHeader(content)
    const events: CharacterEvent[] = []
    const blocks = this.splitNodeBlocks(content)
    for (const block of blocks) {
      const event = this.parseCharacterEvent(block)
      if (event) events.push(event)
    }
    return { info, events }
  }

  parseCommonStory(content: string): StoryNode[] {
    return this.parseMainStory(content)
  }

  parseTriggerTable(_content: string): TriggerRule[] {
    return []
  }

  private splitNodeBlocks(content: string): string[] {
    const blocks: string[] = []
    // 使用正则匹配完整的节点块：从 --- 开始到下一个 --- 结束
    // 每个节点块包含元数据部分（ID、名称等）和内容部分（正文、选择、效果等）
    const nodePattern = /---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*?)(?=---\s*\n---|$)/g

    let match
    while ((match = nodePattern.exec(content)) !== null) {
      const metadata = match[1]
      const body = match[2] || ''

      if (metadata && metadata.includes('ID')) {
        blocks.push(`---\n${metadata.trim()}\n---\n${body.trim()}`)
      }
    }
    return blocks
  }

  private parseNode(block: string): StoryNode | null {
    const metadata = this.parseMetadata(block)
    const id = metadata['id'] || metadata['ID'] || ''
    const name = metadata['name'] || metadata['名称'] || ''
    if (!id || !name) return null

    const content = this.parseContent(block)
    if (!content) return null

    return {
      id,
      name,
      perspective: this.parsePerspective(metadata['perspective'] || metadata['视角'] || '男主'),
      map: metadata['map'] || metadata['地图'] || '未知',
      prerequisites: [],
      unlockLoop: parseInt(metadata['unlockLoop'] || metadata['解锁周目'] || '1') || 1,
      fallbackNode: null,
      content,
    }
  }

  private parseCharacterEvent(block: string): CharacterEvent | null {
    const metadata = this.parseMetadata(block)
    const id = metadata['eventId'] || metadata['事件ID'] || ''
    const name = metadata['eventName'] || metadata['事件名'] || ''
    if (!id) return null

    const content = this.parseContent(block)
    if (!content) return null

    return {
      id,
      name,
      triggerType: this.parseTriggerType(metadata['triggerType'] || metadata['触发类型'] || '强制'),
      priority: parseInt(metadata['priority'] || metadata['优先级'] || '0') || 0,
      unlockLoop: parseInt(metadata['unlockLoop'] || metadata['解锁周目'] || '1') || 1,
      prerequisites: [],
      fallbackNode: null,
      content,
    }
  }

  private parseMetadata(block: string): Record<string, string> {
    const result: Record<string, string> = {}
    const match = block.match(METADATA_BLOCK)
    if (match && match[1]) {
      const content = match[1]
      let m: RegExpExecArray | null
      METADATA_FIELD.lastIndex = 0
      while ((m = METADATA_FIELD.exec(content)) !== null) {
        if (m[1] && m[2] !== undefined) {
          result[m[1]] = m[2].trim()
        }
      }
    }
    return result
  }

  private parseContent(block: string): StoryContent | null {
    const contentBlock = block.replace(METADATA_BLOCK, '').trim()
    const text = this.extractSection(contentBlock, '正文')
    if (!text) return null

    return {
      text,
      npcDialogs: this.parseNpcDialogs(contentBlock),
      choices: this.parseChoices(contentBlock),
      effects: this.parseEffects(contentBlock),
      gameplayTrigger: this.parseGameplayTrigger(contentBlock),
    }
  }

  private extractSection(content: string, name: string): string {
    const regex = new RegExp(`【${name}】\\s*\\n([\\s\\S]*?)(?=\\n【|$)`)
    const match = content.match(regex)
    return match && match[1] ? match[1].trim() : ''
  }

  private parseNpcDialogs(content: string): NpcDialog[] {
    const section = this.extractSection(content, 'NPC')
    if (!section) return []

    const dialogs: NpcDialog[] = []
    for (const line of section.split('\n')) {
      const trimmed = line.trim()
      const match = trimmed.match(/^([\u4e00-\u9fa5]+)[：:]\s*(.+)$/)
      if (match && match[1] && match[2]) {
        dialogs.push({ speaker: match[1], content: match[2] })
      }
    }
    return dialogs
  }

  private parseChoices(content: string): StoryChoice[] {
    const section = this.extractSection(content, '选择')
    if (!section) return []

    const choices: StoryChoice[] = []
    for (const line of section.split('\n')) {
      const trimmed = line.trim()

      // 标准格式：1. 文本 → 目标ID
      const match = trimmed.match(/^(\d+)\.\s*(.+?)\s*→\s*(\S+)$/)
      if (match && match[2] && match[3]) {
        choices.push({ text: match[2], targetId: match[3] })
        continue
      }

      // 结束标记格式（无箭头）：1. 卷一 完 或 1. 全剧终
      const endMatch = trimmed.match(/^(\d+)\.\s*(.+)$/)
      if (endMatch && endMatch[2]) {
        const choiceText = endMatch[2].trim()

        // 检查是否为卷结束标记：卷N 完
        if (/^卷\d+\s*完$/.test(choiceText)) {
          choices.push({
            text: choiceText,
            targetId: null,
            isEndMarker: true
          })
          continue
        }

        // 检查是否为故事结束标记：全剧终、故事完、结局
        if (/^(全剧终|故事完|结局)$/.test(choiceText)) {
          choices.push({
            text: choiceText,
            targetId: null,
            isEndMarker: true
          })
          continue
        }

        // 检查是否为结局标记：【结局：XXX】
        if (/^【结局[：:]\s*.+】$/.test(choiceText)) {
          choices.push({
            text: choiceText,
            targetId: null,
            isEndMarker: true
          })
          continue
        }
      }
    }
    return choices
  }

  private parseEffects(content: string): Effect[] {
    const section = this.extractSection(content, '效果')
    if (!section) return []

    const effects: Effect[] = []
    for (const line of section.split('\n')) {
      const effect = this.parseEffectLine(line.trim())
      if (effect) effects.push(effect)
    }
    return effects
  }

  private parseEffectLine(line: string): Effect | null {
    if (!line) return null

    let match = line.match(/^获得[：:]\s*(.+)$/)
    if (match && match[1]) return { type: 'gain_item', target: match[1].trim() }

    match = line.match(/^失去[：:]\s*(.+)$/)
    if (match && match[1]) return { type: 'lose_item', target: match[1].trim() }

    match = line.match(/^(.+?)好感\s*\+\s*(\d+)$/)
    if (match && match[1] && match[2]) {
      return { type: 'favor_up', target: match[1].trim(), value: parseInt(match[2]) }
    }

    match = line.match(/^(.+?)好感\s*-\s*(\d+)$/)
    if (match && match[1] && match[2]) {
      return { type: 'favor_down', target: match[1].trim(), value: parseInt(match[2]) }
    }

    match = line.match(/^(获得|解锁)线索[：:]\s*(.+)$/)
    if (match && match[2]) return { type: 'unlock_clue', target: match[2].trim() }

    match = line.match(/^路线[：:]\s*(.+)$/)
    if (match && match[1]) return { type: 'route', target: match[1].trim() }

    match = line.match(/^境界[：:]\s*(.+)$/)
    if (match && match[1]) return { type: 'realm', target: match[1].trim() }

    match = line.match(/^解锁能力[：:]\s*(.+)$/)
    if (match && match[1]) return { type: 'ability', target: match[1].trim() }

    match = line.match(/^解锁结局[：:]\s*(.+)$/)
    if (match && match[1]) return { type: 'ending', target: match[1].trim() }

    if (line.length > 0 && !line.startsWith('【')) {
      return { type: 'info', target: line }
    }

    return null
  }

  /**
   * 解析玩法触发配置
   * 格式：
   * 触发玩法：类型：目标ID
   *   参数：key=value
   *   失败：retry|skip|gameover
   *   失败跳转：nodeId
   */
  private parseGameplayTrigger(content: string): GameplayTrigger | undefined {
    const section = this.extractSection(content, '效果')
    if (!section) return undefined

    const lines = section.split('\n')
    let trigger: GameplayTrigger | undefined

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i]
      if (!rawLine) continue
      const line = rawLine.trim()

      // 匹配：触发玩法：类型：目标ID
      const triggerMatch = line.match(/^触发玩法[：:]\s*(战斗|收集|升级|探索|对话|解谜|自定义)[：:]\s*(.+)$/)
      if (triggerMatch && triggerMatch[1] && triggerMatch[2]) {
        const typeMap: Record<string, string> = {
          '战斗': 'battle',
          '收集': 'collect',
          '升级': 'upgrade',
          '探索': 'explore',
          '对话': 'dialog',
          '解谜': 'puzzle',
          '自定义': 'custom',
        }

        trigger = {
          type: typeMap[triggerMatch[1]] as GameplayTrigger['type'],
          targetId: triggerMatch[2].trim(),
        }

        // 解析后续的参数行（缩进的行）
        for (let j = i + 1; j < lines.length; j++) {
          const rawParamLine = lines[j]
          if (!rawParamLine) continue
          const paramLine = rawParamLine.trim()

          // 如果遇到新的效果行，停止解析参数
          if (paramLine && !paramLine.startsWith(' ') && !paramLine.startsWith('\t')) {
            if (/^(获得|失去|解锁|路线|境界|触发玩法)/.test(paramLine)) break
          }

          // 参数：key=value
          const paramMatch = paramLine.match(/^参数[：:]\s*(.+)$/)
          if (paramMatch && paramMatch[1] && trigger) {
            trigger.params = trigger.params || {}
            const params = paramMatch[1].split(',')
            for (const param of params) {
              const [key, value] = param.split('=').map(s => s.trim())
              if (key && value !== undefined) {
                trigger.params[key] = isNaN(Number(value)) ? value : Number(value)
              }
            }
          }

          // 失败处理
          const failMatch = paramLine.match(/^失败[：:]\s*(重试|跳过|结束|跳转)$/)
          if (failMatch && failMatch[1] && trigger) {
            const failMap: Record<string, string> = {
              '重试': 'retry',
              '跳过': 'skip',
              '结束': 'gameover',
              '跳转': 'goto',
            }
            trigger.onFailure = failMap[failMatch[1]] as GameplayTrigger['onFailure']
          }

          // 失败跳转节点
          const failNodeMatch = paramLine.match(/^失败跳转[：:]\s*(.+)$/)
          if (failNodeMatch && failNodeMatch[1] && trigger) {
            trigger.failureNodeId = failNodeMatch[1].trim()
          }

          // 完成后跳转节点
          const continueMatch = paramLine.match(/^完成后跳转[：:]\s*(.+)$/)
          if (continueMatch && continueMatch[1] && trigger) {
            trigger.continueNodeId = continueMatch[1].trim()
          }
        }

        break
      }
    }

    return trigger
  }

  private parsePerspective(value: string): Perspective {
    if (value === '男主' || value === 'male') return 'male'
    if (value === '女主' || value === 'female') return 'female'
    return 'common'
  }

  private parseTriggerType(value: string): TriggerType {
    if (value === '强制' || value === 'must') return 'must'
    if (value === '概率' || value === 'prob') return 'prob'
    if (value === '周目' || value === 'loop') return 'loop'
    if (value === '好感' || value === 'favor') return 'favor'
    if (value === '物品' || value === 'item') return 'item'
    return 'must'
  }

  private parseCharacterHeader(content: string): CharacterInfo | null {
    const nameMatch = content.match(/# 角色[：:]\s*(.+)/)
    const idMatch = content.match(/角色ID[：:]\s*(C\d+)/)
    if (!nameMatch || !idMatch || !nameMatch[1] || !idMatch[1]) return null

    return {
      id: idMatch[1],
      name: nameMatch[1].trim(),
      gender: '女',
      identity: '',
      relatedNodes: [],
      unlockLoop: 1,
      fallbackNode: null,
    }
  }
}

export const storyParser = new StoryParser()
