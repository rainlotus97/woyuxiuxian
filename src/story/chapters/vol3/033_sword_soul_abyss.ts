import type { StoryChapter } from '@/types/storyChapter'

export const chapter_sword_soul_abyss: StoryChapter = {
  id: 'vol3_ch033_sword_soul_abyss',
  title: '第三十三章·剑魂渊',
  volume: 3,
  order: 33,
  perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'volume2_complete', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '剑魂渊不是山，也不是谷，而是玄天域地壳最深处一道从远古裂到今日的万丈大裂缝。洛衍之抵达裂口边缘时正值深秋，悬剑峰的剑尖被厚云咬去一半。裂口两侧的石壁密密麻麻刻满不同年代剑修留下的入渊印记，他一眼就认出了三个名字，洛长渊、江溯、云斐然。父亲的名字刻得最往里，江溯故意选在更高的一块新石面，云斐然则把名字留在最靠近崖边也最浅的一处，像是来时并不情愿，却也不肯真缺这道程序。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '第一层深渊里没有野兽也没有修士，只有一面由历代先祖残念共同汇聚成的无形剑壁。洛衍之刚踏过去，就被一道极淡的老者幻影拦下。那是第七任宗主留下的残念，只问了他一句话，你为何执剑。洛衍之把能想到的答案都在心里过了一遍，为父母报仇太轻，为天下太平太空，为争口气又太窄。真正最先冒出来的那句话，其实来自八岁那年他握着断剑柄跪在双亲尸身旁边的那个瞬间，如果我一直握着，会不会就还能感觉到我爹没有走远。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '老者没有说对也没有说错，只用剑意凝成一拳，把他重重砸飞出去。第一天如此，第二天如此，第七天依旧如此。洛衍之在第一层整整待了七天，每天被同一拳击倒，又每天爬回剑壁前。他渐渐发现，自己每多挨一次打，断念剑的剑感就更往识海深处渗一寸。过去他只能感觉灵气流向，现在却开始隐约捕捉到灵气背后更底层的意图，一个念头尚未成剑，剑感就已经先碰到了它。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '第七天，他没有再回答任何问题，只把断念剑平放在剑壁前，然后闭上眼，把识海里所有杂念都清到只剩下一个触感，父亲把断念剑放到他枕边时，剑柄残留的那点体温。剑壁在这一刻无声裂开，老者的残念没有再出现，但洛衍之清楚地感到，裂开的深处有人极轻地点了一下头。于是第二层入口亮起，他在第一层石壁边缘用手指刻了一个归字，独自走进更深处。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第三十三章·剑魂渊·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 110 },
            { type: 'flag_set', flag: 'entered_sword_abyss', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
