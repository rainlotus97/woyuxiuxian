import type { StoryChapter } from '@/types/storyChapter'

export const chapter_tianji_prison: StoryChapter = {
  id: 'vol3_ch041_tianji_prison',
  title: '第四十一章·天机阁的监狱',
  volume: 3,
  order: 41,
  perspective: 'female',
  triggers: [{ type: 'choice_flag', flag: 'received_dao_fragment', flagValue: true, order: 1 }],
  npcIntroductions: ['npc_xueqingya'],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '薛青鸦把那条密报发出去之前，足足犹豫了一炷香。他面对着一排不同买家的传音玉简，最终还是挑出那枚代表最高紧急等级的翡翠色玉简，告诉顾长惜，她的双亲并没有死，而是被关在天机阁最深处的囚狱里，二十年来一直被拿来维持推演网核心的几道卦力。顾长惜在碧落宫天台收到这条消息时，没有去找苏晚棠，也没有去找洛衍之，而是一个人去了天机阁。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '她踏进天机阁山门那一刻，守门老道与所有护卫都没有拦她。因为司天命早已下过一道命令，命定之人若独自返回，任何人不得阻拦。司天命在推演室里等着她，今日的他没有握玉简，也没有戴任何推演器具，只是把双手平放在膝上，用一种近乎空旷的神色看着她。他说，如果你想见他们，我可以带你去，但见了之后，你再也回不了头。顾长惜的回答没有经过任何推演，这一次，我自己选。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '地牢就在推演室正下方。最深处不是囚室，而是两具封在水晶棺里的沉睡人形。她的父亲仍穿着二十年前的旧式推演者道袍，眉间的细纹和她几乎一模一样；她的母亲则是青木域装束，掌心还握着一枚早已枯死的灵藤种子。二十年，他们一直被囚在这里，作为维持推演大阵的活体灵气源。司天命站在水晶棺前，终于对她说出了这么多年来的第一句真话，你的天机之瞳并不是纯粹天赋，而是无面尊者用你父母的精血和天道碎片把你做成的结果。你从一开始，就被选成了最完美的容器。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '顾长惜听完后没有崩溃，反而笑了，那笑极轻，可左眼的泪水怎么也止不住。她说自己从小到大一直在想，为什么就不能做一个普通人，现在终于知道了，因为他们从来不允许。司天命第一次用真正像父亲的眼神看着她，说自己之所以要她恨自己，就是要把她逼到足够远的地方，不然她永远走不出这座牢笼。说完这句话，他按下墙上的暗扣，两具水晶棺在同一时刻同时碎裂。顾长惜知道，从这一刻起，她面对的已经不再只是天机阁的阴谋，而是她整个人生的来路。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第四十一章·天机阁的监狱·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 110 },
            { type: 'flag_set', flag: 'found_parents', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
