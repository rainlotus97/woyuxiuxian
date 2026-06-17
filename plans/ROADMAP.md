# 我欲修仙 Roadmap

## 目标

把当前项目逐步收敛成一套可持续迭代的 2D 修仙挂机冒险游戏框架，覆盖以下核心能力：

- 统一战斗系统：单一运行时、单一表现层、可扩展技能和敌人机制
- 统一游戏界面：从“应用页”收敛到“手游式游戏界面”
- 统一剧情系统：剧情文本、分支、玩法触发、角色支线、资料片扩展共用一套解析和运行链路
- 统一世界系统：时间推进、NPC 自主行动、宗门外交、地图扩张、事件日志共用一套世界状态
- 统一资源管线：背景、角色、特效、音频、剧情包、地图包、DLC 包有明确目录与替换规则

## 当前现状

### 已有基础

- `src/story/*` 已有剧情加载器、解析器、字典和剧情桥接
- `src/stores/mapStore.ts`、`src/stores/sectStore.ts`、`src/stores/worldStore.ts` 已有地图、宗门、世界时间雏形
- `src/game/*` 已接入 Phaser 战斗场景和新的 battle runtime
- `src/views/game/BattleView.vue` 已切到 Phaser 战斗页外壳
- `src/assets/battle/*` 已接入一批可替换的真实背景/角色占位资源

### 主要问题

- 战斗目前存在双轨实现：`src/stores/battleStore.ts` 与 `src/game/battle/battleRuntime.ts`
- 战斗页、剧情页、宗门页仍有较多页面逻辑聚集在单文件
- 剧情解析规则已经存在，但“运行时能力模型”还不够强，无法自然支撑 NPC 解锁、世界事件、玩法触发扩展
- 世界系统已有时间与日志，但还没和地图、宗门战争、NPC 命运线真正打通
- 资源接入刚起步，缺少统一的资产命名、替换、授权记录和导出标准

## 架构原则

### 模块边界

- `src/game/`
  负责实时表现层和局部运行时，不直接保存长期业务状态
- `src/stores/`
  负责长期状态、存档、跨页面数据同步
- `src/types/`
  负责纯数据定义、配置、工厂函数
- `src/story/`
  负责剧情资产加载、解析、编排、玩法桥接
- `src/components/`
  负责可复用 UI 组件，不承载复杂流程编排
- `src/views/`
  只负责页面装配，不吞并 runtime、store、组件职责

### 收敛原则

- 战斗只保留一条主链路：`battleRuntime -> scene events -> battle UI shell`
- 世界只保留一份时间推进源：`worldStore`
- 地图、宗门、NPC、剧情触发统一依赖世界状态，不各自维护平行时间线
- 新系统优先补目录和接口，不把多个系统揉进一个页面文件

## 分阶段路线

### Phase 1：战斗系统收口

目标：把当前战斗从“能跑”收敛到“可持续扩展”

- 废弃 `battleStore` 旧链路，明确迁移计划
- 抽离 `BattleView` 的 HUD、资源条、日志、结果面板、技能栏
- 完成 Battle runtime 的机制分层：
  - turn timeline
  - command resolver
  - damage formula
  - buff/debuff
  - summon/companion hooks
- 建立战斗配置目录：
  - `src/game/battle/config/skills`
  - `src/game/battle/config/enemies`
  - `src/game/battle/config/arenas`
- 建立战斗验收基线：
  - 手动战斗
  - 自动战斗
  - 技能消耗
  - 结算奖励
  - 页面切换/刷新稳定性

### Phase 2：游戏界面重构

目标：从表单页式 UI 收敛到手游式主界面

- 重构 `GameLayout`，建立统一主舞台、顶部资源区、底部导航、弹层系统
- 为各页面建立独立视觉语言，但保持控件规范一致
- 抽离共用组件：
  - resource header
  - scroll panel
  - game modal
  - card list
  - stat badge
  - item grid
- 建立亮色主风格，后续地图/场景再按区域切换背景主题

### Phase 3：剧情解析器与运行时升级

目标：剧情文件和游戏逻辑真正分离

- 保留现有 MD 规则，但升级 parser 输出结构
- 把 `StoryParser` 拆成：
  - metadata parser
  - content parser
  - effect parser
  - gameplay trigger parser
  - validation layer
- 为剧情运行时增加以下能力：
  - 节点条件
  - 状态标记
  - 好感/阵营/宗门/地图前置
  - NPC 解锁
  - 世界事件挂钩
  - DLC/资料片挂载
- 输出可验证的 story manifest，避免剧情改完后运行时才炸

### Phase 4：NPC 与世界演化系统

目标：实现“世界在玩家挂机时也继续变化”

- 完善 `worldStore` 的 tick 模型
- 建立 NPC 模板与运行态分离：
  - definition
  - runtime state
  - relationship graph
  - destiny flags
- 接入天资、灵根、性格、身世、宗门归属
- 增加世界事件池：
  - 天灾
  - 奇遇
  - 战斗
  - 突破
  - 陨落
  - 宗门命令
- 让主线剧情拥有保护轨，但支线与世界事件可以广泛扰动

### Phase 5：宗门、地图与势力战争

目标：让宗门和地图成为真实世界系统，而不是静态页面

- 统一地图区域、宗门领地、可探索节点的数据结构
- 宗门支持：
  - 友好度
  - 贡献度
  - 官阶
  - 设施
  - 外交
  - 战争
- 接入世界 tick 后的自主行为：
  - 宣战
  - 结盟
  - 守城
  - 俘虏事件
  - 宗门沦陷
- 支持玩家从弟子到宗主的成长路径

### Phase 6：养成与经济系统

目标：把挂机、种植、伙伴、坊市整合进统一成长闭环

- 背包/角色/功法界面整合为统一角色面板
- 建立装备、饰品、功法、丹药、材料、种子、灵兽道具的统一 item schema
- 坊市改为可扩展商店系统，支持动态库存、宗门专供、世界事件折扣
- 完善药园、灵兽、伙伴、食物、炼丹与战斗收益联动

### Phase 7：资产与资料片管线

目标：让项目可以长期加地图、加剧情、加角色，而不是返工旧逻辑

- 建立资产来源登记与授权记录
- 建立剧情包/地图包/资源包的目录约定
- 为资料片增加 manifest：
  - story pack
  - map pack
  - npc pack
  - battle pack
- 支持按包增量加载新地图、新宗门、新剧情、新敌人

## 每阶段完成定义

- 目录边界明确，新增能力不继续堆进单一页面
- 核心数据结构可以被测试或静态校验验证
- 至少有一条完整用户链路跑通
- 不依赖“刷新页面才能恢复”
- 文档同步更新：roadmap、todo、资产来源、关键模块说明

## 当前建议执行顺序

1. 收口战斗系统，淘汰旧 `battleStore` 主链路
2. 拆分 `BattleView` 和 `GameLayout` 的 UI 组件
3. 升级剧情 parser 和 story manifest 校验
4. 打通 `worldStore -> mapStore -> sectStore -> story triggers`
5. 再做坊市/背包/角色综合面板
