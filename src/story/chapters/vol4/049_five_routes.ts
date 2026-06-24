import type { StoryChapter } from '@/types/storyChapter'

export const chapter_five_routes: StoryChapter = {
  id: 'vol4_ch049_routes',
  title: '第四十九章·五路进发',
  volume: 4,
  order: 49,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'entered_underground', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '五域联军出征那日，悬剑峰上空笼罩着一道前所未见的五色极光。那是天道吞噬阵进入最后聚合阶段时，五枚道种被强行从各自运转轨迹上拽向同一质点的恐怖景象。五路大军如五道劈开黑夜的剑锋，分别从五个方向攻向吞噬阵的外围节点：裴忘渊正面压制，苏晚棠水陆并进，钟离越以灵兽侦察，萧炎烈烈火断后，石镇山土阵固防。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '洛衍之和顾长惜率领的潜入小队一共九人，从悬剑峰后山那道古老地脉裂缝中鱼贯而入。谢不语在最后一个人即将没入裂缝时，从一棵松树下走了出来。他没解释自己为什么在这里，只摘下斗笠说了两个字：带路。顾长惜在与他错身而过的瞬间，用天机之瞳捕捉到他的铁剑锋上有一道极其古旧、被反复掩埋又重新刻画的刻痕。那刻痕的位置和深度，与她此前一段始终无法解开的因果线正好对应。她压住了想问的问题。如果一个沉默了三万年的人愿意在此刻开口，他一定有比回答更重要的事要站在这里承受。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第四十九章·五路进发·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 247 },
            { type: 'flag_set', flag: 'routes', flagValue: true },
            { type: 'flag_set', flag: 'entered_underground', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
