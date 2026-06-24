import type { StoryChapter } from '@/types/storyChapter'

export const chapter_the_eye_of_the_storm: StoryChapter = {
  id: 'vol2_ch044_the_eye_of_the_storm',
  title: '第四十四章·风暴眼',
  volume: 2,
  order: 44,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'war_council', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '五域联军在苍岳域完成最后集结那天，悬剑峰上空的五色极光已经肉眼可见。天道吞噬阵进入预启动的最后阶段，五枚道种的脉动被强行拖到了同一共振频率。江溯在出征前最后一次单独见洛衍之，把酒壶搁在松树下，难得没有喝一口。他直接把悬剑峰下阵眼的大概位置画在泥地上，告诉洛衍之，当年你父亲离开剑宗，不只是为了救你娘，也是因为他已经感应到山底下那个东西，只是那时还没有找到打开阵眼的钥匙。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '江溯把那句没说完的话补齐了。现在钥匙在你身上。金之道种碎片，与天机阁命定之人的因果主权联在一起，就是打开阵眼、也是撬开整张网的钥匙。当天夜里，洛衍之和顾长惜站在碧落宫天台上看最后一次夜空。天色已不再是黑，而被五色极光染成不断流动的虹幕。顾长惜第一次正面说出自己在推演里最怕看见的画面，不是他死，而是他们中间那条因果线被阵眼全部烧断，最后谁也不认得谁。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '洛衍之把断念剑横放在两人中间，说这柄剑本来就是断着传到他手里的。断口从来不是弱点，而是有人把自己砍掉的那一段，留给下一个人接上去。然后他把那枚金环隔着石栏轻轻推到顾长惜的无名指末端，只往里带了小半圈，让她把它当作方位针，而不是束缚。顾长惜低头看着那道被手指反复磨出来的细痕，第一次没有把它当成外物避开。她顺势把环推到最合适的位置，知道不管后面有多少根因果线会被烧断，至少这一道断口，他们已经亲手认下来了。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'choice',
      text: '——第四十四章·风暴眼·完——',
      choices: [
        {
          text: '进入卷三',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 200 },
            { type: 'gold', value: 30 },
            { type: 'flag_set', flag: 'volume2_complete', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
