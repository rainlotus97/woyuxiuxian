import type { StoryChapter } from '@/types/storyChapter'
export const chapter_fissures: StoryChapter = {
  id: 'vol3_ch038_fissures', title: '第三十八章·裂痕', volume: 3, order: 38, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'zhongliyue_became_leader', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '钟离越就任后亲口复述了父亲二十年前的警告：五大仙域的道种在被人暗中连接。如果有人把所有五颗道种在同一时间连在一条线上——九天界会面临比陨道之战更可怕的危机。这句话和苏晚棠在碧落宫中拼出无面尊者的吞噬阵原理在同一个晚上拼合成了同一个可怕结论：无面尊者要用吞噬阵将所有五枚道种同时纳入一个共振频率，截断五行循环，以自己的意志重写九天界的法则本身。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '裴忘渊与苏晚棠在秘线传音中决定：立即在苍岳域中立方召集第一次五域联盟大会。三万年来五大仙宗领袖第一次在同一张石桌前相对而坐。会议濒临崩解时——无面尊者启动了吞噬阵第一波脉冲。五域同时地震。五枚道种同频共振。恐惧在那一瞬把所有猜疑逼到了墙角。联盟，在这天灾般的警告声中被迫成立。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '——第三十八章·裂痕·完——', choices: [
      { text: '继续', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 100 }, { type: 'flag_set', flag: 'five_domain_alliance', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
