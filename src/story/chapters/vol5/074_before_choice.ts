import type { StoryChapter } from '@/types/storyChapter'
export const chapter_before_choice: StoryChapter = {
  id: 'vol5_ch074_before_choice', title: '第七十四章·抉择前夕', volume: 5, order: 74, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'last_fissure', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '顾长惜在天机之瞳的极限推演中看到了洛衍之的三种命运可能。第一种：他走进法则之门，没有坐上那把椅子，天道继续缓慢自愈，他回来后带着那道天上的星痕过完普通人的一生。第二种：他坐上那把椅子，化为天道的一部分，九天界众人从此只能在每一道霞光中感觉到他在，但他不再是人了。第三种：他在门内放弃了所有的选择，归尘剑替代他封住了那把空椅——从那以后世上不再有天道可以被坐上去的位置，但洛衍之本人将永远留在那道法则之门的内侧：不是死了，是成为门。她把三道命运平铺在面前，没有去改变任何一道的概率。然后她找到洛衍之，把这三种可能一样不少地摆在他面前。她用了她全力的平静说：我不会替你选——但从现在起你做任何决定之前，我要你看到我看过了。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '洛衍之把她的左手拿过来——无名指上的灵石环被推演室的冷光照出一小圈淡金色的反光。他说了一句答非所问但比任何一种回答都更直接的话：这个环不是法器。它也不保佑人不死。但不管我去了哪个方向——它在，它就替我记得我在哪个地方爱过哪个人。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '她收回手的时候，灵石环在她无名指上极轻微地晃了一下——像一颗极小的、还在适应引力的星球。', choices: [
      { text: '——第七十四章·抉择前夕·完——', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 180 }, { type: 'flag_set', flag: 'before_choice', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
