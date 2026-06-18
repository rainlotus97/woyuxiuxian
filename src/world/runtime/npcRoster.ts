import { ALL_AREAS } from '@/types/map'
import { ALL_SECTS, type SectDefinition, type SectSpecialty } from '@/types/sect'
import { REALM_ORDER, type Realm } from '@/types/unit'
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

const DESTINY_TEMPLATES: Record<DestinyRank, string[]> = {
  ordinary: ['守成', '藏锋', '小成'],
  fated: ['奇缘', '同道', '机兆'],
  anomalous: ['异数', '逆命', '隐劫'],
  legendary: ['天命', '轮回', '古传']
}

const CONSTITUTION_NOTES: Record<ConstitutionType, string> = {
  ordinary_body: '体质平常，胜在根基稳定。',
  sword_bone: '骨相如剑，适合剑修与杀伐法门。',
  medicine_body: '经脉亲近草木丹气，炼丹与疗愈天赋更高。',
  demon_blood: '血气凶烈，爆发强但更易招来杀劫。',
  star_meridian: '星力入脉，悟性与命数牵引都异于常人。',
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
  return [
    {
      id: 'npc_su_qingyuan',
      name: '苏清鸢',
      gender: 'female',
      role: 'main',
      homeMapId: 'qingyun_mountain',
      sectId: 'qingyun_sect',
      aptitude: { root: '水', rootGrade: 'heavenly', talent: 'destined', bloodlineGrade: 'awakened', constitution: 'ice_heart', comprehension: 96, luck: 88, physique: 74, willpower: 98, growthFlaws: ['oath_bound'] },
      personality: { ambition: 54, loyalty: 92, cruelty: 12, affection: 72, caution: 88, greed: 8 },
      profile: {
        title: '青云圣女',
        origin: '青州苏氏嫡脉',
        originType: 'cultivator_clan',
        background: '青云宗圣女，传闻身怀前世记忆，一举一动都容易牵动主线局势与宗门态度。',
        familyStatus: '苏氏仍在青州经营旧族势力，对她寄予厚望。',
        identityHook: '既是正道门面的继承者，也可能成为改写宗门格局的关键节点。',
        destinyRank: 'legendary',
        destinyTags: ['轮回', '正道核心', '圣女'],
        bloodline: '青州苏氏水脉已经觉醒，和轮回记忆互相牵引。',
        constitutionNote: CONSTITUTION_NOTES.ice_heart,
        factionStance: 'orthodox'
      },
      tags: ['圣女', '轮回', '主线保护']
    },
    {
      id: 'npc_mo_lao',
      name: '墨老',
      gender: 'male',
      role: 'main',
      homeMapId: 'cloud_peak',
      aptitude: { root: '空', rootGrade: 'mutated', talent: 'monster', bloodlineGrade: 'ancient', constitution: 'void_meridian', comprehension: 90, luck: 62, physique: 48, willpower: 99, growthFlaws: ['weak_body'] },
      personality: { ambition: 35, loyalty: 96, cruelty: 38, affection: 70, caution: 91, greed: 10 },
      profile: {
        title: '残魂护道者',
        origin: '古井遗阵',
        originType: 'ancient_lineage',
        background: '寄宿于残阵中的古修残魂，熟悉灵脉与命数裂隙，常以旁观者姿态影响玩家路线。',
        familyStatus: '前尘身世已碎，只余部分传承记忆与执念。',
        identityHook: '他的过去与多处遗迹、灵脉、上古因果相连。',
        destinyRank: 'anomalous',
        destinyTags: ['古修传承', '守护', '空灵残魂'],
        bloodline: '古修残脉只余魂火，却仍保留空冥真意。',
        constitutionNote: CONSTITUTION_NOTES.void_meridian,
        factionStance: 'neutral'
      },
      tags: ['残魂', '守护者', '主线保护']
    },
    {
      id: 'npc_xue_yan',
      name: '薛焰',
      gender: 'male',
      role: 'enemy',
      homeMapId: 'blood_sea',
      sectId: 'blood_sect',
      aptitude: { root: '火', rootGrade: 'single', talent: 'genius', bloodlineGrade: 'forbidden', constitution: 'demon_blood', comprehension: 78, luck: 56, physique: 84, willpower: 71, growthFlaws: ['unstable_meridian', 'vengeful'] },
      personality: { ambition: 92, loyalty: 18, cruelty: 86, affection: 12, caution: 42, greed: 74 },
      profile: {
        title: '血魔少主',
        origin: '血海魔岭',
        originType: 'fallen_house',
        background: '血魔宗重点培养的魔道天才，行事狠戾，极易在世界线中成长成主线级反派。',
        familyStatus: '背后有血魔旧脉支撑，也有同门在暗中觊觎其位。',
        identityHook: '他若在乱世中坐大，很可能牵引出宗门沦陷与玩家被俘线。',
        destinyRank: 'anomalous',
        destinyTags: ['魔修', '反派种子', '血焰'],
        bloodline: '血魔旧脉带有禁血污染，越战越容易失控。',
        constitutionNote: CONSTITUTION_NOTES.demon_blood,
        factionStance: 'demonic'
      },
      tags: ['反派种子', '魔修']
    },
    {
      id: 'npc_lu_heng',
      name: '陆衡',
      gender: 'male',
      role: 'sect',
      homeMapId: 'qingyun_mountain',
      sectId: 'qingyun_sect',
      aptitude: { root: '金', rootGrade: 'dual', talent: 'spirit', bloodlineGrade: 'thin', constitution: 'sword_bone', comprehension: 67, luck: 50, physique: 66, willpower: 64, growthFlaws: [] },
      personality: { ambition: 61, loyalty: 72, cruelty: 20, affection: 52, caution: 59, greed: 28 },
      profile: {
        title: '青云内门',
        origin: '青云外山',
        originType: 'sect_foundling',
        background: '青云宗内门弟子，适合作为同门线、竞争线与早期伙伴线的过渡人物。',
        familyStatus: '由青云宗执事抚养长大，对山门有天然归属感。',
        identityHook: '若与玩家交好，可逐步变成稳定宗门盟友或同门竞争者。',
        destinyRank: 'fated',
        destinyTags: ['剑修', '同门候选', '山门旧识'],
        bloodline: '青云外山旧脉仅有微弱剑意回响。',
        constitutionNote: CONSTITUTION_NOTES.sword_bone,
        factionStance: 'orthodox'
      },
      tags: ['同门候选', '剑修']
    },
    {
      id: 'npc_bai_ruoli',
      name: '白若璃',
      gender: 'female',
      role: 'companion',
      homeMapId: 'azure_valley',
      sectId: 'medicine_valley',
      aptitude: { root: '木', rootGrade: 'single', talent: 'genius', bloodlineGrade: 'awakened', constitution: 'medicine_body', comprehension: 82, luck: 80, physique: 58, willpower: 76, growthFlaws: ['oath_bound'] },
      personality: { ambition: 57, loyalty: 74, cruelty: 14, affection: 82, caution: 73, greed: 18 },
      profile: {
        title: '药王谷真传',
        origin: '白氏药脉',
        originType: 'cultivator_clan',
        background: '擅长丹药与医理，若进入你的命运线，既能补足后勤，也会带来宗门与药脉的人情债。',
        familyStatus: '白氏药脉在药王谷仍有影响力，家族与宗门关系微妙。',
        identityHook: '她适合作为伙伴、情感支线与坊市经济线的关键枢纽。',
        destinyRank: 'anomalous',
        destinyTags: ['丹修', '同行候选', '药脉旧约'],
        bloodline: '白氏药脉已经觉醒，能感知灵草药性。',
        constitutionNote: CONSTITUTION_NOTES.medicine_body,
        factionStance: 'orthodox'
      },
      tags: ['伙伴候选', '炼丹']
    },
    {
      id: 'npc_shen_jingxuan',
      name: '沈镜玄',
      gender: 'male',
      role: 'sect',
      homeMapId: 'sky_temple',
      sectId: 'sky_temple_sect',
      aptitude: { root: '空', rootGrade: 'heavenly', talent: 'monster', bloodlineGrade: 'ancient', constitution: 'void_meridian', comprehension: 88, luck: 68, physique: 46, willpower: 92, growthFlaws: ['heart_demon'] },
      personality: { ambition: 68, loyalty: 62, cruelty: 18, affection: 40, caution: 95, greed: 14 },
      profile: {
        title: '天机行走',
        origin: '镜湖残脉',
        originType: 'ancient_lineage',
        background: '精于推衍和布局，常比旁人先一步嗅到战局、遗迹与背叛的味道。',
        familyStatus: '其血脉与天机旧脉有关，族谱几乎断绝。',
        identityHook: '他既可能成为预警者，也可能在关键时刻选择将你推入棋局。',
        destinyRank: 'legendary',
        destinyTags: ['天机', '布局者', '界域先知'],
        bloodline: '镜湖古脉仍在体内留有推衍回响。',
        constitutionNote: CONSTITUTION_NOTES.void_meridian,
        factionStance: 'imperial'
      },
      tags: ['谋局者', '阵法']
    }
  ]
}

export function createDefaultNpcDefinitions(): NpcDefinition[] {
  const anchors = createAnchorNpcDefinitions()
  const sectGenerated = ALL_SECTS.map(buildSectNpcDefinition)
    .filter(definition => !anchors.some(anchor => anchor.id === definition.id || anchor.sectId === definition.sectId && anchor.role === definition.role))
  const rogueGenerated = ['qingyun_mountain', 'fox_den', 'shadow_city', 'star_sea'].map(buildRogueNpcDefinition)

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
