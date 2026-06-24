import type { StoryChapter } from '@/types/storyChapter'
export const chapter_silent_confession: StoryChapter = {
  id: 'vol5_ch067_silent_confession', title: '第六十七章·沉默者的告白', volume: 5, order: 67, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'seeking_truth', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '谢不语把整件事从头讲完，没有省略任何一段自己应该承担的部分。明衍和他从小在同一条早已枯死的古老剑脉上修炼。两个孤儿，同一条断脉，同一种天分，同一种不满。他们一起坐在剑脉残根的断层上望着远处五大仙域各自拉锯乱战时，曾设想了一个在当时看来无比天真却诚实得无可挑剔的结论：如果天道由真正想要公平的人来守着——那些因为道种争夺而白白死掉的凡人和低阶修士就不会死了。后来他们各自修成了道主。再后来，明衍开始在那张比所有人都高明得太多的推演之网前越陷越深。不语劝过无数次——劝的不是不可以取代天道，而是你取代了天道以后，你还是你自己吗。陨道之战前夜，不语告别明衍时说的是：你去吧。但我会在这里看着——等着你自己停下来。这一等就是三万年。沉默不是因为背叛理想，是一个人没法对着曾经和自己共享过同一个理想的人说出你已经变成了我们年轻时最害怕的那种人。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '洛衍之和顾长惜并肩听他讲完。洛衍之沉默了几息，说了一句不是问他而是问他头顶上方那片虚空的话：所以他最后的选择——谢谢。谢不语没有回答。他只是在脚下的泥地上，用铁剑写了一个字——不是刻的，是轻轻地划的，风一吹就会散。那个字是：明。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '铁剑收回鞘时，那个字已经被风抹掉了一半，但剩下来的半边部首在落日的映照下刚好还认得出原样。', choices: [
      { text: '——第六十七章·沉默者的告白·完——', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 170 }, { type: 'flag_set', flag: 'silent_confession', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
