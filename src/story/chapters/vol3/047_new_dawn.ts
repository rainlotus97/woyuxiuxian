import type { StoryChapter } from '@/types/storyChapter'

export const chapter_new_dawn: StoryChapter = {
  id: 'vol3_ch047_new_dawn',
  title: '第四十七章·新生',
  volume: 3,
  order: 47,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'the_final_choice', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '天道吞噬阵瓦解后，悬剑峰下的核心阵眼塌成了一面深不可测的天道湖，后人称之为归尘渊。五枚道种各归各域，横跨天际的五色极光最终沉成极淡极柔的云边。裴忘渊在英灵碑上刻下云斐然与柳青霜的名字，两柄断剑并肩立在碑下。顾长惜则在废墟里找到沈镜明留给她的最后一句话:你不欠天机阁任何东西，从今以后，只欠你自己。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '战后重建缓慢而真实地开始。钟离越把长青谷改成向凡人开放的医馆；萧炎烈在熔岩废墟上建起不灭琉璃塔；石镇山在归尘渊边为无名死者打下九座石像；谢不语则在对岸石壁上一笔一画刻满那些三万年来没有留下名字的人，最后把自己的斗笠放在碑脚，仍旧没有署名。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '又过了三年，洛衍之从游历中归来，把那枚曾在赤炎域火山灰中捡起、后来又被自己反复打磨过的灵石环，轻轻放回顾长惜掌心，只说了一句:记账，以后还。她把金环套在无名指上，低头看了很久，最后只是踮起脚，在他额前落下一个极轻极轻的吻。那一刻他抬头望向云端残留的陨道伤痕，第一次坦然地对故去的父亲说，我找到了比剑道更重要的东西。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '战后的第一个春天，顾长惜又在碧落宫天台种下一棵很小的灵松苗。苗是从悬剑峰第三峰后院那棵歪脖子松下挖来的，根部还缠着江溯多年前埋下的麻绳头。她浇完灵池里的水，坐在石栏边看远处渔船收网，心里忽然想，等松苗再长大一点，就能在树荫下放一把椅子。像替那些终于熬过长夜的人，预留下一处真正能坐下来的地方。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第四十七章·新生·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 320 },
            { type: 'gold', value: 100 },
            { type: 'flag_set', flag: 'new_dawn', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
