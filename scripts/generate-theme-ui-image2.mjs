import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const defaultManifestPath = path.join(projectRoot, 'src/assets/theme/generated/image2-ui-family-manifest.json')
const apiKey = process.env.IMAGE_API_KEY ?? process.env.OPENAI_API_KEY
const apiBaseUrl = (process.env.IMAGE_API_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '')

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

    positional.push(token)
  }

  const [command = 'help', id] = positional
  return { command, id, manifestPath }
}

async function parseResponseJson(response, errorPrefix) {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`${errorPrefix}: ${response.status} ${errorText}`)
  }

  return response.json()
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
}

async function generateAllAssets(manifest) {
  for (const asset of manifest.assets) {
    await generateAsset(manifest, asset.id)
  }
}

function printHelp() {
  console.log(`Usage:
  npm run theme:image2 -- [--manifest path/to/manifest.json] board
  npm run theme:image2 -- [--manifest path/to/manifest.json] asset <asset-id>
  npm run theme:image2 -- [--manifest path/to/manifest.json] all-assets

Asset ids:
  button-primary-master-v1
  button-secondary-master-v1
  card-story-master-v1
  card-encounter-master-v1
  panel-prompt-master-v1
  panel-notice-master-v1`)
}

async function main() {
  const { command, id, manifestPath } = parseArgs(process.argv.slice(2))
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
    await generateAllAssets(manifest)
    return
  }

  printHelp()
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
