import type { StoryChapter } from '@/types/storyChapter'
export const chapter_seeking_truth: StoryChapter = {
  id: 'vol5_ch066_seeking_truth', title: '第六十六章·天道遗痕', volume: 5, order: 66, perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'spirit_transformation', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '顾长惜在整理天机阁遗留的加密档案时，天机之瞳捕捉到了一段被层层道主级密文封裹的因果线。这段因果线的发送时间戳是在陨道之战之前数百年——用的是一种连司天命都无法破解的远古推演密文。她花了三个月把这段密文逐字解出。上面没有战术、没有计划，只有两个人名和一段被反复涂抹又被反复写下的对话。明衍。不语。对话的内容极短——像是在某座山的山顶上，两个年轻道主对着星穹说了一句关于公平的定义。明衍说：把那个圈子接回去。不语说：万一接的过程中有人会死。明衍说：那就让我来。顾长惜收起密文，她知道这样东西不属于任何档案室。它属于一个人——一个活了三万年还在沉默的人。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '她在青木域半毁的白鹿秘境废墟上找到了谢不语。他在帮钟离越用水引线修复秘境的水幕——不用剑，用铁剑在地上画出来的线条引导地下暗泉重新流回水幕。他的斗笠放在脚边。她将那段密文用天机之瞳投在水幕上。谢不语看完，没有否认，也没有辩解。他只是把斗笠从脚边捡起来——没有戴上，而是翻转过来放在水幕边，像一个水钵。然后他用极轻的声音说出了一句把沉浸在三万年沉默中的第一段完整告白：那个山顶叫咫尺崖。那天晚上有五颗星星排成了一圈——这个世上除了我俩没有人见过那个星圈。他走后那颗星圈就散了。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '水幕上的密文被风吹皱了一小片，像两个名字在水里握了一下手。', choices: [
      { text: '——第六十六章·天道遗痕·完——', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 150 }, { type: 'flag_set', flag: 'seeking_truth', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
