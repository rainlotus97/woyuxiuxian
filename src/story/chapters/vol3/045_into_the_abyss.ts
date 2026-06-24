import type { StoryChapter } from '@/types/storyChapter'

export const chapter_into_the_abyss_vol3: StoryChapter = {
  id: 'vol3_ch045_into_the_abyss',
  title: '第四十五章·深入渊壑',
  volume: 3,
  order: 45,
  perspective: 'both',
  triggers: [{ type: 'choice_flag', flag: 'tianji_fall', flagValue: true, order: 1 }],
  sections: [
    {
      id: 's1',
      type: 'narrative',
      text: '五域联军对悬剑峰下天道吞噬阵核心阵眼发动总攻那日，洛衍之与顾长惜各自带着最精锐的小队，从后山古老地脉裂缝潜入地下。同行的有柳青霜、温如许、几名各域元婴高手，以及不知何时无声站到队首的谢不语。进入地脉后的第一个时辰，谢不语终于开口，说出了自己和无面尊者之间那层被压了三万年的旧债:我叫他明衍，他曾是我此生最好的朋友。',
      autoNext: 's2'
    },
    {
      id: 's2',
      type: 'narrative',
      text: '越往下走，地脉越窄，吞噬法则越扭曲。天道碎片被反向抽吸后凝成的规则实体不断从暗处扑出。小队被“牺牲”法则守卫围住时，柳青霜独自转身挡在三道法则前。她拔出霜落，用从未真正掌握过的禁术霜天尽葬以血燃剑，同那些法则一起湮灭。剑光散尽后，洛衍之只从石壁边捡回一截冷冰冰的断剑，把它与归尘并列别在腰侧，继续往下走。',
      autoNext: 's3'
    },
    {
      id: 's3',
      type: 'narrative',
      text: '后面的路越发像在死人与执念之间穿行。云斐然留下的紫岚剑在战场边缘替洛衍之挡过一次必死冲击；白鹿先生在地面燃尽寿元，把残存天道碎片之力送进归尘剑；沈镜明替顾长惜挡下无面尊者投来的致命法则，在她面前笑着说，这次我没让你失望。连一度堕落成法则傀儡的阴伯符，也在短暂清醒时告诉洛衍之，不要成为下一个我。',
      autoNext: 's4'
    },
    {
      id: 's4',
      type: 'narrative',
      text: '抵达第四层地脉时，谢不语在一块被法则折歪的古老剑痕前停住了。那是明衍当年还不是无面尊者时，独自从剑脉深处往上走时留下的路标。谢不语用铁剑轻轻碰了一下那道痕，像隔着三万年还给旧友一个迟来的答复。然后他收剑继续向下，小队也继续向那片真正埋着终局的深渊走去。',
      autoNext: 's5'
    },
    {
      id: 's5',
      type: 'choice',
      text: '——第四十五章·深入渊壑·完——',
      choices: [
        {
          text: '继续',
          nextSectionId: 's_end',
          effects: [
            { type: 'realm_exp', value: 240 },
            { type: 'flag_set', flag: 'into_the_abyss', flagValue: true }
          ]
        }
      ]
    },
    { id: 's_end', type: 'section_end', text: '', choices: [] }
  ]
}
