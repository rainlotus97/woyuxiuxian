import type {
  CharacterEvent,
  CharacterInfo,
  Perspective,
  StoryManifest,
  StoryManifestDiagnostic,
  StoryManifestFile,
  StoryNode,
  TriggerRule,
} from '../types'
import { uniqueStrings } from './shared'

interface BuildStoryManifestInput {
  volume: number
  perspective: Perspective
  files: StoryManifestFile[]
  mainNodes: StoryNode[]
  commonNodes: StoryNode[]
  characterInfos: CharacterInfo[]
  characterEvents: CharacterEvent[]
  triggerRules: TriggerRule[]
}

function createDiagnostic(
  volume: number,
  filePath: string,
  severity: StoryManifestDiagnostic['severity'],
  code: string,
  message: string,
  context?: Partial<StoryManifestDiagnostic>
): StoryManifestDiagnostic {
  return {
    severity,
    code,
    message,
    volume,
    filePath,
    ...context,
  }
}

export function buildStoryManifest(input: BuildStoryManifestInput): StoryManifest {
  const diagnostics: StoryManifestDiagnostic[] = []
  const allNodes = [...input.mainNodes, ...input.commonNodes]
  const nodeIds = new Set(allNodes.map(node => node.id))
  const eventIds = new Set(input.characterEvents.map(event => event.id))
  const characterIds = new Set(input.characterInfos.map(info => info.id))

  const duplicateNodeIds = uniqueStrings(
    allNodes
      .map(node => node.id)
      .filter((nodeId, index, values) => values.indexOf(nodeId) !== index)
  )
  for (const nodeId of duplicateNodeIds) {
    diagnostics.push(
      createDiagnostic(input.volume, `volume-${input.volume}`, 'error', 'duplicate-node-id', `重复的节点ID: ${nodeId}`, {
        nodeId,
      })
    )
  }

  const duplicateEventIds = uniqueStrings(
    input.characterEvents
      .map(event => event.id)
      .filter((eventId, index, values) => values.indexOf(eventId) !== index)
  )
  for (const eventId of duplicateEventIds) {
    diagnostics.push(
      createDiagnostic(input.volume, `volume-${input.volume}`, 'error', 'duplicate-event-id', `重复的事件ID: ${eventId}`, {
        eventId,
      })
    )
  }

  for (const node of allNodes) {
    for (const choice of node.content.choices) {
      if (choice.targetId && !nodeIds.has(choice.targetId) && !eventIds.has(choice.targetId)) {
        diagnostics.push(
          createDiagnostic(input.volume, `volume-${input.volume}`, 'warning', 'missing-choice-target', `节点 ${node.id} 的选项目标未找到: ${choice.targetId}`, {
            nodeId: node.id,
          })
        )
      }
    }
  }

  for (const event of input.characterEvents) {
    for (const choice of event.content.choices) {
      if (choice.targetId && !nodeIds.has(choice.targetId) && !eventIds.has(choice.targetId)) {
        diagnostics.push(
          createDiagnostic(input.volume, `volume-${input.volume}`, 'warning', 'missing-event-choice-target', `事件 ${event.id} 的选项目标未找到: ${choice.targetId}`, {
            eventId: event.id,
          })
        )
      }
    }
  }

  for (const rule of input.triggerRules) {
    if (!nodeIds.has(rule.mainNodeId) && !eventIds.has(rule.mainNodeId)) {
      diagnostics.push(
        createDiagnostic(input.volume, `links/link-volume-${input.volume}.md`, 'warning', 'missing-trigger-main-node', `触发规则主线节点未找到: ${rule.mainNodeId}`, {
          eventId: rule.eventId,
        })
      )
    }
    if (!eventIds.has(rule.eventId) && !nodeIds.has(rule.eventId)) {
      diagnostics.push(
        createDiagnostic(input.volume, `links/link-volume-${input.volume}.md`, 'warning', 'missing-trigger-event', `触发规则事件未找到: ${rule.eventId}`, {
          eventId: rule.eventId,
        })
      )
    }
    if (rule.characterId && !characterIds.has(rule.characterId)) {
      diagnostics.push(
        createDiagnostic(input.volume, `links/link-volume-${input.volume}.md`, 'warning', 'missing-trigger-character', `触发规则角色未找到: ${rule.characterId}`, {
          characterId: rule.characterId,
          eventId: rule.eventId,
        })
      )
    }
  }

  for (const info of input.characterInfos) {
    if (info.relatedNodes.length === 0) {
      diagnostics.push(
        createDiagnostic(input.volume, `characters/${info.id}.md`, 'warning', 'empty-character-related-nodes', `角色 ${info.id} 未声明关联主线`, {
          characterId: info.id,
        })
      )
    }
  }

  return {
    volume: input.volume,
    perspective: input.perspective,
    files: input.files,
    diagnostics,
    summary: {
      mainNodeCount: input.mainNodes.length,
      commonNodeCount: input.commonNodes.length,
      characterEventCount: input.characterEvents.length,
      characterInfoCount: input.characterInfos.length,
      triggerRuleCount: input.triggerRules.length,
    },
    hasErrors: diagnostics.some(item => item.severity === 'error'),
  }
}
