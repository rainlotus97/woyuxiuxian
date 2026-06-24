import type {
  AptitudeProfile,
  BloodlineGrade,
  ConstitutionType,
  DestinyRank,
  FactionStance,
  GrowthFlaw,
  NpcDefinition,
  NpcOriginType,
  NpcRuntimeState,
  RelationshipState,
  RootGrade,
  TalentGrade
} from '@/types/world'

export const ROOT_GRADE_LABELS: Record<RootGrade, string> = {
  mixed: '杂灵根',
  dual: '双灵根',
  single: '单灵根',
  heavenly: '天灵根',
  mutated: '异灵根'
}

export const TALENT_GRADE_LABELS: Record<TalentGrade, string> = {
  mortal: '凡才',
  good: '良才',
  spirit: '灵才',
  genius: '天骄',
  monster: '妖孽',
  destined: '命定'
}

export const ORIGIN_TYPE_LABELS: Record<NpcOriginType, string> = {
  mortal_village: '凡俗寒门',
  cultivator_clan: '修真世家',
  sect_foundling: '宗门遗孤',
  fallen_house: '破落门第',
  ancient_lineage: '古脉后裔',
  beast_blood: '妖血混脉',
  wanderer: '流亡散修',
  outer_realm: '界外遗民'
}

export const DESTINY_RANK_LABELS: Record<DestinyRank, string> = {
  ordinary: '平命',
  fated: '有缘',
  anomalous: '异数',
  legendary: '大来头'
}

export const BLOODLINE_GRADE_LABELS: Record<BloodlineGrade, string> = {
  none: '无显血脉',
  thin: '薄血',
  awakened: '血脉初醒',
  ancient: '古血',
  forbidden: '禁血'
}

export const CONSTITUTION_LABELS: Record<ConstitutionType, string> = {
  ordinary_body: '凡体',
  sword_bone: '剑骨',
  medicine_body: '药灵体',
  demon_blood: '妖魔血躯',
  star_meridian: '星脉',
  void_meridian: '空冥脉',
  thunder_body: '雷劫体',
  ice_heart: '冰心体'
}

export const FACTION_STANCE_LABELS: Record<FactionStance, string> = {
  orthodox: '正道',
  neutral: '中立',
  demonic: '魔道',
  beast: '妖族',
  rogue: '散修',
  imperial: '仙朝'
}

export const GROWTH_FLAW_LABELS: Record<GrowthFlaw, string> = {
  none: '无明显缺陷',
  heart_demon: '心魔',
  weak_body: '体弱',
  unstable_meridian: '经脉不稳',
  vengeful: '复仇执念',
  oath_bound: '誓约束缚',
  greedy_impulse: '贪念易动',
  reckless_breakthrough: '破境冒进'
}

const TALENT_WEIGHTS: Record<TalentGrade, number> = {
  mortal: 6,
  good: 12,
  spirit: 20,
  genius: 28,
  monster: 36,
  destined: 42
}

const ROOT_GRADE_WEIGHTS: Record<RootGrade, number> = {
  mixed: 2,
  dual: 8,
  single: 14,
  heavenly: 20,
  mutated: 22
}

const DESTINY_RANK_WEIGHTS: Record<DestinyRank, number> = {
  ordinary: 0,
  fated: 6,
  anomalous: 12,
  legendary: 18
}

const BLOODLINE_WEIGHTS: Record<BloodlineGrade, number> = {
  none: 0,
  thin: 4,
  awakened: 9,
  ancient: 14,
  forbidden: 17
}

const CONSTITUTION_WEIGHTS: Record<ConstitutionType, number> = {
  ordinary_body: 0,
  sword_bone: 9,
  medicine_body: 7,
  demon_blood: 10,
  star_meridian: 10,
  void_meridian: 12,
  thunder_body: 11,
  ice_heart: 8
}

const GROWTH_FLAW_PRESSURE: Record<GrowthFlaw, number> = {
  none: 0,
  heart_demon: 9,
  weak_body: 6,
  unstable_meridian: 8,
  vengeful: 7,
  oath_bound: 5,
  greedy_impulse: 6,
  reckless_breakthrough: 8
}

export const DEFAULT_APTITUDE_EXTENSIONS: Pick<AptitudeProfile, 'bloodlineGrade' | 'constitution' | 'growthFlaws'> = {
  bloodlineGrade: 'none',
  constitution: 'ordinary_body',
  growthFlaws: []
}

export const DEFAULT_PROFILE_EXTENSIONS: Pick<NpcDefinition['profile'], 'bloodline' | 'constitutionNote' | 'factionStance'> = {
  bloodline: '未显血脉',
  constitutionNote: '体质平常，尚未显出特殊异象。',
  factionStance: 'neutral'
}

export function getRootGradeLabel(grade: RootGrade) {
  return ROOT_GRADE_LABELS[grade]
}

export function getTalentGradeLabel(grade: TalentGrade) {
  return TALENT_GRADE_LABELS[grade]
}

export function getOriginTypeLabel(type: NpcOriginType) {
  return ORIGIN_TYPE_LABELS[type]
}

export function getDestinyRankLabel(rank: DestinyRank) {
  return DESTINY_RANK_LABELS[rank]
}

export function getBloodlineGradeLabel(grade: BloodlineGrade) {
  return BLOODLINE_GRADE_LABELS[grade]
}

export function getConstitutionLabel(type: ConstitutionType) {
  return CONSTITUTION_LABELS[type]
}

export function getFactionStanceLabel(stance: FactionStance) {
  return FACTION_STANCE_LABELS[stance]
}

export function getGrowthFlawLabel(flaw: GrowthFlaw) {
  return GROWTH_FLAW_LABELS[flaw]
}

export function normalizeNpcDefinitionProfile(definition: NpcDefinition): NpcDefinition {
  return {
    ...definition,
    aptitude: {
      ...DEFAULT_APTITUDE_EXTENSIONS,
      ...definition.aptitude,
      growthFlaws: definition.aptitude.growthFlaws ?? DEFAULT_APTITUDE_EXTENSIONS.growthFlaws
    },
    profile: {
      ...DEFAULT_PROFILE_EXTENSIONS,
      ...definition.profile
    }
  }
}

export function getBondLabel(bond: RelationshipState['bond']) {
  const labels: Record<RelationshipState['bond'], string> = {
    stranger: '陌路',
    friend: '友善',
    rival: '争锋',
    enemy: '仇敌',
    mentor: '师承',
    companion: '同行',
    lover: '情愫'
  }
  return labels[bond]
}

export function getNpcRootLabel(aptitude: AptitudeProfile) {
  if (aptitude.rootGrade === 'single') {
    return `${aptitude.root}灵根`
  }
  if (aptitude.rootGrade === 'heavenly') {
    return `${aptitude.root}天灵根`
  }
  if (aptitude.rootGrade === 'mutated') {
    return `${aptitude.root}异灵根`
  }
  if (aptitude.rootGrade === 'dual') {
    return `主${aptitude.root}双灵根`
  }
  return `主${aptitude.root}杂灵根`
}

export function getNpcPotentialScore(definition: NpcDefinition) {
  const aptitudeBase = definition.aptitude.comprehension * 0.34
    + definition.aptitude.luck * 0.16
    + definition.aptitude.physique * 0.2
    + definition.aptitude.willpower * 0.2
  const talentBonus = TALENT_WEIGHTS[definition.aptitude.talent]
  const rootBonus = ROOT_GRADE_WEIGHTS[definition.aptitude.rootGrade]
  const destinyBonus = DESTINY_RANK_WEIGHTS[definition.profile.destinyRank] * 1.25
  const bloodlineBonus = BLOODLINE_WEIGHTS[definition.aptitude.bloodlineGrade] ?? 0
  const constitutionBonus = CONSTITUTION_WEIGHTS[definition.aptitude.constitution] ?? 0
  const flawPenalty = (definition.aptitude.growthFlaws ?? [])
    .reduce((total, flaw) => total + (flaw === 'none' ? 0 : 2), 0)
  return Math.max(1, Math.min(100, Math.round(aptitudeBase * 0.48 + talentBonus + rootBonus + destinyBonus + bloodlineBonus + constitutionBonus - flawPenalty)))
}

export function getNpcDestinyPressure(definition: NpcDefinition) {
  return TALENT_WEIGHTS[definition.aptitude.talent]
    + ROOT_GRADE_WEIGHTS[definition.aptitude.rootGrade]
    + DESTINY_RANK_WEIGHTS[definition.profile.destinyRank]
    + (BLOODLINE_WEIGHTS[definition.aptitude.bloodlineGrade] ?? 0)
    + (CONSTITUTION_WEIGHTS[definition.aptitude.constitution] ?? 0)
    + (definition.aptitude.growthFlaws ?? []).reduce((total, flaw) => total + (GROWTH_FLAW_PRESSURE[flaw] ?? 0), 0)
}

export function getNpcPowerScore(definition: NpcDefinition, state: NpcRuntimeState) {
  return state.realmLevel * 18
    + state.cultivation / 18
    + getNpcPotentialScore(definition) * 1.35
    + state.notoriety * 1.2
}

export function getNpcTemperamentSummary(definition: NpcDefinition) {
  const traits: string[] = []
  const { ambition, loyalty, cruelty, affection, caution, greed } = definition.personality

  if (ambition >= 82) traits.push('锋芒毕露')
  else if (ambition >= 62) traits.push('不甘人后')

  if (caution >= 80) traits.push('谋定后动')
  else if (caution <= 32) traits.push('行险求机')

  if (cruelty >= 78) traits.push('手段酷烈')
  else if (affection >= 74) traits.push('重情念旧')

  if (loyalty >= 78) traits.push('守序顾宗')
  else if (greed >= 76) traits.push('逐利多变')

  if (definition.aptitude.growthFlaws?.includes('heart_demon')) traits.push('心魔暗伏')
  else if (definition.aptitude.growthFlaws?.includes('reckless_breakthrough')) traits.push('破境冒进')

  return traits.slice(0, 2).join(' · ') || '气机内敛'
}

export function getNpcLineageSummary(definition: NpcDefinition) {
  const bloodline = getBloodlineGradeLabel(definition.aptitude.bloodlineGrade)
  const constitution = getConstitutionLabel(definition.aptitude.constitution)
  return `${bloodline} · ${constitution}`
}

export function getNpcGrowthFlawSummary(definition: NpcDefinition) {
  const flaws = (definition.aptitude.growthFlaws ?? []).filter(flaw => flaw !== 'none')
  if (!flaws.length) return GROWTH_FLAW_LABELS.none
  return flaws.map(getGrowthFlawLabel).slice(0, 2).join(' · ')
}

export function getNpcSpotlightScore(
  definition: NpcDefinition,
  state: NpcRuntimeState,
  relationship: RelationshipState,
  unlocked = false
) {
  let score = getNpcPotentialScore(definition) * 1.5
    + state.realmLevel * 10
    + state.notoriety * 1.8
    + DESTINY_RANK_WEIGHTS[definition.profile.destinyRank] * 9

  if (definition.role === 'main') score += 36
  if (definition.role === 'companion') score += 20
  if (unlocked) score += 12
  if (state.hpState === 'injured' || state.hpState === 'captured' || state.hpState === 'critical') {
    score += 10
  }

  score += Math.min(28, relationship.favor * 0.2 + relationship.hatred * 0.14 + relationship.debt * 0.16 + relationship.fear * 0.1)

  return score
}

export function formatNpcNotoriety(notoriety: number) {
  if (notoriety >= 82) return '名震一界'
  if (notoriety >= 56) return '声名鹊起'
  if (notoriety >= 30) return '小有凶名'
  if (notoriety >= 12) return '初露锋芒'
  return '尚在潜藏'
}
