import type { StoryChapter } from '@/types/storyChapter'

export const chapter_their_own_war: StoryChapter = {
  id: 'vol2_ch038_their_own_war',
  title: '第三十八章·各自的战争',
  volume: 2,
  order: 38,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'mine_and_blood', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '顾长惜在废弃岛基深处，用钟离越给她的血手印玉简配合水之道种残韵，成功把原先那道引诱洛衍之去阻断吞噬秘法的密令改写成了反收割指令。新的指令会以命定之人的固有因果主权混进天机推演网，逼九幽子在试图抽取核心碎片时，被自己丹田与天机阁反向供能线路的叠加反噬击溃灵元引。她在新月微光下把这条指令重新送回整张网，明白这场仗暂时还只能在暗处打。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '同一时刻，坐在赤晶矿脉重症区外的洛衍之，正陪着同袍与铸剑师们重新熔铸紫岚残剑。他从那场死守矿道的大战里凝出一枚小小的金环，把它和父亲的遗信、江溯写给父亲的旧信一起放进最内层衣袋。他还在紫岚残剑的背面摸到一处极轻的临终指向，剑尖竟然隐隐指着沧澜域的方向。他不知道那是巧合，还是云斐然临死前替他看过的一条路。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '深夜里，齐岳拿来一个旧酒囊，说是魏安留下的。打开之后里面装的却不是酒，而是清水。魏安从来不喝酒，但每次打完仗，都会把水当酒一样敬给死去的同袍。洛衍之仰头喝了一口，剩下半囊缓缓沥在焦土上。齐岳把断成两截的重剑拼在膝上，问他，等打完这些仗之后，你到底要去哪里。洛衍之没有回答，只是下意识按住胸侧的口袋。齐岳看懂了那个动作，只说，等你想清楚了告诉我，我这把断剑照样能替你劈开路。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'choice',
      text: '——第三十八章·各自的战争·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 100 },
            { type: 'flag_set', flag: 'their_own_war', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
