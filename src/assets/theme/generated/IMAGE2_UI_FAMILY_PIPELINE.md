# Image2 UI Family Pipeline

这套流程只解决一件事：

- 先生成一套统一风格的 UI 母版
- 再从母版稳定拆出按钮、卡片、提示框、公告栏
- 保证“样板页长什么样，组件也长什么样”

## 1. 先说硬限制

`gpt-image-2` 当前不支持透明背景直出。

因此这条产线不能依赖“第一次生图就是真透明 PNG”。

当前可执行流程是：

1. 先生成 `family board`
   - 一张非透明的 UI 风格母版板式图
   - 里面只展示组件家族，不做完整页面截图

2. 再生成单个组件图
   - 使用同一张 `family board` 作为参考图
   - 输出单个按钮 / 卡片 / 提示框 / 公告栏
   - 背景统一使用单色 matte key

3. 本地自动抠底
   - 把 matte key 颜色转成透明
   - 输出运行时 PNG

## 2. 为什么这样做

如果直接让模型分别生成：

- 页面样板
- 按钮
- 卡片
- 提示框

它们往往会在这些地方漂移：

1. 金线粗细不一致
2. 纸纹颗粒不一致
3. 角花语言变掉
4. 面板比例和圆角变掉
5. 按钮像一套，卡片像另一套

所以必须先固定“整套视觉语法”，再让每个组件都回看那张母版。

## 3. 统一风格约束

当前项目建议固定成这套：

1. 气质
   - 清冷、克制、轻描金、旧宣纸、青灰玉漆
   - 不要手游宝石质感
   - 不要高饱和发光

2. 颜色
   - 主底：旧纸白、浅雾青、灰青玉
   - 描边：暗金、旧铜金
   - 点缀：低饱和青绿

3. 结构
   - 文字安全区必须干净
   - 花纹只在边、角、端头
   - 中央不能有大徽章或重纹团

4. 输出规则
   - 页面母版不是运行时资源
   - 运行时只吃拆出来的单个组件 PNG

## 4. 资产家族

这批建议一次固定六类：

1. `ui-family-board`
   - 风格总板

2. `button-primary-master`
   - 主操作按钮

3. `button-secondary-master`
   - 次操作按钮

4. `card-story-master`
   - 演绎故事卡

5. `card-encounter-master`
   - 奇遇卡 / 事件卡

6. `panel-prompt-master`
   - 确认提示 / 奖励提示

7. `panel-notice-master`
   - 公告栏 / 横向通知条

## 5. 生成顺序

必须按顺序来：

1. 先跑 `ui-family-board`
2. 人工检查风格是否正确
3. 再用它作为参考图跑单组件
4. 单组件通过后，再本地抠底
5. 再接到 Vue 组件里验证

不要跳过第 2 步。

如果 `family board` 本身风格错了，后面整批都会错。

## 6. 组件拆分映射

当前项目可直接对应这些组件：

1. `button-primary-master`
   - `ThemeReferenceButton.vue`
   - `ThemeShowcaseButton.vue`

2. `card-story-master`
   - `ThemeStoryCard.vue`

3. `card-encounter-master`
   - `ThemeEncounterCard.vue`
   - `ThemeSectionCard.vue`

4. `panel-prompt-master`
   - `ThemeNoticePanel.vue` 的 `prompt` / `tooltip`

5. `panel-notice-master`
   - `ThemeNoticePanel.vue` 的 `announcement` / `notice`

## 7. 脚本

### 生成图

```bash
OPENAI_API_KEY=... npm run theme:image2 -- board
OPENAI_API_KEY=... npm run theme:image2 -- asset button-primary-master-v1
OPENAI_API_KEY=... npm run theme:image2 -- all-assets
```

### 抠底转透明

```bash
npm run theme:matte -- --input src/assets/theme/generated/matte/button-primary-master-v1-matte.png
```

## 8. 安全要求

不要把 API key 写进仓库。

只通过环境变量传入：

```bash
export OPENAI_API_KEY="..."
```

如果 key 曾经出现在聊天、截图或日志里，建议直接旋转。
