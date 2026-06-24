/**
 * 随机事件定义
 * 只保留与主线伏笔、修行节奏和世界关系有关的轻量事件池。
 */
import type { RandomEvent } from '@/types/randomEvent'

export const CULTIVATION_EVENTS: RandomEvent[] = [
  {
    id: 'cult_qi_deviation',
    type: 'cultivation',
    title: '真气逆行',
    description: '你运功到一半，经脉忽然微微刺痛。不是大祸，却足够提醒你，根基尚未稳固。',
    prompt: '修行不该只往上冲，某些时候，停下来自查反而更值钱。',
    storyTags: ['修行代价', '根基'],
    trigger: {
      probability: 0.012,
      cooldownTicks: 72,
      minimumIntervalTicks: 12,
      stageMax: 10
    },
    choices: [
      {
        text: '缓运灵气，慢慢归正',
        effects: [{ type: 'realm_exp', value: -35 }]
      },
      {
        text: '吞一枚常备丹药压下去',
        effects: [{ type: 'gold', value: -18 }, { type: 'realm_exp', value: -12 }]
      }
    ]
  },
  {
    id: 'cult_epiphany',
    type: 'cultivation',
    title: '灵光停驻',
    description: '一段平日略显晦涩的口诀，忽然在这一息间被你想通了半层。它不够让你立刻突破，却足够改变接下来几日的修行手感。',
    prompt: '这类顿悟应当是细水长流，而不是一口吞掉大段修为。',
    storyTags: ['顿悟', '功诀'],
    trigger: {
      probability: 0.011,
      cooldownTicks: 108,
      minimumIntervalTicks: 14
    },
    choices: [
      {
        text: '记下新悟，留待后面消化',
        effects: [{ type: 'realm_exp', value: 160 }]
      },
      {
        text: '借这一息反复推演',
        effects: [{ type: 'realm_exp', value: 220 }]
      }
    ]
  },
  {
    id: 'cult_heart_demon',
    type: 'cultivation',
    title: '杂念上涌',
    description: '修炼将定未定时，心底忽然翻起许多旧念。并不凶险，却像一层灰，蒙在你尚未澄净的心境上。',
    prompt: '在真正的大劫前，这种小小不顺更像前兆。',
    storyTags: ['心境', '伏线'],
    trigger: {
      probability: 0.009,
      cooldownTicks: 96,
      minimumIntervalTicks: 12,
      stageMin: 2
    },
    choices: [
      {
        text: '继续坐定，把杂念磨过去',
        effects: [{ type: 'realm_exp', value: 80 }]
      },
      {
        text: '暂时收功，明日再修',
        effects: [{ type: 'realm_exp', value: -20 }]
      }
    ]
  }
]

export const ADVENTURE_EVENTS: RandomEvent[] = [
  {
    id: 'adv_beast_attack',
    type: 'adventure',
    title: '林间异动',
    description: '山林深处枝叶猛地一颤，一头低阶妖兽试探着逼近。它更像一次小麻烦，而不是一场送奖励的机会。',
    prompt: '历练中总会有这种消耗性遭遇，它们本来就不该总是赚。',
    storyTags: ['历练消耗'],
    trigger: {
      probability: 0.013,
      cooldownTicks: 48,
      minimumIntervalTicks: 10,
      stageMax: 12
    },
    choices: [
      {
        text: '逼退它，继续赶路',
        effects: [{ type: 'realm_exp', value: 60 }]
      },
      {
        text: '绕路，不在这里浪费气力',
        effects: [{ type: 'realm_exp', value: -10 }]
      }
    ]
  },
  {
    id: 'adv_trap',
    type: 'adventure',
    title: '旧猎坑',
    description: '你踩塌一片浮土，半条腿陷进废弃猎坑。伤势不重，却足够让人狼狈。',
    prompt: '地图上的险处并不都写在面板上。',
    storyTags: ['地图感', '历练代价'],
    trigger: {
      probability: 0.009,
      cooldownTicks: 64,
      minimumIntervalTicks: 12,
      stageMax: 10
    },
    choices: [
      {
        text: '自己翻上来',
        effects: [{ type: 'realm_exp', value: -18 }]
      },
      {
        text: '停下来整理行装',
        effects: [{ type: 'gold', value: -8 }]
      }
    ]
  },
  {
    id: 'adv_stranger_help',
    type: 'adventure',
    title: '山道求援',
    description: '山道尽头，一名衣袍破碎的年轻修士扶着树站着，像是刚从追杀中逃出来。他抬头看你时，眼里还有没散去的警惕。',
    prompt: '这不是纯奖励节点，而是一段可能回头来找你的因果。',
    npcHint: '一名右肩见血的年轻修士',
    storyTags: ['story-encounter', '陌生修士', '恩怨', '山道'],
    trigger: {
      probability: 0.006,
      cooldownTicks: 168,
      minimumIntervalTicks: 20,
      stageMin: 5,
      stageMax: 12
    },
    choices: [
      {
        text: '帮他止血，送到岔路口',
        effects: [{ type: 'gold', value: -12 }],
        memory: [
          {
            type: 'debt',
            npcId: 'story_youth_right_shoulder',
            amount: 12,
            title: '山道留恩',
            text: '那名负伤修士记住了你的援手。此刻你还不知道他的来历。'
          },
          {
            type: 'unlock_npc',
            npcId: 'story_youth_right_shoulder',
            text: '山道上那名右肩见血的年轻修士，把你的样子记进了心里。'
          },
          {
            type: 'flag',
            flag: 'encounter:mountain_wounded_youth_helped',
            title: '山道旧影',
            text: '你在山道上救过一名不愿报出姓名的年轻修士。'
          },
          {
            type: 'journey_note',
            title: '山道留恩',
            text: '一段并不显眼的人情，被你留在了山道上。'
          }
        ]
      },
      {
        text: '不卷入追杀，转身离开',
        effects: [{ type: 'realm_exp', value: 15 }],
        memory: [
          {
            type: 'hatred',
            npcId: 'story_youth_right_shoulder',
            amount: 6,
            title: '错身而过',
            text: '那名年轻修士没有出声阻拦，但记住了你离开的背影。'
          },
          {
            type: 'unlock_npc',
            npcId: 'story_youth_right_shoulder',
            text: '你与一名负伤修士在山道上错身而过。'
          }
        ]
      }
    ]
  },
  {
    id: 'adv_old_enemy',
    type: 'adventure',
    title: '旧怨回身',
    description: '树影深处，有人低低笑了一声。对方不提姓名，只说是替旧账来认认人。',
    prompt: '不是所有仇怨都会立刻爆发，但它们会在该出现时回来。',
    storyTags: ['story-encounter', '旧怨', '回收'],
    trigger: {
      probability: 0.005,
      cooldownTicks: 210,
      minimumIntervalTicks: 24,
      stageMin: 9,
      conditions: [
        { type: 'hatred', npcId: 'story_youth_right_shoulder', min: 5 },
        { type: 'story_memory', npcId: 'story_youth_right_shoulder', min: 1 }
      ]
    },
    choices: [
      {
        text: '记住对方的话，先稳住局面',
        effects: [{ type: 'realm_exp', value: 45 }],
        memory: [
          {
            type: 'journey_note',
            title: '旧账未清',
            text: '你意识到，早前那段冷眼旁观并没有真的过去。'
          }
        ]
      },
      {
        text: '丢下二十灵石息事宁人',
        effects: [{ type: 'gold', value: -20 }]
      }
    ]
  }
]

export const SOCIAL_EVENTS: RandomEvent[] = [
  {
    id: 'social_mysterious_stranger',
    type: 'social',
    title: '伞下留书',
    description: '坊市雨棚外，一位持伞女子把一枚玉简轻轻放在你手边，只留下一句“别急着看，先记住我”。她始终压着伞沿，不让你看清面容。',
    prompt: '这类出场应当稀少，并且后续真的能回响。',
    npcHint: '一位持伞的素衣女子',
    storyTags: ['story-encounter', '匿名登场', '坊市', '伏笔'],
    trigger: {
      probability: 0.005,
      cooldownTicks: 220,
      minimumIntervalTicks: 24,
      stageMin: 6,
      stageMax: 18
    },
    choices: [
      {
        text: '收下玉简，先不拆开',
        effects: [{ type: 'flag_set', flag: 'met_mysterious_stranger' }],
        memory: [
          {
            type: 'favor',
            npcId: 'story_umbrella_woman',
            amount: 6,
            title: '伞下留名',
            text: '那位持伞女子似乎满意你的克制。她未留真名，只记住了你的神情。'
          },
          {
            type: 'unlock_npc',
            npcId: 'story_umbrella_woman',
            text: '一位不肯露面的持伞女子在坊市雨棚下与你有过短暂交集。'
          },
          {
            type: 'flag',
            flag: 'encounter:umbrella_woman_met',
            title: '持伞女子',
            text: '你在坊市雨棚边遇见过一位不肯露面的持伞女子。'
          }
        ]
      },
      {
        text: '记住她的声音，不接玉简',
        effects: [],
        memory: [
          {
            type: 'unlock_npc',
            npcId: 'story_umbrella_woman',
            text: '你没接玉简，但记住了那位女子的声音。'
          },
          {
            type: 'journey_note',
            title: '雨棚下的过客',
            text: '她没留下名字，只留下了一种不该被忽略的熟悉感。'
          }
        ]
      }
    ]
  },
  {
    id: 'social_roadside_stall',
    type: 'social',
    title: '路边旧摊',
    description: '坊市边角有个不起眼的小摊，摆着些旧物。摊主不夸东西，只说“识货再拿”。',
    prompt: '坊市更该像信息和气味的汇集处，而不是不断出宝。',
    storyTags: ['坊市', '日常'],
    trigger: {
      probability: 0.007,
      cooldownTicks: 96,
      minimumIntervalTicks: 14,
      stageMax: 16
    },
    choices: [
      {
        text: '花二十灵石买下旧玉佩',
        effects: [{ type: 'gold', value: -20 }, { type: 'flag_set', flag: 'bought_mysterious_jade' }]
      },
      {
        text: '先记住摊位位置',
        effects: []
      }
    ]
  },
  {
    id: 'social_crippled_elder',
    type: 'social',
    title: '街角落魄客',
    description: '街角一位披着旧毡的老人拦了你一下，开口却不求多，只说想借一口热食与几枚散钱。',
    prompt: '这种遭遇更像一次立场测试，而不该经常爆大奖。',
    storyTags: ['坊市', '人情'],
    trigger: {
      probability: 0.006,
      cooldownTicks: 128,
      minimumIntervalTicks: 18,
      stageMax: 14
    },
    choices: [
      {
        text: '留十枚灵石给他',
        effects: [{ type: 'gold', value: -10 }, { type: 'flag_set', flag: 'helped_crippled_elder' }]
      },
      {
        text: '点头致意，继续赶路',
        effects: []
      }
    ]
  },
  {
    id: 'npc_old_man_fight',
    type: 'social',
    title: '路见不平',
    description: '你听到巷口有短促兵刃声。一个白衣少年被几名黑衣人围住，对方出手狠辣，却又像不敢真把他当街杀死。',
    prompt: '这种人一旦出场，就该是后续剧情的种子，而不是一张奖励券。',
    npcHint: '一个白衣少年',
    storyTags: ['story-encounter', '白衣少年', '伏笔'],
    trigger: {
      probability: 0.005,
      cooldownTicks: 220,
      minimumIntervalTicks: 24,
      stageMin: 7,
      stageMax: 18
    },
    choices: [
      {
        text: '拔剑扰局，替他撕开一线',
        effects: [{ type: 'gold', value: -15 }],
        memory: [
          {
            type: 'debt',
            npcId: 'story_white_clothed_youth',
            amount: 15,
            title: '白衣少年的记忆',
            text: '那名白衣少年向你郑重一礼，像是把这一幕记得极深。'
          },
          {
            type: 'unlock_npc',
            npcId: 'story_white_clothed_youth',
            text: '一个白衣少年在混战中记住了你。你仍不知道他的真名。'
          },
          {
            type: 'flag',
            flag: 'encounter:white_clothed_youth_helped',
            title: '白衣旧影',
            text: '你曾在街巷里替一名白衣少年挡开过围杀。'
          }
        ]
      },
      {
        text: '记下他的样子，不贸然出手',
        effects: [],
        memory: [
          {
            type: 'unlock_npc',
            npcId: 'story_white_clothed_youth',
            text: '你没有出手，但记住了那张白衣少年的脸。'
          },
          {
            type: 'journey_note',
            title: '白衣少年',
            text: '你在街巷中见过一个不该被围困于此的人。'
          }
        ]
      }
    ]
  }
]

export const ALL_RANDOM_EVENTS: RandomEvent[] = [
  ...CULTIVATION_EVENTS,
  ...ADVENTURE_EVENTS,
  ...SOCIAL_EVENTS
]
