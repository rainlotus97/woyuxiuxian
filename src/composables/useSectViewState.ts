import { computed } from 'vue'
import {
  getSectRelationDescription,
  getSectSurfaceTone,
  getSectWorldStatusLabel,
  type SectDiplomacyRow
} from '@/components/sect/sectUi'
import {
  getAuthorityLevelLabel,
  getDirectiveDescription,
  getDirectiveLabel
} from '@/sect/runtime/sectPositionResolver'
import { usePlayerStore } from '@/stores/playerStore'
import { useSectStore } from '@/stores/sectStore'
import { useWorldStore } from '@/stores/worldStore'
import type { SectEvent } from '@/types/sect'
import { ALL_SECTS, getSectById } from '@/types/sect'

export const NPC_RESCUE_COST = {
  contribution: 38,
  gold: 180
}

export function useSectViewState() {
  const sectStore = useSectStore()
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()

  const sectTone = computed(() => getSectSurfaceTone({
    isCaptured: playerStore.captivity.isCaptured,
    worldCondition: sectStore.worldCondition,
    hasActiveWar: Boolean(sectStore.activeWar)
  }))

  const worldStatusLabel = computed(() => getSectWorldStatusLabel(sectStore.worldCondition.status))

  const overviewSubtitle = computed(() => {
    if (playerStore.captivity.isCaptured) {
      const captor = playerStore.captivity.captorSectId
        ? getSectById(playerStore.captivity.captorSectId)?.name ?? '敌对势力'
        : '敌对势力'
      return `你正被${captor}控制，宗门循环应优先处理赎回、营救或脱逃。`
    }
    if (sectStore.worldCondition.status === 'collapsed') {
      return '山门已陷入沦陷状态，需要后续补上重建与恢复链路。'
    }
    if (sectStore.activeWar) {
      return '当前战事会持续影响区域控制权、宗门关系与世界日志。'
    }
    return '宗门提供任务、俸禄、设施与外交关系，是主循环中的长期归属系统。'
  })

  const captivityHint = computed(() => {
    if (!playerStore.captivity.isCaptured) return '宗门完整度影响战后后果与后续事件。'
    return '主角被俘期间，宗门后果与世界事件仍会继续推进。'
  })

  const capturedNpcRescueTarget = computed(() => {
    const target = worldStore.getCapturedNpcRescueTarget(sectStore.joinedSectId)
    if (!target) return null
    return {
      id: target.id,
      name: target.name,
      title: target.title,
      captorName: target.captorName,
      locationName: target.locationName,
      severity: target.severity === 'legendary' ? 'legendary' as const : 'major' as const
    }
  })

  const promotionProgress = computed(() => {
    const next = sectStore.nextPosition
    if (!next) {
      return {
        current: sectStore.contribution,
        max: Math.max(1, sectStore.contribution),
        hint: '已抵达当前职位上限'
      }
    }

    return {
      current: Math.min(sectStore.contribution, next.requiredContribution),
      max: next.requiredContribution,
      hint: `距离晋升 ${next.name} 还需 ${Math.max(0, next.requiredContribution - sectStore.contribution)} 贡献`
    }
  })

  const visibleSectEvent = computed<SectEvent | null>(() => sectStore.activeEvent ?? null)

  const completedTaskCount = computed(() => {
    return [...sectStore.dailyTasks, ...sectStore.weeklyTasks].filter(task => task.completed).length
  })

  const diplomacyRows = computed<SectDiplomacyRow[]>(() => {
    if (!sectStore.currentSect) return []

    return ALL_SECTS
      .filter(sect => sect.id !== sectStore.currentSect?.id)
      .map(sect => {
        const relation = sectStore.relations[sect.id] ?? 'neutral'
        return {
          sectId: sect.id,
          name: sect.name,
          icon: sect.icon,
          realm: sect.realm,
          relation,
          description: getSectRelationDescription(relation),
          canDeclareWar: sectStore.authorityState.canDeclareWar && !sectStore.activeWar && relation !== 'at_war'
        }
      })
  })

  const diplomacySubtitle = computed(() => {
    if (sectStore.activeWar) return '战局已经开启，后续应继续补充更细粒度的宣战、停战与战后限制。'
    return '外交关系会被世界 tick 推动变化，也可由玩家主动宣战。'
  })

  const taskSummary = computed(() => {
    if (sectStore.completedTasks.length > 0) {
      return `已有 ${sectStore.completedTasks.length} 项宗务可立即结算，适合在推进地图或剧情前先回收贡献与灵石。`
    }
    return '当前暂无待领奖励，继续通过讨伐、采集、炼制与探索积累贡献。'
  })

  const gardenSummary = computed(() => {
    if (sectStore.readyGardenSlots > 0) return `${sectStore.readyGardenSlots} 株已成熟`
    if (sectStore.activeGardenSlots > 0) return '药园生长中'
    return '药园待播种'
  })

  const gardenHint = computed(() => {
    if (sectStore.readyGardenSlots > 0) {
      return '成熟作物已经可以直接回收，用来支撑炼丹与宗门采集任务。'
    }
    if (sectStore.activeGardenSlots > 0) {
      return '当前已有作物在生长，成熟后可直接回流材料链。'
    }
    return '药园当前空置，建议尽快播种以建立灵草到丹药的稳定循环。'
  })

  const facilitySummary = computed(() => {
    return '炼丹炉决定丹药层级，药园决定灵草供给。两者等级越高，宗门经济链越完整。'
  })

  const authorityLabel = computed(() => {
    return getAuthorityLevelLabel(sectStore.authorityState.authorityLevel)
  })

  const authorityDescription = computed(() => {
    if (!sectStore.authorityState.canIssueDirectives) {
      return '当前仍处弟子层级，主要负责执行宗门差遣，尚不能调整山门方略。'
    }
    if (sectStore.authorityState.canLeadSect) {
      return '你已进入掌权层级，可调整宗门方略并主导外交、战备与资源分配。'
    }
    return '你已拥有调度部分山门资源的权限，不同方略会影响任务、药园、炼丹和战局回报。'
  })

  const activeDirectiveLabel = computed(() => {
    return getDirectiveLabel(sectStore.activeDirective)
  })

  const directiveOptions = computed(() => {
    return sectStore.authorityState.availableDirectives.map(id => ({
      id,
      label: getDirectiveLabel(id),
      description: getDirectiveDescription(id)
    }))
  })

  const activeWarLabel = computed(() => {
    const war = sectStore.activeWar
    if (!war) return '暂无战事'
    const defender = getSectById(war.defenderSectId)
    return `我方与${defender?.name ?? war.defenderSectId}的战局`
  })

  return {
    activeDirectiveLabel,
    activeWarLabel,
    authorityDescription,
    authorityLabel,
    captivityHint,
    capturedNpcRescueTarget,
    completedTaskCount,
    diplomacyRows,
    diplomacySubtitle,
    directiveOptions,
    facilitySummary,
    gardenHint,
    gardenSummary,
    overviewSubtitle,
    promotionProgress,
    sectTone,
    taskSummary,
    visibleSectEvent,
    worldStatusLabel
  }
}
