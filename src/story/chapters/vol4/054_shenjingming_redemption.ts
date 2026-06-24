import type { StoryChapter } from '@/types/storyChapter'

export const chapter_shenjingming_redemption: StoryChapter = {
  id: 'vol4_ch054_054_shenjingming_redemption',
  title: '第五十四章·沈镜明的赎罪',
  volume: 4,
  order: 54,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'forgave_shenjingming', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '沈镜明自从顾长惜离开天机阁那天起，就不再真正属于任何一方。他循着一条从无人知晓的旧推演路径，追踪到了吞噬阵供能线的多个切断角度，并在能接近的范围内成功斩断了其中最关键的一段，给洛衍之手中的归尘剑赢来一次主动。无面尊者的反击几乎同时落下，一道天道法则剑光直取正在调度兵力的顾长惜。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '沈镜明在法则即将击中她的瞬间从侧方撞了上去，用自己体内最后的天机之印挡下了那道光。法则贯穿胸口，天机之印随之碎裂。他倒在顾长惜怀里，用最后的力气说：我终究不是你要的那个人。但至少，这一次，我没让你失望。他的白衣被法则灼痕和鲜血浸得面目全非，但嘴角那条弧线一直没有散去。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第五十四章·沈镜明的赎罪·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 262 },
            { type: 'flag_set', flag: '054_shenjingming_redemption', flagValue: true },
            { type: 'flag_set', flag: 'forgave_shenjingming', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
