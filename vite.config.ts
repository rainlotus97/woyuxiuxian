import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const useLocalXianxiaUI = mode === 'ui-local'
  const uiRoot = resolve(__dirname, '../web-main/xianxia-ui')

  return {
    // 使用自定义域名，base 设为 '/'
    base: '/',
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
        '@': resolve(__dirname, 'src'),
        ...(useLocalXianxiaUI ? {
          '@rainlotus97/ui/style.css': resolve(uiRoot, 'src/styles/global.css'),
          '@rainlotus97/ui': resolve(uiRoot, 'src/index.ts')
        } : {})
      }
    },
    ...(useLocalXianxiaUI ? {
      server: {
        fs: {
          allow: [resolve(__dirname), uiRoot]
        }
      }
    } : {})
  }
})
