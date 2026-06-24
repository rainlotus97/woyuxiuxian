import type { StoryChapter } from '@/types/storyChapter'

export const chapter_sword_soul_depths: StoryChapter = {
  id: 'vol3_ch034_sword_soul_depths',
  title: '第三十四章·剑魂深处',
  volume: 3,
  order: 34,
  perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'entered_sword_abyss', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '第二层到第十三层之间，洛衍之整整走了三个月。每一层都像一段被封进剑意里的人生，第三层是因挚爱被夺而堕入魔道的剑修，第七层是终生未败却再也找不到对手的天才，第十一层则是一对曾共患难却最终因剑道分歧反目的挚友，化成石像时两把剑还交叠在一起。每一层都没有标准答案，只有必须亲自承受的温度。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '洛衍之渐渐明白，自己并不需要从这些不同剑修的执念里选出一个最正确的答案。他真正要做的，是用自己的剑感记住他们在一生最后留下来的那点温度。江溯曾说，剑意不是学来的，是记住的。等到某一天你也走到相似的境地，想起曾有一个古人和你一样痛、一样怕、一样不肯退，那一瞬间，剑意就会从记忆里自己长出来。三个月之后，洛衍之已经能在拔剑之前先感到别人的念头起伏，也开始知道自己真正要带出这座深渊的，不是某一招，而是一整条能让他继续往前走的心路。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'choice',
      text: '——第三十四章·剑魂深处·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 202 },
            { type: 'flag_set', flag: 'soul_depths', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
