import type { StoryChapter } from '@/types/storyChapter'

export const chapter_plotting: StoryChapter = {
  id: 'vol2_ch026_plotting',
  title: '第二十六章·密谋',
  volume: 2,
  order: 26,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'discovered_tianji_secret', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '顾长惜带着从天机阁禁地破译的玉简踏进了碧落宫。苏晚棠看完玉简上无面尊者策动陨道之战的密刻记录后，从蒲团下取出一块她用碧蓝绸布包了几十年的旧玉简——两份不同来源的密档在水幕上拼合，将三万年前的真相复原：无面尊者以推演术层层放大了五位道主之间的恐惧与误解，催化了那场每个人都以为是自己主动发动的全面内战。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '苏晚棠握住了顾长惜的手——长惜，我这些年一直在暗中联络五域内部对天机阁不满的人。你要加入吗？加入意味着你不再是任何人的命定之人。顾长惜只说了一个字——好。苏晚棠交给她一个关键任务：以调查道种为名前往玄天域面见裴忘渊，说服剑宗与碧落宫结成秘密同盟。顾长惜连夜出发，在踏上前往玄天域的长阶之前，她的天机之瞳不可控地自动亮了一瞬——正在确认赤炎域火山的方向。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第二十六章·密谋·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 178 },
            { type: 'flag_set', flag: '026_plotting', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
