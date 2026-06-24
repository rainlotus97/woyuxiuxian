import type { StoryChapter } from '@/types/storyChapter'

export const chapter_war_declared: StoryChapter = {
  id: 'vol2_ch027_war_declared',
  title: '第二十七章·天机阁与剑宗全面开战',
  volume: 2,
  order: 27,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'joined_resistance', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '顾长惜抵达悬剑峰下时，迎接她的是天机阁抢先向五域散发的檄文——指控她为叛徒、剑宗为叛徒庇护所。十几柄剑同时指向她。她没有拔剑，没有辩解。她在剑丛中看到了一个人——洛衍之的手按在剑柄上，但没有拔。他走进剑丛站在三步外——你来这里做什么？来投诚。投谁的诚？你的。他侧身让出一条路——进去再说。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '剑宗大殿的战备钟在同一刻被敲响。天机阁大军正在向玄天域边界集结，裴忘渊站在宗主殿前看着远方地平线上密集的灵力波峰，虎口那道被他保守了三十年的陨道法则伤疤在今夜疼痛尤甚。他对着窗外第一次集结完毕的剑宗全师喃喃自语：我们等了这一天等了三万年。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第二十七章·天机阁与剑宗全面开战·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 181 },
            { type: 'flag_set', flag: '027_war_declared', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
