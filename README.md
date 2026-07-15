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
├── plans/
│   ├── ROADMAP.md      # 阶段路线和架构收敛原则
│   └── TODO.md         # 当前任务清单、优先级和已完成里程碑
├── scripts/
│   ├── validate-assets.mjs # 资源 manifest 校验
│   └── validate-story.mjs  # 剧情包 lint / validate
├── src/
│   ├── assets/         # 字体、战斗占位素材、故事包与资源 manifest
│   ├── character/      # 角色养成 runtime，例如装备/功法成长收益解析
│   ├── components/     # 可复用组件
│   │   ├── battle/     # 战斗 HUD / 命令栏 / 结算组件
│   │   ├── character/  # 人物、背包、功法合并面板
│   │   ├── game-ui/    # 主循环通用面板、按钮、进度条、弹层
│   │   ├── sect/       # 宗门主页、恢复、方略、设施等组件
│   │   ├── story/      # 剧情播放器组件
│   │   └── world/      # 世界简报、NPC/区域动态组件
│   ├── composables/    # 组合式业务入口与 UI/SFX helper
│   ├── game/           # Phaser 引擎、战斗 runtime、战斗配置与场景
│   │   ├── battle/     # 回合制战斗、技能、敌人、区域、阵型
│   │   ├── engine/     # PhaserHost、事件总线、Game 创建
│   │   └── scenes/     # Boot / Preload / BattleScene
│   ├── map/            # 地图区域准入、风险、遭遇和控制权 runtime
│   ├── sect/           # 宗门职位、战争、恢复、循环收益 runtime
│   ├── shop/           # 坊市商品目录、动态库存 runtime
│   ├── story/          # 剧情 parser、loader、runtime bridge 与类型
│   ├── stores/         # Pinia 状态层，协调 runtime 结果并持久化
│   ├── types/          # 跨模块基础类型和兼容导出
│   ├── views/          # 路由页面，尽量保持为薄组装层
│   ├── world/          # 世界/NPC/灾害/关系网 runtime
│   ├── router/         # 路由配置
│   ├── app.css         # 全局样式与设计 token
│   └── main.ts         # 入口文件
└── .github/workflows/  # GitHub Actions
```

### 模块边界

- `src/stores/*` 负责持久化与跨系统协调，不承载复杂规则。
- `src/*/runtime/*` 负责可复用规则解析，例如世界 tick、NPC 行动、宗门战争、地图遭遇和角色成长。
- `src/components/*` 负责可复用 UI，页面级 `views` 只做路由和面板组装。
- `src/story/parser` 与 `src/story/runtime` 分离：前者解析故事包，后者把故事效果接入游戏系统。
- 新增资源应先登记到 `src/assets/assetManifest.json`，再运行资源校验。

## Roadmap

- `plans/ROADMAP.md`：阶段性演进路线与架构收敛原则
- `plans/TODO.md`：当前执行清单与优先级

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

### xianxia-ui 联调

生产依赖固定为已发布的 `@xianxia/ui@1.0.0`。需要同时修改组件库时，在两个终端分别运行：

```bash
# 终端 1：使用组件库源码启动 Vite，支持 HMR
pnpm dev:ui
```

`dev:ui` 仅在 `ui-local` mode 下启用兄弟目录源码别名；普通 `pnpm dev`、生产构建和 CI 始终解析 npm 版本，不改变 `package.json` 或 pnpm 锁文件。组件包自身可在另一个终端运行 `pnpm --dir ../web-main/xianxia-ui dev:lib`，验证发布产物边界。

## 校验

```bash
# 校验剧情包结构、断链、角色映射和玩法跳转
npm run story:validate

# 校验资源 manifest、文件存在性、尺寸和来源字段
npm run assets:validate

# 校验核心 runtime：战斗、剧情 parser、世界异动、地图/宗门规则
npm run runtime:validate
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
