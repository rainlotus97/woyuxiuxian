import type { StoryChapter } from '@/types/storyChapter'

export const chapter_ruins_dawn: StoryChapter = {
  id: 'vol4_ch061_dawn',
  title: '第六十一章·废墟中的黎明',
  volume: 4,
  order: 61,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'war_ended', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '吞噬阵瓦解之后，英灵碑前燃起了一千盏长明灯。每一盏灯对应一个在这场战争中再不能回家的名字。刻碑匠是苍岳域最老的石匠，他的手在刻每一个名字时都会先摸一下石碑的纹路，好像怕刻刀会弄疼石头。他把云斐然和柳青霜的名字刻在碑的最上方。两个人，一柄紫岚，一截霜落，并排插在碑下的剑台上。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '裴忘渊在碑前一个人站到了天亮。他左手那道永不愈合的法则之伤，在天亮前最后一次渗出了极细的金色光液。那不是血，而是那道伤了三万年的法则裂口，在感应到石碑上刻下的每一个名字后，主动放弃了一部分杀意。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '顾长惜在废墟中找到沈镜明未发出的传音玉简。那是他切断供能线后、被法则贯穿身体前误触录纹键留下的最后几个断句：你不欠天机阁任何东西。从今以后，只欠你自己的。她把玉简收进贴身内襟，和那个空了的灵骨丹瓶放在一起。远处归尘渊底传来一道极低极柔的剑鸣，那是归尘剑在阵眼废墟最深处，第一次以被封存的姿态唱出了它自己的声音。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第六十一章·废墟中的黎明·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 283 },
            { type: 'flag_set', flag: 'dawn', flagValue: true },
            { type: 'flag_set', flag: 'war_ended', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
