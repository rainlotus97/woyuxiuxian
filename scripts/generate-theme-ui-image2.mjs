import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const projectRoot = process.cwd()
const defaultManifestPath = path.join(projectRoot, 'src/assets/theme/generated/image2-icon-family-manifest.json')
const apiKey = process.env.IMAGE_API_KEY ?? process.env.OPENAI_API_KEY
const apiBaseUrl = (process.env.IMAGE_API_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '')
const defaultConcurrency = clampConcurrency(process.env.IMAGE_MAX_CONCURRENCY ?? 3)
const maxRetries = Math.max(1, Number.parseInt(process.env.IMAGE_MAX_RETRIES ?? '4', 10) || 4)
const chromaKeyScript = path.join(
  process.env.CODEX_HOME ?? path.join(process.env.HOME ?? '', '.codex'),
  'skills/.system/imagegen/scripts/remove_chroma_key.py'
)

function clampConcurrency(value) {
  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed)) return 3
  return Math.min(8, Math.max(1, parsed))
}

function readManifest(manifestPath) {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
}

function resolveProjectPath(relativePath) {
  return path.join(projectRoot, relativePath)
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function parseArgs(argv) {
  let manifestPath = defaultManifestPath
  let concurrency = defaultConcurrency
  const positional = []

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (token === '--manifest') {
      const next = argv[index + 1]
      if (!next) {
        throw new Error('Missing value for --manifest')
      }
      manifestPath = path.resolve(projectRoot, next)
      index += 1
      continue
    }

    if (token === '--concurrency') {
      const next = argv[index + 1]
      if (!next) {
        throw new Error('Missing value for --concurrency')
      }
      concurrency = clampConcurrency(next)
      index += 1
      continue
    }

    positional.push(token)
  }

  const [command = 'help', id] = positional
  return { command, id, manifestPath, concurrency }
}

async function parseResponseJson(response, errorPrefix) {
  if (!response.ok) {
    const errorText = await response.text()
    const error = new Error(`${errorPrefix}: ${response.status} ${errorText}`)
    error.status = response.status
    error.retryAfterMs = resolveRetryAfterMs(response.headers.get('retry-after'))
    throw error
  }

  return response.json()
}

function resolveRetryAfterMs(value) {
  if (!value) return 0
  const seconds = Number.parseFloat(value)
  if (Number.isFinite(seconds)) return Math.max(0, Math.round(seconds * 1000))
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : 0
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getRetryDelayMs(error, attempt) {
  const retryAfter = Number(error?.retryAfterMs) || 0
  const exponential = Math.min(30_000, 1_000 * 2 ** attempt)
  const jitter = Math.floor(Math.random() * 250)
  return Math.max(retryAfter, exponential + jitter)
}

async function extractImageBuffer(payload) {
  const entry = payload.data?.[0]
  if (!entry) {
    throw new Error('No image returned by API')
  }

  if (entry.b64_json) {
    return Buffer.from(entry.b64_json, 'base64')
  }

  if (entry.url) {
    const response = await fetch(entry.url)
    if (!response.ok) {
      throw new Error(`Failed to download generated image: ${response.status}`)
    }
    return Buffer.from(await response.arrayBuffer())
  }

  throw new Error('Unsupported image response format: expected b64_json or url')
}

async function requestGeneration({ model, quality, size, prompt }) {
  const response = await fetch(`${apiBaseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      size,
      quality,
      prompt
    })
  })

  return parseResponseJson(response, 'Image generation failed')
}

async function requestEdit({ model, quality, size, prompt, references }) {
  const formData = new FormData()
  formData.append('model', model)
  formData.append('size', size)
  formData.append('quality', quality)
  formData.append('prompt', prompt)

  for (const reference of references) {
    const filePath = resolveProjectPath(reference)
    if (!fs.existsSync(filePath)) {
      throw new Error(`Reference image not found: ${reference}`)
    }

    const buffer = fs.readFileSync(filePath)
    const blob = new Blob([buffer], { type: 'image/png' })
    formData.append('image[]', blob, path.basename(filePath))
  }

  const response = await fetch(`${apiBaseUrl}/images/edits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: formData
  })

  return parseResponseJson(response, 'Image edit failed')
}

function writeBinary(outputRelativePath, buffer) {
  const outputPath = resolveProjectPath(outputRelativePath)
  ensureParentDir(outputPath)
  fs.writeFileSync(outputPath, buffer)
  return outputPath
}

function writeTransparentAsset(inputRelativePath, outputRelativePath) {
  if (!fs.existsSync(chromaKeyScript)) {
    throw new Error(`Chroma-key helper not found: ${chromaKeyScript}`)
  }

  const inputPath = resolveProjectPath(inputRelativePath)
  const outputPath = resolveProjectPath(outputRelativePath)
  ensureParentDir(outputPath)
  execFileSync(process.env.PYTHON ?? 'python3', [
    chromaKeyScript,
    '--input', inputPath,
    '--out', outputPath,
    '--auto-key', 'border',
    '--soft-matte',
    '--transparent-threshold', '12',
    '--opaque-threshold', '220',
    '--despill'
  ], { stdio: 'inherit' })
  return outputPath
}

async function generateBoard(manifest) {
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable')
  }

  const result = await requestGeneration({
    model: manifest.model,
    quality: manifest.quality,
    size: manifest.board.size,
    prompt: manifest.board.prompt
  })

  const imageBuffer = await extractImageBuffer(result)
  const outputPath = writeBinary(manifest.board.output, imageBuffer)
  console.log(`Generated board: ${outputPath}`)
}

async function generateAsset(manifest, assetId) {
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable')
  }

  const asset = manifest.assets.find((entry) => entry.id === assetId)
  if (!asset) {
    throw new Error(`Unknown asset id: ${assetId}`)
  }

  const result = await requestEdit({
    model: manifest.model,
    quality: manifest.quality,
    size: asset.size,
    prompt: asset.prompt,
    references: asset.references
  })

  const imageBuffer = await extractImageBuffer(result)
  const outputPath = writeBinary(asset.output, imageBuffer)
  console.log(`Generated asset: ${outputPath}`)
  if (asset.transparentOutput) {
    const transparentPath = writeTransparentAsset(asset.output, asset.transparentOutput)
    console.log(`Generated transparent asset: ${transparentPath}`)
  }
}

async function generateAssetWithRetry(manifest, assetId) {
  let throttled = false
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      await generateAsset(manifest, assetId)
      return { throttled }
    } catch (error) {
      if (error?.status !== 429 || attempt >= maxRetries) throw error
      throttled = true
      const delay = getRetryDelayMs(error, attempt)
      console.warn(`429 for ${assetId}; retry ${attempt + 1}/${maxRetries} in ${delay}ms`)
      await wait(delay)
    }
  }

  return { throttled }
}

async function generateAllAssets(manifest, requestedConcurrency) {
  let cursor = 0
  let concurrency = clampConcurrency(requestedConcurrency)

  while (cursor < manifest.assets.length) {
    const batch = manifest.assets.slice(cursor, cursor + concurrency)
    const results = await Promise.all(batch.map(async asset => {
      const result = await generateAssetWithRetry(manifest, asset.id)
      return { assetId: asset.id, ...result }
    }))

    cursor += batch.length
    if (results.some(result => result.throttled)) {
      const nextConcurrency = Math.max(1, Math.floor(concurrency / 2))
      if (nextConcurrency < concurrency) {
        concurrency = nextConcurrency
        console.warn(`Image API throttled; reducing concurrency to ${concurrency}`)
      }
    }

    console.log(`Generated ${cursor}/${manifest.assets.length} assets (concurrency ${concurrency})`)
  }
}

function printHelp(manifest) {
  const assetIds = manifest.assets.map((asset) => `  ${asset.id}`).join('\n')
  console.log(`Usage:
  npm run theme:image2 -- [--manifest path/to/manifest.json] board
  npm run theme:image2 -- [--manifest path/to/manifest.json] asset <asset-id>
  npm run theme:image2 -- [--manifest path/to/manifest.json] [--concurrency 3] all-assets

Asset ids:
${assetIds}`)
}

async function main() {
  const { command, id, manifestPath, concurrency } = parseArgs(process.argv.slice(2))
  const manifest = readManifest(manifestPath)

  if (command === 'board') {
    await generateBoard(manifest)
    return
  }

  if (command === 'asset') {
    if (!id) {
      throw new Error('Missing asset id')
    }
    await generateAsset(manifest, id)
    return
  }

  if (command === 'all-assets') {
    await generateAllAssets(manifest, concurrency)
    return
  }

  printHelp(manifest)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
