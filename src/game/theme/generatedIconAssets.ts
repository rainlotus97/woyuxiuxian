export type GeneratedGameIconKey =
  | 'alchemy'
  | 'armor'
  | 'backpack'
  | 'beast'
  | 'book'
  | 'cloud'
  | 'companion'
  | 'cultivation'
  | 'fire'
  | 'flag'
  | 'forge'
  | 'formation'
  | 'gift'
  | 'globe'
  | 'herb'
  | 'landmark'
  | 'lock'
  | 'map'
  | 'mission'
  | 'moon'
  | 'mountain'
  | 'pill'
  | 'progress'
  | 'reputation'
  | 'sect'
  | 'skull'
  | 'spark'
  | 'spirit-stone'
  | 'star'
  | 'sword'
  | 'thunder'
  | 'void'
  | 'wind'

const generatedIconModules = import.meta.glob('@/assets/theme/generated/icons/transparent/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const ICON_ALIASES: Record<string, GeneratedGameIconKey> = {
  alchemy: 'alchemy',
  '炼丹': 'alchemy',
  '🧪': 'alchemy',
  '💊': 'alchemy',
  armor: 'armor',
  '甲': 'armor',
  '布': 'armor',
  Shield: 'armor',
  backpack: 'backpack',
  '物': 'backpack',
  '装': 'backpack',
  Backpack: 'backpack',
  Package: 'backpack',
  beast: 'beast',
  '🐺': 'beast',
  '🦊': 'beast',
  '🐉': 'beast',
  '🦅': 'beast',
  '🦁': 'beast',
  '🪽': 'beast',
  book: 'book',
  '📚': 'book',
  BookOpen: 'book',
  cloud: 'cloud',
  '☁️': 'cloud',
  '☁': 'cloud',
  '霜': 'cloud',
  companion: 'companion',
  '伴': 'companion',
  '人': 'companion',
  UsersRound: 'companion',
  cultivation: 'cultivation',
  '修': 'cultivation',
  '气': 'cultivation',
  '坐': 'cultivation',
  '打坐': 'cultivation',
  Activity: 'cultivation',
  fire: 'fire',
  '火': 'fire',
  '🔥': 'fire',
  Flame: 'fire',
  flag: 'flag',
  '⚑': 'flag',
  forge: 'forge',
  '炼器': 'forge',
  '铁': 'forge',
  '⚒️': 'forge',
  Hammer: 'forge',
  Pickaxe: 'forge',
  formation: 'formation',
  '阵': 'formation',
  gift: 'gift',
  '得': 'gift',
  '🎁': 'gift',
  Gift: 'gift',
  globe: 'globe',
  '🌏': 'globe',
  '🌐': 'globe',
  Globe: 'globe',
  herb: 'herb',
  '木': 'herb',
  '果': 'herb',
  '羹': 'herb',
  '草': 'herb',
  '炼': 'forge',
  '演': 'spark',
  '纸': 'mission',
  '旗': 'flag',
  '砂': 'mountain',
  '墨': 'mission',
  '🌿': 'herb',
  '🌱': 'herb',
  '🌲': 'herb',
  '🏜️': 'mountain',
  '🏜': 'mountain',
  Leaf: 'herb',
  landmark: 'landmark',
  '🏛️': 'landmark',
  '🏛': 'landmark',
  Landmark: 'landmark',
  Castle: 'landmark',
  lock: 'lock',
  '🔒': 'lock',
  Lock: 'lock',
  map: 'map',
  '🗺️': 'map',
  '🗺': 'map',
  '🧭': 'map',
  '📍': 'map',
  '行': 'map',
  '闻': 'map',
  Map: 'map',
  MapPin: 'map',
  Compass: 'map',
  mission: 'mission',
  '令': 'mission',
  '📋': 'mission',
  '📜': 'mission',
  '📝': 'mission',
  '⛓️': 'lock',
  '⛓': 'lock',
  '🧱': 'armor',
  '🪢': 'mission',
  '🏚️': 'landmark',
  '🏚': 'landmark',
  Clipboard: 'mission',
  scroll: 'mission',
  Scroll: 'mission',
  ScrollText: 'mission',
  moon: 'moon',
  '🌑': 'moon',
  Moon: 'moon',
  mountain: 'mountain',
  '土': 'mountain',
  '⛰️': 'mountain',
  '⛰': 'mountain',
  '🏔️': 'mountain',
  '🏔': 'mountain',
  Mountain: 'mountain',
  pill: 'pill',
  '丹': 'pill',
  '药': 'pill',
  Pill: 'pill',
  progress: 'progress',
  '📈': 'progress',
  reputation: 'reputation',
  '🏅': 'reputation',
  Medal: 'reputation',
  Trophy: 'reputation',
  sect: 'sect',
  '宗': 'sect',
  skull: 'skull',
  Skull: 'skull',
  '妖': 'skull',
  '魔': 'skull',
  '毒': 'skull',
  '😈': 'skull',
  '🩸': 'skull',
  spark: 'spark',
  '灵': 'spark',
  '力': 'spark',
  '✨': 'spark',
  '⭐': 'spark',
  '🌟': 'spark',
  Sparkles: 'spark',
  Star: 'spark',
  '灵石': 'spirit-stone',
  'spirit-stone': 'spirit-stone',
  '石': 'spirit-stone',
  '金': 'spirit-stone',
  '💎': 'spirit-stone',
  '💰': 'spirit-stone',
  Coins: 'spirit-stone',
  Diamond: 'spirit-stone',
  star: 'star',
  sword: 'sword',
  '剑': 'sword',
  '万': 'sword',
  '锋': 'sword',
  '霄': 'sword',
  '沌': 'sword',
  '玄': 'sword',
  '🗡️': 'sword',
  '🗡': 'sword',
  '⚔️': 'sword',
  '⚔': 'sword',
  Sword: 'sword',
  Swords: 'sword',
  '🛡️': 'armor',
  '🛡': 'armor',
  '🕸️': 'beast',
  '🕸': 'beast',
  '🕳️': 'void',
  '🕳': 'void',
  '🕊️': 'beast',
  '🕊': 'beast',
  '❄️': 'cloud',
  '❄': 'cloud',
  thunder: 'thunder',
  '雷': 'thunder',
  '⚡': 'thunder',
  Zap: 'thunder',
  void: 'void',
  '空': 'void',
  '影': 'void',
  '狱': 'void',
  '咒': 'void',
  '🌀': 'void',
  Orbit: 'void',
  wind: 'wind',
  '风': 'wind',
  '岚': 'wind',
  Wind: 'wind',
  '盾': 'armor',
  '罩': 'armor',
  '封': 'lock',
  '牢': 'lock',
  '吼': 'beast',
  '爪': 'beast',
  '相': 'companion',
  '眼': 'star',
  '静': 'moon',
  '聚': 'spark',
  '愈': 'spark',
  '治': 'spark'
}

function stripVariationSelector(value: string) {
  return value.replace(/\uFE0F/g, '')
}

export function resolveGeneratedGameIconKey(iconCode: string): GeneratedGameIconKey | null {
  const code = iconCode.trim()
  if (!code) return null
  return ICON_ALIASES[code] ?? ICON_ALIASES[stripVariationSelector(code)] ?? null
}

export function resolveGeneratedGameIconSource(iconCode: string): string {
  const key = resolveGeneratedGameIconKey(iconCode)
  if (!key) return ''

  const entry = Object.entries(generatedIconModules).find(([path]) => {
    const fileName = path.split('/').pop() ?? ''
    return fileName === `${key}.png` || new RegExp(`^${key}-v\\d+\\.png$`).test(fileName)
  })

  return entry?.[1] ?? ''
}
