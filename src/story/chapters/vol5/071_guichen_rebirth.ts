import type { StoryChapter } from '@/types/storyChapter'

export const chapter_guichen_rebirth: StoryChapter = {
  id: 'vol5_ch071_071_guichen_rebirth',
  title: '第七十一章·归尘与新生',
  volume: 5,
  order: 71,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'guichen_rebirth', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '洛衍之在悬剑峰顶把归尘剑诀前八式重新用手指刻在碎石地上。不是为了练剑，是为了确认每一式背后那个为他死过的人：破风是江溯教的，归尘是江溯留给他的，灭我是江溯用的。确认完毕之后，他在原地上刻了第九式的名字：新生。不是他创造出来的，而是当一个人不再想怎么用剑赢、只想怎么用剑让活着的人能继续活着之后，剑意自己从意识深处浮上来的。新生不是破坏，也不是杀人，而是在刚被烧焦的土地上，用手指划出第一条灌溉渠。渠是空的，水自己会找到路。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '他把这一丝剑感凝成传音，打入封在归尘渊底的归尘剑中。剑没有剑鸣，也没有灵爆，但渊面上悄然绽开了一圈极细极圆的水涟漪。涟漪中心一粒水因子短暂抬升，在晨光中闪了一下，像此生唯一的瞬间。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第七十一章·归尘与新生·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 313 },
            { type: 'flag_set', flag: '071_guichen_rebirth', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
