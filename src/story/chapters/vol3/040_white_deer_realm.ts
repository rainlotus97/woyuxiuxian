import type { StoryChapter } from '@/types/storyChapter'

export const chapter_white_deer_realm: StoryChapter = {
  id: 'vol3_ch040_white_deer_realm',
  title: '第四十章·白鹿秘境',
  volume: 3,
  order: 40,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'understood_devouring_array', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '苏晚棠从一卷即将风化成灰的上古残籍里拼出一个消失了数千年的坐标，青木域最深处有一座秘境，由一位自称白鹿先生的隐者世代守着。传闻他手里保留着一块最接近完整天道原貌的碎片。洛衍之和顾长惜一同前往时，本以为会见到一个拒人千里的老怪物，结果白鹿先生只是骑在白鹿背上，手握一根枯木杖，看了他们一眼，便示意跟上。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '他没有问两人来自哪一域，也没有问他们打算怎样使用这股力量，只是用枯木杖在空气里轻轻画出一道圆。圈内随即展开了一幅无声却完整的天道影像，五行循环在那一刻不再是经卷里的道理，而是能被亲眼看见的秩序本身，金生水，水生木，木生火，火生土，土再回金，彼此推动，又彼此成全。影像收拢之后，白鹿先生从杖尖褪落下一枚极小的金色碎片，递到了洛衍之手里。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '老人缓慢地告诉他们，天道从来不是权柄，它只是让万物各自运转的秩序。真正毁掉秩序的，从来不是有人弱，而是有人想拿天道去替自己裁定所有人的公平。无面尊者曾经是这个世上最纯粹的人，纯粹到谁都挑不出错，可最纯的初衷照样会被岁月熬成最疯的执念。记住，他不是一面陌生的墙，而是你们任何一个人都可能变成的镜子。洛衍之接过那块碎片时，已经知道这一趟拿回去的不止是力量，也是后面所有选择必须面对的分寸。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'choice',
      text: '——第四十章·白鹿秘境·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 220 },
            { type: 'flag_set', flag: 'received_dao_fragment', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
