import type { StoryNotification, SideQuestInfo } from '@/story/storyStore'
import type { Perspective, StoryIllustration } from '@/story/types'
import { resolveStoryEventTypeLabel, resolveStoryPerspectiveIcon } from '@/game/theme/gameTheme'

export interface StoryEventCardData {
  headline: string
  subhead: string
  summary: string
  summaryLines: string[]
  hookLine: string
  detailLine: string
  locationLabel: string
  nextMoveLabel: string
  focusLabel: string
  toneLabel: string
  eventTypeLabel: string
  eventTone: 'gold' | 'jade' | 'mist'
  perspectiveLabel: string
  perspectiveIcon: string
  sceneHint: string
  visual?: {
    src: string
    alt: string
    type: 'scene' | 'faction' | 'character'
  } | null
  promptText: string
  statusText: string
  beatBadges: Array<{
    value: string
    tone: 'gold' | 'jade' | 'mist'
  }>
  tags: string[]
  actions: {
    primary: string
    secondary?: string
  }
}

export interface StoryEventCardInput {
  currentNodeId: string | null
  currentNodeName: string | null
  currentNodeMap: string | null
  currentNodeText: string
  currentNodeChoiceText?: string | null
  currentPerspective: Perspective
  completedCount: number
  unlockedClueCount: number
  favorabilityCount: number
  availableSideQuests: SideQuestInfo[]
  notifications: StoryNotification[]
  mode: 'cultivation' | 'adventure'
  currentNodeIllustration?: StoryIllustration | null
}

const PERSPECTIVE_LABEL: Record<Perspective, string> = {
  male: '当前主角',
  female: '当前主角',
  both: '当前主角'
}

function cleanText(text: string) {
  return text
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isTerminalShellText(text: string) {
  const cleaned = cleanText(text)
  if (!cleaned) return true
  return (
    /^[-—]*第[一二三四五六七八九十百千\d]+[卷章节].*(完|终|待续|全卷终)[—-]*$/u.test(cleaned)
    || /^卷[一二三四五六七八九十百千\d]+[·•].*(终章待续|待续|完|终)$/u.test(cleaned)
    || /^(本章完|全卷终|卷宗暂止|终章待续|未完待续)$/u.test(cleaned)
  )
}

function isStoryHoldState(input: StoryEventCardInput) {
  const choiceText = cleanText(input.currentNodeChoiceText ?? '')
  return (
    !input.currentNodeText.trim()
    || isTerminalShellText(input.currentNodeText)
    || /终章待续|待续|本章完|先停在这里|眼前这一步/u.test(choiceText)
  )
}

function stripOuterQuotes(text: string) {
  return cleanText(text)
    .replace(/^[「『“"'`《〈]+/u, '')
    .replace(/[」』”"'`》〉]+$/u, '')
    .trim()
}

function firstStorySentence(text: string) {
  const cleaned = cleanText(text)
  if (!cleaned || isTerminalShellText(cleaned)) return ''
  return cleaned.split(/(?<=[。！？!?])/u).find(Boolean)?.trim() ?? cleaned
}

function storySentences(text: string) {
  return cleanText(text)
    .split(/(?<=[。！？!?])/u)
    .map(item => item.trim())
    .filter(item => item && !isTerminalShellText(item))
}

function compactLabel(text: string, max = 14) {
  const cleaned = stripOuterQuotes(text).replace(/[。！？!?]$/u, '')
  if (!cleaned) return '来路未明'
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned
}

function compactSentence(text: string, max = 22) {
  const cleaned = stripOuterQuotes(cleanText(text)).replace(/[。！？!?]$/u, '')
  if (!cleaned) return ''
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned
}

function extractScenePhrase(text: string, max = 10) {
  const cleaned = stripOuterQuotes(cleanText(text))
    .replace(/^(此时|这时|那时|这一日|当夜|夜里|片刻后|不久后)/u, '')
    .replace(/[。！？!?]$/u, '')
    .trim()
  if (!cleaned) return ''

  const clauses = cleaned.split(/[，、；：]/u).map(item => item.trim()).filter(Boolean)
  const head = clauses[0] ?? cleaned
  const mapped = head
    .replace(/(.+?)的(黄昏|暮色|夜色|晨光|晚风|山门|镇口|街口|雨幕|炉火|海崖|山道).*/u, '$1$2')
    .replace(/(.+?)(比别处.+|显得.+|来得.+|还要.+|总是.+)$/u, '$1')
    .replace(/(.+?)(忽然|已经|正|便|才|像是|仿佛).*/u, '$1')
    .trim()

  if (!mapped) return ''
  return mapped.length > max ? `${mapped.slice(0, max)}…` : mapped
}

function toEventCue(text: string, max = 12) {
  const cleaned = stripOuterQuotes(cleanText(text))
    .replace(/[。！？!?]$/u, '')
    .replace(/^(因为|于是|随后|然后|这时|此时|那时|当夜|翌日|次日)/u, '')
    .trim()
  if (!cleaned) return ''

  const clauses = cleaned.split(/[，、；：]/u).map(item => item.trim()).filter(Boolean)
  const firstClause = clauses[0] ?? cleaned
  const mapped = firstClause
    .replace(/^(.{2,4})从.+返回.+$/u, '$1归来')
    .replace(/^(.{2,4})回到.+$/u, '$1回来了')
    .replace(/^(.{2,4})三天没离开过.+$/u, '$1在守着')
    .replace(/^(.{2,4})没有急着.+$/u, '$1留了一手')
    .replace(/^(.{2,4})带着.+踏进.+$/u, '$1回来了')
    .replace(/^(.{2,4})在.+?坐着送你了?.*$/u, '$1在送你')
    .replace(/^(江溯|洛衍之|顾长惜|云斐然|苏清鸢|林清寒|宁玄策)(在|正|把|将|忽然|已经|仍然)/u, '$1')
    .replace(/(露面了|走来了|开口了|回来了|到了|现身了).*/u, '$1')
    .replace(/(.+?)(门边靠着门框|站在井台边|站在那儿|在后院|在门边|在练剑坪|看了过来).*/u, '$1')
    .replace(/(.+?)(有动静|风声不对|气息不稳).*/u, '$1')
    .trim()

  if (!mapped) return ''
  return mapped.length > max ? `${mapped.slice(0, max)}…` : mapped
}

function isTemporalScenePhrase(text: string) {
  const cleaned = cleanText(text)
  if (!cleaned) return false
  return /^(翌日|次日|当夜|夜里|此时|这时|那时|晨光|清晨|黄昏|暮色|夜色|天亮|天快亮|战后|大战后|第三天|第二天|第七天)/u.test(cleaned)
}

function stripChapterPrefix(text: string) {
  const cleaned = cleanText(text)
  if (!cleaned || isTerminalShellText(cleaned)) return ''
  if (/第[一二三四五六七八九十百千\d]+章/u.test(cleaned)) {
    const parts = cleaned.split('·').map(part => part.trim()).filter(Boolean)
    const tail = parts[parts.length - 1]
    return tail && !/第[一二三四五六七八九十百千\d]+章/u.test(tail) ? tail : ''
  }
  const parts = cleaned.split('·').map(part => part.trim()).filter(Boolean)
  if (parts.length <= 1) return cleaned
  return parts[parts.length - 1] ?? cleaned
}

function isSceneMetaLabel(text: string) {
  return /命数|命线|卷宗|片段|推进|牵引|主界|历练|来路未明/u.test(text)
}

function looksLikeSectionLabel(text: string) {
  const cleaned = cleanText(text)
  if (!cleaned) return false
  return /^(临别之言|新章|终章|序章|尾声|后记|前言|这一章|这一节|这一段)$/u.test(cleaned)
}

function looksLikeChapterStyleTitle(text: string) {
  const cleaned = cleanText(text)
  if (!cleaned) return false
  if (isTerminalShellText(cleaned)) return true
  if (looksLikeSectionLabel(cleaned)) return true
  if (/第[一二三四五六七八九十百千\d]+[卷章节]/u.test(cleaned)) return true
  if (/铁与血之夜|命数|命线|卷宗|新章|终章|序章/u.test(cleaned)) return true
  return false
}

function dechapteredLabel(text: string, fallback = '') {
  const stripped = compactLabel(stripChapterPrefix(text), 14)
  if (!stripped || stripped === '来路未明' || looksLikeChapterStyleTitle(stripped) || isSceneMetaLabel(stripped)) {
    return fallback
  }
  return stripped
}

function resolveSceneHint(input: StoryEventCardInput, headline: string, sentence: string) {
  const nodeTail = compactLabel(stripChapterPrefix(input.currentNodeName ?? ''), 10)
  if (
    nodeTail
    && nodeTail !== '来路未明'
    && nodeTail !== headline
    && !isSceneMetaLabel(nodeTail)
  ) {
    return nodeTail
  }

  const sentenceHint = compactLabel(
    stripOuterQuotes(sentence).split(/[，、；：]/u).find(Boolean)?.trim() ?? '',
    10
  )
  if (
    sentenceHint
    && sentenceHint !== '来路未明'
    && sentenceHint !== headline
    && !isSceneMetaLabel(sentenceHint)
  ) {
    return sentenceHint
  }

  return input.mode === 'adventure' ? '前头那截路' : '眼前还压着一口气'
}

function extractSpeakerCue(input: StoryEventCardInput) {
  const raw = stripChapterPrefix(input.currentNodeName ?? '')
  const cleaned = compactLabel(raw, 8)
  if (!cleaned || cleaned === '来路未明') return ''
  if (looksLikeChapterStyleTitle(cleaned) || isSceneMetaLabel(cleaned)) return ''
  if (/^(翌日|次日|当夜|夜里|此时|这时|那时|晨光|黄昏|暮色|夜色|天亮|天快亮|战后|大战后|第三天|第二天|第七天)/u.test(cleaned)) return ''
  if (/[山镇城峰谷海林宫殿阁渊洲河原坊桥台岛域门路铺场崖池殿塔岸]/u.test(cleaned)) return ''
  return cleaned
}

type NarrativeBeat = 'danger' | 'atmosphere' | 'arrival' | 'aftermath' | 'journey' | 'watch'

function resolveNarrativeBeat(sentence: string): NarrativeBeat | null {
  const cleaned = cleanText(sentence)
  if (!cleaned) return null
  if (/惨叫|尸体|血雾|火烧|废墟|死寂|屠|伏击|负伤|设伏失败/u.test(cleaned)) return 'aftermath'
  if (/风声|杀气|遁光|追兵|暗红色光芒|筑基|压迫感|夜里惊醒|不该出现的凉意/u.test(cleaned)) return 'danger'
  if (/有人|现身|走来|进来|露面|记住这个|开口|师兄|来客/u.test(cleaned)) return 'arrival'
  if (/黄昏|暮色|夜色|晚风|炉火|火星|铁匠铺|山门|镇口|海崖|雨棚|观星/u.test(cleaned)) return 'atmosphere'
  if (/上路|向东|启程|赶路|出发|下山|去往|路口/u.test(cleaned)) return 'journey'
  if (/盯着|看着|记住|回头|旧怨|人情|线索|推演/u.test(cleaned)) return 'watch'
  return null
}

function resolveBeatHeadline(beat: NarrativeBeat, locationCue: string, mode: StoryEventCardInput['mode']) {
  const site = locationCue || (mode === 'adventure' ? '前头那截路' : '眼前')
  switch (beat) {
    case 'danger':
      return locationCue ? `${locationCue}杀机逼近` : '前头杀机逼近'
    case 'atmosphere':
      return locationCue ? `${locationCue}风声不对` : '前头风声不对'
    case 'arrival':
      return locationCue ? `${locationCue}有人露面` : '有人露面了'
    case 'aftermath':
      return locationCue ? `${locationCue}已经出事` : '前头已经出事'
    case 'journey':
      return locationCue ? `${locationCue}该上路了` : `${site}该上路了`
    case 'watch':
      return locationCue ? `${locationCue}有人盯着` : '有人正盯着你'
    default:
      return ''
  }
}

function resolveBeatHookLine(beat: NarrativeBeat, locationCue: string, mode: StoryEventCardInput['mode']) {
  switch (beat) {
    case 'danger':
      return locationCue ? `${locationCue}这边的风声已经变了` : '这股风声已经不只是路过'
    case 'atmosphere':
      return locationCue ? `${locationCue}表面还静，底下已经起了响` : '眼前还算安静，可底下已经起了响'
    case 'arrival':
      return '先记住这次露面，后面还会回头撞上'
    case 'aftermath':
      return locationCue ? `${locationCue}这一回不会轻轻放下` : '这一下已经把后面的恩怨都扯动了'
    case 'journey':
      return mode === 'adventure' ? '路已经摆在前头，接下来只看往哪边落脚' : '这口气已经逼你上路，停不久了'
    case 'watch':
      return '这条线已经记住你了，后面还会继续追上来'
    default:
      return ''
  }
}

function resolveSpeakerEncounterLine(speakerCue: string, mode: StoryEventCardInput['mode']) {
  if (!speakerCue) return ''
  if (mode === 'adventure') {
    if (/江溯|林清寒|宁玄策/u.test(speakerCue)) return `${speakerCue}就在前头`
    return `${speakerCue}这次走到了你前头`
  }
  if (/江溯|林清寒|宁玄策/u.test(speakerCue)) return `${speakerCue}那边先起了动静`
  return `${speakerCue}这次先露了面`
}

function resolveEventHeadline(input: StoryEventCardInput, sentence: string) {
  if (!input.currentNodeId) {
    return input.mode === 'adventure' ? '路上暂时还没撞上事' : '眼下还没真起事'
  }
  if (isStoryHoldState(input)) {
    return input.mode === 'adventure' ? '这一段先收在路上' : '这一截先压在眼前'
  }

  const speakerCue = extractSpeakerCue(input)
  const locationCue = resolveLocationLabel(input)
  const narrativeBeat = resolveNarrativeBeat(sentence)

  if (input.notifications.some(item => item.type === 'warning' || item.type === 'error')) {
    return locationCue ? `${locationCue}起了岔子` : '前头起了岔子'
  }
  if (speakerCue) {
    return `${speakerCue}露面了`
  }
  if (input.availableSideQuests.length > 0) {
    return locationCue ? `${locationCue}有人等你` : '有人回头找你'
  }
  if (input.unlockedClueCount > 0) {
    return locationCue ? `${locationCue}露出线头` : '旧线索又露头'
  }
  if (narrativeBeat) {
    const beatHeadline = resolveBeatHeadline(narrativeBeat, locationCue, input.mode)
    if (beatHeadline) return beatHeadline
  }
  const eventCue = toEventCue(sentence, 11)
  if (eventCue && eventCue !== locationCue) {
    if (locationCue && /^(江溯|洛衍之|顾长惜|云斐然|苏清鸢|林清寒|宁玄策)/u.test(eventCue)) {
      if (/归来|回来了|在守着|在送你|留了一手/u.test(eventCue)) return eventCue
      if (/^(江溯|林清寒|宁玄策)/u.test(eventCue)) return `${eventCue}那边有异动`
      return `${eventCue}露面了`
    }
    if (/^(江溯|洛衍之|顾长惜|云斐然|苏清鸢|林清寒|宁玄策)/u.test(eventCue)) {
      if (/归来|回来了|在守着|在送你|留了一手/u.test(eventCue)) return eventCue
      if (/^(江溯|林清寒|宁玄策)/u.test(eventCue)) return `${eventCue}那边有异动`
      return `${eventCue}有动静`
    }
  }
  const scenePhrase = extractScenePhrase(sentence)
  if (locationCue && isTemporalScenePhrase(scenePhrase)) {
    return `${locationCue}风声不对`
  }
  if (scenePhrase && scenePhrase !== locationCue) {
    if (/[黄昏|暮色|夜色|晨光|晚风|炉火|雨幕]/u.test(scenePhrase)) {
      return `${scenePhrase}风声不对`
    }
    return `${scenePhrase}有动静`
  }
  if (locationCue) {
    return `${locationCue}有动静`
  }

  return compactLabel(sentence || '一段因果正在逼近', 10)
}

function resolveEventHookLine(input: StoryEventCardInput, summaryLines: string[], sentence: string) {
  if (isStoryHoldState(input)) {
    return input.mode === 'adventure'
      ? '先记在这里，后头上路时再把这一段接回来'
      : '先记在这里，等境界、人和路都够了再往下续'
  }
  const speakerCue = extractSpeakerCue(input)
  const locationCue = resolveLocationLabel(input)
  const firstLine = summaryLines[0] ?? ''
  const narrativeBeat = resolveNarrativeBeat(sentence)
  const scenePhrase = extractScenePhrase(sentence)

  if (speakerCue) return resolveSpeakerEncounterLine(speakerCue, input.mode)
  if (input.availableSideQuests.length > 0) {
    return locationCue ? `${locationCue}这边已经把人牵出来了` : '这条人物线已经自己找上门了'
  }
  if (input.unlockedClueCount > 0) {
    return locationCue ? `${locationCue}这边先露了口风` : '这条旧线索已经重新抬头'
  }
  if (narrativeBeat) {
    const beatHook = resolveBeatHookLine(narrativeBeat, locationCue, input.mode)
    if (beatHook) {
      if (locationCue && (narrativeBeat === 'atmosphere' || narrativeBeat === 'journey')) {
        return input.mode === 'adventure'
          ? `${locationCue}前头已经有动静了`
          : `${locationCue}那边已经先起了动静`
      }
      return beatHook
    }
  }
  if (locationCue && (isTemporalScenePhrase(scenePhrase) || sentence.length >= 24)) {
    return input.mode === 'adventure'
      ? `${locationCue}前头已经有动静了`
      : `${locationCue}那边已经先起了动静`
  }
  if (locationCue) {
    return input.mode === 'adventure'
      ? `${locationCue}前头已经有动静了`
      : `${locationCue}那边已经先起了动静`
  }
  return firstLine || (input.mode === 'adventure' ? '先往前走，事才会撞过来' : '先把这口气运起来，眼前才会起事')
}

function resolveLocationLabel(input: StoryEventCardInput) {
  const rawMap = cleanText(input.currentNodeMap ?? '')
  if (/第[一二三四五六七八九十百千\d]+[卷章节]/u.test(rawMap)) {
    return ''
  }

  const mapName = compactLabel(stripChapterPrefix(input.currentNodeMap ?? ''), 12)
  if (
    mapName
    && mapName !== '来路未明'
    && !isSceneMetaLabel(mapName)
    && !looksLikeChapterStyleTitle(mapName)
  ) {
    return mapName
  }

  const visualLabel = compactLabel(stripChapterPrefix(input.currentNodeIllustration?.alt ?? ''), 12)
  if (
    input.currentNodeIllustration
    && input.currentNodeIllustration.type !== 'character'
    && visualLabel
    && visualLabel !== '来路未明'
    && !isSceneMetaLabel(visualLabel)
    && !looksLikeChapterStyleTitle(visualLabel)
  ) {
    return visualLabel
  }
  return ''
}

function resolveEventTypeLabel(input: StoryEventCardInput) {
  return resolveStoryEventTypeLabel({
    hasCurrentNode: !!input.currentNodeId,
    hasSideQuest: input.availableSideQuests.length > 0,
    hasWarning: input.notifications.some(item => item.type === 'warning' || item.type === 'error'),
    hasClue: input.unlockedClueCount > 0,
    mode: input.mode
  })
}

function resolveEventTone(input: StoryEventCardInput): StoryEventCardData['eventTone'] {
  if (!input.currentNodeId) return 'mist'
  if (input.notifications.some(item => item.type === 'warning' || item.type === 'error')) return 'mist'
  if (input.availableSideQuests.length > 0 || input.unlockedClueCount > 0) return 'gold'
  return 'jade'
}

function resolvePromptText(input: StoryEventCardInput) {
  if (!input.currentNodeId) {
    return input.mode === 'adventure'
      ? '先往外走，路上自然会撞见人。'
      : '先把气息稳住，这件事才会冒头。'
  }

  if (input.availableSideQuests.length > 0) {
    return `已经牵出 ${input.availableSideQuests.length} 条人物线，该赴这一场局了。`
  }

  if (input.unlockedClueCount > 0) {
    return `手里已有 ${input.unlockedClueCount} 条线索，该顺着它逼下去了。`
  }

  if (isStoryHoldState(input)) {
    return input.mode === 'adventure'
      ? '这一段先压住，继续赶路或碰人，后面自然会续上。'
      : '这一段先压住，先去修炼、历练或碰人，风声会再接回来。'
  }

  return input.mode === 'adventure'
    ? '这段事不会停在眼前，得边赶路边追上去。'
    : '这段事先压在眼前，等人和路接上就会往前滚。'
}

function resolveEventSummary(
  input: StoryEventCardInput,
  sentence: string,
  fallbackSummary: string
) {
  if (isStoryHoldState(input)) {
    return compactSentence('这一段先停在这里，等修为、人物线或后续因果接上，再往下展开。', 18)
  }
  const speakerCue = extractSpeakerCue(input)
  const locationCue = resolveLocationLabel(input)
  const narrativeBeat = resolveNarrativeBeat(sentence)
  const scenePhrase = extractScenePhrase(sentence, 12)

  if (speakerCue) {
    return compactSentence(`这次露面先记下，后面还会再撞上${speakerCue}。`, 18)
  }
  if (locationCue && narrativeBeat === 'atmosphere') {
    return compactSentence(`${locationCue}表面还静，底下已经起响。`, 18)
  }
  if (locationCue && narrativeBeat === 'journey') {
    return compactSentence(`${locationCue}前头有路，接下来得往那边落脚。`, 18)
  }
  if (locationCue && narrativeBeat === 'danger') {
    return compactSentence(`${locationCue}这边气息不稳，后头多半还会再起波澜。`, 18)
  }
  if (locationCue && isTemporalScenePhrase(scenePhrase)) {
    return compactSentence(`${locationCue}这一带先压住了一口风声。`, 18)
  }
  if (locationCue && input.currentNodeIllustration?.type !== 'character') {
    return compactSentence(`${locationCue}这边有动静，眼前这段事还会继续往前推。`, 18)
  }
  return compactSentence(fallbackSummary, 18)
}

function resolveEventDetailLine(input: StoryEventCardInput, hookLine: string, fallbackDetail: string, summaryLines: string[]) {
  if (input.availableSideQuests.length > 0) return ''
  if (input.unlockedClueCount > 0) return ''
  if (input.currentNodeIllustration?.type === 'character') {
    return fallbackDetail !== hookLine ? compactSentence(fallbackDetail, 16) : resolveStatusText(input)
  }
  if (summaryLines[1]) return ''
  return resolveStatusText(input)
}

function resolveFocusLabel(input: StoryEventCardInput) {
  if (input.availableSideQuests.length > 0) {
    return input.availableSideQuests[0]?.name ?? '人物线待接'
  }
  if (input.unlockedClueCount > 0) {
    return input.unlockedClueCount >= 3 ? '线头已经连起来了' : '线索刚露头'
  }
  if (input.favorabilityCount > 0) {
    return input.favorabilityCount >= 3 ? '旧关系会回头找你' : '已经有人记住你了'
  }
  return input.mode === 'adventure' ? '前头像是有人露了脸' : '这一步已经惊动了人'
}

function resolveNextMoveLabel(input: StoryEventCardInput) {
  if (!input.currentNodeId) {
    return input.mode === 'adventure' ? '先去外头撞事' : '先把这件事逼出来'
  }
  if (isStoryHoldState(input)) {
    return input.mode === 'adventure' ? '先去外头碰下一段因果' : '先去修炼或历练，把后续条件凑够'
  }
  if (input.availableSideQuests.length > 0) {
    return `该去见 ${compactLabel(input.availableSideQuests[0]?.name ?? '那个人', 8)} 了`
  }
  if (input.unlockedClueCount > 0) {
    return '顺着刚露出来的线再逼一步'
  }
  return input.mode === 'adventure' ? '该往那边追过去了' : '该把这件事接下去了'
}

function resolveToneLabel(input: StoryEventCardInput) {
  if (isStoryHoldState(input)) return '这一段先停住'
  if (input.availableSideQuests.length > 0) return '人物牵动'
  if (input.unlockedClueCount > 0) return '线索浮上来'
  if (input.notifications.some(item => item.type === 'warning' || item.type === 'error')) return '局势有岔子'
  return input.mode === 'adventure' ? '路上起了动静' : '主界有异动'
}

function resolveStatusText(input: StoryEventCardInput) {
  if (!input.currentNodeId) return '当前状态：异动未起'
  if (isStoryHoldState(input)) {
    return input.mode === 'adventure'
      ? '这一段已暂收，后面还会在路上续回来。'
      : '这一段已暂收，等条件够了会继续往下推。'
  }
  if (input.notifications.length > 0) {
    const latest = input.notifications[0]
    if (latest) return `刚起的回响：${compactSentence(latest.message, 18)}`
  }
  if (input.availableSideQuests.length > 0) {
    return `该去碰的人：${compactLabel(input.availableSideQuests[0]?.name ?? '人物线待接', 8)}`
  }
  return input.mode === 'adventure'
    ? input.completedCount > 0
      ? '这条线已经留过脚印。'
      : '这条线刚露头。'
    : input.completedCount > 0
      ? '这段事已经回过声。'
      : '这段事刚压进眼前。'
}

function resolveBeatBadges(input: StoryEventCardInput): StoryEventCardData['beatBadges'] {
  const badges: StoryEventCardData['beatBadges'] = []

  if (input.availableSideQuests.length > 1) {
    badges.push({
      value: input.availableSideQuests.length >= 2 ? '多人牵动' : '有人等你去见',
      tone: 'mist'
    })
  } else if (input.favorabilityCount >= 2) {
    badges.push({
      value: `人情 ${input.favorabilityCount} 份`,
      tone: 'jade'
    })
  }

  if (input.unlockedClueCount >= 2) {
    badges.push({
      value: input.unlockedClueCount >= 3 ? '线头成串' : '线索露头',
      tone: 'gold'
    })
  }

  return badges.slice(0, 1)
}

function resolveTags(input: StoryEventCardInput) {
  const tags = new Set<string>()
  if (input.currentPerspective === 'female') tags.add('女主当前线')
  if (input.currentPerspective === 'male') tags.add('男主当前线')
  if (input.currentPerspective === 'both') tags.add('当前主线')
  if (input.mode === 'adventure') tags.add('历练途中')
  if (input.mode === 'cultivation') tags.add('主界异动')
  if (input.unlockedClueCount > 0) tags.add(`线索 ${input.unlockedClueCount}`)
  if (input.availableSideQuests.length > 0) tags.add(`人物线 ${input.availableSideQuests.length}`)
  if (input.favorabilityCount > 0) tags.add(`关系 ${input.favorabilityCount}`)
  return Array.from(tags).slice(0, 4)
}

export function resolveStoryEventCard(input: StoryEventCardInput): StoryEventCardData {
  const normalizedNodeText = isTerminalShellText(input.currentNodeText) ? '' : input.currentNodeText
  const sentences = storySentences(normalizedNodeText)
  const sentence = stripOuterQuotes(firstStorySentence(normalizedNodeText))
  const locationCue = resolveLocationLabel(input)
  const headline = resolveEventHeadline(input, sentence)

  const secondSentence = stripOuterQuotes(sentences[1] ?? '')
  const headlineSeed = headline.replace(/…$/u, '')
  const shouldPreferSecondSentence = Boolean(
    secondSentence
    && (
      compactLabel(sentence, 16) === headline
      || sentence.startsWith(headlineSeed)
      || (locationCue && isTemporalScenePhrase(extractScenePhrase(sentence)))
    )
  )
  const baseSummary = (
    shouldPreferSecondSentence
      ? secondSentence
      : sentence
  ) || (input.mode === 'adventure'
    ? '这条事不会只停在眼前，路和人都会推着你往前走。'
    : '这条事会散在修炼、历练和人物往来里，一点点逼近。')
  const summarySeed = resolveEventSummary(input, sentence, baseSummary)
  const summaryLines = storySentences(summarySeed)
    .slice(0, 1)
    .map(line => compactSentence(line, 18))
    .filter(Boolean)
  const summary = summaryLines.join(' ')
  const hookLine = resolveEventHookLine(input, summaryLines, sentence)
  const fallbackDetail = resolvePromptText(input)
  const detailLine = resolveEventDetailLine(input, hookLine, fallbackDetail, summaryLines)

  const emptyHookLine = input.mode === 'adventure'
    ? '先往前走，事才会撞过来'
    : '先把这口气运起来，眼前才会起事'
  const visual = input.currentNodeId && input.currentNodeIllustration
    ? {
      src: input.currentNodeIllustration.src,
      alt: input.currentNodeIllustration.alt,
      type: input.currentNodeIllustration.type
    }
    : null

  const safeHeadline = dechapteredLabel(headline, compactLabel(sentence || hookLine || fallbackDetail, 14))
  const safeSceneHint = dechapteredLabel(resolveSceneHint(input, safeHeadline, sentence), '')
  const safeFocusLabel = dechapteredLabel(resolveFocusLabel(input), resolveToneLabel(input))

  return {
    headline: safeHeadline,
    subhead: input.currentNodeId ? '' : input.mode === 'adventure' ? '先出去转一圈' : '先让气息动起来',
    summary,
    summaryLines,
    hookLine: input.currentNodeId ? hookLine : emptyHookLine,
    detailLine: input.currentNodeId ? detailLine : '',
    locationLabel: locationCue,
    nextMoveLabel: resolveNextMoveLabel(input),
    focusLabel: safeFocusLabel,
    toneLabel: resolveToneLabel(input),
    eventTypeLabel: resolveEventTypeLabel(input),
    eventTone: resolveEventTone(input),
    perspectiveLabel: PERSPECTIVE_LABEL[input.currentPerspective],
    perspectiveIcon: resolveStoryPerspectiveIcon(input.currentPerspective),
    sceneHint: safeSceneHint,
    visual,
    promptText: resolvePromptText(input),
    statusText: resolveStatusText(input),
    beatBadges: resolveBeatBadges(input),
    tags: resolveTags(input),
    actions: {
      primary: input.currentNodeId ? (input.mode === 'adventure' ? '追上去' : '接着往下走') : '进去看看',
      secondary: input.currentNodeId ? '' : (input.mode === 'adventure' ? '先去那片地界' : '先去外头走走')
    }
  }
}
