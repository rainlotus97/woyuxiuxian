/**
 * PWA 图标生成脚本
 * 使用 Sharp 从 SVG 生成各尺寸 PNG 图标
 *
 * 安装依赖: pnpm add -D sharp
 * 运行脚本: node scripts/generate-icons.js
 */

import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512]
const inputPath = join(__dirname, '../public/icons/icon.svg')
const outputDir = join(__dirname, '../public/icons')

async function generateIcons() {
  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  console.log('开始生成 PWA 图标...')

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}.png`)
    try {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(outputPath)
      console.log(`✓ 生成 ${size}x${size} 图标`)
    } catch (error) {
      console.error(`✗ 生成 ${size}x${size} 图标失败:`, error.message)
    }
  }

  console.log('图标生成完成!')
}

generateIcons().catch(console.error)
