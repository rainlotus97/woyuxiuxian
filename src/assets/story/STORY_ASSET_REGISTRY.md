# Story Asset Registry

本文件用于给后续资产生成与代码接线提供统一索引。

目标：
- 明确每类资产当前已完成与仍缺失的部分
- 记录插画与故事、人物、宗门、场景之间的对应关系
- 给后续 agent 一个可直接引用的“按图追剧情”入口

约定：
- 正式人物立绘：`9:16`
- 正式宗门 / 场景 / 剧情插画：`16:9`
- 正式执行状态优先以 `FORMAL_ASSET_PACKAGE.md` 为准
- `ASSET_PLAN.md` 保留更大范围的历史规划与扩展方向

---

## 1. 当前正式缺口清单

### 1.1 主角正式立绘 `9:16`

已完成：
- 洛衍之：青年主版
- 顾长惜：少女版
- 顾长惜：青少年版
- 顾长惜：成年主版

仍缺：
- 洛衍之：幼年版
- 洛衍之：少年版
- 洛衍之：青年战场版
- 洛衍之：终局版
- 顾长惜：青年战场版
- 顾长惜：成熟主版
- 顾长惜：成熟终局版

已有旧规格参考但未完成正式 `9:16`：
- 洛衍之：少年版参考已存在
- 洛衍之：青年战场版参考已存在
- 洛衍之：成熟主版方向参考已存在
- 顾长惜：青年战场版旧链路参考已存在，但已归入 `deprecated`
- 顾长惜：成熟主版旧链路参考已存在，但已归入 `deprecated`

当前真正完全空缺的时期参考：
- 洛衍之：幼年版
- 洛衍之：终局版
- 顾长惜：成熟终局版

### 1.2 宗门 / 势力图 `16:9`

已完成：
- 玄天剑宗
- 玄天剑宗补充角度 / 加强版
- 碧落宫
- 天机阁
- 长青谷
- 赤炎域
- 白鹿秘境

仍缺：
- 无

### 1.3 场景图 `16:9`

已完成：
- 望石镇铁匠铺
- 第三峰练剑台
- 天机阁观星殿
- 赤晶矿脉战场
- 战后落日海崖
- 剑魂渊
- 悬剑峰阵眼
- 碧落宫临海长廊
- 屠镇后废墟清晨
- 熔岩灾变前线

仍缺：
- 无

### 1.4 剧情插画 `16:9`

洛衍之个人节点仍缺：
- 山门初入剑宗
- 剑意初成 / 出关后的第一次静场

顾长惜个人节点仍缺：
- 初登场使者形态
- 真相揭开 / 情绪崩裂节点
- 与司天命最后分离节点

双人关系节点仍缺：
- 终局后的落日或分岔结局感画面

配角高光节点仍缺：
- 司天命：最后放她离开
- 沈镜明：替顾长惜挡下致命一击
- 苏晚棠：宫主庇护顾长惜
- 白鹿先生：白鹿秘境托付碎片
- 谢不语：荒途现身
- 温如许：危机中含泪回望 / 信任裂缝节点

---

## 1.5 当前已完成剧情插画速查索引

说明：
- 本节用于给后续代码接线或章节配置提供“文件 -> 故事节点 -> 角色 / 宗门 / 场景”的快速查询入口
- 详细说明以本文件后续单条记录为准；本节只做高密度索引

### 洛衍之个人

- `luo-yanzhi-forge-broken-sword-16x9-v1.png`
  - 故事：铁匠铺炉火与半截断剑
  - 角色：洛衍之
  - 宗门 / 势力：无
  - 场景：望石镇铁匠铺

- `jiang-su-drunken-disciple-16x9-v1.png`
  - 故事：江溯醉中收徒
  - 角色：洛衍之、江溯
  - 宗门 / 势力：玄天剑宗
  - 场景：第三峰练剑台 / 旧院系空间

- `luo-yanzhi-alone-after-jiangsu-16x9-v1.png`
  - 故事：江溯死后独立持剑
  - 角色：洛衍之
  - 宗门 / 势力：玄天剑宗
  - 场景：悬剑峰阵眼 / 终战前后空间

### 顾长惜个人

- `gu-changxi-disciplined-memory-16x9-v1.png`
  - 故事：天机阁中被规训的早期记忆
  - 角色：顾长惜、司天命
  - 宗门 / 势力：天机阁
  - 场景：天机阁观星殿

- `gu-changxi-guardian-after-war-16x9-v1.png`
  - 故事：战后成为守护者的静场
  - 角色：顾长惜
  - 宗门 / 势力：碧落宫
  - 场景：碧落宫临海长廊 / 海崖母题

### 双人关系

- `luo-gu-first-meeting-16x9-v2.png`
  - 故事：初遇
  - 角色：洛衍之、顾长惜
  - 宗门 / 势力：玄天剑宗 / 天机阁前史关联
  - 场景：初期边地 / 外部遭遇空间

- `luo-gu-border-reunion-16x9-v1.png`
  - 故事：边境或青冥山重逢
  - 角色：洛衍之、顾长惜
  - 宗门 / 势力：玄天剑宗、碧落宫
  - 场景：边地山路 / 战后过渡空间

- `luo-gu-opposing-battlefield-16x9-v1.png`
  - 故事：沙场相向
  - 角色：洛衍之、顾长惜
  - 宗门 / 势力：玄天剑宗、碧落宫、赤炎域战场关联
  - 场景：战场废墟

- `luo-gu-secret-night-meeting-16x9-v1.png`
  - 故事：深夜私会
  - 角色：洛衍之、顾长惜
  - 宗门 / 势力：玄天剑宗、碧落宫
  - 场景：碧落宫临海长廊 / 夜色私会空间

- `luo-gu-fight-together-16x9-v1.png`
  - 故事：联手对敌
  - 角色：洛衍之、顾长惜
  - 宗门 / 势力：玄天剑宗、碧落宫
  - 场景：赤晶矿脉 / 终局战区系空间

### 配角高光

- `jiang-su-before-array-sacrifice-16x9-v1.png`
  - 故事：江溯阵眼自爆前
  - 角色：江溯
  - 宗门 / 势力：玄天剑宗
  - 场景：悬剑峰阵眼

- `si-tianming-gentle-control-16x9-v1.png`
  - 故事：司天命温和操控顾长惜
  - 角色：司天命、顾长惜
  - 宗门 / 势力：天机阁
  - 场景：天机阁观星殿

- `shen-jingming-gentle-presence-16x9-v1.png`
  - 故事：沈镜明白衣温柔控制感
  - 角色：沈镜明、顾长惜
  - 宗门 / 势力：天机阁
  - 场景：天机阁观星殿

- `yun-feiran-wounded-charge-16x9-v1.png`
  - 故事：云斐然带伤出战
  - 角色：云斐然、洛衍之
  - 宗门 / 势力：玄天剑宗
  - 场景：悬剑峰阵眼 / 赤晶矿脉辅助战场

- `liu-qingshuang-last-look-16x9-v1.png`
  - 故事：柳青霜回眸含泪 / 赴死前一笑
  - 角色：柳青霜、洛衍之
  - 宗门 / 势力：玄天剑宗
  - 场景：悬剑峰阵眼

---

## 2. 上个会话补拷入项目的三张插画

这三张图由会话 `019edfe2-b683-7cd3-8d54-322070aaea78` 在后段生成并拷入项目，当前已正式纳入剧情插图清单。

### 2.1 沈镜明：白衣温柔控制感

资产文件：
- [shen-jingming-gentle-presence-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/illustrations-16x9/shen-jingming-gentle-presence-16x9-v1.png)

建议故事锚点：
- `vol1_ch008_girl_in_tianji`
- 对应顾长惜在天机阁走廊被沈镜明拦下的早期控制感场面

一句话概括：
- 他看起来温润无害，但已经在用体贴、路线阻断和药物关心把顾长惜困进自己的理解方式里。

主关联人物：
- [shen-jingming-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/shen-jingming-v1.png)
- [gu-changxi-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/gu-changxi-v1.png)

主关联宗门 / 势力：
- [tianji-pavilion-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/factions-16x9/tianji-pavilion-16x9-v1.png)

主关联场景：
- [tianji-observatory-hall-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/scenes-16x9/tianji-observatory-hall-16x9-v1.png)

使用备注：
- 这是“早期温柔控制感”插图，不是最终赎罪节点图
- 后续若补“替顾长惜挡下致命一击”，应另做终局版，不与本图混用

### 2.2 云斐然：带伤出战 / 紫岚出鞘

资产文件：
- [yun-feiran-wounded-charge-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/illustrations-16x9/yun-feiran-wounded-charge-16x9-v1.png)

建议故事锚点：
- `vol4_ch052_yunfeiran_death`
- 对应云斐然重伤未愈仍强行走出重症房、以残身迎战的后段战场戏

一句话概括：
- 他明知此去几乎必死，仍带着旧伤和最后一点傲气向阵壁前线冲过去，把自己最后一次像样的出手留给洛衍之和剑宗。

主关联人物：
- [yun-feiran-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/yun-feiran-v1.png)
- [luo-yanzhi-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/luo-yanzhi-v1.png)

主关联宗门 / 势力：
- [xuantian-sword-sect-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/factions-16x9/xuantian-sword-sect-16x9-v1.png)

主关联场景：
- [xuanjian-peak-array-core-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/scenes-16x9/xuanjian-peak-array-core-16x9-v1.png)

辅助场景参考：
- [red-crystal-mine-warfront-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/scenes-16x9/red-crystal-mine-warfront-16x9-v1.png)

使用备注：
- 本图适合表现“末期守阵带伤赴死”，不是卷一边境巡查时期的较轻伤版本
- 若后续需要卷一或卷二的年轻版云斐然战场图，应单独拆分

### 2.3 柳青霜：回眸含泪 / 赴死前一笑

资产文件：
- [liu-qingshuang-last-look-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/illustrations-16x9/liu-qingshuang-last-look-16x9-v1.png)

建议故事锚点：
- `vol4_ch051_liuqingshuang_sword`
- 对应柳青霜走向“牺牲”法则前的最后一眼，或剑光炸开前那极轻极短的一次笑

一句话概括：
- 她终于从那个总站在洛衍之左后方的位置上走出来，在真正被看见之前先把自己交给了那一剑。

主关联人物：
- [liu-qingshuang-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/liu-qingshuang-v1.png)
- [luo-yanzhi-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/luo-yanzhi-v1.png)
- [gu-changxi-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/characters/portraits/gu-changxi-v1.png)

主关联宗门 / 势力：
- [xuantian-sword-sect-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/factions-16x9/xuantian-sword-sect-16x9-v1.png)

主关联场景：
- [xuanjian-peak-array-core-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/scenes-16x9/xuanjian-peak-array-core-16x9-v1.png)

辅助场景参考：
- [jianhun-abyss-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/scenes-16x9/jianhun-abyss-16x9-v1.png)

使用备注：
- 本图是“最后一眼 / 最后一笑”型情绪图
- 如果后续要做“霜天尽葬真正发动瞬间”，应另补动作更强、法则冲撞更明显的终战图

---

## 2.4 上个会话补回的宗门加强版

### 玄天剑宗：叙事型补充主景 / 冷晨版

资产文件：
- [xuantian-sword-sect-alt-16x9-v2.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/factions-16x9/xuantian-sword-sect-alt-16x9-v2.png)

来源说明：
- 来自会话 `019edfe2-b683-7cd3-8d54-322070aaea78` 中断后遗留的可用成图
- 原始生成目标就是“更像章节 CG / 对话背景，而不是宏大概念海报”的玄天剑宗新版横图

一句话概括：
- 这是更收敛、适合章节标题和对白承载的玄天剑宗主景，保留悬剑峰压迫感，但弱化了海报化奇观。

主关联宗门 / 势力：
- [xuantian-sword-sect-16x9-v1.png](/Users/rainlotus/Desktop/web-main/woyuxiuxian/src/assets/story/concepts/factions-16x9/xuantian-sword-sect-16x9-v1.png)

适合用途：
- 剑宗章节开篇背景
- 洛衍之初入山门前后的宗门主景
- 江溯、云斐然、柳青霜相关章节的常驻背景替换

使用备注：
- `v1` 更偏世界观设定图
- 本图更偏叙事型横场景，可视作玄天剑宗“补充角度 / 加强版”正式完成项

---

## 3. 后续生图建议顺序

在当前缺口里，优先建议：

1. 熔岩灾变前线
2. 洛衍之：山门初入剑宗
3. 顾长惜：初登场使者形态
4. 双人：终局后的落日或分岔结局感画面
5. 沈镜明：替顾长惜挡下致命一击

排序理由：
- 先补唯一缺失的大场景，方便后续插图共享背景母体
- 再补男女主各一张强识别剧情图，继续拉稳主角一致性
- 然后补一个双人终局图和一个配角终局图，拉开情感层次

---

## 4. 后续生图约束摘要

人物：
- 主角不同场景必须像同一个人
- 必要时直接引用当前已定稿立绘作为参考母版
- 不允许单纯靠换衣服制造“像新角色”的错觉

宗门 / 场景：
- 更偏文字游戏背景，而不是海报
- 保留可放正文的负空间
- 允许门洞、石阶、长廊、阵眼、残垣等主角视角元素

剧情插图：
- 不能继续套模板式单人站桩
- 必须有动作关系、明确时刻、可一句话概括的事件
- 连续批次必须主动拉开明暗与时间段，不要全做成灰暗夜景
