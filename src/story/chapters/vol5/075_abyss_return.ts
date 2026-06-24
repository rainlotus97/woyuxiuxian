import type { StoryChapter } from '@/types/storyChapter'
export const chapter_abyss_return: StoryChapter = {
  id: 'vol5_ch075_abyss_return', title: '第七十五章·深渊再临', volume: 5, order: 75, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'before_choice', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '两人一同回到归尘渊。这一次不是一个人下去——是两个人。在归尘剑被封存之后，归尘渊的水底凝聚出了一条由剑意自身铺成的纤细光路——仅容一人，但能一直通到渊底的镜壁。顾长惜站在渊边。洛衍之回头看了她一眼——然后她跟着他迈上了那条光路。天机之瞳在渊底因为天道法则浓度过高反而看不清任何未来的走向。她捏着水蓝短剑但没有启动任何防御——因为在这道由归尘剑的剑意铸成的光路上，所有的法则都暂时收了锋芒。他们一起走到了镜壁前。那面曾经只映出一个人的镜壁，这一次映出了两个人。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '镜壁后面，一道由天道自愈过程中自然凝聚出来的、道主级的法则门缓缓显形。门不是木的不是石的，是法则本身因为需要被触开而在那里主动呈现的。门后的空间不是另一个地点——是天道最初始的运转法则被暂停了极短极短的一刹那之后留下来的一个原生间隙。只有一个人能走进去。洛衍之转身，顾长惜没有退回到渊边——她站在光路头——这个距离是她能站在离他最近的位置而不会触碰到法则之门的边界。他说：如果我进去之后不回来——她打断：你会回来的。这世上还有一件事你没做。什么事？还我的账。她伸出左手给他看了看灵石环。他点了点头。然后他转身推开门走了进去。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '法则之门在他身后无声地闭合。归尘渊恢复了一片深邃的青黑色宁静。', choices: [
      { text: '——第七十五章·深渊再临·完——', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 200 }, { type: 'flag_set', flag: 'abyss_return', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
