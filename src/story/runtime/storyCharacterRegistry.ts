import { useWorldStore } from '@/stores/worldStore'

export interface StoryCharacterBinding {
  id: string
  canonicalName: string
  maskedName: string
  aliases: string[]
  faction: string
  worldNpcId?: string
  revealFlag?: string
  summary: string
}

export const STORY_CHARACTER_BINDINGS: StoryCharacterBinding[] = [
  { id: 'luo_yanzhi', canonicalName: '洛衍之', maskedName: '背着断剑的少年', aliases: ['断剑少年', '望石镇少年'], faction: '玄天剑宗', summary: '一个把所有情绪都压在剑里的少年。' },
  { id: 'gu_changxi', canonicalName: '顾长惜', maskedName: '一位持伞的素衣女子', aliases: ['持伞女子', '银瞳女子', '天机使者'], faction: '天机阁 / 碧落宫', worldNpcId: 'story_umbrella_woman', revealFlag: 'story:gu_changxi:revealed', summary: '擅长推演的女子，总像先一步看见你的命运。' },
  { id: 'pei_wangyuan', canonicalName: '裴忘渊', maskedName: '悬剑峰上的冷面宗主', aliases: ['剑宗宗主'], faction: '玄天剑宗', summary: '护短到近乎偏执的玄天剑宗宗主。' },
  { id: 'yun_feiran', canonicalName: '云斐然', maskedName: '一个披紫衣的张扬剑修', aliases: ['紫衣剑修', '紫岚剑修'], faction: '玄天剑宗', summary: '嘴上不服，真到危局时却会站到最前。' },
  { id: 'liu_qingshuang', canonicalName: '柳青霜', maskedName: '一名青衫寡言的女剑修', aliases: ['青衫剑修'], faction: '玄天剑宗', summary: '她沉默得近乎透明，但从未真正缺席。' },
  { id: 'jiang_su', canonicalName: '江溯', maskedName: '满身酒气的第三峰长老', aliases: ['酒鬼长老', '第三峰长老'], faction: '玄天剑宗', summary: '不教招式，只逼人想清楚为何挥剑。' },
  { id: 'wumian_zunzhe', canonicalName: '无面尊者', maskedName: '戴青铜面具的人', aliases: ['青铜面具人', '明衍'], faction: '天机阁', summary: '理想扭曲之后，最像天命本身的疯子。' },
  { id: 'si_tianming', canonicalName: '司天命', maskedName: '一位说话总很温和的阁主', aliases: ['阁主', '顾长惜养父'], faction: '天机阁', summary: '每一次关切都像真心，也都带着算计。' },
  { id: 'shen_jingming', canonicalName: '沈镜明', maskedName: '总着白衣的少阁主', aliases: ['白衣少阁主', '白衣少年'], faction: '天机阁', worldNpcId: 'story_white_clothed_youth', revealFlag: 'story:shen_jingming:revealed', summary: '一个过于完美的人，连占有欲都显得温柔。' },
  { id: 'su_wantang', canonicalName: '苏晚棠', maskedName: '碧水深处的宫主', aliases: ['碧落宫宫主'], faction: '碧落宫', summary: '最早看穿天机阁，却也最懂得等待。' },
  { id: 'wen_ruxu', canonicalName: '温如许', maskedName: '一个笑起来有酒窝的小师妹', aliases: ['酒窝少女'], faction: '碧落宫', summary: '轻快只是她的表面，真正的身份并不轻。' },
  { id: 'xie_buyu', canonicalName: '谢不语', maskedName: '压低斗笠的行路人', aliases: ['沉默游侠', '斗笠客'], faction: '中立', summary: '知道最多的人，往往最不愿开口。' },
  { id: 'bailu_xiansheng', canonicalName: '白鹿先生', maskedName: '骑着白鹿的白发老人', aliases: ['白发老人', '白鹿守护者'], faction: '青木域', summary: '站在秘境深处的人，像一段活着的古史。' },
  { id: 'zhongli_yue', canonicalName: '钟离越', maskedName: '右脸有疤的叛逃女子', aliases: ['疤面女子', '叛逃者'], faction: '长青谷', summary: '嘴上带刺，骨头却比谁都硬。' },
  { id: 'xue_qingya', canonicalName: '薛青鸦', maskedName: '一位算账极快的情报商', aliases: ['情报贩子'], faction: '中立', summary: '她卖消息，也卖退路，但从不白送。' },
  { id: 'jiuyouzi', canonicalName: '九幽子', maskedName: '火脉失控的丹师', aliases: ['烈焰叛徒'], faction: '烈焰天宗', summary: '最危险的不是疯子，是还记得自己为何发疯的人。' },
  { id: 'yin_bofu', canonicalName: '阴伯符', maskedName: '半身被黑色法则侵蚀的人', aliases: ['堕道守护者'], faction: '旧天道', summary: '他像一场活着的反噬，提醒后来人别重走旧路。' },
  { id: 'story_youth_right_shoulder', canonicalName: '一位右肩见血的年轻修士', maskedName: '一位右肩见血的年轻修士', aliases: ['山道伤者'], faction: '未知', worldNpcId: 'story_youth_right_shoulder', summary: '你见过他狼狈的样子，他也见过你的选择。' },
  { id: 'story_umbrella_woman', canonicalName: '一位持伞的素衣女子', maskedName: '一位持伞的素衣女子', aliases: ['雨棚女子'], faction: '未知', worldNpcId: 'story_umbrella_woman', summary: '她先让你记住伞，再让你记住声音。' },
  { id: 'story_white_clothed_youth', canonicalName: '一个白衣少年', maskedName: '一个白衣少年', aliases: ['白衣少年'], faction: '未知', worldNpcId: 'story_white_clothed_youth', summary: '此刻只是一张年轻面孔，真名尚未揭开。' }
]

const BINDING_MAP = new Map(STORY_CHARACTER_BINDINGS.map(item => [item.id, item]))

export function getStoryCharacterBindingById(id: string) {
  return BINDING_MAP.get(id) ?? null
}

export function findStoryCharacterBinding(input: string) {
  const normalized = input.trim()
  return STORY_CHARACTER_BINDINGS.find(binding =>
    binding.id === normalized
    || binding.canonicalName === normalized
    || binding.maskedName === normalized
    || binding.aliases.includes(normalized)
    || binding.worldNpcId === normalized
  ) ?? null
}

export function resolveStoryCharacterTarget(target: string) {
  return findStoryCharacterBinding(target) ?? null
}

export function describeStoryCharacterTarget(target: string): string {
  const binding = findStoryCharacterBinding(target)
  if (!binding) return target
  if (!binding.revealFlag) return binding.maskedName
  const worldStore = useWorldStore()
  return worldStore.hasWorldFlag(binding.revealFlag) ? binding.canonicalName : binding.maskedName
}

export function formatStoryFavorLabel(npcId: string): string {
  return `${describeStoryCharacterTarget(npcId)}好感`
}

export function formatStoryRelationshipLabel(npcId: string, type: string): string {
  const labelMap: Record<string, string> = {
    favor: '好感',
    hatred: '仇恨',
    debt: '恩情',
    fear: '畏惧'
  }
  return `${describeStoryCharacterTarget(npcId)}${labelMap[type] ?? type}`
}

export function syncStoryFavorToWorld(npcId: string, delta: number): void {
  const worldStore = useWorldStore()
  const binding = findStoryCharacterBinding(npcId)
  if (!binding?.worldNpcId) return
  worldStore.unlockNpc(binding.worldNpcId, `${describeStoryCharacterTarget(binding.id)}的因果线被触动。`)
  worldStore.applyStoryRelationshipChange(binding.worldNpcId, {
    favorDelta: delta,
    title: `${describeStoryCharacterTarget(binding.id)}记住了你`,
    text: `${describeStoryCharacterTarget(binding.id)}对你的观感发生变化。`
  })
}

export function syncStoryRelationshipMetric(npcId: string, type: string, delta: number): void {
  const worldStore = useWorldStore()
  const binding = findStoryCharacterBinding(npcId)
  if (!binding?.worldNpcId) return

  const payload: {
    favorDelta?: number
    hatredDelta?: number
    fearDelta?: number
    debtDelta?: number
    title: string
    text: string
  } = {
    title: `${describeStoryCharacterTarget(binding.id)}因你而变`,
    text: '这段关系已经写进世界状态。'
  }

  if (type === 'favor') payload.favorDelta = delta
  if (type === 'hatred') payload.hatredDelta = delta
  if (type === 'fear') payload.fearDelta = delta
  if (type === 'debt') payload.debtDelta = delta
  worldStore.unlockNpc(binding.worldNpcId)
  worldStore.applyStoryRelationshipChange(binding.worldNpcId, payload)
}

export function prerequisiteExpressionToText(expr: unknown): string[] {
  if (!expr || typeof expr !== 'object') return ['条件未知']
  const maybeCondition = expr as { type?: string; condition?: { type?: string; nodeId?: string; value?: string | number } }
  if (maybeCondition.type === 'condition' && maybeCondition.condition) {
    if (maybeCondition.condition.type === 'node_completed' && maybeCondition.condition.nodeId) {
      return [`完成节点 ${maybeCondition.condition.nodeId}`]
    }
    if (maybeCondition.condition.type === 'realm' && maybeCondition.condition.value) {
      return [`境界达到 ${maybeCondition.condition.value}`]
    }
  }
  return ['完成前置故事或满足境界条件']
}

export function validateStoryCharacterBindings() {
  return {
    total: STORY_CHARACTER_BINDINGS.length,
    missingWorldNpcIds: STORY_CHARACTER_BINDINGS.filter(item => !item.worldNpcId).map(item => item.id)
  }
}
