/**
 * 手写NPC定义 — 40+核心NPC，每个人都有自己的背景故事和命运线
 * 这些NPC的解锁与玩家行为（加入宗门、历练遭遇、故事选择）相关
 */
import type {
  BloodlineGrade, ConstitutionType, DestinyRank, FactionStance,
  GrowthFlaw, NpcOriginType, RootGrade, TalentGrade
} from '@/types/world'
import type { Element } from '@/types/unit'

export interface HandCraftedNpc {
  id: string; name: string; gender: 'male' | 'female' | 'unknown'
  role: 'main' | 'sect' | 'enemy' | 'random' | 'companion'
  homeMapId: string; sectId?: string
  title: string; origin: string; originType: NpcOriginType
  background: string; familyStatus: string; identityHook: string
  destinyRank: DestinyRank; destinyTags: string[]
  bloodline: string; constitutionNote: string
  factionStance: FactionStance; tags: string[]
  /** 解锁条件：story章节ID或sect ID列表 */
  unlockConditions?: { storyChapter?: string; joinSect?: string; realmMin?: string; encounterArea?: string }
  root: Element | '冰' | '风' | '空'
  rootGrade: RootGrade; talent: TalentGrade
  bloodlineGrade: BloodlineGrade; constitution: ConstitutionType
  comprehension: number; luck: number; physique: number; willpower: number
  growthFlaws: GrowthFlaw[]
  ambition: number; loyalty: number; cruelty: number
  affection: number; caution: number; greed: number
}

/** 40+手写核心NPC */
export const HAND_CRAFTED_NPCS: HandCraftedNpc[] = [
  {
    id: 'story_youth_right_shoulder', name: '山道伤者', gender: 'male', role: 'random',
    homeMapId: 'qingyun_mountain',
    title: '来历未明的年轻修士', origin: '山道旧途', originType: 'wanderer',
    background: '你见过他最狼狈的一刻，也许将来会在更正式的场合再见到他。那时他会不会还记得今日，全看你此刻的选择。',
    familyStatus: '独自行走，身份未显。',
    identityHook: '这是适合后续回收的人情或旧怨种子角色。',
    destinyRank: 'fated', destinyTags: ['伏笔', '旧怨', '人情'],
    bloodline: '血脉尚未显露，但绝非寻常散修。', constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'rogue',
    tags: ['剧情伏笔', '山道', '可回收奇遇'],
    root: '金', rootGrade: 'dual', talent: 'spirit', bloodlineGrade: 'thin',
    constitution: 'ordinary_body', comprehension: 64, luck: 55, physique: 68, willpower: 72,
    growthFlaws: [],
    ambition: 58, loyalty: 34, cruelty: 22, affection: 40, caution: 79, greed: 18
  },
  {
    id: 'story_umbrella_woman', name: '持伞女子', gender: 'female', role: 'random',
    homeMapId: 'shadow_city',
    title: '不肯露面的访客', origin: '坊市雨棚', originType: 'outer_realm',
    background: '她先让你记住伞，再让你记住声音。此时真名不该出现，但她显然不是一次性的过场人物。',
    familyStatus: '来路被她自己掩得很深。',
    identityHook: '适合作为后续宗门、命数或情报线的隐形引路人。',
    destinyRank: 'anomalous', destinyTags: ['匿名登场', '伏笔', '坊市'],
    bloodline: '血脉带着界外气息，却被刻意压住。', constitutionNote: '空冥入体，适合阵法、遁术与奇门法。', factionStance: 'neutral',
    tags: ['剧情伏笔', '坊市', '匿名人物'],
    root: '空', rootGrade: 'single', talent: 'genius', bloodlineGrade: 'awakened',
    constitution: 'void_meridian', comprehension: 85, luck: 76, physique: 46, willpower: 88,
    growthFlaws: ['oath_bound'],
    ambition: 60, loyalty: 42, cruelty: 14, affection: 48, caution: 94, greed: 10
  },
  {
    id: 'story_white_clothed_youth', name: '白衣少年', gender: 'male', role: 'random',
    homeMapId: 'sky_temple',
    title: '气度过盛的年轻人', origin: '街巷偶见', originType: 'cultivator_clan',
    background: '此刻他只是一个被围困在巷口的白衣少年，真名与身份都还不该揭开。但他显然来自一个不该轻视的地方。',
    familyStatus: '门第不低，只是暂时不便示人。',
    identityHook: '适合作为宗门圣子级人物的前置匿名出场。',
    destinyRank: 'legendary', destinyTags: ['白衣少年', '匿名登场', '高位出身'],
    bloodline: '灵脉流转极稳，像被大势力精心打磨过。', constitutionNote: '骨相如剑，适合剑修与杀伐法门。', factionStance: 'imperial',
    tags: ['剧情伏笔', '白衣少年', '高位角色'],
    root: '金', rootGrade: 'heavenly', talent: 'monster', bloodlineGrade: 'awakened',
    constitution: 'sword_bone', comprehension: 90, luck: 74, physique: 70, willpower: 92,
    growthFlaws: ['heart_demon'],
    ambition: 72, loyalty: 66, cruelty: 18, affection: 36, caution: 86, greed: 8
  },
  {
    id: 'npc_old_friend', name: '旧识修士', gender: 'unknown', role: 'random',
    homeMapId: 'azure_valley',
    title: '少年旧识', origin: '旧年集镇', originType: 'mortal_village',
    background: '曾与你有过一面之缘的人，如今散在人海里。若真再遇见，也应该靠前因而非凭空刷出来。',
    familyStatus: '家境平常，去向不定。',
    identityHook: '用于承接少量“故人再会”类关系事件。',
    destinyRank: 'ordinary', destinyTags: ['旧识', '平凡回响'],
    bloodline: '凡俗血脉尚未显化。', constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'rogue',
    tags: ['旧识', '低烈度关系'],
    root: '木', rootGrade: 'mixed', talent: 'good', bloodlineGrade: 'none',
    constitution: 'ordinary_body', comprehension: 48, luck: 46, physique: 50, willpower: 52,
    growthFlaws: [],
    ambition: 34, loyalty: 44, cruelty: 10, affection: 58, caution: 62, greed: 18
  },
  // ============ 主线核心NPC (10人) ============
  {
    id: 'npc_su_qingyuan', name: '苏清鸢', gender: 'female', role: 'main',
    homeMapId: 'qingyun_mountain', sectId: 'qingyun_sect',
    title: '青云圣女', origin: '青州苏氏嫡脉', originType: 'cultivator_clan',
    background: '青云宗圣女，传闻身怀前世记忆。每次轮回都试图打破这方囚笼，但总在最后一步功亏一篑。这一世，她遇到了你。',
    familyStatus: '苏氏仍在青州经营旧族势力，对她寄予厚望。',
    identityHook: '既是正道门面的继承者，也可能成为改写宗门格局的关键节点。她的过去藏着这座世界的真相。',
    destinyRank: 'legendary', destinyTags: ['轮回', '正道核心', '圣女', '万古长情'],
    bloodline: '青州苏氏水脉已经觉醒，和轮回记忆互相牵引。血脉中封存着九世记忆。',
    constitutionNote: '心湖似冰，抗心魔强，但情感线推进更慢。', factionStance: 'orthodox',
    tags: ['圣女', '轮回', '主线保护', '情缘候选'],
    unlockConditions: { storyChapter: 'vol1_ch001_awakening' },
    root: '水', rootGrade: 'heavenly', talent: 'destined', bloodlineGrade: 'awakened',
    constitution: 'ice_heart', comprehension: 96, luck: 88, physique: 74, willpower: 98,
    growthFlaws: ['oath_bound'],
    ambition: 54, loyalty: 92, cruelty: 12, affection: 72, caution: 88, greed: 8
  },
  {
    id: 'npc_mo_lao', name: '墨老', gender: 'male', role: 'main',
    homeMapId: 'cloud_peak',
    title: '残魂护道者', origin: '古井遗阵', originType: 'ancient_lineage',
    background: '寄宿于残阵中的古修残魂，是上一纪元的幸存者。熟悉灵脉与命数裂隙，知晓这座"囚笼"的真正来历。常以旁观者姿态影响玩家路线。',
    familyStatus: '前尘身世已碎，只余部分传承记忆与执念。他的真实身份是上古阵灵一脉的末裔。',
    identityHook: '他的过去与多处遗迹、灵脉、上古因果相连。每当他出现，往往意味着命运的转折点。',
    destinyRank: 'anomalous', destinyTags: ['古修传承', '守护', '空灵残魂', '真相'],
    bloodline: '古修残脉只余魂火，却仍保留空冥真意。', factionStance: 'neutral',
    constitutionNote: '空冥入体，适合阵法、遁术与奇门法。',
    tags: ['残魂', '守护者', '主线保护', '真相'],
    unlockConditions: { storyChapter: 'vol1_ch002_meeting' },
    root: '空', rootGrade: 'mutated', talent: 'monster', bloodlineGrade: 'ancient',
    constitution: 'void_meridian', comprehension: 90, luck: 62, physique: 48, willpower: 99,
    growthFlaws: ['weak_body'],
    ambition: 35, loyalty: 96, cruelty: 38, affection: 70, caution: 91, greed: 10
  },
  {
    id: 'npc_xue_yan', name: '薛焰', gender: 'male', role: 'enemy',
    homeMapId: 'blood_sea', sectId: 'blood_sect',
    title: '血魔少主', origin: '血海魔岭', originType: 'fallen_house',
    background: '血魔宗重点培养的魔道天才，行事狠戾。他体内封印着上古血魔的残魂，每次暴走都会带来灾难。与你命中注定为敌，却也有着不为人知的过往。',
    familyStatus: '背后有血魔旧脉支撑，也有同门在暗中觊觎其位。',
    identityHook: '他若在乱世中坐大，很可能牵引出宗门沦陷与玩家被俘线。他的弱点藏在一个你意想不到的地方。',
    destinyRank: 'anomalous', destinyTags: ['魔修', '反派种子', '血焰', '宿敌'],
    bloodline: '血魔旧脉带有禁血污染，越战越容易失控。',
    constitutionNote: '血气凶烈，爆发强但更易招来杀劫。', factionStance: 'demonic',
    tags: ['反派种子', '魔修', '宿敌'],
    unlockConditions: { encounterArea: 'blood_sea' },
    root: '火', rootGrade: 'single', talent: 'genius', bloodlineGrade: 'forbidden',
    constitution: 'demon_blood', comprehension: 78, luck: 56, physique: 84, willpower: 71,
    growthFlaws: ['unstable_meridian', 'vengeful'],
    ambition: 92, loyalty: 18, cruelty: 86, affection: 12, caution: 42, greed: 74
  },
  {
    id: 'npc_lu_heng', name: '陆衡', gender: 'male', role: 'sect',
    homeMapId: 'qingyun_mountain', sectId: 'qingyun_sect',
    title: '青云内门·剑修', origin: '青云外山', originType: 'sect_foundling',
    background: '青云宗内门弟子，由宗门执事抚养长大。性格沉稳可靠，剑法扎实。适合作为同门线、竞争线与早期伙伴线的过渡人物。',
    familyStatus: '由青云宗执事抚养长大，对山门有天然归属感。',
    identityHook: '若与玩家交好，可逐步变成稳定宗门盟友或同门竞争者。',
    destinyRank: 'fated', destinyTags: ['剑修', '同门候选', '山门旧识'],
    bloodline: '青云外山旧脉仅有微弱剑意回响。',
    constitutionNote: '骨相如剑，适合剑修与杀伐法门。', factionStance: 'orthodox',
    tags: ['同门候选', '剑修'],
    unlockConditions: { joinSect: 'qingyun_sect' },
    root: '金', rootGrade: 'dual', talent: 'spirit', bloodlineGrade: 'thin',
    constitution: 'sword_bone', comprehension: 67, luck: 50, physique: 66, willpower: 64,
    growthFlaws: [],
    ambition: 61, loyalty: 72, cruelty: 20, affection: 52, caution: 59, greed: 28
  },
  {
    id: 'npc_bai_ruoli', name: '白若璃', gender: 'female', role: 'companion',
    homeMapId: 'azure_valley', sectId: 'medicine_valley',
    title: '药王谷真传', origin: '白氏药脉', originType: 'cultivator_clan',
    background: '白氏药脉的传人，擅长丹药与医理。表面温婉，实则内心坚定。若进入你的命运线，既能补足后勤，也会带来宗门与药脉的人情债。',
    familyStatus: '白氏药脉在药王谷仍有影响力，家族与宗门关系微妙。',
    identityHook: '她适合作为伙伴、情感支线与坊市经济线的关键枢纽。',
    destinyRank: 'anomalous', destinyTags: ['丹修', '同行候选', '药脉旧约'],
    bloodline: '白氏药脉已经觉醒，能感知灵草药性。',
    constitutionNote: '经脉亲近草木丹气，炼丹与疗愈天赋更高。', factionStance: 'orthodox',
    tags: ['伙伴候选', '炼丹'],
    unlockConditions: { storyChapter: 'vol2_ch001_medicine_valley' },
    root: '木', rootGrade: 'single', talent: 'genius', bloodlineGrade: 'awakened',
    constitution: 'medicine_body', comprehension: 82, luck: 80, physique: 58, willpower: 76,
    growthFlaws: ['oath_bound'],
    ambition: 57, loyalty: 74, cruelty: 14, affection: 82, caution: 73, greed: 18
  },
  {
    id: 'npc_shen_jingxuan', name: '沈镜玄', gender: 'male', role: 'sect',
    homeMapId: 'sky_temple', sectId: 'sky_temple_sect',
    title: '天机行走', origin: '镜湖残脉', originType: 'ancient_lineage',
    background: '镜湖古脉的最后传人，精于推衍和布局。他看到的命运线比别人多，但也因此承受着常人难以理解的负担。',
    familyStatus: '其血脉与天机旧脉有关，族谱几乎断绝。',
    identityHook: '他既可能成为预警者，也可能在关键时刻选择将你推入棋局。',
    destinyRank: 'legendary', destinyTags: ['天机', '布局者', '界域先知'],
    bloodline: '镜湖古脉仍在体内留有推衍回响。',
    constitutionNote: '空冥入体，适合阵法、遁术与奇门法。', factionStance: 'imperial',
    tags: ['谋局者', '阵法'],
    root: '空', rootGrade: 'heavenly', talent: 'monster', bloodlineGrade: 'ancient',
    constitution: 'void_meridian', comprehension: 88, luck: 68, physique: 46, willpower: 92,
    growthFlaws: ['heart_demon'],
    ambition: 68, loyalty: 62, cruelty: 18, affection: 40, caution: 95, greed: 14
  },
  {
    id: 'npc_lin_qinghan', name: '林清寒', gender: 'female', role: 'companion',
    homeMapId: 'qingyun_mountain', sectId: 'qingyun_sect',
    title: '剑阁真传·寒霜剑主', origin: '北境寒家', originType: 'cultivator_clan',
    background: '青云宗剑阁第一真传，天生冰灵根。性情冷若冰霜，但剑心通明。她的剑意中藏着一段不为人知的悲伤往事。',
    familyStatus: '北境寒家曾是剑道世家，如今只剩她一人。',
    identityHook: '她若认可你，会是最可靠的剑；若不认可，会是比敌人更可怕的存在。',
    destinyRank: 'fated', destinyTags: ['剑修', '冰灵根', '傲骨'],
    bloodline: '北境寒家剑脉已觉醒，冰霜剑意入骨。',
    constitutionNote: '心湖似冰，抗心魔强，但情感线推进更慢。', factionStance: 'orthodox',
    tags: ['剑修', '同行候选', '傲骨'],
    unlockConditions: { joinSect: 'qingyun_sect' },
    root: '冰', rootGrade: 'single', talent: 'monster', bloodlineGrade: 'awakened',
    constitution: 'ice_heart', comprehension: 89, luck: 52, physique: 72, willpower: 94,
    growthFlaws: ['heart_demon'],
    ambition: 76, loyalty: 82, cruelty: 24, affection: 34, caution: 78, greed: 12
  },
  {
    id: 'npc_ye_wuhen', name: '叶无痕', gender: 'male', role: 'companion',
    homeMapId: 'shadow_city',
    title: '暗影行者', origin: '暗影城', originType: 'wanderer',
    background: '暗影城最神秘的刺客，来无影去无踪。没人知道他的来历，只知道他杀人只出一刀。他在寻找一个答案——关于这座世界的边界。',
    familyStatus: '孤身一人，无门无派。',
    identityHook: '他的目标与你的命运意外重合，可能会成为亦敌亦友的存在。',
    destinyRank: 'anomalous', destinyTags: ['刺客', '暗影', '孤独'],
    bloodline: '血脉中混杂着暗影之力，来源不明。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['刺客', '同行候选', '神秘'],
    unlockConditions: { encounterArea: 'shadow_city' },
    root: '风', rootGrade: 'single', talent: 'genius', bloodlineGrade: 'thin',
    constitution: 'ordinary_body', comprehension: 86, luck: 44, physique: 82, willpower: 78,
    growthFlaws: ['oath_bound'],
    ambition: 44, loyalty: 56, cruelty: 62, affection: 28, caution: 86, greed: 22
  },
  {
    id: 'npc_jiu_wei', name: '九尾', gender: 'female', role: 'companion',
    homeMapId: 'fox_den',
    title: '天狐灵姬', origin: '狐谷', originType: 'beast_blood',
    background: '九尾天狐一族的末裔，修行千年的狐妖。看似玩世不恭，实则洞悉世事。她曾在远古见过这座囚笼的建造者。',
    familyStatus: '天狐一族几乎灭绝，她是最后的九尾血脉。',
    identityHook: '她的古老记忆可能是解开世界真相的关键。但狐妖的话，你信几分？',
    destinyRank: 'legendary', destinyTags: ['狐妖', '千年', '真相'],
    bloodline: '九尾天狐血脉，天生魅惑之力。',
    constitutionNote: '血气凶烈，爆发强但更易招来杀劫。', factionStance: 'neutral',
    tags: ['狐妖', '同行候选', '古老'],
    unlockConditions: { storyChapter: 'vol2_ch004_fox_den' },
    root: '火', rootGrade: 'mutated', talent: 'destined', bloodlineGrade: 'forbidden',
    constitution: 'demon_blood', comprehension: 94, luck: 96, physique: 62, willpower: 82,
    growthFlaws: ['heart_demon', 'unstable_meridian'],
    ambition: 66, loyalty: 38, cruelty: 42, affection: 64, caution: 72, greed: 48
  },
  {
    id: 'npc_mo_tian', name: '墨天', gender: 'male', role: 'enemy',
    homeMapId: 'blood_sea', sectId: 'blood_sect',
    title: '血魔宗主', origin: '血海魔岭', originType: 'ancient_lineage',
    background: '血魔宗宗主，薛焰的师尊。修炼血魔大法已三百载，是魔道第一人。他似乎在谋划着一场席卷整个青云界的浩劫。',
    familyStatus: '血魔宗的传承者，掌控着魔道大半势力。',
    identityHook: '他是后期的主要反派，他的计划将牵扯出世界囚笼的真相。',
    destinyRank: 'legendary', destinyTags: ['魔道至尊', '血魔', '浩劫'],
    bloodline: '上古血魔真传，已修炼到血魔大法第九层。',
    constitutionNote: '血气凶烈，爆发强但更易招来杀劫。', factionStance: 'demonic',
    tags: ['反派', '魔道至尊', '终局'],
    root: '火', rootGrade: 'heavenly', talent: 'destined', bloodlineGrade: 'forbidden',
    constitution: 'demon_blood', comprehension: 92, luck: 74, physique: 96, willpower: 88,
    growthFlaws: ['heart_demon', 'vengeful', 'greedy_impulse'],
    ambition: 99, loyalty: 8, cruelty: 96, affection: 4, caution: 62, greed: 88
  },
  // ============ 宗门核心NPC (12人) ============
  {
    id: 'npc_qingyun_head', name: '玄阳真人', gender: 'male', role: 'sect',
    homeMapId: 'qingyun_mountain', sectId: 'qingyun_sect',
    title: '青云宗主', origin: '青云山', originType: 'sect_foundling',
    background: '青云宗掌门，元婴中期修士。为人正直但保守，在正道与魔道的夹缝中艰难维持宗门的存续。',
    familyStatus: '一生奉献给青云宗，无子嗣。',
    identityHook: '他对你的态度取决于你对宗门的贡献。',
    destinyRank: 'fated', destinyTags: ['宗主', '正道', '保守'],
    bloodline: '普通修炼者血脉，未觉醒特殊力量。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'orthodox',
    tags: ['宗主', '青云'],
    unlockConditions: { joinSect: 'qingyun_sect' },
    root: '土', rootGrade: 'dual', talent: 'spirit', bloodlineGrade: 'none',
    constitution: 'ordinary_body', comprehension: 72, luck: 44, physique: 78, willpower: 86,
    growthFlaws: [],
    ambition: 62, loyalty: 94, cruelty: 8, affection: 56, caution: 88, greed: 14
  },
  {
    id: 'npc_medicine_head', name: '丹阳子', gender: 'male', role: 'sect',
    homeMapId: 'azure_valley', sectId: 'medicine_valley',
    title: '药王谷谷主', origin: '药王谷', originType: 'cultivator_clan',
    background: '药王谷谷主，丹道宗师。性格温和，不问世事，一心钻研丹道。他手中掌握着数种失传丹方。',
    familyStatus: '丹氏一脉单传，药王谷的传承系于一身。',
    identityHook: '若能得到他的赏识，将获得丹道进阶的钥匙。',
    destinyRank: 'anomalous', destinyTags: ['丹道宗师', '隐世', '传承'],
    bloodline: '丹氏古脉，天生对灵草有感应。',
    constitutionNote: '经脉亲近草木丹气，炼丹与疗愈天赋更高。', factionStance: 'orthodox',
    tags: ['谷主', '丹道'],
    unlockConditions: { joinSect: 'medicine_valley' },
    root: '木', rootGrade: 'single', talent: 'monster', bloodlineGrade: 'ancient',
    constitution: 'medicine_body', comprehension: 95, luck: 68, physique: 44, willpower: 82,
    growthFlaws: [],
    ambition: 28, loyalty: 56, cruelty: 6, affection: 74, caution: 66, greed: 12
  },
  {
    id: 'npc_forge_head', name: '铁心', gender: 'male', role: 'sect',
    homeMapId: 'forge_peak', sectId: 'forge_sect',
    title: '铸剑谷谷主', origin: '铸剑谷', originType: 'sect_foundling',
    background: '铸剑谷谷主，锻造宗师。性格火爆但手艺精湛，整个青云界有一半的法器出自他手。',
    familyStatus: '铁氏锻造世家，传承八代。',
    identityHook: '他欠青云宗一个人情，可能会因此帮你锻造神兵。',
    destinyRank: 'fated', destinyTags: ['锻造宗师', '火爆', '神兵'],
    bloodline: '铁氏火脉，锻造时火力更加精纯。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'orthodox',
    tags: ['谷主', '锻造'],
    unlockConditions: { joinSect: 'forge_sect' },
    root: '火', rootGrade: 'dual', talent: 'spirit', bloodlineGrade: 'thin',
    constitution: 'ordinary_body', comprehension: 58, luck: 36, physique: 92, willpower: 88,
    growthFlaws: ['reckless_breakthrough'],
    ambition: 42, loyalty: 72, cruelty: 16, affection: 48, caution: 34, greed: 26
  },
  // ... 更多手写NPC将在后续迭代中添加
  // 目前已有10个核心NPC，后续可在下面继续添加
  {
    id: 'npc_wind_sword', name: '风剑子', gender: 'male', role: 'sect',
    homeMapId: 'sky_temple', sectId: 'sky_temple_sect',
    title: '天剑峰首座', origin: '天剑峰', originType: 'cultivator_clan',
    background: '天剑峰首座，剑道修为超凡入圣。一生追求剑道极致，不问世事。但魔道入侵时，他是正道最锋利的剑。',
    familyStatus: '风氏剑道世家，世代守护天剑峰。',
    identityHook: '他的剑道传承可能是你突破瓶颈的关键。',
    destinyRank: 'fated', destinyTags: ['剑道宗师', '天剑峰', '极致'],
    bloodline: '风氏剑脉，剑意传承五代。',
    constitutionNote: '骨相如剑，适合剑修与杀伐法门。', factionStance: 'orthodox',
    tags: ['首座', '剑道'],
    unlockConditions: { joinSect: 'sky_temple_sect' },
    root: '金', rootGrade: 'single', talent: 'monster', bloodlineGrade: 'awakened',
    constitution: 'sword_bone', comprehension: 94, luck: 42, physique: 86, willpower: 96,
    growthFlaws: ['heart_demon'],
    ambition: 84, loyalty: 66, cruelty: 28, affection: 22, caution: 56, greed: 8
  },
  {
    id: 'npc_miao_yue', name: '妙月仙子', gender: 'female', role: 'sect',
    homeMapId: 'qingyun_mountain', sectId: 'qingyun_sect',
    title: '青云丹阁长老', origin: '青州散修', originType: 'wanderer',
    background: '青云宗丹阁长老，性格古怪但丹术精湛。年轻时曾游历天下，知晓许多秘境和奇闻。',
    familyStatus: '散修出身，无家族背景。',
    identityHook: '她对有丹道天赋的弟子格外关照，可能会传授独门丹方。',
    destinyRank: 'fated', destinyTags: ['丹修', '长老', '游历'],
    bloodline: '散修血脉，未觉醒特殊力量。',
    constitutionNote: '经脉亲近草木丹气，炼丹与疗愈天赋更高。', factionStance: 'orthodox',
    tags: ['长老', '丹道'],
    unlockConditions: { joinSect: 'qingyun_sect' },
    root: '木', rootGrade: 'dual', talent: 'spirit', bloodlineGrade: 'thin',
    constitution: 'medicine_body', comprehension: 78, luck: 62, physique: 52, willpower: 74,
    growthFlaws: [],
    ambition: 36, loyalty: 62, cruelty: 8, affection: 66, caution: 58, greed: 24
  },
  {
    id: 'npc_lei_gong', name: '雷公', gender: 'male', role: 'sect',
    homeMapId: 'sky_temple', sectId: 'sky_temple_sect',
    title: '雷法执事', origin: '雷州雷家', originType: 'cultivator_clan',
    background: '天机殿雷法执事，性格豪爽仗义。雷法造诣极高，曾以一己之力击退血魔宗的偷袭。',
    familyStatus: '雷州雷家，世代修炼雷法。',
    identityHook: '他对有正义感的后辈格外关照，可能传授雷法心得。',
    destinyRank: 'fated', destinyTags: ['雷法', '豪爽', '执事'],
    bloodline: '雷家血脉，天生对雷法有亲和力。',
    constitutionNote: '雷意淬身，破境凶险但战力成长极快。', factionStance: 'orthodox',
    tags: ['执事', '雷法'],
    unlockConditions: { joinSect: 'sky_temple_sect' },
    root: '雷', rootGrade: 'single', talent: 'spirit', bloodlineGrade: 'awakened',
    constitution: 'thunder_body', comprehension: 62, luck: 48, physique: 88, willpower: 72,
    growthFlaws: ['reckless_breakthrough'],
    ambition: 56, loyalty: 84, cruelty: 18, affection: 62, caution: 38, greed: 16
  },
  {
    id: 'npc_xiao_yao', name: '逍遥子', gender: 'male', role: 'companion',
    homeMapId: 'star_sea',
    title: '海外散仙', origin: '星海', originType: 'wanderer',
    background: '来自海外星海的散修，游戏人间，看似不正经实则深不可测。他似乎在寻找某样东西，而这东西与你有关。',
    familyStatus: '无门无派，萍踪浪迹。',
    identityHook: '他的到来总是伴随着变数，可能是机遇也可能是麻烦。',
    destinyRank: 'anomalous', destinyTags: ['散仙', '神秘', '变数'],
    bloodline: '来历不明，血脉中有着不属于此界的气息。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['散仙', '同行候选', '神秘'],
    unlockConditions: { encounterArea: 'star_sea' },
    root: '风', rootGrade: 'mutated', talent: 'monster', bloodlineGrade: 'awakened',
    constitution: 'ordinary_body', comprehension: 96, luck: 92, physique: 38, willpower: 68,
    growthFlaws: ['greedy_impulse'],
    ambition: 42, loyalty: 28, cruelty: 14, affection: 44, caution: 42, greed: 72
  },
  {
    id: 'npc_ling_xu', name: '灵虚真人', gender: 'male', role: 'sect',
    homeMapId: 'cloud_peak',
    title: '散修联盟盟主', origin: '灵虚山', originType: 'wanderer',
    background: '散修联盟的创立者，德高望重的元婴散修。他致力于为散修争取生存空间，在正魔之间保持中立。',
    familyStatus: '无家族，毕生心血都在散修联盟。',
    identityHook: '若你选择散修之路，他会是最重要的引路人。',
    destinyRank: 'fated', destinyTags: ['散修', '盟主', '中立'],
    bloodline: '散修血脉，后天修炼而觉醒。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['盟主', '散修', '引路人'],
    unlockConditions: { realmMin: '筑基' },
    root: '土', rootGrade: 'dual', talent: 'spirit', bloodlineGrade: 'thin',
    constitution: 'ordinary_body', comprehension: 68, luck: 56, physique: 62, willpower: 90,
    growthFlaws: [],
    ambition: 48, loyalty: 76, cruelty: 6, affection: 58, caution: 84, greed: 10
  },
  {
    id: 'npc_hong_lian', name: '红莲', gender: 'female', role: 'enemy',
    homeMapId: 'blood_sea', sectId: 'blood_sect',
    title: '血魔宗圣女', origin: '血海魔岭', originType: 'sect_foundling',
    background: '血魔宗圣女，薛焰的师妹。表面温柔似水，实则心狠手辣。她潜伏在正道中为血魔宗传递情报。',
    familyStatus: '自幼被血魔宗收养，对宗门忠心耿耿。',
    identityHook: '她可能在正道宗门中潜伏，等待时机给你致命一击。',
    destinyRank: 'fated', destinyTags: ['魔修', '间谍', '伪装'],
    bloodline: '血魔宗秘法觉醒的血脉，带有幻术天赋。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'demonic',
    tags: ['圣女', '间谍', '反派'],
    root: '水', rootGrade: 'dual', talent: 'spirit', bloodlineGrade: 'thin',
    constitution: 'ordinary_body', comprehension: 76, luck: 64, physique: 48, willpower: 56,
    growthFlaws: ['vengeful'],
    ambition: 74, loyalty: 88, cruelty: 68, affection: 16, caution: 78, greed: 44
  },
  {
    id: 'npc_zhao_ancestor', name: '赵老祖', gender: 'male', role: 'enemy',
    homeMapId: 'ancient_ruins',
    title: '上古邪修', origin: '上古遗迹', originType: 'ancient_lineage',
    background: '从上古封印中苏醒的邪修，修炼的是早已失传的禁术。他的出现意味着世界的平衡正在被打破。',
    familyStatus: '上古邪修一脉，曾是被天道抹去的存在。',
    identityHook: '他的复苏与世界的崩坏有关，击败他可能触及世界的真相。',
    destinyRank: 'legendary', destinyTags: ['上古', '邪修', '禁术'],
    bloodline: '上古邪脉，修炼禁术而扭曲的血脉。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'demonic',
    tags: ['上古', '反派', '最终boss预备'],
    root: '空', rootGrade: 'mutated', talent: 'destined', bloodlineGrade: 'forbidden',
    constitution: 'star_meridian', comprehension: 88, luck: 34, physique: 56, willpower: 98,
    growthFlaws: ['heart_demon', 'unstable_meridian', 'reckless_breakthrough'],
    ambition: 100, loyalty: 0, cruelty: 98, affection: 0, caution: 44, greed: 96
  },
  // ============ 游历随机NPC (继续添加中) ============
  {
    id: 'npc_zhu_ji', name: '朱机', gender: 'male', role: 'random',
    homeMapId: 'qingyun_mountain',
    title: '青云镇铁匠', origin: '青云镇', originType: 'mortal_village',
    background: '青云镇最好的铁匠，打造的法器虽然品阶不高但经久耐用。他年轻时也曾想修仙，可惜没有灵根。',
    familyStatus: '朱氏铁匠铺，三代传承。',
    identityHook: '他打出的武器虽然凡品但暗藏灵性，可能随着你的成长而成长。',
    destinyRank: 'ordinary', destinyTags: ['铁匠', '凡间', '手艺'],
    bloodline: '凡俗血脉，尚未显化。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['凡人', '青云镇'],
    root: '土', rootGrade: 'mixed', talent: 'mortal', bloodlineGrade: 'none',
    constitution: 'ordinary_body', comprehension: 32, luck: 28, physique: 72, willpower: 56,
    growthFlaws: [],
    ambition: 18, loyalty: 62, cruelty: 4, affection: 68, caution: 44, greed: 32
  },
  {
    id: 'npc_jiu_niang', name: '酒娘', gender: 'female', role: 'random',
    homeMapId: 'qingyun_mountain',
    title: '青云酒肆老板娘', origin: '青州', originType: 'mortal_village',
    background: '青云镇酒肆的老板娘，酿得一手好灵酒。她的消息灵通，青云界的大事小情没有她不知道的。',
    familyStatus: '夫家早逝，独自经营酒肆。',
    identityHook: '她的灵酒可能附带临时属性加成，消息也价值不菲。',
    destinyRank: 'ordinary', destinyTags: ['酒肆', '消息', '灵酒'],
    bloodline: '凡俗血脉，尚未显化。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['凡人', '消息', '青云镇'],
    root: '水', rootGrade: 'mixed', talent: 'mortal', bloodlineGrade: 'none',
    constitution: 'ordinary_body', comprehension: 44, luck: 72, physique: 38, willpower: 48,
    growthFlaws: [],
    ambition: 28, loyalty: 44, cruelty: 6, affection: 82, caution: 52, greed: 38
  },
  {
    id: 'npc_old_turtle', name: '龟老', gender: 'male', role: 'random',
    homeMapId: 'star_sea',
    title: '星海渡者', origin: '东海', originType: 'beast_blood',
    background: '一只活了不知多少年的老海龟，拥有部分龙族血脉。它驮着一个小岛在星海中漫游，偶尔会载修士一程。',
    familyStatus: '独居星海，与龙族有远亲关系。',
    identityHook: '它知道的古老传说可能比任何修士都多。',
    destinyRank: 'fated', destinyTags: ['海龟', '古老', '龙脉'],
    bloodline: '龙龟血脉，长寿且蕴含龙威。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['妖兽', '星海', '古老'],
    root: '水', rootGrade: 'dual', talent: 'mortal', bloodlineGrade: 'awakened',
    constitution: 'ordinary_body', comprehension: 22, luck: 84, physique: 99, willpower: 80,
    growthFlaws: [],
    ambition: 2, loyalty: 48, cruelty: 2, affection: 54, caution: 96, greed: 6
  },
  {
    id: 'npc_you_ling', name: '幽灵', gender: 'female', role: 'random',
    homeMapId: 'ancient_ruins',
    title: '遗迹巡游者', origin: '上古遗迹', originType: 'outer_realm',
    background: '在遗迹中徘徊的灵魂体，似乎不完全是此界的存在。她的话语断断续续，但每一句都包含着上古的秘密。',
    familyStatus: '不知来历，似乎是被困在遗迹中的异界灵魂。',
    identityHook: '她可能是来自囚笼之外的存在，她的记忆是解开一切的关键。',
    destinyRank: 'anomalous', destinyTags: ['灵魂', '异界', '秘密'],
    bloodline: '界外异血，不属于此界。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['灵魂', '遗迹', '异界'],
    root: '空', rootGrade: 'mutated', talent: 'genius', bloodlineGrade: 'forbidden',
    constitution: 'void_meridian', comprehension: 98, luck: 14, physique: 8, willpower: 72,
    growthFlaws: ['weak_body'],
    ambition: 12, loyalty: 22, cruelty: 8, affection: 46, caution: 34, greed: 18
  },
  {
    id: 'npc_da_li', name: '大力', gender: 'male', role: 'random',
    homeMapId: 'forge_peak',
    title: '铸剑谷火工', origin: '铸剑谷', originType: 'mortal_village',
    background: '铸剑谷的杂役，天生神力但没有灵根。他最大的愿望是能亲手打造一把名剑。',
    familyStatus: '父母早亡，被铸剑谷收留。',
    identityHook: '他虽然不能修炼，但力气大得惊人，可能在某些任务中帮上忙。',
    destinyRank: 'ordinary', destinyTags: ['神力', '凡人', '执着'],
    bloodline: '凡俗血脉，尚未显化。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'orthodox',
    tags: ['凡人', '铸剑谷', '神力'],
    root: '土', rootGrade: 'mixed', talent: 'mortal', bloodlineGrade: 'none',
    constitution: 'ordinary_body', comprehension: 18, luck: 32, physique: 99, willpower: 88,
    growthFlaws: [],
    ambition: 38, loyalty: 78, cruelty: 2, affection: 64, caution: 22, greed: 8
  },
  {
    id: 'npc_han_jiang', name: '寒江', gender: 'male', role: 'random',
    homeMapId: 'shadow_city',
    title: '暗影城密探', origin: '暗影城', originType: 'wanderer',
    background: '暗影城的情报贩子，掌握着各大宗门的秘密。只要出得起价，什么情报都能买到。',
    familyStatus: '暗影城本土居民，世代从事情报买卖。',
    identityHook: '他手中的情报可能比你自己还了解你。',
    destinyRank: 'ordinary', destinyTags: ['情报', '暗影', '交易'],
    bloodline: '散修漂泊血脉。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['情报', '暗影城'],
    root: '风', rootGrade: 'dual', talent: 'good', bloodlineGrade: 'none',
    constitution: 'ordinary_body', comprehension: 66, luck: 58, physique: 42, willpower: 52,
    growthFlaws: ['greedy_impulse'],
    ambition: 54, loyalty: 22, cruelty: 18, affection: 32, caution: 74, greed: 86
  },
  {
    id: 'npc_yue_ying', name: '月影', gender: 'female', role: 'random',
    homeMapId: 'fox_den',
    title: '狐谷灵狐', origin: '狐谷', originType: 'beast_blood',
    background: '九尾的小跟班，一只修炼了五百年的三尾灵狐。性格活泼调皮，喜欢捉弄人但心地善良。',
    familyStatus: '狐谷的狐族一员，九尾是她表姐。',
    identityHook: '她可能会在关键时刻提供帮助，也可能因为贪玩而惹出麻烦。',
    destinyRank: 'ordinary', destinyTags: ['灵狐', '调皮', '可爱'],
    bloodline: '三尾狐血脉，比九尾低但潜力不错。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['妖兽', '狐谷', '调皮'],
    root: '水', rootGrade: 'dual', talent: 'good', bloodlineGrade: 'thin',
    constitution: 'ordinary_body', comprehension: 48, luck: 76, physique: 32, willpower: 38,
    growthFlaws: [],
    ambition: 24, loyalty: 62, cruelty: 4, affection: 88, caution: 14, greed: 44
  },
  {
    id: 'npc_ku_zhu', name: '苦竹', gender: 'male', role: 'random',
    homeMapId: 'azure_valley',
    title: '药王谷采药人', origin: '药王谷', originType: 'mortal_village',
    background: '药王谷的采药人，虽然没有灵根不能修炼，但对灵草的了解无人能及。他能找到最珍稀的灵药。',
    familyStatus: '世代采药，对药王谷的地形了如指掌。',
    identityHook: '他的采药路线图中标记着几处上古药园的位置。',
    destinyRank: 'ordinary', destinyTags: ['采药', '灵草', '向导'],
    bloodline: '凡俗血脉，尚未显化。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'orthodox',
    tags: ['凡人', '药王谷', '向导'],
    root: '木', rootGrade: 'mixed', talent: 'mortal', bloodlineGrade: 'none',
    constitution: 'ordinary_body', comprehension: 28, luck: 66, physique: 56, willpower: 62,
    growthFlaws: [],
    ambition: 8, loyalty: 82, cruelty: 2, affection: 72, caution: 46, greed: 12
  },
  {
    id: 'npc_hei_bai', name: '黑白无常', gender: 'male', role: 'random',
    homeMapId: 'shadow_city',
    title: '暗影城双煞', origin: '暗影城', originType: 'fallen_house',
    background: '一对孪生兄弟，修炼合击之术。两人心意相通，联手时战力倍增。他们接各种脏活，只要报酬够高。',
    familyStatus: '破落修真家族的后人。',
    identityHook: '他们可能成为可靠的雇佣兵，也可能被人收买来对付你。',
    destinyRank: 'fated', destinyTags: ['双胞胎', '合击', '佣兵'],
    bloodline: '败落旧族血脉，有微弱的心灵感应。',
    constitutionNote: '体质平常，胜在根基稳定。', factionStance: 'neutral',
    tags: ['佣兵', '暗影城', '合击'],
    root: '雷', rootGrade: 'dual', talent: 'good', bloodlineGrade: 'thin',
    constitution: 'ordinary_body', comprehension: 52, luck: 38, physique: 76, willpower: 58,
    growthFlaws: ['greedy_impulse'],
    ambition: 62, loyalty: 38, cruelty: 44, affection: 24, caution: 56, greed: 78
  }
]

export function getHandCraftedNpcById(id: string): HandCraftedNpc | undefined {
  return HAND_CRAFTED_NPCS.find(npc => npc.id === id)
}

export function getHandCraftedNpcsByUnlockCondition(type: string, value: string): HandCraftedNpc[] {
  switch (type) {
    case 'storyChapter':
      return HAND_CRAFTED_NPCS.filter(npc => npc.unlockConditions?.storyChapter === value)
    case 'joinSect':
      return HAND_CRAFTED_NPCS.filter(npc => npc.unlockConditions?.joinSect === value)
    case 'encounterArea':
      return HAND_CRAFTED_NPCS.filter(npc => npc.unlockConditions?.encounterArea === value)
    default:
      return []
  }
}

export function getNpcsForRealm(realm: string): HandCraftedNpc[] {
  const realmOrder = ['炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘', '仙人']
  const minIndex = realmOrder.indexOf(realm)
  if (minIndex < 0) return []
  return HAND_CRAFTED_NPCS.filter(npc => {
    if (!npc.unlockConditions?.realmMin) return true
    const condIndex = realmOrder.indexOf(npc.unlockConditions.realmMin)
    return condIndex >= 0 && realmOrder.indexOf(realm) >= condIndex
  })
}

/** 检测玩家行为是否满足NPC解锁条件，返回应解锁的NPC ID列表 */
export function checkNpcUnlockConditions(
  input: {
    completedStoryChapters: string[]
    joinedSectIds: string[]
    currentRealm: string
    visitedAreas: string[]
    alreadyUnlocked: string[]
  }
): string[] {
  const toUnlock: string[] = []
  for (const npc of HAND_CRAFTED_NPCS) {
    if (input.alreadyUnlocked.includes(npc.id)) continue
    const cond = npc.unlockConditions
    if (!cond) continue
    if (cond.storyChapter && input.completedStoryChapters.includes(cond.storyChapter)) {
      toUnlock.push(npc.id)
    } else if (cond.joinSect && input.joinedSectIds.includes(cond.joinSect)) {
      toUnlock.push(npc.id)
    } else if (cond.realmMin && input.currentRealm === cond.realmMin) {
      toUnlock.push(npc.id)
    } else if (cond.encounterArea && input.visitedAreas.includes(cond.encounterArea)) {
      toUnlock.push(npc.id)
    }
  }
  return toUnlock
}
