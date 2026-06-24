import type { StoryChapter } from '@/types/storyChapter'
export const chapter_separate_paths: StoryChapter = {
  id: 'vol2_ch032_separate_paths',
  title: '第三十二章·分道扬镳',
  volume: 2,
  order: 32,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'promised_to_reunite', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '战后第七日，云斐然的伤势被裴忘渊以宗主级金系剑意稳住了最后的根基——但此生突破元婴的可能从此几乎不存在了。洛衍之回第三峰告别，江溯把《归尘》要义刻在酒壶底上塞进他手里：学会了回来。没学会也别死——你欠我的酒还没还够。他转身走出门外，没有回头。但在峰下转弯处，他用剑感感应到峰顶有一盏灯——江溯今夜没有喝酒，他点了一盏灯。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '顾长惜向西踏上前往青木域的路。她穿着碧落宫正式使袍，怀内最重的不是法器和符箓——是裴忘渊亲笔签署仅一句话的护盟信：此人是玄天剑宗之盟友，伤之者剑宗必举全宗之力追讨。她从储物袋深处找出那个空了的灵骨丹瓶，和盟信一起放进左襟贴心口袋。灵鸟飞过玄天域与青木域交界的苍茫山脊时，她回头看了一眼剑魂渊的方向。卷二终。', autoNext: 's3' },
    {
      id: 's3',
      type: 'choice',
      text: '——第二卷·沙场明月·终——',
      choices: [
        {
          text: '进入卷三',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 250 },
            { type: 'gold', value: 30 },
            { type: 'flag_set', flag: 'volume2_complete', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
