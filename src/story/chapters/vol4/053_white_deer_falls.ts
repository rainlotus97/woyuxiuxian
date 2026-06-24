import type { StoryChapter } from '@/types/storyChapter'

export const chapter_white_deer_falls: StoryChapter = {
  id: 'vol4_ch053_053_white_deer_falls',
  title: '第五十三章·白鹿陨落',
  volume: 4,
  order: 53,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'witnessed_bailu', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '天机阁残部在青木域原始古林中用法则裂纹强行撕开了去往白鹿秘境的通道。他们要找的不只是碎片，而是任何能证明完整天道曾存在过的证据。白鹿先生骑在白鹿上守在入口水幕前。他没有反抗的手段，他的一切能力都只用于守护，不用于破坏。于是他做了此生最后一个决定：燃烧自己三万年的寿命，把那块天道碎片的力量通过白鹿传给悬剑峰地下正握着归尘剑的洛衍之。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '传递完成时，他已化成一株枯木。那头陪伴了不知多少代守护者的白鹿慢慢走到枯木旁卧下来，把下颚搁在树根上，合上了眼，再也没有睁开。洛衍之在地底感到归尘剑忽然多出一道极其柔和的温暖。他知道，又一个守护者把自己用完了。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第五十三章·白鹿陨落·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 259 },
            { type: 'flag_set', flag: '053_white_deer_falls', flagValue: true },
            { type: 'flag_set', flag: 'witnessed_bailu', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
