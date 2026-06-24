import type { StoryChapter } from '@/types/storyChapter'

export const chapter_sword_heart_formed: StoryChapter = {
  id: 'vol3_ch035_sword_heart_formed',
  title: '第三十五章·剑心初成',
  volume: 3,
  order: 35,
  perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'soul_depths', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '第十八层深处只有一面镜子。镜中的另一个洛衍之穿着铁匠旧短褐，腰间没有断念剑，只别着一把柴刀。身后的望石镇没有被烧，叶铁心还在门口磨刀，王婶仍在街上卖豆腐。镜中人只问了他两个字，值吗。那不是幻象在拷问，而是另一条本来可能存在的人生，站在他面前安静地问他，真要继续往前走到这一步吗。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '洛衍之没有立刻拔剑，而是先从储物袋里取出两封信。一封是父亲泛黄得快碎的遗信，一封是江溯二十年前写给父亲却从未寄出的信。他把两封信按在镜面上，然后才抬起断念剑，在镜中自己的眉心处慢慢刻了一个归字。镜面在这一刻寸寸开裂，万千幻象化成极细密的剑意，一股脑涌进他的丹田。等他再睁眼时，金丹已成，夜空也被一道从深渊底部直劈而上的金色剑光彻底点亮。守在渊外的小道童边跑边喊，说有人从剑魂渊里带着金剑金丹出关了。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'choice',
      text: '——第三十五章·剑心初成·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 205 },
            { type: 'flag_set', flag: 'heart_formed', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
