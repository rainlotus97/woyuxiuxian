import type { StoryChapter } from '@/types/storyChapter'

export const chapter_the_approaching_storm: StoryChapter = {
  id: 'vol2_ch034_the_approaching_storm',
  title: '第三十四章·山雨',
  volume: 2,
  order: 34,
  perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'new_horizons', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '顾长惜把自己这些年的任务因果线一条条逆向推回去，终于发现了一个令她不寒而栗的规律。每次她奉命调查道种波动，总会在附近撞上玄天剑宗的人，而且目标里一定夹着金灵根剑修或金系法器的持有者。这不是巧合，是无面尊者在刻意把她与另一边的金系灵修放进同一条轨迹里，再把双方推到只能对立的位置。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '她逐渐明白，无面尊者真正想要的不是两边合作，而是在未来某个节点把她和洛衍之一起逼到天道吞噬阵前的终局，让他们在极限压力下做出会被天道记录的终极选择。那一刀会不会真的斩下，她会不会用天机之瞳把他困进无法回头的陷阱，这些结果都会成为被利用的高阶因果素材。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '顾长惜决定不去正面反抗这张网，而是在网的内部制造一种只有他们自己能识别的信息偏差。她想到的底牌，正是洛衍之曾给她的那包金系碎芒。那些碎屑来自他磨剑时留下的金韵切面，带着道种残韵中独一无二的微波，只要仍有一粒嵌在她右肩旧伤里，被她的水灵根包裹，他们之间的那条线就不会被无面尊者彻底重构抹去。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '局势同时在五域急剧恶化。剑宗和赤炎域相继公开指责天机阁，五域势力开始分边站队。顾长惜站在苏晚棠的静室里，把完整的反推演方案投在水幕上。苏晚棠沉默良久，从灵池底捞起那条一直不肯游动的灵鲤，轻声告诉她：它今天第一次主动游到我手边，说明你找到的那条路是对的。金之碎芒与水之道韵的天然共鸣，足以在无面尊者的因果网里切出一条合法绕路。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第三十四章·山雨·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 80 },
            { type: 'flag_set', flag: 'approaching_storm', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
