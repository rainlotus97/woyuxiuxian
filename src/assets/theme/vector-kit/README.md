# Xianxia Vector UI Kit

这是一套面向当前项目的矢量 UI 壳素材。

统一风格：

- 象牙白中心
- 淡玉色内晕
- 暖金描边
- 云纹 / 如意纹边饰
- 中央留足动态文案安全区

## 资产清单

### Buttons

- `buttons/button-plaque-primary.svg`
  - 主操作按钮
  - 适合：打坐修炼、突破境界、进入剧情

- `buttons/button-plaque-secondary.svg`
  - 次操作按钮
  - 适合：查看角色、切换页签、次确认

- `buttons/button-plaque-muted.svg`
  - 弱化/禁用向按钮壳
  - 适合：未解锁、条件不足、冷却中

### Panels

- `panels/panel-prompt-shell.svg`
  - 主提示面板 / 确认弹层底板

- `panels/panel-tooltip-shell.svg`
  - 小提示框 / 奖励说明 / 悬浮信息

### Cards

- `cards/card-story-shell.svg`
  - 演绎故事卡 / 剧情文本卡

- `cards/card-encounter-shell.svg`
  - 奇遇卡 / 事件卡 / 探索发现卡

- `cards/card-section-shell.svg`
  - 通用栏目卡 / 模块入口卡 / 信息栏目壳

## 使用建议

1. 这些 SVG 都是透明背景。
2. 页面背景、光晕、hover、active、disabled 尽量用 CSS 做。
3. 按钮推荐按三段式接入；当前这套文件也可先作为完整 SVG 背景预览。
4. 面板和卡片可直接作为 `background-image`，但更推荐叠在代码底板之上。
