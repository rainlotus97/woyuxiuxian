import type { StoryChapter } from '@/types/storyChapter'

export const chapter_the_furnace: StoryChapter = {
  id: 'vol2_ch040_the_furnace',
  title: '第四十章·熔炉',
  volume: 2,
  order: 40,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'crossing_swords', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '熔岩堡地下其实是一座被废弃多年的烈焰天宗古丹房。九幽子把偷来的熔天炉倒扣在岩浆池上，炉壁被烧得通红，火纹像活物一样跳动。他自己也已经被反噬折磨得半边身躯焦炭化，却仍死盯着岩壁里那块拳头大小的火之道种核心碎片。他已经不打算继续慢慢吞噬，而是要把新碎片连同自己的丹田一同投入熔天炉，借道种级熔炼之力把所有吞来的火灵与碎片熔成一体，让自己直接变成新的火种。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '洛衍之和顾长惜在炉渣槽后反复推演出手顺序。要同时瘫痪九幽子丹田最底层的吞灵核，就必须在同一个瞬间完成两件事。洛衍之用金之道种碎片从外部斩断吞灵核与熔天炉之间的灵力连接，顾长惜则用改写后的反收割指令，从内部引爆已经被反噬渗透的吞灵核外膜。早一瞬，晚一瞬，另一人都会被九幽子最后那道反噬力浪直接吞进去。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'battle_trigger',
      text: '九幽子的感知比他们预估得更强。两人还没贴近熔天炉，就先被他发现。他挥出一整柱岩浆砸向藏身处，洛衍之一剑劈断火柱中心的灵力支点，顾长惜则踩着碎裂的火浪闪身而出，将反收割指令直接投向九幽子丹田外膜。金色剑光与因果脉冲在同一瞬命中吞灵核，地下丹房随即爆开一圈无声的透明震波，整片地层都被掀得发颤。吞灵核碎裂后，九幽子体内堆积的火之道种碎片能量失控冲上夜空，像把整片赤炎域的天穹撕开了一道赤金裂缝。',
      battleConfig: { enemyIds: ['enemy_jiuyouzi_final'], onWin: 's4' }
    },
    {
      id: 's4',
      type: 'narrative',
      text: '爆炸过后，两人都被冲击波甩进丹房残垣。洛衍之撞碎半面古砖墙，肋骨断了几根；顾长惜则被掀到炉壁边，右手与脸颊都被灼伤。她还撑得住，先用碧水珠压住伤势，又把剩下半包金系碎芒扔给洛衍之，让他用来清掉吸入体内的残余火毒。洛衍之接住碎芒后，又弯腰把大战中掉出去的那枚金环从炉渣里捡了回来。环被压得有些变形，内侧那道被他反复摩挲出来的磨痕却还在。他把它重新放进贴心口袋，和父亲的遗信、江溯给父亲的旧信放在一起，随后才对顾长惜提起，云斐然临死前让紫岚剑尖指过一个方向。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第四十章·熔炉·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 150 },
            { type: 'npc_favor', npcId: 'npc_guchangxi', value: 15 },
            { type: 'flag_set', flag: 'the_furnace', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
