import type { StoryChapter } from '@/types/storyChapter'

export const chapter_dao_devouring_array: StoryChapter = {
  id: 'vol3_ch039_dao_devouring_array',
  title: '第三十九章·天道吞噬阵',
  volume: 3,
  order: 39,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'five_domain_alliance', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '五域联盟刚刚被迫成立，洛衍之便深入赤炎域天火深渊最底层，终于亲眼看见了一座完整的吞噬阵核心。那阵眼由三块残火道种碎片与一整圈天机铭文法阵组成，外壁还被阴伯符亲手设下的堕天道法则层层包裹。任何灵识只要碰到边缘，就会立刻被反向侵蚀神智。洛衍之站在堕法则边界前，归尘剑脊里江溯封进去的那缕酒气竟在此时自己浮了上来，在他手背凝成一圈极淡的温热。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '他没有直接劈下去，因为一旦硬破，整个吞噬阵会立刻引发全域级反冲。于是他闭上眼，改用归尘式的剑感，一息一息去对齐阵眼的灵气频率。同步持续了将近一个时辰，法则渗透压把他每条经脉都逼得发颤，直到临界点上，他做了一件几乎疯掉的事，用自己的剑感与火之道种碎片发生了一次极短、极浅的共振。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '那次共振只维持不到一次呼吸，却足够把他的意识短暂拖进更高维度的视角。他看见九天界本质上像五枚同轴跳动的心脏，无面尊者正拿一把推演之刀，试图把五颗心脏每一次搏动都裁成自己的心音。若吞噬阵真正完成，这世间所有人的念头都会变成他意志的附属。洛衍之挣脱出来时，全身像被岩浆烫过一遍，左胸旧伤的肺脉再次渗血，但他还是把刚刚看到的一切，以金灵根剑修独有的剑识方式刻进识海，第一时间传给顾长惜和五域各方。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'choice',
      text: '——第三十九章·天道吞噬阵·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 217 },
            { type: 'flag_set', flag: 'understood_devouring_array', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
