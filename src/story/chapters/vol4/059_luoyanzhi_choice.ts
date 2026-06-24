import type { StoryChapter } from '@/types/storyChapter'

export const chapter_luoyanzhi_choice: StoryChapter = {
  id: 'vol4_ch059_059_luoyanzhi_choice',
  title: '第五十九章·洛衍之的选择',
  volume: 4,
  order: 59,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'released_sword', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '道种洪流在临界前达到极度平静。洛衍之站在归尘剑前，左一尺是天道的权柄，右一尺是人手。他想起的不是剑招，也不是法则，而是江溯灌酒时随口说的那句你爹欠我一壶酒的语气，是云斐然拍他肩膀的力度和那句有点意思，是柳青霜每次在他左后方换步时剑柄碰到腰带的那一下轻磕，是白鹿先生枯木杖尖在空气里画出天道影像时的颤抖。这些都是活人做过的事。如果成为天道，他能抹掉悲剧，但也会抹掉所有活过的痕迹。他不想抹掉那只酒壶，不想抹掉那一拍肩，也不想抹掉那一下磕剑。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '他转头看了顾长惜一眼。她靠在石壁上攥着拳，指甲掐破了掌心，血沿着指缝往下滴，却一个字都没有说。他笑了一下，和当初在剑宗后山看第一次落日时一模一样的轻。然后，他放开了剑柄。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第五十九章·洛衍之的选择·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 277 },
            { type: 'flag_set', flag: '059_luoyanzhi_choice', flagValue: true },
            { type: 'flag_set', flag: 'released_sword', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
