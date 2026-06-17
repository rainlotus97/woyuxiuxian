# 我欲修仙 TODO

> 约定：`[x]` 已完成，`[~]` 进行中，`[ ]` 未开始

## P0 当前优先级

- [~] 战斗页稳定性修复
  - 已处理 Phaser Scene 销毁后仍接收事件导致的空引用问题
  - 已清理 BattleView 中未回收的延时伤害回调
  - 已为 BattleScene / useBattleSession 增加 battle instance 级事件握手，修复首次进入战斗页需要刷新才恢复渲染的问题
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
  - 已支持召唤 effect runtime 建模与战场实体生成
  - 待补：无敌、更多敌人专属状态、冷却系统
- [~] 增加护盾、治疗、持续伤害、召唤物支持
  - 已支持单体治疗、群体治疗、自身护盾、毒/灼烧持续伤害
  - 已支持护盾吸收伤害与 DOT 回合开始扣血
  - 已支持 `demon_summon -> 深渊魔侍` 召唤链路，召唤物可进入战场、行动序列和目标选择
  - 待补：召唤物专属技能、退场规则、玩家侧召唤技接入
- [ ] 增加回放日志结构，支持剧情战和世界事件战共用
- [x] 增加战斗场景 arena 配置
  - 已建立 `src/game/battle/config/arenas.ts`
  - 已抽离 `battleArenaBuilder`、`battleSceneLayout`，避免舞台结构和站位逻辑堆进 `BattleScene`
- [x] 增加不同地图背景切换能力
  - 已通过 `battle:arena-theme` 事件让区域驱动战场主题
  - 已验证 `misty_forest` 与 `dark_cave` 进入战斗时主题切换稳定
- [~] 为 Boss、伙伴、灵兽预留独立站位模板
  - 已建立 `presentationRoles`、`battleFormation` 阵型分配层
  - 已支持 protagonist / companion / pet / summon / enemy / elite / boss 角色身份建模
  - 已让 `BattleScene` 消费 placement 结果，不再自己判断谁站哪
  - 已验证召唤物实体生成后可复用现有 summon 站位模板
  - 已接入 `petStore -> useBattleSession.createAllies()` 真实灵兽上阵链路
  - 待补：召唤物专用技能与更细粒度插槽、灵兽专属技能树
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

- [~] 拆分 `src/story/parser/index.ts`
  - `metadataParser.ts`
  - `contentParser.ts`
  - `effectParser.ts`
  - `triggerParser.ts`
  - `storyValidator.ts`
  - 已拆出 `shared.ts`、`prerequisiteParser.ts`，将节点/事件/trigger 表解析从单文件拆为模块
  - 已支持角色头信息、视角专属正文、内心独白、选项特有效果、trigger 表解析
- [~] 生成 story manifest，启动时先校验再加载
  - 已让 `volumeLoader` 在缓存前构建 manifest / diagnostics
  - 已把角色信息接入 cache，支线任务可通过 `storyCache.getCharacterInfo()` 获取角色名
  - 已让前置条件支持 AND / OR / 括号表达式，并在 `storyStore` 中按表达式执行
- [~] 补足剧情效果类型：
  - 已扩展 `EffectType` / `effectParser`，支持 NPC 解锁、伙伴解锁、宗门声望、地图开放、世界标记、剧情战、分支标记、变量设置
  - 已建立 `src/story/runtime/storyEffectRuntime.ts`，把剧情效果接到 `worldStore / sectStore / mapStore / companionStore`
  - 已让 `worldStore` 持久化 NPC 解锁与 world flag，并写回世界日志
  - 已让 `storyStore` 持久化 effect runtime 状态，避免剧情玩法触发在刷新后丢失
  - 已修复节点效果在 `makeChoice()` / `goToNode()` 间重复执行的问题，避免剧情效果双重结算
  - 已建立 `storyCharacterRegistry`，支持故事角色 ID / 角色名到 world npc / companion definition 的单点映射
  - 已让 `unlock_npc / unlock_companion` 优先消费 story 角色标识，而不是直接依赖底层 gameplay id
  - 已让 `favor_up / favor_down` 同步写入 world NPC relationship state，并产生日志
  - 已扩展 `hatred / debt / fear` 关系效果，并同步进入 world relationship state
  - 待补：更多角色映射与自动校验，关系值对世界自主行动的真实影响
- [~] 让 `GameplayEmbed` 和主游戏运行时共享统一玩法触发协议
  - 已在 `StoryPlayer` 挂载默认 gameplay handlers，并统一注册/反注册生命周期
  - 已建立 `storyBattleCatalog -> registerDefaultGameplayHandlers -> router.push('/game/battle')` 的剧情战模板链路
  - 已让 `story_battle` 效果生成标准 `GameplayTrigger`，由 `StoryPlayer` 经 `gameplayBridge` 统一消费
  - 已建立 `routeGameplaySession`，支持剧情战跨路由挂起、战斗结算写回、返回故事页后恢复分支
  - 已让 BattleView 识别 story session，并在胜利 / 败北 / 脱离后返回 `/game/story` 而不是固定跳回历练
  - 已支持 `胜利后跳转 / 败北后跳转 / 脱离后跳转` 结果分支协议，剧情战可按战果进入不同节点
  - 待补：非战斗玩法的真实界面与结果协议，更多复合玩法结果枚举

## P2 世界/NPC 系统

- [ ] 继续扩展 `src/types/world.ts`
  - 灵根
  - 天资
  - 身世
  - 性格权重
  - 命运标签
- [ ] 建立 NPC 关系网
- [~] 建立 NPC 关系网
  - 已建立 world NPC relationship state 的 story favor 同步入口
  - 已支持 favor -> bond 的基础映射（stranger / friend / companion / rival / enemy / lover）
  - 已支持 hatred / debt / fear 由剧情效果写入 relationship state
  - 待补：NPC 与 NPC 之间的关系边、关系驱动的自主行动与事件分发
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
  - 已打通灵兽对战斗上阵与挂机成长的基础影响链路

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
- [x] 修复首次进入战斗页的场景实例竞态
  - 已让 `battle:snapshot / battle:play-command / battle:damage-number / battle:ended` 绑定当前战斗实例
  - 已将 `scene-ready` 延后到可渲染首帧后发出，避免 `showDamage()` / `updateSnapshot()` 抢跑
  - 已通过浏览器实测验证首进战斗与首回合伤害表现恢复正常
- [x] 模块化战斗效果解析
  - 已接入单体/群体/自身目标选择
  - 已接入治疗、护盾、buff/debuff、持续伤害 runtime
  - 已验证 BattleView 命令栏可切换友方目标并正常结算
- [x] 建立战斗配置目录
  - 已迁移技能、技能树、敌人、区域/难度配置到 `src/game/battle/config/*`
- [x] 建立 arena 配置与区域主题切换
  - 已让战斗区域驱动舞台背景、色调、站位布局
  - 已验证首次进入战斗和指定区域直达战斗都稳定
- [x] 建立战斗角色身份与阵型分配层
  - 已将 Boss / 伙伴 / 灵兽 / 召唤物站位逻辑从 `BattleScene` 抽离
  - 已验证战斗页进入正常，未引入新的控制台异常
- [x] 建立真实召唤物 runtime 链路
  - 已新增 `src/game/battle/config/summons.ts` 与 summon runtime/unit factory
  - 已让 `battleRuntime` 支持 summon effect、实体生成、AI 使用与战斗日志写入
  - 已验证 `深渊之底 -> 恶魔领主 -> 深渊魔侍` 会真实进入行动序列与目标列表
- [x] 建立真实灵兽上阵基础链路
  - 已新增 `src/types/pet.ts` 与 `src/stores/petStore.ts`
  - 已让灵兽通过 `allyRosterFactory` 接入 battle runtime 主链
  - 已让 world tick / 战斗结算为已上阵灵兽提供经验与亲密度成长
- [x] 新增 roadmap 与 todo 文档，明确后续执行顺序
- [x] 打通剧情效果到主游戏运行时的第一阶段桥接
  - 已建立 `src/story/runtime/*` 作为 story -> gameplay 运行时桥接层
  - 已让剧情效果可解锁 NPC / 伙伴、修改宗门声望、开放地图、记录世界标记、挂起剧情战
  - 已让剧情战通过统一 `GameplayTrigger` 进入主战斗路由，而不是只停留在文案提示
  - 已修复剧情节点效果重复执行导致的双重结算风险
- [x] 打通剧情战结果回流故事节点的基础闭环
  - 已建立 `routeGameplaySession` 持久化剧情战会话与结果，支持跨路由恢复
  - 已让 `gameplayBridge` 为剧情战保留挂起执行，并在故事页恢复时消费真实战斗结果
  - 已让 BattleView / useBattleSession 在剧情战结束后写回 `victory / defeat / fled` 结果并返回故事页
- [x] 支持剧情战按结果分支回到不同故事节点
  - 已新增 gameplay outcome router，统一解析 `victory / defeat / fled / success / failure`
  - 已让 `GameplayTrigger` 支持结果节点映射，并在 story parser 中解析 `胜利后跳转 / 败北后跳转 / 脱离后跳转`
  - 已让 `gameplayBridge.onComplete()` 统一按结果决定继续节点，而不是只靠 `continueNodeId / failureNodeId`
- [x] 建立 story 角色到 world/companion 的映射层
  - 已新增 `storyCharacterRegistry`，统一维护 `Cxxx -> world npc / companion` 绑定
  - 已让 story effect runtime、通知文案、反馈浮层优先显示故事角色名而不是内部 gameplay id
  - 已更新剧情规则文档，允许 `解锁NPC / 解锁伙伴` 直接使用故事角色 ID 或角色名
- [x] 打通剧情好感到 world NPC 关系状态的基础同步
  - 已新增 `storyFavorSync`，统一处理 story favor 变化到 world relationship 的桥接
  - 已为 `worldStore` 增加 relationship state API，并写入世界日志
  - 已让剧情好感通知与反馈浮层统一显示故事角色名
- [x] 扩展剧情关系效果到 hatred / debt / fear
  - 已新增 `storyRelationshipSync`，统一处理 story relationship metric 到 world relationship 的桥接
  - 已支持 `仇恨/恩情/畏惧 ±N` 解析、通知与反馈浮层展示
  - 已更新剧情规则文档，明确这些关系效果会同步进入 world relationship state
