import type { StoryChapter } from '@/types/storyChapter'

export const chapter_sitianming_choice: StoryChapter = {
  id: 'vol3_ch042_042_sitianming_choice',
  title: '第四十二章·司天命的抉择', volume: 3, order: 42, perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'sitianming_let_go', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '顾长惜扶着父母踏上密道。司天命靠在入口玉门轴边，体内本命灵气印记正在一寸寸反噬他的五脏——背叛无面尊者的代价是不可逆的人器自毁。他把密道密钥塞进她手里，连手也不敢久握——一个将死的推演者的临终心绪会顺着灵力渗入任何被他触碰过的介质，而他不要她收到最后的杂乱推演。他只说了一句：保护好自己。很多年后顾长惜重新拆开旧玉简里残存的声音时发现，背景有极轻极远的玉简壁崩碎声。司天命在天机阁覆灭前就已经知道天机阁必定会毁。他没有逃——他在等一个人走。', autoNext: 's_end' },
    { id: 's_end', type: 'choice', text: '——第四十二章·司天命的抉择·完——', choices: [{ text: '继续', nextSectionId: 's_end2',
      effects: [{ type: 'realm_exp', value: 226 }, { type: 'flag_set', flag: '042_sitianming_choice', flagValue: true }] }] },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
