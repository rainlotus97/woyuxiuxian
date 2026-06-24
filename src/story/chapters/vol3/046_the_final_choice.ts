import type { StoryChapter } from '@/types/storyChapter'

export const chapter_the_final_choice: StoryChapter = {
  id: 'vol3_ch046_the_final_choice',
  title: '第四十六章·抉择',
  volume: 3,
  order: 46,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'into_the_abyss', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '无面尊者在核心阵眼最深处摘下青铜面具。那张脸普通得让人发冷，像任何一个在街上擦肩而过都不会被记住的人。他看着终于站到自己面前的洛衍之与顾长惜，说你们现在走的每一步，我三万年前都走过。最纯粹的初衷，照样会被时间熬成最疯狂的执念。随后他重新戴上面具，启动天道吞噬阵最终阶段，把五枚道种同时牵向归尘剑。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '归尘剑悬在五色洪流中央。握住它，洛衍之就能成为新的天道，能在一瞬间抹除一切自己认定的不公；放开它，道种回归各域，天道自行愈合，但裂痕永远不可能彻底消失。他站在剑前，脑海里闪过父亲、江溯、云斐然、柳青霜、白鹿先生，还有所有把最后一份东西留给他却从不替他做选择的人。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '顾长惜靠在穹顶边缘的石壁上，掌心被自己掐得见血，却一个字也没说。因为她知道这一刻谁都不能替他决定。洛衍之看了她一眼，那一眼像他们初见时清晨溪水上的微光一样轻，然后放开了归尘剑。谢不语也在这时对无面尊者说出沉默三万年后的第一句完整的话:明知不可为而为之是你教我的，但你没教我什么时候该停。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '五枚道种最终回归循环的那一刻，无面尊者没有被谁斩杀，而是自己放弃了自己，让残存意志化入天道洪流。顾长惜则在最后的法则震荡里清楚看见，洛衍之体内那道金之道种碎片从暴烈的战斗共振，转为一种只向内温养的涓流。像一枚不再以吞噬求强、而选择守护与做人 的剑种，在他丹田深处安静落下。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第四十六章·抉择·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 300 },
            { type: 'flag_set', flag: 'the_final_choice', flagValue: true },
            { type: 'flag_set', flag: 'released_sword', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
