import type { StoryChapter } from '@/types/storyChapter'
export const chapter_finale_prelude: StoryChapter = {
  id: 'vol5_ch076_finale_prelude', title: '第七十六章·终局序章', volume: 5, order: 76, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'abyss_return', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '五域所有在世的长老都聚在了归尘渊的崖边——裴忘渊、苏晚棠、钟离越、萧炎烈、石镇山，和那些在各域危难中从凡人变成领袖的面孔。九天界自有修道以来第一次有这么多人站在一起不是为了战事，而是为了静默地守候。没有人知道法则之门后面正在发生什么。顾长惜站在渊边，双手按在石栏上。她的天机之瞳一片空白——在这道门后连天机规则都不适用。她唯一能做的事就是在心里把那枚灵石环的触感重新摸了一遍——那个被他磨了两个多月的环内径微涩的边缘，和那天他在碧落宫天台把环搁在她手心时手指划过的温度。', autoNext: 's2' },
    { id: 's2', type: 'choice', text: '远处五域的地平线上各升起一道极淡的五色光——那是五枚道种在各自的位置上静静地等待着他们这次自愈之旅的最后一步。', choices: [
      { text: '——第七十六章·终局序章·完——', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 200 }, { type: 'flag_set', flag: 'finale_prelude', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
