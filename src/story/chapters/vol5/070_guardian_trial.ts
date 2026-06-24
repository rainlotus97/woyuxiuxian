import type { StoryChapter } from '@/types/storyChapter'

export const chapter_guardian_trial: StoryChapter = {
  id: 'vol5_ch070_070_guardian_trial',
  title: '第七十章·守护者的试炼', volume: 5, order: 70, perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'guardian_trial', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '顾长惜在青木域洪灾最前线发现了守护者真正的意义。她的天机之瞳在计算水流路线时无意接收到了苍梧神木根系深处木之道种的低频息——不是求救，是木之道种在五行循环的深层记忆中向水灵根发出的古老共振：在水与木还相互滋生的年代，洪水不是灾害，而是滋养。她没有推演后果——这大概是她十六年来第一次。她将整道洪流的水灵气用自己的水灵根接引到了神木根部，化灾为灌。整整一天泡在洪水里，没有用高级法术，只有碧水珠和水蓝短剑。傍晚她坐在神木分枝上拧着湿透的长发，低头看到左手无名指上的灵石环在月光下泛着一圈极淡极淡的金色光晕——那不是灵石本身的光，是从赤炎域火山灰中捡起它的那两只手指上残存的金之道种碎屑。', autoNext: 's_end' },
    { id: 's_end', type: 'choice', text: '——第七十章·守护者的试炼·完——', choices: [{ text: '继续', nextSectionId: 's_end2',
      effects: [{ type: 'realm_exp', value: 310 }, { type: 'flag_set', flag: '070_guardian_trial', flagValue: true }] }] },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
