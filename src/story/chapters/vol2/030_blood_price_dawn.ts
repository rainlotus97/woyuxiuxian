import type { StoryChapter } from '@/types/storyChapter'

export const chapter_blood_price_dawn: StoryChapter = {
  id: 'vol2_ch030_blood_price_dawn',
  title: '第三十章·以血换来的黎明',
  volume: 2,
  order: 30,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'repelled_jiuyouzi', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '赤晶矿脉保卫战是玄天剑宗近二十年来最惨烈的一场胜利。被抬回悬剑峰的伤员在石板地上排成了一条长长的行。云斐然在侧翼战斗中为给部队争取关键转角压制时间，不退反进多压了三百步——被九幽子堵住退路，挨了元婴对金丹的全力一掌。紫岚剑格住了掌力的大部分威势，但剩下力道还是穿透剑身击入了他的丹田——永久裂痕。他被救回来时还在笑，对洛衍之说：你突破了。如果你不变得比我更强——我一辈子都不会原谅你。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '裴忘渊在战后发布了一份极短的表彰令。洛衍之躺在重症室里，顾长惜把一颗灵骨丹放在他枕边——放在两个人正中间。就像当年在青冥山药谷里他把赤血灵芝推到她脚边的方式一模一样。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第三十章·以血换来的黎明·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 190 },
            { type: 'flag_set', flag: '030_blood_price_dawn', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
