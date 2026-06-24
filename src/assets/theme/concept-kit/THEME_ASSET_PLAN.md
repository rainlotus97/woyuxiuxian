# Xianxia Theme Asset Plan

本目录用于沉淀“可挂载到页面里的主题资产”，而不是整页海报图。

目标：

- 统一修仙主题：背景、卡片、按钮、提示面板、剧情演绎层、图标、道具图标、导航图标
- 保证页面文字和数值是动态可替换的
- 让各模块都能复用同一套视觉语言，而不是每页单独拼风格

## 当前风格方向

- 参考风格：淡玉、暖金、象牙白、云雾山峦、轻工笔/半写意、手游仙侠主界
- 视觉关键词：
  - pale jade
  - ivory parchment
  - antique gold
  - misty mountains
  - refined xianxia mobile RPG

## 资产分层

### 1. 主题背景

用途：

- 主界背景
- 剧情演绎背景
- 模块页背景
- 战斗外层背景氛围

要求：

- 无文字
- 预留顶部 HUD、底部 Tab、中央卡片区安全留白
- 避免黑色硬边、强分隔线、过深对比

建议文件：

- `bg-main-9x16.png`
- `bg-story-overlay-9x16.png`
- `bg-module-light-9x16.png`

### 2. 卡片 / 面板底板

用途：

- 主界事件卡
- 剧情文本板
- 快捷操作卡
- 数值提示卡
- 宗门 / 地图 / 人物面板

要求：

- 无固定文案
- 保留装饰边角、卷云纹、玉边、金线，但中央文字区干净
- 支持不同高度裁切或 9-slice 复用

建议文件：

- `panel-story-wide.png`
- `panel-story-dialog.png`
- `panel-action-square.png`
- `panel-info-thin.png`
- `panel-tooltip.png`

### 3. 按钮与交互部件

用途：

- 主按钮、次按钮、危险按钮
- 剧情推进按钮
- 弹层确认/取消

要求：

- 无文字
- 可叠加任意文案
- 需要 hover / active / disabled 三种视觉方向说明

建议文件：

- `btn-primary-jade.png`
- `btn-secondary-ivory.png`
- `btn-danger-amber.png`
- `btn-arrow-story.png`

### 4. 图标系统

用途：

- 底部导航
- 主界功能入口
- 战斗状态
- 道具类别
- 功法 / 丹药 / 法宝 / 武器 / 装备

要求：

- 同一家族风格
- 轮廓清晰，小尺寸可读
- 优先做成“风格母版”，后续可代码替换 SVG/Lucide 映射

首批建议主题：

- 模块导航：
  - 修炼
  - 历练
  - 地图
  - 宗门
  - 伙伴
  - 功法
  - 背包
  - 坊市
- 物品类别：
  - 丹药
  - 灵草
  - 法宝
  - 武器
  - 护甲
  - 饰品
  - 卷轴
  - 灵石
- 剧情/状态：
  - 奇遇
  - 命线相关
  - 已演绎
  - 警示
  - 关系变化
  - 奖励获得

### 5. 剧情演绎界面皮肤

用途：

- 场景图 + 文本板叠层
- 对话框
- 角色现身牌
- 自动推进提示

要求：

- 不像阅读器
- 不常驻章名
- 不出现黑色横线/硬切割
- 以“游戏事件演出层”为主

建议文件：

- `story-overlay-shell.png`
- `story-dialog-shell.png`
- `story-debut-banner.png`
- `story-auto-advance-chip.png`

## 接入点

当前项目适合逐步挂载到这些位置：

- `src/game/theme/gameTheme.ts`
  - 统一注册主题 token、背景图、图标映射、剧情事件标签
- `src/components/game-ui/*`
  - 按钮、状态条、通用卡片
- `src/components/story/*`
  - 剧情浮层、对话板、提示条、事件卡
- `src/views/game/CultivationView.vue`
  - 主界背景、快捷操作卡、剧情事件卡
- `src/views/GameLayout.vue`
  - 顶部 HUD、底部导航

## 首批生成顺序

1. 主界背景母版
2. 剧情演绎底板母版
3. 通用卡片 / 按钮母版
4. 模块导航图标风格板
5. 道具类别图标风格板
6. 剧情状态 / 提示图标风格板

## 注意

- 页面文案、数值、剧情正文、按钮字样都必须由前端动态渲染
- 生成图只负责“壳”和“装饰”
- 不要把固定中文文案烤进素材
