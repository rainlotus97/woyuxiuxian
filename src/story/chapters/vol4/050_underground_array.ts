import type { StoryChapter } from '@/types/storyChapter'

export const chapter_underground_array: StoryChapter = {
  id: 'vol4_ch050_050_underground_array',
  title: '第五十章·地下阵眼', volume: 4, order: 50, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'first_dao_guardian', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '地脉裂缝越往下走越像一条被时间冻住的古老食道。两侧石壁上布满了陨道之战时道主们打出来的剑劈痕——三万年的时间没有让任何一道剑痕消淡半寸。小队抵达三分之一深度时遭遇了第一批天道守卫——由破碎的吞噬法则凝聚成的规则实体。谢不语用铁剑接住第一道守卫，同时在战斗中第一次对全队说出了超过五个字的长话：三万年前那一战我没有参战——因为无面尊者曾经是我最好的朋友。我跑不是怕死，是下不去手。沉默了三万年——现在，还债。', autoNext: 's_end' },
    { id: 's_end', type: 'choice', text: '——第五十章·地下阵眼·完——', choices: [{ text: '继续', nextSectionId: 's_end2',
      effects: [{ type: 'realm_exp', value: 250 }, { type: 'flag_set', flag: '050_underground_array', flagValue: true }] }] },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
