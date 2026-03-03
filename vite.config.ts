import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // GitHub Pages 部署时使用仓库名作为 base
  // 如果使用自定义域名，可以设置 BASE_URL 环境变量为 '/'
  const base = mode === 'production' ? '/woyuxiuxian/' : '/'

  return {
    base,
    build: {
      outDir: 'docs'
    },
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none'
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            comments: false
          }
        }
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
})
