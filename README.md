# 我欲修仙

一款文字修仙游戏，大道三千，只取一瓢。

## 技术栈

- **前端框架：** Vue 3 + TypeScript
- **构建工具：** Vite 7
- **样式：** TailwindCSS 3.x
- **状态管理：** Pinia
- **路由：** Vue Router 5
- **音效：** Tone.js（纯代码生成，无外部音频文件）
- **图标：** Lucide Vue Next

## 项目结构

```
woyu-xiuxian/
├── public/
│   ├── icons/          # PWA 图标
│   ├── manifest.json   # PWA 配置
│   └── CNAME           # 自定义域名
├── src/
│   ├── components/     # 组件
│   │   ├── common/     # 通用组件
│   │   ├── modal/      # 模态框
│   │   └── toast/      # Toast 提示
│   ├── composables/    # 组合式函数
│   │   ├── useAudio.ts # 音效系统
│   │   ├── useModal.ts # 模态框
│   │   └── useToast.ts # Toast
│   ├── views/          # 页面视图
│   │   ├── game/       # 游戏内页面
│   │   └── GameLayout.vue
│   ├── router/         # 路由配置
│   ├── app.css         # 全局样式
│   └── main.ts         # 入口文件
└── .github/workflows/  # GitHub Actions
```

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages。

- **生产地址：** https://xiuxian.rainlotus.cc
- **仓库：** https://github.com/rainlotus97/woyuxiuxian

推送代码到 `main` 分支会自动触发构建和部署。

## 音效系统

使用 Tone.js 生成所有音效，特点：
- 45+ 种音效（武器、战斗、修炼等）
- 14 种背景音乐（门派、四季、战斗等）
- 中国五声音阶风格
- 设置持久化到 localStorage

## PWA 支持

- iOS 全屏模式适配
- 安全区域处理
- 禁止双击放大
- 离线可用（待完善）

## License

MIT
