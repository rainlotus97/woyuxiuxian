/**
 * 故事状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Perspective,
  StoryNode,
  Effect,
  Prerequisite,
  EndingInfo,
  StoryTermination,
  VolumeCompletion,
  StorySessionState,
  TriggerType,
} from './types'
import { storyCache } from './loader/cacheManager'
import { volumeLoader } from './loader/volumeLoader'
import { storyEventBus } from './eventBus'
// 以下模块待后续集成
// import { extensionManager } from './extensionManager'
// import { gameplayBridge } from './gameplayBridge'
// import { dictionaryParser } from './dictionaryParser'

// ============ 侧线任务信息 ============
export interface SideQuestInfo {
  id: string
  name: string
  characterId: string
  characterName: string
  triggerType: TriggerType
  priority: number
  prerequisites: Prerequisite[]
  isAvailable: boolean
  isCompleted: boolean
}

// ============ 通知接口 ============
export interface StoryNotification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  data?: unknown
}

export const useStoryStore = defineStore('story', () => {
  // ============ 核心状态 ============
  const currentVolume = ref(1)
  const currentNodeId = ref<string | null>(null)
  const currentPerspective = ref<Perspective>('male')
  const currentLoop = ref(1)

  // ============ 进度追踪 ============
  const completedNodes = ref<Set<string>>(new Set())
  const triggeredEventsThisLoop = ref<Set<string>>(new Set())
  const triggeredEventsAllTime = ref<Set<string>>(new Set())
  const currentRoute = ref<string | null>(null)
  const unlockedClues = ref<Set<string>>(new Set())
  const choiceHistory = ref<Map<string, number>>(new Map())

  // ============ 状态数据 ============
  const favorability = ref<Map<string, number>>(new Map())
  const storyItems = ref<Map<string, number>>(new Map())

  // ============ UI状态 ============
  const notifications = ref<StoryNotification[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const availableSideQuests = ref<SideQuestInfo[]>([])

  // ============ 结局系统状态 ============
  const unlockedEndings = ref<Map<string, EndingInfo>>(new Map())
  const volumeCompletions = ref<VolumeCompletion[]>([])
  const sessionState = ref<StorySessionState>({ status: 'idle' })

  // 结局字典（所有可能的结局）
  const allEndings: EndingInfo[] = [
    { id: 'END_NORMAL_001', name: '正道·轮回闭环', type: 'normal' },
    { id: 'END_NORMAL_002', name: '散修·轮回闭环', type: 'normal' },
    { id: 'END_NORMAL_003', name: '魔道·轮回闭环', type: 'normal' },
    { id: 'END_HIDDEN_001', name: '苏清鸢·万年相守', type: 'hidden' },
    { id: 'END_HIDDEN_002', name: '林清寒·生死相随', type: 'hidden' },
    { id: 'END_TRUE_001', name: '万劫归真·破局', type: 'true' },
  ]

  // ============ 计算属性 ============
  const currentNode = computed(() => {
    if (!currentNodeId.value) return null
    return storyCache.getNode(currentNodeId.value)
  })

  const allNodes = computed(() => storyCache.getAllNodes())
  const completedCount = computed(() => completedNodes.value.size)

  // 结局相关计算属性
  const unlockedEndingCount = computed(() => unlockedEndings.value.size)
  const totalEndingCount = computed(() => allEndings.length)
  const hasTrueEnding = computed(() => unlockedEndings.value.has('END_TRUE_001'))
  const currentTermination = computed(() => sessionState.value.termination)

  // ============ 初始化 ============
  async function initStory(perspective: Perspective, volume: number = 1) {
    isLoading.value = true
    currentPerspective.value = perspective
    currentVolume.value = volume

    try {
      // 加载卷内容
      await volumeLoader.loadVolume(volume, perspective)

      // 查找起始节点
      const prefix = `V${volume}${perspective === 'male' ? 'M' : 'F'}`
      const nodes = storyCache.getAllNodes()
      const startNode = nodes.find(n => n.id.startsWith(prefix) && n.id.endsWith('01'))

      if (startNode) {
        currentNodeId.value = startNode.id
      } else {
        createDefaultNode()
      }

      isInitialized.value = true
      isLoading.value = false
    } catch (error) {
      console.error('Failed to init story:', error)
      isLoading.value = false
      throw error
    }
  }

  // ============ 导航 ============
  async function goToNode(nodeId: string) {
    const node = storyCache.getNode(nodeId)
    if (!node) {
      console.error(`Node not found: ${nodeId}`)
      return
    }

    // 发射离开节点事件
    if (currentNodeId.value) {
      await storyEventBus.emit({
        type: 'node:leave',
        data: { nodeId: currentNodeId.value },
        nodeId: currentNodeId.value,
        volumeNumber: currentVolume.value
      })
    }

    currentNodeId.value = nodeId
    triggeredEventsThisLoop.value.add(nodeId)
    triggeredEventsAllTime.value.add(nodeId)

    // 发射进入节点事件
    await storyEventBus.emit({
      type: 'node:enter',
      data: { node },
      nodeId,
      volumeNumber: currentVolume.value
    })

    // 执行节点效果
    if (node.content.effects.length > 0) {
      await executeEffects(node.content.effects)
    }

    // 检查支线任务
    const availableQuests = checkAvailableSideQuests()
    if (availableQuests.length > 0) {
      await storyEventBus.emit({
        type: 'sidequest:available',
        data: { quests: availableQuests },
        nodeId,
        volumeNumber: currentVolume.value
      })
    }
  }

  async function makeChoice(choiceIndex: number) {
    const node = currentNode.value
    if (!node) {
      console.error('[makeChoice] No current node')
      return
    }

    console.log('[makeChoice] Current node:', node.id)
    console.log('[makeChoice] Available choices:', node.content.choices)
    console.log('[makeChoice] Selected index:', choiceIndex)

    const choice = node.content.choices[choiceIndex]
    if (!choice) {
      console.error('[makeChoice] Choice not found at index:', choiceIndex)
      return
    }

    console.log('[makeChoice] Selected choice:', choice)

    // 标记当前节点完成
    completedNodes.value.add(node.id)

    // 记录选择
    choiceHistory.value.set(node.id, choiceIndex)

    // 执行选项效果
    if (choice.effects && choice.effects.length > 0) {
      await executeEffects(choice.effects)
    }

    // 执行节点效果（结束节点的效果在节点本身定义）
    if (node.content.effects.length > 0) {
      await executeEffects(node.content.effects)
    }

    // 检查是否为结束标记
    if (choice.isEndMarker || choice.targetId === null) {
      console.log('[makeChoice] End marker detected')
      const termination = checkEndNode()
      if (termination) {
        endStory(termination)
      }
      return
    }

    // 检查目标节点是否存在
    const targetNode = storyCache.getNode(choice.targetId)
    console.log('[makeChoice] Target node exists:', !!targetNode, 'targetId:', choice.targetId)

    if (!targetNode) {
      showNotification(`节点 ${choice.targetId} 未找到`, 'error')
      console.error('[makeChoice] Target node not found:', choice.targetId)
      console.log('[makeChoice] Available nodes:', storyCache.getAllNodes().map(n => n.id))
      return
    }

    // 跳转到目标节点
    await goToNode(choice.targetId)
    console.log('[makeChoice] Jumped to node:', currentNodeId.value)
  }

  // ============ 支线任务 ============
  function checkAvailableSideQuests(): SideQuestInfo[] {
    const rules = storyCache.getTriggerRules(currentVolume.value)
    if (!rules) {
      availableSideQuests.value = []
      return []
    }

    const available: SideQuestInfo[] = []

    for (const rule of rules) {
      const event = storyCache.getEvent(rule.eventId)
      if (!event) continue

      // 检查周目要求
      if (event.unlockLoop > currentLoop.value) continue

      // 检查前置条件
      if (!checkPrerequisites(event.prerequisites)) continue

      const isCompleted = triggeredEventsAllTime.value.has(event.id)

      available.push({
        id: event.id,
        name: event.name,
        characterId: rule.characterId || 'unknown',
        characterName: getCharacterName(rule.characterId),
        triggerType: rule.triggerType,
        priority: rule.priority,
        prerequisites: event.prerequisites,
        isAvailable: true,
        isCompleted
      })
    }

    availableSideQuests.value = available
    return available
  }

  async function executeSideQuest(eventId: string): Promise<boolean> {
    const event = storyCache.getEvent(eventId)
    if (!event) return false

    if (!checkPrerequisites(event.prerequisites)) return false

    triggeredEventsThisLoop.value.add(eventId)
    triggeredEventsAllTime.value.add(eventId)

    if (event.content.effects.length > 0) {
      await executeEffects(event.content.effects)
    }

    showNotification(`触发支线事件: ${event.name}`, 'info', { event })
    return true
  }

  // ============ 效果执行 ============
  async function executeEffects(effects: Effect[]) {
    for (const effect of effects) {
      switch (effect.type) {
        case 'gain_item':
          if (effect.target) {
            addItem(effect.target, (effect.value as number) || 1)
            showNotification(`获得道具: ${effect.target}`, 'success')
          }
          break
        case 'lose_item':
          if (effect.target) {
            if (removeItem(effect.target, (effect.value as number) || 1)) {
              showNotification(`失去道具: ${effect.target}`, 'warning')
            }
          }
          break
        case 'favor_up':
          if (effect.target && typeof effect.value === 'number') {
            addFavorability(effect.target, effect.value)
            showNotification(`${effect.target}好感度 +${effect.value}`, 'success')
          }
          break
        case 'favor_down':
          if (effect.target && typeof effect.value === 'number') {
            addFavorability(effect.target, -effect.value)
            showNotification(`${effect.target}好感度 -${effect.value}`, 'warning')
          }
          break
        case 'gain_clue':
        case 'unlock_clue':
          if (effect.target) {
            addClue(effect.target)
            showNotification(`解锁线索: ${effect.target}`, 'success')
          }
          break
        case 'route':
          if (effect.target) {
            currentRoute.value = effect.target
            showNotification(`进入路线: ${effect.target}`, 'info')
          }
          break
        case 'info':
          if (effect.target) {
            showNotification(effect.target, 'info')
          }
          break
        case 'unlock_feature':
          if (effect.target) {
            showNotification(`解锁功能: ${effect.target}`, 'success')
          }
          break
        case 'ending':
          // 结局效果在 checkEndNode 中处理，这里只显示通知
          if (effect.target) {
            const endingInfo = allEndings.find(e => e.name === effect.target)
            if (endingInfo) {
              showNotification(`达成结局: ${effect.target}`, 'success')
            }
          }
          break
      }
    }
  }

  // ============ 条件检查 ============
  function checkPrerequisites(prerequisites: Prerequisite[]): boolean {
    if (!prerequisites || prerequisites.length === 0) return true

    return prerequisites.every(p => {
      switch (p.type) {
        case 'loop': {
          const value = p.value as number
          const op = p.operator || '>='
          if (op === '>=') return currentLoop.value >= value
          if (op === '<=') return currentLoop.value <= value
          if (op === '=') return currentLoop.value === value
          return currentLoop.value < value
        }
        case 'node_complete':
          return p.nodeId ? completedNodes.value.has(p.nodeId) : false
        case 'event_triggered':
          return triggeredEventsAllTime.value.has(p.value as string)
        case 'favor': {
          if (!p.characterId) return false
          const favor = favorability.value.get(p.characterId) || 0
          return favor >= (p.value as number)
        }
        case 'item': {
          if (!p.itemId) return false
          const count = storyItems.value.get(p.itemId) || 0
          if (p.operator === '>=') return count >= (p.value as number)
          return count > 0
        }
        case 'clue':
          return p.clueId ? unlockedClues.value.has(p.clueId) : false
        case 'route':
          return currentRoute.value === p.routeId
        case 'choice':
          return p.choiceRef ? choiceHistory.value.has(p.choiceRef) : false
        default:
          return true
      }
    })
  }

  // ============ 状态操作 ============
  function getFavorability(characterId: string): number {
    return favorability.value.get(characterId) || 0
  }

  function addFavorability(characterId: string, amount: number) {
    const current = favorability.value.get(characterId) || 0
    favorability.value.set(characterId, current + amount)
  }

  function addItem(itemId: string, count: number = 1) {
    const current = storyItems.value.get(itemId) || 0
    storyItems.value.set(itemId, current + count)
  }

  function removeItem(itemId: string, count: number = 1): boolean {
    const current = storyItems.value.get(itemId) || 0
    if (current < count) return false
    storyItems.value.set(itemId, current - count)
    return true
  }

  function hasItem(itemId: string): boolean {
    return (storyItems.value.get(itemId) || 0) > 0
  }

  function addClue(clueId: string) {
    unlockedClues.value.add(clueId)
  }

  // ============ 结局系统方法 ============

  /**
   * 检查当前节点是否为结束节点
   */
  function checkEndNode(): StoryTermination | null {
    const node = currentNode.value
    if (!node) return null

    const choices = node.content.choices

    // 检查是否有结束标记或没有有效选项
    const hasEndMarker = choices.some(c => c.isEndMarker || c.targetId === null)
    const hasNoChoices = choices.length === 0

    if (!hasEndMarker && !hasNoChoices) return null

    // 从效果中获取结局信息
    const endingEffect = node.content.effects.find(e => e.type === 'ending')

    // 检测结束标记类型
    const endChoice = choices.find(c => c.isEndMarker)
    const choiceText = endChoice?.text || ''

    // 判断是卷结束还是全剧终
    const isVolumeEnd = /^卷\d+\s*完$/.test(choiceText)
    const isStoryEnd = /^(全剧终|故事完|结局)$/.test(choiceText)

    if (isVolumeEnd || (!isStoryEnd && endingEffect)) {
      // 卷结束
      const volumeNum = choiceText.match(/^卷(\d+)/)?.[1]
      const volumeNumber = volumeNum ? parseInt(volumeNum) : currentVolume.value

      return {
        reason: 'volume_end',
        volumeNumber,
        hasNextVolume: checkNextVolumeExists(volumeNumber + 1),
        nextVolumeId: volumeNumber + 1,
        canContinue: checkNextVolumeExists(volumeNumber + 1),
        timestamp: Date.now()
      }
    }

    if (endingEffect && endingEffect.target) {
      // 结局解锁
      const endingInfo = allEndings.find(e => e.name === endingEffect.target)

      if (endingInfo) {
        // 解锁结局
        unlockEnding(endingInfo.id, endingInfo)

        return {
          reason: 'ending_unlocked',
          endingInfo: {
            ...endingInfo,
            unlockedAt: Date.now(),
            loopNumber: currentLoop.value
          },
          canContinue: endingInfo.type !== 'true',
          timestamp: Date.now()
        }
      }
    }

    if (isStoryEnd) {
      // 全剧终
      return {
        reason: 'story_end',
        canContinue: false,
        timestamp: Date.now()
      }
    }

    // 默认：卷结束
    return {
      reason: 'volume_end',
      volumeNumber: currentVolume.value,
      hasNextVolume: checkNextVolumeExists(currentVolume.value + 1),
      canContinue: checkNextVolumeExists(currentVolume.value + 1),
      timestamp: Date.now()
    }
  }

  /**
   * 检查下一卷是否存在
   */
  function checkNextVolumeExists(nextVolume: number): boolean {
    try {
      const modules = import.meta.glob('/src/assets/story/volume-*/main.md', { query: '?raw', eager: true })
      const path = `/src/assets/story/volume-${nextVolume}/main.md`
      return path in modules
    } catch {
      return false
    }
  }

  /**
   * 解锁结局
   */
  function unlockEnding(endingId: string, info: EndingInfo) {
    if (!unlockedEndings.value.has(endingId)) {
      unlockedEndings.value.set(endingId, {
        ...info,
        unlockedAt: Date.now(),
        loopNumber: currentLoop.value
      })
      showNotification(`解锁结局: ${info.name}`, 'success')
      saveToLocalStorage()
    }
  }

  /**
   * 获取结局信息
   */
  function getEndingInfo(endingId: string): EndingInfo | undefined {
    return unlockedEndings.value.get(endingId)
  }

  /**
   * 获取所有结局列表（带解锁状态）
   */
  function getAllEndingsWithStatus(): (EndingInfo & { unlocked: boolean })[] {
    return allEndings.map(ending => ({
      ...ending,
      unlocked: unlockedEndings.value.has(ending.id),
      unlockedAt: unlockedEndings.value.get(ending.id)?.unlockedAt,
      loopNumber: unlockedEndings.value.get(ending.id)?.loopNumber
    }))
  }

  /**
   * 完成当前卷
   */
  function completeVolume(endingId?: string) {
    const completion: VolumeCompletion = {
      volumeNumber: currentVolume.value,
      completedAt: Date.now(),
      endingId,
      routeId: currentRoute.value || undefined,
      perspective: currentPerspective.value,
      loopNumber: currentLoop.value
    }

    // 避免重复记录
    const exists = volumeCompletions.value.some(
      c => c.volumeNumber === completion.volumeNumber &&
           c.perspective === completion.perspective &&
           c.loopNumber === completion.loopNumber
    )

    if (!exists) {
      volumeCompletions.value.push(completion)
    }

    saveToLocalStorage()
  }

  /**
   * 跳转到下一卷
   */
  async function transitionToNextVolume(): Promise<boolean> {
    const nextVolume = currentVolume.value + 1

    if (!checkNextVolumeExists(nextVolume)) {
      console.error('Next volume does not exist:', nextVolume)
      return false
    }

    // 完成当前卷
    completeVolume()

    // 加载下一卷
    await volumeLoader.loadVolume(nextVolume, currentPerspective.value)

    // 查找起始节点
    const startNode = storyCache.getStartNode(currentPerspective.value, nextVolume)

    if (startNode) {
      currentVolume.value = nextVolume
      currentNodeId.value = startNode.id
      sessionState.value = { status: 'playing' }
      return true
    }

    console.error('Start node not found for volume:', nextVolume)
    return false
  }

  /**
   * 中断故事
   */
  function suspendStory() {
    sessionState.value = {
      status: 'suspended'
    }
    saveToLocalStorage()
  }

  /**
   * 标记故事结束
   */
  function endStory(termination: StoryTermination) {
    sessionState.value = {
      status: 'ended',
      termination
    }

    // 如果有结局，完成当前卷
    if (termination.reason === 'ending_unlocked' && termination.endingInfo) {
      completeVolume(termination.endingInfo.id)
    } else if (termination.reason === 'volume_end') {
      completeVolume()
    }

    saveToLocalStorage()
  }

  /**
   * 重置故事状态（用于重新开始）
   */
  function resetStory() {
    currentNodeId.value = null
    completedNodes.value.clear()
    triggeredEventsThisLoop.value.clear()
    currentRoute.value = null
    sessionState.value = { status: 'idle' }
    saveToLocalStorage()
  }

  function getCharacterName(characterId: string | null): string {
    if (!characterId) return '未知'
    const info = storyCache.getCharacterInfo(characterId)
    return info?.name || characterId
  }

  // ============ 通知管理 ============
  function showNotification(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    data?: unknown
  ) {
    const id = `notify_${Date.now()}_${Math.random().toString(36).slice(2)}`
    notifications.value.push({ id, message, type, data })

    setTimeout(() => dismissNotification(id), 3000)
  }

  function dismissNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearNotifications() {
    notifications.value = []
  }

  // ============ 周目管理 ============
  function startNewLoop() {
    triggeredEventsThisLoop.value.clear()
    currentLoop.value++
    saveToLocalStorage()
    showNotification(`第${currentLoop.value}周目开始`, 'info')
  }

  function exitStory() {
    saveToLocalStorage()
    currentNodeId.value = null
    isInitialized.value = false
  }

  async function continueStory(newPerspective?: Perspective) {
    // 如果传入了新的视角，且与当前保存的视角不同，则重新开始
    if (newPerspective && newPerspective !== currentPerspective.value) {
      console.log('[continueStory] Perspective changed from', currentPerspective.value, 'to', newPerspective, '- starting new story')
      await initStory(newPerspective, 1)
      return
    }

    if (currentNodeId.value) {
      // 需要重新加载故事文件到缓存中（页面刷新后缓存会被清空）
      console.log('[continueStory] Reloading story files for volume', currentVolume.value, 'perspective', currentPerspective.value)
      await volumeLoader.loadVolume(currentVolume.value, currentPerspective.value)

      // 验证节点是否存在
      const node = storyCache.getNode(currentNodeId.value)
      console.log('[continueStory] Current node exists:', !!node, 'id:', currentNodeId.value)

      if (!node) {
        // 如果节点不存在，可能是缓存问题，重新初始化
        console.log('[continueStory] Node not found in cache, reinitializing...')
        await initStory(currentPerspective.value, currentVolume.value)
        return
      }

      isInitialized.value = true
    } else {
      await initStory(currentPerspective.value, currentVolume.value)
    }
  }

  // ============ 持久化 ============
  function saveToLocalStorage() {
    try {
      const data = {
        currentVolume: currentVolume.value,
        currentLoop: currentLoop.value,
        currentPerspective: currentPerspective.value,
        currentNodeId: currentNodeId.value,
        completedNodes: Array.from(completedNodes.value),
        triggeredEventsAllTime: Array.from(triggeredEventsAllTime.value),
        unlockedClues: Array.from(unlockedClues.value),
        currentRoute: currentRoute.value,
        favorability: Object.fromEntries(favorability.value),
        storyItems: Object.fromEntries(storyItems.value),
        choiceHistory: Object.fromEntries(choiceHistory.value),
        // 结局系统数据
        unlockedEndings: Object.fromEntries(unlockedEndings.value),
        volumeCompletions: volumeCompletions.value,
        sessionState: sessionState.value,
      }
      localStorage.setItem('story_save_data', JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save story data:', e)
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('story_save_data')
      if (saved) {
        const data = JSON.parse(saved)
        currentVolume.value = data.currentVolume || 1
        currentLoop.value = data.currentLoop || 1
        currentPerspective.value = data.currentPerspective || 'male'
        currentNodeId.value = data.currentNodeId || null
        completedNodes.value = new Set(data.completedNodes || [])
        triggeredEventsAllTime.value = new Set(data.triggeredEventsAllTime || [])
        unlockedClues.value = new Set(data.unlockedClues || [])
        currentRoute.value = data.currentRoute || null
        if (data.favorability) {
          favorability.value = new Map(Object.entries(data.favorability))
        }
        if (data.storyItems) {
          storyItems.value = new Map(Object.entries(data.storyItems))
        }
        if (data.choiceHistory) {
          choiceHistory.value = new Map(Object.entries(data.choiceHistory))
        }
        // 加载结局系统数据
        if (data.unlockedEndings) {
          unlockedEndings.value = new Map(Object.entries(data.unlockedEndings))
        }
        if (data.volumeCompletions) {
          volumeCompletions.value = data.volumeCompletions
        }
        if (data.sessionState) {
          sessionState.value = data.sessionState
        }
      }
    } catch (e) {
      console.error('Failed to load story data:', e)
    }
  }

  // ============ 默认节点 ============
  function createDefaultNode() {
    const testNode: StoryNode = {
      id: 'V1M01',
      name: '乱葬岗醒魂',
      perspective: 'male',
      map: '青阳城·乱葬岗',
      prerequisites: [],
      unlockLoop: 1,
      fallbackNode: null,
      content: {
        text: '阴冷的风卷着腐叶掠过耳畔。你在一片乱葬岗中睁开眼，浑身酸痛,记忆模糊,只记得自己叫凌辰,是个无依无靠的孤儿。身旁,一本无字古书静静躺在泥地里,书页微微颤动.',
        maleText: '你拾起古书,指尖传来一阵熟悉的滚烫.',
        femaleText: '你感应到古书中有某种力量在呼唤你.',
        npcDialogs: [
          { speaker: '神秘声音', content: '凌辰……第一万次……醒来了……' }
        ],
        choices: [
          { text: '伸手拾起古书', targetId: 'V1M02', effects: [{ type: 'gain_item', target: '归忆录' }] },
          { text: '心生警惕,转身离开', targetId: 'V1M03' }
        ],
        effects: [
          { type: 'info', target: '剧情正式启动' },
          { type: 'unlock_clue', target: '世界在循环' }
        ]
      }
    }

    storyCache.cacheNode(testNode, 1)
    currentNodeId.value = 'V1M01'
  }

  // 自动保存
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', saveToLocalStorage)
  }

  // 初始化时加载
  loadFromLocalStorage()

  return {
    // 状态
    currentVolume,
    currentNodeId,
    currentPerspective,
    currentLoop,
    completedNodes,
    triggeredEventsThisLoop,
    triggeredEventsAllTime,
    currentRoute,
    unlockedClues,
    favorability,
    storyItems,
    choiceHistory,
    notifications,
    isLoading,
    isInitialized,
    availableSideQuests,

    // 结局系统状态
    unlockedEndings,
    volumeCompletions,
    sessionState,

    // 计算属性
    currentNode,
    allNodes,
    completedCount,
    unlockedEndingCount,
    totalEndingCount,
    hasTrueEnding,
    currentTermination,

    // 方法
    initStory,
    goToNode,
    makeChoice,
    executeSideQuest,
    checkAvailableSideQuests,
    checkPrerequisites,
    executeEffects,
    getFavorability,
    addFavorability,
    addItem,
    removeItem,
    hasItem,
    addClue,
    getCharacterName,
    showNotification,
    dismissNotification,
    clearNotifications,
    startNewLoop,
    exitStory,
    continueStory,
    saveToLocalStorage,
    loadFromLocalStorage,

    // 结局系统方法
    checkEndNode,
    checkNextVolumeExists,
    unlockEnding,
    getEndingInfo,
    getAllEndingsWithStatus,
    completeVolume,
    transitionToNextVolume,
    suspendStory,
    endStory,
    resetStory,
  }
})
