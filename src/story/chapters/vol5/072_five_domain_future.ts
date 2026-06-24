import type { StoryChapter } from '@/types/storyChapter'

export const chapter_five_domain_future: StoryChapter = {
  id: 'vol5_ch072_072_five_domain_future',
  title: '第七十二章·五域的未来',
  volume: 5,
  order: 72,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'five_domain_future', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '天道呼吸平息后的五域大会，不再是战时谈判，而是如何长久共存的真正辩论。激烈程度超过战前，但这次没有人拍碎桌子，因为石镇山预先把镇岳石杖插在会场中央。萧炎烈拍桌时在石面上留下一道裂缝，石杖自动将土灵气灌进裂缝，把桌面复原。两个从截然相反政见出发的人，就这样借着一块石桌面，达成了世上最微不足道也最坚实的一次合作。全堂愣住片刻后，先是萧炎烈爆出一声笑，然后石镇山也沉沉地笑了一声。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '八天后五域谈妥：道种由守护者监督，各域轮值，不归任何宗门独有。顾长惜以首届守护者身份起身宣布了这一决定。散会后石镇山走到门口停下，对萧炎烈说：我那块被拍裂又复原的石板，现在比新的还硬。以后开会，你继续拍。',
      autoNext: 's_end'
    },
    {
      id: 's_end',
      type: 'choice',
      text: '——第七十二章·五域的未来·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end2',
          effects: [
            { type: 'realm_exp', value: 316 },
            { type: 'flag_set', flag: '072_five_domain_future', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
