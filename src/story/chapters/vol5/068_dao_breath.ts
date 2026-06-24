import type { StoryChapter } from '@/types/storyChapter'
export const chapter_dao_breath: StoryChapter = {
  id: 'vol5_ch068_dao_breath', title: '第六十八章·道种的呼吸', volume: 5, order: 68, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'silent_confession', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '天道自愈不是线性的。它像一棵被雷劈之后缓慢重生的古木——每发出一根新芽，都会让原来焦死的树皮再脱落一层。五域同时承受了这种天道呼吸的阵痛：青木域的洪水淹过三座仙镇，赤炎域火山群同日喷发把白昼遮成赤夜，沧澜域的海啸倒灌入碧落宫灵池，苍岳域裂出百里长的地裂带，玄天域上空被积压了三千年的废弃剑意撕裂成了一场剑气风暴。没有哪一个域能独自扛住这场浩劫。洛衍之和顾长惜从两个方向同天抵达同一座被洪水围困的青木域小镇。他们在齐腰深的水里把老人和孩子一个一个扛上苍梧神木的高枝——不是用灵力，是用背。两个化神期的修士，用人类最古老的方式，在洪水中来回。', autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '天道呼吸持续了将近三个月。平息之后，五域的人发现：那些被天灾侵扰过的土地上，灾后新生的灵草长得比灾前更密更壮。天道每一次呼吸都是在排弃旧法则的无序残余，同时为地表补充被囚禁了太久的纯粹灵气。人们在废墟上互相一点一点重建时，重建的不仅是房屋——还有那种数十代人以来被道种争夺磨损掉的朴素信任。痛苦不是惩罚。那些在废墟上重新认认真真架起第一根房梁的凡人们，比任何修士的突破都更能证明一件事：道不在天上，在有人愿意弯腰扶起另一个人的时候。', autoNext: 's3' },
    { id: 's3', type: 'choice', text: '天道呼吸结束后的第一个晴日，五域所有人同时看到了同一种云——一种以前从未见过的、由五色灵光边缘调和成的鱼肚白。', choices: [
      { text: '——第六十八章·道种的呼吸·完——', nextSectionId: 's_end', effects: [{ type: 'realm_exp', value: 180 }, { type: 'flag_set', flag: 'dao_breath', flagValue: true }] }] },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
