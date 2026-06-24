/**
 * 角色创建 Composable
 * 处理性别选择 → 灵根觉醒 → 血脉觉醒 → 命名的完整创建流程
 */
import { ref, computed } from 'vue'
import type { SpiritRoot, RootElement, RootGrade } from '@/types/spiritRoot'
import type { Bloodline, BloodlineTemplate } from '@/types/bloodline'
import type { Perspective } from '@/types/storyChapter'
import type { ChoiceState } from '@/types/choiceState'
import { generateRandomRoot, buildSpiritRoot, getSpiritRootName, ROOT_GRADE_STATS } from '@/types/spiritRoot'
import { generateRandomBloodline, buildBloodline, getBloodlineName, BLOODLINE_GRADE_BASE } from '@/types/bloodline'
import { usePlayerStore } from '@/stores/playerStore'

export type CreationStep = 'gender' | 'spirit_root' | 'bloodline' | 'naming' | 'completed'

export interface CreationProfile {
  perspective: Perspective
  name: string
  spiritRoot: SpiritRoot
  bloodline: Bloodline
  choiceState: ChoiceState
}

export function useCharacterCreation() {
  const playerStore = usePlayerStore()
  
  const currentStep = ref<CreationStep>('gender')
  const perspective = ref<Perspective>('male')
  const characterName = ref('')
  
  // 灵根
  const generatedRoot = ref<{ grade: RootGrade; primary: RootElement; secondary?: RootElement } | null>(null)
  const spiritRoot = ref<SpiritRoot | null>(null)
  const rerollsRemaining = ref(3)
  
  // 血脉
  const bloodlineTemplate = ref<BloodlineTemplate | null>(null)
  const bloodline = ref<Bloodline | null>(null)
  
  // 灵根名称显示
  const spiritRootName = computed(() => {
    if (!spiritRoot.value) return ''
    return getSpiritRootName(spiritRoot.value)
  })
  
  const spiritRootColor = computed(() => {
    if (!spiritRoot.value) return '#9ca3af'
    return ROOT_GRADE_STATS[spiritRoot.value.grade].color
  })
  
  const spiritRootLabel = computed(() => {
    if (!spiritRoot.value) return ''
    return ROOT_GRADE_STATS[spiritRoot.value.grade].label
  })
  
  // 血脉名称
  const bloodlineName = computed(() => {
    if (!bloodline.value) return ''
    return getBloodlineName(bloodline.value)
  })
  
  const bloodlineColor = computed(() => {
    if (!bloodline.value) return '#9ca3af'
    return BLOODLINE_GRADE_BASE[bloodline.value.grade].color
  })
  
  const bloodlineLabel = computed(() => {
    if (!bloodline.value) return ''
    return BLOODLINE_GRADE_BASE[bloodline.value.grade].label
  })
  
  // 重置
  function reset() {
    currentStep.value = 'gender'
    perspective.value = 'male'
    characterName.value = ''
    generatedRoot.value = null
    spiritRoot.value = null
    rerollsRemaining.value = 3
    bloodlineTemplate.value = null
    bloodline.value = null
  }
  
  // 步骤1: 选择性别/视角
 function selectGender(p: Perspective) {
   perspective.value = p
   currentStep.value = 'spirit_root'
    awakenSpiritRoot()
  }
  
  // 步骤2: 觉醒灵根
  function rollSpiritRoot() {
    if (rerollsRemaining.value <= 0) return
    const result = generateRandomRoot()
    generatedRoot.value = result
    spiritRoot.value = buildSpiritRoot(result)
  }
  
  // 首次觉醒
  function awakenSpiritRoot() {
    const result = generateRandomRoot()
    generatedRoot.value = result
    spiritRoot.value = buildSpiritRoot(result)
    currentStep.value = 'spirit_root'
  }
  
  // 重测灵根
  function rerollSpiritRoot() {
    if (rerollsRemaining.value <= 0) return
    rerollsRemaining.value--
    const result = generateRandomRoot()
    generatedRoot.value = result
    spiritRoot.value = buildSpiritRoot(result)
  }
  
  // 接受灵根
  function acceptSpiritRoot() {
    if (!spiritRoot.value) return
    currentStep.value = 'bloodline'
    awakenBloodline()
  }
  
  // 步骤3: 觉醒血脉
  function awakenBloodline() {
    const template = generateRandomBloodline()
    bloodlineTemplate.value = template
    bloodline.value = buildBloodline(template)
  }
  
  // 接受血脉，进入命名
  function acceptBloodline() {
    if (!bloodline.value) return
    currentStep.value = 'naming'
  }
  
  // 步骤4: 完成创建
 function completeCreation(name: string) {
   if (!spiritRoot.value || !bloodline.value) return
    
    const finalName = name.trim() || (perspective.value === 'male' ? '云逸' : '苏清鸢')
    
    // 写入 playerStore
    const element = spiritRoot.value.primaryElement as any
    playerStore.applyCreationProfile({
      name: finalName,
      icon: perspective.value === 'male' ? '剑' : '灵',
      element: element,
      quality: '灵品',
      perspective: perspective.value,
      spiritRoot: spiritRoot.value,
      bloodline: bloodline.value
    })
    
    currentStep.value = 'completed'
  }
  
  return {
    currentStep,
    perspective,
    characterName,
    generatedRoot,
    spiritRoot,
    rerollsRemaining,
    bloodlineTemplate,
    bloodline,
    spiritRootName,
    spiritRootColor,
    spiritRootLabel,
    bloodlineName,
    bloodlineColor,
    bloodlineLabel,
    reset,
    selectGender,
    rollSpiritRoot,
    awakenSpiritRoot,
    rerollSpiritRoot,
    acceptSpiritRoot,
    awakenBloodline,
    acceptBloodline,
    completeCreation,
  }
}
