import type { StoryChapter } from '@/types/storyChapter'

export const chapter_edge_of_war: StoryChapter = {
  id: 'vol2_ch035_edge_of_war',
  title: '第三十五章·剑拔弩张',
  volume: 2,
  order: 35,
  perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'approaching_storm', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '洛衍之作为第三峰峰主候选重返赤炎域边境时，身份已和上一次截然不同。炎角镇被正式改成前线指挥部，齐岳、楚小蝉、魏安都还在，但每个人身上都多了新的伤痕和更沉的气息。上次是云斐然带着他值夜，这次他胸前别着宗主亲授的剑印，走在整支队伍的最前方。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '赤炎域的战局比想象中更糟。九幽子借吞噬秘法强吞火之道种边缘碎片，修为暴涨到极不稳定的元婴中期，吞天教也从散修小团伙膨胀成了近千人的前线祸患。与此同时，剑宗对天机阁的伐阁通告在五域掀起巨浪，赤炎域与青木域先后表态，苍岳域停掉灵脉输送，碧落宫则在沉默里瓦解天机阁寄生体系。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '云斐然在指挥帐里铺开地图，指出九幽子的下一个目标极可能是赤晶矿脉。洛衍之随即取出那块刻着无面尊者阵纹的黑色石板，把顾长惜留下的情报摊在众人面前：九幽子的吞噬秘法内部，被人预埋了一条反向供能回收体系。换句话说，吞天教不是失控的灾祸，而是一头被人故意喂大的肉鸡。等他吞够了，天机阁就会顺着这条线把所有道种灵能一并收回去。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '云斐然听完后没有立刻反驳，只说信她一半，另一半等打完仗再问。深夜里，齐岳又从自己重剑剑柄上拆下那块用铁丝捆了很多年的旧护手碎片，放在地图边上。他抬头看着洛衍之，说如果你在战场上用剑识扫到我丹田里有不该有的东西，不要等我自己发现，先劈我的剑让我停下来。帐中没有人笑，这句话像一根钉子，直接钉进了每个人心里。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第三十五章·剑拔弩张·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 90 },
            { type: 'flag_set', flag: 'edge_of_war', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
