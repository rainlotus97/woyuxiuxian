import type { StoryChapter } from '@/types/storyChapter'

export const chapter_swallowing_calamity: StoryChapter = {
  id: 'vol2_ch029_swallowing_calamity',
  title: '第二十九章·吞天之劫',
  volume: 2,
  order: 29,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'proved_herself', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '九幽子率吞天教主力猛扑赤晶矿脉——剑宗东线命脉。洛衍之率不足三十人在矿道入口死守，从清晨到正午挥剑一千两百余次。下午九幽子亲自出手，以元婴中期修为催动火之道种残韵，一掌拍向矿道。洛衍之正面迎击——断念剑中金之道种碎片、问天剑灵与他自己的剑感三重同频共振，一道金红交织的光柱劈开了元婴掌力。他本人被震飞撞入岩壁，肋骨至少断了数根。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '在昏迷前最后一刻，他看到天机阁从东北侧攻来的援军被一道水蓝色剑光拦腰截断——是她。矿脉守住了，九幽子没有料到东线多了一个能用推演预测他每一步进攻路线的水系修士。洛衍之靠在岩壁上嘴角浮起一个极微弱的弧度。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第二十九章·吞天之劫·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 187 },
            { type: 'flag_set', flag: '029_swallowing_calamity', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
