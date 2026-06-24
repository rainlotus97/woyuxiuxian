import type { StoryChapter } from '@/types/storyChapter'

export const chapter_distant_bells: StoryChapter = {
  id: 'vol2_ch031_distant_bells',
  title: '第三十一章·远方的钟声',
  volume: 2,
  order: 31,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'yunfeiran_injured', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1', type: 'narrative',
      text: '战后第七天，洛衍之能下床走动了。顾长惜带他去了剑宗后山一座无名的山顶——这座山不高，但视野开阔，能看到悬剑峰的全貌和远处层层叠叠的剑峰。山顶有一棵极老的歪脖子松树，松树下面一块天然平滑的石头刚好能坐两个人。这天是洛衍之几个月来第一次看到她脱下了所有防御性的法器——没有碧水珠在手心、没有水蓝短剑在旁边、暗纹法阵的长裙也换成了普通的素白便衣。她不再是天机阁的命定之人，也不是碧落宫的使者——只是一个人。他也不是剑宗的亲传弟子——只是一个人。两个人在那块石头上并肩坐着，看着远处的落日把七座剑峰染成了金色。',
      autoNext: 's2'
    },
    {
      id: 's2', type: 'dialog', speaker: '顾长惜',
      text: '以前我推演命运的时候，总觉得一切都有因果。你和我在青冥山的那次相遇——我一直以为是在因果之外的异常。但这几个月的战斗中我发现——你做的事——没有一件能用因果来解释。你不按推演的规律走。',
      emotion: '轻声',
      autoNext: 's3'
    },
    {
      id: 's3', type: 'dialog', speaker: '洛衍之', text: '什么意思？',
      autoNext: 's4'
    },
    {
      id: 's4', type: 'dialog', speaker: '顾长惜',
      text: '意思是——你不需要知道因果。你只需要相信你的剑。',
      narratorText: '她转过头看了他一眼。那个眼神里没有推演——她自己大概也是第一次不去推演接下来的一个小时会发生什么。',
      autoNext: 's5'
    },
    {
      id: 's5', type: 'narrative',
      text: '洛衍之笑了。他很少笑——笑起来并不好看，嘴角只牵出一圈极小的弧度。但顾长惜低头擦了擦眼角——不是因为悲伤。两个人各自突破了金丹期之后，在青木域重逢。他去参加剑魂渊的金丹试炼，她去继续调查天机阁与青木域的秘密交易。然后——一起去揭开无面尊者的面具。夜降临的时候，他们依然并肩坐在那块石头上。风把远处的钟声吹过来——那是剑宗大殿里在敲天奕钟，一种只在重大战事结束后才会鸣响的古老剑钟。',
      autoNext: 's6'
    },
    {
      id: 's6', type: 'choice',
      text: '钟声一下一下地撞在夜空里，像一颗巨大的心脏在缓慢而有力地跳动着。',
      choices: [
        {
          text: '——第三十一章·远方的钟声·完——',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 90 },
            { type: 'npc_favor', npcId: 'npc_guchangxi', value: 15 },
            { type: 'flag_set', flag: 'promised_to_reunite', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
