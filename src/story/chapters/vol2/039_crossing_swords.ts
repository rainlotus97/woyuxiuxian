import type { StoryChapter } from '@/types/storyChapter'

export const chapter_crossing_swords: StoryChapter = {
  id: 'vol2_ch039_crossing_swords',
  title: '第三十九章·交锋',
  volume: 2,
  order: 39,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'their_own_war', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '赤晶矿脉保卫战之后，云斐然的死在剑宗掀起了真正意义上的震荡。原本还在观望的苍岳域与青木域先后发出声援通告，萧炎烈亲率烈焰天宗主力北上包抄吞天教残部，钟离越也派出青木域灵兽部队增援东线。裴忘渊在云斐然下葬那夜没有现身英灵碑前，而是独自在宗主殿守到天明，用左手虎口渗出的金色法则伤液，在宗主剑印旁刻下了三个字，吾之过。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '洛衍之随后被正式授命为第三峰代理峰主。他接过剑印时提出唯一的条件，自己要亲带清剿分队深入赤炎域南部，追查九幽子吞噬秘法背后那条反哺天机阁的供能线路。裴忘渊同意了，但要求他必须带上一个能替他挡住天机推演反噬的人。另一边，顾长惜也通过苏晚棠截获的情报确认，九幽子体内的吞噬秘法已经开始持续崩漏，说明那道反收割指令确实生效了，无面尊者的网正在出现耗损。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '两周后，洛衍之率领的清剿分队在赤炎域南部一座废弃熔岩堡里，与吞天教最后的主力撞上。九幽子被反噬折磨得半边身子都焦炭化，却仍在追逐熔岩堡地下那枚更大的火之道种碎片，妄图靠新碎片压住崩溃。洛衍之进入堡内第一夜，就在黑暗里感应到一股极熟悉的水蓝灵力，顾长惜也从另一方向潜入了这里。两人在一条只能容两人侧身而过的石廊里碰面，彼此身上都带着伤，却没有拔剑。因为他们一眼就看明白，对方都在做同一件事，从不同方向悄悄撬开无面尊者推演网的裂缝。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '在石廊尽头真正撞见九幽子之前，两人先躲到地下炉渣槽边交换数据。洛衍之用断念剑在灰尘上迅速画出自己追踪到的吞噬供能线节点，顾长惜则把反收割指令最新生成的反馈回路投在墙面上。两张图叠在一起后，他们同时看见了唯一交点，那不在九幽子表面灵脉，而在他丹田最深处的吞灵核上。若能在同一次出手里，从内外同时瘫痪这个接口，天机推演网就会暂时失去对九幽子的实时控制，后续战线便能借这道裂口反推整张网的主节点。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第三十九章·交锋·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 100 },
            { type: 'npc_favor', npcId: 'npc_guchangxi', value: 10 },
            { type: 'flag_set', flag: 'crossing_swords', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
