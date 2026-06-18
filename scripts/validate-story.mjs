import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const STORY_DIR = path.join(ROOT_DIR, 'src/assets/story')
const REQUIRED_LINK_COLUMNS = [
  '主线节点ID',
  '角色ID',
  '事件ID',
  '触发类型',
  '基础触发值',
  '优先级',
  '解锁周目',
  '补触发节点',
  '补触发条件',
  '条件类型',
  '互斥事件ID',
  '备注',
]
const END_MARKERS = new Set(['END', 'End', 'end', '无'])

function relativePath(filePath) {
  return path.relative(ROOT_DIR, filePath).replaceAll(path.sep, '/')
}

function diagnostic(severity, code, filePath, message, context = {}) {
  return {
    severity,
    code,
    filePath: relativePath(filePath),
    message,
    ...context,
  }
}

function splitNodeBlocks(content) {
  const blocks = []
  const nodePattern = /---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*?)(?=---\s*\n[\u4e00-\u9fa5A-Za-z]+[：:]|$)/g
  let match
  while ((match = nodePattern.exec(content)) !== null) {
    const metadata = match[1]
    const body = match[2] || ''
    if (metadata && /(?:^|\n)(?:ID|事件ID)[：:]/.test(metadata)) {
      blocks.push(`---\n${metadata.trim()}\n---\n${body.trim()}`)
    }
  }
  return blocks
}

function parseMetadata(block) {
  const metadata = {}
  const match = block.match(/---\n([\s\S]*?)\n---/)
  if (!match?.[1]) return metadata

  const fieldPattern = /^([\u4e00-\u9fa5A-Za-z]+)[：:]\s*(.*)$/gm
  let fieldMatch
  while ((fieldMatch = fieldPattern.exec(match[1])) !== null) {
    const key = fieldMatch[1]?.trim()
    if (key) metadata[key] = (fieldMatch[2] || '').trim()
  }
  return metadata
}

function stripMetadataBlock(block) {
  return block.replace(/---\n([\s\S]*?)\n---/, '').trim()
}

function extractSection(content, name) {
  const regex = new RegExp(`【${name}】\\s*\\n([\\s\\S]*?)(?=\\n【|$)`)
  return content.match(regex)?.[1]?.trim() || ''
}

function parseChoices(block) {
  const section = extractSection(block, '选择')
  if (!section) return []

  const choices = []
  for (const line of section.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const targetMatch = trimmed.match(/^(\d+)\.\s*(.+?)\s*→\s*(\S+)$/)
    if (targetMatch?.[2] && targetMatch[3]) {
      choices.push({
        text: targetMatch[2].trim(),
        targetId: targetMatch[3].trim(),
      })
      continue
    }

    const endMatch = trimmed.match(/^(\d+)\.\s*(.+)$/)
    const endText = endMatch?.[2]?.trim()
    if (
      endText
      && (/^卷\d+\s*完$/.test(endText)
        || /^(全剧终|故事完|结局)$/.test(endText)
        || /^【结局[：:]\s*.+】$/.test(endText))
    ) {
      choices.push({ text: endText, targetId: null })
    }
  }
  return choices
}

function parseGameplayTargetIds(block) {
  const section = extractSection(block, '效果')
  if (!section) return []

  const targetIds = []
  for (const line of section.split('\n')) {
    const trimmed = line.trim()
    const targetMatch = trimmed.match(/^(?:失败跳转|完成后跳转|胜利后跳转|败北后跳转|脱离后跳转)[：:]\s*(\S+)$/)
    if (targetMatch?.[1]) targetIds.push(targetMatch[1].trim())
  }
  return targetIds
}

function parseTableRows(content) {
  const rows = []
  for (const line of content.split('\n')) {
    if (!line.trim().startsWith('|')) continue
    const columns = line
      .split('|')
      .slice(1, -1)
      .map(column => column.trim())
    if (!columns.length) continue
    if (columns.every(column => /^:?-{2,}:?$/.test(column.replace(/\s+/g, '')))) continue
    rows.push(columns)
  }
  return rows
}

function normalizeNullable(value) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed || trimmed === '无') return null
  return trimmed
}

function parseTriggerTable(content) {
  const rows = parseTableRows(content)
  if (!rows.length) return { header: [], rules: [] }

  const header = rows[0] || []
  const columnIndex = new Map(header.map((name, index) => [name, index]))
  const rules = []

  for (const row of rows.slice(1)) {
    const mainNodeId = row[columnIndex.get('主线节点ID') ?? -1]
    const eventId = row[columnIndex.get('事件ID') ?? -1]
    if (!mainNodeId || !eventId) continue

    rules.push({
      mainNodeId,
      characterId: normalizeNullable(row[columnIndex.get('角色ID') ?? -1]),
      eventId,
      fallbackNode: normalizeNullable(row[columnIndex.get('补触发节点') ?? -1]),
      exclusiveEventId: normalizeNullable(row[columnIndex.get('互斥事件ID') ?? -1]),
    })
  }

  return { header, rules }
}

function parseCharacterHeader(content) {
  const name = content.match(/#\s*角色[：:]\s*(.+)/)?.[1]?.trim()
  const id = content.match(/角色ID[：:]\s*(C\d+)/)?.[1]?.trim()
  if (!name || !id) return null

  const rows = Array.from(content.matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm))
  const table = new Map()
  for (const row of rows) {
    const key = row[1]?.trim()
    const value = row[2]?.trim()
    if (!key || !value || key === '基础信息' || key.startsWith('---')) continue
    table.set(key, value)
  }

  const relatedNodes = (table.get('关联主线') || '无')
    .split(/[+、,，]/)
    .map(value => value.trim())
    .filter(value => value && value !== '无')

  return { id, name, relatedNodes }
}

function parseStoryFile(filePath, kind, content) {
  const diagnostics = []
  const ids = []
  const blocks = splitNodeBlocks(content)
  const records = []

  if (!blocks.length) {
    diagnostics.push(diagnostic('warning', 'empty-story-file', filePath, '未发现可解析的故事节点或角色事件'))
  }

  blocks.forEach((block, index) => {
    const metadata = parseMetadata(block)
    const id = metadata.ID || metadata.id || metadata.事件ID || metadata.eventId || ''
    const name = metadata.名称 || metadata.name || metadata.事件名 || metadata.eventName || ''
    const body = stripMetadataBlock(block)
    const isEvent = Boolean(metadata.事件ID || metadata.eventId)

    if (!id) {
      diagnostics.push(diagnostic('error', 'missing-id', filePath, `第 ${index + 1} 个分块缺少 ID / 事件ID`))
      return
    }
    ids.push(id)

    if (!name) {
      diagnostics.push(diagnostic('error', 'missing-name', filePath, `${id} 缺少 名称 / 事件名`, { id }))
    }
    if (!extractSection(body, '正文')) {
      diagnostics.push(diagnostic('error', 'missing-body', filePath, `${id} 缺少【正文】段落`, { id }))
    }

    records.push({
      id,
      name,
      isEvent,
      kind,
      filePath,
      choices: parseChoices(body),
      gameplayTargetIds: parseGameplayTargetIds(body),
      fallbackNode: normalizeNullable(metadata.补触发 || metadata.fallbackNode),
    })
  })

  return { ids, records, diagnostics }
}

async function fileExists(filePath) {
  try {
    const result = await stat(filePath)
    return result.isFile()
  } catch {
    return false
  }
}

async function readMarkdownIfExists(filePath) {
  if (!(await fileExists(filePath))) return null
  return readFile(filePath, 'utf8')
}

async function listMarkdownFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true })
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => path.join(dirPath, entry.name))
    .sort()
}

async function discoverVolumes() {
  const entries = await readdir(STORY_DIR, { withFileTypes: true })
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name.match(/^volume-(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number)
    .sort((a, b) => a - b)
}

function collectDuplicates(records, key) {
  const seen = new Set()
  const duplicates = new Set()
  for (const record of records) {
    const value = record[key]
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return Array.from(duplicates)
}

function validateTargets(records, diagnostics, allIds) {
  for (const record of records) {
    const targetIds = [
      ...record.choices.map(choice => choice.targetId),
      ...record.gameplayTargetIds,
      record.fallbackNode,
    ].filter(Boolean)

    for (const targetId of targetIds) {
      if (END_MARKERS.has(targetId)) continue
      if (!allIds.has(targetId)) {
        diagnostics.push(diagnostic(
          'warning',
          record.isEvent ? 'missing-event-target' : 'missing-node-target',
          record.filePath,
          `${record.id} 指向了未找到的目标: ${targetId}`,
          { id: record.id, targetId }
        ))
      }
    }
  }
}

async function validateVolume(volume) {
  const diagnostics = []
  const files = []
  const storyRecords = []
  const characterInfos = []
  const volumeDir = path.join(STORY_DIR, `volume-${volume}`)
  const storyFiles = [
    { name: 'main.md', kind: 'main' },
    { name: 'female.md', kind: 'main' },
    { name: 'common.md', kind: 'common' },
  ]

  for (const storyFile of storyFiles) {
    const filePath = path.join(volumeDir, storyFile.name)
    const content = await readMarkdownIfExists(filePath)
    if (content === null) continue

    const parsed = parseStoryFile(filePath, storyFile.kind, content)
    diagnostics.push(...parsed.diagnostics)
    storyRecords.push(...parsed.records)
    files.push({ path: relativePath(filePath), kind: storyFile.kind, ids: parsed.ids })
  }

  const characterDir = path.join(STORY_DIR, 'characters')
  const characterFiles = await listMarkdownFiles(characterDir)
  for (const filePath of characterFiles) {
    const content = await readFile(filePath, 'utf8')
    const info = parseCharacterHeader(content)
    if (!info) {
      diagnostics.push(diagnostic('error', 'missing-character-header', filePath, '角色文件缺少角色标题或角色ID'))
    } else {
      characterInfos.push({ ...info, filePath })
      if (!info.relatedNodes.length) {
        diagnostics.push(diagnostic('warning', 'empty-character-related-nodes', filePath, `角色 ${info.id} 未声明关联主线`, { characterId: info.id }))
      }
    }

    const parsed = parseStoryFile(filePath, 'character', content)
    diagnostics.push(...parsed.diagnostics)
    storyRecords.push(...parsed.records)
    files.push({ path: relativePath(filePath), kind: 'character', ids: [info?.id, ...parsed.ids].filter(Boolean) })
  }

  const linkFilePath = path.join(STORY_DIR, 'links', `link-volume-${volume}.md`)
  const linkContent = await readMarkdownIfExists(linkFilePath)
  let triggerRules = []
  if (linkContent === null) {
    diagnostics.push(diagnostic('warning', 'missing-link-file', linkFilePath, `缺少第 ${volume} 卷触发规则表`))
  } else {
    const parsed = parseTriggerTable(linkContent)
    triggerRules = parsed.rules
    files.push({ path: relativePath(linkFilePath), kind: 'link', ids: parsed.rules.map(rule => rule.eventId) })

    for (const column of REQUIRED_LINK_COLUMNS) {
      if (!parsed.header.includes(column)) {
        diagnostics.push(diagnostic('error', 'missing-link-column', linkFilePath, `触发表缺少列: ${column}`))
      }
    }
  }

  const nodeRecords = storyRecords.filter(record => !record.isEvent)
  const eventRecords = storyRecords.filter(record => record.isEvent)
  const allIds = new Set(storyRecords.map(record => record.id))
  const characterIds = new Set(characterInfos.map(info => info.id))

  for (const nodeId of collectDuplicates(nodeRecords, 'id')) {
    diagnostics.push(diagnostic('error', 'duplicate-node-id', volumeDir, `重复的节点ID: ${nodeId}`, { id: nodeId }))
  }
  for (const eventId of collectDuplicates(eventRecords, 'id')) {
    diagnostics.push(diagnostic('error', 'duplicate-event-id', characterDir, `重复的事件ID: ${eventId}`, { id: eventId }))
  }

  validateTargets(storyRecords, diagnostics, allIds)

  for (const info of characterInfos) {
    for (const nodeId of info.relatedNodes) {
      if (!allIds.has(nodeId)) {
        diagnostics.push(diagnostic('warning', 'missing-character-related-node', info.filePath, `角色 ${info.id} 关联主线未找到: ${nodeId}`, { characterId: info.id, targetId: nodeId }))
      }
    }
  }

  for (const rule of triggerRules) {
    if (!allIds.has(rule.mainNodeId)) {
      diagnostics.push(diagnostic('warning', 'missing-trigger-main-node', linkFilePath, `触发规则主线节点未找到: ${rule.mainNodeId}`, { targetId: rule.mainNodeId }))
    }
    if (!allIds.has(rule.eventId)) {
      diagnostics.push(diagnostic('warning', 'missing-trigger-event', linkFilePath, `触发规则事件未找到: ${rule.eventId}`, { targetId: rule.eventId }))
    }
    if (rule.characterId && !characterIds.has(rule.characterId)) {
      diagnostics.push(diagnostic('warning', 'missing-trigger-character', linkFilePath, `触发规则角色未找到: ${rule.characterId}`, { characterId: rule.characterId }))
    }
    if (rule.fallbackNode && !allIds.has(rule.fallbackNode)) {
      diagnostics.push(diagnostic('warning', 'missing-trigger-fallback', linkFilePath, `触发规则补触发节点未找到: ${rule.fallbackNode}`, { targetId: rule.fallbackNode }))
    }
    if (rule.exclusiveEventId && !allIds.has(rule.exclusiveEventId)) {
      diagnostics.push(diagnostic('warning', 'missing-trigger-exclusive-event', linkFilePath, `触发规则互斥事件未找到: ${rule.exclusiveEventId}`, { targetId: rule.exclusiveEventId }))
    }
  }

  return {
    volume,
    files,
    diagnostics,
    summary: {
      nodeCount: nodeRecords.length,
      eventCount: eventRecords.length,
      characterCount: characterInfos.length,
      triggerRuleCount: triggerRules.length,
    },
  }
}

function printReport(results) {
  let errorCount = 0
  let warningCount = 0

  console.log('Story validation report')
  console.log('')

  for (const result of results) {
    const errors = result.diagnostics.filter(item => item.severity === 'error')
    const warnings = result.diagnostics.filter(item => item.severity === 'warning')
    errorCount += errors.length
    warningCount += warnings.length

    console.log(`Volume ${result.volume}: ${result.summary.nodeCount} nodes, ${result.summary.eventCount} events, ${result.summary.characterCount} characters, ${result.summary.triggerRuleCount} trigger rules`)
    console.log(`  Files: ${result.files.length}`)
    console.log(`  Diagnostics: ${errors.length} errors, ${warnings.length} warnings`)

    for (const item of result.diagnostics) {
      const prefix = item.severity === 'error' ? 'ERROR' : 'WARN '
      console.log(`  ${prefix} ${item.code} ${item.filePath}: ${item.message}`)
    }
    console.log('')
  }

  console.log(`Total: ${errorCount} errors, ${warningCount} warnings`)
  return errorCount
}

async function main() {
  const volumes = await discoverVolumes()
  if (!volumes.length) {
    console.error(`No story volumes found under ${relativePath(STORY_DIR)}`)
    process.exitCode = 1
    return
  }

  const results = []
  for (const volume of volumes) {
    results.push(await validateVolume(volume))
  }

  const errorCount = printReport(results)
  process.exitCode = errorCount > 0 ? 1 : 0
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
