import type { StoryChapter } from '@/types/storyChapter'

export const chapter_return_to_the_sword: StoryChapter = {
  id: 'vol2_ch042_return_to_the_sword',
  title: '第四十二章·归剑',
  volume: 2,
  order: 42,
  perspective: 'male',
  triggers: [{ type: 'choice_flag', flag: 'aftermath_and_ash', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '洛衍之带着云斐然留下的遗识刻片日夜兼程赶回悬剑峰，没有走传音，也没有让任何中途节点经手。他亲手把刻片交到裴忘渊掌中。宗主摸到刻片的瞬间，左手虎口那道法则旧伤猛地亮起，比平日灼烈数倍，像师徒二人的剑意在这块极小的遗识上重新短暂接回了一次。刻片背面还留着一行极细的末字，写着弟子这一生最大的遗憾，是没能当面叫您一声父亲。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '洛衍之退出宗主殿后，坐在殿外石阶上很久，才起身往第三峰走。他把熔岩堡里捡回来的那枚金环放在父亲当年刻过剑碑的旧痕旁边，低声说了一句只有自己能听见的话。走到第三峰山道的转角时，他又看见石壁上那道父亲二十年前留下的旧箭头，指向后院松树。箭头旁还刻着一行快被风雨磨平的小字，说那棵松树下埋了一壶酒，等回来一起喝。洛衍之蹲下来顺着刻痕一笔一笔摸过去，摸到一起喝三个字时才发现，这几个字比前面所有字都轻，像当年落剑的人写到这里时，手已经先被心里某件事带偏了。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '等他真正回到第三峰，江溯正靠在门边等他，什么安慰都没说，只把一个空酒壶抛进他怀里，让他去后院打满水。你不在，没人给我打水，渴了只好喝酒。洛衍之抱着酒壶站了一会儿，终于还是照做了。后院的松树、壶嘴上新崩开的缺口、还有江溯那句像玩笑又像命令的话，让这一路憋着的那口气终于落地。他知道自己不是回来了，而是被这座峰重新接住了。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'choice',
      text: '——第四十二章·归剑·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 70 },
            { type: 'flag_set', flag: 'return_to_the_sword', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
