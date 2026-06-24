/**
 * ============================================================
 *  故事章节模板
 *  每个章节是一个普通的 TypeScript 文件，export 一个
 *  StoryChapter 对象。
 *
 *  字段说明：
 *  - id:          章节唯一 ID，格式 "vol{卷号}_ch{序号}_{英文标识}"
 *  - title:       章节标题，显示在 StoryCardPanel 顶部
 *  - volume:      所属卷号（1-5）
 *  - order:       卷内排序，数字越小越靠前
 *  - perspective: 视角 'male' | 'female' | 'both'
 *  - triggers:    触发条件数组，任一满足即触发
 *  - npcIntroductions: 本章完成后解锁的 NPC ID 列表
 *  - skillUnlocks: 本章完成后解锁的功法 ID 列表
 *  - sections:    段落数组，按顺序播放
 *
 *  段落类型：
 *  - narrative:   普通叙述文本
 *  - dialog:      NPC 对话（需提供 speaker）
 *  - choice:      玩家选择分支
 *  - battle_trigger: 触发战斗
 *  - section_end: 章节结束标记
 *
 *  触发条件类型：
 *  - realm:       境界触发，如 realm:"炼气" realmLevel:1
 *  - first_enter: 首次进入地图
 *  - sect_join:   加入宗门
 *  - encounter:   历练特定事件完成
 *  - auto:        总是可触发（用于手动章节）
 *  - choice_flag: 根据玩家选择的 flag 触发
 *
 *  选择效果类型：
 *  - npc_unlock:   解锁 NPC
 *  - npc_favor:    好感变化
 *  - npc_hatred:   仇恨变化
 *  - item_gain:    获得物品
 *  - realm_exp:    修为增加
 *  - gold:         灵石变化
 *  - flag_set:     设置世界标记
 *  - ending_point: 结局点数
 * ============================================================
 */
import type { StoryChapter } from '@/types/storyChapter'

// ============================
// 章节模板——复制此文件创建新章节
// ============================
export const chapter_template: StoryChapter = {
  // ---- 基础信息 ----
  id: 'volX_ch001_template',   // 唯一 ID
  title: '第X章·章节标题',      // 显示标题
  volume: 1,                   // 卷号
  order: 1,                    // 排序
  perspective: 'both',         // 视角

  // ---- 触发条件 ----
  triggers: [
    { type: 'realm', realm: '炼气', realmLevel: 3, order: 1 },
  ],

  // ---- 章节完成效果 ----
  npcIntroductions: ['npc_example'],    // 解锁的 NPC
  skillUnlocks: ['skill_example'],      // 解锁的功法
  // 可选：如无解锁可省略或留空数组

  // ---- 内容段落 ----
  sections: [
    // ============ 段落类型 1：叙述 ============
    {
      id: 's1',                            // 段落 ID，用于跳转
      type: 'narrative',                   // 叙述段落
      text: '玩家看到的正文。支持长段落，会自动分段展示。',  // 主要文本
      narratorText: '斜体的旁白文字，氛围渲染。',           // 旁白（可选）
      autoNext: 's2',                       // 自动前进到下一段（无选项时用）
    },

    // ============ 段落类型 2：对话 ============
    {
      id: 's2',
      type: 'dialog',                       // 对话段落
      speaker: '苏清鸢',                     // 说话人名称
      speakerTitle: '青云圣女',              // 说话人头衔（可选）
      emotion: '低声',                       // 语气描述（可选）
      text: '你需要记住这个世界真正的名字——囚笼。', // 对话内容
      autoNext: 's3',
    },

    // ============ 段落类型 3：选择 ============
    {
      id: 's3',
      type: 'choice',                       // 选择段落
      text: '你站在岔路口前，需要做出决定。',   // 情境描述
      choices: [
        {
          text: '"选项甲的文字"',              // 选项文本
          nextSectionId: 's4a',               // 跳转到哪个段落
          effects: [                           // 选择效果（可选）
            { type: 'npc_favor', npcId: 'npc_su_qingyuan', value: 10 },
            { type: 'realm_exp', value: 100 },
          ],
        },
        {
          text: '"选项乙的文字"',
          nextSectionId: 's4b',
          effects: [
            { type: 'npc_hatred', npcId: 'npc_su_qingyuan', value: 5 },
            { type: 'gold', value: 50 },
          ],
        },
      ],
    },

    // 选项后的分支段落
    {
      id: 's4a',
      type: 'narrative',
      text: '你选择了甲，事情向着好的方向发展……',
      autoNext: 's5',
    },
    {
      id: 's4b',
      type: 'narrative',
      text: '你选择了乙，情况变得复杂起来……',
      autoNext: 's5',
    },

    // ============ 段落类型 4：战斗触发 ============
    {
      id: 's5',
      type: 'battle_trigger',               // 触发战斗
      text: '一个黑影从树林中跃出，拦住了你的去路！',
      battleConfig: {
        enemyIds: ['enemy_wolf'],            // 敌人 ID 列表
        onWin: 's6_victory',                 // 胜利后跳转
        onLose: 's6_defeat',                 // 失败后跳转
        onFlee: 's6_flee',                   // 逃跑后跳转
      },
    },

    // 战斗结果分支
    {
      id: 's6_victory',
      type: 'narrative',
      text: '你击败了敌人，继续前进。',
      autoNext: 's7',
    },
    {
      id: 's6_defeat',
      type: 'narrative',
      text: '你被打倒了，但勉强爬了起来……',
      autoNext: 's7',
    },
    {
      id: 's6_flee',
      type: 'narrative',
      text: '你选择了退避，暂时绕开了这条路。',
      autoNext: 's7',
    },

    // ============ 段落类型 5：章节结束 ============
    {
      id: 's7',
      type: 'choice',
      text: '你望着远方的山脉，心中有了新的目标。',
      choices: [
        {
          text: '——本章完——',
          nextSectionId: 's_end',
          effects: [
            { type: 'npc_unlock', npcId: 'npc_example' },
            { type: 'realm_exp', value: 200 },
            { type: 'flag_set', flag: 'completed_ch1' },
          ],
        },
      ],
    },

    // 结束标记段落
    {
      id: 's_end',
      type: 'section_end',
      text: '',
      choices: [],
    },
  ],
}
