/**
 * 灵根系统 — 决定修炼速度、元素亲和、突破概率与功法学习限制
 * 有实际游戏效果，不只是文本描述
 */

export type RootElement = '金' | '木' | '水' | '火' | '土' | '雷' | '风' | '冰' | '空'

export type RootGrade = '杂灵根' | '双灵根' | '单灵根' | '天灵根' | '变异灵根'

export const ROOT_GRADE_ORDER: RootGrade[] = ['杂灵根', '双灵根', '单灵根', '天灵根', '变异灵根']

export interface SpiritRoot {
  primaryElement: RootElement
  grade: RootGrade
  secondaryElement?: RootElement
  cultivationSpeedBonus: number
  elementAffinity: number
  elementResistance: number
  breakthroughBonus: number
  learnableElements: RootElement[]
  skillSlots: number
  specialEffects?: string[]
}

export const ROOT_GRADE_STATS: Record<RootGrade, {
  cultivationSpeedBonus: number
  elementAffinity: number
  elementResistance: number
  breakthroughBonus: number
  skillSlots: number
  label: string
  color: string
}> = {
  '杂灵根': { cultivationSpeedBonus: 0, elementAffinity: 0, elementResistance: 0, breakthroughBonus: 0, skillSlots: 2, label: '资质驳杂', color: '#9ca3af' },
  '双灵根': { cultivationSpeedBonus: 0.1, elementAffinity: 0.1, elementResistance: 0.05, breakthroughBonus: 0.03, skillSlots: 3, label: '略有天赋', color: '#7eb8da' },
  '单灵根': { cultivationSpeedBonus: 0.2, elementAffinity: 0.15, elementResistance: 0.1, breakthroughBonus: 0.05, skillSlots: 4, label: '天赋异禀', color: '#b794f6' },
  '天灵根': { cultivationSpeedBonus: 0.3, elementAffinity: 0.25, elementResistance: 0.2, breakthroughBonus: 0.08, skillSlots: 5, label: '天资卓绝', color: '#f59e0b' },
  '变异灵根': { cultivationSpeedBonus: 0.4, elementAffinity: 0.35, elementResistance: 0.25, breakthroughBonus: 0.12, skillSlots: 6, label: '万中无一', color: '#ffd700' }
}

export function generateRandomRoot(): { grade: RootGrade; primary: RootElement; secondary?: RootElement } {
  const roll = Math.random()
  let grade: RootGrade
  if (roll < 0.35) grade = '杂灵根'
  else if (roll < 0.62) grade = '双灵根'
  else if (roll < 0.82) grade = '单灵根'
  else if (roll < 0.95) grade = '天灵根'
  else grade = '变异灵根'
  const base = ['金', '木', '水', '火', '土', '雷', '风', '冰', '空'] as RootElement[]
  const all = [...base]
  const primary = all[Math.floor(Math.random() * all.length)]!
  let secondary: RootElement | undefined
  if (grade === '双灵根' || grade === '杂灵根') {
    const filtered = base.filter(e => e !== primary)
    secondary = filtered[Math.floor(Math.random() * filtered.length)]
  }
  return { grade, primary, secondary }
}

export function buildSpiritRoot(input: { grade: RootGrade; primary: RootElement; secondary?: RootElement }): SpiritRoot {
  const base = ROOT_GRADE_STATS[input.grade]
  const learnable: RootElement[] = [input.primary]
  if (input.secondary) learnable.push(input.secondary)
  if (input.grade === '变异灵根') {
    learnable.push('金', '木', '水', '火', '土', '雷', '风', '冰', '空')
  }
  return {
    primaryElement: input.primary,
    grade: input.grade,
    secondaryElement: input.secondary,
    cultivationSpeedBonus: base.cultivationSpeedBonus,
    elementAffinity: base.elementAffinity,
    elementResistance: base.elementResistance,
    breakthroughBonus: base.breakthroughBonus,
    skillSlots: base.skillSlots,
    learnableElements: [...new Set(learnable)],
    specialEffects: input.grade === '变异灵根'
      ? ['可学习所有元素功法', '突破时概率触发异象']
      : undefined
  }
}

export function getSpiritRootName(root: SpiritRoot): string {
  const el = root.primaryElement
  if (root.grade === '双灵根' && root.secondaryElement) {
    return `${el}·${root.secondaryElement}双灵根`
  }
  if (root.grade === '杂灵根') return '杂灵根'
  if (root.grade === '变异灵根') return `${el}·${root.grade}`
  return `${el}系·${root.grade}`
}
