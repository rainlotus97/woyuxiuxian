# 正式资产包执行总表

本文件是新版故事视觉资产的正式执行台账。

目的：
- 把规划从“讨论态”推进到“可逐条落地的生产态”
- 明确新旧资产边界
- 统计正式资产缺口
- 按优先级逐条完成，不再继续扩展旧规格方图

适用范围：
- 仅针对 `src/story` 新版故事
- 旧版故事不兼容、不回填

配套索引：
- 资产与剧情 / 人物 / 宗门 / 场景对应关系，见 [STORY_ASSET_REGISTRY.md](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/STORY_ASSET_REGISTRY.md)

正式规格：
- 人物立绘：`9:16`
- 势力 / 场景 / 剧情背景：`16:9`

---

## 1. 当前资产状态

### 1.1 已有但仅作参考的旧规格资产

当前仓库内已经存在：

- 角色方图基准：`17` 名
- 单独头像：已有若干，但后续不再单独生成
- 势力方图参考：`6` 张
- 场景方图参考：`5` 张

这些资产的用途仅限于：
- 人物脸模参考
- 服装语言参考
- 氛围方向参考
- 世界观视觉基调参考

不再继续：
- 扩展新的 `1:1` 角色立绘
- 扩展新的 `1:1` 势力图
- 扩展新的 `1:1` 场景图
- 单独跑头像

### 1.2 新规格正式资产状态

当前新规格目录状态：

- `src/assets/story/characters/portraits-9x16/`：`4`
- `src/assets/story/concepts/factions-16x9/`：`8`
- `src/assets/story/concepts/scenes-16x9/`：`9`

结论：
- 正式资产包已经进入稳定落地阶段
- 第一轮基础包已可支撑章节背景与主角母版使用

---

## 2. 明确采用的人物基准

### 2.1 男主基准

唯一确认脸模基准：

- [luo-yanzhi-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/luo-yanzhi-v1.png)

规则：
- 后续所有洛衍之立绘、插画、时期变化都围绕此版本延展
- 可以换衣服、换身份、换场景、换气质强度
- 不允许换脸
- 不再使用此前被否定的成熟版方向

### 2.2 女主基准

当前保留的三时期参考基准：

- [gu-changxi-maiden-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/gu-changxi-maiden-v1.png)
- [gu-changxi-adolescent-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/gu-changxi-adolescent-v1.png)
- [gu-changxi-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/gu-changxi-v1.png)

规则：
- 女主必须保留同一人物识别逻辑
- 左眼只允许自然异色或低强度银色内环提示
- 不允许遮脸、盖眼、强法阵、强闪光
- 三个时期都要漂亮，但不能像三个不同的人

---

## 3. 第一批正式资产包范围

当前按“先可实装、再扩展”的原则，拆成四个批次。

### 3.1 批次 A：世界观基础背景

目标：
- 先把文字游戏最常用的门派/场景背景补起来
- 优先解决“门派和场景还没有真正实装”的问题

数量：`10` 张

势力图 `5` 张：
- 玄天剑宗
- 碧落宫
- 天机阁
- 长青谷
- 赤炎域

场景图 `5` 张：
- 望石镇铁匠铺
- 第三峰练剑台
- 天机阁观星殿
- 赤晶矿脉战场
- 战后落日海崖

### 3.2 批次 B：主角正式母版

目标：
- 建立后续所有剧情插画可复用的人物正式母版

数量：`4` 张

- 洛衍之青年主版 `9:16`
- 顾长惜少女版 `9:16`
- 顾长惜青少年版 `9:16`
- 顾长惜成年主版 `9:16`

说明：
- 男主当前优先保留青年正式期
- 男主成熟版暂不单独生成
- 女主三版必须先拉通一致性

### 3.3 批次 C：高价值补充背景

目标：
- 增强章节表现力和冲击力

数量：`6` 张

势力/场景补充：
- 白鹿秘境
- 剑魂渊
- 悬剑峰阵眼
- 碧落宫临海长廊
- 熔岩灾变前线
- 屠镇后废墟清晨

### 3.4 批次 D：主角与关键剧情插画

目标：
- 在母版稳定后，再做剧情插图

数量：暂定 `12` 张

- 男主关键节点 `4`
- 女主关键节点 `4`
- 双人关系节点 `4`

当前不在本轮优先执行，先等正式母版和背景体系稳定。

---

## 4. 当前正式缺口统计

按当前正式实装需求，第一轮建议目标总数为：`20` 张

拆分如下：

- 势力正式图：`5`
- 场景正式图：`5`
- 主角正式立绘：`4`
- 高冲击补充背景：`6`

当前已完成新规格正式图：`20`

当前缺口：`0`

---

## 5. 执行顺序

按用户当前优先级，执行顺序固定如下：

1. 先做 `16:9` 势力正式图
2. 再做 `16:9` 核心场景正式图
3. 再做男女主 `9:16` 正式母版
4. 再补高冲击补充背景
5. 最后再进入剧情插画拆分

原因：
- 目前最缺的是可直接用于剧情系统的背景
- 角色立绘需要建立在已经稳定的视觉世界里
- 剧情插图需要等待背景和人物母版共同稳定

---

## 6. 执行清单

说明：
- `[ ]` 未完成
- `[x]` 已完成
- `legacy` 仅表示已有参考，不算正式完成

### 6.1 势力正式图 `16:9`

- [x] 玄天剑宗
- [x] 玄天剑宗补充角度 / 加强版
- [x] 碧落宫
- [x] 天机阁
- [x] 长青谷
- [x] 赤炎域
- [x] 白鹿秘境

### 6.2 场景正式图 `16:9`

- [x] 望石镇铁匠铺
- [x] 第三峰练剑台
- [x] 天机阁观星殿
- [x] 赤晶矿脉战场
- [x] 战后落日海崖
- [x] 剑魂渊
- [x] 悬剑峰阵眼
- [x] 碧落宫临海长廊
- [x] 熔岩灾变前线
- [x] 屠镇后废墟清晨

### 6.3 主角正式立绘 `9:16`

- [x] 洛衍之青年主版
- [x] 顾长惜少女版
- [x] 顾长惜青少年版
- [x] 顾长惜成年主版

### 6.4 后续剧情插画

- [ ] 洛衍之个人关键节点组
- [ ] 顾长惜个人关键节点组
- [ ] 男女主关系节点组
- [ ] 配角高光节点组

---

## 7. 文件落位规则

正式新资产必须进入以下目录：

- 人物立绘：
  `src/assets/story/characters/portraits-9x16/`

- 势力图：
  `src/assets/story/concepts/factions-16x9/`

- 场景图：
  `src/assets/story/concepts/scenes-16x9/`

旧规格参考图保留在：

- `src/assets/story/characters/portraits/`
- `src/assets/story/concepts/factions/`
- `src/assets/story/concepts/scenes/`

如某旧稿明确废弃，则继续放在：

- `src/assets/story/characters/deprecated/`

---

## 8. 生产约束

### 8.1 人物

- 主角不同场景下必须保证同一人
- 必要时直接以已确认立绘为参考母版
- 不再单独生成头像
- 头像需求后续由立绘裁切解决

### 8.2 门派 / 场景

- 必须偏剧情背景，而不是宣传海报
- 需要保留适合文字 UI 的负空间
- 必要时加入前景栏杆、门洞、石阶、回廊、断墙等主角视角元素
- 在关键章节节点允许更强的视觉冲击力

### 8.3 命名

建议命名：
- `xuantian-sword-sect-16x9-v1.png`
- `biluo-palace-16x9-v1.png`
- `wangshi-town-forge-16x9-v1.png`
- `luo-yanzhi-main-9x16-v1.png`
- `gu-changxi-adult-9x16-v1.png`

---

## 9. 本轮执行目标

本轮已完成事项：

1. 建立正式资产包执行台账
2. 完成第一批 `16:9` 势力正式图
3. 完成第一批 `16:9` 场景正式图
4. 完成高价值补充背景
5. 完成主角正式母版与女主三期链条
6. 同步更新清单状态

---

## 10. 当前已入库正式资产

### 10.1 势力图 `16:9`

1. `src/assets/story/concepts/factions-16x9/xuantian-sword-sect-16x9-v1.png`
2. `src/assets/story/concepts/factions-16x9/biluo-palace-16x9-v1.png`
3. `src/assets/story/concepts/factions-16x9/biluo-palace-final-16x9-v1.png`
4. `src/assets/story/concepts/factions-16x9/tianji-pavilion-16x9-v1.png`
5. `src/assets/story/concepts/factions-16x9/changqing-valley-16x9-v1.png`
6. `src/assets/story/concepts/factions-16x9/red-flame-domain-16x9-v1.png`
7. `src/assets/story/concepts/factions-16x9/white-deer-realm-16x9-v1.png`

### 10.2 场景图 `16:9`

1. `src/assets/story/concepts/scenes-16x9/wangshi-town-forge-16x9-v1.png`
2. `src/assets/story/concepts/scenes-16x9/third-peak-training-ground-16x9-v1.png`
3. `src/assets/story/concepts/scenes-16x9/tianji-observatory-hall-16x9-v1.png`
4. `src/assets/story/concepts/scenes-16x9/red-crystal-mine-warfront-16x9-v1.png`
5. `src/assets/story/concepts/scenes-16x9/postwar-sunset-sea-cliff-16x9-v1.png`
6. `src/assets/story/concepts/scenes-16x9/xuanjian-peak-array-core-16x9-v1.png`
7. `src/assets/story/concepts/scenes-16x9/jianhun-abyss-16x9-v1.png`
8. `src/assets/story/concepts/scenes-16x9/biluo-palace-seaside-corridor-16x9-v1.png`
9. `src/assets/story/concepts/scenes-16x9/wangshi-town-ruins-dawn-16x9-v1.png`

### 10.3 主角立绘 `9:16`

1. `src/assets/story/characters/portraits-9x16/luo-yanzhi-main-9x16-v1.png`
2. `src/assets/story/characters/portraits-9x16/gu-changxi-adult-9x16-v1.png`
3. `src/assets/story/characters/portraits-9x16/gu-changxi-maiden-9x16-v1.png`
4. `src/assets/story/characters/portraits-9x16/gu-changxi-adolescent-9x16-v1.png`

---

## 11. 当前阶段结论

第一轮正式资产包已经落地，当前完成数：`20 / 20`

本阶段已完成：
- 势力正式图体系
- 核心章节场景正式图体系
- 男主正式母版
- 女主三期正式链条

下一阶段应转入：

1. 男女主关键剧情插图
2. 双人关系节点插图
3. 配角高光插图
4. 同角色多场景一致性扩展

---

## 12. 第二阶段执行清单：剧情插图

本阶段目标：
- 在已经稳定的主角母版和背景资产之上，开始制作真正服务剧情推进的插图
- 所有剧情插图优先验证“同一个角色在不同场景里仍然是同一个人”
- 先从男女主最关键的情绪与命运节点入手，再扩展到双人关系和配角高光

### 12.1 执行顺序

1. 先做男主个人关键节点
2. 再做女主个人关键节点
3. 再做男女主双人关系节点
4. 最后做配角高光节点

### 12.2 首批建议插图 `4` 张

本轮先做最能验证人物一致性的首批剧情图：

1. 洛衍之：铁匠铺炉火与半截断剑
2. 洛衍之：江溯死后独立持剑
3. 顾长惜：天机阁中被规训的早期记忆
4. 顾长惜：战后成为守护者的静场

理由：
- 这四张同时覆盖男女主早期与后期
- 既能测试人物年龄/气质变化，也能测试与正式母版的一致性
- 都可以直接复用当前已完成的场景母体

### 12.3 男女主关键剧情插图清单

#### 洛衍之

- [x] 铁匠铺炉火与半截断剑
- [ ] 山门初入剑宗
- [ ] 江溯收徒
- [ ] 剑意初成 / 出关后的第一次静场
- [x] 江溯死后独立持剑

#### 顾长惜

- [ ] 初登场使者形态
- [x] 天机阁中被规训的早期记忆
- [ ] 真相揭开 / 情绪崩裂节点
- [ ] 与司天命最后分离节点
- [x] 战后成为守护者的静场

### 12.4 双人关系节点

- [x] 初遇
- [x] 边境或青冥山重逢
- [x] 沙场相向
- [x] 深夜私会
- [x] 联手对敌
- [ ] 终局后的落日或分岔结局感画面

### 12.5 配角高光节点

- [x] 江溯：醉中收徒
- [x] 江溯：阵眼自爆前
- [x] 司天命：温和操控顾长惜
- [ ] 司天命：最后放她离开
- [x] 柳青霜：回眸含泪或赴死前一笑
- [x] 云斐然：带伤出战 / 紫岚出鞘
- [x] 沈镜明：白衣温柔控制感
- [ ] 沈镜明：替顾长惜挡下致命一击
- [ ] 苏晚棠：宫主庇护顾长惜
- [ ] 白鹿先生：白鹿秘境托付碎片
- [ ] 谢不语：荒途现身
- [ ] 温如许：危机中含泪回望 / 信任裂缝节点

### 12.6 剧情插图反模板约束

后续剧情插图必须避免“像把单人立绘摆进背景里”的模板感。

明确禁止反复出现：

- 女主总是站在画面右侧
- 女主总是视线斜向左下
- 人物只是站立，不参与具体动作
- 背景只是气氛板，没有事件
- 双人图只是两张立绘拼在一个场景里

后续执行强制要求：

1. 同一角色必须切换镜头语言
2. 必须混用正侧面、背身回望、低机位、远中近景
3. 双人图必须有明确动作关系：
   - 对视
   - 擦肩
   - 递物
   - 持剑护人
   - 转身离开
   - 并肩迎敌
4. 背景必须承担叙事信息：
   - 时间
   - 地点
   - 事件余波
   - 人物关系状态
5. 每张剧情图都要能用一句话概括“此刻发生了什么”

### 12.7 明暗层次约束

当前项目后续剧情图不得默认全部压成阴天、夜景、灰暗色调。

必须主动拉开：

1. 时间段层次
   - 清晨
   - 正午
   - 午后
   - 黄昏
   - 夜晚

2. 亮度层次
   - 明亮开阔场
   - 柔光静场
   - 常规叙事场
   - 压抑暗场

3. 使用原则
   - 悲剧情节不等于必须全黑
   - 柔和明亮也可以承载伤感、诀别、控制、牺牲
   - 连续几张插图不能都落在同一种阴冷暗调里
   - 每一批次至少要有一半是明显比前一批更亮的画面

### 12.6 已入库首批剧情插图

1. `src/assets/story/illustrations-16x9/luo-yanzhi-forge-broken-sword-16x9-v1.png`
2. `src/assets/story/illustrations-16x9/luo-yanzhi-alone-after-jiangsu-16x9-v1.png`
3. `src/assets/story/illustrations-16x9/gu-changxi-disciplined-memory-16x9-v1.png`
4. `src/assets/story/illustrations-16x9/gu-changxi-guardian-after-war-16x9-v1.png`
5. `src/assets/story/illustrations-16x9/luo-gu-first-meeting-16x9-v2.png`
6. `src/assets/story/illustrations-16x9/luo-gu-secret-night-meeting-16x9-v1.png`
7. `src/assets/story/illustrations-16x9/luo-gu-fight-together-16x9-v1.png`
8. `src/assets/story/illustrations-16x9/luo-gu-border-reunion-16x9-v1.png`
9. `src/assets/story/illustrations-16x9/luo-gu-opposing-battlefield-16x9-v1.png`
10. `src/assets/story/illustrations-16x9/jiang-su-drunken-disciple-16x9-v1.png`
11. `src/assets/story/illustrations-16x9/jiang-su-before-array-sacrifice-16x9-v1.png`
12. `src/assets/story/illustrations-16x9/si-tianming-gentle-control-16x9-v1.png`
13. `src/assets/story/illustrations-16x9/liu-qingshuang-last-look-16x9-v1.png`
14. `src/assets/story/illustrations-16x9/yun-feiran-wounded-charge-16x9-v1.png`
15. `src/assets/story/illustrations-16x9/shen-jingming-gentle-presence-16x9-v1.png`
