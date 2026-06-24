import type { StoryChapter } from '@/types/storyChapter'

export const chapter_five_dao_return: StoryChapter = {
  id: 'vol4_ch062_062_five_dao_return',
  title: '第六十二章·五道归位', volume: 4, order: 62, perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'chose_guchangxi', flagValue: true, order: 1 }],
  sections: [
    { id: 's1', type: 'narrative', text: '战后第二次五域大会气氛与第一次截然不同。裴忘渊宣布剑宗不再以武力为唯一信条——剑道不是为了征服，而是该在必要时保护该保护的。五域签署《五道归序书》：道种由五域共同推举的守护者监督，此人不属任何一域，曾面对成为天道之选而放弃，在最绝望时从未抛弃自己的人性。所有人看向洛衍之——他说：我选顾长惜。她沉默了一瞬问他：你呢？他没有回答——只是把手放在归尘剑的剑柄上极轻地碰了一下。剑早就封在渊下了，但这个动作替他说了所有没说的话。', autoNext: 's_end' },
    { id: 's_end', type: 'choice', text: '——第六十二章·五道归位·完——', choices: [{ text: '继续', nextSectionId: 's_end2',
      effects: [{ type: 'realm_exp', value: 286 }, { type: 'flag_set', flag: '062_five_dao_return', flagValue: true }] }] },
    { id: 's_end2', type: 'section_end', text: '', choices: [] }
  ]
}
