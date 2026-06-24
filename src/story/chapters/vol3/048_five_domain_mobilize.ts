import type { StoryChapter } from '@/types/storyChapter'

export const chapter_five_domain_mobilize: StoryChapter = {
  id: 'vol3_ch048_five_domain_mobilize',
  title: '第四十八章·五域总动员',
  volume: 3,
  order: 48,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'new_dawn', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '大战后的第一次五域盟会，洛衍之携归尘剑出席。金色剑纹在石桌上像安静流动的河。他当众把自己在赤炎域阵眼与火之道种共振时看见的吞噬阵原理，一笔一笔划成所有人都能看懂的灵力流程图，又转述白鹿先生的警告:最纯净的初衷，一样会被时间熬成偏执，所以真正的敌人从来不只是某一个人，而是任何一个可能失控的自己。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '裴忘渊随后起身，公开承认自己自继任宗主起就知道悬剑峰地下埋着三万年古阵，也承认剑宗三十年来所有重大决策都在围着这座阵眼的侵蚀做准备。他说，无面尊者把最大的阵眼埋在剑宗脚下，因为他早就推演到，最后站到自己对面的必定是剑宗。三十年了，我等的就是这一天。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '石镇山把石杖往地上一插，率先表态苍岳域参战；萧炎烈咬着牙说算上；钟离越则放下一根来自苍梧神木的幼枝，那是青木域最高级别的战盟信物。苏晚棠当众宣布，由顾长惜接任碧落宫与天机推演体系的临战总调度。五域在同一张石桌前完成了真正意义上的结盟，不是为了某一家宗门，而是为了不让新的吞噬阵再一次长成。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'choice',
      text: '——第四十八章·五域总动员·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 244 },
            { type: 'flag_set', flag: 'five_domain_mobilize', flagValue: true },
            { type: 'flag_set', flag: 'volume3_complete', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
