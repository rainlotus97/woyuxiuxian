import type { StoryChapter } from '@/types/storyChapter'

export const chapter_yinbofu_awakening: StoryChapter = {
  id: 'vol4_ch055_awakening',
  title: '第五十五章·阴伯符的觉醒',
  volume: 4,
  order: 55,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'yinbofu_fell', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '小队终于抵达核心阵眼穹顶。那是被五枚道种碎片光芒照得刺眼欲盲的巨圆空间。阴伯符半边身子枯槁如即将碎裂的干木，另半边却被黑色法则碎片不断侵蚀，像烧焦的青铜。他就站在吞噬法则圈的最外层，一人守住全部入口。洛衍之拔出归尘剑独对其锋。两人的对决持续超过一个时辰，不是招式比拼，而是意志与堕法则之间的角力。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '在气力将要耗尽的临界，归尘剑忽然发出一道不属于任何剑诀的微颤。那是江溯封在剑脊最里层的那缕酒气，在最关键的时刻像酒鬼拔塞一样震醒了剑锋的感知。剑尖于同一刻精准击中了阴伯符体内无数天道碎片残片之间那个极小、极不可能存在的共振薄弱处。三万年积压的天道碎片内反噬，当场爆发。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '阴伯符半边被腐蚀的身体深处，一只苍老而清澈、属于三万年前天道守护者的眼睛忽然睁开了。他低头看了看自己正在瓦解的双手，又看了看洛衍之。那张被法则反复烧毁又强行拼回去的脸上，浮现出一个极短暂、极不像堕魔者会有的表情。他哑着嗓子说：不要，不要成为下一个我。然后他用尽残躯最后的力气转过身，毅然走向天道碎片力场的正中央，引爆了自己体内所有残存的道种碎片。穹顶震裂，吞噬阵四个外围节点同时碎碎崩塌。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第五十五章·阴伯符的觉醒·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 265 },
            { type: 'flag_set', flag: 'awakening', flagValue: true },
            { type: 'flag_set', flag: 'yinbofu_fell', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
