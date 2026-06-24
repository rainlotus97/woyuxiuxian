import type { StoryVoiceMeta } from './storyCharacterCodex'

export interface StoryVoiceRequest {
  key: string
  text: string
  speaker?: string
}

export interface StoryVoiceCueRequest extends StoryVoiceRequest {
  mode?: 'preview' | 'dialog' | 'narration' | 'debut' | 'scene' | 'faction'
  characterId?: string
}

export interface StoryVoiceProvider {
  play(request: StoryVoiceRequest): Promise<void> | void
  stop?(): Promise<void> | void
  canPlay?(meta?: StoryVoiceMeta): boolean
  playCue?(request: StoryVoiceCueRequest): Promise<void> | void
}

let activeProvider: StoryVoiceProvider | null = null

export function registerStoryVoiceProvider(provider: StoryVoiceProvider | null) {
  activeProvider = provider
}

export function hasStoryVoiceProvider(meta?: StoryVoiceMeta) {
  if (!activeProvider) return false
  return activeProvider.canPlay ? activeProvider.canPlay(meta) : true
}

export async function playStoryVoice(request: StoryVoiceRequest) {
  if (!activeProvider) return false
  await activeProvider.play(request)
  return true
}

export async function stopStoryVoice() {
  if (!activeProvider?.stop) return false
  await activeProvider.stop()
  return true
}

export async function emitStoryVoiceCue(request: StoryVoiceCueRequest) {
  if (!activeProvider?.playCue) return false
  await activeProvider.playCue(request)
  return true
}
