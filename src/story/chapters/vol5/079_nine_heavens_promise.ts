import type { StoryChapter } from '@/types/storyChapter'

export const chapter_nine_heavens_promise: StoryChapter = {
  id: 'vol5_ch079_nine_heavens_promise',
  title: '第七十九章·九天之约',
  volume: 5,
  order: 79,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'return_to_dust', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '天道自愈在他走出法则之门的同一刻进入最终收束。五域天空上的五色极光，那场持续了不知多少万年的法则乱序，也在同一天里缓缓沉降，像一层被掀了太久的巨幕终于落回地面。五大仙宗的修复工程各自完成，没有人声称全靠自己的功劳。裴忘渊把那封写给故人的信，在悬剑峰新立的英灵碑下一页又一页烧尽；苏晚棠将碧落宫宫主之位传给新执事，独坐归尘渊畔闭关；钟离越的医馆依旧人来人往，只是凡骨见到修士时，脸上已不再带着旧年代的噤声惧意。石镇山最终把那块被萧炎烈一掌拍裂的石桌，打成一只方尊，放在万钧石堂正中央，当作留给后人的训物。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '谢不语没有参加任何庆祝。他只是在归尘渊另一侧的普通石壁上，用自己的铁剑连续数月一个名字一个名字地刻。不是刻英灵，而是刻那场陨道之战中过去三万年来所有没有被任何碑文记住的死者。他把斗笠放在碑前，再没戴起。洛衍之和顾长惜找到他时，他只对洛衍之说了一句比往常长得多的话：明衍那晚跟我说的不是“让我来”，他说的是“总得有人先走一步”。洛衍之听完后，在那座无名碑上替他补刻了另一个名字：明衍，先走者。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '悬剑峰的上空从此多了一道星痕，极细极淡。在每一个晴朗的夜晚，无论五域中哪一个角落抬头看，都能在最北偏东一点看到它。它不扩张，不移动，也不显异象，只是一柄剑的形状，极淡地映在天幕上。洛衍之没有成为天道，但他在那把空椅沉下去的位置放下的一切，留下来的那条岔路，永远刻在了天道自愈后的新法则最底层。从此以后，任何想坐上天道之椅的人，都会在触到那一层时看到同一种最简单的回响：一个手心里的灵石环，一壶凉了却被擦得很亮的旧酒。然后他们便会知道，天道不是用来坐的。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'choice',
      text: '——第七十九章·九天之约·完——',
      choices: [
        {
          text: '进入终章',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 300 },
            { type: 'gold', value: 50 },
            { type: 'flag_set', flag: 'nine_heavens_promise', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
