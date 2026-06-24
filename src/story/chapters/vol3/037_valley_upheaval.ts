import type { StoryChapter } from '@/types/storyChapter'

export const chapter_valley_upheaval: StoryChapter = {
  id: 'vol3_ch037_valley_upheaval',
  title: '第三十七章·谷中惊变',
  volume: 3,
  order: 37,
  perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'changqing_confrontation', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '顾长惜还没来得及在长青谷喘口气，林听涛便已经退到苍梧神木根部，直接启动了天机阁预先埋下的吞噬阵，妄图抽空神木万年积累下来的生命精气，拖着整座山谷一起陪葬。钟离越在那一刻几乎没有犹豫，跪在神木根前把父亲留下的灵藤种子按进土里。种子触土即爆，无数灵藤瞬间织成一张大网，硬生生截断了阵法与神木之间的联系。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '失去外部生命精气之后，林听涛再也压不住自己体内那些黑暗灵力与天机寄生阵的反噬。他的身躯从内向外一寸寸木化、枯裂，最后像一截被抽干的朽木那样倒在神木脚下。漫天枯叶压下来时，钟离越扶着苍梧神木站起身，接过父亲遗留下来的那段灵藤，也接过了谷主之位。她右脸那道从额头一直拖到下颚的旧疤，在这一日之后终于不再只是逃亡的印记，而成了她真正守住山谷的证明。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'choice',
      text: '——第三十七章·谷中惊变·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 211 },
            { type: 'flag_set', flag: 'zhongliyue_became_leader', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
