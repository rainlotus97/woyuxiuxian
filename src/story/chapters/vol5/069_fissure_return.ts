import type { StoryChapter } from '@/types/storyChapter'
export const chapter_fissure_return: StoryChapter = {
  id: 'vol5_ch069_fissure_return', title: '第六十九章·裂痕再现', volume: 5, order: 69, perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'dao_breath', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '天道呼吸造成的混乱中，有几个残余的散修组织试图借机重启吞噬阵的局部片段。他们不是天机阁的残党，而是被旧天道秩序抛弃了几代人之后自然滋生出的极端信仰者。洛衍之独自追查到一个被占领的废弃矿洞中，见到了这伙人的首脑。不是白须齐眉的癫狂老者——是一个十五岁的瘦弱少年，双手全是矿洞石屑磨出的茧，眼睛里的仇恨比他当年从望石镇废墟中爬出来时还要浓。那少年吼道：你们争道种、争天道——争完了，你们说和平了——我们还得拿命去填灵石矿做贡品。你说你放下了剑——你放下什么了？', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '洛衍之发现自己拔不出剑——不是因为归尘剑封在渊底。是因为他面前这个少年，和当年跪在望石镇废墟里的自己一模一样。他蹲下来，把当年江溯告诉他的那句话转告给了这个素不相识的后辈：不是所有的剑都要拿来杀人。有些剑——是因为有人太想活下去，才被挥出来的。你要活下去。活到将来有一天，你也可以对着另一个比你更弱的人说这句话。那少年没有说话。也没有收起拳头。但他把头埋进了膝盖上——闷声哽咽。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '洛衍之离开矿洞后把归尘诀第九式的剑意用传音阵发给了钟离越，让她在新长青谷的医馆里刻一面碑。碑文只有一行字：此剑不为杀。', choices: [
      { text: '——第六十九章·裂痕再现·完——', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 190 }, { type: 'flag_set', flag: 'fissure_return', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
