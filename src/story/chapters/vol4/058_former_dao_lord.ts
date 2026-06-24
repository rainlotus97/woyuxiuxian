import type { StoryChapter } from '@/types/storyChapter'

export const chapter_former_dao_lord: StoryChapter = {
  id: 'vol4_ch058_058_former_dao_lord',
  title: '第五十八章·曾经的道主',
  volume: 4,
  order: 58,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'xiebuyu_spoke', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '道种洪流开始倒灌穹顶时，谢不语拔出那柄铁剑在地上划了一个极简的圆。圆内时间减速，将所有沸腾的法则粒子隔绝在外。然后他正对着光瀑中央的无面尊者，叫出一个沉默了三万年的名字：明衍。声量不大，但在这片被法则稀薄化的空间中，名字本身会自动被天道铭刻为不可撤销的因果。明知不可为而为之，这是你教我的。但你没有教我，什么时候该停。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '无面尊者隔着光瀑望着他，沉默了很久。然后他答了最后一句话：如果你当年留下来，也许我会停。谢不语没有回答。他只是把斗笠从头上取下来，放在自己画出的那一圈圆线正前方。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第五十八章·曾经的道主·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 274 },
            { type: 'flag_set', flag: '058_former_dao_lord', flagValue: true },
            { type: 'flag_set', flag: 'xiebuyu_spoke', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
