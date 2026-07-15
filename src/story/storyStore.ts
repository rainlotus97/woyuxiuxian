import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { usePlayerStore } from '@/stores/playerStore'
import { useWorldStore } from '@/stores/worldStore'
import type { Realm } from '@/types/unit'
import type { InventoryItem } from '@/stores/playerStore'
import type { StoryChapter, StorySection, ChoiceEffect } from '@/types/storyChapter'
import { chapter_iron_and_blood } from './chapters/vol1/001_iron_and_blood'
import { chapter_mountain_encounter } from './chapters/vol1/002_mountain_encounter'
import { chapter_spirit_herb_valley } from './chapters/vol1/003_spirit_herb_valley'
import { chapter_sword_whisper } from './chapters/vol1/004_sword_whisper'
import { chapter_hermits_secret } from './chapters/vol1/005_hermits_secret'
import { chapter_sword_sect } from './chapters/vol1/006_sword_sect'
import { chapter_first_sword_heart } from './chapters/vol1/007_first_sword_heart'
import { chapter_girl_in_tianji } from './chapters/vol1/008_girl_in_tianji'
import { chapter_sword_qi_forms } from './chapters/vol1/009_sword_qi_forms'
import { chapter_changqing_envoy } from './chapters/vol1/010_changqing_envoy'
import { chapter_sect_tournament } from './chapters/vol1/011_sect_tournament'
import { chapter_rebel_of_qingmu } from './chapters/vol1/012_rebel_of_qingmu'
import { chapter_fathers_wish } from './chapters/vol1/013_fathers_wish'
import { chapter_eyes_of_destiny } from './chapters/vol1/014_eyes_of_destiny'
import { chapter_first_blood } from './chapters/vol1/015_first_blood'
import { chapter_parting_vow } from './chapters/vol1/016_parting_vow'
import { chapter_return_to_tianji } from './chapters/vol1/017_return_to_tianji'
import { chapter_iron_and_sword } from './chapters/vol1/018_iron_and_sword'
import { chapter_first_mission } from './chapters/vol1/019_first_mission'
import { chapter_shadows_of_destiny } from './chapters/vol1/020_shadows_of_destiny'
import { chapter_border_reunion } from './chapters/vol1/021_border_reunion'
import { chapter_volcano_standoff } from './chapters/vol1/022_volcano_standoff'
import { chapter_embers_of_truth } from './chapters/vol1/023_embers_of_truth'
import { chapter_after_the_flame } from './chapters/vol1/024_after_the_flame'
import { chapter_report_and_lies } from './chapters/vol1/025_report_and_lies'
import { chapter_words_before_parting } from './chapters/vol1/026_words_before_parting'
import { chapter_return_to_the_peak } from './chapters/vol1/027_return_to_the_peak'
import { chapter_the_weight_of_destiny } from './chapters/vol1/028_the_weight_of_destiny'
import { chapter_path_to_abyss } from './chapters/vol1/029_path_to_abyss'
import { chapter_into_the_abyss } from './chapters/vol1/030_into_the_abyss'
import { chapter_trial_by_sword } from './chapters/vol1/031_trial_by_sword'
import { chapter_golden_core_dawn } from './chapters/vol1/032_golden_core_dawn'
import { chapter_foundation_building } from './chapters/vol2/017_foundation_building'
import { chapter_border_alert } from './chapters/vol2/018_border_alert'
import { chapter_chiyan_envoy } from './chapters/vol2/019_chiyan_envoy'
import { chapter_reunion } from './chapters/vol2/020_reunion'
import { chapter_dao_seed_battle } from './chapters/vol2/021_dao_seed_battle'
import { chapter_volcano_asura } from './chapters/vol2/022_volcano_asura'
import { chapter_aftermath_talk } from './chapters/vol2/023_aftermath_talk'
import { chapter_foundation_peak } from './chapters/vol2/024_foundation_peak'
import { chapter_tianji_secret } from './chapters/vol2/025_tianji_secret'
import { chapter_plotting } from './chapters/vol2/026_plotting'
import { chapter_war_declared } from './chapters/vol2/027_war_declared'
import { chapter_battlefield_pairing } from './chapters/vol2/028_battlefield_pairing'
import { chapter_swallowing_calamity } from './chapters/vol2/029_swallowing_calamity'
import { chapter_blood_price_dawn } from './chapters/vol2/030_blood_price_dawn'
import { chapter_distant_bells } from './chapters/vol2/031_distant_bells'
import { chapter_separate_paths } from './chapters/vol2/032_separate_paths'
import { chapter_new_horizons } from './chapters/vol2/033_new_horizons'
import { chapter_the_approaching_storm } from './chapters/vol2/034_the_approaching_storm'
import { chapter_edge_of_war } from './chapters/vol2/035_edge_of_war'
import { chapter_blood_and_secrets } from './chapters/vol2/036_blood_and_secrets'
import { chapter_mine_and_blood } from './chapters/vol2/037_mine_and_blood'
import { chapter_their_own_war } from './chapters/vol2/038_their_own_war'
import { chapter_crossing_swords } from './chapters/vol2/039_crossing_swords'
import { chapter_the_furnace } from './chapters/vol2/040_the_furnace'
import { chapter_aftermath_and_ash } from './chapters/vol2/041_aftermath_and_ash'
import { chapter_return_to_the_sword } from './chapters/vol2/042_return_to_the_sword'
import { chapter_war_council } from './chapters/vol2/043_war_council'
import { chapter_the_eye_of_the_storm } from './chapters/vol2/044_the_eye_of_the_storm'
import { chapter_sword_soul_abyss } from './chapters/vol3/033_sword_soul_abyss'
import { chapter_sword_soul_depths } from './chapters/vol3/034_sword_soul_depths'
import { chapter_sword_heart_formed } from './chapters/vol3/035_sword_heart_formed'
import { chapter_changqing_confrontation } from './chapters/vol3/036_changqing_confrontation'
import { chapter_valley_upheaval } from './chapters/vol3/037_valley_upheaval'
import { chapter_fissures } from './chapters/vol3/038_fissures'
import { chapter_dao_devouring_array } from './chapters/vol3/039_dao_devouring_array'
import { chapter_white_deer_realm } from './chapters/vol3/040_white_deer_realm'
import { chapter_tianji_prison } from './chapters/vol3/041_tianji_prison'
import { chapter_guchangxi_break } from './chapters/vol3/043_guchangxi_break'
import { chapter_tianji_fall } from './chapters/vol3/044_tianji_fall'
import { chapter_into_the_abyss_vol3 } from './chapters/vol3/045_into_the_abyss'
import { chapter_the_final_choice } from './chapters/vol3/046_the_final_choice'
import { chapter_new_dawn } from './chapters/vol3/047_new_dawn'
import { chapter_five_domain_mobilize } from './chapters/vol3/048_five_domain_mobilize'
import { chapter_five_routes } from './chapters/vol4/049_five_routes'
import { chapter_underground_array } from './chapters/vol4/050_underground_array'
import { chapter_liuqingshuang_sword } from './chapters/vol4/051_liuqingshuang_sword'
import { chapter_yunfeiran_death } from './chapters/vol4/052_yunfeiran_death'
import { chapter_white_deer_falls } from './chapters/vol4/053_white_deer_falls'
import { chapter_shenjingming_redemption } from './chapters/vol4/054_shenjingming_redemption'
import { chapter_yinbofu_awakening } from './chapters/vol4/055_yinbofu_awakening'
import { chapter_faceless_mask } from './chapters/vol4/056_faceless_mask'
import { chapter_former_dao_lord } from './chapters/vol4/058_former_dao_lord'
import { chapter_luoyanzhi_choice } from './chapters/vol4/059_luoyanzhi_choice'
import { chapter_ruins_dawn } from './chapters/vol4/061_ruins_dawn'
import { chapter_guichen_rebirth } from './chapters/vol5/071_guichen_rebirth'
import { chapter_five_domain_future } from './chapters/vol5/072_five_domain_future'
import { chapter_nine_heavens_promise } from './chapters/vol5/079_nine_heavens_promise'
import type {
  Effect,
  EndingInfo,
  GameplayTrigger,
  NpcDialog,
  Perspective,
  Prerequisite,
  PrerequisiteExpression,
  StoryChoice,
  StoryNode,
  StorySessionState,
  StoryTermination,
  TriggerType,
  VolumeCompletion
} from './types'
import { enrichStoryDialogVisual, resolveStoryIllustration } from './runtime/storyArtResolver'

export interface SideQuestInfo {
  id: string
  name: string
  characterId: string
  characterName: string
  triggerType: TriggerType
  priority: number
  prerequisites: Prerequisite[]
  isAvailable: boolean
  isCompleted: boolean
}

export interface StoryNotification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  data?: unknown
}

export interface StoryCatalogEntry {
  id: string
  title: string
  map: string
  perspective: Perspective
  unlocked: boolean
  completed: boolean
  isCurrent: boolean
  requiredRealm: Realm | null
  requiredRealmLevel: number | null
  blockReason: string | null
}

const STORAGE_KEY = 'story_save_data'
const STORY_START_CHAPTER_BY_PERSPECTIVE: Record<'male' | 'female', string> = {
  male: 'vol1_ch001_iron_and_blood',
  female: 'vol1_ch008_girl_in_tianji'
}

const STORY_CHAPTERS: StoryChapter[] = [
  chapter_iron_and_blood,
  chapter_mountain_encounter,
  chapter_spirit_herb_valley,
  chapter_sword_whisper,
  chapter_hermits_secret,
  chapter_sword_sect,
  chapter_first_sword_heart,
  chapter_girl_in_tianji,
  chapter_sword_qi_forms,
  chapter_changqing_envoy,
  chapter_sect_tournament,
  chapter_rebel_of_qingmu,
  chapter_fathers_wish,
  chapter_eyes_of_destiny,
  chapter_first_blood,
  chapter_parting_vow,
  chapter_return_to_tianji,
  chapter_iron_and_sword,
  chapter_first_mission,
  chapter_shadows_of_destiny,
  chapter_border_reunion,
  chapter_volcano_standoff,
  chapter_embers_of_truth,
  chapter_after_the_flame,
  chapter_report_and_lies,
  chapter_words_before_parting,
  chapter_return_to_the_peak,
  chapter_the_weight_of_destiny,
  chapter_path_to_abyss,
  chapter_into_the_abyss,
  chapter_trial_by_sword,
  chapter_golden_core_dawn,
  chapter_foundation_building,
  chapter_border_alert,
  chapter_chiyan_envoy,
  chapter_reunion,
  chapter_dao_seed_battle,
  chapter_volcano_asura,
  chapter_aftermath_talk,
  chapter_foundation_peak,
  chapter_tianji_secret,
  chapter_plotting,
  chapter_war_declared,
  chapter_battlefield_pairing,
  chapter_swallowing_calamity,
  chapter_blood_price_dawn,
  chapter_distant_bells,
  chapter_separate_paths,
  chapter_new_horizons,
  chapter_the_approaching_storm,
  chapter_edge_of_war,
  chapter_blood_and_secrets,
  chapter_mine_and_blood,
  chapter_their_own_war,
  chapter_crossing_swords,
  chapter_the_furnace,
  chapter_aftermath_and_ash,
  chapter_return_to_the_sword,
  chapter_war_council,
  chapter_the_eye_of_the_storm,
  chapter_sword_soul_abyss,
  chapter_sword_soul_depths,
  chapter_sword_heart_formed,
  chapter_changqing_confrontation,
  chapter_valley_upheaval,
  chapter_fissures,
  chapter_dao_devouring_array,
  chapter_white_deer_realm,
  chapter_tianji_prison,
  chapter_guchangxi_break,
  chapter_tianji_fall,
  chapter_into_the_abyss_vol3,
  chapter_the_final_choice,
  chapter_new_dawn,
  chapter_five_domain_mobilize,
  chapter_five_routes,
  chapter_underground_array,
  chapter_liuqingshuang_sword,
  chapter_yunfeiran_death,
  chapter_white_deer_falls,
  chapter_shenjingming_redemption,
  chapter_yinbofu_awakening,
  chapter_faceless_mask,
  chapter_former_dao_lord,
  chapter_luoyanzhi_choice,
  chapter_ruins_dawn,
  chapter_guichen_rebirth,
  chapter_five_domain_future,
  chapter_nine_heavens_promise
]
const STORY_CHAPTER_MAP = new Map(STORY_CHAPTERS.map(chapter => [chapter.id, chapter]))

function getChapterMapLabel(chapter: StoryChapter) {
  const title = cleanStorySnippet(chapter.title || '')
    .replace(/^第[一二三四五六七八九十百千\d]+章[·・:：]*/u, '')
    .trim()
  if (!title) return ''
  if (/剑宗|玄天/u.test(title)) return '玄天剑宗'
  if (/天机阁|天机/u.test(title)) return '天机阁'
  if (/碧落宫|碧落/u.test(title)) return '碧落宫'
  if (/长青谷|长青/u.test(title)) return '长青谷'
  if (/赤炎|火山/u.test(title)) return '赤炎域'
  if (/白鹿|青木/u.test(title)) return '青木域'
  if (/深渊|剑魂渊|归尘渊/u.test(title)) return '深处旧渊'
  if (/望石镇|石镇/u.test(title)) return '望石镇'
  if (/[山镇城峰谷海林宫殿阁渊洲河原坊桥台岛域门]/u.test(title)) {
    return title.length > 10 ? `${title.slice(0, 10)}…` : title
  }
  return ''
}

function resolveStoryStartNodeId(perspective: Perspective) {
  const chapterId = STORY_START_CHAPTER_BY_PERSPECTIVE[perspective === 'female' ? 'female' : 'male']
  const chapter = STORY_CHAPTER_MAP.get(chapterId)
  const firstSectionId = chapter?.sections[0]?.id
  if (firstSectionId) {
    return `story_section:${chapterId}:${firstSectionId}`
  }
  return `story_chapter:${chapterId}`
}

function normalizePerspective(perspective: StoryChapter['perspective']): Perspective {
  if (perspective === 'female') return 'female'
  if (perspective === 'both') return 'both'
  return 'male'
}

function mapChoiceEffects(choiceEffects?: ChoiceEffect[]): Effect[] {
  if (!choiceEffects?.length) return []
  return choiceEffects.map(effect => {
    switch (effect.type) {
      case 'realm_exp':
        return { type: 'realm_exp', value: effect.value ?? 0 }
      case 'gold':
        return { type: 'gold', value: effect.value ?? 0 }
      case 'flag_set':
        return {
          type: 'flag_set',
          target: effect.flag,
          value: effect.flagValue === false ? 0 : 1
        }
      case 'npc_favor':
        return { type: 'npc_favor', target: effect.npcId, value: effect.value ?? 0 }
      case 'npc_hatred':
        return { type: 'npc_hatred', target: effect.npcId, value: effect.value ?? 0 }
      case 'npc_fear':
        return { type: 'npc_fear', target: effect.npcId, value: effect.value ?? 0 }
      case 'npc_unlock':
        return { type: 'npc_unlock', target: effect.npcId }
      case 'item_gain':
        return { type: 'gain_item', target: effect.itemId, value: effect.quantity ?? 1 }
      case 'item_lose':
        return { type: 'lose_item', target: effect.itemId, value: effect.quantity ?? 1 }
      case 'skill_unlock':
        return { type: 'unlock_feature', target: effect.skillId }
      case 'map_unlock':
        return { type: 'unlock_clue', target: effect.mapId }
      case 'ending_point':
        return { type: 'ending', target: effect.endingKey, value: effect.endingValue ?? 0 }
      default:
        return { type: 'info', target: effect.type }
    }
  })
}

function cleanStorySnippet(text: string) {
  return text
    .replace(/\r/g, '')
    .replace(/\n+/g, ' ')
    .replace(/【[^】]+】/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeReadableStorySnippet(text: string) {
  const cleaned = cleanStorySnippet(text)
  if (!cleaned) return ''
  if (
    /^[-—]*第[一二三四五六七八九十百千\d]+章·.+[·•]?(完|终|全卷终)[—-]*$/u.test(cleaned)
    || /^[-—]*第[一二三四五六七八九十百千\d]+[卷章节]/u.test(cleaned)
    || /^卷[一二三四五六七八九十百千\d]+[·•].*(终章待续|待续|完|终)$/u.test(cleaned)
    || /^(本章完|全卷终|卷宗暂止|终章待续|未完待续)$/u.test(cleaned)
    || /^本章共\s*\d+\s*段[。.\s]/u.test(cleaned)
  ) return ''
  return cleaned
}

function buildChoiceSectionDisplayText(section: StorySection) {
  const primaryText = cleanStorySnippet(section.text || '')
  const narratorText = cleanStorySnippet(section.narratorText || '')
  const rawChoiceText = section.choices?.[0]?.text?.trim() ?? ''

  if (narratorText) return narratorText

  if (primaryText && sanitizeReadableStorySnippet(primaryText)) {
    return primaryText
  }

  if (/终章待续|未完待续|本章完|章·完|卷.+完/u.test(primaryText) || /终章待续|未完待续|本章完|章·完|卷.+完/u.test(rawChoiceText)) {
    return '先记在这里，等境界、人和路都够了，再往下续。'
  }

  if (rawChoiceText && !/^(继续|卷一·终章待续|卷宗暂止|本章完)$/u.test(rawChoiceText)) {
    return rawChoiceText
  }

  return '这一截先压在眼前，后头还有下文。'
}

function buildSectionDisplayText(section: StorySection) {
  const primaryText = cleanStorySnippet(section.text || '')
  const narratorText = cleanStorySnippet(section.narratorText || '')

  if (section.type === 'dialog') {
    return narratorText
  }

  if (section.type === 'choice') {
    return buildChoiceSectionDisplayText(section)
  }

  return primaryText || narratorText
}

function firstReadableSentence(text: string) {
  const cleaned = cleanStorySnippet(text)
  if (!cleaned) return ''
  return cleaned.split(/(?<=[。！？!?])/u).find(Boolean)?.trim() ?? cleaned
}

function compactStoryHeadline(text: string, max = 10) {
  const cleaned = cleanStorySnippet(text)
    .replace(/[。！？!?]$/u, '')
    .trim()
  if (!cleaned) return ''

  const clause = cleaned.split(/[，、；：——]/u).map(item => item.trim()).find(Boolean) ?? cleaned
  if (!clause) return ''
  return clause.length > max ? `${clause.slice(0, max)}…` : clause
}

function stripChapterShellTitle(text: string) {
  const cleaned = cleanStorySnippet(text)
  if (!cleaned) return ''
  if (sanitizeReadableStorySnippet(cleaned) === '') return ''
  if (/第[一二三四五六七八九十百千\d]+[卷章节]/u.test(cleaned)) {
    const parts = cleaned.split('·').map(part => part.trim()).filter(Boolean)
    const tail = parts[parts.length - 1] ?? ''
    return /第[一二三四五六七八九十百千\d]+[卷章节]/u.test(tail) ? '' : tail
  }
  return cleaned
}

function nodeHasReadablePayload(node: StoryNode | null) {
  if (!node) return false
  if (node.id.startsWith('story_chapter:')) return false
  const candidates = [
    node.name,
    node.content.text,
    node.content.maleText,
    node.content.femaleText,
    node.content.innerMonologue,
    ...(node.content.npcDialogs?.map(dialog => dialog.content || '') ?? [])
  ]
  return candidates.some(candidate => sanitizeReadableStorySnippet(candidate || '') !== '')
}

function resolvePlayableNodeId(nodeId: string | null, maxDepth = 8): string | null {
  let currentId = nodeId
  const visited = new Set<string>()
  let depth = 0

  while (currentId && depth < maxDepth && !visited.has(currentId)) {
    visited.add(currentId)
    const node = getStoryNode(currentId)
    if (!node) return null
    if (nodeHasReadablePayload(node)) return node.id
    currentId = node.fallbackNode ?? null
    depth += 1
  }

  return nodeId
}

function resolveSectionNodeName(section: StorySection) {
  if (section.type === 'dialog' && section.speaker) {
    return section.speaker
  }

  const snippetSource = cleanStorySnippet(section.text || section.narratorText || '')
  if (!snippetSource) return '眼前这件事'

  const firstSentence = snippetSource.split(/(?<=[。！？!?])/u).find(Boolean)?.trim() ?? snippetSource
  const compact = firstSentence.replace(/[。！？!?]$/u, '').trim()
  const shortLabel = compact.length > 14 ? `${compact.slice(0, 14)}…` : compact
  return shortLabel || '眼前这件事'
}

function resolveReadableNodeId(nodeId: string | null, perspective: Perspective) {
  const fallbackStart = resolveStoryStartNodeId(perspective)
  if (!nodeId) return fallbackStart

  const node = getStoryNode(nodeId)
  if (!node) return fallbackStart

  if (node.id.startsWith('story_chapter:') && node.fallbackNode && getStoryNode(node.fallbackNode)) {
    return resolvePlayableNodeId(node.fallbackNode) ?? node.fallbackNode
  }

  return resolvePlayableNodeId(node.id) ?? node.id
}

function createAutoAdvanceChoice(nodeId: string, targetId: string): StoryChoice[] {
  return [
    {
      id: `${nodeId}_continue`,
      text: '顺着往下走',
      targetId
    }
  ]
}

function createTerminalChoice(nodeId: string, label = '先停在这里'): StoryChoice[] {
  return [
    {
      id: `${nodeId}_end`,
      text: label,
      targetId: null,
      isEndMarker: true
    }
  ]
}

function buildGameplayTrigger(section: StorySection): GameplayTrigger | undefined {
  if (section.type !== 'battle_trigger') return undefined
  const battleConfig = section.battleConfig
  return {
    type: 'battle',
    targetId: battleConfig?.enemyIds?.join('、') || '剧情战',
    params: {
      enemyIds: battleConfig?.enemyIds ?? [],
      onWin: battleConfig?.onWin,
      onLose: battleConfig?.onLose,
      onFlee: battleConfig?.onFlee,
      description: section.text
    },
    context: {
      enemyIds: battleConfig?.enemyIds ?? [],
      onWin: battleConfig?.onWin,
      onLose: battleConfig?.onLose,
      onFlee: battleConfig?.onFlee
    }
  }
}

function buildNodeChoices(
  chapter: StoryChapter,
  section: StorySection,
  nextSectionId: string | null,
  chapterNextNodeId: string | null
): StoryChoice[] {
  const nodeId = `story_section:${chapter.id}:${section.id}`

  if (section.choices?.length) {
    return section.choices.map((choice, index) => ({
      id: `${nodeId}_choice_${index + 1}`,
      text: choice.text,
      targetId: choice.nextSectionId ? `story_section:${chapter.id}:${choice.nextSectionId}` : chapterNextNodeId,
      effects: mapChoiceEffects(choice.effects)
    }))
  }

  if (section.autoNext && section.autoNext !== section.id) {
    return createAutoAdvanceChoice(nodeId, `story_section:${chapter.id}:${section.autoNext}`)
  }

  if (section.type === 'battle_trigger') {
    const targetId =
      (section.battleConfig?.onWin && `story_section:${chapter.id}:${section.battleConfig.onWin}`)
      || nextSectionId
      || chapterNextNodeId
    return targetId ? createAutoAdvanceChoice(nodeId, targetId) : createTerminalChoice(nodeId, '结束剧情战')
  }

  if (nextSectionId) {
    return createAutoAdvanceChoice(nodeId, nextSectionId)
  }

  if (chapterNextNodeId) {
    return createAutoAdvanceChoice(nodeId, chapterNextNodeId)
  }

  if (section.type === 'section_end') {
    return createTerminalChoice(nodeId, '本章完')
  }

  return createTerminalChoice(nodeId)
}

function buildStoryNodesFromChapters(chapters: StoryChapter[]): StoryNode[] {
  const nodes: StoryNode[] = []

  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
    const chapter = chapters[chapterIndex]
    const chapterPerspective = normalizePerspective(chapter.perspective)
    const chapterNodeId = `story_chapter:${chapter.id}`
    const nextChapter = chapters[chapterIndex + 1] ?? null
    const nextChapterNodeId = nextChapter ? `story_chapter:${nextChapter.id}` : null
    const firstSection = chapter.sections[0] ?? null

    nodes.push({
      id: chapterNodeId,
      name: chapter.title,
      perspective: chapterPerspective,
      map: getChapterMapLabel(chapter),
      prerequisites: [],
      prerequisiteExpression: null,
      rawPrerequisiteText: null,
      unlockLoop: 1,
      fallbackNode: firstSection ? `story_section:${chapter.id}:${firstSection.id}` : nextChapterNodeId,
      content: {
        text: `【${chapter.title}】\n本章共 ${chapter.sections.length} 段。故事会顺序展开，也可能在关键节点暂停，待境界与条件满足后继续。`,
        choices: firstSection
          ? createAutoAdvanceChoice(chapterNodeId, `story_section:${chapter.id}:${firstSection.id}`)
          : nextChapterNodeId
            ? createAutoAdvanceChoice(chapterNodeId, nextChapterNodeId)
            : createTerminalChoice(chapterNodeId, '卷宗暂止'),
        effects: [],
        npcDialogs: []
      }
    })

    for (let sectionIndex = 0; sectionIndex < chapter.sections.length; sectionIndex += 1) {
      const section = chapter.sections[sectionIndex]
      const nodeId = `story_section:${chapter.id}:${section.id}`
      const nextSection = chapter.sections[sectionIndex + 1] ?? null
      const nextSectionNodeId = nextSection ? `story_section:${chapter.id}:${nextSection.id}` : null
      const choices = buildNodeChoices(chapter, section, nextSectionNodeId, nextChapterNodeId)
      const dialogs: NpcDialog[] = section.type === 'dialog'
        ? [enrichStoryDialogVisual({
            speaker: section.speaker || '旁白',
            content: section.text,
            emotion: section.emotion,
            speakerTitle: section.speakerTitle
          })]
        : []
      const gameplayTrigger = buildGameplayTrigger(section)

      const node: StoryNode = {
        id: nodeId,
        name: resolveSectionNodeName(section),
        perspective: chapterPerspective,
        map: getChapterMapLabel(chapter),
        prerequisites: [],
        prerequisiteExpression: null,
        rawPrerequisiteText: null,
        unlockLoop: 1,
        fallbackNode: nextSectionNodeId ?? nextChapterNodeId,
        content: {
          text: buildSectionDisplayText(section),
          innerMonologue: section.type === 'dialog' ? undefined : section.narratorText || undefined,
          maleText: chapterPerspective === 'male' ? buildSectionDisplayText(section) : undefined,
          femaleText: chapterPerspective === 'female' ? buildSectionDisplayText(section) : undefined,
          npcDialogs: dialogs,
          choices,
          effects: [],
          gameplayTrigger,
          illustration: null
        }
      }

      node.content.illustration = resolveStoryIllustration(node)
      nodes.push(node)
    }
  }

  return nodes
}

const STORY_NODES = buildStoryNodesFromChapters(STORY_CHAPTERS)
const STORY_NODE_MAP = new Map(STORY_NODES.map(node => [node.id, node]))
const STORY_CONTENT_AVAILABLE = STORY_NODES.length > 0

function getStoryNode(nodeId: string | null): StoryNode | null {
  if (!nodeId) return null
  return STORY_NODE_MAP.get(nodeId) ?? null
}

function choiceTextMarksVolumeEnd(text: string): boolean {
  return /卷[一二三四五六七八九十\d]+\s*完|本章完|卷宗暂止|结束剧情战|终章待续/.test(text)
}

export const useStoryStore = defineStore('story', () => {
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()

  const currentVolume = ref(1)
  const currentNodeId = ref<string | null>(null)
  const currentPerspective = ref<Perspective>('male')
  const currentLoop = ref(1)
  const completedNodes = ref<Set<string>>(new Set())
  const triggeredEventsThisLoop = ref<Set<string>>(new Set())
  const triggeredEventsAllTime = ref<Set<string>>(new Set())
  const currentRoute = ref<string | null>(null)
  const unlockedClues = ref<Set<string>>(new Set())
  const choiceHistory = ref<Map<string, number>>(new Map())
  const favorability = ref<Map<string, number>>(new Map())
  const storyItems = ref<Map<string, number>>(new Map())
  const notifications = ref<StoryNotification[]>([])
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const availableSideQuests = ref<SideQuestInfo[]>([])
  const unlockedEndings = ref<Map<string, EndingInfo>>(new Map())
  const volumeCompletions = ref<VolumeCompletion[]>([])
  const sessionState = ref<StorySessionState>({ status: 'idle' })

  const allEndings: EndingInfo[] = [
    { id: 'END_NORMAL_001', name: '正道·轮回闭环', type: 'normal' },
    { id: 'END_NORMAL_002', name: '散修·轮回闭环', type: 'normal' },
    { id: 'END_NORMAL_003', name: '魔道·轮回闭环', type: 'normal' }
  ]

  const currentNode = computed(() => {
    const playableNodeId = resolvePlayableNodeId(currentNodeId.value)
    const node = getStoryNode(playableNodeId)
    if (!node) return null
    if (node.id.startsWith('story_chapter:') && node.fallbackNode) {
      const fallbackPlayableNodeId = resolvePlayableNodeId(node.fallbackNode) ?? node.fallbackNode
      return getStoryNode(fallbackPlayableNodeId) ?? node
    }
    return node
  })
  const currentReadableNode = computed(() => {
    const playableNodeId = resolvePlayableNodeId(currentNodeId.value)
    const node = getStoryNode(playableNodeId)
    if (!node) return null
    if (node.id.startsWith('story_chapter:') && node.fallbackNode) {
      const fallbackPlayableNodeId = resolvePlayableNodeId(node.fallbackNode) ?? node.fallbackNode
      return getStoryNode(fallbackPlayableNodeId) ?? node
    }
    return node
  })
  const currentReadableText = computed(() => {
    const node = currentReadableNode.value
    if (!node) return ''

    const dialogContent = node.content.npcDialogs
      ?.map(dialog => sanitizeReadableStorySnippet(dialog.content || ''))
      .find(Boolean) ?? ''

    const candidates = [
      currentPerspective.value === 'male' ? node.content.maleText : node.content.femaleText,
      node.content.text,
      node.content.maleText,
      node.content.femaleText,
      node.content.innerMonologue,
      dialogContent
    ]

    for (const candidate of candidates) {
      const cleaned = sanitizeReadableStorySnippet(candidate || '')
      if (cleaned) return cleaned
    }

    if (node.fallbackNode) {
      const fallbackNode = getStoryNode(node.fallbackNode)
      if (fallbackNode && fallbackNode.id !== node.id) {
        const fallbackCandidates = [
          currentPerspective.value === 'male' ? fallbackNode.content.maleText : fallbackNode.content.femaleText,
          fallbackNode.content.text,
          fallbackNode.content.maleText,
          fallbackNode.content.femaleText,
          fallbackNode.content.innerMonologue,
          fallbackNode.content.npcDialogs?.map(dialog => sanitizeReadableStorySnippet(dialog.content || '')).find(Boolean) ?? ''
        ]

        for (const candidate of fallbackCandidates) {
          const cleaned = sanitizeReadableStorySnippet(candidate || '')
          if (cleaned) return cleaned
        }
      }
    }

    if (node.id.startsWith('story_section:')) return ''
    const catalogTitle = storyCatalog.value.find(entry => entry.isCurrent)?.title ?? ''
    return sanitizeReadableStorySnippet(catalogTitle)
  })
  const currentReadableHeadline = computed(() => {
    const nodeName = compactStoryHeadline(stripChapterShellTitle(currentReadableNode.value?.name ?? ''), 10)
    if (nodeName && nodeName !== '眼前这件事') return nodeName

    const sentence = compactStoryHeadline(firstReadableSentence(currentReadableText.value), 10)
    if (sentence) return sentence

    if (currentReadableNode.value?.id.startsWith('story_section:')) {
      return ''
    }

    const catalogTitle = compactStoryHeadline(storyCatalog.value.find(entry => entry.isCurrent)?.title ?? '', 10)
    if (catalogTitle) return catalogTitle

    return '尚未启程'
  })
  const currentReadableMap = computed(() => {
    return currentReadableNode.value?.map ?? currentNode.value?.map ?? storyCatalog.value.find(entry => entry.isCurrent)?.map ?? null
  })
  const isStoryPlaying = computed(() => sessionState.value.status === 'playing')
  const allNodes = computed(() => STORY_CHAPTERS
    .filter(chapter => {
      const perspective = normalizePerspective(chapter.perspective)
      if (currentPerspective.value === 'male') return perspective !== 'female'
      if (currentPerspective.value === 'female') return perspective !== 'male'
      return true
    })
    .map(chapter => ({
      id: `story_chapter:${chapter.id}`,
      name: chapter.title,
      perspective: normalizePerspective(chapter.perspective),
      map: getChapterMapLabel(chapter),
      prerequisites: [],
      prerequisiteExpression: null,
      rawPrerequisiteText: null,
      unlockLoop: 1,
      fallbackNode: null,
      content: {
        text: chapter.title,
        choices: [],
        effects: []
      }
    } satisfies StoryNode)))

  const storyCatalog = computed<StoryCatalogEntry[]>(() => {
    return STORY_CHAPTERS
      .filter(chapter => {
        const perspective = normalizePerspective(chapter.perspective)
        if (currentPerspective.value === 'male') return perspective !== 'female'
        if (currentPerspective.value === 'female') return perspective !== 'male'
        return true
      })
      .map(chapter => {
        const chapterNodeId = `story_chapter:${chapter.id}`
        const sectionIds = chapter.sections.map(section => `story_section:${chapter.id}:${section.id}`)
        const isCurrent = currentNodeId.value === chapterNodeId || sectionIds.includes(currentNodeId.value ?? '')
        const completed = sectionIds.every(id => completedNodes.value.has(id))
        return {
          id: chapter.id,
          title: chapter.title,
          map: getChapterMapLabel(chapter),
          perspective: normalizePerspective(chapter.perspective),
          unlocked: true,
          completed,
          isCurrent,
          requiredRealm: null,
          requiredRealmLevel: null,
          blockReason: null
        }
      })
  })

  const completedCount = computed(() => completedNodes.value.size)
  const unlockedEndingCount = computed(() => unlockedEndings.value.size)
  const totalEndingCount = computed(() => allEndings.length)
  const hasTrueEnding = computed(() => false)
  const currentTermination = computed(() => sessionState.value.termination)
  const hasStoryContent = computed(() => STORY_CONTENT_AVAILABLE)

  function dismissNotification(id: string) {
    const index = notifications.value.findIndex(item => item.id === id)
    if (index >= 0) notifications.value.splice(index, 1)
  }

  function showNotification(message: string, type: StoryNotification['type'] = 'info', data?: unknown) {
    const id = `story_notice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    notifications.value.push({ id, message, type, data })
    window.setTimeout(() => dismissNotification(id), 2600)
  }

  function clearNotifications() {
    notifications.value = []
  }

  function addStoryInventoryItem(itemId: string, quantity: number) {
    const nextQuantity = Math.max(0, (storyItems.value.get(itemId) ?? 0) + quantity)
    if (nextQuantity <= 0) storyItems.value.delete(itemId)
    else storyItems.value.set(itemId, nextQuantity)

    const inventoryItem: InventoryItem = {
      id: `story_item_${itemId}_${Date.now()}`,
      definitionId: itemId,
      name: itemId,
      icon: '物',
      type: 'material',
      quality: 'common',
      quantity: Math.max(1, quantity),
      description: '由剧情获得'
    }

    if (quantity > 0) {
      playerStore.addToInventory(inventoryItem)
    } else {
      playerStore.removeFromInventory(itemId)
    }
  }

  function applyEffects(effects: Effect[]) {
    for (const effect of effects) {
      switch (effect.type) {
        case 'gain_item':
          if (effect.target) addStoryInventoryItem(effect.target, Number(effect.value ?? 1))
          break
        case 'lose_item':
          if (effect.target) addStoryInventoryItem(effect.target, -Number(effect.value ?? 1))
          break
        case 'unlock_clue':
          if (effect.target) unlockedClues.value.add(effect.target)
          break
        case 'route':
          if (effect.target) currentRoute.value = effect.target
          break
        case 'ending': {
          if (!effect.target) break
          const matched = allEndings.find(item => item.name === effect.target || item.id === effect.target)
          if (matched) {
            unlockedEndings.value.set(matched.id, {
              ...matched,
              unlockedAt: Date.now(),
              loopNumber: currentLoop.value
            })
          }
          break
        }
        case 'realm_exp':
          playerStore.addCultivation(Number(effect.value ?? 0))
          break
        case 'gold':
          playerStore.addGold(Number(effect.value ?? 0))
          break
        case 'flag_set':
          if (effect.target) {
            worldStore.addWorldFlag(effect.target)
            if (effect.target === 'volume1_complete') currentVolume.value = Math.max(currentVolume.value, 2)
          }
          break
        case 'npc_favor':
        case 'npc_hatred':
        case 'npc_fear':
          if (effect.target) {
            const amount = Number(effect.value ?? 0)
            const current = favorability.value.get(effect.target) ?? 0
            favorability.value.set(effect.target, current + amount)
            worldStore.applyStoryRelationshipChange(effect.target, {
              favorDelta: effect.type === 'npc_favor' ? amount : 0,
              hatredDelta: effect.type === 'npc_hatred' ? amount : 0,
              fearDelta: effect.type === 'npc_fear' ? amount : 0,
              title: `${effect.target}态度变化`,
              text: `剧情推进使 ${effect.target} 与你的关系发生了变化。`
            })
          }
          break
        case 'npc_unlock':
          if (effect.target) worldStore.unlockNpc(effect.target)
          break
        case 'info':
        case 'unlock_feature':
          if (effect.target) showNotification(effect.target, 'info')
          break
      }
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentVolume: currentVolume.value,
        currentNodeId: currentNodeId.value,
        currentPerspective: currentPerspective.value,
        currentLoop: currentLoop.value,
        completedNodes: Array.from(completedNodes.value),
        triggeredEventsAllTime: Array.from(triggeredEventsAllTime.value),
        unlockedClues: Array.from(unlockedClues.value),
        currentRoute: currentRoute.value,
        choiceHistory: Array.from(choiceHistory.value.entries()),
        storyItems: Array.from(storyItems.value.entries()),
        favorability: Array.from(favorability.value.entries()),
        unlockedEndings: Array.from(unlockedEndings.value.entries()),
        volumeCompletions: volumeCompletions.value,
        sessionState: sessionState.value
      })
    )
  }

  function loadFromLocalStorage() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const data = JSON.parse(raw)
      currentVolume.value = Number(data.currentVolume ?? 1)
      currentNodeId.value = typeof data.currentNodeId === 'string' ? data.currentNodeId : null
      currentPerspective.value = data.currentPerspective === 'female' ? 'female' : 'male'
      currentLoop.value = Number(data.currentLoop ?? 1)
      completedNodes.value = new Set((data.completedNodes ?? []) as string[])
      triggeredEventsAllTime.value = new Set((data.triggeredEventsAllTime ?? []) as string[])
      unlockedClues.value = new Set((data.unlockedClues ?? []) as string[])
      currentRoute.value = data.currentRoute ?? null
      choiceHistory.value = new Map((data.choiceHistory ?? []) as Array<[string, number]>)
      storyItems.value = new Map((data.storyItems ?? []) as Array<[string, number]>)
      favorability.value = new Map((data.favorability ?? []) as Array<[string, number]>)
      unlockedEndings.value = new Map((data.unlockedEndings ?? []) as Array<[string, EndingInfo]>)
      volumeCompletions.value = Array.isArray(data.volumeCompletions) ? data.volumeCompletions : []
      sessionState.value = data.sessionState ?? { status: 'idle' }
      const preferredPerspective = playerStore.perspective === 'female' ? 'female' : currentPerspective.value
      currentPerspective.value = preferredPerspective
      currentNodeId.value = resolveReadableNodeId(currentNodeId.value, currentPerspective.value)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  async function goToNode(nodeId: string) {
    const playableNodeId = resolvePlayableNodeId(nodeId) ?? nodeId
    const node = getStoryNode(playableNodeId)
    if (!node) {
      const fallbackNodeId = resolveReadableNodeId(currentNodeId.value, currentPerspective.value)
      if (fallbackNodeId && fallbackNodeId !== currentNodeId.value && getStoryNode(fallbackNodeId)) {
        currentNodeId.value = fallbackNodeId
        sessionState.value = { status: 'playing' }
        saveToLocalStorage()
      }
      showNotification('这一段风声有些散，已替你接回最近还能续上的那一处。', 'warning')
      return
    }

    currentNodeId.value = node.id
    triggeredEventsThisLoop.value.add(node.id)
    triggeredEventsAllTime.value.add(node.id)
    sessionState.value = { status: 'playing' }
    isInitialized.value = true

    const chapterId = node.id.replace(/^story_chapter:/, '').replace(/^story_section:/, '').split(':')[0]
    const chapter = chapterId ? STORY_CHAPTER_MAP.get(chapterId) : undefined
    if (chapter?.volume) currentVolume.value = Math.max(1, chapter.volume)

    saveToLocalStorage()
  }

  async function initStory(perspective: Perspective, volume = 1) {
    if (!STORY_CONTENT_AVAILABLE) {
      sessionState.value = { status: 'idle' }
      showNotification('这件事眼下还没轮到你，先去修炼、历练或碰人碰事，风声会自己续回来。', 'warning')
      return
    }

    isLoading.value = true
    currentPerspective.value = perspective === 'female' ? 'female' : 'male'
    currentVolume.value = volume
    sessionState.value = { status: 'playing' }

    const startNodeId = resolveReadableNodeId(resolveStoryStartNodeId(currentPerspective.value), currentPerspective.value)
    await goToNode(startNodeId)

    isLoading.value = false
  }

  async function continueStory(newPerspective?: Perspective) {
    if (!STORY_CONTENT_AVAILABLE) {
      sessionState.value = { status: 'idle' }
      showNotification('这一段正文还没轮到你，先去修炼、历练或碰人碰事，这件事会再接回来。', 'warning')
      return
    }

    const syncedPerspective = (newPerspective ?? playerStore.perspective) === 'female'
      ? 'female'
      : 'male'

    if (syncedPerspective !== currentPerspective.value) {
      await initStory(syncedPerspective, currentVolume.value || 1)
      return
    }

    currentPerspective.value = syncedPerspective
    const readableNodeId = resolveReadableNodeId(currentNodeId.value, currentPerspective.value)
    if (readableNodeId && getStoryNode(readableNodeId)) {
      if (readableNodeId !== currentNodeId.value) {
        currentNodeId.value = readableNodeId
      }
      isInitialized.value = true
      sessionState.value = { status: 'playing' }
      saveToLocalStorage()
      return
    }
    await initStory(currentPerspective.value, currentVolume.value)
  }

  function endStory(termination: StoryTermination) {
    sessionState.value = { status: 'ended', termination }
    saveToLocalStorage()
  }

  function checkEndNode(): StoryTermination | null {
    const node = currentNode.value
    if (!node) return null

    const endingList = Array.from(unlockedEndings.value.values())
    const ending = endingList.length > 0 ? endingList[endingList.length - 1] : undefined
    const endChoice = node.content.choices.find(choice => choice.isEndMarker || choice.targetId === null)
    const isVolumeEnd = choiceTextMarksVolumeEnd(endChoice?.text ?? '')

    if (ending) {
      return {
        reason: 'ending_unlocked',
        endingInfo: {
          ...ending,
          unlockedAt: ending.unlockedAt ?? Date.now(),
          loopNumber: ending.loopNumber ?? currentLoop.value
        },
        canContinue: false,
        timestamp: Date.now()
      }
    }

    if (isVolumeEnd || node.content.choices.length === 0) {
      return {
        reason: 'volume_end',
        volumeNumber: currentVolume.value,
        hasNextVolume: false,
        nextVolumeId: currentVolume.value + 1,
        canContinue: false,
        timestamp: Date.now()
      }
    }

    return null
  }

  async function makeChoice(choiceIndex: number) {
    const node = currentNode.value
    if (!node) return

    const choice = node.content.choices[choiceIndex]
    if (!choice) return

    completedNodes.value.add(node.id)
    choiceHistory.value.set(node.id, choiceIndex)
    if (choice.effects?.length) applyEffects(choice.effects)

    if (choice.targetId) {
      await goToNode(choice.targetId)
      return
    }

    const termination = checkEndNode()
    if (termination) endStory(termination)
    saveToLocalStorage()
  }

  function checkSinglePrerequisite(prerequisite: Prerequisite): boolean {
    if (prerequisite.type === 'loop') return currentLoop.value >= Number(prerequisite.value ?? 1)
    if (prerequisite.type === 'node_complete' && prerequisite.nodeId) return completedNodes.value.has(prerequisite.nodeId)
    if (prerequisite.type === 'choice' && prerequisite.choiceRef) {
      return choiceHistory.value.get(prerequisite.choiceRef) === Number(prerequisite.value) - 1
    }
    return true
  }

  function evaluatePrerequisiteExpression(expression?: PrerequisiteExpression | null): boolean {
    if (!expression) return true
    if (expression.type === 'condition') {
      return expression.condition ? checkSinglePrerequisite(expression.condition) : true
    }

    const conditions = expression.conditions ?? []
    if (expression.type === 'and') return conditions.every(item => evaluatePrerequisiteExpression(item))
    if (expression.type === 'or') return conditions.some(item => evaluatePrerequisiteExpression(item))
    return true
  }

  function checkPrerequisites(prerequisites: Prerequisite[], expression?: PrerequisiteExpression | null) {
    if (expression) return evaluatePrerequisiteExpression(expression)
    return prerequisites.every(checkSinglePrerequisite)
  }

  function formatPrerequisiteSummary(prerequisites: Prerequisite[]) {
    return prerequisites.map(item => {
      if (item.type === 'loop') return `周目达到 ${item.value}`
      if (item.type === 'node_complete') return `完成节点 ${item.nodeId}`
      if (item.type === 'choice') return `${item.choiceRef} 选择 ${item.value}`
      return item.rawText ?? item.type
    })
  }

  function checkAvailableSideQuests(): SideQuestInfo[] {
    if (!STORY_CONTENT_AVAILABLE) {
      availableSideQuests.value = []
      return []
    }
    const upcoming = storyCatalog.value
      .filter(entry => !entry.completed)
      .filter(entry => !entry.isCurrent)
      .slice(0, 6)
      .map((entry, index) => ({
        id: `story_chapter:${entry.id}`,
        name: entry.title,
        characterId: 'story',
        characterName: entry.map,
        triggerType: 'auto' as TriggerType,
        priority: 100 - index,
        prerequisites: [],
        isAvailable: true,
        isCompleted: false
      }))

    availableSideQuests.value = upcoming
    return upcoming
  }

  async function executeSideQuest(eventId: string) {
    await goToNode(eventId)
    return true
  }

  function getFavorability(characterId: string) {
    return favorability.value.get(characterId) ?? 0
  }

  function addFavorability(characterId: string, amount: number) {
    favorability.value.set(characterId, getFavorability(characterId) + amount)
    saveToLocalStorage()
  }

  function addItem(itemId: string, count = 1) {
    storyItems.value.set(itemId, (storyItems.value.get(itemId) ?? 0) + count)
    saveToLocalStorage()
  }

  function removeItem(itemId: string, count = 1) {
    const current = storyItems.value.get(itemId) ?? 0
    if (current < count) return false
    const next = current - count
    if (next > 0) storyItems.value.set(itemId, next)
    else storyItems.value.delete(itemId)
    saveToLocalStorage()
    return true
  }

  function hasItem(itemId: string) {
    return (storyItems.value.get(itemId) ?? 0) > 0
  }

  function addClue(clueId: string) {
    unlockedClues.value.add(clueId)
    saveToLocalStorage()
  }

  function startNewLoop() {
    currentLoop.value += 1
    triggeredEventsThisLoop.value.clear()
    saveToLocalStorage()
  }

  function suspendStory() {
    sessionState.value = { status: 'suspended' }
    saveToLocalStorage()
  }

  function exitStory() {
    suspendStory()
  }

  function resetStory() {
    currentNodeId.value = null
    completedNodes.value.clear()
    triggeredEventsThisLoop.value.clear()
    triggeredEventsAllTime.value.clear()
    currentRoute.value = null
    unlockedClues.value.clear()
    choiceHistory.value.clear()
    availableSideQuests.value = []
    notifications.value = []
    sessionState.value = { status: 'idle' }
    saveToLocalStorage()
  }

  function unlockEnding(endingId: string, info: EndingInfo) {
    unlockedEndings.value.set(endingId, info)
    saveToLocalStorage()
  }

  function getEndingInfo(endingId: string) {
    return unlockedEndings.value.get(endingId)
  }

  function getAllEndingsWithStatus() {
    return allEndings.map(ending => ({
      ...ending,
      unlocked: unlockedEndings.value.has(ending.id)
    }))
  }

  function completeVolume(endingId?: string) {
    volumeCompletions.value.push({
      volumeNumber: currentVolume.value,
      completedAt: Date.now(),
      endingId,
      routeId: currentRoute.value || undefined,
      perspective: currentPerspective.value,
      loopNumber: currentLoop.value
    })
    saveToLocalStorage()
  }

  function checkNextVolumeExists(_nextVolume: number) {
    return false
  }

  async function transitionToNextVolume() {
    return false
  }

  function getCharacterName(characterId: string | null) {
    return characterId ?? '未知'
  }

  function consumePendingGameplayTrigger(): GameplayTrigger | null {
    return null
  }

  function clearPendingGameplayTrigger() {}

  loadFromLocalStorage()
  if ((!currentNodeId.value || !getStoryNode(currentNodeId.value)) && STORY_CONTENT_AVAILABLE) {
    currentNodeId.value = resolveReadableNodeId(currentNodeId.value, currentPerspective.value)
  }

  return {
    currentVolume,
    currentNodeId,
    currentPerspective,
    currentLoop,
    completedNodes,
    triggeredEventsThisLoop,
    triggeredEventsAllTime,
    currentRoute,
    unlockedClues,
    favorability,
    storyItems,
    choiceHistory,
    notifications,
    isLoading,
    isInitialized,
    availableSideQuests,
    unlockedEndings,
    volumeCompletions,
    sessionState,
    currentNode,
    currentReadableText,
    currentReadableHeadline,
    currentReadableMap,
    isStoryPlaying,
    allNodes,
    completedCount,
    unlockedEndingCount,
    totalEndingCount,
    hasTrueEnding,
    currentTermination,
    hasStoryContent,
    storyCatalog,
    effectRuntimeState: null,
    initStory,
    goToNode,
    makeChoice,
    executeSideQuest,
    checkAvailableSideQuests,
    checkPrerequisites,
    formatPrerequisiteSummary,
    executeEffects: applyEffects,
    consumePendingGameplayTrigger,
    clearPendingGameplayTrigger,
    getFavorability,
    addFavorability,
    addItem,
    removeItem,
    hasItem,
    addClue,
    getCharacterName,
    showNotification,
    dismissNotification,
    clearNotifications,
    startNewLoop,
    exitStory,
    continueStory,
    saveToLocalStorage,
    loadFromLocalStorage,
    checkEndNode,
    checkNextVolumeExists,
    unlockEnding,
    getEndingInfo,
    getAllEndingsWithStatus,
    completeVolume,
    transitionToNextVolume,
    suspendStory,
    endStory,
    resetStory
  }
})
