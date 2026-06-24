import type { StoryChapter } from '@/types/storyChapter'
export const chapter_return_to_dust: StoryChapter = {
  id: 'vol5_ch078_return_to_dust', title: '第七十八章·归于尘', volume: 5, order: 78, perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'destiny_cross', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '洛衍之在那把空椅沉下去的位置站了很久。他手里没有剑，但他的手保持着虚握的拳势——那是江溯从收他为徒第一天就没改过的握剑手势。原野上的灰色渐渐被从他体内散出的金色剑意染成了和归尘剑上流水纹一模一样的纹理。他把手从原来的椅位上方抬起来——手心里什么都没有，但五指之间冒出极细微的金色光粒。那不是灵力，是他从八岁起每一天都在累积、但从来没有单独梳理过的"记忆温度"。这些光粒中有些属于望石镇那间被打碎的铁匠铺，有些属于青冥山溪涧凉凉的石头，有些属于赤炎域火山灰中那枚被他捡起来磨了整整两个月的灵石碎片。他把这些光粒分成了三份：一份归入地下融进了归尘渊的水中——那是还给所有死在其水脉旁边的逝者的；一份归入原野上空那道被他手温撕开的小小云隙间——那是留给九天界所有未来可能会饿死在矿洞里、也可能会成为极端者的那些少年的；最后一份他握回手心——那是留给一个人的。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '法则之门在他身后安静地打开了。不是推开的，是原野本身为他让开了一条最窄的路。他走了出去。归尘渊水底那条由剑意铺成的光路在他脚下重新亮起——每一道光粒子都在他路过时轻轻绕着他的靴尖转一小圈。归尘剑在渊底轻震了一声——这一次不是剑鸣，是收剑的声响。就像有人长久地等在门外，门终于开了。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '他从归尘渊水面浮出时正是漫天繁星。崖边上，一个白衣身影靠在石栏上——没有冲过来，只是在看到他浮出水面时，终于把手攥着石栏的力气松开了。石栏上留下了几道被指甲掐出的浅白划痕。', choices: [
      { text: '——第七十八章·归于尘·完——', nextSectionId: 's_end',
        effects: [{ type: 'realm_exp', value: 350 }, { type: 'flag_set', flag: 'return_to_dust', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
