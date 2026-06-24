import type { StoryChapter } from '@/types/storyChapter'
export const chapter_faceless_end: StoryChapter = {
  id: 'vol4_ch060_faceless_end', title: '第六十章·无面尊者的终局', volume: 4, order: 60, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'released_sword', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '五枚道种脱离吞噬阵的束缚后没有爆炸——它们像是被解开了一种捆绑已久的枷锁，各自以自己原本的频率重新开始运转。五色光芒不再是冲突的——而是同轴的五行循环，每一个脉冲都在修复前面一道脉冲造成的残余电弧。无面尊者就站在那道逐渐衰减的吞噬阵废墟正中央，没有被道种的力量碾碎——因为道种的力量不施惩罚，只回归秩序。他静静地站在那里看了一会儿五色光的离场，然后缓缓转过身对着洛衍之的方向。',
      autoNext: 's2' },
    { id: 's2', type: 'narrative', text: '他开口了。这次说话的语气和平中带着一种从来没有过的轻——好像每一个字都不再需要被衡量和算计："我当年也是这么选的。没骗你。三万年前的我也站在和你现在一模一样的位置上——面对五枚未碎的天道，面对一把谁都可以拿起的剑。我选了握住它——不是想取代谁，是想把不公从这世上永远抹掉。你刚才选的对——和我选的相反。你知道为什么吗？因为没有人有资格替全天下的人做决定。这是我花了三万年才懂的一件事——你只花了一息。"',
      autoNext: 's3' },
    { id: 's3', type: 'narrative', text: '他说完这句后没有再说什么。青铜面具在五色光的残照中从他脸上脱落——这一次，面具底下的那张脸终于有了一个表情：不是疲惫，不是冷笑，不是虚空——是一个人在花了三万年终于把结论说出来之后剩下来的那种奇怪的、安静的笑容。然后他化为了一道灰光——不是被击杀，不是被天道反噬，而是自己分解了自己体内的所有法则碎片，将自己变回了天道运转中的一部分。他放弃了作为无面尊者的存在——就像洛衍之放弃成为天道一样。两个隔着三万年的人，在各自的时代做了同样的选择。',
      autoNext: 's4' },
    { id: 's4', type: 'narrative', text: '谢不语站在穹顶边缘看着那道灰光滑入道种洪流。他没有说话——只是把戴了不知多久的斗笠从头上取下来放在脚边。穹顶上的光慢慢地变青——那是最初的自然光，不是道种也不是吞噬阵，就是晨曦。他的脸在晨光里看起来和他戴着斗笠时的年纪不太一样——不是老，只是永远困在了做出沉默决定的那个年纪。',
      autoNext: 's5' },
    { id: 's5', type: 'choice', text: '灰光在道种洪流的最后一圈涟漪里消失得无影无踪。穹顶中安静如晨曦初升时那片最柔软的时刻。',
      choices: [{ text: '——第六十章·无面尊者的终局·完——', nextSectionId: 's_end',
        effects: [{ type: 'realm_exp', value: 280 }, { type: 'gold', value: 40 }, { type: 'flag_set', flag: 'faceless_ended', flagValue: true }] }]},
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}