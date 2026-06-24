/**
 * 存档/读档系统 — 多个存档槽位管理
 */
import { ref, computed } from 'vue'

const SAVE_KEY_PREFIX = 'woyu-xiuxian-save-'
const SAVE_INDEX_KEY = 'woyu-xiuxian-save-index'

export const MAX_SAVE_SLOTS = 5

export interface SaveSlotMeta {
  slotIndex: number
  playerName: string
  playerRealm: string
  playerLevel: number
  cultivation: number
  gold: number
  playTime: number
  savedAt: number
  savedAtLabel: string
  hasData: boolean
}

export function useSaveSlots() {
  const saveSlots = ref<SaveSlotMeta[]>([])

  /** 加载所有存档元数据 */
  function refreshSlots() {
    const slots: SaveSlotMeta[] = []
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      const key = `${SAVE_KEY_PREFIX}${i}`
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const data = JSON.parse(raw)
          slots.push({
            slotIndex: i,
            playerName: data.name || '未知修士',
            playerRealm: data.realm ? `${data.realm}${data.realmLevel || 1}层` : '未知境界',
            playerLevel: data.level || 1,
            cultivation: data.cultivation || 0,
            gold: data.gold || 0,
            playTime: (data.stats?.playTime || data.playTime) ?? 0,
            savedAt: data.savedAt || Date.now(),
            savedAtLabel: data.savedAt ? formatDate(data.savedAt) : '未知时间',
            hasData: true
          })
        } else {
          slots.push({
            slotIndex: i, playerName: '空', playerRealm: '—', playerLevel: 0,
            cultivation: 0, gold: 0, playTime: 0, savedAt: 0,
            savedAtLabel: '空', hasData: false
          })
        }
      } catch {
        slots.push({
          slotIndex: i, playerName: '损坏的存档', playerRealm: '—', playerLevel: 0,
          cultivation: 0, gold: 0, playTime: 0, savedAt: Date.now(),
          savedAtLabel: '损坏', hasData: false
        })
      }
    }
    saveSlots.value = slots
  }

  /** 保存到指定槽位 */
  function saveToSlot(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) return false
    try {
      // 收集所有当前游戏状态
      const gameData: Record<string, unknown> = {}
      const keys = Object.keys(localStorage)
      for (const key of keys) {
        if (key.startsWith('woyu-xiuxian-')) {
          try {
            gameData[key] = JSON.parse(localStorage.getItem(key) || '{}')
          } catch {
            gameData[key] = localStorage.getItem(key)
          }
        }
      }
      gameData.savedAt = Date.now()
      gameData._saveVersion = 1

      localStorage.setItem(`${SAVE_KEY_PREFIX}${slotIndex}`, JSON.stringify(gameData))
      // 记录最近使用的槽位
      localStorage.setItem(SAVE_INDEX_KEY, String(slotIndex))
      refreshSlots()
      return true
    } catch (e) {
      console.error('Failed to save to slot', slotIndex, e)
      return false
    }
  }

  /** 从指定槽位加载 */
  function loadFromSlot(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) return false
    try {
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotIndex}`)
      if (!raw) return false
      const gameData = JSON.parse(raw)

      // 恢复所有游戏状态
      for (const [key, value] of Object.entries(gameData)) {
        if (key.startsWith('woyu-xiuxian-') && key !== 'woyu-xiuxian-save-') {
          localStorage.setItem(key, JSON.stringify(value))
        }
      }

      localStorage.setItem(SAVE_INDEX_KEY, String(slotIndex))
      return true
    } catch (e) {
      console.error('Failed to load from slot', slotIndex, e)
      return false
    }
  }

  /** 获取最近使用的存档槽位 */
  function getLastSaveSlot(): number {
    try {
      return parseInt(localStorage.getItem(SAVE_INDEX_KEY) || '-1')
    } catch {
      return -1
    }
  }

  /** 是否有有效的存档 */
  const hasAnySave = computed(() => saveSlots.value.some(s => s.hasData))

  /** 格式化时间 */
  function formatDate(timestamp: number): string {
    const d = new Date(timestamp)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  refreshSlots()

  return {
    saveSlots, hasAnySave, getLastSaveSlot,
    saveToSlot, loadFromSlot, refreshSlots
  }
}
