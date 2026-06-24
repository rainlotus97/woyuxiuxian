import type { Component } from 'vue'
import { resolveGameIconComponent } from '@/game/theme/gameTheme'

/** 获取图标组件 */
export function useGameIcon(iconCode: string): Component {
  return resolveGameIconComponent(iconCode)
}

/** 批量将文字图标替换为 lucide 图标 */
export function getIconComponent(iconCode: string): Component {
  return resolveGameIconComponent(iconCode)
}
