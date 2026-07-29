import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MANIFEST_PATH = path.join(ROOT_DIR, 'src/assets/assetManifest.json')
const ASSET_ROOT = path.join(ROOT_DIR, 'src/assets')
const REQUIRED_FIELDS = ['id', 'path', 'type', 'usage', 'source', 'license']
const MANAGED_EXTENSIONS = new Set(['.png', '.svg', '.woff2'])
const IGNORED_DISCOVERY_SEGMENTS = new Set(['story'])
const IGNORED_DISCOVERY_FILES = new Set(['src/assets/battle/ASSET_SOURCES.md', 'src/assets/assetManifest.json'])

function relativePath(filePath) {
  return path.relative(ROOT_DIR, filePath).replaceAll(path.sep, '/')
}

function diagnostic(severity, code, assetPath, message) {
  return { severity, code, assetPath, message }
}

async function fileExists(filePath) {
  try {
    const result = await stat(filePath)
    return result.isFile()
  } catch {
    return false
  }
}

function isInsideAssets(relativeAssetPath) {
  return relativeAssetPath.startsWith('src/assets/') && !relativeAssetPath.includes('..')
}

function readPngInfo(buffer) {
  const pngSignature = '89504e470d0a1a0a'
  if (buffer.subarray(0, 8).toString('hex') !== pngSignature) return null
  const chunkType = buffer.subarray(12, 16).toString('ascii')
  if (chunkType !== 'IHDR') return null
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  }
}

function readWoff2Info(buffer) {
  return buffer.subarray(0, 4).toString('ascii') === 'wOF2'
}

function isSvg(buffer) {
  return buffer.subarray(0, Math.min(buffer.length, 300)).toString('utf8').includes('<svg')
}

function validateAssetShape(asset, index) {
  const diagnostics = []
  for (const field of REQUIRED_FIELDS) {
    if (!asset[field]) {
      diagnostics.push(diagnostic('error', 'missing-field', asset.path ?? `manifest.assets[${index}]`, `缺少字段 ${field}`))
    }
  }

  if (asset.path && !isInsideAssets(asset.path)) {
    diagnostics.push(diagnostic('error', 'invalid-path', asset.path, '资源路径必须位于 src/assets/ 下'))
  }

  if (asset.runtimeKeys && !Array.isArray(asset.runtimeKeys)) {
    diagnostics.push(diagnostic('error', 'invalid-runtime-keys', asset.path, 'runtimeKeys 必须是数组'))
  }

  if (asset.aliasOf && typeof asset.aliasOf !== 'string') {
    diagnostics.push(diagnostic('error', 'invalid-alias-of', asset.path, 'aliasOf 必须是资源 id 字符串'))
  }

  return diagnostics
}

async function validateAssetFile(asset) {
  const diagnostics = []
  if (!asset.path || !isInsideAssets(asset.path)) return diagnostics

  const fullPath = path.join(ROOT_DIR, asset.path)
  if (!(await fileExists(fullPath))) {
    const isTrackedNonRuntimeAsset = asset.lifecycle === 'planned' || asset.lifecycle === 'retired'
    diagnostics.push(diagnostic(
      isTrackedNonRuntimeAsset ? 'warning' : 'error',
      isTrackedNonRuntimeAsset ? `${asset.lifecycle}-missing-file` : 'missing-file',
      asset.path,
      isTrackedNonRuntimeAsset
        ? `manifest 保留的 ${asset.lifecycle} 资源尚未落盘`
        : 'manifest 中登记的资源文件不存在'
    ))
    return diagnostics
  }

  const buffer = await readFile(fullPath)
  const expected = asset.expected ?? {}

  if (expected.format === 'png') {
    const info = readPngInfo(buffer)
    if (!info) {
      diagnostics.push(diagnostic('error', 'invalid-png', asset.path, '不是有效 PNG 文件'))
      return diagnostics
    }
    if (expected.width && info.width !== expected.width) {
      diagnostics.push(diagnostic('error', 'png-width-mismatch', asset.path, `PNG 宽度应为 ${expected.width}，实际为 ${info.width}`))
    }
    if (expected.height && info.height !== expected.height) {
      diagnostics.push(diagnostic('error', 'png-height-mismatch', asset.path, `PNG 高度应为 ${expected.height}，实际为 ${info.height}`))
    }
    if (expected.frameWidth && info.width % expected.frameWidth !== 0) {
      diagnostics.push(diagnostic('error', 'frame-width-mismatch', asset.path, `宽度不能被 frameWidth=${expected.frameWidth} 整除`))
    }
    if (expected.frameHeight && info.height % expected.frameHeight !== 0) {
      diagnostics.push(diagnostic('error', 'frame-height-mismatch', asset.path, `高度不能被 frameHeight=${expected.frameHeight} 整除`))
    }
  }

  if (expected.format === 'woff2' && !readWoff2Info(buffer)) {
    diagnostics.push(diagnostic('error', 'invalid-woff2', asset.path, '不是有效 WOFF2 字体文件'))
  }

  if (expected.format === 'svg' && !isSvg(buffer)) {
    diagnostics.push(diagnostic('error', 'invalid-svg', asset.path, '不是有效 SVG 文件'))
  }

  return diagnostics
}

async function discoverManagedAssets(dirPath = ASSET_ROOT) {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const discovered = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    const rel = relativePath(fullPath)
    if (entry.isDirectory()) {
      const parts = rel.split('/')
      if (parts.some(part => IGNORED_DISCOVERY_SEGMENTS.has(part))) continue
      discovered.push(...await discoverManagedAssets(fullPath))
      continue
    }
    if (!entry.isFile()) continue
    if (IGNORED_DISCOVERY_FILES.has(rel)) continue
    if (!MANAGED_EXTENSIONS.has(path.extname(entry.name))) continue
    discovered.push(rel)
  }

  return discovered.sort()
}

function validateDuplicates(assets) {
  const diagnostics = []
  const seenIds = new Map()
  const seenPaths = new Map()
  const seenRuntimeKeys = new Map()

  for (const asset of assets) {
    if (asset.id) {
      if (seenIds.has(asset.id)) {
        diagnostics.push(diagnostic('error', 'duplicate-id', asset.path, `重复资源 id: ${asset.id}`))
      }
      seenIds.set(asset.id, asset.path)
    }
    if (asset.path) {
      const previous = seenPaths.get(asset.path)
      const isDeclaredAlias = previous && (
        asset.aliasOf === previous.id
        || previous.aliasOf === asset.id
      )
      if (previous && !isDeclaredAlias) {
        diagnostics.push(diagnostic('error', 'duplicate-path', asset.path, `重复资源路径，首次出现在 ${previous.id}`))
      }
      seenPaths.set(asset.path, { id: asset.id, aliasOf: asset.aliasOf })
    }
    for (const runtimeKey of asset.runtimeKeys ?? []) {
      if (seenRuntimeKeys.has(runtimeKey)) {
        diagnostics.push(diagnostic('error', 'duplicate-runtime-key', asset.path, `重复 runtime key: ${runtimeKey}`))
      }
      seenRuntimeKeys.set(runtimeKey, asset.path)
    }
  }

  return diagnostics
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  const assets = Array.isArray(manifest.assets) ? manifest.assets : []
  const diagnostics = []

  if (!Number.isInteger(manifest.version)) {
    diagnostics.push(diagnostic('error', 'invalid-version', relativePath(MANIFEST_PATH), 'manifest.version 必须是整数'))
  }

  diagnostics.push(...validateDuplicates(assets))

  for (let index = 0; index < assets.length; index++) {
    const asset = assets[index]
    diagnostics.push(...validateAssetShape(asset, index))
    diagnostics.push(...await validateAssetFile(asset))
  }

  const registeredPaths = new Set(assets.map(asset => asset.path).filter(Boolean))
  const discovered = await discoverManagedAssets()
  for (const assetPath of discovered) {
    if (!registeredPaths.has(assetPath)) {
      diagnostics.push(diagnostic('warning', 'unregistered-asset', assetPath, '资源文件未登记到 assetManifest.json'))
    }
  }

  const errorCount = diagnostics.filter(item => item.severity === 'error').length
  const warningCount = diagnostics.filter(item => item.severity === 'warning').length

  console.log('Asset manifest validation report')
  console.log(`Assets: ${assets.length}`)
  console.log(`Diagnostics: ${errorCount} errors, ${warningCount} warnings`)
  for (const item of diagnostics) {
    const prefix = item.severity === 'error' ? 'ERROR' : 'WARN '
    console.log(`  ${prefix} ${item.code} ${item.assetPath}: ${item.message}`)
  }

  if (errorCount > 0) {
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
