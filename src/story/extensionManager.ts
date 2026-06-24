/** 存根实现 - 扩展管理器 */
export class ExtensionManager {
  register() { return this }
  getExtensions() { return [] }
}
export const extensionManager = new ExtensionManager()
