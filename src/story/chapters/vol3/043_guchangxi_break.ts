import type { StoryChapter } from '@/types/storyChapter'

export const chapter_guchangxi_break: StoryChapter = {
  id: 'vol3_ch043_guchangxi_break',
  title: '第四十三章·顾长惜的决裂',
  volume: 3,
  order: 43,
  perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'found_parents', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '顾长惜捏碎碧水珠时，苏晚棠已用沧澜直传打通跨域通道。她甚至没回头看碧落宫众人的表情，只扶着刚从水晶棺里救出的双亲，一步一步往外走。天机阁的密道尽头，六名金丹执事戴着无面使令面具拦在前方。她全都认得，那些人曾在不同年代教过她阵法、教过她如何压住天机之瞳的反噬，也曾在她每一次“被安排”的人生里充当温和的看守者。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '她没有再叫任何人前辈。水蓝短剑与天机映射同时展开，在一个照面里演尽对方所有出手轨迹，再从最薄弱的两处节点切进去。四名执事正要合击，一道金色剑光从天而降，洛衍之的破风式直接斩断了阵势供线。他落在她身前，没有说安慰的话，只把剑横在密道中央，替她隔开了所有还想把她拖回去的人。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '顾长惜一手扶着母亲，另一边把父亲交给洛衍之。两人带着二十年被囚禁的真相，从天机阁本岛一直走到碧落宫外海的传送台。路上谁都没有说话。她知道自己从这一刻起，不再是天机阁塑造出来的容器，也不再是那个总会替别人推演后路的人。她只是顾长惜，一个终于要亲手和来路决裂的人。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'choice',
      text: '——第四十三章·顾长惜的决裂·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 229 },
            { type: 'flag_set', flag: 'guchangxi_break', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
