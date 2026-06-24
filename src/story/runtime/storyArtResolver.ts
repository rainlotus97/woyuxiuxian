import type { NpcDialog, StoryIllustration, StoryNode } from '@/story/types'
import {
  resolveStoryCharacterProfileById,
  resolveStoryCharacterProfileByName
} from './storyCharacterCodex'
import { STORY_CHARACTER_BINDINGS } from './storyCharacterRegistry'

const sceneModules = import.meta.glob('@/assets/story/concepts/scenes/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const sceneWideModules = import.meta.glob('@/assets/story/concepts/scenes-16x9/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const factionModules = import.meta.glob('@/assets/story/concepts/factions/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const factionWideModules = import.meta.glob('@/assets/story/concepts/factions-16x9/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const sceneKeywordMap = [
  { keywords: ['碧落宫', '崖台', '海崖', '临海'], file: 'biluo-palace-cliff-terrace-v2.png', alt: '碧落宫崖台' },
  { keywords: ['天机阁', '银瞳女子', '持伞女子', '雨棚'], file: 'biluo-palace-cliff-terrace-v1.png', alt: '碧落宫临崖长廊' },
  { keywords: ['第三峰', '练剑场', '练剑坪', '演武坪', '后院歪脖子松', '第三峰后院', '剑冢', '铸剑炉'], file: 'third-peak-training-ground-v1.png', alt: '第三峰练剑坪' },
  { keywords: ['观星殿', '观星台', '星盘', '推演殿', '推演室', '禁地玉简', '阁中高台', '天机高台'], file: 'tianji-observatory-hall-v1.png', alt: '天机阁观星殿' },
  { keywords: ['望石镇', '铁匠铺', '炉火', '锻炉', '铁匠旧短褐', '黄昏小镇', '镇口铁铺', '井沿', '老槐树'], file: 'wangshi-town-forge-v1.png', alt: '望石镇铁匠铺' },
  { keywords: ['矿脉', '矿坑', '赤晶矿', '战线', '火山灰', '岩浆裂缝', '边境矿区', '东三号哨站', '河谷哨站', '熔岩河谷'], file: 'red-crystal-mine-warfront-v1.png', alt: '赤晶矿战线' },
  { keywords: ['白鹿秘境', '白鹿境', '鹿鸣台', '古木棋坪', '书院旧境'], file: 'biluo-palace-cliff-terrace-v2.png', alt: '白鹿旧境高台' },
  { keywords: ['长青谷', '苍梧神木', '谷中旧殿', '木灵古殿', '谷内石阶'], file: 'third-peak-training-ground-v1.png', alt: '长青谷旧殿' }
]

const factionKeywordMap = [
  { keywords: ['玄天剑宗', '剑宗', '第三峰', '悬剑峰', '归尘渊', '剑魂渊'], file: 'xuantian-sword-sect-v2.png', alt: '玄天剑宗山门' },
  { keywords: ['玄天域', '剑峰', '剑门', '第三峰峰顶', '七座剑峰'], file: 'xuantian-sword-sect-v1.png', alt: '玄天剑宗群峰' },
  { keywords: ['碧落宫', '宫主', '碧水深处', '灵池', '海崖石台', '碧落宫天台', '碧落水宫'], file: 'biluo-palace-final-v1.png', alt: '碧落宫宫阙' },
  { keywords: ['天机阁', '阁主', '推演', '司天命', '推演玉简', '天机楼', '摘星楼'], file: 'tianji-pavilion-v1.png', alt: '天机阁楼阁' },
  { keywords: ['长青谷', '长青旧脉', '谷主', '苍梧神木', '谷中正殿'], file: 'changqing-valley-v1.png', alt: '长青谷山门' },
  { keywords: ['灵药谷', '药园', '古药园', '药谷', '幽谷', '药庐'], file: 'changqing-valley-v1.png', alt: '灵药谷深处' },
  { keywords: ['烈焰天宗', '赤炎域', '火域', '火山', '熔岩废墟', '炎宗', '火山宗门'], file: 'red-flame-domain-v1.png', alt: '赤炎域山门' },
  { keywords: ['白鹿书院', '白鹿秘境', '白鹿境', '白鹿先生', '五域盟会', '书院山门'], file: 'white-deer-realm-v1.png', alt: '白鹿书院旧境' }
]

const protagonistProfileIds = new Set([
  'npc_luoyanzhi',
  'npc_guchangxi'
])

function findAssetByFilename(modules: Record<string, string>, filename: string) {
  return Object.entries(modules).find(([path]) => path.endsWith(filename))?.[1] ?? ''
}

function resolveWideFilename(filename: string) {
  const matched = filename.match(/^(.*?)-v\d+\.png$/u)
  if (!matched) return filename
  return `${matched[1]}-16x9-v1.png`
}

export function resolveStoryCharacterArtByName(name: string | undefined | null) {
  if (!name) return null
  return resolveStoryCharacterProfileByName(name)
}

export function resolveStoryCharacterArtById(id: string | undefined | null) {
  if (!id) return null
  return resolveStoryCharacterProfileById(id)
}

export function enrichStoryDialogVisual(dialog: NpcDialog): NpcDialog {
  if (!dialog.speaker) return dialog
  const art = resolveStoryCharacterArtByName(dialog.speaker)
  if (!art) return dialog
  return {
    ...dialog,
    avatar: dialog.avatar || art.avatar,
    portrait: dialog.portrait || art.portrait,
    avatarFocus: dialog.avatarFocus || art.avatarFocus
  }
}

function resolveKeywordIllustration(source: string, type: 'scene' | 'faction') {
  const dictionary = type === 'scene' ? sceneKeywordMap : factionKeywordMap
  const baseModules = type === 'scene' ? sceneModules : factionModules
  const wideModules = type === 'scene' ? sceneWideModules : factionWideModules
  const matched = dictionary
    .map(entry => ({
      entry,
      score: entry.keywords.reduce((count, keyword) => count + (source.includes(keyword) ? 1 : 0), 0)
    }))
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score)[0]?.entry
  if (!matched) return null
  const wideFilename = resolveWideFilename(matched.file)
  const src = findAssetByFilename(wideModules, wideFilename) || findAssetByFilename(baseModules, matched.file)
  if (!src) return null
  return {
    type,
    src,
    alt: matched.alt,
    align: type === 'scene' ? 'center' : 'right',
    emphasis: type === 'scene' ? 'focus' : 'soft'
  } satisfies StoryIllustration
}

function resolveMentionedCharacterProfile(source: string) {
  if (!source.trim()) return null
  for (const binding of STORY_CHARACTER_BINDINGS) {
    const candidates = [binding.canonicalName, binding.maskedName, ...binding.aliases].filter(Boolean)
    const matched = candidates.find(candidate => source.includes(candidate))
    if (!matched) continue
    const profile = resolveStoryCharacterProfileByName(binding.canonicalName)
      ?? resolveStoryCharacterProfileByName(matched)
    if (profile?.portrait) return profile
  }
  return null
}

export function resolveStoryIllustration(node: StoryNode | null): StoryIllustration | null {
  if (!node) return null
  if (node.content.illustration?.src) return node.content.illustration

  const combinedText = [node.map, node.name, node.content.text, node.content.innerMonologue]
    .filter(Boolean)
    .join(' ')
  const narrativeNode = (node.content.npcDialogs?.length ?? 0) === 0
  const resolvedScene = resolveKeywordIllustration(combinedText, 'scene')
  const resolvedFaction = resolveKeywordIllustration(combinedText, 'faction')

  if (narrativeNode && (resolvedScene || resolvedFaction)) {
    return resolvedScene ?? resolvedFaction ?? null
  }

  const dialogSpeaker = node.content.npcDialogs?.[0]?.speaker ?? ''
  const speakerArt = resolveStoryCharacterArtByName(dialogSpeaker)
  if (speakerArt?.portrait) {
    return {
      type: 'character',
      src: speakerArt.portrait,
      alt: `${dialogSpeaker}立绘`,
      align: 'center',
      emphasis: 'focus',
      subjectId: speakerArt.id
    }
  }

  const mentionedCharacter = resolveMentionedCharacterProfile(combinedText)
  if (mentionedCharacter?.portrait && !protagonistProfileIds.has(mentionedCharacter.id)) {
    return {
      type: 'character',
      src: mentionedCharacter.portrait,
      alt: `${mentionedCharacter.name}立绘`,
      align: 'center',
      emphasis: 'focus',
      subjectId: mentionedCharacter.id
    }
  }

  return resolvedScene
    ?? resolvedFaction
    ?? null
}
