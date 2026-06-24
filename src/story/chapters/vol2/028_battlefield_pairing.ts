import type { StoryChapter } from '@/types/storyChapter'
export const chapter_battlefield_pairing: StoryChapter = {
  id: 'vol2_ch028_battlefield_pairing',
  title: '第二十八章·沙场捉对',
  volume: 2,
  order: 28,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'tianji_war_declared', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '顾长惜被带进剑宗客院——院门口四个筑基剑修轮班值守。裴忘渊没有用刑，只是带着六位峰主走进客院在一张松木桌前坐下，左手虎口那道法则之伤在灯烛下以可感的频率跳动着。他问了一个问题：天机阁幕后是无面尊者，与陨道之战有关——为什么剑宗该信一个天机阁培养了十六年的命定之人？', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '她将三样证据逐一放在桌上——林听涛抽取道种的阵法拓印、苏晚棠用碧水蓝绸包了几十年的陨道之战日志残片、以及她自己反推出来的吞噬阵节点分布草图。草图的中心赫然指向悬剑峰——这座剑宗屹立了数万年的心脏。裴忘渊看完后沉默片刻，站起身：带她去东线防御，全程随行监视——直到她自己证明自己。负责监视的是云斐然。他在门口等了洛衍之半步低声问：你信她吗？洛衍之没有回答——但他的沉默比一切回答都响亮。', autoNext: 's3' },
    {
      id: 's3',
      type: 'choice',
      text: '——第二十八章·沙场捉对·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 80 },
            { type: 'flag_set', flag: 'proved_herself', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
