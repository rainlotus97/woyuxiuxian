/**
 * 扩展管理器
 * 支持注册自定义效果处理器、条件检查器和事件钩子
 */
import type {
  StoryExtension,
  StoryPublicAPI,
  EffectHandler,
  ConditionChecker,
  Effect,
  EffectContext,
  Prerequisite
} from './types'

export class ExtensionManager {
  private extensions: Map<string, StoryExtension> = new Map()
  private customEffectHandlers: Map<string, EffectHandler> = new Map()
  private customConditionCheckers: Map<string, ConditionChecker> = new Map()
  private api: StoryPublicAPI | null = null

  /**
   * 初始化扩展管理器
   * @param api 公共API实例
   */
  init(api: StoryPublicAPI): void {
    this.api = api
  }

  /**
   * 注册扩展
   * @param extension 扩展定义
   */
  async register(extension: StoryExtension): Promise<void> {
    if (this.extensions.has(extension.id)) {
      console.warn(`[ExtensionManager] Extension ${extension.id} is already registered`)
      return
    }

    // 注册效果处理器
    if (extension.effectHandlers) {
      for (const [effectType, handler] of Object.entries(extension.effectHandlers)) {
        this.customEffectHandlers.set(effectType, handler)
        console.log(`[ExtensionManager] Registered effect handler: ${effectType}`)
      }
    }

    // 注册条件检查器
    if (extension.conditionCheckers) {
      for (const [conditionType, checker] of Object.entries(extension.conditionCheckers)) {
        this.customConditionCheckers.set(conditionType, checker)
        console.log(`[ExtensionManager] Registered condition checker: ${conditionType}`)
      }
    }

    // 保存扩展
    this.extensions.set(extension.id, extension)

    // 调用初始化
    if (extension.init && this.api) {
      try {
        await extension.init(this.api)
        console.log(`[ExtensionManager] Extension ${extension.id} initialized`)
      } catch (error) {
        console.error(`[ExtensionManager] Failed to initialize extension ${extension.id}:`, error)
        // 回滚注册
        this.unregister(extension.id)
        throw error
      }
    }
  }

  /**
   * 注销扩展
   * @param extensionId 扩展ID
   */
  unregister(extensionId: string): void {
    const extension = this.extensions.get(extensionId)
    if (!extension) {
      console.warn(`[ExtensionManager] Extension ${extensionId} not found`)
      return
    }

    // 移除效果处理器
    if (extension.effectHandlers) {
      for (const effectType of Object.keys(extension.effectHandlers)) {
        this.customEffectHandlers.delete(effectType)
      }
    }

    // 移除条件检查器
    if (extension.conditionCheckers) {
      for (const conditionType of Object.keys(extension.conditionCheckers)) {
        this.customConditionCheckers.delete(conditionType)
      }
    }

    // 调用销毁
    if (extension.destroy) {
      try {
        extension.destroy()
      } catch (error) {
        console.error(`[ExtensionManager] Error destroying extension ${extensionId}:`, error)
      }
    }

    this.extensions.delete(extensionId)
    console.log(`[ExtensionManager] Extension ${extensionId} unregistered`)
  }

  /**
   * 检查是否有自定义效果处理器
   * @param effectType 效果类型
   */
  hasEffectHandler(effectType: string): boolean {
    return this.customEffectHandlers.has(effectType)
  }

  /**
   * 执行自定义效果
   * @param effect 效果对象
   * @param context 执行上下文
   * @returns 是否成功执行
   */
  async executeCustomEffect(effect: Effect, context: EffectContext): Promise<boolean> {
    const handler = this.customEffectHandlers.get(effect.type)
    if (handler) {
      try {
        await handler(effect, context)
        return true
      } catch (error) {
        console.error(`[ExtensionManager] Error executing custom effect ${effect.type}:`, error)
        return false
      }
    }
    return false
  }

  /**
   * 检查是否有自定义条件检查器
   * @param conditionType 条件类型
   */
  hasConditionChecker(conditionType: string): boolean {
    return this.customConditionCheckers.has(conditionType)
  }

  /**
   * 执行自定义条件检查
   * @param prerequisite 前置条件
   * @returns 检查结果，null表示无对应检查器
   */
  checkCustomCondition(prerequisite: Prerequisite): boolean | null {
    const checker = this.customConditionCheckers.get(prerequisite.type)
    if (checker) {
      try {
        return checker(prerequisite)
      } catch (error) {
        console.error(`[ExtensionManager] Error checking condition ${prerequisite.type}:`, error)
        return false
      }
    }
    return null
  }

  /**
   * 获取所有已注册的扩展
   */
  getExtensions(): StoryExtension[] {
    return Array.from(this.extensions.values())
  }

  /**
   * 获取指定扩展
   * @param extensionId 扩展ID
   */
  getExtension(extensionId: string): StoryExtension | undefined {
    return this.extensions.get(extensionId)
  }

  /**
   * 检查扩展是否已注册
   * @param extensionId 扩展ID
   */
  hasExtension(extensionId: string): boolean {
    return this.extensions.has(extensionId)
  }

  /**
   * 获取所有自定义效果类型
   */
  getCustomEffectTypes(): string[] {
    return Array.from(this.customEffectHandlers.keys())
  }

  /**
   * 获取所有自定义条件类型
   */
  getCustomConditionTypes(): string[] {
    return Array.from(this.customConditionCheckers.keys())
  }

  /**
   * 清除所有扩展
   */
  clear(): void {
    // 先调用所有扩展的销毁方法
    for (const extension of this.extensions.values()) {
      if (extension.destroy) {
        try {
          extension.destroy()
        } catch (error) {
          console.error(`[ExtensionManager] Error destroying extension ${extension.id}:`, error)
        }
      }
    }

    this.extensions.clear()
    this.customEffectHandlers.clear()
    this.customConditionCheckers.clear()
  }
}

// 导出单例实例
export const extensionManager = new ExtensionManager()
