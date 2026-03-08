/**
 * 数据字典解析器
 * 解析 dictionary.md 中的物品、线索、角色等定义
 */

export interface DictionaryItem {
  id: string
  name: string
  type: '道具' | '消耗品' | '线索' | '能力' | '路线' | '境界' | '结局'
  category: string
  inheritRule: string
  description?: string
}

export interface DictionaryCharacter {
  id: string
  name: string
  identity: string
}

export class DictionaryParser {
  private items: Map<string, DictionaryItem> = new Map()
  private clues: Map<string, DictionaryItem> = new Map()
  private characters: Map<string, DictionaryCharacter> = new Map()
  private abilities: Map<string, DictionaryItem> = new Map()
  private routes: Map<string, DictionaryItem> = new Map()
  private realms: Map<string, DictionaryItem> = new Map()
  private endings: Map<string, DictionaryItem> = new Map()

  private loaded = false

  /**
   * 解析字典内容
   */
  parse(content: string): void {
    this.clear()

    // 解析道具
    this.parseTable(content, '道具字典', (row) => {
      const item: DictionaryItem = {
        id: row[1] || '',
        name: row[0] || '',
        type: row[2] === '消耗道具' ? '消耗品' : '道具',
        category: row[2] || '',
        inheritRule: row[3] || ''
      }
      if (item.id && item.name) {
        this.items.set(item.id, item)
        this.items.set(item.name, item) // 同时按名称索引
      }
    })

    // 解析线索
    this.parseTable(content, '线索字典', (row) => {
      const item: DictionaryItem = {
        id: row[1] || '',
        name: row[0] || '',
        type: '线索',
        category: row[2] || '',
        inheritRule: row[3] || ''
      }
      if (item.id && item.name) {
        this.clues.set(item.id, item)
        this.clues.set(item.name, item)
      }
    })

    // 解析角色
    this.parseTable(content, '角色字典', (row) => {
      const char: DictionaryCharacter = {
        id: row[1] || '',
        name: row[0] || '',
        identity: row[2] || ''
      }
      if (char.id && char.name) {
        this.characters.set(char.id, char)
        this.characters.set(char.name, char)
      }
    })

    // 解析能力
    this.parseTable(content, '能力字典', (row) => {
      const item: DictionaryItem = {
        id: row[1] || '',
        name: row[0] || '',
        type: '能力',
        category: '能力',
        inheritRule: '永久'
      }
      if (item.id && item.name) {
        this.abilities.set(item.id, item)
        this.abilities.set(item.name, item)
      }
    })

    // 解析路线
    this.parseTable(content, '路线字典', (row) => {
      const item: DictionaryItem = {
        id: row[1] || '',
        name: row[0] || '',
        type: '路线',
        category: '路线',
        inheritRule: '本周目'
      }
      if (item.id && item.name) {
        this.routes.set(item.id, item)
        this.routes.set(item.name, item)
      }
    })

    // 解析境界
    this.parseTable(content, '境界字典', (row) => {
      const item: DictionaryItem = {
        id: row[1] || '',
        name: row[0] || '',
        type: '境界',
        category: '境界',
        inheritRule: '永久'
      }
      if (item.id && item.name) {
        this.realms.set(item.id, item)
        this.realms.set(item.name, item)
      }
    })

    // 解析结局
    this.parseTable(content, '结局字典', (row) => {
      const item: DictionaryItem = {
        id: row[1] || '',
        name: row[0] || '',
        type: '结局',
        category: row[2] || '',
        inheritRule: '永久'
      }
      if (item.id && item.name) {
        this.endings.set(item.id, item)
        this.endings.set(item.name, item)
      }
    })

    this.loaded = true
    console.log('[DictionaryParser] Dictionary loaded:', {
      items: this.items.size,
      clues: this.clues.size,
      characters: this.characters.size,
      abilities: this.abilities.size,
      routes: this.routes.size,
      realms: this.realms.size,
      endings: this.endings.size
    })
  }

  /**
   * 解析表格
   */
  private parseTable(
    content: string,
    tableName: string,
    handler: (row: string[]) => void
  ): void {
    // 找到表格区域
    const sectionRegex = new RegExp(`## .*${tableName}[\\s\\S]*?(?=##|$)`, 'i')
    const match = content.match(sectionRegex)
    if (!match) return

    const tableContent = match[0]

    // 解析表格行
    const lines = tableContent.split('\n')
    for (const line of lines) {
      // 跳过表头和分隔符
      if (line.includes('|') && !line.startsWith('| ') && !line.includes('---')) {
        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0)

        if (cells.length >= 2) {
          handler(cells)
        }
      }
    }
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.items.clear()
    this.clues.clear()
    this.characters.clear()
    this.abilities.clear()
    this.routes.clear()
    this.realms.clear()
    this.endings.clear()
    this.loaded = false
  }

  /**
   * 获取物品
   * @param key 物品ID或名称
   */
  getItem(key: string): DictionaryItem | undefined {
    return this.items.get(key)
  }

  /**
   * 获取线索
   * @param key 线索ID或名称
   */
  getClue(key: string): DictionaryItem | undefined {
    return this.clues.get(key)
  }

  /**
   * 获取角色
   * @param key 角色ID或名称
   */
  getCharacter(key: string): DictionaryCharacter | undefined {
    return this.characters.get(key)
  }

  /**
   * 获取能力
   * @param key 能力ID或名称
   */
  getAbility(key: string): DictionaryItem | undefined {
    return this.abilities.get(key)
  }

  /**
   * 获取路线
   * @param key 路线ID或名称
   */
  getRoute(key: string): DictionaryItem | undefined {
    return this.routes.get(key)
  }

  /**
   * 获取境界
   * @param key 境界ID或名称
   */
  getRealm(key: string): DictionaryItem | undefined {
    return this.realms.get(key)
  }

  /**
   * 获取结局
   * @param key 结局ID或名称
   */
  getEnding(key: string): DictionaryItem | undefined {
    return this.endings.get(key)
  }

  /**
   * 是否已加载
   */
  isLoaded(): boolean {
    return this.loaded
  }

  /**
   * 获取所有物品
   */
  getAllItems(): DictionaryItem[] {
    const seen = new Set<string>()
    const result: DictionaryItem[] = []
    for (const item of this.items.values()) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        result.push(item)
      }
    }
    return result
  }

  /**
   * 获取所有线索
   */
  getAllClues(): DictionaryItem[] {
    const seen = new Set<string>()
    const result: DictionaryItem[] = []
    for (const clue of this.clues.values()) {
      if (!seen.has(clue.id)) {
        seen.add(clue.id)
        result.push(clue)
      }
    }
    return result
  }

  /**
   * 获取所有角色
   */
  getAllCharacters(): DictionaryCharacter[] {
    const seen = new Set<string>()
    const result: DictionaryCharacter[] = []
    for (const char of this.characters.values()) {
      if (!seen.has(char.id)) {
        seen.add(char.id)
        result.push(char)
      }
    }
    return result
  }

  /**
   * 检查物品是否应该同步到玩家背包
   * @param key 物品ID或名称
   */
  shouldSyncToInventory(key: string): boolean {
    const item = this.getItem(key)
    if (!item) return false

    // 继承规则为"同步背包"或"跨周目继承"的物品需要同步
    return item.inheritRule === '同步背包' ||
           item.inheritRule === '跨周目继承' ||
           item.type === '消耗品'
  }
}

// 导出单例实例
export const dictionaryParser = new DictionaryParser()
