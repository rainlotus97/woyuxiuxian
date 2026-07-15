declare module '@xianxia/ui' {
  import type { App } from 'vue'

  export type XTone = 'jade' | 'gold' | 'rose' | 'stone'
  export type XIconName = string
  export interface XCultivationMetric { label: string; value: string | number; icon?: string; tone?: XTone }
  export interface XResourceItem { label: string; value: string | number; suffix?: string; icon?: string; tone?: XTone }
  export interface XTabItem { value: string; label: string; icon: string; disabled?: boolean }

  type XComponent = any
  export const XButton: XComponent
  export const XCard: XComponent
  export const XPanel: XComponent
  export const XIcon: XComponent
  export const XStatChip: XComponent
  export const XProgressBar: XComponent
  export const XAnnouncement: XComponent
  export const XDialog: XComponent
  export const XAvatarFrame: XComponent
  export const XTaskEntry: XComponent
  export const XActivityPanel: XComponent
  export const XPlayerHud: XComponent
  export const XTabBar: XComponent
  export const XCultivationPanel: XComponent
  export const XItemArt: XComponent
  export const XInventoryPanel: XComponent
  export const XEquipmentPanel: XComponent
  export const XUpgradePanel: XComponent
  export function useTheme(): any
  export function useAtlasSprite(...args: any[]): any
  const plugin: { install(app: App): void }
  export default plugin
}
