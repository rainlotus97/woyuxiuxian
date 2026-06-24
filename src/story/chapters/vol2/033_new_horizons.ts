import type { StoryChapter } from '@/types/storyChapter'

export const chapter_new_horizons: StoryChapter = {
  id: 'vol2_ch033_new_horizons',
  title: '第三十三章·新天',
  volume: 2,
  order: 33,
  perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'volume2_complete', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '金丹之后的剑感世界和炼气期完全不是同一个维度。洛衍之从剑魂渊出来以后发现自己的剑感不再只是感应灵力流动，而是能看见灵力背后每一个人的意念纹理。站在悬剑峰剑塔顶层往下看，七座剑峰上数千名弟子的灵力在他感知里不再是模糊的光团，而是一幅极其精细的动态地图。谁刚服过丹药，谁在静室里压着哭声，谁带着旧伤强撑，都像细丝一样在识海里明灭。他花了好几天，才学会把那些不属于自己的意念压成背景噪音。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '江溯告诉他，这叫剑识，是金灵根金丹剑修在结丹之后自然开启的一层新感知。最可怕的不是看得远，而是看得细。你能看到别人丹田里有没有杂斑，灵力根基稳不稳，剑诀有没有暗裂。裴忘渊随后在宗主殿正式授予他第三峰亲传弟子的峰主候选剑印，这意味着他已经站到了宗门核心的位置，可以参与峰务、借阅重典，也会被更多人盯上。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '授印之后，裴忘渊单独留下了洛衍之。宗主没有讲恭贺，只说起他父亲当年也拿过同一块剑印，却在边境突变的那一周独自去救人，最终没能活着回来。裴忘渊提醒他，如今他的剑识已经足够看见天机阁埋在修士体内的追踪印记与推演节点，可也正因如此，一旦碰上天机阁的人，绝不能一个人追下去。你碰了其中一条线，整张因果网都会知道你来过。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '这个警告让洛衍之立刻想起顾长惜。她体内当时有没有那种印记，他在赤炎域并没有真正看明白。他去藏经阁借走第三峰所有关于天机阁推演术的档案，随后又独自返回赤炎域边境，在云斐然的英灵碑前插下修好的紫岚残剑和那柄刻着云字的新木剑。晨光映在碑面最下方，投出剑塔极细的一道影子。洛衍之对着那道影子极轻地说了一句，大师兄，今天的卯时，我替你看了。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第三十三章·新天·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 100 },
            { type: 'flag_set', flag: 'new_horizons', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
