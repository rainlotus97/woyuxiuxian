# 我欲修仙 TODO

> 约定：`[x]` 已完成，`[~]` 进行中，`[ ]` 未开始

## P0 当前优先级

- [~] 战斗页稳定性修复
  - 已处理 Phaser Scene 销毁后仍接收事件导致的空引用问题
  - 已清理 BattleView 中未回收的延时伤害回调
  - 待补回归验证：路由往返、自动战斗连续结算、胜利弹层后退出
- [~] 新战斗链路落地
  - 已建立 `src/game/battle/battleRuntime.ts`
  - 已建立 `src/game/scenes/BattleScene.ts`
  - 已接入本地背景/角色占位资源
  - 已确认主战斗页不再依赖旧 `battleStore`
  - 已将 `battleStore` 降级为 legacy compatibility store，避免误用旧链路
- [x] 拆分 `src/views/game/BattleView.vue`
  - 已拆出：
    - `components/battle/BattleTopHud.vue`
    - `components/battle/BattleCommandDock.vue`
    - `components/battle/BattleResultPanel.vue`
    - `components/battle/BattleLogDock.vue`
    - `components/battle/BattleActionOrder.vue`
    - `components/battle/SpiritFireBar.vue`
  - 已抽离 `composables/useBattleSession.ts`

## P1 战斗系统

- [x] 建立战斗配置目录，避免技能/敌人硬散落在 `types/*`
  - 已建立 `src/game/battle/config/{skills,skillTrees,enemies,areas}.ts`
  - 已将 `types/skill.ts`、`types/adventure.ts` 收口为类型、helper 与兼容导出层
  - 已让战斗会话直接消费 `src/game/battle/config`，后续扩展战斗内容不再继续堆进 `types/*`
- [~] 增加 buff/debuff runtime
  - 已拆出 `targeting`、`commandResolver`、`statusRuntime`、`runtimeTypes`
  - 已支持单体/群体/自身目标解析
  - 已支持 buff/debuff 状态附加与回合开始结算入口
  - 待补：召唤物、无敌、更多敌人专属状态、冷却系统
- [~] 增加护盾、治疗、持续伤害、召唤物支持
  - 已支持单体治疗、群体治疗、自身护盾、毒/灼烧持续伤害
  - 已支持护盾吸收伤害与 DOT 回合开始扣血
  - 待补：召唤物实体与专属站位/AI
- [ ] 增加回放日志结构，支持剧情战和世界事件战共用
- [x] 增加战斗场景 arena 配置
  - 已建立 `src/game/battle/config/arenas.ts`
  - 已抽离 `battleArenaBuilder`、`battleSceneLayout`，避免舞台结构和站位逻辑堆进 `BattleScene`
- [x] 增加不同地图背景切换能力
  - 已通过 `battle:arena-theme` 事件让区域驱动战场主题
  - 已验证 `misty_forest` 与 `dark_cave` 进入战斗时主题切换稳定
- [~] 为 Boss、伙伴、灵兽预留独立站位模板
  - 已建立 arena layout 层，支持 ally/enemy/boss 缩放与站位参数配置
  - 待补：伙伴/灵兽专用列队模板与召唤物插槽
- [x] 明确 `stores/battleStore.ts` 去留：
  - 页面主调用已迁移到 `useBattleSession + battleRuntime`
  - `battleStore` 当前仅保留为 legacy 兼容存根，不再承载主战斗逻辑

## P1 游戏界面

- [ ] 重构 `src/views/GameLayout.vue`
- [ ] 建立统一游戏 UI 设计 token
  - 色板
  - 阴影
  - 面板边框
  - 间距
  - 按钮状态
- [ ] 把“页面像应用”的问题逐页收口：
  - `AdventureView`
  - `MapView`
  - `SectView`
  - `StoryView`
  - `ShopView`
- [ ] 增加统一弹层/面板组件，替代页面内重复容器样式

## P1 剧情系统

- [ ] 拆分 `src/story/parser/index.ts`
  - `metadataParser.ts`
  - `contentParser.ts`
  - `effectParser.ts`
  - `triggerParser.ts`
  - `storyValidator.ts`
- [ ] 生成 story manifest，启动时先校验再加载
- [ ] 补足剧情效果类型：
  - NPC 解锁
  - 宗门声望
  - 地图开放
  - 世界标记
  - 战斗模板
  - 好感分支
- [ ] 让 `GameplayEmbed` 和主游戏运行时共享统一玩法触发协议

## P2 世界/NPC 系统

- [ ] 继续扩展 `src/types/world.ts`
  - 灵根
  - 天资
  - 身世
  - 性格权重
  - 命运标签
- [ ] 建立 NPC 关系网
- [ ] 实现 NPC 自主行动结果写回世界日志
- [ ] 实现重要 NPC 的“故事化事件记录”
- [ ] 增加主角挂机日志与奇遇日志
- [ ] 增加世界灾害和区域状态变化

## P2 宗门/地图系统

- [ ] 打通 `mapStore` 与 `sectStore` 的世界 tick 联动
- [ ] 为地图区域增加控制权和风险等级
- [ ] 为宗门增加外交、战争、俘虏、合并、沦陷状态
- [ ] 增加从弟子到宗主的晋升链
- [ ] 把宗门设施、药园、任务、战争收益整合到统一宗门循环

## P2 养成与经济

- [ ] 统一角色/背包/功法面板
- [ ] 为 item 建立统一 schema 和筛选视图
- [ ] 坊市支持分类、稀有度、宗门限定、动态库存
- [ ] 打通丹药、食物、装备、功法、灵兽对战斗和挂机的影响

## P3 资产与音频

- [~] 占位战斗背景与像素角色已接入
- [ ] 增加正式修仙风角色、Boss、妖兽素材表
- [ ] 建立战斗特效素材表与命名规则
- [ ] 替换 Tone.js 占位 BGM，改为真实音乐资源接入方案
- [ ] 为处决动画、技能动画、入场动画设计可替换帧序列协议
- [ ] 建立 `ASSET_SOURCES` 全项目登记机制

## P3 工程治理

- [ ] 为核心 runtime 增加最小测试：
  - battle runtime
  - story parser
  - world tick
  - map/sect unlock rules
- [ ] 为剧情包建立 lint/validate 命令
- [ ] 为资源包建立 manifest 校验
- [ ] 更新 README 的项目结构说明，反映 `src/game`、`src/story`、`plans/`

## 本次提交覆盖

- [x] 接入 Phaser 战斗基础目录
- [x] 接入战斗占位背景与像素角色资源
- [x] 调亮战斗视觉风格，补回命中特效
- [x] 修复战斗页切换时的 Phaser 空引用问题
- [x] 模块化战斗效果解析
  - 已接入单体/群体/自身目标选择
  - 已接入治疗、护盾、buff/debuff、持续伤害 runtime
  - 已验证 BattleView 命令栏可切换友方目标并正常结算
- [x] 建立战斗配置目录
  - 已迁移技能、技能树、敌人、区域/难度配置到 `src/game/battle/config/*`
- [x] 建立 arena 配置与区域主题切换
  - 已让战斗区域驱动舞台背景、色调、站位布局
  - 已验证首次进入战斗和指定区域直达战斗都稳定
- [x] 新增 roadmap 与 todo 文档，明确后续执行顺序
