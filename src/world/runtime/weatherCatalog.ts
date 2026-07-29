import type { WorldWeather } from '@/types/world'

export type WorldWeatherTone = 'jade' | 'gold' | 'mist'

export interface WorldWeatherProfile {
  weather: WorldWeather
  label: string
  icon: string
  tone: WorldWeatherTone
  effect: string
  detail: string
  advice: string
}

export const WORLD_WEATHER_PROFILES: Record<WorldWeather, WorldWeatherProfile> = {
  clear: {
    weather: 'clear',
    label: '天朗气清',
    icon: 'spark',
    tone: 'jade',
    effect: '行动与战斗按区域基础值结算',
    detail: '天象平稳，适合安排修炼、赶路或整理宗门事务。',
    advice: '适合推进常规计划'
  },
  rain: {
    weather: 'rain',
    label: '灵雨细落',
    icon: 'herb',
    tone: 'jade',
    effect: '闭关修炼收益提高 10%，战斗回报约提高 3%',
    detail: '雨气滋养灵草，也让战场地面变得湿滑。',
    advice: '适合修炼与采集'
  },
  storm: {
    weather: 'storm',
    label: '雷暴压境',
    icon: 'spark',
    tone: 'gold',
    effect: '敌方强度约提高 7%，战斗回报约提高 8%',
    detail: '雷意激发妖兽凶性，地图隐秘路径暂时难以探查。',
    advice: '高收益，但不宜盲目赶路'
  },
  flood: {
    weather: 'flood',
    label: '洪水漫野',
    icon: 'map',
    tone: 'mist',
    effect: '敌方强度与战斗回报约提高 10%',
    detail: '水路和退路都在变化，部分地图探索点会暂时封闭。',
    advice: '优先处理高价值目标'
  },
  fire: {
    weather: 'fire',
    label: '火潮蔓延',
    icon: 'spark',
    tone: 'mist',
    effect: '敌方强度约提高 9%，战斗回报约提高 11%',
    detail: '火脉躁动，火属性异动和灾象商路会更活跃。',
    advice: '适合挑战，注意体力消耗'
  },
  mist: {
    weather: 'mist',
    label: '雾锁山河',
    icon: 'map',
    tone: 'gold',
    effect: '敌方强度约提高 5%，战斗回报约提高 6%',
    detail: '雾里更容易藏人，也更容易撞上埋伏与隐藏机缘。',
    advice: '适合处理奇遇，谨慎选择路线'
  }
}

export function getWorldWeatherProfile(weather: WorldWeather) {
  return WORLD_WEATHER_PROFILES[weather]
}
