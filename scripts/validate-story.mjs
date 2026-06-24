import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CHAPTER_DIR = path.join(ROOT_DIR, 'src/story/chapters')
const STORY_STORE_PATH = path.join(ROOT_DIR, 'src/story/storyStore.ts')

const diagnostics = []
const activeChapterFiles = new Set(await readActiveChapterFiles())

function pushDiagnostic(severity, code, file, message) {
  diagnostics.push({ severity, code, file, message })
}

function isChapterExport(value) {
  return value && typeof value === 'object' && Array.isArray(value.sections) && typeof value.id === 'string'
}

async function collectChapterFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const results = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...await collectChapterFiles(fullPath))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.ts')) {
      results.push(fullPath)
    }
  }
  return results.sort()
}

async function readActiveChapterFiles() {
  const source = await readFile(STORY_STORE_PATH, 'utf8')
  return Array.from(source.matchAll(/from\s+['"]\.\/chapters\/([^'"]+)['"]/g))
    .map(match => path.normalize(path.join(CHAPTER_DIR, `${match[1]}.ts`)))
}

function validateChapter(chapter, file) {
  const sectionIds = new Set()
  const sectionIdList = []

  if (!chapter.sections.length) {
    pushDiagnostic('error', 'chapter-empty', file, `${chapter.id} 没有任何 sections`)
    return
  }

  chapter.sections.forEach((section, index) => {
    if (!section?.id) {
      pushDiagnostic('error', 'section-missing-id', file, `${chapter.id} 第 ${index + 1} 段缺少 id`)
      return
    }
    if (sectionIds.has(section.id)) {
      pushDiagnostic('error', 'section-duplicate-id', file, `${chapter.id} 存在重复 section id: ${section.id}`)
      return
    }
    sectionIds.add(section.id)
    sectionIdList.push(section.id)

    if (!section.type) {
      pushDiagnostic('error', 'section-missing-type', file, `${chapter.id}:${section.id} 缺少 type`)
    }

    if (!section.text && section.type !== 'section_end') {
      pushDiagnostic('warning', 'section-empty-text', file, `${chapter.id}:${section.id} 正文为空`)
    }
  })

  chapter.sections.forEach(section => {
    if (section.autoNext && !sectionIds.has(section.autoNext)) {
      pushDiagnostic('error', 'invalid-autonext', file, `${chapter.id}:${section.id} 的 autoNext 指向不存在节点 ${section.autoNext}`)
    }

    if (Array.isArray(section.choices)) {
      section.choices.forEach((choice, choiceIndex) => {
        if (!choice.nextSectionId) {
          pushDiagnostic('error', 'choice-missing-target', file, `${chapter.id}:${section.id} 第 ${choiceIndex + 1} 个选项缺少 nextSectionId`)
          return
        }
        if (!sectionIds.has(choice.nextSectionId)) {
          pushDiagnostic('error', 'invalid-choice-target', file, `${chapter.id}:${section.id} 第 ${choiceIndex + 1} 个选项指向不存在节点 ${choice.nextSectionId}`)
        }
      })
    }

    if (section.type === 'battle_trigger' && section.battleConfig) {
      for (const nextId of [section.battleConfig.onWin, section.battleConfig.onLose, section.battleConfig.onFlee]) {
        if (nextId && !sectionIds.has(nextId)) {
          pushDiagnostic('error', 'invalid-battle-target', file, `${chapter.id}:${section.id} 的战斗跳转指向不存在节点 ${nextId}`)
        }
      }
    }
  })

  const finalSection = chapter.sections[chapter.sections.length - 1]
  if (finalSection?.type !== 'section_end') {
    pushDiagnostic('warning', 'chapter-no-section-end', file, `${chapter.id} 最后一段不是 section_end`)
  }

  if (chapter.perspective === 'female' && !/顾长惜|她/.test(chapter.sections[0]?.text ?? '')) {
    pushDiagnostic('warning', 'female-perspective-weak-signal', file, `${chapter.id} 标记为 female，但首段缺少明显女主视角信号`)
  }

  if (chapter.perspective === 'male' && !/洛衍之|他/.test(chapter.sections[0]?.text ?? '')) {
    pushDiagnostic('warning', 'male-perspective-weak-signal', file, `${chapter.id} 标记为 male，但首段缺少明显男主视角信号`)
  }

  return {
    id: chapter.id,
    title: chapter.title,
    perspective: chapter.perspective,
    volume: chapter.volume,
    order: chapter.order,
    sectionCount: chapter.sections.length
  }
}

async function main() {
  const files = await collectChapterFiles(CHAPTER_DIR)
  const summaries = []
  const activeSummaries = []
  const backlogImportFailures = []

  for (const file of files) {
    try {
      const mod = await import(pathToFileURL(file).href)
      const chapter = Object.values(mod).find(isChapterExport)
      if (!chapter) {
        pushDiagnostic('warning', 'no-chapter-export', file, '未找到 StoryChapter 导出')
        continue
      }
      const summary = validateChapter(chapter, path.relative(ROOT_DIR, file))
      if (summary) {
        summaries.push(summary)
        if (activeChapterFiles.has(path.normalize(file))) {
          activeSummaries.push(summary)
        }
      }
    } catch (error) {
      const relative = path.relative(ROOT_DIR, file)
      const message = error instanceof Error ? error.message : String(error)
      if (activeChapterFiles.has(path.normalize(file))) {
        pushDiagnostic('error', 'active-import-failed', relative, message)
      } else {
        backlogImportFailures.push({ file: relative, message })
      }
    }
  }

  const byId = new Map()
  for (const summary of summaries) {
    if (byId.has(summary.id)) {
      pushDiagnostic('error', 'duplicate-chapter-id', summary.id, `重复 chapter id: ${summary.id}`)
    } else {
      byId.set(summary.id, summary)
    }
  }

  const femaleCount = activeSummaries.filter(item => item.perspective === 'female').length
  const maleCount = activeSummaries.filter(item => item.perspective === 'male').length
  const bothCount = activeSummaries.filter(item => item.perspective === 'both').length

  if (femaleCount === 0) {
    pushDiagnostic('error', 'female-path-missing', 'runtime', '当前章节集中没有 female 视角章节')
  }
  if (maleCount === 0) {
    pushDiagnostic('error', 'male-path-missing', 'runtime', '当前章节集中没有 male 视角章节')
  }

  const requiredVol1 = [
    'vol1_ch001_iron_and_blood',
    'vol1_ch002_mountain_encounter',
    'vol1_ch003_spirit_herb_valley',
    'vol1_ch004_sword_whisper',
    'vol1_ch005_hermits_secret',
    'vol1_ch006_sword_sect',
    'vol1_ch008_girl_in_tianji'
  ]

  for (const chapterId of requiredVol1) {
    if (!byId.has(chapterId)) {
      pushDiagnostic('error', 'required-chapter-missing', 'runtime', `缺少关键章节 ${chapterId}`)
    }
  }

  console.log('Story validation report')
  console.log('')
  console.log(`Active runtime chapters: ${activeSummaries.length}`)
  console.log(`Loaded chapter files: ${summaries.length}`)
  console.log(`Active perspectives: male=${maleCount}, female=${femaleCount}, both=${bothCount}`)
  console.log(`Diagnostics: ${diagnostics.filter(item => item.severity === 'error').length} errors, ${diagnostics.filter(item => item.severity === 'warning').length} warnings`)
  console.log('')

  diagnostics.forEach(item => {
    console.log(`[${item.severity}] ${item.code} ${item.file}: ${item.message}`)
  })

  if (backlogImportFailures.length) {
    console.log('')
    console.log(`Backlog chapter import failures: ${backlogImportFailures.length}`)
    backlogImportFailures.slice(0, 20).forEach(item => {
      console.log(`[backlog] ${item.file}: ${item.message}`)
    })
    if (backlogImportFailures.length > 20) {
      console.log(`[backlog] ... and ${backlogImportFailures.length - 20} more`)
    }
  }

  if (diagnostics.some(item => item.severity === 'error')) {
    process.exitCode = 1
  }
}

await main()
