export type BloodlineGrade = '凡骨' | '灵血' | '古脉' | '圣体' | '禁忌'
export const BLOODLINE_GRADE_ORDER: BloodlineGrade[] = ['凡骨', '灵血', '古脉', '圣体', '禁忌']
export interface Bloodline {
  id: string; name: string; grade: BloodlineGrade; description: string
  statBonuses: { attackPercent: number; defensePercent: number; hpPercent: number; mpPercent: number; speedPercent: number }
  passiveSkills: string[]; cultivationBonus: number; breakthroughBonus: number
  intelligenceBonus: number; specialEventIds: string[]
  drawbacks?: { type: 'cultivation' | 'combat' | 'social'; description: string; value: number }[]
  evolvesTo?: BloodlineGrade
}
export interface BloodlineTemplate {
  id: string; name: string; grade: BloodlineGrade; description: string
  statBonuses: Bloodline['statBonuses']; passiveSkills: string[]
  cultivationBonus: number; breakthroughBonus: number; intelligenceBonus: number
  specialEventIds: string[]; drawbacks?: Bloodline['drawbacks']
  evolvesTo?: BloodlineGrade; probability: number
}
export const BLOODLINE_GRADE_BASE: Record<BloodlineGrade, { cultivationBonus: number; breakthroughBonus: number; intelligenceBonus: number; statPercent: number; label: string; color: string }> = {
  '凡骨': { cultivationBonus: 0, breakthroughBonus: 0, intelligenceBonus: 0, statPercent: 0, label: '凡俗之资', color: '#9ca3af' },
  '灵血': { cultivationBonus: 0.08, breakthroughBonus: 0.03, intelligenceBonus: 4, statPercent: 0.08, label: '灵血觉醒', color: '#7eb8da' },
  '古脉': { cultivationBonus: 0.15, breakthroughBonus: 0.06, intelligenceBonus: 8, statPercent: 0.15, label: '古脉传承', color: '#b794f6' },
  '圣体': { cultivationBonus: 0.25, breakthroughBonus: 0.10, intelligenceBonus: 14, statPercent: 0.25, label: '天生圣体', color: '#f59e0b' },
  '禁忌': { cultivationBonus: 0.35, breakthroughBonus: 0.15, intelligenceBonus: 20, statPercent: 0.35, label: '禁忌之力', color: '#ff4444' }
}
export const BLOODLINE_TEMPLATES: BloodlineTemplate[] = [
  { id: 'blood_sword_bone', name: '九幽剑骨', grade: '灵血', description: '天生剑骨，与剑道有着天然的共鸣。修炼剑法类功法事半功倍。', statBonuses: { attackPercent: 0.1, defensePercent: 0, hpPercent: 0, mpPercent: 0.05, speedPercent: 0.05 }, passiveSkills: ['passive_sword_affinity'], cultivationBonus: 0.08, breakthroughBonus: 0.03, intelligenceBonus: 4, specialEventIds: ['event_sword_tomb', 'event_sword_master'], probability: 0.08 },
  { id: 'blood_phoenix', name: '涅槃凤血', grade: '灵血', description: '体内流淌着凤凰血脉，浴火重生，火系功法有如神助。', statBonuses: { attackPercent: 0.05, defensePercent: 0, hpPercent: 0.15, mpPercent: 0.1, speedPercent: 0 }, passiveSkills: ['passive_fire_affinity', 'passive_rebirth'], cultivationBonus: 0.08, breakthroughBonus: 0.05, intelligenceBonus: 3, specialEventIds: ['event_phoenix_nest'], probability: 0.06 },
  { id: 'blood_thunder', name: '混沌雷体', grade: '灵血', description: '雷灵入体，天生亲近雷霆之力。渡劫时有独特的优势。', statBonuses: { attackPercent: 0.08, defensePercent: 0.05, hpPercent: 0, mpPercent: 0.08, speedPercent: 0.1 }, passiveSkills: ['passive_thunder_affinity'], cultivationBonus: 0.1, breakthroughBonus: 0.08, intelligenceBonus: 2, specialEventIds: ['event_thunder_tribulation'], probability: 0.06 },
  { id: 'blood_ice_heart', name: '冰心玉骨', grade: '凡骨', description: '心如冰清，神台清明。不易被心魔侵扰，修炼进度稳定。', statBonuses: { attackPercent: 0, defensePercent: 0.08, hpPercent: 0.05, mpPercent: 0.1, speedPercent: 0 }, passiveSkills: ['passive_mind_clarity'], cultivationBonus: 0.05, breakthroughBonus: 0.02, intelligenceBonus: 5, specialEventIds: [], probability: 0.15 },
  { id: 'blood_demon', name: '血魔之躯', grade: '凡骨', description: '体内有一丝魔血，暴戾好战。战斗时有额外爆发力，但易引心魔。', statBonuses: { attackPercent: 0.12, defensePercent: 0, hpPercent: 0.08, mpPercent: 0, speedPercent: 0.05 }, passiveSkills: ['passive_bloodlust'], cultivationBonus: 0.05, breakthroughBonus: 0, intelligenceBonus: 0, specialEventIds: ['event_demon_awakening'], drawbacks: [{ type: 'cultivation', description: '走火入魔概率+8%', value: 8 }], probability: 0.12 },
  { id: 'blood_void', name: '空冥之体', grade: '凡骨', description: '体质亲近空间之力，适合修炼阵法和遁术。', statBonuses: { attackPercent: 0, defensePercent: 0.05, hpPercent: 0, mpPercent: 0.15, speedPercent: 0.08 }, passiveSkills: ['passive_void_affinity'], cultivationBonus: 0.05, breakthroughBonus: 0.02, intelligenceBonus: 6, specialEventIds: ['event_void_temple'], probability: 0.12 },
  { id: 'blood_mortal', name: '凡俗之躯', grade: '凡骨', description: '普普通通的根骨，没有特殊之处。但一切皆有可能。', statBonuses: { attackPercent: 0, defensePercent: 0, hpPercent: 0, mpPercent: 0, speedPercent: 0 }, passiveSkills: [], cultivationBonus: 0, breakthroughBonus: 0, intelligenceBonus: 0, specialEventIds: [], probability: 0.41 }
]
export function generateRandomBloodline(): BloodlineTemplate {
  const roll = Math.random()
  let cumulative = 0
  for (const t of BLOODLINE_TEMPLATES) { cumulative += t.probability; if (roll < cumulative) return t }
  return BLOODLINE_TEMPLATES[BLOODLINE_TEMPLATES.length - 1]!
}
export function buildBloodline(t: BloodlineTemplate): Bloodline {
  return { id: t.id, name: t.name, grade: t.grade, description: t.description, statBonuses: { ...t.statBonuses }, passiveSkills: [...t.passiveSkills], cultivationBonus: t.cultivationBonus, breakthroughBonus: t.breakthroughBonus, intelligenceBonus: t.intelligenceBonus, specialEventIds: [...t.specialEventIds], drawbacks: t.drawbacks ? t.drawbacks.map(d => ({ ...d })) : undefined, evolvesTo: t.evolvesTo }
}
export function getBloodlineName(b: Bloodline): string { return `${b.name}（${b.grade}）` }
