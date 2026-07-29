import { ALL_AREAS } from '@/types/map'
import { ALL_SECTS, type SectDefinition, type SectSpecialty } from '@/types/sect'
import { REALM_ORDER, type Realm } from '@/types/unit'
import { SKILL_DEFINITIONS } from '@/game/battle/config/skills'
import type {
  BloodlineGrade,
  ConstitutionType,
  DestinyRank,
  FactionStance,
  GrowthFlaw,
  NpcDefinition,
  NpcOriginType,
  NpcRuntimeState,
  RootGrade,
  TalentGrade
} from '@/types/world'
import { getNpcPotentialScore, normalizeNpcDefinitionProfile } from './npcProfile'
import { seededWorldRoll } from './worldSeed'
import { HAND_CRAFTED_NPCS } from "./npcHandCrafted"

const SURNAMES = ['沈', '顾', '谢', '陆', '苏', '林', '韩', '白', '宁', '叶', '温', '秦', '萧', '洛', '祁', '商']
const MALE_GIVEN_NAMES = ['长渊', '景玄', '玄策', '临川', '寒岳', '北辰', '知晦', '云峥', '少衡', '烬川', '远霄', '惊鸿']
const FEMALE_GIVEN_NAMES = ['清漪', '听雪', '明漱', '映竹', '知微', '晚霁', '栖梧', '月蘅', '扶摇', '灵汐', '凝霜', '若璃']
const ROGUE_TITLES = ['山海散修', '异乡行者', '无门客', '游方炼士', '边荒修者', '夜行客']

const SPECIALTY_ROOTS: Record<SectSpecialty, Array<NpcDefinition['aptitude']['root']>> = {
  炼丹: ['火', '木'],
  锻造: ['火', '金', '土'],
  符箓: ['木', '雷', '空'],
  阵法: ['土', '空', '水'],
  御兽: ['木', '土', '风'],
  剑修: ['金', '水', '雷'],
  体修: ['土', '火', '金'],
  魔修: ['火', '空', '冰']
}

const SPECIALTY_TITLES: Record<SectSpecialty, string[]> = {
  炼丹: ['丹阁真传', '药炉守脉人', '百草亲传'],
  锻造: ['铸器嫡传', '火坊掌锤', '玄炉行者'],
  符箓: ['符阵司录', '灵箓传人', '禁纹使'],
  阵法: ['阵枢弟子', '星盘传人', '天机掌纹'],
  御兽: ['驭灵弟子', '妖契行者', '兽苑执符'],
  剑修: ['剑脉真传', '山门剑侍', '问锋弟子'],
  体修: ['战躯传人', '横练行者', '镇岳弟子'],
  魔修: ['魔门真种', '血狱传人', '夜劫使']
}

const SPECIALTY_SKILL_IDS: Record<SectSpecialty, string[]> = {
  炼丹: ['heal', 'team_heal'],
  锻造: ['basic_sword', 'iron_skin'],
  符箓: ['fireball', 'ancient_curse'],
  阵法: ['shield', 'ancient_seal'],
  御兽: ['basic_sword', 'shield'],
  剑修: ['basic_sword', 'sword_qi'],
  体修: ['basic_sword', 'iron_skin'],
  魔修: ['shadow_strike', 'hellfire']
}

const ROOT_SKILL_IDS: Record<NpcDefinition['aptitude']['root'], string> = {
  金: 'sword_qi',
  木: 'poison_fog',
  水: 'shield',
  火: 'fireball',
  土: 'iron_skin',
  雷: 'thunder_strike',
  冰: 'ice_prison',
  风: 'shadow_strike',
  空: 'ancient_curse'
}

function resolveNpcSkillIds(seedIds: string[]) {
  const resolved: string[] = []
  const visited = new Set<string>()

  const visit = (skillId: string) => {
    if (visited.has(skillId)) return
    visited.add(skillId)

    const definition = SKILL_DEFINITIONS[skillId]
    if (!definition) return

    const prerequisites = definition.requirements?.skillIds ?? definition.prerequisites ?? []
    prerequisites.forEach(visit)
    resolved.push(skillId)
  }

  seedIds.forEach(visit)
  return resolved.slice(0, 4)
}

function deriveNpcSkillIds(
  sect: SectDefinition | null,
  role: NpcDefinition['role'],
  root: NpcDefinition['aptitude']['root']
) {
  const specialtySkills = sect ? SPECIALTY_SKILL_IDS[sect.specialty] : []
  const roleSkill = role === 'enemy'
    ? 'shadow_strike'
    : role === 'companion'
      ? 'heal'
      : 'basic_sword'

  return resolveNpcSkillIds([
    ...specialtySkills,
    ROOT_SKILL_IDS[root],
    roleSkill
  ])
}

const DESTINY_TEMPLATES: Record<DestinyRank, string[]> = {
  ordinary: ['守成', '藏锋', '小成'],
  fated: ['奇缘', '同道', '机兆'],
  anomalous: ['异数', '逆命', '隐劫'],
  legendary: ['大来头', '轮回', '古传']
}

const CONSTITUTION_NOTES: Record<ConstitutionType, string> = {
  ordinary_body: '体质平常，胜在根基稳定。',
  sword_bone: '骨相如剑，适合剑修与杀伐法门。',
  medicine_body: '经脉亲近草木丹气，炼丹与疗愈天赋更高。',
  demon_blood: '血气凶烈，爆发强但更易招来杀劫。',
  star_meridian: '星力入脉，悟性与人事牵引都异于常人。',
  void_meridian: '空冥入体，适合阵法、遁术与奇门法。',
  thunder_body: '雷意淬身，破境凶险但战力成长极快。',
  ice_heart: '心湖似冰，抗心魔强，但情感线推进更慢。'
}

function pickFromSeed<T>(items: T[], ...parts: Array<number | string>) {
  const index = Math.floor(seededWorldRoll(...parts) * items.length) % items.length
  return items[index]!
}

function clampStat(value: number) {
  return Math.max(24, Math.min(99, Math.round(value)))
}

function getRealmIndex(realm: Realm) {
  return REALM_ORDER.indexOf(realm)
}

function shiftRealm(realm: Realm, steps: number) {
  return REALM_ORDER[Math.max(0, Math.min(REALM_ORDER.length - 1, getRealmIndex(realm) + steps))]!
}

function deriveGender(...parts: Array<number | string>) {
  return seededWorldRoll(...parts) > 0.48 ? 'male' : 'female'
}

function deriveName(gender: NpcDefinition['gender'], ...parts: Array<number | string>) {
  const surname = pickFromSeed(SURNAMES, ...parts, 'surname')
  const given = gender === 'male'
    ? pickFromSeed(MALE_GIVEN_NAMES, ...parts, 'given')
    : pickFromSeed(FEMALE_GIVEN_NAMES, ...parts, 'given')
  return `${surname}${given}`
}

function deriveRoot(sect: SectDefinition | null, ...parts: Array<number | string>) {
  if (!sect) {
    return pickFromSeed<NpcDefinition['aptitude']['root']>(['金', '木', '水', '火', '土', '风', '冰'], ...parts, 'root')
  }
  return pickFromSeed(SPECIALTY_ROOTS[sect.specialty], sect.id, ...parts, 'root')
}

function deriveRootGrade(sect: SectDefinition | null, ...parts: Array<number | string>): RootGrade {
  const roll = seededWorldRoll(sect?.id ?? 'rogue', ...parts, 'root-grade')
  if (roll > 0.94) return 'mutated'
  if (roll > 0.84) return 'heavenly'
  if (roll > 0.62) return 'single'
  if (roll > 0.34) return 'dual'
  return 'mixed'
}

function deriveTalent(sect: SectDefinition | null, role: NpcDefinition['role'], ...parts: Array<number | string>): TalentGrade {
  const roll = seededWorldRoll(sect?.id ?? 'rogue', role, ...parts, 'talent')
  const boost = sect?.realm === '仙界' ? 0.1 : sect?.realm === '魔界' ? 0.06 : 0
  const value = Math.min(1, roll + boost)
  if (value > 0.975) return 'destined'
  if (value > 0.9) return 'monster'
  if (value > 0.72) return 'genius'
  if (value > 0.48) return 'spirit'
  if (value > 0.22) return 'good'
  return 'mortal'
}

function deriveOriginType(sect: SectDefinition | null, role: NpcDefinition['role'], ...parts: Array<number | string>): NpcOriginType {
  if (!sect) {
    return pickFromSeed<NpcOriginType>(['wanderer', 'mortal_village', 'fallen_house', 'outer_realm'], ...parts, 'origin')
  }
  if (role === 'enemy' && sect.realm === '魔界') return pickFromSeed<NpcOriginType>(['beast_blood', 'fallen_house', 'ancient_lineage'], sect.id, ...parts, 'origin')
  if (sect.realm === '仙界') return pickFromSeed<NpcOriginType>(['ancient_lineage', 'cultivator_clan', 'outer_realm'], sect.id, ...parts, 'origin')
  if (sect.specialty === '御兽') return pickFromSeed<NpcOriginType>(['beast_blood', 'sect_foundling', 'cultivator_clan'], sect.id, ...parts, 'origin')
  return pickFromSeed<NpcOriginType>(['cultivator_clan', 'sect_foundling', 'fallen_house', 'mortal_village'], sect.id, ...parts, 'origin')
}

function deriveDestinyRank(talent: TalentGrade, rootGrade: RootGrade, ...parts: Array<number | string>): DestinyRank {
  const roll = seededWorldRoll(...parts, 'destiny-rank')
  if (talent === 'destined' || (talent === 'monster' && rootGrade === 'mutated')) return 'legendary'
  if (talent === 'monster' || rootGrade === 'heavenly') return roll > 0.42 ? 'anomalous' : 'fated'
  if (talent === 'genius' || rootGrade === 'single') return roll > 0.55 ? 'fated' : 'ordinary'
  return roll > 0.86 ? 'fated' : 'ordinary'
}

function deriveBloodlineGrade(originType: NpcOriginType, destinyRank: DestinyRank, ...parts: Array<number | string>): BloodlineGrade {
  const roll = seededWorldRoll(...parts, originType, destinyRank, 'bloodline-grade')
  if (originType === 'ancient_lineage') return destinyRank === 'legendary' || roll > 0.48 ? 'ancient' : 'awakened'
  if (originType === 'beast_blood') return roll > 0.82 ? 'forbidden' : roll > 0.28 ? 'awakened' : 'thin'
  if (originType === 'outer_realm') return roll > 0.76 ? 'forbidden' : roll > 0.46 ? 'awakened' : 'thin'
  if (destinyRank === 'legendary') return roll > 0.62 ? 'ancient' : 'awakened'
  if (destinyRank === 'anomalous') return roll > 0.68 ? 'awakened' : 'thin'
  return roll > 0.82 ? 'thin' : 'none'
}

function deriveConstitution(
  root: NpcDefinition['aptitude']['root'],
  sect: SectDefinition | null,
  originType: NpcOriginType,
  bloodlineGrade: BloodlineGrade,
  ...parts: Array<number | string>
): ConstitutionType {
  if (originType === 'beast_blood' || bloodlineGrade === 'forbidden') return 'demon_blood'
  if (root === '空') return 'void_meridian'
  if (root === '雷') return 'thunder_body'
  if (root === '冰') return 'ice_heart'
  if (sect?.specialty === '剑修' || root === '金') return seededWorldRoll(...parts, 'sword-body') > 0.42 ? 'sword_bone' : 'ordinary_body'
  if (sect?.specialty === '炼丹' || root === '木') return seededWorldRoll(...parts, 'medicine-body') > 0.46 ? 'medicine_body' : 'ordinary_body'
  if (bloodlineGrade === 'ancient' || bloodlineGrade === 'awakened') return seededWorldRoll(...parts, 'star-body') > 0.58 ? 'star_meridian' : 'ordinary_body'
  return 'ordinary_body'
}

function deriveGrowthFlaws(
  talent: TalentGrade,
  constitution: ConstitutionType,
  personality: NpcDefinition['personality'],
  bloodlineGrade: BloodlineGrade,
  ...parts: Array<number | string>
): GrowthFlaw[] {
  const flaws: GrowthFlaw[] = []
  if ((talent === 'monster' || talent === 'destined') && seededWorldRoll(...parts, 'heart-demon') > 0.72) flaws.push('heart_demon')
  if (constitution === 'ordinary_body' && personality.ambition > 78 && seededWorldRoll(...parts, 'reckless') > 0.62) flaws.push('reckless_breakthrough')
  if (constitution === 'demon_blood' || bloodlineGrade === 'forbidden') flaws.push('unstable_meridian')
  if (personality.cruelty > 76 && personality.affection < 34) flaws.push('vengeful')
  if (personality.loyalty > 84 && seededWorldRoll(...parts, 'oath') > 0.54) flaws.push('oath_bound')
  if (personality.greed > 78) flaws.push('greedy_impulse')
  if (constitution === 'ice_heart' && seededWorldRoll(...parts, 'weak-body') > 0.66) flaws.push('weak_body')
  return Array.from(new Set(flaws)).slice(0, 2)
}

function deriveFactionStance(sect: SectDefinition | null, originType: NpcOriginType, role: NpcDefinition['role']): FactionStance {
  if (!sect) return originType === 'beast_blood' ? 'beast' : 'rogue'
  if (sect.realm === '魔界' || sect.specialty === '魔修' || role === 'enemy') return 'demonic'
  if (sect.realm === '仙界') return 'imperial'
  if (sect.specialty === '御兽' && originType === 'beast_blood') return 'beast'
  return 'orthodox'
}

function buildBloodlineText(originType: NpcOriginType, bloodlineGrade: BloodlineGrade) {
  const source: Record<NpcOriginType, string> = {
    mortal_village: '凡俗血脉',
    cultivator_clan: '修真家族血脉',
    sect_foundling: '宗门收养旧脉',
    fallen_house: '败落旧族血脉',
    ancient_lineage: '上古残脉',
    beast_blood: '妖血混脉',
    wanderer: '散修漂泊血脉',
    outer_realm: '界外异血'
  }
  if (bloodlineGrade === 'none') return `${source[originType]}尚未显化`
  if (bloodlineGrade === 'thin') return `${source[originType]}仅有微弱回响`
  if (bloodlineGrade === 'awakened') return `${source[originType]}已经初步觉醒`
  if (bloodlineGrade === 'ancient') return `${source[originType]}保留古老真意`
  return `${source[originType]}带有禁忌污染`
}

function buildAptitude(
  sect: SectDefinition | null,
  role: NpcDefinition['role'],
  ...parts: Array<number | string>
): NpcDefinition['aptitude'] {
  const root = deriveRoot(sect, ...parts)
  const rootGrade = deriveRootGrade(sect, ...parts)
  const talent = deriveTalent(sect, role, ...parts)
  const originType = deriveOriginType(sect, role, ...parts)
  const destinyRank = deriveDestinyRank(talent, rootGrade, ...parts)
  const bloodlineGrade = deriveBloodlineGrade(originType, destinyRank, ...parts)
  const constitution = deriveConstitution(root, sect, originType, bloodlineGrade, ...parts)
  const base = {
    mortal: 38,
    good: 50,
    spirit: 64,
    genius: 77,
    monster: 86,
    destined: 93
  }[talent]
  const rootBonus = {
    mixed: -6,
    dual: 0,
    single: 6,
    heavenly: 10,
    mutated: 12
  }[rootGrade]

  const personality = buildPersonality(role, sect, ...parts)

  return {
    root,
    rootGrade,
    talent,
    bloodlineGrade,
    constitution,
    comprehension: clampStat(base + rootBonus + seededWorldRoll(...parts, 'comp') * 11 - 5),
    luck: clampStat(base - 4 + seededWorldRoll(...parts, 'luck') * 18 - 6),
    physique: clampStat(base - 8 + seededWorldRoll(...parts, 'physique') * 20 - 6),
    willpower: clampStat(base - 5 + seededWorldRoll(...parts, 'will') * 18 - 6),
    growthFlaws: deriveGrowthFlaws(talent, constitution, personality, bloodlineGrade, ...parts)
  }
}

function buildPersonality(role: NpcDefinition['role'], sect: SectDefinition | null, ...parts: Array<number | string>) {
  const realmBias = sect?.realm === '魔界' ? 12 : sect?.realm === '仙界' ? -4 : 0
  return {
    ambition: clampStat(42 + realmBias + seededWorldRoll(...parts, 'ambition') * 46),
    loyalty: clampStat(36 + (sect ? 12 : -4) + seededWorldRoll(...parts, 'loyalty') * 44),
    cruelty: clampStat((role === 'enemy' ? 40 : 12) + seededWorldRoll(...parts, 'cruelty') * 42),
    affection: clampStat(28 + (role === 'companion' ? 18 : 0) + seededWorldRoll(...parts, 'affection') * 48),
    caution: clampStat(30 + seededWorldRoll(...parts, 'caution') * 50),
    greed: clampStat(18 + (sect?.specialty === '魔修' ? 12 : 0) + seededWorldRoll(...parts, 'greed') * 44)
  }
}

function buildFamilyStatus(originType: NpcOriginType, sect: SectDefinition | null) {
  const map: Record<NpcOriginType, string> = {
    mortal_village: '出身寒门，无显赫根脚',
    cultivator_clan: '家族仍在经营修士人脉',
    sect_foundling: '自幼由宗门抚养长大',
    fallen_house: '旧族倾颓，只余残谱与旧债',
    ancient_lineage: '体内仍留有古脉余辉',
    beast_blood: '血脉混杂，常受外界忌惮',
    wanderer: '无门无派，只凭自己闯荡',
    outer_realm: '来历存疑，似非此界故民'
  }
  return sect ? `${map[originType]}，与${sect.name}有深浅不一的牵连。` : map[originType]
}

function buildIdentityHook(role: NpcDefinition['role'], sect: SectDefinition | null, destinyRank: DestinyRank) {
  if (!sect) {
    return destinyRank === 'legendary' ? '似乎带着某种被掩藏的前尘因果。' : '行踪无定，常在不同界域间流转。'
  }
  if (role === 'enemy') return `被${sect.name}视作可用之刃，也可能成为失控的祸种。`
  if (role === 'companion') return `既可能成为并肩同行之人，也可能在宗门利益前犹疑。`
  return `其命数与${sect.name}的兴衰已有明显绑定。`
}

function buildDestinyTags(sect: SectDefinition | null, destinyRank: DestinyRank, role: NpcDefinition['role'], originType: NpcOriginType) {
  const tags = [
    pickFromSeed(DESTINY_TEMPLATES[destinyRank], sect?.id ?? 'rogue', role, 'destiny-tag'),
    sect?.specialty ?? '散修',
    originType === 'ancient_lineage' ? '古脉余烬' : originType === 'beast_blood' ? '血脉异动' : '命路未定'
  ]
  if (role === 'enemy') tags.push('潜在反派')
  if (role === 'companion') tags.push('同行候选')
  return Array.from(new Set(tags))
}

function buildBackground(
  name: string,
  sect: SectDefinition | null,
  role: NpcDefinition['role'],
  originType: NpcOriginType,
  destinyRank: DestinyRank
) {
  const realmText = sect ? `${sect.name}门下` : '无门无派'
  const originText = {
    mortal_village: '自凡尘中摸索踏上仙路',
    cultivator_clan: '承继家族旧法修行',
    sect_foundling: '幼时便与宗门命运相连',
    fallen_house: '背负破败旧族的余烬',
    ancient_lineage: '身负古老血脉余痕',
    beast_blood: '体内潜伏异血回响',
    wanderer: '漂泊诸地，从不肯久留',
    outer_realm: '来历缥缈，言行都带着异域痕迹'
  }[originType]
  const rankText = {
    ordinary: '只求在乱世中守住一线生机',
    fated: '命中似有几场未完的相逢',
    anomalous: '其命线常会偏离常理',
    legendary: '其存在本身便会牵动一方局势'
  }[destinyRank]
  const roleText = role === 'enemy'
    ? '一旦失控，很容易成为玩家世界线中的强敌。'
    : role === 'companion'
      ? '若与你结识，极可能衍生出稳定的同行线。'
      : '在宗门与界域冲突中都可能留下自己的痕迹。'

  return `${name}${originText}，如今栖身于${realmText}。${rankText}，${roleText}`
}

function deriveGeneratedRole(sect: SectDefinition, ...parts: Array<number | string>): NpcDefinition['role'] {
  if (sect.realm === '魔界' || sect.specialty === '魔修') return 'enemy'
  if (sect.specialty === '炼丹' || sect.specialty === '御兽') {
    return seededWorldRoll(sect.id, ...parts, 'role') > 0.58 ? 'companion' : 'sect'
  }
  return 'sect'
}

function buildSectNpcDefinition(sect: SectDefinition): NpcDefinition {
  const role = deriveGeneratedRole(sect, 'sect-core')
  const gender = deriveGender(sect.id, 'gender')
  const name = deriveName(gender, sect.id, 'name')
  const aptitude = buildAptitude(sect, role, sect.id)
  const originType = deriveOriginType(sect, role, sect.id)
  const destinyRank = deriveDestinyRank(aptitude.talent, aptitude.rootGrade, sect.id)
  const title = pickFromSeed(SPECIALTY_TITLES[sect.specialty], sect.id, 'title')
  const factionStance = deriveFactionStance(sect, originType, role)

  return normalizeNpcDefinitionProfile({
    id: `npc_${sect.id}_core`,
    name,
    gender,
    role,
    homeMapId: sect.areaId,
    sectId: sect.id,
    affiliation: { organizationId: sect.id, organizationKind: 'sect' },
    skills: deriveNpcSkillIds(sect, role, aptitude.root),
    aptitude,
    personality: buildPersonality(role, sect, sect.id),
    profile: {
      title,
      origin: sect.background.slice(0, 24),
      originType,
      background: buildBackground(name, sect, role, originType, destinyRank),
      familyStatus: buildFamilyStatus(originType, sect),
      identityHook: buildIdentityHook(role, sect, destinyRank),
      destinyRank,
      destinyTags: buildDestinyTags(sect, destinyRank, role, originType),
      bloodline: buildBloodlineText(originType, aptitude.bloodlineGrade),
      constitutionNote: CONSTITUTION_NOTES[aptitude.constitution],
      factionStance
    },
    tags: [sect.specialty, sect.realm, role === 'enemy' ? '敌线候选' : '宗门角色']
  })
}

function buildRogueNpcDefinition(areaId: string): NpcDefinition {
  const area = ALL_AREAS.find(item => item.id === areaId)
  const gender = deriveGender(areaId, 'rogue-gender')
  const name = deriveName(gender, areaId, 'rogue-name')
  const aptitude = buildAptitude(null, 'random', areaId)
  const originType = deriveOriginType(null, 'random', areaId)
  const destinyRank = deriveDestinyRank(aptitude.talent, aptitude.rootGrade, areaId)
  const title = pickFromSeed(ROGUE_TITLES, areaId, 'rogue-title')

  return normalizeNpcDefinitionProfile({
    id: `npc_${areaId}_wanderer`,
    name,
    gender,
    role: 'random',
    homeMapId: areaId,
    affiliation: { organizationKind: 'independent' },
    skills: deriveNpcSkillIds(null, 'random', aptitude.root),
    aptitude,
    personality: buildPersonality('random', null, areaId),
    profile: {
      title,
      origin: area?.name ?? areaId,
      originType,
      background: buildBackground(name, null, 'random', originType, destinyRank),
      familyStatus: buildFamilyStatus(originType, null),
      identityHook: buildIdentityHook('random', null, destinyRank),
      destinyRank,
      destinyTags: buildDestinyTags(null, destinyRank, 'random', originType),
      bloodline: buildBloodlineText(originType, aptitude.bloodlineGrade),
      constitutionNote: CONSTITUTION_NOTES[aptitude.constitution],
      factionStance: deriveFactionStance(null, originType, 'random')
    },
    tags: [area?.realm ?? '人界', '游历人物']
  })
}
function createAnchorNpcDefinitions(): NpcDefinition[] {
  return HAND_CRAFTED_NPCS.map(hc => 
    normalizeNpcDefinitionProfile({
      id: hc.id,
      name: hc.name,
      gender: hc.gender,
      role: hc.role,
      homeMapId: hc.homeMapId,
      sectId: hc.sectId || undefined,
      affiliation: hc.sectId
        ? { organizationId: hc.sectId, organizationKind: 'sect' }
        : { organizationKind: 'independent' },
      skills: deriveNpcSkillIds(
        hc.sectId ? (ALL_SECTS.find(sect => sect.id === hc.sectId) ?? null) : null,
        hc.role,
        hc.root
      ),
      aptitude: {
        root: hc.root,
        rootGrade: hc.rootGrade,
        talent: hc.talent,
        bloodlineGrade: hc.bloodlineGrade,
        constitution: hc.constitution,
        comprehension: hc.comprehension,
        luck: hc.luck,
        physique: hc.physique,
        willpower: hc.willpower,
        growthFlaws: [...(hc.growthFlaws || [])]
      },
      personality: {
        ambition: hc.ambition,
        loyalty: hc.loyalty,
        cruelty: hc.cruelty,
        affection: hc.affection,
        caution: hc.caution,
        greed: hc.greed
      },
      profile: {
        title: hc.title,
        origin: hc.origin,
        originType: hc.originType,
        background: hc.background,
        familyStatus: hc.familyStatus,
        identityHook: hc.identityHook,
        destinyRank: hc.destinyRank,
        destinyTags: [...hc.destinyTags],
        bloodline: hc.bloodline,
        constitutionNote: hc.constitutionNote,
        factionStance: hc.factionStance
      },
      tags: [...hc.tags]
    })
  )
}

export function createDefaultNpcDefinitions(): NpcDefinition[] {
  const anchors = createAnchorNpcDefinitions()
  const sectGenerated = ALL_SECTS.map(buildSectNpcDefinition)
    .filter(definition => !anchors.some(anchor => anchor.id === definition.id || anchor.sectId === definition.sectId && anchor.role === definition.role))
  const rogueGenerated = ["qingyun_mountain", "fox_den", "shadow_city", "star_sea", "ancient_ruins", "forge_peak", "azure_valley", "cloud_peak"].map(buildRogueNpcDefinition)

  return [...anchors, ...sectGenerated, ...rogueGenerated]
}

function deriveInitialRealm(definition: NpcDefinition): Realm {
  const area = ALL_AREAS.find(item => item.id === definition.homeMapId)
  const baseRealm = definition.sectId
    ? ALL_SECTS.find(item => item.id === definition.sectId)?.requiredRealm ?? area?.requiredRealm ?? '炼气'
    : area?.requiredRealm ?? '炼气'
  const potential = getNpcPotentialScore(definition)
  const bonusSteps =
    definition.profile.destinyRank === 'legendary' ? 1
      : definition.profile.destinyRank === 'anomalous' && potential >= 78 ? 1
        : 0
  return shiftRealm(baseRealm, bonusSteps)
}

function deriveInitialRealmLevel(definition: NpcDefinition) {
  const area = ALL_AREAS.find(item => item.id === definition.homeMapId)
  const baseLevel = definition.sectId
    ? ALL_SECTS.find(item => item.id === definition.sectId)?.requiredRealmLevel ?? area?.requiredRealmLevel ?? 1
    : area?.requiredRealmLevel ?? 1
  const potential = getNpcPotentialScore(definition)
  return Math.max(1, Math.min(9, baseLevel + Math.floor((potential - 42) / 16)))
}

function deriveInitialGoal(definition: NpcDefinition): NpcRuntimeState['currentGoal'] {
  if (definition.personality.ambition > 84) return 'challenge'
  if (definition.personality.caution > 82) return 'cultivate'
  if (definition.role === 'sect') return 'sectDuty'
  if (definition.role === 'companion') return 'adventure'
  return 'seekTreasure'
}

function deriveInitialNotoriety(definition: NpcDefinition) {
  const potential = getNpcPotentialScore(definition)
  const roleBonus = definition.role === 'main' ? 18 : definition.role === 'enemy' ? 12 : definition.role === 'companion' ? 8 : 4
  const destinyBonus = definition.profile.destinyRank === 'legendary'
    ? 18
    : definition.profile.destinyRank === 'anomalous'
      ? 10
      : definition.profile.destinyRank === 'fated'
        ? 4
        : 0
  return Math.max(0, Math.min(100, Math.round(potential * 0.28 + roleBonus + destinyBonus)))
}

export function createNpcRuntimeState(definition: NpcDefinition): NpcRuntimeState {
  return {
    id: definition.id,
    realm: deriveInitialRealm(definition),
    realmLevel: deriveInitialRealmLevel(definition),
    cultivation: 0,
    hpState: 'healthy',
    locationMapId: definition.homeMapId,
    currentGoal: deriveInitialGoal(definition),
    relationships: {},
    flags: [],
    notoriety: deriveInitialNotoriety(definition),
    lastActionTick: 0
  }
}

export function createNpcRuntimeStates(definitions: NpcDefinition[]) {
  return definitions.map(createNpcRuntimeState)
}

export function createDefaultUnlockedNpcIds(definitions: NpcDefinition[]) {
  return definitions
    .filter(item => item.role === 'main' || item.role === 'companion')
    .slice(0, 5)
    .map(item => item.id)
}
