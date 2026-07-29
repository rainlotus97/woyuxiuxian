import { characterArtManifest } from '@/assets/story/characters/manifest'
import type { Perspective } from '@/story/types'

const portraitModules = import.meta.glob('@/assets/story/characters/portraits/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const portrait9x16Modules = import.meta.glob('@/assets/story/characters/portraits-9x16/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const avatarModules = import.meta.glob('@/assets/story/characters/avatars/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

export interface StoryVoiceMeta {
  key: string
  sampleLine: string
}

export interface StoryAvatarFocus {
  x: number
  y: number
  scale: number
}

export interface StoryCharacterProfile {
  id: string
  name: string
  title: string
  faction: string
  intro: string
  description: string
  tags: string[]
  portrait: string
  avatar: string
  avatarFocus?: StoryAvatarFocus
  debutLabel?: string
  arrivalLine?: string
  voice?: StoryVoiceMeta
}

export const STORY_PROTAGONIST_PROFILE_IDS = {
  male: 'npc_luoyanzhi',
  female: 'npc_guchangxi'
} as const

const normalizeKey = (value: string) => value.replace(/\s+/g, '').replace(/[·\-_]/g, '').toLowerCase()

const profileSeed: Record<string, Omit<StoryCharacterProfile, 'portrait' | 'avatar'>> = {
  npc_luoyanzhi: {
    id: 'npc_luoyanzhi',
    name: '洛衍之',
    title: '断剑少年',
    faction: '玄天剑宗',
    intro: '出身铁匠铺的金灵根少年，锋芒还没真正露全。',
    description: '他记人的方式很笨，只会把你说过的话和自己磨过的每一道剑痕都记住。真正的名字与来历，会在往后的剑路里一点点揭开。',
    tags: ['金灵根', '剑修', '命线主角'],
    debutLabel: '初见',
    arrivalLine: '先记住这个背着断剑的少年，名字和来头会慢慢浮出来。',
    voice: { key: 'npc_luoyanzhi_intro', sampleLine: '先记住我的剑，不必急着问名字。' }
  },
  npc_guchangxi: {
    id: 'npc_guchangxi',
    name: '顾长惜',
    title: '碧落宫命定使者',
    faction: '碧落宫 / 天机阁',
    intro: '看似冷静持重，实则把人情和疑心都记得很深。',
    description: '她每次现身都像风过水面，话不多，却会把你的反应、旧伤与因果一并记下。初见未必告诉你真名，但她不会轻易忘人。',
    tags: ['天机之瞳', '命定之人', '水系'],
    debutLabel: '先认住她',
    arrivalLine: '她像从水雾里走出来的一样，先记住气息与目光，真名不必急着一次说透。',
    voice: { key: 'npc_guchangxi_intro', sampleLine: '先醒醒，别把这一息错过去。' }
  },
  npc_peiwangyuan: {
    id: 'npc_peiwangyuan',
    name: '裴忘渊',
    title: '第三峰冷面师兄',
    faction: '玄天剑宗',
    intro: '话少，眼毒，记仇也记恩。',
    description: '他看人像看剑，先看裂纹，再看骨相。若你被他记住，多半不是因为客套，而是因为你真在局里留下了痕。',
    tags: ['剑宗', '审势', '护短'],
    debutLabel: '来人不善闲谈',
    arrivalLine: '先记住这个总在看人根骨的冷面师兄。',
    voice: { key: 'npc_peiwangyuan_intro', sampleLine: '能站住的人，我自会多看一眼。' }
  },
  npc_yunfeiran: {
    id: 'npc_yunfeiran',
    name: '云斐然',
    title: '东境快剑',
    faction: '玄天剑宗',
    intro: '嘴上冷，出手快，情分从不挂在嘴边。',
    description: '他更擅长用一瓶伤药和一剑断后替人说话。若与你有恩怨，往后再见时，他一定记得清清楚楚。',
    tags: ['快剑', '边境', '旧恩旧怨'],
    debutLabel: '先认这道快剑',
    arrivalLine: '话不重，但剑先到。这样的人，往后多半还会回头撞见。',
    voice: { key: 'npc_yunfeiran_intro', sampleLine: '剑宗的人记一句谢，也记一句仇。' }
  },
  npc_liuqingshuang: {
    id: 'npc_liuqingshuang',
    name: '柳青霜',
    title: '青霜剑脉传人',
    faction: '玄天剑宗',
    intro: '人冷如雪，剑意更冷。',
    description: '她出场总带着一种不近人情的克制感，但真正被她纳入视线之后，你会发现她比谁都在乎规矩里的那点真心。',
    tags: ['冰剑', '肃杀', '峰门真传'],
    debutLabel: '寒意先到',
    arrivalLine: '像是剑锋先过来，人还没完全走近。',
    voice: { key: 'npc_liuqingshuang_intro', sampleLine: '别靠得太近，我的剑意认人。' }
  },
  npc_wumianzunzhe: {
    id: 'npc_wumianzunzhe',
    name: '无面尊者',
    title: '幕后推演者',
    faction: '未知',
    intro: '没有人真正见过他的脸，只见过他留下的因果。',
    description: '这是那种不该太早被讲透的人物。你先记住他像一层罩在众人头顶的影，很多人的命，最后都会绕回这里。',
    tags: ['幕后', '禁术', '高危'],
    debutLabel: '先见其影',
    arrivalLine: '这不是该一次说透的人，先记住他像一层压在众人头顶的影。',
    voice: { key: 'npc_wumianzunzhe_intro', sampleLine: '你以为是偶遇，其实早有人替你排好了路。' }
  },
  npc_jiangsu: {
    id: 'npc_jiangsu',
    name: '江溯',
    title: '醉剑老修',
    faction: '玄天剑宗',
    intro: '看上去散漫，真正开口时句句都压得住人。',
    description: '他像那种会在酒气里突然点破你的人。若你肯练，他就肯教，但他教的从来不是表面招式。',
    tags: ['授业', '剑感', '隐锋'],
    debutLabel: '酒气里的人',
    arrivalLine: '别只记住酒壶，他真正厉害的是一开口就能点到根上。',
    voice: { key: 'npc_jiangsu_intro', sampleLine: '先别学招，先学怎么听见剑响。' }
  },
  npc_sitianming: {
    id: 'npc_sitianming',
    name: '司天命',
    title: '天机阁少主',
    faction: '天机阁',
    intro: '永远像把一切都算过一遍的人。',
    description: '他待人温和，安排却总是恰到好处。第一次见时也许只是一个沉静的青年，但越往后越会意识到，他从来不只是在看眼前。',
    tags: ['推演', '布局', '天机阁'],
    debutLabel: '像早就知道',
    arrivalLine: '先记住这个说话总很稳的人，很多局往后都会和他牵上。',
    voice: { key: 'npc_sitianming_intro', sampleLine: '很多答案，不必急着现在就知道。' }
  },
  npc_suwantang: {
    id: 'npc_suwantang',
    name: '苏晚棠',
    title: '碧落宫主',
    faction: '碧落宫',
    intro: '像海面一样安静，也像深海一样难测。',
    description: '她的温柔不是软，而是一种把局势看尽以后仍肯给你留退路的分寸。很多场景里，她更像真正的定海针。',
    tags: ['宫主', '水系', '师门长辈'],
    debutLabel: '像海一样静',
    arrivalLine: '先记住她的分寸和气定神闲，不必急着把她讲得太满。',
    voice: { key: 'npc_suwantang_intro', sampleLine: '先把心神收回来，再看前头的浪。' }
  },
  npc_jiuyouzi: {
    id: 'npc_jiuyouzi',
    name: '九幽子',
    title: '吞噬邪修',
    faction: '九幽一脉',
    intro: '一身火气和邪意，像随时会反咬人的旧祸。',
    description: '他适合被当作真正的危险来展示，而不是普通过场角色。第一次亮相时，最好让玩家先从气息和残局里认识他。',
    tags: ['邪修', '吞噬秘法', '火系'],
    debutLabel: '凶名先到',
    arrivalLine: '这种人先别讲资料，先让人感觉到危险。',
    voice: { key: 'npc_jiuyouzi_intro', sampleLine: '你们身上的道源，借我一口。' }
  },
  npc_shenjingming: {
    id: 'npc_shenjingming',
    name: '沈镜明',
    title: '镜湖丹修',
    faction: '镜湖丹阁',
    intro: '看似温润，骨子里却带着很硬的执念。',
    description: '这类人物适合在故事里先以“那个总拿药香的人”出现，让玩家先记住气味、语气和手法，再慢慢接名字。',
    tags: ['丹修', '医道', '执念'],
    debutLabel: '药香先记住',
    arrivalLine: '先记住他身上的药气和说话方式，名字可以稍后再落。',
    voice: { key: 'npc_shenjingming_intro', sampleLine: '药能救命，也能逼人认清命。' }
  },
  npc_wenruxu: {
    id: 'npc_wenruxu',
    name: '温如许',
    title: '坊市笑面客',
    faction: '云游商路',
    intro: '笑意最深的时候，反而最该提防。',
    description: '他是那种一眼就该被记住的坊市人物，适合和宝物、交易、人情债一起出场，后续反复回勾。',
    tags: ['坊市', '交易', '人情债'],
    debutLabel: '笑面先露',
    arrivalLine: '这种人适合和坊市、宝物、人情账一起登场。',
    voice: { key: 'npc_wenruxu_intro', sampleLine: '价钱好谈，人情可就未必了。' }
  },
  npc_xiebuyu: {
    id: 'npc_xiebuyu',
    name: '谢不语',
    title: '沉默阵师',
    faction: '散修',
    intro: '寡言到近乎冷淡，做事却比谁都稳。',
    description: '如果只是远远见过他一次，玩家也该记住他站在阵纹边一动不动的样子。这样后面再回调，人物会立得更牢。',
    tags: ['阵法', '寡言', '稳重'],
    debutLabel: '先见其阵',
    arrivalLine: '先记住他站在阵纹边不动的样子，比讲履历更有用。',
    voice: { key: 'npc_xiebuyu_intro', sampleLine: '阵没稳之前，别乱动。' }
  },
  npc_bailuxiansheng: {
    id: 'npc_bailuxiansheng',
    name: '白鹿先生',
    title: '白鹿书院来客',
    faction: '白鹿书院',
    intro: '说话像在讲经，落子却很实。',
    description: '这种人物更适合场景感强一些的展示，和书院、棋局、旧典一起挂钩，比单独一段资料更能立住味道。',
    tags: ['书院', '棋局', '谋局'],
    debutLabel: '像在落子',
    arrivalLine: '先把书院气和棋局味带出来，人自然会立住。',
    voice: { key: 'npc_bailuxiansheng_intro', sampleLine: '局未下完前，别急着认输赢。' }
  },
  npc_zhongliyue: {
    id: 'npc_zhongliyue',
    name: '钟离越',
    title: '旧谷遗孤',
    faction: '长青旧脉',
    intro: '背着旧案活下来的人，总会比旁人更会藏锋。',
    description: '她适合先以血手印、旧玉简、被追杀的人出现，让玩家先记住她的处境，再接上正式身份。',
    tags: ['遗孤', '旧案', '木系'],
    debutLabel: '先记其处境',
    arrivalLine: '先让人记住她背着旧案活下来的样子，再慢慢接名字。',
    voice: { key: 'npc_zhongliyue_intro', sampleLine: '有些名字，不活下来是没资格说出口的。' }
  },
  npc_xueqingya: {
    id: 'npc_xueqingya',
    name: '薛青鸦',
    title: '黑羽来客',
    faction: '未知',
    intro: '来去太快，像风里一截黑影。',
    description: '她不是那种靠大段说明立住的人，应该靠第一眼的危险感和后续回响慢慢积累存在感。',
    tags: ['神秘', '轻身', '危机'],
    debutLabel: '黑影掠过',
    arrivalLine: '这种人更该先靠一眼危险感立住，而不是解释太多。',
    voice: { key: 'npc_xueqingya_intro', sampleLine: '你若记住了我，说明这局已经不轻了。' }
  },
  npc_yinbofu: {
    id: 'npc_yinbofu',
    name: '阴伯符',
    title: '古阵遗民',
    faction: '古阵遗族',
    intro: '身上总带着一种不属于今世的旧气。',
    description: '他更像地图与宗门大线上的节点人物，适合和遗迹、古阵、尘封真相一起出现，而不是只当一次性 NPC。',
    tags: ['古阵', '遗迹', '旧时代'],
    debutLabel: '古意先压来',
    arrivalLine: '先让人感觉到旧时代的味道，再把名字往上接。',
    voice: { key: 'npc_yinbofu_intro', sampleLine: '你脚下这片地，比你想的老得多。' }
  }
}

function findAssetByFilename(modules: Record<string, string>, filename: string) {
  return Object.entries(modules).find(([path]) => path.endsWith(filename))?.[1] ?? ''
}

const portrait9x16ByCharacterId: Record<string, string[]> = {
  npc_luoyanzhi: ['luo-yanzhi-main-9x16-v1.png', 'luo-yanzhi-sword-ready-9x16-v2.png'],
  npc_guchangxi: ['gu-changxi-adult-9x16-v1.png', 'gu-changxi-water-blue-9x16-v1.png'],
  npc_jiangsu: ['jiangsu-redesign-9x16-v3.png'],
  npc_jiuyouzi: ['jiuyouzi-redesign-9x16-v2.png'],
  npc_xiebuyu: ['xiebuyu-redesign-9x16-v2.png']
}

function findPreferredPortrait9x16(id: string) {
  for (const filename of portrait9x16ByCharacterId[id] ?? []) {
    const asset = findAssetByFilename(portrait9x16Modules, filename)
    if (asset) return asset
  }
  return ''
}

const baseProfiles = characterArtManifest.map((asset) => {
  const portraitFilename = asset.portrait.split('/').pop() ?? ''
  const avatarFilename = asset.avatar.split('/').pop() ?? ''
  const seed = profileSeed[asset.id]

  return {
    ...(seed ?? {
      id: asset.id,
      name: asset.name,
      title: '人物',
      faction: '未归档',
      intro: '此人已留下第一道痕迹，后续档案待补。',
      description: '当前只接入了立绘与头像资源，简介与关系线会随着剧情继续补齐。',
      tags: ['待补'],
    }),
    portrait: findPreferredPortrait9x16(asset.id) || findAssetByFilename(portraitModules, portraitFilename),
    avatar: findAssetByFilename(avatarModules, avatarFilename),
    avatarFocus: asset.avatarFocus
      ? {
        x: asset.avatarFocus.x,
        y: asset.avatarFocus.y,
        scale: asset.avatarFocus.scale ?? 2.6
      }
      : undefined
  } satisfies StoryCharacterProfile
})

export const storyCharacterProfiles = baseProfiles

export const storyCharacterProfileMap = Object.fromEntries(
  storyCharacterProfiles.map(profile => [profile.id, profile])
) as Record<string, StoryCharacterProfile>

const characterNameMap = Object.fromEntries(
  storyCharacterProfiles.map(profile => [normalizeKey(profile.name), profile.id])
) as Record<string, string>

export function resolveStoryCharacterProfileById(id: string | undefined | null) {
  if (!id) return null
  return storyCharacterProfileMap[id] ?? null
}

export function resolveStoryCharacterProfileByName(name: string | undefined | null) {
  if (!name) return null
  const profileId = characterNameMap[normalizeKey(name)]
  return profileId ? storyCharacterProfileMap[profileId] ?? null : null
}

export function resolveStoryProtagonistProfile(perspective: Perspective | null | undefined) {
  const protagonistId = perspective === 'female'
    ? STORY_PROTAGONIST_PROFILE_IDS.female
    : STORY_PROTAGONIST_PROFILE_IDS.male
  return resolveStoryCharacterProfileById(protagonistId)
}

export function resolveHiddenProtagonistProfile(perspective: Perspective | null | undefined) {
  const hiddenId = perspective === 'female'
    ? STORY_PROTAGONIST_PROFILE_IDS.male
    : STORY_PROTAGONIST_PROFILE_IDS.female
  return resolveStoryCharacterProfileById(hiddenId)
}

export function resolveStoryCodexProfiles(perspective: Perspective | null | undefined) {
  const currentProtagonist = resolveStoryProtagonistProfile(perspective)
  const hiddenProtagonist = resolveHiddenProtagonistProfile(perspective)

  return storyCharacterProfiles.filter(profile => {
    if (!hiddenProtagonist) return true
    return profile.id !== hiddenProtagonist.id
  }).sort((left, right) => {
    if (currentProtagonist && left.id === currentProtagonist.id) return -1
    if (currentProtagonist && right.id === currentProtagonist.id) return 1
    return left.name.localeCompare(right.name, 'zh-Hans-CN')
  })
}
